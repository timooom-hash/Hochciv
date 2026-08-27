/* Hochzeivilization – Sprachen.

   Deutsch ist die Quelle und die Vorgabe. Englisch kommt auf zwei Wegen dazu:

   1. **Datentexte** (Gelände, Technologien, Zivilisationen und ihre Fähigkeiten,
      Ereignisse, Weltwunder, Zeitalter, Felder, Schwierigkeitsgrade, Kartennamen …)
      stehen als Tabelle in DATA_EN. Beim Sprachwechsel werden die Felder `n` und `e`
      der Spielobjekte ausgetauscht – kein Aufrufer muss etwas davon wissen.
   2. **Oberflächentexte** laufen durch `T()`. Schlüssel ist der **deutsche Satz**; so
      bleibt der Code lesbar und es gibt keine erfundenen Schlüsselnamen. Platzhalter
      sind `%s`, in der Reihenfolge der Argumente.

   Fehlt eine Übersetzung, erscheint der deutsche Text und der Satz landet in
   `missingStrings()`. `node test.js` liest das aus und nennt die Lücken – so ist immer
   sichtbar, was noch fehlt, statt es zu verstecken.                                  */

const LANGS = [
  { k: 'de', n: 'Deutsch', flag: '🇩🇪' },
  { k: 'en', n: 'English', flag: '🇬🇧' },
];
let LANG = 'de';
const LANG_KEY = 'hochciv.lang';

