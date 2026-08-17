/* Bot-Züge nach den Bot-Regeln des Regelhefts.
   Bots zahlen keine Ressourcen – alles läuft über Würfelproben gegen den
   Schwierigkeitsgrad. Ihr Machtwert ist immer ihre Gesamtbevölkerung. */

function botMin(p) { return (DIFFICULTIES.find(d => d.k === p.diff) || DIFFICULTIES[2]).min; }
function botTry(S, p, why) {
  const need = botMin(p);
  const v = d6(S, `${why} (${need}+)`);
  return v >= need;
}
function settleable(S, r, c) {
  const t = terrainAt(S, r, c);
  if (!t || !TERRAIN[t].land) return false;
  if (armyAt(S, r, c)) return false;
  return !S.cities.some(x => hexDistance(x.r, x.c, r, c) < 3);
}
// Bots bewegen sich nach genau denselben Regeln wie Menschen.
function botCanEnter(S, pi, r, c) { return canEnter(S, pi, r, c); }

function botTurn(S, pi) {
  const p = S.players[pi];
  const capital = capitalOf(S, pi) || citiesOf(S, pi)[0];

  // 1 Bevölkerungswachstum
  for (const city of citiesOf(S, pi))
    if (botTry(S, p, 'Wachstum')) { city.pop++; log(S, 'act', `${civOf(p).n}: Stadt wächst auf ${city.pop}.`); }

  // 2 Siedeln
  if (capital && botTry(S, p, 'Siedeln')) botSettle(S, pi, capital);

  // 2b Weltwunder (nur mit Erweiterung): Probe, dann ein zufälliges baubares Wunder.
  botWonderStep(S, pi);

  // 3 Armee bauen
  if (capital && botTry(S, p, 'Armee bauen') && !armyAt(S, capital.r, capital.c)) {
    S.armies.push({ id: S.nextId++, owner: pi, r: capital.r, c: capital.c, mp: 0, born: S.round });
    log(S, 'act', `${civOf(p).n}: neue Armee in der Hauptstadt.`);
  }

  // 4 Armeen bewegen
  for (const army of armiesOf(S, pi)) { army.mp = moveAllowance(S, pi); botMoveArmy(S, pi, army); }

  // 5 Forschen: der Bot würfelt zweimal, ob er forscht; bei zwei Erfolgen
  // erforscht er in zwei unterschiedlichen Technologiefeldern.
  if (BOT_RESEARCH_TWICE) {
    const usedFields = [];
    for (let i = 0; i < 2; i++) {
      if (S.over) break;
      if (!botTry(S, p, 'Forschen ' + (i + 1))) continue;
      const f = botResearch(S, pi, usedFields);
      if (f != null) usedFields.push(f);
    }
  } else {
    if (botTry(S, p, 'Forschen')) botResearch(S, pi);
  }

  // Schritt 6 (Kampf) und 7 (Sieg) laufen in finishTurn – für alle gleich.
}

/* ---------------------------------------------------- Siedler (Zufallswanderung) */
function botSettle(S, pi, capital) {
  const p = S.players[pi];
  let r = capital.r, c = capital.c, prev = null, first = true;
  for (let step = 0; step < 40; step++) {
    if (settleable(S, r, c) && !(r === capital.r && c === capital.c)) {
      if (d6(S, 'Siedeln? (3+)') >= 3) {
        S.cities.push({ id: S.nextId++, owner: pi, r, c, pop: 1, cap: false, grown: 0, born: S.round });
        log(S, 'act', `${civOf(p).n}: Siedler gründet Stadt auf ${r}/${c}.`);
        return;
      }
    }
    const dir = d6(S, 'Richtung ' + DIR_NAMES.map((n, i) => (i + 1) + '=' + n[0] + n[1].toLowerCase()).join(' ')) - 1;
    const steps = first ? 3 : 1; first = false;
    let moved = false;
    for (let s = 0; s < steps; s++) {
      const [nr, nc] = neighbor(r, c, dir);
      if (prev && prev[0] === nr && prev[1] === nc) break;          // nie direkt zurück
      if (!botCanEnter(S, pi, nr, nc)) break;
      prev = [r, c]; r = nr; c = nc; moved = true;
      if (settleable(S, r, c)) break;
    }
    if (!moved) continue;
  }
  log(S, 'info', `${civOf(p).n}: Siedler findet keinen Platz.`);
}

/* ---------------------------------------------------- Armeebewegung nach Prioritäten
   Reihenfolge laut Regelheft:
     1. angegriffene eigene Städte verteidigen
     2. gegnerische Städte angreifen
     3. gegnerische Armeen flankieren
     4. an den Rand des Reiches (Feld am nächsten an einer gegnerischen Stadt)
   Innerhalb einer Priorität: die Option mit dem geringsten gegnerischen Machtwert.
   Bei Städten wird die Hauptstadt bevorzugt. Gleichstände werden ausgewürfelt. */
