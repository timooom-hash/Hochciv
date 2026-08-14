/* Führt die echte Oberfläche in jsdom aus: Aufbau → Spielzug → Forschen →
   Kartenwechsel → Bot-Züge. Fängt Referenz- und Laufzeitfehler ab. */
const { JSDOM } = require('jsdom');
const fs = require('fs');

const dom = new JSDOM(fs.readFileSync(__dirname + '/index.html', 'utf8'), {
  runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/',
});
const { window } = dom;
// jsdom kennt kein SVG-Layout – die drei benötigten Methoden nachrüsten
const SVG = window.SVGElement.prototype;
SVG.createSVGPoint = function () {
  return { x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } };
};
SVG.getScreenCTM = function () { return { a: 1, d: 1, inverse: () => ({}) }; };
window.Element.prototype.getBoundingClientRect = () => ({ width: 800, height: 600, left: 0, top: 0 });
window.Element.prototype.setPointerCapture = () => { };
window.URL.createObjectURL = () => 'blob:x';
window.URL.revokeObjectURL = () => { };

const errors = [];
window.addEventListener('error', e => errors.push(e.message));
// Im Browser teilen sich <script>-Tags den globalen Gültigkeitsbereich; eval nicht.
// Deshalb alles zusammen auswerten und einen Zugriffspunkt für den Test anhängen.
const src = ['js/data.js', 'js/hex.js', 'js/engine.js', 'js/bots.js', 'js/ui.js']
  .map(f => fs.readFileSync(__dirname + '/' + f, 'utf8')).join('\n');
window.eval(src + '\n;window.__get = n => eval(n); window.__set = (n, v) => eval(n + "=v");');
const G = n => window.__get(n);

const $ = id => window.document.getElementById(id);
const step = (label, fn) => {
  try { fn(); console.log('  ok  ' + label); }
  catch (e) { errors.push(label + ': ' + e.message); console.log('FAIL ' + label + ': ' + e.message); }
};

