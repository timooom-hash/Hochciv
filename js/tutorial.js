/* Hochzeivilization – Tutorial als geführtes Übungsspiel auf Schienen.

   Läuft in der normalen Spieloberfläche: echte Karte, echte Kopfzeile, echte
   Aktionsleiste. Unter der Karte erklärt ein Panel, was zu tun ist, und sagt jeweils
   genau, wo man tippen muss.

   Deterministisch: fester Startwert, und die verfügbaren Technologien des Spielers werden
   je Schritt gesetzt statt gewürfelt. Der Spieler kann nur die vorgesehenen Aktionen
   ausführen (tutAllow → Aktionsleiste, Aktionsblatt, Technologiebogen, Zugziel), damit die
   Partie bis zum Ende des Tutorials genau denselben Verlauf nimmt. Anschauen und
   Kartenerkunden bleibt jederzeit frei.

   Zahlen im Text kommen immer aus dem laufenden Spielstand, nie aus einer Textkopie. */

const TUT_SEED = 20250817;
/* Feste Würfelfolge. Solange das Tutorial läuft, zieht d6() seine Werte hier heraus –
   damit sind auch die Bot-Züge auf Schienen und jeder Durchlauf ist identisch. Jede Zahl von
   1 bis 6 kommt vor – sonst könnten die Auswürfel-Schleifen im Kreis laufen. Diese Folge ist
   aus mehreren Kandidaten die, mit der die Beispielpartie sauber aufgeht: die Bots wachsen
   und siedeln sichtbar, Griechenland belagert die Grenzstadt, und die Belagerung bricht am
   Ende, wenn der Spieler Mauern, Burgenbau und Macht genommen hat. */
const TUT_DICE = [3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2];
function tutNextDie() {
  if (typeof ui === 'undefined' || !ui || !ui.tut) return null;
  // Ein Schritt kann die nächsten Würfe vorgeben (dice), damit z. B. die Technologie des
  // nächsten Zeitalters wirklich ausgewürfelt wird und nicht heimlich gesetzt werden muss.
  if (ui.tut.pre && ui.tut.pre.length) return ui.tut.pre.shift();
  const v = TUT_DICE[(ui.tut.die || 0) % TUT_DICE.length];
  ui.tut.die = (ui.tut.die || 0) + 1;
  return v;
}
const RU = () => S.players.findIndex(p => p.civ === 'russland');
const tutP = () => S.players[RU()];
const tutRes = () => tutP().res;
const tutCap = () => capitalOf(S, RU());
const cityOn = (r, c) => cityAt(S, r, c);
const tutSiegeCity = () => ui.tutSiege && S.cities.find(c => c.id === ui.tutSiege.cityId);
const tutSiegeArmy = () => ui.tutSiege && S.armies.find(a => a.id === ui.tutSiege.armyId);
// Startverfügbarkeit wie im Beispielspiel: in Forschung nur Schrift
const TUT_START_AVAIL = ['schrift', 'fischerei', 'rad', 'keramik',
  'eisenverarbeitung', 'belagerung', 'stadtmauern', 'demokratie'];
// Die Felder, auf denen im Tutorial gegründet wird
const TUT_CITY_1 = [3, 12];
const TUT_CITY_2 = [6, 13];
const TUT_CITY_3 = [7, 15];
const TUT_ARMY_TO = [5, 12];
/* Das Feld neben Griechenlands Hauptstadt, von dem aus die Armee sie bedroht.
   Gemessen: von 5/12 aus ist bei 3 Bewegungspunkten NUR dieses Feld erreichbar (Kosten
   genau 3) – die anderen Nachbarn sind Meer oder zu weit. Deshalb eine Rückfallebene:
   sollte es einmal belegt oder unerreichbar sein, nimmt tutStrikeSpot das nächstbeste
   erreichbare Feld, das die Hauptstadt noch bedroht. */
const TUT_STRIKE = [8, 11];
/* Die vier Felder, die im Tutorial gepflastert werden: sie verbinden alle drei übrigen
   Städte mit der Hauptstadt. Gemessen: vier Straßen für vier Münzen ergeben +3 auf jeden
   Ertrag (drei angebundene Städte à +1). */
const TUT_ROADS = [[4, 13], [5, 13], [5, 14], [6, 15]];
function tutStrikeSpot() {
  const ru = RU();
  const gr = S.players.findIndex(p => p.civ === 'griechenland');
  const gcap = capitalOf(S, gr);
  const army = armiesOf(S, ru)[0];
  if (!gcap || !army) return TUT_STRIKE;
  const rng = attackRange(S, ru);
  const mp = moveAllowance(S, ru);
  const reach = reachable(army.r, army.c, mp,
    (r, c) => canEnter(S, ru, r, c) ? (zocStop(S, ru, r, c) ? 'stop' : true) : false,
    (r1, c1, r2, c2) => moveCost(S, r1, c1, r2, c2));
  const ok = ([r, c]) => reach.has(key(r, c)) && canStop(S, ru, r, c) && !cityAt(S, r, c)
    && hexDistance(r, c, gcap.r, gcap.c) <= rng;
  if (ok(TUT_STRIKE)) return TUT_STRIKE;
  const alt = [...reach.keys()].map(unkey).filter(ok)
    .sort((x, y) => reach.get(key(x[0], x[1])) - reach.get(key(y[0], y[1])));
  return alt[0] || TUT_STRIKE;
}

/* Was ein Feld als Stadtplatz tatsächlich bringt: Geländemischung ringsum und der
   Einkommenszuwachs, gerechnet am echten Spielstand. */
function tutNeighbourText(r, c) {
  const cnt = {};
  for (const [a, b] of neighbors(r, c)) {
    const t = terrainAt(S, a, b);
    if (t) cnt[t] = (cnt[t] || 0) + 1;
  }
  return Object.entries(cnt).sort((x, y) => y[1] - x[1])
    .map(([t, n]) => `${n} × ${TERRAIN[t].name}`).join(', ');
}
function tutGain(r, c) { return settleGain(S, RU(), r, c); }
function tutGainText(r, c) {
  const g = tutGain(r, c);
  return `+${g.sci} 🔬, ${g.food >= 0 ? '+' : ''}${g.food} 🌾, +${g.coins} 🪙`;
}
/* Der Wunschplatz aus der Beispielpartie – falls ihn ein Bot vorher besiedelt hat, das
   beste erreichbare und bezahlbare Feld in der Nähe (deterministisch sortiert). */
function tutSpot(pref) {
  if (!canFound(S, RU(), ...pref) && foundCost(S, RU(), ...pref) <= tutRes().food) return pref;
  const cap = tutCap();
  const list = within(cap.r, cap.c, 5)
    .filter(([r, c]) => !canFound(S, RU(), r, c) && foundCost(S, RU(), r, c) <= tutRes().food);
  // bester Nahrungszuwachs, dann billigster Weg, dann feste Reihenfolge (Determinismus)
  list.sort((a, b) => tutGain(...b).food - tutGain(...a).food ||
    foundCost(S, RU(), ...a) - foundCost(S, RU(), ...b) || a[0] - b[0] || a[1] - b[1]);
  return list[0] || pref;
}
/* Wachfeld für die Armee: das Wunschfeld, sonst das erreichbare Randfeld, das der
   griechischen Hauptstadt am nächsten liegt. */
function tutGuardSpot(army, pref) {
  const reach = [...armyReach(S, army).keys()].map(unkey).filter(([r, c]) => canStop(S, RU(), r, c));
  if (reach.some(([r, c]) => r === pref[0] && c === pref[1])) return pref;
  const foe = capitalOf(S, S.players.findIndex(p => p.civ === 'griechenland'));
  if (!reach.length || !foe) return pref;
  reach.sort((a, b) => hexDistance(foe.r, foe.c, ...a) - hexDistance(foe.r, foe.c, ...b) ||
    a[0] - b[0] || a[1] - b[1]);
  return reach[0];
}

