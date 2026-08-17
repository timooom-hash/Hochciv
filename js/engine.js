/* Hochzeivilization – Regelmaschine.
   Reihenfolge im Zug (Regelheft):
   1 Wissenschaft/Nahrung/Münzen bestimmen · 2 Macht reduzieren · 3 Aktionen
   4 Kampf · 5 Sieg prüfen                                                    */

/* ------------------------------------------------------------ Zufall (seeded) */
function nextRand(S) {
  S.seed = (S.seed + 0x6D2B79F5) | 0;
  let t = S.seed;
  t = Math.imul(t ^ t >>> 15, 1 | t);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function d6(S, why) {
  const v = 1 + Math.floor(nextRand(S) * 6);
  log(S, 'roll', '🎲 ' + v + (why ? ' — ' + why : ''));
  return v;
}
function pick(S, arr) { return arr[Math.floor(nextRand(S) * arr.length)]; }
function log(S, cls, msg) {
  S.logSeq = (S.logSeq || 0) + 1;
  S.log.push({ c: cls, m: msg, r: S.round, seq: S.logSeq });
  if (S.log.length > 600) S.log.shift();
}
// Alle Log-Einträge ab einer Sequenznummer (stabil, auch wenn ältere weggekappt wurden).
function logSince(S, seq) { return S.log.filter(e => e.seq > seq); }

/* ------------------------------------------------------------ Kürzel */
const P = S => S.players[S.cur];
const has = (p, k) => !!p.techs[k];
const terrainAt = (S, r, c) => {
  const rows = S.map.rows;
  if (r < 0 || r >= rows.length) return null;
  return c < 0 || c >= rows[r].length ? null : rows[r][c];
};
const isLand = (S, r, c) => { const t = terrainAt(S, r, c); return t ? TERRAIN[t].land : false; };
const cityAt = (S, r, c) => S.cities.find(x => x.r === r && x.c === c);
const armyAt = (S, r, c) => S.armies.find(x => x.r === r && x.c === c);
const citiesOf = (S, pi) => S.cities.filter(x => x.owner === pi);
const armiesOf = (S, pi) => S.armies.filter(x => x.owner === pi);
const popOf = (S, pi) => citiesOf(S, pi).reduce((a, x) => a + x.pop, 0);
const worldPop = S => S.cities.reduce((a, x) => a + x.pop, 0);
const capitalOf = (S, pi) => citiesOf(S, pi).find(x => x.cap);
const roadLevel = (S, r, c) => S.roads[key(r, c)] || 0;
const civOf = p => CIV_BY_KEY[p.civ] || BARB_CIV;

/* Zivilisationsfähigkeit des Reiches ('basis' oder eine der Alternativen).
   Bots und die neutrale Barbarenfraktion haben KEINE Fähigkeit. */
function abilityOf(p) {
  if (!p || p.kind === 'bot' || p.kind === 'barbar') return null;
  return p.ability || 'basis';
}
function isAbil(p, k) { return abilityOf(p) === k; }

/* Machtwert: Bots haben immer ihre Gesamtbevölkerung als Macht.
   Zuschläge (Wikinger "Kriegerkultur", Zeusstatue) erhöhen den Machtwert,
   gehen aber beim Machtverlust zu Zugbeginn nicht verloren. */
function powerBonus(S, pi) {
  const p = S.players[pi];
  let b = 0;
  if (isAbil(p, 'armeemacht')) b += armiesOf(S, pi).length;
  if (hasWonder(S, pi, 'zeus')) b += 3;
  return b;
}
function powerOf(S, pi) {
  const p = S.players[pi];
  if (p.kind === 'barbar') return 0;
  if (p.kind === 'bot') return popOf(S, pi);
  return p.power + powerBonus(S, pi);
}

/* ------------------------------------------------------------ Neues Spiel */
function newGame(cfg) {
  // Feste Spielerreihenfolge: Russland → Griechenland → England → Wikinger.
  // Der Startspieler verschiebt nur den Einstiegspunkt in dieser Rotation.
  const ORDER = ['russland', 'griechenland', 'england', 'wikinger'];
  const startCiv = cfg.players[cfg.startPlayer ?? 0] && cfg.players[cfg.startPlayer ?? 0].civ;
  const ordered = cfg.players.slice().sort((a, b) => ORDER.indexOf(a.civ) - ORDER.indexOf(b.civ));
  const startIdx = Math.max(0, ordered.findIndex(p => p.civ === startCiv));
  const S = {
    v: 2, seed: (cfg.seed ?? Math.floor(Math.random() * 2 ** 31)) | 0,
    round: 1, cur: 0, over: null, log: [],
    map: JSON.parse(JSON.stringify(cfg.map || DEFAULT_MAP)),
    roads: {}, sieges: {}, bought: {},
    cities: [], armies: [], nextId: 1,
    // Erweiterungen: Ereignisse und Weltwunder werden im Aufbau zugeschaltet
    ev: cfg.events ? { mode: cfg.eventMode === 'easy' ? 'easy' : 'hard' } : null,
    wo: !!cfg.wonders,
    event: null, evNext: null, nukeBan: false,
    wonders: [], wpool: { 1: [], 2: [], 3: [] }, wgone: [],
    players: ordered.map(pc => ({
      civ: pc.civ, kind: pc.kind, diff: pc.diff || 'prinz', name: pc.name || null,
      ability: pc.kind === 'bot' ? 'basis' : (pc.ability || 'basis'),
      power: 0, techs: {}, avail: {}, res: { sci: 0, food: 0, coins: 0 },
      copies: 0, nuked: false, dead: false,
    })),
  };
  log(S, 'head', 'Neues Spiel — ' + S.players.map(p => civOf(p).n + (p.kind === 'bot' ? ' (Bot)' : '')).join(', ') +
    (S.ev ? ` · Ereignisse (${S.ev.mode === 'easy' ? 'leicht' : 'hart'})` : '') + (S.wo ? ' · Weltwunder' : ''));

  // Aufbau 3: Starttechnologien der Antike auswürfeln
  S.players.forEach((p, i) => {
    for (let f = 0; f < 4; f++) rollAvailability(S, i, f, 0);
  });
  // Aufbau 5: Hauptstädte setzen
  S.players.forEach((p, i) => {
    const pos = S.map.capitals[p.civ];
    if (!pos) return;
    S.cities.push({ id: S.nextId++, owner: i, r: pos[0], c: pos[1], pop: 1, cap: true, grown: 0, born: 0 });
    if (p.civ === 'wikinger' && isAbil(p, 'basis')) {   // Wikinger: kostenlose Armee am Start
      const spot = neighbors(pos[0], pos[1]).find(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c));
      if (spot) S.armies.push({ id: S.nextId++, owner: i, r: spot[0], c: spot[1], mp: 0, born: 0 });
    }
  });
  if (S.wo) initWonderPools(S);
  S.cur = startIdx;
  startRound(S);          // Ereignis der ersten Runde
  beginTurn(S);
  return S;
}

