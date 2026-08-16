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
  { k: 'ki', n: 'Künstliche Intelligenz', f: 0, c: 20, e: 'Wald: +1 Wissenschaft' },
  // Produktion
  { k: 'landwirtschaft', n: 'Landwirtschaft', f: 1, c: 1, e: 'Grasland: +1 Nahrung' },
  { k: 'fischerei', n: 'Fischerei', f: 1, c: 2, e: 'Meer: +1 Nahrung' },
  { k: 'rad', n: 'Rad', f: 1, c: 3, e: 'Straßen' },
  { k: 'bewaesserung', n: 'Bewässerung', f: 1, c: 5, e: 'Gebirge: +1 Nahrung' },
  { k: 'segeln', n: 'Segeln', f: 1, c: 7, e: 'Meer: +1 Nahrung' },
  { k: 'muehlentechnik', n: 'Mühlentechnik', f: 1, c: 8, e: 'Fluss: +1 Münze' },
  { k: 'gilden', n: 'Gilden', f: 1, c: 10, e: '1:1 Münzen → Nahrung' },
  { k: 'dampfmaschine', n: 'Dampfmaschine', f: 1, c: 11, e: 'Keine Münzkosten für Stadterweiterung' },
  { k: 'eisenbahn', n: 'Eisenbahn', f: 1, c: 13, e: 'Eisenbahn' },
  { k: 'kunstduenger', n: 'Kunstdünger', f: 1, c: 14, e: 'Wald: +1 Nahrung' },
  { k: 'fliessband', n: 'Fließband', f: 1, c: 15, e: 'Stadt: +1 Münze' },
  { k: 'verbundwerkstoffe', n: 'Verbundwerkstoffe', f: 1, c: 16, e: 'Städte 2x/Runde erweitern' },
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
  { k: 'sklaverei', n: 'Sklaverei', f: 3, c: 5, e: 'Stadtbevölkerung opfern → 10 Münzen' },
  { k: 'rittertum', n: 'Rittertum', f: 3, c: 6, e: '1 Bevölkerungsverlust beim Erobern' },
  { k: 'kundschafterei', n: 'Kundschafterei', f: 3, c: 7, e: 'Tech kopieren (3× Kosten in Münzen)' },
  { k: 'buerokratie', n: 'Bürokratie', f: 3, c: 8, e: 'Hauptstadt produziert doppelt' },
  { k: 'kartografie', n: 'Kartografie', f: 3, c: 9, e: 'Keine Distanzkosten' },
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

/* -------------------------------------------------- Experimentelle Variante v2
   Wird über den Regelmodus aktiviert. Setzt die aktive Techliste und die
   Regel-Flags. Die zwei neuen Technologien liegen an den im Heft genannten
   Stellen (Keramik: Produktion/Antike, Theologie: Spezial/Mittelalter). */
const TECHS_V2_EXTRA = [
  { k: 'keramik', n: 'Keramik', f: 1, c: 4, e: 'Städte 2× pro Runde erweitern' },
  { k: 'theologie', n: 'Theologie', f: 3, c: 10, e: '>3/5 der Bevölkerung zum Sieg' },
];

// Der aktive Regelsatz. Standard: Originalregeln. setRules() schaltet um.
let RULES = null, TECHS_ACTIVE = null, TECH_BY_KEY = {}, SINGULARITY = null;

const RULESETS = {
  standard: {
    name: 'Originalregeln',
    singularityCost: 25,
    greekAvailBonus: true,
    botResearchTwice: false,
    slaveryObsoleteInModern: false,
    verbundGratisGrowth: false,   // Verbundwerkstoffe erlaubt nur 2x wachsen
    victoryThirds: 2 / 3,
    theologyThreshold: null,
    extraTechs: [],
  },
  v2: {
    name: 'Experimentell v2',
    singularityCost: 100,
    greekAvailBonus: false,
    botResearchTwice: true,
    slaveryObsoleteInModern: true,
    verbundGratisGrowth: true,    // zusätzlich 1x gratis wachsen; mit Keramik bis 3x
    victoryThirds: 2 / 3,
    theologyThreshold: 3 / 5,     // Theologie senkt die Siegschwelle
    extraTechs: TECHS_V2_EXTRA,
  },
};

// Basistexte, die je Regelmodus abweichen können. Werden bei jedem setRules gesetzt,
// damit ein Moduswechsel nicht die Beschreibung des anderen Modus behält.
const TECH_TEXT_BASE = { verbundwerkstoffe: 'Städte 2× pro Runde erweitern' };
function setRules(key) {
  RULES = RULESETS[key] || RULESETS.standard;
  RULES.extraTechs.forEach(t => { if (t.age === undefined) t.age = ageOfCost(t.c); });
  TECHS_ACTIVE = TECHS.concat(RULES.extraTechs);
  // Effekttexte je Modus setzen
  const vb = TECHS.find(t => t.k === 'verbundwerkstoffe');
  if (vb) vb.e = RULES.verbundGratisGrowth
    ? '1× zusätzliches, kostenloses Wachstum pro Stadt'   // v2
    : TECH_TEXT_BASE.verbundwerkstoffe;                    // Standard
  TECH_BY_KEY = {};
  TECHS_ACTIVE.forEach(t => { TECH_BY_KEY[t.k] = t; });
  SINGULARITY = {
    k: 'singularitaet', n: 'Singularität', c: RULES.singularityCost,
    e: 'Erfordert mind. 1 Technologie der Moderne in jedem Feld. Du gewinnst das Spiel.',
  };
}
// Techs je Feld und Zeitalter, nach Kosten sortiert (billigere zuerst)
function techsIn(field, age) {
  return TECHS_ACTIVE.filter(t => t.f === field && t.age === age).sort((a, b) => a.c - b.c);
}
setRules('standard');

/* ---------------------------------------------------------------- Zivilisationen */
const CIVS = [
  { k: 'griechenland', n: 'Griechenland', sym: 'star', color: '#2f6f8f',
    ability: '+1 beim Auswürfeln von Techverfügbarkeit; Techs 1/2/3/4/5 günstiger (je Zeitalter)' },
  { k: 'england', n: 'England', sym: 'cross', color: '#8f2f3f',
    ability: 'Münzen = Nahrung für alle Belange' },
  { k: 'russland', n: 'Russland', sym: 'square', color: '#3f6f3f',
    ability: '+1 Nahrung in Wald' },
  { k: 'wikinger', n: 'Wikingerreich', sym: 'triangle', color: '#6f4f8f',
    ability: 'Kostenlose Armee am Start; eine Armee zählt nicht für Baukosten von Armeen' },
];

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

const MAPS = [MAP_GROSS, MAP_ORIGINAL];
const DEFAULT_MAP = MAP_GROSS;

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