const TUT_STEPS = [
  /* ------------------------------------------------------------------ Runde 1 */
  {
    sub: 'Willkommen',
    t: 'Das hier ist ein echtes Spiel',
    html: () => `
      <p>Du spielst <b>Russland</b>, die anderen drei Reiche übernehmen Bots auf dem
      höchsten Grad „David". Gespielt wird auf der Originalkarte.</p>
      <p>Golden umrandet ist deine <b>Hauptstadt</b>: Kreis mit Symbol = Stadt, Striche
      daneben = Bevölkerung, dunkelrote Linie = Reichsgrenze.
      Die Karte ist immer vollständig zu sehen – du kannst jedes Feld antippen, um es
      anzusehen.</p>
      <p>Gezogen wird immer in derselben Reihenfolge:
      <b>Russland → Griechenland → England → Wikingerreich</b>. Wo die Runde beginnt, hängt
      vom Startspieler ab – hier bist das du.</p>
      <p class="tut-note">Im Tutorial sind nur die Schritte dieser Beispielpartie möglich –
      so bleibt jede Zahl nachvollziehbar. „Tutorial beenden" gibt alles frei.</p>`,
    hl: () => [[tutCap().r, tutCap().c]],
  },
  {
    sub: 'Zugablauf 1 von 5 · Einkommen',
    t: 'Dein Umland',
    html: () => `
      <p>Alle sechs Felder rund um deine Hauptstadt sind unter deiner Kontrolle und bringen
      dir Einkommen – sie sind gerade golden umrandet. Das Feld <i>unter</i> der Stadt bringt
      nichts.</p>
      <p>Jede weitere Stadt bringt bis zu sechs neue Felder dazu. Deshalb ist Ausbreitung
      wichtiger als große Einzelstädte.</p>
      <p><b>So siehst du ein Feld an:</b> Feld antippen – das Aktionsblatt zeigt den
      <b>Feldertrag</b> und daneben, was eine Stadt auf diesem Feld einbrächte. Mit ✕ oben
      rechts schließt du es wieder.</p>`,
    hl: () => [...controlledTiles(S, RU())].map(unkey),
  },
  {
    sub: 'Zugablauf 1 von 5 · Einkommen',
    t: 'Woher deine Zahlen kommen',
    html: () => {
      const b = incomeBreakdown(S, RU());
      const rows = b.rows.map(r => `<tr><td>${r.count} × ${r.name}</td>` +
        r.y.map(v => `<td>${v || '·'}</td>`).join('') + '</tr>').join('');
      return `
      <p>Oben rechts in der Kopfzeile stehen 🔬 Wissenschaft, 🌾 Nahrung, 🪙 Münzen und
      ⚔︎ Macht.
      So setzen sie sich in diesem Zug zusammen:</p>
      <table class="tut-tab">
        <tr><th align="left">Quelle</th><th>🔬</th><th>🌾</th><th>🪙</th></tr>
        ${rows}
        <tr><td>${b.pop.count} Bevölkerung</td>${b.pop.y.map(v => `<td>${v}</td>`).join('')}</tr>
        <tr class="sum"><td>Summe</td>${b.total.map(v => `<td>${v}</td>`).join('')}</tr>
      </table>
      <p>Jeder Bevölkerungspunkt bringt <b>+1 Wissenschaft und +1 Münze</b> und <b>frisst
      1 Nahrung</b> – jede Runde. Russland bekommt zusätzlich +1 Nahrung in jedem Wald.</p>
      <div class="tut-key"><b>Merke</b> Ressourcen <b>verfallen am Zugende</b>. Nur Macht
      bleibt liegen – gib also alles aus. Münzen können <b>2:1</b> als Nahrung oder
      Wissenschaft verwendet werden.</div>`;
    },
    hl: () => [...controlledTiles(S, RU())].map(unkey),
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Die zweite Stadt',
    html: () => `
      <p>Das golden umrandete Feld kostet
      <b>${foundCost(S, RU(), ...TUT_CITY_1)} Nahrung</b> – 1 Basiskosten für die erste
      zusätzliche Stadt plus 3 für den Weg dorthin (gerechnet wird der Weg über passierbare
      Felder, nicht die Luftlinie).</p>
      <p><b>Warum dieses Feld?</b> Ringsum liegen ${tutNeighbourText(...TUT_CITY_1)}. Ab der
      nächsten Runde bringt die Stadt dir <b>${tutGainText(...TUT_CITY_1)}</b> – die eine
      Bevölkerung isst dabei schon mit. Wälder sind für <i>dich</i> besonders viel wert: die
      russische Grundfähigkeit gibt +1 Nahrung in jedem Wald, dazu kommt 1 Münze. Außerdem liegt das Feld genau die nötigen 3 Felder
      von der Hauptstadt entfernt (näher ist verboten) und der Weg ist kurz, das drückt den
      Preis.</p>
      <p><b>So gründest du:</b> goldenes Feld antippen → im Blatt auf <b>Stadt gründen</b>.</p>`,
    task: 'Tippe das <b>goldene Feld</b> an und wähle <b>Stadt gründen</b>.',
    hl: () => [TUT_CITY_1],
    allow: { bar: [], labels: [/Stadt gründen/], hex: () => [TUT_CITY_1] },
    goal: () => !!cityOn(...TUT_CITY_1),
    auto: () => foundCity(S, RU(), ...TUT_CITY_1),
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Forschen: Schrift',
    html: () => `
      <p>Jede Technologie ist nur mit <b>50 % Wahrscheinlichkeit</b> in einer Partie
      verfügbar. Die Technologien sind in <b>vier Feldern</b> organisiert, jedes Feld ist
      nochmal in <b>vier Zeitalter</b> aufgeteilt. Sobald du die erste Technologie eines
      Zeitalters und Feldes erforschst, würfelst du sofort die Verfügbarkeiten des nächsten
      Zeitalters in diesem Feld aus. Es ist immer mindestens eine Technologie je Zeitalter
      verfügbar.</p>
      <p><b>Warum Schrift?</b> Sie kostet ${techCost(S, RU(), TECH_BY_KEY.schrift)}
      Wissenschaft und gibt <b>+1 Wissenschaft je Bevölkerung</b> – dauerhaft, in jeder
      Runde. Das ist die billigste Verdopplung im Spiel, und sie wirkt sofort.</p>
      <p><b>So forschst du:</b> unten auf <b>Forschen</b> → im Bogen die Kachel
      <b>Schrift</b> antippen. Der Bogen zeigt Kosten oben links in der Kachel.</p>`,
    task: 'Öffne <b>Forschen</b> und kaufe <b>Schrift</b>.',
    // Papier steht in Forschung/Mittelalter an erster Stelle – dieser Wurf ist gesetzt,
    // damit der Bogen danach wirklich zeigt, was der nächste Schritt verlangt.
    dice: [5],
    allow: { bar: ['a-tech'], techs: ['schrift'] },
    goal: () => has(tutP(), 'schrift'),
    auto: () => doResearch(S, RU(), 'schrift'),
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Die Hauptstadt wachsen lassen',
    html: () => {
      const pr = growPrice(S, RU(), tutCap());
      return `
      <p>Wachsen kostet je <b>1 Nahrung und 1 Münze pro vorhandener Bevölkerung</b>. Deine
      Hauptstadt hat ${tutCap().pop}, es kostet also ${pr.food} Nahrung und ${pr.coins}
      Münzen. Von 2 auf 3 wären es 2 und 2.</p>
      <p><b>Warum jetzt?</b> Du hast noch ${tutRes().food} Nahrung und ${tutRes().coins}
      Münzen übrig, und beides verfällt am Zugende. Der Punkt bringt dir ab der nächsten
      Runde jede Runde +1 Wissenschaft (mit Schrift +2) und +1 Münze.</p>
      <p><b>So wächst du:</b> Hauptstadt antippen → <b>Bevölkerung wachsen</b>.</p>`;
    },
    task: 'Tippe deine <b>Hauptstadt</b> an und wähle <b>Bevölkerung wachsen</b>.',
    hl: () => [[tutCap().r, tutCap().c]],
    allow: { bar: [], labels: [/Bevölkerung wachsen/], hex: () => [[tutCap().r, tutCap().c]] },
    goal: () => tutCap().pop >= 2,
    auto: () => growCity(S, RU(), tutCap(), 'paid'),
  },
  {
    sub: 'Zugablauf 3 bis 5',
    t: 'Zug beenden',
    html: () => `
      <p>Übrig sind ${tutRes().sci} 🔬, ${tutRes().food} 🌾, ${tutRes().coins} 🪙. Für eine
      Armee (${armyCost(S, RU())} Münzen) oder einen Punkt Macht
      (${powerPrice(S, RU())} Münzen) reicht es noch nicht – der Rest verfällt. Das ist
      normal in Runde 1.</p>
      <p>Nach deinem Zug folgen <b>Kampf</b> und <b>Siegprüfung</b>; du hast keine Armeen,
      also passiert nichts. Danach ziehen die drei Bots, jeder in einem eigenen Fenster.</p>
      <p><b>So beendest du:</b> unten rechts auf <b>Zug beenden</b>, dann im Bot-Fenster
      jeweils auf <b>Weiter</b>.</p>`,
    task: 'Tippe auf <b>Zug beenden</b> und klick dich durch die drei Bot-Fenster.',
    allow: { bar: ['a-end'] },
    goal: () => S.round >= 2 && P(S).kind !== 'bot',
    auto: () => {
      let guard = 0;
      while (!S.over && guard++ < 12 && !(S.round >= 2 && P(S).kind !== 'bot')) {
        if (P(S).kind === 'bot') botTurn(S, S.cur);
        finishTurn(S); if (S.over) break; advanceTurn(S);
      }
    },
  },
  {
    sub: 'Die Gegner',
    t: 'Was die Bots getan haben',
    html: () => `
      <p>Ein Bot würfelt für jede Aktion gegen seinen Schwierigkeitsgrad: Siedler braucht
      eine 6, Häuptling 5+, Prinz 4+, König 3+, <b>David 2+</b>. Jeder Wurf steht im
      Protokoll.</p>
      <p>Er geht immer dieselben Schritte: wachsen, siedeln, Armee bauen, Armeen bewegen,
      zweimal forschen, Kampf.</p>
      <p><b>So liest du mit:</b> unten auf <b>Protokoll</b> – dort steht jeder Würfelwurf
      mit Grund. Mit ✕ schließen.</p>
      <div class="tut-key"><b>Merke</b> Der <b>Machtwert eines Bots ist immer seine
      Gesamtbevölkerung</b>. Griechenland hat gerade
      ${popOf(S, S.players.findIndex(p => p.civ === 'griechenland'))}.</div>`,
    task: 'Öffne einmal das <b>Protokoll</b>.',
    allow: { bar: ['a-log'] },
    goal: () => !!ui.tutSawLog,
    // Leseschritt: nicht weiterschalten, solange das Protokoll offen ist.
    keepOpen: true,
    auto: () => { ui.tutSawLog = true; },
  },
  /* ------------------------------------------------------------------ Runde 2 */
  {
    sub: 'Zugablauf 1 von 5 · Einkommen',
    t: 'Runde 2: exponentielles Wachstum',
    html: () => {
      const inc = income(S, RU());
      return `
      <p>Dein Einkommen liegt jetzt bei <b>${inc.sci} 🔬, ${inc.food} 🌾,
      ${inc.coins} 🪙</b> – in Runde 1 waren es 1, 5 und 3.</p>
      <p>Drei Dinge greifen zusammen: die zweite Stadt brachte sechs neue Felder, die
      Hauptstadt hat 2 Bevölkerung, und <b>Schrift</b> verdoppelt deren Wissenschaft. Genau
      dieser Effekt entscheidet die Partie – nicht die Armeen.</p>
      <p>Faustregel: die wichtigsten <b>Multiplikatoren</b> und <b>viele Städte</b> in
      Kombination – eines ohne das andere bringt wenig. Papier auf drei Grasland ist wenig
      wert, zehn Städte ohne Landwirtschaft verhungern.</p>`;
    },
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Forschen: Papier',
    html: () => {
      const g = [...controlledTiles(S, RU())].filter(k => terrainAt(S, ...unkey(k)) === 'G').length;
      return `
      <p>Mit Schrift hat sich das Mittelalter der Forschung geöffnet – deshalb steht jetzt
      <b>Papier</b> im Bogen. Es kostet
      ${techCost(S, RU(), TECH_BY_KEY.papier)} Wissenschaft.</p>
      <p><b>Warum Papier?</b> Es gibt <b>+1 Wissenschaft auf jedem Grasland</b>. Du
      kontrollierst ${g} Grasland-Felder, das sind ${g} Wissenschaft mehr in <i>jeder</i>
      Runde für einmalig ${techCost(S, RU(), TECH_BY_KEY.papier)}. Nach zwei Runden hat es
      sich mehrfach bezahlt.</p>
`;
    },
    dice: [5],                                   // Wissenschaftliche Methode wird verfügbar
    task: 'Öffne <b>Forschen</b> und kaufe <b>Papier</b>.',
    allow: { bar: ['a-tech'], techs: ['papier'] },
    goal: () => has(tutP(), 'papier'),
    auto: () => doResearch(S, RU(), 'papier'),
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Die dritte Stadt',
    html: () => {
      const sp = ui.tutSpot2 || TUT_CITY_2;
      return `
      <p>Die dritte Stadt kostet mehr: <b>${foundCost(S, RU(), ...sp)} Nahrung</b>
      (3 Basiskosten bei zwei bestehenden Städten plus Weg). Die Basiskosten steigen
      1 / 3 / 6 / 10 – Ausbreitung wird teurer, je weiter du kommst.</p>
      <p><b>Warum dieses Feld?</b> Ringsum liegen ${tutNeighbourText(...sp)}, das
      bringt <b>${tutGainText(...sp)}</b> je Runde. Das Feld liegt an deinem bestehenden
      Gebiet – es füllt die Lücke, statt eine dritte Front zu öffnen. Kompakte Reiche
      verteidigen sich leichter.
      ${sp[0] === TUT_CITY_2[0] && sp[1] === TUT_CITY_2[1] ? '' :
        '<br><i>Hinweis: Der eigentlich vorgesehene Platz ist inzwischen von einem Bot besiedelt – deshalb dieses Feld.</i>'}</p>
`;
    },
    enter: () => { ui.tutSpot2 = tutSpot(TUT_CITY_2); },
    task: 'Tippe das <b>goldene Feld</b> an und wähle <b>Stadt gründen</b>.',
    hl: () => [ui.tutSpot2 || TUT_CITY_2],
    allow: { bar: [], labels: [/Stadt gründen/], hex: () => [ui.tutSpot2 || TUT_CITY_2] },
    goal: () => {
      const sp = ui.tutSpot2 || TUT_CITY_2;
      const c = cityOn(...sp);
      return !!c && c.owner === RU();
    },
    auto: () => foundCity(S, RU(), ...(ui.tutSpot2 || TUT_CITY_2)),
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Zweimal wachsen',
    html: () => {
      const cap = tutCap(), t1 = cityOn(...TUT_CITY_1);
      return `
      <p>Jede Stadt darf einmal pro Runde wachsen. Die Hauptstadt kostet
      ${growPrice(S, RU(), cap).food} Nahrung und ${growPrice(S, RU(), cap).coins} Münzen,
      die jüngere Stadt nur
      ${t1 ? growPrice(S, RU(), t1).food + ' und ' + growPrice(S, RU(), t1).coins : '1 und 1'} –
      kleine Städte wachsen billiger.</p>
      <p><b>Warum beide?</b> Nahrung und Münzen verfallen sonst. Und weil die Kosten mit der
      Größe steigen, ist es effizienter, viele kleine Städte gleichmäßig zu vergrößern als
      eine große.</p>
`;
    },
    hl: () => [[tutCap().r, tutCap().c], TUT_CITY_1],
    task: 'Lass <b>beide</b> golden umrandeten Städte je einmal wachsen.',
    allow: {
      bar: [], labels: [/Bevölkerung wachsen/],
      hex: () => [[tutCap().r, tutCap().c], TUT_CITY_1],
    },
    goal: () => tutCap().pop >= 3 && (cityOn(...TUT_CITY_1) || { pop: 0 }).pop >= 2,
    auto: () => {
      growCity(S, RU(), tutCap(), 'paid');
      const t = cityOn(...TUT_CITY_1);
      if (t) { t.born = 0; growCity(S, RU(), t, 'paid'); }
    },
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Die erste Armee',
    html: () => `
      <p>Eine Armee kostet <b>${armyCost(S, RU())} Münzen</b> – 5 je eigener Armee, die
      zweite also 10. Sie erscheint <i>in</i> einer Stadt und <b>muss sie im selben Zug
      verlassen</b>; Armeen stehen nie auf Städten, auch nicht auf eigenen.</p>
      <p><b>Warum überhaupt eine Armee?</b> Ohne Armee kannst du nichts angreifen und keine
      Stadt aktiv verteidigen – eine Armee neben einer eigenen Stadt addiert deinen
      Machtwert zur Verteidigung.</p>
      <p><b>So baust du:</b> die golden umrandete Stadt antippen → im Blatt auf
      <b>Armee bauen</b>. Die Armee steht dann in der Stadt und muss sie noch in diesem Zug
      verlassen.</p>`,
    task: 'Tippe die <b>golden umrandete Stadt</b> an und wähle <b>Armee bauen</b>.',
    hl: () => [TUT_CITY_1],
    allow: { bar: [], labels: [/Armee bauen/], hex: () => [TUT_CITY_1] },
    goal: () => armiesOf(S, RU()).length >= 1,
    auto: () => { const t = cityOn(...TUT_CITY_1); if (t) buildArmy(S, RU(), t); },
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Die Armee bewegen',
    html: () => `
      <p>Armeen ziehen <b>3 Felder</b> weit, nicht über Wasser (bis eine Technologie das
      ändert), nicht auf Städte und nicht auf andere Armeen. Später erhöhen Panzerschiff (6) und Luftwaffe (9)
      die Weite, Straßen und Eisenbahn machen Schritte billiger.</p>
      <p><b>Warum das goldene Feld?</b> Es liegt am Rand deines Reichs in Richtung
      Griechenland. Dort steht die Armee als Wache: sie verteidigt die Stadt nebenan mit und
      blockiert später ggf. mit <b>Schießpulver</b> den Durchmarsch.</p>
      <p><b>So bewegst du:</b> Deine Armee steht noch <i>in</i> der Stadt, in der du sie
      gebaut hast. Stadt antippen → <b>Armee hier bewegen</b> → dann das goldene Zielfeld
      antippen. Steht eine Armee im freien Feld, heißt der Knopf <b>Diese Armee bewegen</b>.
      Erreichbare Felder werden hell markiert.</p>`,
    enter: () => {
      const a = armiesOf(S, RU())[0];
      ui.tutArmyTo = a ? tutGuardSpot(a, TUT_ARMY_TO) : TUT_ARMY_TO;
    },
    task: 'Zieh die Armee auf das <b>goldene Feld</b>.',
    hl: () => [ui.tutArmyTo || TUT_ARMY_TO],
    allow: {
      bar: [], labels: [/Armee.*bewegen/],
      hex: () => armiesOf(S, RU()).map(a => [a.r, a.c]).concat([ui.tutArmyTo || TUT_ARMY_TO]),
      moveTo: () => [ui.tutArmyTo || TUT_ARMY_TO],
    },
    goal: () => {
      const t = ui.tutArmyTo || TUT_ARMY_TO;
      return armiesOf(S, RU()).some(a => a.r === t[0] && a.c === t[1]);
    },
    auto: () => {
      const a = armiesOf(S, RU())[0];
      if (a) moveArmy(S, a, ...(ui.tutArmyTo || TUT_ARMY_TO));
    },
  },
  {
    sub: 'Zugablauf 3 bis 5',
    t: 'Zug beenden',
    html: () => `
      <p>Übrig: ${tutRes().sci} 🔬, ${tutRes().food} 🌾, ${tutRes().coins} 🪙 – das verfällt.
      Danach kommen Kampf und Siegprüfung, dann die Bots.</p>
      <p>Achte im Protokoll auf die Zeilen der Bots: Griechenland zieht seine Armeen nach
      vier Prioritäten – belagerte eigene Städte verteidigen, gegnerische Städte angreifen,
      Armeen flankieren, sonst an den Reichsrand.</p>
`,
    task: 'Beende den Zug und klick dich durch die Bot-Fenster.',
    allow: { bar: ['a-end', 'a-log'] },
    goal: () => S.round >= 3 && P(S).kind !== 'bot',
    auto: () => {
      let guard = 0;
      while (!S.over && guard++ < 12 && !(S.round >= 3 && P(S).kind !== 'bot')) {
        if (P(S).kind === 'bot') botTurn(S, S.cur);
        finishTurn(S); if (S.over) break; advanceTurn(S);
      }
    },
  },
  /* ------------------------------------------------------------------ Runde 3 */
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Forschen: Wissenschaftliche Methode',
    html: () => `
      <p>Du hast ${tutRes().sci} Wissenschaft. <b>Wissenschaftliche Methode</b> kostet
      ${techCost(S, RU(), TECH_BY_KEY.wiss_methode)} – über die Hälfte davon.</p>
      <p><b>Warum trotzdem zuerst?</b> Sie senkt jede weitere Technologie um <b>2 in der
      Antike, 4 im Mittelalter, 6 in der Industrialisierung, 8 in der Moderne</b> – nie unter
      0. Danach kosten <b>Fischerei</b> und <b>Eisenverarbeitung</b> jeweils <b>0</b>. Sie
      bezahlt sich also noch in diesem Zug.</p>
`,
    task: 'Kaufe <b>Wissenschaftliche Methode</b>.',
    allow: { bar: ['a-tech'], techs: ['wiss_methode'] },
    goal: () => has(tutP(), 'wiss_methode'),
    auto: () => doResearch(S, RU(), 'wiss_methode'),
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Zwei Technologien für null',
    html: () => `
      <p><b>Fischerei</b> (Meer +1 Nahrung) und <b>Eisenverarbeitung</b> (Macht kostet 4
      statt 5 Münzen) kosten jetzt beide <b>0 Wissenschaft</b> – der Rabatt frisst ihren
      Preis komplett auf.</p>
      <p><b>Warum diese zwei?</b> Fischerei macht deine Meeresfelder nutzbar, und
      Eisenverarbeitung senkt dauerhaft den Machtpreis – gleich brauchst du Macht. Gratis
      mitnehmen ist immer richtig; jede Technologie öffnet außerdem Zeitalter.</p>
      <p><b>So forschst du:</b> <b>Forschen</b> → beide Kacheln antippen, der Bogen bleibt
      offen.</p>`,
    dice: [5],                                   // Burgenbau wird verfügbar
    task: 'Kaufe <b>Fischerei</b> und <b>Eisenverarbeitung</b> (je 0).',
    allow: { bar: ['a-tech'], techs: ['fischerei', 'eisenverarbeitung'] },
    goal: () => has(tutP(), 'fischerei') && has(tutP(), 'eisenverarbeitung'),
    auto: () => { doResearch(S, RU(), 'fischerei'); doResearch(S, RU(), 'eisenverarbeitung'); },
  },
  {
    sub: 'Zugablauf 4 von 5 · Kampf',
    t: 'Eine gegnerische Armee vor der Stadt',
    html: () => {
      const t = tutSiegeCity(), foe = tutSiegeArmy();
      if (!t || !foe) return `<p>Die Belagerung hat sich aufgelöst – die Regel gilt
        trotzdem: Angriff gegen Verteidigung, zwei Züge in Folge.</p>`;
      const atk = attackValue(S, foe.owner, 1), def = defenseValue(S, t);
      return `
      <p>Griechenland hat im eigenen Zug eine Armee neben deine Stadt gezogen und schon
      einmal angegriffen – im Protokoll steht dazu „Zug 1/2". Stadt und Armee sind golden
      umrandet.</p>
      <p><b>Angriffswert</b> = Machtwert je angreifender Armee, mehrere addieren sich:
      <b>${atk}</b> (bei Bots ist das ihre Gesamtbevölkerung).<br>
      <b>Verteidigungswert</b> = 1 je Stadtbevölkerung plus den Machtwert benachbarter
      eigener Armeen: <b>${def}</b>.</p>
      <p>${atk > def
        ? 'Der Angriff ist höher. Ist er <b>zwei Züge in Folge</b> höher, verlierst du die Stadt und 2 Bevölkerung. Im Protokoll steht dann „Zug 1/2" – das ist deine Vorwarnung, du hast genau eine Runde Zeit.'
        : 'Deine Verteidigung hält – am Zugende bricht die Belagerung zusammen.'}</p>`;
    },
    enter: () => {
      const ru = RU();
      // Der Bot hat im letzten Zug von sich aus angegriffen – wir nehmen genau diese Armee.
      const foe = S.armies.find(a => a.owner !== ru &&
        citiesOf(S, ru).some(c => hexDistance(c.r, c.c, a.r, a.c) === 1));
      if (foe) {
        const town = citiesOf(S, ru).find(c => hexDistance(c.r, c.c, foe.r, foe.c) === 1);
        ui.tutSiege = { cityId: town.id, armyId: foe.id };
        return;
      }
      // Notfalls stellen wir eine – dann steht es auch so im Protokoll.
      const town = cityOn(...TUT_CITY_1) || tutCap();
      const foeIdx = S.players.findIndex(p => p.civ === 'griechenland');
      const spot = neighbors(town.r, town.c).find(([r, c]) =>
        isLand(S, r, c) && !cityAt(S, r, c) && !armyAt(S, r, c));
      if (!spot) return;
      const army = { id: S.nextId++, owner: foeIdx, r: spot[0], c: spot[1], mp: 0, born: S.round };
      S.armies.push(army);
      ui.tutSiege = { cityId: town.id, armyId: army.id };
      log(S, 'info', 'Tutorial: eine griechische Armee nimmt Stellung neben deiner Stadt.');
    },
    hl: () => {
      const t = tutSiegeCity(), a = tutSiegeArmy();
      return [t && [t.r, t.c], a && [a.r, a.c]].filter(Boolean);
    },
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Die Antwort: Mauern und Burgenbau',
    html: () => {
      const t = tutSiegeCity(), a = tutSiegeArmy();
      const cw = techCost(S, RU(), TECH_BY_KEY.stadtmauern);
      const cb = techCost(S, RU(), TECH_BY_KEY.burgenbau);
      const atk = a ? attackValue(S, a.owner, 1) : 0;
      return `
      <p><b>Stadtmauern</b> (${cw} Wissenschaft) geben <b>jeder</b> deiner Städte +5
      Verteidigung. <b>Burgenbau</b> (${cb}) stellt in jede Stadt eine unbewegliche,
      virtuelle Armee: sie <b>projiziert deinen Machtwert auf die Stadt</b> – erst dadurch
      hilft gekaufte Macht auch der Verteidigung. Du hast ${tutRes().sci} Wissenschaft.</p>
      ${t ? `<p>Verteidigung jetzt <b>${defenseValue(S, t)}</b>, Angriff <b>${atk}</b>.
      Mauern allein bringen dich auf ${defenseValue(S, t) + (has(tutP(), 'stadtmauern') ? 0 : 5)} –
      der Bot wächst aber weiter. Deshalb kommt im nächsten Schritt noch Macht dazu.</p>` : ''}
      <p><b>Warum beides?</b> Mauern wirken in allen Städten gleichzeitig, kosten einmalig
      und schrumpfen nicht. Burgenbau macht deine Macht verteidigungswirksam, ohne dass eine
      echte Armee neben der Stadt stehen muss – und die virtuelle Armee zählt nicht für die
      Kosten weiterer Armeen.</p>
`;
    },
    task: 'Kaufe <b>Stadtmauern</b> und <b>Burgenbau</b>.',
    allow: { bar: ['a-tech'], techs: ['stadtmauern', 'burgenbau'] },
    hl: () => { const t = tutSiegeCity(); return t ? [[t.r, t.c]] : []; },
    goal: () => has(tutP(), 'stadtmauern') && has(tutP(), 'burgenbau'),
    auto: () => { doResearch(S, RU(), 'stadtmauern'); doResearch(S, RU(), 'burgenbau'); },
  },
  {
    sub: 'Zugablauf 2 von 5 · Macht',
    t: 'Rechne nach, bevor du kaufst',
    html: () => {
      const t = tutSiegeCity(), a = tutSiegeArmy();
      const pr = powerPrice(S, RU());
      const def = t ? defenseValue(S, t) : 0;
      const feind = a ? a.owner : S.players.findIndex(x => x.civ === 'griechenland');
      const macht = powerOf(S, feind);
      const armeen = armiesOf(S, feind).length;
      return `
      <p>Macht ist der Angriffswert <i>jeder</i> deiner Armeen und zählt zur Verteidigung
      benachbarter eigener Städte. Ein Punkt kostet dank Eisenverarbeitung
      <b>${pr} statt 5 Münzen</b>; du hast ${tutRes().coins}. Der Haken: zu Beginn jedes
      Zuges <b>halbiert</b> sich deine Macht (aufgerundet).</p>
      <p><b>Die naheliegende Rechnung.</b> Kauf dir 4 Macht, dann steht deine belagerte
      Stadt bei:</p>
      <div class="tut-calc">
        ${t ? `<div><span>Bevölkerung der Stadt</span><b>${t.pop}</b></div>` : ''}
        <div><span>Stadtmauern</span><b>+5</b></div>
        <div><span>Burgenbau (virtuelle Armee = dein Machtwert)</span><b>+4</b></div>
        <div><span>deine Armee daneben</span><b>+4</b></div>
        <div class="sum"><span>Verteidigung</span><b>${(t ? t.pop : 1) + 13}</b></div>
      </div>
      <p>Das sieht solide aus – <b>${def}</b> stehen ohne den Kauf schon da.</p>
      <p><b>Und jetzt die Gegenrechnung.</b> Griechenland hat gerade ${armeen} Armee${
        armeen === 1 ? '' : 'n'} und einen Machtwert von <b>${macht}</b> (bei Bots ist das
      ihre Gesamtbevölkerung, die jede Runde wächst). Baut es diesen Zug eine <b>zweite
      Armee</b> – wofür es jede Runde würfelt – und schickt beide auf deine Stadt, addieren
      sich die Angriffswerte:</p>
      <div class="tut-calc">
        <div><span>Armee 1</span><b>${macht}</b></div>
        <div><span>Armee 2</span><b>+${macht}</b></div>
        <div class="sum"><span>Angriff</span><b>${2 * macht}</b></div>
      </div>
      <div class="tut-key"><b>Merke</b> ${2 * macht} gegen ${(t ? t.pop : 1) + 13}: die vier
      Münzen wären verbrannt und die Stadt trotzdem weg. Gegen einen Gegner, der nachlegen
      kann, ist reine Verteidigung ein Wettrennen, das du verlierst. <b>Kauf hier nichts.</b>
      Der nächste Schritt zeigt den billigeren Weg.</div>`;
    },
    hl: () => { const t = tutSiegeCity(); return t ? [[t.r, t.c]] : []; },
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Der Gegenangriff als Verteidigung',
    html: () => {
      const gr = S.players.findIndex(x => x.civ === 'griechenland');
      const gcap = capitalOf(S, gr);
      const cb = techCost(S, RU(), TECH_BY_KEY.belagerung);
      const pr = powerPrice(S, RU());
      const ziel = ui.tutStrike || TUT_STRIKE;
      return `
      <p>Bots ziehen ihre Armeen nach festen Prioritäten – und <b>die eigene Hauptstadt
      steht ganz oben</b>, noch vor „eine begonnene Belagerung zu Ende bringen". Wer eine
      Armee neben ihre Hauptstadt stellt, zwingt sie zum Rückzug.</p>
      <p>Griechenlands Hauptstadt ist golden umrandet und hat
      <b>${defenseValue(S, gcap)} Verteidigung</b> – erobern wirst du sie nicht. Das musst du
      auch nicht: es reicht, <b>dazustehen</b>.</p>
      <p>Drei Schritte, und dein Vorrat geht dabei genau auf:</p>
      <div class="tut-calc">
        <div><span><b>Belagerungsmaschinen</b> forschen (+5 Angriff gegen Städte)</span><b>${cb} 🔬</b></div>
        <div><span><b>3 Macht</b> kaufen (statt 4)</span><b>${3 * pr} 🪙</b></div>
        <div><span>Armee auf das <b>goldene Feld</b> daneben ziehen</span><b>3 Bewegung</b></div>
      </div>
      <p>Danach greift deine eine Armee mit <b>${3 + 5} statt 3</b> an – zu wenig für die
      Eroberung, aber genug, dass der Bot es ernst nimmt. Übrig bleiben
      <b>${Math.max(0, tutRes().sci - cb)} Wissenschaft</b> und
      <b>${Math.max(0, tutRes().coins - 3 * pr)} Münzen</b>; beides brauchst du gleich noch.</p>
      <p><b>So kaufst du</b> Macht: unten auf <b>Macht</b> → die Menge antippen.</p>
      <div class="tut-key"><b>Merke</b> Angriff ist oft die billigere Verteidigung. Eine Armee
      an der richtigen Stelle bindet zwei gegnerische – ohne einen einzigen Kampf.</div>`;
    },
    enter: () => { ui.tutStrike = tutStrikeSpot(); },
    task: 'Forsche <b>Belagerungsmaschinen</b>, kaufe <b>3 Macht</b> und zieh deine Armee auf das <b>goldene Feld</b>.',
    hl: () => {
      const gr = S.players.findIndex(x => x.civ === 'griechenland');
      const gcap = capitalOf(S, gr);
      return [ui.tutStrike || TUT_STRIKE, gcap && [gcap.r, gcap.c]].filter(Boolean);
    },
    allow: {
      bar: ['a-tech', 'a-power', 'a-army'],
      techs: ['belagerung'],
      labels: [/Macht/, /bewegen/],
      // Antippbar: die eigene Armee (um sie auszuwählen) und das Zielfeld
      hex: () => armiesOf(S, RU()).map(a => [a.r, a.c]).concat([ui.tutStrike || TUT_STRIKE]),
      moveTo: () => [ui.tutStrike || TUT_STRIKE],
    },
    goal: () => {
      const z = ui.tutStrike || TUT_STRIKE;
      return has(tutP(), 'belagerung') && tutP().power >= 3 &&
        armiesOf(S, RU()).some(a => a.r === z[0] && a.c === z[1]);
    },
    auto: () => {
      doResearch(S, RU(), 'belagerung');
      let guard = 0;
      while (tutP().power < 3 && guard++ < 6 && !buyPower(S, RU(), 1)) { /* Punkt für Punkt */ }
      const z = ui.tutStrike || TUT_STRIKE;
      const a = armiesOf(S, RU())[0];
      if (a) { a.mp = moveAllowance(S, RU()); moveArmy(S, a, z[0], z[1]); }
    },
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Der Rest der Wissenschaft: Rad',
    html: () => `
      <p>Übrig ist ${tutRes().sci} Wissenschaft – genau der Preis für <b>Rad</b>
      (${techCost(S, RU(), TECH_BY_KEY.rad)}). Ungenutzte Wissenschaft verfällt zum
      Zugende, also raus damit.</p>
      <p><b>Warum Rad?</b> Es erlaubt <b>Straßen</b>. Die halbieren nicht nur die
      Bewegungskosten – sie verbinden auch deine Städte zu <b>Handelsrouten</b>, und die
      bringen jede Runde etwas ein. Gleich baust du die erste.</p>
      <div class="tut-key"><b>Merke</b> Wissenschaft, Nahrung und Münzen sind
      <b>Rundeneinkommen</b>, kein Vorrat: Was du am Zugende übrig hast, ist verloren.
      Plane deine Käufe so, dass am Ende möglichst wenig liegen bleibt.</div>`,
    task: 'Kaufe <b>Rad</b>.',
    allow: { bar: ['a-tech'], techs: ['rad'] },
    goal: () => has(tutP(), 'rad'),
    auto: () => { doResearch(S, RU(), 'rad'); },
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Die vierte Stadt',
    html: () => {
      const sp = ui.tutSpot3 || TUT_CITY_3;
      return `
      <p>Auch die ${tutRes().food} Nahrung sollen nicht verfallen. Eine vierte Stadt kostet
      <b>${foundCost(S, RU(), ...sp)} Nahrung</b> – 6 Basiskosten bei drei bestehenden
      Städten plus Weg. Teuer, aber es ist die einzige Ausgabe, die dauerhaft etwas
      zurückgibt.</p>
      <p><b>Warum dieses Feld?</b> Ringsum liegen ${tutNeighbourText(...sp)}, das bringt
      <b>${tutGainText(...sp)}</b> je Runde. Es liegt südlich deiner Hauptstadt, also im
      Rücken – weg von der griechischen Grenze, wo gerade gekämpft wird.
      ${sp[0] === TUT_CITY_3[0] && sp[1] === TUT_CITY_3[1] ? '' :
        '<br><i>Hinweis: Der vorgesehene Platz ist inzwischen belegt – deshalb dieses Feld.</i>'}</p>
      <div class="tut-key"><b>Merke</b> Vier Städte sind fast immer besser als zwei große:
      jede bringt eigene Felder, wächst billiger und verteilt das Risiko. Die Basiskosten
      steigen zwar (1/3/6/10), aber sie sind einmalig – der Ertrag bleibt.</div>`;
    },
    enter: () => { ui.tutSpot3 = tutSpot(TUT_CITY_3); },
    task: 'Tippe das <b>goldene Feld</b> an und wähle <b>Stadt gründen</b>.',
    hl: () => [ui.tutSpot3 || TUT_CITY_3],
    allow: { bar: [], labels: [/Stadt gründen/], hex: () => [ui.tutSpot3 || TUT_CITY_3] },
    goal: () => {
      const c = cityOn(...(ui.tutSpot3 || TUT_CITY_3));
      return !!c && c.owner === RU();
    },
    auto: () => foundCity(S, RU(), ...(ui.tutSpot3 || TUT_CITY_3)),
  },
  {
    sub: 'Zugablauf 3 von 5 · Aktion',
    t: 'Straßen: die Städte verbinden',
    html: () => {
      const offen = TUT_ROADS.filter(([r, c]) => roadLevel(S, r, c) < 1);
      const tr = tradeRoutes(S, RU());
      // Was die vier Straßen zusammen bringen: einmal mit, einmal ohne durchrechnen
      const merk = {};
      for (const [r, c] of TUT_ROADS) { merk[key(r, c)] = S.roads[key(r, c)]; S.roads[key(r, c)] = 1; }
      const dann = tradeRoutes(S, RU());
      for (const [r, c] of TUT_ROADS) {
        if (merk[key(r, c)] == null) delete S.roads[key(r, c)];
        else S.roads[key(r, c)] = merk[key(r, c)];
      }
      return `
      <p>Mit dem <b>Rad</b> kannst du Felder pflastern. Eine Straße kostet <b>1 Münze</b>
      und halbiert dort die Bewegungskosten – aber der eigentliche Gewinn ist ein anderer:</p>
      <div class="tut-key"><b>Handelsrouten</b> Jede deiner Städte außer der Hauptstadt, die
      über einen <b>durchgehenden Weg</b> mit ihr verbunden ist, bringt jede Runde
      <b>+1 Wissenschaft, +1 Nahrung und +1 Münze</b>. Liegt auf der ganzen Strecke
      <b>Eisenbahn</b>, sind es <b>+2</b>. Gemischt zählt der kleinere Wert – ein einziges
      Straßenfeld drückt die Strecke von +2 auf +1.</div>
      <p>Du hast <b>${tutRes().coins} Münzen</b> und brauchst genau
      <b>${offen.length}</b> davon: die vier golden umrandeten Felder hängen alle drei
      Nebenstädte an die Hauptstadt.</p>
      <p>Das bringt ${tr.bonus ? `statt ${tr.bonus}` : ''} <b>+${dann.bonus}</b> auf jeden
      der drei Erträge – jede Runde, dauerhaft, für einmalig ${offen.length} Münzen. Im
      Forschungsbogen taucht dafür die Zeile <b>Handelsrouten</b> auf.</p>`;
    },
    enter: () => { ui.tutRoads = true; },
    task: 'Pflastere die vier <b>goldenen Felder</b> – je Feld antippen und <b>Straße bauen</b>.',
    hl: () => TUT_ROADS.filter(([r, c]) => roadLevel(S, r, c) < 1),
    allow: {
      bar: [], labels: [/Straße bauen/],
      hex: () => TUT_ROADS.filter(([r, c]) => roadLevel(S, r, c) < 1),
    },
    goal: () => TUT_ROADS.every(([r, c]) => roadLevel(S, r, c) >= 1),
    auto: () => { for (const [r, c] of TUT_ROADS) buildRoad(S, RU(), r, c, 1); },
  },
  {
    sub: 'Zugablauf 4 von 5 · Kampf',
    t: 'Zug beenden – und der Rückzug',
    html: () => {
      const t = tutSiegeCity(), a = tutSiegeArmy();
      const def = t ? defenseValue(S, t) : 0;
      const gr = S.players.findIndex(x => x.civ === 'griechenland');
      const gcap = capitalOf(S, gr);
      const atk = a ? attackValue(S, a.owner, armiesOf(S, a.owner).length) : 0;
      return `
      <p>Deine belagerte Stadt steht bei <b>Verteidigung ${def}</b>. Griechenland könnte mit
      seinen ${armiesOf(S, gr).length} Armeen <b>${atk}</b> aufbieten – das würde reichen.</p>
      <p>Beende den Zug und sieh im Protokoll nach, was stattdessen passiert:
      <b>„Armee verteidigt die Hauptstadt"</b>. Deine eine Armee neben der griechischen
      Hauptstadt zieht beide Angreifer ab, und die Belagerung läuft ins Leere.</p>
      <div class="tut-key"><b>Merke</b> „Zug 1/2" ist eine Vorwarnung mit <b>einer Runde</b>
      Reaktionszeit. Mehr Verteidigung zu kaufen ist dabei selten die beste Antwort – der
      Gegner kann nachlegen. Ihm etwas Wertvolleres zu bedrohen, wirkt sofort und kostet
      weniger.</div>
`;
    },
    task: 'Beende den Zug und klick dich durch die Bot-Fenster.',
    allow: { bar: ['a-end', 'a-log'] },
    hl: () => { const t = tutSiegeCity(), a = tutSiegeArmy();
      return [t && [t.r, t.c], a && [a.r, a.c]].filter(Boolean); },
    goal: () => S.round >= 4 && P(S).kind !== 'bot',
    auto: () => {
      let guard = 0;
      while (!S.over && guard++ < 12 && !(S.round >= 4 && P(S).kind !== 'bot')) {
        if (P(S).kind === 'bot') botTurn(S, S.cur);
        finishTurn(S); if (S.over) break; advanceTurn(S);
      }
    },
  },
  {
    sub: 'Grenzen',
    t: 'Jede Bevölkerung isst',
    html: () => {
      /* Wie oft können alle eigenen Städte ZUSAMMEN noch wachsen?
         Früher wurde je Stadt einzeln gezählt und aufsummiert – jede tat dabei so, als
         wüchsen die anderen nicht, und die Summe war ein Vielfaches des Möglichen
         (33 „Schritte" bei 11 Nahrung). Alle Städte teilen sich dieselbe Produktion,
         also muss reihum probiert werden, bis keine mehr kann. */
      const cities = citiesOf(S, RU());
      const merk = cities.map(c => c.pop);
      let room = 0, weiter = true;
      while (weiter && room < 200) {
        weiter = false;
        for (const c of cities) {
          c.pop++;
          if (baseIncome(S, RU()).food >= 0) { room++; weiter = true; }
          else c.pop--;
        }
      }
      cities.forEach((c, i) => c.pop = merk[i]);
      const jetzt = baseIncome(S, RU()).food;
      return `
      <p>Weil jeder Bevölkerungspunkt dauerhaft 1 Nahrung verbraucht, darf deine
      <b>Nahrungsproduktion nie negativ</b> werden. Ist die Grenze erreicht, wird Wachstum
      gesperrt – verhungern tut aber niemand.</p>
      <p>Du produzierst gerade <b>${jetzt} Nahrung</b> über den Verbrauch hinaus. Deine
      Städte können zusammen also noch <b>${room}×</b> wachsen, bevor die Grenze greift –
      egal, wie du die Schritte auf die Städte verteilst.</p>
      <p>Dagegen hilft mehr Ertrag: <b>Landwirtschaft</b> auf Grasland, <b>Kunstdünger</b> im
      Wald, <b>Bewässerung</b> im Gebirge, <b>Ökologie</b>. Oder <b>Gentechnik</b> und
      <b>Massenmedien</b>: mit ihnen lässt sich zu Zugbeginn ein Teil dessen, was die
      Bevölkerung isst, aus Wissenschaft bzw. Münzen bestreiten – dann wird der 🌾-Knopf
      oben anklickbar.</p>`;
    },
    hl: () => citiesOf(S, RU()).map(c => [c.r, c.c]),
  },
  {
    sub: 'Zugablauf 5 von 5 · Sieg',
    t: 'Die drei Wege zu gewinnen',
    html: () => {
      const o = victoryOption(S, tutP());
      return `
      <p><b>Forschungssieg</b> – erforsche die <b>Singularität</b>: ${SINGULARITY.c}
      Wissenschaft, mit Wissenschaftlicher Methode 90. Sie verlangt mindestens eine
      Technologie der <b>Moderne in jedem der vier Felder</b>. Für ein Reich, das früh auf
      Multiplikatoren gesetzt hat, ist das oft der kürzeste Weg.</p>
      <p><b>Wirtschaftssieg</b> – wenn du am Zugende über zwei Drittel der Weltbevölkerung
      hast, gewinnst du. Oben links neben dem Rundenzähler siehst du immer den aktuellen
      Bevölkerungsstand: gerade ${popOf(S, RU())} von ${worldPop(S)}. Um hier eine
      realistische Chance zu haben, brauchst du meistens vier bis sechs Städte sowie einige
      der Technologien <b>Keramik</b>, <b>Verbundwerkstoffe</b>, <b>Theologie</b> oder
      <b>Vereinte Nationen</b>.</p>
      <p><b>Militärsieg</b> – erobere eine gegnerische Hauptstadt: zwei Züge in Folge
      stärker sein. Das ist der Weg, auf dem Bots für den menschlichen Spieler meist sehr
      bedrohlich sind.</p>`;
    },
  },
  {
    sub: 'Zum Mitnehmen',
    t: 'Die drei Anfängerfehler',
    html: () => `
      <p><b>Ressourcen liegen lassen.</b> Wissenschaft, Nahrung und Münzen verfallen am
      Zugende. Wer 3 Münzen übrig hat, hätte sie in 1 Nahrung oder 1 Wissenschaft tauschen
      können – jede Runde ein kleiner Verlust, der sich summiert.</p>
      <p><b>Zu früh Macht kaufen.</b> Sie halbiert sich zu Beginn jedes Zuges. Kaufe sie in
      dem Zug, in dem du angreifst oder verteidigst, und dann in einem Rutsch.</p>
      <p><b>Wachsen ohne Nahrung.</b> Jede Bevölkerung isst dauerhaft 1 Nahrung. Ohne
      Landwirtschaft, Kunstdünger, Bewässerung oder Ökologie steht das Wachstum nach wenigen
      Punkten still.</p>
      <div class="tut-key"><b>Und die Faustregel</b> Am stärksten ist die <b>Kombination</b>:
      die wichtigsten Multiplikatoren – Schrift, Landwirtschaft, Papier, Wissenschaftliche
      Methode – <b>zusammen mit vielen Städten</b>. Jede Technologie wirkt auf jedes Feld und
      jede Bevölkerung, die du besitzt; jede neue Stadt vervielfacht rückwirkend alles, was du
      schon erforscht hast. Militär nur so viel, wie du zum Überleben brauchst.</div>`,
  },
  {
    sub: 'Fertig',
    t: 'Ab hier spielst du allein',
    html: () => `
      <p>Das Tutorial ist durch – und dieses Spiel läuft einfach weiter, jetzt ohne
      Einschränkungen. Du stehst in Runde ${S.round} mit
      ${citiesOf(S, RU()).length} Städten, ${popOf(S, RU())} Bevölkerung und
      ${Object.keys(tutP().techs).length} Technologien.</p>
      <p>Der nächste sinnvolle Schritt: weiter wachsen, Nahrungstechnologien nachziehen und
      in jedem Feld ein Zeitalter aufschließen – die Singularität braucht am Ende eine
      Moderne-Technologie in allen vier.</p>
      <p><b>Was das Tutorial nicht gezeigt hat</b>, aber im Spiel steckt: gegnerische Armeen
      <b>flankieren</b> und zerstören (zwei eigene Armeen gegenüberliegend, mit <b>Taktik</b>
      von zwei beliebigen Seiten) · <b>Eisenbahn</b> statt Straße: eine durchgehende Bahn
      verdoppelt den Handelsroutenbonus auf +2 · Technologien mit eigenen Aktionen: <b>Sklaverei</b> (Bevölkerung gegen Münzen opfern), <b>Spionage</b>,
      <b>Kundschafterei</b> und <b>Internet</b> (fremde Technologien kopieren),
      <b>Kolonialismus</b> (Felder kaufen), <b>Atomwaffen</b> (alle Armeen auf einem Feld und
      ringsum entfernen) · und Reichsfähigkeiten, die du im Aufbau umstellen kannst.</p>
      <p>Zwei Dinge helfen immer: <b>Protokoll</b> zeigt jeden Würfelwurf, <b>Regeln &amp;
      Technologien</b> im Menü listet alle Technologien mit ihrer Wirkung.</p>`,
  },
];

