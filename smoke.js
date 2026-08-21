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
window.eval(src + '\n;window.__get = n => eval(n); window.__set = (n, v) => eval(n + "=v");'
  + '\n;window.__runAuto = i => { TUT_STEPS[i].auto(); redraw(); };');
const G = n => window.__get(n);
const SET = (n, v) => window.__set(n, v);
// Das Auto-Weiterschalten im Tutorial läuft in der App über setTimeout. Im Test
// wird die Verzögerung auf 0 gesetzt, damit es synchron und damit prüfbar abläuft.
SET('TUT_AUTO_MS', 0);

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
step('Tutorial: in jedem Schritt ist nur das Vorgesehene anklickbar', () => {
  // Systematische Prüfung: Leiste, Stadtblatt (eigene, fremde, leere Felder), Armee- und
  // Machtblatt, Technologiebogen – in allen Schritten.
  G('tutorialStart')();                     // sauber bei Schritt 1 beginnen
  const n = G('TUT_STEPS').length, problems = [];
  const labelsOk = (al, txt) => (al.labels || []).some(rx => new RegExp(rx.source || rx).test(txt));
  for (let i = 0; i < n; i++) {
    const t = $('tut-title').textContent, al = G('tutAllow')();
    const barOn = ['a-tech', 'a-power', 'a-army', 'a-info', 'a-log', 'a-end'].filter(id => !$(id).disabled);
    const extra = barOn.filter(id => !al.bar.includes(id));
    if (extra.length) problems.push((i + 1) + ' „' + t + '": Leiste offen: ' + extra);
    const S = G('S'), ru = G('RU')();
    const spots = S.cities.map(c => [c.r, c.c])
      .concat(G('within')(G('tutCap')().r, G('tutCap')().c, 2)
        .filter(([r, c]) => G('isLand')(S, r, c) && !G('cityAt')(S, r, c)).slice(0, 3));
    for (const [r, c] of spots) {
      G('tapHex')(r, c);
      const on = [...$('sheet-body').querySelectorAll('.opt')].filter(b => !b.disabled)
        .map(b => b.textContent.trim().split('\n')[0]);
      const bad = on.filter(x => !labelsOk(al, x));
      if (bad.length) problems.push((i + 1) + ' „' + t + '": Blatt offen auf ' + r + '/' + c + ': ' + bad);
      G('closeSheet')();
    }
    for (const id of ['a-army', 'a-power']) {
      if ($(id).disabled) continue;
      $(id).onclick();
      const on = [...$('sheet-body').querySelectorAll('.opt')].filter(b => !b.disabled)
        .map(b => b.textContent.trim().split('\n')[0]);
      const bad = on.filter(x => !labelsOk(al, x));
      if (bad.length) problems.push((i + 1) + ' „' + t + '": ' + id + ' offen: ' + bad);
      G('closeSheet')();
    }
    if (!$('a-tech').disabled) {
      $('a-tech').onclick();
      const on = [...$('ov-body').querySelectorAll('[data-tech]')].filter(b => !b.disabled).map(b => b.dataset.tech);
      const bad = on.filter(k => !(al.techs || []).includes(k));
      if (bad.length) problems.push((i + 1) + ' „' + t + '": Techs offen: ' + bad);
      G('closeModal')();
    }
    // Aufgabe per Skript erledigen (nur hier im Test), Index aus dem Panel lesen
    // Gegenprobe: bei offener Aufgabe muss auch wirklich etwas bedienbar sein
    if ($('tut-next').disabled) {
      const anyBar = ['a-tech', 'a-power', 'a-army', 'a-end', 'a-log', 'a-info']
        .some(id => !$(id).disabled);
      let anySheet = false;
      for (const [r, c] of spots.concat(G('tutHighlight')() || [])) {
        G('tapHex')(r, c);
        if ([...$('sheet-body').querySelectorAll('.opt')].some(b => !b.disabled)) anySheet = true;
        G('closeSheet')();
      }
      if (!anyBar && !anySheet) problems.push((i + 1) + ' „' + t + '": nichts bedienbar – Sackgasse');
      G('__runAuto')(+$('tut-count').textContent.split('/')[0] - 1);
    }
    // __runAuto ruft redraw() – erledigte Aufgaben schalten dadurch von selbst weiter.
    // Deshalb nur klicken, wenn der Schritt noch steht.
    if (i < n - 1 && +$('tut-count').textContent.split('/')[0] - 1 === i) $('tut-next').onclick();
  }
  if (problems.length) throw new Error(problems.slice(0, 3).join(' | '));
  console.log('       ' + n + ' Schritte geprüft, keine Lücke in den Schienen');
});
step('Tutorial: alle Aufgaben über die echte Oberfläche erledigen', () => {
  G('tutorialStart')();                     // frisches Übungsspiel, wieder bei Schritt 1
  const n = G('TUT_STEPS').length;
  const open = () => !$('tut-next').disabled;
  const idx = () => +$('tut-count').textContent.split('/')[0] - 1;
  let manual = 0, auto = 0, guard = 0;
  while (guard++ < n * 3) {
    const i = idx();
    if (!$('tut-body').textContent.trim()) throw new Error('Schritt ' + (i + 1) + ' ohne Text');
    if (!open()) {
      if ($('tut-task').hidden) throw new Error('Aufgabe ohne Hinweiszeile in Schritt ' + (i + 1));
      const t = $('tut-title').textContent;
      const hl = G('tutHighlight')() || [];
      if (/Zug beenden/.test(t)) {
        $('a-end').onclick();
        let g2 = 0;
        while (g2++ < 24 && G('P')(G('S')).kind === 'bot' && $('bot-next')) $('bot-next').onclick();
        manual++;
      } else if (/Forschen|Wissenschaftliche|null|Mauern|Burgenbau|Technologien/.test(t)) {
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
      } else if (/Bots getan/.test(t)) {
        $('a-log').onclick(); G('closeModal')(); manual++;
      } else if (/Macht/.test(t)) {
        let g2 = 0;
        while (!open() && idx() === i && g2++ < 8) {
          $('a-power').onclick();
          const en = [...$('sheet-body').querySelectorAll('.opt')].filter(b => !b.disabled);
          if (!en.length) break;
          en[0].onclick();
        }
        G('closeSheet')(); manual++;
      }
      // Erledigte Aufgaben schalten von selbst weiter (TUT_AUTO_MS = 0 im Test).
      // Bleibt der Schritt stehen, muss wenigstens „Weiter" freigegeben sein.
      if (idx() > i) { auto++; continue; }
      // Es gibt keinen „Für mich machen"-Ausweg: alles muss über die Oberfläche gehen
      if (!open()) throw new Error('Aufgabe nicht über die Oberfläche erfüllbar: ' + t);
      throw new Error('Aufgabe erledigt, aber nicht automatisch weitergeschaltet: ' + t);
    }
    if (i >= n - 1) break;
    $('tut-next').onclick();
    if (idx() === i) throw new Error('„Weiter" bewegt sich nicht in Schritt ' + (i + 1));
  }
  if (idx() !== n - 1) throw new Error('Durchlauf endet bei Schritt ' + (idx() + 1) + ' statt ' + n);
  if ($('tut-next').textContent !== 'Fertig') throw new Error('letzter Schritt heißt nicht Fertig');
  const tasks = G('TUT_STEPS').filter(st => st.goal).length;
  if (auto !== manual) throw new Error(auto + ' von ' + manual + ' Aufgaben schalten automatisch weiter');
  if (manual !== tasks) throw new Error(manual + ' Aufgaben erledigt, ' + tasks + ' erwartet');
  console.log('       ' + n + ' Schritte, ' + manual + ' Aufgaben über die Oberfläche erledigt, '
    + auto + '× automatisch weitergeschaltet');
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
step('Nahrungsfenster: Bevölkerungskosten aus Münzen bestreiten', () => {
  const S = G('S'), pi = S.cur, p = S.players[pi];
  if (p.kind === 'bot') return console.log('       kein menschlicher Zug – übersprungen');
  p.techs.massenmedien = true;
  // Lage von Hand stellen: Saldo −3, Bevölkerung isst 5
  p.res.coins = 12; p.res.food = 0; p.foodDeficit = 3; p.foodRaw = -3;
  p.popFood = 5; p.popCovered = 0; p.popCoveredBy = { sci: 0, coins: 0 }; p.popDefPart = 0;
  $('hud-feed').onclick();
  const txt = $('sheet-body').textContent;
  if (!/Das Land produziert/.test(txt)) throw new Error('keine Produktionszeile');
  if (!/Die Bevölkerung isst/.test(txt)) throw new Error('keine Kostenzeile');
  const b = [...$('sheet-body').querySelectorAll('[data-k]')];
  if (!b.length) throw new Error('kein Deckungsknopf');
  // größten Knopf wählen: deckt alles, was die Bevölkerung isst
  b.sort((x, y) => +y.dataset.n - +x.dataset.n)[0].onclick();
  if (p.popCovered !== 5) throw new Error('nicht voll gedeckt: ' + p.popCovered);
  if (p.foodDeficit !== 0) throw new Error('Defizit nicht gedeckt');
  if (p.res.food !== 2) throw new Error('falsche Nahrung: ' + p.res.food + ' statt 2');
  if (p.res.coins !== 7) throw new Error('falscher Münzabzug: ' + p.res.coins);
  // Zurücknehmen muss angeboten werden und wirken
  const zurueck = $('sheet-body').querySelector('[data-back]');
  if (!zurueck) throw new Error('kein Rücknahmeknopf');
  zurueck.onclick();
  if (p.popCovered !== 0 || p.res.coins !== 12)
    throw new Error('Rücknahme unvollständig: ' + p.popCovered + '/' + p.res.coins);
  console.log('       Land 2, isst 5 → voll gedeckt: 2 Nahrung, 7 Münzen; Rücknahme klappt');
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

/* ================================================ Die sieben Designänderungen
   Frisches Spiel: die Läufe davor enden im Siegbildschirm oder bei einem Bot. */
const frischesSpiel = () => {
  $('m-new').onclick();
  [1, 2, 3].forEach(i => $('setup-list').children[i].querySelector('[data-kind="bot"]').onclick());
  $('setup-go').onclick();
  const S = G('S');
  if (S.over) throw new Error('frisches Spiel ist schon entschieden');
  if (G('P')(S).kind === 'bot') throw new Error('frisches Spiel beginnt mit einem Bot');
};
step('Karte: kein Zoomen und Schieben mehr, Treffer direkt auf dem Feld', () => {
  frischesSpiel();
  if (G('typeof view') !== 'undefined') throw new Error('Ansichts-Zustand noch vorhanden');
  if (G('typeof attachGestures') !== 'undefined') throw new Error('Gestenerkennung noch vorhanden');
  const svg = $('map');
  if (!svg.getAttribute('viewBox')) throw new Error('keine viewBox – Karte wird nicht eingepasst');
  const world = svg.querySelector('#world');
  if (world && world.getAttribute('transform')) throw new Error('Weltgruppe ist verschoben/skaliert');
  // Klick auf ein Sechseck wählt genau dieses Feld – ohne Koordinatenrechnung
  const S = G('S'); const cap = G('capitalOf')(S, S.cur);
  if (!cap) throw new Error('keine Hauptstadt');
  const poly = svg.querySelector(`[data-r="${cap.r}"][data-c="${cap.c}"]`);
  if (!poly) throw new Error('Feld nicht im SVG');
  poly.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  const sel = G('ui').sel;
  if (!sel || sel[0] !== cap.r || sel[1] !== cap.c) throw new Error('Klick wählt das falsche Feld');
  G('closeSheet')();
  console.log('       viewBox gesetzt, Klick trifft ' + sel.join('/'));
});
step('Aktionsleiste bleibt bedienbar, solange ein Blatt offen ist (Punkt 3)', () => {
  frischesSpiel();
  const S = G('S');
  const cap = G('capitalOf')(S, S.cur);
  G('tapHex')(cap.r, cap.c);
  if (!$('sheet').classList.contains('open')) throw new Error('Blatt öffnet nicht');
  if (window.document.body.classList.contains('blocked'))
    throw new Error('Blatt sperrt die Aktionsleiste weiterhin');
  const aus = ['a-tech', 'a-power', 'a-army', 'a-info', 'a-log', 'a-end'].filter(id => $(id).disabled);
  if (aus.length) throw new Error('Menüpunkte gesperrt: ' + aus.join(', '));
  G('closeSheet')();
  // Das Bot-Fenster sperrt weiterhin – dort führt nur „Weiter" weiter
  G('ui').botLock = true; G('lockBar')();
  if (!window.document.body.classList.contains('blocked'))
    throw new Error('Bot-Fenster sperrt die Leiste nicht mehr');
  G('ui').botLock = false; G('lockBar')();
  console.log('       Blatt offen, alle sechs Menüpunkte frei');
});
step('Kopfzeile: Weltbevölkerungsanteil in Prozent (Punkt 4)', () => {
  frischesSpiel();
  const S = G('S'), pi = S.cur;
  G('redraw')();
  const txt = $('hud-round').textContent;
  const mine = G('popOf')(S, pi), all = G('worldPop')(S);
  const want = Math.round((mine / all) * 100);
  if (!txt.includes(`${mine}/${all} (${want} %)`))
    throw new Error('erwartet „' + mine + '/' + all + ' (' + want + ' %)", steht: ' + txt);
  console.log('       ' + txt);
});
step('Ressourcenleiste: vier getrennte Werte mit Beschriftung (Punkt 2)', () => {
  const res = $('screen-game').querySelectorAll('.hud-res .res');
  if (res.length !== 4) throw new Error(res.length + ' statt 4 Ressourcenfelder');
  const labels = [...res].map(r => r.querySelector('u') && r.querySelector('u').textContent);
  if (labels.some(l => !l)) throw new Error('Beschriftung fehlt: ' + labels.join('|'));
  const werte = [...res].map(r => r.querySelector('b') && r.querySelector('b').id);
  const want = ['hud-sci', 'hud-food', 'hud-coins', 'hud-power'];
  if (JSON.stringify(werte) !== JSON.stringify(want))
    throw new Error('falsche Reihenfolge: ' + werte.join(','));
  console.log('       ' + labels.join(' · '));
});
step('Feldblatt: Feldertrag klein, Siedelertrag nur wo siedelbar (Punkt 7)', () => {
  frischesSpiel();
  const S = G('S'), pi = S.cur, cap = G('capitalOf')(S, pi);
  // Nahrung großzügig setzen: sonst hängt der Test davon ab, wie viel das ausgewürfelte
  // Startreich in Runde 1 gerade übrig hat – das schlug in 4 von 8 Läufen fehl.
  G('P')(S).res.food = 40;
  const gut = G('within')(cap.r, cap.c, 7).find(([r, c]) => !G('canFound')(S, pi, r, c));
  if (!gut) throw new Error('kein gründbares Feld trotz 40 Nahrung');
  G('tapHex')(gut[0], gut[1]);
  const txt = $('sheet-body').textContent;
  // Feldertrag steht klein in der Unterzeile, nicht mehr im Kästchen
  const sub = $('sheet-body').querySelector('p.sub');
  if (!sub || !/Feld \d+\/\d+ · Ertrag /.test(sub.textContent))
    throw new Error('Feldertrag steht nicht klein in der Unterzeile: ' + (sub && sub.textContent));
  if (/FELDERTRAG/i.test(txt.replace(/Feld \d+\/\d+ · Ertrag/, '')))
    throw new Error('Feldertrag steht immer noch als eigenes Kästchen da');
  const facts = $('sheet-body').querySelectorAll('.tile-facts .fact');
  if (facts.length !== 1) throw new Error(facts.length + ' statt 1 Kästchen');
  if (facts[0].querySelector('.fact-n')) throw new Error('Untertext ist noch da');
  const g = G('settleGain')(S, pi, gut[0], gut[1]);
  const soll = (g.sci > 0 ? '+' : '') + g.sci + '🔬';
  if (!facts[0].textContent.includes(soll))
    throw new Error('Siedelertrag stimmt nicht: erwartet ' + soll);
  // Wo nicht gesiedelt werden kann, fehlt das Kästchen ganz
  const meer = G('within')(cap.r, cap.c, 6).find(([r, c]) => G('terrainAt')(S, r, c) === 'M');
  if (!meer) throw new Error('kein Meerfeld in der Nähe');
  G('tapHex')(meer[0], meer[1]);
  if ($('sheet-body').querySelectorAll('.tile-facts').length)
    throw new Error('Meerfeld zeigt trotzdem einen Siedelertrag');
  if (!/· Ertrag /.test($('sheet-body').querySelector('p.sub').textContent))
    throw new Error('Meerfeld zeigt keinen Feldertrag');
  // Auch das eigene Stadtfeld nicht (zu nah an sich selbst)
  G('tapHex')(cap.r, cap.c);
  if ($('sheet-body').querySelectorAll('.tile-facts').length)
    throw new Error('Stadtfeld zeigt einen Siedelertrag');
  G('closeSheet')();
  console.log('       Feld ' + gut.join('/') + ': Siedelertrag ' + soll + ', Meer und Stadt ohne');
});
step('Bürgerkrieg: Armee-Knopf ist mit Nahrung + Münzen bedienbar (gemeldeter Fehler)', () => {
  frischesSpiel();
  const S = G('S'), pi = S.cur, p = G('P')(S), cap = G('capitalOf')(S, pi);
  // Ereignis direkt setzen (setEvent ist ein reiner Testhelfer aus test.js)
  S.ev = S.ev || { mode: 'hard' };
  S.event = { round: S.round, k: 'buergerkrieg', row: 0, col: 0 };
  if (!G('payOpts')(S, pi).foodOk) throw new Error('Bürgerkrieg ist nicht aktiv');
  const cost = G('armyCost')(S, pi);
  // Genau die gemeldete Lage: Münzen allein reichen nicht, zusammen mit Nahrung schon
  const c = Math.floor(cost / 2);
  p.res = { sci: 0, food: cost - c, coins: c };
  if (G('available')(S, pi, 'coins') >= cost)
    throw new Error('Testaufbau untauglich – die Münzen allein reichen schon');
  G('tapHex')(cap.r, cap.c);
  const knopf = [...$('sheet-body').querySelectorAll('.opt')]
    .find(b => /Armee bauen/.test(b.textContent));
  if (!knopf) throw new Error('kein Armee-Knopf im Stadtblatt');
  if (knopf.disabled)
    throw new Error('Armee-Knopf gesperrt, obwohl Nahrung + Münzen reichen');
  knopf.onclick();
  if (!G('armiesOf')(S, pi).length) throw new Error('Armee wurde nicht gebaut');
  // Macht-Blatt muss dieselbe Rechnung machen
  p.res = { sci: 0, food: G('powerPrice')(S, pi) - 1, coins: 1 };
  G('powerSheet')();
  const mk = [...$('sheet-body').querySelectorAll('[data-n]')];
  if (!mk.length) throw new Error('Macht-Blatt bietet nichts an, obwohl Nahrung mitzählt');
  G('closeSheet')();
  console.log('       ' + c + ' Münzen + ' + (cost - c) + ' Nahrung bei Kosten ' + cost + ': Knopf frei');
});
step('Nahrungsfenster geht zu Zugbeginn von selbst auf', () => {
  frischesSpiel();
  const S = G('S'), pi = S.cur, p = G('P')(S);
  p.techs.gentechnik = true;
  G('closeSheet')();
  if ($('sheet').classList.contains('open')) throw new Error('Blatt war schon offen');
  G('humanTurnStart')();
  if (!$('sheet').classList.contains('open'))
    throw new Error('Nahrungsfenster geht zu Zugbeginn nicht auf');
  if (!/Nahrung diese Runde/.test($('sheet-body').textContent))
    throw new Error('es ist ein anderes Blatt: ' + $('sheet-body').textContent.slice(0, 40));
  // Ohne die Techs bleibt es zu
  delete p.techs.gentechnik; delete p.techs.massenmedien;
  G('closeSheet')();
  G('humanTurnStart')();
  if ($('sheet').classList.contains('open'))
    throw new Error('ohne Gentechnik/Massenmedien geht trotzdem ein Blatt auf');
  console.log('       mit Tech: geht auf · ohne Tech: bleibt zu');
});
step('Nahrungsfenster deckt nur die echten Kosten, kein Umtausch', () => {
  frischesSpiel();
  const S = G('S'), pi = S.cur, p = G('P')(S);
  p.techs.gentechnik = true;
  // Saldo +4, Bevölkerung isst 2: es gibt kein Defizit, aber etwas zu verschieben
  p.res = { sci: 50, food: 4, coins: 0 };
  p.foodRaw = 4; p.foodDeficit = 0;
  p.popFood = 2; p.popCovered = 0; p.popCoveredBy = { sci: 0, coins: 0 }; p.popDefPart = 0;
  G('foodSheet')();
  const n = [...$('sheet-body').querySelectorAll('[data-k]')].map(b => +b.dataset.n);
  if (!n.length) throw new Error('nichts angeboten, obwohl Kosten offen sind');
  if (Math.max(...n) > 2)
    throw new Error('mehr angeboten als die Bevölkerung isst: ' + n.join(','));
  [...$('sheet-body').querySelectorAll('[data-k]')]
    .sort((x, y) => +y.dataset.n - +x.dataset.n)[0].onclick();
  if (p.res.food !== 6) throw new Error('Nahrung falsch: ' + p.res.food + ' statt 6');
  if (p.res.sci !== 48) throw new Error('Wissenschaft falsch: ' + p.res.sci);
  // Jetzt ist alles gedeckt – kein weiterer Umtausch möglich
  if ($('sheet-body').querySelectorAll('[data-k]').length)
    throw new Error('bietet weiteren Umtausch an, obwohl die Kosten gedeckt sind');
  if (G('coverPop')(S, pi, 'sci', 10) === null)
    throw new Error('coverPop lässt über die Kosten hinaus decken');
  if (p.res.food !== 6) throw new Error('doch mehr Nahrung entstanden');
  G('closeSheet')();
  console.log('       50 Wissenschaft, Kosten 2 → genau 2 einsetzbar, Nahrung 4→6');
});
step('Hauptmenü ohne Fußzeile (Punkt 3 der Nachbesserung)', () => {
  if ($('screen-menu').querySelector('.foot')) throw new Error('Fußzeile steht noch da');
  if (/Home-Bildschirm/.test($('screen-menu').textContent))
    throw new Error('Hinweis auf den Home-Bildschirm steht noch da');
});
step('Technologiebogen unterscheidet bezahlbar von zu teuer (Punkt 4)', () => {
  frischesSpiel();
  const S = G('S'), pi = S.cur, p = G('P')(S);
  // Ausgangslage selbst herstellen statt auf die ausgewürfelte Verfügbarkeit zu hoffen:
  // zwei Technologien mit unterschiedlichen Kosten freischalten und die Wissenschaft
  // exakt auf die billigere setzen. Münzen auf 0, sonst zählen sie 2:1 mit.
  const alle = Object.values(G('TECH_BY_KEY'))
    .filter(t => !p.techs[t.k])
    .sort((a, b) => G('techCost')(S, pi, a) - G('techCost')(S, pi, b));
  const billig = alle[0], teuer = alle[alle.length - 1];
  if (G('techCost')(S, pi, billig) >= G('techCost')(S, pi, teuer))
    throw new Error('keine zwei Technologien mit unterschiedlichen Kosten');
  p.avail[billig.k] = true; p.avail[teuer.k] = true;
  p.res.sci = G('techCost')(S, pi, billig);
  p.res.coins = 0; p.res.food = 0;
  G('techModal')();
  const afford = $('ov-body').querySelectorAll('.tech.avail.afford');
  const costly = $('ov-body').querySelectorAll('.tech.avail.costly');
  if (!afford.length) throw new Error('keine bezahlbare Kachel markiert');
  if (!costly.length) throw new Error('keine zu teure Kachel markiert');
  // Die Einteilung muss der Rechnung folgen, nicht dem Zufall
  const falsch = [...afford].filter(b => b.disabled).length
    + [...costly].filter(b => !b.disabled).length;
  if (falsch) throw new Error(falsch + ' Kacheln sind falsch einsortiert');
  // Keine Kachel ist beides, und nicht verfügbare bleiben außen vor
  if ($('ov-body').querySelectorAll('.tech.afford.costly').length) throw new Error('beides zugleich');
  if ($('ov-body').querySelectorAll('.tech.locked.afford, .tech.locked.costly').length)
    throw new Error('nicht verfügbare Kachel als bezahlbar/zu teuer markiert');
  // Kein zusätzlicher Text – der Unterschied ist rein grafisch
  const woerter = [...afford, ...costly].map(b => b.textContent);
  if (woerter.some(t => /zu teuer|bezahlbar|reicht nicht|leistbar/i.test(t)))
    throw new Error('die Kacheln tragen zusätzlichen Text');
  G('closeModal')();
  // Die drei Stufen müssen sich auch wirklich unterscheiden. jsdom rechnet kein CSS,
  // deshalb wird das Regelwerk selbst geprüft – und zwar genau die Eigenschaft, an der
  // v31 scheiterte: „zu teuer" darf nicht verblassen, sonst sieht es aus wie
  // „nicht verfügbar" (der rote Rand verliert mit der Deckkraft seine Aussage).
  const css = fs.readFileSync(__dirname + '/css/style.css', 'utf8');
  const regel = sel => {
    const m = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\{([^}]*)\\}').exec(css);
    if (!m) throw new Error('Regel fehlt: ' + sel);
    return m[1];
  };
  const opac = sel => { const m = /opacity:([\d.]+)/.exec(regel(sel)); return m ? +m[1] : 1; };
  if (opac('.tech.avail.costly') !== 1)
    throw new Error('zu teure Kacheln sind gedämpft – dann verblasst auch der rote Rand');
  if (opac('.tech.locked') > 0.4)
    throw new Error('nicht verfügbare Kacheln heben sich zu wenig ab');
  if (!/dashed/.test(regel('.tech.avail.costly')))
    throw new Error('zu teure Kacheln sind nicht gestrichelt');
  if (!/var\(--red\)/.test(regel('.tech.avail')))
    throw new Error('verfügbare Kacheln haben keinen roten Rand');
  if (/border-color/.test(regel('.tech.locked')))
    throw new Error('nicht verfügbare Kacheln färben den Rand um – dann fällt der Unterschied weg');
  console.log('       ' + afford.length + ' bezahlbar, ' + costly.length + ' zu teuer, ohne Zusatztext'
    + ' · zu teuer voll deckend, nicht verfügbar bei ' + opac('.tech.locked'));
});
step('Protokoll: Würfe hängen eingeklappt an der Aktionszeile (Punkt 6)', () => {
  const S = G('S');
  const log = [
    { c: 'head', m: 'Runde 1 — England (Bot)' },
    { c: 'roll', m: '🎲 5 — Wachstum (4+)' },
    { c: 'act', m: 'England: Stadt wächst auf 2.' },
    { c: 'roll', m: '🎲 2 — Siedeln (4+)' },
    { c: 'roll', m: '🎲 6 — Siedeln (4+)' },
    { c: 'act', m: 'England: Siedler gründet Stadt.' },
    { c: 'roll', m: '🎲 1 — Armee bauen (4+)' },
  ];
  const h = G('logHtml')(log);
  const box = window.document.createElement('div'); box.innerHTML = h;
  const det = box.querySelectorAll('details.rolls');
  if (det.length !== 3) throw new Error(det.length + ' statt 3 Würfelblöcke');
  if ([...det].some(d => d.hasAttribute('open'))) throw new Error('Block ist aufgeklappt');
  // Eingeklappt sichtbar: die Aktionszeilen, nicht die Würfe
  const summaries = [...det].map(d => d.querySelector('summary').textContent.trim());
  if (!summaries[0].startsWith('England: Stadt wächst auf 2.'))
    throw new Error('erste Zusammenfassung ist nicht die Aktion: ' + summaries[0]);
  if (!summaries[1].startsWith('England: Siedler gründet Stadt.'))
    throw new Error('zwei Würfe hängen nicht an ihrer Aktion: ' + summaries[1]);
  // Der letzte Wurf hat keine Aktion – dann steht der Grund da
  if (!/Armee bauen/.test(summaries[2])) throw new Error('Fehlwurf ohne Grund: ' + summaries[2]);
  // Die Rundenüberschrift bekommt keine Würfe angehängt
  if (box.querySelector('details.rolls summary').textContent.includes('Runde 1'))
    throw new Error('Überschrift eingeklappt');
  // Ausklappen zeigt die Würfe
  if (det[1].querySelectorAll('.logline.roll').length !== 2)
    throw new Error('Würfe fehlen im aufgeklappten Block');
  if (/🎲 5/.test(summaries[0])) throw new Error('Wurf steht schon in der Zusammenfassung');
  // Und im echten Protokoll läuft es genauso
  G('logModal')();
  if (!$('ov-body').querySelector('details.rolls')) throw new Error('Protokoll klappt nichts ein');
  G('closeModal')();
  console.log('       3 Blöcke, eingeklappt sichtbar: „' + summaries[0] + '"');
});
step('Layoutklassen richten sich nach der effektiven Größe, auch gedreht', () => {
  const html = window.document.documentElement;
  const w = window.innerWidth, h = window.innerHeight;
  html.classList.remove('turn');
  G('syncLayout')();
  const quer = html.classList.contains('w-side');
  // Gedreht sind Breite und Höhe vertauscht – die Klassen müssen umschlagen
  html.classList.add('turn');
  Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
  G('syncLayout')();
  if (!html.classList.contains('w-side'))
    throw new Error('gedreht wird die Querlage nicht erkannt (1000 × 500)');
  if (!html.classList.contains('w-wide'))
    throw new Error('gedreht wird die Breite nicht erkannt');
  html.classList.remove('turn');
  G('syncLayout')();
  if (html.classList.contains('w-side'))
    throw new Error('ohne Drehung gilt 500 × 1000 als quer');
  Object.defineProperty(window, 'innerWidth', { value: w, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: h, configurable: true });
  G('setTurn')(true);
  console.log('       500 × 1000 gedreht = quer und breit, ungedreht = hochkant'
    + (quer ? '' : ''));
});
step('Querformat wird nur im Spiel erzwungen, nicht im Menü oder Aufbau', () => {
  const html = window.document.documentElement;
  G('setTurn')(true);
  if (!G('turnWanted')()) throw new Error('Drehung ist gar nicht gewünscht');
  const dreht = id => { G('show')(id); return html.classList.contains('turn'); };
  if (dreht('screen-menu')) throw new Error('Hauptmenü wird gedreht');
  if (dreht('screen-setup')) throw new Error('Aufbaubildschirm wird gedreht');
  if (dreht('screen-editor')) throw new Error('Editor wird gedreht');
  if (!dreht('screen-game')) throw new Error('Spielbildschirm wird nicht gedreht');
  // Abschalten wirkt auch im Spiel, und die Wahl überlebt einen Bildschirmwechsel
  G('setTurn')(false);
  if (html.classList.contains('turn')) throw new Error('Abschalten wirkt nicht');
  G('show')('screen-menu'); G('show')('screen-game');
  if (html.classList.contains('turn')) throw new Error('abgeschaltete Drehung kehrt zurück');
  G('setTurn')(true);
  if (!html.classList.contains('turn')) throw new Error('Wiedereinschalten wirkt nicht');
  // Der Menüeintrag muss die gespeicherte Wahl zeigen, nicht den Bildschirmzustand
  G('show')('screen-menu');
  if (!G('turnWanted')()) throw new Error('Wahl ging beim Verlassen des Spiels verloren');
  G('show')('screen-game');
  console.log('       gedreht: nur screen-game · Wahl überlebt Bildschirmwechsel');
});
step('Blatt endet über der Aktionsleiste (Punkt 3, gemessen)', () => {
  frischesSpiel(); G('setBarHeight')();
  const v = window.document.documentElement.style.getPropertyValue('--bar-h');
  if (!v) throw new Error('--bar-h wurde nicht gesetzt');
  if (!/^\d+px$/.test(v)) throw new Error('--bar-h ist kein Pixelmaß: ' + v);
  console.log('       --bar-h = ' + v);
});

console.log(errors.length ? '\n' + errors.length + ' Fehler' : '\nOberfläche läuft fehlerfrei durch');
process.exit(errors.length ? 1 : 0);
