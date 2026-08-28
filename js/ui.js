/* Hochzeivilization – Oberfläche */
const $ = id => document.getElementById(id);
const SYM = { star: '★', cross: '✕', square: '■', triangle: '▲', skull: '☠' };
const HEX = 30;
let S = null, ui = { sel: null, army: null, mode: null, botTimer: null };
let customMap = null, editMap = null, edTool = 'G';

/* ------------------------------------------------------------------ Basics */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('show', s.id === id));
  if (typeof applyTurn === 'function') applyTurn();     // Drehung hängt am Bildschirm
}
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200);
}
function modal(title, html) {
  $('ov-title').textContent = title; $('ov-body').innerHTML = html;
  $('overlay').classList.remove('wide');
  $('overlay').classList.add('show');
  lockBar();
}
function closeModal() {
  $('overlay').classList.remove('show'); $('overlay').classList.remove('wide'); lockBar();
  // Leseschritte im Tutorial warten darauf, dass das Fenster wieder zu ist.
  if (typeof tutMaybeAdvance === 'function' && ui && ui.tut) tutMaybeAdvance();
}
function sheet(html) {
  $('sheet-body').innerHTML = html;
  $('sheet').classList.add('open');
  // Im Tutorial sind auch Macht- und Armeeblatt an die Schienen gebunden. Hier zählt nur
  // die Beschriftung – die Feldprüfung macht openTile für das Aktionsblatt selbst.
  if (typeof ui !== 'undefined' && ui && ui.tut) tutGateSheet(null, null);
  lockBar();
}
function closeSheet() { if (ui.botLock) return; $('sheet').classList.remove('open'); lockBar(); }
/* Die Aktionsleiste wird nur noch vom Bot-Fenster gesperrt – dort führt allein
   „Weiter" weiter. Ein normales Aktionsblatt sperrt sie NICHT mehr: es endet seit
   dieser Fassung oberhalb der Leiste (--bar-h), liegt also nicht mehr darauf, und
   die Menüpunkte unten bleiben durchweg bedienbar. */
function lockBar() {
  document.body.classList.toggle('blocked', !!(ui && ui.botLock));
}
/* Echte Höhe von Kopf- und Aktionsleiste ins CSS spiegeln, damit das Blatt exakt
   darüber endet – die Leiste wächst mit Schriftgröße und Geräteeinfassung. */
function setBarHeight() {
  const bar = document.querySelector('#screen-game .actionbar');
  const hud = document.querySelector('#screen-game .hud');
  const st = document.documentElement.style;
  // getBoundingClientRect statt offsetHeight: subpixelgenau und auch dann korrekt,
  // wenn die App gedreht dargestellt wird.
  const hoch = el => el ? Math.round(el.getBoundingClientRect().height) : 0;
  if (hoch(bar)) st.setProperty('--bar-h', hoch(bar) + 'px');
  if (hoch(hud)) st.setProperty('--hud-h', hoch(hud) + 'px');
}
/* Querformat. Eine echte Sperre gibt es nur, wo screen.orientation.lock existiert
   (installiertes Android/Chrome); iOS kennt sie nicht – weder über die API noch über
   das Manifest. Dort bleibt nur, die App im Hochformat selbst zu drehen (html.turn,
   siehe style.css). Abschalten lässt sich das im Spielmenü (☰); die Wahl wird gemerkt. */
/* Querformat. Eine echte Sperre gibt es nur, wo screen.orientation.lock existiert
   (installiertes Android/Chrome); iOS kennt sie nicht – weder über die API noch über
   das Manifest. Dort bleibt nur, die App im Hochformat selbst zu drehen (html.turn,
   siehe style.css). Abschalten lässt sich das im Spielmenü (☰); die Wahl wird gemerkt.

   Gedreht wird NUR der Spielbildschirm. Menü, Aufbau, Editor und die Regelseite haben
   keine feste Karte, die Platz in der Breite bräuchte – dort wäre der Zwang lästig.
   Deshalb hängt html.turn am aktiven Bildschirm und wird aus show() nachgeführt. */
const TURN_SCREENS = ['screen-game', 'screen-place'];
function turnWanted() { return !load('hochciv.noturn'); }
function onTurnScreen() {
  return TURN_SCREENS.some(id => { const el = $(id); return el && el.classList.contains('show'); });
}
function applyTurn() {
  const on = turnWanted() && onTurnScreen();
  document.documentElement.classList.toggle('turn', on);
  try {
    const so = screen && screen.orientation;
    if (so && typeof so.lock === 'function') {
      // Nur im Spiel sperren; beim Verlassen wieder freigeben.
      if (on) so.lock('landscape').catch(() => { });
      else if (typeof so.unlock === 'function') so.unlock();
    }
  } catch (e) { }
  syncLayout();
}
function turning() {
  return document.documentElement.classList.contains('turn') &&
    window.innerHeight > window.innerWidth;
}
/* Effektive Layoutgröße: im gedrehten Zustand sind Breite und Höhe vertauscht.
   Media Queries können das nicht wissen – sie messen den ungedrehten Viewport und
   lägen um 90° daneben. Deshalb setzt diese Funktion die Layoutklassen selbst. */
function syncLayout() {
  const t = turning();
  const w = t ? window.innerHeight : window.innerWidth;
  const h = t ? window.innerWidth : window.innerHeight;
  const cl = document.documentElement.classList;
  cl.toggle('w-wide', w >= 820);
  // Neben der Karte statt darunter, sobald quer und breit genug: gestapelt bliebe auf
  // flachen Schirmen (Telefon quer) fast nichts von der Karte übrig.
  cl.toggle('w-side', w >= 600 && w > h);
  cl.toggle('w-narrow', w < 600);
  setBarHeight();
}
function setTurn(on) {
  store('hochciv.noturn', on ? null : true);
  applyTurn();
}
function initOrientation() {
  applyTurn();
  window.addEventListener('resize', syncLayout);
  window.addEventListener('orientationchange', syncLayout);
}

