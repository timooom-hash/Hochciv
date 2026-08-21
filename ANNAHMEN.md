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
- **Wasser**: Navigation erlaubt nur das **Durchqueren** von Wasser, nicht das Anhalten darauf.
  Auf einem Wasserfeld enden darf eine Armee erst mit **Panzerschiff** oder **Luftwaffe**.
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
* Kopieren, drei **unabhängige** Wege: **Spionage** bezahlt (1× Basiskosten in Münzen, kein
  Rundenlimit), **Kundschafterei** bezahlt (3× Basiskosten), **Internet** 1× pro Runde
  kostenlos. Wer einen bezahlten Weg **und** Internet hat, bekommt pro Technologie **beide**
  Optionen angeboten (bezahlt kopieren oder die eine Gratiskopie darauf verwenden). Beim
  Kopieren gelten keine Vergünstigungen (Wiss. Methode etc.), es zählen die Basiskosten.

## 7. Bots

* Der Machtwert eines Bots ist immer seine Gesamtbevölkerung (so das Regelheft) – das macht
  Bots früh militärisch stark. In 40 Testpartien gewannen sie überwiegend militärisch.
  Für ein längeres Spiel niedrigere Schwierigkeit wählen.
* **Siedlerbewegung** (seit 17.8. nach den Schritten 1–7 der Bot-Regeln): Der Siedler zieht
  auf das **durch Bewegung erreichbare siedelbare Feld, das der Hauptstadt am nächsten
  liegt**; bei mehreren gleich nahen wird ausgewürfelt. Steht er auf einem siedelbaren Feld,
  würfelt er – bei 3+ siedelt er, sonst zieht er ein Feld in eine ausgewürfelte Richtung und
  prüft erneut. Er geht nie direkt zurück, betritt Meer nur mit Navigation/Panzerschiff/
  Luftwaffe, und trifft er auf eine eigene Stadt, beginnt er wieder mit dem Zug zum
  nächstgelegenen siedelbaren Feld. Erreichbarkeit ist Geländedistanz nach denselben
  Bewegungsregeln, die auch für Armeen gelten (`settleDistances` in `js/bots.js`).
  Vorher lief die ältere Fassung (nur würfelnde Wanderung ab der Hauptstadt). Die war
  fehlerhaft schwach: Englands Hauptstadt liegt auf der Originalkarte in einer Bucht, in der
  fünf von sechs Richtungen Meer sind, und der Siedler verschenkte jeden Schritt in eine
  gesperrte Richtung – in 32 % der Partien meldete er schon in Runde 1 „findet keinen Platz",
  obwohl 34 freie Plätze im Umkreis 5 lagen. Mit der neuen Fassung sind es **0 von 200**,
  und die Bots gründen deutlich mehr Städte (10,2 → rund 12 je Partie, in Testpartien ohne
  Kämpfe bis 17). Die Klausel „betritt keine durch Distanz nicht siedelbaren Felder" gilt
  weiter nur für die Wanderung, nicht für den Zug zum Zielfeld – sonst käme der Siedler nicht
  aus dem Sperrbereich der eigenen Stadt heraus.
* **Armeeprioritäten** (Reihenfolge des Regelhefts): 1. belagerte eigene Städte
  verteidigen, 2. gegnerische Städte angreifen, 3. gegnerische Armeen flankieren,
  4. an den Reichsrand ziehen, möglichst nah an einer gegnerischen Stadt. Innerhalb einer
  Priorität wählt der Bot die Option mit dem **geringsten gegnerischen Machtwert**, bei
  Städten die **Hauptstadt** bevorzugt; echte Gleichstände werden ausgewürfelt.
* Distanzen zu Gegnerstädten rechnet der Bot über **tatsächlich passierbares Gelände**
  (nicht Luftlinie): ohne die passende Technologie muss er Wasser umgehen.
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

## 9. Eine Regelvariante statt zwei

Die früher „experimentell v2" genannten Regeln **sind** jetzt die Regeln. Das Dropdown
„Regeln" im Aufbau ist weg, `RULESETS`/`setRules()` sind aus dem Code entfernt.
Übernommen wurde:

- **Singularität** kostet 100 (Rabatte gelten weiter: Griechenland −5, Wiss. Methode −10).
- **Keramik** (Produktion, Antike, 4) und **Theologie** (Spezial, Mittelalter, 10) sind
  normale Technologien.
- **Verbundwerkstoffe**: 1× zusätzliches, **kostenloses** Wachstum pro Stadt und Runde.
  Allein also 2×, mit Keramik bis 3×, davon eins gratis. Eigener Knopf „Kostenlos wachsen".
  Bezahltes und kostenloses Kontingent werden **getrennt** geführt (`growLimits().paid` bzw.
  `.free`, verbraucht über `city.grown` und `city.freeUsed`): das Gratis-Kontingent lässt
  sich nicht in einen zweiten **bezahlten** Schritt umwandeln. Vorher prüfte `canGrowPaid`
  nur das Gesamtmaximum, sodass man mit Verbundwerkstoffen zweimal bezahlt wachsen konnte
  (behoben 20.8.); der Knopf begründet die Sperre jetzt mit „Diese Runde nur noch
  kostenloses Wachstum.".
- **Sklaverei** wird obsolet, sobald ein Reich die erste Technologie der Moderne hat. Im
  Technologiebogen ist die Kachel dann durchgestrichen und trägt den Hinweis „obsolet".
- **Siegschwellen** stapeln nicht: es gilt die niedrigste (Standard ≥2/3, Theologie >3/5,
  UN >1/2).
- **Bots** forschen zweimal pro Runde in unterschiedlichen Feldern.
- **Griechenland hat keinen Würfelbonus** auf die Techverfügbarkeit. Der
  Zivilisationsbogen nennt „3+ beim Würfeln", der Autor hat das ausdrücklich als Fehler im
  PDF bezeichnet; es gilt nur die Kostenvergünstigung.

## 10. Nahrungsproduktion darf nicht negativ werden

Grenze ist das **Einkommen** (Geländenahrung − Bevölkerung), nicht der Vorrat.

- Jedes Wachstum wird abgelehnt, wenn das Nahrungseinkommen danach unter 0 fiele – bezahlt,
  kostenlos und aus Wundereffekten gleichermaßen.
- Ein Wundereffekt, der um mehrere Punkte wachsen lässt (Hängende Gärten, Angkor Wat,
  Freiheitsstatue), wird **so weit ausgeführt, wie er passt**, und dann abgebrochen.
