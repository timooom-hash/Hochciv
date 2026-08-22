# Hochzeivilization — Projekt-Übergabe (Stand 21.8., `sw.js` v39)

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
- **Deliverables in `/mnt/user-data/outputs/`:** Ordner `hochzeivilization/` (20 Dateien),
  `hochzeivilization.zip`, und `hochzeivilization-einzeldatei.html` — Letzteres ist, was der
  Autor tatsächlich aufs iPad lädt.
- **Wichtig beim Paketieren:** `node_modules` und `package*.json` ausschließen
  (`tar -c --exclude=node_modules --exclude='package*.json' .` bzw. `zip -x '*/node_modules/*'`).
  Einmal ist ein `node_modules` ins Zip gerutscht und ließ sich wegen eines I/O-Fehlers auf dem
  Mount nicht mehr löschen — nur durch Umbenennen aus dem Ordner heraus lösbar.

## Dateistruktur (~7700 Zeilen)

| Datei | Zeilen | Inhalt |
|---|---|---|
| `js/data.js` | 461 | TERRAIN (inkl. Vulkan), TECHS (66, davon 62 Grundspiel), CIVS mit je 3 Fähigkeiten, Karten, Zufalls- und Duellkartengenerator inkl. Startgüte, EVENT_ROWS (18), WONDERS (18), Regelkonstanten |
| `js/hex.js` | 108 | Hexraster (pointy-top, odd-r), `hexDistance`, `reachable`, `pathSteps` |
| `js/engine.js` | 1133 | Kernregeln: Einkommen, Kurse, Kampf, Bewegung, Wachstum inkl. Nahrungsgrenze, Zivilisationsfähigkeiten, Sieg, Zugablauf, Protokoll |
| `js/expansion.js` | 508 | Ereignisse, Barbaren (neutrale Fraktion), Weltwunder, Kultursieg, Bot-Wunderbau |
| `js/bots.js` | 450 | Bot-Züge, Siedlerbewegung, **neunstufige Armeeprioritäten** (`botPlanArmies` für 1–6, `botMoveArmy` für 7–9), Bot-Forschung |
| `js/ui.js` | 1099 | SVG-Karte, Touch, Aktionsblätter, Technologiebogen, Aufbau (inkl. 1-gegen-1), Editor, Kurzregeln mit voller Techliste |
| `js/tutorial.js` | 857 | Geführtes Übungsspiel: 27 Schritte, feste Würfelfolge, Schienen |
| `test.js` | 2810 | **769 Assertions**, `node test.js` |
| `smoke.js` | 1060 | **62 Schritte** durch die echte UI via jsdom, `node smoke.js` |
| `build_single.py` / `check_single.js` | 20 / 23 | Einzeldatei bauen und in jsdom prüfen |
| `ANNAHMEN.md` | — | **Alle Regelauslegungen und Entscheidungen.** Bei Regelfragen zuerst hier nachsehen. |

Weitere: `index.html`, `css/style.css`, `sw.js` (**VERSION bei jeder Änderung hochzählen**,
aktuell `hochciv-v39`), `manifest.webmanifest`, `icons/`, `README.md`.

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
  blockiert. Gentechnik und Massenmedien heben die Grenze auf und füttern 1:1 zu Zugbeginn.
- **Ereignisse** (Erweiterung, hart/leicht) mit Barbaren als neutraler Fraktion.
- **Weltwunder** (Erweiterung) mit Pyramidenregel, Kultursieg und vier eigenen Technologien
  (Baukräne, Wallfahrt, Militärlogistik, Raumfahrt). Bots bauen sie kostenlos, **ohne Effekte**
  — einzige Ausnahme: Militärlogistik wirkt auch für Bots.
- **Karten:** Originalkarte (Standard), Große Karte, Zufallskarte 12 × 18, eigene aus dem
  Editor. Zufallskarten garantieren je Startplatz **4 Nahrung** (Münzen 2:1) und ein
  siedelbares Feld in Distanz 3.
- **1 gegen 1:** zwei frei gewählte Reiche, Zufallskarte **12 × 8**, keine Kartenwahl,
  Wirtschaftssieg erst über 3/4 (Theologie 7/10, UN 2/3).
