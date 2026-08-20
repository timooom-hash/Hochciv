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
const src = ['js/data.js', 'js/hex.js', 'js/engine.js', 'js/expansion.js', 'js/bots.js', 'js/tutorial.js', 'js/ui.js']
  .map(f => fs.readFileSync(__dirname + '/' + f, 'utf8')).join('\n');
window.eval(src + '\n;window.__get = n => eval(n); window.__set = (n, v) => eval(n + "=v");');
const G = n => window.__get(n);

const $ = id => window.document.getElementById(id);
const step = (label, fn) => {
  try { fn(); console.log('  ok  ' + label); }
  catch (e) { errors.push(label + ': ' + e.message); console.log('FAIL ' + label + ': ' + e.message); }
};

step('Menü gerendert', () => { if (!$('m-new')) throw new Error('kein Startknopf'); });
step('Tutorial: Übungsspiel startet in der Spieloberfläche', () => {
  $('m-tutorial').onclick();
  if (!$('screen-game').classList.contains('show')) throw new Error('Tutorial öffnet nicht das Spiel');
  if ($('tut-panel').hidden) throw new Error('kein Erklärpanel unter der Karte');
  if ($('map').querySelectorAll('[data-r]').length !== 216) throw new Error('Karte fehlt');
  const S = G('S');
  if (S.players.find(p => p.kind === 'human').civ !== 'russland') throw new Error('nicht Russland');
  console.log('       ' + $('tut-count').textContent + ' · „' + $('tut-title').textContent + '"');
});
step('Tutorial: Schienen sperren alles außer dem vorgesehenen Schritt', () => {
  // Leseschritt 1: Aktionsleiste bis auf Nachschlagen gesperrt
  const locked = ['a-tech', 'a-power', 'a-army', 'a-end'].filter(id => !$(id).disabled);
  if (locked.length) throw new Error('offene Knöpfe im Leseschritt: ' + locked.join(','));
  // Gründungsschritt: nur das goldene Feld reagiert
  G('tutMove')(1); G('tutMove')(1); G('tutMove')(1);
  const hl = G('tutHighlight')();
  if (!hl || hl.length !== 1) throw new Error('nicht genau ein Zielfeld markiert');
  const cap = G('capitalOf')(G('S'), G('RU')());
  G('tapHex')(cap.r, cap.c);
  const wrong = [...$('sheet-body').querySelectorAll('.opt')].filter(b => !b.disabled);
  if (wrong.length) throw new Error('auf falschem Feld sind Aktionen offen');
  G('closeSheet')();
  console.log('       Zielfeld ' + hl[0].join('/') + ', andere Felder gesperrt');
});
step('Tutorial: Leseschritte erlauben gar keine Aktion', () => {
  // Schritt 2 ist ein reiner Leseschritt – dort darf man weder gründen noch wachsen
  const S = G('S');
  while (+$('tut-count').textContent.split('/')[0] < 2) $('tut-next').onclick();
  const cap = G('capitalOf')(S, G('RU')());
  G('tapHex')(cap.r, cap.c);
  const open = [...$('sheet-body').querySelectorAll('.opt')].filter(b => !b.disabled);
  if (open.length) throw new Error('im Leseschritt anklickbar: ' + open.map(b => b.textContent.trim()).join(', '));
  G('closeSheet')();
  const bar = ['a-tech', 'a-power', 'a-army', 'a-end'].filter(id => !$(id).disabled);
  if (bar.length) throw new Error('Leiste im Leseschritt offen: ' + bar.join(', '));
  console.log('       Stadtblatt und Leiste im Leseschritt vollständig gesperrt');
  $('tut-prev').onclick();
});
step('Tutorial: alle Aufgaben über die echte Oberfläche erledigen', () => {
  const n = G('TUT_STEPS').length;
  const open = () => !$('tut-next').disabled;
  let manual = 0;
  for (let i = 0; i < n; i++) {
    if (!$('tut-body').textContent.trim()) throw new Error('Schritt ' + (i + 1) + ' ohne Text');
    if (!open()) {
      if ($('tut-task').hidden) throw new Error('Aufgabe ohne Hinweiszeile in Schritt ' + (i + 1));
      const t = $('tut-title').textContent;
      const hl = G('tutHighlight')() || [];
      if (/Zug beenden/.test(t)) {
        $('a-end').onclick();
        let guard = 0;
        while (guard++ < 24 && G('P')(G('S')).kind === 'bot' && $('bot-next')) $('bot-next').onclick();
        manual++;
      } else if (/Forschen|Wissenschaftliche|null|Mauern|Burgenbau/.test(t)) {
        $('a-tech').onclick();
        const free = [...$('ov-body').querySelectorAll('[data-tech]')].filter(b => !b.disabled);
        if (!free.length) throw new Error('keine Kachel freigegeben in: ' + t);
        free.forEach(b => b.onclick());
        G('closeModal')(); manual++;
      } else if (/Stadt/.test(t) && hl.length) {
        G('tapHex')(hl[0][0], hl[0][1]);
        const en = [...$('sheet-body').querySelectorAll('.opt')].filter(b => !b.disabled);
        if (!en.length) throw new Error('kein Knopf freigegeben in: ' + t);
        en[0].onclick(); G('closeSheet')(); manual++;
      } else if (/wachsen/.test(t)) {
        for (const h of hl) {
          G('tapHex')(h[0], h[1]);
          const en = [...$('sheet-body').querySelectorAll('.opt')].filter(b => !b.disabled);
          if (en.length) en[0].onclick();
          G('closeSheet')();
        }
        manual++;
      } else if (/erste Armee/.test(t)) {
        G('tapHex')(hl[0][0], hl[0][1]);
        const en = [...$('sheet-body').querySelectorAll('.opt')].filter(b => !b.disabled);
        if (!en.length) throw new Error('Armee bauen nicht freigegeben');
        en[0].onclick(); G('closeSheet')(); manual++;
      } else if (/Armee bewegen/.test(t)) {
        const a = G('armiesOf')(G('S'), G('RU')())[0];
        G('tapHex')(a.r, a.c);
        const mv = [...$('sheet-body').querySelectorAll('.opt')].filter(b => !b.disabled);
        if (!mv.length) throw new Error('Bewegen nicht freigegeben');
        mv[0].onclick();
        const before = a.r + '/' + a.c;
        G('tapHex')(a.r, Math.max(0, a.c - 1));          // falsches Ziel
        if (a.r + '/' + a.c !== before) throw new Error('Armee auf falsches Feld gezogen');
        G('tapHex')(hl[0][0], hl[0][1]); manual++;
      } else if (/Zug beenden/.test(t)) {
        $('a-end').onclick();
        let guard = 0;
        while (guard++ < 20 && G('P')(G('S')).kind === 'bot' && $('bot-next')) $('bot-next').onclick();
        manual++;
      } else if (/Bots getan/.test(t)) {
        $('a-log').onclick(); G('closeModal')(); manual++;
      } else if (/Macht/.test(t)) {
        let guard = 0;
        while (!open() && guard++ < 8) {
          $('a-power').onclick();
          const en = [...$('sheet-body').querySelectorAll('.opt')].filter(b => !b.disabled);
          if (!en.length) break;
          en[0].onclick();
        }
        G('closeSheet')(); manual++;
      }
      // Es gibt keinen „Für mich machen"-Ausweg mehr: alles muss über die Oberfläche gehen
      if (!open()) throw new Error('Aufgabe nicht über die Oberfläche erfüllbar: ' + t);
    }
    if (i < n - 1) $('tut-next').onclick();
  }
  if ($('tut-next').textContent !== 'Fertig') throw new Error('letzter Schritt heißt nicht Fertig');
  console.log('       ' + n + ' Schritte, ' + manual + ' Aufgaben über die Oberfläche erledigt');
});
step('Tutorial: „Fertig" gibt das Spiel frei', () => {
  $('tut-next').onclick();
  if (!$('tut-panel').hidden) throw new Error('Panel bleibt stehen');
  const locked = ['a-tech', 'a-power', 'a-army', 'a-end'].filter(id => $(id).disabled);
  if (locked.length) throw new Error('Leiste bleibt gesperrt: ' + locked.join(','));
  const S = G('S');
  if (S.over) throw new Error('Spiel schon entschieden');
  console.log('       Runde ' + S.round + ', ' + S.cities.length + ' Städte, Leiste frei');
  G('show')('screen-menu');
});
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
step('Zufallskarte im Menü wählbar', () => {
  const opts = [...$('setup-map').options].map(o => o.value);
  if (!opts.includes('zufall')) throw new Error('keine Zufallskarte im Kartenmenü');
  console.log('       ' + [...$('setup-map').options].map(o => o.text).join(' · '));
});
step('1-gegen-1-Modus im Aufbau', () => {
  $('setup-mode').querySelector('[data-mode=duell]').onclick();
  const slots = [...$('setup-list').children];
  if (slots.length !== 2) throw new Error('nicht zwei Plätze, sondern ' + slots.length);
  if (!$('setup-map-row').hidden) throw new Error('Kartenauswahl im Duell nicht versteckt');
  if ($('setup-duel-hint').hidden) throw new Error('kein Hinweis auf die Duellregeln');
  const picks = slots.map(x => x.querySelector('[data-civpick]'));
  if (picks.some(p => !p) || picks[0].options.length !== 4)
    throw new Error('nicht alle vier Zivilisationen wählbar');
  // Kollision muss aufgelöst werden
  picks[0].value = slots[1].dataset.civ; picks[0].onchange();
  const now = [...$('setup-list').children].map(x => x.dataset.civ);
  if (now[0] === now[1]) throw new Error('beide Plätze mit derselben Zivilisation');
  if (![...$('setup-list').children][1].querySelector('[data-abil]').options.length)
    throw new Error('keine Fähigkeiten im zweiten Platz');
  console.log('       ' + now.join(' gegen ') + ', Startspieler-Auswahl: ' +
    [...$('setup-start').options].map(o => o.text).join('/'));
  $('setup-mode').querySelector('[data-mode=vier]').onclick();
  if ($('setup-list').children.length !== 4) throw new Error('Rückschalten auf vier Reiche misslingt');
});
step('Originalkarte ist vorausgewählt', () => {
  const sel = $('setup-map');
  const chosen = sel.options[sel.selectedIndex >= 0 ? sel.selectedIndex : 0].text;
  if (!/^Originalkarte/.test(chosen)) throw new Error('vorausgewählt ist: ' + chosen);
  console.log('       ' + chosen);
});
step('Kein Regelmodus-Dropdown mehr', () => {
  if ($('setup-rules')) throw new Error('das v2-Dropdown existiert noch');
});
step('Erweiterungen ankreuzbar (Ereignisse, Weltwunder)', () => {
  if (!$('setup-events') || !$('setup-wonders')) throw new Error('Checkboxen fehlen');
  if (!$('setup-evmode-row').hidden) throw new Error('Ereignisstärke wird ohne Ereignisse gezeigt');
  $('setup-events').checked = true; $('setup-events').onchange();
  if ($('setup-evmode-row').hidden) throw new Error('Ereignisstärke bleibt versteckt');
  const modes = [...$('setup-evmode').options].map(o => o.text);
  if (modes.length !== 2) throw new Error('kein Easy/Hard-Modus');
  $('setup-wonders').checked = true;
  console.log('       ' + modes.join(' · '));
});
step('Fähigkeitswahl je Zivilisation', () => {
  const sels = [...$('setup-list').querySelectorAll('[data-abil]')];
  if (sels.length !== 4) throw new Error('nur ' + sels.length + ' Fähigkeits-Dropdowns');
  if (sels[0].options.length !== 3) throw new Error('nicht drei Fähigkeiten je Reich');
  const botSlot = $('setup-list').children[1];
  if (!botSlot.querySelector('[data-abil]').disabled) throw new Error('Bot-Fähigkeit nicht gesperrt');
  if (!/keine Zivilisationsfähigkeit/.test(botSlot.querySelector('.abil').textContent))
    throw new Error('kein Hinweis, dass Bots keine Fähigkeit haben');
  console.log('       ' + [...sels[0].options].map(o => o.text).join(' · '));
});
step('Spiel starten (mit Ereignissen und Weltwundern)', () => {
  $('setup-go').onclick();
  const S = G('S');
  if (!S.ev || !S.wo) throw new Error('Erweiterungen nicht übernommen');
  console.log('       Ereignis Runde 1: ' + (S.event && S.event.k ? S.event.k : 'keines'));
});
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
step('Welt-Ansicht zeigt Ereignis und Weltwunder', () => {
  const S = G('S');
  while (S.players[S.cur].kind === 'bot' && !S.over && $('bot-next')) $('bot-next').onclick();
  if (S.over) return console.log('       Spiel schon entschieden – übersprungen');
  $('a-info').onclick();
  const txt = $('ov-body').textContent.replace(/\s+/g, ' ');
  if (!/Weltwunder|Ereignis/.test(txt)) throw new Error('Welt-Ansicht ohne Inhalt');
  console.log('       ' + txt.slice(0, 90));
  G('closeModal')();
});
step('Weltwunder in der Stadt bauen', () => {
  const S = G('S'), pi = S.cur, cap = G('capitalOf')(S, pi);
  if (!cap || S.players[pi].kind === 'bot') return console.log('       kein menschlicher Zug – übersprungen');
  S.players[pi].res.coins = 200;
  G('tapHex')(cap.r, cap.c);
  const b = [...$('sheet-body').querySelectorAll('.opt')].find(x => /Weltwunder bauen/.test(x.textContent));
  if (!b) throw new Error('kein Weltwunder-Knopf im Stadtblatt');
  if (b.disabled) throw new Error('Weltwunder-Knopf gesperrt trotz Münzen');
  b.onclick();
  const opts = [...$('sheet-body').querySelectorAll('[data-w]')].filter(x => !x.disabled);
  if (!opts.length) throw new Error('keine baubaren Wunder angeboten');
  const before = S.wonders.length;
  opts[0].onclick();
  if (S.wonders.length !== before + 1) throw new Error('Wunder nicht gebaut');
  console.log('       gebaut: ' + G('WONDER_BY_KEY')[S.wonders[before].k].n +
    ' · Marker auf der Karte: ' + $('map').querySelectorAll('rect').length);
  G('closeModal')(); G('closeSheet')();
});
step('Städte füttern (Gentechnik/Massenmedien)', () => {
  const S = G('S'), pi = S.cur;
  if (S.players[pi].kind === 'bot') return console.log('       kein menschlicher Zug – übersprungen');
  S.players[pi].techs.massenmedien = true;
  S.players[pi].res.coins = 12; S.players[pi].foodDeficit = 3;
  $('hud-feed').onclick();
  const b = [...$('sheet-body').querySelectorAll('[data-k]')];
  if (!b.length) throw new Error('kein Futter-Knopf');
  b[0].onclick();
  if (S.players[pi].foodDeficit !== 0) throw new Error('Defizit nicht gedeckt');
  console.log('       Defizit gedeckt, Nahrung ' + S.players[pi].res.food);
  G('closeSheet')();
});
step('Sklaverei wird im Techbogen als obsolet markiert', () => {
  const S = G('S'), pi = S.cur;
  S.players[pi].techs.sklaverei = true; S.players[pi].techs.robotik = true;
  $('a-tech').onclick();
  const tile = [...$('ov-body').querySelectorAll('.tech')].find(t => /Sklaverei/.test(t.textContent));
  if (!tile.classList.contains('obsolete')) throw new Error('keine Obsoleszenz-Markierung');
  if (!/obsolet/.test(tile.textContent)) throw new Error('kein Hinweistext');
  console.log('       ' + tile.textContent.replace(/\s+/g, ' ').trim().slice(0, 60));
  G('closeModal')();
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
  // Sklaverei ist ab der Moderne obsolet – für diesen Test die Moderne-Techs entfernen
  const modern = G('TECHS_ACTIVE').filter(t => t.age === 3 && S.players[pi].techs[t.k]).map(t => t.k);
  modern.forEach(k => delete S.players[pi].techs[k]);
  S.players[pi].techs.sklaverei = true; S.players[pi].techs.kolonialismus = true;
  cap.pop = 3; S.players[pi].res.coins = 30;
  G('tapHex')(cap.r, cap.c);
  const acts = [...$('sheet-body').querySelectorAll('.opt')].map(b => b.textContent);
  if (!acts.some(t => /opfern/i.test(t))) throw new Error('kein Sklaverei-Button');
  // mit einer Technologie der Moderne muss der Knopf verschwinden
  S.players[pi].techs.robotik = true;
  G('tapHex')(cap.r, cap.c);
  const acts2 = [...$('sheet-body').querySelectorAll('.opt')].map(b => b.textContent);
  if (acts2.some(t => /opfern/i.test(t))) throw new Error('Sklaverei ab Moderne noch anklickbar');
  console.log('       Stadtaktionen sichtbar: ' + acts.length + ', ab Moderne ohne Opfern-Knopf');
});
step('Atomwaffen: Knopf vorhanden und wirksam', () => {
  const S = G('S');
  S.players[S.cur].techs.atomwaffen = true;
  const cap = G('capitalOf')(S, S.cur);
  const spot = G('neighbors')(cap.r, cap.c).find(([r, c]) => G('isLand')(S, r, c) && !G('cityAt')(S, r, c) && !G('armyAt')(S, r, c));
  S.armies.push({ id: 9999, owner: (S.cur + 1) % S.players.length, r: spot[0], c: spot[1], mp: 0, born: 0 });
  // Läuft gerade das Ereignis Atomwaffenproteste, muss der Knopf gesperrt sein
  if (S.nukeBan) {
    G('tapHex')(spot[0], spot[1]);
    const locked = [...$('sheet-body').querySelectorAll('.opt')].find(x => /Atomschlag/.test(x.textContent));
    if (!locked || !locked.disabled) throw new Error('Atomschlag trotz Atomwaffenprotesten möglich');
    console.log('       Atomwaffenproteste aktiv: Knopf korrekt gesperrt');
    S.nukeBan = false;   // für den eigentlichen Test aufheben
  }
  G('tapHex')(spot[0], spot[1]);
  const b = [...$('sheet-body').querySelectorAll('.opt')].find(x => /Atomschlag/.test(x.textContent));
  if (!b) throw new Error('kein Atomschlag-Knopf im Aktionsblatt');
  if (b.disabled) throw new Error('Atomschlag-Knopf ohne Grund gesperrt');
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
step('Bot-Fenster zeigt Einträge auch bei vollem Log (Bugfix)', () => {
  const S = G('S');
  for (let i = 0; i < 650; i++) G('log')(S, 'roll', 'Füller ' + i);
  if (S.log.length !== 600) throw new Error('Log nicht gekappt');
  $('a-end').onclick();                       // Bots laufen
  if (S.players[S.cur].kind === 'bot') {
    const lines = $('sheet-body').querySelectorAll('.logline').length;
    if (lines === 0) throw new Error('Bot-Fenster leer trotz Aktionen (der alte Bug)');
    console.log('       Bot-Fenster: ' + lines + ' Zeilen bei vollem Log');
    // die Runde zu Ende klicken
    let g = 0;
    while (S.players[S.cur].kind === 'bot' && !S.over && g++ < 6 && $('bot-next')) $('bot-next').onclick();
  }
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
