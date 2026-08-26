/* Hochzeivilization – Plättchenkarten.

   Eine Zufallskarte wird nicht mehr Feld für Feld ausgewürfelt, sondern aus Dreiecken
   zu je 15 Feldern zusammengelegt. Der Vorrat (TILE_POOL) ist von Hand entworfen,
   20 Stück; gezogen wird ohne Zurücklegen.

   Geometrie: gerechnet wird in Würfelkoordinaten (x + y + z = 0), z ist die Zeile.
   Ein Dreieck ist entweder
     Typ A:  Feld = a + (i, j, k)     mit i+j+k = 4,  Summe(a) = −4   → Spitze unten (▽)
     Typ B:  Feld = a − (i, j, k)     mit i+j+k = 4,  Summe(a) = +4   → Spitze oben (△)
   Beide werden über dasselbe Tripel (i, j, k) angesprochen. Eine Drehung um 120° um die
   Plättchenmitte ist genau (i, j, k) → (j, k, i) – deshalb passt jedes Plättchen in
   genau drei Lagen in denselben Platz, ohne je gespiegelt zu werden.

   Die Gelände eines Plättchens werden als fünf Zeilen von 5/4/3/2/1 Feldern notiert;
   so sieht es in einem A-Platz in Lage 0 auch auf der Karte aus (in einem B-Platz um
   180° gedreht, also weiterhin dasselbe Plättchen, nur andersherum gelegt).          */

const TILE_CELLS = 15;
const TILE_SIDE = 5;

/* Feldreihenfolge eines Plättchens: Zeile k (0 = die lange Kante), Position p von links.
   (i, j, k) = (p, 4−k−p, k). */
const TRI_IJK = [];
for (let k = 0; k <= 4; k++) for (let p = 0; p <= 4 - k; p++) TRI_IJK.push([p, 4 - k - p, k]);
const TRI_INDEX = {};
TRI_IJK.forEach((t, n) => { TRI_INDEX[t.join(',')] = n; });
// Zeilenanfang im Plättchentext: Zeile 0 hat 5 Felder, Zeile 4 eines
const TRI_ROW_START = [0, 5, 9, 12, 14];

/* Drehung um 120°: (i, j, k) → (j, k, i). TRI_ROT[o][n] sagt, welches Feld des
   Plättchentextes auf Feld n liegt, wenn das Plättchen o-mal gedreht wird. */
function triRotOnce(n) { const [i, j, k] = TRI_IJK[n]; return TRI_INDEX[[j, k, i].join(',')]; }
const TRI_ROT = [TRI_IJK.map((_, n) => n)];
TRI_ROT.push(TRI_ROT[0].map(triRotOnce));
TRI_ROT.push(TRI_ROT[1].map(triRotOnce));
// die drei mittigen Felder (alle Koordinaten ≥ 1) – dort setzen Bots ihre Hauptstadt
const TRI_MIDDLE = [[2, 1, 1], [1, 2, 1], [1, 1, 2]].map(t => TRI_INDEX[t.join(',')]);

/* ---------------------------------------------------------------- Plättchenvorrat
   Jede Zeile ist eine Feldzeile des Dreiecks (5/4/3/2/1). Bedingungen, die
   `node test.js` prüft:
   • die drei mittigen Felder sind Land (dort setzen Bots ihre Hauptstadt),
   • jedes mittige Feld bringt im ersten Zug mindestens 4 Nahrung (Münzen 2:1) –
     seine sechs Nachbarn liegen alle auf demselben Plättchen, das lässt sich also
     hier schon entscheiden.
   G Grasland · W Wald · B Gebirge · F Fluss · M Meer · I Insel                     */
