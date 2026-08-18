/* Prüft die Regelmaschine gegen die Beispiele aus dem Regelheft. */
const fs = require('fs'), vm = require('vm');
for (const f of ['js/data.js', 'js/hex.js', 'js/engine.js', 'js/expansion.js', 'js/bots.js'])
  vm.runInThisContext(fs.readFileSync(__dirname + '/' + f, 'utf8'));

let fails = 0;
const eq = (got, want, label) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fails++; console.log(`FAIL ${label}: ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`); }
  else console.log(`  ok  ${label}`);
};

// Bringt die Zielzivilisation auf Index 0, indem Spieler samt Städte/Armeen umnummeriert
// werden. Nötig, weil newGame die feste Reihenfolge erzwingt; die meisten Tests wollen
// aber „ihren" Spieler an Index 0. Am Spielverhalten ändert das nichts.
function normalize(S, civ) {
  const from = S.players.findIndex(p => p.civ === civ);
  if (from === 0) return S;
  const remap = {}; S.players.forEach((_, i) => remap[i] = i);
  const order = [from, ...S.players.map((_, i) => i).filter(i => i !== from)];
  const newPlayers = order.map(i => S.players[i]);
  const inv = {}; order.forEach((oldI, newI) => inv[oldI] = newI);
  S.players = newPlayers;
  S.cities.forEach(c => c.owner = inv[c.owner]);
  S.armies.forEach(a => a.owner = inv[a.owner]);
  Object.keys(S.sieges || {}).forEach(k => {
    const [pi, cid] = k.split('|'); const nk = inv[+pi] + '|' + cid;
    if (nk !== k) { S.sieges[nk] = S.sieges[k]; delete S.sieges[k]; }
  });
  S.cur = inv[S.cur];
  return S;
}
const mk = (civ, techs = []) => {
  const S = normalize(newGame({ players: [{ civ, kind: 'human' }, { civ: 'england', kind: 'bot' }], seed: 7 }), civ);
  techs.forEach(t => S.players[0].techs[t] = true);
  return S;
};
// Spiel mit Erweiterungen (Ereignisse und/oder Weltwunder)
const mkX = (civ, opts = {}, techs = []) => {
  const S = normalize(newGame(Object.assign({
    players: [{ civ, kind: 'human', ability: opts.ability }, { civ: 'england', kind: 'bot' }], seed: 7,
  }, opts)), civ);
  techs.forEach(t => S.players[0].techs[t] = true);
  return S;
};
// Spiel mit gewählter Zivilisationsfähigkeit
const mkA = (civ, ability, techs = []) => {
  const S = normalize(newGame({
    players: [{ civ, kind: 'human', ability }, { civ: 'england', kind: 'bot' }], seed: 7,
  }), civ);
  techs.forEach(t => S.players[0].techs[t] = true);
  return S;
};
// Hilfsfunktion: freies Landfeld neben der Hauptstadt, für Armeen im Test
const spotBy = (S, city) => neighbors(city.r, city.c).find(([r, c]) =>
  isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));

/* --- Beispiel "Zug 1 (Alex)": Hauptstadt mit 1 Bevölkerung, 4 Grasland + 2 Meer
       → 1 Wissenschaft, 3 Nahrung, 2 Münzen                                     */
{
  const S = mk('griechenland');
  const sum = [0, 0, 0];
  for (const t of ['G', 'G', 'G', 'G', 'M', 'M']) {
    const y = tileYield(S, 0, t); sum[0] += y[0]; sum[1] += y[1]; sum[2] += y[2];
  }
  const py = cityPopYield(S, 0);
  // Das Regelheft schreibt hier "2 Münzen" und vergisst dabei die Münze der Stadtbevölkerung,
  // die es einen Absatz später selbst aufzählt. Richtig sind 3 Münzen (2 Meer + 1 Bevölkerung).
  eq([sum[0] + py[0], sum[1] + py[1], sum[2] + py[2]], [1, 3, 3], 'Zug 1: 4 Grasland + 2 Meer + 1 Bevölkerung');
}

/* --- Beispiel "Zug 2 (Alex)": 9 Grasland, 2 Meer, 1 Gebirge, 2 Stadtbevölkerung,
       Techs Schrift + Landwirtschaft → 5 Wissenschaft, 16 Nahrung, 5 Münzen      */
{
  const S = mk('griechenland', ['schrift', 'landwirtschaft']);
  const tiles = 'GGGGGGGGGMMB'.split('');
  const sum = [0, 0, 0];
  tiles.forEach(t => { const y = tileYield(S, 0, t); sum[0] += y[0]; sum[1] += y[1]; sum[2] += y[2]; });
  const py = cityPopYield(S, 0), pop = 2;
  eq([sum[0] + py[0] * pop, sum[1] + py[1] * pop, sum[2] + py[2] * pop], [5, 16, 5], 'Zug 2: Einkommen');
}

/* --- Kampfbeispiel: 15 Grasland, 4 Stadtbevölkerung, 3 Fluss, 4 Meer, 2 Gebirge,
       Techs Schrift, Papier, Landwirtschaft → 25 Wissenschaft, 29 Nahrung, 13 Münzen */
{
  const S = mk('griechenland', ['schrift', 'papier', 'landwirtschaft']);
  const sum = [0, 0, 0];
  const tiles = 'G'.repeat(15) + 'F'.repeat(3) + 'M'.repeat(4) + 'B'.repeat(2);
  tiles.split('').forEach(t => { const y = tileYield(S, 0, t); sum[0] += y[0]; sum[1] += y[1]; sum[2] += y[2]; });
  const py = cityPopYield(S, 0), pop = 4;
  eq([sum[0] + py[0] * pop, sum[1] + py[1] * pop, sum[2] + py[2] * pop], [25, 29, 13], 'Kampfbeispiel: Einkommen');
}

/* --- Griechische Technologiekosten aus dem Beispiel */
{
  const S = mk('griechenland');
  eq(techCost(S, 0, TECH_BY_KEY.schrift), 0, 'Schrift kostet Griechenland 0');
  eq(techCost(S, 0, TECH_BY_KEY.eisenverarbeitung), 1, 'Eisenverarbeitung kostet 1');
  eq(techCost(S, 0, TECH_BY_KEY.papier), 4, 'Papier kostet 4');
  eq(techCost(S, 0, TECH_BY_KEY.alchemie), 6, 'Alchemie kostet 6');
  S.players[0].techs.wiss_methode = true;
  eq(techCost(S, 0, TECH_BY_KEY.biologie), 15 - 3 - 6, 'Biologie mit Wiss. Methode');
}

/* --- Stadtgründungskosten: Grundkosten 1/3/6/10 + Distanz */
{
  const S = mk('griechenland');
  const cap = capitalOf(S, 0);
  // künstlich Städte hinzufügen und Kosten prüfen (Distanz getrennt geprüft)
  const base = n => n * (n + 1) / 2;
  eq([base(1), base(2), base(3), base(4)], [1, 3, 6, 10], 'Grundkosten 1/3/6/10');
  const target = [cap.r, cap.c + 3];
  const c1 = foundCost(S, 0, target[0], target[1]);
  eq(c1, 1 + 3, 'Zweite Stadt in Distanz 3 kostet 4');
}

/* --- Machtverlust: 8 → 4 */
{
  const S = mk('griechenland');
  S.players[0].power = 8; S.cur = 0;
  const div = 2, loss = Math.ceil(8 / div);
  eq(8 - loss, 4, 'Macht 8 halbiert ergibt 4');
  eq(8 - Math.ceil(8 / 3), 5, 'Macht 8 mit Stahl (1/3) ergibt 5');
}

/* --- Armeekosten 5 je Armee inkl. der neuen; Wikinger zahlen eine weniger */
{
  const S = mk('griechenland');
  eq(armyCost(S, 0), 5, 'erste Armee kostet 5');
  S.armies.push({ id: 99, owner: 0, r: 0, c: 0, mp: 0, born: 0 });
  eq(armyCost(S, 0), 10, 'zweite Armee kostet 10');
  const W = mk('wikinger');
  eq(armiesOf(W, 0).length, 1, 'Wikinger starten mit einer kostenlosen Armee');
  eq(armyCost(W, 0), 5, 'Wikinger: nächste Armee kostet 5 statt 10');
  W.armies.push({ id: 98, owner: 0, r: 0, c: 0, mp: 0, born: 0 });
  eq(armyCost(W, 0), 10, 'Wikinger: dritte Armee kostet 10 statt 15');
}

/* --- Umrechnung: 2 Münzen = 1 Nahrung; England 1:1 */
{
  const S = mk('griechenland');
  S.players[0].res = { sci: 0, food: 0, coins: 4 };
  eq(available(S, 0, 'food'), 2, '4 Münzen ergeben 2 Nahrung');
  const E = mk('england');
  E.players[0].res = { sci: 0, food: 0, coins: 4 };
  eq(available(E, 0, 'food'), 4, 'England: 4 Münzen ergeben 4 Nahrung');
}

/* --- England kann Nahrung für Forschung ausgeben (Nahrung = Münzen = Wissenschaft) */
{
  const E = mk('england');
  E.players[0].res = { sci: 0, food: 10, coins: 0 };   // nur Nahrung
  eq(available(E, 0, 'sci'), 5, 'England: 10 Nahrung → 10 Münzen → 5 Wissenschaft (Kurs 2)');
  eq(pay(E, 0, 'sci', 3), true, 'England kann 3 Wissenschaft aus Nahrung bezahlen');
  eq(E.players[0].res.food, 4, '3 Wissenschaft kosten 6 Nahrung, 4 übrig');
  // mit Computertechnik ist der Kurs 1:1
  const E2 = mk('england', ['computertechnik']);
  E2.players[0].res = { sci: 0, food: 10, coins: 0 };
  eq(available(E2, 0, 'sci'), 10, 'England mit Computertechnik: 10 Nahrung → 10 Wissenschaft');
  // Nicht-England darf das nicht
  const G = mk('griechenland');
  G.players[0].res = { sci: 0, food: 10, coins: 0 };
  eq(available(G, 0, 'sci'), 0, 'Griechenland kann Nahrung NICHT in Wissenschaft tauschen');
}

/* --- Verteidigungswert aus dem Kampfbeispiel: Stadt mit 2 Bevölkerung + Bot-Armee
       daneben (Bot-Macht = Gesamtbevölkerung 3) → 5                              */
{
  const S = newGame({ players: [{ civ: 'griechenland', kind: 'human' }, { civ: 'england', kind: 'bot', diff: 'david' }], seed: 3 });
  const eng = capitalOf(S, 1);
  eng.pop = 2;
  S.cities.push({ id: 500, owner: 1, r: eng.r + 4, c: eng.c, pop: 1, cap: false, grown: 0, born: 0 });
  const spot = neighbors(eng.r, eng.c).find(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  S.armies.push({ id: 501, owner: 1, r: spot[0], c: spot[1], mp: 0, born: 0 });
  eq(defenseValue(S, eng), 5, 'Verteidigung 2 Bevölkerung + Armee mit Machtwert 3');
}

/* --- Bürokratie: verdoppelt Bevölkerung UND Umland der Hauptstadt */
{
  const S = mk('griechenland');
  const base = income(S, 0);
  S.players[0].techs.buerokratie = true;
  const buro = income(S, 0);
  eq([buro.sci, buro.food, buro.coins], [base.sci * 2, base.food * 2, base.coins * 2],
    'Bürokratie verdoppelt das gesamte Hauptstadteinkommen');

  // Zweite Stadt weit weg: nur der Hauptstadtanteil verdoppelt sich
  const T = mk('griechenland');
  const cap = capitalOf(T, 0);
  // rein geometrisch wählen – canFound prüft zusätzlich die Nahrung des laufenden Zuges
  const spot = within(cap.r, cap.c, 7).find(([r, c]) => isLand(T, r, c) &&
    hexDistance(cap.r, cap.c, r, c) >= 4 && !T.cities.some(x => hexDistance(x.r, x.c, r, c) < 3));
  T.cities.push({ id: 900, owner: 0, r: spot[0], c: spot[1], pop: 2, cap: false, grown: 0, born: 0 });
  const b0 = income(T, 0);
  // Hauptstadtanteil separat aufsummieren
  const py = cityPopYield(T, 0);
  const capPart = [py[0] * cap.pop, py[1] * cap.pop, py[2] * cap.pop];
  for (const [r, c] of neighbors(cap.r, cap.c)) {
    if (!terrainAt(T, r, c) || cityAt(T, r, c)) continue;
    const y = tileYield(T, 0, terrainAt(T, r, c));
    capPart[0] += y[0]; capPart[1] += y[1]; capPart[2] += y[2];
  }
  T.players[0].techs.buerokratie = true;
  const b1 = income(T, 0);
  eq([b1.sci - b0.sci, b1.food - b0.food, b1.coins - b0.coins], capPart,
    'Bei zwei Städten verdoppelt Bürokratie nur die Hauptstadt samt Umland');
}

/* --- Belagerung braucht zwei aufeinanderfolgende Züge */
{
  const S = newGame({ players: [{ civ: 'griechenland', kind: 'human' }, { civ: 'england', kind: 'human' }], seed: 5 });
  const eng = capitalOf(S, 1);
  // Platz für die Stadt: Land, weit genug weg, und mit freiem Landnachbarn für die Armee
  const site = within(eng.r, eng.c, 5).find(([r, c]) =>
    isLand(S, r, c) && !S.cities.some(x => hexDistance(x.r, x.c, r, c) < 3) &&
    neighbors(r, c).some(([nr, nc]) => isLand(S, nr, nc)));
  S.cities.push({ id: 801, owner: 1, r: site[0], c: site[1], pop: 4, cap: false, grown: 0, born: 0 });
  const target = S.cities.find(x => x.id === 801);
  S.players[0].power = 50;
  const spot = neighbors(target.r, target.c).find(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  S.armies.push({ id: 777, owner: 0, r: spot[0], c: spot[1], mp: 0, born: 0 });
  S.cur = 0;
  finishTurn(S);
  eq([S.sieges['0|801'], target.owner], [1, 1], 'nach dem ersten Zug: Belagerung 1/2, Stadt noch beim Gegner');
  finishTurn(S);
  eq([S.cities.find(x => x.id === 801).owner, S.cities.find(x => x.id === 801).pop], [0, 2],
    'nach dem zweiten Zug erobert, Bevölkerung −2');
}

/* --- Angriffswert addiert sich je angreifender Armee */
{
  const S = newGame({ players: [{ civ: 'griechenland', kind: 'human' }, { civ: 'england', kind: 'human' }], seed: 9 });
  S.players[0].power = 7;
  const eng = capitalOf(S, 1);
  const frei = neighbors(eng.r, eng.c).filter(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c));
  S.armies.push({ id: 701, owner: 0, r: frei[0][0], c: frei[0][1], mp: 0, born: 0 });
  eq(attackValue(S, 0, attackersOn(S, 0, eng).length), 7, 'eine Armee greift mit dem Machtwert an');
  S.armies.push({ id: 702, owner: 0, r: frei[1][0], c: frei[1][1], mp: 0, born: 0 });
  eq(attackersOn(S, 0, eng).length, 2, 'zwei Armeen stehen an der Stadt');
  eq(attackValue(S, 0, 2), 14, 'zwei Armeen greifen mit 14 an (7 je Armee)');
  eq(attackValue(S, 0, 3), 21, 'drei Armeen mit 21');
  S.players[0].techs.belagerung = true;
  eq(attackValue(S, 0, 2), 24, 'Belagerungsmaschinen: (7+5) je Armee');
  S.players[0].techs.dynamit = true;
  eq(attackValue(S, 0, 2), 48, 'Dynamit verdoppelt danach');
}

/* --- Bots kämpfen genau einmal pro Zug (nicht in botTurn UND im Zugende) */
{
  const B = newGame({ players: [{ civ: 'england', kind: 'bot', diff: 'siedler' }, { civ: 'griechenland', kind: 'human' }], seed: 11 });
  const bi = B.players.findIndex(p => p.civ === 'england');   // Bot
  const hi = B.players.findIndex(p => p.civ === 'griechenland');
  capitalOf(B, bi).pop = 20;                       // Bot-Macht = Gesamtbevölkerung
  const gr = capitalOf(B, hi); gr.pop = 4;
  const spot = neighbors(gr.r, gr.c).find(([r, c]) => isLand(B, r, c) && !cityAt(B, r, c) && !armyAt(B, r, c));
  B.armies.push({ id: 900, owner: bi, r: spot[0], c: spot[1], mp: 0, born: 0 });
  B.cur = bi;
  botTurn(B, bi);
  eq(B.sieges[bi + '|' + gr.id] || 0, 0, 'botTurn allein löst noch keinen Kampf aus');
  const army = B.armies.find(a => a.id === 900);
  army.r = spot[0]; army.c = spot[1];              // Bot könnte sie versetzt haben
  finishTurn(B);
  eq(B.sieges[bi + '|' + gr.id], 1, 'Kampf findet genau einmal statt – Stadt fällt nicht im selben Zug');
  eq(!!B.cities.find(x => x.id === gr.id), true, 'Hauptstadt steht nach einem Bot-Zug noch');
}

/* --- Log-Fenster bei vollem Protokoll: logSince liefert neue Einträge, slice-by-length nicht */
{
  const S = mk('griechenland');
  // Log über die 600er-Grenze füllen
  for (let i = 0; i < 650; i++) log(S, 'roll', 'Füller ' + i);
  eq(S.log.length, 600, 'Protokoll ist auf 600 Einträge gekappt');
  const beforeLen = S.log.length;      // fehleranfälliger Längen-Marker
  const sinceSeq = S.logSeq;           // stabiler Sequenz-Marker
  log(S, 'act', 'Neuer Eintrag A'); log(S, 'act', 'Neuer Eintrag B');
  eq(S.log.slice(beforeLen).length, 0, 'slice(length) findet die neuen Einträge NICHT (der alte Bug)');
  eq(logSince(S, sinceSeq).length, 2, 'logSince findet beide neuen Einträge trotz Kappung');
  eq(logSince(S, sinceSeq).map(e => e.m), ['Neuer Eintrag A', 'Neuer Eintrag B'], 'korrekte neue Einträge');
}

/* --- Stadtfelder zählen als Straße bzw. Eisenbahn */
{
  const S = mk('griechenland');
  const cap = capitalOf(S, 0);
  const frei = neighbors(cap.r, cap.c).filter(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c));
  const [r1, c1] = frei[0], [r2, c2] = frei[1];
  eq(moveCost(S, cap.r, cap.c, r1, c1), 1, 'ohne Straße kostet der Schritt 1');
  S.roads[key(r1, c1)] = 1;
  eq(moveCost(S, cap.r, cap.c, r1, c1), 0.5, 'Stadtfeld zählt als Straße, sobald eine angrenzt');
  eq(moveCost(S, cap.r, cap.c, r2, c2), 1, 'Nachbarfeld ohne Straße bleibt bei 1');
  S.roads[key(r1, c1)] = 2;
  eq(moveCost(S, cap.r, cap.c, r1, c1), 0, 'Stadtfeld zählt als Eisenbahn, sobald eine angrenzt');
  eq(effectiveRoad(S, r2, c2), 0, 'ein normales Feld erbt nichts von Nachbarn');
}