- Ein bereits negatives Einkommen (nach Eroberung, Sturmflut, Revolution) wird auf 0
  gekappt. **Es verhungert niemand**, die Bevölkerung bleibt stehen.
- **Wissenschaft → Nahrung** gibt es nur über die Münzen: mit **Alchemie** (Wissenschaft →
  Münzen 1:1) kostet 1 Nahrung 2 Wissenschaft, mit Gilden oder als England 1 Wissenschaft.
  Vorher war dieser Weg gar nicht möglich – ein Fehler, der beim Bezahlen von Wachstum und
  Stadtgründungen auffiel (behoben 17.8.).
- **Gentechnik** (aus Wissenschaft) und **Massenmedien** (aus Münzen) heben die Grenze auf.
  Beide sind ausdrücklich **kein allgemeiner Umtauschkurs**: sie stehen nicht in `rates()`,
  man kann mit ihnen also nichts kaufen. Sie füttern nur, 1:1, über den Knopf am
  Nahrungszähler; der Spieler wählt zu Zugbeginn, aus welchem Vorrat – auch ohne Defizit,
  wenn er einfach mehr Nahrung möchte.
- Offene Frage, bewusst so umgesetzt: wer eine der beiden Techs hat, darf beliebig weit über
  die Grenze wachsen, und ein **nicht gefüttertes** Defizit kostet nichts (Nahrung steht dann
  bei 0). Die Techs heben die Mechanik damit eher auf, als sie in einen Handel zu verwandeln.
  Sollte die Grenze wirklich beißen, wäre die Regel „Wachstum nur so weit, wie der Spieler
  diese Runde auch füttern kann" oder „ungedecktes Defizit kostet Bevölkerung" – beides ist
  eine Zeile in `growthBlocked()` bzw. `beginTurn()`.

## 10b. Stadtgründung

Zusätzlich zu den bekannten Bedingungen (Landfeld, kein Vulkan, kein besetztes Feld,
mindestens 3 Felder Abstand zu jeder Stadt):

- **Distanzkosten zählen den Weg, nicht die Luftlinie** (`foundDistance`). Passierbar sind
  Landfelder, Wasser nur mit Navigation, Panzerschiff oder Luftwaffe, keine Vulkane und keine
  Felder mit gegnerischen Armeen (Regelheft: „Von gegnerischen Armeen besetzte Felder …
  zählen als unpassierbar"). **Gibt es keinen Weg, ist das Feld nicht gründbar** – vorher
  wich die Rechnung auf die Luftlinie aus, wodurch man als England ohne Navigation auf einer
  Insel siedeln konnte (behoben 17.8.). Kartografie erlässt nur die Distanzkosten, nicht die
  Erreichbarkeit.
  **Nicht umgesetzt, weil es eine echte Regeländerung wäre:** Das Regelheft zählt auch
  „gegnerische Territorien" als unpassierbar und verbietet das Gründen daneben. Das würde die
  Ausbreitung zwischen zwei Reichen stark einschränken – sag Bescheid, wenn es rein soll.
- **Nicht direkt neben einer gegnerischen Armee.** Gilt für Menschen (`canFound`) und Bots
  (`settleable`) gleichermaßen; eigene Armeen stören nicht, zwei Felder Abstand genügt.
- **Ausweichen des Bot-Siedlers** (Fehlerbehebung 17.8.): Zeigt die gewürfelte Richtung ins
  Wasser, auf eine Stadt oder über den Kartenrand, weicht der Siedler im Uhrzeigersinn auf die
  nächste begehbare Richtung aus, statt den Schritt zu verschenken; ist er völlig
  eingeschlossen, darf er im zweiten Durchlauf auch zurück. Vorher blieb er in einer
  Landtasche stecken – Englands Hauptstadt auf der Originalkarte liegt in einer Bucht, in der
  fünf von sechs Richtungen Meer sind, und meldete in 32 % der Partien schon in Runde 1
  „Siedler findet keinen Platz", obwohl 34 freie Plätze im Umkreis 5 lagen. Danach 2 %.
  Gemeint ist die direkte Nachbarschaft (Distanz 1), unabhängig von Raketentechnik.
- **Gründen kostet immer mindestens 1 Nahrung.** Ohne diese Untergrenze wäre es mit
  Englands Alternative „Kolonisten" (keine Basiskosten) plus Kartografie (keine
  Distanzkosten) vollständig gratis.
