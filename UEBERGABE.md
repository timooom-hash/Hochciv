# Hochzeivilization — Projekt-Übergabe (Stand 27.8., `sw.js` v52)

Dieses Dokument ist so geschrieben, dass es in einen neuen Chat kopiert werden kann.

## Was das ist

Eine **offline spielbare Web-App** eines selbstgebauten Civilization-artigen Hex-Brettspiels,
gebaut für den Autor (deutschsprachig). Zielplattform: **iPad, über GitHub Pages zum
Home-Bildschirm hinzugefügt** (PWA, funktioniert offline). Vollständige Regel-Engine mit
automatischen Bots, Solo-gegen-Bots und Hotseat für 2–4 Menschen. Deutsche Oberfläche.

## Wo alles liegt

- **Arbeitsverzeichnis:** `/home/claude/hochciv/` — **wird bei Container-Resets geleert.**
  Zu Beginn jeder Session wiederherstellen:
  `mkdir -p /home/claude/hochciv && cd /home/claude && unzip -o -q /mnt/user-data/uploads/hochzeivilization.zip -d /home/claude/unz && cp -r /home/claude/unz/hochzeivilization/. /home/claude/hochciv/`
  (oder aus `/mnt/user-data/outputs/hochzeivilization/`, falls noch vorhanden).
  Danach `npm install jsdom --no-fund --no-audit` — für `smoke.js` und `check_single.js` nötig.
- **Deliverables in `/mnt/user-data/outputs/`:** Ordner `hochzeivilization/` (21 Dateien),
  `hochzeivilization.zip`, und `hochzeivilization-einzeldatei.html` — Letzteres ist, was der
  Autor tatsächlich aufs iPad lädt.
- **Wichtig beim Paketieren:** `node_modules` und `package*.json` ausschließen
  (`tar -c --exclude=node_modules --exclude='package*.json' .` bzw. `zip -x '*/node_modules/*'`).
  Einmal ist ein `node_modules` ins Zip gerutscht und ließ sich wegen eines I/O-Fehlers auf dem
  Mount nicht mehr löschen — nur durch Umbenennen aus dem Ordner heraus lösbar.

## Dateistruktur (~10 400 Zeilen)