function store(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
function load(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function saveGame() { if (S) store('hochciv.save', S); }

/* ------------------------------------------------------------------ Kartenzeichnung */
function svgEl(n, attrs) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', n);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function hexPath(size) {
  return hexPoints(size).map(p => p.join(',')).join(' ');
}
function terrainGlyph(g, t, x, y) {
  const add = (n, a) => { const e = svgEl(n, Object.assign({ 'pointer-events': 'none' }, a)); g.appendChild(e); return e; };
  const line = (x1, y1, x2, y2, col, w) => add('line', { x1, y1, x2, y2, stroke: col, 'stroke-width': w || 1.4, 'stroke-linecap': 'round' });
  if (t === 'G') { line(x - 5, y + 4, x - 5, y - 1, '#7b8a52'); line(x + 5, y + 4, x + 5, y - 1, '#7b8a52'); }
  else if (t === 'M') {
    for (let i = 0; i < 2; i++) add('path', {
      d: `M${x - 9},${y + i * 7 - 2} q4.5,-4 9,0 q4.5,4 9,0`, fill: 'none', stroke: '#6f97a8', 'stroke-width': 1.6
    });
  } else if (t === 'F') add('path', { d: `M${x - 7},${y + 8} q7,-6 0,-8 q-7,-2 0,-8`, fill: 'none', stroke: '#4a7f9c', 'stroke-width': 2.2, 'stroke-linecap': 'round' });
  else if (t === 'B') add('path', { d: `M${x - 8},${y + 6} L${x},${y - 7} L${x + 8},${y + 6} Z`, fill: '#f2ece0', stroke: '#7a6a58', 'stroke-width': 1 });
  else if (t === 'W') for (let i = -1; i <= 1; i++)
    add('path', { d: `M${x + i * 8 - 5},${y + 6} L${x + i * 8},${y - 4} L${x + i * 8 + 5},${y + 6} Z`, fill: '#3f5f38' });
  else if (t === 'I') add('circle', { cx: x, cy: y, r: 5, fill: '#9fb37a', stroke: '#7c8a5a' });
  else if (t === 'V') {            // Vulkan: Kegel mit glühendem Krater
    add('path', { d: `M${x - 9},${y + 7} L${x - 3.5},${y - 6} L${x + 3.5},${y - 6} L${x + 9},${y + 7} Z`,
      fill: '#3b322b', stroke: '#241f1a', 'stroke-width': 1 });
    add('path', { d: `M${x - 3.5},${y - 6} L${x + 3.5},${y - 6} L${x + 1},${y - 1} L${x - 1},${y - 1} Z`,
      fill: '#c4552f' });
  }
}
/* Weltwunder einer Stadt: kleine Rauten unter dem Stadtsymbol, Zahl = Stufe. */
function wonderMarks(g, S2, ct, x, y) {
  const list = (S2.wonders || []).filter(w => w.cityId === ct.id);
  if (!list.length) return;
  list.forEach((w, i) => {
    const dx = (i - (list.length - 1) / 2) * 15;
    g.appendChild(svgEl('rect', {
      x: x + dx - 6, y: y + 15, width: 12, height: 12, rx: 2,
      transform: `rotate(45 ${x + dx} ${y + 21})`,
      fill: '#f7f1e0', stroke: '#8a6f2f', 'stroke-width': 1.6, 'pointer-events': 'none'
    }));
    const t = svgEl('text', {
      x: x + dx, y: y + 25, 'text-anchor': 'middle', 'font-size': 10,
      fill: '#8a6f2f', 'font-weight': 700, 'pointer-events': 'none'
    });
    t.textContent = w.lvl; g.appendChild(t);
  });
}
/* Freistehende Wunder (Stonehenge-Ruinen ohne Stadt) */
function orphanMarks(g, S2) {
  (S2.wonders || []).filter(w => w.cityId == null).forEach(w => {
    const [x, y] = hexCenter(w.r, w.c, HEX);
    const t = svgEl('text', {
      x, y: y + 7, 'text-anchor': 'middle', 'font-size': 20, fill: '#8a6f2f', 'pointer-events': 'none'
    });
    t.textContent = '◈'; g.appendChild(t);
  });
}
function tallyMarks(g, n, x, y, col) {
  for (let i = 0; i < Math.min(n, 20); i++) {
    const row = Math.floor(i / 5), k = i % 5;
    g.appendChild(svgEl('line', {
      x1: x - 14 + k * 6, y1: y - 22 - row * 6, x2: x - 14 + k * 6 + 2, y2: y - 30 - row * 6,
      stroke: col, 'stroke-width': 2, 'stroke-linecap': 'round', 'pointer-events': 'none'
    }));
  }
}
function drawMap(svg, map, opts) {
  opts = opts || {};
  svg.innerHTML = '';
  const rows = map.rows, R = rows.length, C = Math.max(...rows.map(r => r.length));
  const w = Math.sqrt(3) * HEX * (C + 1), h = HEX * 1.5 * R + HEX * 0.5;
  const world = svgEl('g', { id: 'world' });
  svg.appendChild(world);
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const pts = hexPath(HEX);

  // 1 Gelände. „Kein Feld" (X) gehört nicht zur Karte: es wird nicht gezeichnet und
  // ist nicht antippbar – so entsteht die Form einer Plättchenkarte. Nur der Editor
  // zeigt es blass, sonst ließe sich ein versehentlich gesetztes X nicht zurücknehmen.
  for (let r = 0; r < R; r++) for (let c = 0; c < rows[r].length; c++) {
    const t = rows[r][c], [x, y] = hexCenter(r, c, HEX);
    if (!TERRAIN[t]) continue;
    const off = isOff(t);
    if (off && !opts.showVoid) continue;
    const attrs = {
      points: pts, transform: `translate(${x},${y})`, fill: TERRAIN[t].color,
      stroke: '#8a8258', 'stroke-width': 1, 'data-r': r, 'data-c': c
    };
    if (off) { attrs.opacity = 0.4; attrs['stroke-dasharray'] = '3 3'; }
    world.appendChild(svgEl('polygon', attrs));
    if (!off) terrainGlyph(world, t, x, y);
  }
  // 2 Straßen / Eisenbahn
  if (opts.state) {
    const S2 = opts.state;
    const roadTiles = new Set(Object.keys(S2.roads));
    S2.cities.forEach(ct => { if (effectiveRoad(S2, ct.r, ct.c) >= 1) roadTiles.add(key(ct.r, ct.c)); });
    for (const k of roadTiles) {
      const [r, c] = unkey(k), lvl = effectiveRoad(S2, r, c), [x, y] = hexCenter(r, c, HEX);
      for (const [nr, nc] of neighbors(r, c)) {
        const nk = key(nr, nc); if (!roadTiles.has(nk) || nk < k) continue;
        const [x2, y2] = hexCenter(nr, nc, HEX);
        const lv = Math.min(lvl, effectiveRoad(S2, nr, nc));
        if (lv < 1) continue;
        world.appendChild(svgEl('line', {
          x1: x, y1: y, x2, y2, stroke: '#5b4a33', 'stroke-width': lv >= 2 ? 3 : 2,
          'stroke-dasharray': lv >= 2 ? '6 4' : '', 'pointer-events': 'none'
        }));
      }
    }
    // 3 Reichsgrenzen
    S2.players.forEach((p, i) => {
      if (p.dead) return;
      const own = controlledTiles(S2, i);
      citiesOf(S2, i).forEach(ct => own.add(key(ct.r, ct.c)));
      const col = civOf(p).color;
      for (const k of own) {
        const [r, c] = unkey(k), [x, y] = hexCenter(r, c, HEX), v = hexPoints(HEX);
        for (let d = 0; d < 6; d++) {
          const [nr, nc] = neighbor(r, c, d);
          if (own.has(key(nr, nc))) continue;
          const a = v[(d + 1) % 6], b = v[(d + 2) % 6];
          world.appendChild(svgEl('line', {
            x1: x + a[0], y1: y + a[1], x2: x + b[0], y2: y + b[1],
            stroke: col, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'pointer-events': 'none'
          }));
        }
      }
    });
    // 4 Overlay (erreichbare Felder)
    (opts.highlight || []).forEach(([r, c]) => {
      const [x, y] = hexCenter(r, c, HEX);
      world.appendChild(svgEl('polygon', {
        points: pts, transform: `translate(${x},${y})`, fill: 'rgba(255,255,255,.42)',
        stroke: '#2a2721', 'stroke-width': 2, 'stroke-dasharray': '5 4', 'pointer-events': 'none'
      }));
    });
    // 4b Tutorial-Hervorhebung: goldener Rahmen um die Felder, um die es gerade geht
    (opts.tutHl || []).forEach(([r, c]) => {
      const [x, y] = hexCenter(r, c, HEX);
      world.appendChild(svgEl('polygon', {
        points: pts, transform: `translate(${x},${y})`, fill: 'rgba(255,214,102,.30)',
        stroke: '#b8860b', 'stroke-width': 3.4, 'stroke-linejoin': 'round', 'pointer-events': 'none'
      }));
    });
    // 5 Armeen
    S2.armies.forEach(a => {
      const [x, y] = hexCenter(a.r, a.c, HEX);
      const civ = civOf(S2.players[a.owner]);
      // Symbol zweimal: erst als heller Umriss, dann gefüllt – so bleibt es auf
      // jedem Gelände lesbar, ohne wie eine Stadt (Kreis) auszusehen.
      for (const halo of [true, false]) {
        const t = svgEl('text', {
          x, y: y + 8, 'text-anchor': 'middle', 'font-size': 25,
          fill: halo ? 'none' : civ.color, stroke: halo ? '#f7f1e0' : 'none',
          'stroke-width': halo ? 5 : 0, 'stroke-linejoin': 'round', 'pointer-events': 'none'
        });
        t.textContent = SYM[civ.sym]; world.appendChild(t);
      }
      if (a.owner === (opts.turn ?? -1) && a.mp > 0)      // eigene, noch bewegliche Armee
        world.appendChild(svgEl('circle', {
          cx: x, cy: y + 15, r: 3, fill: civ.color, 'pointer-events': 'none'
        }));
    });
    // 6 Städte
    S2.cities.forEach(ct => {
      const [x, y] = hexCenter(ct.r, ct.c, HEX);
      const civ = civOf(S2.players[ct.owner]);
      world.appendChild(svgEl('circle', {
        cx: x, cy: y, r: 15, fill: '#f7f1e0', stroke: ct.cap ? '#2a2721' : civ.color,
        'stroke-width': ct.cap ? 3.5 : 2.4, 'pointer-events': 'none'
      }));
      const t = svgEl('text', {
        x, y: y + 7, 'text-anchor': 'middle', 'font-size': 20, fill: civ.color, 'pointer-events': 'none'
      });
      t.textContent = SYM[civ.sym]; world.appendChild(t);
      tallyMarks(world, ct.pop, x, y, civ.color);
      wonderMarks(world, S2, ct, x, y);
    });
  } else if (map.capitals) {
    // Ohne Spielstand: Legephase. Erlaubte Felder werden genauso markiert wie im Spiel
    // die erreichbaren, nur eben vor den Hauptstädten gezeichnet.
    (opts.highlight || []).forEach(([r, c]) => {
      const [x, y] = hexCenter(r, c, HEX);
      world.appendChild(svgEl('polygon', {
        points: pts, transform: `translate(${x},${y})`, fill: 'rgba(255,255,255,.42)',
        stroke: '#2a2721', 'stroke-width': 2, 'stroke-dasharray': '5 4', 'pointer-events': 'none'
      }));
    });
    (opts.frame || []).forEach(([r, c]) => {
      const [x, y] = hexCenter(r, c, HEX);
      world.appendChild(svgEl('polygon', {
        points: pts, transform: `translate(${x},${y})`, fill: 'none',
        stroke: '#b8860b', 'stroke-width': 3, 'stroke-linejoin': 'round', 'pointer-events': 'none'
      }));
    });
    const capList = Array.isArray(map.capitals)
      ? map.capitals.filter(Boolean).map(e => [e.civ, [e.r, e.c]])
      : Object.keys(map.capitals).map(k => [k, map.capitals[k]]);
    for (const [k, pos] of capList) {
      const [r, c] = pos, civ = CIVS.find(x => x.k === k);
      if (!civ || r >= R) continue;
      const [x, y] = hexCenter(r, c, HEX);
      world.appendChild(svgEl('circle', { cx: x, cy: y, r: 15, fill: '#f7f1e0', stroke: '#2a2721', 'stroke-width': 3, 'pointer-events': 'none' }));
      const t = svgEl('text', { x, y: y + 7, 'text-anchor': 'middle', 'font-size': 20, fill: civ.color, 'pointer-events': 'none' });
      t.textContent = SYM[civ.sym]; world.appendChild(t);
    }
  }
  if (opts.state) orphanMarks(world, opts.state);
  // 7 Auswahl
  if (opts.sel) {
    const [x, y] = hexCenter(opts.sel[0], opts.sel[1], HEX);
    world.appendChild(svgEl('polygon', {
      points: pts, transform: `translate(${x},${y})`, fill: 'none', stroke: '#9d3b2f',
      'stroke-width': 4, 'pointer-events': 'none'
    }));
  }
  return world;
}

/* ------------------------------------------------------------------ Antippen
   Die Karte wird nicht mehr geschoben oder gezoomt: sie ist immer vollständig
   eingepasst. Deshalb braucht es auch keine Koordinatenrechnung mehr – der Treffer
   wird direkt auf dem Sechseck ausgewertet. Das ist genauer als „nächster Mittelpunkt"
   (die Ecken gehören jetzt dem richtigen Feld) und funktioniert auch dann, wenn die
   App im Hochformat um 90° gedreht dargestellt wird. */
function attachTaps(svg, onTap) {
  svg.addEventListener('click', e => {
    const el = e.target.closest ? e.target.closest('[data-r]') : null;
    if (!el) return;
    onTap(+el.dataset.r, +el.dataset.c);
  });
}

/* ------------------------------------------------------------------ Spielansicht */
function currentMap() { return customMap || DEFAULT_MAP; }
function redraw() {
  if (ui.army && !S.armies.includes(ui.army)) ui.army = null;
  const highlight = ui.army ? [...armyReach(S, ui.army).keys()].map(unkey) : [];
  drawMap($('map'), S.map, {
    state: S, sel: ui.sel, highlight, tutHl: ui.tut ? tutHighlight() : null,
    turn: P(S).kind === 'bot' ? -1 : S.cur,
  });
  const p = P(S), civ = civOf(p);
  $('hud-sym').textContent = SYM[civ.sym];
  $('hud-sym').style.borderColor = civ.color;
  $('hud-name').textContent = civ.n + (p.kind === 'bot' ? T(' · Bot') : '');
  const ev = curEvent();
  // Anteil an der Weltbevölkerung – die Siegschwelle ist ein Anteil, keine Stückzahl,
  // also gehört die Prozentzahl gleich daneben. Kaufmännisch gerundet.
  const mine = popOf(S, S.cur), all = worldPop(S);
  const pct = all > 0 ? Math.round((mine / all) * 100) : 0;
  // Ist ein Sieg angemeldet, läuft die Runde noch zu Ende – das muss in der Kopfzeile
  // stehen, sonst wirkt das plötzliche Spielende willkürlich.
  const letzte = S.endRound != null && !S.over
    ? ' · ' + T('letzte Runde (%s)', (S.claims || []).map(c => civOf(S.players[c.pi]).n).join(', ')) : '';
  $('hud-round').textContent = T('Runde %s · Bevölkerung %s/%s (%s %)', S.round, mine, all, pct) +
    (ev ? ` · ${ev.n}` : '') + letzte;
  $('hud-sci').textContent = p.res.sci;
  $('hud-food').textContent = p.res.food + (p.foodDeficit ? ` (−${p.foodDeficit})` : '');
  $('hud-coins').textContent = p.res.coins; $('hud-power').textContent = powerOf(S, S.cur);
  const human = p.kind !== 'bot' && !S.over;
  ['a-tech', 'a-power', 'a-army', 'a-end'].forEach(id => $(id).disabled = !human);
  if (ui.tut) {
    const bar = tutAllow().bar;
    ['a-tech', 'a-power', 'a-army', 'a-info', 'a-log', 'a-end'].forEach(id =>
      $(id).disabled = !human || (bar ? !bar.includes(id) : true));
    renderTutPanel();
  }
  saveGame();
}

/* Beim Start eines normalen Spiels darf kein Tutorial-Panel stehen bleiben. */
function endTutorialPanel() {
  ui = { sel: null, army: null, mode: null, botTimer: null };
  const panel = $('tut-panel');
  if (panel) panel.hidden = true;
  document.body.classList.remove('tut');
}
function tapHex(r, c) {
  if (S.over || P(S).kind === 'bot') return;
  if (ui.army) {
    if (ui.tut && !tutMoveOk(r, c)) return toast(T('Im Tutorial: ziehe die Armee auf das goldene Feld.'));
    const e = moveArmy(S, ui.army, r, c);
    if (e) { toast(e); } else { ui.army = null; ui.sel = [r, c]; redraw(); return; }
  }
  ui.sel = [r, c]; redraw(); openTile(r, c);
}
function mp(a) { return 'Bewegung ' + String(a.mp).replace('.', ',') ; }
const Y_ICON = ['🔬', '🌾', '🪙'];
const fmtY = y => y.map((n, i) => n + Y_ICON[i]).join(' ');
const fmtGain = g => [g.sci, g.food, g.coins]
  .map((n, i) => (n > 0 ? '+' : '') + n + Y_ICON[i]).join(' ');
/* Was eine Stadt auf diesem Feld dem Reich einbrächte – nur dann, wenn hier auch
   wirklich gegründet werden kann. Sonst ist die Zahl eine Antwort auf eine Frage, die
   sich gar nicht stellt, und der Grund („Nicht auf Meer") steht ohnehin schon am
   Knopf „Stadt gründen".
   Der Wert kommt aus settleGain: Umland, Fähigkeiten, Wunder und der eine mitessende
   Bevölkerungspunkt sind darin verrechnet, überlappendes Umland zählt nicht doppelt. */
function settleFact(r, c) {
  const pi = S.cur;
  if (canFound(S, pi, r, c)) return '';
  const g = settleGain(S, pi, r, c);
  return `<div class="tile-facts">
    <span class="fact"><span class="fact-k">${T('Ertrag beim Siedeln')}</span>
      <span class="fact-v">${fmtGain(g)}</span></span></div>`;
}
function openTile(r, c) {
  const pi = S.cur, p = P(S);
  const t = terrainAt(S, r, c);
  if (!t) return closeSheet();
  const city = cityAt(S, r, c), army = armyAt(S, r, c);
  const rows = [], handlers = [];
  /* Der erste Parameter ist der **deutsche** Text: er wird hier übersetzt und zusätzlich
     als `data-label` mitgegeben. Daran erkennt das Tutorial seine Knöpfe – es prüft
     Beschriftungen mit deutschen Ausdrücken, und die passen sonst nicht mehr, sobald die
     Oberfläche auf Englisch steht (dann war „Stadt gründen" gesperrt und das Tutorial
     hing fest). */
  const btn = (label, sub, cost, fn, off) => {
    const id = 'x' + (handlers.length + 1) + Math.random().toString(36).slice(2, 6);
    rows.push(`<button class="opt" id="${id}" data-label="${label}" ${off ? 'disabled' : ''}>` +
      `<span>${T(label)}${sub ? `<small>${sub}</small>` : ''}</span>` +
      `<span class="cost">${cost || ''}</span></button>`);
    handlers.push([id, fn]);
  };
  let head = `<h3>${TERRAIN[t].name}</h3><p class="sub">${T('Feld %s/%s · Ertrag', r, c)} `
    + fmtY(tileYieldAt(S, pi, r, c)) + '</p>' + settleFact(r, c);

  if (city) {
    const owner = civOf(S.players[city.owner]);
    const wl = (S.wonders || []).filter(w => w.cityId === city.id);
    head = `<h3>${owner.n}${city.cap ? ' · ' + T('Hauptstadt') : ''}</h3>
      <p class="sub">${T('Bevölkerung %s · Verteidigung %s', city.pop, defenseValue(S, city))}</p>` +
      (wl.length ? `<div class="wlist">${wl.map(w =>
        `<span class="wtag">◈ ${WONDER_BY_KEY[w.k].n} (${T('Stufe %s', w.lvl)})</span>`).join('')}</div>` : '');
    if (city.owner === pi) {
      if (freeGrowthAvailable(S, pi, city))
        btn('Kostenlos wachsen', T('auf %s · Verbundwerkstoffe', city.pop + 1), T('gratis'),
          () => { const e = growCity(S, pi, city, 'free'); e ? toast(e) : redraw(); openTile(r, c); });
      const pc = growPrice(S, pi, city);
      const perr = canGrowPaid(S, pi, city);
      btn('Bevölkerung wachsen', perr || T('auf %s', city.pop + 1), `${pc.food}🌾 ${pc.coins}🪙`,
        () => { const e = growCity(S, pi, city, 'paid'); e ? toast(e) : redraw(); openTile(r, c); }, !!perr);
      if (S.wo) {
        const wcost = wonderCost(S, pi);
        const full = wondersInCity(S, city).length >= 2;
        const any = availableWonders(S).some(w => !canBuildWonder(S, pi, city, w.k));
        btn('Weltwunder bauen', full ? T('diese Stadt hat schon zwei Wunder')
          : any ? T('%s/2 in dieser Stadt', wondersInCity(S, city).length)
            : T('nichts baubar (Münzen oder Stufenregel)'), `${wcost}🪙`,
          () => wonderSheet(city), full || !any);
      }
      const ac = armyCost(S, pi);
      // payOpts, nicht die nackte Münzprüfung: im Bürgerkrieg zählt auch Nahrung mit.
      const civil = payOpts(S, pi).foodOk;
      btn('Armee bauen', civil ? T('Bürgerkrieg: auch mit Nahrung zahlbar')
        : T('muss die Stadt noch verlassen'), `${ac}🪙`,
        () => { const e = buildArmy(S, pi, city); e ? toast(e) : redraw(); openTile(r, c); },
        available(S, pi, 'coins', payOpts(S, pi)) < ac || !!armyAt(S, r, c));
      if (slaveryUsable(p))
        btn('Bevölkerung opfern', city.sacrificed === S.round ? T('diese Runde schon geopfert') : TECH_BY_KEY.sklaverei.n, '+10🪙',
          () => { const e = sacrifice(S, pi, city); e ? toast(e) : redraw(); openTile(r, c); },
          city.pop < 2 || city.sacrificed === S.round);
      if (army && army.owner === pi)          // Armee steht in der Stadt und muss heraus
        btn('Armee hier bewegen', army.born === S.round ? T('muss die Stadt noch verlassen')
          : T('erreichbare Felder werden markiert'), mp(army),
          () => { ui.army = army; closeSheet(); redraw(); toast(T('Zielfeld antippen')); }, army.mp <= 0);
    } else {
      const atk = attackersOn(S, pi, city).length;
      const sk = S.sieges[pi + '|' + city.id] || 0;
      rows.push(`<p class="sub">${T('Deine Armeen in Reichweite: %s · Angriffswert %s', atk, attackValue(S, pi, atk))}
        ${sk ? ' · ' + T('Belagerung %s/2', sk) : ''}</p>`);
    }
  } else if (army) {
    const owner = civOf(S.players[army.owner]);
    head = `<h3>${T('Armee')} · ${owner.n}</h3><p class="sub">${T('Angriffswert %s', powerOf(S, army.owner))} · ${mp(army)}</p>`;
    if (army.owner === pi)
      btn('Diese Armee bewegen', T('erreichbare Felder werden markiert'), '',
        () => { ui.army = army; closeSheet(); redraw(); toast(T('Zielfeld antippen')); }, army.mp <= 0);
  } else {
    const cost = foundCost(S, pi, r, c), ferr = canFound(S, pi, r, c);
    const costLabel = cost === Infinity ? '—' : `${cost}🌾`;
    btn('Stadt gründen', ferr || T('Grundkosten + Distanz zur Hauptstadt (über passierbare Felder)'), costLabel,
      () => { const e = foundCity(S, pi, r, c); e ? toast(e) : redraw(); closeSheet(); }, !!ferr);
    if (has(p, 'kolonialismus')) {
      const owned = S.players.some((_, i) => controlledTiles(S, i).has(key(r, c)));
      btn('Feld kaufen', owned ? T('nur herrenlose Felder') : TECH_BY_KEY.kolonialismus.n, '5🪙',
        () => { const e = buyTile(S, pi, r, c); e ? toast(e) : redraw(); openTile(r, c); }, owned);
    }
  }
  if (has(p, 'atomwaffen')) {
    // Atomwaffenproteste sperren den Einsatz dauerhaft – dann ist der Knopf auch aus
    const banned = evNukeBan(S, pi);
    btn('Atomschlag auf dieses Feld',
      banned ? T('durch Atomwaffenproteste dauerhaft gesperrt')
        : p.nuked ? T('diese Runde schon eingesetzt')
          : T('zerstört alle Armeen hier und ringsum, auch eigene'), '☢︎',
      () => {
        const e = nuke(S, S.cur, r, c);
        toast(e || T('Atomschlag ausgeführt')); redraw(); openTile(r, c);
      }, p.nuked || banned);
  }
  // Die Stufen kommen aus roadTargets, nicht aus einer eigenen Rechnung – sonst weicht
  // das Blatt von dem ab, was buildRoad erlaubt (Eisenbahn ohne Rad war so unbaubar).
  if (canBuildRoads(p) && !city) {
    const ziele = roadTargets(S, pi, r, c);
    const lvl = roadLevel(S, r, c);
    if (!ziele.length) {
      // Nichts baubar – trotzdem anzeigen, damit der Grund sichtbar ist.
      btn(lvl >= 1 ? 'Eisenbahn bauen' : 'Straße bauen',
        lvl >= 2 ? T('hier liegt schon eine Eisenbahn') : T('Eisenbahn noch nicht erforscht'),
        '–🪙', () => { }, true);
    } else ziele.forEach(z => {
      btn(z === 2 ? 'Eisenbahn bauen' : 'Straße bauen',
        z === 2 ? T('Bewegung kostenlos · Handelsroute +2') : T('Bewegung ½ Punkt · Handelsroute +1'),
        roadPrice(S, pi, r, c, z) + '🪙',
        () => doRoad(r, c, z), available(S, pi, 'coins') < roadPrice(S, pi, r, c, z));
    });
  }
  sheet(head + rows.join(''));
  if (ui.tut) tutGateSheet(r, c);
  handlers.forEach(([id, fn]) => { const el = $(id); if (el) el.onclick = fn; });
}
function doRoad(r, c, ziel) {
  // Die Zielstufe kommt vom Knopf. Der Preis wird von buildRoad frisch bestimmt –
  // wer erst die Straße baut und dann im selben Blatt die Eisenbahn, zahlt für den
  // Ausbau nur noch 1 statt 2. Deshalb muss das Blatt danach neu gezeichnet werden,
  // sonst steht am Knopf noch der alte Preis.
  const target = ziel || roadTarget(S, S.cur, r, c);
  if (!target) return toast(T('Hier lässt sich nichts weiter bauen.'));
  const e = buildRoad(S, S.cur, r, c, target);
  e ? toast(e) : toast(target === 2 ? T('Eisenbahn gebaut') : T('Straße gebaut'));
  redraw();
  openTile(r, c);
}

function armySheet() {
  const pi = S.cur, mine = armiesOf(S, pi);
  if (!mine.length)
    return sheet(`<h3>${T('Deine Armeen')}</h3><p class="sub">${T('Du hast noch keine. Eigene Stadt antippen → Armee bauen (%s Münzen).', armyCost(S, pi))}</p>`);
  const rows = mine.map((a, i) => {
    const inCity = cityAt(S, a.r, a.c);
    const note = a.mp <= 0 ? T('diese Runde schon gezogen')
      : inCity && a.born === S.round ? T('muss die Stadt noch verlassen')
        : T('auf %s', TERRAIN[terrainAt(S, a.r, a.c)].name);
    return `<button class="opt" data-i="${i}" data-label="Armee wählen" ${a.mp <= 0 ? 'disabled' : ''}>
      <span>${T('Armee %s · Feld %s/%s', i + 1, a.r, a.c)}<small>${note}</small></span>
      <span class="cost">${mp(a)}</span></button>`;
  }).join('');
  sheet(`<h3>${T('Deine Armeen (%s)', mine.length)}</h3>
    <p class="sub">${T('Angriffswert des Reiches: %s. Antippen wählt die Armee aus, danach ein markiertes Feld antippen.', powerOf(S, pi))}</p>${rows}`);
  $('sheet-body').querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
    const a = mine[+b.dataset.i];
    ui.army = a; ui.sel = [a.r, a.c];
    closeSheet(); redraw(); toast(T('Zielfeld antippen'));
  });
}