/* ------------------------------------------------------------ Datentexte (en) */
const DATA_EN = {
  terrain: {
    G: 'Grassland', W: 'Forest', B: 'Mountains', F: 'River', M: 'Sea', I: 'Island',
    V: 'Volcano', X: 'No tile',
  },
  ages: ['Antiquity', 'Middle Ages', 'Industrial Age', 'Modern Age'],
  fields: ['Research', 'Production', 'Military', 'Special'],
  diff: {
    siedler: 'Settler', haeuptling: 'Chieftain', prinz: 'Prince',
    koenig: 'King', david: 'David',
  },
  evmode: {
    hard: 'Hard (an event every round)',
    easy: 'Light (roughly every other round)',
  },
  maps: ['Original map (12 × 18)', 'Large map (15 × 24)'],
  shapes: {
    hex6: 'Tile map (6 triangles)', tri9: 'Tile map (9 triangles)',
    strip10: 'Tile map (10 triangles)',
  },
  civ: {
    griechenland: 'Greece', england: 'England', russland: 'Russia',
    wikinger: 'Vikings', barbaren: 'Barbarians',
  },
  /* Fähigkeiten je Zivilisation – die Schlüssel wiederholen sich (immer 'basis' zuerst),
     deshalb nach Zivilisation geschachtelt. */
  abil: {
    griechenland: {
      basis: ['Cheap research', 'Techs cost 1/2/3/4/5 less (by age)'],
      gratistech: ['Free research', 'Once per round, research one available technology of the Industrial Age or earlier for free'],
      rueckschau: ['Hindsight', 'With every technology researched, also get one of an earlier age for free (even a locked one)'],
    },
    england: {
      basis: ['Trading empire', 'Coins = food for all purposes (1:1 both ways)'],
      gruenden: ['Colonists', 'Founding cities costs no base cost (distance cost only; with Cartography whichever of the two is cheaper)'],
      kuestenstaedte: ['Sea power', 'Every city adjacent to sea yields +2 science, food and coins'],
    },
    russland: {
      basis: ['Taiga', '+1 food in forest'],
      wachstum: ['Fertility', 'Population growth costs no food'],
      siedler: ['Settler treks', 'Cities are founded with 2 population'],
    },
    wikinger: {
      basis: ['Seafarers', 'Free army at the start; one army does not count towards army build costs'],
      kampfertrag: ['Raids', 'An army next to an enemy army or city yields 1 science, food and coin per point of superiority'],
      armeemacht: ['Warrior culture', 'Each of your armies grants +2 power'],
    },
  },
  tech: {
    schrift: ['Writing', 'City: +1 science'],
    mathematik: ['Mathematics', 'Forest: +1 science'],
    astronomie: ['Astronomy', 'Sea: +1 science'],
    philosophie: ['Philosophy', '+1 when rolling for tech availability'],
    papier: ['Paper', 'Grassland: +1 science'],
    alchemie: ['Alchemy', '1:1 science → coins'],
    buchdruck: ['Printing', 'River: +1 science'],
    universitaet: ['Universities', 'City: +1 science'],
    wiss_methode: ['Scientific method', 'Tech costs −2/−4/−6/−8/−10 (by age)'],
    chemie: ['Chemistry', 'Mountains: +1 science'],
    elektrizitaet: ['Electricity', 'Forest: +1 science'],
    biologie: ['Biology', 'Grassland: +1 science'],
    computertechnik: ['Computing', '1:1 coins → science'],
    gentechnik: ['Genetic engineering', 'Use science to feed a city'],
    raumfahrt: ['Spaceflight', 'One free technology with every wonder built'],
    ki: ['Artificial intelligence', 'Forest: +1 science'],
    landwirtschaft: ['Agriculture', 'Grassland: +1 food'],
    fischerei: ['Fishing', 'Sea: +1 food'],
    rad: ['The wheel', 'Roads'],
    keramik: ['Pottery', 'Grow cities twice per round'],
    bewaesserung: ['Irrigation', 'Mountains: +1 food'],
    segeln: ['Sailing', 'Sea: +1 food'],
    muehlentechnik: ['Mills', 'River: +1 coin'],
    baukraene: ['Cranes', 'Wonders cost 2/4/6/8/… less'],
    gilden: ['Guilds', '1:1 coins → food'],
    dampfmaschine: ['Steam engine', 'No coin cost for city growth'],
    eisenbahn: ['Railway', 'Railways'],
    kunstduenger: ['Fertiliser', 'Forest: +1 food'],
    fliessband: ['Assembly line', 'City: +1 coin'],
    verbundwerkstoffe: ['Composites', 'One extra free growth per city'],
    gruene_revolution: ['Green revolution', 'Grassland: +1 coin'],
    containerlogistik: ['Container shipping', 'Sea: +1 coin'],
    robotik: ['Robotics', 'City: +1 coin'],
    taktik: ['Tactics', 'Flanking from any two positions'],
    eisenverarbeitung: ['Ironworking', '4 coins = 1 power'],
    belagerung: ['Siege engines', '+5 attack against cities'],
    stadtmauern: ['City walls', 'Cities have +5 defence'],
    burgenbau: ['Castles', 'Cities contain an immobile army'],
    stahl: ['Steel', 'Power loss = 1/3'],
    militaerlogistik: ['Military logistics', '+1 movement per wonder you own'],
    schiesspulver: ['Gunpowder', 'Zone of control'],
    gewehre: ['Rifles', '3 coins = 1 power'],
    panzerschiff: ['Ironclad', 'Movement = 6, movement on and across water'],
    dynamit: ['Dynamite', 'Armies have double attack against cities'],
    maschinengewehr: ['Machine gun', 'Cities have +2 defence per size'],
    panzer: ['Tanks', 'Power loss = 1/4'],
    luftwaffe: ['Air force', 'Movement = 9, ignores obstacles'],
    raketentechnik: ['Rocketry', 'Armies have one more ring of range'],
    atomwaffen: ['Nuclear weapons', 'Once per round pick a tile and its surroundings, destroying all armies there'],
    navigation: ['Navigation', 'Movement across water'],
    demokratie: ['Democracy', 'Army cost = 4 × count'],
    wallfahrt: ['Pilgrimage', '+3 to all yields per wonder you own'],
    sklaverei: ['Slavery', 'Sacrifice city population → 10 coins · becomes obsolete in the Modern Age'],
    rittertum: ['Chivalry', 'Only 1 population lost when conquering'],
    kundschafterei: ['Scouting', 'Copy a tech (3× its cost in coins)'],
    buerokratie: ['Bureaucracy', 'The capital produces double'],
    kartografie: ['Cartography', 'No distance cost when founding'],
    theologie: ['Theology', '>3/5 of the population to win'],
    nationalismus: ['Nationalism', 'Army cost = 2 × count'],
    spionage: ['Espionage', 'Copy a tech (1× its cost in coins)'],
    militaergericht: ['Military tribunal', 'No population lost when conquering'],
    kolonialismus: ['Colonialism', 'Buy a tile for 5 coins'],
    massenmedien: ['Mass media', 'Use coins to feed a city'],
    un: ['United Nations', '>1/2 of the population to win'],
    oekologie: ['Ecology', 'Cities: +1 food per 2 population (rounded down)'],
    internet: ['Internet', 'Copy 1 tech per round'],
    singularitaet: ['Singularity', 'Requires at least one Modern Age technology in every field. You win the game.'],
  },
  event: {
    pest: ['The Plague', 'Every city loses half its population (rounded up).'],
    erdbeben: ['Earthquake', 'One of your wonders, chosen at random, is destroyed and cannot be rebuilt.'],
    piraterie: ['Piracy', 'Sea tiles yield nothing this round.'],
    kriegsmuedigkeit: ['War weariness', 'Your power value is reset to 0.'],
    sturmflut: ['Storm surge', 'Cities on sea or river lose a third of their population (rounded up) and cannot grow this round.'],
    duerre: ['Drought', 'Grassland yields nothing this round.'],
    revolution: ['Revolution', 'Your capital produces nothing this round but still consumes food as usual.'],
    barbaren: ['Barbarian invasion', 'A randomly chosen city (not the capital) is attacked by barbarians with power 10 or twice your own power value – whichever is more.'],
    dunkles_zeitalter: ['Dark Age', 'No research is possible this round.'],
    hochwasser: ['Flooding', 'Rivers yield nothing this round.'],
    vulkan: ['Volcanic eruption', 'A tile next to a randomly chosen city becomes a volcano. The city loses three quarters of its population (rounded up) or 3 population – whichever is more.'],
    waldbrand: ['Forest fires', 'Forests yield nothing this round.'],
    buergerkrieg: ['Civil war', 'All armies are destroyed. This round, armies and power may also be paid for with food.'],
    wirtschaftskrise: ['Economic crisis', 'No coins are produced this round.'],
    lawinen: ['Avalanches', 'Mountains yield nothing this round.'],
    hungersnot: ['Famine', 'No food is produced this round. The exchange rate coins → food is 4:1 (2:1 with Guilds).'],
    atomprotest: ['Anti-nuclear protests', 'Nuclear weapons can never be used again.'],
    blockade: ['Trade blockade', 'Islands yield nothing this round.'],
  },
  wonder: {
    mauer: ['The Great Wall', 'Your city defence counts your total population.'],
    leuchtturm: ['The Great Lighthouse', 'Sea tiles produce +1 of every yield.'],
    pyramiden: ['The Pyramids', '1:1 food → coins.'],
    orakel: ['The Oracle', 'You see next round\u2019s event in advance.'],
    stonehenge: ['Stonehenge', 'Your wonders cannot be destroyed.'],
    bibliothek: ['The Great Library', 'Immediately research one technology of the Middle Ages or earlier for free.'],
    gaerten: ['The Hanging Gardens', 'All your cities grow by 1 population for free.'],
    koloss: ['The Colossus', 'Build two free armies.'],
    zeus: ['The Statue of Zeus', '+3 power (permanent, not lost to power decay).'],
    taj: ['The Taj Mahal', 'Next round you receive double yields.'],
    palast: ['The Apostolic Palace', 'Events do not affect you.'],
    himeji: ['Himeji Castle', 'Reduces the cost of power by 1.'],
    oxford: ['The University of Oxford', 'Research two currently available technologies for free.'],
    angkor: ['Angkor Wat', 'The city immediately grows by 9 population for free.'],
    canal: ['Canal du Midi', 'You immediately receive 40 coins.'],
    pentagon: ['The Pentagon', 'Immediately receive 15 power.'],
    kreml: ['The Kremlin', 'The research cost of the Singularity rises by 50 for everyone.'],
    freiheit: ['The Statue of Liberty', 'All your cities grow by 3 population for free.'],
  },
  tile: {
    'Weite Ebene': 'Open Plain', 'Kornkammer': 'Breadbasket', 'Flusstal': 'River Valley',
    'Hochland': 'Highland', 'Steppe': 'Steppe', 'Taiga': 'Taiga', 'Karst': 'Karst',
    'Gebirgskette': 'Mountain Range', 'Waldland': 'Woodland', 'Urwald': 'Rainforest',
    'Bergsee': 'Mountain Lake', 'Zwei Ströme': 'Two Rivers', 'Marschland': 'Marshland',
    'Küste': 'Coast', 'Bucht': 'Bay', 'Fjorde': 'Fjords', 'Halbinsel': 'Peninsula',
    'Atoll': 'Atoll', 'Inselgruppe': 'Island Group', 'Ferne Riffe': 'Distant Reefs',
  },
};