function botMoveArmy(S, pi, army) {
  const p = S.players[pi];
  const reach = reachable(army.r, army.c, army.mp,
    (r, c) => botCanEnter(S, pi, r, c) ? (zocStop(S, pi, r, c) ? 'stop' : true) : false,
    (r1, c1, r2, c2) => moveCost(S, r1, c1, r2, c2));
  // Zielfelder: nur solche, auf denen die Armee auch anhalten darf (kein Wasser ohne
  // Panzerschiff/Luftwaffe). Wasser bleibt als Durchgangsfeld erlaubt.
  const tiles = [...reach.keys()].map(unkey).filter(([r, c]) => canStop(S, pi, r, c));
  if (!tiles.length) return;
  const cost = t => reach.get(key(t[0], t[1]));
  const rng = attackRange(S, pi);

  // wählt aus bewerteten Zielen das beste (kleinster score); Gleichstände auswürfeln
  const chooseBy = (cands, scoreFn) => {
    if (!cands.length) return null;
    const scored = cands.map(t => ({ t, s: scoreFn(t) }));
    const best = Math.min(...scored.map(x => x.s));
    const top = scored.filter(x => Math.abs(x.s - best) < 1e-9).map(x => x.t);
    if (top.length === 1) return top[0];
    let idx = 0;
    do { idx = d6(S, `mehrere gleich gute Ziele (1–${Math.min(top.length, 6)})`); } while (idx > top.length);
    return top[idx - 1];
  };

  let goal = null, why = '';

  // Priorität 1: belagerte eigene Städte verteidigen – die mit dem stärksten Angreifer zuerst
  const besieged = citiesOf(S, pi).filter(city =>
    Object.keys(S.sieges).some(k => k.endsWith('|' + city.id) && S.sieges[k] > 0));
  if (besieged.length) {
    const spots = tiles.filter(t => besieged.some(c => hexDistance(c.r, c.c, t[0], t[1]) <= rng));
    goal = chooseBy(spots, t => {
      const c = besieged.find(c => hexDistance(c.r, c.c, t[0], t[1]) <= rng);
      const threat = Math.max(...S.players.map((_, i) => i === pi ? 0 :
        attackValue(S, i, attackersOn(S, i, c).length)));
      return -threat * 100 + cost(t);       // größte Bedrohung zuerst, dann kürzester Weg
    });
    if (goal) why = 'verteidigt eine belagerte Stadt';
  }

  // Priorität 2: gegnerische Stadt angreifen – schwächster Gegner, Hauptstadt bevorzugt
  if (!goal) {
    const enemyCities = S.cities.filter(x => x.owner !== pi);
    const spots = tiles.filter(t => enemyCities.some(c => hexDistance(c.r, c.c, t[0], t[1]) <= rng));
    goal = chooseBy(spots, t => {
      const targets = enemyCities.filter(c => hexDistance(c.r, c.c, t[0], t[1]) <= rng);
      const best = Math.min(...targets.map(c =>
        powerOf(S, c.owner) * 10 + (c.cap ? -5 : 0)));   // schwächster Gegner, Hauptstadt −5
      return best * 100 + cost(t);
    });
    if (goal) why = 'greift eine gegnerische Stadt an';
  }

  // Priorität 3: gegnerische Armee flankieren – schwächste zuerst
  if (!goal) {
    const mine = armiesOf(S, pi).filter(a => a !== army);
    const castle = has(p, 'burgenbau') ? citiesOf(S, pi).map(c => [c.r, c.c]) : [];
    const partnersFor = e => mine.map(a => [a.r, a.c]).concat(castle)
      .filter(([r, c]) => { const d = hexDistance(r, c, e.r, e.c); return d >= 1 && d <= rng; });
    const flankSpot = (e, t) => {
      if (hexDistance(e.r, e.c, t[0], t[1]) < 1 || hexDistance(e.r, e.c, t[0], t[1]) > rng) return false;
      if (has(p, 'taktik')) return partnersFor(e).length >= 1;
      const drow = e.r - t[0], dcol = e.c - t[1];
      return partnersFor(e).some(([r, c]) => r === e.r + drow && c === e.c + dcol);
    };
    const candidates = [];
    for (const e of S.armies) {
      if (e.owner === pi || powerOf(S, pi) <= powerOf(S, e.owner)) continue;
      for (const t of tiles) if (flankSpot(e, t)) candidates.push({ t, e });
    }
    goal = chooseBy(candidates.map(x => x.t), t => {
      const e = candidates.find(x => x.t[0] === t[0] && x.t[1] === t[1]).e;
      return powerOf(S, e.owner) * 100 + cost(t);
    });
    if (goal) why = 'flankiert eine gegnerische Armee';
  }

  // Priorität 4: innerhalb des eigenen Reiches an den Rand ziehen, dem eine gegnerische
  // Stadt am nächsten liegt. Der Bot verlässt sein Territorium hier NICHT.
  // Tiebreaker: gleiche Distanz → geringster Verteidigungswert der Stadt → auswürfeln.
  if (!goal) {
    const own = controlledTiles(S, pi);
    for (const c of citiesOf(S, pi)) own.add(key(c.r, c.c));   // eigene Städte gehören dazu
    // nur erreichbare Felder im eigenen Reich
    const inRealm = tiles.filter(t => own.has(key(t[0], t[1])));
    const insideNow = own.has(key(army.r, army.c));
    if (!inRealm.length && !insideNow) {
      // Armee steht außerhalb und erreicht ihr Reich diese Runde nicht → dorthin zurück
      const realmCells = [...own].map(unkey);
      goal = chooseBy(tiles, t =>
        Math.min(...realmCells.map(rc => hexDistance(rc[0], rc[1], t[0], t[1]))) * 10 + cost(t));
      if (goal && (goal[0] !== army.r || goal[1] !== army.c)) why = 'kehrt ins eigene Reich zurück';
      else goal = null;
    } else {
    const rim = inRealm.filter(t =>
      neighbors(t[0], t[1]).some(([r, c]) => !own.has(key(r, c))));
    const list = rim.length ? rim : (inRealm.length ? inRealm : [[army.r, army.c]]);
    const enemyCities = S.cities.filter(x => x.owner !== pi);
    if (enemyCities.length) {
      // Distanz über tatsächlich passierbares Gelände (nicht Luftlinie): der Bot kann
      // ohne die passende Technologie nicht über Wasser, muss also außenherum.
      const passable = (r, c) => {
        const t = terrainAt(S, r, c);
        if (!t) return false;
        if (cityAt(S, r, c)) return false;      // Städte blockieren den Weg
        return TERRAIN[t].land || has(p, 'navigation') || has(p, 'panzerschiff') || has(p, 'luftwaffe');
      };
      const distTo = (c, t) => {
        const d = pathSteps(t[0], t[1], c.r, c.c, passable);
        return d == null ? 9999 : d;            // unerreichbar (z. B. andere Insel) ganz hinten
      };
      goal = chooseBy(list, t => {
        let bestDist = Infinity, bestDef = Infinity;
        for (const c of enemyCities) {
          const d = distTo(c, t);
          const def = defenseValue(S, c);
          if (d < bestDist || (d === bestDist && def < bestDef)) { bestDist = d; bestDef = def; }
        }
        return bestDist * 1000 + bestDef;     // Distanz dominiert, Verteidigung als Tiebreaker
      });
    } else {
      goal = chooseBy(list, () => 0);         // keine Gegnerstädte: irgendein Randfeld
    }
    if (goal && (goal[0] !== army.r || goal[1] !== army.c)) why = 'zieht an den Reichsrand';
    else goal = null;                         // schon am besten Randfeld: stehen bleiben
    }
  }

  if (goal) {
    army.mp -= cost(goal);
    army.r = goal[0]; army.c = goal[1];
    log(S, 'act', `${civOf(p).n}: Armee ${why} → ${goal[0]}/${goal[1]}.`);
  }
}

