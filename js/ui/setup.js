/* js/ui/setup.js – Aufbau: Module, Vorlieben, Plätze, Karte, Start.
   Teil der Oberfläche; alle Skripte teilen einen globalen Gültigkeitsbereich, die
   Reihenfolge steht in index.html (die einzige Liste). */
/* ------------------------------------------------ Die eine Vorliebe: Animationen
   Bis v101 gab es einen Bildschirm „Einstellungen" mit vier Schaltern. Seit v102 (Anweisung
   des Autors) bleibt nur, wie Züge von KI und Bots gezeigt werden – im Spielmenü (☰).
   Ereignisse und Weltwunder wählt man direkt im Aufbau, je Partie; Kosten zeigen immer, was
   tatsächlich abgeht (costText), und gedreht wird im Hochformat immer.

   `anim` (v95; v94 hatte das Häkchen `noAnim`): 'langsam' (ab Werk), 'schnell' oder 'aus'
   (wieder als Blatt mit „Weiter"). Ein von v94 gespeichertes `noAnim: true` wird zu 'aus'. */
const PREF_KEY = 'hochciv.prefs';
const ANIM_STUFEN = ['langsam', 'schnell', 'aus'];
const prefs = { anim: 'langsam' };
function loadPrefs() {
  const o = load(PREF_KEY) || {};
  prefs.anim = ANIM_STUFEN.includes(o.anim) ? o.anim : o.noAnim ? 'aus' : 'langsam';
}
function setAnim(k) {
  prefs.anim = ANIM_STUFEN.includes(k) ? k : 'langsam';
  store(PREF_KEY, prefs);
}
// Die Ereignisstärke gehört zu den Ereignissen und hängt an deren Häkchen.
function evmodeRow() { $('setup-evmode-row').hidden = !$('setup-events').checked; }
/* Der alte Techtree (bis v81 Standard) ist seit v82 nicht mehr wählbar – die Zeile im Aufbau
   ist weg. Er lebt nur in Partien weiter, die vor v82 mit ihm begonnen wurden (migrateState).
   Für solche Partien nennen Weltblatt und Regelbogen ihn. Der Text kommt aus OLD_TECH_COSTS,
   damit er nicht veraltet. */
function oldTreeText() {
  return FIELDS.map((fn, f) => {
    const liste = Object.keys(OLD_TECH_COSTS).map(k => TECH_BY_KEY[k]).filter(t => t.f === f)
      .sort((a, b) => OLD_TECH_COSTS[a.k] - OLD_TECH_COSTS[b.k]);
    return liste.length ? liste.map(t => `${t.n} ${OLD_TECH_COSTS[t.k]}`).join(', ') + ` (${fn})` : '';
  }).filter(Boolean).join(' · ');
}
const oldTreeShown = () => !!(S && S.oldTree);

/* ------------------------------------------------------------------ Aufbau */
// 'vier' = alle vier Reiche, 'drei' = drei Reiche, 'duell' = 1 gegen 1
let setupMode = 'vier';
const setupCount = () => setupMode === 'duell' ? 2 : setupMode === 'drei' ? 3 : 4;

/* Kartenliste. Sie hängt an der Spielerzahl: die Plättchenkarte hat für zwei, drei und
   vier Reiche eine eigene Form; die feste Karte und eine eigene Karte gibt es nur bei vier
   Reichen. Bis v98 standen sie auch bei drei zur Wahl (ein Startstern blieb leer) – seit v99
   spielen drei Reiche immer auf der Plättchenkarte (Anweisung des Autors), wie das Duell. */
function mapOptions() {
  const n = setupCount();
  const out = [];
  if (n === 4) MAPS.forEach((m, i) => out.push([String(i), m.name]));
  out.push(['plaettchen', TILE_SHAPES[n].name]);
  // experimenteller Plättchenmodus (v107; v99–v106 das Häkchen „Sechseck-Plättchen")
  if (n === 4) out.push(['plaettchen14', TILE_SHAPES.tri14.name]);
  if (customMap && n === 4) out.push(['eigene', T('Eigene Karte')]);
  return out;
}
// Plättchenkarten in der Kartenliste – und welche Form außer der üblichen sie meinen
const isTilePick = v => v === 'plaettchen' || v === 'plaettchen14';
const tileShapeOf = v => v === 'plaettchen14' ? 'tri14' : null;
/* Die Karte, die der Aufbau gerade wirklich anbietet: die gemerkte Wahl, wenn es sie bei
   dieser Spielerzahl gibt, sonst die erste der Liste (bei zwei und drei Reichen die
   Plättchenkarte). Bis v98 fragten die Zivilisationswahl und die Platznummern die gemerkte
   Wahl selbst – im Duell stand dann „Hier darf jeder Platz frei wählen“, gesperrt waren
   Doppelte trotzdem, solange vorher nicht ausdrücklich die Plättchenkarte gewählt war. */
