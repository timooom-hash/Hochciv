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
- **Gedreht wird nur der Spielbildschirm.** Menü, Aufbau, Editor und Regelseite haben
  keine feste Karte, die Breite bräuchte – dort wäre der Zwang lästig. `applyTurn()` setzt
  `html.turn` deshalb aus zwei Bedingungen: gespeicherte Wahl (`turnWanted()`) **und**
  aktiver Bildschirm in `TURN_SCREENS` (derzeit nur `screen-game`). Nachgeführt wird das
  aus `show()`. Wo `screen.orientation.lock` existiert, wird beim Verlassen des Spiels
  `unlock()` gerufen. Soll der Editor mitdrehen, genügt ein Eintrag in `TURN_SCREENS`.
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


---

## Zwei gemeldete Fehler, behoben am 21.8. (v33)

### Bürgerkrieg: Armee/Macht mit Nahrung **und** Münzen ließ sich nicht kaufen

Nicht die Regel war falsch, sondern die Prüfung davor. `buildArmy` und `buyPower` zahlten
korrekt mit `{foodOk: …}`; die Oberfläche fragte für „ist der Knopf bedienbar?" aber
`available(S, pi, 'coins')` **ohne** diese Option. Bei reiner Nahrung fiel das nicht auf,
weil man es gar nicht erst probierte – bei einer Mischung aus Münzen und Nahrung sperrte
der Knopf einen Kauf, den die Regel erlaubt hätte. Dasselbe im Macht-Blatt (`maxN`).

Behoben, indem die Option nur noch **an einer Stelle** entsteht: `payOpts(S, pi)` in
`engine.js`. Regelmaschine und Oberfläche benutzen dieselbe Funktion. Ein Test prüft die
Invariante über **alle** Aufteilungen von Münzen und Nahrung bis zu den Armeekosten:
`available(…, payOpts) >= Kosten` genau dann, wenn `buildArmy` gelingt. Wer künftig eine
weitere Kaufprüfung in die Oberfläche schreibt, muss `payOpts` mitgeben.

### Gentechnik/Massenmedien tauschten doch in beliebiger Höhe

`rates()` bot den Kurs korrekt nicht an – aber `feed()` nahm jede Menge entgegen und
schrieb alles über dem Defizit in den Nahrungsvorrat (`p.res.food += amount - cover`).
Damit war Gentechnik faktisch ein 1:1-Kurs Wissenschaft → Nahrung, also genau das, was
seit der früheren Korrektur ausgeschlossen sein sollte. Der damalige Fix hatte nur die
Kurstabelle bereinigt, nicht das Füttern selbst.

**Jetzt gilt:** `feed()` nimmt höchstens so viel wie an Defizit offen ist, verbucht es
ausschließlich gegen `foodDeficit` und erhöht `p.res.food` **nicht mehr**. Ohne offenes
Defizit lehnt es ab. Das Blatt bietet entsprechend nur noch Beträge bis zum Defizit an.

**Getroffene Auslegung – der Autor kann sie ändern:** „füttern" heißt hier *das offene
Nahrungsdefizit decken*. Denkbar wäre auch *die laufende Nahrungsaufnahme der Bevölkerung
decken* – dann dürfte man über das Defizit hinaus geben, bekäme echten Nahrungsvorrat und
könnte in derselben Runde weiterwachsen.

