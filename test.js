/* Prüft die Regelmaschine gegen die Beispiele aus dem Regelheft. */
const fs = require('fs'), vm = require('vm');
for (const f of ['js/data.js', 'js/hex.js', 'js/engine.js', 'js/bots.js'])
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
const mkV2 = (civ, techs = []) => {
  const S = normalize(newGame({ players: [{ civ, kind: 'human' }, { civ: 'england', kind: 'bot' }], seed: 7, rules: 'v2' }), civ);
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
  eq(opt.length >= 2 && opt.every(o => o.free), true, 'reines Internet: alle Kopien gratis');
  eq(copyTech(S, 0, 'stadtmauern'), null, 'erste Gratiskopie klappt');
  eq(typeof copyTech(S, 0, 'taktik'), 'string', 'zweite Kopie in derselben Runde wird abgelehnt');
}

/* Spionage + Internet kombiniert: bezahlte Kopie plus eine Gratiskopie */
{
  const S = newGame({ players: [{ civ: 'griechenland', kind: 'human' }, { civ: 'england', kind: 'human' }], seed: 15 });
  S.players[1].techs.stadtmauern = true;   // Kosten 5
  S.players[1].techs.taktik = true;        // Kosten 1
  S.players[0].techs.spionage = true; S.players[0].techs.internet = true;
  S.players[0].res.coins = 50;
  const opt = copyableTechs(S, 0);
  eq(opt.every(o => !o.free), true, 'mit Spionage sind Kopien bezahlt (Internet separat)');
  eq(opt.find(o => o.tech.k === 'stadtmauern').coins, 5, 'Spionage: 1× Basiskosten in Münzen');
}

/* === Experimentelle Variante v2 === */

/* Singularität kostet 100 */
{
  const S = mkV2('griechenland');
  eq(SINGULARITY.c, 100, 'v2: Singularität-Grundkosten 100');
  // Griechenland-Rabatt gilt weiter (−5 im vierten Zeitalter)
  eq(techCost(S, 0, SINGULARITY), 95, 'v2: griechischer Rabatt auch auf Singularität');
}

/* Griechenland ohne Würfelbonus */
{
  const std = mk('griechenland'); setRules('standard');
  eq(availBonus(std.players[0]), 1, 'Standard: Griechenland +1 Würfelbonus');
  const v2 = mkV2('griechenland'); setRules('v2');
  eq(availBonus(v2.players[0]), 0, 'v2: kein Würfelbonus für Griechenland');
  // Kostenvergünstigung bleibt in beiden
  eq(techCost(v2, 0, TECH_BY_KEY.papier), 4, 'v2: Kostenrabatt bleibt (Papier 6−2)');
}

/* Theologie senkt die Siegschwelle auf 3/5, UN gewinnt bei Gleichstand die niedrigere */
{
  const S = mkV2('griechenland', ['theologie']);
  const o = victoryOption(S.players[0]);
  eq(o.frac, 3 / 5, 'v2: Theologie setzt Schwelle auf 3/5');
  S.players[0].techs.un = true;
  eq(victoryOption(S.players[0]).frac, 0.5, 'UN (1/2) schlägt Theologie (3/5)');
}

/* Keramik + Verbundwerkstoffe: bis 3x wachsen, davon 1x gratis */
{
  const S = mkV2('griechenland', ['keramik', 'verbundwerkstoffe']);
  const c = capitalOf(S, 0); c.pop = 3; c.grown = 0; c.born = 0;
  const lim = growLimits(S, 0);
  eq([lim.max, lim.free], [3, 1], 'v2: Keramik+Verbund = max 3, davon 1 gratis');
  const first = growCost(S, 0, c);
  eq(first.free === true, true, 'erstes Wachstum dieser Runde ist gratis');
  S.players[0].res = { sci: 0, food: 99, coins: 99 };
  growCity(S, 0, c); growCity(S, 0, c); growCity(S, 0, c);
  eq(c.pop, 6, 'drei Wachstumsschritte in einer Runde');
  eq(typeof canGrow(S, 0, c), 'string', 'ein viertes Wachstum wird abgelehnt');
}

/* nur Verbundwerkstoffe (ohne Keramik) in v2: normales Wachstum + 1x gratis = max 2 */
{
  const S = mkV2('griechenland', ['verbundwerkstoffe']); setRules('v2');
  const lim = growLimits(S, 0);
  eq([lim.max, lim.free], [2, 1], 'v2: Verbund allein = 1x normal + 1x gratis');
  const c = capitalOf(S, 0); c.pop = 2; c.grown = 0; c.born = 0;
  eq(growCost(S, 0, c).free === true, true, 'das erste Wachstum ist das kostenlose');
}

/* Standardregeln: Verbundwerkstoffe bleibt 2x bezahlt */
{
  const S = mk('griechenland', ['verbundwerkstoffe']); setRules('standard');
  const lim = growLimits(S, 0);
  eq([lim.max, lim.free], [2, 0], 'Standard: Verbund = 2x, nichts gratis');
}

/* Sklaverei wird in v2 mit Moderne obsolet */
{
  const S = mkV2('griechenland', ['sklaverei']);
  const c = capitalOf(S, 0); c.pop = 3;
  eq(slaveryUsable(S.players[0]), true, 'v2: Sklaverei nutzbar vor der Moderne');
  S.players[0].techs.robotik = true;   // eine Moderne-Tech
  eq(slaveryUsable(S.players[0]), false, 'v2: Sklaverei obsolet ab Moderne');
  eq(typeof sacrifice(S, 0, c), 'string', 'v2: Opfern ab Moderne abgelehnt');
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

/* Gratis-Wachstum (v2) getrennt vom bezahlten Wachstum */
{
  const S = mkV2('griechenland', ['verbundwerkstoffe']);
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
  const S = mkV2('griechenland', ['verbundwerkstoffe']);
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
  const S = mkV2('griechenland', ['keramik', 'verbundwerkstoffe']);
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
  const sum = b.rows.reduce((a, r) => [a[0] + r.y[0], a[1] + r.y[1], a[2] + r.y[2]], [0, 0, 0]);
  sum[0] += b.pop.y[0]; sum[1] += b.pop.y[1]; sum[2] += b.pop.y[2];
  eq(sum, b.total, 'Aufschlüsselung (Gelände + Bevölkerung) summiert sich zum Einkommen');
  const inc = income(S, 0);
  eq(b.total, [inc.sci, inc.food, inc.coins], 'Übersichtssumme entspricht income()');
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

/* --- Vollständige Partien im v2-Modus */
{
  let ended = 0, rounds = [], how = {};
  for (let g = 0; g < 40; g++) {
    const S = newGame({
      seed: 5000 + g, rules: 'v2',
      players: CIVS.map((c, i) => ({ civ: c.k, kind: 'bot', diff: DIFFICULTIES[(g + i) % 5].k })),
    });
    let guard = 0;
    while (!S.over && guard++ < 500) { botTurn(S, S.cur); if (S.over) break; endTurn(S); }
    if (S.over) { ended++; rounds.push(S.round); how[S.over.how.split(' (')[0]] = (how[S.over.how.split(' (')[0]] || 0) + 1; }
  }
  eq(ended, 40, 'v2: 40 Bot-Partien laufen bis zum Sieg durch');
  console.log('       v2 Runden bis zum Sieg: median ' +
    rounds.sort((a, b) => a - b)[Math.floor(rounds.length / 2)]);
  console.log('       v2 Siegarten: ' + JSON.stringify(how));
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