/* ------------------------------------------------------ Schienen und Zustand */
function tutStep() { return ui.tut ? TUT_STEPS[ui.tut.i] : null; }
/* Was ist in diesem Schritt erlaubt?
   Leseschritte und bereits erledigte Aufgaben erlauben nur Nachschlagen – sonst könnte man
   den Verlauf verlassen (Stadt irgendwo gründen, Zug ein zweites Mal beenden). */
const TUT_LOOK_ONLY = { bar: ['a-info', 'a-log'], labels: [], hex: () => [], techs: [] };
/* Fehlt ein Schlüssel im allow-Block, heißt das „nichts erlaubt" – nicht „alles erlaubt".
   Sonst schlüpft man z. B. im Protokoll-Schritt (nur bar: ['a-log']) über das Stadtblatt
   an den Schienen vorbei. */
function tutAllow() {
  const st = tutStep();
  if (!st) return { bar: ['a-tech', 'a-power', 'a-army', 'a-info', 'a-log', 'a-end'], labels: null, techs: null };
  if (!st.allow || (st.goal && st.goal())) return TUT_LOOK_ONLY;   // Leseschritt oder erledigt
  return Object.assign({ bar: [], labels: [], techs: [] }, st.allow);
}
function sameHex(a, r, c) { return a && a[0] === r && a[1] === c; }
function tutHexOk(r, c) {
  const al = tutAllow();
  if (!al.hex) return true;
  if (r == null || c == null) return true;   // Aufruf ohne Feld (Macht-/Armeeblatt)
  return al.hex().some(h => sameHex(h, r, c));
}
function tutMoveOk(r, c) {
  const al = tutAllow();
  if (!al.moveTo) return true;
  return al.moveTo().some(h => sameHex(h, r, c));
}
/* Aktionsblatt filtern: nur die Knöpfe des Schritts bleiben aktiv. */
function tutGateSheet(r, c) {
  const al = tutAllow();
  const body = $('sheet-body');
  if (!body) return;
  body.querySelectorAll('.opt').forEach(b => {
    const txt = b.textContent || '';
    const okLabel = al.labels === null || al.labels.some(rx => rx.test(txt));
    if (!okLabel || !tutHexOk(r, c)) b.disabled = true;
  });
}
/* Technologiebogen filtern: nur die vorgesehenen Kacheln bleiben aktiv. */
function tutGateTechs() {
  const al = tutAllow();
  const body = $('ov-body');
  if (!body) return;
  body.querySelectorAll('[data-tech]').forEach(b => {
    if (al.techs !== null && !al.techs.includes(b.dataset.tech)) b.disabled = true;
  });
  body.querySelectorAll('[data-copy], [data-freetech], [data-backtech], [data-free]')
    .forEach(b => { b.disabled = true; });
}
function tutHighlight() {
  const st = tutStep();
  if (!st || !st.hl) return null;
  try { return st.hl().filter(Boolean); } catch (e) { return null; }
}
function tutDone() {
  const st = tutStep();
  return !st || !st.goal || !!st.goal();
}
/* Aufgabentexte sprechen über die goldene Umrandung, nicht über Koordinaten. */
function tutTaskText(st) { return st.task || ''; }