function setupPick() {
  const opts = mapOptions();
  return opts.some(o => o[0] === setupMapWanted) ? setupMapWanted : opts[0][0];
}
/* Die zuletzt bewusst gewählte Karte. Sie wird gemerkt, damit ein Ausflug in den
   Duellmodus (dort gibt es die festen Karten nicht) die Wahl nicht still umstellt. */
let setupMapWanted = '0';
function fillMapSelect() {
  const sel = $('setup-map');
  // Marathon (v83): immer eine neue Zufallskarte – keine Wahl. Was die Spielarten ausmacht,
  // steht seit v102 in den Regeln statt in Hinweisen unter der Auswahl.
  const marathon = setupMode === 'marathon';
  if (marathon) {
    $('setup-map-row').hidden = true;
    return;
  }
  const opts = mapOptions();
  sel.innerHTML = opts.map(([v, n]) => `<option value="${v}">${n}</option>`).join('');
  sel.value = setupPick();
  // Im Duell gibt es nur die Plättchenkarte – dann bleibt die Zeile weg statt einer
  // Auswahl mit einem einzigen Eintrag.
  $('setup-map-row').hidden = opts.length < 2;
  sel.disabled = opts.length < 2;
  sel.onchange = () => {
    setupMapWanted = sel.value;
    renderSlots();          // die Plättchenkarte lässt jede Zivilisation mehrfach zu
  };
}
// Auf der Plättchenkarte darf jeder Platz frei wählen, auch dieselbe Zivilisation
// mehrfach – auf den festen Karten sitzt jede Zivilisation genau einmal (feste
// Startsterne, ein Stern je Reich).
const freieCivWahl = () => setupMode !== 'marathon' && isTilePick(setupPick());
/* Nummerierte Plätze („Platz 1 …") hat der Aufbau auf der Plättchenkarte und bei weniger als
   vier Reichen. Dort ziehen die Reiche seit v90 in der Reihenfolge der Plätze, ab dem
   Startspieler (newGame mit cfg.seatOrder, Anweisung des Autors). Die klassische Aufstellung
   mit allen vier Zivilisationen und der Marathon zeigen Zivilisationen statt Plätzen – dort
   ist jede ihr eigener Platz, und es bleibt bei Russland → Griechenland → England → Wikinger. */
const platzNummern = (mode, mapPick, n) => (mode !== 'marathon' && isTilePick(mapPick)) || n < 4;
function setupScreen() {
  $('setup-evmode').innerHTML = EVENT_MODES.map(m => `<option value="${m.k}">${m.n}</option>`).join('');
  $('setup-diff').innerHTML = DIFFICULTIES.map(x =>
    `<option value="${x.k}"${x.k === 'prinz' ? ' selected' : ''}>${x.n}</option>`).join('');
  $('setup-kilevel').innerHTML = KI_LEVELS.map(x =>
    `<option value="${x.k}"${x.k === KI_DEFAULT_LEVEL ? ' selected' : ''}>${x.n}</option>`).join('');
  // Ereignisse und Weltwunder (v102): immer im Aufbau, je Partie, ab Werk aus
  $('setup-events').onchange = evmodeRow;
  evmodeRow();
  // Der gewählte Modus bleibt erhalten, wenn man den Aufbau erneut öffnet
  $('setup-mode').querySelectorAll('[data-mode]').forEach(b =>
    b.classList.toggle('on', b.dataset.mode === setupMode));
  fillMapSelect();
  $('setup-mode').querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
    $('setup-mode').querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b));
    setupMode = b.dataset.mode;
    renderSlots();
  });
  renderSlots();
}
/* Zeichnet die Reichs-Karteikarten. Auf den festen Karten sitzt jede Zivilisation genau
   einmal (bei vier Reichen liegt sie damit fest); auf der Plättchenkarte wählt jeder Platz
   frei, auch zweimal dieselbe. */