- Bots siedeln jetzt ebenfalls nicht auf Vulkanfeldern (vorher möglich, weil `settleable`
  nur auf „Landfeld" prüfte).

## 10c. Zufallskarte und 1 gegen 1 (neu am 17.8.)

**Zufallskarte** (im Kartenmenü wählbar): feste Größe 12 × 18 und feste Startpunkte wie auf
der Originalkarte, nur das Gelände wird gewürfelt. Die Mischung folgt der gemessenen
Verteilung der Originalkarte – 36 % Grasland, 30 % Meer, 15 % Wald, 9 % Gebirge, 8 % Fluss,
3 % Insel (`MAP_MIX`). Unter einer Hauptstadt liegt nie Meer; zusätzlich sind dort **Inseln
ausgeschlossen**, weil eine Hauptstadt auf einer Insel ohne Navigation vollständig
abgeschnitten wäre. Karten sind aus einem Startwert reproduzierbar (`randomMap(seed)`).

**Mindestgüte jedes Startplatzes** (Vorgabe des Autors, 17.8.): Jede Hauptstadt muss im
ersten Zug **mindestens 4 Nahrung** aufbringen können – Münzen zählen dabei **2:1** – und
**mindestens ein siedelbares Feld in Distanz 3** haben. Gerechnet wird mit den
Grunderträgen: keine Technologien, keine Zivilisationsfähigkeit, Stadt mit 1 Bevölkerung
(verbraucht 1 Nahrung, bringt 1 Münze). Das ist genau die Zahl, die im Spiel als verfügbare
Nahrung im ersten Zug erscheint (per Test gegen `available(S, pi, 'food')` abgeglichen).
„Siedelbar" heißt: Landfeld, kein Vulkan, mindestens 3 Felder von jeder Hauptstadt entfernt
und **über Land erreichbar** – ohne Erreichbarkeit würde `canFound` es ohnehin ablehnen.

Erfüllt ein Startplatz das nicht, wird die Karte **nicht neu gewürfelt** – vier Startplätze
gleichzeitig passen nur selten, die Ablehnungsquote wäre zu hoch. Stattdessen wird das
Umland gezielt nachgebessert: erst legt `carveSpot` bei Bedarf einen Landweg zu einem Feld in
Distanz 3, dann macht `boostFood` das nahrungsärmste Nachbarfeld zu Grasland, bis die
Schwelle erreicht ist – Meer und Inseln zuletzt, damit Küsten möglichst erhalten bleiben.
Die Geländemischung der Gesamtkarte verschiebt sich dadurch kaum (gemessen: Grasland 36 %,
Meer 29 %, Wald 14 %, Gebirge 9 %, Fluss 8 %, Insel 3 %).

Gemessen über 1600 Startplätze auf Zufallskarten und 400 auf Duellkarten: **keiner** unter
4 Nahrung, **keiner** ohne Gründungsfeld; Startnahrung median 4, höchstens 7 – die
Originalkarte liegt bei 4/5/5/4, der Startplatz ist also vergleichbar. Vorher waren es 2 %
mit negativem Nahrungseinkommen, 12 % ohne Wachstumsmöglichkeit in Runde 1 und 1 % ohne
jedes erreichbare Gründungsfeld; alle drei Werte sind jetzt 0.

Ein Sonderfall bleibt und ist keine Kartenfrage: die **Gratis-Armee der Wikinger** steht zu
Beginn neben der Hauptstadt und kann einen einzelnen Landkorridor für den eigenen Siedler
blockieren (4 von 1200 Startplätzen). Die Armee muss die Stadt ohnehin verlassen, spätestens
in der nächsten Runde ist der Weg frei.

**1 gegen 1** (Umschalter oben im Aufbau): genau zwei Reiche, jeder Platz wählt frei eine der
vier Zivilisationen mit allen drei Fähigkeiten, jeder Platz ist Mensch oder Bot. Zwei Plätze
können nicht dieselbe Zivilisation nehmen – sie teilen sich Farbe und Symbol und wären auf der
Karte nicht unterscheidbar; wählt man die des anderen, wechselt der andere Platz automatisch.
Die Karte ist immer eine frische **Zufallskarte 12 × 8** (Spalten × Zeilen) mit zwei festen,
weit auseinanderliegenden Startpunkten (`DUEL_STARTS`, Distanz 12); Platz 1 bekommt den
ersten. Beide liegen ein Feld vom Rand entfernt, damit sie sechs Nachbarfelder haben und die
Mindestgüte aus Abschnitt 10c erreichen können. **Eine Kartenwahl gibt es im Duell nicht** –
die Zeile ist ausgeblendet und das Auswahlfeld abgeschaltet.
Die **Siegschwellen liegen höher**: Wirtschaftssieg erst über 3/4 der Weltbevölkerung, mit
Theologie über 7/10, mit Vereinten Nationen über 2/3 – auch hier gilt der niedrigste
verfügbare Wert, und alle drei sind strikt („mehr als"). Militär-, Forschungs- und Kultursieg
bleiben unverändert. Der Modus steht als `S.duel` im Spielstand; die Schwellen der
Vier-Reiche-Partie bleiben unberührt.

## 10d. Tutorial als geführtes Übungsspiel

Kein Textbildschirm, sondern die **normale Spieloberfläche**: echte Karte, echte Kopfzeile,
echte Aktionsleiste, darunter ein Erklärpanel (höchstens 46 % der Höhe). 27 Schritte, davon
18 mit Aufgabe, die der Spieler **selbst** ausführen muss; „Weiter" bleibt gesperrt, bis sie
erledigt ist. Einen „Für mich machen"-Ausweg gibt es bewusst **nicht** – die Schritt-Skripte
(`auto`) existieren nur noch als Testtreiber. Jede Aktionsart nennt den **Klickweg**
(„Stadt antippen → im Blatt auf Armee bauen"); ein Test prüft, dass kein Aufgabenschritt
ohne solchen Weg auskommt.

**Alles läuft auf Schienen.** Drei Mechanismen zusammen:

1. **Feste Würfelfolge** (`TUT_DICE`): solange das Tutorial läuft, zieht `d6()` seine Werte
   aus dieser Liste statt aus dem Zufallsgenerator (`tutNextDie`, eingehängt in `d6`). Damit
   sind auch alle **Bot-Entscheidungen** identisch – Wachstum, Siedeln, Forschen,
   Armeebewegung. Die Folge wurde aus mehreren Kandidaten so gewählt, dass die Beispielpartie
   erzählerisch aufgeht (siehe unten); jede Zahl 1–6 kommt vor, sonst könnten
   Auswürfel-Schleifen im Kreis laufen. `ui.tut` wird **vor** `newGame` gesetzt, damit schon
   die Aufbauwürfe daraus kommen.
2. **Festgelegte Startverfügbarkeit** (`TUT_START_AVAIL`) statt gewürfelter: Schrift,
   Fischerei, Rad, Keramik, Eisenverarbeitung, Belagerungsmaschinen, Stadtmauern, Demokratie
   – wie im Beispielprotokoll. Später nötige Technologien (Papier, Wissenschaftliche Methode,
   Burgenbau) werden im jeweiligen Schritt freigeschaltet.
3. **Schienen in der Oberfläche** (`allow` je Schritt): erlaubt sind nur die vorgesehene
   Leistentaste, die vorgesehenen Blatt-Knöpfe, Technologiekacheln, Zielfelder. **Ein
   fehlender Schlüssel im allow-Block heißt „nichts erlaubt", nicht „alles erlaubt"** – über
   diese Lücke kam man im Protokoll-Schritt (nur `bar: ['a-log']`) über das Stadtblatt an den
   Schienen vorbei. **Leseschritte
   und bereits erledigte Aufgaben erlauben gar keine Aktion** (nur Welt und Protokoll) –
   sonst könnte man in einem Erklärschritt irgendwo gründen oder den Zug ein zweites Mal
   beenden. Gegatet wird zentral in `sheet()`, also auch Macht- und Armeeblatt.
4. **Vorgegebene Würfe je Schritt** (`dice`): wo eine Technologie des nächsten Zeitalters
   gebraucht wird (Papier, Wissenschaftliche Methode, Burgenbau), ist der zugehörige
   Verfügbarkeitswurf gesetzt. Vorher wurde die Verfügbarkeit still überschrieben – im
   Protokoll stand dann ein misslungener Wurf und die Technologie war trotzdem da.

`test.js` startet den Ablauf **zweimal** über dieselbe Funktion, die auch die App benutzt
(`tutorialSetup`), und vergleicht Protokoll und Endzustand Zeichen für Zeichen.

**Der Bogen der Beispielpartie** (Runden 1–3): Einkommen 1/5/3 verstehen · Stadt auf 3/12
(1 Basiskosten + 3 Weg) · Schrift · Hauptstadt wachsen · Zug beenden und Bots lesen ·
Zinseszins in Runde 2 · Papier · dritte Stadt · zweimal wachsen · erste Armee bauen und an
den Reichsrand ziehen · Griechenland belagert die Grenzstadt aus eigenem Antrieb
(„Angriff 5 > Verteidigung 1 (Zug 1/2)") · Wissenschaftliche Methode, danach zwei
Technologien für null · **Stadtmauern und Burgenbau** · vier Macht · **Demokratie und
Keramik** vom Rest der Wissenschaft · **vierte Stadt** vom Rest der Nahrung · Zug beenden, und
die Belagerung bricht („Angriff 9 ≤ Verteidigung 14"). Danach Nahrungsgrenze, Siegwege,
Anfängerfehler, Abschluss.

Die Belagerung wird **nicht gestellt**: der Schritt übernimmt die Armee, die der griechische
Bot von sich aus neben die Stadt gezogen hat (Notfallpfad mit eigener Protokollzeile bleibt
für den Fall, dass sie fehlt). Burgenbau ist der Grund, warum gekaufte Macht der Verteidigung
hilft – ohne die virtuelle Armee in der Stadt wäre die Stadt in Runde 3 gefallen; das war
gemessen und hat die Auswahl der Würfelfolge mitbestimmt.

**Bewusst nicht erwähnt:** Ereignisse, Weltwunder, 1 gegen 1, Zufallskarten, Karteneditor,
Kultursieg – das Tutorial bleibt in der Grundform. Ebenso stehen **keine Feldkoordinaten** in
den Texten: es wird immer über die **goldene Umrandung** gesprochen. Beides prüft `test.js`. Auch Verweise auf „die Partie des Autors"
kommen nicht vor; die zitierten Protokollzeilen sind die des laufenden Übungsspiels. Beides
ist per Test abgesichert.

**Alle Zahlen im Text** kommen aus dem laufenden Spielstand (`incomeBreakdown`, `techCost`,
`growPrice`, `defenseValue`, `attackValue`, `powerPrice`, `foodAfterGrowth`, `victoryOption`)
und können deshalb nicht veralten. „Fertig" oder „Tutorial beenden" schließt nur das Panel –
das Übungsspiel läuft ohne Einschränkungen weiter.

## 10e. Blätter und Fenster überlagern die Aktionsleiste nicht mehr

Zusätzlich war das **geschlossene** Blatt nicht wirklich weg: `translateY(110 %)` schiebt es
um die eigene Höhe nach unten, und bei kurzem Inhalt blieb ein leerer Kasten über der
Aktionsleiste stehen. Geschlossen ist es jetzt `visibility: hidden` (verzögert, damit die
Animation erhalten bleibt).

Auf breiten Geräten schwebt das Aktionsblatt in der rechten unteren Ecke – es lag damit genau
über „Protokoll" und „Zug beenden". Jetzt endet es **über** der Leiste
(`bottom: 74px + safe`), und solange ein Blatt oder ein Fenster offen ist, ist die Leiste
**gesperrt und abgeblendet** (`body.blocked`, gesetzt in `sheet`/`closeSheet`/`modal`/
`closeModal`). Das betrifft auch das Bot-Zug-Fenster, das dasselbe Blatt benutzt. Ein
Fehlgriff auf „Zug beenden" neben dem Blatt ist damit ausgeschlossen.

## 11. Zivilisationsfähigkeiten (Bogen „Civs")

Der Bogen nennt andere Völkernamen als das Spiel; zugeordnet über die identischen
Fähigkeiten, die Namen im Spiel bleiben unverändert:
Keltenreich = **Wikinger**, Ägypten = **England**, Karthago = **Russland**,
Griechenland = Griechenland. Karthagos „+1 Nahrung in Wüste" bleibt Russlands „+1 Nahrung
in Wald" – Wüste gibt es auf den Karten nicht.

Je Reich sind im Aufbau drei Fähigkeiten wählbar (Grund + zwei Alternativen). Eine
Alternative **ersetzt** die Grundfähigkeit vollständig. **Bots erhalten keine
Zivilisationsfähigkeit** – auch keine Grundfähigkeit, ein Bot-Wikinger bekommt also keine
Gratisarmee.

Auslegungen:

- **Wikinger „Beutezüge"** (Fassung des Autors vom 17.8.): Am **Ende des eigenen Zuges** wird
  für jedes Ziel, an dem eigene Armeen stehen, **Angriffswert − Verteidigungswert** gerechnet;
  alle positiven Differenzen zusammen werden **zu Beginn der nächsten Runde** als
  Wissenschaft, Nahrung und Münzen ausgezahlt. Ziele sind jede gegnerische **Stadt** und jedes
  **Feld mit gegnerischer Armee**.
  Verwendet werden exakt die Kampfwerte des Spiels (`attackValue` / `defenseValue` bzw.
  `armyDefenseValue`): mehrere angreifende Armeen addieren sich im Angriffswert, mehrere
  verteidigende im Verteidigungswert, Belagerung/Dynamit/Stadtmauern/Burgenbau zählen mit,
  und mit Raketentechnik reicht die Projektion zwei Ringe weit. Ein Feld mit gegnerischer
  Armee ist ein **eigenes Ziel** – stehen zwei Gegnerarmeen nebeneinander, gibt es zwei
  Erträge, jeder um den zusätzlichen Verteidiger geringer.
  Gerechnet wird **vor** den Belagerungen: eine Stadt, die im selben Zug fällt, bringt noch
  Beute. Ausgezahlt wird über `p.raidPending`; die Ertragsübersicht zeigt den zu erwartenden
  Betrag als **Vorschauzeile unterhalb der Summe** (kein Einkommen, wird nicht mitgezählt).
  **Messung**: mit einem militärisch starken Reich (Macht 30) flossen über 20 Partien 1809
  Punkte Beute. Mit normal gekaufter Macht (0–2, halbiert sich jede Runde, 5 Münzen je Punkt)
  war es **0** – der Ertrag setzt voraus, dass man das Ziel tatsächlich überbietet, und
  Bot-Reiche haben als Machtwert ihre gesamte Bevölkerung. Das ist die Regel, kein Fehler.
- **Wikinger „Kriegerkultur"**: **+2** Machtwert je Armee (seit 17.8., vorher +1). Der Zuschlag erhöht den
  Machtverlust zu Zugbeginn (er rechnet auf den Gesamtwert), kann selbst aber nicht verloren
  gehen – abgezogen wird nur von der gekauften Macht. Genauso die Zeusstatue (+3).
- **Griechenland „Rückschau"**: die Gratis-Tech kommt aus einem Zeitalter unterhalb der
  gerade erforschten **im selben Technologiefeld**, ignoriert die Verfügbarkeit und löst
  **keine Kette** aus. Ausgelöst wird sie von **jeder** erforschten Technologie, auch von
  kostenlosen aus Großer Bibliothek, Oxford oder Raumfahrt (seit 17.8.; vorher hing der
  Auslöser nur an `doResearch`, kostenlose Forschung ging leer aus). Oxford gibt zwei
  Technologien und damit zwei Rückschau-Ansprüche – sie stehen in einer Warteschlange
  (`p.backPicks`) und werden nacheinander abgearbeitet; offene Ansprüche verfallen zum
  Zugende. Das **Kopieren** von Technologien (Spionage/Kundschafterei/Internet) löst keine
  Rückschau aus – kopieren ist kein Erforschen.
- **Griechenland „Freie Forschung"**: 1× pro Runde, nur **verfügbare** Techs bis
  Industrialisierung (Zeitalter 0–2). Zusätzlich zur normalen Forschung.
- **England „Seemacht"**: „an Wasser" heißt hier **Meer**. Der Ereignisbogen unterscheidet
  „an Wasser oder Fluss", Fluss zählt also nicht. +2 je **Stadt**, nicht je Meeresfeld.
- **England „Kolonisten"**: Basiskosten 0, Distanzkosten bleiben.
- **Russland „Fruchtbarkeit"**: nur die **Nahrungskosten** des Wachstums fallen weg. Münzen
  und die Nahrungsgrenze aus Abschnitt 10 gelten weiter.

## 12. Ereignisse (Bogen „Ereignisse")

Im Aufbau zuschaltbar, mit Stärke **hart** (jede Runde ein Ereignis) oder **leicht** (beim
Spaltenwurf treffen nur 1/3/5, 2/4/6 gehen ins Leere – etwa halb so viele Ereignisse).
Gewürfelt wird **einmal pro Runde** unmittelbar vor dem Zug des **Startspielers**: erst die
Zeile, dann die Spalte. Auch der Rundenzähler springt dort (`S.startIdx`); vorher hing beides
an Russland als Index 0, sodass mitten in der Umdrehung eine neue Runde begann, wenn jemand
anders Startspieler war (behoben 17.8.). Das
Ergebnis gilt **gleichzeitig für alle menschlichen Reiche**; Effekte wie „würfle eine deiner
Städte aus" werden für jedes Reich einzeln gewürfelt. **Bots sind nie betroffen.**

Auslegungen:

- **Bevölkerungsverluste zerstören keine Stadt.** Pest, Sturmflut und Vulkanausbruch lassen
  immer mindestens 1 Bevölkerung stehen. Der Bogen sagt dazu nichts; die Alternative wäre,
  dass die Pest Städte mit 1 Bevölkerung (auch Hauptstädte) auslöscht.
- **Hungersnot** setzt das Nahrungseinkommen auf **genau 0** – der Verbrauch der Bevölkerung
  wird in dieser Runde nicht gegengerechnet. Begründung: bei der Revolution steht
  ausdrücklich „verbraucht aber trotzdem normal Nahrung", bei der Hungersnot nicht.
  Der Notkurs 4:1 (mit Gilden 2:1) überschreibt Englands 1:1 **nicht**.
- **Revolution**: die Hauptstadt produziert nichts, und ihr Umland ebenfalls nicht – außer
  ein Feld grenzt zusätzlich an eine andere eigene Stadt. Das folgt der Bürokratie-Auslegung,
  die das Umland als Produktion der Hauptstadt behandelt. Nahrung verbraucht sie weiter.
- **Dunkles Zeitalter** verbietet Forschen (auch die griechischen Gratis-Techs), aber nicht
  das **Kopieren** von Technologien (Spionage/Kundschafterei/Internet).
- **Bürgerkrieg** trifft die Armeen aller Nicht-Bot-Reiche. Der Nahrungs-Notkauf gilt nur
  für Armeen und Macht, nicht allgemein.
- **Atomwaffenproteste** wirken dauerhaft und für alle Nicht-Bot-Reiche.
- **Vulkanausbruch**: das Feld wird unpassierbar (auch für die Luftwaffe), bringt keinen
  Ertrag, kann nicht besiedelt werden; eine dort stehende Armee wird zerstört. Gewählt wird
  nur unter benachbarten **Landfeldern ohne Stadt**.
- **Barbareninvasion**: Macht = max(10, doppelter eigener Machtwert), **beim Auftreten
  festgeschrieben**. Zwei Angriffe: einer sofort, einer zu Beginn der nächsten Runde vor dem
  neuen Ereignis. Nur zwei Erfolge in Folge erobern; scheitert der erste, ziehen die Barbaren
  ab. Eine eroberte Stadt gehört der neutralen Fraktion **Barbaren** (Totenkopf auf der
  Karte), verliert wie üblich 2 Bevölkerung, verteidigt sich **nur mit Bevölkerung** und ist
  normal zurückerobern. Die Barbaren handeln nie, kommen nie an den Zug und können keine
  Hauptstadt angreifen. Ihre Bevölkerung zählt weiter zur **Weltbevölkerung**, macht den
  Wirtschaftssieg also etwas schwerer.

## 12b. Technologien der Weltwunder-Erweiterung

Diese vier existieren **nur in einer Partie mit Weltwundern** (`wo: true` in `TECHS`,
gefiltert über `techPool(S)`); ohne Erweiterung erscheinen sie nicht im Bogen, werden nicht
ausgewürfelt und können auch nicht kopiert oder gratis genommen werden. Das Zeitalter war
nicht vorgegeben, folgt aber eindeutig den Kostenbereichen des Regelhefts
(Antike 1–5, Mittelalter 6–10, Industrialisierung 11–15, Moderne 16–20):

| Technologie | Feld | Zeitalter | Kosten | Wirkung |
|---|---|---|---|---|
| Baukräne | Produktion | Mittelalter | 9 | Wunder kosten 2/4/6/8/… weniger, also 8/16/24/32/… statt 10/20/30/40/… Das Muster setzt sich über das sechste Wunder hinaus fort. |
| Wallfahrt | Spezial | Antike | 4 | Je eigenem Weltwunder +3 Wissenschaft, Nahrung und Münzen. Eigene Zeile in der Ertragsübersicht. |
| Militärlogistik | Militär | Mittelalter | 6 | +1 Bewegungsweite je eigenem Weltwunder. Wirkt sofort: baut man ein Wunder, bekommen die eigenen Armeen die Bewegung noch im selben Zug gutgeschrieben (wie bei Luftwaffe/Panzerschiff). |
| Raumfahrt | Forschung | Moderne | 19 | Bei jedem Wunderbau eine Technologie gratis – nicht die Singularität und kein Zeitalter, das in diesem Feld noch nicht freigeschaltet ist (`unlockedAge`: freigeschaltet = dort ist etwas verfügbar oder erforscht). Verfügbarkeit der Tech selbst ist nicht nötig. Bots würfeln sie nach den normalen Bot-Forschungsregeln aus, ohne Singularitäts-Abkürzung. |

Raumfahrt stand in den Errata als wirkungslos und war deshalb entfernt; sie kommt hier mit
der neuen Wirkung zurück. Kernphysik bleibt gestrichen.

**Ansprüche auf kostenlose Forschung sind jetzt eine Warteschlange** (`p.freePicks`).
Vorher gab es nur einen Platz, und ein Wunderbau konnte zwei Ansprüche gleichzeitig
auslösen – Raumfahrt und das Wunder selbst (Große Bibliothek, Oxford). Der zweite
überschrieb den ersten; das ist behoben und mit Test abgesichert.

## 13. Weltwunder (Bogen „Wunder")

Im Aufbau zuschaltbar. Kosten 10/20/30/40 … Münzen für das 1./2./3./4. Wunder eines
Reiches, gezählt werden die **aktuell besessenen** – ein zerstörtes oder verlorenes Wunder
senkt den Preis wieder. Stufe 2 muss seltener sein als Stufe 1, Stufe 3 seltener als Stufe 2
(strikt: das dritte Stufe-2-Wunder braucht vier Stufe-1-Wunder). Je Stadt zwei Wunder,
markiert als Raute mit Stufenzahl unter dem Stadtsymbol. Verfügbar sind je drei ausgewürfelte
Wunder der Stufen 1 und 2 – nach jedem Bau wird nachgewürfelt – sowie **alle drei**
Stufe-3-Wunder (mehr gibt es nicht). Der Pool ist für alle Reiche gemeinsam.

- **Kultursieg**: Wer ein Stufe-3-Wunder gebaut hat, gewinnt **zu Beginn seines nächsten
  Zuges** – sofern er es dann noch besitzt. Wird die Stadt vorher erobert, erbt der Eroberer
  den Anspruch.
- **Eroberung**: dauerhafte Effekte wechseln mit dem Wunder den Besitzer, einmalige lösen
  nicht erneut aus.
- **Zerstörung** einer Stadt: die Wunder sind endgültig weg (nicht mehr im Pool) – **außer**
  bei Stonehenge. Dann bleiben sie **freistehend auf dem Feld** (Raute ◈), wirken für den
  Besitzer weiter und zählen für Kosten und Stufenregel. Wer später auf dem Feld eine Stadt
  gründet, übernimmt sie; das ist die Auslegung von „nur erobern kann sie dem Besitzer
  nehmen".
- **Zeusstatue** +3 Macht und **Kreml** +50 Singularitätskosten wirken dauerhaft; der Kreml
  verteuert für **alle** Reiche, auch für den Erbauer.
- **Große Mauer** rechnet die Verteidigung **jeder** eigenen Stadt mit der Gesamtbevölkerung
  des Reiches.
- **Große Bibliothek** ignoriert die Verfügbarkeit (Mittelalter oder früher), **Oxford** nur
  momentan verfügbare Techs – **einschließlich der Singularität**, sobald ihre
  Voraussetzungen erfüllt sind; sie steht in keiner Techliste und brauchte dafür einen
  eigenen Eintrag in der Auswahl (behoben 17.8.). Kostenlos erforscht gewinnt sie das Spiel
  genauso wie bezahlt. Die Bibliothek (Mittelalter oder früher) und Raumfahrt (ausdrücklich
  „außer Singularität") bieten sie nicht an.
  Bei Oxford wird die Auswahl **beim Bau festgehalten**
  (`only`-Liste): schließt die erste Gratis-Tech ein neues Zeitalter auf, erweitert das die
  zweite Wahl nicht – „momentan verfügbar" meint den Moment des Baus (behoben 17.8.).
- **Canal du Midi** gibt 40 Münzen, die wie jede Ressource am Zugende verfallen.
- **Taj Mahal** verdoppelt das Einkommen der nächsten eigenen Runde.
- **Koloss** stellt zwei Armeen auf freie Landfelder neben der Baustadt (Armeen dürfen nicht
  auf Städten stehen); sind weniger Felder frei, entsprechend weniger.
- **Das Orakel** zeigt in der Ansicht „Welt" das Ereignis der nächsten Runde. Es wird dabei
  einmal vorgewürfelt und zu Rundenbeginn genau so verwendet.
- **Apostolischer Palast** macht sein Reich immun gegen alle Ereignisse.
- **Bots** würfeln nach dem Siedeln einmal (gegen den Schwierigkeitsgrad) und bauen dann ein
  zufälliges verfügbares und baubares Wunder – **kostenlos**, wie alle Bot-Aktionen. Gebaut
  wird in der Hauptstadt, sonst in der bevölkerungsreichsten Stadt (Gleichstand wird
  ausgewürfelt). Ein Stufe-3-Wunder gewinnt auch für sie.
- **Bots erhalten grundsätzlich keine Wundereffekte** (Stand 17.8., ausdrücklich vom Autor
  festgelegt). Umgesetzt an einer Stelle: `hasWonder(S, pi, k)` heißt „wirkt dieses Wunder
  für dieses Reich" und ist für Bots und Barbaren immer falsch; für die reine Eigentumsfrage
  (Kosten, Stufenregel, Kultursieg, Kartenmarker) gibt es `ownsWonder`. Damit entfallen für
  Bots auch die dauerhaften Effekte, die vorher über Umwege wirkten:
  Große Mauer (Verteidigung mit der Gesamtbevölkerung), Stonehenge (Wunder überleben die
  Zerstörung der Stadt), Apostolischer Palast, Zeusstatue, Leuchtturm, Pyramiden,
  Burg Himeji, Orakel. Auch ein **Kreml in Bot-Besitz verteuert die Singularität für
  niemanden**.
- Ebenso erhalten Bots **keine Effekte der vier Erweiterungs-Technologien** – mit der
  **einen Ausnahme Militärlogistik**, die nur die Anzahl der eigenen Wunder zählt und
  deshalb bewusst nicht über `hasWonder` läuft (das Regelheft erlaubt Bots ausdrücklich
  passive Technologieeffekte wie mehr Bewegungsreichweite). Baukräne, Wallfahrt und
  Raumfahrt sind bei Bots wirkungslos; sie können sie weiter erforschen, verschenken damit
  aber einen Forschungsschritt – genau wie mit Alchemie oder Gilden, die Bots ebenfalls
  nichts bringen, weil sie keine Ressourcen verwalten.
- Erobert ein **Mensch** eine Bot-Stadt mit Wundern, werden die Effekte für ihn aktiv.

---

## Oberfläche: Designänderungen vom 21.8.

Sieben Änderungen auf Wunsch des Autors. Keine davon berührt die Regeln – bis auf
`settleGain`, das eine reine Rechnung über bestehende Regeln ist.

### 1 Feste Karte, erzwungenes Querformat

- **Kein Zoomen und Schieben mehr.** Die `viewBox` des SVG umfasst immer das ganze
  Spielfeld, der Browser passt sie ein (`xMidYMid meet`) – die Karte ist damit stets
  vollständig sichtbar. `attachGestures`, `applyView`, `fitMap` und die Zustände
  `view`/`edView` sind ersatzlos entfallen.
- **Treffer statt Rechnung:** `attachTaps` hängt einen Klick-Zuhörer an das SVG und liest
  `data-r`/`data-c` vom getroffenen Sechseck (`e.target.closest('[data-r]')`). Alles, was
  darüber liegt (Glyphen, Straßen, Grenzen, Städte, Armeen, Markierungen), hat schon vorher
  `pointer-events:none` – der Treffer landet also immer auf einem Feld. Das ist **genauer**
  als die alte Suche nach dem nächstgelegenen Mittelpunkt (Ecken gehören jetzt dem richtigen
  Feld) und funktioniert auch bei gedrehter Darstellung, weil der Browser die Trefferprüfung
  macht und nicht wir.
- **Die Editorkarte ist ebenfalls fest.** Entscheidung, nicht Vorgabe: der Autor sprach von
  „der Karte". Konsistenz schien wichtiger als Zoom beim Bemalen kleiner Felder. Rückgängig
  wäre es eine Zeile (`attachTaps` durch die alte Gestenfunktion ersetzen).
- **Querformat lässt sich auf dem Zielgerät nicht erzwingen.** `screen.orientation.lock`
  existiert auf iOS Safari nicht, und das Manifest-Feld `orientation` sperrt eine iOS-PWA
  ebenfalls nicht. Umgesetzt sind deshalb drei Stufen:
  1. `"orientation": "landscape"` im Manifest (greift bei installiertem Android/Chrome),
  2. `screen.orientation.lock('landscape')`, wenn vorhanden – merkmalsgeprüft,
  3. **Notfalls dreht die App sich selbst:** `html.turn` rotiert im Hochformat den `<body>`
     um 90°. Abschaltbar im ☰-Menü, die Wahl liegt in `hochciv.noturn`.
- **Die Drehung macht Media Queries unbrauchbar** – sie messen den *ungedrehten* Viewport
  und lägen um 90° daneben. Deshalb setzt `syncLayout()` die Klassen `w-wide` (≥ 820),
  `w-side` (≥ 600 und quer) und `w-narrow` (< 600) aus der **effektiven** Layoutgröße auf
  `<html>`; die layoutkritischen Regeln hängen an diesen Klassen statt an `@media`.
  Modalinterne Aufteilungen (Technologiebogen) dürfen weiter Media Queries nutzen, weil sie
  in beiden Fällen dieselbe Seite wählen.
- Die Drehung ist in Chromium geprüft, **nicht auf echtem iOS**. Safari-Eigenheiten bei
  `position:fixed` in transformierten Vorfahren bleiben ein Restrisiko.

### 2 Ressourcenleiste

Vier eigene Kästchen (Symbol, große Zahl, Beschriftung) statt einer Zeile aus vier
Zahlenpaaren. Unter 600 px effektiver Breite fällt die Beschriftung weg, die Zahl bleibt
groß.

### 3 Das Aktionsblatt sperrt die Menüpunkte nicht mehr

Vorher galt: solange ein Blatt oder Fenster offen war, wurde die Aktionsleiste per
`body.blocked` gesperrt – gedacht als Schutz vor Fehlgriffen auf „Zug beenden" neben dem
schwebenden Blatt. Der Schutz ist jetzt **baulich** gelöst: das Blatt endet bei
`var(--bar-h)`, also exakt über der Leiste, statt darauf zu liegen. `--bar-h` und `--hud-h`
kommen aus `setBarHeight()` und werden aus der echten Höhe gemessen (`getBoundingClientRect`,
damit auch gedreht korrekt), weil die Leiste mit Schriftgröße und Geräteeinfassung wächst.
`body.blocked` bleibt nur noch für das **Bot-Fenster** – dort führt allein „Weiter" weiter.

### 4 Prozentzahl in der Kopfzeile

`Bevölkerung 8/18 (44 %)`. Kaufmännisch gerundet, bei leerer Welt 0 %. Begründung: die
Siegschwelle ist ein Anteil, keine Stückzahl.

### 5 Tutorial

- **Erledigte Aufgaben schalten selbst weiter** (`tutMaybeAdvance`, aufgerufen am Ende von
  `renderTutPanel` und aus `closeModal`). Verzögerung `TUT_AUTO_MS` = 900 ms, damit das
  Ergebnis der eigenen Aktion noch zu sehen ist; in den Tests auf 0 gesetzt, damit der
  Ablauf synchron prüfbar ist. Bewusst **nicht** automatisch:
  - im letzten Schritt (dort heißt „Weiter" *Fertig* und beendet das Tutorial),
  - solange ein Bot-Fenster offen ist,
  - solange eine kostenlose Technologie oder eine Rückschau offen ist,
  - in Leseschritten mit `keepOpen` (nur der Protokollschritt), solange das Fenster offen
    ist – sonst risse es dem Leser das Protokoll weg. `closeModal` stößt die Prüfung dann
    erneut an.
  - Es wird höchstens **eine** Stufe je Aktion geschaltet (`ui.tutAuto` sperrt während
    `tutMove`), damit kein Selbstlauf entsteht.
- **Determinismus bleibt erhalten:** zwischen „Ziel erreicht" und dem Weiterschalten wird
  nicht gewürfelt, weil erledigte Schritte über `TUT_LOOK_ONLY` ohnehin nur noch
  Nachschlagen erlauben. Die feste Würfelfolge verschiebt sich dadurch nicht.
- **Das Panel steht quer links neben der Karte** (`html.w-side`, `flex-direction:row-reverse`,
  weil im Quelltext erst die Karte kommt). Gestapelt bleibt es wie bisher unter der Karte,
  jetzt aber mit `min-height` für den Textbereich – ohne die quetschten Aufgabenzeile und
  Navigation den Text auf flachen Schirmen vollständig weg.

### 6 Protokoll: Würfe eingeklappt

Die Würfe hängen als `<details>` an **der Aktionszeile, zu der sie geführt haben** – nicht
als eigener Block. Eingeklappt sieht man nur, was passiert ist, plus ein `🎲 n`.
Die Zuordnung „Würfe davor gehören zur nächsten Zeile" stimmt, weil die Regelmaschine erst
würfelt und dann das Ergebnis protokolliert. Zwei Sonderfälle:
- **Rundenüberschriften** (`head`) bekommen nichts angehängt – sie trennen die Züge.
- **Würfe ohne folgende Aktion** (Fehlschläge am Zugende) stehen als eigener Sammelposten,
  zusammengefasst über den Grund im Wurftext (`🎲 4 — Siedeln (2+)` → „Siedeln").
Gilt für das Protokollfenster **und** das Bot-Fenster.

### 7 Ertrag beim Siedeln im Feldblatt

`settleGain(S, pi, r, c)` gibt den Einkommenszuwachs einer gedachten Stadt der Größe 1:
Einkommen mit der Stadt minus Einkommen ohne. Rechnet am echten Spielstand, also inklusive
Fähigkeiten, Wundern und Ereignissen, verändert ihn nicht (`try/finally`), und zählt
**überlappendes Umland nicht doppelt** – das fällt automatisch heraus, weil
`controlledTiles` eine Menge ist. Der eine Bevölkerungspunkt isst mit (−1 Nahrung).
Das Tutorial rechnet seine Beispielzahlen jetzt über dieselbe Funktion (`tutGain`
delegiert).

**Nachgebessert am 21.8. (zweiter Durchgang):**
- Der **Feldertrag steht wieder klein** in der Unterzeile (`Feld 6/9 · Ertrag 1🔬 0🌾 1🪙`),
  so wie vor dem Umbau – nicht mehr als eigenes Kästchen.
- Der **Siedelertrag erscheint nur, wenn hier auch gegründet werden kann**
  (`canFound` liefert null). Sonst wäre es die Antwort auf eine Frage, die sich nicht
  stellt; der Grund („Nicht auf Meer") steht ohnehin schon am Knopf *Stadt gründen*.
  Damit entfällt auch der Fall „hier steht schon eine Stadt".
- **Kein Untertext mehr** unter der Zahl (`.fact-n` ist entfallen).
- Bei Armeefeldern hängt kein Kästchen mehr an der Kopfzeile – dort ist ohnehin nie
  gründbar, und die Kopfzeile ist damit wieder wie im Original.

### 8 Technologiebogen: bezahlbar oder zu teuer

Verfügbare Technologien zerfielen bisher optisch in einen Topf, obwohl der Knopf bei zu
wenig Wissenschaft schon `disabled` war. Jetzt gibt es drei sichtbare Stufen statt zwei:

| Zustand | Klasse | Aussehen |
|---|---|---|
| erforscht | `owned` | grüner Grund, ✓ statt Kosten |
| verfügbar **und bezahlbar** | `avail afford` | roter Rand durchgezogen mit innerer Linie, heller Grund, schwarzer Titel |
| verfügbar, aber **zu teuer** | `avail costly` | derselbe rote Rand, nur gestrichelt und ohne innere Linie; **volle Deckkraft**, gedämpfter Titel, Kostenzahl rot und fett |
| nicht verfügbar | `locked` | grauer Rand, 32 % Deckkraft |

**Korrektur v32:** In v31 hatte `costly` 62 % Deckkraft. Damit verblasste auch der rote
Rand so weit, dass die Kachel einer nicht verfügbaren (40 %) ähnelte – der Unterschied,
auf den es ankommt, ging gerade verloren. Jetzt bleibt `costly` **voll deckend**; gedämpft
wird nur der Text, und die Kostenzahl steht rot und fett da – sie ist ja der Grund. `locked`
ist im Gegenzug auf 32 % gegangen. Ein Smoke-Test liest die CSS-Datei und schlägt Alarm,
falls jemand `costly` wieder eine Deckkraft gibt oder `locked` anhebt.

Rein grafisch, **ohne zusätzlichen Text** – die Kosten stehen schon in der Kachel.
Maßgeblich ist `available(S, pi, 'sci')`, nicht `res.sci`: Münzen zählen über den
Umrechnungskurs mit, eine Kachel kann also bezahlbar sein, obwohl die Wissenschaft allein
nicht reicht. Bei den **Kopien** (Spionage, Kundschafterei, Internet) gilt dasselbe mit
Münzen; **kostenlose** Angebote (Freie Forschung, Rückschau, Internet-Gratiskopie) sind
immer `afford`. Die Singularitätskachel folgt der gleichen Regel.

### 9 Hauptmenü

Die Fußzeile „Offline spielbar · zum Home-Bildschirm hinzufügen" ist entfernt (samt
`.foot`-Stil).
