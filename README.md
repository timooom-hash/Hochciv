# Hochzeivilization – digitale Fassung

Vollständige Regelmaschine mit Bots, Technologiebogen und Karteneditor.
Läuft als Web-App offline auf dem iPad.

## Auf GitHub Pages stellen

1. Neues Repository anlegen, den Inhalt dieses Ordners hochladen (`index.html` muss im
   Wurzelverzeichnis liegen).
2. *Settings → Pages → Source: Deploy from a branch*, Branch `main`, Ordner `/ (root)`.
3. Nach ein bis zwei Minuten ist die Seite unter `https://<name>.github.io/<repo>/` erreichbar.
4. Auf dem iPad in Safari öffnen → Teilen → **Zum Home-Bildschirm**.
   Beim ersten Aufruf lädt der Service Worker alle Dateien in den Cache; danach läuft
   das Spiel ohne Netz.

Alle Pfade sind relativ, ein Unterverzeichnis ist also kein Problem.
Nach Änderungen an den Dateien in `sw.js` die Zeile `const VERSION` hochzählen,
sonst behalten installierte Geräte die alte Fassung.

## Bedienung

| | |
|---|---|
| Feld antippen | Aktionsblatt für dieses Feld (Stadt gründen, wachsen, Armee bauen …) |
| Bevölkerung wachsen | zwei Knöpfe, wenn Verbundwerkstoffe ein Gratis-Wachstum erlaubt: „Kostenlos wachsen" und der bezahlte „Bevölkerung wachsen" |
| Tutorial | Geführtes Übungsspiel in der normalen Oberfläche: 24 Schritte mit Erklärpanel unter der Karte, 15 davon mit Aufgabe und genauem Klickweg. Läuft auf Schienen (nur der vorgesehene Schritt ist möglich) und deterministisch. „Fertig" gibt das Spiel frei, es läuft weiter. |
| Einstellungen | Im Hauptmenü: die Erweiterungsmodule **Ereignisse** und **Weltwunder** zuschalten. Ab Werk sind beide aus und fehlen im Aufbau ganz; eingeschaltet steht dort wieder das Häkchen und entscheidet je Partie |
| Spielart | „Vier Reiche“, „Drei Reiche“ oder „1 gegen 1“ (freie Zivilisationswahl; im Duell Wirtschaftssieg erst über 3/4) |
| Zivilisationen | Auf der Plättchenkarte darf jeder Platz frei wählen, auch zweimal dieselbe (Doppelgänger bekommen Ziffern und je eine der vier Zivilisationsfarben). Auf den festen Karten sitzt jede genau einmal. Zivilisation und Fähigkeit lassen sich auch auslosen. Bei ausgelostem Reich steht die Fähigkeit zwangsläufig ebenfalls auf Zufall |
| Startspieler | frei wählbar oder zufällig – bei mehr als einem Menschen ist Zufall die Vorgabe |
| Fähigkeit sehen | Die eigene Fähigkeit steht in der Kopfzeile neben dem Reichsnamen; das Weltblatt (ⓘ) listet alle Reiche mit Fähigkeit und Wirkung |
| Karte | Originalkarte, Große Karte, **Plättchenkarte** (die Zufallskarte) oder eigene aus dem Editor |
| Plättchenkarte | Zufallskarte aus Dreiecken zu 15 Feldern. Vor dem Spiel legt jedes Reich verdeckt sein eigenes Startdreieck: Lage wählen (drei), Hauptstadt setzen. Dann wird aufgedeckt |
| **Welt** | Ereignis dieser Runde, eigene und fremde Weltwunder, verfügbarer Wunder-Pool |
| 🌾 in der Kopfzeile | Städte füttern (nur mit Gentechnik oder Massenmedien) |
| Weltwunder bauen | im Stadtblatt, wenn die Erweiterung an ist |
| **Forschen** | links die Ertragsübersicht (Felder, **Handelsrouten**, Bevölkerung, Summe fürs nächste Einkommen), rechts der Technologiebogen |
| **Armeen** | Übersicht aller eigenen Armeen; antippen wählt aus, dann Zielfeld antippen |
| Armee auf der Karte | antippen → *Bewegen*; steht sie in der eigenen Stadt, steht die Aktion im Stadtblatt |
| Feld antippen | Aktionsblatt mit dem Feldertrag; ist das Feld siedelbar, steht darunter der **Ertrag beim Siedeln** — was eine Stadt hier ab der nächsten Runde brächte |
| Karte | fest und immer vollständig sichtbar – kein Zoomen, kein Schieben. Im Hochformat dreht die App sich selbst quer (im ☰-Menü abschaltbar) |
| **Forschen** | Technologiebogen; erforschbares ist rot umrandet — durchgezogen heißt bezahlbar, gestrichelt zu teuer. Kopieren (Spionage/Kundschafterei/Internet) erscheint unten im selben Fenster |
| Atomwaffen | Zielfeld antippen → *Atomschlag* im Aktionsblatt (einmal pro Runde) |
| Sklaverei / Kolonialismus | im Aktionsblatt der Stadt bzw. eines herrenlosen Feldes |
| **Protokoll** | jede Aktion; die Würfe dahinter hängen eingeklappt an der Zeile und lassen sich antippen |

