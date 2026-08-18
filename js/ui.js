/* Hochzeivilization – Oberfläche */
const $ = id => document.getElementById(id);
const SYM = { star: '★', cross: '✕', square: '■', triangle: '▲', skull: '☠' };
const HEX = 30;
let S = null, ui = { sel: null, army: null, mode: null, botTimer: null };
let view = { k: 1, x: 0, y: 0 }, edView = { k: 1, x: 0, y: 0 };
let customMap = null, editMap = null, edTool = 'G';

/* ------------------------------------------------------------------ Basics */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('show', s.id === id));
}
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200);
}
function modal(title, html) {
  $('ov-title').textContent = title; $('ov-body').innerHTML = html;
  $('overlay').classList.remove('wide');
  $('overlay').classList.add('show');
}
function closeModal() { $('overlay').classList.remove('show'); $('overlay').classList.remove('wide'); }
function sheet(html) { $('sheet-body').innerHTML = html; $('sheet').classList.add('open'); }
function closeSheet() { if (ui.botLock) return; $('sheet').classList.remove('open'); }

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

  // 1 Gelände
  for (let r = 0; r < R; r++) for (let c = 0; c < rows[r].length; c++) {
    const t = rows[r][c], [x, y] = hexCenter(r, c, HEX);
    const poly = svgEl('polygon', {
      points: pts, transform: `translate(${x},${y})`, fill: TERRAIN[t].color,
      stroke: '#8a8258', 'stroke-width': 1, 'data-r': r, 'data-c': c
    });
    world.appendChild(poly);
    terrainGlyph(world, t, x, y);
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
    for (const k in map.capitals) {
      const [r, c] = map.capitals[k], civ = CIVS.find(x => x.k === k);
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
function applyView(svg, v) {
  const g = svg.querySelector('#world');
  if (g) g.setAttribute('transform', `translate(${v.x},${v.y}) scale(${v.k})`);
}

/* ------------------------------------------------------------------ Gesten */
function attachGestures(host, svg, v, onTap) {
  const pts = new Map(); let moved = 0, last = null, lastDist = 0;
  const toWorld = e => {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  const unit = () => { const m = svg.getScreenCTM(); return m ? 1 / m.a : 1; };  // viewBox-Einheiten je Bildschirmpixel
  host.addEventListener('pointerdown', e => {
    host.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, e); moved = 0; last = { x: e.clientX, y: e.clientY };
    if (pts.size === 2) { const [a, b] = [...pts.values()]; lastDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  });
  host.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, e);
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (lastDist) {
        const f = d / lastDist, mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
        const p = toWorld({ clientX: mx, clientY: my });
        v.x = (v.x - p.x) * f + p.x; v.y = (v.y - p.y) * f + p.y;
        v.k = Math.max(.35, Math.min(4, v.k * f));
      }
      lastDist = d; moved = 99; applyView(svg, v); return;
    }
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    moved += Math.abs(dx) + Math.abs(dy);
    const scale = unit();
    v.x += dx * scale; v.y += dy * scale;
    last = { x: e.clientX, y: e.clientY };
    applyView(svg, v);
  });
  const up = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId); lastDist = 0;
    if (moved < 9 && pts.size === 0) {
      const w = toWorld(e);
      let best = null, bd = 1e9;
      svg.querySelectorAll('[data-r]').forEach(el => {
        const r = +el.dataset.r, c = +el.dataset.c;
        const [hx, hy] = hexCenter(r, c, HEX);
        const p = { x: hx * v.k + v.x, y: hy * v.k + v.y };
        const d = Math.hypot(p.x - w.x, p.y - w.y);
        if (d < bd) { bd = d; best = [r, c]; }
      });
      if (best && bd < HEX * v.k * 1.05) onTap(best[0], best[1]);
    }
  };
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', up);
}

/* ------------------------------------------------------------------ Spielansicht */
function currentMap() { return customMap || DEFAULT_MAP; }
function redraw() {
  if (ui.army && !S.armies.includes(ui.army)) ui.army = null;
  const highlight = ui.army ? [...armyReach(S, ui.army).keys()].map(unkey) : [];
  drawMap($('map'), S.map, { state: S, sel: ui.sel, highlight, turn: P(S).kind === 'bot' ? -1 : S.cur });
  applyView($('map'), view);
  const p = P(S), civ = civOf(p);
  $('hud-sym').textContent = SYM[civ.sym];
  $('hud-sym').style.borderColor = civ.color;
  $('hud-name').textContent = civ.n + (p.kind === 'bot' ? ' · Bot' : '');
  const ev = curEvent();
  $('hud-round').textContent = `Runde ${S.round} · Bevölkerung ${popOf(S, S.cur)}/${worldPop(S)}` +
    (ev ? ` · ${ev.n}` : '');
  $('hud-sci').textContent = p.res.sci;
  $('hud-food').textContent = p.res.food + (p.foodDeficit ? ` (−${p.foodDeficit})` : '');
  $('hud-coins').textContent = p.res.coins; $('hud-power').textContent = powerOf(S, S.cur);
  const human = p.kind !== 'bot' && !S.over;
  ['a-tech', 'a-power', 'a-army', 'a-end'].forEach(id => $(id).disabled = !human);
  saveGame();
}
function fitMap(svg, v) {
  // Die viewBox umfasst die ganze Karte und wird vom Browser eingepasst –
  // Ansicht zurücksetzen zeigt also immer die komplette Karte.
  v.k = 1; v.x = 0; v.y = 0;
  applyView(svg, v);
}

