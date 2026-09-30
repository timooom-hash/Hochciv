/* Messreihen mit der KI (nur für die Entwicklung, gehört nicht zur App).

   Die KI (js/ki.js) wird in vollen Partien gegen Bots oder gegen sich selbst gespielt –
   Plättchenkarte samt Legephase, wie im Spiel. Ausgegeben werden Siege, Siegarten, der
   Median der Endrunde, wie oft der Startspieler gewinnt und die Rechenzeit je KI-Zug.
   Jede Zahl in ANNAHMEN.md zur KI lässt sich hiermit nachrechnen.

   node tools_ki.js duell   [n] [diff=prinz] [stufe=schwer] [events] [wonders]
        1 gegen 1, KI gegen Bot, abwechselnd beginnend
   node tools_ki.js vier    [n] [diff=prinz] [stufe=schwer] [events] [wonders]
        eine KI gegen drei Bots, der Platz der KI wandert
   node tools_ki.js stufen  [n] [a=schwer] [b=leicht] [reiche=2] [events] [wonders]
        gepaart: jeder Startwert zweimal, die Stufen tauschen die Plätze – so hebt sich der
        Vorteil des Startspielers heraus
   node tools_ki.js selbst  [n] [reiche=2] [stufe=schwer] [events] [wonders]
        KI gegen KI, dazu: in welcher Runde und wie die Partien enden

   n ist die Zahl der Partien (bei „stufen" die Zahl der Paare). Die Partien sind aus ihren
   Startwerten reproduzierbar: gleiche Befehlszeile, gleiche Zahlen.               */
const fs = require('fs'), vm = require('vm');
for (const f of ['js/data.js', 'js/civs.js', 'js/i18n.js', 'js/hex.js', 'js/tiles.js', 'js/engine.js',
  'js/expansion.js', 'js/bots.js', 'js/ki.js'])
  vm.runInThisContext(fs.readFileSync(__dirname + '/' + f, 'utf8'), { filename: f });

const jetzt = () => Number(process.hrtime.bigint()) / 1e6;
const args = process.argv.slice(2);
const modus = args[0] || 'duell';
const N = +(args[1] || 20);
const opt = (k, d) => { const x = args.find(a => a.startsWith(k + '=')); return x ? x.split('=')[1] : d; };
const flag = k => args.includes(k);
const CIVK = CIVS.map(c => c.k);

/* Aufbau wie im Spiel: Plättchenplan, Vorabwurf, jeder Platz legt (KI selbst, Bots
   zufällig), dann newGame mit Karte, Verfügbarkeiten und Wunderstapel. */
function partie(players, seed, start) {
  const cfg = {
    seed, players, duel: players.length === 2, events: flag('events'), eventMode: 'hard',
    wonders: flag('wonders'), startPlayer: start,
  };
  const plan = tilePlan(players.map(p => p.civ), seed);
  const setup = rollSetup(Object.assign({}, cfg));
  const rnd = mapRng(seed + 12345);
  plan.seats.forEach(seat => {
    const pl = players[seat.idx];
    if (pl.kind === 'ki') { if (kiPlaceSeat(plan, seat, pl, setup)) botPlaceSeat(plan, seat, rnd); }
    else botPlaceSeat(plan, seat, rnd);
  });
  Object.assign(cfg, { map: tileMap(plan), avail: setup.avail, wpool: setup.wpool });
  const S = newGame(cfg);
  const zeiten = [], fehler = [];
  let guard = 0;
  while (!S.over && guard++ < 400) {
    const pi = S.cur, p = S.players[pi];
    try {
      if (p.kind === 'ki') { const t0 = jetzt(); kiTurn(S, pi); zeiten.push(jetzt() - t0); }
      else botTurn(S, pi);
    } catch (e) { fehler.push(`Runde ${S.round}, ${p.civ}: ${e.message}`); break; }
    if (S.over) break;
    endTurn(S);
  }
  return { S, zeiten, fehler };
}
const art = S => S.over ? S.over.how.split(' (')[0].split(' ·')[0] : 'offen';
function bericht(titel, laeufe, wer) {
  const siege = {}, arten = {}, runden = [], zeiten = [];
  let start = 0, entschieden = 0, fehler = 0;
  for (const { S, zeiten: z, fehler: f } of laeufe) {
    zeiten.push(...z);
    if (f.length) { fehler++; console.log('   Fehler: ' + f[0]); }
    runden.push(S.over ? S.round : 999);
    arten[art(S)] = (arten[art(S)] || 0) + 1;
    if (!S.over) continue;
    entschieden++;
    const ws = S.over.winners || [S.over.winner];
    if (ws.includes(S.startIdx)) start++;
    for (const w of ws) { const k = wer(S, w); siege[k] = (siege[k] || 0) + 1 / ws.length; }
  }
  runden.sort((a, b) => a - b); zeiten.sort((a, b) => a - b);
  const q = f => zeiten.length ? zeiten[Math.min(zeiten.length - 1, Math.floor(f * zeiten.length))].toFixed(0) : '–';
  console.log(`${titel}: ${laeufe.length} Partien · Siege ${Object.entries(siege).map(([k, v]) => `${k} ${+v.toFixed(1)}`).join(', ')}` +
    ` · Startspieler gewinnt ${start}/${entschieden} · Endrunde Median ${runden[runden.length >> 1]}` +
    ` · ${Object.entries(arten).map(([k, v]) => `${k} ${v}`).join(', ')}` +
    ` · KI-Zug ms Median ${q(0.5)}, 90 % ${q(0.9)}, max ${q(1)}` + (fehler ? ` · ${fehler} mit Fehler` : ''));
}
const kiSitz = (c, stufe, g, i) => ({ civ: c, kind: 'ki', kiLevel: stufe, ability: CIV_BY_KEY[c].abilities[(g + i) % 3].k });
const wer = (S, i) => S.players[i].kind === 'ki' ? 'KI' : 'Bot';

