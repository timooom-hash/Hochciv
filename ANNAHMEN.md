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
- **Verbundwerkstoffe**: 1× zusätzliches, kostenloses Wachstum pro Stadt und Runde. Allein
  also 2×, mit Keramik bis 3×, davon eins gratis. Eigener Knopf „Kostenlos wachsen".
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

- **Wikinger „Beutezüge"**: je eigene Armee, die neben (Distanz 1) einer gegnerischen Armee
  oder Stadt steht, 1 Wissenschaft/Nahrung/Münze pro Punkt Überlegenheit. Gegen Städte zählt
  der **Verteidigungswert**, gegen Armeen der Machtwert. Steht eine Armee neben mehreren
  Gegnern, zählt der größte Vorsprung, je Armee einmal.
  **Abweichung vom Abgesprochenen:** bewertet wird beim **Einkommen zu Zugbeginn**, nicht in
  der Kampfphase. Ressourcen verfallen am Zugende – ein Ertrag in der Kampfphase (Schritt 4
  von 5) wäre nie ausgebbar. Der Ertrag steht als eigene Zeile in der Ertragsübersicht.
- **Wikinger „Kriegerkultur"**: +1 Machtwert je Armee. Der Zuschlag erhöht den
  Machtverlust zu Zugbeginn (er rechnet auf den Gesamtwert), kann selbst aber nicht verloren
  gehen – abgezogen wird nur von der gekauften Macht. Genauso die Zeusstatue (+3).
- **Griechenland „Rückschau"**: die Gratis-Tech kommt aus einem Zeitalter unterhalb der
  gerade erforschten, ignoriert die Verfügbarkeit und löst **keine Kette** aus.
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
Gewürfelt wird **einmal pro Runde** zu Rundenbeginn: erst die Zeile, dann die Spalte. Das
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
  momentan verfügbare Techs.
- **Canal du Midi** gibt 40 Münzen, die wie jede Ressource am Zugende verfallen.
- **Taj Mahal** verdoppelt das Einkommen der nächsten eigenen Runde.
- **Koloss** stellt zwei Armeen auf freie Landfelder neben der Baustadt (Armeen dürfen nicht
  auf Städten stehen); sind weniger Felder frei, entsprechend weniger.
- **Das Orakel** zeigt in der Ansicht „Welt" das Ereignis der nächsten Runde. Es wird dabei
  einmal vorgewürfelt und zu Rundenbeginn genau so verwendet.
- **Apostolischer Palast** macht sein Reich immun gegen alle Ereignisse.
- **Bots** würfeln nach dem Siedeln einmal (gegen den Schwierigkeitsgrad) und bauen dann ein
  zufälliges verfügbares und baubares Wunder – **kostenlos**, wie alle Bot-Aktionen, und
  **ohne Effekte**. Gebaut wird in der Hauptstadt, sonst in der bevölkerungsreichsten Stadt
  (Gleichstand wird ausgewürfelt). Ein Stufe-3-Wunder gewinnt auch für sie. Erobert ein
  Mensch eine Bot-Stadt mit Wundern, werden die Effekte für ihn aktiv.