## Spielende

Ein **Militärsieg** (fremde Hauptstadt erobert) endet das Spiel auf der Stelle.
**Wirtschafts-, Forschungs- und Kultursieg** werden angemeldet: die Runde wird noch zu
Ende gespielt, die Kopfzeile zeigt dann „letzte Runde". Erfüllen mehrere Reiche in
derselben Runde eine Bedingung, entscheiden am Rundenende Punkte:

> Punkte = Bevölkerung + Anzahl Weltwunder + Anzahl Technologien

Ein Anspruch bleibt gültig, auch wenn die Bedingung später wieder wegfällt. Bei
**Gleichstand gewinnt der Mensch** vor dem Bot; mehrere Menschen gleichauf teilen den
Sieg. Das Spielende zeigt dann die Punktetafel.

Unter dem Ergebnis steht immer ein **Spieltipp** aus der Tippsammlung – gewonnen wie
verloren. Gezogen wird einer je Partie, er wechselt also nicht, wenn man das Fenster
noch einmal öffnet. Die Tipps stehen in `TIPS` (`js/data.js`), englisch in
`DATA_EN.tips` an derselben Stelle der Liste.

Wer **allein gegen Bots** spielt, findet dort außerdem **„Nochmal spielen"**: dieselbe
Aufstellung, aber ein ausgelostes Reich samt ausgeloster Fähigkeit – und nach einem Sieg
eine Stufe schwerer (bei David bleibt es dabei). Auf der Plättchenkarte wird dafür neu
gelegt. Zu mehreren Menschen gibt es den Knopf nicht: die Aufstellung gehört dann nicht
einem allein. Möglich ist das, weil `newGame` die rohe Wahl aus dem Aufbau als `recipe`
im Spielstand ablegt – Spielstände aus älteren Fassungen haben keines und zeigen nur den
Weg ins Menü.

Straßen laufen durch Städte hindurch: ein Stadtfeld zählt selbst als Straße oder
Eisenbahn, sobald ein solches Feld daran grenzt.

Ressourcen gelten nur für den laufenden Zug – nur Macht bleibt liegen.
Bezahlt wird automatisch mit dem günstigsten Umrechnungskurs
(2 Münzen = 1 Nahrung/Wissenschaft, mit England, Gilden, Alchemie usw. entsprechend besser).

## Sprache

Im Hauptmenü schalten zwei Flaggen zwischen **Deutsch** (Vorgabe) und **Englisch** um; die
Wahl bleibt gespeichert. Englisch ist **vollständig**: Menü, Aufbau, Spielbildschirm, alle
Blätter, Technologiebogen, Protokoll, Spielende, Regelbogen, Editor, das komplette Tutorial
und alle Spielinhalte. `node smoke.js` läuft die Oberfläche auf Englisch ab und lässt keinen
neuen deutschen Text durch.

Eine Ausnahme: Protokollzeilen, die vor dem Sprachwechsel geschrieben wurden, bleiben in der
Sprache von damals – das Protokoll speichert fertige Sätze. Neue Zeilen kommen in der neuen
Sprache.

Neue Texte übersetzen: Spielinhalte in `DATA_EN` (`js/i18n.js`), Oberflächensätze mit
`T('deutscher Satz')` und einem Eintrag in `UI_EN`. Fehlt einer, erscheint der deutsche
Satz und `missingStrings()` nennt ihn.

## Karten