const TILE_POOL = [
  { n: 'Weite Ebene', a: ['GGGGG', 'GGWG', 'GGG', 'WG', 'G'] },
  { n: 'Kornkammer', a: ['GGWGG', 'GGGG', 'GGG', 'GW', 'G'] },
  { n: 'Flusstal', a: ['GFGGW', 'GFGG', 'FGG', 'FW', 'F'] },
  { n: 'Zwei Ströme', a: ['FGGFG', 'GFGF', 'GFG', 'GF', 'G'] },
  { n: 'Waldland', a: ['WWGWW', 'WGGW', 'GGW', 'GW', 'W'] },
  { n: 'Taiga', a: ['WWGGW', 'WGWG', 'GGW', 'WG', 'B'] },
  { n: 'Urwald', a: ['WFWGW', 'WGFW', 'FGW', 'GW', 'W'] },
  { n: 'Hochland', a: ['BBGBG', 'BGGB', 'GGB', 'GB', 'B'] },
  { n: 'Gebirgskette', a: ['BBGBB', 'BGFB', 'GFB', 'BB', 'B'] },
  { n: 'Bergsee', a: ['BFBGB', 'FGFB', 'GFG', 'BF', 'B'] },
  { n: 'Karst', a: ['BGFGB', 'GGGB', 'GBG', 'FG', 'B'] },
  { n: 'Steppe', a: ['GGBGW', 'GGGB', 'GWG', 'GB', 'W'] },
  { n: 'Marschland', a: ['MFGFG', 'FGGF', 'GFG', 'FG', 'M'] },
  { n: 'Küste', a: ['MMGGW', 'MGGG', 'GGW', 'GG', 'B'] },
  { n: 'Bucht', a: ['MMMGG', 'MGGW', 'GGG', 'GW', 'G'] },
  { n: 'Fjorde', a: ['MWMGW', 'MGGW', 'GGW', 'MG', 'B'] },
  { n: 'Halbinsel', a: ['MGGGM', 'MGGM', 'GGG', 'MG', 'M'] },
  { n: 'Inselgruppe', a: ['MIMIM', 'MIIM', 'IIM', 'MI', 'M'] },
  { n: 'Archipel', a: ['IMIMM', 'IIIM', 'IIM', 'MI', 'I'] },
  { n: 'Ferne Riffe', a: ['MMIMG', 'MIIM', 'IIG', 'MI', 'M'] },
];
// Plättchentext → 15 Gelände in TRI_IJK-Reihenfolge
function tileTerrain(tile) { return tile.a.join('').split(''); }

/* ---------------------------------------------------------------- Plätze und Formen
   Jede Form nennt ihre Plätze (Reihenfolge = Zeichenreihenfolge), die Löcher – Felder
   der Karte, die zu keinem Plättchen gehören – und die Sitzplätze der Spieler.

   2 Spieler: sechs Dreiecke bilden ein Sechseck (Hexagon mit Radius 5). Genau in der
     Mitte bleibt ein Feld übrig – es wird nicht gefüllt, dort ist kein Feld. 6 · 15 ist
     immer um eins kleiner als das nächste Sechseck; das Loch ist also zwingend, und es
     bleibt als Loch stehen: ein unpassierbarer Punkt mitten in der Welt.
     Die beiden Spieler bekommen zwei gegenüberliegende Plättchen, die vier übrigen
     liegen offen.
   3 Spieler: dasselbe Sechseck (samt Loch), dazu je ein Dreieck an drei Kanten –
     zusammen ein großes Dreieck aus neun Plättchen.
   4 Spieler: zwei Reihen zu fünf Dreiecken, zusammen ein gestrecktes Sechseck ohne
     jedes Loch. Die beiden mittigen Plättchen liegen offen, um sie herum laufen acht;
     die Spieler sitzen auf jedem zweiten davon.                                     */
