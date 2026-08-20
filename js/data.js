/* Hochzeivilization – Spieldaten
   Alle Werte aus den Originalregeln (Regelheft + Technologiebogen).
   Erratum berücksichtigt: "Kernphysik" und "Raumfahrt" existieren nicht. */

const AGES = ['Antike', 'Mittelalter', 'Industrialisierung', 'Moderne'];
const FIELDS = ['Forschung', 'Produktion', 'Militär', 'Spezial'];

// Zeitalter anhand der Kosten (Reihe im Bogen)
function ageOfCost(c) { return c <= 5 ? 0 : c <= 10 ? 1 : c <= 15 ? 2 : 3; }

// Geländeerträge: [Wissenschaft, Nahrung, Münzen]
const TERRAIN = {
  G: { key: 'G', name: 'Grasland', yield: [0, 1, 0], land: true, color: '#adba7c' },
  W: { key: 'W', name: 'Wald', yield: [0, 0, 1], land: true, color: '#708a58' },
  B: { key: 'B', name: 'Gebirge', yield: [1, 0, 1], land: true, color: '#aa967e' },
  F: { key: 'F', name: 'Fluss', yield: [0, 1, 1], land: true, color: '#70a0ba' },
  M: { key: 'M', name: 'Meer', yield: [0, 0, 1], land: false, color: '#96bac6' },
  I: { key: 'I', name: 'Insel', yield: [1, 1, 1], land: true, color: '#d0c48a' },
  // Vulkan: entsteht nur durch das Ereignis "Vulkanausbruch" – unpassierbar, kein Ertrag.
  V: { key: 'V', name: 'Vulkan', yield: [0, 0, 0], land: true, color: '#6b5a4c', block: true },
};
// Stadt: pro Bevölkerungspunkt +1 Wissenschaft, -1 Nahrung, +1 Münze
const CITY_YIELD = [1, -1, 1];