**Drei Tests hatten den Fehler festgeschrieben** („3 deckt das Defizit, 2 werden Nahrung")
und mussten mitkorrigiert werden – das Verhalten war also getestet, nur gegen die falsche
Erwartung.


---

## Nahrung neu gedacht (v35)

### Bevölkerungskosten sind ein deckbarer Posten, kein fester Abzug

Bisher war die Bevölkerung ein Minusposten im Nahrungseinkommen, und mit Gentechnik/
Massenmedien durfte man ein entstandenes **Defizit** decken. Jetzt gilt: was die
Bevölkerung isst (`popFood`), ist ein eigener Posten, den man wahlweise aus Nahrung,
Wissenschaft oder Münzen bestreitet.

- `popFoodCost(S, pi)` kommt aus der Bevölkerungszeile von `incomeBreakdown` – enthält
  also Bürokratie (verdoppelt auch den Verbrauch der Hauptstadt) und Ökologie (senkt ihn)
  genau wie das Einkommen selbst. Bei Hungersnot ist er 0, weil dort das Einkommen
  ohnehin pauschal gekappt wird; sonst liefen Anzeige und Rechnung auseinander.
- `coverPop(S, pi, kind, n)` deckt `n` davon aus Wissenschaft oder Münzen. Obergrenzen:
  der noch offene Teil der Kosten und der eigene Vorrat. **Kein Umtausch:** mehr als die
  Bevölkerung isst geht nicht, es wird nur innerhalb des Rundeneinkommens verschoben.
- Der Anteil, der ein offenes Defizit tilgt, wird **nicht** zu nutzbarer Nahrung – nur
  der Rest. Sonst entstünde aus dem Decken mehr Nahrung, als verbraucht wird.
- `uncoverPop` nimmt zurück, **LIFO**: erst der Vorratsanteil, dann der Defizitanteil.
  Andersherum stünden Nahrung und Defizit gleichzeitig da. Zurückgenommen wird nur, was
  noch da ist: ist die gewonnene Nahrung schon ausgegeben, wird abgelehnt – sonst ließe
  sich Nahrung ausgeben, die Deckung zurückholen und die Wissenschaft behalten, da ein
  Defizit selbst nichts kostet.
- Verbucht wird **inkrementell**, nicht durch Neuberechnung aus dem Rohsaldo. Eine
  Neuberechnung machte Ausgaben derselben Runde rückgängig (im Bau gefunden und behoben).
- `ensureFoodState` zieht `foodRaw`/`popFood`/`popCovered` nach, wo sie fehlen: im
  allerersten Zug und in **Spielständen aus älteren Fassungen**.
- **Bots decken nichts.** Sie verhalten sich wie bisher – passend dazu, dass Bots auch
  sonst keine Fähigkeiten und keine Wundereffekte bekommen.

Damit ist auch begründet, warum man mit einer der beiden Techs in rechnerisch negative
Nahrung wachsen und siedeln darf: jeder Bevölkerungspunkt bringt +1 Wissenschaft und
+1 Münze und isst 1 Nahrung, lässt sich also im Zweifel immer selbst tragen.

### Das Fenster zu Zugbeginn

`foodSheet()` geht zu Zugbeginn auf, sobald Gentechnik oder Massenmedien erforscht sind
und Kosten offen sind. Es zeigt die Rechnung – Land produziert, Bevölkerung isst, davon
bestritten, bleibt nutzbar – und darunter Knöpfe zum Einsetzen und Zurücknehmen.
Voreingestellt ist **keine** Verschiebung, also Deckung aus Nahrung. Ohne die Techs zeigt
es nur die Übersicht. Über den Nahrungswert in der Kopfzeile lässt es sich jederzeit
wieder öffnen.

### Ereignisse verschieben die Nahrungsgrenze nicht mehr

Gemeldeter Fehler: Dürre oder Revolution machten das Nahrungseinkommen für **eine** Runde
negativ, und `growthBlocked` verbot daraufhin Wachstum und Siedeln – obwohl die Stadt
dauerhaft gedeckt gewesen wäre. Reproduziert für Dürre und Revolution.

Behoben über `baseIncome(S, pi)`: es rechnet mit `S.evMuted = true` (alle Ereigniswirkungen
aus, geprüft in `evActive` und `evTerrainDead`) und ohne den Taj-Mahal-Rundenbonus.
`foodAfterGrowth` und damit `growthBlocked` beruhen jetzt darauf.

**Was sich bewusst NICHT ändert:** die *Kosten* für Wachstum und Gründen kommen weiter aus
dem tatsächlichen Rundeneinkommen. Eine Hungersnot lässt also weiter wenig übrig – sonst
wären die Ereignisse wirkungslos. Die Grenze und die Kasse sind zwei verschiedene Dinge.


---

## Handelsrouten, Konfetti und der Oxford-Fehler (v36)

### Neue Regel: Handelsrouten

Jede eigene Stadt außer der Hauptstadt, die über einen durchgehenden Weg mit ihr
verbunden ist, bringt **+1** auf alle drei Erträge; ist der Weg durchgehend Eisenbahn,
**+2**. Verbucht als eigene Zeile „Handelsrouten" in der Ertragsübersicht.

Umgesetzt in `tradeRoutes(S, pi)` als **zwei getrennte Suchen** von der Hauptstadt aus –
einmal nur über Eisenbahnfelder, einmal über Felder mit mindestens Straße. Die
Mischungsregel ergibt sich damit von selbst: eine Stadt, die nur die zweite Suche
erreicht, hängt an einer gemischten Strecke und bekommt +1. Es genügt also nicht, dass
irgendwo Eisenbahn liegt – sie muss durchgehend sein.

**Getroffene Auslegungen** (die Vorgabe lässt sie offen, der Autor kann sie ändern):
- **Stadtfelder zählen über `effectiveRoad` mit**, wie überall sonst: ein Weg endet nicht
  am Stadtrand, man muss auf dem Stadtfeld selbst keine Straße bauen. Konsequenz: grenzen
  zwei Städte direkt aneinander und liegt an einer davon eine Eisenbahn, gilt die
  Verbindung als reine Bahn. Praktisch irrelevant, weil zwischen zwei Städten mindestens
  drei Felder liegen müssen – die Zwischenfelder werden nicht aufgewertet.
- **Der Weg darf über neutrales Gebiet laufen**; nur **fremde Städte** sperren ihn.
  (Passend dazu, dass die Regelheft-Klausel „gegnerische Territorien sind unpassierbar"
  bewusst nicht umgesetzt ist.)
- **Ohne Hauptstadt keine Routen** – wird sie erobert, brechen alle weg.
- Es ist eine **Grundregel**, gilt also auch für Bots (anders als Wundereffekte).

**Gemessene Schwäche:** In 25 vollständigen Bot-Partien haben Bots **kein einziges Mal**
eine Straße gebaut – die Regel ist damit praktisch ein reiner Vorteil für den Menschen.
Wer das ausgleichen will, müsste `bots.js` um Straßenbau erweitern; das ist bewusst nicht
geschehen, weil es das Bot-Verhalten spürbar verändert.

Aufwand: kein messbarer. Testlauf mit und ohne die Regel jeweils ~5,4 s – die Kurzschlüsse
(keine zweite Stadt, keine Straßen auf der Karte) greifen fast immer.

### Fehler: Oxford + Singularität ließ das Spiel hängen

Die Universität von Oxford gibt zwei kostenlose Technologien, und die Singularität steht
dabei ausdrücklich zur Wahl. Wählt man sie, setzt `applyTech` sofort `S.over` – aber der
Klick-Handler in `freePickModal` prüfte das nicht. Er sah den **zweiten** offenen Anspruch,
rief sich selbst auf, fand keine Optionen mehr und schloss das Fenster stumm. Ergebnis:
Spiel vorbei, aber kein Siegbildschirm – es wirkte hängengeblieben. Reproduziert.

Behoben durch eine `S.over`-Prüfung an beiden Stellen (am Anfang von `freePickModal` und
nach jeder Wahl). Ein Smoke-Test spielt genau diesen Weg nach; mit künstlich
zurückgebautem Fehler schlägt er an.

### Konfetti

`confetti(farbe)` hängt 40 Papierschnipsel in der Reichsfarbe in einen Kasten über allem,
lässt sie gut zwei Sekunden fallen und räumt sich nach 3,4 s selbst ab. Bewusst klein.
`pointer-events:none`, damit „Zurück zum Menü" sofort erreichbar bleibt; ein zweiter Aufruf
ersetzt den alten Kasten, statt zu stapeln. Bei `prefers-reduced-motion: reduce` entfällt es.
Die Fallhöhe hängt an `--fall`, weil im gedrehten Hochformat „unten" die kurze Seite ist.


---

## Fehler: Eisenbahn ohne Rad war nicht baubar (v37)

Gemeldet und reproduziert: Wer die Eisenbahn erforscht hatte, aber nicht das Rad, konnte
überhaupt keine Wege bauen. **Zwei Fehler in einem**, beide in der Oberfläche:

1. Der Knopf erschien nur unter `has(p, 'rad')` – ohne Rad gab es ihn gar nicht.
2. Selbst mit Knopf hätte er auf leeren Feldern Stufe 1 gewählt (`roadLevel >= 1 ? 2 : 1`),
   und `buildRoad` hätte mit „Rad noch nicht erforscht" abgelehnt.

Die Regelmaschine konnte es die ganze Zeit: `buildRoad(S, pi, r, c, 2)` gelang auch ohne
Rad. Es ist derselbe Fehlertyp wie beim Bürgerkrieg – die Oberfläche leitet eine
Entscheidung selbst her, statt die der Regelmaschine zu übernehmen.

**Behoben mit `roadTarget(S, pi, r, c)`** in `engine.js` als einziger Wahrheit; Blatt und
`doRoad` benutzen sie. Dazu `canBuildRoads(p)` für die Frage, ob der Knopf überhaupt
erscheint. Die Regel:

| Stufe auf dem Feld | nur Rad | nur Eisenbahn | beides | keins |
|---|---|---|---|---|
| 0 (frei) | 1 | **2** (Straßenstufe übersprungen) | 1 | – |
| 1 (Straße) | – | 2 | 2 | – |
| 2 (Eisenbahn) | – | – | – | – |

**Getroffene Auslegung:** Wer beides hat, baut auf leerem Feld zuerst die Straße. Der
Zwischenschritt ist nicht teurer als der Direktbau (1 + 1 = 2) und lässt sich früher
bezahlen – ein Test pinnt diese Gleichheit. Wer nur die Eisenbahn hat, überspringt die
Straßenstufe und zahlt direkt 2.

Abgesichert durch eine Invariante über **alle zwölf** Kombinationen aus Technologien und
Ausbaustufe: was `roadTarget` vorschlägt, muss `buildRoad` auch annehmen. Dazu ein
Smoke-Test, der den gemeldeten Fall über die echte Oberfläche nachspielt; mit künstlich
zurückgebautem Fehler schlägt er an.

Nebenbei: die Untertexte am Knopf nennen jetzt auch den Handelsrouten-Bonus
(„Bewegung kostenlos · Handelsroute +2").


---

## Wachstum für 2 Münzen · beide Wege-Knöpfe (v38)

### Fehler: mehrere Kosten aus einem Topf wurden doppelt gedeckt

Gemeldet und reproduziert: Mit **2 Münzen** und ohne 1:1-Kurs wuchs eine Stadt von 1 auf 2,
obwohl das 1 Nahrung **und** 1 Münze kostet – bei einem Kurs von 2:1 also 3 Münzen.

Zwei Ursachen, die zusammenwirkten:
1. `canGrow` prüfte `available(…,'food')` und `available(…,'coins')` **getrennt**, jeweils
   gegen den vollen Vorrat. Da sich die Arten ineinander umtauschen lassen, griffen beide
   Prüfungen auf dieselben zwei Münzen zu und meldeten beide „gedeckt".
2. `growCity` rief `pay(…,'food',1)` und `pay(…,'coins',1)` nacheinander und **wertete den
   Rückgabewert nicht aus**. Der zweite Aufruf lieferte `false`, die Stadt wuchs trotzdem.

**Behoben mit `payAll` / `affordAll`** in `engine.js`: mehrere Kosten werden der Reihe nach
(`food`, `coins`, `sci`) aus demselben Vorrat bezahlt und bei einem Fehlschlag **vollständig
zurückgerollt**. `affordAll` ist dieselbe Rechnung ohne bleibende Wirkung. Prüfung und
Bezahlung folgen damit demselben Weg – sonst gehen sie wieder auseinander, wie hier.

Zusätzlich werten `foundCity`, `buildWonder` und der Technologiekauf den Rückgabewert von
`pay` jetzt aus. Dort war es bisher folgenlos (nur eine Kostenart), aber es war dieselbe
Zeitbombe.

Abgesichert durch eine Invariante über **28 Kombinationen** aus Münzen und Nahrung:
`canGrow` erlaubt genau dann, wenn `growCity` auch gelingt.

### Beide Wege-Knöpfe auf leerem Feld

`roadTargets(S, pi, r, c)` gibt jetzt **alle** jetzt baubaren Stufen zurück statt nur der
günstigsten; `roadTarget` bleibt als „günstigste" erhalten. Auf einem leeren Feld mit Rad
und Eisenbahn stehen damit beide Knöpfe: Straße für 1 Münze, Eisenbahn direkt für 2.

**Der Preis wird immer frisch von `buildRoad` bestimmt**, nie vom Knopf übernommen. Wer im
offenen Blatt erst die Straße baut und dann die Eisenbahn, zahlt 1 + 1 = 2 – nicht 1 + 2.
Damit die **Anzeige** dazu passt, zeichnet `doRoad` das Blatt anschließend neu
(`openTile`); vorher stand am Ausbau-Knopf noch der Direktbaupreis. Ein Smoke-Test prüft
genau das, und mit zurückgebautem `openTile` schlägt er an.


---

## Neue Bot-Armeeprioritäten (v39)

Auf Vorgabe des Autors ersetzt diese Reihenfolge die alte vierstufige:

| # | Priorität |
|---|---|
| 1 | Gegnerische **Hauptstadt** erobern, die im letzten Zug erfolgreich belagert wurde |
| 2 | Armee flankieren, die die **eigene Hauptstadt** angreift |
| 3 | Eigene Hauptstadt verteidigen (möglichst neben dem Angreifer) |
| 4 | Armee flankieren, die eine **andere eigene Stadt** angreift |
| 5 | Andere eigene Stadt verteidigen |
| 6 | Gegnerische Stadt erobern, die im letzten Zug belagert wurde |
| 7 | Gegnerische Stadt angreifen |
| 8 | Gegnerische Armee flankieren |
| 9 | An den Reichsrand, am nächsten zum Gegner |

**1–6 brauchen Absprache** zwischen den Armeen (wie viele reichen? wer verteidigt was?)
und laufen deshalb in `botPlanArmies(S, pi)` über alle Armeen gemeinsam, vor den
Einzelzügen. Was dort nicht gebunden wird (`army.botDone`), entscheidet wie bisher
`botMoveArmy` für sich – das sind die Prioritäten 7–9. Die alte Priorität 1
(„belagerte eigene Städte verteidigen") ist dort entfallen, sie steckt jetzt in 3 und 5.

**Umsetzungsdetails:**
- „Im letzten Zug belagert" heißt `S.sieges[pi+'|'+id] >= 1` – der nächste gewonnene
  Kampf erobert (der Zähler läuft bis 2).
- Prio 1 zieht **alle** erreichbaren Armeen zur Hauptstadt, Prio 6 nur so viele, wie für
  `attackValue > defenseValue` nötig sind (`attackersNeeded`). Beides nur, wenn es
  überhaupt reicht – sonst wird der Punkt übersprungen.
- Zugewiesen wird **nacheinander**, nicht gleichzeitig: sonst wählen mehrere Armeen
  dasselbe Feld und alle bis auf eine bleiben stehen (im Bau gefunden und behoben).
- Verteidigen heißt: auf ein Feld in `projectRange` der Stadt, unter diesen bevorzugt das
  dichteste am Angreifer. Flankieren rechnet mit derselben Formel wie die Kampfphase
  (gegenüberliegend; mit **Taktik** von zwei beliebigen Seiten; mit **Burgenbau** zählen
  eigene Städte als Partnerposition).
- Verteidigung geht vor Eroberung; innerhalb einer Stufe zählt die **größere Stadt**
  zuerst, die Hauptstadt immer vorher.
- `botReach` nimmt das **eigene Feld** als Option auf. `reachable()` liefert es nicht mit,
  weil es als besetzt gilt – ohne diese Ergänzung räumte eine Armee, die schon genau
  richtig stand, ihren Platz und verschlechterte die Lage.
- `botDone` wird nach dem Zug wieder entfernt und landet nicht im Spielstand.

### Gemessener Balance-Effekt — der Autor sollte das wissen

Je **200 vollständige Bot-Partien** (vier Bots, gleiche Seeds), mit und ohne die neue
Planung:

| | Median Runden | Militärsiege | Forschungssiege |
|---|---|---|---|
| alte Prioritäten | 5 | 187 | 13 |
| neue Prioritäten | 7 | 130 | 70 |

Die Partien dauern länger und Militärsiege werden deutlich seltener. Das ist plausibel:
Bots verteidigen jetzt zuerst und erobern sich dadurch langsamer gegenseitig. Der Effekt
ist groß genug, dass er kein Rauschen ist. Ob er erwünscht ist, ist eine Balance-Frage –
die Prioritätenliste selbst war die Vorgabe.


---

## Tutorial: Gegenangriff statt Verteidigung (v40)

Die neuen Bot-Prioritäten aus v39 haben den Ausgang der Beispielpartie verändert:
Griechenland schickt jetzt eine **zweite** Armee zur begonnenen Belagerung (Priorität 6),
Angriff 16 gegen Verteidigung 14 – die Stadt fiel. Der Schritt hieß aber noch
„Zug beenden – und die Belagerung bricht". Statt die Würfelfolge zu suchen, bis der alte
Ausgang wieder passt, zeigt das Tutorial jetzt die stärkere Lektion.

**Gemessener Vergleich, gleiche Würfelfolge:**

| Strategie | Griechenlands Armeen danach | eigene Städte |
|---|---|---|
| 4 Macht kaufen, Armee bleibt stehen | 7/12 und 6/12 – Belagerung geht weiter | 3 → **2** |
| Belagerungsmaschinen + 3 Macht + Armee neben die feindliche Hauptstadt | 9/11 und 9/10 – beide an der eigenen Hauptstadt | 3 → **3** |

Im Protokoll steht dann wörtlich „Griechenland: Armee verteidigt die Hauptstadt". Der
Effekt folgt direkt aus der Prioritätenliste: 2/3 (eigene Hauptstadt) stehen vor 6
(Belagerung abschließen). Kein Sonderfall im Code.

### Was sich geändert hat

- **Reihenfolge:** Der Belagerungsschritt steht jetzt hinter „Wissenschaftliche Methode"
  und „Zwei Technologien für null".
- **„Macht kaufen – aber spät" → „Rechne nach, bevor du kaufst":** reiner Lesetext mit
  zwei Rechentabellen (Verteidigung 14 mit 4 Macht · Angriff 10, wenn der Bot nachlegt).
  Es wird **nichts mehr gekauft**.
- **Neu: „Der Gegenangriff als Verteidigung"** – Belagerungsmaschinen forschen, 3 Macht
  kaufen, Armee auf das Feld neben Griechenlands Hauptstadt.
- **„Zwei billige Technologien" → „Der Rest der Wissenschaft: Rad"** – Rad statt
  Demokratie und Keramik, weil gleich Straßen gebraucht werden.
- **Neu: „Straßen: die Städte verbinden"** – vier Straßen für vier Münzen, die alle drei
  Nebenstädte an die Hauptstadt hängen (+3 auf jeden Ertrag). Die Erklärung der
  Handelsrouten ist damit aus dem Abschlusstext verschwunden.
- **„Belagerung bricht" → „und der Rückzug"** – Text auf den neuen Ausgang.

**Die Rechnung geht exakt auf** (gemessen, nicht geschätzt): 3 Wissenschaft →
Belagerungsmaschinen (2) + Rad (1) = 0. 16 Münzen → 3 Macht (12) + 4 Straßen (4) = 0.

### Fragile Stelle: das Zielfeld des Gegenangriffs

Von der Armeeposition aus ist bei 3 Bewegungspunkten **nur ein einziges** Nachbarfeld der
griechischen Hauptstadt erreichbar, mit Kosten von genau 3 – die übrigen sind Meer oder zu
weit. Deshalb hat `tutStrikeSpot()` eine Rückfallebene: ist das vorgesehene Feld belegt
oder unerreichbar, nimmt es das nächstbeste erreichbare Feld, das die Hauptstadt noch
bedroht. Ohne diese Ebene wäre der Schritt eine Sackgasse.

### Nebenbei behoben: „noch 33× wachsen"

Der Schritt „Jede Bevölkerung isst" zählte je Stadt einzeln, wie oft sie noch wachsen
könnte, und summierte. Jede Stadt tat dabei so, als wüchsen die anderen nicht – bei 11
Nahrung kam so „33×" heraus. Jetzt wird reihum probiert, bis keine Stadt mehr kann, und
der Text nennt zusätzlich die tatsächliche Produktion.


---

## Tutorial: Gegenrechnung und Griechenlands Militärforschung (v41)

### Der Machtvergleich war falsch herum

Der Schritt „Rechne nach, bevor du kaufst" behauptete, Griechenlands Angriff übersteige
die Verteidigung. Gemessen stimmte das nicht: Machtwert 5, zwei Armeen also **10 gegen
14** – die Verteidigung hätte gehalten. Der Text rechnet jetzt weiter:

| Posten | |
|---|---|
| Machtwert jetzt | 5 |
| 3 Städte wachsen je 1 | +3 |
| eine neue Stadt gegründet | +1 |
| **Machtwert dann** | **9** |
| × 2 Armeen | **18** |

18 gegen 14 – der Kauf wäre eine Runde später trotzdem verloren. Alle Zahlen kommen aus
dem laufenden Spielstand (Städtezahl, Bevölkerung), nicht aus dem Text.

### Griechenland forscht im Militärfeld jetzt vorgegeben

`TUT_FOE_MILITARY = ['eisenverarbeitung', 'stahl']` statt der ausgewürfelten Stadtmauern
und Burgenbau. Grund: Mit diesen beiden kam Griechenlands Hauptstadt auf **13**
Verteidigung, und die Drohung im Gegenangriffs-Schritt wäre bloß symbolisch gewesen –
der Spieler hätte sie nie erobern können. Jetzt steht sie bei **3** (nur Bevölkerung plus
Armeen daneben): Zieht der Bot seine Armeen nicht zurück, fällt sie tatsächlich, denn der
Spieler greift mit Belagerungsmaschinen und 3 Macht mit 8 an.

**Umgesetzt, ohne die Würfelfolge zu verschieben.** `botResearch` ignoriert `avail`
komplett – Bots würfeln direkt aus dem Techpool. Die Vorgabe konnte also nicht über die
Verfügbarkeit laufen. Stattdessen würfelt `botResearch` ganz normal weiter und tauscht am
Ende nur das **Ergebnis** (`tutBotTech`). Gemessen: Der Würfelzähler steht an derselben
Stelle wie vorher (195 beim Machtschritt), der übrige Ablauf ist unverändert.
Außerhalb des Tutorials greift der Hook nicht (`ui.tut` wird geprüft).

### Was das NICHT ändert

Die Bot-Prioritäten prüfen weiterhin **nicht**, wie gefährlich eine Bedrohung ist: Prio 3
greift, sobald eine feindliche Armee die eigene Hauptstadt in Reichweite hat – unabhängig
davon, ob sie sie erobern könnte. Vor dieser Änderung zog Griechenland also auch dann
zurück, wenn seine Hauptstadt mit 13 gegen 8 sicher gewesen wäre. Mit den neuen
Forschungen deckt sich das Verhalten mit der Lage; das Verhalten selbst ist unverändert.


---

## Verteidigt wird erst bei laufender Belagerung (v43)

Ursprünglich lösten die Verteidigungsprioritäten 2–5 aus, sobald **irgendeine** feindliche
Armee eine eigene Stadt in Reichweite hatte – auch eine chancenlose. Ein Zwischenstand
(v42) rechnete deshalb aus, ob der Angriff die Verteidigung ohne die eigenen beweglichen
Armeen überstiege. Das war unnötig kompliziert. Jetzt gilt schlicht:

```
bedroht  ⟺  S.sieges[Gegner|Stadt] >= 1
```

Also: **Hat ein Gegner in einem der letzten Züge einen erfolgreichen Angriff auf diese
Stadt geführt?** Nur dann ziehen alle erreichbaren Armeen zur Verteidigung zurück.

**Warum das reicht:** Eine Eroberung braucht zwei erfolgreiche Züge in Folge. Zieht der
Bot Verteidiger ab und beginnt dadurch überhaupt erst eine Belagerung, bleibt ihm eine
volle Runde, sie zurückzuholen – dieselbe Vorwarnzeit, die auch der Mensch hat („Zug 1/2"
ist die Warnung). Eine Kraftrechnung im Voraus ist damit überflüssig.

Nebeneffekt im Protokoll: Die Ursache ist jetzt sichtbar. Im Tutorial steht
`Kampf um Griechenlands Stadt: Angriff 8 > Verteidigung 3 (Zug 1/2)` und direkt darunter
`Griechenland: Armee verteidigt die Hauptstadt`.

### Gemessener Balance-Effekt

Je 200 vollständige Bot-Partien, gleiche Seeds:

| | Median Runden | Militärsiege | Forschungssiege |
|---|---|---|---|
| vor der neuen Prioritätenliste | 5 | 187 | 13 |
| jede Armee löst aus (v39–v41) | 7 | 130 | 70 |
| Kraftrechnung (v42, verworfen) | 6 | 146 | 54 |
| **nur laufende Belagerung (v43)** | **6** | **152** | **48** |

Der Belagerungs-Trigger liegt noch näher am alten Verhalten als die Kraftrechnung – Bots
binden nur dann Armeen, wenn wirklich etwas passiert ist.

### Wirkung im Tutorial

Genau deshalb bekommt Griechenland dort Eisenverarbeitung und Stahl statt Stadtmauern und
Burgenbau (v41): Mit Mauern und Burgenbau stünde seine Hauptstadt bei 13, der Angriff von
8 käme nicht durch, **es entstünde kein Belagerungszähler** – und der Bot hätte keinen
Grund zurückzuziehen. Mit den neuen Forschungen steht sie bei 3, der Angriff sitzt, der
Zähler springt auf 1/2 und der Rückzug folgt. Die beiden Änderungen greifen ineinander.

## Bot-Forschung: zufällig im Spiel, fest im Tutorial

Bots forschen **absichtlich** ohne Rücksicht auf Verfügbarkeiten – sie würfeln Feld,
Zeitalter und Technologie direkt aus dem Pool. Das bleibt so.

Nur im Tutorial liegt das Ergebnis fest, und zwar auf zwei Wegen:
- Die **feste Würfelfolge** (`TUT_DICE`) macht jeden Durchlauf identisch – auch für alle
  anderen Reiche.
- Der Hook **`tutBotTech`** tauscht zusätzlich das Ergebnis im Militärfeld für
  Griechenland. Gewürfelt wird trotzdem ganz normal, nur das Resultat wird ersetzt –
  sonst verschöbe sich die Folge.

Abgesichert durch zwei komplette Tutorial-Durchläufe im Test: identische Technologien bei
**allen** Reichen, identischer Würfelverbrauch, Eisenverarbeitung und Stahl dabei,
Stadtmauern und Burgenbau nicht. Außerhalb des Tutorials gibt der Hook `null` zurück.


---

## Tutorial: feste Texte, Zurückblättern, Armeen aus der Stadt (v44)

### Alle Schritttexte sind jetzt fest verdrahtet

Die Texte rechneten ihre Zahlen aus dem laufenden Spielstand (81 eingebettete Ausdrücke).
Das war beim Nachlesen verwirrend, weil dieselbe Stelle je nach Zeitpunkt andere Werte
zeigte – besonders auffällig beim Gegenangriffs-Schritt, wo der Verteidigungswert der
gegnerischen Hauptstadt beim Öffnen höher stand als in der Rechnung, weil die feindliche
Armee noch daneben stand.

Vorgehen: Alle 29 Schritte wurden im jeweils richtigen Zustand gerendert (jeder Schritt
nach den `auto()`-Aufrufen der vorherigen) und die `html`-Funktionen durch den gerenderten
Text ersetzt. `hl`, `goal`, `auto` und `allow` bleiben dynamisch – nur die Anzeige ist
eingefroren. Wer Zahlen ändert (Kosten, Kartenfelder), muss die Texte jetzt von Hand
nachziehen; dafür stimmen sie beim Zurückblättern immer.

### Zurückblättern springt nicht mehr vor

`tutMaybeAdvance` schaltete auch dann automatisch weiter, wenn man einen erledigten
Schritt noch einmal aufschlug – die Seiten waren damit praktisch nicht mehr lesbar.
`ui.tut.max` merkt jetzt den weitesten je erreichten Schritt; automatisch geht es nur
dort weiter. Vorwärtsblättern und die Aufgaben selbst bleiben unverändert.

### Die Zugablauf-Einordnung ist weg

Alle 29 `sub`-Felder („Zugablauf 2 von 5 · Macht") sind entfernt, ebenso die Anzeige.
Die Zeile bleibt im Aufbau erhalten (sie trägt „Tutorial beenden"), nur leer.

### Bots lassen keine Armee in der eigenen Stadt stehen

Gemeldet: Im Tutorial blieb die zweite griechische Armee in der Hauptstadt stehen.
`botOutOfCity` streicht eigene Stadtfelder jetzt aus den Halteplätzen – in `botReach`
(Prioritäten 1–6) und in `botMoveArmy` (7–9). **Ausnahme:** Gibt es gar keinen anderen
Halteplatz, bleibt das Stadtfeld erlaubt, sonst könnte eine Armee auf einer vollen Insel
gar nicht mehr ziehen.

Begründung: In der Stadt blockiert eine Armee den Bauplatz für die nächste, kann nicht
flankieren und niemanden abfangen; ein Feld daneben zählt genauso zur Verteidigung.


---

## Kostenlose Armeen erscheinen in der Hauptstadt (v48)

**Wikinger „Beutezüge"** stellte seine Startarmee bisher auf ein freies Nachbarfeld der
Hauptstadt. Jetzt erscheint sie **in** der Hauptstadt, mit `born = aktuelle Runde` – also
genau wie eine gebaute Armee, samt der Erinnerung beim Zugende, dass sie die Stadt noch
verlassen muss. Betrifft nur menschliche Wikinger: Bots bekommen keine Fähigkeiten und
damit auch keine Startarmee (`isAbil` ist für Bots immer false).

**Der Koloss** stellte zwei Armeen gleichzeitig auf Nachbarfelder. Jetzt kommen sie in die
Hauptstadt – aber **nacheinander**, weil auf einem Feld nur eine Armee stehen kann:

- `p.freeArmies` ist eine Warteschlange (der Koloss legt 2 hinein).
- `spawnFreeArmies(S, pi)` stellt so viele, wie Platz haben – praktisch also eine, denn
  danach ist die Hauptstadt besetzt.
- Aufgerufen wird sie an drei Stellen: beim Wunderbau, **nach jeder Armeebewegung**
  (`moveArmy`) und zu **Zugbeginn** (`beginTurn`), falls letzte Runde kein Platz war.
- Die Armeen bekommen `mp = moveAllowance` und `born = aktuelle Runde`, gelten also als
  frisch gebaut und dürfen sich sofort bewegen.
- `pendingWarnings` weist auf eine noch wartende Armee hin.

Damit gilt durchgängig dieselbe Regel wie beim normalen Armeebau: erscheinen in der Stadt,
sofort herausbewegen, ein Feld je Armee. Vorher waren die Gratisarmeen die einzige
Ausnahme – sie standen mit `mp: 0` neben der Stadt und konnten sich in der Runde ihres
Erscheinens gar nicht bewegen.


---

## Drei Anpassungen (v49)

### Techbogen zeigt, was andere Menschen erforschen könnten

Neben den Marken „hat diese Technologie" gibt es jetzt eine zweite Art: „könnte sie
erforschen". Sie erscheint **nur bei mehr als einem menschlichen Spieler** und **nur für
andere** – die eigene Verfügbarkeit sieht man ohnehin am Zustand der Kachel.

**Bots bekommen nie eine solche Marke.** Sie kennen keine Verfügbarkeiten, sondern würfeln
Feld, Zeitalter und Technologie direkt aus dem Pool; eine Anzeige „könnte" wäre dort
schlicht falsch.

Optisch nach demselben Muster wie bezahlbar/zu teuer im selben Bogen: beide Marken sind
umkringelt, „hat es" durchgezogen und satt, „könnte es" gestrichelt und blass. Eine
Möglichkeit soll nicht aussehen wie eine Tatsache. Die Legende über dem Raster erklärt
den Ring – aber nur, wenn es mehr als einen Menschen gibt.

### Versionsnummer im Hauptmenü

`APP_VERSION` in `js/data.js` ist die Quelle; das Menü zeigt sie unten als
„Hochzeivilization v49". Sie muss zur `VERSION` in `sw.js` passen – **ein Test bindet
beide aneinander**, sonst zeigt das Menü etwas anderes an, als der Offline-Cache
ausliefert. Beim Hochzählen also beide Stellen ändern; der Test schlägt sonst an.

### Zugende mit Armee in der Stadt ist gesperrt, nicht mehr nur bestätigungspflichtig

Bisher warnte `pendingWarnings` einmal, der zweite Tipp auf „Zug beenden" ließ durch.
Jetzt gibt es `blockingIssues(S, pi)`: Steht eine Armee auf einem Stadtfeld, ist das
Zugende **gar nicht** möglich – Städte tragen keine Armeen, der Zustand ist ungültig.

**Ausnahme gegen die Sackgasse:** Blockiert wird nur, wenn die Armee auch tatsächlich
herauskann. Geprüft wird über `armyReach`, ob ein erreichbares Feld außerhalb einer Stadt
existiert. Sonst wäre der Zug bei einer eingeschlossenen Insel, ringsum besetzten Feldern
oder aufgebrauchter Bewegung nicht mehr beendbar.

`pendingWarnings` behält nur noch die weichen Hinweise (wartende Gratisarmee).

## Zufallskarten aus Dreiecksplättchen (v50)

Zufallskarten entstehen nicht mehr Feld für Feld, sondern werden aus **Dreiecken zu je 15
Feldern** zusammengelegt. Der Vorrat in `js/tiles.js` (`TILE_POOL`) hat **20 von Hand
entworfene Plättchen**; gezogen wird ohne Zurücklegen. Ein Plättchen wird als fünf
Feldzeilen 5/4/3/2/1 notiert – so sieht es in einem A-Platz in Lage 1 auch auf der Karte aus.

### Geometrie: warum die Formen genau so aussehen

Gerechnet wird in Würfelkoordinaten (`x + y + z = 0`, `z` ist die Zeile). Ein Dreieck ist

* **Typ A**: Feld = `a + (i, j, k)` mit `i+j+k = 4` und `Summe(a) = −4` (Spitze unten),
* **Typ B**: Feld = `a − (i, j, k)` (Spitze oben).

Beide werden über dasselbe Tripel angesprochen; eine Drehung um 120° ist genau
`(i,j,k) → (j,k,i)`. Deshalb passt jedes Plättchen in **genau drei Lagen** in denselben
Platz und wird dabei **nie gespiegelt** – ein Fluss, der entlang einer Kante läuft, bleibt
ein Fluss entlang einer Kante.

Zwei Rechnungen haben die Formen bestimmt (beide von `test.js` nachgerechnet, nicht
geschätzt):

* **6 Dreiecke = Sechseck mit Radius 5 ohne das Mittelfeld** (90 = 91 − 1). Die sechs
  liegen als Windrad um genau ein freies Feld. Das ist kein Schönheitsfehler, sondern
  zwingend: 6 · 15 ist immer um eins kleiner als das nächste Sechseck.
  **Das Loch bleibt ein Loch** – dort ist kein Feld, es wird nicht aufgefüllt. Mitten in
  der Welt liegt also ein unpassierbarer Punkt, um den herum gezogen werden muss und der
  einer Stadt daneben ein Ertragsfeld nimmt. Das ist so gewollt (Entscheidung des Autors).
* **9 Dreiecke = großes Dreieck mit Seite 16 ohne das Mittelfeld** (135 = 136 − 1) –
  das Sechseck plus je ein Dreieck an drei abwechselnden Kanten. Exakt, keine weitere
  Lücke; das eine Loch sitzt genau dort, wo die drei Reiche aufeinandertreffen.

Für **vier Reiche** war die naheliegende Lesart (zwei Reihen à fünf, also zwei Windräder,
die sich zwei Plättchen teilen) **geometrisch unmöglich**: die Mitte des zweiten Windrads
läge im Radius des ersten Sechsecks und wäre dort schon überdeckt, könnte also nicht frei
bleiben. Gebaut ist deshalb ein **Streifenverbund**: zwei Reihen zu fünf Dreiecken,
abwechselnd A und B. Der deckt **150 Felder exakt ab – ohne Loch und ohne Überlappung**
(die Vierer-Karte ist also die einzige ohne Loch),
Form 10 × 18, und hat trotzdem die verlangte Struktur: zwei mittige Plättchen, acht
darum herum, die Reiche auf jedem zweiten davon.

Alle drei Formen beginnen in einer **geraden Zeile**. Das ist Pflicht, nicht Zufall: bei
odd-r-Versatz kippt eine Verschiebung um eine ungerade Zeilenzahl den Zeilenversatz und
verzerrt die Form. Ein Test prüft es.

### Was offen liegt und was verdeckt ist

* Die Plättchen, die **niemandem gehören**, liegen von Anfang an offen – mit gelosten
  Lagen, damit die Startaufstellung auch bei denselben Plättchen anders aussieht.
* Das **eigene Startplättchen** kennt nur, wer es legt. Sichtbar sind während des Legens
  die offenen Plättchen und das eigene, sonst nichts. Erst wenn alle fertig sind, wird
  aufgedeckt.
* **Auslegung:** Das Regelheft dieser Erweiterung gibt es nicht; verlangt war das
  verdeckte Legen ausdrücklich nur für zwei Reiche. Umgesetzt ist es für **alle**
  Spielerzahlen – bei drei und vier wäre offenes Legen sonst ein Vorteil für den, der
  zuletzt legt.

### Hauptstadt „frei\" – mit einer Einschränkung

Gesetzt werden darf auf **jedes Landfeld des eigenen Plättchens**, mit einer Ausnahme:
Felder, die einem **fremden Startplättchen näher als 3 Felder** kommen könnten, sind
gesperrt (`PLACE_MIN_GAP = 3` in `js/tiles.js`). Grund: Städte brauchen 3 Felder Abstand,
beide Seiten legen aber **verdeckt** – ein Verstoß wäre hinterher nicht mehr zu heilen.
Gesperrt ist damit nur, was auch im schlimmsten Fall zu nah käme, nicht mehr.

Das kostet wenig: bei zwei Reichen 1 Feld von 15 (die innere Spitze), bei vier Reichen 1
bis 2, bei drei Reichen keines. Die **drei mittigen Felder sind nie gesperrt** – dort
setzen Bots. Wer den Abstand größer haben will, erhöht `PLACE_MIN_GAP`; mit 4 sind
Hauptstädte garantiert 6 (2 Reiche) bzw. 4 (4 Reiche) Felder auseinander, es fallen dann
aber 3 bzw. 5 Felder weg.

### Startgüte statt Startgarantie

Der alte Rasterkartengenerator hat den Startplatz **garantiert** (4 Nahrung, Siedelplatz
in Reichweite). Auf Plättchenkarten wählt man selbst, also braucht es keine Garantie mehr
– außer für Bots, die zufällig legen. Deshalb gilt für jedes Plättchen im Vorrat:

* die drei mittigen Felder sind Land,
* jedes davon bringt im ersten Zug **mindestens 4 Nahrung** (Münzen 2:1).

Das lässt sich beim Entwerfen entscheiden, weil die **sechs Nachbarn eines mittigen Feldes
sämtlich auf demselben Plättchen liegen** – ein mittiges Feld hat in `(i,j,k)` überall
Werte ≥ 1. Ein Test rechnet alle 60 Fälle nach; die Spanne liegt bei 4 bis 7 Nahrung
(Rasterkarte: 4 bis 7, also derselbe Bereich).

### Felder außerhalb der Karte

Plättchenkarten sind nicht rechteckig, die Datenstruktur aber schon. Alles, was nicht zur
Form gehört, ist das neue Gelände **`X` „Kein Feld\"**: wird nicht gezeichnet, ist nicht
antippbar, unpassierbar, bringt nichts und taucht in keiner Ertragsübersicht auf.
`isOff(t)` unterscheidet es vom Vulkan, der ein echtes (nur wertloses) Feld ist.

Im **Karteneditor** wird `X` blass und gestrichelt gezeichnet und bleibt antippbar –
sonst ließe sich ein versehentlich gesetztes „Kein Feld\" nicht zurücknehmen. Damit lassen
sich auch eigene Karten mit beliebigem Umriss bauen.

### Drei Reiche

Bisher gab es „Vier Reiche\" und „1 gegen 1\". Für die Dreiecksform mit neun Plättchen
brauchte es einen **Drei-Reiche-Modus**: drei Plätze mit freier Zivilisationswahl wie im
Duell. Siegschwellen sind die **Standardschwellen** (2/3), nicht die des Duells – die
höhere Duellschwelle hängt daran, dass es dort nur einen Gegner gibt.

Die festen Karten (Original, Große Karte) stehen für drei Reiche weiter zur Wahl; der
vierte Startstern bleibt dann einfach unbenutzt.

### Kartenmenü nach Spielerzahl

Das Kartenmenü hängt jetzt an der Spielerzahl: die Plättchenkarte hat für 2, 3 und 4
Reiche eine eigene Form, die festen Karten haben vier Startsterne und passen nicht ins
Duell. Die alten Rastergeneratoren bleiben als **„Rasterkarte\"** erhalten (12 × 8 im
Duell, 12 × 18 sonst) – wer die Legephase nicht will, hat damit weiter eine Zufallskarte
in einem Zug. Die zuletzt bewusst gewählte Karte wird gemerkt (`setupMapWanted`), damit
ein Ausflug in den Duellmodus die Wahl nicht still umstellt.

## Spielende: Ansprüche und Punktvergleich (v51)

Bis v50 endete das Spiel in der Sekunde, in der eine Siegbedingung erfüllt war. Auf
Wunsch des Autors gilt jetzt:

* **Militärsieg** (fremde Hauptstadt erobert) endet **sofort** und gewinnt für den
  Angreifer. Kein Vergleich, keine Wartezeit.
* **Wirtschafts-, Forschungs- und Kultursieg** enden das Spiel **nicht** sofort. Wer die
  Bedingung erfüllt, **meldet einen Sieg an**; die laufende Runde wird zu Ende gespielt.
  Das Spiel endet am **Rundenende** – dort, wo die Reihe wieder zum Startspieler kommt.
* Erfüllen in derselben Runde **mehrere** Reiche eine nichtmilitärische Bedingung,
  entscheiden **Punkte**:

      Punkte = Bevölkerung + Anzahl Weltwunder + Anzahl Technologien

* Ein Anspruch **bleibt gültig**, auch wenn die Bedingung später wieder wegfällt: sinkt
  die Bevölkerung unter die Schwelle oder wird das Stufe-3-Wunder erobert, zählt der
  Anspruch trotzdem – für das Rundenende genauso wie für den Punktvergleich. Gewertet
  werden die Punkte **am Rundenende**, nicht die zum Zeitpunkt des Anspruchs.

Im Code: `claimVictory(S, pi, how)` legt den Anspruch ab (`S.claims`, `S.endRound`),
`victoryScore(S, pi)` rechnet die Punkte, `resolveClaims(S)` läuft in `advanceTurn` genau
an der Stelle, an der die Runde umschlägt. `S.over` bekommt dann zusätzlich `winners`,
`score` (die volle Punktetafel) und `shared`. Der Militärsieg setzt `S.over` weiter direkt
und trägt `military: true`.

### Gleichstand: Mensch vor Bot

Steht es nach Punkten gleich, **gewinnen die Menschen allein** – ein Bot nimmt einem
Menschen den Sieg nicht weg, wenn beide gleich weit gekommen sind (Vorgabe des Autors).
Die Regel greift ausdrücklich **nur** beim Gleichstand: hat der Bot einen Punkt mehr,
gewinnt der Bot. Sind mehrere Menschen gleichauf, teilen sie den Sieg; sind nur Bots im
Vergleich, teilen die Bots. `S.over.tiebreak === 'mensch'` merkt sich, dass die Regel
gegriffen hat, das Spielende schreibt es dazu.

Gemessen: 400 Mischpartien (zwei Menschen, zwei Bots, alle von der Bot-Logik gespielt)
ergaben 21-mal mehrere Ansprüche in derselben Runde und **einen** echten Gleichstand –
die Regel entscheidet also selten, aber sie entscheidet dann eindeutig.

**Barbaren** melden nie einen Sieg an und stehen in keinem Vergleich (`canWin`). Sie sind
eine neutrale Fraktion und ohnehin als „dead" geführt; die Prüfung ist der Gürtel zum
Hosenträger, damit ein Barbarenreich mit erobertem Volk nicht über die Bevölkerung
gewinnen kann.

### Zwei Punkte, die die Vorgabe offenlässt

1. **Gleichstand unter Gleichen.** Mensch gegen Mensch (oder Bot gegen Bot) mit gleicher
   Punktzahl ⇒ **gemeinsamer Sieg** (`shared: true`), das Spielende nennt beide Reiche.
   Ein Stichentscheid (etwa „der frühere Anspruch gewinnt") wäre genauso vertretbar –
   eine Zeile in `resolveClaims`.
2. **Ausgeschiedene Reiche.** Wer keine Stadt mehr hat, gewinnt nicht, auch mit Anspruch.
   Die Vorgabe schützt vor dem Wegfallen der *Siegbedingung*, nicht vor dem Untergang;
   ein totes Reich mit vielen Technologien hätte sonst über die Punkte gewonnen. Verfällt
   dadurch der letzte Anspruch, **läuft das Spiel weiter** (`endRound` wird zurückgesetzt).
3. **Nachprüfung am Rundenende.** Wessen Zug schon vorbei war, als der erste Anspruch kam,
   würde sonst leer ausgehen – nur wegen der Sitzreihenfolge. `resolveClaims` prüft
   deshalb am Rundenende noch einmal **alle** Reiche auf den Wirtschaftssieg. Für Kultur-
   und Forschungssieg ist das nicht nötig: die hängen an Ereignissen im eigenen Zug.

Der Kultursieg behält seine eigene Verzögerung (Stufe-3-Wunder muss zu Beginn des
nächsten eigenen Zuges noch da sein, Abschnitt 13). Erst danach wird angemeldet.

### Was das mit der Balance macht (gemessen, nicht geschätzt)

200 Bot-Partien, identische Startwerte vor und nach der Änderung:

| | Militärsieg | Forschungssieg | Kultursieg | Median |
|---|---|---|---|---|
| v50 (sofortiges Ende) | 98 | 97 | 5 | Runde 5 |
| v51 (Rundenende) | 121 | 76 | 3 | Runde 5 |

**Militärsiege nehmen deutlich zu (49 % → 60 %).** Der Grund liegt in der Regel selbst:
ein angemeldeter Sieg gibt den anderen Reichen noch je einen Zug – und ein Militärsieg in
diesem Fenster schlägt den Anspruch. Gemessen: von den 121 Militärsiegen fielen 23 bei
schon offenem Anspruch, 10 davon haben einen fremden Anspruch überfahren. Das ist die
gewollte Folge („A military victory by anyone is still instant"), aber es verschiebt die
Balance – wer das nicht will, müsste den Militärsieg ebenfalls bis zum Rundenende
verschieben (dann wäre er einer von mehreren Ansprüchen und käme in den Punktvergleich).

Der Punktvergleich greift selten, aber er greift: in 14 von 200 Partien meldeten mehrere
Reiche in derselben Runde an, 13-mal entschieden die Punkte, einmal gab es einen
Gleichstand und damit einen gemeinsamen Sieg.

### Oberfläche

Sobald ein Anspruch steht, zeigt die Kopfzeile `… · letzte Runde (Reich)` – ohne diesen
Hinweis wirkte das Spielende eine Runde später willkürlich. Im Protokoll steht der
Anspruch als Überschrift samt Erklärung, dass die Runde noch zu Ende gespielt wird. Das
Spielende-Fenster zeigt bei mehreren Ansprüchen die **Punktetafel** (Bevölkerung, Wunder,
Technologien, Summe) und markiert den Sieger fett.