/* Kleine Symbolmarker: welche Reiche diese Technologie schon haben.
   Eigenes Reich mit Ring hervorgehoben, damit man sich sofort verortet. */
/* Wie viele Menschen spielen mit? Nur dann lohnt die Anzeige, wer eine Technologie
   erforschen KÖNNTE – Bots kennen keine Verfügbarkeiten, sie würfeln frei aus dem Pool. */
function humanCount(S) { return S.players.filter(p => p.kind === 'human' && !p.dead).length; }
/* Marken an einer Technologiekachel.
   Gefüllt = hat sie bereits. Blass und umkringelt = kann sie erforschen (nur andere
   MENSCHEN, nur im Mehrpersonenspiel). Beides klar zu unterscheiden, weil es zwei sehr
   verschiedene Dinge sind: erledigte Tatsache gegen bloße Möglichkeit. */
/* Marken an einer Technologiekachel: wer sie hat, wer sie erforschen könnte.
   Die beiden Zustände waren kaum zu unterscheiden (gleiches Symbol, gleiche Farbe, nur
   Ring gestrichelt statt durchgezogen). Jetzt ist „hat sie" eine **ausgefüllte** Marke in
   der Reichsfarbe mit hellem Symbol, „könnte sie" eine **leere** Marke mit farbigem
   Symbol auf Papier und einem kleinen Fragezeichen. Voll gegen leer trägt auch bei 16 px
   und in Graustufen. */
function ownerMark(civ, art, self) {
  const hat = art === 'hat';
  const stil = hat
    ? `background:${civ.color};border-color:${civ.color};color:#fff`
    : `color:${civ.color};border-color:${civ.color}`;
  const titel = hat ? T('%s%s hat sie erforscht', civ.n, self ? ' (du)' : '')
    : T('%s könnte sie erforschen', civ.n);
  return `<span class="owner-mark ${hat ? 'has' : 'can'}${self ? ' self' : ''}"
    style="${stil}" title="${titel}">${SYM[civ.sym]}${hat ? '' : '<i>?</i>'}</span>`;
}
function ownerMarks(S, techKey, pi) {
  const mehrere = humanCount(S) > 1;
  const marks = S.players.map((pl, i) => {
    if (pl.dead) return '';
    const civ = civOf(pl), self = i === pi;
    if (pl.techs[techKey]) return ownerMark(civ, 'hat', self);
    // Verfügbar bei einem anderen Menschen – die eigene Verfügbarkeit sieht man an der Kachel
    if (mehrere && !self && pl.kind === 'human' && pl.avail && pl.avail[techKey])
      return ownerMark(civ, 'kann', false);
    return '';
  }).join('');
  return marks ? `<span class="owner-marks">${marks}</span>` : '';
}
/* Kompakte Ertragsübersicht (Inspiration: Ozymandias). Je Geländetyp ein farbiger
   Punkt, Feldanzahl und der Beitrag zu Wissenschaft/Nahrung/Münzen; darunter die
   Bevölkerung und die Gesamtsumme. Zeigt das Einkommen des laufenden Zugs. */