/* Deutsche Originale, beim ersten Wechsel gesichert – damit das Zurückschalten nicht
   auf eine zweite Tabelle angewiesen ist. */
let DATA_DE = null;
function snapshotGerman() {
  if (DATA_DE) return;
  const pair = o => [o.n, o.e];
  DATA_DE = {
    terrain: Object.fromEntries(Object.values(TERRAIN).map(t => [t.key, t.name])),
    ages: AGES.slice(), fields: FIELDS.slice(),
    diff: Object.fromEntries(DIFFICULTIES.map(d => [d.k, d.n])),
    evmode: Object.fromEntries(EVENT_MODES.map(m => [m.k, m.n])),
    maps: MAPS.map(m => m.name),
    shapes: Object.fromEntries(Object.values(TILE_SHAPES).map(s => [s.key, s.name])),
    civ: Object.fromEntries(CIVS.map(c => [c.k, c.n])),
    abil: Object.fromEntries(CIVS.map(c => [c.k, Object.fromEntries(c.abilities.map(a => [a.k, pair(a)]))])),
    tech: Object.fromEntries(TECHS.map(t => [t.k, pair(t)]).concat([['singularitaet', pair(SINGULARITY)]])),
    event: Object.fromEntries(Object.values(EVENT_BY_KEY).map(e => [e.k, pair(e)])),
    wonder: Object.fromEntries(WONDERS.map(w => [w.k, pair(w)])),
    tile: Object.fromEntries(TILE_POOL.map(t => [t.n, t.n])),
  };
}
/* Schreibt die Texte der gewählten Sprache in die Spielobjekte. */
function applyDataLang() {
  snapshotGerman();
  const D = LANG === 'de' ? DATA_DE : DATA_EN;
  const set = (o, v) => { if (!v) return; o.n = v[0]; if (v[1] != null) o.e = v[1]; };
  Object.values(TERRAIN).forEach(t => { t.name = (LANG === 'de' ? DATA_DE : DATA_EN).terrain[t.key] || t.name; });
  D.ages.forEach((n, i) => { AGES[i] = n; });
  D.fields.forEach((n, i) => { FIELDS[i] = n; });
  DIFFICULTIES.forEach(d => { d.n = D.diff[d.k] || d.n; });
  EVENT_MODES.forEach(m => { m.n = D.evmode[m.k] || m.n; });
  MAPS.forEach((m, i) => { m.name = D.maps[i] || m.name; });
  Object.values(TILE_SHAPES).forEach(s => { s.name = D.shapes[s.key] || s.name; });
  CIVS.forEach(c => {
    c.n = D.civ[c.k] || c.n;
    c.abilities.forEach(a => set(a, D.abil[c.k] && D.abil[c.k][a.k]));
  });
  if (typeof BARB_CIV === 'object') BARB_CIV.n = D.civ.barbaren || BARB_CIV.n;
  TECHS.forEach(t => set(t, D.tech[t.k]));
  set(SINGULARITY, D.tech.singularitaet);
  Object.values(EVENT_BY_KEY).forEach(e => set(e, D.event[e.k]));
  WONDERS.forEach(w => set(w, D.wonder[w.k]));
  // Plättchennamen: Schlüssel ist der deutsche Name, deshalb über den Vorrat gehen
  TILE_POOL.forEach((t, i) => {
    if (!t.de) t.de = t.n;
    t.n = LANG === 'de' ? t.de : (DATA_EN.tile[t.de] || t.de);
  });
}