if (modus === 'duell') {
  const diff = opt('diff', 'prinz'), stufe = opt('stufe', 'schwer'), l = [];
  for (let g = 0; g < N; g++) {
    const a = CIVK[g % 4], b = CIVK[(g + 1 + (g >> 2)) % 4];
    const ki = kiSitz(a, stufe, g, 0), bot = { civ: b, kind: 'bot', diff };
    const players = g % 2 ? [ki, bot] : [bot, ki];
    l.push(partie(players, 3000 + g, (g >> 1) % 2));
  }
  bericht(`Duell KI (${stufe}) gegen Bot (${diff})`, l, wer);
} else if (modus === 'vier') {
  const diff = opt('diff', 'prinz'), stufe = opt('stufe', 'schwer'), l = [];
  for (let g = 0; g < N; g++) {
    const players = CIVK.map((c, i) => i === g % 4 ? kiSitz(c, stufe, g, i) : { civ: c, kind: 'bot', diff });
    l.push(partie(players, 1000 + g, (g >> 2) % 4));
  }
  bericht(`1 KI (${stufe}) gegen 3 Bots (${diff})`, l, wer);
} else if (modus === 'stufen') {
  const A = opt('a', 'schwer'), B = opt('b', 'leicht'), n = +opt('reiche', 2), l = [];
  for (let g = 0; g < N; g++) for (const tausch of [false, true]) {
    const players = [];
    for (let i = 0; i < n; i++) players.push(kiSitz(CIVK[(g + i) % 4], ((i % 2 === 0) !== tausch) ? A : B, g, i));
    l.push(partie(players, 11000 + g, g % n));
  }
  bericht(`Stufen ${A} gegen ${B}, ${n} Reiche, gepaart`, l, (S, i) => S.players[i].kiLevel);
} else if (modus === 'selbst') {
  const n = +opt('reiche', 2), stufe = opt('stufe', 'schwer'), l = [];
  for (let g = 0; g < N; g++) {
    const players = [];
    for (let i = 0; i < n; i++) players.push(kiSitz(CIVK[(g + i) % 4], stufe, g * 7, i));
    l.push(partie(players, 9000 + g * 13, g % n));
  }
  const nachRunde = {};
  l.forEach(({ S }) => { const k = `${art(S)} in Runde ${S.round}`; nachRunde[k] = (nachRunde[k] || 0) + 1; });
  bericht(`KI gegen KI (${stufe}), ${n} Reiche`, l, (S, i) => 'Platz ' + S.players[i].slot);
  console.log('   ' + Object.entries(nachRunde).sort((a, b) => +a[0].split('Runde ')[1] - +b[0].split('Runde ')[1])
    .map(([k, v]) => `${k}: ${v}`).join(' · '));
} else {
  console.log('Unbekannter Modus. Siehe Kopf der Datei.');
  process.exit(1);
}