/* ---------------------------------------------------------------- Technologien */
// f = Feld, c = Kosten, e = Effekttext, k = Effekt-Schlüssel für die Engine
const TECHS = [
  // Forschung
  { k: 'schrift', n: 'Schrift', f: 0, c: 1, e: 'Stadt: +1 Wissenschaft' },
  { k: 'mathematik', n: 'Mathematik', f: 0, c: 2, e: 'Wald: +1 Wissenschaft' },
  { k: 'astronomie', n: 'Astronomie', f: 0, c: 3, e: 'Meer: +1 Wissenschaft' },
  { k: 'philosophie', n: 'Philosophie', f: 0, c: 4, e: '+1 beim Auswürfeln von Techverfügbarkeit' },
  { k: 'papier', n: 'Papier', f: 0, c: 6, e: 'Grasland: +1 Wissenschaft' },
  { k: 'alchemie', n: 'Alchemie', f: 0, c: 8, e: '1:1 Wissenschaft → Münzen' },
  { k: 'buchdruck', n: 'Buchdruck', f: 0, c: 9, e: 'Fluss: +1 Wissenschaft' },
  { k: 'universitaet', n: 'Universitätswesen', f: 0, c: 10, e: 'Stadt: +1 Wissenschaft' },
  { k: 'wiss_methode', n: 'Wissenschaftliche Methode', f: 0, c: 11, e: 'Techkosten −2/−4/−6/−8/−10 (je Zeitalter)' },
  { k: 'chemie', n: 'Chemie', f: 0, c: 12, e: 'Gebirge: +1 Wissenschaft' },
  { k: 'elektrizitaet', n: 'Elektrizität', f: 0, c: 13, e: 'Wald: +1 Wissenschaft' },
  { k: 'biologie', n: 'Biologie', f: 0, c: 15, e: 'Grasland: +1 Wissenschaft' },
  { k: 'computertechnik', n: 'Computertechnik', f: 0, c: 17, e: '1:1 Münzen → Wissenschaft' },
  { k: 'gentechnik', n: 'Gentechnik', f: 0, c: 18, e: 'Wissenschaft nutzen um Stadt zu füttern' },
  { k: 'raumfahrt', n: 'Raumfahrt', f: 0, c: 19, wo: true, e: 'Bei jedem Wunderbau eine Technologie gratis' },
  { k: 'ki', n: 'Künstliche Intelligenz', f: 0, c: 20, e: 'Wald: +1 Wissenschaft' },
  // Produktion
  { k: 'landwirtschaft', n: 'Landwirtschaft', f: 1, c: 1, e: 'Grasland: +1 Nahrung' },
  { k: 'fischerei', n: 'Fischerei', f: 1, c: 2, e: 'Meer: +1 Nahrung' },
  { k: 'rad', n: 'Rad', f: 1, c: 3, e: 'Straßen' },
  { k: 'keramik', n: 'Keramik', f: 1, c: 4, e: 'Städte 2× pro Runde erweitern' },
  { k: 'bewaesserung', n: 'Bewässerung', f: 1, c: 5, e: 'Gebirge: +1 Nahrung' },
  { k: 'segeln', n: 'Segeln', f: 1, c: 7, e: 'Meer: +1 Nahrung' },
  { k: 'muehlentechnik', n: 'Mühlentechnik', f: 1, c: 8, e: 'Fluss: +1 Münze' },
  { k: 'baukraene', n: 'Baukräne', f: 1, c: 9, wo: true, e: 'Weltwunder kosten 2/4/6/8/… weniger' },
  { k: 'gilden', n: 'Gilden', f: 1, c: 10, e: '1:1 Münzen → Nahrung' },
  { k: 'dampfmaschine', n: 'Dampfmaschine', f: 1, c: 11, e: 'Keine Münzkosten für Stadterweiterung' },
  { k: 'eisenbahn', n: 'Eisenbahn', f: 1, c: 13, e: 'Eisenbahn' },
  { k: 'kunstduenger', n: 'Kunstdünger', f: 1, c: 14, e: 'Wald: +1 Nahrung' },
  { k: 'fliessband', n: 'Fließband', f: 1, c: 15, e: 'Stadt: +1 Münze' },
  { k: 'verbundwerkstoffe', n: 'Verbundwerkstoffe', f: 1, c: 16, e: '1× zusätzliches, kostenloses Wachstum pro Stadt' },
  { k: 'gruene_revolution', n: 'Grüne Revolution', f: 1, c: 17, e: 'Grasland: +1 Münze' },
  { k: 'containerlogistik', n: 'Containerlogistik', f: 1, c: 18, e: 'Meer: +1 Münze' },
  { k: 'robotik', n: 'Robotik', f: 1, c: 19, e: 'Stadt: +1 Münze' },
  // Militär
  { k: 'taktik', n: 'Taktik', f: 2, c: 1, e: 'Flankieren von zwei beliebigen Positionen' },
  { k: 'eisenverarbeitung', n: 'Eisenverarbeitung', f: 2, c: 2, e: '4 Münzen = 1 Macht' },
  { k: 'belagerung', n: 'Belagerungsmaschinen', f: 2, c: 4, e: '+5 Angriff gegen Städte' },
  { k: 'stadtmauern', n: 'Stadtmauern', f: 2, c: 5, e: 'Städte haben +5 Verteidigung' },
  { k: 'burgenbau', n: 'Burgenbau', f: 2, c: 7, e: 'Städte enthalten unbewegliche Armee' },
  { k: 'stahl', n: 'Stahl', f: 2, c: 8, e: 'Machtverlust = 1/3' },
  { k: 'militaerlogistik', n: 'Militärlogistik', f: 2, c: 6, wo: true, e: '+1 Bewegungsweite je eigenem Weltwunder' },
  { k: 'schiesspulver', n: 'Schießpulver', f: 2, c: 10, e: 'Kontrollzone' },
  { k: 'gewehre', n: 'Gewehre', f: 2, c: 11, e: '3 Münzen = 1 Macht' },
  { k: 'panzerschiff', n: 'Panzerschiff', f: 2, c: 13, e: 'Bewegung = 6, Bewegung auf und über Wasser' },
  { k: 'dynamit', n: 'Dynamit', f: 2, c: 14, e: 'Armeen haben doppelten Angriff gegen Städte' },
  { k: 'maschinengewehr', n: 'Maschinengewehr', f: 2, c: 15, e: 'Städte haben +2 Verteidigung/Größe' },
  { k: 'panzer', n: 'Panzer', f: 2, c: 16, e: 'Machtverlust = 1/4' },
  { k: 'luftwaffe', n: 'Luftwaffe', f: 2, c: 17, e: 'Bewegung = 9, Hindernisse ignorieren' },
  { k: 'raketentechnik', n: 'Raketentechnik', f: 2, c: 19, e: 'Armeen haben einen Ring mehr Reichweite' },
  { k: 'atomwaffen', n: 'Atomwaffen', f: 2, c: 20, e: '1x pro Runde ein Feld mit Umland wählen, alle Armeen zerstören' },
  // Spezial
  { k: 'navigation', n: 'Navigation', f: 3, c: 1, e: 'Bewegung über Wasser' },
  { k: 'demokratie', n: 'Demokratie', f: 3, c: 3, e: 'Armeekosten = 4 × Anzahl' },
  { k: 'wallfahrt', n: 'Wallfahrt', f: 3, c: 4, wo: true, e: 'Je eigenem Weltwunder +3 auf alle Erträge' },
  { k: 'sklaverei', n: 'Sklaverei', f: 3, c: 5, e: 'Stadtbevölkerung opfern → 10 Münzen · wird in der Moderne obsolet' },
  { k: 'rittertum', n: 'Rittertum', f: 3, c: 6, e: '1 Bevölkerungsverlust beim Erobern' },
  { k: 'kundschafterei', n: 'Kundschafterei', f: 3, c: 7, e: 'Tech kopieren (3× Kosten in Münzen)' },
  { k: 'buerokratie', n: 'Bürokratie', f: 3, c: 8, e: 'Hauptstadt produziert doppelt' },
  { k: 'kartografie', n: 'Kartografie', f: 3, c: 9, e: 'Keine Distanzkosten' },
  { k: 'theologie', n: 'Theologie', f: 3, c: 10, e: '>3/5 der Bevölkerung zum Sieg' },
  { k: 'nationalismus', n: 'Nationalismus', f: 3, c: 11, e: 'Armeekosten = 2 × Anzahl' },
  { k: 'spionage', n: 'Spionage', f: 3, c: 12, e: 'Tech kopieren (1× Kosten in Münzen)' },
  { k: 'militaergericht', n: 'Militärgericht', f: 3, c: 13, e: 'Kein Bevölkerungsverlust beim Erobern' },
  { k: 'kolonialismus', n: 'Kolonialismus', f: 3, c: 14, e: 'Für 5 Münzen Feld kaufen' },
  { k: 'massenmedien', n: 'Massenmedien', f: 3, c: 16, e: 'Münzen nutzen um Stadt zu füttern' },
  { k: 'un', n: 'Vereinte Nationen', f: 3, c: 17, e: '>1/2 der Bevölkerung zum Sieg' },
  { k: 'oekologie', n: 'Ökologie', f: 3, c: 18, e: 'Städte: +1 Nahrung / 2 Bevölkerung (abrunden)' },
  { k: 'internet', n: 'Internet', f: 3, c: 19, e: '1 Tech/Runde kopieren' },
];
TECHS.forEach(t => { t.age = ageOfCost(t.c); });