- **Tutorial:** geführtes Übungsspiel in der normalen Oberfläche, 27 Schritte, 18 mit Aufgabe.

## Verifikationsmethoden (etabliert, unbedingt beibehalten)

1. **`node test.js`** muss grün sein — 769 Assertions, darunter die Rechnungen aus dem
   Regelheft-Beispiel, ein Test je geänderter Regel, 40 Bot-Partien, 40 mit Erweiterungen,
   20 Mensch-Partien, 20 Duelle, der komplette Tutorial-Durchlauf (zweimal, auf Gleichheit).
2. **`node smoke.js`** fährt die echte UI durch jsdom (62 Schritte), inklusive
   Tutorial-Audit: in jedem der 27 Schritte wird geprüft, dass **nur** das Vorgesehene
   anklickbar ist — und dass überhaupt etwas anklickbar ist (beide Richtungen!).
3. **`python3 build_single.py && node check_single.js`** — Einzeldatei bauen und prüfen.
4. **Visuelle Kontrolle:** `playwright` (chromium) für die echte Oberfläche,
   `cairosvg` für SVG-Karten, dann mit dem `view`-Tool ansehen. Beides ist installiert;
   `playwright install` schlägt fehl, der mitgelieferte Chromium funktioniert trotzdem.
5. **Immer reproduzieren, nicht raten.** In diesem Chat war die erste Vermutung mehrfach
   falsch: der „leere Toast" war das geschlossene Aktionsblatt, die Wikinger-Fähigkeit war
   nicht kaputt sondern kam eine Runde zu spät, mehr Forschungssiege mit Weltwundern waren
   reines Rauschen (60 Partien zu wenig; über 300 identisch).
6. **Messen statt behaupten.** Bei Balance- und Häufigkeitsaussagen mit ausreichend großen
   Stichproben arbeiten und die Zahl nennen.

## Oberfläche (Stand 21.8.)

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

Alles Weitere dazu steht ausführlich in `ANNAHMEN.md`, Abschnitt „Designänderungen vom 21.8.".

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

Aus dieser Sitzung (21.8.):
- **Bot-Armeeprioritäten neu** (neunstufig, siehe ANNAHMEN.md). 1–6 werden in
  `botPlanArmies` über alle Armeen abgestimmt, 7–9 bleiben je Armee einzeln.
- **Wachstum für 2 statt 3 Münzen:** `canGrow` prüfte Nahrung und Münzen getrennt gegen
  denselben Vorrat, und `growCity` ignorierte den Rückgabewert des zweiten `pay`. Jetzt
  `payAll`/`affordAll` — alles oder nichts, mit Rückrollen.
- **Eisenbahn ohne Rad war nicht baubar:** Das Blatt zeigte den Knopf nur mit Rad und
  leitete die Zielstufe selbst her. Jetzt entscheidet `roadTarget(S, pi, r, c)` aus
  `engine.js`, und Blatt wie `doRoad` benutzen sie.
- **Oxford + Singularität:** `freePickModal` prüfte `S.over` nicht — das Spiel war vorbei,
  aber der Siegbildschirm kam nie.
- **Nahrungsgrenze hing am Ereignis der Runde:** Dürre und Revolution verboten Wachstum
  und Siedeln, obwohl die Stadt dauerhaft gedeckt war. `growthBlocked` rechnet jetzt über
  `baseIncome()` auf dem dauerhaften Wert (`S.evMuted`).
- **Bürgerkrieg:** Armee/Macht ließen sich nicht mit einer Mischung aus Nahrung und Münzen
  kaufen. Die Regelmaschine konnte es, die Oberfläche prüfte ohne die Bürgerkriegs-Option.
  Es gibt jetzt `payOpts(S, pi)` als einzige Wahrheit — beide Seiten benutzen sie.
- **Gentechnik/Massenmedien:** `feed()` schrieb alles über dem Defizit in den
  Nahrungsvorrat und war damit doch ein 1:1-Umtausch. Füttern deckt jetzt nur noch das
  offene Defizit.

## Offene Punkte / bewusst nicht umgesetzt