/* ------------------------------------------------------- Oberflächentexte (en) */
const UI_EN = {
  /* --- Namen und Zeichen, die gleich bleiben (damit sie nicht als Lücke gemeldet werden) */
  'Hochzeivilization': 'Hochzeivilization', 'Tutorial': 'Tutorial', 'Bot': 'Bot',
  '🇩🇪': '🇩🇪', '🇬🇧': '🇬🇧', '🔬': '🔬', '🌾': '🌾', '🪙': '🪙', '⚔︎': '⚔︎',

  /* --- Menü */
  'für 1–4 Spieler*innen': 'for 1–4 players',
  'Ne Runde Civilization? Auf dem Tablet, ohne Bleistift und Radiergummi.':
    'A round of Civilization? On the tablet, without pencil and eraser.',
  'Neues Spiel': 'New game',
  'Spiel fortsetzen': 'Continue game',
  'Tutorial – geführtes Übungsspiel': 'Tutorial – guided practice game',
  'Karte bearbeiten': 'Edit map',
  'Regeln & Technologien': 'Rules & technologies',
  'Spielstand laden': 'Load save',

  /* --- Aufbau */
  'Aufbau': 'Setup',
  'Vier Reiche': 'Four empires',
  'Drei Reiche': 'Three empires',
  '1 gegen 1': '1 vs 1',
  'Karte': 'Map',
  'Mensch': 'Human',
  'Fähigkeit': 'Ability',
  'Mit Ereignissen': 'With events',
  'Ereignisstärke': 'Event strength',
  'Mit Weltwundern': 'With wonders',
  'Schwierigkeit (alle Bots)': 'Difficulty (all bots)',
  'Startspieler*in': 'Starting player',
  'Spiel beginnen': 'Start game',
  'Wer zuletzt ein Weltwunder gebaut hat, beginnt. Ansonsten: die erste menschliche Zivilisation in der Liste.':
    'Whoever built a wonder most recently begins. Otherwise: the first human civilisation in the list.',
  '1 gegen 1: immer die Plättchenkarte aus sechs Dreiecken, dafür Wirtschaftssieg erst über 3/4 der Weltbevölkerung (mit Theologie 7/10, mit Vereinten Nationen 2/3).':
    '1 vs 1: always the tile map of six triangles, but an economic victory needs more than 3/4 of the world population (7/10 with Theology, 2/3 with the United Nations).',
  'Plättchenkarte: die offenen Dreiecke liegen gleich, das eigene legt jede*r selbst – Lage wählen, Hauptstadt setzen, verdeckt.':
    'Tile map: the open triangles are placed right away, your own one you place yourself – choose an orientation, set the capital, face down.',
  'Hier darf jeder Platz frei wählen, auch zweimal dieselbe Zivilisation (mit gleicher oder anderer Fähigkeit). Doppelte bekommen Ziffern und eine eigene Farbe. Auf den festen Karten sitzt jede Zivilisation genau einmal.':
    'Here every seat may choose freely, including the same civilisation twice (with the same or a different ability). Duplicates get numerals and a colour of their own. On the fixed maps each civilisation appears exactly once.',
  'Zufall': 'Random',
  'Zufällig': 'Random',
  'Zufällige Zivilisation': 'Random civilisation',
  'Grundfähigkeit': 'Base ability',
  'Zivilisation': 'Civilisation',
  'Platz %s': 'Seat %s',
  'Alternative %s: %s': 'Alternative %s: %s',
  'Bots erhalten keine Zivilisationsfähigkeit.': 'Bots do not get a civilisation ability.',
  'Zivilisation und Fähigkeit werden beim Spielstart ausgelost.':
    'Civilisation and ability are drawn when the game starts.',
  'Wird beim Spielstart ausgelost.': 'Drawn when the game starts.',
  'Rasterkarte (12 × 8)': 'Grid map (12 × 8)',
  'Eigene Karte': 'Custom map',
  'Mindestens eine menschliche Zivilisation.': 'At least one human civilisation.',

  /* --- Spielbildschirm, Aktionsleiste, Kopfzeile */
  'Runde 1': 'Round 1',
  'Runde %s · Bevölkerung %s/%s (%s %)': 'Round %s · Population %s/%s (%s %)',
  'letzte Runde (%s)': 'final round (%s)',
  '>%s der Bevölkerung zum Sieg': '>%s of the population to win',
  'Wissen': 'Science',
  'Nahrung': 'Food',
  'Münzen': 'Coins',
  'Macht': 'Power',
  'Forschen': 'Research',
  'Armeen': 'Armies',
  'Welt': 'World',
  'Protokoll': 'Log',
  'Zug beenden': 'End turn',
  'Tutorial beenden': 'End tutorial',
  'Weiter ›': 'Next ›',

  /* --- Legephase */
  'Startplättchen': 'Starting tile',
  'Drehen': 'Rotate',
  'Fertig': 'Done',

  /* --- Karteneditor */
  'Größe': 'Size',
  'Exportieren': 'Export',
  'Importieren': 'Import',
  'Zurücksetzen': 'Reset',
};
const MISSING = new Set();
/* Übersetzt einen deutschen Satz. Platzhalter `%s` werden der Reihe nach ersetzt. */
function T(de, ...args) {
  let out = de;
  if (LANG !== 'de') {
    const tbl = LANG === 'en' ? UI_EN : null;
    if (tbl && Object.prototype.hasOwnProperty.call(tbl, de)) out = tbl[de];
    else MISSING.add(de);
  }
  args.forEach(a => { out = out.replace('%s', a); });
  return out;
}
const missingStrings = () => [...MISSING];
const clearMissing = () => MISSING.clear();
const langName = k => (LANGS.find(l => l.k === k) || LANGS[0]).n;

function setLang(k, opts) {
  if (!LANGS.some(l => l.k === k)) return LANG;
  LANG = k;
  applyDataLang();
  if (!(opts && opts.quiet)) {
    try { localStorage.setItem(LANG_KEY, k); } catch (e) { /* privater Modus */ }
  }
  return LANG;
}
function initLang() {
  let k = 'de';
  try { k = localStorage.getItem(LANG_KEY) || 'de'; } catch (e) { /* egal */ }
  setLang(LANGS.some(l => l.k === k) ? k : 'de', { quiet: true });
}