/* Spielstand des Übungsspiels aufbauen – ohne Oberfläche, damit test.js denselben Weg
   nimmt wie die App. Reihenfolge wichtig: erst ui (und damit die Würfelfolge), dann
   newGame, sonst würfelt der Aufbau frei. */
function tutorialSetup() {
  ui = { sel: null, army: null, mode: null, botTimer: null, tut: { i: 0, seen: {}, die: 0 } };
  S = newGame({
    seed: TUT_SEED, map: MAP_ORIGINAL, startPlayer: 0,
    players: [
      { civ: 'russland', kind: 'human', ability: 'basis' },
      { civ: 'griechenland', kind: 'bot', diff: 'david' },
      { civ: 'england', kind: 'bot', diff: 'david' },
      { civ: 'wikinger', kind: 'bot', diff: 'david' },
    ],
  });
  // Verfügbarkeit setzen statt würfeln: der Verlauf ist damit bei jedem Start gleich
  const p = S.players[RU()];
  p.avail = {};
  TUT_START_AVAIL.forEach(k => { p.avail[k] = true; });
  log(S, 'info', 'Tutorial: verfügbare Technologien der Antike festgelegt – ' +
    TUT_START_AVAIL.map(k => TECH_BY_KEY[k].n).join(', ') + '.');
}
function tutorialStart() {
  tutorialSetup();
  $('tut-panel').hidden = false;
  document.body.classList.add('tut');
  tutEnter();
  startGameScreen();
}
function tutEnter() {
  const st = tutStep();
  if (!st || ui.tut.seen[ui.tut.i]) return;
  ui.tut.seen[ui.tut.i] = true;
  if (st.dice) ui.tut.pre = st.dice.slice();     // vorgegebene Würfe dieses Schritts
  if (st.enter) st.enter();
}
function renderTutPanel() {
  const st = tutStep();
  if (!st) return;
  $('tut-sub').textContent = st.sub;
  $('tut-title').textContent = st.t;
  $('tut-body').innerHTML = typeof st.html === 'function' ? st.html() : st.html;
  const done = tutDone(), last = ui.tut.i === TUT_STEPS.length - 1;
  const task = $('tut-task');
  task.hidden = !st.task || done;
  if (st.task) task.innerHTML = '<b>Deine Aufgabe:</b> ' + tutTaskText(st);
  $('tut-count').textContent = `${ui.tut.i + 1}/${TUT_STEPS.length}`;
  $('tut-bar-fill').style.width = Math.round(((ui.tut.i + 1) / TUT_STEPS.length) * 100) + '%';
  $('tut-prev').disabled = ui.tut.i === 0;
  $('tut-next').disabled = !done;
  $('tut-next').textContent = last ? 'Fertig' : 'Weiter ›';
  tutMaybeAdvance();
}
function tutMove(d) {
  if (!ui.tut) return;
  if (d > 0 && ui.tut.i === TUT_STEPS.length - 1) return tutorialQuit();
  if (d > 0 && !tutDone()) return;
  ui.tut.i = Math.max(0, Math.min(TUT_STEPS.length - 1, ui.tut.i + d));
  ui.army = null;
  tutEnter();
  redraw();
  const sc = $('tut-panel').querySelector('.tut-scroll');
  if (sc) sc.scrollTop = 0;
}
/* Erledigte Aufgabe = nächster Schritt. Wer gerade gesiedelt oder geforscht hat, soll
   nicht noch „Weiter" drücken müssen.
   Bewusst nicht automatisch:
   · der letzte Schritt – „Weiter" heißt dort „Fertig" und beendet das Tutorial,
   · solange ein Bot-Fenster offen ist (dort führt allein „Weiter" weiter),
   · solange eine kostenlose Technologie oder eine Rückschau offen ist,
   · bei Leseschritten mit `keepOpen` – dort wird gewartet, bis das Fenster wieder zu ist
     (closeModal stößt die Prüfung erneut an), sonst risse es dem Leser das Protokoll weg.
   Die kurze Verzögerung lässt das Ergebnis der eigenen Aktion noch sehen. Sie ändert
   nichts an der Würfelfolge: zwischen „Ziel erreicht" und dem Weiterschalten wird nicht
   gewürfelt, weil erledigte Schritte ohnehin nur noch Nachschlagen erlauben. */