const YIELD_ICON = ['🔬', '🌾', '🪙'];
const TERRAIN_GLYPH = { G: '🌿', W: '🌲', B: '⛰️', F: '💧', M: '🌊', I: '🏝️' };
function yieldRow(label, glyph, color, count, y, opts = {}) {
  const cells = y.map((n, i) => n
    ? `<span class="yv"><span class="yi">${YIELD_ICON[i]}</span>${n}</span>`
    : `<span class="yv zero">·</span>`).join('');
  return `<div class="yrow ${opts.cls || ''}">
    <span class="yl"><span class="ydot" style="background:${color}">${glyph}</span>
      <span class="yname">${label}</span>${count != null ? `<span class="ycount">×${count}</span>` : ''}</span>
    <span class="yvals">${cells}</span></div>`;
}
function yieldOverview(S, pi) {
  const b = incomeBreakdown(S, pi);
  let h = `<div class="yield-panel"><h4 class="yhead">${T('Ertrag nächster Zug')}</h4>`;
  for (const r of b.rows)
    h += yieldRow(r.name, TERRAIN_GLYPH[r.key] || '▪', TERRAIN[r.key].color, r.count, r.y);
  for (const e of (b.extra || []))
    h += yieldRow(e.name, e.glyph || '✦', '#c8a86a', e.count, e.y);
  h += yieldRow(T('Bevölkerung'), '👥', '#c8b98a', b.pop.count, b.pop.y, { cls: 'pop' });
  h += yieldRow(T('Summe'), '∑', '#6b5d47', null, b.total, { cls: 'sum' });
  // Vorschau: kein Einkommen, sondern was die Armeen zu Zugende erbeuten (Wikinger)
  for (const e of (b.preview || []))
    h += yieldRow(e.name, e.glyph || '⚔︎', '#b08a4a', null, e.y, { cls: 'prev' });
  h += '</div>';
  return h;
}
/* ------------------------------------------------------------------ Technologien */
function techModal() {
  const pi = S.cur, p = P(S);
  // Nur die kleine Legende mit zwei Beispielmarken – der erklärende Absatz darüber ist
  // raus, er stand in jeder Ansicht im Weg.
  const bsp = S.players.find((pl, i) => i !== pi && !pl.dead);
  let grid = bsp
    ? `<p class="sub owner-legend" style="margin:-2px 0 10px">
         ${ownerMark(civOf(bsp), 'hat', false)} <span>${T('hat sie erforscht')}</span>
         ${humanCount(S) > 1
        ? `${ownerMark(civOf(bsp), 'kann', false)} <span>${T('könnte sie erforschen')}</span>` : ''}
       </p>`
    : '';
  grid += '<div class="techgrid">';
  for (let a = 0; a < 4; a++) {
    grid += `<div class="age-label">${AGES[a]}</div>`;
    for (let f = 0; f < 4; f++) {
      grid += `<div class="techcol">${a === 0 ? `<h4>${FIELDS[f]}</h4>` : ''}`;
      for (const t of techsIn(f, a, S)) {
        const owned = has(p, t.k), avail = p.avail[t.k] && !owned;
        const cost = techCost(S, pi, t);
        const can = avail && available(S, pi, 'sci') >= cost;
        // Sklaverei wird mit der ersten Technologie der Moderne obsolet – im Bogen sichtbar.
        const dead = t.k === 'sklaverei' && owned && !slaveryUsable(p);
        const eff = dead ? T('obsolet – seit der Moderne nicht mehr nutzbar') : techEffect(t, S);
        // Verfügbar zerfällt in zwei Zustände: bezahlbar (afford) und zu teuer (costly).
        // Rein grafisch – der Kostenwert steht ohnehin schon in der Kachel.
        const state = owned ? 'owned' : avail ? (can ? 'avail afford' : 'avail costly') : 'locked';
        grid += `<button class="tech ${state}${dead ? ' obsolete' : ''}"
          ${can ? `data-tech="${t.k}"` : 'disabled'}><span class="c">${owned ? '✓' : cost}</span>
          <b>${t.n}</b><span class="eff">${eff}</span>${ownerMarks(S, t.k, pi)}</button>`;
      }
      grid += '</div>';
    }
  }
  grid += '</div>';
  const sing = singularityReady(p), sc = techCost(S, pi, SINGULARITY);
  const singCan = sing && available(S, pi, 'sci') >= sc && !p.techs.singularitaet;
  const singState = p.techs.singularitaet ? 'owned'
    : sing ? (singCan ? 'avail afford' : 'avail costly') : 'locked';
  grid += `<button class="tech ${singState}" style="margin-top:10px"
      ${singCan ? 'data-tech="singularitaet"' : 'disabled'}>
      <span class="c">${sc}</span><b>${SINGULARITY.n}</b><span class="eff">${SINGULARITY.e}</span></button>`;
  // Griechenland "Freie Forschung": eine verfügbare Tech bis Industrialisierung gratis
  const ft = freeTechOptions(S, pi);
  if (ft.length) {
    grid += `<p class="sub" style="margin-top:14px">${T('Freie Forschung (1× pro Runde, kostenlos)')}</p>`;
    grid += ft.map(t => `<button class="tech avail afford" data-freetech="${t.k}">
      <span class="c">${T('gratis')}</span><b>${t.n}</b><span class="eff">${techEffect(t, S)}</span></button>`).join('');
  }
  const bp = backPickOptions(S, pi);
  if (bp.length) {
    grid += `<p class="sub" style="margin-top:14px">${T('Rückschau: eine Technologie aus %s, früheres Zeitalter, kostenlos', FIELDS[backPick(p).f])}</p>`;
    grid += bp.map(t => `<button class="tech avail afford" data-backtech="${t.k}">
      <span class="c">${T('gratis')}</span><b>${t.n}</b><span class="eff">${techEffect(t, S)}</span></button>`).join('');
  }
  const cop = copyableTechs(S, pi);
  if (cop.length) {
    const anyFree = internetAvailable(S, pi) && cop.some(o => o.freeOk);
    grid += `<p class="sub" style="margin-top:14px">${T('Technologien kopieren')}${
      anyFree ? ' · ' + T('1× gratis per Internet') : ''}</p>`;
    cop.slice(0, 40).forEach(o => {
      // je Technologie ggf. zwei Knöpfe: bezahlt und/oder gratis
      const buttons = [];
      if (o.paidCoins != null)
        buttons.push(`<button class="tech avail ${available(S, pi, 'coins') >= o.paidCoins
          ? 'afford' : 'costly'}" data-copy="${o.tech.k}" data-mode="paid">
          <span class="c">${o.paidCoins}🪙</span><b>${o.tech.n}</b>
          <span class="eff">${techEffect(o.tech, S)}</span>${ownerMarks(S, o.tech.k, pi)}</button>`);
      if (o.freeOk)
        buttons.push(`<button class="tech avail afford" data-copy="${o.tech.k}" data-mode="free">
          <span class="c">gratis</span><b>${o.tech.n}</b>
          <span class="eff">Internet · Gratiskopie${o.paidCoins != null ? '' : ''}</span>
          ${ownerMarks(S, o.tech.k, pi)}</button>`);
      grid += buttons.join('');
    });
  }
  const layout = `<div class="tech-layout">
    <aside class="tech-aside">${yieldOverview(S, pi)}</aside>
    <div class="tech-main">${grid}</div>
  </div>`;
  modal(T('Technologien · %s Wissenschaft verfügbar', available(S, pi, 'sci')), layout);
  $('overlay').classList.add('wide');
  if (ui.tut) tutGateTechs();
  $('ov-body').querySelectorAll('[data-tech]').forEach(b => b.onclick = () => {
    const e = doResearch(S, S.cur, b.dataset.tech);
    if (e) return toast(e);
    redraw(); if (S.over) { closeModal(); gameOver(); } else techModal();
  });
  $('ov-body').querySelectorAll('[data-freetech]').forEach(b => b.onclick = () => {
    const e = useFreeTech(S, S.cur, b.dataset.freetech);
    if (e) return toast(e); redraw(); techModal();
  });
  $('ov-body').querySelectorAll('[data-backtech]').forEach(b => b.onclick = () => {
    const e = useBackPick(S, S.cur, b.dataset.backtech);
    if (e) return toast(e); redraw(); techModal();
  });
  $('ov-body').querySelectorAll('[data-copy]').forEach(b => b.onclick = () => {
    const e = copyTech(S, S.cur, b.dataset.copy, b.dataset.mode);
    if (e) return toast(e); redraw(); techModal();
  });
}
function powerSheet() {
  // payOpts, nicht die nackte Münzprüfung: im Bürgerkrieg zählt auch Nahrung mit.
  const pi = S.cur, price = powerPrice(S, pi);
  const maxN = Math.floor(available(S, pi, 'coins', payOpts(S, pi)) / price);
  let h = `<h3>${T('Macht kaufen')}</h3><p class="sub">` +
    T('%s Münzen = 1 Macht · aktuell %s Macht. Zu Zugbeginn verlierst du %s davon.',
      price, P(S).power, has(P(S), 'panzer') ? '1/4' : has(P(S), 'stahl') ? '1/3' : '1/2') +
    (payOpts(S, pi).foodOk ? ' ' + T('Bürgerkrieg: auch mit Nahrung zahlbar.') : '') + '</p>';
  [1, 5, maxN].forEach((n, i) => {
    if (n <= 0 || (i === 2 && maxN <= 5)) return;
    h += `<button class="opt" data-n="${n}" data-label="+${n} Macht"><span>${T('+%s Macht', n)}${i === 2 ? `<small>${T('alles ausgeben')}</small>` : ''}</span>
      <span class="cost">${n * price}🪙</span></button>`;
  });
  if (maxN <= 0) h += `<p class="sub">${T('Nicht genug Münzen.')}</p>`;
  sheet(h);
  $('sheet-body').querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
    const e = buyPower(S, S.cur, +b.dataset.n); e ? toast(e) : null; redraw(); powerSheet();
  });
}
/* Protokollzeilen als HTML. Die Würfe, die zu einer Aktion geführt haben, hängen als
   aufklappbares Detail an dieser Aktionszeile: sichtbar ist nur, was passiert ist,
   die Würfe holt man sich per Antippen. Eine Bot-Runde besteht sonst zu gut der Hälfte
   aus 🎲-Zeilen und man findet die eigentliche Aktion nicht mehr.
   Die Zuordnung „Würfe davor gehören zur nächsten Aktionszeile" stimmt, weil die
   Regelmaschine erst würfelt und dann das Ergebnis protokolliert. Würfe, auf die keine
   Aktion folgt (Fehlschläge am Ende eines Zuges), stehen als eigener Sammelposten. */
function rollSummary(rolls) {
  // Aus „🎲 4 — Wachstum (2+)" wird der Grund gezogen; gleiche Gründe werden gezählt.
  const why = [], seen = new Map();
  for (const l of rolls) {
    const m = /—\s*(.+?)\s*(?:\(\d(?:[–-]\d)?\+?\))?\s*$/.exec(l.m);
    const w = m ? m[1] : 'Wurf';
    if (!seen.has(w)) { seen.set(w, 1); why.push(w); } else seen.set(w, seen.get(w) + 1);
  }
  const parts = why.slice(0, 3).map(w => seen.get(w) > 1 ? `${w} ×${seen.get(w)}` : w);
  if (why.length > 3) parts.push('…');
  return parts.join(', ');
}
function rollsBlock(rolls, lead) {
  const n = rolls.length;
  const tag = `<em class="rtag">🎲 ${n}</em>`;
  const inner = rolls.map(l => `<div class="logline roll">${l.m}</div>`).join('');
  const head = lead
    ? `<span class="lsum ${lead.c}">${lead.m}</span>${tag}`
    : `<span class="lsum">${rollSummary(rolls)}</span>${tag}`;
  return `<details class="rolls"><summary>${head}</summary>${inner}</details>`;
}
function logHtml(entries) {
  const out = [];
  let buf = [];
  for (const l of entries) {
    if (l.c === 'roll') { buf.push(l); continue; }
    // Rundenüberschriften bekommen keine Würfe angehängt – sie trennen die Züge.
    if (buf.length && l.c !== 'head') { out.push(rollsBlock(buf, l)); buf = []; continue; }
    if (buf.length) { out.push(rollsBlock(buf, null)); buf = []; }
    out.push(`<div class="logline ${l.c}">${l.m}</div>`);
  }
  if (buf.length) out.push(rollsBlock(buf, null));
  return out.join('');
}
function logModal() {
  modal('Protokoll', logHtml(S.log.slice(-260)));
  const b = $('ov-body'); b.scrollTop = b.scrollHeight;
}