/* ------------------------------------------------------------ Technologien */
function techCost(S, pi, tech) {
  const p = S.players[pi];
  let c = tech.c;
  const age = tech.k === 'singularitaet' ? 4 : tech.age;
  if (tech.k === 'singularitaet' && kremlBuilt(S)) c += KREML_SURCHARGE;
  if (p.civ === 'griechenland' && isAbil(p, 'basis')) c -= (age + 1);   // 1/2/3/4/5 je Zeitalter
  if (has(p, 'wiss_methode')) c -= 2 * (age + 1);        // -2/-4/-6/-8/-10
  return Math.max(0, c);
}
// Griechenland hat keinen Würfelbonus mehr – nur Philosophie gibt +1.
function availBonus(p) { return has(p, 'philosophie') ? 1 : 0; }
function rollAvailability(S, pi, field, age) {
  const p = S.players[pi];
  if (age > 3) return;
  const list = techsIn(field, age);
  if (!list.length) return;
  const bonus = availBonus(p);
  let any = false;
  for (const t of list) {
    if (p.avail[t.k] || p.techs[t.k]) { any = true; continue; }
    const v = d6(S, `Verfügbarkeit ${t.n}${bonus ? ' (+' + bonus + ')' : ''}`) + bonus;
    if (v >= 4) { p.avail[t.k] = true; any = true; }
  }
  if (!any) {   // "Falls danach keine Technologie verfügbar ist, eine auswürfeln die verfügbar ist"
    let idx = 0;
    do { idx = d6(S, `keine verfügbar → eine auswürfeln (1–${list.length})`); } while (idx > list.length);
    p.avail[list[idx - 1].k] = true;
  }
  log(S, 'info', `${civOf(p).n}: verfügbar in ${FIELDS[field]} (${AGES[age]}): ` +
    (list.filter(t => p.avail[t.k]).map(t => t.n).join(', ') || '—'));
}
function singularityReady(p) {
  return FIELDS.every((_, f) => TECHS_ACTIVE.some(t => t.f === f && t.age === 3 && p.techs[t.k]));
}
function researchable(S, pi) {
  const p = S.players[pi], out = [];
  for (const t of TECHS_ACTIVE) if (p.avail[t.k] && !p.techs[t.k]) out.push(t);
  if (singularityReady(p) && !p.techs.singularitaet) out.push(SINGULARITY);
  return out;
}
function doResearch(S, pi, tk) {
  const p = S.players[pi];
  if (evActive(S, pi, 'dunkles_zeitalter')) return 'Dunkles Zeitalter: Diese Runde kann nicht geforscht werden.';
  const tech = tk === 'singularitaet' ? SINGULARITY : TECH_BY_KEY[tk];
  if (!tech) return 'Unbekannte Technologie.';
  const cost = techCost(S, pi, tech);
  if (available(S, pi, 'sci') < cost) return 'Nicht genug Wissenschaft.';
  pay(S, pi, 'sci', cost);
  applyTech(S, pi, tech, `${cost} Wissenschaft`);
  if (tk === 'singularitaet') { S.over = { winner: pi, how: 'Forschungssieg (Singularität)' }; return null; }
  // Griechenland "Rückschau": zusätzlich eine beliebige Technologie eines früheren
  // Zeitalters gratis. Keine Kette – die Gratis-Tech löst das nicht erneut aus.
  if (isAbil(p, 'rueckschau') && tech.age > 0) p.backPick = tech.age - 1;
  return null;
}
/* Technologie eintragen (bezahlt oder gratis) samt Folgewirkungen. */
function applyTech(S, pi, tech, note) {
  const p = S.players[pi];
  const rangeBefore = moveAllowance(S, pi);
  p.techs[tech.k] = true;
  log(S, 'act', `${civOf(p).n} erforscht ${tech.n} (${note}).`);
  if (tech.k === 'singularitaet') return;
  // Reichweitensprung (Luftwaffe/Panzerschiff) sofort wirksam machen: die Erhöhung der
  // Maximalweite wird der Restbewegung der eigenen Armeen dieser Runde gutgeschrieben.
  const gained = moveAllowance(S, pi) - rangeBefore;
  if (gained > 0) for (const a of armiesOf(S, pi)) a.mp += gained;
  // Erste Technologie in Zeitalter+Feld → nächstes Zeitalter auswürfeln
  const sameAgeField = TECHS_ACTIVE.filter(t => t.f === tech.f && t.age === tech.age && p.techs[t.k]);
  if (sameAgeField.length === 1) rollAvailability(S, pi, tech.f, tech.age + 1);
}
/* Kostenlose Forschung: Griechenland-Fähigkeiten und die Wunder Bibliothek/Oxford.
   quelle beschreibt, woher der Anspruch kommt (nur für das Protokoll). */
function grantTech(S, pi, tk, quelle) {
  const p = S.players[pi];
  const tech = TECH_BY_KEY[tk];
  if (!tech) return 'Unbekannte Technologie.';
  if (p.techs[tk]) return 'Schon erforscht.';
  applyTech(S, pi, tech, quelle);
  return null;
}
/* Griechenland "Freie Forschung": 1× pro Runde eine verfügbare Technologie
   der Industrialisierung oder früher (Zeitalter 0–2) umsonst. */
function freeTechOptions(S, pi) {
  const p = S.players[pi];
  if (!isAbil(p, 'gratistech') || p.freeTechUsed === S.round) return [];
  if (evActive(S, pi, 'dunkles_zeitalter')) return [];
  return TECHS_ACTIVE.filter(t => t.age <= 2 && p.avail[t.k] && !p.techs[t.k]);
}
function useFreeTech(S, pi, tk) {
  const p = S.players[pi];
  if (!freeTechOptions(S, pi).some(t => t.k === tk)) return 'Nicht möglich.';
  const err = grantTech(S, pi, tk, 'Freie Forschung');
  if (err) return err;
  p.freeTechUsed = S.round;
  return null;
}
/* Griechenland "Rückschau": beliebige Tech eines früheren Zeitalters, auch nicht freigeschaltet. */
function backPickOptions(S, pi) {
  const p = S.players[pi];
  if (p.backPick == null) return [];
  return TECHS_ACTIVE.filter(t => t.age <= p.backPick && !p.techs[t.k]);
}
function useBackPick(S, pi, tk) {
  const p = S.players[pi];
  if (!backPickOptions(S, pi).some(t => t.k === tk)) return 'Nicht möglich.';
  const err = grantTech(S, pi, tk, 'Rückschau');
  if (err) return err;
  p.backPick = null;
  return null;
}

/* ------------------------------------------------------------ Einkommen */
function tileYield(S, pi, t) {
  const p = S.players[pi];
  if (TERRAIN[t].block) return [0, 0, 0];              // Vulkan
  if (evTerrainDead(S, pi, t)) return [0, 0, 0];       // Ereignis legt das Gelände lahm
  const y = TERRAIN[t].yield.slice();
  const add = (i, n) => y[i] += n;
  switch (t) {
    case 'G':
      if (has(p, 'papier')) add(0, 1); if (has(p, 'biologie')) add(0, 1);
      if (has(p, 'landwirtschaft')) add(1, 1); if (has(p, 'gruene_revolution')) add(2, 1); break;
    case 'W':
      if (has(p, 'mathematik')) add(0, 1); if (has(p, 'elektrizitaet')) add(0, 1); if (has(p, 'ki')) add(0, 1);
      if (has(p, 'kunstduenger')) add(1, 1);
      if (p.civ === 'russland' && isAbil(p, 'basis')) add(1, 1); break;
    case 'B':
      if (has(p, 'chemie')) add(0, 1); if (has(p, 'bewaesserung')) add(1, 1); break;
    case 'F':
      if (has(p, 'buchdruck')) add(0, 1); if (has(p, 'muehlentechnik')) add(2, 1); break;
    case 'M':
      if (has(p, 'astronomie')) add(0, 1);
      if (has(p, 'fischerei')) add(1, 1); if (has(p, 'segeln')) add(1, 1);
      if (has(p, 'containerlogistik')) add(2, 1);
      if (hasWonder(S, pi, 'leuchtturm')) { add(0, 1); add(1, 1); add(2, 1); }   // Großer Leuchtturm
      break;
  }
  return y;
}
/* Ertrag eines konkreten Feldes: wie tileYield, aber mit Bürokratie –
   die verdoppelt alles, was die Hauptstadt produziert, also auch ihr Umland. */