0a. **Die neuen Armeeprioritäten verschieben die Balance deutlich.** Je 200 Bot-Partien:
   Median 5 → 7 Runden, Militärsiege 187 → 130, Forschungssiege 13 → 70. Bots verteidigen
   jetzt zuerst und erobern sich langsamer. Ob das so gewollt ist, muss der Autor sagen.

0b. **Bots bauen keine Straßen** — gemessen über 25 vollständige Bot-Partien: null
   Straßen, null Handelsrouten. Die Regel ist damit praktisch ein reiner Vorteil für den
   Menschen. Ausgleich hieße `bots.js` um Straßenbau erweitern.

0. **Die erzwungene Drehung ist nicht auf echtem iOS geprüft**, nur in Chromium mit
   Hochformat-Viewport. Safari-Eigenheiten bei `position:fixed` in transformierten
   Vorfahren und bei `env(safe-area-inset-*)` sind ein Restrisiko. Auf dem iPad
   gegenprüfen.

1. **Ein ungedecktes Nahrungsdefizit kostet nichts.** Seit v35 ist das weniger schlimm,
   weil Decken echten Nutzen hat (es macht Nahrung frei, statt nur ein folgenloses Defizit
   zu tilgen). Ein Rest bleibt: wer gar nichts deckt, verliert nichts außer der Nahrung.
   Frühere Messung dazu: Gemessen: zwei identische Spielstände, eines füttert 3 Wissenschaft, das
   andere nicht; nach der Runde unterscheiden sie sich **nur** in den 3 Wissenschaft,
   Bevölkerung und Nahrung sind gleich. Vor v33 verdeckte der (fehlerhafte) Umtausch das,
   weil Füttern echten Nahrungsvorrat brachte. Die Funktion braucht also eine Folge, sonst
   ist sie Zierde. Alternativen, je etwa eine Zeile:
   - „ungedecktes Defizit kostet Bevölkerung" (dann lohnt Füttern),
   - „Wachstum nur so weit, wie diese Runde gefüttert werden kann",
   - oder Füttern darf über das Defizit hinaus bis zur Nahrungsaufnahme der Bevölkerung
     gehen und schafft echten Vorrat (dann ist es wieder ein begrenzter Umtausch).
   **Entscheidung des Autors steht aus.**
2. **Wikinger „Beutezüge"** funktioniert, zahlt aber selten: der Ertrag ist Angriffswert minus
   Verteidigungswert, und ein Mensch überbietet Bots (Machtwert = Gesamtbevölkerung) selten.
   Gemessen: mit Macht 30 über 20 Partien 1809 Beute, mit normal gekaufter Macht 0.
3. **Regelheft-Klausel nicht umgesetzt:** „gegnerische Territorien zählen als unpassierbar,
   neben ihnen darf nicht gegründet werden". Würde die Ausbreitung stark einschränken —
   Entscheidung des Autors steht aus.
4. **Bot-Siedler** scheitert in späten Runden weiter gelegentlich, obwohl Platz da ist
   (Zufallslauf auf gefüllter Karte).

## Arbeitsweise, die der Autor schätzt

Antworten sollen Experten-Prüfung standhalten. **Schwächen offen benennen**, auch eigene
Fehler. Keine Positionen ohne neue Evidenz umkehren. Keine erfundenen Zahlen — messen und die
Stichprobe nennen. Bei mehrdeutigen Regeln **vor dem Bauen nachfragen** statt raten; bei
Entscheidungen, die die Vorgabe offenlässt, die getroffene Auslegung nennen und anbieten, sie
zu ändern. Der Autor meldet Bugs knapp — reproduzieren und die tatsächliche Ursache finden,
nicht die erstbeste Vermutung umsetzen. Jede Regeländerung mit Test absichern.

## Typischer Abschluss-Ablauf nach Änderungen

1. `node test.js` und `node smoke.js` grün.
2. `sw.js`-Version hochzählen.
3. `python3 build_single.py && node check_single.js`.
4. Nach `/mnt/user-data/outputs/` paketieren (Ordner + Zip + Einzeldatei, ohne
   `node_modules`), aus dem ausgelieferten Zip **noch einmal** `test.js`/`smoke.js` laufen
   lassen, dann mit `present_files` präsentieren (Einzeldatei zuerst).