const SL = (t, x, y, z) => ({ t, a: [x, y, z] });
const TILE_SHAPES = {
  2: {
    key: 'hex6', name: 'Plättchenkarte (6 Dreiecke)',
    slots: [
      SL('A', -5, -1, 2), SL('B', -1, 4, 1), SL('B', 0, -2, 6),
      SL('A', 0, 0, -4), SL('A', 1, -6, 1), SL('B', 5, -1, 0),
    ],
    holes: [[0, -1, 1]],          // bleibt leer, siehe oben
    // die drei gegenüberliegenden Paare; gelost wird, welches die Spieler bekommen
    seatSets: [[0, 5], [4, 1], [2, 3]],
  },
  3: {
    key: 'tri9', name: 'Plättchenkarte (9 Dreiecke)',
    slots: [
      SL('A', -5, -1, 2), SL('B', -1, 4, 1), SL('B', 0, -2, 6),
      SL('A', 0, 0, -4), SL('A', 1, -6, 1), SL('B', 5, -1, 0),
      SL('A', 6, -6, -4), SL('A', -5, 5, -4), SL('A', -5, -6, 7),
    ],
    holes: [[0, -1, 1]],          // bleibt leer
    seatSets: [[6, 7, 8]],
  },
  4: {
    key: 'strip10', name: 'Plättchenkarte (10 Dreiecke)',
    slots: [
      SL('B', 5, -1, 0), SL('A', 6, -6, -4), SL('B', 11, -7, 0), SL('A', 12, -12, -4), SL('B', 17, -13, 0),
      SL('A', 0, -5, 1), SL('B', 5, -6, 5), SL('A', 6, -11, 1), SL('B', 11, -12, 5), SL('A', 12, -17, 1),
    ],
    holes: [],                    // der Streifenverbund deckt lückenlos ab
    // jedes zweite der acht äußeren Plättchen (2 und 7 liegen mittig)
    seatSets: [[1, 4, 8, 5]],
  },
};
/* Mindestabstand einer Hauptstadt zu jedem Feld der fremden Startplättchen. Die Regel
   verlangt 3 Felder Abstand zwischen Städten – gesperrt sind also genau die Felder, die
   einer fremden Hauptstadt zu nah kommen KÖNNTEN, egal wie der andere legt. Beide legen
   verdeckt; ein Verstoß wäre hinterher nicht mehr zu heilen. */
const PLACE_MIN_GAP = 3;

function slotCells(sl) {
  return TRI_IJK.map(([i, j, k]) => sl.t === 'A'
    ? [sl.a[0] + i, sl.a[1] + j, sl.a[2] + k]
    : [sl.a[0] - i, sl.a[1] - j, sl.a[2] - k]);
}
const cubeDist = (a, b) =>
  Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
// Würfel → Zeile/Spalte (odd-r). Die Formen sind so gelegt, dass die Verschiebung
// der Zeilen gerade ist; sonst würde sich der Versatz der Zeilen umkehren.
const cubeToRC = c => [c[2], c[0] + (c[2] - (c[2] & 1)) / 2];

/* Auf welche Felder des eigenen Plättchens darf die Hauptstadt? Rein geometrisch –
   das Gelände kommt in placeOptions dazu. */
function seatFreeCells(shape, seats, seatIdx) {
  const mine = slotCells(shape.slots[seats[seatIdx]]);
  const others = seats.filter((_, i) => i !== seatIdx)
    .flatMap(s => slotCells(shape.slots[s]));
  return mine.map(m => others.every(o => cubeDist(m, o) >= PLACE_MIN_GAP));
}

/* ---------------------------------------------------------------- Kartenplan
   Zieht die Plättchen und verteilt die Sitzplätze. Die Spieler legen danach ihr
   eigenes Plättchen (Lage + Hauptstadt); die offenen liegen sofort fest.            */