/* ----------------------------------------------------------------- Regelkonstanten
   Es gibt nur noch einen Regelsatz: die früher "experimentell v2" genannten Regeln
   sind jetzt die Hauptvariante (Singularität 100, Keramik + Theologie in der
   Techliste, Verbundwerkstoffe = kostenloses Wachstum, Sklaverei ab Moderne
   obsolet, Siegschwellen stapeln nicht, Bots forschen zweimal).
   Griechenland hat KEINEN Würfelbonus auf die Techverfügbarkeit (nur den Rabatt). */
const SINGULARITY_BASE = 100;
const KREML_SURCHARGE = 50;        // Weltwunder "Der Kreml": Singularität teurer, für alle
const VICTORY_FRAC = 2 / 3;        // Standard-Siegschwelle
const THEOLOGY_FRAC = 3 / 5;       // mit Theologie
const UN_FRAC = 1 / 2;             // mit Vereinte Nationen
const BOT_RESEARCH_TWICE = true;
const SLAVERY_OBSOLETE_IN_MODERN = true;

const TECHS_ACTIVE = TECHS;
const TECH_BY_KEY = {};
TECHS_ACTIVE.forEach(t => { TECH_BY_KEY[t.k] = t; });
/* Technologien mit `wo: true` gehören zur Weltwunder-Erweiterung und existieren nur in
   einer Partie mit Weltwundern. Ohne Spielstand (z. B. in Tabellen) zählt die Grundliste. */
function techActive(S, t) { return !t.wo || !!(S && S.wo); }
function techPool(S) { return TECHS_ACTIVE.filter(t => techActive(S, t)); }
const SINGULARITY = {
  k: 'singularitaet', n: 'Singularität', c: SINGULARITY_BASE,
  e: 'Erfordert mind. 1 Technologie der Moderne in jedem Feld. Du gewinnst das Spiel.',
};
// Techs je Feld und Zeitalter, nach Kosten sortiert (billigere zuerst)
function techsIn(field, age, S) {
  return techPool(S).filter(t => t.f === field && t.age === age).sort((a, b) => a.c - b.c);
}

/* ---------------------------------------------------------------- Zivilisationen */
/* Jede Zivilisation hat drei wählbare Fähigkeiten: die Grundfähigkeit und die zwei
   Alternativen aus dem Zivilisationsbogen. Im Aufbau wird eine davon gewählt.
   Bots erhalten grundsätzlich KEINE Zivilisationsfähigkeit. */