| Datei | Zeilen | Inhalt |
|---|---|---|
| `js/i18n.js` | 1032 | Sprachen: `LANG`, `setLang`, `DATA_EN` (Spielobjekte), `UI_EN` + `T()` (Oberflächensätze), `missingStrings()` |
| `js/data.js` | 349 | `APP_VERSION`, TERRAIN (inkl. Vulkan und `X` „Kein Feld"), TECHS (66, davon 62 Grundspiel), CIVS mit je 3 Fähigkeiten, feste Karten, `mapRng`, EVENT_ROWS (18), WONDERS (18), Regelkonstanten |
| `js/hex.js` | 108 | Hexraster (pointy-top, odd-r), `hexDistance`, `reachable`, `pathSteps` |
| `js/tiles.js` | 267 | Dreiecksplättchen: Würfelgeometrie, `TILE_POOL` (20), `TILE_SHAPES` (2/3/4), Plan, Legeregeln, Kartenbau |
| `js/engine.js` | 1512 | Kernregeln: Einkommen, Kurse, Kampf, Bewegung, Wachstum inkl. Nahrungsgrenze, Handelsrouten, Zivilisationsfähigkeiten, Sieg, Zugablauf, Protokoll |
| `js/expansion.js` | 515 | Ereignisse, Barbaren (neutrale Fraktion), Weltwunder, Kultursieg, Bot-Wunderbau |
| `js/bots.js` | 480 | Bot-Züge, Siedlerbewegung, **neunstufige Armeeprioritäten** (`botPlanArmies` für 1–6, `botMoveArmy` für 7–9), Bot-Forschung |
| `js/ui.js` | 1674 | SVG-Karte, Antippen, Aktionsblätter, Technologiebogen, Nahrungsfenster, Aufbau (inkl. 1-gegen-1), Editor, Kurzregeln , Legephase (`screen-place`) |
| `js/tutorial.js` | 627 | Geführtes Übungsspiel: **29 Schritte** (19 mit Aufgabe), feste Würfelfolge, Schienen, feste Texte |
| `test.js` | 3765 | **1094 Assertions**, `node test.js` |
| `smoke.js` | 1861 | **91 Schritte** durch die echte UI via jsdom, `node smoke.js` |
| `build_single.py` / `check_single.js` | 20 / 34 | Einzeldatei bauen und in jsdom prüfen (inkl. Plättchenkarte) |
| `tools_startplaettchen_dump.js` / `tools_startplaettchen_pdf.py` | 30 / 210 | Druckbogen `Startplaettchen.pdf` aus `js/tiles.js` erzeugen (reportlab) |
| `ANNAHMEN.md` | — | **Alle Regelauslegungen und Entscheidungen.** Bei Regelfragen zuerst hier nachsehen. |

Weitere: `index.html`, `css/style.css`, `sw.js` (**VERSION hochzählen — zusammen mit
`APP_VERSION` in `js/data.js`**, ein Test bindet beide aneinander), `manifest.webmanifest`,
`icons/`, `README.md`.

## Regelheft

Der Autor hat das vollständige PDF geliefert (`Hochzeivilization_3.pdf`) sowie die Bögen
`Civs.pdf`, `Ereignisse.pdf`, `Wunder.pdf`. **Liegen nicht im Arbeitsverzeichnis.** Falls
Regeln gegengeprüft werden müssen: den Autor bitten, sie erneut hochzuladen — nicht aus dem
Gedächtnis rekonstruieren.

## Was das Spiel heute kann

- **Eine Regelvariante.** Die früher „experimentell v2" genannten Regeln sind der Standard:
  Singularität 100, Keramik und Theologie in der Techliste, Verbundwerkstoffe = kostenloses
  Wachstum, Sklaverei ab Moderne obsolet (im Bogen durchgestrichen), Siegschwellen stapeln
  nicht, Bots forschen zweimal. Griechenland hat **keinen** Würfelbonus.
- **Zivilisationsfähigkeiten:** je Reich drei zur Wahl (Grund + zwei Alternativen aus dem
  Civs-Bogen), im Aufbau umschaltbar. **Bots erhalten keinerlei Fähigkeit.**
- **Nahrungsgrenze:** Die Nahrungsproduktion darf nicht negativ werden, Wachstum wird sonst
  blockiert — gerechnet auf dem **dauerhaften** Wert (`baseIncome`), ein Ereignis dieser
  Runde zählt nicht. Gentechnik und Massenmedien heben die Grenze auf: zu Zugbeginn öffnet
  sich ein Fenster, in dem sich die **Bevölkerungskosten** aus Wissenschaft oder Münzen
  bestreiten lassen — höchstens bis zur Höhe dieser Kosten, also kein Umtausch.
- **Handelsrouten:** Jede eigene Stadt außer der Hauptstadt, die über einen durchgehenden
  Weg mit ihr verbunden ist, bringt +1 auf alle Erträge; bei reiner Eisenbahn +2. Gemischte
  Strecken zählen als Straße.
- **Ereignisse** (Erweiterung, hart/leicht) mit Barbaren als neutraler Fraktion.
- **Weltwunder** (Erweiterung) mit Pyramidenregel, Kultursieg und vier eigenen Technologien
  (Baukräne, Wallfahrt, Militärlogistik, Raumfahrt). Bots bauen sie kostenlos, **ohne Effekte**
  — einzige Ausnahme: Militärlogistik wirkt auch für Bots.
- **Karten:** Originalkarte (Standard), Große Karte, **Plättchenkarte** (die Zufallskarte,
  aus Dreiecken, eigene Form je Spielerzahl), eigene aus dem Editor. Der alte
  Rastergenerator (12 × 18 bzw. 12 × 8) ist in v51 **ersatzlos entfallen**, samt
  `randomMap`, `duelMap`, `makeRandomMap`, `MAP_MIX`, `RANDOM_CAPITALS`, `startFood`,
  `startSpots`, `carveSpot`, `boostFood`. Geblieben ist aus dem Block nur `mapRng`.
- **Startplätze der Viererkarte (v51):** die **beiden oberen und die beiden unteren**
  Dreiecke (Plätze 1, 3, 6, 8 – die einzigen, deren Fünferzeile auf der Ober- oder
  Unterkante liegt), nicht mehr jedes zweite des äußeren Rings. Dadurch liegen die Starts
  enger: Hauptstadtabstand im Median 7 statt 9, erlaubte Felder 11 statt 13–14 von 15.
- **Plättchenkarte + Legephase:** 20 handentworfene Dreiecke zu 15 Feldern (`js/tiles.js`).
  2 Reiche → Sechseck aus 6 (Mitte bleibt **als Loch offen**), 3 → großes Dreieck aus 9
  (Loch), 4 → gestrecktes Sechseck aus 10 (lückenlos). Jedes Reich legt sein Startdreieck
  **verdeckt**: eine von drei Lagen, Hauptstadt frei auf Land (gesperrt nur, was einer
  fremden Hauptstadt näher als 3 kommen könnte). Bots legen zufällig auf eines der drei
  mittigen Felder. Danach Aufdecken, dann startet das Spiel.
- **Sprachen (v52):** zwei Flaggen im Menü, Deutsch ist Vorgabe und Quelle. Datentexte über
  `DATA_EN` (Tabelle, kein Eingriff im Code), Oberflächensätze über `T('deutscher Satz')`
  mit `UI_EN` (482 Einträge). Übersetzt sind Menü, Aufbau, alle Blätter, Technologiebogen,
  Protokoll, Spielende, Regelbogen, Editor und das **komplette Tutorial** (482 Einträge).
  `smoke.js` läuft die Oberfläche auf Englisch ab, Grenze für deutsche Reste: 2.
  **Achtung:** Das Tutorial filtert Knöpfe nach `data-label` (deutscher Schlüssel), nicht
  nach der sichtbaren Beschriftung – wer `btn()` umbaut, muss das mitnehmen, sonst hängt
  das Tutorial in der Fremdsprache. `TUT_STEPS` wird beim Laden gebaut – Titel und Aufgaben dort erst beim
  Anzeigen übersetzen (`T(st.t)`), sonst frieren sie auf Deutsch ein. Alte Protokollzeilen
  behalten ihre Sprache (das Protokoll speichert Sätze, keine Schlüssel).
- **Aufbau (v51):** Zivilisation, Fähigkeit und Startspieler lassen sich **auslosen**
  („Zufall", aufgelöst erst beim Start in `resolveRandom`); bei mehr als einem Menschen ist
  der zufällige Startspieler die Vorgabe. Doppelgänger bekommen **je eine der vier
  Zivilisationsfarben**, keine Schattierungen.
- **Siegschwellen:** `VICTORY_LABEL` / `DUEL_VICTORY_LABEL` in `js/data.js` sind die eine
  Quelle für Rechnung (`victoryOption`) und Anzeige (`techEffect`, Regelübersicht). Im
  Duell zeigte der Bogen vorher die Werte des Vierspielerspiels.
- **Zivilisationen (v51):** Auf Plättchenkarten darf jeder Platz frei wählen, **auch
  mehrfach dieselbe** (Doppelgänger: „Russland I/II/III", eigene Farbschattierung). Auf
  festen Karten bleibt jede Zivilisation einmalig. Identität ist damit `p.slot`, nicht
  `p.civ`: Plättchenkarten führen `map.capitals` als **Liste** `[{civ,r,c}]`, feste Karten
  weiter als Objekt; `capitalSpot()` kennt beide.
- **Spielerzahlen 2, 3 und 4.** „Drei Reiche" ist neu (Standard-Siegschwellen, nicht die
  des Duells); freie Zivilisationswahl bei 2 und 3.
- **1 gegen 1:** zwei frei gewählte Reiche, immer die Plättchenkarte aus sechs Dreiecken
  (die Kartenzeile bleibt deshalb weg), Wirtschaftssieg erst über 3/4 (Theologie 7/10,
  UN 2/3).
- **Spielende (v51):** Nur der **Militärsieg** endet sofort. Wirtschafts-, Forschungs- und
  Kultursieg werden **angemeldet** (`claimVictory`, `S.claims`, `S.endRound`); gespielt wird
  bis zum **Rundenende**, dort entscheidet `resolveClaims`. Mehrere Ansprüche in derselben
  Runde ⇒ **Punkte = Bevölkerung + Wunder + Technologien**. Ein Anspruch bleibt gültig, auch
  wenn die Bedingung später wegfällt. **Gleichstand: Mensch vor Bot**; mehrere Menschen
  gleichauf teilen den Sieg. Barbaren gewinnen nie. Details in `ANNAHMEN.md`.
- **Tutorial:** geführtes Übungsspiel in der normalen Oberfläche, 29 Schritte, 19 mit Aufgabe.

## Verifikationsmethoden (etabliert, unbedingt beibehalten)

1. **`node test.js`** muss grün sein — 816 Assertions, darunter die Rechnungen aus dem
   Regelheft-Beispiel, ein Test je geänderter Regel, 40 Bot-Partien, 40 mit Erweiterungen,
   20 Mensch-Partien, 20 Duelle, der komplette Tutorial-Durchlauf (zweimal, auf Gleichheit).
2. **`node smoke.js`** fährt die echte UI durch jsdom (68 Schritte), inklusive
   Tutorial-Audit: in jedem der 29 Schritte wird geprüft, dass **nur** das Vorgesehene
   anklickbar ist — und dass überhaupt etwas anklickbar ist (beide Richtungen!).
3. **`python3 build_single.py && node check_single.js`** — Einzeldatei bauen und prüfen.
4. **Visuelle Kontrolle:** `playwright` (chromium) für die echte Oberfläche,
   `cairosvg` für SVG-Karten, dann mit dem `view`-Tool ansehen. Beides ist installiert;
   `playwright install` schlägt fehl, der mitgelieferte Chromium funktioniert trotzdem.
5. **Immer reproduzieren, nicht raten.** Die erste Vermutung war wiederholt falsch: der
   „leere Toast" war das geschlossene Aktionsblatt; die Wikinger-Fähigkeit war nicht kaputt,
   sondern kam eine Runde zu spät; mehr Forschungssiege mit Weltwundern waren Rauschen
   (60 Partien zu wenig, über 300 identisch). Zuletzt: „Eisenbahn ohne Rad" waren **zwei**
   Fehler, und der naheliegende Ein-Zeilen-Fix hätte nur den ersten behoben.
6. **Messen statt behaupten.** Bei Balance- und Häufigkeitsaussagen mit ausreichend großen
   Stichproben arbeiten und die Zahl nennen.

## Oberfläche und Regeln (Stand 22.8.)

- **Die Karte ist fest** — kein Zoomen, kein Schieben, immer vollständig sichtbar. Getippt
  wird direkt auf dem Sechseck (`attachTaps`, `data-r`/`data-c`), nicht über eine
  Koordinatenrechnung. Gilt auch für den Karteneditor.
- **Querformat:** Manifest `orientation: landscape`, dazu `screen.orientation.lock` wo
  vorhanden. **Auf iOS greift beides nicht** — dort dreht `html.turn` die App im Hochformat
  selbst um 90°. Abschaltbar im ☰-Menü. **Gedreht wird nur `screen-game`** (Liste
  `TURN_SCREENS`, nachgeführt aus `show()` über `applyTurn()`); Menü, Aufbau und Editor
  bleiben in der Lage, in der das Gerät gehalten wird.
- **`syncLayout()` statt Media Queries** für alles Layoutkritische: gedreht messen Media
  Queries den falschen Viewport. Klassen auf `<html>`: `w-wide`, `w-side`, `w-narrow`.
- **Das Aktionsblatt endet über der Leiste** (`--bar-h` aus `setBarHeight()`), sperrt sie
  also nicht mehr. `body.blocked` gilt nur noch fürs Bot-Fenster.
- **Tutorial:** erledigte Aufgaben schalten selbst weiter (`tutMaybeAdvance`,
  `TUT_AUTO_MS`); das Panel steht quer links neben der Karte.
- **Protokoll:** Würfe hängen eingeklappt an ihrer Aktionszeile (`logHtml`/`rollsBlock`).
- **Handelsrouten** (`tradeRoutes` in `engine.js`): Städte, die über einen durchgehenden
  Weg an der Hauptstadt hängen, bringen +1 (Straße) bzw. +2 (reine Eisenbahn) auf alle
  Erträge. Zwei getrennte Suchen — daher greift die Mischungsregel von selbst.
- **Nahrung:** Die Bevölkerungskosten (`popFood`) lassen sich mit Gentechnik/Massenmedien
  aus Wissenschaft oder Münzen bestreiten (`coverPop`/`uncoverPop`), höchstens bis zur
  Höhe der echten Kosten. Das Fenster (`foodSheet`) geht zu Zugbeginn auf.
  `ensureFoodState` zieht die Felder in alten Spielständen nach.
- **Feldblatt:** Feldertrag klein in der Unterzeile; **Ertrag beim Siedeln**
  (`settleGain` in `engine.js`) als Kästchen — aber nur, wo auch gegründet werden kann.
- **Technologiebogen:** verfügbare Kacheln sind grafisch geteilt in bezahlbar (`afford`,
  durchgezogen) und zu teuer (`costly`, gestrichelt). Maßstab ist `available(…, 'sci')`,
  Münzen zählen also über den Umrechnungskurs mit. **`costly` darf keine Deckkraft unter 1
  bekommen** – sonst verblasst der rote Rand und die Kachel sieht aus wie eine nicht
  verfügbare (ein Smoke-Test prüft das).

Alles Weitere steht ausführlich in `ANNAHMEN.md` — dort ist jede Änderung mit
Begründung und Messung festgehalten, chronologisch nach Versionen.

## Bekannte Fragilitäten

- **`sw.js`-Version** nach *jeder* Änderung hochzählen, sonst behält das installierte iPad
  den alten Stand.
- **Feste Spielerreihenfolge** Russland → Griechenland → England → Wikinger. Die gewünschte
  Zivilisation landet nicht automatisch auf Index 0; Test-Helfer `normalize()` sortiert um.
  `cfg.startPlayer` zeigt in die **Aufbau-Liste** (CIVS-Reihenfolge), nicht in die Zugreihenfolge.
- **Runde und Ereignis** wechseln beim **Startspieler** (`S.startIdx`), nicht bei Index 0.
- **`hasWonder` heißt „wirkt für dieses Reich"** und ist für Bots immer falsch; für reines
  Eigentum gibt es `ownsWonder`.
- **Tutorial-Schienen:** Ein fehlender Schlüssel in `allow` heißt „nichts erlaubt". Wer neue
  Schritte hinzufügt, muss `bar`, `labels`, `techs`, ggf. `hex`/`moveTo` setzen — sonst ist
  der Schritt eine Sackgasse (das Smoke-Audit meldet beides).
- **Mehrere Kosten immer über `payAll`/`affordAll`.** Zwei einzelne `available`-Prüfungen
  gegen denselben Vorrat sind falsch, weil sich die Ressourcen ineinander umtauschen
  lassen. Und der Rückgabewert von `pay` gehört ausgewertet.
- **Die Oberfläche darf Regelentscheidungen nicht selbst herleiten.** Zweimal derselbe
  Fehler: `payOpts` (Bürgerkrieg) und `roadTarget` (Eisenbahn ohne Rad). Wer im Blatt eine
  Bedingung schreibt, die die Regelmaschine auch kennt, muss deren Funktion benutzen.
- **Jede neue Kaufprüfung in der Oberfläche muss `payOpts(S, pi)` mitgeben**, sonst
  weicht sie von dem ab, was `pay()` tatsächlich erlaubt (das war der Bürgerkriegs-Fehler).
- **Smoke-Tests, die auf einem frischen Spiel aufsetzen, müssen ihre Ausgangslage selbst
  herstellen** (Nahrung, Wissenschaft, Verfügbarkeit setzen). `frischesSpiel()` würfelt
  Startreich und Technologieverfügbarkeit aus; zwei Tests hingen daran und schlugen in
  etwa der Hälfte der Läufe fehl (gefunden und behoben am 21.8.). Neue Tests deshalb
  mehrfach laufen lassen, nicht einmal.
- **`TUT_AUTO_MS`** steht in den Tests auf 0, damit das Auto-Weiterschalten synchron
  prüfbar ist. Wer den Tutorialteil von `smoke.js` umbaut, darf nicht mehr blind
  `tut-next` klicken — der Schritt ist nach einer erledigten Aufgabe schon weiter. Der
  Index kommt aus `tut-count`.
- **Gedrehte Darstellung und Media Queries** vertragen sich nicht. Neue layoutkritische
  Regeln gehören an `w-wide`/`w-side`/`w-narrow`, nicht an `@media (min-width…)`.
- **Tutorial-Determinismus** hängt an drei Dingen zusammen: feste Würfelfolge `TUT_DICE`,
  vorgegebene Würfe je Schritt (`dice`) und die Schienen. Ändert sich die Engine an einer
  Stelle, die Würfe verbraucht, verschiebt sich der ganze Ablauf — dann die Textstellen
  prüfen, die Bot-Verhalten beschreiben, und ggf. eine neue Würfelfolge suchen (in `test.js`
  ist der Ablauf zweimal auf Gleichheit gepinnt).

### Gründungskosten (geändert in v51)

`foundCost` rechnet Stadtkosten (1/3/6/10 …) + Distanzkosten. Englands **Kolonisten**
streicht die Stadtkosten, **Kartografie** die Distanzkosten. Beides zusammen kostete bis
v50 pauschal 1 Nahrung – ab der dritten Stadt praktisch gratis. Jetzt zahlt man die
**günstigere der beiden** Kosten, also anfangs die Stadtkosten und später den Weg. Die
Einzelvergünstigungen sind unverändert; der Mindestbetrag von 1 bleibt nur als Sperre
gegen 0-Kosten-Sonderfälle (Reich ohne Stadt).

### Siegansprüche (neu in v51)

- `S.over` wird an **zwei** Stellen gesetzt: sofort in `captureCity` (Militärsieg,
  `military: true`) und am Rundenende in `resolveClaims`. Alles andere geht über
  `claimVictory` – wer eine neue Siegbedingung einbaut, muss `claimVictory` benutzen,
  sonst endet das Spiel wieder mitten in der Runde.
- `resolveClaims` hängt in `advanceTurn` **genau an der Stelle, an der die Runde
  umschlägt** (`S.cur === first`, vor `S.round++`). Wer dort etwas umbaut, verschiebt das
  Spielende.
- Die Balance hat sich dadurch messbar verschoben (Militärsiege 49 % → 60 % über 200
  Bot-Partien, siehe `ANNAHMEN.md`). Beim nächsten Balance-Vergleich daran denken: Zahlen
  vor v51 sind nicht mehr vergleichbar.
- Alte Spielstände haben `claims`/`endRound` nicht; alle Zugriffe sind deshalb
  `(S.claims || [])`-fest.

### Plättchengeometrie (neu in v50)

- **Zeilenversatz:** Jede Form muss in einer **geraden** Zeile beginnen. Bei odd-r-Versatz
  kippt eine Verschiebung um eine ungerade Zeilenzahl den Versatz und verzerrt die Form.
  Die Anker in `TILE_SHAPES` sind entsprechend gelegt, ein Test prüft es.
- **Dreiecke aus 15 Feldern können die Ebene nicht periodisch parkettieren**
  (15 und 30 sind keine Normen der Form a² + ab + b²). Neue Formen deshalb **nicht**
  durch Fortsetzen eines Musters erfinden, sondern rechnen lassen: Überlappungen und
  Innenlücken prüft der Formteil in `test.js` für jede Form automatisch.
- **Zwei Windräder können sich keine zwei Plättchen teilen** — die Mitte des zweiten läge
  im Radius des ersten Sechsecks. Deshalb ist die Vierer-Karte ein Streifenverbund und
  keine „zwei Sechsecke".
- Wer Plättchen ergänzt: die drei mittigen Felder müssen Land sein **und** je mindestens
  4 Nahrung bringen (Bots setzen dort). Der Test rechnet es nach und nennt die Spanne.
  Zusätzlich geprüft: mit Russlands Bevölkerung 2 bleibt je Plättchen **mindestens ein**
  mittiges Feld bei 4 (8 der 60 fallen dort auf 3, siehe `ANNAHMEN.md`).
- **Meer nur am Rand**, und mit Dichte: einzelne Meerfelder in den Ecken bringen fast
  nichts, weil sie beim Zusammenlegen selten auf anderes Meer treffen. Erst ab etwa einem
  Viertel Meeranteil entstehen zusammenhängende Flächen (Schwellenverhalten, Zahlen in
  `ANNAHMEN.md`). Der Test misst die größte Meeresfläche über feste Startwerte mit.

## Vollständige Bug-Historie (alle behoben — nicht versehentlich rückgängig machen)

Aus früheren Sitzungen: Bürokratie verdoppelt Hauptstadt-Umland und Bevölkerung · doppelter
Kampf-Aufruf bei Bots · Stadtfelder zählen als Straße/Eisenbahn · Armee in eigener Stadt
anwählbar · Bot-Armeen nutzen Geländedistanz · Angriffswerte addieren sich · Reichweitensprung
wirkt sofort · England kann Nahrung für Forschung ausgeben · Internet-Gratiskopie ·
Navigation-Armeen halten nicht auf Wasser · v2-Tech-Labels · leeres Bot-Fenster (Log-Kappung).

Aus diesem Chat:
- Gentechnik/Massenmedien waren allgemeine Umtauschkurse — sind jetzt reines Füttern.
- **Alchemie** erlaubte keine Wissenschaft → Nahrung; jetzt transitiv über Münzen (2:1, mit
  Gilden 1:1).
- Rundenwechsel und Ereignis hingen an Index 0 statt am Startspieler.
- **Rückschau** wurde nur von bezahlter Forschung ausgelöst, nicht von kostenloser; außerdem
  gab es nur einen Anspruchsplatz — Oxford verlor einen. Beides sind jetzt Warteschlangen
  (`p.freePicks`, `p.backPicks`).
- **Oxford** konnte die Singularität nicht wählen (sie steht in keiner Techliste) und seine
  zweite Wahl wuchs mit neu freigeschalteten Techs — jetzt Momentaufnahme beim Bau.
- **Gründungsdistanz** wurde bei fehlendem Landweg als Luftlinie gerechnet — man konnte ohne
  Navigation auf Inseln siedeln. Jetzt Weg über passierbare Felder, sonst gesperrt.
- **Bot-Siedler** blieb in Landtaschen stecken (England 32 % Fehlschläge in Runde 1); jetzt
  die neuere Regelheft-Fassung, 0 %.
- Bots erhielten Wundereffekte (Große Mauer, Stonehenge, Kreml) und Effekte der neuen Techs.
- **Verbundwerkstoffe** erlaubte statt des kostenlosen Wachstums auch ein zweites bezahltes.
- Atomschlag-Knopf blieb bei Atomwaffenprotesten aktiv und lief ins Leere.
- Aktionsblatt lag auf breiten Geräten über „Zug beenden"; geschlossen blieb ein leerer
  Kasten stehen.
- Tutorial: Schienen-Lücke bei Schritten mit unvollständigem `allow`; Papier wurde still
  freigeschaltet statt ausgewürfelt.

Aus der Sitzung vom 21.–22.8. (Versionen v30–v49), grob nach Themen:

**Regeln und Rechnungen**
- **Bürgerkrieg:** Armee/Macht ließen sich nicht mit einer Mischung aus Nahrung und Münzen
  kaufen. Die Regelmaschine konnte es, die Oberfläche prüfte ohne die Bürgerkriegs-Option.
  Es gibt jetzt `payOpts(S, pi)` als einzige Wahrheit — beide Seiten benutzen sie.
- **Wachstum für 2 statt 3 Münzen:** `canGrow` prüfte Nahrung und Münzen getrennt gegen
  denselben Vorrat, und `growCity` ignorierte den Rückgabewert des zweiten `pay`. Jetzt
  `payAll`/`affordAll` — alles oder nichts, mit Rückrollen.
- **Gentechnik/Massenmedien:** `feed()` schrieb alles über dem Defizit in den
  Nahrungsvorrat und war damit doch ein 1:1-Umtausch. Ersetzt durch `coverPop`: die
  Bevölkerungskosten lassen sich aus Wissenschaft oder Münzen bestreiten, höchstens bis zu
  ihrer Höhe.
- **Nahrungsgrenze hing am Ereignis der Runde:** Dürre und Revolution verboten Wachstum und
  Siedeln, obwohl die Stadt dauerhaft gedeckt war. `growthBlocked` rechnet jetzt über
  `baseIncome()` auf dem dauerhaften Wert (`S.evMuted`).
- **Eisenbahn ohne Rad war nicht baubar:** Das Blatt zeigte den Knopf nur mit Rad und
  leitete die Zielstufe selbst her. Jetzt entscheidet `roadTargets(S, pi, r, c)` aus
  `engine.js`, und Blatt wie `doRoad` benutzen sie. Auf leerem Feld stehen mit beiden
  Technologien **beide** Knöpfe; der Preis kommt immer frisch aus `buildRoad`.
- **Oxford + Singularität:** `freePickModal` prüfte `S.over` nicht — das Spiel war vorbei,
  aber der Siegbildschirm kam nie.
- **Kostenlose Armeen** (Wikinger-Start, Koloss) erscheinen jetzt in der Hauptstadt und
  müssen sie verlassen; beim Koloss nacheinander über die Warteschlange `p.freeArmies`
  (`spawnFreeArmies`, aufgerufen beim Wunderbau, nach `moveArmy` und in `beginTurn`).
- **Zugende ist mit Armee in einer Stadt gesperrt** (`blockingIssues`), nicht mehr nur
  bestätigungspflichtig. Ausnahme, wenn die Armee gar nicht herauskann.

**Neue Regel**
- **Handelsrouten** (`tradeRoutes`): +1 bzw. +2 auf alle Erträge je angebundener Stadt.

**Bots**
- **Armeeprioritäten neu** (neunstufig, siehe ANNAHMEN.md). 1–6 werden in `botPlanArmies`
  über alle Armeen abgestimmt, 7–9 bleiben je Armee einzeln. Verteidigung löst **nur bei
  laufender Belagerung** aus (`S.sieges[Gegner|Stadt] >= 1`), nicht bei jeder
  danebenstehenden Armee.
- **Bots lassen keine Armee in der eigenen Stadt stehen** (`botOutOfCity`), außer es gibt
  gar keinen anderen Halteplatz.

**Tutorial**
- **Auf den neuen Bot-Ausgang umgebaut** (v40): Die Belagerung bricht nicht mehr von selbst
  — der Spieler lernt stattdessen den Gegenangriff. Fragil: das Zielfeld neben Griechenlands
  Hauptstadt ist das einzige erreichbare (`tutStrikeSpot` hat eine Rückfallebene).
- **Griechenlands Militärforschung ist vorgegeben** (`TUT_FOE_MILITARY`, Hook `tutBotTech`
  in `botResearch`): Eisenverarbeitung und Stahl statt Stadtmauern und Burgenbau, damit
  seine Hauptstadt angreifbar bleibt und der Gegenangriff überhaupt einen Zähler auslöst.
  Gewürfelt wird normal weiter, nur das Ergebnis wird getauscht.
- **Texte sind fest verdrahtet** (v44): keine berechneten Zahlen mehr in den Schritttexten.
- **Texte vom Autor überarbeitet** (v45–v49): Schritte 1–15 wörtlich übernommen, Einleitung
  ergänzt, Zugablauf-Einordnung (`sub`) überall entfernt.
- **Zurückblättern springt nicht mehr vor** (`ui.tut.max`).

**Oberfläche**
- **Techbogen** markiert, welche Technologien andere MENSCHEN erforschen könnten (blass und
  gestrichelt umkringelt, gegen satt und durchgezogen für „hat sie").
- **Versionsnummer im Hauptmenü** aus `APP_VERSION` (js/data.js).

## Offene Punkte / bewusst nicht umgesetzt

0a. **Die neuen Armeeprioritäten verschieben die Balance.** Je 200 Bot-Partien:
   Militärsiege 187 (alt) → 130 (v39) → 152 (v43, Trigger ist die laufende Belagerung),
   Median 5 → 7 → 6 Runden. Der größte Teil der Verschiebung ist damit zurückgenommen.
   Ob der Rest so gewollt ist, muss der Autor sagen.

0b. **Bots bauen keine Straßen** — gemessen über 25 vollständige Bot-Partien: null
   Straßen, null Handelsrouten. Die Regel ist damit praktisch ein reiner Vorteil für den
   Menschen. Ausgleich hieße `bots.js` um Straßenbau erweitern.

0. **Die erzwungene Drehung ist nicht auf echtem iOS geprüft**, nur in Chromium mit
   Hochformat-Viewport. Safari-Eigenheiten bei `position:fixed` in transformierten
   Vorfahren und bei `env(safe-area-inset-*)` sind ein Restrisiko. Auf dem iPad
   gegenprüfen.

1. **Ein ungedecktes Nahrungsdefizit kostet nichts.** Seit dem Umbau auf `coverPop` ist
   das weniger schlimm: Decken macht Nahrung frei, statt nur ein folgenloses Defizit zu
   tilgen. Ein Rest bleibt aber — wer gar nichts deckt, verliert nichts außer der Nahrung.
   Gemessen (vor dem Umbau): zwei identische Spielstände, einer füttert 3 Wissenschaft, der
   andere nicht; nach der Runde unterscheiden sie sich **nur** in diesen 3 Wissenschaft,
   Bevölkerung und Nahrung sind gleich. Alternativen, je etwa eine Zeile:
   - „ungedecktes Defizit kostet Bevölkerung",
   - „Wachstum nur so weit, wie diese Runde gedeckt werden kann".
   **Entscheidung des Autors steht aus.**

2. **Wikinger „Beutezüge"** funktioniert, zahlt aber selten: der Ertrag ist Angriffswert minus
   Verteidigungswert, und ein Mensch überbietet Bots (Machtwert = Gesamtbevölkerung) selten.
   Gemessen: mit Macht 30 über 20 Partien 1809 Beute, mit normal gekaufter Macht 0.
3. **Regelheft-Klausel nicht umgesetzt:** „gegnerische Territorien zählen als unpassierbar,
   neben ihnen darf nicht gegründet werden". Würde die Ausbreitung stark einschränken —
   Entscheidung des Autors steht aus.
4. **Bot-Siedler** scheitert in späten Runden weiter gelegentlich, obwohl Platz da ist
   (Zufallslauf auf gefüllter Karte).
5. **Plättchenkarten sind enger als die festen Karten:** 45 Felder je Reich (2 Spieler),
   45 (3), 37,5 (4) gegen 54 auf der Originalkarte. Die Formen kommen so aus der Vorgabe;
   ob die Partien dadurch zu gedrängt sind, muss der Autor am Tisch entscheiden. Mehr Luft
   gäbe es nur über größere Formen (mehr Plättchen) oder Dreiecke mit Seite 6 (21 Felder).
6. **Bots legen ihr Startdreieck ohne Plan:** Lage zufällig, Hauptstadt zufällig auf einem
   der drei mittigen Felder. Sie bewerten das Gelände nicht, ein Mensch wählt hier also
   besser. Absicht (die Vorgabe verlangt genau das), aber ein Balancepunkt.

## Arbeitsweise, die der Autor schätzt

Antworten sollen Experten-Prüfung standhalten. **Schwächen offen benennen**, auch eigene
Fehler. Keine Positionen ohne neue Evidenz umkehren. Keine erfundenen Zahlen — messen und die
Stichprobe nennen. Bei mehrdeutigen Regeln **vor dem Bauen nachfragen** statt raten; bei
Entscheidungen, die die Vorgabe offenlässt, die getroffene Auslegung nennen und anbieten, sie
zu ändern. Der Autor meldet Bugs knapp — reproduzieren und die tatsächliche Ursache finden,
nicht die erstbeste Vermutung umsetzen. Jede Regeländerung mit Test absichern.

## Typischer Abschluss-Ablauf nach Änderungen

1. `node test.js` und `node smoke.js` grün.
2. Version hochzählen — **beide Stellen**: `APP_VERSION` in `js/data.js` und `VERSION`
   in `sw.js`. Ein Test schlägt an, wenn sie auseinanderlaufen.
3. `python3 build_single.py && node check_single.js`.
4. Nach `/mnt/user-data/outputs/` paketieren (Ordner + Zip + Einzeldatei, ohne
   `node_modules`), aus dem ausgelieferten Zip **noch einmal** `test.js`/`smoke.js` laufen
   lassen, dann mit `present_files` präsentieren (Einzeldatei zuerst).