/* ---------------------------------------------------- Forschung */
function botResearch(S, pi, avoidFields = []) {
  const p = S.players[pi];
  let f, field, guard = 0;
  do {
    do { f = d6(S, 'Technologiefeld (1–4)'); } while (f > 4);
    field = f - 1;
  } while (avoidFields.includes(field) && ++guard < 20);  // v2: anderes Feld als beim ersten Mal
  // Singularität, sobald ein Feld der Moderne schon beforscht ist
  if (TECHS_ACTIVE.some(t => t.f === field && t.age === 3 && p.techs[t.k])) {
    p.techs.singularitaet = true;
    S.over = { winner: pi, how: 'Forschungssieg (Singularität)' };
    log(S, 'act', `${civOf(p).n} erforscht die Singularität!`);
    return field;
  }
  // höchstes erforschbares Zeitalter in diesem Feld
  let age = 0;
  for (let a = 1; a <= 3; a++) if (TECHS_ACTIVE.some(t => t.f === field && t.age === a - 1 && p.techs[t.k])) age = a;
  while (age >= 0 && !techsIn(field, age).some(t => !p.techs[t.k])) age--;
  if (age < 0) { log(S, 'info', `${civOf(p).n}: nichts mehr zu forschen in ${FIELDS[field]}.`); return field; }
  const list = techsIn(field, age);
  let idx;
  for (let guard = 0; guard < 30; guard++) {
    idx = d6(S, `Technologie in ${FIELDS[field]} / ${AGES[age]} (1–${list.length})`);
    if (idx <= list.length && !p.techs[list[idx - 1].k]) break;
    idx = 0;
  }
  const tech = idx ? list[idx - 1] : list.find(t => !p.techs[t.k]);
  p.techs[tech.k] = true;
  log(S, 'act', `${civOf(p).n} erforscht ${tech.n}.`);
  return field;   // Bots bestimmen ihr Zeitalter aus den erforschten Techs, kein avail nötig
}