const CIVS = [
  {
    k: 'griechenland', n: 'Griechenland', sym: 'star', color: '#2f6f8f',
    ability: 'Techs 1/2/3/4/5 günstiger (je Zeitalter)',
    abilities: [
      { k: 'basis', n: 'Günstige Forschung', e: 'Techs 1/2/3/4/5 günstiger (je Zeitalter)' },
      { k: 'gratistech', n: 'Freie Forschung', e: '1× pro Runde eine verfügbare Technologie der Industrialisierung oder früher umsonst erforschen' },
      { k: 'rueckschau', n: 'Rückschau', e: 'Bei jeder erforschten Technologie zusätzlich eine beliebige (auch nicht freigeschaltete) eines früheren Zeitalters umsonst' },
    ],
  },
  {
    k: 'england', n: 'England', sym: 'cross', color: '#8f2f3f',
    ability: 'Münzen = Nahrung für alle Belange',
    abilities: [
      { k: 'basis', n: 'Handelsreich', e: 'Münzen = Nahrung für alle Belange (1:1 in beide Richtungen)' },
      { k: 'gruenden', n: 'Kolonisten', e: 'Städte gründen kostet keine Basiskosten (nur Distanzkosten)' },
      { k: 'kuestenstaedte', n: 'Seemacht', e: 'Jede Stadt, die an Meer angrenzt, bringt +2 Wissenschaft, Nahrung und Münzen' },
    ],
  },
  {
    k: 'russland', n: 'Russland', sym: 'square', color: '#3f6f3f',
    ability: '+1 Nahrung in Wald',
    abilities: [
      { k: 'basis', n: 'Taiga', e: '+1 Nahrung in Wald' },
      { k: 'wachstum', n: 'Fruchtbarkeit', e: 'Bevölkerungswachstum kostet keine Nahrung' },
      { k: 'siedler', n: 'Siedlertrecks', e: 'Städte werden mit 2 Bevölkerung gegründet' },
    ],
  },
  {
    k: 'wikinger', n: 'Wikingerreich', sym: 'triangle', color: '#6f4f8f',
    ability: 'Kostenlose Armee am Start; eine Armee zählt nicht für Baukosten von Armeen',
    abilities: [
      { k: 'basis', n: 'Seefahrer', e: 'Kostenlose Armee am Start; eine Armee zählt nicht für Baukosten von Armeen' },
      { k: 'kampfertrag', n: 'Beutezüge', e: 'Steht eine Armee neben einer gegnerischen Armee oder Stadt, bringt sie je Punkt Überlegenheit 1 Wissenschaft, Nahrung und Münze' },
      { k: 'armeemacht', n: 'Kriegerkultur', e: 'Jede eigene Armee gibt +2 Macht' },
    ],
  },
];
const CIV_BY_KEY = {};
CIVS.forEach(c => { CIV_BY_KEY[c.k] = c; });
// Barbaren: neutrale Fraktion, entsteht nur durch das Ereignis "Barbareninvasion".
const BARB_CIV = { k: 'barbaren', n: 'Barbaren', sym: 'skull', color: '#7a6a55', ability: '' };

/* Zwei Karten stehen zur Wahl. Die Originalkarte ist aus dem gedruckten Bogen
   ausgemessen, die große ist im selben Stil erzeugt: zusammenhängende Landmassen,
   Gebirgszüge mit Flussläufen, Inseln – nur weiter und stärker durchmischt. */
const MAP_ORIGINAL = {
  name: 'Originalkarte (12 × 18)',
  rows: [
    'MIMMBBWBGGWWWWWWWM',
    'MMMBBWGGWMMWWWFWWB',
    'MMMMMGGWMMGWWWWFWB',
    'MMGGMMGFGFWWWGGWWB',
    'MMGGMGFGGGWWWWGGFB',
    'MMGGMGFGGGBWWGGGFM',
    'MMMGFGBBGBBGGFGGGM',
    'MMGFGGBGGGFFFFGGGG',
    'MGGBGMGFGGGGGMMMBB',
    'MFGGMMMGGMGGGMMGGB',
    'MGGGMMMMGMMGGMIGGM',
    'MGGMMMMIMIMIMIMMGM',
  ],
  capitals: { wikinger: [1, 8], russland: [4, 15], england: [5, 3], griechenland: [9, 10] },
};