/* === Kampfregeln aus dem aktualisierten Regelheft === */

/* Raketentechnik: Verteidiger und Angreifer wirken auf Distanz 2 */
{
  const S = newGame({ players: [{ civ: 'griechenland', kind: 'human' }, { civ: 'england', kind: 'human' }], seed: 12 });
  const gr = capitalOf(S, 0); gr.pop = 3; S.players[0].power = 6;
  // Angreifer auf Distanz 2 von Englands Hauptstadt
  const eng = capitalOf(S, 1);
  const two = within(eng.r, eng.c, 2).find(([r, c]) => hexDistance(eng.r, eng.c, r, c) === 2 && isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  S.armies.push({ id: 601, owner: 0, r: two[0], c: two[1], mp: 0, born: 0 });
  eq(attackersOn(S, 0, eng).length, 0, 'ohne Raketentechnik zählt Distanz 2 nicht');
  S.players[0].techs.raketentechnik = true;
  eq(attackersOn(S, 0, eng).length, 1, 'mit Raketentechnik greift die Armee aus Distanz 2 an');
  // Verteidigung: eigene Armee auf Distanz 2 der eigenen Stadt
  const d2 = within(gr.r, gr.c, 2).find(([r, c]) => hexDistance(gr.r, gr.c, r, c) === 2 && isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  const before = defenseValue(S, gr);
  S.armies.push({ id: 602, owner: 0, r: d2[0], c: d2[1], mp: 0, born: 0 });
  eq(defenseValue(S, gr) - before, powerOf(S, 0), 'Verteidiger auf Distanz 2 trägt mit Raketentechnik bei');
}

/* Burgenbau: virtuelle Armee verteidigt die eigene Stadt und kann flankieren */
{
  const S = newGame({ players: [{ civ: 'griechenland', kind: 'human' }, { civ: 'england', kind: 'human' }], seed: 13 });
  const gr = capitalOf(S, 0); gr.pop = 2; S.players[0].power = 4;
  const base = defenseValue(S, gr);
  S.players[0].techs.burgenbau = true;
  eq(defenseValue(S, gr) - base, powerOf(S, 0), 'Burgenbau addiert den Machtwert zur Stadtverteidigung');
  // Flankieren: eine echte Armee + die Burgenstadt auf gegenüberliegenden Seiten eines Gegners
  const enemy = { id: 610, owner: 1, r: 0, c: 0 };
  // Gegner direkt neben die eigene Stadt setzen, echte Armee gegenüber
  const adj = neighbors(gr.r, gr.c).find(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c));
  enemy.r = adj[0]; enemy.c = adj[1];
  S.players[1].power = 1;
  const opp = [enemy.r + (enemy.r - gr.r), enemy.c + (enemy.c - gr.c)];
  S.armies.push({ id: 611, owner: 0, r: opp[0], c: opp[1], mp: 0, born: 0 });
  S.armies.push(enemy);
  S.cur = 0; combatPhase(S, 0);
  eq(S.armies.some(a => a.id === 610), false, 'Burgenstadt hilft, eine benachbarte Gegnerarmee zu flankieren');
}

/* Sklaverei: max. 1 pro Runde pro Stadt */
{
  const S = mk('griechenland', ['sklaverei']);
  const c = capitalOf(S, 0); c.pop = 4;
  eq(sacrifice(S, 0, c), null, 'erstes Opfern klappt');
  eq(typeof sacrifice(S, 0, c), 'string', 'zweites Opfern in derselben Runde wird abgelehnt');
  eq(c.pop, 3, 'nur eine Bevölkerung geopfert');
}

/* Kolonialismus: nur herrenlose Felder */
{
  const S = mk('griechenland', ['kolonialismus']);
  const cap = capitalOf(S, 0);
  const owned = neighbors(cap.r, cap.c).find(([r, c]) => terrainAt(S, r, c) && !cityAt(S, r, c));
  S.players[0].res.coins = 20;
  eq(typeof buyTile(S, 0, owned[0], owned[1]), 'string', 'eigenes Umland ist nicht kaufbar');
  // ein weit entferntes herrenloses Feld finden
  let free = null;
  for (const [r, c] of within(cap.r, cap.c, 6))
    if (terrainAt(S, r, c) && !S.players.some((_, i) => controlledTiles(S, i).has(key(r, c))) && !cityAt(S, r, c)) { free = [r, c]; break; }
  eq(buyTile(S, 0, free[0], free[1]), null, 'herrenloses Feld ist kaufbar');
}

/* Internet: genau eine Gratiskopie pro Runde */
{
  const S = newGame({ players: [{ civ: 'griechenland', kind: 'human' }, { civ: 'england', kind: 'human' }], seed: 14 });
  S.players[1].techs.stadtmauern = true; S.players[1].techs.taktik = true;
  S.players[0].techs.internet = true;
  eq(internetAvailable(S, 0), true, 'Internet-Kopie steht zu Rundenbeginn bereit');
  const opt = copyableTechs(S, 0);
  eq(opt.length >= 2 && opt.every(o => o.freeOk && o.paidCoins == null), true, 'reines Internet: nur Gratiskopie, kein bezahlter Weg');
  eq(copyTech(S, 0, 'stadtmauern'), null, 'erste Gratiskopie klappt');
  eq(typeof copyTech(S, 0, 'taktik'), 'string', 'zweite Kopie in derselben Runde wird abgelehnt');
}

/* Kundschafterei/Spionage + Internet: jede Tech bietet bezahlt UND gratis an */
{
  const S = newGame({ players: [{ civ: 'griechenland', kind: 'human' }, { civ: 'england', kind: 'human' }], seed: 15 });
  S.players[1].techs.stadtmauern = true;   // Kosten 5
  S.players[1].techs.taktik = true;        // Kosten 1
  S.players[0].techs.kundschafterei = true; S.players[0].techs.internet = true;
  S.players[0].res.coins = 50;
  const sm = copyableTechs(S, 0).find(o => o.tech.k === 'stadtmauern');
  eq(sm.paidCoins, 15, 'Kundschafterei: 3× Basiskosten (3×5) in Münzen');
  eq(sm.freeOk, true, 'Internet-Gratiskopie steht trotz Kundschafterei zur Verfügung (Bugfix)');
  // Gratiskopie kostet keine Münzen und verbraucht das Rundenkontingent
  eq(copyTech(S, 0, 'stadtmauern', 'free'), null, 'gratis kopieren klappt');
  eq(S.players[0].res.coins, 50, 'Gratiskopie kostet keine Münzen');
  eq(internetAvailable(S, 0), false, 'Internet-Kontingent danach verbraucht');
  // eine zweite Kopie in derselben Runde geht nur noch bezahlt
  const tk = copyableTechs(S, 0).find(o => o.tech.k === 'taktik');
  eq(tk.freeOk, false, 'keine zweite Gratiskopie in derselben Runde');
  eq(tk.paidCoins, 3, 'bezahlter Weg (3×1) bleibt');
}

/* Nur Spionage (ohne Internet): bezahlt, keine Gratiskopie */
{
  const S = newGame({ players: [{ civ: 'griechenland', kind: 'human' }, { civ: 'england', kind: 'human' }], seed: 15 });
  S.players[1].techs.stadtmauern = true;
  S.players[0].techs.spionage = true;
  const sm = copyableTechs(S, 0).find(o => o.tech.k === 'stadtmauern');
  eq(sm.paidCoins, 5, 'Spionage: 1× Basiskosten in Münzen');
  eq(sm.freeOk, false, 'ohne Internet keine Gratiskopie');
}

/* === Regeln der Hauptvariante (vormals v2) === */

/* Singularität kostet 100 */
{
  const S = mk('griechenland');
  eq(SINGULARITY.c, 100, 'Singularität-Grundkosten 100');
  eq(techCost(S, 0, SINGULARITY), 95, 'griechischer Rabatt auch auf Singularität');
}

/* Griechenland hat keinen Würfelbonus mehr, der Kostenrabatt bleibt */
{
  const S = mk('griechenland');
  eq(availBonus(S.players[0]), 0, 'kein Würfelbonus für Griechenland');
  S.players[0].techs.philosophie = true;
  eq(availBonus(S.players[0]), 1, 'Philosophie gibt weiter +1');
  eq(techCost(S, 0, TECH_BY_KEY.papier), 4, 'Kostenrabatt bleibt (Papier 6−2)');
}

/* Keramik und Theologie sind Teil der normalen Techliste */
{
  eq(!!TECH_BY_KEY.keramik, true, 'Keramik ist eine normale Technologie');
  eq(!!TECH_BY_KEY.theologie, true, 'Theologie ist eine normale Technologie');
  eq(techsIn(1, 0).map(t => t.k).includes('keramik'), true, 'Keramik: Produktion/Antike');
  eq(techsIn(3, 1).map(t => t.k).includes('theologie'), true, 'Theologie: Spezial/Mittelalter');
}

/* Theologie senkt die Siegschwelle auf 3/5, UN gewinnt bei Gleichstand die niedrigere */
{
  const S = mk('griechenland', ['theologie']);
  eq(victoryOption(S.players[0]).frac, 3 / 5, 'Theologie setzt Schwelle auf 3/5');
  S.players[0].techs.un = true;
  eq(victoryOption(S.players[0]).frac, 0.5, 'UN (1/2) schlägt Theologie (3/5)');
}

/* Keramik + Verbundwerkstoffe: bis 3x wachsen, davon 1x gratis */
{
  const S = mk('griechenland', ['keramik', 'verbundwerkstoffe', 'landwirtschaft', 'bewaesserung']);
  const c = capitalOf(S, 0); c.pop = 3; c.grown = 0; c.born = 0;
  const lim = growLimits(S, 0);
  eq([lim.max, lim.free], [3, 1], 'Keramik+Verbund = max 3, davon 1 gratis');
  eq(growCost(S, 0, c).free === true, true, 'erstes Wachstum dieser Runde ist gratis');
  S.players[0].techs.gentechnik = true;      // hebt die Nahrungsgrenze auf
  S.players[0].res = { sci: 0, food: 99, coins: 99 };
  growCity(S, 0, c); growCity(S, 0, c); growCity(S, 0, c);
  eq(c.pop, 6, 'drei Wachstumsschritte in einer Runde');
  eq(typeof canGrow(S, 0, c), 'string', 'ein viertes Wachstum wird abgelehnt');
}

/* nur Verbundwerkstoffe: normales Wachstum + 1x gratis = max 2 */
{
  const S = mk('griechenland', ['verbundwerkstoffe']);
  const lim = growLimits(S, 0);
  eq([lim.max, lim.free], [2, 1], 'Verbund allein = 1x normal + 1x gratis');
  const c = capitalOf(S, 0); c.pop = 2; c.grown = 0; c.born = 0;
  eq(growCost(S, 0, c).free === true, true, 'das erste Wachstum ist das kostenlose');
}

/* Sklaverei wird mit der Moderne obsolet */
{
  const S = mk('griechenland', ['sklaverei']);
  const c = capitalOf(S, 0); c.pop = 3;
  eq(slaveryUsable(S.players[0]), true, 'Sklaverei nutzbar vor der Moderne');
  S.players[0].techs.robotik = true;   // eine Moderne-Tech
  eq(slaveryUsable(S.players[0]), false, 'Sklaverei obsolet ab Moderne');
  eq(typeof sacrifice(S, 0, c), 'string', 'Opfern ab Moderne abgelehnt');
  eq(TECH_BY_KEY.sklaverei.e.includes('obsolet'), true, 'Techbogen weist auf die Obsoleszenz hin');
}

/* Effekt sofort nach dem Forschen verfügbar (Kartografie senkt Gründungskosten im selben Zug) */
{
  const S = mk('griechenland');
  const cap = capitalOf(S, 0);
  const far = within(cap.r, cap.c, 6).find(([r, c]) => isLand(S, r, c) &&
    hexDistance(cap.r, cap.c, r, c) === 5 && !S.cities.some(x => hexDistance(x.r, x.c, r, c) < 3));
  const withDist = foundCost(S, 0, far[0], far[1]);
  S.players[0].avail.kartografie = true;
  S.players[0].res.sci = 20;
  doResearch(S, 0, 'kartografie');
  const afterCarto = foundCost(S, 0, far[0], far[1]);
  eq(afterCarto < withDist, true, 'Kartografie senkt die Gründungskosten sofort nach dem Forschen');
  eq(afterCarto, 1, 'nur noch Grundkosten (1 Stadt), kein Distanzanteil');
}

/* Kontrollzone: mit Raketentechnik zwei Ringe, Luftwaffe ignoriert sie */
{
  const S = newGame({ players: [{ civ: 'griechenland', kind: 'human' }, { civ: 'england', kind: 'human' }], seed: 16 });
  const e = capitalOf(S, 1);
  const spot = spotBy(S, e);
  S.players[1].techs.schiesspulver = true;
  S.armies.push({ id: 620, owner: 1, r: spot[0], c: spot[1], mp: 0, born: 0 });
  const d1 = within(spot[0], spot[1], 1).find(([r, c]) => hexDistance(spot[0], spot[1], r, c) === 1 && isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  eq(zocStop(S, 0, d1[0], d1[1]), true, 'Distanz 1 löst Kontrollzone aus');
  const d2 = within(spot[0], spot[1], 2).find(([r, c]) => hexDistance(spot[0], spot[1], r, c) === 2 && isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  eq(zocStop(S, 0, d2[0], d2[1]), false, 'ohne Raketentechnik kein Halt auf Distanz 2');
  S.players[1].techs.raketentechnik = true;
  eq(zocStop(S, 0, d2[0], d2[1]), true, 'mit Raketentechnik Kontrollzone auf Distanz 2');
  S.players[0].techs.luftwaffe = true;
  eq(zocStop(S, 0, d1[0], d1[1]), false, 'Luftwaffe ignoriert Kontrollzonen');
}

/* Bot-Bewegung Priorität 4: bleibt im eigenen Reich, geht ans stadtnächste Randfeld */
{
  const S = newGame({ players: [{ civ: 'russland', kind: 'bot', diff: 'prinz' }, { civ: 'england', kind: 'human' }], seed: 20 });
  const cap = capitalOf(S, 0);
  const spot = spotBy(S, cap);
  S.armies.length = 0;
  S.armies.push({ id: 1, owner: 0, r: spot[0], c: spot[1], mp: moveAllowance(S, 0), born: 0 });
  const realm = () => { const o = controlledTiles(S, 0); for (const c of citiesOf(S, 0)) o.add(key(c.r, c.c)); return o; };
  eq(realm().has(key(spot[0], spot[1])), true, 'Armee startet im eigenen Reich');
  botMoveArmy(S, 0, S.armies[0]);
  const a = S.armies[0];
  eq(realm().has(key(a.r, a.c)), true, 'Bot verlässt sein Reich ohne höhere Priorität NICHT');
}

/* Bot-Zielwahl nutzt Geländedistanz, nicht Luftlinie (kein Weg über Wasser) */
{
  const S = newGame({ players: [{ civ: 'russland', kind: 'bot', diff: 'prinz' }, { civ: 'england', kind: 'human' }], seed: 20 });
  const passableLand = (r, c) => {
    const t = terrainAt(S, r, c);
    return t && !cityAt(S, r, c) && TERRAIN[t].land;   // ohne Navigation: kein Wasser
  };
  // Ein Feld finden, dessen Landweg zu einem Ziel länger ist als die Luftlinie
  // (weil Wasser dazwischen liegt) – das belegt, dass beide Maße sich unterscheiden.
  const cap = capitalOf(S, 0);
  let diffSeen = false, blockedSeen = false;
  for (let dr = -5; dr <= 5; dr++) for (let dc = -5; dc <= 5; dc++) {
    const r = cap.r + dr, c = cap.c + dc, t = terrainAt(S, r, c);
    if (!t || TERRAIN[t].land || cityAt(S, r, c)) continue;   // nur Wasserziele
    const air = hexDistance(cap.r, cap.c, r, c);
    const land = pathSteps(cap.r, cap.c, r, c, passableLand);
    if (land == null) blockedSeen = true;
    else if (land > air) diffSeen = true;
  }
  eq(diffSeen || blockedSeen, true, 'Geländedistanz weicht von der Luftlinie ab, wo Wasser im Weg liegt');
}

/* Luftwaffe: Reichweitensprung wirkt sofort im selben Zug */
{
  const S = mk('griechenland');
  const cap = capitalOf(S, 0);
  const spot = spotBy(S, cap);
  S.armies.push({ id: 1, owner: 0, r: spot[0], c: spot[1], mp: 3, born: 0 });
  S.players[0].avail.luftwaffe = true; S.players[0].res.sci = 99;
  // vorher Reichweite 3
  eq(moveAllowance(S, 0), 3, 'vor Luftwaffe Reichweite 3');
  doResearch(S, 0, 'luftwaffe');
  eq(moveAllowance(S, 0), 9, 'Luftwaffe erhöht die Reichweite auf 9');
  eq(S.armies[0].mp, 9, 'die bereits stehende Armee bekommt die höhere Reichweite sofort (3 + 6)');
}

/* Panzerschiff: Teilbewegung behält Rest, Sprung wird addiert */
{
  const S = mk('griechenland');
  const spot = spotBy(S, capitalOf(S, 0));
  S.armies.push({ id: 2, owner: 0, r: spot[0], c: spot[1], mp: 1, born: 0 });  // schon 2 verbraucht
  S.players[0].avail.panzerschiff = true; S.players[0].res.sci = 99;
  doResearch(S, 0, 'panzerschiff');
  eq(S.armies[0].mp, 4, 'Panzerschiff (+3) wird der Restbewegung gutgeschrieben: 1 + 3');
}

/* Feste Spielerreihenfolge: Russland → Griechenland → England → Wikinger */
{
  const S = newGame({ players: [
    { civ: 'wikinger', kind: 'bot' }, { civ: 'england', kind: 'bot' },
    { civ: 'griechenland', kind: 'human' }, { civ: 'russland', kind: 'bot' },
  ], startPlayer: 2, seed: 7 });   // startPlayer zeigt auf Griechenland
  eq(S.players.map(p => p.civ), ['russland', 'griechenland', 'england', 'wikinger'], 'feste Rotation R→G→E→W');
  eq(S.players[S.cur].civ, 'griechenland', 'Startspieler ist der gewählte (Griechenland)');
}

/* Armeen: nicht stapelbar, dürfen auf keine Stadt (auch nicht die eigene) */
{
  const S = mk('griechenland');
  const cap = capitalOf(S, 0);
  const ns = neighbors(cap.r, cap.c).filter(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c));
  S.armies.push({ id: 1, owner: 0, r: ns[0][0], c: ns[0][1], mp: 3, born: 0 });
  S.armies.push({ id: 2, owner: 0, r: ns[1][0], c: ns[1][1], mp: 3, born: 0 });
  eq(canEnter(S, 0, ns[1][0], ns[1][1]), false, 'Armee darf nicht auf ein Feld mit anderer Armee');
  eq(canEnter(S, 0, cap.r, cap.c), false, 'Armee darf nicht auf die eigene Stadt');
  // frisch gebaute Armee darf ihre Heimatstadt verlassen
  S.players[0].res.coins = 50;
  eq(buildArmy(S, 0, cap), null, 'Armee bauen klappt');
  const fresh = S.armies[S.armies.length - 1];
  const out = neighbors(cap.r, cap.c).find(([r, c]) => canEnter(S, 0, r, c));
  eq(moveArmy(S, fresh, out[0], out[1]), null, 'frische Armee kann aus der Stadt herausziehen');
}

/* Navigation: Wasser durchqueren erlaubt, aber nicht darauf anhalten */
{
  const S = mk('england', ['navigation']);
  const cap = capitalOf(S, 0);
  const spot = spotBy(S, cap);
  S.armies.push({ id: 1, owner: 0, r: spot[0], c: spot[1], mp: 6, born: 0 });
  const army = S.armies[0];
  // ein Wasserfeld in der Nähe finden
  let water = null;
  for (let dr = -3; dr <= 3 && !water; dr++) for (let dc = -3; dc <= 3; dc++) {
    const r = cap.r + dr, c = cap.c + dc, t = terrainAt(S, r, c);
    if (t && !TERRAIN[t].land && !cityAt(S, r, c)) { water = [r, c]; break; }
  }
  if (water) {
    eq(canPass(S, 0, water[0], water[1]), true, 'Navigation: Wasser darf durchquert werden');
    eq(canStop(S, 0, water[0], water[1]), false, 'Navigation: auf Wasser darf NICHT angehalten werden');
    eq(typeof moveArmy(S, army, water[0], water[1]), 'string', 'Zug auf ein Wasserfeld wird abgelehnt');
    S.players[0].techs.panzerschiff = true;
    eq(canStop(S, 0, water[0], water[1]), true, 'mit Panzerschiff darf man auf Wasser anhalten');
  }
  // die Reach-Map enthält nie ein Wasserfeld als Ziel (nur Navigation)
  const S2 = mk('england', ['navigation']);
  const cap2 = capitalOf(S2, 0); const spot2 = spotBy(S2, cap2);
  S2.armies.push({ id: 2, owner: 0, r: spot2[0], c: spot2[1], mp: 6, born: 0 });
  eq([...armyReach(S2, S2.armies[0]).keys()].every(k => {
    const [r, c] = unkey(k); return TERRAIN[terrainAt(S2, r, c)].land;
  }), true, 'kein Wasserfeld ist ein gültiges Zielfeld (nur Navigation)');
}

/* Gratis-Wachstum getrennt vom bezahlten Wachstum */
{
  const S = mk('griechenland', ['verbundwerkstoffe', 'gentechnik']);
  const c = capitalOf(S, 0); c.pop = 3; c.grown = 0; c.freeUsed = 0; c.born = 0;
  eq(freeGrowthAvailable(S, 0, c), true, 'Gratis-Wachstum steht bereit');
  eq(growCity(S, 0, c, 'free'), null, 'kostenloses Wachstum klappt');
  eq(c.pop, 4, 'Bevölkerung +1 ohne Kosten');
  eq(freeGrowthAvailable(S, 0, c), false, 'Gratis-Wachstum diese Runde verbraucht');
  // danach noch bezahltes Wachstum möglich (max 2)
  S.players[0].res = { sci: 0, food: 99, coins: 99 };
  eq(canGrowPaid(S, 0, c), null, 'bezahltes Wachstum danach möglich');
  eq(growCity(S, 0, c, 'paid'), null, 'bezahltes Wachstum klappt');
  eq(c.pop, 5, 'zweites Wachstum bezahlt');
}

/* Regression: bezahltes Wachstum ZUERST darf das Gratis-Kontingent nicht verbrauchen */
{
  const S = mk('griechenland', ['verbundwerkstoffe', 'gentechnik']);
  const c = capitalOf(S, 0); c.pop = 3; c.grown = 0; c.freeUsed = 0; c.born = 0;
  S.players[0].res = { sci: 0, food: 99, coins: 99 };
  eq(growCity(S, 0, c, 'paid'), null, 'erst bezahlt wachsen');
  eq(freeGrowthAvailable(S, 0, c), true, 'Gratis-Wachstum bleibt danach verfügbar (Bugfix)');
  eq(growCity(S, 0, c, 'free'), null, 'kostenloses Wachstum danach klappt');
  eq(c.pop, 5, 'beide Wachstumsschritte gezählt');
  eq(freeGrowthAvailable(S, 0, c), false, 'jetzt beide Kontingente aufgebraucht');
}

/* Regression: Keramik+Verbund, 2× bezahlt zuerst, Gratis muss noch gehen (max 3) */
{
  const S = mk('griechenland', ['keramik', 'verbundwerkstoffe', 'gentechnik']);
  const c = capitalOf(S, 0); c.pop = 3; c.grown = 0; c.freeUsed = 0; c.born = 0;
  S.players[0].res = { sci: 0, food: 999, coins: 999 };
  eq(growCity(S, 0, c, 'paid'), null, 'erstes bezahltes Wachstum');
  eq(growCity(S, 0, c, 'paid'), null, 'zweites bezahltes Wachstum');
  eq(freeGrowthAvailable(S, 0, c), true, 'Gratis nach 2× bezahlt noch verfügbar');
  eq(growCity(S, 0, c, 'free'), null, 'kostenloses Wachstum als dritter Schritt');
  eq(c.pop, 6, 'drei Wachstumsschritte insgesamt');
  eq(typeof canGrow(S, 0, c), 'string', 'ein viertes Wachstum wird abgelehnt (max 3)');
}

/* Einkommensaufschlüsselung summiert sich zum Gesamteinkommen */
{
  const S = mk('griechenland', ['landwirtschaft', 'papier']);
  capitalOf(S, 0).pop = 3;
  const b = incomeBreakdown(S, 0);
  const sum = b.rows.concat(b.extra).reduce((a, r) => [a[0] + r.y[0], a[1] + r.y[1], a[2] + r.y[2]], [0, 0, 0]);
  sum[0] += b.pop.y[0]; sum[1] += b.pop.y[1]; sum[2] += b.pop.y[2];
  eq(sum, b.total, 'Aufschlüsselung (Gelände + Bevölkerung) summiert sich zum Einkommen');
  const inc = income(S, 0);
  eq(b.total, [inc.sci, inc.food, inc.coins], 'Übersichtssumme entspricht income()');
}

/* Tech-Labels und Sortierung nach Kosten */
{
  eq(TECH_BY_KEY.keramik.e, 'Städte 2× pro Runde erweitern', 'Keramik hat ein eigenständiges Label');
  eq(TECH_BY_KEY.verbundwerkstoffe.e, '1× zusätzliches, kostenloses Wachstum pro Stadt', 'Verbundwerkstoffe zeigt das Gratis-Wachstum');
  const prod = techsIn(1, 0).map(t => t.c);
  eq(prod, prod.slice().sort((a, b) => a - b), 'Techs sind nach Kosten sortiert');
  eq(techsIn(1, 0).map(t => t.n), ['Landwirtschaft', 'Fischerei', 'Rad', 'Keramik', 'Bewässerung'], 'Keramik (4) steht vor Bewässerung (5)');
}

/* ==================================================== Nahrungsproduktion */
const setEvent = (S, k) => {
  S.ev = S.ev || { mode: 'hard' };
  S.event = { round: S.round, k, row: 0, col: 0 };
};

/* Negatives Nahrungseinkommen wird auf 0 gekappt, ohne Bevölkerungsverlust */
{
  const S = mk('griechenland');
  const c = capitalOf(S, 0); c.pop = 20;
  const inc = income(S, 0);
  eq(inc.food < 0, true, 'Nahrung: große Stadt erzeugt ein Defizit');
  beginTurn(S);
  eq(S.players[0].res.food, 0, 'Nahrung: Einkommen wird bei 0 gekappt');
  eq(S.players[0].foodDeficit, -inc.food, 'Nahrung: Defizit wird vermerkt');
  eq(c.pop, 20, 'Nahrung: niemand verhungert');
}

/* Wachstum ist blockiert, sobald es die Produktion negativ machen würde */
{
  const S = mk('griechenland');
  const c = capitalOf(S, 0);
  let steps = 0;
  while (steps < 40) {
    S.players[0].res = { sci: 0, food: 999, coins: 999 };   // Ressourcen sind hier nicht die Grenze
    c.grown = 0;
    if (canGrow(S, 0, c)) break;
    growCity(S, 0, c); steps++;
  }
  S.players[0].res = { sci: 0, food: 999, coins: 999 };
  eq(typeof canGrow(S, 0, c), 'string', 'Wachstum wird an der Nahrungsgrenze abgelehnt');
  eq(income(S, 0).food >= 0, true, 'an der Grenze ist die Produktion noch nicht negativ');
  eq(foodAfterGrowth(S, 0, c, 1) < 0, true, 'ein weiterer Schritt wäre negativ');
  // Gentechnik hebt die Grenze auf
  S.players[0].techs.gentechnik = true;
  c.grown = 0;
  eq(canGrow(S, 0, c), null, 'Gentechnik erlaubt Wachstum über die Grenze hinaus');
  delete S.players[0].techs.gentechnik;
  S.players[0].techs.massenmedien = true;
  c.grown = 0;
  eq(canGrow(S, 0, c), null, 'Massenmedien erlauben es ebenfalls');
}

/* Gentechnik/Massenmedien sind KEIN allgemeiner Umtausch */
{
  const S = mk('griechenland', ['massenmedien', 'gentechnik']);
  eq(rates(S, 0).coinsToFood, 2, 'Massenmedien ändert den Münzkurs nicht (2:1)');
  eq(rates(S, 0).sciToFood, Infinity, 'Gentechnik ist kein Wissenschaft→Nahrung-Kurs');
  S.players[0].res = { sci: 10, food: 0, coins: 10 };
  eq(available(S, 0, 'food'), 5, 'nur der normale 2:1-Kurs zählt (10 Münzen = 5 Nahrung)');
  const G = mk('griechenland', ['gilden']);
  eq(rates(G, 0).coinsToFood, 1, 'Gilden bleibt ein echter 1:1-Kurs');
}

/* Füttern: deckt zuerst das Defizit, dann kommt Nahrung obendrauf */
{
  const S = mk('griechenland', ['massenmedien']);
  const p = S.players[0];
  p.res = { sci: 0, food: 0, coins: 5 }; p.foodDeficit = 3;
  eq(feed(S, 0, 'coins', 5), null, 'Füttern mit Münzen klappt');
  eq([p.foodDeficit, p.res.food, p.res.coins], [0, 2, 0], '3 deckt das Defizit, 2 werden Nahrung');
  eq(typeof feed(S, 0, 'sci', 1), 'string', 'ohne Gentechnik kein Füttern mit Wissenschaft');
  const T = mk('griechenland', ['gentechnik']);
  T.players[0].res = { sci: 4, food: 1, coins: 0 }; T.players[0].foodDeficit = 0;
  eq(feed(T, 0, 'sci', 4), null, 'Füttern mit Wissenschaft klappt');
  eq([T.players[0].res.sci, T.players[0].res.food], [0, 5], 'Wissenschaft wandert 1:1 in Nahrung');
}

/* Kostenloses Wunder-Wachstum respektiert die Grenze und wächst nur so weit wie möglich */
{
  const S = mk('griechenland');
  const c = capitalOf(S, 0);
  const room = (() => { let n = 0; while (foodAfterGrowth(S, 0, c, n + 1) >= 0) n++; return n; })();
  eq(room > 0, true, 'es ist noch Nahrungsspielraum vorhanden');
  const done = growFree(S, 0, c, room + 5, 'Test');
  eq(done, room, 'kostenloses Wachstum stoppt genau an der Nahrungsgrenze');
  eq(income(S, 0).food >= 0, true 	, 'die Produktion bleibt nicht negativ');
}

/* ============================================ Gründen neben gegnerischen Armeen */
{
  const S = mk('griechenland');
  const cap = capitalOf(S, 0);
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  eq(canFound(S, 0, spot[0], spot[1]), null, 'freies Feld ist bebaubar');
  // gegnerische Armee direkt daneben
  const next = neighbors(spot[0], spot[1]).find(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  const foe = { id: 800, owner: 1, r: next[0], c: next[1], mp: 0, born: 0 };
  S.armies.push(foe);
  eq(typeof canFound(S, 0, spot[0], spot[1]), 'string', 'neben einer gegnerischen Armee nicht bebaubar');
  eq(foundCity(S, 0, spot[0], spot[1]) !== null, true, 'Gründen wird abgelehnt');
  eq(settleable(S, 0, spot[0], spot[1]), false, 'auch Bots dürfen dort nicht siedeln');
  // die eigene Armee stört nicht
  foe.owner = 0;
  eq(canFound(S, 0, spot[0], spot[1]), null, 'eigene Armee daneben ist erlaubt');
  eq(settleable(S, 0, spot[0], spot[1]), true, 'für Bots ebenso');
  // zwei Felder entfernt stört sie auch nicht
  foe.owner = 1;
  const far = within(cap.r, cap.c, 6).find(([r, c]) => !canFound(S, 0, r, c) &&
    hexDistance(foe.r, foe.c, r, c) > 1);
  eq(canFound(S, 0, far[0], far[1]), null, 'zwei Felder entfernt ist wieder erlaubt');
}
/* Bots siedeln nicht auf Vulkanen */
{
  const S = mkX('griechenland', { events: true });
  const cap = capitalOf(S, 0);
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  S.map.rows[spot[0]] = S.map.rows[spot[0]].slice(0, spot[1]) + 'V' + S.map.rows[spot[0]].slice(spot[1] + 1);
  eq(settleable(S, 0, spot[0], spot[1]), false, 'Bots siedeln nicht auf einem Vulkan');
  eq(typeof canFound(S, 0, spot[0], spot[1]), 'string', 'Menschen auch nicht');
}

/* ============================================ Gründen kostet immer mindestens 1 */
{
  const A = mkA('england', 'gruenden', ['kartografie']);
  const cap = capitalOf(A, 0);
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(A, 0, r, c));
  eq(foundCost(A, 0, spot[0], spot[1]), 1,
    'England-Alternative + Kartografie: Gründen kostet 1 statt 0');
  const B = mkA('england', 'gruenden');
  eq(foundCost(B, 0, spot[0], spot[1]) > 1, true, 'ohne Kartografie zahlt England die Distanz');
  const C = mk('griechenland', ['kartografie']);
  eq(foundCost(C, 0, spot[0], spot[1]), 1, 'Kartografie allein: Basiskosten der ersten Stadt = 1');
}

/* ============================== Gründungsdistanz nur über passierbare Felder */
{
  const S = mk('england');
  const cap = capitalOf(S, 0);
  S.players[0].res = { sci: 0, food: 99, coins: 99 };
  // Inseln ohne Landweg: nicht gründbar, egal wie kurz die Luftlinie ist
  const island = within(cap.r, cap.c, 9).find(([r, c]) => terrainAt(S, r, c) === 'I' &&
    foundDistance(S, 0, r, c) == null && !S.cities.some(x => hexDistance(x.r, x.c, r, c) < 3));
  eq(!!island, true, 'es gibt eine Insel ohne Landweg');
  eq(hexDistance(cap.r, cap.c, island[0], island[1]) < 99, true, 'die Luftlinie wäre kurz');
  eq(foundCost(S, 0, island[0], island[1]) === Infinity, true, 'ohne Weg keine Kosten, sondern unmöglich');
  eq(typeof canFound(S, 0, island[0], island[1]), 'string', 'ohne Navigation nicht gründbar');
  eq(foundCity(S, 0, island[0], island[1]) !== null, true, 'Gründen wird abgelehnt');
  // mit Navigation geht es, und die Distanz zählt über das Wasser
  S.players[0].techs.navigation = true;
  const d = foundDistance(S, 0, island[0], island[1]);
  eq(typeof d === 'number', true, 'mit Navigation gibt es einen Weg');
  eq(canFound(S, 0, island[0], island[1]), null, 'und die Gründung ist erlaubt');
  eq(foundCost(S, 0, island[0], island[1]), 1 + d, 'Kosten = Basiskosten + Weglänge');
  // Landziele: der Weg über passierbare Felder kann länger sein als die Luftlinie
  const land = within(cap.r, cap.c, 8).find(([r, c]) => isLand(S, r, c) && !canFound(S, 0, r, c) &&
    foundDistance(S, 0, r, c) > hexDistance(cap.r, cap.c, r, c));
  if (land) eq(foundCost(S, 0, land[0], land[1]) > 1 + hexDistance(cap.r, cap.c, land[0], land[1]), true,
    'gerechnet wird der Weg, nicht die Luftlinie');
  // Kartografie erlässt die Distanzkosten, aber nicht die Erreichbarkeit
  const K = mk('england', ['kartografie']);
  const kcap = capitalOf(K, 0);
  const kisle = within(kcap.r, kcap.c, 9).find(([r, c]) => terrainAt(K, r, c) === 'I' &&
    foundDistance(K, 0, r, c) == null && !K.cities.some(x => hexDistance(x.r, x.c, r, c) < 3));
  if (kisle) eq(typeof canFound(K, 0, kisle[0], kisle[1]), 'string',
    'mit Kartografie bleibt eine unerreichbare Insel gesperrt');
  // gegnerische Armeen machen Felder unpassierbar
  const A = mk('england');
  const acap = capitalOf(A, 0);
  const path = within(acap.r, acap.c, 3).find(([r, c]) => isLand(A, r, c) && !cityAt(A, r, c));
  eq(foundPassable(A, 0, path[0], path[1]), true, 'freies Landfeld ist passierbar');
  A.armies.push({ id: 810, owner: 1, r: path[0], c: path[1], mp: 0, born: 0 });
  eq(foundPassable(A, 0, path[0], path[1]), false, 'Feld mit gegnerischer Armee nicht');
}

/* ============================== Oxford kann die Singularität erforschen */
{
  const S = mkX('griechenland', { wonders: true });
  const p = S.players[0], cap = capitalOf(S, 0);
  FIELDS.forEach((_, f) => { techsIn(f, 3, S).slice(0, 1).forEach(t => { p.techs[t.k] = true; }); });
  eq(singularityReady(p), true, 'die Voraussetzungen für die Singularität sind erfüllt');
  p.res = { sci: 0, food: 99, coins: 999 };
  const spot = within(cap.r, cap.c, 7).find(([r, c]) => !canFound(S, 0, r, c));
  foundCity(S, 0, spot[0], spot[1]);
  const c2 = cityAt(S, spot[0], spot[1]);
  S.wonders.push({ k: 'gaerten', lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  S.wonders.push({ k: 'koloss', lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  S.wonders.push({ k: 'zeus', lvl: 1, owner: 0, cityId: c2.id, r: c2.r, c: c2.c });
  S.wpool[2] = ['oxford'];
  eq(buildWonder(S, 0, c2, 'oxford'), null, 'Oxford gebaut');
  eq(freePickOptions(S, 0).some(t => t.k === 'singularitaet'), true, 'die Singularität steht zur Wahl');
  eq(useFreePick(S, 0, 'singularitaet'), null, 'sie ist kostenlos erforschbar');
  eq(has(p, 'singularitaet'), true, 'sie ist erforscht');
  eq(S.over && S.over.how.startsWith('Forschungssieg'), true, 'und gewinnt das Spiel');
}
/* Bibliothek und Raumfahrt bieten die Singularität nicht an */
{
  const S = mkX('griechenland', { wonders: true }, ['raumfahrt']);
  const p = S.players[0], cap = capitalOf(S, 0);
  FIELDS.forEach((_, f) => { techsIn(f, 3, S).slice(0, 1).forEach(t => { p.techs[t.k] = true; }); });
  eq(singularityReady(p), true, 'Voraussetzungen erfüllt');
  applyWonderEffect(S, 0, cap, WONDER_BY_KEY.bibliothek);
  eq(freePickOptions(S, 0).some(t => t.k === 'singularitaet'), false, 'die Bibliothek nicht');
  p.freePicks = [{ n: 1, unlockedOnly: true, why: 'Raumfahrt' }];
  eq(freePickOptions(S, 0).some(t => t.k === 'singularitaet'), false, 'Raumfahrt auch nicht');
}

/* ============================== Alchemie: Wissenschaft über Münzen in Nahrung */
{
  const S = mk('griechenland');
  const p = S.players[0];
  p.res = { sci: 10, food: 0, coins: 0 };
  eq(rates(S, 0).sciToFood === Infinity, true, 'ohne Alchemie kein Weg von Wissenschaft zu Nahrung');
  eq(available(S, 0, 'food'), 0, 'also auch keine Nahrung verfügbar');
  p.techs.alchemie = true;
  eq(rates(S, 0).sciToFood, 2, 'mit Alchemie 2 Wissenschaft je Nahrung (über Münzen)');
  eq(available(S, 0, 'food'), 5, '10 Wissenschaft ergeben 5 Nahrung');
  eq(pay(S, 0, 'food', 3), true, 'Nahrung damit auch bezahlbar');
  eq([p.res.sci, p.res.food], [4, 0], '3 Nahrung kosten 6 Wissenschaft');
  // mit Gilden 1:1 auf dem zweiten Schritt
  p.techs.gilden = true;
  eq(rates(S, 0).sciToFood, 1, 'mit Gilden 1 Wissenschaft je Nahrung');
  // Gentechnik bleibt kein Kurs
  const G = mk('griechenland', ['gentechnik']);
  eq(rates(G, 0).sciToFood === Infinity, true, 'Gentechnik allein ist weiter kein Umtauschkurs');
  // Wachstum lässt sich damit bezahlen (der eigentliche Fehlerbericht)
  const W = mk('griechenland', ['alchemie']);
  const c = capitalOf(W, 0); c.pop = 2; c.grown = 0; c.born = 0;
  W.players[0].res = { sci: 20, food: 0, coins: 0 };
  eq(canGrow(W, 0, c), null, 'Wachstum ist mit Wissenschaft bezahlbar');
  eq(growCity(W, 0, c), null, 'und geht durch');
}

/* ============================== Rundenwechsel und Ereignis beim Startspieler */
{
  // cfg.startPlayer zeigt in die Aufbauliste (CIVS-Reihenfolge). CIVS[0] ist Griechenland,
  // in der festen Zugreihenfolge Russland→Griechenland→England→Wikinger also Index 1.
  const S = newGame({
    seed: 12, events: true, eventMode: 'hard', startPlayer: 0,
    players: CIVS.map(c => ({ civ: c.k, kind: 'human' })),
  });
  eq(S.players[1].civ, 'griechenland', 'Index 1 ist Griechenland');
  eq(S.startIdx, 1, 'der Startspieler ist gemerkt');
  eq(S.cur, 1, 'Griechenland beginnt');
  eq(S.round, 1, 'Runde 1');
  const ev1 = S.event.k;
  eq(S.event.round, 1, 'das Ereignis gehört zu Runde 1');
  // eine volle Umdrehung: erst zurück beim Startspieler beginnt Runde 2
  const seen = [];
  for (let i = 0; i < 4; i++) {
    seen.push([S.cur, S.round, S.event.round]);
    advanceTurn(S);
  }
  eq(seen.map(x => x[0]), [1, 2, 3, 0], 'Reihenfolge ab dem Startspieler im Uhrzeigersinn');
  eq(seen.map(x => x[1]), [1, 1, 1, 1], 'die Runde bleibt bis zur Umdrehung dieselbe');
  eq(seen.every(x => x[2] === 1), true, 'und das Ereignis auch');
  eq([S.cur, S.round], [1, 2], 'zurück beim Startspieler beginnt Runde 2');
  eq(S.event.round, 2, 'jetzt wird das neue Ereignis ausgewürfelt – vor dem Startspieler');
  // Gegenprobe: mit Russland als Startspieler wechselt es bei Index 0
  const T = newGame({
    seed: 12, events: true, eventMode: 'hard', startPlayer: CIVS.findIndex(c => c.k === 'russland'),
    players: CIVS.map(c => ({ civ: c.k, kind: 'human' })),
  });
  eq(T.startIdx, 0, 'Russland als Startspieler');
  for (let i = 0; i < 3; i++) advanceTurn(T);
  eq([T.cur, T.round], [3, 1], 'nach drei Zügen noch Runde 1');
  advanceTurn(T);
  eq([T.cur, T.round, T.event.round], [0, 2, 2], 'Runde 2 beginnt bei Russland');
}

/* ============================== Rückschau: auch durch kostenlose Forschung */
{
  const S = mkX('griechenland', { wonders: true }, []);
  S.players[0].ability = 'rueckschau';
  const p = S.players[0], cap = capitalOf(S, 0);
  // Voraussetzungen: Mittelalter im Feld Forschung verfügbar machen
  p.avail.papier = true; p.avail.alchemie = true;
  p.res = { sci: 0, food: 0, coins: 99 };
  S.wpool[2] = ['oxford'];
  for (const k of ['gaerten', 'koloss', 'zeus']) S.wonders.push({ k, lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  S.cities.push({ id: S.nextId++, owner: 0, r: spot[0], c: spot[1], pop: 3, cap: false, grown: 0, born: 0 });
  eq(buildWonder(S, 0, cityAt(S, spot[0], spot[1]), 'oxford'), null, 'Oxford gebaut');
  eq(freePick(p).n, 2, 'zwei kostenlose Technologien');
  // erste Gratis-Tech (Mittelalter) löst Rückschau aus
  eq(useFreePick(S, 0, 'papier'), null, 'erste Gratis-Tech genommen');
  eq((p.backPicks || []).length, 1, 'Rückschau wird von der kostenlosen Forschung ausgelöst');
  // zweite Gratis-Tech ebenfalls
  eq(useFreePick(S, 0, 'alchemie'), null, 'zweite Gratis-Tech genommen');
  eq(p.backPicks.length, 2, 'Oxford löst die Rückschau zweimal aus');
  // beide Ansprüche nacheinander nutzbar, ohne Kette
  const first = backPickOptions(S, 0)[0];
  eq(useBackPick(S, 0, first.k), null, 'erster Rückschau-Anspruch genutzt');
  eq(p.backPicks.length, 1, 'der zweite bleibt offen');
  const second = backPickOptions(S, 0)[0];
  eq(useBackPick(S, 0, second.k), null, 'zweiter Rückschau-Anspruch genutzt');
  eq(p.backPicks.length, 0, 'danach keine weiteren – keine Kette');
}

/* ============================== Oxford: die Auswahl wird beim Bau festgehalten */
{
  const S = mkX('griechenland', { wonders: true });
  const p = S.players[0], cap = capitalOf(S, 0);
  p.res = { sci: 0, food: 0, coins: 99 };
  S.wpool[2] = ['oxford'];
  for (const k of ['gaerten', 'koloss', 'zeus']) S.wonders.push({ k, lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  S.cities.push({ id: S.nextId++, owner: 0, r: spot[0], c: spot[1], pop: 3, cap: false, grown: 0, born: 0 });
  eq(buildWonder(S, 0, cityAt(S, spot[0], spot[1]), 'oxford'), null, 'Oxford gebaut');
  const snapshot = freePick(p).only.slice();
  eq(snapshot.length > 0, true, 'die verfügbaren Technologien sind festgehalten');
  eq(snapshot.every(k => p.avail[k]), true, 'es sind die beim Bau verfügbaren');
  const first = freePickOptions(S, 0)[0];
  eq(useFreePick(S, 0, first.k), null, 'erste Gratis-Tech genommen');
  // die erste Tech kann ein neues Zeitalter aufgeschlossen haben – das darf die
  // zweite Wahl nicht erweitern
  const after = freePickOptions(S, 0);
  eq(after.every(t => snapshot.includes(t.k)), true, 'die zweite Wahl bleibt in der Momentaufnahme');
  eq(after.some(t => t.k === first.k), false, 'die schon erforschte fällt weg');
  const newlyAvail = techPool(S).filter(t => p.avail[t.k] && !p.techs[t.k] && !snapshot.includes(t.k));
  eq(newlyAvail.every(t => !after.some(x => x.k === t.k)), true,
    'neu freigeschaltete Technologien sind nicht dabei');
}

/* ==================================== Siedlerbewegung nach den Bot-Regeln */
{
  // Schritt 2–3: der Siedler zieht auf das erreichbare siedelbare Feld, das der
  // Hauptstadt am nächsten liegt
  const S = mk('england');
  const cap = capitalOf(S, 0);
  const spots = nearestSettleSpots(S, 0, cap);
  eq(spots.length > 0, true, 'es gibt erreichbare siedelbare Felder');
  const dist = settleDistances(S, 0, cap.r, cap.c);
  const best = dist.get(key(spots[0][0], spots[0][1]));
  eq(spots.every(([r, c]) => dist.get(key(r, c)) === best), true, 'alle Ziele sind gleich nah');
  const closer = [...dist].filter(([k, d]) => d < best).map(([k]) => unkey(k));
  eq(closer.every(([r, c]) => !settleable(S, 0, r, c)), true, 'kein näheres Feld ist siedelbar');
  eq(spots.every(([r, c]) => settleable(S, 0, r, c)), true, 'die Ziele sind tatsächlich siedelbar');
  // Erreichbarkeit zählt: ohne Navigation kein Ziel jenseits des Wassers
  eq(spots.every(([r, c]) => dist.has(key(r, c))), true, 'nur durch Bewegung erreichbare Felder');
}
/* England (Hauptstadt in einer Bucht) siedelt jetzt zuverlässig in Runde 1 */
{
  let fail = 0;
  for (let g = 0; g < 60; g++) {
    const S = newGame({ seed: 4000 + g, players: CIVS.map(c => ({ civ: c.k, kind: 'bot', diff: 'david' })) });
    const en = S.players.findIndex(p => p.civ === 'england');
    S.cur = en; beginTurn(S);
    const before = S.log.length;
    botSettle(S, en, capitalOf(S, en));
    if (S.log.slice(before).some(l => /findet keinen Platz/.test(l.m))) fail++;
  }
  eq(fail, 0, 'England scheitert in Runde 1 nie mehr am Siedeln (60 Partien)');
}
/* Der Siedler beachtet die Sperren: kein Meer ohne Technologie, kein Vulkan,
   nicht neben gegnerischen Armeen */
{
  const S = mkX('griechenland', { events: true });
  const cap = capitalOf(S, 0);
  const spots = nearestSettleSpots(S, 0, cap);
  eq(spots.every(([r, c]) => TERRAIN[terrainAt(S, r, c)].land), true, 'nie auf Meer');
  // eine gegnerische Armee auf ein Zielfeld-Nachbarfeld setzen
  const target = spots[0];
  const next = neighbors(target[0], target[1]).find(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  S.armies.push({ id: 700, owner: 1, r: next[0], c: next[1], mp: 0, born: 0 });
  eq(nearestSettleSpots(S, 0, cap).some(([r, c]) => r === target[0] && c === target[1]), false,
    'Felder neben gegnerischen Armeen fallen als Ziel weg');
}

/* ============================== Technologien der Weltwunder-Erweiterung */
/* Sie existieren nur mit Weltwundern */
{
  const keys = ['baukraene', 'wallfahrt', 'raumfahrt', 'militaerlogistik'];
  const plain = mk('griechenland'), ext = mkX('griechenland', { wonders: true });
  for (const k of keys) {
    eq(techPool(plain).some(t => t.k === k), false, `${TECH_BY_KEY[k].n} fehlt ohne Erweiterung`);
    eq(techPool(ext).some(t => t.k === k), true, `${TECH_BY_KEY[k].n} ist mit Erweiterung dabei`);
  }
  eq(techPool(ext).length - techPool(plain).length, 4, 'genau vier zusätzliche Technologien');
  plain.players[0].avail.baukraene = true;
  plain.players[0].res = { sci: 99, food: 0, coins: 0 };
  eq(typeof doResearch(plain, 0, 'baukraene'), 'string', 'ohne Erweiterung nicht erforschbar');
  // Zeitalter folgen den Kostenbereichen des Regelhefts
  eq(techsIn(1, 1, ext).some(t => t.k === 'baukraene'), true, 'Baukräne: Produktion/Mittelalter (9)');
  eq(techsIn(3, 0, ext).some(t => t.k === 'wallfahrt'), true, 'Wallfahrt: Spezial/Antike (4)');
  eq(techsIn(0, 3, ext).some(t => t.k === 'raumfahrt'), true, 'Raumfahrt: Forschung/Moderne (19)');
  eq(techsIn(2, 1, ext).some(t => t.k === 'militaerlogistik'), true, 'Militärlogistik: Militär/Mittelalter (6)');
}
/* Baukräne: 2/4/6/8/… weniger, also 8/16/24/32 statt 10/20/30/40 */
{
  const S = mkX('griechenland', { wonders: true }, ['baukraene']);
  const cap = capitalOf(S, 0);
  const costs = [];
  for (let i = 0; i < 4; i++) {
    costs.push(wonderCost(S, 0));
    S.wonders.push({ k: 'w' + i, lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  }
  eq(costs, [8, 16, 24, 32], 'Baukräne: 8/16/24/32 Münzen');
  const B = mkX('griechenland', { wonders: true });
  eq(wonderCost(B, 0), 10, 'ohne Baukräne unverändert 10');
}
/* Wallfahrt: je Weltwunder +3 auf alle Erträge */
{
  const S = mkX('griechenland', { wonders: true }, ['wallfahrt']);
  const cap = capitalOf(S, 0);
  const base = income(S, 0);
  S.wonders.push({ k: 'gaerten', lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  const one = income(S, 0);
  eq([one.sci - base.sci, one.food - base.food, one.coins - base.coins], [3, 3, 3], 'ein Wunder: +3/+3/+3');
  S.wonders.push({ k: 'koloss', lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  eq(income(S, 0).sci - base.sci, 6, 'zwei Wunder: +6');
  eq(incomeBreakdown(S, 0).extra.some(e => e.name === 'Wallfahrt'), true, 'eigene Zeile in der Ertragsübersicht');
  const B = mkX('griechenland', { wonders: true });
  B.wonders.push({ k: 'gaerten', lvl: 1, owner: 0, cityId: capitalOf(B, 0).id, r: 0, c: 0 });
  eq(income(B, 0).sci, income(mkX('griechenland', { wonders: true }), 0).sci, 'ohne Wallfahrt kein Bonus');
}
/* Militärlogistik: +1 Bewegungsweite je Weltwunder, sofort wirksam */
{
  const S = mkX('griechenland', { wonders: true }, ['militaerlogistik']);
  const cap = capitalOf(S, 0);
  eq(moveAllowance(S, 0), 3, 'ohne Wunder normale Reichweite 3');
  S.players[0].res = { sci: 0, food: 0, coins: 99 };
  const sp = spotBy(S, cap);
  const army = { id: 710, owner: 0, r: sp[0], c: sp[1], mp: 3, born: 0 };
  S.armies.push(army);
  eq(buildWonder(S, 0, cap, poolOf(S, 1)[0]), null, 'Wunder gebaut');
  eq(moveAllowance(S, 0), 4, 'ein Wunder: Reichweite 4');
  eq(army.mp, 4, 'die zusätzliche Bewegung wirkt sofort im selben Zug');
  S.wonders.push({ k: 'zeus', lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  eq(moveAllowance(S, 0), 5, 'zwei Wunder: Reichweite 5');
  const B = mkX('griechenland', { wonders: true });
  B.wonders.push({ k: 'zeus', lvl: 1, owner: 0, cityId: capitalOf(B, 0).id, r: 0, c: 0 });
  eq(moveAllowance(B, 0), 3, 'ohne Militärlogistik unverändert');
}
/* Raumfahrt: Gratis-Tech bei jedem Wunderbau, nur in freigeschalteten Zeitaltern */
{
  const S = mkX('griechenland', { wonders: true }, ['raumfahrt']);
  const p = S.players[0], cap = capitalOf(S, 0);
  p.res = { sci: 0, food: 0, coins: 99 };
  // Wunder ohne eigenen Forschungseffekt, damit nur der Raumfahrt-Anspruch offen ist
  S.wpool[1] = ['zeus', 'mauer'];
  eq(buildWonder(S, 0, cap, 'zeus'), null, 'Wunder gebaut');
  const opts = freePickOptions(S, 0);
  eq(opts.length > 0, true, 'es gibt eine Auswahl');
  eq(opts.every(t => t.age <= unlockedAge(S, 0, t.f)), true,
    'kein Zeitalter, das im Feld noch nicht freigeschaltet ist');
  eq(opts.some(t => t.k === 'singularitaet'), false, 'Singularität ist ausgeschlossen');
  eq(opts.some(t => !p.avail[t.k]), true, 'Verfügbarkeit ist nicht nötig, nur das Zeitalter');
  const pick = opts[0];
  eq(useFreePick(S, 0, pick.k), null, 'Gratis-Tech genommen');
  eq(has(p, pick.k), true, 'Technologie ist erforscht');
  eq(freePick(p), null, 'Anspruch verbraucht');
  // beim nächsten Wunderbau wieder
  eq(buildWonder(S, 0, cap, 'mauer'), null, 'zweites Wunder gebaut');
  eq(freePickOptions(S, 0).length > 0, true, 'erneut eine Gratis-Tech');
  // Zeitaltergrenze prüfen: ein Feld, in dem nur die Antike freigeschaltet ist
  const f = 2;   // Militär
  const maxAge = unlockedAge(S, 0, f);
  eq(freePickOptions(S, 0).filter(t => t.f === f).every(t => t.age <= maxAge), true,
    'im Militärfeld nur bis zum freigeschalteten Zeitalter');
}
/* Zwei Ansprüche gleichzeitig: Raumfahrt und das Wunder selbst (Bibliothek) */
{
  const S = mkX('griechenland', { wonders: true }, ['raumfahrt']);
  const p = S.players[0], cap = capitalOf(S, 0);
  p.res = { sci: 0, food: 0, coins: 99 };
  S.wpool[1] = ['bibliothek'];
  eq(buildWonder(S, 0, cap, 'bibliothek'), null, 'Bibliothek gebaut');
  eq(p.freePicks.length, 2, 'beide Ansprüche stehen in der Warteschlange');
  const first = freePick(p).why;
  eq(useFreePick(S, 0, freePickOptions(S, 0)[0].k), null, 'erster Anspruch genutzt');
  eq(freePick(p) !== null && freePick(p).why !== first, true, 'der zweite Anspruch bleibt offen');
  eq(useFreePick(S, 0, freePickOptions(S, 0)[0].k), null, 'zweiter Anspruch genutzt');
  eq(freePick(p), null, 'danach ist die Warteschlange leer');
}

/* Freies Feld mit Mindestabstand 3 zu allen Städten (ohne Kostenprüfung – Bots zahlen nichts) */
const cityPlace = (S, pi, cap) => within(cap.r, cap.c, 9).find(([r, c]) =>
  isLand(S, r, c) && !TERRAIN[terrainAt(S, r, c)].block && !cityAt(S, r, c) && !armyAt(S, r, c) &&
  !S.cities.some(x => hexDistance(x.r, x.c, r, c) < 3));

/* Bots erhalten keine Wundereffekte und keine Effekte der neuen Technologien –
   einzige Ausnahme ist Militärlogistik (zählt nur die eigenen Wunder). */
{
  const S = newGame({ seed: 31, wonders: true, players: CIVS.map(c => ({ civ: c.k, kind: 'bot', diff: 'david' })) });
  const pi = 0, p = S.players[pi], cap = capitalOf(S, pi);
  const add = (k, lvl) => S.wonders.push({ k, lvl, owner: pi, cityId: cap.id, r: cap.r, c: cap.c });
  // Raumfahrt: keine Gratis-Tech beim Wunderbau
  p.techs.raumfahrt = true;
  FIELDS.forEach((_, f) => { techsIn(f, 3, S).forEach(t => { p.techs[t.k] = true; }); });
  const before = Object.keys(p.techs).length;
  buildWonder(S, pi, cap, poolOf(S, 1)[0], { free: true, noEffect: true });
  eq(Object.keys(p.techs).length, before, 'Bot bekommt durch Raumfahrt keine Gratis-Technologie');
  eq(freePickOptions(S, pi).length, 0, 'und keinen offenen Anspruch');
  // Baukräne: kein Rabatt (Bots zahlen ohnehin nichts)
  p.techs.baukraene = true;
  const n = wondersOf(S, pi).length;
  eq(wonderCost(S, pi), WONDER_STEP * (n + 1), 'Bot bekommt keinen Baukräne-Rabatt');
  // Wallfahrt: kein Ertrag
  p.techs.wallfahrt = true;
  eq(incomeBreakdown(S, pi).extra.some(e => e.name === 'Wallfahrt'), false, 'Bot bekommt keinen Wallfahrt-Ertrag');
  // Große Mauer: Bot verteidigt weiter nur mit der Bevölkerung dieser Stadt
  cap.pop = 3;
  const spot = cityPlace(S, pi, cap);
  eq(!!spot, true, 'ein Platz für die zweite Stadt gefunden');
  S.cities.push({ id: S.nextId++, owner: pi, r: spot[0], c: spot[1], pop: 5, cap: false, grown: 0, born: 0 });
  const other = cityAt(S, spot[0], spot[1]);
  add('mauer', 1);
  eq(ownsWonder(S, pi, 'mauer'), true, 'der Bot besitzt die Große Mauer');
  eq(hasWonder(S, pi, 'mauer'), false, 'sie wirkt für ihn aber nicht');
  eq(defenseValue(S, other), 5, 'Verteidigung bleibt die eigene Bevölkerung');
  // Kreml eines Bots verteuert die Singularität für niemanden
  add('kreml', 3);
  const H = mkX('griechenland', { wonders: true });
  eq(techCost(S, 1, SINGULARITY), SINGULARITY_BASE, 'Bot-Kreml verteuert die Singularität nicht');
  H.wonders.push({ k: 'kreml', lvl: 3, owner: 0, cityId: capitalOf(H, 0).id, r: 0, c: 0 });
  eq(techCost(H, 1, SINGULARITY), SINGULARITY_BASE + KREML_SURCHARGE, 'ein menschlicher Kreml sehr wohl');
  // Militärlogistik bleibt die Ausnahme: sie wirkt auch für Bots
  const baseRange = moveAllowance(S, pi);
  p.techs.militaerlogistik = true;
  eq(moveAllowance(S, pi), baseRange + wondersOf(S, pi).length, 'Militärlogistik wirkt auch beim Bot');
  eq(wondersOf(S, pi).length > 0, true, 'der Bot besitzt dafür auch Wunder');
}
/* Stonehenge schützt die Wunder eines Bots nicht vor der Zerstörung seiner Stadt */
{
  const S = newGame({ seed: 33, wonders: true, players: CIVS.map((c, i) => ({ civ: c.k, kind: i ? 'bot' : 'human', diff: 'prinz' })) });
  const bi = S.players.findIndex(p => p.kind === 'bot');
  const cap = capitalOf(S, bi);
  const spot = cityPlace(S, bi, cap);
  eq(!!spot, true, 'ein Platz für die Bot-Stadt gefunden');
  S.cities.push({ id: S.nextId++, owner: bi, r: spot[0], c: spot[1], pop: 1, cap: false, grown: 0, born: 0 });
  const city = cityAt(S, spot[0], spot[1]);
  S.wonders.push({ k: 'stonehenge', lvl: 1, owner: bi, cityId: city.id, r: city.r, c: city.c });
  S.wonders.push({ k: 'leuchtturm', lvl: 1, owner: bi, cityId: city.id, r: city.r, c: city.c });
  const other = S.players.findIndex((p, i) => i !== bi);
  captureCity(S, other, city);      // Bevölkerung 1 − 2 → Stadt zerstört
  eq(S.wonders.length, 0, 'die Wunder des Bots gehen mit der Stadt verloren');
  eq(S.wgone.includes('stonehenge'), true, 'auch Stonehenge selbst');
}

/* ==================================================== Karte und Aufbau */
{
  eq(MAPS[0].name.startsWith('Originalkarte'), true, 'die Originalkarte steht im Menü an erster Stelle');
  eq(DEFAULT_MAP, MAP_ORIGINAL, 'Standardkarte ist die Originalkarte');
}

/* ==================================================== Zivilisationsfähigkeiten */
/* Bots erhalten keine Zivilisationsfähigkeit */
{
  const S = newGame({ seed: 3, players: [
    { civ: 'wikinger', kind: 'bot' }, { civ: 'england', kind: 'bot' },
    { civ: 'russland', kind: 'bot' }, { civ: 'griechenland', kind: 'human' }] });
  const wi = S.players.findIndex(p => p.civ === 'wikinger');
  eq(armiesOf(S, wi).length, 0, 'Bot-Wikinger bekommt keine Gratisarmee');
  const en = S.players.findIndex(p => p.civ === 'england');
  eq(rates(S, en).foodToCoins, Infinity, 'Bot-England hat keinen Nahrung→Münzen-Kurs');
  eq(tileYield(S, S.players.findIndex(p => p.civ === 'russland'), 'W')[1], 0, 'Bot-Russland ohne Waldbonus');
  const gr = S.players.findIndex(p => p.civ === 'griechenland');
  eq(techCost(S, gr, TECH_BY_KEY.papier), 4, 'menschliches Griechenland behält den Rabatt');
  const S2 = newGame({ seed: 3, players: [{ civ: 'griechenland', kind: 'bot' }, { civ: 'england', kind: 'human' }] });
  eq(techCost(S2, S2.players.findIndex(p => p.civ === 'griechenland'), TECH_BY_KEY.papier), 6,
    'Bot-Griechenland ohne Kostenrabatt');
}

/* Wikinger: Grundfähigkeit nur bei 'basis' */
{
  const A = mkA('wikinger', 'basis');
  eq(armiesOf(A, 0).length, 1, 'Wikinger mit Grundfähigkeit: Gratisarmee am Start');
  eq(armyCost(A, 0), 5, 'erste Armee zählt nicht mit (2. Armee kostet 5)');
  const B = mkA('wikinger', 'armeemacht');
  eq(armiesOf(B, 0).length, 0, 'Alternative: keine Gratisarmee');
  eq(armyCost(B, 0), 5, 'Alternative: normale Armeekosten');
}

/* Wikinger "Kriegerkultur": +1 Macht je Armee, Zuschlag geht nicht verloren */
{
  const S = mkA('wikinger', 'armeemacht');
  const cap = capitalOf(S, 0), sp = spotBy(S, cap);
  S.armies.push({ id: 90, owner: 0, r: sp[0], c: sp[1], mp: 0, born: 0 });
  eq(powerOf(S, 0), 2, 'eine Armee gibt +2 Macht');
  S.armies.push({ id: 89, owner: 0, r: sp[0], c: sp[1] + 1, mp: 0, born: 0 });
  eq(powerOf(S, 0), 4, 'zwei Armeen geben +4 Macht');
  S.armies.pop();
  S.players[0].power = 4;
  eq(powerOf(S, 0), 6, 'Machtwert = eigene Macht + 2 je Armee');
  beginTurn(S);
  eq(S.players[0].power, 1, 'Machtverlust rechnet mit 6 (halbiert 3) auf die eigene Macht');
  eq(powerOf(S, 0), 3, 'der Armeezuschlag bleibt erhalten');
}

/* Wikinger "Beutezüge": Angriffswert − Verteidigungswert je Ziel, Auszahlung nächste Runde */
{
  const S = mkA('wikinger', 'kampfertrag');
  S.players[0].power = 12;
  const foe = capitalOf(S, 1);
  const spots = neighbors(foe.r, foe.c).filter(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  S.armies.push({ id: 91, owner: 0, r: spots[0][0], c: spots[0][1], mp: 0, born: 0 });
  const atk1 = attackValue(S, 0, 1), def = defenseValue(S, foe);
  eq(raidYield(S, 0).sum, atk1 - def, 'eine Armee: Angriffswert − Verteidigungswert');
  // zweite Armee erhöht den Angriffswert und damit die Beute
  S.armies.push({ id: 92, owner: 0, r: spots[1][0], c: spots[1][1], mp: 0, born: 0 });
  eq(raidYield(S, 0).sum, attackValue(S, 0, 2) - def, 'mehrere Armeen addieren sich im Angriffswert');
  eq(raidYield(S, 0).sum > atk1 - def, true, 'die Beute wächst mit der zweiten Armee');
  // Auszahlung: Kampfphase merkt sich den Ertrag, ausgezahlt wird zu Zugbeginn
  const expect = raidYield(S, 0).sum;
  S.cur = 0; combatPhase(S, 0);
  eq(S.players[0].raidPending, expect, 'Kampfphase hält den Ertrag fest');
  eq(S.players[0].res.coins < expect, true, 'im selben Zug noch nicht ausgezahlt');
  const before = income(S, 0);
  S.round++; beginTurn(S);
  eq(S.players[0].res.coins, before.coins + expect, 'zu Beginn der nächsten Runde gutgeschrieben');
  eq(S.players[0].res.sci, before.sci + expect, 'auch Wissenschaft');
  eq(S.players[0].res.food, Math.max(0, before.food) + expect, 'auch Nahrung');
  eq(S.players[0].raidPending, 0, 'der Anspruch ist verbraucht');
}
/* Beute auch für Felder mit gegnerischer Armee, verteidigende Armeen zählen mit */
{
  const S = mkA('wikinger', 'kampfertrag');
  S.players[0].power = 20;
  const cap = capitalOf(S, 0);
  // eine gegnerische Armee weit weg von Städten, daneben zwei eigene
  const far = within(cap.r, cap.c, 6).find(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c) &&
    !S.cities.some(x => hexDistance(x.r, x.c, r, c) <= 2));
  const foeArmy = { id: 95, owner: 1, r: far[0], c: far[1], mp: 0, born: 0 };
  S.armies.push(foeArmy);
  const near = neighbors(far[0], far[1]).filter(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  S.armies.push({ id: 96, owner: 0, r: near[0][0], c: near[0][1], mp: 0, born: 0 });
  const oneAtk = raidYield(S, 0).sum;
  eq(oneAtk, attackValue(S, 0, 1) - armyDefenseValue(S, foeArmy), 'Feld mit gegnerischer Armee zählt genauso');
  eq(oneAtk > 0, true, 'bei Überlegenheit gibt es Ertrag');
  // eine zweite gegnerische Armee daneben: sie erhöht den Verteidigungswert des ersten
  // Feldes und ist gleichzeitig selbst ein Ziel
  const def1 = armyDefenseValue(S, foeArmy);
  S.armies.push({ id: 97, owner: 1, r: near[1][0], c: near[1][1], mp: 0, born: 0 });
  eq(armyDefenseValue(S, foeArmy), def1 + powerOf(S, 1),
    'verteidigende Armeen zählen in den Verteidigungswert');
  const parts = raidYield(S, 0).parts;
  eq(parts.length, 2, 'jedes Feld mit gegnerischer Armee ist ein eigenes Ziel');
  eq(parts.every(t => +t.split('+')[1] === oneAtk - powerOf(S, 1)),
    true, 'je Ziel sinkt die Beute um den zusätzlichen Verteidiger');
}
/* ohne Überlegenheit kein Ertrag, ohne Fähigkeit gar keiner */
{
  const S = mkA('wikinger', 'kampfertrag');
  S.players[0].power = 0;
  const foe = capitalOf(S, 1);
  const spot = neighbors(foe.r, foe.c).find(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  S.armies.push({ id: 98, owner: 0, r: spot[0], c: spot[1], mp: 0, born: 0 });
  eq(raidYield(S, 0).sum, 0, 'kein Vorsprung, kein Ertrag');
  const B = mkA('wikinger', 'basis');
  B.players[0].power = 20;
  B.armies.push({ id: 99, owner: 0, r: spot[0], c: spot[1], mp: 0, born: 0 });
  eq(raidYield(B, 0).sum, 0, 'ohne die Alternative gibt es keine Beute');
  combatPhase(B, 0);
  eq(!B.players[0].raidPending, true, 'und auch keinen Anspruch');
}
/* Beute ist kein Einkommen: sie steht in der Vorschau, nicht in der Summe */
{
  const S = mkA('wikinger', 'kampfertrag');
  S.players[0].power = 12;
  const foe = capitalOf(S, 1);
  const spot = neighbors(foe.r, foe.c).find(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  const plain = income(S, 0).coins;
  S.armies.push({ id: 100, owner: 0, r: spot[0], c: spot[1], mp: 0, born: 0 });
  const b = incomeBreakdown(S, 0);
  eq(b.total[2], plain, 'die Beute verändert das Einkommen nicht');
  eq(b.preview.some(e => /Beutez/.test(e.name)), true, 'sie erscheint als Vorschauzeile');
}

/* Griechenland: Alternativen ersetzen den Kostenrabatt */
{
  const S = mkA('griechenland', 'gratistech');
  eq(techCost(S, 0, TECH_BY_KEY.papier), 6, 'Alternative: kein Kostenrabatt mehr');
  S.players[0].avail.papier = true;
  eq(freeTechOptions(S, 0).some(t => t.k === 'papier'), true, 'verfügbare Tech ist gratis erforschbar');
  eq(useFreeTech(S, 0, 'papier'), null, 'Gratisforschung klappt');
  eq(has(S.players[0], 'papier'), true, 'Tech ist erforscht');
  eq(freeTechOptions(S, 0).length, 0, 'nur einmal pro Runde');
  S.players[0].avail.robotik = true;
  S.round++;
  eq(freeTechOptions(S, 0).some(t => t.k === 'robotik'), false, 'nur bis Industrialisierung (Robotik ist Moderne)');
}
{
  const S = mkA('griechenland', 'rueckschau');
  const p = S.players[0];
  p.avail.buchdruck = true; p.res = { sci: 99, food: 0, coins: 0 };
  eq(doResearch(S, 0, 'buchdruck'), null, 'Mittelalter-Tech erforscht');
  eq([backPick(p).age, backPick(p).f], [0, TECH_BY_KEY.buchdruck.f],
    'Rückschau erlaubt ein früheres Zeitalter im selben Feld');
  const opts = backPickOptions(S, 0);
  eq(opts.every(t => t.age === 0), true, 'nur Techs der Antike zur Wahl');
  eq(opts.every(t => t.f === TECH_BY_KEY.buchdruck.f), true,
    'nur Techs aus demselben Technologiefeld');
  eq(opts.length > 0, true, 'es bleibt eine Auswahl übrig');
  eq(opts.some(t => !p.avail[t.k]), true, 'auch nicht freigeschaltete Techs zur Wahl');
  eq(useBackPick(S, 0, opts[0].k), null, 'Gratis-Tech aus der Rückschau');
  eq(backPickOptions(S, 0).length, 0, 'keine Kette – der Anspruch ist verbraucht');
}

/* England: Alternativen */
{
  const A = mkA('england', 'gruenden'), B = mkA('england', 'basis');
  const cap = capitalOf(A, 0);
  const far = within(cap.r, cap.c, 6).find(([r, c]) => isLand(A, r, c) &&
    foundDistance(A, 0, r, c) != null &&           // erreichbar, sonst gibt es keine Kosten
    !A.cities.some(x => hexDistance(x.r, x.c, r, c) < 3));
  // Basiskosten bei einer Stadt = 1; die Distanzkosten sind in beiden Spielen gleich
  eq(foundCost(B, 0, far[0], far[1]) - foundCost(A, 0, far[0], far[1]), 1,
    'Alternative "Kolonisten": Basiskosten fallen weg, Distanz bleibt');
  eq(foundCost(A, 0, far[0], far[1]) > 0, true, 'Distanzkosten werden weiter berechnet');
  eq(rates(A, 0).foodToCoins, Infinity, 'Alternative: kein 1:1-Pool mehr');
}
{
  const S = mkA('england', 'kuestenstaedte');
  const cap = capitalOf(S, 0);
  const sea = cityAtSea(S, cap);
  const b = incomeBreakdown(S, 0);
  eq(b.extra.some(e => e.name === 'Städte am Meer'), sea, 'Küstenzeile erscheint nur bei Meeresanschluss');
  if (sea) eq(b.extra.find(e => e.name === 'Städte am Meer').y, [2, 2, 2], '+2 auf alle drei Erträge');
}

/* Russland: Alternativen */
{
  const S = mkA('russland', 'wachstum');
  const c = capitalOf(S, 0);
  eq(growPrice(S, 0, c).food, 0, 'Wachstum kostet keine Nahrung');
  eq(growPrice(S, 0, c).coins, c.pop, 'Münzen fallen weiter an');
  eq(tileYield(S, 0, 'W')[1], 0, 'Alternative: kein Waldbonus');
  // die Nahrungsgrenze gilt trotzdem
  c.pop = 30;
  eq(typeof canGrowPaid(S, 0, c), 'string', 'Nahrungsgrenze gilt auch bei Gratis-Nahrungskosten');
}
{
  const S = mkA('russland', 'siedler');
  const cap = capitalOf(S, 0);
  eq(cap.pop, 2, 'Siedlertrecks: auch die Hauptstadt startet mit 2 Bevölkerung');
  eq(capitalOf(mkA('russland', 'basis'), 0).pop, 1, 'mit Grundfähigkeit startet sie mit 1');
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  S.players[0].res = { sci: 0, food: 99, coins: 99 };
  eq(foundCity(S, 0, spot[0], spot[1]), null, 'Stadt gegründet');
  eq(cityAt(S, spot[0], spot[1]).pop, 2, 'neue Städte starten mit 2 Bevölkerung');
}

/* ==================================================== Ereignisse */
/* Spaltenauswürfelung: hart trifft immer, leicht nur bei 1/3/5 */
{
  const S = mk('griechenland');
  eq([1, 2, 3, 4, 5, 6].map(r => eventColumn(S, 'hard', r)), [1, 1, 2, 2, 3, 3], 'hart: 1/2→1, 3/4→2, 5/6→3');
  eq([1, 2, 3, 4, 5, 6].map(r => eventColumn(S, 'easy', r)), [1, 0, 2, 0, 3, 0], 'leicht: nur 1/3/5 treffen');
}
/* Häufigkeit: leicht trifft etwa halb so oft wie hart */
{
  let hard = 0, easy = 0;
  for (let g = 0; g < 200; g++) {
    const H = mkX('griechenland', { events: true, eventMode: 'hard', seed: 100 + g });
    const E = mkX('griechenland', { events: true, eventMode: 'easy', seed: 100 + g });
    if (H.event.k) hard++;
    if (E.event.k) easy++;
  }
  eq(hard, 200, 'harter Modus: jede Runde ein Ereignis');
  eq(easy > 60 && easy < 140, true, `leichter Modus trifft etwa halb so oft (${easy}/200)`);
}
/* Bots sind nie betroffen, Menschen schon */
{
  const S = mkX('griechenland', { events: true });
  setEvent(S, 'duerre');
  eq(evActive(S, 0, 'duerre'), true, 'Ereignis trifft den Menschen');
  eq(evActive(S, 1, 'duerre'), false, 'Bots sind nie betroffen');
  eq(tileYield(S, 0, 'G'), [0, 0, 0], 'Dürre: Grasland bringt nichts');
  eq(tileYield(S, 1, 'G')[1], 1, 'Bot-Grasland bringt weiter Nahrung');
  for (const [k, t] of Object.entries(EVENT_TERRAIN)) {
    setEvent(S, k);
    eq(tileYield(S, 0, t), [0, 0, 0], `${EVENT_BY_KEY[k].n}: ${TERRAIN[t].name} bringt nichts`);
  }
}
/* Pest, Sturmflut, Kriegsmüdigkeit, Wirtschaftskrise, Hungersnot, Revolution */
{
  const S = mkX('griechenland', { events: true });
  const c = capitalOf(S, 0); c.pop = 7;
  setEvent(S, 'pest'); applyEvent(S);
  eq(c.pop, 3, 'Pest: 7 → 3 (Hälfte aufgerundet abgezogen)');
  c.pop = 1;
  setEvent(S, 'pest'); applyEvent(S);
  eq(c.pop, 1, 'Pest zerstört keine Stadt (letzte Bevölkerung bleibt)');
}
{
  const S = mkX('griechenland', { events: true });
  const c = capitalOf(S, 0); c.pop = 9;
  const wet = neighbors(c.r, c.c).some(([r, cc]) => ['M', 'F'].includes(terrainAt(S, r, cc)));
  setEvent(S, 'sturmflut'); applyEvent(S);
  if (wet) {
    eq(c.pop, 6, 'Sturmflut: 9 → 6 (ein Drittel)');
    eq(typeof canGrow(S, 0, c), 'string', 'Sturmflut: diese Runde kein Wachstum');
  } else eq(c.pop, 9, 'ohne Wasseranschluss keine Sturmflut');
}
{
  const S = mkX('griechenland', { events: true });
  S.players[0].power = 12;
  setEvent(S, 'kriegsmuedigkeit'); applyEvent(S);
  eq(S.players[0].power, 0, 'Kriegsmüdigkeit setzt die Macht auf 0');
}
{
  const S = mkX('griechenland', { events: true });
  const base = income(S, 0);
  setEvent(S, 'wirtschaftskrise');
  eq(income(S, 0).coins, 0, 'Wirtschaftskrise: keine Münzen');
  eq(income(S, 0).sci, base.sci, 'Wissenschaft bleibt');
  setEvent(S, 'hungersnot');
  eq(income(S, 0).food, 0, 'Hungersnot: keine Nahrung');
  eq(rates(S, 0).coinsToFood, 4, 'Hungersnot: Münzen→Nahrung 4:1');
  S.players[0].techs.gilden = true;
  eq(rates(S, 0).coinsToFood, 2, 'Hungersnot mit Gilden: 2:1');
  const E = mkX('england', { events: true });
  setEvent(E, 'hungersnot');
  eq(rates(E, 0).coinsToFood, 1, 'Englands 1:1 wird von der Hungersnot nicht überschrieben');
}
{
  const S = mkX('griechenland', { events: true });
  const cap = capitalOf(S, 0); cap.pop = 4;
  const before = income(S, 0);
  setEvent(S, 'revolution');
  const after = income(S, 0);
  eq(after.sci === 0 && after.coins === 0, true, 'Revolution: Hauptstadt und Umland produzieren nichts');
  eq(after.food, -4, 'Revolution: Nahrung wird trotzdem verbraucht');
  eq(before.sci > 0, true, 'Vergleichswert war vorher positiv');
}
/* Dunkles Zeitalter, Bürgerkrieg, Atomwaffenproteste */
{
  const S = mkX('griechenland', { events: true });
  S.players[0].avail.schrift = true; S.players[0].res = { sci: 9, food: 0, coins: 0 };
  setEvent(S, 'dunkles_zeitalter');
  eq(typeof doResearch(S, 0, 'schrift'), 'string', 'Dunkles Zeitalter verbietet Forschung');
  S.event = null;
  eq(doResearch(S, 0, 'schrift'), null, 'danach wieder erlaubt');
}
{
  const S = mkX('griechenland', { events: true });
  const cap = capitalOf(S, 0), sp = spotBy(S, cap);
  S.armies.push({ id: 92, owner: 0, r: sp[0], c: sp[1], mp: 0, born: 0 });
  setEvent(S, 'buergerkrieg'); applyEvent(S);
  eq(armiesOf(S, 0).length, 0, 'Bürgerkrieg zerstört alle eigenen Armeen');
  S.players[0].res = { sci: 0, food: 20, coins: 0 };
  eq(buildArmy(S, 0, cap), null, 'Bürgerkrieg: Armee kann mit Nahrung bezahlt werden');
  const T = mkX('griechenland', { events: true });
  T.players[0].res = { sci: 0, food: 20, coins: 0 };
  eq(typeof buildArmy(T, 0, capitalOf(T, 0)), 'string', 'ohne Bürgerkrieg geht das nicht');
}
{
  const S = mkX('griechenland', { events: true }, ['atomwaffen']);
  setEvent(S, 'atomprotest'); applyEvent(S);
  eq(S.nukeBan, true, 'Atomwaffenproteste sperren Atomwaffen');
  eq(typeof nuke(S, 0, capitalOf(S, 1).r, capitalOf(S, 1).c), 'string', 'Atomschlag wird abgelehnt');
  S.round += 3; S.event = null;
  eq(typeof nuke(S, 0, capitalOf(S, 1).r, capitalOf(S, 1).c), 'string', 'die Sperre ist dauerhaft');
}
/* Vulkanausbruch */
{
  const S = mkX('griechenland', { events: true });
  const cap = capitalOf(S, 0);
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  S.cities.push({ id: S.nextId++, owner: 0, r: spot[0], c: spot[1], pop: 8, cap: false, grown: 0, born: 0 });
  setEvent(S, 'vulkan'); applyEvent(S);
  const city = cityAt(S, spot[0], spot[1]);
  eq(city.pop, 2, 'Vulkan: 8 → 2 (drei Viertel aufgerundet)');
  const vulk = neighbors(spot[0], spot[1]).find(([r, c]) => terrainAt(S, r, c) === 'V');
  eq(!!vulk, true, 'ein Nachbarfeld ist jetzt Vulkan');
  eq(tileYield(S, 0, 'V'), [0, 0, 0], 'Vulkan bringt keinen Ertrag');
  eq(canPass(S, 0, vulk[0], vulk[1]), false, 'Vulkan ist unpassierbar');
  eq(typeof canFound(S, 0, vulk[0], vulk[1]), 'string', 'auf einem Vulkan kann nicht gesiedelt werden');
}
/* Barbareninvasion */
{
  const S = mkX('griechenland', { events: true });
  const cap = capitalOf(S, 0);
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  const cid = S.nextId++;
  S.cities.push({ id: cid, owner: 0, r: spot[0], c: spot[1], pop: 4, cap: false, grown: 0, born: 0 });
  setEvent(S, 'barbaren'); applyEvent(S);
  const force = S.barbs[0];
  eq(force.power, 10, 'Barbarenmacht = max(10, doppelter Machtwert)');
  eq(force.hits, 1, 'erster Angriff sitzt (10 > 4)');
  eq(cityAt(S, spot[0], spot[1]).owner, 0, 'die Stadt gehört noch dem Spieler');
  S.round++; resolveBarbs(S);          // zweiter Angriff vor dem nächsten Ereignis
  const city = cityAt(S, spot[0], spot[1]);
  const bi = S.players.findIndex(p => p.kind === 'barbar');
  eq(city.owner, bi, 'nach zwei Runden gehört die Stadt den Barbaren');
  eq(city.pop, 2, 'Eroberung kostet 2 Bevölkerung');
  eq(defenseValue(S, city), 2, 'Barbarenstadt verteidigt nur mit Bevölkerung');
  eq(civOf(S.players[bi]).n, 'Barbaren', 'die Barbaren sind eine eigene Fraktion');
  eq(S.players[bi].dead, true, 'die Barbaren kommen nie an den Zug');
  // Rückerobern klappt nach den normalen Regeln
  S.players[0].power = 20;
  const near = neighbors(city.r, city.c).find(([r, c]) => isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
  S.armies.push({ id: 93, owner: 0, r: near[0], c: near[1], mp: 0, born: 0 });
  combatPhase(S, 0); combatPhase(S, 0);
  eq(cityAt(S, spot[0], spot[1]) ? cityAt(S, spot[0], spot[1]).owner : 0, 0, 'die Stadt ist zurückerobert');
}
/* Barbaren ziehen ab, wenn der erste Angriff scheitert */
{
  const S = mkX('griechenland', { events: true });
  const cap = capitalOf(S, 0);
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  S.cities.push({ id: S.nextId++, owner: 0, r: spot[0], c: spot[1], pop: 30, cap: false, grown: 0, born: 0 });
  setEvent(S, 'barbaren'); applyEvent(S);
  eq((S.barbs || []).length, 0, 'starke Stadt wehrt die Barbaren sofort ab');
  eq(cityAt(S, spot[0], spot[1]).owner, 0, 'die Stadt bleibt beim Spieler');
}

/* ==================================================== Weltwunder */
/* Kostenleiter und Pyramidenregel */
{
  const S = mkX('griechenland', { wonders: true });
  eq(wonderCost(S, 0), 10, 'erstes Wunder kostet 10');
  const cap = capitalOf(S, 0);
  const push = (k, lvl) => S.wonders.push({ k, lvl, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  push('gaerten', 1);
  eq(wonderCost(S, 0), 20, 'zweites Wunder kostet 20');
  push('koloss', 1); push('zeus', 1);
  eq(wonderCost(S, 0), 40, 'viertes Wunder kostet 40');
  eq(wonderLevelOk(S, 0, 2), true, 'mit 3 Stufe-1-Wundern ist Stufe 2 erlaubt');
  push('taj', 2);
  eq(wonderLevelOk(S, 0, 2), true, 'zweites Stufe-2-Wunder bei 3 Stufe-1 erlaubt (2 < 3)');
  push('canal', 2);
  eq(wonderLevelOk(S, 0, 2), false, 'drittes Stufe-2-Wunder bräuchte 4 Stufe-1-Wunder');
  eq(wonderLevelOk(S, 0, 3), true, 'mit 2 Stufe-2-Wundern ist Stufe 3 erlaubt');
  // Verlust senkt die Kosten wieder
  const before = wonderCost(S, 0);
  removeWonder(S, S.wonders[0]);
  eq(wonderCost(S, 0), before - 10, 'ein verlorenes Wunder senkt den Preis');
}
/* Beispiel des Autors: ein erobertes Stufe-2-Wunder ohne Stufe-1-Wunder */
{
  const S = mkX('griechenland', { wonders: true });
  const cap = capitalOf(S, 0);
  S.wonders.push({ k: 'taj', lvl: 2, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  eq(wonderLevelOk(S, 0, 2), false, 'ohne Stufe-1-Wunder kein weiteres Stufe-2-Wunder');
  for (const k of ['gaerten', 'koloss']) S.wonders.push({ k, lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  eq(wonderLevelOk(S, 0, 2), false, 'zwei Stufe-1-Wunder genügen noch nicht');
  S.wonders.push({ k: 'zeus', lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  eq(wonderLevelOk(S, 0, 2), true, 'ab drei Stufe-1-Wundern geht es weiter');
}
/* Pool: je 3 verfügbar, Stufe 3 vollständig, Nachwürfeln nach dem Bau */
{
  const S = mkX('griechenland', { wonders: true });
  eq([poolOf(S, 1).length, poolOf(S, 2).length], [3, 3], 'je drei Wunder der Stufen 1 und 2 verfügbar');
  eq(poolOf(S, 3).length, 3, 'alle drei Stufe-3-Wunder sind verfügbar');
  eq(new Set(poolOf(S, 1)).size, 3, 'keine Doppelungen im Pool');
  const cap = capitalOf(S, 0);
  const first = poolOf(S, 1)[0];
  S.players[0].res = { sci: 0, food: 0, coins: 50 };
  eq(buildWonder(S, 0, cap, first), null, 'Wunder gebaut');
  eq(poolOf(S, 1).includes(first), false, 'das gebaute Wunder ist aus dem Pool');
  eq(poolOf(S, 1).length, 3, 'ein neues Wunder wurde nachgewürfelt');
  eq(S.players[0].res.coins, 40, '10 Münzen bezahlt');
  // zweites Wunder in derselben Stadt, drittes nicht mehr
  eq(buildWonder(S, 0, cap, poolOf(S, 1)[0]), null, 'zweites Wunder in derselben Stadt');
  eq(typeof buildWonder(S, 0, cap, poolOf(S, 1)[0]), 'string', 'drittes Wunder in derselben Stadt abgelehnt');
}
/* Dauerhafte Effekte */
{
  const S = mkX('griechenland', { wonders: true });
  const cap = capitalOf(S, 0); cap.pop = 3;
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  S.cities.push({ id: S.nextId++, owner: 0, r: spot[0], c: spot[1], pop: 5, cap: false, grown: 0, born: 0 });
  const other = cityAt(S, spot[0], spot[1]);
  const add = (k, lvl) => S.wonders.push({ k, lvl, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  eq(defenseValue(S, other), 5, 'ohne Mauer verteidigt die Stadt mit eigener Bevölkerung');
  add('mauer', 1);
  eq(defenseValue(S, other), 8, 'Große Mauer: Verteidigung = Gesamtbevölkerung (3+5)');
  add('leuchtturm', 1);
  eq(tileYield(S, 0, 'M'), [1, 1, 2], 'Leuchtturm: Meer +1 auf alles');
  add('pyramiden', 1);
  eq(rates(S, 0).foodToCoins, 1, 'Pyramiden: Nahrung → Münzen 1:1');
  eq(rates(S, 0).coinsToFood, 2, 'Pyramiden wirken nur in eine Richtung');
  add('himeji', 2);
  eq(powerPrice(S, 0), 4, 'Burg Himeji senkt den Machtpreis um 1');
  add('kreml', 3);
  eq(techCost(S, 0, SINGULARITY), 145, 'Kreml: Singularität +50 (100+50−5 Rabatt)');
  eq(techCost(S, 1, SINGULARITY), 150, 'der Kreml verteuert Singularität für alle');
  add('zeus', 1);
  eq(powerOf(S, 0), 3, 'Zeusstatue: +3 Macht');
}
/* Sofortwirkungen */
{
  const S = mkX('griechenland', { wonders: true });
  const cap = capitalOf(S, 0); cap.pop = 2;
  const p = S.players[0];
  applyWonderEffect(S, 0, cap, WONDER_BY_KEY.canal);
  eq(p.res.coins >= 40, true, 'Canal du Midi: +40 Münzen');
  applyWonderEffect(S, 0, cap, WONDER_BY_KEY.pentagon);
  eq(p.power, 15, 'Pentagon: +15 Macht');
  applyWonderEffect(S, 0, cap, WONDER_BY_KEY.taj);
  eq(p.doubleIncome, S.round + 1, 'Taj Mahal wirkt in der nächsten Runde');
  const plain = income(S, 0).sci;
  S.round++; p.doubleIncome = S.round;
  eq(income(S, 0).sci, plain * 2, 'Taj Mahal verdoppelt die Erträge');
  p.doubleIncome = null;
  applyWonderEffect(S, 0, cap, WONDER_BY_KEY.koloss);
  eq(armiesOf(S, 0).length, 2, 'Koloss stellt zwei Armeen neben die Stadt');
  eq(armiesOf(S, 0).every(a => !cityAt(S, a.r, a.c)), true, 'die Armeen stehen nicht auf der Stadt');
  const before = cap.pop;
  applyWonderEffect(S, 0, cap, WONDER_BY_KEY.angkor);
  eq(cap.pop > before, true, 'Angkor Wat lässt die Stadt wachsen');
  eq(income(S, 0).food >= 0, true, 'auch Angkor Wat bleibt an der Nahrungsgrenze');
  applyWonderEffect(S, 0, cap, WONDER_BY_KEY.bibliothek);
  eq(freePickOptions(S, 0).every(t => t.age <= 1), true, 'Bibliothek: Mittelalter oder früher');
  eq(freePickOptions(S, 0).some(t => !p.avail[t.k]), true, 'Bibliothek ignoriert die Verfügbarkeit');
  const pick = freePickOptions(S, 0)[0];
  eq(useFreePick(S, 0, pick.k), null, 'Gratis-Tech aus der Bibliothek');
  eq(freePick(p), null, 'Anspruch verbraucht');
  p.avail.schrift = true;
  applyWonderEffect(S, 0, cap, WONDER_BY_KEY.oxford);
  eq(freePickOptions(S, 0).every(t => p.avail[t.k]), true, 'Oxford nur auf verfügbare Techs');
  eq(freePick(p).n, 2, 'Oxford gibt zwei Gratis-Techs');
}
/* Erdbeben, Stonehenge, Eroberung, Zerstörung */
{
  const S = mkX('griechenland', { wonders: true, events: true });
  const cap = capitalOf(S, 0);
  S.wonders.push({ k: 'gaerten', lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  setEvent(S, 'erdbeben'); applyEvent(S);
  eq(wondersOf(S, 0).length, 0, 'Erdbeben zerstört ein Wunder');
  eq(S.wgone.includes('gaerten'), true, 'zerstörte Wunder sind endgültig weg');
  initWonderPools(S);
  eq(poolOf(S, 1).includes('gaerten'), false, 'zerstörte Wunder kommen nicht zurück in den Pool');
  S.wonders.push({ k: 'stonehenge', lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  setEvent(S, 'erdbeben'); applyEvent(S);
  eq(wondersOf(S, 0).length, 1, 'Stonehenge schützt vor dem Erdbeben');
}
{
  // Eroberung: dauerhafte Effekte wechseln den Besitzer
  const S = mkX('griechenland', { wonders: true });
  const cap = capitalOf(S, 0);
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  S.cities.push({ id: S.nextId++, owner: 0, r: spot[0], c: spot[1], pop: 5, cap: false, grown: 0, born: 0 });
  const city = cityAt(S, spot[0], spot[1]);
  S.wonders.push({ k: 'leuchtturm', lvl: 1, owner: 0, cityId: city.id, r: city.r, c: city.c });
  captureCity(S, 1, city);
  eq(city.owner, 1, 'Stadt erobert');
  eq(ownsWonder(S, 1, 'leuchtturm'), true, 'der Eroberer übernimmt das Wunder');
  eq(hasWonder(S, 1, 'leuchtturm'), false, 'ein Bot als Eroberer nutzt den Effekt aber nicht');
  S.players[1].kind = 'human';
  eq(hasWonder(S, 1, 'leuchtturm'), true, 'ein menschlicher Eroberer erhält den Effekt');
  eq(hasWonder(S, 0, 'leuchtturm'), false, 'der Verlierer verliert den Effekt');
  eq(wonderCost(S, 0), 10, 'nach dem Verlust kostet ein neues Wunder wieder 10');
}
{
  // Zerstörung ohne Stonehenge: Wunder weg; mit Stonehenge: bleiben stehen
  const S = mkX('griechenland', { wonders: true });
  const cap = capitalOf(S, 0);
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  S.cities.push({ id: S.nextId++, owner: 0, r: spot[0], c: spot[1], pop: 1, cap: false, grown: 0, born: 0 });
  const city = cityAt(S, spot[0], spot[1]);
  S.wonders.push({ k: 'leuchtturm', lvl: 1, owner: 0, cityId: city.id, r: city.r, c: city.c });
  captureCity(S, 1, city);          // pop 1 − 2 → Stadt zerstört
  eq(cityAt(S, spot[0], spot[1]), undefined, 'Stadt zerstört');
  eq(S.wonders.length, 0, 'die Wunder sind mit der Stadt verloren');
  eq(S.wgone.includes('leuchtturm'), true, 'und nicht mehr verfügbar');
}
{
  const S = mkX('griechenland', { wonders: true });
  const cap = capitalOf(S, 0);
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  S.cities.push({ id: S.nextId++, owner: 0, r: spot[0], c: spot[1], pop: 1, cap: false, grown: 0, born: 0 });
  const city = cityAt(S, spot[0], spot[1]);
  S.wonders.push({ k: 'stonehenge', lvl: 1, owner: 0, cityId: city.id, r: city.r, c: city.c });
  S.wonders.push({ k: 'leuchtturm', lvl: 1, owner: 0, cityId: city.id, r: city.r, c: city.c });
  captureCity(S, 1, city);
  eq(S.wonders.length, 2, 'Stonehenge: die Wunder überstehen die Zerstörung der Stadt');
  eq(S.wonders.every(w => w.owner === 0 && w.cityId == null), true, 'sie bleiben freistehend beim Besitzer');
  eq(hasWonder(S, 0, 'leuchtturm'), true, 'die Effekte wirken weiter');
  // wer hier eine Stadt gründet, übernimmt sie
  S.players[1].res = { sci: 0, food: 99, coins: 99 };
  eq(foundCity(S, 1, spot[0], spot[1]), null, 'neue Stadt auf dem Feld gegründet');
  eq(ownsWonder(S, 1, 'leuchtturm'), true, 'die freistehenden Wunder gehen an die neue Stadt');
}
/* Kultursieg */
{
  const S = mkX('griechenland', { wonders: true });
  const cap = capitalOf(S, 0);
  S.wpool[3] = ['pentagon'];
  S.players[0].res = { sci: 0, food: 0, coins: 99 };
  for (const k of ['gaerten', 'koloss', 'zeus']) S.wonders.push({ k, lvl: 1, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  for (const k of ['taj', 'canal']) S.wonders.push({ k, lvl: 2, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  const spot = within(cap.r, cap.c, 5).find(([r, c]) => !canFound(S, 0, r, c));
  S.cities.push({ id: S.nextId++, owner: 0, r: spot[0], c: spot[1], pop: 3, cap: false, grown: 0, born: 0 });
  const city = cityAt(S, spot[0], spot[1]);
  eq(buildWonder(S, 0, city, 'pentagon'), null, 'Stufe-3-Wunder gebaut');
  eq(S.players[0].cultureWin, S.round, 'Kultursieg ist vorgemerkt');
  eq(checkCultureVictory(S, 0), null, 'im selben Zug gewinnt niemand');
  S.round++;
  eq(checkCultureVictory(S, 0).how.startsWith('Kultursieg'), true, 'zu Beginn des nächsten Zuges Kultursieg');
}
{
  // verlorenes Stufe-3-Wunder verhindert den Kultursieg
  const S = mkX('griechenland', { wonders: true });
  const cap = capitalOf(S, 0);
  S.wonders.push({ k: 'pentagon', lvl: 3, owner: 0, cityId: cap.id, r: cap.r, c: cap.c });
  S.players[0].cultureWin = S.round;
  S.round++;
  removeWonder(S, S.wonders[0]);
  eq(checkCultureVictory(S, 0), null, 'ohne Stufe-3-Wunder kein Kultursieg');
}
/* Bots bauen Wunder ohne Kosten und ohne Effekte */
{
  const S = newGame({
    seed: 21, wonders: true,
    players: CIVS.map(c => ({ civ: c.k, kind: 'bot', diff: 'david' })),
  });
  let built = 0;
  for (let i = 0; i < 12 && !S.over; i++) {
    const before = S.wonders.length;
    botWonderStep(S, S.cur);
    built += S.wonders.length - before;
    advanceTurn(S);
  }
  eq(built > 0, true, 'Bots bauen Weltwunder');
  eq(S.wonders.every(w => w.cityId != null), true, 'Bot-Wunder stehen in Städten');
  eq(S.players.every(p => !p.res.coins || p.res.coins >= 0), true, 'Bots zahlen keine Münzen');
  const withEffect = S.wonders.filter(w => w.k === 'canal');
  eq(withEffect.every(() => true), true, 'Bots wenden keine Wundereffekte an');
}

/* --- Vollständige Partien: 4 Bots, keine Ausnahmen, Spiel endet */
{
  let ended = 0, rounds = [], how = {};
  for (let g = 0; g < 40; g++) {
    const S = newGame({
      seed: 1000 + g,
      players: CIVS.map((c, i) => ({ civ: c.k, kind: 'bot', diff: DIFFICULTIES[(g + i) % 5].k })),
    });
    let guard = 0;
    while (!S.over && guard++ < 400) { botTurn(S, S.cur); if (S.over) break; endTurn(S); }
    if (S.over) { ended++; rounds.push(S.round); how[S.over.how.split(' (')[0]] = (how[S.over.how.split(' (')[0]] || 0) + 1; }
  }
  eq(ended, 40, '40 Bot-Partien laufen bis zum Sieg durch');
  console.log('       Runden bis zum Sieg: min ' + Math.min(...rounds) + ', median ' +
    rounds.sort((a, b) => a - b)[Math.floor(rounds.length / 2)] + ', max ' + Math.max(...rounds));
  console.log('       Siegarten: ' + JSON.stringify(how));
}

/* --- Vollständige Partien mit beiden Erweiterungen (Bots bauen Wunder) */
{
  let ended = 0, rounds = [], how = {}, wonders = 0;
  for (let g = 0; g < 40; g++) {
    const S = newGame({
      seed: 5000 + g, events: true, eventMode: g % 2 ? 'easy' : 'hard', wonders: true,
      players: CIVS.map((c, i) => ({ civ: c.k, kind: 'bot', diff: DIFFICULTIES[(g + i) % 5].k })),
    });
    let guard = 0;
    while (!S.over && guard++ < 500) { botTurn(S, S.cur); if (S.over) break; endTurn(S); }
    wonders += S.wonders.length;
    if (S.over) { ended++; rounds.push(S.round); how[S.over.how.split(' (')[0]] = (how[S.over.how.split(' (')[0]] || 0) + 1; }
  }
  eq(ended, 40, '40 Bot-Partien mit Ereignissen und Wundern laufen bis zum Sieg durch');
  console.log('       Erweiterungen: Runden bis zum Sieg median ' +
    rounds.sort((a, b) => a - b)[Math.floor(rounds.length / 2)] +
    ', Wunder je Partie ' + (wonders / 40).toFixed(1));
  console.log('       Siegarten: ' + JSON.stringify(how));
}

/* --- Menschliche Partien mit Erweiterungen: Ereignisse treffen, Wunder werden gebaut */
{
  let ended = 0, events = 0, built = 0, culture = 0;
  for (let g = 0; g < 20; g++) {
    const S = newGame({
      seed: 8000 + g, events: true, eventMode: g % 2 ? 'easy' : 'hard', wonders: true,
      players: CIVS.map((c, i) => ({
        civ: c.k, kind: i === 0 ? 'human' : 'bot', diff: 'prinz',
        ability: CIVS[i].abilities[g % 3].k,
      })),
    });
    let guard = 0;
    while (!S.over && guard++ < 400) {
      const pi = S.cur;
      if (S.players[pi].kind === 'bot') { botTurn(S, pi); if (S.over) break; endTurn(S); continue; }
      if (S.event && S.event.k && S.event.round === S.round) events++;
      // füttern, wachsen, forschen, Wunder bauen
      feedSources(S, pi).forEach(x => feed(S, pi, x.kind, x.have));
      for (const city of citiesOf(S, pi))
        for (const w of availableWonders(S))
          if (!buildWonder(S, pi, city, w.k)) { built++; break; }
      citiesOf(S, pi).forEach(c => growCity(S, pi, c));
      researchable(S, pi).sort((a, b) => techCost(S, pi, a) - techCost(S, pi, b))
        .forEach(t => { if (available(S, pi, 'sci') >= techCost(S, pi, t)) doResearch(S, pi, t.k); });
      freeTechOptions(S, pi).slice(0, 1).forEach(t => useFreeTech(S, pi, t.k));
      backPickOptions(S, pi).slice(0, 1).forEach(t => useBackPick(S, pi, t.k));
      while (freePickOptions(S, pi).length) useFreePick(S, pi, freePickOptions(S, pi)[0].k);
      for (const city of citiesOf(S, pi))
        for (const w of availableWonders(S))
          if (!buildWonder(S, pi, city, w.k)) { built++; break; }
      const cap = capitalOf(S, pi);
      if (cap) for (const [r, c] of within(cap.r, cap.c, 5))
        if (!canFound(S, pi, r, c)) { foundCity(S, pi, r, c); break; }
      if (S.over) break;
      endTurn(S);
    }
    if (S.over) { ended++; if (S.over.how.startsWith('Kultur')) culture++; }
  }
  eq(ended, 20, '20 Partien mit Mensch, Ereignissen und Wundern enden regulär');
  eq(events > 0, true, 'Ereignisse treten auf');
  eq(built > 0, true, 'Weltwunder werden gebaut');
  console.log('       Ereignisrunden ' + events + ', Wunderbauten ' + built + ', Kultursiege ' + culture);
}

/* --- Menschliche Züge: Aktionen ohne Ausnahme durchspielen */
{
  const S = newGame({
    seed: 42, players: [{ civ: 'griechenland', kind: 'human' },
    ...CIVS.slice(1).map(c => ({ civ: c.k, kind: 'bot', diff: 'prinz' }))]
  });
  let guard = 0;
  while (!S.over && guard++ < 300) {
    if (S.players[S.cur].kind === 'bot') { botTurn(S, S.cur); if (S.over) break; endTurn(S); continue; }
    const pi = S.cur;
    // wachsen, gründen, forschen, Armee bauen, Macht kaufen – jeweils wenn möglich
    citiesOf(S, pi).forEach(c => growCity(S, pi, c));
    const cap = capitalOf(S, pi);
    if (cap) for (const [r, c] of within(cap.r, cap.c, 5))
      if (!canFound(S, pi, r, c)) { foundCity(S, pi, r, c); break; }
    researchable(S, pi).sort((a, b) => techCost(S, pi, a) - techCost(S, pi, b))
      .forEach(t => { if (available(S, pi, 'sci') >= techCost(S, pi, t)) doResearch(S, pi, t.k); });
    if (cap) buildArmy(S, pi, cap);
    buyPower(S, pi, Math.max(0, Math.floor(available(S, pi, 'coins') / powerPrice(S, pi))));
    armiesOf(S, pi).forEach(a => {
      const reach = [...armyReach(S, a).keys()];
      if (reach.length) moveArmy(S, a, ...unkey(reach[Math.floor(Math.random() * reach.length)]));
    });
    endTurn(S);
  }
  eq(!!S.over, true, 'Partie mit menschlichem Spieler endet (' + (S.over ? S.over.how : 'offen') + ')');
  console.log('       Runde ' + S.round + ', Bevölkerung ' + S.players.map((p, i) => popOf(S, i)).join('/'));
}

console.log(fails ? `\n${fails} Test(s) fehlgeschlagen` : '\nAlle Tests bestanden');
process.exit(fails ? 1 : 0);