function renderSlots() {
  const n = setupCount();
  fillMapSelect();
  const list = $('setup-list');
  const frei = freieCivWahl(), plaetze = platzNummern(setupMode, setupPick(), n);
  // Mensch/Bot und Fähigkeit überleben ein Neuzeichnen (Kartenwechsel, Zivilisationswahl)
  const alt = [...list.children].map(x => ({
    kind: x.querySelector('[data-kind].on').dataset.kind,
    abil: x.querySelector('[data-abil]').value,
  }));
  const chosen = plaetze ? pickChoice(n) : CIV_KEYS.slice();
  // Feste Karte: Doppelungen auflösen, sonst säßen zwei Reiche auf einem Startstern
  if (!frei) for (let i = 0; i < n; i++)
    if (chosen.indexOf(chosen[i]) !== i)
      chosen[i] = pickCivs[i] = CIV_KEYS.find(k => !chosen.slice(0, n).includes(k));
  list.innerHTML = '';
  chosen.forEach((civKey, i) => {
    const zufall = civKey === 'zufall';
    const civ = zufall ? null : CIV_BY_KEY[civKey];
    /* Bei ausgeloster Zivilisation stehen ihre Fähigkeiten noch nicht fest – dann bleibt
       auch bei der Fähigkeit nur der Zufall. Eine Zeile „Grundfähigkeit" gab es hier
       früher; sie ist ersatzlos weg. Sie benannte nichts: die Grundfähigkeit heißt bei
       jedem Reich anders und wirkt anders (Günstige Forschung, Handelsreich, Taiga,
       Seefahrer), und welche man bekommt, entscheidet erst die Auslosung. */
    const abils = zufall
      ? [{ k: 'zufall', n: T('Zufall') }]
      : civ.abilities.map(a => ({ k: a.k, n: a.n, e: a.e }))
        .concat([{ k: 'zufall', n: T('Zufall'), e: T('Wird beim Spielstart ausgelost.') }]);
    /* Eine Zeile je Platz (v102): Reich, Mensch/KI/Bot, Fähigkeit. Auf der Plättchenkarte und
       bei weniger als vier Reichen ist das Reich wählbar; die Reihenfolge der Zeilen ist die
       Zugfolge. Was eine Fähigkeit bewirkt, zeigt die Auswahl selbst (pickAbil). */
    const d = document.createElement('div');
    d.className = 'slot'; d.dataset.civ = civKey;
    d.innerHTML = `<div class="slot-civ">` + (plaetze
      ? `<h3>${zufall ? '🎲' : SYM[civ.sym]}</h3>
         <select data-civpick aria-label="${T('Zivilisation')}">${CIVS.map(c =>
           `<option value="${c.k}"${c.k === civKey ? ' selected' : ''}>${c.n}</option>`).join('')}
           <option value="zufall"${zufall ? ' selected' : ''}>${T('Zufall')}</option>
         </select>`
      : `<h3>${SYM[civ.sym]} ${civ.n}</h3>`) + `</div>` +
      /* Drei Arten: Mensch, KI (spielt nach den Regeln für Menschen, js/ki.js) und Bot (nach
         den Bot-Regeln). Die KI ist die Vorgabe für die Gegner – Bots bleiben wählbar. */
      `<div class="seg">
        <button data-kind="human" class="${(alt[i] ? alt[i].kind === 'human' : i === 0) ? 'on' : ''}">${T('Mensch')}</button>
        <button data-kind="ki" class="${(alt[i] ? alt[i].kind === 'ki' : i !== 0) ? 'on' : ''}">${T('KI')}</button>
        <button data-kind="bot" class="${(alt[i] && alt[i].kind === 'bot') ? 'on' : ''}">${T('Bot')}</button>
      </div>
      <button type="button" class="abil-pick" data-abilpick></button>
      <select data-abil="${zufall ? 'zufall' : civ.k}" hidden>${abils.map(a =>
        `<option value="${a.k}">${a.n}</option>`).join('')}
      </select>`;
    list.appendChild(d);
    const sela = d.querySelector('[data-abil]'), knopf = d.querySelector('[data-abilpick]');
    if (alt[i] && abils.some(a => a.k === alt[i].abil)) sela.value = alt[i].abil;
    // Marathon (v83): Fähigkeiten werden vor dem ersten Zug gedraftet, hier gibt es keine Wahl
    const marathon = setupMode === 'marathon';
    knopf.hidden = marathon;
    const paint = () => {
      const kind = d.querySelector('[data-kind].on').dataset.kind;
      // Bots haben keine Fähigkeit, und bei ausgelostem Reich gibt es nur den Zufall –
      // beides ist keine Wahl, also steht die Auswahl still.
      sela.disabled = kind === 'bot' || zufall;
      knopf.disabled = sela.disabled;
      const a = abils.find(x => x.k === sela.value) || abils[0];
      knopf.textContent = kind === 'bot' ? '—' : a.n;
      kindRows();
    };
    // Die Auswahl der Fähigkeit: Name und Wirkung jeder Möglichkeit, die gewählte markiert
    knopf.onclick = () => {
      if (sela.disabled) return;
      modal(zufall ? T('Fähigkeit') : civ.n, abils.map(a =>
        `<button class="opt${a.k === sela.value ? ' on' : ''}" data-k="${a.k}"><span>${esc(a.n)}` +
        `${a.e ? `<small>${esc(a.e)}</small>` : ''}</span></button>`).join(''));
      $('ov-body').querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
        sela.value = b.dataset.k; closeModal(); paint();
      });
    };
    sela.onchange = paint;
    d.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => {
      d.querySelectorAll('[data-kind]').forEach(x => x.classList.toggle('on', x === b));
      paint(); refreshStart();
    });
    const pick = d.querySelector('[data-civpick]');
    if (pick) pick.onchange = () => {
      pickCivs[i] = pick.value;
      // Nur auf den festen Karten: jeder andere Platz mit derselben Zivilisation zieht
      // auf eine freie um. Auf der Plättchenkarte darf sie doppelt vorkommen.
      if (!freieCivWahl()) for (let j = 0; j < n; j++) {
        if (j === i || pickCivs[j] !== pick.value) continue;
        pickCivs[j] = CIV_KEYS.find(k => !pickCivs.slice(0, n).includes(k));
      }
      renderSlots();          // Mensch/Bot und Fähigkeit bleiben dabei erhalten
    };
    paint();
  });
  refreshStart();
}
// Vorauswahl der frei wählbaren Plätze (Duell, drei Reiche, Plättchenkarte)
let pickCivs = ['griechenland', 'wikinger', 'russland', 'england'];
function pickChoice(n) { return pickCivs.slice(0, n); }
function setupConfig() {
  const diff = $('setup-diff').value;    // ein Schwierigkeitsgrad für alle Bots
  const kiLevel = $('setup-kilevel').value || KI_DEFAULT_LEVEL;   // eine Stufe für alle KI
  // Rohwahl: 'zufall' bleibt stehen, aufgelöst wird erst in startPlayers()
  return [...$('setup-list').children].map(slot => ({
    civ: slot.dataset.civ,
    kind: slot.querySelector('[data-kind].on').dataset.kind,
    diff, kiLevel,
    ability: slot.querySelector('[data-abil]').value,
  }));
}
/* Die Zeilen für Bot-Schwierigkeit und KI-Stufe stehen nur da, wenn es solche Plätze gibt –
   sonst fragt der Aufbau nach etwas, das in dieser Partie niemand braucht. */