function tileYieldAt(S, pi, r, c) {
  const p = S.players[pi];
  const y = tileYield(S, pi, terrainAt(S, r, c));
  if (has(p, 'buerokratie')) {
    const cap = capitalOf(S, pi);
    if (cap && hexDistance(cap.r, cap.c, r, c) === 1) return y.map(n => n * 2);
  }
  return y;
}
function cityPopYield(S, pi) {
  const p = S.players[pi];
  const y = CITY_YIELD.slice();
  if (has(p, 'schrift')) y[0]++;
  if (has(p, 'universitaet')) y[0]++;
  if (has(p, 'fliessband')) y[2]++;
  if (has(p, 'robotik')) y[2]++;
  return y;
}
/* Kontrollierte Felder: alle an eigene Städte angrenzenden Felder (ohne Stadtfelder),
   plus per Kolonialismus gekaufte Felder. Nicht exklusiv – so steht es in den Regeln. */
function controlledTiles(S, pi) {
  const set = new Set();
  for (const city of citiesOf(S, pi))
    for (const [r, c] of neighbors(city.r, city.c)) {
      if (!terrainAt(S, r, c)) continue;
      if (cityAt(S, r, c)) continue;
      set.add(key(r, c));
    }
  for (const k of (S.bought[pi] || [])) if (!cityAt(S, ...unkey(k))) set.add(k);
  return set;
}
/* Grenzt die Stadt an Meer? (Für Englands Alternative "Seemacht".) */
function cityAtSea(S, city) {
  return neighbors(city.r, city.c).some(([r, c]) => terrainAt(S, r, c) === 'M');
}
/* Wikinger "Beutezüge": je Armee, die neben einer gegnerischen Armee oder Stadt steht,
   1 Wissenschaft/Nahrung/Münze pro Punkt Überlegenheit. Gegen Städte zählt der
   Verteidigungswert, gegen Armeen der Machtwert. Mehrere Nachbarn: der größte Vorsprung.
   Bewertet wird beim Einkommen (Zugbeginn) – Ressourcen verfallen am Zugende, ein
   Ertrag in der Kampfphase wäre nicht mehr ausgebbar. */
function raidBonus(S, pi) {
  const p = S.players[pi];
  if (!isAbil(p, 'kampfertrag')) return 0;
  const mine = powerOf(S, pi);
  let sum = 0;
  for (const a of armiesOf(S, pi)) {
    let best = 0;
    for (const [r, c] of neighbors(a.r, a.c)) {
      const ec = cityAt(S, r, c), ea = armyAt(S, r, c);
      if (ec && ec.owner !== pi) best = Math.max(best, mine - defenseValue(S, ec));
      if (ea && ea.owner !== pi) best = Math.max(best, mine - powerOf(S, ea.owner));
    }
    if (best > 0) sum += best;
  }
  return sum;
}
/* Aufschlüsselung des Einkommens für die Übersicht: je Geländetyp die Anzahl
   kontrollierter Felder und ihr Gesamtertrag, dazu Sonderzeilen, die Stadtbevölkerung
   und die Summe. Die Summe ist per Definition das Einkommen – income() liest sie hier ab,
   damit Übersicht und Rechnung nicht auseinanderlaufen können. */
function incomeBreakdown(S, pi) {
  const p = S.players[pi];
  const rows = [], extra = [], byTerrain = {};
  const revolution = evActive(S, pi, 'revolution');
  const cap = capitalOf(S, pi);
  // Revolution: die Hauptstadt produziert nichts – auch ihr Umland nicht, sofern das
  // Feld nicht zusätzlich an eine andere eigene Stadt grenzt.
  const deadTile = (r, c) => revolution && cap && hexDistance(cap.r, cap.c, r, c) === 1 &&
    !citiesOf(S, pi).some(ct => !ct.cap && hexDistance(ct.r, ct.c, r, c) === 1);
  for (const k of controlledTiles(S, pi)) {
    const [r, c] = unkey(k);
    if (deadTile(r, c)) continue;
    const t = terrainAt(S, r, c);
    const y = tileYieldAt(S, pi, r, c);
    const e = byTerrain[t] || (byTerrain[t] = { count: 0, y: [0, 0, 0] });
    e.count++; e.y[0] += y[0]; e.y[1] += y[1]; e.y[2] += y[2];
  }
  for (const t of Object.keys(TERRAIN)) {
    const e = byTerrain[t];
    if (e) rows.push({ key: t, name: TERRAIN[t].name, count: e.count, y: e.y });
  }
  // Bevölkerung als eigene Zeile
  const py = cityPopYield(S, pi);
  let pop = 0, pyy = [0, 0, 0], sea = 0;
  for (const city of citiesOf(S, pi)) {
    pop += city.pop;
    if (isAbil(p, 'kuestenstaedte') && cityAtSea(S, city)) sea++;
    if (revolution && city.cap) { pyy[1] += py[1] * city.pop; continue; }   // verbraucht nur Nahrung
    const mult = (city.cap && has(p, 'buerokratie')) ? 2 : 1;
    let f = py[1] * city.pop;
    if (has(p, 'oekologie')) f += Math.floor(city.pop / 2);
    pyy[0] += py[0] * city.pop * mult;
    pyy[1] += f * mult;
    pyy[2] += py[2] * city.pop * mult;
  }
  if (sea) extra.push({ name: 'Städte am Meer', glyph: '⚓', count: sea, y: [2 * sea, 2 * sea, 2 * sea] });
  const raid = raidBonus(S, pi);
  if (raid) extra.push({ name: 'Beutezüge', glyph: '⚔︎', count: null, y: [raid, raid, raid] });
  // Summe, danach die Ereignis- und Wundereffekte auf das Gesamteinkommen
  const total = [0, 0, 0];
  for (const r of rows) for (let i = 0; i < 3; i++) total[i] += r.y[i];
  for (const e of extra) for (let i = 0; i < 3; i++) total[i] += e.y[i];
  for (let i = 0; i < 3; i++) total[i] += pyy[i];
  if (evActive(S, pi, 'hungersnot')) total[1] = 0;        // keine Nahrung produziert
  if (evActive(S, pi, 'wirtschaftskrise')) total[2] = 0;  // keine Münzen produziert
  if (p.doubleIncome === S.round) for (let i = 0; i < 3; i++) total[i] *= 2;   // Taj Mahal
  return { rows, extra, pop: { count: pop, y: pyy }, total };
}
function income(S, pi) {
  const t = incomeBreakdown(S, pi).total;
  return { sci: t[0], food: t[1], coins: t[2] };
}

/* ------------------------------------------------------------ Umrechnungskurse */
/* Umrechnungskurse. Gentechnik und Massenmedien sind ausdrücklich KEIN allgemeiner
   Umtausch – sie füttern nur Städte (siehe feed()) und stehen deshalb hier nicht.
   opts.foodOk: Bürgerkrieg erlaubt in dieser Runde, Armeen/Macht mit Nahrung zu zahlen. */
