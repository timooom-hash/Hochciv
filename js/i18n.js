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


  /* --- Protokoll, Regeln und Meldungen aus der Spielmaschine */
  ' (Bot)': ' (bot)',
  '%s Weltwunder mit der Stadt zerstört – nicht wieder baubar.':
    '%s wonders destroyed with the city – cannot be rebuilt.',
  '%s Wissenschaft': '%s science',
  ' %s Weltwunder mit der Stadt zerstört – nicht wieder baubar.': ' %s wonders destroyed with the city – cannot be rebuilt.',
  ' %s Wissenschaft': ' %s science',
  ' und ': ' and ',
  ' · Gleichstand, Mensch vor Bot': ' · tie, human before bot',
  ' · Weltwunder': ' · wonders',
  ' – Nahrung bleibt bei 0.': ' – food stays at 0.',
  ' – bei Gleichstand geht der Sieg an den Menschen.': ' – on a tie the win goes to the human.',
  ' – die Bevölkerung kann aus Wissenschaft/Münzen versorgt werden.': ' – the population can be fed from science/coins.',
  '%s erforscht %s (%s).': '%s researches %s (%s).',
  '%s erforscht %s.': '%s researches %s.',
  '%s erforscht die Singularität!': '%s researches the Singularity!',
  '%s erfüllt eine weitere Siegbedingung: %s.': '%s meets another victory condition: %s.',
  '%s erobert eine Stadt von %s (Bevölkerung %s).': '%s captures a city from %s (population %s).',
  '%s flankiert und zerstört eine Armee von %s.': '%s flanks and destroys an army of %s.',
  '%s hat ein Weltwunder der Stufe 3 – Kultursieg zu Beginn des nächsten Zuges.': '%s owns a level 3 wonder – cultural victory at the start of the next turn.',
  '%s meldet ebenfalls einen Sieg an – am Rundenende entscheiden Punkte.': '%s also claims a victory – points decide at the end of the round.',
  '%s zerstört eine Stadt von %s.': '%s destroys a city of %s.',
  '%s übernimmt %s Weltwunder:': '%s takes over %s wonders:',
  '%s übernimmt %s freistehende(s) Weltwunder.': '%s takes over %s free-standing wonder(s).',
  '%s: %s auf %s/%s (%s Münzen).': '%s: %s on %s/%s (%s coins).',
  '%s: %s kopiert (%s Münzen).': '%s: copied %s (%s coins).',
  '%s: %s kopiert (Internet, gratis).': '%s: copied %s (Internet, free).',
  '%s: %s zerstört – kann nicht wieder gebaut werden.': '%s: %s destroyed – cannot be rebuilt.',
  '%s: +%s Macht für %s Münzen → %s.': '%s: +%s power for %s coins → %s.',
  '%s: +15 Macht (Das Pentagon).': '%s: +15 power (The Pentagon).',
  '%s: +40 Münzen (Canal du Midi).': '%s: +40 coins (Canal du Midi).',
  '%s: Armee %s → %s/%s.': '%s: army %s → %s/%s.',
  '%s: Armee gebaut (%s Münzen) – muss die Stadt noch verlassen.': '%s: army built (%s coins) – it still has to leave the city.',
  '%s: Armee zieht nach %s/%s.': '%s: army moves to %s/%s.',
  '%s: Atomschlag auf %s/%s – %s Armee(n) zerstört.': '%s: nuclear strike on %s/%s – %s army/armies destroyed.',
  '%s: Barbaren mit Macht %s greifen die Stadt auf %s/%s an.': '%s: barbarians with power %s attack the city on %s/%s.',
  '%s: Beutezüge ergeben %s (%s) – gutgeschrieben zu Beginn der nächsten Runde.': '%s: raids yield %s (%s) – credited at the start of the next round.',
  '%s: Bevölkerung geopfert → +10 Münzen.': '%s: population sacrificed → +10 coins.',
  '%s: Bürgerkrieg zerstört %s Armee(n).': '%s: civil war destroys %s army/armies.',
  '%s: Der Apostolische Palast schützt vor dem Ereignis.': '%s: the Apostolic Palace shields you from the event.',
  '%s: Die Pest kostet %s Bevölkerung.': '%s: the plague costs %s population.',
  '%s: Die Stadt verliert %s Bevölkerung.': '%s: the city loses %s population.',
  '%s: Feld %s/%s gekauft (5 Münzen).': '%s: bought tile %s/%s (5 coins).',
  '%s: Feld %s/%s ist jetzt ein Vulkan (unpassierbar, kein Ertrag).': '%s: tile %s/%s is now a volcano (impassable, no yield).',
  '%s: Machtwert auf 0 zurückgesetzt.': '%s: power value reset to 0.',
  '%s: Raumfahrt – eine Technologie gratis erforschbar.': '%s: spaceflight – one technology can be researched for free.',
  '%s: Siedler gründet Stadt auf %s/%s.': '%s: settler founds a city on %s/%s.',
  '%s: Siedler zieht auf %s/%s (nächstes siedelbares Feld).': '%s: settler moves to %s/%s (nearest settleable tile).',
  '%s: Stadt gegründet auf %s/%s (%s Nahrung, Bevölkerung %s).': '%s: city founded on %s/%s (%s food, population %s).',
  '%s: Stadt wächst auf %s': '%s: city grows to %s',
  '%s: Stadt wächst auf %s (%s Nahrung, %s Münzen).': '%s: city grows to %s (%s food, %s coins).',
  '%s: Stadt wächst auf %s.': '%s: city grows to %s.',
  '%s: Stadt wächst kostenlos auf %s.': '%s: city grows to %s for free.',
  '%s: Stadt wächst kostenlos um %s auf %s (%s).': '%s: city grows by %s to %s for free (%s).',
  '%s: Stonehenge – Weltwunder können nicht zerstört werden.': '%s: Stonehenge – wonders cannot be destroyed.',
  '%s: Sturmflut kostet %s Bevölkerung.': '%s: the storm surge costs %s population.',
  '%s: kein Weltwunder – Erdbeben ohne Folgen.': '%s: no wonder – the earthquake has no effect.',
  '%s: keine Stadt außer der Hauptstadt – kein Vulkan.': '%s: no city besides the capital – no volcano.',
  '%s: keine Stadt außer der Hauptstadt – keine Invasion.': '%s: no city besides the capital – no invasion.',
  '%s: kostenlose Armee in der Hauptstadt – muss sie noch verlassen.': '%s: free army in the capital – it still has to leave.',
  '%s: kostenloses Wachstum (%s) nicht möglich – Nahrungsgrenze.': '%s: free growth (%s) not possible – food limit.',
  '%s: neue Armee in der Hauptstadt.': '%s: new army in the capital.',
  '%s: nächste Runde doppelte Erträge (Taj Mahal).': '%s: double yields next round (Taj Mahal).',
  '%s: verfügbar in %s (%s):': '%s: available in %s (%s):',
  '(%s Nahrung, %s Münzen).': '(%s food, %s coins).',
  '(Bot)': '(bot)',
  'Armee %s/%s: +%s': 'Army %s/%s: +%s',
  'Armee bauen': 'Build army',
  'Atomwaffen nicht erforscht.': 'Nuclear weapons not researched.',
  'Atomwaffenproteste: Atomwaffen können nicht mehr eingesetzt werden.': 'Anti-nuclear protests: nuclear weapons can no longer be used.',
  'Barbaren: Angriff %s > Verteidigung %s (Zug %s/2).': 'Barbarians: attack %s > defence %s (turn %s/2).',
  'Barbarenangriff abgewehrt (Angriff %s ≤ Verteidigung %s). Die Barbaren ziehen ab.': 'Barbarian attack repelled (attack %s ≤ defence %s). The barbarians withdraw.',
  'Barbareninvasion: Stadt': 'Barbarian invasion: city',
  'Belagerung gebrochen (Angriff %s ≤ Verteidigung %s).': 'Siege broken (attack %s ≤ defence %s).',
  'Beute (schon gutgeschrieben)': 'Loot (already credited)',
  'Beutezüge des letzten Zuges: je %s Wissenschaft, Nahrung und Münzen.': 'Raids from the last turn: %s science, food and coins each.',
  'Beutezüge zu Zugende': 'Raids at the end of the turn',
  'Das Spiel endet am Ende dieser Runde (Runde %s).': 'The game ends at the end of this round (round %s).',
  'Die Bevölkerung ist schon vollständig versorgt.': 'The population is already fully fed.',
  'Die große Bibliothek': 'The Great Library',
  'Die letzte Bevölkerung darf nicht geopfert werden.': 'The last population cannot be sacrificed.',
  'Diese Nahrung ist schon ausgegeben.': 'That food has already been spent.',
  'Diese Runde nur noch kostenloses Wachstum.': 'Only free growth left this round.',
  'Diese Runde schon eingesetzt.': 'Already used this round.',
  'Diese Runde schon gewachsen.': 'Already grown this round.',
  'Diese Runde schon per Internet kopiert.': 'Already copied via the Internet this round.',
  'Diese Stadt hat diese Runde schon geopfert.': 'This city has already sacrificed this round.',
  'Diese Stadt hat schon zwei Wunder.': 'This city already has two wonders.',
  'Diese Technologie gehört zur Weltwunder-Erweiterung.': 'This technology belongs to the wonders expansion.',
  'Dieses Wunder ist nicht verfügbar.': 'This wonder is not available.',
  'Dort steht eine Stadt.': 'There is a city there.',
  'Dort steht schon eine Armee.': 'There is already an army there.',
  'Dunkles Zeitalter: Diese Runde kann nicht geforscht werden.': 'Dark Age: no research is possible this round.',
  'Eine Armee steht noch in einer Stadt – sie muss erst herausziehen.': 'An army is still inside a city – it has to move out first.',
  'Eine kostenlose Armee wartet noch – sie kommt erst, wenn die Hauptstadt frei ist.': 'A free army is still waiting – it arrives once the capital is clear.',
  'Einkommen: %s Wissenschaft, %s Nahrung, %s Münzen.': 'Income: %s science, %s food, %s coins.',
  'Eisenbahn noch nicht erforscht.': 'Railway not researched yet.',
  'Erdbeben: Wunder (1–%s)': 'Earthquake: wonder (1–%s)',
  'Ereignis: keines (Spalte ins Leere gewürfelt).': 'Event: none (the column die came up empty).',
  'Erst mehr Wunder der Stufe %s bauen (Stufe %s muss seltener bleiben).': 'Build more level %s wonders first (level %s has to stay rarer).',
  'Feld besetzt.': 'Tile occupied.',
  'Feld nicht erreichbar.': 'Tile not reachable.',
  'Forschungssieg (Singularität)': 'Research victory (Singularity)',
  'Fremde Stadt.': 'Not your city.',
  'Gentechnik nicht erforscht.': 'Genetic engineering not researched.',
  'Hängende Gärten': 'Hanging Gardens',
  'Kampf um %ss Stadt: Angriff %s > Verteidigung %s (Zug %s/2).': "Battle for %s's city: attack %s > defence %s (turn %s/2).",
  'Kein Feld.': 'No tile.',
  'Kein Reich mit Sieganspruch ist noch im Spiel – es geht weiter.': 'No empire with a victory claim is left in the game – play continues.',
  'Kein bezahlter Kopierweg erforscht.': 'No paid way of copying researched.',
  'Kein kostenloses Wachstum verfügbar.': 'No free growth available.',
  'Kolonialismus nicht erforscht.': 'Colonialism not researched.',
  'Kultursieg (Weltwunder der Stufe 3)': 'Cultural victory (level 3 wonder)',
  'Macht −%s (1/%s, aufgerundet) → %s.': 'Power −%s (1/%s, rounded up) → %s.',
  'Massenmedien nicht erforscht.': 'Mass media not researched.',
  'Militärsieg (Hauptstadt von %s erobert)': 'Military victory (captured the capital of %s)',
  'Mindestens 3 Felder Abstand zu allen Städten.': 'At least 3 tiles away from every city.',
  'Münzen': 'Coins',
  'Nahrungsdefizit von %s': 'Food deficit of %s',
  'Nahrungsproduktion würde negativ – Gentechnik oder Massenmedien nötig.': 'Food production would go negative – genetic engineering or mass media needed.',
  'Neue Städte wachsen erst nächste Runde.': 'New cities only grow from next round.',
  'Nicht auf Meer.': 'Not on sea.',
  'Nicht auf einem Vulkan.': 'Not on a volcano.',
  'Nicht direkt neben einer gegnerischen Armee.': 'Not right next to an enemy army.',
  'Nicht erreichbar – dafür fehlt Navigation oder Panzerschiff.': 'Not reachable – navigation or an ironclad is missing.',
  'Nicht genug Wissenschaft.': 'Not enough science.',
  'Nicht möglich.': 'Not possible.',
  'Nichts zurückzunehmen.': 'Nothing to take back.',
  'Nur herrenlose Felder können gekauft werden.': 'Only unowned tiles can be bought.',
  'Nur in eigener Stadt.': 'Only in your own city.',
  'Ohne Weltwunder-Erweiterung.': 'Without the wonders expansion.',
  'Rad noch nicht erforscht.': 'The wheel is not researched yet.',
  'Runde %s — %s%s': 'Round %s — %s%s',
  'Rückschau': 'Hindsight',
  'Schon erforscht.': 'Already researched.',
  'Siedlerziel auswürfeln (1–%s)': 'Roll settler target (1–%s)',
  'Sklaverei ist mit dem Eintritt in die Moderne obsolet.': 'Slavery became obsolete with the start of the Modern Age.',
  'Sklaverei nicht erforscht.': 'Slavery not researched.',
  'Stadt %s/%s: +%s': 'City %s/%s: +%s',
  'Stonehenge: %s Weltwunder überstehen die Zerstörung der Stadt.': 'Stonehenge: %s wonders survive the destruction of the city.',
  'Sturmflut: Diese Stadt kann diese Runde nicht wachsen.': 'Storm surge: this city cannot grow this round.',
  'Städte am Meer': 'Cities by the sea',
  'Unbekanntes Wunder.': 'Unknown wonder.',
  'Universität von Oxford': 'University of Oxford',
  'Verfügbare Weltwunder: ': 'Available wonders: ',
  'Verfügbarkeit %s%s': 'Availability %s%s',
  'Vulkanausbruch: Feld (1–%s)': 'Volcanic eruption: tile (1–%s)',
  'Vulkanausbruch: Stadt': 'Volcanic eruption: city',
  'Weltwunder bauen': 'Build wonder',
  'Wer bis dahin ebenfalls eine Siegbedingung erfüllt, kommt in den Punktvergleich.': 'Anyone who also meets a victory condition by then joins the points comparison.',
  'Wirtschaftssieg (%s von %s Weltbevölkerung, Schwelle %s)': 'Economic victory (%s of %s world population, threshold %s)',
  'Wissenschaft': 'Science',
  'Wunder auswürfeln (1–%s)': 'Roll wonder (1–%s)',
  'Wunderstadt auswürfeln (1–%s)': 'Roll wonder city (1–%s)',
  'Zu wenig Münzen (%s nötig).': 'Not enough coins (%s needed).',
  'Zu wenig Münzen.': 'Not enough coins.',
  'Zu wenig Nahrung (%s nötig).': 'Not enough food (%s needed).',
  'Zu wenig Nahrung und Münzen.': 'Not enough food and coins.',
  'Zu wenig Nahrung.': 'Not enough food.',
  'die Hauptstadt': 'the capital',
  'eine Stadt': 'a city',
  'flankiert eine gegnerische Armee': 'flanks an enemy army',
  'flankiert einen Angreifer auf %s': 'flanks an attacker on %s',
  'greift eine gegnerische Stadt an': 'attacks an enemy city',
  'kehrt ins eigene Reich zurück': 'returns to its own empire',
  'keine verfügbar → eine auswürfeln (1–%s)': 'none available → roll one (1–%s)',
  'schließt die Belagerung ab': 'completes the siege',
  'stürmt die belagerte Hauptstadt': 'storms the besieged capital',
  'versorgen die Bevölkerung – Nahrung %s': 'feed the population – food %s',


  /* --- Blätter, Fenster und Meldungen der Oberfläche */
  ' (du)':
    ' (you)',
  ' · Bot':
    ' · bot',
  '%s %s einsetzen':
    'Use %s %s',
  '%s %s zurücknehmen':
    'Take back %s %s',
  '%s Münzen = 1 Macht · aktuell %s Macht. Zu Zugbeginn verlierst du %s davon.':
    '%s coins = 1 power · currently %s power. At the start of your turn you lose %s of it.',
  '%s eingesetzt':
    '%s used',
  '%s gewinnen gemeinsam.':
    '%s win together.',
  '%s gewinnt.':
    '%s wins.',
  '%s ist am Zug':
    '%s is up',
  '%s ist am Zug · Ereignis: %s':
    '%s is up · event: %s',
  '%s könnte sie erforschen':
    '%s could research it',
  '%s%s hat sie erforscht':
    '%s%s has researched it',
  '%s/2 in dieser Stadt':
    '%s/2 in this city',
  '%s: %s übrig':
    '%s: %s left',
  '+%s Macht':
    '+%s power',
  '1× gratis per Internet':
    'once free via the Internet',
  '<p class="hint">Mit <b>Gentechnik</b> oder <b>Massenmedien</b> ließe sich ein Teil davon aus Wissenschaft oder Münzen bestreiten.</p>':
    '<p class="hint">With <b>genetic engineering</b> or <b>mass media</b> part of it could be covered from science or coins.</p>',
  '<p class="sub" style="margin-top:10px">Aus anderen Quellen bestreiten – höchstens %s, also nur die tatsächlichen Kosten.</p>':
    '<p class="sub" style="margin-top:10px">Cover from other sources – at most %s, so only the actual cost.</p>',
  '<p class="sub">%s <b>%s</b> ist dran. Das eigene Startplättchen sehen die anderen erst nach dem Aufdecken – jetzt also Gerät übergeben.</p> <button class="btn primary wide" id="pl-gate">Plättchen ansehen</button>':
    '<p class="sub">%s <b>%s</b> is up. The others only see your starting tile after the reveal – so hand the device over now.</p> <button class="btn primary wide" id="pl-gate">Look at the tile</button>',
  'Alle Plättchen liegen offen. %s Reiche, %s Dreiecke.':
    'All tiles are face up. %s empires, %s triangles.',
  'Andere Reiche':
    'Other empires',
  'Angriffswert %s':
    'Attack value %s',
  'Angriffswert des Reiches: %s. Antippen wählt die Armee aus, danach ein markiertes Feld antippen.':
    'Attack value of the empire: %s. Tap to select an army, then tap a highlighted tile.',
  'Armee':
    'Army',
  'Armee %s · Feld %s/%s':
    'Army %s · tile %s/%s',
  'Armee hier bewegen':
    'Move army from here',
  'Atomschlag auf dieses Feld':
    'Nuclear strike on this tile',
  'Atomschlag ausgeführt':
    'Nuclear strike carried out',
  'Atomwaffenproteste: Atomwaffen sind gesperrt.':
    'Anti-nuclear protests: nuclear weapons are blocked.',
  'Barbaren belagern %s Stadt/Städte.':
    'Barbarians are besieging %s city/cities.',
  'Belagerung %s/2':
    'Siege %s/2',
  'Bev.':
    'Pop.',
  'Bevölkerung':
    'Population',
  'Bevölkerung %s · Verteidigung %s':
    'Population %s · defence %s',
  'Bevölkerung opfern':
    'Sacrifice population',
  'Bevölkerung wachsen':
    'Grow population',
  'Bewegung kostenlos · Handelsroute +2':
    'movement free · trade route +2',
  'Bewegung ½ Punkt · Handelsroute +1':
    'movement ½ point · trade route +1',
  'Bleibt nutzbar':
    'Left to use',
  'Bürgerkrieg: auch mit Nahrung zahlbar':
    'civil war: can also be paid with food',
  'Bürgerkrieg: auch mit Nahrung zahlbar.':
    'Civil war: can also be paid with food.',
  'Das Land produziert':
    'The land produces',
  'Das Orakel sieht für die nächste Runde: %s':
    'The Oracle sees for next round: %s',
  'Datei nicht lesbar':
    'File not readable',
  'Davon aus %s bestritten':
    'Of that, %s covers',
  'Deine Armeen':
    'Your armies',
  'Deine Armeen (%s)':
    'Your armies (%s)',
  'Deine Armeen in Reichweite: %s · Angriffswert %s':
    'Your armies in range: %s · attack value %s',
  'Deine Weltwunder — Stufe 1: %s · Stufe 2: %s · Stufe 3: %s · nächstes Wunder %s Münzen':
    'Your wonders — level 1: %s · level 2: %s · level 3: %s · next wonder %s coins',
  'Der Apostolische Palast schützt dich davor.':
    'The Apostolic Palace shields you from it.',
  'Der Spaltenwürfel ging ins Leere.':
    'The column die came up empty.',
  'Die Bevölkerung isst (%s)':
    'The population eats (%s)',
  'Diese Armee bewegen':
    'Move this army',
  'Dieses Spiel läuft ohne Ereignisse und ohne Weltwunder.':
    'This game runs without events and without wonders.',
  'Du hast noch keine. Eigene Stadt antippen → Armee bauen (%s Münzen).':
    'You have none yet. Tap one of your cities → Build army (%s coins).',
  'Eine beliebige Technologie desselben Feldes aus einem früheren Zeitalter, kostenlos.':
    'Any technology of the same field from an earlier age, for free.',
  'Eisenbahn bauen':
    'Build railway',
  'Eisenbahn gebaut':
    'Railway built',
  'Eisenbahn noch nicht erforscht':
    'railway not researched yet',
  'Ereignis: %s':
    'Event: %s',
  'Erst die Hauptstadt setzen.':
    'Set the capital first.',
  'Ertrag nächster Zug':
    'Yield next turn',
  'Feld %s/%s · Ertrag':
    'Tile %s/%s · yield',
  'Feld kaufen':
    'Buy tile',
  'Freie Forschung (1× pro Runde, kostenlos)':
    'Free research (once per round, free)',
  'Für diese Spielerzahl gibt es keine Plättchenkarte.':
    'There is no tile map for this number of players.',
  'Gleichstand nach Punkten – bei Gleichstand geht der Sieg an den Menschen.':
    'Tie on points – on a tie the win goes to the human.',
  'Grundkosten + Distanz zur Hauptstadt (über passierbare Felder)':
    'base cost + distance to the capital (via passable tiles)',
  'Hauptstadt':
    'Capital',
  'Hauptstadt auf ein markiertes Feld tippen':
    'tap a highlighted tile to place the capital',
  'Hauptstadt gesetzt – „Fertig", wenn es passt':
    'capital set – “Done” when it fits',
  'Hauptstädte nur auf Land.':
    'Capitals on land only.',
  'Hier lässt sich nichts weiter bauen.':
    'Nothing more can be built here.',
  'Hochkant drehen: %s':
    'Rotate in portrait: %s',
  'Hält man das Gerät im Spiel hochkant, dreht die App sich selbst quer, damit die Karte breit steht. Menü, Aufbau und Editor bleiben unberührt. iOS erlaubt keine echte Orientierungssperre.':
    'If you hold the device in portrait during a game, the app turns itself sideways so the map is wide. Menu, setup and editor are left alone. iOS does not allow a real orientation lock.',
  'Im Tutorial: ziehe die Armee auf das goldene Feld.':
    'In the tutorial: move the army onto the golden tile.',
  'Karte geladen':
    'Map loaded',
  'Karte gespeichert':
    'Map saved',
  'Kein Ereignis in dieser Runde':
    'No event this round',
  'Keine Aktionen in dieser Runde.':
    'No actions this round.',
  'Keine Wunder verfügbar.':
    'No wonders available.',
  'Kosten %s Münzen · diese Stadt hat %s/2 Wunder · verfügbar: %s Münzen':
    'Cost %s coins · this city has %s/2 wonders · available: %s coins',
  'Kostenlos wachsen':
    'Grow for free',
  'Lage %s von 3':
    'Orientation %s of 3',
  'Macht kaufen':
    'Buy power',
  'Menü':
    'Menu',
  'Nahrung diese Runde':
    'Food this round',
  'Nahrungsdefizit %s – Nahrung bleibt bei 0.':
    'Food deficit %s – food stays at 0.',
  'Nicht genug Münzen.':
    'Not enough coins.',
  'Nichts einzusetzen.':
    'Nothing to use.',
  'Noch %s kostenlose Technologie(n).':
    '%s free technology/technologies left.',
  'Nochmal tippen zum Bestätigen.':
    'Tap again to confirm.',
  'Nur auf Land – und nicht so nah an einem fremden Startplättchen.':
    'On land only – and not that close to another starting tile.',
  'Nur auf dem eigenen Plättchen.':
    'Only on your own tile.',
  'Punkte':
    'Points',
  'Reich':
    'Empire',
  'Runde %s':
    'Round %s',
  'Rückschau: eine Technologie aus %s, früheres Zeitalter, kostenlos':
    'Hindsight: one technology from %s, earlier age, free',
  'Spiel beenden':
    'Quit game',
  'Spielende':
    'Game over',
  'Spielstand exportieren':
    'Export save',
  'Spielstand geladen':
    'Save loaded',
  'Stadt gründen':
    'Found city',
  'Straße bauen':
    'Build road',
  'Straße gebaut':
    'Road built',
  'Stufe %s':
    'Level %s',
  'Summe':
    'Total',
  'Technologien kopieren':
    'Copy technologies',
  'Technologien · %s Wissenschaft verfügbar':
    'Technologies · %s science available',
  'Techs':
    'Techs',
  'Ungedeckt: %s 🌾 – die Nahrung bleibt bei 0, die Bevölkerung nimmt keinen Schaden.':
    'Uncovered: %s 🌾 – food stays at 0, the population takes no harm.',
  'Verdeckt legen':
    'Place face down',
  'Verfügbar, Stufe %s':
    'Available, level %s',
  'Weiter':
    'Continue',
  'Welt':
    'World',
  'Wunder':
    'Wonders',
  'Zielfeld antippen':
    'Tap the target tile',
  'Zurück zum Menü':
    'Back to the menu',
  'alles ausgeben':
    'spend everything',
  'an':
    'on',
  'auf %s':
    'to %s',
  'auf %s · Verbundwerkstoffe':
    'to %s · composites',
  'aus':
    'off',
  'deckt alles, was die Bevölkerung isst':
    'covers everything the population eats',
  'diese Runde schon eingesetzt':
    'already used this round',
  'diese Runde schon geopfert':
    'already sacrificed this round',
  'diese Runde schon gezogen':
    'already moved this round',
  'diese Stadt hat schon zwei Wunder':
    'this city already has two wonders',
  'durch Atomwaffenproteste dauerhaft gesperrt':
    'permanently blocked by anti-nuclear protests',
  'erreichbare Felder werden markiert':
    'reachable tiles are highlighted',
  'freistehend':
    'free-standing',
  'gratis':
    'free',
  'hat sie erforscht':
    'has researched it',
  'hier liegt schon eine Eisenbahn':
    'there is already a railway here',
  'keines':
    'none',
  'könnte sie erforschen':
    'could research it',
  'muss die Stadt noch verlassen':
    'still has to leave the city',
  'nichts baubar (Münzen oder Stufenregel)':
    'nothing buildable (coins or level rule)',
  'noch keins':
    'none yet',
  'nur herrenlose Felder':
    'unowned tiles only',
  'obsolet – seit der Moderne nicht mehr nutzbar':
    'obsolete – unusable since the Modern Age',
  'und':
    'and',
  'zerstört alle Armeen hier und ringsum, auch eigene':
    'destroys every army here and around, including your own',


  /* --- Kurzregeln */
  'Aktionen in beliebiger Reihenfolge, beliebig oft.':
    'Actions in any order, as often as you like.',
  'Alle Technologien':
    'All technologies',
  'Alt. %s':
    'Alt. %s',
  'Die Nahrungsproduktion darf nicht negativ werden: Wachstum wird blockiert, sobald das Einkommen dadurch unter 0 fiele – gerechnet auf dem dauerhaften Wert, ein Ereignis dieser Runde zählt dafür nicht. Gentechnik (Wissenschaft) und Massenmedien (Münzen) heben die Grenze auf: zu Zugbeginn lässt sich damit bestreiten, was die Bevölkerung isst – höchstens diese Kosten, also kein allgemeiner Umtausch.':
    'Food production must not go negative: growth is blocked as soon as income would fall below 0 – measured on the permanent value, an event of this round does not count. Genetic engineering (science) and mass media (coins) lift that limit: at the start of your turn they can cover what the population eats – at most that cost, so no general exchange.',
  'Einkommen aus allen Feldern rund um deine Städte plus Bevölkerung.':
    'Income from all tiles around your cities plus population.',
  'Ereignisse (Erweiterung)':
    'Events (expansion)',
  'Feld':
    'Tile',
  'Geländeerträge je Feld':
    'Terrain yields per tile',
  'Grund':
    'Base',
  'Handelsrouten: jede eigene Stadt außer der Hauptstadt, die über einen durchgehenden Weg mit ihr verbunden ist, bringt +1 auf alle drei Erträge – über eine reine Eisenbahn +2. Gemischte Strecken zählen als Straße.':
    'Trade routes: every city of yours except the capital that is connected to it by an unbroken road yields +1 on all three yields – via a pure railway +2. Mixed routes count as road.',
  'Kampf: Angriff = Macht je Armee, Verteidigung = Bevölkerung + benachbarte Armeen. Zwei Züge in Folge stärker → Stadt erobert.':
    'Combat: attack = power per army, defence = population + adjacent armies. Stronger two turns in a row → city captured.',
  'Kosten 10/20/30/40 … für das 1./2./3./4. Wunder. Stufe 2 muss seltener sein als Stufe 1, Stufe 3 seltener als Stufe 2. Je Stadt zwei Wunder. Ein Wunder der Stufe 3 gewinnt zu Beginn des nächsten Zuges.':
    'Cost 10/20/30/40 … for your 1st/2nd/3rd/4th wonder. Level 2 must stay rarer than level 1, level 3 rarer than level 2. Two wonders per city. A level 3 wonder wins at the start of your next turn.',
  'Kosten links, Wirkung rechts. Verfügbar wird eine Technologie erst, wenn sie ausgewürfelt ist.':
    'Cost on the left, effect on the right. A technology only becomes available once it has been rolled.',
  'Kurzregeln':
    'Rules in brief',
  'Macht halbiert sich (aufgerundet).':
    'Power halves (rounded up).',
  'Ressourcen gelten nur für den laufenden Zug – nur Macht bleibt liegen. 2 Münzen zählen als 1 Nahrung oder 1 Wissenschaft.':
    'Resources only count for the current turn – only power carries over. 2 coins count as 1 food or 1 science.',
  'Sieg':
    'Victory',
  'Sieg: Singularität · %s der Weltbevölkerung (UN %s, Theologie %s) · gegnerische Hauptstadt · Weltwunder der Stufe 3. Außer beim Militärsieg endet das Spiel erst am Rundenende; mehrere Ansprüche entscheiden Punkte (Bevölkerung + Wunder + Technologien).':
    'Victory: Singularity · %s of the world population (UN %s, Theology %s) · an enemy capital · a level 3 wonder. Except for a military victory the game only ends at the end of the round; if several claim it, points decide (population + wonders + technologies).',
  'Stadt (je Bevölkerung)':
    'City (per population)',
  'Weltwunder (Erweiterung)':
    'Wonders (expansion)',
  'Zivilisationen — je drei wählbare Fähigkeiten (Bots haben keine)':
    'Civilisations — three selectable abilities each (bots have none)',
  'Zu Rundenbeginn wird gewürfelt: Zeile, dann Spalte. Hart trifft jede Runde, leicht etwa jede zweite. Bots sind nie betroffen.':
    'At the start of a round you roll: row, then column. Hard hits every round, light roughly every other one. Bots are never affected.',
  'Zugablauf':
    'Turn sequence',


  /* --- Tutorial: Überschriften und Aufgaben (die langen Erklärtexte fehlen noch) */
  '<p>Übrig: 0 🔬, 0 🌾, 2 🪙 – das verfällt. Danach kommen Kampf und Siegprüfung, dann die Bots.</p>':
    '<p>Left over: 0 🔬, 0 🌾, 2 🪙 – that expires. Then come combat and the victory check, then the bots.</p>',
  'Beende den Zug und klick dich durch die Bot-Fenster.':
    'End the turn and click through the bot windows.',
  'Deine Hauptstadt und ihre Felder':
    'Your capital and its tiles',
  'Der Gegenangriff als Verteidigung':
    'The counter-attack as defence',
  'Der Rest der Wissenschaft: Rad':
    'The rest of the science: the wheel',
  'Die Antwort: Mauern und Burgenbau':
    'The answer: walls and castles',
  'Die Armee bewegen':
    'Moving the army',
  'Die drei Anfängerfehler':
    'The three beginner mistakes',
  'Die dritte Stadt':
    'The third city',
  'Die erste Armee':
    'The first army',
  'Die erste Technologie':
    'The first technology',
  'Die vierte Stadt':
    'The fourth city',
  'Die zweite Stadt':
    'The second city',
  'Eine gegnerische Armee vor der Stadt':
    'An enemy army at the city gates',
  'Forsche <b>Belagerungsmaschinen</b>, kaufe <b>3 Macht</b> und zieh deine Armee auf das <b>goldene Feld</b>.':
    'Research <b>siege engines</b>, buy <b>3 power</b> and move your army onto the <b>golden tile</b>.',
  'Forschung und Technologien':
    'Research and technologies',
  'Jede Bevölkerung isst':
    'Every population eats',
  'Kaufe <b>Fischerei</b> und <b>Eisenverarbeitung</b> (je 0).':
    'Buy <b>fishing</b> and <b>ironworking</b> (0 each).',
  'Kaufe <b>Stadtmauern</b> und <b>Burgenbau</b>.':
    'Buy <b>city walls</b> and <b>castles</b>.',
  'Lass <b>beide</b> golden umrandeten Städte je einmal wachsen.':
    'Grow <b>both</b> gold-outlined cities once each.',
  'Pflastere die vier <b>goldenen Felder</b> – je Feld antippen und <b>Straße bauen</b>.':
    'Pave the four <b>golden tiles</b> – tap each tile and <b>build road</b>.',
  'Runde 2: exponentielles Wachstum':
    'Round 2: exponential growth',
  'Straßen: die Städte verbinden':
    'Roads: connecting the cities',
  'Tippe auf <b>Zug beenden</b> und klick dich durch die drei Bot-Fenster.':
    'Tap <b>End turn</b> and click through the three bot windows.',
  'Tippe das <b>goldene Feld</b> an und wähle <b>Stadt gründen</b>.':
    'Tap the <b>golden tile</b> and choose <b>Found city</b>.',
  'Tippe deine <b>Hauptstadt</b> an und wähle <b>Bevölkerung wachsen</b>.':
    'Tap your <b>capital</b> and choose <b>Grow population</b>.',
  'Tippe die <b>golden umrandete Stadt</b> an und wähle <b>Armee bauen</b>.':
    'Tap the <b>gold-outlined city</b> and choose <b>Build army</b>.',
  'Tutorial beendet – das Spiel läuft weiter.':
    'Tutorial finished – the game continues.',
  'Tutorial: eine griechische Armee nimmt Stellung neben deiner Stadt.':
    'Tutorial: a Greek army takes position next to your city.',
  'Tutorial: verfügbare Technologien der Antike festgelegt – ':
    'Tutorial: available technologies of Antiquity fixed – ',
  'Was die Bots getan haben':
    'What the bots did',
  'Willkommen':
    'Welcome',
  'Woher deine Ressourcen kommen':
    'Where your resources come from',
  'Zieh die Armee auf das <b>goldene Feld</b>.':
    'Move the army onto the <b>golden tile</b>.',
  'Zug beenden':
    'End turn',
  'Zug beenden – und der Rückzug':
    'Ending the turn – and the retreat',
  'Zwei Technologien für null':
    'Two technologies for nothing',
  'Zweimal Bevölkerung wachsen':
    'Growing population twice',
  'Öffne <b>Forschen</b> und kaufe <b>Papier</b>.':
    'Open <b>Research</b> and buy <b>paper</b>.',
  'Öffne <b>Forschen</b> und kaufe <b>Schrift</b>.':
    'Open <b>Research</b> and buy <b>writing</b>.',
  'Öffne einmal das <b>Protokoll</b>.':
    'Open the <b>log</b> once.',


  /* --- Tutorial: die langen Erklärtexte */
  '<p><b>Fischerei</b> (Meer +1 Nahrung) und <b>Eisenverarbeitung</b> (Macht kostet 4 statt 5 Münzen) kosten jetzt beide <b>0 Wissenschaft</b> – der Rabatt frisst ihren Preis komplett auf.</p> <p><b>Warum diese zwei?</b> Fischerei macht deine Meeresfelder nutzbar, und Eisenverarbeitung senkt dauerhaft den Machtpreis – gleich brauchst du Macht. Gratis mitnehmen ist immer richtig; jede Technologie öffnet außerdem Zeitalter.</p> <p><b>So forschst du:</b> <b>Forschen</b> → beide Kacheln antippen, der Bogen bleibt offen.</p>':
    '<p><b>Fishing</b> (sea +1 food) and <b>ironworking</b> (power costs 4 instead of 5 coins) now both cost <b>0 science</b> – the discount eats their price entirely.</p> <p><b>Why these two?</b> Fishing makes your sea tiles usable, and ironworking permanently lowers the price of power – which you are about to need. Taking something for free is always right; and every technology opens up ages.</p> <p><b>How to research:</b> <b>Research</b> → tap both tiles, the sheet stays open.</p>',
  '<p><b>Forschungssieg</b> – erforsche die <b>Singularität</b>: 100 Wissenschaft, mit Wissenschaftlicher Methode 90. Sie verlangt mindestens eine Technologie der <b>Moderne in jedem der vier Felder</b>. Für ein Reich, das früh auf Multiplikatoren gesetzt hat, ist das oft der kürzeste Weg.</p> <p><b>Wirtschaftssieg</b> – wenn du am Zugende über zwei Drittel der Weltbevölkerung hast, gewinnst du. Oben links neben dem Rundenzähler siehst du immer den aktuellen Bevölkerungsstand: gerade 7 von 33. Um hier eine realistische Chance zu haben, brauchst du meistens vier bis sechs Städte sowie einige der Technologien <b>Keramik</b>, <b>Verbundwerkstoffe</b>, <b>Theologie</b> oder <b>Vereinte Nationen</b>.</p> <p><b>Militärsieg</b> – erobere eine gegnerische Hauptstadt: zwei Züge in Folge stärker sein. Das ist der Weg, auf dem Bots für den menschlichen Spieler meist sehr bedrohlich sind.</p>':
    '<p><b>Research victory</b> – research the <b>Singularity</b>: 100 science, 90 with the scientific method. It requires at least one <b>Modern Age technology in each of the four fields</b>. For an empire that went for multipliers early, this is often the shortest road.</p> <p><b>Economic victory</b> – if you hold more than two thirds of the world population at the end of your turn, you win. Top left, next to the round counter, you can always see the current population: right now 7 of 33. To have a realistic chance here you usually need four to six cities plus some of the technologies <b>pottery</b>, <b>composites</b>, <b>theology</b> or <b>United Nations</b>.</p> <p><b>Military victory</b> – capture an enemy capital: be stronger two turns in a row. This is the road on which bots are usually most dangerous to a human player.</p>',
  '<p><b>Ressourcen liegen lassen.</b> Wissenschaft, Nahrung und Münzen verfallen am Zugende. Wer 3 Münzen übrig hat, hätte sie in 1 Nahrung oder 1 Wissenschaft tauschen können – jede Runde ein kleiner Verlust, der sich summiert.</p> <p><b>Zu früh Macht kaufen.</b> Sie halbiert sich zu Beginn jedes Zuges. Kaufe sie in dem Zug, in dem du angreifst oder verteidigst, und dann in einem Rutsch.</p> <p><b>Wachsen ohne Nahrung.</b> Jede Bevölkerung isst dauerhaft 1 Nahrung. Ohne Landwirtschaft, Kunstdünger, Bewässerung oder Ökologie steht das Wachstum nach wenigen Punkten still.</p> <div class="tut-key"><b>Und die Faustregel</b> Am stärksten ist die <b>Kombination</b>: die wichtigsten Multiplikatoren – Schrift, Landwirtschaft, Papier, Wissenschaftliche Methode – <b>zusammen mit vielen Städten</b>. Jede Technologie wirkt auf jedes Feld und jede Bevölkerung, die du besitzt; jede neue Stadt vervielfacht rückwirkend alles, was du schon erforscht hast. Militär nur so viel, wie du zum Überleben brauchst.</div>':
    '<p><b>Leaving resources lying around.</b> Science, food and coins expire at the end of your turn. Anyone left with 3 coins could have traded them for 1 food or 1 science – a small loss every round that adds up.</p> <p><b>Buying power too early.</b> It halves at the start of every turn. Buy it in the turn in which you attack or defend, and then all at once.</p> <p><b>Growing without food.</b> Every population permanently eats 1 food. Without agriculture, fertiliser, irrigation or ecology, growth stalls after a few points.</p> <div class="tut-key"><b>And the rule of thumb</b> Strongest is the <b>combination</b>: the important multipliers – writing, agriculture, paper, scientific method – <b>together with many cities</b>. Every technology acts on every tile and every population you own; every new city retroactively multiplies everything you have already researched. Military only as much as you need to survive.</div>',
  '<p><b>Stadtmauern</b> (3 Wissenschaft) geben <b>jeder</b> deiner Städte +5 Verteidigung. <b>Burgenbau</b> (3) stellt in jede Stadt eine unbewegliche, virtuelle Armee: sie <b>projiziert deinen Machtwert auf die Stadt</b> – erst dadurch hilft gekaufte Macht auch der Verteidigung. Du hast 9 Wissenschaft.</p> <p>Verteidigung jetzt <b>1</b>, Angriff <b>5</b>. Mauern allein bringen dich auf 6 – der Bot wächst aber weiter. Deshalb kommt im nächsten Schritt noch Macht dazu.</p> <p><b>Warum beides?</b> Mauern wirken in allen Städten gleichzeitig, kosten einmalig und schrumpfen nicht. Burgenbau macht deine Macht verteidigungswirksam, ohne dass eine echte Armee neben der Stadt stehen muss – und die virtuelle Armee zählt nicht für die Kosten weiterer Armeen.</p>':
    '<p><b>City walls</b> (3 science) give <b>every</b> one of your cities +5 defence. <b>Castles</b> (3) put an immobile, virtual army into every city: it <b>projects your power value onto the city</b> – only that makes bought power help your defence as well. You have 9 science.</p> <p>Defence is <b>1</b> right now, attack <b>5</b>. Walls alone bring you to 6 – but the bot keeps growing. That is why power follows in the next step.</p> <p><b>Why both?</b> Walls work in all cities at once, cost once and never shrink. Castles make your power count for defence without a real army having to stand next to the city – and the virtual army does not count towards the cost of further armies.</p>',
  '<p>Alle sechs Felder rund um deine Hauptstadt sind unter deiner Kontrolle und bringen dir Einkommen – sie sind gerade golden umrandet. Das Feld <i>unter</i> der Stadt bringt nichts.</p> <p>Jede weitere Stadt bringt bis zu sechs neue Felder dazu. Deshalb ist Ausbreitung wichtiger als große Einzelstädte.</p>':
    '<p>All six tiles around your capital are under your control and bring you income – they are outlined in gold right now. The tile <i>under</i> the city yields nothing.</p> <p>Every further city adds up to six new tiles. That is why spreading out matters more than large single cities.</p>',
  '<p>Armeen ziehen <b>3 Felder</b> weit, nicht über Wasser (bis eine Technologie das ändert), nicht auf Städte und nicht auf andere Armeen. Später erhöhen Panzerschiff und Luftwaffe die Reichweite, Straßen und Eisenbahn ebenfalls.</p> <p><b>Warum auf das goldene Feld?</b> Es liegt am Rand deines Reichs in Richtung Griechenland. Dort steht die Armee als Wache: sie verteidigt die Stadt nebenan mit und blockiert später ggf. mit <b>Schießpulver</b> den Durchmarsch.</p> <p><b>So bewegst du:</b> Deine Armee steht noch <i>in</i> der Stadt, in der du sie gebaut hast. Stadt antippen → <b>Armee hier bewegen</b> → dann das goldene Zielfeld antippen. Steht eine Armee im freien Feld, heißt der Knopf <b>Diese Armee bewegen</b>. Erreichbare Felder werden hell markiert.</p>':
    '<p>Armies move <b>3 tiles</b>, not across water (until a technology changes that), not onto cities and not onto other armies. Later the ironclad and the air force increase the range, as do roads and railways.</p> <p><b>Why onto the golden tile?</b> It lies at the edge of your empire towards Greece. There the army stands guard: it helps defend the city next to it and can later block the way through with <b>gunpowder</b>.</p> <p><b>How to move:</b> Your army is still <i>inside</i> the city where you built it. Tap the city → <b>Move army from here</b> → then tap the golden target tile. If an army stands in open terrain, the button reads <b>Move this army</b>. Reachable tiles are highlighted.</p>',
  '<p>Auch die 12 Nahrung sollen nicht verfallen. Eine vierte Stadt kostet <b>9 Nahrung</b> – 6 Basiskosten bei drei bestehenden Städten plus Weg. Teuer, aber es ist die einzige Ausgabe, die dauerhaft etwas zurückgibt.</p> <p><b>Warum dieses Feld?</b> Ringsum liegen 4 × Grasland, 1 × Gebirge, 1 × Meer, das bringt <b>+7 🔬, +4 🌾, +3 🪙</b> je Runde. Es liegt südlich deiner Hauptstadt, also im Rücken – weg von der griechischen Grenze, wo gerade gekämpft wird. </p> <div class="tut-key"><b>Merke</b> Vier Städte sind fast immer besser als zwei große: jede bringt eigene Felder, wächst billiger und verteilt das Risiko. Die Basiskosten steigen zwar (1/3/6/10), aber sie sind einmalig – der Ertrag bleibt.</div>':
    '<p>The 12 food should not go to waste either. A fourth city costs <b>9 food</b> – 6 base cost with three existing cities plus the distance. Expensive, but it is the only spending that keeps paying you back.</p> <p><b>Why this tile?</b> Around it lie 4 × grassland, 1 × mountains, 1 × sea, which brings <b>+7 🔬, +4 🌾, +3 🪙</b> per round. It lies south of your capital, so at your back – away from the Greek border where the fighting is.</p> <div class="tut-key"><b>Remember</b> Four cities are almost always better than two large ones: each brings its own tiles, grows more cheaply and spreads the risk. The base cost does rise (1/3/6/10), but it is a one-off – the yield stays.</div>',
  '<p>Bots ziehen ihre Armeen nach festen Prioritäten – und <b>die eigene Hauptstadt steht ganz oben</b>, noch vor „eine begonnene Belagerung zu Ende bringen". Wer eine Armee neben ihre Hauptstadt stellt, zwingt sie zum Rückzug.</p> <p>Um die griechische Hauptstadt zu bedrohen, musst du ihren <b>Verteidigungswert von 3</b> überbieten. Dafür dienen die folgenden drei Schritte:</p> <div class="tut-calc"> <div><span><b>Belagerungsmaschinen</b> forschen (+5 Angriff gegen Städte)</span><b>2 🔬</b></div> <div><span><b>3 Macht</b> kaufen (statt 4)</span><b>12 🪙</b></div> <div><span>Armee auf das <b>goldene Feld</b> daneben ziehen</span><b>3 Bewegung</b></div> </div> <p>Danach greift deine Armee mit <b>8 statt 3</b> an – mehr als die 3, die dort stehen. Am Ende deines Zuges gewinnst du den Kampf, und Griechenlands Hauptstadt steht bei <b>Zug 1 von 2</b>: noch ein Erfolg, und sie gehört dir. Genau das zwingt den Bot, seine Armeen zurückzuholen, statt deine Stadt zu Ende zu belagern.</p> <p>Dein Vorrat geht dabei genau auf – übrig bleiben <b>1 Wissenschaft</b> und <b>4 Münzen</b>, beides brauchst du gleich noch.</p> <p><b>So kaufst du</b> Macht: unten auf <b>Macht</b> → die Menge antippen.</p> <div class="tut-key"><b>Merke</b> Angriff ist oft die billigere Verteidigung. Eine Armee an der richtigen Stelle bindet zwei gegnerische – und kostet dich weniger, als deren Angriff aufzuwiegen. Bots verteidigen ihre Hauptstadt, sobald dort ein erster Angriff durchkam; eine Armee, die bloß danebensteht, beeindruckt sie nicht.</div>':
    '<p>Bots move their armies by fixed priorities – and <b>their own capital comes first</b>, even before “finish a siege you have started”. Whoever puts an army next to their capital forces them to pull back.</p> <p>To threaten the Greek capital you have to beat its <b>defence value of 3</b>. The following three steps do that:</p> <div class="tut-calc"> <div><span>research <b>siege engines</b> (+5 attack against cities)</span><b>2 🔬</b></div> <div><span>buy <b>3 power</b> (instead of 4)</span><b>12 🪙</b></div> <div><span>move the army onto the <b>golden tile</b> beside it</span><b>3 movement</b></div> </div> <p>After that your army attacks with <b>8 instead of 3</b> – more than the 3 standing there. At the end of your turn you win the fight and Greece’s capital sits at <b>turn 1 of 2</b>: one more success and it is yours. That is exactly what forces the bot to call its armies back instead of finishing the siege of your city.</p> <p>Your stock works out exactly – what is left is <b>1 science</b> and <b>4 coins</b>, and you need both in a moment.</p> <p><b>How to buy</b> power: <b>Power</b> at the bottom → tap the amount.</p> <div class="tut-key"><b>Remember</b> Attacking is often the cheaper defence. An army in the right place ties down two enemy ones – and costs you less than outweighing their attack. Bots defend their capital as soon as a first attack has landed there; an army merely standing nearby does not impress them.</div>',
  '<p>Das Tutorial ist durch – und dieses Spiel läuft einfach weiter, jetzt ohne Einschränkungen. Du stehst in Runde 4 mit 4 Städten, 7 Bevölkerung und 9 Technologien.</p> <p>Der nächste sinnvolle Schritt: weiter wachsen, Nahrungstechnologien nachziehen und in jedem Feld ein Zeitalter aufschließen – die Singularität braucht am Ende eine Moderne-Technologie in allen vier.</p> <p><b>Was das Tutorial nicht gezeigt hat</b>, aber im Spiel steckt: gegnerische Armeen <b>flankieren</b> und zerstören (zwei eigene Armeen gegenüberliegend, mit <b>Taktik</b> von zwei beliebigen Seiten) · <b>Eisenbahn</b> statt Straße: eine durchgehende Bahn verdoppelt den Handelsroutenbonus auf +2 · Technologien mit eigenen Aktionen: <b>Sklaverei</b> (Bevölkerung gegen Münzen opfern), <b>Spionage</b>, <b>Kundschafterei</b> und <b>Internet</b> (fremde Technologien kopieren), <b>Kolonialismus</b> (Felder kaufen), <b>Atomwaffen</b> (alle Armeen auf einem Feld und ringsum entfernen) · und Reichsfähigkeiten, die du im Aufbau umstellen kannst.</p> <p>Zwei Dinge helfen immer: <b>Protokoll</b> zeigt jeden Würfelwurf, <b>Regeln &amp; Technologien</b> im Menü listet alle Technologien mit ihrer Wirkung.</p>':
    '<p>The tutorial is done – and this game simply carries on, now without restrictions. You stand in round 4 with 4 cities, 7 population and 9 technologies.</p> <p>The next sensible step: keep growing, catch up on food technologies and open up an age in every field – in the end the Singularity needs a Modern Age technology in all four.</p> <p><b>What the tutorial did not show</b> but is in the game: <b>flanking</b> and destroying enemy armies (two of your armies opposite each other, with <b>tactics</b> from any two sides) · <b>railways</b> instead of roads: an unbroken railway doubles the trade route bonus to +2 · technologies with actions of their own: <b>slavery</b> (sacrifice population for coins), <b>espionage</b>, <b>scouting</b> and <b>Internet</b> (copy other empires’ technologies), <b>colonialism</b> (buy tiles), <b>nuclear weapons</b> (remove all armies on a tile and around it) · and the empire abilities you can switch in setup.</p> <p>Two things always help: the <b>log</b> shows every die roll, <b>Rules &amp; technologies</b> in the menu lists every technology with its effect.</p>',
  '<p>Dein Einkommen liegt jetzt bei <b>6 🔬, 9 🌾, 10 🪙</b> – in Runde 1 waren es 1, 5 und 3.</p> <p>Drei Dinge greifen zusammen: die zweite Stadt brachte sechs neue Felder, die Hauptstadt hat 2 Bevölkerung, und <b>Schrift</b> erhöht deren Wissenschaft. Genau dieser Effekt entscheidet die Partie, nicht unbedingt die Armeen.</p> <p>Faustregel: die wichtigsten <b>Geländeverbesserungen</b> und <b>viele Städte</b> in Kombination – eines ohne das andere bringt wenig.</p>':
    '<p>Your income now stands at <b>6 🔬, 9 🌾, 10 🪙</b> – in round 1 it was 1, 5 and 3.</p> <p>Three things work together: the second city brought six new tiles, the capital has 2 population, and <b>writing</b> raises their science. Exactly this effect decides the game, not necessarily the armies.</p> <p>Rule of thumb: the important <b>terrain improvements</b> and <b>many cities</b> in combination – one without the other achieves little.</p>',
  '<p>Deine belagerte Stadt steht bei <b>Verteidigung 9</b>. Griechenland könnte mit seinen 1 Armeen <b>5</b> aufbieten – das würde reichen.</p> <p>Beende den Zug und sieh im Protokoll nach, was stattdessen passiert: <b>„Armee verteidigt die Hauptstadt"</b>. Deine eine Armee neben der griechischen Hauptstadt zieht beide Angreifer ab, und die Belagerung läuft ins Leere.</p> <div class="tut-key"><b>Merke</b> „Zug 1/2" ist eine Vorwarnung mit <b>einer Runde</b> Reaktionszeit. Mehr Verteidigung zu kaufen ist dabei selten die beste Antwort – der Gegner kann nachlegen. Ihm etwas Wertvolleres zu bedrohen, wirkt sofort und kostet weniger.</div>':
    '<p>Your besieged city stands at <b>defence 9</b>. With its 1 armies Greece could muster <b>5</b> – that would be enough.</p> <p>End the turn and check the log for what happens instead: <b>“army defends the capital”</b>. Your single army next to the Greek capital pulls both attackers away, and the siege comes to nothing.</p> <div class="tut-key"><b>Remember</b> “Turn 1/2” is a warning with <b>one round</b> of reaction time. Buying more defence is rarely the best answer – the opponent can add more. Threatening something more valuable of theirs works immediately and costs less.</div>',
  '<p>Die Bevölkerung wachsen zu lassen kostet je <b>1 Nahrung und 1 Münze pro vorhandener Bevölkerung</b>. Deine Hauptstadt hat aktuell 1 Bevölkerung, es kostet also 1 Nahrung und 1 Münzen.</p> <p><b>Warum jetzt?</b> Du hast noch 1 Nahrung und 3 Münzen übrig, und beides verfällt am Zugende. Der Punkt bringt dir ab der nächsten Runde jede Runde +2 Wissenschaft und +1 Münze. Es kostet dich zwar auch eine Nahrungsproduktion, aber davon hast du aktuell noch genug, um weiter schnell Städte gründen zu können.</p> <p><b>So wächst du:</b> Hauptstadt antippen → <b>Bevölkerung wachsen</b>.</p>':
    '<p>Growing the population costs <b>1 food and 1 coin per existing population</b>. Your capital currently has 1 population, so it costs 1 food and 1 coins.</p> <p><b>Why now?</b> You have 1 food and 3 coins left, and both expire at the end of the turn. From the next round on, the point brings you +2 science and +1 coin every round. It does cost you one food production as well, but you still have enough of that to keep founding cities quickly.</p> <p><b>How to grow:</b> tap the capital → <b>Grow population</b>.</p>',
  '<p>Die dritte Stadt kostet mehr: <b>6 Nahrung</b> (3 Basiskosten plus 3 Distanzkosten). Die Basiskosten steigen mit jeder gesiedelten Stadt: 1 / 3 / 6 / 10. Ausbreitung wird immer teurer.</p>':
    '<p>The third city costs more: <b>6 food</b> (3 base cost plus 3 distance cost). The base cost rises with every city settled: 1 / 3 / 6 / 10. Expanding keeps getting more expensive.</p>',
  '<p>Du hast 20 Wissenschaft. <b>Wissenschaftliche Methode</b> kostet 11 – über die Hälfte davon.</p> <p><b>Warum trotzdem zuerst?</b> Sie senkt jede weitere Technologie um <b>2 in der Antike, 4 im Mittelalter, 6 in der Industrialisierung, 8 in der Moderne</b> – nie unter 0. Danach kosten <b>Fischerei</b> und <b>Eisenverarbeitung</b> jeweils <b>0</b>. Sie bezahlt sich also noch in diesem Zug.</p>':
    '<p>You have 20 science. The <b>scientific method</b> costs 11 – more than half of it.</p> <p><b>Why first anyway?</b> It lowers every further technology by <b>2 in Antiquity, 4 in the Middle Ages, 6 in the Industrial Age, 8 in the Modern Age</b> – never below 0. After that <b>fishing</b> and <b>ironworking</b> each cost <b>0</b>. So it pays for itself in this very turn.</p>',
  '<p>Ein Bot führt immer dieselben Schritte aus: jede Stadt wachsen lassen, eine neue Stadt siedeln, eine Armee bauen, alle Armeen bewegen, zweimal forschen. Allerdings führt er jede Aktion nur mit einer Wahrscheinlichkeit von 17 % (leichtester Schwierigkeitsgrad) bis 83%(höchster Schwierigkeitsgrad) aus. Jeder Wurf steht im Protokoll.</p> <p><b>So liest du mit:</b> unten auf <b>Protokoll</b> – dort steht jeder Würfelwurf mit Grund.</p>':
    '<p>A bot always performs the same steps: grow every city, settle a new city, build an army, move all armies, research twice. However, it carries out each action only with a probability of 17 % (easiest difficulty) to 83 % (highest difficulty). Every roll is in the log.</p> <p><b>How to follow along:</b> <b>Log</b> at the bottom – every die roll is there with its reason.</p>',
  '<p>Eine Armee zu bauen kostet aktuell <b>5 Münzen</b>. Das steigt um weitere 5 je eigener Armee, die zweite kostet also 10. Sie erscheint <i>in</i> einer Stadt und <b>muss sie im selben Zug verlassen</b>; Armeen stehen nie auf Städten, auch nicht auf eigenen.</p> <p><b>Warum überhaupt eine Armee?</b> Ohne Armee kannst du weder angreifen noch aktiv eine Stadt verteidigen.</p> <p><b>So baust du:</b> die golden umrandete Stadt antippen → im Blatt auf <b>Armee bauen</b>. Die Armee steht dann in der Stadt und muss sie noch in diesem Zug verlassen.</p>':
    '<p>Building an army currently costs <b>5 coins</b>. That rises by another 5 per army you own, so the second costs 10. It appears <i>inside</i> a city and <b>has to leave it in the same turn</b>; armies never stand on cities, not even your own.</p> <p><b>Why an army at all?</b> Without one you can neither attack nor actively defend a city.</p> <p><b>How to build:</b> tap the gold-outlined city → <b>Build army</b> in the sheet. The army then stands in the city and still has to leave it this turn.</p>',
  '<p>Es wird Zeit zu expandieren. Auf dem golden umrandeten Feld zu siedeln kostet insgesamt <b>4 Nahrung</b> – 1 Basiskosten für die erste zusätzliche Stadt plus 3 Distanzkosten für den Weg dorthin von der Hauptstadt aus.</p> <p><b>So gründest du:</b> goldenes Feld antippen → im Blatt auf <b>Stadt gründen</b>.</p>':
    '<p>Time to expand. Settling on the gold-outlined tile costs <b>4 food</b> in total – 1 base cost for the first additional city plus 3 distance cost for the way there from the capital.</p> <p><b>How to found:</b> tap the golden tile → <b>Found city</b> in the sheet.</p>',
  '<p>Griechenland hat im eigenen Zug eine Armee neben deine Stadt gezogen und schon einmal angegriffen – im Protokoll steht dazu „Zug 1/2". Stadt und Armee sind golden umrandet.</p> <p><b>Angriffswert</b> = Machtwert je angreifender Armee, mehrere addieren sich: <b>5</b> (bei Bots ist das ihre Gesamtbevölkerung).<br> <b>Verteidigungswert</b> = 1 je Stadtbevölkerung plus den Machtwert benachbarter eigener Armeen: <b>1</b>.</p> <p>Der Angriff ist höher. Ist er <b>zwei Züge in Folge</b> höher, verlierst du die Stadt und 2 Bevölkerung. Im Protokoll steht dann „Zug 1/2" – das ist deine Vorwarnung, du hast genau eine Runde Zeit.</p>':
    '<p>On its own turn Greece moved an army next to your city and has already attacked once – the log says “turn 1/2”. City and army are outlined in gold.</p> <p><b>Attack value</b> = the power value per attacking army, several add up: <b>5</b> (for bots that is their total population).<br> <b>Defence value</b> = 1 per city population plus the power value of your adjacent armies: <b>1</b>.</p> <p>The attack is higher. If it is higher <b>two turns in a row</b>, you lose the city and 2 population. The log then says “turn 1/2” – that is your warning, you have exactly one round.</p>',
  '<p>Hochzeivilization ist ein Spiel, bei dem vier Zivilisationen ihr Reich von der Antike in die Moderne führen. Alle Reiche beginnen mit nur einer einzigen Stadt, werden aber schon bald expandieren, ihre Bevölkerung vergrößern, neue Technologien erforschen und Armeen bauen. Eine Zivilisation gewinnt durch wirtschaftliche, militärische oder Technologische Vorherrschaft. Wie genau das im Detail funktioniert, wird später erklärt.</p> <p>Du spielst <b>Russland</b>, die anderen drei Reiche übernehmen Bots auf dem höchsten Schwierigkeitsgrad „David".</p> <p>Golden umrandet ist deine <b>Hauptstadt</b>: Der Kreis mit Symbol ist die Stadt, die Striche daneben symbolisieren die Bevölkerung. Die Linie um die Felder darum ist die Reichsgrenze. <p>Gezogen wird immer in derselben Reihenfolge: <b>Russland (grün) → Griechenland (blau) → England (rot) → Wikingerreich (lila)</b>. Wo die Runde beginnt, hängt vom Startspieler ab, hier bist das du.</p> <p class="tut-note">Im Tutorial sind nur die Schritte dieser Beispielpartie möglich – so bleibt alles nachvollziehbar. „Tutorial beenden" gibt alles frei.</p>':
    '<p>Hochzeivilization is a game in which four civilisations lead their empire from Antiquity into the Modern Age. Every empire starts with a single city, but will soon expand, grow its population, research new technologies and build armies. A civilisation wins through economic, military or technological supremacy. Exactly how that works in detail is explained later.</p> <p>You play <b>Russia</b>, the other three empires are run by bots on the highest difficulty, “David”.</p> <p>Outlined in gold is your <b>capital</b>: the circle with a symbol is the city, the strokes next to it stand for the population. The line around the tiles is the border of your empire. <p>Turn order is always the same: <b>Russia (green) → Greece (blue) → England (red) → Vikings (purple)</b>. Where the round begins depends on the starting player, which here is you.</p> <p class="tut-note">In the tutorial only the steps of this example game are possible – that keeps everything comprehensible. “End tutorial” releases everything.</p>',
  '<p>Im Gegensatz zu anderen Spielen nutzt Hochzeivilization einen dynamischen Technologiebaum: Jede Technologie ist nur mit <b>50 % Wahrscheinlichkeit</b> in einer Partie verfügbar.</p> <p><b>So forschst du:</b> unten auf <b>Forschen</b> → im Bogen die Kachel <b>Schrift</b> antippen. Der Bogen zeigt Kosten oben links in der Kachel.</p>':
    '<p>Unlike other games, Hochzeivilization uses a dynamic technology tree: every technology is only available in a given game with a <b>50 % probability</b>.</p> <p><b>How to research:</b> <b>Research</b> at the bottom → tap the <b>writing</b> tile in the sheet. The sheet shows the cost at the top left of each tile.</p>',
  '<p>Jede Stadt darf einmal pro Runde wachsen. Die Hauptstadt kostet 2 Nahrung und 2 Münzen, die jüngere Stadt nur jeweils 1. Kleine Städte wachsen billiger.</p> <p><b>Warum beide?</b> Nahrung und Münzen verfallen sonst. Und weil die Kosten mit der Größe steigen, ist es effizienter, viele kleine Städte gleichmäßig zu vergrößern als eine große.</p>':
    '<p>Every city may grow once per round. The capital costs 2 food and 2 coins, the younger city only 1 each. Small cities grow more cheaply.</p> <p><b>Why both?</b> Otherwise food and coins expire. And because the cost rises with size, it is more efficient to grow many small cities evenly than one big one.</p>',
  '<p>Macht ist der Angriffswert <i>jeder</i> deiner Armeen und zählt zur Verteidigung benachbarter eigener Städte. Ein Punkt kostet dank Eisenverarbeitung <b>4 statt 5 Münzen</b>; du hast 16. Der Haken: zu Beginn jedes Zuges <b>halbiert</b> sich deine Macht (aufgerundet).</p> <p><b>Die naheliegende Rechnung.</b> Kauf dir 4 Macht, dann steht deine belagerte Stadt bei:</p> <div class="tut-calc"> <div><span>Bevölkerung der Stadt</span><b>1</b></div> <div><span>Stadtmauern</span><b>+5</b></div> <div><span>Burgenbau (virtuelle Armee = dein Machtwert)</span><b>+4</b></div> <div><span>deine Armee daneben</span><b>+4</b></div> <div class="sum"><span>Verteidigung</span><b>14</b></div> </div> <p>Das sieht solide aus – <b>6</b> stehen ohne den Kauf schon da.</p> <p><b>Und jetzt die Gegenrechnung.</b> Griechenland hat gerade <b>5</b> Machtwert – bei Bots ist das ihre Gesamtbevölkerung. Mit einer zweiten Armee, für die es jede Runde würfelt, stünde der Angriff bei <b>10</b>. Das reicht gegen 14 noch nicht.</p> <p><b>Aber der Bot steht nicht still.</b> Er würfelt jede Runde für <i>jede</i> seiner 3 Städte auf Wachstum und einmal aufs Siedeln. Läuft das gut, wächst seine Bevölkerung – und damit sein Machtwert – schon im nächsten Zug so:</p> <div class="tut-calc"> <div><span>Machtwert jetzt</span><b>5</b></div> <div><span>3 Städte wachsen je 1</span><b>+3</b></div> <div><span>eine neue Stadt gegründet</span><b>+1</b></div> <div class="sum"><span>Machtwert dann</span><b>9</b></div> <div><span>× 2 Armeen</span><b>18</b></div> </div> <div class="tut-key"><b>Merke</b> 18 gegen 14: deine vier Münzen wären verbrannt und die Stadt eine Runde später trotzdem weg. Gegen einen Gegner, der jede Runde wächst, ist reine Verteidigung ein Wettrennen, das du verlierst – seine Zahlen steigen von allein, deine nur, wenn du zahlst. <b>Kauf hier nichts.</b> Der nächste Schritt zeigt den billigeren Weg.</div>':
    '<p>Power is the attack value of <i>every</i> one of your armies and counts towards the defence of your adjacent cities. Thanks to ironworking one point costs <b>4 instead of 5 coins</b>; you have 16. The catch: at the start of every turn your power <b>halves</b> (rounded up).</p> <p><b>The obvious calculation.</b> Buy 4 power and your besieged city stands at:</p> <div class="tut-calc"> <div><span>population of the city</span><b>1</b></div> <div><span>city walls</span><b>+5</b></div> <div><span>castles (virtual army = your power value)</span><b>+4</b></div> <div><span>your army beside it</span><b>+4</b></div> <div class="sum"><span>defence</span><b>14</b></div> </div> <p>That looks solid – <b>6</b> are already there without the purchase.</p> <p><b>And now the counter-calculation.</b> Greece currently has power <b>5</b> – for bots that is their total population. With a second army, which it rolls for every round, the attack would stand at <b>10</b>. That is not yet enough against 14.</p> <p><b>But the bot does not stand still.</b> Every round it rolls for growth in <i>each</i> of its 3 cities and once for settling. If that goes well, its population – and with it its power value – grows like this as early as next turn:</p> <div class="tut-calc"> <div><span>power value now</span><b>5</b></div> <div><span>3 cities each grow by 1</span><b>+3</b></div> <div><span>one new city founded</span><b>+1</b></div> <div class="sum"><span>power value then</span><b>9</b></div> <div><span>× 2 armies</span><b>18</b></div> </div> <div class="tut-key"><b>Remember</b> 18 against 14: your four coins would be burnt and the city gone a round later anyway. Against an opponent who grows every round, pure defence is a race you lose – their numbers rise by themselves, yours only when you pay. <b>Buy nothing here.</b> The next step shows the cheaper way.</div>',
  '<p>Mit dem <b>Rad</b> kannst du Felder pflastern. Eine Straße kostet <b>1 Münze</b> und halbiert dort die Bewegungskosten – aber der eigentliche Gewinn ist ein anderer:</p> <div class="tut-key"><b>Handelsrouten</b> Jede deiner Städte außer der Hauptstadt, die über einen <b>durchgehenden Weg</b> mit ihr verbunden ist, bringt jede Runde <b>+1 Wissenschaft, +1 Nahrung und +1 Münze</b>. Liegt auf der ganzen Strecke <b>Eisenbahn</b>, sind es <b>+2</b>. Gemischt zählt der kleinere Wert – ein einziges Straßenfeld drückt die Strecke von +2 auf +1.</div> <p>Du hast <b>4 Münzen</b> und brauchst genau <b>4</b> davon: die vier golden umrandeten Felder hängen alle drei Nebenstädte an die Hauptstadt.</p> <p>Das bringt <b>+3</b> auf jeden der drei Erträge – jede Runde, dauerhaft, für einmalig 4 Münzen. Im Forschungsbogen taucht dafür die Zeile <b>Handelsrouten</b> auf.</p>':
    '<p>With the <b>wheel</b> you can pave tiles. A road costs <b>1 coin</b> and halves the movement cost there – but the real gain is a different one:</p> <div class="tut-key"><b>Trade routes</b> Every city of yours except the capital that is connected to it by an <b>unbroken road</b> brings <b>+1 science, +1 food and +1 coin</b> every round. If the whole route is <b>railway</b>, it is <b>+2</b>. Mixed routes count as the lower value – a single road tile pushes the route from +2 down to +1.</div> <p>You have <b>4 coins</b> and need exactly <b>4</b> of them: the four gold-outlined tiles connect all three secondary cities to the capital.</p> <p>That brings <b>+3</b> on each of the three yields – every round, permanently, for a one-off 4 coins. The line <b>trade routes</b> shows up for it in the research sheet.</p>',
  '<p>Mit dem Erforschen der Schrift hat sich das Mittelalter dieser Kategorie geöffnet. Deshalb steht jetzt <b>Papier</b> im Bogen. Es kostet 6 Wissenschaft.</p> <p><b>Warum Papier?</b> Es gibt <b>+1 Wissenschaft auf jedem Grasland</b>. Du kontrollierst 5 Grasland-Felder, das sind 5 Wissenschaft mehr in <i>jeder</i> Runde für einmalig 6. Nach zwei Runden hat es sich mehrfach bezahlt.</p>':
    '<p>Researching writing opened up the Middle Ages of this category. That is why <b>paper</b> now appears in the sheet. It costs 6 science.</p> <p><b>Why paper?</b> It gives <b>+1 science on every grassland</b>. You control 5 grassland tiles, so that is 5 more science in <i>every</i> round for a one-off 6. After two rounds it has paid for itself several times over.</p>',
  '<p>Oben rechts in der Kopfzeile stehen 🔬 Wissenschaft, 🌾 Nahrung, 🪙 Münzen und ⚔︎ Macht. So setzen sie sich in diesem Zug zusammen:</p> <table class="tut-tab"> <tr><th align="left">Quelle</th><th>🔬</th><th>🌾</th><th>🪙</th></tr> <tr><td>4 × Grasland</td><td>·</td><td>4</td><td>·</td></tr><tr><td>1 × Wald</td><td>·</td><td>1</td><td>1</td></tr><tr><td>1 × Fluss</td><td>·</td><td>1</td><td>1</td></tr> <tr><td>1 Bevölkerung</td><td>1</td><td>-1</td><td>1</td></tr> <tr class="sum"><td>Summe</td><td>1</td><td>5</td><td>3</td></tr> </table> <div class="tut-key"><b>Merke</b> Ressourcen <b>verfallen am Zugende</b>. Nur Macht bleibt liegen. Gib also alles aus. Münzen können <b>2:1</b> als Nahrung oder Wissenschaft verwendet werden.</div>':
    '<p>At the top right of the header you see 🔬 science, 🌾 food, 🪙 coins and ⚔︎ power. This is how they add up this turn:</p> <table class="tut-tab"> <tr><th align="left">Source</th><th>🔬</th><th>🌾</th><th>🪙</th></tr> <tr><td>4 × grassland</td><td>·</td><td>4</td><td>·</td></tr><tr><td>1 × forest</td><td>·</td><td>1</td><td>1</td></tr><tr><td>1 × river</td><td>·</td><td>1</td><td>1</td></tr> <tr><td>1 population</td><td>1</td><td>-1</td><td>1</td></tr> <tr class="sum"><td>Total</td><td>1</td><td>5</td><td>3</td></tr> </table> <div class="tut-key"><b>Remember</b> Resources <b>expire at the end of the turn</b>. Only power carries over. So spend everything. Coins can be used <b>2:1</b> as food or science.</div>',
  '<p>Weil jeder Bevölkerungspunkt dauerhaft 1 Nahrung verbraucht, darf deine <b>Nahrungsproduktion nie negativ</b> werden. Ist die Grenze erreicht, wird Wachstum gesperrt – verhungern tut aber niemand.</p> <p>Du produzierst gerade <b>19 Nahrung</b> über den Verbrauch hinaus. Deine Städte können zusammen also noch <b>19×</b> wachsen, bevor die Grenze greift – egal, wie du die Schritte auf die Städte verteilst.</p> <p>Dagegen hilft mehr Ertrag: <b>Landwirtschaft</b> auf Grasland, <b>Kunstdünger</b> im Wald, <b>Bewässerung</b> im Gebirge, <b>Ökologie</b>. Oder <b>Gentechnik</b> und <b>Massenmedien</b>: mit ihnen lässt sich zu Zugbeginn ein Teil dessen, was die Bevölkerung isst, aus Wissenschaft bzw. Münzen bestreiten – dann wird der 🌾-Knopf oben anklickbar.</p>':
    '<p>Because every point of population permanently consumes 1 food, your <b>food production must never go negative</b>. Once the limit is reached, growth is blocked – but nobody starves.</p> <p>You are currently producing <b>19 food</b> beyond consumption. So your cities can grow <b>19×</b> in total before the limit bites – no matter how you spread the steps across the cities.</p> <p>More yield helps against that: <b>agriculture</b> on grassland, <b>fertiliser</b> in forest, <b>irrigation</b> in mountains, <b>ecology</b>. Or <b>genetic engineering</b> and <b>mass media</b>: with them, part of what the population eats can be covered from science or coins at the start of your turn – then the 🌾 button at the top becomes clickable.</p>',
  '<p>Übrig ist 1 Wissenschaft – genau der Preis für <b>Rad</b> (1). Ungenutzte Wissenschaft verfällt zum Zugende, also raus damit.</p> <p><b>Warum Rad?</b> Es erlaubt <b>Straßen</b>. Die halbieren nicht nur die Bewegungskosten – sie verbinden auch deine Städte zu <b>Handelsrouten</b>, und die bringen jede Runde etwas ein. Gleich baust du die erste.</p> <div class="tut-key"><b>Merke</b> Wissenschaft, Nahrung und Münzen sind <b>Rundeneinkommen</b>, kein Vorrat: Was du am Zugende übrig hast, ist verloren. Plane deine Käufe so, dass am Ende möglichst wenig liegen bleibt.</div>':
    '<p>1 science is left – exactly the price of the <b>wheel</b> (1). Unused science expires at the end of the turn, so out with it.</p> <p><b>Why the wheel?</b> It allows <b>roads</b>. Those not only halve movement costs – they also connect your cities into <b>trade routes</b>, and those pay you something every round. You will build the first one in a moment.</p> <div class="tut-key"><b>Remember</b> Science, food and coins are <b>round income</b>, not a stock: whatever is left at the end of your turn is lost. Plan your purchases so that as little as possible stays behind.</div>',
  '<p>Übrig sind 0 🔬, 0 🌾, 2 🪙. Damit kannst du aktuell nichts anfangen, der Rest verfällt. Das ist normal in Runde 1.</p> <p>Danach ziehen die drei Bots.</p> <p><b>So beendest du:</b> unten rechts auf <b>Zug beenden</b>, dann im Bot-Fenster jeweils auf <b>Weiter</b>.</p>':
    '<p>Left over are 0 🔬, 0 🌾, 2 🪙. There is nothing you can do with that right now, the rest expires. That is normal in round 1.</p> <p>After that the three bots take their turns.</p> <p><b>How to end:</b> <b>End turn</b> at the bottom right, then <b>Continue</b> in each bot window.</p>',

  'Deine Aufgabe:': 'Your task:',
  'Dein Umland': 'Your surroundings',

  'Ab hier spielst du allein':
    'From here you play on your own',
  'Die Hauptstadt wachsen lassen':
    'Growing the capital',
  'Die drei Wege zu gewinnen':
    'The three ways to win',
  'Ertrag beim Siedeln':
    'Yield when settling',
  'Forschen: Papier':
    'Research: paper',
  'Forschen: Wissenschaftliche Methode':
    'Research: scientific method',
  'Kaufe <b>Rad</b>.':
    'Buy the <b>wheel</b>.',
  'Kaufe <b>Wissenschaftliche Methode</b>.':
    'Buy the <b>scientific method</b>.',
  'Rechne nach, bevor du kaufst':
    'Do the maths before you buy',

  'Eisenbahn': 'Railway',
  'Straße': 'Road',
  '(%s offen)': '(%s open)',

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