function tapHex(r, c) {
  if (S.over || P(S).kind === 'bot') return;
  if (ui.army) {
    const e = moveArmy(S, ui.army, r, c);
    if (e) { toast(e); } else { ui.army = null; ui.sel = [r, c]; redraw(); return; }
  }
  ui.sel = [r, c]; redraw(); openTile(r, c);
}
function mp(a) { return 'Bewegung ' + String(a.mp).replace('.', ',') ; }
function openTile(r, c) {
  const pi = S.cur, p = P(S);
  const t = terrainAt(S, r, c);
  if (!t) return closeSheet();
  const city = cityAt(S, r, c), army = armyAt(S, r, c);
  const rows = [], handlers = [];
  const btn = (label, sub, cost, fn, off) => {
    const id = 'x' + (handlers.length + 1) + Math.random().toString(36).slice(2, 6);
    rows.push(`<button class="opt" id="${id}" ${off ? 'disabled' : ''}><span>${label}${sub ? `<small>${sub}</small>` : ''}</span><span class="cost">${cost || ''}</span></button>`);
    handlers.push([id, fn]);
  };
  let head = `<h3>${TERRAIN[t].name}</h3><p class="sub">Feld ${r}/${c} · Ertrag ${tileYieldAt(S, pi, r, c).map((n, i) => n + ['🔬', '🌾', '🪙'][i]).join(' ')}</p>`;

  if (city) {
    const owner = civOf(S.players[city.owner]);
    const wl = (S.wonders || []).filter(w => w.cityId === city.id);
    head = `<h3>${owner.n}${city.cap ? ' · Hauptstadt' : ''}</h3>
      <p class="sub">Bevölkerung ${city.pop} · Verteidigung ${defenseValue(S, city)}</p>` +
      (wl.length ? `<div class="wlist">${wl.map(w =>
        `<span class="wtag">◈ ${WONDER_BY_KEY[w.k].n} (Stufe ${w.lvl})</span>`).join('')}</div>` : '');
    if (city.owner === pi) {
      if (freeGrowthAvailable(S, pi, city))
        btn('Kostenlos wachsen', `auf ${city.pop + 1} · Verbundwerkstoffe`, 'gratis',
          () => { const e = growCity(S, pi, city, 'free'); e ? toast(e) : redraw(); openTile(r, c); });
      const pc = growPrice(S, pi, city);
      const perr = canGrowPaid(S, pi, city);
      btn('Bevölkerung wachsen', perr || `auf ${city.pop + 1}`, `${pc.food}🌾 ${pc.coins}🪙`,
        () => { const e = growCity(S, pi, city, 'paid'); e ? toast(e) : redraw(); openTile(r, c); }, !!perr);
      if (S.wo) {
        const wcost = wonderCost(S, pi);
        const full = wondersInCity(S, city).length >= 2;
        const any = availableWonders(S).some(w => !canBuildWonder(S, pi, city, w.k));
        btn('Weltwunder bauen', full ? 'diese Stadt hat schon zwei Wunder'
          : any ? `${wondersInCity(S, city).length}/2 in dieser Stadt`
            : 'nichts baubar (Münzen oder Stufenregel)', `${wcost}🪙`,
          () => wonderSheet(city), full || !any);
      }
      const ac = armyCost(S, pi);
      btn('Armee bauen', 'muss die Stadt noch verlassen', `${ac}🪙`,
        () => { const e = buildArmy(S, pi, city); e ? toast(e) : redraw(); openTile(r, c); },
        available(S, pi, 'coins') < ac || !!armyAt(S, r, c));
      if (slaveryUsable(p))
        btn('Bevölkerung opfern', city.sacrificed === S.round ? 'diese Runde schon geopfert' : 'Sklaverei', '+10🪙',
          () => { const e = sacrifice(S, pi, city); e ? toast(e) : redraw(); openTile(r, c); },
          city.pop < 2 || city.sacrificed === S.round);
      if (army && army.owner === pi)          // Armee steht in der Stadt und muss heraus
        btn('Armee hier bewegen', army.born === S.round ? 'muss die Stadt noch verlassen'
          : 'erreichbare Felder werden markiert', mp(army),
          () => { ui.army = army; closeSheet(); redraw(); toast('Zielfeld antippen'); }, army.mp <= 0);
    } else {
      const atk = attackersOn(S, pi, city).length;
      const sk = S.sieges[pi + '|' + city.id] || 0;
      rows.push(`<p class="sub">Deine Armeen in Reichweite: ${atk} · Angriffswert ${attackValue(S, pi, atk)}
        ${sk ? ` · Belagerung ${sk}/2` : ''}</p>`);
    }
  } else if (army) {
    const owner = civOf(S.players[army.owner]);
    head = `<h3>Armee · ${owner.n}</h3><p class="sub">Angriffswert ${powerOf(S, army.owner)} · ${mp(army)}</p>`;
    if (army.owner === pi)
      btn('Diese Armee bewegen', 'erreichbare Felder werden markiert', '',
        () => { ui.army = army; closeSheet(); redraw(); toast('Zielfeld antippen'); }, army.mp <= 0);
  } else {
    const cost = foundCost(S, pi, r, c), ferr = canFound(S, pi, r, c);
    const costLabel = cost === Infinity ? '—' : `${cost}🌾`;
    btn('Stadt gründen', ferr || 'Grundkosten + Distanz zur Hauptstadt (über passierbare Felder)', costLabel,
      () => { const e = foundCity(S, pi, r, c); e ? toast(e) : redraw(); closeSheet(); }, !!ferr);
    if (has(p, 'kolonialismus')) {
      const owned = S.players.some((_, i) => controlledTiles(S, i).has(key(r, c)));
      btn('Feld kaufen', owned ? 'nur herrenlose Felder' : 'Kolonialismus', '5🪙',
        () => { const e = buyTile(S, pi, r, c); e ? toast(e) : redraw(); openTile(r, c); }, owned);
    }
  }
  if (has(p, 'atomwaffen')) {
    // Atomwaffenproteste sperren den Einsatz dauerhaft – dann ist der Knopf auch aus
    const banned = evNukeBan(S, pi);
    btn('Atomschlag auf dieses Feld',
      banned ? 'durch Atomwaffenproteste dauerhaft gesperrt'
        : p.nuked ? 'diese Runde schon eingesetzt'
          : 'zerstört alle Armeen hier und ringsum, auch eigene', '☢︎',
      () => {
        const e = nuke(S, S.cur, r, c);
        toast(e || 'Atomschlag ausgeführt'); redraw(); openTile(r, c);
      }, p.nuked || banned);
  }
  if (has(p, 'rad') && !city)
    btn(roadLevel(S, r, c) >= 1 ? 'Eisenbahn bauen' : 'Straße bauen',
      roadLevel(S, r, c) >= 1 ? 'Bewegung kostenlos' : 'Bewegung ½ Punkt',
      (roadPrice(S, pi, r, c, roadLevel(S, r, c) >= 1 ? 2 : 1) ?? '–') + '🪙',
      () => doRoad(r, c), roadLevel(S, r, c) >= 2 || (roadLevel(S, r, c) >= 1 && !has(p, 'eisenbahn')));
  sheet(head + rows.join(''));
  handlers.forEach(([id, fn]) => { const el = $(id); if (el) el.onclick = fn; });
}
function doRoad(r, c) {
  const target = roadLevel(S, r, c) >= 1 ? 2 : 1;
  const e = buildRoad(S, S.cur, r, c, target);
  e ? toast(e) : toast(target === 2 ? 'Eisenbahn gebaut' : 'Straße gebaut');
  redraw();
}