function rates(S, pi, opts) {
  const p = S.players[pi];
  const eng = p.civ === 'england' && isAbil(p, 'basis');
  const hungry = evActive(S, pi, 'hungersnot');
  let coinsToFood = eng || has(p, 'gilden') ? 1 : 2;
  if (hungry) coinsToFood = eng ? 1 : (has(p, 'gilden') ? 2 : 4);
  let foodToCoins = (eng || hasWonder(S, pi, 'pyramiden')) ? 1 : Infinity;
  if (opts && opts.foodOk && foodToCoins === Infinity) foodToCoins = 1;
  return {
    coinsToFood,
    coinsToSci: has(p, 'computertechnik') ? 1 : 2,
    sciToCoins: has(p, 'alchemie') ? 1 : Infinity,
    sciToFood: Infinity,
    foodToCoins,
  };
}
function available(S, pi, kind, opts) {   // wie viel man höchstens ausgeben kann
  const p = S.players[pi], r = rates(S, pi, opts), R = p.res;
  if (kind === 'food') return R.food + Math.floor(R.coins / r.coinsToFood) + Math.floor(R.sci / r.sciToFood);
  if (kind === 'sci') {
    // Münzen sind die Drehscheibe: eigene Münzen plus die aus Nahrung umwandelbaren
    // (bei England 1:1) können in Wissenschaft getauscht werden.
    const coinsFromFood = r.foodToCoins === Infinity ? 0 : Math.floor(R.food / r.foodToCoins);
    return R.sci + Math.floor((R.coins + coinsFromFood) / r.coinsToSci);
  }
  return R.coins + Math.floor(R.sci / r.sciToCoins) + Math.floor(R.food / r.foodToCoins);
}
function pay(S, pi, kind, amount, opts) {
  if (amount <= 0) return true;
  const p = S.players[pi], r = rates(S, pi, opts), R = p.res;
  if (available(S, pi, kind, opts) < amount) return false;
  let need = amount;
  const take = (from, rate) => {
    if (need <= 0 || rate === Infinity) return;
    const n = Math.min(need, Math.floor(R[from] / rate));
    R[from] -= n * rate; need -= n;
  };
  take(kind, 1);
  if (kind === 'food') { take('coins', r.coinsToFood); take('sci', r.sciToFood); }
  else if (kind === 'sci') {
    take('coins', r.coinsToSci);
    // Rest über Nahrung → Münzen → Wissenschaft (nur wenn beide Kurse existieren)
    if (need > 0 && r.foodToCoins !== Infinity && r.coinsToSci !== Infinity) {
      const perSci = r.coinsToSci * r.foodToCoins;   // Nahrung je Wissenschaft
      const n = Math.min(need, Math.floor(R.food / perSci));
      R.food -= n * perSci; need -= n;
    }
  }
  else { take('sci', r.sciToCoins); take('food', r.foodToCoins); }
  return need <= 0;
}

/* --------------------------------------------- Nahrungsgrenze und Städte füttern
   Die Nahrungsproduktion darf nicht negativ werden: Wachstum wird blockiert, sobald
   das Einkommen dadurch unter 0 fiele. Gentechnik (aus Wissenschaft) und Massenmedien
   (aus Münzen) heben diese Grenze auf; gefüttert wird zu Zugbeginn, 1:1, nach Wahl
   des Spielers. Ein nicht gedecktes Defizit lässt die Nahrung bei 0 stehen –
   Bevölkerung verhungert nicht. */
function canFeed(p) { return has(p, 'gentechnik') || has(p, 'massenmedien'); }
function feedSources(S, pi) {
  const p = S.players[pi], out = [];
  if (has(p, 'massenmedien')) out.push({ kind: 'coins', n: 'Münzen', have: p.res.coins });
  if (has(p, 'gentechnik')) out.push({ kind: 'sci', n: 'Wissenschaft', have: p.res.sci });
  return out;
}
function feed(S, pi, kind, amount) {
  const p = S.players[pi];
  if (kind === 'sci' && !has(p, 'gentechnik')) return 'Gentechnik nicht erforscht.';
  if (kind === 'coins' && !has(p, 'massenmedien')) return 'Massenmedien nicht erforscht.';
  amount = Math.min(Math.floor(amount), p.res[kind]);
  if (amount <= 0) return 'Nichts abzugeben.';
  p.res[kind] -= amount;
  const cover = Math.min(amount, p.foodDeficit || 0);
  p.foodDeficit = (p.foodDeficit || 0) - cover;
  p.res.food += amount - cover;
  log(S, 'act', `${civOf(p).n}: Städte gefüttert – ${amount} ${kind === 'sci' ? 'Wissenschaft' : 'Münzen'}` +
    (cover ? ` (${cover} deckt das Nahrungsdefizit)` : '') + '.');
  return null;
}
/* Nahrungseinkommen, wenn die Stadt um delta wachsen würde. */
function foodAfterGrowth(S, pi, city, delta) {
  const before = city.pop;
  city.pop += delta;
  const f = income(S, pi).food;
  city.pop = before;
  return f;
}
function growthBlocked(S, pi, city, delta = 1) {
  if (canFeed(S.players[pi])) return false;      // Gentechnik/Massenmedien heben die Grenze auf
  return foodAfterGrowth(S, pi, city, delta) < 0;
}

/* ------------------------------------------------------------ Zugbeginn */
function beginTurn(S) {
  const p = P(S);
  if (p.dead || !citiesOf(S, S.cur).length && !armiesOf(S, S.cur).length) { p.dead = true; return; }
  log(S, 'head', `Runde ${S.round} — ${civOf(p).n}${p.kind === 'bot' ? ' (Bot)' : ''}`);
  // 0 Kultursieg: ein Stufe-3-Wunder gewinnt zu Beginn des nächsten eigenen Zuges
  if (checkCultureVictory(S, S.cur)) return;
  // 1 Einkommen
  const inc = income(S, S.cur);
  p.res = { sci: inc.sci, food: Math.max(0, inc.food), coins: inc.coins };
  p.foodDeficit = Math.max(0, -inc.food);
  if (p.foodDeficit)
    log(S, 'warn', `Nahrungsdefizit von ${p.foodDeficit}` +
      (canFeed(p) ? ' – kann mit Wissenschaft/Münzen gefüttert werden.' : ' – Nahrung bleibt bei 0.'));
  if (p.kind !== 'bot')
    log(S, 'info', `Einkommen: ${p.res.sci} Wissenschaft, ${p.res.food} Nahrung, ${p.res.coins} Münzen.`);
  // 2 Macht reduzieren. Zuschläge aus Armeen/Zeusstatue erhöhen den Verlust,
  // können aber selbst nicht verloren gehen.
  if (p.kind !== 'bot' && powerOf(S, S.cur) > 0) {
    const div = has(p, 'panzer') ? 4 : has(p, 'stahl') ? 3 : 2;
    const loss = Math.min(p.power, Math.ceil(powerOf(S, S.cur) / div));
    p.power -= loss;
    if (loss) log(S, 'info', `Macht −${loss} (1/${div}, aufgerundet) → ${powerOf(S, S.cur)}.`);
  }
  // Zustände zurücksetzen
  S.cities.forEach(c => { if (c.owner === S.cur) { c.grown = 0; c.freeUsed = 0; } });
  S.armies.forEach(a => { if (a.owner === S.cur) a.mp = moveAllowance(S, S.cur); });
  p.copies = 0; p.nuked = false; p.backPick = null;
}