Im Aufbaubildschirm stehen zwei feste Karten zur Wahl: die **Originalkarte** (12 × 18, aus
dem Foto des gedruckten Bogens ausgemessen) und eine **große Karte** (15 × 24) im selben
Stil, mit weiter auseinanderliegenden Hauptstädten und dadurch längeren Partien. Welche Zivilisation an welchem Stern startet, steht auf dem Bogen nicht –
zugeordnet ist nach Himmelsrichtung: Wikinger Norden, Russland Osten, England Westen,
Griechenland Süden.

### Plättchenkarte (Zufallskarte)

Aus einem Vorrat von 20 handentworfenen Dreiecken zu je 15 Feldern werden Plättchen
gezogen und zu einer Form zusammengelegt:

| Reiche | Form | Größe |
|---|---|---|
| 2 | Sechseck aus 6 Dreiecken, 4 offen, 2 verdeckt | 11 × 11, 90 Felder |
| 3 | großes Dreieck aus 9 Dreiecken, 6 offen | 16 × 16, 135 Felder |
| 4 | gestrecktes Sechseck aus 10 Dreiecken, 6 offen (Startplätze: die zwei oberen und die zwei unteren) | 10 × 18, 150 Felder |

Bei zwei und drei Reichen bleibt **genau in der Mitte ein Feld frei** – dort ist kein
Feld, da führt kein Weg durch. Das ist rechnerisch unvermeidlich (6 · 15 = 91 − 1) und
bleibt bewusst offen.

Jedes Reich legt sein eigenes Dreieck selbst und verdeckt: **Drehen** wählt eine der drei
Lagen, ein Tipp auf ein markiertes Feld setzt die Hauptstadt. Gesperrt sind nur Felder,
die einer fremden Hauptstadt näher als 3 Felder kommen könnten (Städte brauchen 3 Felder
Abstand, und gelegt wird blind). Bots drehen zufällig und setzen auf eines der drei
mittigen Felder. Erst wenn alle fertig sind, wird aufgedeckt.

Meer liegt immer am Rand eines Plättchens, oft an den Ecken – trifft beim Zusammenlegen
Kante auf Kante, wächst daraus ein zusammenhängendes Meer. Etwa die Hälfte der Karten
bekommt so eine Fläche von acht Feldern oder mehr, die andere Hälfte bleibt Landkarte.

Neue Plättchen kommen in `js/tiles.js`, `TILE_POOL` – fünf Zeilen zu 5/4/3/2/1 Feldern.
`node test.js` prüft dabei, dass jedes Plättchen mindestens drei Geländearten hat, dass
Meer nur am Rand liegt und dass die drei mittigen Felder Land sind und jedes davon im
ersten Zug mindestens 4 Nahrung bringt.

## Tutorial

Beim Öffnen kommt eine Frage: **schon Erfahrung mit Spielen wie Civilization?**

* **Nein** → die ausführliche Fassung, 29 Schritte, erklärt alles von Grund auf.
* **Ja** → eine kurze Fassung, 24 Schritte, **dieselben Aufgaben**, aber nur die
  Eigenheiten dieses Spiels: Ressourcen verfallen am Zugende, Kampfrechnung, Zufall im
  Technologiebaum, Zivilisationsfähigkeiten, die Siegwege samt Punktvergleich.

Beide kommen aus einer Schrittliste (`TUT_STEPS` in `js/tutorial.js`): jeder Schritt hat
neben `html` ein Feld `kurz` – kurzer Text oder `false` für „in der kurzen Fassung nicht
dabei". Aufgaben stehen damit nur einmal im Code und können nicht auseinanderlaufen.

* **Im Spiel:** *Karte bearbeiten* → Gelände antippen; Hauptstädte über die
  Zivilisationsfelder der Palette setzen, oben rechts mit ✓ speichern.
  Über *Exportieren* / *Importieren* lässt sich die Karte als Datei sichern.
* **Im Code:** `js/data.js`, `DEFAULT_MAP`. Eine Zeile = eine Hexreihe,
  ungerade Zeilen sind nach rechts versetzt.
  `G` Grasland · `W` Wald · `B` Gebirge · `F` Fluss · `M` Meer · `I` Insel ·
  `X` kein Feld (liegt außerhalb der Karte – so entstehen nicht rechteckige Umrisse;
  im Editor blass gestrichelt, sonst unsichtbar).

### Druckbogen der Plättchen

