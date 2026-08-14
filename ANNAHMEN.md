# Annahmen, Auslegungen, offene Punkte

Ein Programm muss jede Regel eindeutig entscheiden, auch die, die am Tisch
per Zuruf geklärt würden. Hier steht, wo das Regelheft offen ist und wie die
Umsetzung entschieden hat. Alles davon lässt sich ändern – die Stellen sind genannt.

*Vom Autor durchgesehen und gegen das aktuelle Regelheft abgeglichen. Der frühere
Rechenfehler in Zug 1 ist in der vorliegenden Fassung behoben (jetzt „3 Münzen"). Diese
Datei beschreibt die Standardregeln; die experimentelle Variante v2 steht in Abschnitt 9.*

## 1. Kampf (aktualisiertes Regelheft)

- Angriffswert **je Armee** = Machtwert der Zivilisation; mehrere Armeen an derselben Stadt
  addieren sich. Belagerungsmaschinen geben +5 je Armee, Dynamit verdoppelt danach.
- Verteidigung = Bevölkerung (Maschinengewehr: x3) + 5 mit Stadtmauern + Machtwert je
  verteidigender Armee + einmal Machtwert für Burgenbau.
- **Raketentechnik** projiziert den Machtwert einer Armee auf **zwei Ringe** - fuer Angriff,
  Verteidigung und Kontrollzone gleichermassen. Eine Armee neben mehreren gegnerischen
  Staedten (nur mit Raketentechnik erreichbar, da Staedte Mindestabstand haben) greift alle
  gleichzeitig an. Eine eigene Armee auf Distanz 2 verteidigt eine eigene Stadt mit.
- **Burgenbau** stellt eine virtuelle, unbewegliche Armee in die Stadt. Sie verteidigt die
  eigene Stadt und kann zum **Flankieren** genutzt werden (andere eigene Staedte liegen
  immer zu weit weg). Beim Flankieren zaehlt sie wie eine echte Armee auf dem Stadtfeld.
- **Taktik**: Flankieren von zwei beliebigen benachbarten Feldern; ohne Taktik muessen die
  zwei Felder gegenueberliegen (mit Raketentechnik auf Distanz 2 gegenueberliegend).
- **Schiesspulver (Kontrollzone)**: gegnerische Armeen halten an, sobald sie ein Feld in
  Reichweite (1, mit Raketentechnik 2) einer deiner Armeen betreten. **Luftwaffe** ignoriert
  Kontrollzonen.
- Eroberung: -2 Bevoelkerung (Rittertum -1, Militaergericht 0). Bleibt 0 uebrig, wird die
  Stadt zerstoert. Die Stadt faellt, wenn der Angriff **zwei aufeinanderfolgende eigene
  Zuege** hoeher war; sinkt er dazwischen, beginnt die Zaehlung neu.

## 2. Bewegung und Armeen

- Armeen sind **nicht stapelbar**: kein Feld trägt zwei Armeen. Sie dürfen auf **keine Stadt**
  ziehen, auch nicht auf eine eigene. Eine frisch gebaute Armee steht im Zug ihrer Entstehung
  auf dem Stadtfeld und muss es im selben Zug verlassen.
- Reichweite: 3 Felder, mit Panzerschiff 6, mit Luftwaffe faktisch unbegrenzt (Wert 9, ignoriert
  Gelände). Ein durch Forschung gewonnener Reichweitensprung wirkt **sofort im selben Zug** –
  die Erhöhung wird der Restbewegung der eigenen Armeen gutgeschrieben.
- Spielerreihenfolge ist fest: **Russland → Griechenland → England → Wikinger**. Der Startspieler
  (wer zuletzt ein Weltwunder baute) bestimmt nur den Einstiegspunkt in dieser Rotation.

## 3. Rundungen und Zahlen

| Punkt | Entscheidung | Alternative |
|---|---|---|
| „Macht um 1/2 reduzieren (aufrunden)" | der **Verlust** wird aufgerundet: 8 → 4, 5 → 2 | das Ergebnis aufrunden: 5 → 3 |
| Stahl 1/3, Panzer 1/4 | ersetzen den Nenner, gleiche Rundung | |
| Stadtgründung | Grundkosten 1/3/6/10/15/… (n·(n+1)/2 bei n eigenen Städten) + Distanz zur **Hauptstadt** in passierbaren Feldern | |
| Kartografie | streicht nur den Distanzanteil, Grundkosten bleiben | |
| Singularität | Kosten 25 (v2: 100), griechischer Rabatt −5, Wissenschaftliche Methode −10 | |
| Armeekosten Wikinger | 5 × (Armeen inkl. neuer − 1), die erste Armee ist damit gratis | Mindestpreis 5 |
| Sklaverei | höchstens **einmal pro Runde pro Stadt**; die Stadt darf davor wachsen | |
| Kolonialismus | kauft nur **herrenlose** Felder (keine Stadt, keine Kontrolle) | |

## 4. Was ein Feld einbringt

* Ressourcen sind **Fluss, kein Vorrat**: Wissenschaft, Nahrung und Münzen verfallen am
  Zugende, nur Macht bleibt liegen. (Das Regelheft sagt es nicht ausdrücklich, das
  Beispiel schon: „Mit der 1 Wissenschaft die sie übrig hat, kann sie nichts mehr anfangen.")
* Ein Feld, auf dem **irgendeine** Stadt steht, zählt für niemanden als Geländefeld.
* Kontrolle ist **nicht exklusiv**: liegt ein Feld an Städten zweier Reiche, erhalten es
  beide. So steht es wörtlich im Regelheft („Alle Felder, die an deine Städte angrenzen,
  sind unter deiner Kontrolle"), eine Konfliktregel fehlt.
* **Wald** bringt in der Grundtabelle 1 Münze. Die Zeile war in der Vorlage schwer zu
  lesen – bitte kurz gegen den gedruckten Bogen prüfen (`TERRAIN` in `js/data.js`).
* **Nahrungsdefizit** (mehr Bevölkerung als Ertrag): wird, soweit möglich, automatisch mit
  Münzen bzw. Wissenschaft gedeckt (England, Massenmedien, Gentechnik zum Kurs 1:1).
  Bleibt ein Rest, passiert nichts weiter – eine Hungerregel gibt es nicht.
* **Bürokratie** („Hauptstadt produziert doppelt") verdoppelt alles, was die Hauptstadt
  einbringt: ihre Bevölkerung **und** ihre sechs Umlandfelder. Ein Feld, das gleichzeitig
  an eine zweite eigene Stadt grenzt, zählt als Hauptstadtumland und verdoppelt sich
  ebenfalls. Das Aktionsblatt zeigt bei diesen Feldern direkt den verdoppelten Ertrag.

## 5. Straßen und Eisenbahn

Straßen liegen auf Feldern, nicht auf Kanten: 1 Münze für nichts → Straße oder
Straße → Eisenbahn, 2 Münzen für nichts → Eisenbahn. Ein Schritt zwischen zwei
Feldern kostet ½ Bewegungspunkt, wenn beide mindestens eine Straße haben, und 0,
wenn beide eine Eisenbahn haben.

**Stadtfelder zählen selbst als Straße bzw. Eisenbahn, sobald mindestens ein
angrenzendes Feld die jeweilige Stufe hat.** Ein Weg endet also nicht am Stadtrand,
sondern läuft durch die Stadt hindurch weiter; man muss (und kann) auf Stadtfeldern
nichts bauen. Zwei benachbarte Städte, die je an einer Straße liegen, sind dadurch
ebenfalls verbunden.

## 6. Technologien

* Verfügbarkeit: je Technologie ein Würfel, 4+ ist verfügbar. Griechenland +1 (im
  Standard) und Philosophie +1 **stapeln**. Ist danach nichts verfügbar, wird eine
  Technologie ausgewürfelt (Wurf über der Anzahl → neu würfeln).
* Das nächste Zeitalter wird ausgewürfelt, sobald in Feld + Zeitalter die **erste**
  Technologie erforscht ist – auch dann, wenn sie kopiert wurde.
* Jeder Effekt wirkt **sofort nach dem Forschen** im selben Zug (z. B. senkt Kartografie
  die Gründungskosten unmittelbar). `test.js` prüft das.
* Kopieren, drei getrennte Wege: **Spionage** bezahlt (1× Basiskosten in Münzen, kein
  Rundenlimit), **Kundschafterei** bezahlt (3× Basiskosten), **Internet** 1× pro Runde
  kostenlos. Wer Spionage/Kundschafterei **und** Internet hat, kann in einer Runde eine
  bezahlte **und** die kostenlose Kopie machen. Beim Kopieren gelten keine Vergünstigungen
  (Wiss. Methode etc.), es zählen die Basiskosten der Technologie.

## 7. Bots

* Der Machtwert eines Bots ist immer seine Gesamtbevölkerung (so das Regelheft) – das macht
  Bots früh militärisch stark. In 40 Testpartien gewannen sie überwiegend militärisch.
  Für ein längeres Spiel niedrigere Schwierigkeit wählen.
* **Siedlerbewegung**: Hier stehen zwei Fassungen nebeneinander. Das ausgeführte Beispiel
  zeigt die **ältere** Regel (Richtung würfeln, erst bis zu drei Felder, danach je ein Feld,
  nach jedem Schritt eine Siedelprobe). Schritt 2–4 der Bot-Regeln sind die **neuere**
  Fassung, die sie am Tisch ersetzt hat, weil sie deutlich weniger Würfe braucht.
  Digital kostet Würfeln nichts, deshalb läuft hier bewusst die ältere Wanderung – sie
  streut die Bot-Städte natürlicher über die Karte. Wer es umstellen will: `botSettle`
  in `js/bots.js`.
* Zur älteren Fassung gehört die Klausel „betritt keine durch Distanz nicht siedelbaren
  Felder". Wörtlich genommen sperrt sie den Siedler in der Hauptstadt ein, denn jedes
  Nachbarfeld liegt zu nah an der eigenen Stadt. Sie greift hier deshalb erst, sobald der
  Siedler den Sperrbereich verlassen hat.
* **Armeeprioritäten** (Reihenfolge des Regelhefts): 1. belagerte eigene Städte
  verteidigen, 2. gegnerische Städte angreifen, 3. gegnerische Armeen flankieren,
  4. an den Reichsrand ziehen, möglichst nah an einer gegnerischen Stadt. Innerhalb einer
  Priorität wählt der Bot die Option mit dem **geringsten gegnerischen Machtwert**, bei
  Städten die **Hauptstadt** bevorzugt; echte Gleichstände werden ausgewürfelt.
* **v2**: Bots forschen zweimal pro Runde (zwei Würfe auf Erfolg) und dann in zwei
  **unterschiedlichen** Technologiefeldern.

## 8. Karten

Zur Wahl stehen zwei Karten, umschaltbar im Aufbaubildschirm:

**Originalkarte (12 × 18).** Aus dem Foto des gedruckten Bogens ausgemessen, nicht
geschätzt: Rasterorientierung (spitze Ecke oben, ungerade Reihen nach rechts versetzt),
Spaltenabstand 117,4 px und Reihenabstand 101,6 px wurden aus dem Bild bestimmt, dann jede
der 216 Waben über einen Farbring innerhalb der Wabe klassifiziert. Alle 216 Felder waren
eindeutig – das unsicherste hatte noch 25 Einheiten Abstand zur zweitbesten Farbe. Die
Geländefarben der App sind exakt die des Bogens.

**Große Karte (15 × 24).** Im selben Stil erzeugt und an den Kennzahlen der Originalkarte
ausgerichtet: 68 % Land (Original 70 %), Geländeanteile 49/23/13/13/2 % gegenüber
51/21/13/11/4 %. Etwas stärker durchmischt, wie gewünscht – 51 % gleichartige Nachbarn
statt 56 %, größte einfarbige Fläche 39 statt 31 Felder. Gebirgszüge tragen Flussläufe bis
ans Meer, Inseln liegen im offenen Wasser. Kleinster Hauptstadtabstand 10 statt 7, dadurch
läuft eine Partie länger (Median 8 statt 5 Runden in 40 Bot-Testpartien).

**Offen bleibt: welche Zivilisation an welchem Stern startet.** Die vier Sterne auf dem
gedruckten Bogen sind identisch, er sagt es nicht. Zugeordnet ist nach Himmelsrichtung:
Wikingerreich Norden, Russland Osten, England Westen, Griechenland Süden – auf beiden
Karten gleich, änderbar über *Karte bearbeiten*.

Ein Anhaltspunkt aus dem Erratum „die zwei Felder nördlich der Hauptstadt des
Wikingerreichs sollten Grasland sein": auf der abgelesenen Karte trifft das nur auf zwei
der vier Sterne zu, den nördlichen und den südlichen. Das passt zur obigen Zuordnung,
beweist sie aber nicht.

„Kernphysik" und „Raumfahrt" kommen im Technologiebogen ohnehin nicht vor.

## 9. Experimentelle Variante v2

Im Aufbaubildschirm unter „Regeln" wählbar. Der Modus wird im Spielstand gespeichert und
beim Laden reaktiviert; im Rundentitel steht dann „Experimentell v2". Unterschiede zu den
Standardregeln:

- **Singularität** kostet 100 statt 25 (Rabatte gelten weiter: Griechenland −5, Wiss.
  Methode −10, also mindestens 85).
- **Griechenland** bekommt **keinen** +1-Würfelbonus mehr beim Auswürfeln der Verfügbarkeit.
  Die Kostenvergünstigung (1/2/3/4/5 je Zeitalter) bleibt.
- Zwei neue Technologien: **Keramik** (Produktion, Antike, Kosten 4) gibt den alten Effekt
  von Verbundwerkstoffe – Städte 2× pro Runde erweitern. **Theologie** (Spezial,
  Mittelalter, Kosten 10) senkt die Siegschwelle auf >3/5 der Weltbevölkerung.
- **Verbundwerkstoffe** bekommt einen neuen Effekt: 1× zusätzliches, **kostenloses**
  Wachstum pro Stadt und Runde. Allein also normales Wachstum + 1 gratis = 2×. Mit Keramik
  zusammen bis **3×** pro Stadt, davon eins gratis (das erste der Runde). In der Oberfläche
  ist das kostenlose Wachstum ein **eigener Knopf** („Kostenlos wachsen"), getrennt vom
  bezahlten „Bevölkerung wachsen".
- **Sklaverei** wird obsolet, sobald ein Reich die erste Technologie der **Moderne**
  erforscht hat.
- **Siegschwellen** stapeln nicht, es gilt immer die niedrigste verfügbare: Standard ≥2/3,
  Theologie >3/5, Vereinte Nationen >1/2.
- **Bots** forschen zweimal pro Runde und dann in zwei unterschiedlichen Feldern.

In 40 Bot-Testpartien endet v2 im Median nach 5 Runden; durch das doppelte Forschen gibt es
spürbar mehr Forschungssiege als im Standard.