/* ------------------------------------------------------------ Bewegung */
function moveAllowance(S, pi) {
  const p = S.players[pi];
  return has(p, 'luftwaffe') ? 9 : has(p, 'panzerschiff') ? 6 : 3;
}
// Darf das Feld auf dem Weg durchquert werden? Navigation/Panzerschiff/Luftwaffe erlauben Wasser.
function canPass(S, pi, r, c) {
  const p = S.players[pi];
  const t = terrainAt(S, r, c);
  if (!t) return false;
  if (cityAt(S, r, c)) return false;            // Städte blockieren
  if (armyAt(S, r, c)) return false;            // nicht auf andere Armeen (nicht stapelbar)
  if (TERRAIN[t].block) return false;           // Vulkan: unpassierbar, auch für die Luftwaffe
  if (has(p, 'luftwaffe')) return true;         // Luftwaffe ignoriert Gelände
  if (!TERRAIN[t].land && !(has(p, 'navigation') || has(p, 'panzerschiff'))) return false;
  return true;
}
// Darf die Armee auf diesem Feld anhalten? Auf Wasser nur mit Panzerschiff oder Luftwaffe,
// NICHT mit bloßer Navigation (die erlaubt nur das Durchqueren).
function canStop(S, pi, r, c) {
  if (!canPass(S, pi, r, c)) return false;
  const t = terrainAt(S, r, c);
  if (!TERRAIN[t].land && !(has(S.players[pi], 'panzerschiff') || has(S.players[pi], 'luftwaffe')))
    return false;
  return true;
}
// Rückwärtskompatibel: canEnter = durchqueren erlaubt.
function canEnter(S, pi, r, c) { return canPass(S, pi, r, c); }
/* Kontrollzone (Schießpulver): wer ein Feld neben einer feindlichen Armee betritt, hält an */
function zocStop(S, pi, r, c) {
  if (has(S.players[pi], 'luftwaffe')) return false;        // Luftwaffe ignoriert Kontrollzonen
  return S.armies.some(a => {
    if (a.owner === pi || !has(S.players[a.owner], 'schiesspulver')) return false;
    return hexDistance(a.r, a.c, r, c) <= projectRange(S, a.owner);  // mit Raketentechnik zwei Ringe
  });
}
/* Ein Stadtfeld zählt selbst als Straße bzw. Eisenbahn, sobald mindestens ein
   angrenzendes Feld die jeweilige Stufe hat – Wege enden also nicht am Stadtrand. */
function effectiveRoad(S, r, c) {
  let lvl = roadLevel(S, r, c);
  if (cityAt(S, r, c))
    for (const [nr, nc] of neighbors(r, c)) lvl = Math.max(lvl, roadLevel(S, nr, nc));
  return lvl;
}
function moveCost(S, r1, c1, r2, c2) {
  const lvl = Math.min(effectiveRoad(S, r1, c1), effectiveRoad(S, r2, c2));
  return lvl >= 2 ? 0 : lvl >= 1 ? 0.5 : 1;
}
function armyReach(S, army) {
  const pi = army.owner;
  const raw = reachable(army.r, army.c, army.mp,
    (r, c) => canPass(S, pi, r, c) ? (zocStop(S, pi, r, c) ? 'stop' : true) : false,
    (r1, c1, r2, c2) => moveCost(S, r1, c1, r2, c2));
  // Felder, auf denen die Armee nicht anhalten darf (Wasser ohne Panzerschiff/Luftwaffe),
  // sind zwar durchquerbar, aber keine gültigen Zielfelder.
  const out = new Map();
  for (const [k, v] of raw) {
    const [r, c] = unkey(k);
    if (canStop(S, pi, r, c)) out.set(k, v);
  }
  return out;
}
function moveArmy(S, army, r, c) {
  const reach = armyReach(S, army);
  const k = key(r, c);
  if (!reach.has(k)) return 'Feld nicht erreichbar.';
  army.mp -= reach.get(k);
  army.r = r; army.c = c;
  log(S, 'act', `${civOf(S.players[army.owner]).n}: Armee zieht nach ${r}/${c}.`);
  return null;
}

/* ------------------------------------------------------------ Aktionen */
/* Wie oft eine Stadt pro Runde wachsen darf und wie oft davon kostenlos:
   Keramik = 2× bezahlt, Verbundwerkstoffe = +1× gratis, beide zusammen bis 3×. */
function growLimits(S, pi) {
  const p = S.players[pi];
  const paidMax = has(p, 'keramik') ? 2 : 1;
  const free = has(p, 'verbundwerkstoffe') ? 1 : 0;
  return { max: paidMax + free, free };
}
/* Preis für bezahltes Wachstum. Russland "Fruchtbarkeit": keine Nahrungskosten. */
function growPrice(S, pi, city) {
  const p = S.players[pi];
  return {
    food: isAbil(p, 'wachstum') ? 0 : city.pop,
    coins: has(p, 'dampfmaschine') ? 0 : city.pop,
  };
}
// Das kostenlose Kontingent ist NICHT an die Reihenfolge gebunden: es zählt, wie viele
// Gratis-Schritte diese Runde schon genutzt wurden (city.freeUsed), unabhängig davon,
// ob vorher bezahlt gewachsen wurde.
function growCost(S, pi, city) {
  if (freeGrowthAvailable(S, pi, city)) return { food: 0, coins: 0, free: true };
  return growPrice(S, pi, city);
}
// Steht der Stadt diese Runde noch ein kostenloses Wachstum zu? (Verbundwerkstoffe)
function freeGrowthAvailable(S, pi, city) {
  if (city.owner !== pi || city.born === S.round) return false;
  const lim = growLimits(S, pi);
  if (lim.free <= 0) return false;
  if ((city.grown || 0) >= lim.max) return false;          // Gesamtmaximum erreicht
  return (city.freeUsed || 0) < lim.free;                  // Gratis-Kontingent noch offen
}
/* Gründe, die jedes Wachstum dieser Stadt verhindern (Ereignis, Nahrungsgrenze). */
function growBlockReason(S, pi, city) {
  if (city.noGrow === S.round) return 'Sturmflut: Diese Stadt kann diese Runde nicht wachsen.';
  if (growthBlocked(S, pi, city))
    return 'Nahrungsproduktion würde negativ – Gentechnik oder Massenmedien nötig.';
  return null;
}
function canGrow(S, pi, city) {
  if (city.owner !== pi) return 'Fremde Stadt.';
  if (city.born === S.round) return 'Neue Städte wachsen erst nächste Runde.';
  const lim = growLimits(S, pi);
  if ((city.grown || 0) >= lim.max) return 'Diese Runde schon gewachsen.';
  const blocked = growBlockReason(S, pi, city); if (blocked) return blocked;
  const c = growCost(S, pi, city);
  if (c.food && available(S, pi, 'food') < c.food) return 'Zu wenig Nahrung.';
  if (c.coins && available(S, pi, 'coins') < c.coins) return 'Zu wenig Münzen.';
  return null;
}
// Kann die Stadt kostenpflichtig wachsen? (unabhängig vom Gratis-Kontingent)
function canGrowPaid(S, pi, city) {
  if (city.owner !== pi) return 'Fremde Stadt.';
  if (city.born === S.round) return 'Neue Städte wachsen erst nächste Runde.';
  const lim = growLimits(S, pi);
  if ((city.grown || 0) >= lim.max) return 'Diese Runde schon gewachsen.';
  const blocked = growBlockReason(S, pi, city); if (blocked) return blocked;
  const cost = growPrice(S, pi, city);
  if (cost.food && available(S, pi, 'food') < cost.food) return 'Zu wenig Nahrung.';
  if (cost.coins && available(S, pi, 'coins') < cost.coins) return 'Zu wenig Münzen.';
  return null;
}
/* mode: 'free' erzwingt kostenloses Wachstum (nur wenn Kontingent offen),
   'paid' erzwingt bezahltes Wachstum, sonst automatisch (gratis zuerst). */