const MAP_GROSS = {
  name: 'Große Karte (15 × 24)',
  rows: [
    'MMMMMMMMIMMMMMMMMIMMMMMM',
    'MGGGMMMMMMGGGGGWMMMMMGGM',
    'MGGGBMMMGGWGGGGWWMGGGGBM',
    'MMMBBBGWWFFFFGGGWFFFGGGM',
    'MMMMWFFFFFWWWGGWGGGGFGMM',
    'MMMBGBWGWWWWWWGGGBBFGBMM',
    'MMGGGGGGGWWWWWGWGBBBBWMM',
    'MGGGGGGGGGWWWGGGGBGBGMMM',
    'MGGGWGGGWWWWWGGGGBBGFGMM',
    'MMFFGGGGGWFWWWGGFGGGFFMM',
    'IMGGFGGGGWFWWGGGGFGGGGMM',
    'MMBBBGGGWFGWWGWBBFGGGGMM',
    'IMBBWBFFFFGWBWGWGGFFGBMM',
    'MBWBBFWWWWWGGMMMMMMMGGMI',
    'MMMMMMMMMMMMMMMMMMMMMMMM',
  ],
  capitals: { wikinger: [2, 11], russland: [3, 20], england: [8, 3], griechenland: [12, 13] },
};

// Reihenfolge bestimmt die Vorauswahl im Aufbau: die Originalkarte ist Standard.
const MAPS = [MAP_ORIGINAL, MAP_GROSS];
const DEFAULT_MAP = MAP_ORIGINAL;

/* Kampfauslegung – beide Seiten addieren, wie vom Autor bestätigt:
   zwei Armeen an derselben Stadt greifen doppelt so stark an wie eine. */
const COMBAT = {
  attackStacks: true,    // jede angreifende Armee bringt den vollen Machtwert
  defenseStacks: true,   // jede benachbarte Verteidigerarmee ebenfalls
};

const DIFFICULTIES = [
  { k: 'siedler', n: 'Siedler', min: 6 },
  { k: 'haeuptling', n: 'Häuptling', min: 5 },
  { k: 'prinz', n: 'Prinz', min: 4 },
  { k: 'koenig', n: 'König', min: 3 },
  { k: 'david', n: 'David', min: 2 },
];

/* ---------------------------------------------------------------- Ereignisse
   Aus dem Ereignisbogen. Erster Würfel = Zeile (1–6), zweiter = Spalte.
   Hard: 1/2 → Spalte 1, 3/4 → Spalte 2, 5/6 → Spalte 3, also jede Runde ein Ereignis.
   Easy: nur 1/3/5 treffen ihre Spalte, 2/4/6 gehen ins Leere.
   Bots sind von Ereignissen nie betroffen. */
const EVENT_ROWS = [
  [
    { k: 'pest', n: 'Die Pest', e: 'Alle Städte verlieren die Hälfte ihrer Bevölkerung (aufgerundet).' },
    { k: 'erdbeben', n: 'Erdbeben', e: 'Ein zufälliges eigenes Weltwunder wird zerstört und kann nicht wieder gebaut werden.' },
    { k: 'piraterie', n: 'Piraterie', e: 'Meeresfelder bringen diese Runde keine Erträge.' },
  ],
  [
    { k: 'kriegsmuedigkeit', n: 'Kriegsmüdigkeit', e: 'Der Machtwert wird auf 0 zurückgesetzt.' },
    { k: 'sturmflut', n: 'Sturmflut', e: 'Städte an Meer oder Fluss verlieren ein Drittel ihrer Bevölkerung (aufgerundet) und können diese Runde nicht wachsen.' },
    { k: 'duerre', n: 'Dürre', e: 'Grasland bringt diese Runde keine Erträge.' },
  ],
  [
    { k: 'revolution', n: 'Revolution', e: 'Die Hauptstadt produziert diese Runde nichts, verbraucht aber trotzdem normal Nahrung.' },
    { k: 'barbaren', n: 'Barbareninvasion', e: 'Eine ausgewürfelte Stadt (nicht die Hauptstadt) wird von Barbaren mit Macht 10 oder dem doppelten eigenen Machtwert angegriffen – je nachdem, was mehr ist.' },
    { k: 'hochwasser', n: 'Hochwasser', e: 'Flüsse bringen diese Runde keine Erträge.' },
  ],
  [
    { k: 'dunkles_zeitalter', n: 'Dunkles Zeitalter', e: 'Diese Runde kann nicht geforscht werden.' },
    { k: 'vulkan', n: 'Vulkanausbruch', e: 'Ein Feld neben einer ausgewürfelten Stadt wird zum Vulkan. Die Stadt verliert drei Viertel ihrer Bevölkerung (aufgerundet) oder 3 Bevölkerung – je nachdem, was mehr ist.' },
    { k: 'waldbrand', n: 'Waldbrände', e: 'Wälder bringen diese Runde keine Erträge.' },
  ],
  [
    { k: 'buergerkrieg', n: 'Bürgerkrieg', e: 'Alle Armeen werden zerstört. Diese Runde können Armeen und Macht auch mit Nahrung bezahlt werden.' },
    { k: 'wirtschaftskrise', n: 'Wirtschaftskrise', e: 'Diese Runde werden keine Münzen produziert.' },
    { k: 'lawinen', n: 'Lawinen', e: 'Gebirge bringt diese Runde keine Erträge.' },
  ],
  [
    { k: 'hungersnot', n: 'Hungersnot', e: 'Diese Runde wird keine Nahrung produziert. Der Wechselkurs Münzen → Nahrung ist 4:1 (mit Gilden 2:1).' },
    { k: 'atomprotest', n: 'Atomwaffenproteste', e: 'Es können dauerhaft keine Atomwaffen mehr eingesetzt werden.' },
    { k: 'blockade', n: 'Handelsblockade', e: 'Inseln bringen diese Runde keine Erträge.' },
  ],
];
const EVENT_BY_KEY = {};
EVENT_ROWS.forEach((row, r) => row.forEach((e, c) => { e.row = r + 1; e.col = c + 1; EVENT_BY_KEY[e.k] = e; }));
// Gelände, das ein Ereignis lahmlegt
const EVENT_TERRAIN = { piraterie: 'M', duerre: 'G', hochwasser: 'F', waldbrand: 'W', lawinen: 'B', blockade: 'I' };
const EVENT_MODES = [
  { k: 'hard', n: 'Hart (jede Runde ein Ereignis)' },
  { k: 'easy', n: 'Leicht (etwa jede zweite Runde)' },
];