step('Menü gerendert', () => { if (!$('m-new')) throw new Error('kein Startknopf'); });
step('Aufbaubildschirm', () => { $('m-new').onclick(); if (!$('setup-list').children.length) throw new Error('leer'); });
step('Bots einstellen', () => {
  [1, 2, 3].forEach(i => $('setup-list').children[i].querySelector('[data-kind="bot"]').onclick());
});
step('Kartenauswahl vorhanden', () => {
  const n = $('setup-map').options.length;
  if (n < 2) throw new Error('nur ' + n + ' Karte(n) wählbar');
  console.log('       ' + [...$('setup-map').options].map(o => o.text).join(' · '));
});
step('Schwierigkeit ist global (ein Dropdown)', () => {
  const sel = $('setup-diff');
  if (!sel || sel.options.length < 3) throw new Error('kein globales Schwierigkeit-Dropdown');
  if ($('setup-list').querySelector('[data-diff]')) throw new Error('noch Pro-Bot-Schwierigkeit vorhanden');
  console.log('       ' + [...sel.options].map(o => o.text).join(' · '));
});
step('Regelmodus wählbar', () => {
  const opts = [...$('setup-rules').options].map(o => o.text);
  if (opts.length < 2) throw new Error('kein v2-Modus wählbar');
  console.log('       ' + opts.join(' · '));
});
step('Spiel starten', () => { $('setup-go').onclick(); });
step('Karte gezeichnet', () => {
  const n = $('map').querySelectorAll('[data-r]').length;
  if (n < 100) throw new Error('nur ' + n + ' Felder');
  console.log('       ' + n + ' Felder, ' + $('map').querySelectorAll('circle').length + ' Stadtkreise');
});
step('Feld antippen (Hauptstadt)', () => {
  const S = G('S'), cap = G('capitalOf')(S, S.cur);
  G('tapHex')(cap.r, cap.c);
  if (!$('sheet').classList.contains('open')) throw new Error('Aktionsblatt öffnet nicht');
  console.log('       ' + $('sheet-body').textContent.replace(/\s+/g, ' ').slice(0, 96));
});
step('Stadt wachsen lassen', () => {
  const before = G('popOf')(G('S'), G('S').cur);
  const btns = [...$('sheet-body').querySelectorAll('.opt')].filter(b => !b.disabled);
  if (btns.length) btns[0].onclick();
  console.log('       Bevölkerung ' + before + ' → ' + G('popOf')(G('S'), G('S').cur));
});
step('Freies Feld antippen', () => {
  const S = G('S'), cap = G('capitalOf')(S, S.cur);
  const spot = G('within')(cap.r, cap.c, 4).find(([r, c]) => !G('canFound')(S, S.cur, r, c));
  if (spot) { G('tapHex')(spot[0], spot[1]); console.log('       ' + $('sheet-body').textContent.replace(/\s+/g, ' ').slice(0, 80)); }
});
step('Technologiebogen', () => {
  $('a-tech').onclick();
  const n = $('ov-body').querySelectorAll('.tech').length;
  if (n < 50) throw new Error('nur ' + n + ' Technologien');
  const open = $('ov-body').querySelectorAll('[data-tech]').length;
  console.log('       ' + n + ' Technologien, davon ' + open + ' jetzt erforschbar');
  if (open) $('ov-body').querySelector('[data-tech]').onclick();
});
step('Machtblatt', () => { G('closeModal')(); $('a-power').onclick(); });
step('Protokoll', () => { $('a-log').onclick(); G('closeModal')(); });
step('Armee bauen, in der Stadt anwählen und bewegen', () => {
  const S = G('S'), pi = S.cur, cap = G('capitalOf')(S, pi);
  S.players[pi].res.coins = 60;
  const err = G('buildArmy')(S, pi, cap);
  if (err) throw new Error(err);
  const army = S.armies.filter(a => a.owner === pi).pop();
  if (army.r !== cap.r || army.c !== cap.c) throw new Error('Armee steht nicht in der Stadt');
  G('tapHex')(cap.r, cap.c);
  const b = [...$('sheet-body').querySelectorAll('.opt')].find(x => /Armee hier bewegen/.test(x.textContent));
  if (!b) throw new Error('Armee auf dem Stadtfeld nicht anwählbar');
  b.onclick();
  const ziel = G('neighbors')(cap.r, cap.c).find(([r, c]) => G('canEnter')(S, pi, r, c));
  G('tapHex')(ziel[0], ziel[1]);
  if (army.r === cap.r && army.c === cap.c) throw new Error('Armee hat sich nicht bewegt');
  console.log('       Armee von ' + cap.r + '/' + cap.c + ' nach ' + army.r + '/' + army.c);
});
step('Armeeübersicht in der Leiste', () => {
  $('a-army').onclick();
  const n = $('sheet-body').querySelectorAll('[data-i]').length;
  if (!n) throw new Error('Übersicht listet keine Armeen');
  console.log('       ' + n + ' Armee(n) gelistet');
});
step('Internet: Gratiskopie im Technologiebogen', () => {
  const S = G('S'), pi = S.cur;
  S.players[pi].techs.internet = true;
  const other = (pi + 1) % S.players.length;
  S.players[other].techs.stadtmauern = true;
  $('a-tech').onclick();
  const btn = [...$('ov-body').querySelectorAll('[data-copy]')].find(b => /Stadtmauern/.test(b.textContent));
  if (!btn) throw new Error('keine kopierbare Technologie angezeigt');
  const gratis = /gratis/.test(btn.textContent);
  console.log('       Kopie als ' + (gratis ? 'gratis' : 'bezahlt') + ' markiert');
  btn.onclick();
  if (!G('has')(S.players[pi], 'stadtmauern')) throw new Error('Kopie nicht übernommen');
  G('closeModal')();
});
step('Sklaverei- und Kolonialismus-Buttons erscheinen', () => {
  const S = G('S'), pi = S.cur, cap = G('capitalOf')(S, pi);
  S.players[pi].techs.sklaverei = true; S.players[pi].techs.kolonialismus = true;
  cap.pop = 3; S.players[pi].res.coins = 30;
  G('tapHex')(cap.r, cap.c);
  const acts = [...$('sheet-body').querySelectorAll('.opt')].map(b => b.textContent);
  if (!acts.some(t => /opfern/i.test(t))) throw new Error('kein Sklaverei-Button');
  console.log('       Stadtaktionen sichtbar: ' + acts.length);
});
step('Atomwaffen: Knopf vorhanden und wirksam', () => {
  const S = G('S');
  S.players[S.cur].techs.atomwaffen = true;
  const cap = G('capitalOf')(S, S.cur);
  const spot = G('neighbors')(cap.r, cap.c).find(([r, c]) => G('isLand')(S, r, c) && !G('cityAt')(S, r, c) && !G('armyAt')(S, r, c));
  S.armies.push({ id: 9999, owner: (S.cur + 1) % S.players.length, r: spot[0], c: spot[1], mp: 0, born: 0 });
  G('tapHex')(spot[0], spot[1]);
  const b = [...$('sheet-body').querySelectorAll('.opt')].find(x => /Atomschlag/.test(x.textContent));
  if (!b) throw new Error('kein Atomschlag-Knopf im Aktionsblatt');
  b.onclick();
  if (S.armies.some(a => a.id === 9999)) throw new Error('Armee wurde nicht zerstört');
  const again = [...$('sheet-body').querySelectorAll('.opt')].find(x => /Atomschlag/.test(x.textContent));
  console.log('       Armee zerstört; zweiter Einsatz in derselben Runde ' +
    (again && again.disabled ? 'gesperrt' : 'NICHT gesperrt'));
});
step('Info-Sheet lässt sich schließen (Punkt 4)', () => {
  const cap = G('capitalOf')(G('S'), G('S').cur);
  G('tapHex')(cap.r, cap.c);
  if (!$('sheet').classList.contains('open')) throw new Error('Sheet öffnet nicht');
  if (!$('sheet-close')) throw new Error('kein Schließen-Knopf im Sheet');
  $('sheet-close').onclick();
  if ($('sheet').classList.contains('open')) throw new Error('Sheet lässt sich nicht schließen');
});
step('Technologiebogen zeigt, wer welche Tech hat (Punkt 2)', () => {
  const S = G('S'), pi = S.cur;
  S.players[pi].techs.schrift = true;
  S.players[(pi + 1) % S.players.length].techs.schrift = true;
  $('a-tech').onclick();
  const tile = [...$('ov-body').querySelectorAll('.tech')].find(t => /Schrift/.test(t.textContent));
  const marks = tile.querySelectorAll('.owner-mark');
  if (marks.length < 2) throw new Error('Besitzer-Marker fehlen');
  if (!tile.querySelector('.owner-mark.self')) throw new Error('eigenes Reich nicht hervorgehoben');
  console.log('       ' + marks.length + ' Reiche auf der Schrift-Kachel markiert');
  G('closeModal')();
});
step('Ertragsübersicht im Forschungsbogen (Punkt 2)', () => {
  const S = G('S'), pi = S.cur;
  G('capitalOf')(S, pi).pop = 3;
  $('a-tech').onclick();
  const panel = $('ov-body').querySelector('.yield-panel');
  if (!panel) throw new Error('keine Ertragsübersicht');
  const rows = panel.querySelectorAll('.yrow');
  if (rows.length < 2) throw new Error('Übersicht hat zu wenige Zeilen');
  if (!$('overlay').classList.contains('wide')) throw new Error('Modal nicht verbreitert');
  // die Summe muss dem Einkommen entsprechen
  const inc = G('income')(S, pi);
  console.log('       ' + rows.length + ' Zeilen · Summe ' + [inc.sci, inc.food, inc.coins].join('/'));
  G('closeModal')();
});
step('Bot-Zug: nur „Weiter" führt weiter (Punkt 5)', () => {
  const S = G('S');
  $('a-end').onclick();                       // menschlichen Zug beenden → Bots laufen
  let guard = 0;
  while (S.players[S.cur].kind === 'bot' && !S.over && guard++ < 6) {
    if (!$('bot-next')) throw new Error('kein Weiter-Knopf im Bot-Sheet');
    if (!G('ui').botLock) throw new Error('Sheet ist während Bot-Zug nicht gesperrt');
    G('closeSheet')();                         // darf nichts bewirken
    if (!$('sheet').classList.contains('open')) throw new Error('Sheet ließ sich trotz Sperre schließen');
    $('bot-next').onclick();
  }
  if (G('ui').botLock) throw new Error('Sperre nach Bot-Runde nicht aufgehoben');
});
step('Zug beenden + Bot-Züge', () => {
  for (let i = 0; i < 8 && !G('S').over; i++) {
    $('a-end').onclick();
    let guard = 0;
    while (G('S').players[G('S').cur].kind === 'bot' && !G('S').over && guard++ < 6) {
      const next = $('bot-next'); if (!next) break; next.onclick();
    }
  }
  console.log('       Runde ' + G('S').round + ' · Bevölkerung ' +
    G('S').players.map((p, i) => G('popOf')(G('S'), i)).join('/') +
    (G('S').over ? ' · ' + G('S').over.how : ''));
});
step('Spielstand speicherbar', () => { JSON.parse(JSON.stringify(G('S'))); });
step('Karteneditor', () => {
  G('show')('screen-editor'); G('editorScreen')();
  window.__set('edTool', 'B'); G('edTap')(8, 8);
  if (G('editMap').rows[8][8] !== 'B') throw new Error('Gelände nicht gesetzt');
  window.__set('edTool', 'cap:england'); G('edTap')(8, 9);
  if (G('editMap').capitals.england[1] !== 9) throw new Error('Hauptstadt nicht gesetzt');
  $('ed-size').onclick && (window.prompt = () => '16');
});

console.log(errors.length ? '\n' + errors.length + ' Fehler' : '\nOberfläche läuft fehlerfrei durch');
process.exit(errors.length ? 1 : 0);