function growCity(S, pi, city, mode) {
  if (mode === 'free') {
    if (!freeGrowthAvailable(S, pi, city)) return 'Kein kostenloses Wachstum verfügbar.';
    const blocked = growBlockReason(S, pi, city); if (blocked) return blocked;
    city.pop++; city.grown = (city.grown || 0) + 1; city.freeUsed = (city.freeUsed || 0) + 1;
    log(S, 'act', `${civOf(S.players[pi]).n}: Stadt wächst kostenlos auf ${city.pop}.`);
    return null;
  }
  if (mode === 'paid') {
    const err = canGrowPaid(S, pi, city); if (err) return err;
    const cost = growPrice(S, pi, city);
    if (cost.food) pay(S, pi, 'food', cost.food); if (cost.coins) pay(S, pi, 'coins', cost.coins);
    city.pop++; city.grown = (city.grown || 0) + 1;   // freeUsed bleibt: bezahltes Wachstum verbraucht das Gratis-Kontingent nicht
    log(S, 'act', `${civOf(S.players[pi]).n}: Stadt wächst auf ${city.pop} (${cost.food} Nahrung, ${cost.coins} Münzen).`);
    return null;
  }
  const err = canGrow(S, pi, city); if (err) return err;
  const c = growCost(S, pi, city);
  if (c.food) pay(S, pi, 'food', c.food); if (c.coins) pay(S, pi, 'coins', c.coins);
  city.pop++; city.grown = (city.grown || 0) + 1;
  if (c.free) city.freeUsed = (city.freeUsed || 0) + 1;
  log(S, 'act', `${civOf(S.players[pi]).n}: Stadt wächst auf ${city.pop}` +
    (c.free ? ' (kostenlos).' : ` (${c.food} Nahrung, ${c.coins} Münzen).`));
  return null;
}
/* Kostenloses Sofortwachstum aus Wundereffekten. Zählt nicht gegen das Rundenkontingent,
   respektiert aber die Nahrungsgrenze hart: es wird nur so weit gewachsen, wie möglich. */
function growFree(S, pi, city, n, why) {
  let done = 0;
  for (let i = 0; i < n; i++) {
    if (city.noGrow === S.round) break;
    if (growthBlocked(S, pi, city)) break;
    city.pop++; done++;
  }
  if (done) log(S, 'act', `${civOf(S.players[pi]).n}: Stadt wächst kostenlos um ${done} auf ${city.pop} (${why}).`);
  else log(S, 'info', `${civOf(S.players[pi]).n}: kostenloses Wachstum (${why}) nicht möglich – Nahrungsgrenze.`);
  return done;
}
function foundCost(S, pi, r, c) {
  const p = S.players[pi];
  const n = citiesOf(S, pi).length;
  let base = n * (n + 1) / 2;                        // 1/3/6/10/15 …
  if (isAbil(p, 'gruenden')) base = 0;               // England: keine Basiskosten
  if (has(p, 'kartografie')) return base;
  const cap = capitalOf(S, pi) || citiesOf(S, pi)[0];
  if (!cap) return base;
  const dist = pathSteps(cap.r, cap.c, r, c,
    (rr, cc) => { const t = terrainAt(S, rr, cc); return t && (TERRAIN[t].land || has(p, 'navigation') || has(p, 'panzerschiff')); });
  return base + (dist == null ? hexDistance(cap.r, cap.c, r, c) : dist);
}
function canFound(S, pi, r, c) {
  const t = terrainAt(S, r, c);
  if (!t) return 'Kein Feld.';
  if (!TERRAIN[t].land) return 'Nicht auf Meer.';
  if (TERRAIN[t].block) return 'Nicht auf einem Vulkan.';
  if (armyAt(S, r, c)) return 'Feld besetzt.';
  for (const city of S.cities) if (hexDistance(city.r, city.c, r, c) < 3) return 'Mindestens 3 Felder Abstand zu allen Städten.';
  const cost = foundCost(S, pi, r, c);
  if (available(S, pi, 'food') < cost) return `Zu wenig Nahrung (${cost} nötig).`;
  return null;
}
function foundCity(S, pi, r, c) {
  const err = canFound(S, pi, r, c); if (err) return err;
  const cost = foundCost(S, pi, r, c);
  pay(S, pi, 'food', cost);
  const pop = isAbil(S.players[pi], 'siedler') ? 2 : 1;   // Russland: Städte mit 2 Bevölkerung
  const city = { id: S.nextId++, owner: pi, r, c, pop, cap: false, grown: 0, born: S.round };
  S.cities.push(city);
  log(S, 'act', `${civOf(S.players[pi]).n}: Stadt gegründet auf ${r}/${c} (${cost} Nahrung, Bevölkerung ${pop}).`);
  claimOrphanWonders(S, pi, city);      // Wunder, die ohne Stadt auf dem Feld stehen
  return null;
}
function armyCost(S, pi) {
  const p = S.players[pi];
  let n = armiesOf(S, pi).length + 1;
  if (p.civ === 'wikinger' && isAbil(p, 'basis')) n = Math.max(0, n - 1);   // eine Armee zählt nicht mit
  const mult = has(p, 'nationalismus') ? 2 : has(p, 'demokratie') ? 4 : 5;
  return mult * n;
}
function buildArmy(S, pi, city) {
  if (!city || city.owner !== pi) return 'Nur in eigener Stadt.';
  if (armyAt(S, city.r, city.c)) return 'Dort steht schon eine Armee.';
  const cost = armyCost(S, pi);
  const opts = { foodOk: evActive(S, pi, 'buergerkrieg') };   // Bürgerkrieg: auch mit Nahrung
  if (!pay(S, pi, 'coins', cost, opts)) return `Zu wenig Münzen (${cost} nötig).`;
  S.armies.push({ id: S.nextId++, owner: pi, r: city.r, c: city.c, mp: moveAllowance(S, pi), born: S.round });
  log(S, 'act', `${civOf(S.players[pi]).n}: Armee gebaut (${cost} Münzen) – muss die Stadt noch verlassen.`);
  return null;
}
function powerPrice(S, pi) {
  const p = S.players[pi];
  const base = has(p, 'gewehre') ? 3 : has(p, 'eisenverarbeitung') ? 4 : 5;
  return Math.max(1, base - (hasWonder(S, pi, 'himeji') ? 1 : 0));   // Burg Himeji
}
function buyPower(S, pi, n = 1) {
  const price = powerPrice(S, pi) * n;
  const opts = { foodOk: evActive(S, pi, 'buergerkrieg') };   // Bürgerkrieg: auch mit Nahrung
  if (!pay(S, pi, 'coins', price, opts)) return 'Zu wenig Münzen.';
  S.players[pi].power += n;
  log(S, 'act', `${civOf(S.players[pi]).n}: +${n} Macht für ${price} Münzen → ${S.players[pi].power}.`);
  return null;
}
function roadPrice(S, pi, r, c, target) {
  const cur = roadLevel(S, r, c);
  if (target <= cur) return null;
  return (cur === 0 && target === 2) ? 2 : 1;
}
function buildRoad(S, pi, r, c, target) {
  const p = S.players[pi];
  if (target === 1 && !has(p, 'rad')) return 'Rad noch nicht erforscht.';
  if (target === 2 && !has(p, 'eisenbahn')) return 'Eisenbahn noch nicht erforscht.';
  const t = terrainAt(S, r, c);
  if (!t || !TERRAIN[t].land) return 'Nicht auf Meer.';
  // nur eigenes oder neutrales Gebiet
  const k = key(r, c);
  const mine = controlledTiles(S, pi).has(k) || S.cities.some(x => x.owner === pi && x.r === r && x.c === c);
  const foreign = S.players.some((_, i) => i !== pi && controlledTiles(S, i).has(k));
  if (!mine && foreign) return 'Nur in eigenem oder neutralem Gebiet.';
  const price = roadPrice(S, pi, r, c, target);
  if (price == null) return 'Schon vorhanden.';
  if (!pay(S, pi, 'coins', price)) return 'Zu wenig Münzen.';
  S.roads[k] = target;
  log(S, 'act', `${civOf(p).n}: ${target === 2 ? 'Eisenbahn' : 'Straße'} auf ${r}/${c} (${price} Münzen).`);
  return null;
}
function hasModernTech(p) {
  return TECHS_ACTIVE.some(t => t.age === 3 && p.techs[t.k]);
}
function slaveryUsable(p) {
  if (!has(p, 'sklaverei')) return false;
  if (SLAVERY_OBSOLETE_IN_MODERN && hasModernTech(p)) return false;
  return true;
}
function sacrifice(S, pi, city) {           // Sklaverei
  const p = S.players[pi];
  if (!has(p, 'sklaverei')) return 'Sklaverei nicht erforscht.';
  if (SLAVERY_OBSOLETE_IN_MODERN && hasModernTech(p))
    return 'Sklaverei ist mit dem Eintritt in die Moderne obsolet.';
  if (!city || city.owner !== pi) return 'Fremde Stadt.';
  if (city.pop < 2) return 'Die letzte Bevölkerung darf nicht geopfert werden.';
  if (city.sacrificed === S.round) return 'Diese Stadt hat diese Runde schon geopfert.';
  city.pop--; city.sacrificed = S.round; p.res.coins += 10;
  log(S, 'act', `${civOf(p).n}: Bevölkerung geopfert → +10 Münzen.`);
  return null;
}
function buyTile(S, pi, r, c) {             // Kolonialismus
  const p = S.players[pi];
  if (!has(p, 'kolonialismus')) return 'Kolonialismus nicht erforscht.';
  if (!terrainAt(S, r, c)) return 'Kein Feld.';
  if (cityAt(S, r, c)) return 'Dort steht eine Stadt.';
  if (S.players.some((_, i) => controlledTiles(S, i).has(key(r, c))))
    return 'Nur herrenlose Felder können gekauft werden.';
  if (!pay(S, pi, 'coins', 5)) return 'Zu wenig Münzen.';
  (S.bought[pi] = S.bought[pi] || []).push(key(r, c));
  log(S, 'act', `${civOf(p).n}: Feld ${r}/${c} gekauft (5 Münzen).`);
  return null;
}
/* Kopierbare Technologien anderer Reiche. Drei getrennte Wege:
   - Spionage: bezahlt, 1× Wissenschaftskosten in Münzen, kein Rundenlimit
   - Kundschafterei: bezahlt, 3× Kosten in Münzen, kein Rundenlimit
   - Internet: 1× pro Runde kostenlos
   Vergünstigungen (Wiss. Methode etc.) gelten beim Kopieren nicht. */