let TUT_AUTO_MS = 900;                 // in Tests auf 0 → sofort, damit synchron prüfbar
function tutMaybeAdvance() {
  if (!ui || !ui.tut || ui.tutAuto) return;
  const st = tutStep();
  if (!st || !st.goal || !tutDone()) return;
  if (ui.tut.i >= TUT_STEPS.length - 1) return;
  if (ui.botLock) return;
  const p = tutP();
  if ((p.freePicks || []).some(c => c.n > 0) || (p.backPicks || []).length) return;
  const overlayOpen = $('overlay') && $('overlay').classList.contains('show');
  if (st.keepOpen && overlayOpen) return;
  const from = ui.tut.i;
  ui.tutAuto = true;
  const go = () => {
    if (!ui.tut || ui.tut.i !== from || !tutDone()) { ui.tutAuto = false; return; }
    closeSheet(); closeModal();
    tutMove(1);
    ui.tutAuto = false;                // erst danach frei: eine Stufe je Aktion, keine Kette
  };
  if (TUT_AUTO_MS > 0 && typeof setTimeout === 'function') setTimeout(go, TUT_AUTO_MS);
  else go();
}
function tutorialQuit() {
  ui.tut = null;
  $('tut-panel').hidden = true;
  document.body.classList.remove('tut');
  redraw();
  toast('Tutorial beendet – das Spiel läuft weiter.');
}