function tilePlan(civs, seed) {
  const n = civs.length;
  const shape = TILE_SHAPES[n];
  if (!shape) return null;
  const rnd = mapRng(seed);
  const pool = TILE_POOL.map((_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {          // mischen
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const seats = shape.seatSets[Math.floor(rnd() * shape.seatSets.length)].slice();
  const plan = {
    n, shapeKey: shape.key, name: shape.name,
    tiles: shape.slots.map((_, i) => pool[i]),
    ori: shape.slots.map(() => Math.floor(rnd() * 3)),
    seats: seats.map((slot, i) => ({
      slot, civ: civs[i], o: null, cell: null,
      free: seatFreeCells(shape, seats, i),
    })),
    revealed: false,
  };
  return plan;
}
const planShape = plan => TILE_SHAPES[plan.n];
const seatOfCiv = (plan, civ) => plan.seats.find(s => s.civ === civ);
const isSeatSlot = (plan, slot) => plan.seats.some(s => s.slot === slot);

/* Gelände eines Plättchens in einer Lage: Feld n zeigt den Text an Position TRI_ROT[o][n] */
function tileFaceTerrain(tileIdx, o) {
  const art = tileTerrain(TILE_POOL[tileIdx]);
  return TRI_ROT[o].map(k => art[k]);
}
/* Felder, auf die die Hauptstadt dieses Sitzes gesetzt werden darf: Land, kein Meer,
   und weit genug von den anderen Startplättchen weg. */
function placeOptions(plan, seat, o) {
  const face = tileFaceTerrain(plan.tiles[seat.slot], o);
  return face.map((t, i) => seat.free[i] && TERRAIN[t].land && !TERRAIN[t].block);
}
function placeSeat(plan, seat, o, cell) {
  if (!(o >= 0 && o < 3)) return 'Ungültige Lage.';
  if (!placeOptions(plan, seat, o)[cell]) return 'Hier ist kein Platz für die Hauptstadt.';
  seat.o = o; seat.cell = cell;
  return null;
}
/* Bots: zufällige Lage, Hauptstadt auf einem der drei mittigen Felder. */
function botPlaceSeat(plan, seat, rnd) {
  const o = Math.floor(rnd() * 3);
  const ok = placeOptions(plan, seat, o);
  const mid = TRI_MIDDLE.filter(i => ok[i]);
  const list = mid.length ? mid : ok.map((v, i) => v ? i : -1).filter(i => i >= 0);
  return placeSeat(plan, seat, o, list[Math.floor(rnd() * list.length)]);
}
const planDone = plan => plan.seats.every(s => s.cell != null);

/* ---------------------------------------------------------------- Karte bauen
   `show` bestimmt, welche Plätze schon zu sehen sind (Standard: die offenen und alle
   fertig gelegten). Die Größe der Karte hängt nie davon ab – sie kommt aus der Form,
   damit das Bild beim Legen nicht springt. Die Löcher der Form bleiben „Kein Feld";
   sie werden bewusst nicht aufgefüllt.                                              */
function tileMap(plan, opts) {
  opts = opts || {};
  const shape = planShape(plan);
  const all = shape.slots.flatMap(slotCells).concat(shape.holes);
  const rcs = all.map(cubeToRC);
  const r0 = Math.min(...rcs.map(x => x[0])), c0 = Math.min(...rcs.map(x => x[1]));
  const rows = Math.max(...rcs.map(x => x[0])) - r0 + 1;
  const cols = Math.max(...rcs.map(x => x[1])) - c0 + 1;
  const grid = [];
  for (let r = 0; r < rows; r++) grid.push(new Array(cols).fill('X'));
  const put = (cube, t) => { const [r, c] = cubeToRC(cube); grid[r - r0][c - c0] = t; };
  const visible = slot => {
    if (opts.show) return opts.show.includes(slot);
    const seat = plan.seats.find(s => s.slot === slot);
    return !seat || seat.cell != null;
  };
  shape.slots.forEach((sl, slot) => {
    if (!visible(slot)) return;
    const seat = plan.seats.find(s => s.slot === slot);
    const o = seat ? (opts.o != null && opts.seat === seat ? opts.o : seat.o) : plan.ori[slot];
    if (o == null) return;
    const face = tileFaceTerrain(plan.tiles[slot], o);
    slotCells(sl).forEach((cube, i) => put(cube, face[i]));
  });
  const capitals = {};
  plan.seats.forEach(seat => {
    const cell = (opts.seat === seat && opts.cell != null) ? opts.cell : seat.cell;
    if (cell == null || !visible(seat.slot)) return;
    if (opts.caps && !opts.caps.includes(seat.civ)) return;
    const [r, c] = cubeToRC(slotCells(shape.slots[seat.slot])[cell]);
    capitals[seat.civ] = [r - r0, c - c0];
  });
  return {
    name: plan.name, rows: grid.map(g => g.join('')), capitals,
    random: true, tiles: plan.shapeKey,
  };
}
/* Felder eines Plättchens als [Zeile, Spalte] – für Hervorhebungen in der Oberfläche */
function slotRC(plan, slot) {
  const shape = planShape(plan);
  const all = shape.slots.flatMap(slotCells).concat(shape.holes).map(cubeToRC);
  const r0 = Math.min(...all.map(x => x[0])), c0 = Math.min(...all.map(x => x[1]));
  return slotCells(shape.slots[slot]).map(cube => {
    const [r, c] = cubeToRC(cube);
    return [r - r0, c - c0];
  });
}