/* ------------------------------------------------------------------ Zugende & Bots */
function endHumanTurn() {
  // Harte Sperre: eine Armee, die noch in einer Stadt steht, verhindert das Zugende
  // ganz – da hilft kein Bestätigen, der Zustand ist schlicht ungültig.
  const stop = blockingIssues(S, S.cur);
  if (stop.length) { toast(stop[0]); return; }
  const warn = pendingWarnings(S, S.cur);
  if (warn.length && !ui.confirmedEnd) {
    ui.confirmedEnd = true;
    toast(warn[0] + ' ' + T('Nochmal tippen zum Bestätigen.'));
    return;
  }
  ui.confirmedEnd = false; ui.army = null; ui.sel = null; ui.mode = null;
  closeSheet();
  const sinceSeq = S.logSeq || 0;
  finishTurn(S);                       // Kampf und Siegprüfung
  const fights = logSince(S, sinceSeq).filter(l => l.c === 'fight');
  redraw();
  if (S.over) return gameOver();
  advanceTurn(S);
  redraw();
  runBots();
  if (fights.length) toast(fights[fights.length - 1].m);
}
function runBots() {
  if (S.over) return gameOver();
  const p = P(S);
  if (p.kind !== 'bot') return humanTurnStart();
  const sinceSeq = S.logSeq || 0;
  botTurn(S, S.cur);
  finishTurn(S);                       // Kampf des Bots, einmal pro Zug
  redraw();
  const entries = logSince(S, sinceSeq);
  const lines = entries.length
    ? logHtml(entries)
    : `<div class="logline info">${T('Keine Aktionen in dieser Runde.')}</div>`;
  ui.botLock = true;                   // Sheet ist jetzt gesperrt: nur „Weiter" führt weiter
  sheet(`<h3>${civOf(p).n} (${T('Bot')})</h3><p class="sub">${T('Runde %s', S.round)}</p>${lines}
    <button class="btn wide" id="bot-next">${T('Weiter')}</button>`);
  $('sheet').classList.add('locked');
  $('bot-next').onclick = () => {
    ui.botLock = false;
    $('sheet').classList.remove('locked');
    closeSheet();
    if (S.over) return gameOver();
    advanceTurn(S); redraw();
    if (P(S).kind === 'bot') runBots();
    else humanTurnStart();
  };
}
function gameOver() {
  const o = S.over, w = o.winner;
  const namen = (o.winners || [w]).map(i => civOf(S.players[i]).n).join(T(' und '));
  const titel = o.shared ? T('%s gewinnen gemeinsam.', namen) : T('%s gewinnt.', namen);
  // Bei mehreren Siegansprüchen die Punkte offenlegen: Bevölkerung + Wunder + Techs.
  let tafel = '';
  if (o.score && o.score.length > 1) {
    tafel = `<table class="tbl" style="margin:10px 0"><tr><th>${T('Reich')}</th><th>${T('Bev.')}</th>
      <th>${T('Wunder')}</th><th>${T('Techs')}</th><th>${T('Punkte')}</th></tr>` +
      o.score.map(x => `<tr${(o.winners || []).includes(x.pi) ? ' style="font-weight:700"' : ''}>
        <td>${civOf(S.players[x.pi]).n}</td><td>${x.pop}</td><td>${x.wonders}</td>
        <td>${x.techs}</td><td>${x.total}</td></tr>`).join('') + '</table>' +
      `<p class="sub">${o.score.map(x => `${civOf(S.players[x.pi]).n}: ${x.how}`).join(' · ')}</p>` +
      (o.tiebreak === 'mensch'
        ? `<p class="sub">${T('Gleichstand nach Punkten – bei Gleichstand geht der Sieg an den Menschen.')}</p>`
        : '');
  }
  modal(T('Spielende'), `<p style="font-family:var(--serif);font-size:22px;margin:0 0 6px">
    ${titel}</p><p class="sub">${o.how}</p>${tafel}
    <button class="btn wide" onclick="store('hochciv.save',null);location.reload()">${T('Zurück zum Menü')}</button>`);
  confetti(civOf(S.players[w]).color);
}
/* Kleiner Sieggruß: ein paar Papierschnipsel, die einmal durchs Bild fallen.
   Bewusst sparsam – 40 Stück, gut zwei Sekunden, danach räumt es sich selbst ab.
   Reines CSS in Bewegung, kein Zeitgeber je Schnipsel; wer Bewegung reduziert haben
   möchte (prefers-reduced-motion), bekommt gar keins. */
function confetti(farbe) {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  } catch (e) { }
  const alt = $('confetti'); if (alt) alt.remove();
  const box = document.createElement('div');
  box.id = 'confetti';
  const farben = [farbe || '#9a3b2f', '#c8a83c', '#4d7a4a', '#e8dfc4'];
  let h = '';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 100, dauer = 1.6 + Math.random() * 1.1;
    const spät = Math.random() * 0.5, dreh = Math.random() * 720 - 360;
    const c = farben[i % farben.length], br = 5 + Math.random() * 5;
    h += `<i style="left:${x}%;background:${c};width:${br.toFixed(1)}px;
      height:${(br * 1.6).toFixed(1)}px;animation-duration:${dauer.toFixed(2)}s;
      animation-delay:${spät.toFixed(2)}s;--dreh:${dreh.toFixed(0)}deg"></i>`;
  }
  box.innerHTML = h;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3400);
}

/* --------------------------------------------------------- Ereignis & Erweiterungen */
function curEvent() {
  if (!S || !S.ev || !S.event || !S.event.k || S.event.round !== S.round) return null;
  return EVENT_BY_KEY[S.event.k];
}
/* „Welt": Ereignis dieser Runde, Weltwunder, Barbaren – alles auf einen Blick. */
function worldModal() {
  const pi = S.cur, p = P(S);
  let h = '';
  if (S.ev) {
    const ev = curEvent();
    h += ev
      ? `<div class="evbox"><b>${T('Ereignis: %s', ev.n)}</b><p>${ev.e}</p>
         ${hasWonder(S, pi, 'palast') ? `<p>${T('Der Apostolische Palast schützt dich davor.')}</p>` : ''}</div>`
      : `<div class="evbox"><b>${T('Kein Ereignis in dieser Runde')}</b><p>${T('Der Spaltenwürfel ging ins Leere.')}</p></div>`;
    if (hasWonder(S, pi, 'orakel')) {
      const nx = peekNextEvent(S);
      const nn = nx && nx.k ? EVENT_BY_KEY[nx.k].n : T('keines');
      h += `<p class="sub">${T('Das Orakel sieht für die nächste Runde: %s', '<b>' + nn + '</b>')}</p>`;
    }
    if ((S.barbs || []).length)
      h += `<p class="sub">${T('Barbaren belagern %s Stadt/Städte.', S.barbs.length)}</p>`;
    if (S.nukeBan) h += `<p class="sub">${T('Atomwaffenproteste: Atomwaffen sind gesperrt.')}</p>`;
  }
  if (S.wo) {
    const c = wonderCounts(S, pi);
    h += `<p class="sub" style="margin-top:12px">` +
      T('Deine Weltwunder — Stufe 1: %s · Stufe 2: %s · Stufe 3: %s · nächstes Wunder %s Münzen',
        c[1], c[2], c[3], wonderCost(S, pi)) + '</p>';
    h += '<div class="wlist">' + (wondersOf(S, pi).map(w =>
      `<span class="wtag">${WONDER_BY_KEY[w.k].n}${w.cityId == null ? ' (' + T('freistehend') + ')' : ''}</span>`).join('')
      || `<span class="sub">${T('noch keins')}</span>`) + '</div>';
    for (const lvl of [1, 2, 3]) {
      const pool = poolOf(S, lvl);
      if (!pool.length) continue;
      h += `<p class="sub" style="margin-top:10px">${T('Verfügbar, Stufe %s', lvl)}</p>`;
      h += pool.map(k => `<div class="tech ${wonderLevelOk(S, pi, lvl) ? 'avail' : 'locked'}">
        <span class="c">${WONDER_BY_KEY[k].lvl}</span><b>${WONDER_BY_KEY[k].n}</b>
        <span class="eff">${WONDER_BY_KEY[k].e}</span></div>`).join('');
    }
    const others = S.players.map((pl, i) => i).filter(i => i !== pi && wondersOf(S, i).length);
    if (others.length) {
      h += `<p class="sub" style="margin-top:10px">${T('Andere Reiche')}</p>`;
      h += others.map(i => `<p style="font-size:12px;margin:2px 0">
        <b style="color:${civOf(S.players[i]).color}">${civOf(S.players[i]).n}</b>: ` +
        wondersOf(S, i).map(w => WONDER_BY_KEY[w.k].n).join(', ') + '</p>').join('');
    }
  }
  if (!S.ev && !S.wo) h = `<p class="sub">${T('Dieses Spiel läuft ohne Ereignisse und ohne Weltwunder.')}</p>`;
  modal(T('Welt'), h);
}
/* Weltwunder in einer Stadt bauen */
function wonderSheet(city) {
  const pi = S.cur;
  const cost = wonderCost(S, pi);
  let h = `<h3>${T('Weltwunder bauen')}</h3><p class="sub">` +
    T('Kosten %s Münzen · diese Stadt hat %s/2 Wunder · verfügbar: %s Münzen',
      cost, wondersInCity(S, city).length, available(S, pi, 'coins')) + '</p>';
  const list = availableWonders(S);
  const rows = list.map(w => {
    const err = canBuildWonder(S, pi, city, w.k);
    return `<button class="opt" data-w="${w.k}" ${err ? 'disabled' : ''}>
      <span>${w.n}<small>${T('Stufe %s', w.lvl)} · ${w.e}${err ? ' · ' + err : ''}</small></span>
      <span class="cost">${cost}🪙</span></button>`;
  }).join('');
  sheet(h + (rows || `<p class="sub">${T('Keine Wunder verfügbar.')}</p>`));
  $('sheet-body').querySelectorAll('[data-w]').forEach(b => b.onclick = () => {
    const e = buildWonder(S, S.cur, city, b.dataset.w);
    if (e) return toast(e);
    redraw();
    if (S.over) { closeSheet(); return gameOver(); }
    if (freePick(P(S))) return freePickModal();
    openTile(city.r, city.c);
  });
}
/* Nahrungsübersicht zu Zugbeginn: was das Land produziert, was die Bevölkerung isst
   und – mit Gentechnik/Massenmedien – wie viel davon aus Wissenschaft oder Münzen
   bestritten wird. Voreingestellt ist die Deckung aus Nahrung, also gar keine
   Verschiebung; jede Änderung lässt sich zurücknehmen.
   Kein Umtausch: gedeckt wird höchstens, was die Bevölkerung tatsächlich isst. */