function armySheet() {
  const pi = S.cur, mine = armiesOf(S, pi);
  if (!mine.length)
    return sheet(`<h3>Deine Armeen</h3><p class="sub">Du hast noch keine.
      Eigene Stadt antippen → <em>Armee bauen</em> (${armyCost(S, pi)} Münzen).</p>`);
  const rows = mine.map((a, i) => {
    const inCity = cityAt(S, a.r, a.c);
    const note = a.mp <= 0 ? 'diese Runde schon gezogen'
      : inCity && a.born === S.round ? 'muss die Stadt noch verlassen'
        : `auf ${TERRAIN[terrainAt(S, a.r, a.c)].name}`;
    return `<button class="opt" data-i="${i}" ${a.mp <= 0 ? 'disabled' : ''}>
      <span>Armee ${i + 1} · Feld ${a.r}/${a.c}<small>${note}</small></span>
      <span class="cost">${mp(a)}</span></button>`;
  }).join('');
  sheet(`<h3>Deine Armeen (${mine.length})</h3>
    <p class="sub">Angriffswert des Reiches: ${powerOf(S, pi)}. Antippen wählt die Armee aus,
    danach ein markiertes Feld antippen.</p>${rows}`);
  $('sheet-body').querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
    const a = mine[+b.dataset.i];
    ui.army = a; ui.sel = [a.r, a.c];
    closeSheet(); redraw(); toast('Zielfeld antippen');
  });
}

/* Kleine Symbolmarker: welche Reiche diese Technologie schon haben.
   Eigenes Reich mit Ring hervorgehoben, damit man sich sofort verortet. */