function copyRate(p) {
  if (has(p, 'spionage')) return 1;
  if (has(p, 'kundschafterei')) return 3;
  return null;
}
function internetAvailable(S, pi) {
  const p = S.players[pi];
  return has(p, 'internet') && (p.internetUsed !== S.round);
}
function copyableTechs(S, pi) {
  const p = S.players[pi], out = [];
  const rate = copyRate(p);                 // ohne Vergünstigung: Basiskosten der Tech
  const paidPossible = rate != null;
  const freePossible = internetAvailable(S, pi);
  if (!paidPossible && !freePossible) return out;
  const seen = new Set();
  S.players.forEach((o, i) => {
    if (i === pi) return;
    Object.keys(o.techs).forEach(k => {
      if (p.techs[k] || seen.has(k) || k === 'singularitaet') return;
      seen.add(k);
      const t = TECH_BY_KEY[k];
      if (!t) return;
      // Beide Wege sind unabhängig: bezahlt (Spionage/Kundschafterei) UND/ODER
      // die eine Gratiskopie pro Runde (Internet).
      out.push({
        tech: t,
        paidCoins: paidPossible ? rate * t.c : null,   // null = kein bezahlter Weg
        freeOk: freePossible,                          // true = Gratiskopie möglich
      });
    });
  });
  return out;
}
function copyTech(S, pi, tk, mode) {
  const p = S.players[pi];
  const opt = copyableTechs(S, pi).find(o => o.tech.k === tk);
  if (!opt) return 'Nicht kopierbar.';
  // Modus wählen: 'free' oder 'paid'. Ohne Angabe: bezahlt bevorzugen, damit die
  // Gratiskopie für später frei bleibt.
  const useMode = mode || (opt.paidCoins != null ? 'paid' : 'free');
  if (useMode === 'free') {
    if (!opt.freeOk || !internetAvailable(S, pi)) return 'Diese Runde schon per Internet kopiert.';
    p.internetUsed = S.round;
    p.techs[tk] = true;
    log(S, 'act', `${civOf(p).n}: ${opt.tech.n} kopiert (Internet, gratis).`);
  } else {
    if (opt.paidCoins == null) return 'Kein bezahlter Kopierweg erforscht.';
    if (opt.paidCoins && !pay(S, pi, 'coins', opt.paidCoins)) return `Zu wenig Münzen (${opt.paidCoins} nötig).`;
    p.techs[tk] = true;
    log(S, 'act', `${civOf(p).n}: ${opt.tech.n} kopiert (${opt.paidCoins} Münzen).`);
  }
  const same = TECHS_ACTIVE.filter(t => t.f === opt.tech.f && t.age === opt.tech.age && p.techs[t.k]);
  if (same.length === 1) rollAvailability(S, pi, opt.tech.f, opt.tech.age + 1);
  return null;
}
function nuke(S, pi, r, c) {                // Atomwaffen
  const p = S.players[pi];
  if (!has(p, 'atomwaffen')) return 'Atomwaffen nicht erforscht.';
  if (evNukeBan(S, pi)) return 'Atomwaffenproteste: Atomwaffen können nicht mehr eingesetzt werden.';
  if (p.nuked) return 'Diese Runde schon eingesetzt.';
  const area = [[r, c], ...neighbors(r, c)];
  let n = 0;
  S.armies = S.armies.filter(a => {
    const hit = area.some(([rr, cc]) => rr === a.r && cc === a.c);
    if (hit) n++;
    return !hit;
  });
  p.nuked = true;
  log(S, 'act', `${civOf(p).n}: Atomschlag auf ${r}/${c} – ${n} Armee(n) zerstört.`);
  return null;
}

/* ------------------------------------------------------------ Kampf */
/* Reichweite, mit der eine Armee ihren Machtwert projiziert: 1, mit Raketentechnik 2.
   Gilt für Angriff auf Städte, Verteidigung von Städten und Flankieren gleichermaßen. */