function foodSheet() {
  const pi = S.cur, p = ensureFoodState(S, pi);
  const b = incomeBreakdown(S, pi);
  const isst = p.popFood || 0, gedeckt = p.popCovered || 0;
  const land = (p.foodRaw || 0) + isst;              // Produktion ohne die Bevölkerung
  const offen = Math.max(0, isst - gedeckt);
  const src = feedSources(S, pi);

  const zeile = (n, v, cls) => `<div class="fl ${cls || ''}"><span>${n}</span>
    <b>${v > 0 ? '+' : ''}${v} 🌾</b></div>`;
  let h = `<h3>${T('Nahrung diese Runde')}</h3>
    <div class="foodcalc">
      ${zeile(T('Das Land produziert'), land)}
      ${zeile(T('Die Bevölkerung isst (%s)', popOf(S, pi)), -isst)}
      ${gedeckt ? zeile(T('Davon aus %s bestritten', [
        p.popCoveredBy && p.popCoveredBy.sci ? T('Wissenschaft') : '',
        p.popCoveredBy && p.popCoveredBy.coins ? T('Münzen') : ''].filter(Boolean).join(' ' + T('und') + ' ')),
        gedeckt, 'plus') : ''}
      ${zeile(T('Bleibt nutzbar'), p.res.food, 'sum')}
      ${p.foodDeficit ? `<p class="hint warn-t">${T('Ungedeckt: %s 🌾 – die Nahrung bleibt bei 0, die Bevölkerung nimmt keinen Schaden.', p.foodDeficit)}</p>` : ''}
    </div>`;

  if (!src.length) {
    h += T('<p class="hint">Mit <b>Gentechnik</b> oder <b>Massenmedien</b> ließe sich ein Teil davon aus Wissenschaft oder Münzen bestreiten.</p>');
    sheet(h); return;
  }
  h += T('<p class="sub" style="margin-top:10px">Aus anderen Quellen bestreiten – höchstens %s, also nur die tatsächlichen Kosten.</p>', isst);
  src.forEach(x => {
    const have = p.res[x.kind];
    const steps = [...new Set([1, 5, Math.min(offen, have)])]
      .filter(n => n > 0 && n <= Math.min(offen, have)).sort((a, c) => a - c);
    const schon = (p.popCoveredBy && p.popCoveredBy[x.kind]) || 0;
    h += `<p class="sub" style="margin-top:8px">${T('%s: %s übrig', x.n, have)}${
      schon ? ' · ' + T('%s eingesetzt', schon) : ''}</p>`;
    if (!steps.length && !schon) { h += `<p class="hint">${T('Nichts einzusetzen.')}</p>`; return; }
    steps.forEach(n => {
      h += `<button class="opt" data-k="${x.kind}" data-n="${n}"><span>${T('%s %s einsetzen', n, x.n)}${
        n === offen ? `<small>${T('deckt alles, was die Bevölkerung isst')}</small>` : ''}</span>
        <span class="cost">+${n}🌾</span></button>`;
    });
    if (schon)
      h += `<button class="opt ghost" data-back="${x.kind}" data-n="${schon}">
        <span>${T('%s %s zurücknehmen', schon, x.n)}</span><span class="cost">−${schon}🌾</span></button>`;
  });
  sheet(h);
  $('sheet-body').querySelectorAll('[data-k]').forEach(b2 => b2.onclick = () => {
    const e = coverPop(S, S.cur, b2.dataset.k, +b2.dataset.n);
    if (e) return toast(e);
    redraw(); foodSheet();
  });
  $('sheet-body').querySelectorAll('[data-back]').forEach(b2 => b2.onclick = () => {
    const e = uncoverPop(S, S.cur, b2.dataset.back, +b2.dataset.n);
    if (e) return toast(e);
    redraw(); foodSheet();
  });
}
/* Alt-Name für Tests und ältere Aufrufe. */
function feedSheet() { return foodSheet(); }
/* Auswahl kostenloser Technologien (Bibliothek, Oxford, Griechenland) */
function freePickModal() {
  // Die Singularität ist über Oxford kostenlos wählbar und beendet das Spiel sofort.
  // Ohne diese Prüfung liefe die Auswahl weiter, das Fenster schlösse sich stumm und
  // der Siegbildschirm käme nie – das Spiel wirkte hängengeblieben.
  if (S.over) { closeModal(); return gameOver(); }
  const pi = S.cur, p = P(S);
  const pick = freePick(p);
  const list = pick ? freePickOptions(S, pi) : backPickOptions(S, pi);
  const title = pick ? pick.why : T('Rückschau');
  if (!list.length) { closeModal(); return; }
  const h = `<p class="sub">${pick ? T('Noch %s kostenlose Technologie(n).', pick.n) :
    T('Eine beliebige Technologie desselben Feldes aus einem früheren Zeitalter, kostenlos.')}</p>` +
    list.map(t => `<button class="tech avail" data-free="${t.k}">
      <span class="c">${T('gratis')}</span><b>${t.n}</b><span class="eff">${techEffect(t, S)}</span></button>`).join('');
  modal(title, h);
  $('ov-body').querySelectorAll('[data-free]').forEach(b => b.onclick = () => {
    const e = pick ? useFreePick(S, S.cur, b.dataset.free) : useBackPick(S, S.cur, b.dataset.free);
    if (e) return toast(e);
    redraw();
    if (S.over) { closeModal(); return gameOver(); }
    if (freePick(P(S)) || backPickOptions(S, S.cur).length) freePickModal();
    else closeModal();
  });
}
/* Nach jedem Zugwechsel auf einen Menschen: Ereignis melden, Defizit anbieten. */
function humanTurnStart() {
  redraw();
  const p = P(S);
  if (S.over) return gameOver();
  const ev = curEvent();
  toast(ev ? T('%s ist am Zug · Ereignis: %s', civOf(p).n, ev.n)
    : T('%s ist am Zug', civOf(p).n));
  // Mit Gentechnik/Massenmedien gehört die Nahrungsrechnung zu Zugbeginn entschieden.
  if (canFeed(p) && popOpen(ensureFoodState(S, S.cur)) > 0) foodSheet();
  else if (p.foodDeficit > 0) toast(T('Nahrungsdefizit %s – Nahrung bleibt bei 0.', p.foodDeficit));
  else if (freePick(p)) freePickModal();
}

/* ------------------------------------------------------------------ Aufbau */
// 'vier' = alle vier Reiche, 'drei' = drei Reiche, 'duell' = 1 gegen 1
let setupMode = 'vier';
const setupCount = () => setupMode === 'duell' ? 2 : setupMode === 'drei' ? 3 : 4;

/* Kartenliste. Sie hängt an der Spielerzahl: die Plättchenkarte hat für zwei, drei und
   vier Reiche eine eigene Form, die festen Karten haben vier Startsterne (bei drei
   Reichen bleibt einer ungenutzt), und im Duell passen sie gar nicht. */
function mapOptions() {
  const n = setupCount();
  const out = [];
  if (n > 2) MAPS.forEach((m, i) => out.push([String(i), m.name]));
  out.push(['plaettchen', TILE_SHAPES[n].name]);
  if (customMap && n > 2) out.push(['eigene', T('Eigene Karte')]);
  return out;
}
/* Die zuletzt bewusst gewählte Karte. Sie wird gemerkt, damit ein Ausflug in den
   Duellmodus (dort gibt es die festen Karten nicht) die Wahl nicht still umstellt. */