`Startplaettchen.pdf` (3 Seiten A4 quer) zeigt alle 20 Plättchen zum Ausschneiden – in der
Optik des Spiels (dieselben Farben und Geländezeichen, dieselbe dünne Feldlinie),
Feldbreite rund 20 mm. Auf dem Bogen steht **nichts außer den Plättchen**: kein
Hintergrund, keine Überschrift, keine Namen, kein Umriss. Zwischen den Dreiecken bleiben
4 mm Luft; sie wechseln zeilenweise die Richtung (Spitze unten, Spitze oben, …) und
greifen so mit ihren Schrägen ineinander, ohne sich zu berühren – dadurch passen acht auf
eine Seite statt vier.

Neu erzeugen nach Änderungen an `TILE_POOL`:

```bash
node tools_startplaettchen_dump.js    # liest js/tiles.js → tiles.json
python3 tools_startplaettchen_pdf.py  # tiles.json → Startplaettchen.pdf (braucht reportlab)
```

Der Bogen kann so nicht vom Spiel abweichen – er wird aus derselben Quelle gebaut.

### Neue Zivilisation hinzufügen

Alle Reiche stehen in **`data/civs.json`** – Name, Zeichen, Farbe, Zugreihenfolge und je
drei Fähigkeiten. Danach:

```bash
node tools_civs.js     # schreibt js/civs.js aus data/civs.json
node test.js           # prüft, dass beide zusammenpassen
```

Die Reihenfolge in der JSON ist die **Anzeigereihenfolge** (Aufbau, Regelbogen), das Feld
`order` die **Zugreihenfolge** im Spiel. Was die JSON nicht enthält, sind die Regeln: eine
neue Alternativfähigkeit braucht zusätzlich Code in `js/engine.js`, der ihren Schlüssel
über `isAbil(p, '…')` prüft – der Test meldet eine Fähigkeit, die nirgends geprüft wird.
Englische Namen und Wirkungstexte kommen in `js/i18n.js` unter `DATA_EN.civ` und
`DATA_EN.abil`.

Warum die JSON nicht direkt geladen wird: die App läuft auch als einzelne HTML-Datei von
der Festplatte, und von `file://` darf `fetch` nicht lesen. Deshalb ist die JSON die
Quelle und `js/civs.js` die daraus erzeugte Fassung.

### Version erhöhen (wichtig beim Ausrollen)

Der Service Worker liefert **zuerst aus dem Cache**. Ein neuer Cache entsteht nur, wenn
sich `VERSION` in `sw.js` ändert – wer Dateien ändert und die Version stehen lässt, rollt
etwas aus, das bei niemandem ankommt. Deshalb vor dem Hochladen:

```bash
node tools_version.js        # Nummer +1, schreibt APP_VERSION, BUILD_HASH und die
                             # Kopfzeile von UEBERGABE.md
python3 build_single.py      # Einzeldatei neu bauen
node tools_version.js $(…)   # danach nochmal mit derselben Nummer: die Einzeldatei
                             # gehört mit in den BUILD_HASH
node tools_docs.js           # Zahlen in UEBERGABE.md nachziehen (führt die Tests aus)
node test.js                 # meckert, wenn etwas davon vergessen wurde
```

Im Browser reicht danach ein Neuladen; die alte Fassung räumt der Service Worker selbst weg.

## Prüfprogramme (nur für die Entwicklung)

```bash
node test.js     # Regeln gegen die Beispiele aus dem Regelheft
node smoke.js    # Oberfläche in jsdom durchspielen (braucht: npm install jsdom)
```

`test.js` rechnet unter anderem die Einkommensbeispiele des Regelhefts nach,
prüft Technologiekosten, Stadtgründungs- und Armeekosten und spielt 40 Bot-Partien
komplett durch.

## Dateien

```
index.html            Aufbau der Bildschirme
css/style.css         Optik des gedruckten Spielbogens
js/data.js            Technologien, Zivilisationen, Erträge, Karte
js/hex.js             Hexraster, Distanzen, Wegsuche
js/tiles.js           Dreiecksplättchen: Vorrat, Formen, Legephase, Kartenbau
js/engine.js          Regeln: Einkommen, Aktionen, Kampf, Sieg
js/bots.js            Bot-Züge nach den Bot-Regeln
js/ui.js              Karte, Gesten, Aktionsblätter, Editor
sw.js                 Offline-Cache
ANNAHMEN.md           wo die Regeln offen sind und wie hier entschieden wurde
data/civs.json        die Zivilisationen – Quelle für js/civs.js (node tools_civs.js)
Startplaettchen.pdf   Druckbogen der 20 Plättchen (aus js/tiles.js erzeugt)
```