function projectRange(S, pi) { return has(S.players[pi], 'raketentechnik') ? 2 : 1; }
function attackRange(S, pi) { return projectRange(S, pi); }
function attackersOn(S, pi, city) {
  const rng = attackRange(S, pi);
  return armiesOf(S, pi).filter(a => hexDistance(a.r, a.c, city.r, city.c) <= rng);
}
function attackValue(S, pi, count) {
  const p = S.players[pi];
  if (count <= 0) return 0;
  let per = powerOf(S, pi);
  if (has(p, 'belagerung')) per += 5;
  if (has(p, 'dynamit')) per *= 2;
  return per * (COMBAT.attackStacks ? count : 1);
}
function defenseValue(S, city) {
  const o = S.players[city.owner], oi = city.owner;
  if (o.kind === 'barbar') return city.pop;      // Barbarenstädte verteidigen nur mit Bevölkerung
  // Die Große Mauer rechnet die Verteidigung mit der Gesamtbevölkerung des Reiches.
  const base = hasWonder(S, oi, 'mauer') ? popOf(S, oi) : city.pop;
  let d = base * (has(o, 'maschinengewehr') ? 3 : 1);
  if (has(o, 'stadtmauern')) d += 5;
  if (has(o, 'burgenbau')) d += powerOf(S, oi);          // virtuelle Armee in der Stadt
  const rng = projectRange(S, oi);
  let helpers = 0;
  for (const a of armiesOf(S, oi))
    if (hexDistance(a.r, a.c, city.r, city.c) <= rng) helpers++;
  if (helpers) d += powerOf(S, oi) * (COMBAT.defenseStacks ? helpers : 1);
  return d;
}
function combatPhase(S, pi) {
  const p = S.players[pi];
  // Belagerungen
  for (const city of S.cities.slice()) {
    if (city.owner === pi) continue;
    const sk = pi + '|' + city.id;
    const atk = attackersOn(S, pi, city);
    if (!atk.length) { delete S.sieges[sk]; continue; }
    const a = attackValue(S, pi, atk.length), d = defenseValue(S, city);
    if (a > d) {
      S.sieges[sk] = (S.sieges[sk] || 0) + 1;
      log(S, 'fight', `Kampf um ${civOf(S.players[city.owner]).n}s Stadt: Angriff ${a} > Verteidigung ${d} (Zug ${S.sieges[sk]}/2).`);
      if (S.sieges[sk] >= 2) captureCity(S, pi, city);
    } else {
      if (S.sieges[sk]) log(S, 'fight', `Belagerung gebrochen (Angriff ${a} ≤ Verteidigung ${d}).`);
      S.sieges[sk] = 0;
    }
  }
  // Flankieren. Positionen, von denen aus flankiert werden kann: eigene Armeen und
  // – falls Burgenbau erforscht – die eigenen Städte (die virtuelle Burgenarmee).
  const flankSpots = armiesOf(S, pi).map(a => [a.r, a.c]);
  if (has(p, 'burgenbau')) for (const c of citiesOf(S, pi)) flankSpots.push([c.r, c.c]);
  const rng = projectRange(S, pi);
  for (const enemy of S.armies.slice()) {
    if (enemy.owner === pi) continue;
    const near = flankSpots.filter(([r, c]) => {
      const d = hexDistance(r, c, enemy.r, enemy.c);
      return d >= 1 && d <= rng;
    });
    if (near.length < 2) continue;
    let ok = has(p, 'taktik');
    if (!ok) {
      // gegenüberliegend: zwei Felder, deren Richtung vom Gegner sich um 180° unterscheidet.
      // Mit Raketentechnik zählt auch Distanz 2 auf beiden gegenüberliegenden Seiten.
      ok = near.some(([r1, c1]) => near.some(([r2, c2]) => {
        if (r1 === r2 && c1 === c2) return false;
        const drow = enemy.r - r1, dcol = enemy.c - c1;
        return r2 === enemy.r + drow && c2 === enemy.c + dcol;   // Punktspiegelung am Gegner
      }));
    }
    if (ok && powerOf(S, pi) > powerOf(S, enemy.owner)) {
      S.armies = S.armies.filter(a => a !== enemy);
      log(S, 'fight', `${civOf(p).n} flankiert und zerstört eine Armee von ${civOf(S.players[enemy.owner]).n}.`);
    }
  }
}
function captureCity(S, pi, city) {
  const p = S.players[pi], loser = S.players[city.owner];
  const loss = has(p, 'militaergericht') ? 0 : has(p, 'rittertum') ? 1 : 2;
  const wasCapital = city.cap;
  city.pop -= loss;
  delete S.sieges[pi + '|' + city.id];
  if (city.pop <= 0) {
    S.cities = S.cities.filter(x => x !== city);
    loseCityWonders(S, city);          // zerstört – oder bleibt stehen (Stonehenge)
    log(S, 'fight', `${civOf(p).n} zerstört eine Stadt von ${civOf(loser).n}.`);
  } else {
    const old = city.owner;
    city.owner = pi; city.cap = false; city.grown = 99;
    takeCityWonders(S, city, old, pi);  // Wunder samt dauerhafter Effekte wechseln den Besitzer
    log(S, 'fight', `${civOf(p).n} erobert eine Stadt von ${civOf(loser).n} (Bevölkerung ${city.pop}).`);
  }
  if (wasCapital && p.kind !== 'barbar')
    S.over = { winner: pi, how: `Militärsieg (Hauptstadt von ${civOf(loser).n} erobert)` };
  if (!citiesOf(S, S.players.indexOf(loser)).length) loser.dead = true;
}

/* ------------------------------------------------------------ Sieg & Zugende */
/* Alle verfügbaren Siegschwellen. UN und Theologie senken die Standardschwelle von ⅔;
   es gilt immer die niedrigste. UN/Theologie sind „mehr als", der Standard „mindestens". */
function victoryOption(p) {
  const opts = [{ frac: VICTORY_FRAC, strict: false, label: '2/3' }];
  if (has(p, 'un')) opts.push({ frac: UN_FRAC, strict: true, label: '1/2' });
  if (has(p, 'theologie')) opts.push({ frac: THEOLOGY_FRAC, strict: true, label: '3/5' });
  return opts.sort((a, b) => a.frac - b.frac)[0];
}
function checkVictory(S, pi) {
  if (S.over) return S.over;
  const p = S.players[pi], w = worldPop(S), mine = popOf(S, pi);
  const o = victoryOption(p);
  const enough = o.strict ? mine > w * o.frac : mine >= w * o.frac;
  if (w > 0 && enough && S.cities.length > 1) {
    S.over = { winner: pi, how: `Wirtschaftssieg (${mine} von ${w} Weltbevölkerung, Schwelle ${o.label})` };
  }
  return S.over;
}
function pendingWarnings(S, pi) {
  const out = [];
  for (const a of armiesOf(S, pi))
    if (a.born === S.round && cityAt(S, a.r, a.c)) out.push('Eine neu gebaute Armee steht noch in der Stadt und müsste sich wegbewegen.');
  return out;
}
/* Schritt 4 + 5 des Zuges. Läuft für Menschen wie Bots an genau einer Stelle –
   sonst würde ein Belagerungszähler zweimal pro Zug steigen. */
function finishTurn(S) {
  if (S.over) return S.over;
  combatPhase(S, S.cur);
  checkVictory(S, S.cur);
  return S.over;
}
function advanceTurn(S) {
  let guard = 0;
  do {
    S.cur = (S.cur + 1) % S.players.length;
    if (S.cur === 0) { S.round++; startRound(S); }
    guard++;
  } while (S.players[S.cur].dead && guard < 20);
  beginTurn(S);
}
function endTurn(S) {
  if (finishTurn(S)) return;
  advanceTurn(S);
}