/* ---------------------------------------------------------------- Weltwunder
   Aus dem Wunderbogen. kind: 'sofort' = einmalige Wirkung beim Bau,
   'dauer' = wirkt, solange das Wunder dem Reich gehört.
   Kosten: 10/20/30/40 … für das 1./2./3./4. Wunder eines Reiches. */
const WONDERS = [
  // Stufe 1
  { k: 'mauer', n: 'Die Große Mauer', lvl: 1, kind: 'dauer', e: 'Deine Stadtverteidigung rechnet mit deiner Gesamtbevölkerung.' },
  { k: 'leuchtturm', n: 'Der Große Leuchtturm', lvl: 1, kind: 'dauer', e: 'Meeresfelder produzieren +1 aller Erträge.' },
  { k: 'pyramiden', n: 'Die Pyramiden', lvl: 1, kind: 'dauer', e: '1:1 Nahrung → Münzen.' },
  { k: 'orakel', n: 'Das Orakel', lvl: 1, kind: 'dauer', e: 'Du siehst das Ereignis der nächsten Runde vorab.' },
  { k: 'stonehenge', n: 'Stonehenge', lvl: 1, kind: 'dauer', e: 'Deine Weltwunder können nicht zerstört werden.' },
  { k: 'bibliothek', n: 'Die große Bibliothek', lvl: 1, kind: 'sofort', e: 'Erforsche sofort kostenlos eine Technologie des Mittelalters oder früher.' },
  { k: 'gaerten', n: 'Die hängenden Gärten', lvl: 1, kind: 'sofort', e: 'Alle deine Städte wachsen kostenlos um 1 Bevölkerung.' },
  { k: 'koloss', n: 'Der Koloss', lvl: 1, kind: 'sofort', e: 'Baue zwei kostenlose Armeen.' },
  { k: 'zeus', n: 'Die Zeusstatue', lvl: 1, kind: 'dauer', e: '+3 Macht (dauerhaft, geht beim Machtverlust nicht verloren).' },
  // Stufe 2
  { k: 'taj', n: 'Das Taj Mahal', lvl: 2, kind: 'sofort', e: 'Nächste Runde erhältst du doppelte Erträge.' },
  { k: 'palast', n: 'Der Apostolische Palast', lvl: 2, kind: 'dauer', e: 'Ereignisse betreffen dich nicht.' },
  { k: 'himeji', n: 'Die Burg Himeji', lvl: 2, kind: 'dauer', e: 'Reduziert die Kosten von Macht um 1.' },
  { k: 'oxford', n: 'Die Universität von Oxford', lvl: 2, kind: 'sofort', e: 'Forsche kostenlos zwei momentan verfügbare Technologien.' },
  { k: 'angkor', n: 'Angkor Wat', lvl: 2, kind: 'sofort', e: 'Die Stadt wächst sofort kostenlos um 9 Bevölkerung.' },
  { k: 'canal', n: 'Canal du Midi', lvl: 2, kind: 'sofort', e: 'Du erhältst sofort 40 Münzen.' },
  // Stufe 3
  { k: 'pentagon', n: 'Das Pentagon', lvl: 3, kind: 'sofort', e: 'Erhalte sofort 15 Macht.' },
  { k: 'kreml', n: 'Der Kreml', lvl: 3, kind: 'dauer', e: 'Die Forschungskosten für Singularität steigen für alle um 50.' },
  { k: 'freiheit', n: 'Die Freiheitsstatue', lvl: 3, kind: 'sofort', e: 'Alle deine Städte wachsen kostenlos um 3 Bevölkerung.' },
];
const WONDER_BY_KEY = {};
WONDERS.forEach(w => { WONDER_BY_KEY[w.k] = w; });
const WONDERS_IN = lvl => WONDERS.filter(w => w.lvl === lvl);
const WONDER_POOL_SIZE = 3;      // je Stufe 1 und 2 sind drei Wunder verfügbar
const WONDER_STEP = 10;          // Kosten je weiteres Wunder