let setupMapWanted = '0';
function fillMapSelect() {
  const sel = $('setup-map'), opts = mapOptions();
  sel.innerHTML = opts.map(([v, n]) => `<option value="${v}">${n}</option>`).join('');
  sel.value = opts.some(o => o[0] === setupMapWanted) ? setupMapWanted : opts[0][0];
  // Im Duell gibt es nur die Plättchenkarte – dann bleibt die Zeile weg statt einer
  // Auswahl mit einem einzigen Eintrag.
  $('setup-map-row').hidden = opts.length < 2;
  sel.disabled = opts.length < 2;
  sel.onchange = () => {
    setupMapWanted = sel.value;
    renderSlots();          // die Plättchenkarte lässt jede Zivilisation mehrfach zu
  };
  $('setup-tile-hint').hidden = sel.value !== 'plaettchen';
  $('setup-double-hint').hidden = sel.value !== 'plaettchen';
}
// Auf der Plättchenkarte darf jeder Platz frei wählen, auch dieselbe Zivilisation
// mehrfach – auf den festen Karten sitzt jede Zivilisation genau einmal (feste
// Startsterne, ein Stern je Reich).
const freieCivWahl = () => setupMapWanted === 'plaettchen';
function setupScreen() {
  $('setup-evmode').innerHTML = EVENT_MODES.map(m => `<option value="${m.k}">${m.n}</option>`).join('');
  $('setup-diff').innerHTML = DIFFICULTIES.map(x =>
    `<option value="${x.k}"${x.k === 'prinz' ? ' selected' : ''}>${x.n}</option>`).join('');
  const evBox = $('setup-events');
  evBox.onchange = () => { $('setup-evmode-row').hidden = !evBox.checked; };
  $('setup-evmode-row').hidden = !evBox.checked;
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
  const n = setupCount(), duel = setupMode === 'duell';
  $('setup-duel-hint').hidden = !duel;
  fillMapSelect();
  const list = $('setup-list');
  const frei = freieCivWahl();
  // Mensch/Bot und Fähigkeit überleben ein Neuzeichnen (Kartenwechsel, Zivilisationswahl)
  const alt = [...list.children].map(x => ({
    kind: x.querySelector('[data-kind].on').dataset.kind,
    abil: x.querySelector('[data-abil]').value,
  }));
  const chosen = (frei || n < 4) ? pickChoice(n) : CIVS.map(c => c.k);
  // Feste Karte: Doppelungen auflösen, sonst säßen zwei Reiche auf einem Startstern
  if (!frei) for (let i = 0; i < n; i++)
    if (chosen.indexOf(chosen[i]) !== i)
      chosen[i] = pickCivs[i] = CIVS.map(c => c.k).find(k => !chosen.slice(0, n).includes(k));
  list.innerHTML = '';
  chosen.forEach((civKey, i) => {
    const zufall = civKey === 'zufall';
    const civ = zufall ? null : CIV_BY_KEY[civKey];
    // Bei Zufall stehen die Fähigkeiten der Zivilisation noch nicht fest: dann gibt es
    // nur Zufall oder die Grundfähigkeit.
    const abils = zufall
      ? [{ k: 'zufall', n: T('Zufall') }, { k: 'basis', n: T('Grundfähigkeit') }]
      : civ.abilities.map((a, j) => ({ k: a.k, n: j === 0 ? a.n : T('Alternative %s: %s', j + 1, a.n), e: a.e }))
        .concat([{ k: 'zufall', n: T('Zufall'), e: T('Wird beim Spielstart ausgelost.') }]);
    const d = document.createElement('div');
    d.className = 'slot'; d.dataset.civ = civKey;
    d.innerHTML = ((frei || n < 4)
      ? `<h3>${zufall ? '🎲' : SYM[civ.sym]} ${T('Platz %s', i + 1)}</h3>
         <label class="row"><span>${T('Zivilisation')}</span>
           <select data-civpick>${CIVS.map(c =>
             `<option value="${c.k}"${c.k === civKey ? ' selected' : ''}>${c.n}</option>`).join('')}
             <option value="zufall"${zufall ? ' selected' : ''}>${T('Zufall')}</option>
           </select></label>`
      : `<h3>${SYM[civ.sym]} ${civ.n}</h3>`) +
      `<div class="seg">
        <button data-kind="human" class="${(alt[i] ? alt[i].kind === 'human' : i === 0) ? 'on' : ''}">${T('Mensch')}</button>
        <button data-kind="bot" class="${(alt[i] ? alt[i].kind === 'bot' : i !== 0) ? 'on' : ''}">${T('Bot')}</button>
      </div>
      <label class="row"><span>${T('Fähigkeit')}</span>
        <select data-abil="${zufall ? 'zufall' : civ.k}">${abils.map(a =>
          `<option value="${a.k}">${a.n}</option>`).join('')}
        </select></label>
      <p class="abil"></p>`;
    list.appendChild(d);
    const sela = d.querySelector('[data-abil]');
    if (alt[i] && abils.some(a => a.k === alt[i].abil)) sela.value = alt[i].abil;
    const note = d.querySelector('.abil');
    const paint = () => {
      const kind = d.querySelector('[data-kind].on').dataset.kind;
      sela.disabled = kind === 'bot';
      const a = abils.find(x => x.k === sela.value) || abils[0];
      note.textContent = kind === 'bot' ? T('Bots erhalten keine Zivilisationsfähigkeit.')
        : zufall ? T('Zivilisation und Fähigkeit werden beim Spielstart ausgelost.')
          : (a.e || T('Wird beim Spielstart ausgelost.'));
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
        pickCivs[j] = CIVS.map(c => c.k).find(k => !pickCivs.slice(0, n).includes(k));
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
  // Rohwahl: 'zufall' bleibt stehen, aufgelöst wird erst in startPlayers()
  return [...$('setup-list').children].map(slot => ({
    civ: slot.dataset.civ,
    kind: slot.querySelector('[data-kind].on').dataset.kind,
    diff,
    ability: slot.querySelector('[data-abil]').value,
  }));
}
/* Sitzt eine Zivilisation mehrfach am Tisch, bekommen ihre Reiche römische Ziffern und
   je eine der vier Zivilisationsfarben – keine Schattierungen. Die erste behält ihre
   eigene Farbe, die Doppelgänger nehmen eine noch freie (zwei Griechenland: eines blau,
   das andere zum Beispiel Englands Rot). Ohne Farbunterschied wären sie auf der Karte
   nicht auseinanderzuhalten: Städte, Armeen und Grenzen werden nur über sie unterschieden. */
const ROMAN = ['I', 'II', 'III', 'IV'];
function nameDoubles(players) {
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
    const frei = CIVS.map(c => c.k).find(k => !belegt.has(k));
    belegt.add(frei); p.colorOf = frei;
  });
  const lauf = {};
  players.forEach(p => {
    const civ = CIV_BY_KEY[p.civ];
    p.color = p.colorOf === p.civ ? null : CIV_BY_KEY[p.colorOf].color;
    delete p.colorOf;
    if (zaehler[p.civ] < 2) return;
    const k = lauf[p.civ] = (lauf[p.civ] || 0) + 1;
    p.name = `${civ.n} ${ROMAN[k - 1] || k}`;
  });
  return players;
}
/* „Zufall" in der Auswahl wird erst beim Spielstart aufgelöst – bis dahin steht im
   Aufbau wirklich Zufall, damit niemand aus der Anzeige schon die Wahl abliest.
   `frei` = Doppelungen erlaubt (Plättchenkarte); sonst bleibt jede Zivilisation einmalig. */
function resolveRandom(players, frei) {
  const pick = list => list[Math.floor(Math.random() * list.length)];
  players.forEach((p, i) => {
    if (p.civ !== 'zufall') return;
    const pool = CIVS.map(c => c.k).filter(k => frei ||
      !players.some((q, j) => j !== i && q.civ === k));
    p.civ = pick(pool.length ? pool : CIVS.map(c => c.k));
    p.randomCiv = true;
  });
  players.forEach(p => {
    if (p.ability !== 'zufall') return;
    p.ability = pick(CIV_BY_KEY[p.civ].abilities).k;
    p.randomAbility = true;
  });
  return players;
}
/* Fertige Spielerliste für den Start: Zufall auflösen, dann Ziffern und Farben. */
function startPlayers() {
  return nameDoubles(resolveRandom(setupConfig(), freieCivWahl()));
}
// Nur eine bewusste Wahl bleibt stehen; ohne sie richtet sich der Startspieler nach der
// Besetzung (bei mehreren Menschen Zufall, sonst der einzige Mensch).
let startWanted = null;
function refreshStart() {
  const cfg = setupConfig(), sel = $('setup-start');
  const label = p => p.civ === 'zufall' ? T('Zufällige Zivilisation')
    : (CIV_BY_KEY[p.civ] ? CIV_BY_KEY[p.civ].n : p.civ);
  sel.innerHTML = `<option value="zufall">${T('Zufällig')}</option>` + cfg.map((p, i) =>
    `<option value="${i}">${label(p)}${p.kind === 'bot' ? ' (Bot)' : ''}</option>`).join('');
  const menschen = cfg.filter(p => p.kind === 'human').length;
  sel.value = (startWanted != null && [...sel.options].some(o => o.value === startWanted))
    ? startWanted
    : menschen > 1 ? 'zufall' : String(Math.max(0, cfg.findIndex(p => p.kind === 'human')));
  sel.onchange = () => { startWanted = sel.value; };
}

/* ------------------------------------------------- Startplättchen legen
   Eine Plättchenkarte entsteht nicht im Aufbau, sondern in einer eigenen Phase:
   die offenen Dreiecke liegen schon, jedes Reich legt sein eigenes selbst – Lage
   (eine von drei) und Hauptstadt (irgendein Landfeld darauf, das keiner fremden
   Startecke zu nah kommt). Gelegt wird verdeckt: sichtbar sind nur die offenen
   Plättchen und das eigene. Bots legen sofort, zufällig, Hauptstadt auf einem der
   drei mittigen Felder. Erst wenn alle fertig sind, wird aufgedeckt.               */
let placeState = null;

function startPlacement(cfg) {
  const seed = Math.floor(Math.random() * 2 ** 31);
  const plan = tilePlan(cfg.players.map(p => p.civ), seed);
  if (!plan) return toast(T('Für diese Spielerzahl gibt es keine Plättchenkarte.'));
  const rnd = mapRng(seed + 12345);
  placeState = { cfg, plan, rnd, queue: [], at: 0, o: 0, cell: null, done: false };
  plan.seats.forEach(seat => {
    const pl = cfg.players[seat.idx];        // nach Platz, nicht nach Zivilisation
    if (pl && pl.kind === 'bot') botPlaceSeat(plan, seat, rnd);
    else placeState.queue.push(seat);
  });
  show('screen-place');
  placeStep();
}
/* Anzeige eines Sitzes: bei doppelten Zivilisationen der Platzname („Russland II") */
function seatCiv(seat) {
  const pl = placeState.cfg.players[seat.idx] || {};
  return civOf({ civ: seat.civ, name: pl.name, color: pl.color });
}
function placeSeatNow() {
  const st = placeState;
  return (st && !st.done && st.at < st.queue.length) ? st.queue[st.at] : null;
}
function placeStep() {
  const st = placeState;
  if (st.at >= st.queue.length) return placeReveal();
  st.o = 0; st.cell = null;
  drawPlace();
  // Hotseat: zwischen zwei Menschen wird das Gerät übergeben, vorher nichts gezeigt.
  if (st.queue.length > 1) {
    const civ = seatCiv(placeSeatNow());
    modal('Verdeckt legen', T('<p class="sub">%s <b>%s</b> ist dran. Das eigene Startplättchen sehen die anderen erst nach dem Aufdecken – jetzt also Gerät übergeben.</p> <button class="btn primary wide" id="pl-gate">Plättchen ansehen</button>', SYM[civ.sym], civ.n));
    $('pl-gate').onclick = closeModal;
  }
}
function drawPlace() {
  const st = placeState, plan = st.plan;
  const seat = placeSeatNow();
  const shape = TILE_SHAPES[plan.n];
  const shown = shape.slots.map((_, i) => i)
    .filter(i => st.done || !isSeatSlot(plan, i) || (seat && seat.slot === i));
  const map = tileMap(plan, {
    show: shown, seat, o: seat ? st.o : null, cell: st.cell,
    caps: st.done ? null : (seat ? [seat.idx] : []),
  });
  const opts = {};
  if (seat) {
    const rcs = slotRC(plan, seat.slot), ok = placeOptions(plan, seat, st.o);
    opts.frame = rcs;
    opts.highlight = rcs.filter((_, i) => ok[i]);
    if (st.cell != null) opts.sel = rcs[st.cell];
  }
  drawMap($('pl-map'), map, opts);
  const note = $('pl-note');
  if (st.done) {
    note.innerHTML = T('Alle Plättchen liegen offen. %s Reiche, %s Dreiecke.',
      plan.n, shape.slots.length);
    $('pl-rot').hidden = true;
    $('pl-ok').textContent = T('Spiel beginnen');
  } else {
    const civ = seatCiv(seat), tile = TILE_POOL[plan.tiles[seat.slot]];
    note.innerHTML = `<b>${SYM[civ.sym]} ${civ.n}</b> · „${tile.n}" · ` +
      T('Lage %s von 3', st.o + 1) + ' · ' +
      (st.cell == null ? T('Hauptstadt auf ein markiertes Feld tippen')
        : T('Hauptstadt gesetzt – „Fertig", wenn es passt'));
    $('pl-rot').hidden = false;
    $('pl-ok').textContent = T('Fertig');
  }
}
function plTap(r, c) {
  const st = placeState, seat = placeSeatNow();
  if (!seat) return;
  const rcs = slotRC(st.plan, seat.slot);
  const i = rcs.findIndex(x => x[0] === r && x[1] === c);
  if (i < 0) return toast(T('Nur auf dem eigenen Plättchen.'));
  if (!placeOptions(st.plan, seat, st.o)[i])
    return toast(T('Nur auf Land – und nicht so nah an einem fremden Startplättchen.'));
  st.cell = i;
  drawPlace();
}
function placeRotate() {
  const st = placeState, seat = placeSeatNow();
  if (!seat) return;
  st.o = (st.o + 1) % 3;
  // Die Hauptstadt bleibt liegen, solange das Feld auch in der neuen Lage passt.
  if (st.cell != null && !placeOptions(st.plan, seat, st.o)[st.cell]) st.cell = null;
  drawPlace();
}
function placeConfirm() {
  const st = placeState;
  if (!st) return;
  if (st.done) return placeGo();
  const seat = placeSeatNow();
  if (st.cell == null) return toast(T('Erst die Hauptstadt setzen.'));
  const err = placeSeat(st.plan, seat, st.o, st.cell);
  if (err) return toast(err);
  st.at++;
  placeStep();
}
function placeReveal() {
  const st = placeState;
  // Sicherheitsnetz: wer (aus welchem Grund auch immer) nichts gelegt hat, wird gelegt.
  st.plan.seats.forEach(seat => { if (seat.cell == null) botPlaceSeat(st.plan, seat, st.rnd); });
  st.done = true; st.plan.revealed = true;
  drawPlace();
}
function placeGo() {
  const st = placeState;
  const cfg = Object.assign({}, st.cfg, { map: tileMap(st.plan) });
  placeState = null;
  S = newGame(cfg);
  startGameScreen();
}

/* ------------------------------------------------------------------ Karteneditor */
function editorScreen() {
  editMap = JSON.parse(JSON.stringify(currentMap()));
  const pal = $('ed-palette'); pal.innerHTML = '';
  const add = (k, label, col) => {
    const b = document.createElement('button');
    b.className = 'swatch' + (edTool === k ? ' on' : '');
    b.innerHTML = `<i style="background:${col}"></i>${label}`;
    b.onclick = () => { edTool = k; pal.querySelectorAll('.swatch').forEach(x => x.classList.toggle('on', x === b)); };
    pal.appendChild(b);
  };
  Object.values(TERRAIN).forEach(t => add(t.key, t.name, t.color));
  CIVS.forEach(c => add('cap:' + c.k, SYM[c.sym] + ' ' + c.n, c.color));
  drawEditor();
}
function drawEditor() { drawMap($('ed-map'), editMap, { showVoid: true }); }
function edTap(r, c) {
  if (r < 0 || r >= editMap.rows.length) return;
  if (c < 0 || c >= editMap.rows[r].length) return;
  if (edTool.startsWith('cap:')) {
    const civ = edTool.slice(4);
    if (!TERRAIN[editMap.rows[r][c]].land) return toast(T('Hauptstädte nur auf Land.'));
    editMap.capitals[civ] = [r, c];
  } else {
    const row = editMap.rows[r];
    if (c >= row.length) return;
    editMap.rows[r] = row.slice(0, c) + edTool + row.slice(c + 1);
  }
  drawEditor();
}

/* ------------------------------------------------------------------ Start */
/* ---------------------------------------------------------------- Sprache
   Der feste Text aus index.html wird beim Start einmal eingesammelt (deutsche Fassung
   als Schlüssel) und beim Sprachwechsel neu gesetzt. Dynamische Texte laufen ohnehin
   durch T(); für sie genügt ein Neuzeichnen. */
let staticText = null;
function collectStatic() {
  staticText = [];
  const walk = document.createTreeWalker(document.body, 4 /* NodeFilter.SHOW_TEXT */);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const t = n.nodeValue.trim();
    if (!t || t.length < 2) continue;
    if (n.parentNode && /SCRIPT|STYLE/.test(n.parentNode.nodeName)) continue;
    staticText.push([n, n.nodeValue]);
  }
}
function applyStaticLang() {
  if (!staticText) return;
  staticText.forEach(([n, de]) => {
    if (!n.parentNode) return;                 // inzwischen neu gezeichnet
    const roh = de.trim();
    // Schlüssel ohne Zeilenumbrüche und Einrückung – im Markup umbrochene Sätze sollen
    // im Wörterbuch als ein Satz stehen.
    const neu = T(roh.replace(/\s+/g, ' '));
    n.nodeValue = de.replace(roh, neu);
  });
}
function langRow() {
  const box = $('m-lang');
  if (!box) return;
  box.innerHTML = LANGS.map(l =>
    `<button class="lang-btn${l.k === LANG ? ' on' : ''}" data-lang="${l.k}"
       title="${l.n}" aria-label="${l.n}">${l.flag}</button>`).join('');
  box.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => switchLang(b.dataset.lang));
}
function switchLang(k) {
  if (k === LANG) return;
  setLang(k);
  document.documentElement.lang = k;
  applyStaticLang();
  langRow();
  bootTexts();
  // was gerade offen ist, neu zeichnen
  if (S && $('screen-game').classList.contains('show')) redraw();
  // das Tutorialpanel behält sonst den Text, mit dem es gezeichnet wurde
  if (ui && ui.tut && typeof renderTutPanel === 'function') renderTutPanel();
  if ($('screen-setup').classList.contains('show')) setupScreen();
  if ($('screen-editor').classList.contains('show')) editorScreen();
  closeModal(); closeSheet();
}
/* Texte, die boot() einmalig setzt – beim Sprachwechsel dieselben Zeilen erneut. */
function bootTexts() {
  $('m-tutorial').textContent = T('Tutorial – geführtes Übungsspiel');
  const ver = $('m-version');
  if (ver) ver.textContent = 'Hochzeivilization ' + APP_VERSION;
}