function ownerMarks(S, techKey, pi) {
  const marks = S.players.map((pl, i) => {
    if (!pl.techs[techKey] || pl.dead) return '';
    const civ = civOf(pl);
    const self = i === pi;
    return `<span class="owner-mark${self ? ' self' : ''}" style="color:${civ.color}"
      title="${civ.n}${self ? ' (du)' : ''}">${SYM[civ.sym]}</span>`;
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
  let h = '<div class="yield-panel"><h4 class="yhead">Ertrag nächster Zug</h4>';
  for (const r of b.rows)
    h += yieldRow(r.name, TERRAIN_GLYPH[r.key] || '▪', TERRAIN[r.key].color, r.count, r.y);
  for (const e of (b.extra || []))
    h += yieldRow(e.name, e.glyph || '✦', '#c8a86a', e.count, e.y);
  h += yieldRow('Bevölkerung', '👥', '#c8b98a', b.pop.count, b.pop.y, { cls: 'pop' });
  h += yieldRow('Summe', '∑', '#6b5d47', null, b.total, { cls: 'sum' });
  // Vorschau: kein Einkommen, sondern was die Armeen zu Zugende erbeuten (Wikinger)
  for (const e of (b.preview || []))
    h += yieldRow(e.name, e.glyph || '⚔︎', '#b08a4a', null, e.y, { cls: 'prev' });
  h += '</div>';
  return h;
}
/* ------------------------------------------------------------------ Technologien */
function techModal() {
  const pi = S.cur, p = P(S);
  const others = S.players.filter((pl, i) => i !== pi && !pl.dead)
    .map(pl => `<span style="color:${civOf(pl).color}">${SYM[civOf(pl).sym]}</span> ${civOf(pl).n}`).join(' · ');
  let grid = others
    ? `<p class="sub" style="margin:-2px 0 10px">Symbole an einer Technologie zeigen, wer sie schon hat: ${others} · dein Reich ist umrandet.</p>`
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
        const eff = dead ? 'obsolet – seit der Moderne nicht mehr nutzbar' : t.e;
        grid += `<button class="tech ${owned ? 'owned' : avail ? 'avail' : 'locked'}${dead ? ' obsolete' : ''}"
          ${can ? `data-tech="${t.k}"` : 'disabled'}><span class="c">${owned ? '✓' : cost}</span>
          <b>${t.n}</b><span class="eff">${eff}</span>${ownerMarks(S, t.k, pi)}</button>`;
      }
      grid += '</div>';
    }
  }
  grid += '</div>';
  const sing = singularityReady(p), sc = techCost(S, pi, SINGULARITY);
  grid += `<button class="tech ${p.techs.singularitaet ? 'owned' : sing ? 'avail' : 'locked'}" style="margin-top:10px"
      ${sing && available(S, pi, 'sci') >= sc && !p.techs.singularitaet ? 'data-tech="singularitaet"' : 'disabled'}>
      <span class="c">${sc}</span><b>Singularität</b><span class="eff">${SINGULARITY.e}</span></button>`;
  // Griechenland "Freie Forschung": eine verfügbare Tech bis Industrialisierung gratis
  const ft = freeTechOptions(S, pi);
  if (ft.length) {
    grid += '<p class="sub" style="margin-top:14px">Freie Forschung (1× pro Runde, kostenlos)</p>';
    grid += ft.map(t => `<button class="tech avail" data-freetech="${t.k}">
      <span class="c">gratis</span><b>${t.n}</b><span class="eff">${t.e}</span></button>`).join('');
  }
  const bp = backPickOptions(S, pi);
  if (bp.length) {
    grid += `<p class="sub" style="margin-top:14px">Rückschau: eine Technologie aus ${FIELDS[backPick(p).f]}, früheres Zeitalter, kostenlos</p>`;
    grid += bp.map(t => `<button class="tech avail" data-backtech="${t.k}">
      <span class="c">gratis</span><b>${t.n}</b><span class="eff">${t.e}</span></button>`).join('');
  }
  const cop = copyableTechs(S, pi);
  if (cop.length) {
    const anyFree = internetAvailable(S, pi) && cop.some(o => o.freeOk);
    grid += `<p class="sub" style="margin-top:14px">Technologien kopieren${
      anyFree ? ' · 1× gratis per Internet' : ''}</p>`;
    cop.slice(0, 40).forEach(o => {
      // je Technologie ggf. zwei Knöpfe: bezahlt und/oder gratis
      const buttons = [];
      if (o.paidCoins != null)
        buttons.push(`<button class="tech avail" data-copy="${o.tech.k}" data-mode="paid">
          <span class="c">${o.paidCoins}🪙</span><b>${o.tech.n}</b>
          <span class="eff">${o.tech.e}</span>${ownerMarks(S, o.tech.k, pi)}</button>`);
      if (o.freeOk)
        buttons.push(`<button class="tech avail" data-copy="${o.tech.k}" data-mode="free">
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
  modal(`Technologien · ${available(S, pi, 'sci')} Wissenschaft verfügbar`, layout);
  $('overlay').classList.add('wide');
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
  const pi = S.cur, price = powerPrice(S, pi), maxN = Math.floor(available(S, pi, 'coins') / price);
  let h = `<h3>Macht kaufen</h3><p class="sub">${price} Münzen = 1 Macht · aktuell ${P(S).power} Macht.
    Zu Zugbeginn verlierst du ${has(P(S), 'panzer') ? '1/4' : has(P(S), 'stahl') ? '1/3' : '1/2'} davon.</p>`;
  [1, 5, maxN].forEach((n, i) => {
    if (n <= 0 || (i === 2 && maxN <= 5)) return;
    h += `<button class="opt" data-n="${n}"><span>+${n} Macht${i === 2 ? '<small>alles ausgeben</small>' : ''}</span>
      <span class="cost">${n * price}🪙</span></button>`;
  });
  if (maxN <= 0) h += '<p class="sub">Nicht genug Münzen.</p>';
  sheet(h);
  $('sheet-body').querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
    const e = buyPower(S, S.cur, +b.dataset.n); e ? toast(e) : null; redraw(); powerSheet();
  });
}
function logModal() {
  const h = S.log.slice(-260).map(l => `<div class="logline ${l.c}">${l.m}</div>`).join('');
  modal('Protokoll', h);
  const b = $('ov-body'); b.scrollTop = b.scrollHeight;
}

/* ------------------------------------------------------------------ Zugende & Bots */
function endHumanTurn() {
  const warn = pendingWarnings(S, S.cur);
  if (warn.length && !ui.confirmedEnd) {
    ui.confirmedEnd = true;
    toast(warn[0] + ' Nochmal tippen zum Bestätigen.');
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
    ? entries.map(l => `<div class="logline ${l.c}">${l.m}</div>`).join('')
    : '<div class="logline info">Keine Aktionen in dieser Runde.</div>';
  ui.botLock = true;                   // Sheet ist jetzt gesperrt: nur „Weiter" führt weiter
  sheet(`<h3>${civOf(p).n} (Bot)</h3><p class="sub">Runde ${S.round}</p>${lines}
    <button class="btn wide" id="bot-next">Weiter</button>`);
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
  const w = S.over.winner;
  modal('Spielende', `<p style="font-family:var(--serif);font-size:22px;margin:0 0 6px">
    ${civOf(S.players[w]).n} gewinnt.</p><p class="sub">${S.over.how}</p>
    <button class="btn wide" onclick="store('hochciv.save',null);location.reload()">Zurück zum Menü</button>`);
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
      ? `<div class="evbox"><b>Ereignis: ${ev.n}</b><p>${ev.e}</p>
         ${hasWonder(S, pi, 'palast') ? '<p>Der Apostolische Palast schützt dich davor.</p>' : ''}</div>`
      : `<div class="evbox"><b>Kein Ereignis in dieser Runde</b><p>Der Spaltenwürfel ging ins Leere.</p></div>`;
    if (hasWonder(S, pi, 'orakel')) {
      const nx = peekNextEvent(S);
      const nn = nx && nx.k ? EVENT_BY_KEY[nx.k].n : 'keines';
      h += `<p class="sub">Das Orakel sieht für die nächste Runde: <b>${nn}</b></p>`;
    }
    if ((S.barbs || []).length)
      h += `<p class="sub">Barbaren belagern ${S.barbs.length} Stadt/Städte.</p>`;
    if (S.nukeBan) h += '<p class="sub">Atomwaffenproteste: Atomwaffen sind gesperrt.</p>';
  }
  if (S.wo) {
    const c = wonderCounts(S, pi);
    h += `<p class="sub" style="margin-top:12px">Deine Weltwunder — Stufe 1: ${c[1]} · Stufe 2: ${c[2]} · Stufe 3: ${c[3]}
      · nächstes Wunder ${wonderCost(S, pi)} Münzen</p>`;
    h += '<div class="wlist">' + (wondersOf(S, pi).map(w =>
      `<span class="wtag">${WONDER_BY_KEY[w.k].n}${w.cityId == null ? ' (freistehend)' : ''}</span>`).join('')
      || '<span class="sub">noch keins</span>') + '</div>';
    for (const lvl of [1, 2, 3]) {
      const pool = poolOf(S, lvl);
      if (!pool.length) continue;
      h += `<p class="sub" style="margin-top:10px">Verfügbar, Stufe ${lvl}</p>`;
      h += pool.map(k => `<div class="tech ${wonderLevelOk(S, pi, lvl) ? 'avail' : 'locked'}">
        <span class="c">${WONDER_BY_KEY[k].lvl}</span><b>${WONDER_BY_KEY[k].n}</b>
        <span class="eff">${WONDER_BY_KEY[k].e}</span></div>`).join('');
    }
    const others = S.players.map((pl, i) => i).filter(i => i !== pi && wondersOf(S, i).length);
    if (others.length) {
      h += '<p class="sub" style="margin-top:10px">Andere Reiche</p>';
      h += others.map(i => `<p style="font-size:12px;margin:2px 0">
        <b style="color:${civOf(S.players[i]).color}">${civOf(S.players[i]).n}</b>: ` +
        wondersOf(S, i).map(w => WONDER_BY_KEY[w.k].n).join(', ') + '</p>').join('');
    }
  }
  if (!S.ev && !S.wo) h = '<p class="sub">Dieses Spiel läuft ohne Ereignisse und ohne Weltwunder.</p>';
  modal('Welt', h);
}
/* Weltwunder in einer Stadt bauen */
function wonderSheet(city) {
  const pi = S.cur;
  const cost = wonderCost(S, pi);
  let h = `<h3>Weltwunder bauen</h3>
    <p class="sub">Kosten ${cost} Münzen · diese Stadt hat ${wondersInCity(S, city).length}/2 Wunder ·
    verfügbar: ${available(S, pi, 'coins')} Münzen</p>`;
  const list = availableWonders(S);
  const rows = list.map(w => {
    const err = canBuildWonder(S, pi, city, w.k);
    return `<button class="opt" data-w="${w.k}" ${err ? 'disabled' : ''}>
      <span>${w.n}<small>Stufe ${w.lvl} · ${w.e}${err ? ' · ' + err : ''}</small></span>
      <span class="cost">${cost}🪙</span></button>`;
  }).join('');
  sheet(h + (rows || '<p class="sub">Keine Wunder verfügbar.</p>'));
  $('sheet-body').querySelectorAll('[data-w]').forEach(b => b.onclick = () => {
    const e = buildWonder(S, S.cur, city, b.dataset.w);
    if (e) return toast(e);
    redraw();
    if (S.over) { closeSheet(); return gameOver(); }
    if (freePick(P(S))) return freePickModal();
    openTile(city.r, city.c);
  });
}
/* Städte füttern: Gentechnik (Wissenschaft) und Massenmedien (Münzen), 1:1 */
function feedSheet() {
  const pi = S.cur, p = P(S);
  const src = feedSources(S, pi);
  if (!src.length) return toast('Dafür braucht es Gentechnik oder Massenmedien.');
  let h = `<h3>Städte füttern</h3><p class="sub">1:1 in Nahrung. ` +
    (p.foodDeficit ? `Offenes Nahrungsdefizit: <b>${p.foodDeficit}</b>. ` : 'Kein Defizit – zusätzliche Nahrung ist möglich. ') +
    `Nahrung jetzt: ${p.res.food}</p>`;
  src.forEach(x => {
    const steps = [...new Set([p.foodDeficit || 0, 1, 5, x.have].filter(n => n > 0 && n <= x.have))];
    h += `<p class="sub" style="margin-top:8px">${x.n} (${x.have} vorhanden)</p>`;
    steps.forEach(n => {
      h += `<button class="opt" data-k="${x.kind}" data-n="${n}"><span>${n} ${x.n} geben</span>
        <span class="cost">+${n}🌾</span></button>`;
    });
  });
  sheet(h);
  $('sheet-body').querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
    const e = feed(S, S.cur, b.dataset.k, +b.dataset.n);
    if (e) return toast(e);
    redraw(); feedSheet();
  });
}
/* Auswahl kostenloser Technologien (Bibliothek, Oxford, Griechenland) */
function freePickModal() {
  const pi = S.cur, p = P(S);
  const pick = freePick(p);
  const list = pick ? freePickOptions(S, pi) : backPickOptions(S, pi);
  const title = pick ? pick.why : 'Rückschau';
  if (!list.length) { closeModal(); return; }
  const h = `<p class="sub">${pick ? `Noch ${pick.n} kostenlose Technologie(n).` :
    'Eine beliebige Technologie desselben Feldes aus einem früheren Zeitalter, kostenlos.'}</p>` +
    list.map(t => `<button class="tech avail" data-free="${t.k}">
      <span class="c">gratis</span><b>${t.n}</b><span class="eff">${t.e}</span></button>`).join('');
  modal(title, h);
  $('ov-body').querySelectorAll('[data-free]').forEach(b => b.onclick = () => {
    const e = pick ? useFreePick(S, S.cur, b.dataset.free) : useBackPick(S, S.cur, b.dataset.free);
    if (e) return toast(e);
    redraw();
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
  toast(ev ? `${civOf(p).n} ist am Zug · Ereignis: ${ev.n}` : civOf(p).n + ' ist am Zug');
  if (p.foodDeficit > 0 && canFeed(p)) feedSheet();
  else if (freePick(p)) freePickModal();
}

/* ------------------------------------------------------------------ Aufbau */
function setupScreen() {
  const sel = $('setup-map');
  // MAPS[0] ist die Originalkarte – damit ist sie im Menü vorausgewählt.
  sel.innerHTML = MAPS.map((m, i) => `<option value="${i}">${m.name}</option>`).join('') +
    (customMap ? '<option value="eigene">Eigene Karte</option>' : '');
  sel.value = '0';
  $('setup-evmode').innerHTML = EVENT_MODES.map(m => `<option value="${m.k}">${m.n}</option>`).join('');
  $('setup-diff').innerHTML = DIFFICULTIES.map(x =>
    `<option value="${x.k}"${x.k === 'prinz' ? ' selected' : ''}>${x.n}</option>`).join('');
  const evBox = $('setup-events');
  evBox.onchange = () => { $('setup-evmode-row').hidden = !evBox.checked; };
  $('setup-evmode-row').hidden = !evBox.checked;
  const list = $('setup-list'); list.innerHTML = '';
  CIVS.forEach((civ, i) => {
    const d = document.createElement('div'); d.className = 'slot';
    d.innerHTML = `<h3>${SYM[civ.sym]} ${civ.n}</h3>
      <div class="seg" data-civ="${civ.k}">
        <button data-kind="human" class="${i === 0 ? 'on' : ''}">Mensch</button>
        <button data-kind="bot" class="${i === 0 ? '' : 'on'}">Bot</button>
      </div>
      <label class="row"><span>Fähigkeit</span>
        <select data-abil="${civ.k}">${civ.abilities.map((a, j) =>
          `<option value="${a.k}">${j === 0 ? a.n : `Alternative ${j + 1}: ${a.n}`}</option>`).join('')}
        </select></label>
      <p class="abil"></p>`;
    list.appendChild(d);
    const sela = d.querySelector('[data-abil]');
    const note = d.querySelector('.abil');
    const paint = () => {
      const kind = d.querySelector('[data-kind].on').dataset.kind;
      sela.disabled = kind === 'bot';
      const a = civ.abilities.find(x => x.k === sela.value) || civ.abilities[0];
      note.textContent = kind === 'bot' ? 'Bots erhalten keine Zivilisationsfähigkeit.' : a.e;
    };
    sela.onchange = paint;
    d.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => {
      d.querySelectorAll('[data-kind]').forEach(x => x.classList.toggle('on', x === b));
      paint(); refreshStart();
    });
    paint();
  });
  refreshStart();
}
function setupConfig() {
  const diff = $('setup-diff').value;    // ein Schwierigkeitsgrad für alle Bots
  return CIVS.map((civ, i) => {
    const slot = $('setup-list').children[i];
    const kind = slot.querySelector('[data-kind].on').dataset.kind;
    const ability = slot.querySelector('[data-abil]').value;
    return { civ: civ.k, kind, diff, ability };
  });
}
function refreshStart() {
  const cfg = setupConfig(), sel = $('setup-start');
  sel.innerHTML = cfg.map((p, i) => `<option value="${i}">${CIVS[i].n}${p.kind === 'bot' ? ' (Bot)' : ''}</option>`).join('');
  const firstHuman = cfg.findIndex(p => p.kind === 'human');
  sel.value = Math.max(0, firstHuman);
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
function drawEditor() {
  drawMap($('ed-map'), editMap, {});
  applyView($('ed-map'), edView);
}
function edTap(r, c) {
  if (r < 0 || r >= editMap.rows.length) return;
  if (c < 0 || c >= editMap.rows[r].length) return;
  if (edTool.startsWith('cap:')) {
    const civ = edTool.slice(4);
    if (!TERRAIN[editMap.rows[r][c]].land) return toast('Hauptstädte nur auf Land.');
    editMap.capitals[civ] = [r, c];
  } else {
    const row = editMap.rows[r];
    if (c >= row.length) return;
    editMap.rows[r] = row.slice(0, c) + edTool + row.slice(c + 1);
  }
  drawEditor();
}

/* ------------------------------------------------------------------ Start */
function boot() {
  customMap = load('hochciv.map');
  const saved = load('hochciv.save');
  $('m-continue').hidden = !saved;

  $('m-new').onclick = () => { show('screen-setup'); setupScreen(); };
  $('m-editor').onclick = () => { show('screen-editor'); editorScreen(); setTimeout(() => fitMap($('ed-map'), edView), 30); };
  $('m-rules').onclick = () => rulesModal();
  $('m-continue').onclick = () => { S = load('hochciv.save'); startGameScreen(); };
  $('m-load').onclick = () => upload(txt => {
    try { S = JSON.parse(txt); saveGame(); startGameScreen(); toast('Spielstand geladen'); }
    catch (e) { toast('Datei nicht lesbar'); }
  });
  document.querySelectorAll('[data-back]').forEach(b => b.onclick = () => show('screen-menu'));
  $('ov-close').onclick = closeModal;
  $('overlay').onclick = e => { if (e.target === $('overlay')) closeModal(); };
  $('sheet-grip').onclick = closeSheet;
  $('sheet-close').onclick = closeSheet;

  $('setup-go').onclick = () => {
    const players = setupConfig();
    if (!players.some(p => p.kind === 'human')) return toast('Mindestens eine menschliche Zivilisation.');
    const pick = $('setup-map').value;
    const map = pick === 'eigene' ? customMap : MAPS[+pick];
    S = newGame({
      players, map, startPlayer: +$('setup-start').value,
      events: $('setup-events').checked, eventMode: $('setup-evmode').value,
      wonders: $('setup-wonders').checked,
    });
    startGameScreen();
  };
  $('a-tech').onclick = techModal;
  $('a-power').onclick = powerSheet;
  $('a-army').onclick = armySheet;
  $('a-info').onclick = worldModal;
  $('hud-feed').onclick = () => { if (P(S).kind !== 'bot' && !S.over) feedSheet(); };
  $('a-log').onclick = logModal;
  $('a-end').onclick = endHumanTurn;
  $('g-menu').onclick = () => {
    modal('Menü', `<button class="btn wide" id="mm-rules">Regeln &amp; Technologien</button>
      <button class="btn wide" id="mm-export">Spielstand exportieren</button>
      <button class="btn wide" id="mm-quit">Spiel beenden</button>`);
    $('mm-rules').onclick = rulesModal;
    $('mm-export').onclick = () => download('hochzeiv-spielstand.json', JSON.stringify(S));
    $('mm-quit').onclick = () => { store('hochciv.save', null); location.reload(); };
  };
  $('ed-save').onclick = () => {
    customMap = editMap; store('hochciv.map', editMap);
    toast('Karte gespeichert'); show('screen-menu');
  };
  $('ed-export').onclick = () => download('hochzeiv-karte.json', JSON.stringify(editMap, null, 1));
  $('ed-import').onclick = () => upload(txt => { editMap = JSON.parse(txt); drawEditor(); toast('Karte geladen'); });
  $('ed-reset').onclick = () => { editMap = JSON.parse(JSON.stringify(DEFAULT_MAP)); drawEditor(); };
  $('ed-size').onclick = () => {
    const r = prompt('Zeilen', editMap.rows.length), c = prompt('Spalten', editMap.rows[0].length);
    if (!r || !c) return;
    const R = Math.max(4, Math.min(40, +r)), C = Math.max(4, Math.min(40, +c));
    const out = [];
    for (let i = 0; i < R; i++) out.push(((editMap.rows[i] || '').padEnd(C, 'M')).slice(0, C));
    editMap.rows = out; drawEditor();
  };

  attachGestures($('map-host'), $('map'), view, tapHex);
  attachGestures($('ed-host'), $('ed-map'), edView, edTap);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
}
function startGameScreen() {
  show('screen-game');
  redraw();
  setTimeout(() => { fitMap($('map'), view); }, 30);
  if (P(S).kind === 'bot') setTimeout(runBots, 400);
  else setTimeout(humanTurnStart, 60);
}
function rulesModal() {
  modal('Kurzregeln', `
    <p class="sub">Zugablauf</p>
    <ol style="font-size:14px;line-height:1.5;padding-left:20px">
      <li>Einkommen aus allen Feldern rund um deine Städte plus Bevölkerung.</li>
      <li>Macht halbiert sich (aufgerundet).</li>
      <li>Aktionen in beliebiger Reihenfolge, beliebig oft.</li>
      <li>Kampf: Angriff = Macht je Armee, Verteidigung = Bevölkerung + benachbarte Armeen.
        Zwei Züge in Folge stärker → Stadt erobert.</li>
      <li>Sieg: Singularität · 2/3 der Weltbevölkerung (UN 1/2, Theologie 3/5) ·
        gegnerische Hauptstadt · Weltwunder der Stufe 3.</li>
    </ol>
    <p class="sub">Ressourcen gelten nur für den laufenden Zug – nur Macht bleibt liegen.
    2 Münzen zählen als 1 Nahrung oder 1 Wissenschaft.</p>
    <p class="sub">Die Nahrungsproduktion darf nicht negativ werden: Wachstum wird blockiert,
    sobald das Einkommen dadurch unter 0 fiele. Gentechnik (Wissenschaft) und Massenmedien
    (Münzen) heben die Grenze auf – sie füttern zu Zugbeginn 1:1 und sind kein
    allgemeiner Umtausch.</p>
    <p class="sub">Geländeerträge je Feld</p>
    <table style="width:100%;font-size:13px;border-collapse:collapse">
      <tr style="color:var(--ink-soft);font-size:11px"><th align="left">Feld</th><th>🔬</th><th>🌾</th><th>🪙</th></tr>
      ${Object.values(TERRAIN).map(t => `<tr style="border-top:1px solid var(--rule)">
        <td>${t.name}</td>${t.yield.map(n => `<td align="center">${n || '·'}</td>`).join('')}</tr>`).join('')}
      <tr style="border-top:1px solid var(--rule)"><td>Stadt (je Bevölkerung)</td>
        <td align="center">1</td><td align="center">−1</td><td align="center">1</td></tr>
    </table>
    <p class="sub">Zivilisationen — je drei wählbare Fähigkeiten (Bots haben keine)</p>
    ${CIVS.map(c => `<p style="font-size:13px;margin:6px 0"><b>${SYM[c.sym]} ${c.n}</b><br>` +
      c.abilities.map((a, j) => `<span style="color:var(--ink-soft)">${j === 0 ? 'Grund' : 'Alt. ' + (j + 1)}:</span> ${a.e}`).join('<br>') +
      '</p>').join('')}
    <p class="sub">Weltwunder (Erweiterung)</p>
    <p style="font-size:13px;margin:4px 0">Kosten 10/20/30/40 … für das 1./2./3./4. Wunder.
      Stufe 2 muss seltener sein als Stufe 1, Stufe 3 seltener als Stufe 2. Je Stadt zwei Wunder.
      Ein Wunder der Stufe 3 gewinnt zu Beginn des nächsten Zuges.</p>
    <p class="sub">Ereignisse (Erweiterung)</p>
    <p style="font-size:13px;margin:4px 0">Zu Rundenbeginn wird gewürfelt: Zeile, dann Spalte.
      Hart trifft jede Runde, leicht etwa jede zweite. Bots sind nie betroffen.</p>`);
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