/* ------------------------------------------------------- Zufallskarten
   Die Geländemischung folgt der Originalkarte (36 % Grasland, 30 % Meer, 15 % Wald,
   9 % Gebirge, 8 % Fluss, 3 % Insel). Größe und Startpunkte sind fest, nur das Gelände
   wird gewürfelt – unter einer Hauptstadt liegt nie Meer. */
const MAP_MIX = [['G', 36], ['M', 30], ['W', 15], ['B', 9], ['F', 8], ['I', 3]];
// Startpunkte der Zufallskarte im Format der Originalkarte (12 × 18)
const RANDOM_CAPITALS = { wikinger: [1, 8], russland: [4, 15], england: [5, 3], griechenland: [9, 10] };
// Duellkarte 12 × 8 (Spalten × Zeilen): zwei feste, weit auseinanderliegende Startpunkte.
// Beide liegen ein Feld vom Rand entfernt, damit sie sechs Nachbarfelder haben.
const DUEL_SIZE = { rows: 8, cols: 12 };
const DUEL_STARTS = [[1, 10], [6, 1]];

// Kleiner eigener Zufallsgenerator, damit eine Karte aus einem Startwert reproduzierbar ist
function mapRng(seed) {
  let s = (seed | 0) || Math.floor(Math.random() * 2 ** 31);
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}
function pickTerrain(rnd) {
  const total = MAP_MIX.reduce((a, x) => a + x[1], 0);
  let n = rnd() * total;
  for (const [k, w] of MAP_MIX) { n -= w; if (n <= 0) return k; }
  return 'G';
}
/* --------------------------------------------------- Mindestgüte eines Startplatzes
   Jede Hauptstadt muss im ersten Zug mindestens 4 Nahrung aufbringen können (Münzen
   zählen 2:1) und mindestens ein siedelbares Feld in Distanz 3 haben. Gerechnet wird mit
   den Grunderträgen: keine Technologien, keine Zivilisationsfähigkeit, Stadt mit
   1 Bevölkerung (verbraucht 1 Nahrung, bringt 1 Münze).
   Erfüllt eine Hauptstadt das nicht, wird ihr Umland gezielt nachgebessert – die Karte
   wird nicht neu gewürfelt, weil vier Startplätze gleichzeitig sonst kaum je passen. */
const START_MIN_FOOD = 4;
const LAND_KEYS = ['G', 'W', 'B', 'F'];
const at = (grid, r, c) => (grid[r] && grid[r][c]) || null;
const isLandKey = t => !!t && TERRAIN[t].land && !TERRAIN[t].block;

// Wie viel Nahrung stehen im ersten Zug zur Verfügung (Münzen 2:1 eingerechnet)?
function startFood(grid, r, c) {
  let food = -1, coins = 1;                        // Stadt mit 1 Bevölkerung
  for (const [nr, nc] of neighbors(r, c)) {
    const t = at(grid, nr, nc);
    if (!t) continue;
    food += TERRAIN[t].yield[1];
    coins += TERRAIN[t].yield[2];
  }
  return food + Math.floor(coins / 2);
}
/* Felder, die von dieser Hauptstadt aus über Land in genau drei Schritten erreichbar sind
   und mindestens 3 Felder von jeder Hauptstadt entfernt liegen – also gründbar. */
