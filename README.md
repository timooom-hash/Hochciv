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
| Spielart | „Vier Reiche“, „Drei Reiche“ oder „1 gegen 1“ (freie Zivilisationswahl; im Duell Wirtschaftssieg erst über 3/4) |
| Karte | Originalkarte, Große Karte, **Plättchenkarte**, Rasterkarte oder eigene aus dem Editor |
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

Straßen laufen durch Städte hindurch: ein Stadtfeld zählt selbst als Straße oder
Eisenbahn, sobald ein solches Feld daran grenzt.

Ressourcen gelten nur für den laufenden Zug – nur Macht bleibt liegen.
Bezahlt wird automatisch mit dem günstigsten Umrechnungskurs
(2 Münzen = 1 Nahrung/Wissenschaft, mit England, Gilden, Alchemie usw. entsprechend besser).

## Regelmodus

Im Aufbaubildschirm unter **Regeln** wählbar:

* **Originalregeln** – die Regeln des gedruckten Hefts.
* **Experimentell v2** – Singularität kostet 100, Griechenland ohne Würfelbonus, zwei neue
  Technologien (Keramik, Theologie), Verbundwerkstoffe gibt ein kostenloses Wachstum,
  Sklaverei wird in der Moderne obsolet, Theologie senkt die Siegschwelle, Bots forschen
  doppelt. Details in `ANNAHMEN.md`, Abschnitt 9.

Der gewählte Modus steht während des Spiels im Rundentitel und wird im Spielstand
gespeichert.

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
| 4 | gestrecktes Sechseck aus 10 Dreiecken, 6 offen | 10 × 18, 150 Felder |

Bei zwei und drei Reichen bleibt **genau in der Mitte ein Feld frei** – dort ist kein
Feld, da führt kein Weg durch. Das ist rechnerisch unvermeidlich (6 · 15 = 91 − 1) und
bleibt bewusst offen.

Jedes Reich legt sein eigenes Dreieck selbst und verdeckt: **Drehen** wählt eine der drei
Lagen, ein Tipp auf ein markiertes Feld setzt die Hauptstadt. Gesperrt sind nur Felder,
die einer fremden Hauptstadt näher als 3 Felder kommen könnten (Städte brauchen 3 Felder
Abstand, und gelegt wird blind). Bots drehen zufällig und setzen auf eines der drei
mittigen Felder. Erst wenn alle fertig sind, wird aufgedeckt.

Neue Plättchen kommen in `js/tiles.js`, `TILE_POOL` – fünf Zeilen zu 5/4/3/2/1 Feldern.
`node test.js` prüft dabei, dass die drei mittigen Felder Land sind und jedes davon im
ersten Zug mindestens 4 Nahrung bringt.

* **Im Spiel:** *Karte bearbeiten* → Gelände antippen; Hauptstädte über die
  Zivilisationsfelder der Palette setzen, oben rechts mit ✓ speichern.
  Über *Exportieren* / *Importieren* lässt sich die Karte als Datei sichern.
* **Im Code:** `js/data.js`, `DEFAULT_MAP`. Eine Zeile = eine Hexreihe,
  ungerade Zeilen sind nach rechts versetzt.
  `G` Grasland · `W` Wald · `B` Gebirge · `F` Fluss · `M` Meer · `I` Insel ·
  `X` kein Feld (liegt außerhalb der Karte – so entstehen nicht rechteckige Umrisse;
  im Editor blass gestrichelt, sonst unsichtbar).

### Druckbogen der Plättchen

`Startplaettchen.pdf` (6 Seiten A4) zeigt alle 20 Plättchen zum Nachschlagen oder
Ausschneiden: Seite 1 die Legende, die Legeregeln und die drei Formen, danach vier
Plättchen je Seite mit Umrisslinie. Neu erzeugen nach Änderungen an `TILE_POOL`:

```bash
node tools_startplaettchen_dump.js    # liest js/tiles.js → tiles.json
python3 tools_startplaettchen_pdf.py  # tiles.json → Startplaettchen.pdf (braucht reportlab)
```

Der Bogen kann so nicht vom Spiel abweichen – er wird aus derselben Quelle gebaut.

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
Startplaettchen.pdf   Druckbogen der 20 Plättchen (aus js/tiles.js erzeugt)
```