function kindRows() {
  const kinds = [...$('setup-list').children].map(x => {
    const on = x.querySelector('[data-kind].on');
    return on ? on.dataset.kind : null;
  });
  $('setup-diff-row').hidden = !kinds.includes('bot');
  $('setup-kilevel-row').hidden = !kinds.includes('ki');
}
/* Rezept einer Partie: die ROHE Wahl aus dem Aufbau, „Zufall" noch nicht aufgelöst.
   Genau das macht es wiederverwendbar – wer mit ausgeloster Zivilisation gestartet ist,
   bekommt beim nächsten Mal eine neue. Wandert in den Spielstand (S.recipe), damit
   „Nochmal spielen" auch nach einem Neuladen noch weiß, wie aufgesetzt war. */
function setupRecipe(mapPick, startWahl) {
  return {
    mode: setupMode, mapPick, start: startWahl,
    events: $('setup-events').checked, eventMode: $('setup-evmode').value,
    wonders: $('setup-wonders').checked,
    players: setupConfig(),
  };
}
/* Sitzt eine Zivilisation mehrfach am Tisch, bekommen ihre Reiche römische Ziffern und
   je eine der vier Zivilisationsfarben – keine Schattierungen. Die erste behält ihre
   eigene Farbe, die Doppelgänger nehmen eine noch freie (zwei Griechenland: eines blau,
   das andere zum Beispiel Englands Rot). Ohne Farbunterschied wären sie auf der Karte
   nicht auseinanderzuhalten: Städte, Armeen und Grenzen werden nur über sie unterschieden. */