function startSpots(grid, r, c, capitals) {
  const seen = new Set([r + ',' + c]);
  let front = [[r, c]];
  for (let step = 1; step <= 3; step++) {
    const next = [];
    for (const [cr, cc] of front) {
      for (const [nr, nc] of neighbors(cr, cc)) {
        const k = nr + ',' + nc;
        if (seen.has(k) || !isLandKey(at(grid, nr, nc))) continue;
        seen.add(k); next.push([nr, nc]);
      }
    }
    front = next;
    if (!front.length) break;
  }
  return front.filter(([sr, sc]) =>
    Object.values(capitals).every(([kr, kc]) => hexDistance(kr, kc, sr, sc) >= 3));
}
/* Legt einen Landweg von der Hauptstadt zu einem Feld in Distanz 3 an. */
function carveSpot(grid, r, c, capitals, rnd) {
  const rows = grid.length, cols = grid[0].length;
  const cands = [];
  for (let tr = 0; tr < rows; tr++) for (let tc = 0; tc < cols; tc++) {
    if (hexDistance(r, c, tr, tc) !== 3) continue;
    if (!Object.values(capitals).every(([kr, kc]) => hexDistance(kr, kc, tr, tc) >= 3)) continue;
    cands.push([tr, tc]);
  }
  if (!cands.length) return false;
  // bevorzugt ein Ziel, das schon Land ist – dann muss weniger umgebaut werden
  cands.sort((a, b) => (isLandKey(at(grid, ...b)) ? 1 : 0) - (isLandKey(at(grid, ...a)) ? 1 : 0));
  const [tr, tc] = cands[Math.floor(rnd() * Math.min(cands.length, 3))] || cands[0];
  let [cr, cc] = [r, c];
  for (let step = 0; step < 6 && !(cr === tr && cc === tc); step++) {
    const opts = neighbors(cr, cc).filter(([nr, nc]) => at(grid, nr, nc));
    if (!opts.length) return false;
    opts.sort((a, b) => hexDistance(a[0], a[1], tr, tc) - hexDistance(b[0], b[1], tr, tc));
    [cr, cc] = opts[0];
    if (!isLandKey(grid[cr][cc])) grid[cr][cc] = 'G';
  }
  return true;
}
/* Bessert das Umland nach, bis die Schwelle erreicht ist: das nahrungsärmste Nachbarfeld
   wird Grasland, Meeresfelder erst zuletzt, damit Küsten möglichst erhalten bleiben. */
function boostFood(grid, r, c) {
  for (let guard = 0; guard < 8 && startFood(grid, r, c) < START_MIN_FOOD; guard++) {
    const ns = neighbors(r, c).filter(([nr, nc]) => at(grid, nr, nc) && grid[nr][nc] !== 'G');
    if (!ns.length) break;
    ns.sort((a, b) => {
      const ta = grid[a[0]][a[1]], tb = grid[b[0]][b[1]];
      const sea = t => (t === 'M' || t === 'I') ? 1 : 0;      // Meer und Inseln zuletzt
      return (sea(ta) - sea(tb)) || (TERRAIN[ta].yield[1] - TERRAIN[tb].yield[1]);
    });
    const [nr, nc] = ns[0];
    grid[nr][nc] = 'G';
  }
}
/* Baut eine Karte mit gegebener Größe und Hauptstädten. Unter Hauptstädten liegt
   garantiert Land (kein Meer, keine Insel – Inseln wären ohne Navigation abgeschnitten),
   und jeder Startplatz erfüllt die Mindestgüte. */
function makeRandomMap(name, rows, cols, capitals, seed) {
  const rnd = mapRng(seed);
  const grid = [];
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) line += pickTerrain(rnd);
    grid.push(line.split(''));
  }
  for (const pos of Object.values(capitals)) {
    const [r, c] = pos;
    if (!LAND_KEYS.includes(grid[r][c])) grid[r][c] = LAND_KEYS[Math.floor(rnd() * LAND_KEYS.length)];
  }
  // Mindestgüte je Startplatz: erst ein erreichbares Gründungsfeld, dann die Nahrung
  for (const pos of Object.values(capitals)) {
    const [r, c] = pos;
    if (!startSpots(grid, r, c, capitals).length) carveSpot(grid, r, c, capitals, rnd);
    boostFood(grid, r, c);
  }
  return { name, rows: grid.map(g => g.join('')), capitals: JSON.parse(JSON.stringify(capitals)), random: true };
}
function randomMap(seed) {
  return makeRandomMap('Zufallskarte (12 × 18)', 12, 18, RANDOM_CAPITALS, seed);
}
/* Duellkarte: die beiden gewählten Zivilisationen bekommen die festen Startpunkte
   in der Reihenfolge, in der sie im Aufbau stehen. */
function duelMap(civA, civB, seed) {
  const capitals = {};
  capitals[civA] = DUEL_STARTS[0].slice();
  capitals[civB] = DUEL_STARTS[1].slice();
  return makeRandomMap('Duellkarte (12 × 8)', DUEL_SIZE.rows, DUEL_SIZE.cols, capitals, seed);
}
/* Siegschwellen im Duell: 3/4 statt 2/3, mit Theologie 7/10, mit Vereinten Nationen 2/3 */
const DUEL_VICTORY_FRAC = 3 / 4;
const DUEL_THEOLOGY_FRAC = 7 / 10;
const DUEL_UN_FRAC = 2 / 3;
