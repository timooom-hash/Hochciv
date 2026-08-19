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
| Spielart | „Vier Reiche“ oder „1 gegen 1“ (zwei frei gewählte Zivilisationen, Karte 10 × 15, Wirtschaftssieg erst über 3/4) |
| Karte | Originalkarte, Große Karte, Zufallskarte oder eigene aus dem Editor |
| **Welt** | Ereignis dieser Runde, eigene und fremde Weltwunder, verfügbarer Wunder-Pool |
| 🌾 in der Kopfzeile | Städte füttern (nur mit Gentechnik oder Massenmedien) |
| Weltwunder bauen | im Stadtblatt, wenn die Erweiterung an ist |
| **Forschen** | links die Ertragsübersicht (Felder, Bevölkerung, Summe fürs nächste Einkommen), rechts der Technologiebogen |
| **Armeen** | Übersicht aller eigenen Armeen; antippen wählt aus, dann Zielfeld antippen |
| Armee auf der Karte | antippen → *Bewegen*; steht sie in der eigenen Stadt, steht die Aktion im Stadtblatt |
| Zwei Finger | Zoomen, ein Finger schiebt die Karte |
| **Forschen** | Technologiebogen; erforschbares ist rot umrandet. Kopieren (Spionage/Kundschafterei/Internet) erscheint unten im selben Fenster |
| Atomwaffen | Zielfeld antippen → *Atomschlag* im Aktionsblatt (einmal pro Runde) |
| Sklaverei / Kolonialismus | im Aktionsblatt der Stadt bzw. eines herrenlosen Feldes |
| **Protokoll** | jeder Würfelwurf, auch die der Bots |

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

Im Aufbaubildschirm stehen zwei Karten zur Wahl: die **Originalkarte** (12 × 18, aus dem
Foto des gedruckten Bogens ausgemessen) und eine **große Karte** (15 × 24) im selben Stil,
mit weiter auseinanderliegenden Hauptstädten und dadurch längeren Partien. Welche Zivilisation an welchem Stern startet, steht auf dem Bogen nicht –
zugeordnet ist nach Himmelsrichtung: Wikinger Norden, Russland Osten, England Westen,
Griechenland Süden.

* **Im Spiel:** *Karte bearbeiten* → Gelände antippen; Hauptstädte über die
  Zivilisationsfelder der Palette setzen, oben rechts mit ✓ speichern.
  Über *Exportieren* / *Importieren* lässt sich die Karte als Datei sichern.
* **Im Code:** `js/data.js`, `DEFAULT_MAP`. Eine Zeile = eine Hexreihe,
  ungerade Zeilen sind nach rechts versetzt.
  `G` Grasland · `W` Wald · `B` Gebirge · `F` Fluss · `M` Meer · `I` Insel.

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
js/engine.js          Regeln: Einkommen, Aktionen, Kampf, Sieg
js/bots.js            Bot-Züge nach den Bot-Regeln
js/ui.js              Karte, Gesten, Aktionsblätter, Editor
sw.js                 Offline-Cache
ANNAHMEN.md           wo die Regeln offen sind und wie hier entschieden wurde
```