const ROMAN = ['I', 'II', 'III', 'IV'];
function nameDoubles(alle) {
  /* Wer noch seine Fähigkeit wählt (v107), hat noch keine Zivilisation – nach der Wahl läuft es
     noch einmal, deshalb erst zurücksetzen. */
  const players = alle.filter(p => CIV_BY_KEY[p.civ]);
  players.forEach(p => { delete p.color; delete p.roman; delete p.name; });
  const zaehler = {};
  players.forEach(p => { zaehler[p.civ] = (zaehler[p.civ] || 0) + 1; });
  const belegt = new Set();
  // erster Durchgang: wer seine eigene Farbe noch bekommen kann, behält sie
  players.forEach(p => {
    if (belegt.has(p.civ)) return;
    belegt.add(p.civ); p.colorOf = p.civ;
  });
  // zweiter Durchgang: die Doppelgänger nehmen eine freie Zivilisationsfarbe
  players.forEach(p => {
    if (p.colorOf) return;
    const frei = CIV_KEYS.find(k => !belegt.has(k));
    belegt.add(frei); p.colorOf = frei;
  });
  const lauf = {};
  players.forEach(p => {
    const civ = CIV_BY_KEY[p.civ];
    p.color = p.colorOf === p.civ ? null : CIV_BY_KEY[p.colorOf].color;
    delete p.colorOf;
    if (zaehler[p.civ] < 2) return;
    const k = lauf[p.civ] = (lauf[p.civ] || 0) + 1;
    p.roman = ROMAN[k - 1] || String(k);      // civOf baut den Namen daraus
    p.name = `${civ.n} ${p.roman}`;           // für Anzeigen, die nur den Text kennen
  });
  return alle;
}
/* „Zufall" in der Auswahl wird erst beim Spielstart aufgelöst – bis dahin steht im
   Aufbau wirklich Zufall, damit niemand aus der Anzeige schon die Wahl abliest.
   `frei` = Doppelungen erlaubt (Plättchenkarte); sonst bleibt jede Zivilisation einmalig. */
function resolveRandom(players, frei) {
  const pick = list => list[Math.floor(Math.random() * list.length)];
  // Fähigkeitswahl (v107, pickWanted): wer wählt, behält den Zufall bis zur Wahl vor dem Legen
  if (frei && pickWanted(players)) players.forEach(p => { if (p.kind !== 'bot') p.pick = true; });
  players.forEach((p, i) => {
    if (p.civ !== 'zufall' || p.pick) return;
    const pool = CIV_KEYS.filter(k => frei ||
      !players.some((q, j) => j !== i && q.civ === k));
    p.civ = pick(pool.length ? pool : CIV_KEYS);
    p.randomCiv = true;
  });
  players.forEach(p => {
    if (p.ability !== 'zufall' || p.pick) return;
    p.ability = pick(CIV_BY_KEY[p.civ].abilities).k;
    p.randomAbility = true;
  });
  return players;
}
/* Fertige Spielerliste für den Start: Zufall auflösen, dann Ziffern und Farben. */
function startPlayers() {
  return nameDoubles(resolveRandom(setupConfig(), freieCivWahl()));
}
// Nur eine bewusste Wahl bleibt stehen; ohne sie steht „Zufällig“ (seit v99, Anweisung des
// Autors – bis v98 richtete sich die Vorauswahl nach der Besetzung: bei mehreren Menschen
// Zufall, sonst der einzige Mensch).
let startWanted = null;
function refreshStart() {
  const cfg = setupConfig(), sel = $('setup-start');
  const label = p => p.civ === 'zufall' ? T('Zufällige Zivilisation')
    : (CIV_BY_KEY[p.civ] ? CIV_BY_KEY[p.civ].n : p.civ);
  sel.innerHTML = `<option value="zufall">${T('Zufällig')}</option>` + cfg.map((p, i) =>
    `<option value="${i}">${label(p)}${kindTag(p)}</option>`).join('');
  sel.value = (startWanted != null && [...sel.options].some(o => o.value === startWanted))
    ? startWanted : 'zufall';
  sel.onchange = () => { startWanted = sel.value; };
}