function boot() {
  initLang();
  document.documentElement.lang = LANG;
  collectStatic();
  applyStaticLang();
  langRow();
  customMap = load('hochciv.map');
  const saved = load('hochciv.save');
  $('m-continue').hidden = !saved;
  bootTexts();

  $('m-new').onclick = () => { show('screen-setup'); setupScreen(); };
  // Tutorial: geführtes Übungsspiel in der normalen Oberfläche
  $('m-tutorial').onclick = () => tutorialStart();
  $('tut-prev').onclick = () => tutMove(-1);
  $('tut-next').onclick = () => tutMove(1);
  $('tut-quit').onclick = () => tutorialQuit();
  $('m-editor').onclick = () => { show('screen-editor'); editorScreen(); };
  $('m-rules').onclick = () => rulesModal();
  $('m-continue').onclick = () => { endTutorialPanel(); S = load('hochciv.save'); startGameScreen(); };
  $('m-load').onclick = () => upload(txt => {
    try { endTutorialPanel(); S = JSON.parse(txt); saveGame(); startGameScreen(); toast(T('Spielstand geladen')); }
    catch (e) { toast(T('Datei nicht lesbar')); }
  });
  document.querySelectorAll('[data-back]').forEach(b => b.onclick = () => show('screen-menu'));
  $('ov-close').onclick = closeModal;
  $('overlay').onclick = e => { if (e.target === $('overlay')) closeModal(); };
  $('sheet-grip').onclick = closeSheet;
  $('sheet-close').onclick = closeSheet;

  $('setup-go').onclick = () => {
    const players = startPlayers();      // Zufall auflösen, dann Ziffern und Farben
    if (!players.some(p => p.kind === 'human')) return toast(T('Mindestens eine menschliche Zivilisation.'));
    const duel = setupMode === 'duell';
    const pick = $('setup-map').value;
    const startWahl = $('setup-start').value;
    const cfg = {
      players, duel,
      startPlayer: startWahl === 'zufall'
        ? Math.floor(Math.random() * players.length) : +startWahl,
      events: $('setup-events').checked, eventMode: $('setup-evmode').value,
      wonders: $('setup-wonders').checked,
    };
    endTutorialPanel();
    // Plättchenkarte: erst legen alle ihr Startdreieck, dann beginnt das Spiel.
    if (pick === 'plaettchen') return startPlacement(cfg);
    cfg.map = pick === 'eigene' ? customMap : MAPS[+pick];
    S = newGame(cfg);
    startGameScreen();
  };
  $('a-tech').onclick = techModal;
  $('a-power').onclick = powerSheet;
  $('a-army').onclick = armySheet;
  $('a-info').onclick = worldModal;
  $('hud-feed').onclick = () => { if (P(S).kind !== 'bot' && !S.over) foodSheet(); };
  $('a-log').onclick = () => { if (ui.tut) { ui.tutSawLog = true; renderTutPanel(); } logModal(); };
  $('a-end').onclick = endHumanTurn;
  $('g-menu').onclick = () => {
    // turnWanted() ist die gespeicherte Wahl – nicht html.turn, das zusätzlich vom
    // Bildschirm abhängt (gedreht wird nur das Spiel).
    const on = turnWanted();
    modal(T('Menü'), `<button class="btn wide" id="mm-rules">${T('Regeln & Technologien')}</button>
      <button class="btn wide" id="mm-turn">${T('Hochkant drehen: %s', on ? T('an') : T('aus'))}</button>
      <p class="hint" style="margin:6px 2px 0">${T('Hält man das Gerät im Spiel hochkant, dreht die App sich selbst quer, damit die Karte breit steht. Menü, Aufbau und Editor bleiben unberührt. iOS erlaubt keine echte Orientierungssperre.')}</p>
      <button class="btn wide" id="mm-export">${T('Spielstand exportieren')}</button>
      <button class="btn wide" id="mm-quit">${T('Spiel beenden')}</button>`);
    $('mm-rules').onclick = rulesModal;
    $('mm-turn').onclick = () => { setTurn(!turnWanted()); closeModal(); };
    $('mm-export').onclick = () => download('hochzeiv-spielstand.json', JSON.stringify(S));
    $('mm-quit').onclick = () => { store('hochciv.save', null); location.reload(); };
  };
  $('ed-save').onclick = () => {
    customMap = editMap; store('hochciv.map', editMap);
    toast(T('Karte gespeichert')); show('screen-menu');
  };
  $('ed-export').onclick = () => download('hochzeiv-karte.json', JSON.stringify(editMap, null, 1));
  $('ed-import').onclick = () => upload(txt => { editMap = JSON.parse(txt); drawEditor(); toast(T('Karte geladen')); });
  $('ed-reset').onclick = () => { editMap = JSON.parse(JSON.stringify(DEFAULT_MAP)); drawEditor(); };
  $('ed-size').onclick = () => {
    const r = prompt('Zeilen', editMap.rows.length), c = prompt('Spalten', editMap.rows[0].length);
    if (!r || !c) return;
    const R = Math.max(4, Math.min(40, +r)), C = Math.max(4, Math.min(40, +c));
    const out = [];
    for (let i = 0; i < R; i++) out.push(((editMap.rows[i] || '').padEnd(C, 'M')).slice(0, C));
    editMap.rows = out; drawEditor();
  };

  attachTaps($('map'), tapHex);
  attachTaps($('ed-map'), edTap);
  attachTaps($('pl-map'), plTap);
  $('pl-rot').onclick = placeRotate;
  $('pl-ok').onclick = placeConfirm;
  initOrientation();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
}
function startGameScreen() {
  show('screen-game');
  redraw();
  setBarHeight();
  if (P(S).kind === 'bot') setTimeout(runBots, 400);
  else setTimeout(humanTurnStart, 60);
}
function rulesModal() {
  modal(T('Kurzregeln'), `
    <p class="sub">${T('Zugablauf')}</p>
    <ol style="font-size:14px;line-height:1.5;padding-left:20px">
      <li>${T('Einkommen aus allen Feldern rund um deine Städte plus Bevölkerung.')}</li>
      <li>${T('Macht halbiert sich (aufgerundet).')}</li>
      <li>${T('Aktionen in beliebiger Reihenfolge, beliebig oft.')}</li>
      <li>${T('Kampf: Angriff = Macht je Armee, Verteidigung = Bevölkerung + benachbarte Armeen. Zwei Züge in Folge stärker → Stadt erobert.')}</li>
      <li>${T('Sieg: Singularität · %s der Weltbevölkerung (UN %s, Theologie %s) · gegnerische Hauptstadt · Weltwunder der Stufe 3. Außer beim Militärsieg endet das Spiel erst am Rundenende; mehrere Ansprüche entscheiden Punkte (Bevölkerung + Wunder + Technologien).',
        victoryLabels(!!(S && S.duel)).base, victoryLabels(!!(S && S.duel)).un,
        victoryLabels(!!(S && S.duel)).theologie)}</li>
    </ol>
    <p class="sub">${T('Ressourcen gelten nur für den laufenden Zug – nur Macht bleibt liegen. 2 Münzen zählen als 1 Nahrung oder 1 Wissenschaft.')}</p>
    <p class="sub">${T('Die Nahrungsproduktion darf nicht negativ werden: Wachstum wird blockiert, sobald das Einkommen dadurch unter 0 fiele – gerechnet auf dem dauerhaften Wert, ein Ereignis dieser Runde zählt dafür nicht. Gentechnik (Wissenschaft) und Massenmedien (Münzen) heben die Grenze auf: zu Zugbeginn lässt sich damit bestreiten, was die Bevölkerung isst – höchstens diese Kosten, also kein allgemeiner Umtausch.')}</p>
    <p class="sub">${T('Handelsrouten: jede eigene Stadt außer der Hauptstadt, die über einen durchgehenden Weg mit ihr verbunden ist, bringt +1 auf alle drei Erträge – über eine reine Eisenbahn +2. Gemischte Strecken zählen als Straße.')}</p>
    <p class="sub">${T('Geländeerträge je Feld')}</p>
    <table style="width:100%;font-size:13px;border-collapse:collapse">
      <tr style="color:var(--ink-soft);font-size:11px"><th align="left">${T('Feld')}</th><th>🔬</th><th>🌾</th><th>🪙</th></tr>
      ${Object.values(TERRAIN).filter(t => !t.off).map(t => `<tr style="border-top:1px solid var(--rule)">
        <td>${t.name}</td>${t.yield.map(n => `<td align="center">${n || '·'}</td>`).join('')}</tr>`).join('')}
      <tr style="border-top:1px solid var(--rule)"><td>${T('Stadt (je Bevölkerung)')}</td>
        <td align="center">1</td><td align="center">−1</td><td align="center">1</td></tr>
    </table>
    <p class="sub">${T('Zivilisationen — je drei wählbare Fähigkeiten (Bots haben keine)')}</p>
    ${CIVS.map(c => `<p style="font-size:13px;margin:6px 0"><b>${SYM[c.sym]} ${c.n}</b><br>` +
      c.abilities.map((a, j) => `<span style="color:var(--ink-soft)">${j === 0 ? T('Grund') : T('Alt. %s', j + 1)}:</span> ${a.e}`).join('<br>') +
      '</p>').join('')}
    <p class="sub">${T('Weltwunder (Erweiterung)')}</p>
    <p style="font-size:13px;margin:4px 0">${T('Kosten 10/20/30/40 … für das 1./2./3./4. Wunder. Stufe 2 muss seltener sein als Stufe 1, Stufe 3 seltener als Stufe 2. Je Stadt zwei Wunder. Ein Wunder der Stufe 3 gewinnt zu Beginn des nächsten Zuges.')}</p>
    <p class="sub">${T('Ereignisse (Erweiterung)')}</p>
    <p style="font-size:13px;margin:4px 0">${T('Zu Rundenbeginn wird gewürfelt: Zeile, dann Spalte. Hart trifft jede Runde, leicht etwa jede zweite. Bots sind nie betroffen.')}</p>
    <p class="sub">${T('Alle Technologien')}</p>
    <p style="font-size:12px;color:var(--ink-soft);margin:0 0 8px">${T('Kosten links, Wirkung rechts. Verfügbar wird eine Technologie erst, wenn sie ausgewürfelt ist.')}</p>
    ${FIELDS.map((fn, f) => `<p class="rule-field">${fn}</p>` +
      AGES.map((an, a) => {
        const list = techsIn(f, a, S);
        if (!list.length) return '';
        return `<p class="rule-age">${an}</p>` + list.map(t =>
          `<div class="rule-tech"><span class="c">${t.c}</span><b>${t.n}</b><i>${techEffect(t, S)}</i></div>`).join('');
      }).join('')).join('')}
    <p class="rule-field">${T('Sieg')}</p>
    <div class="rule-tech"><span class="c">${SINGULARITY.c}</span><b>${SINGULARITY.n}</b>
      <i>${SINGULARITY.e}</i></div>`);
}
function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
function upload(cb) {
  const i = document.createElement('input'); i.type = 'file'; i.accept = '.json';
  i.onchange = () => { const f = i.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => cb(rd.result); rd.readAsText(f); };
  i.click();
}
boot();
