> Abgelehnt am 27.09.2026: Der darauf basierende Gameplay-Umbau gefiel Christian nicht und wurde vollständig zurückgenommen. Dieses Dokument ist historischer Kontext, kein freigegebener Arbeitsauftrag.

# br1dge: verständlicher, schneller, anspruchsvoller

## Status und Grundlage

Umgesetzt ist ausschließlich die gewünschte Entladeverbindung: ein feiner Bogen
mit vier Lichtpunkten, die vom Cursor zur Brücke fließen, sobald Entladen erlaubt
ist. Bei Farbentladung verwendet er die aktive Farbe; beim Tutorial und bei
Levelentladung Weiß. Ein schwacher Halo markiert die empfangende Brücke. Die
Verbindung verändert keine Kräfte oder Geschwindigkeiten. Anzeige und Aktion
verwenden dieselbe Bereitschaftsprüfung. Beim Energieverlust verfällt die
Tutorialbereitschaft korrekt, sodass erneutes Sammeln möglich bleibt.

Die folgenden Mechaniken sind Vorschläge, noch nicht eingebaut. Grundlage ist
der gelesene Spielcode plus das Nutzerfeedback; keine Nutzerstudie oder
vollständige Endgame-Spielrunde. Balancingwerte sind Startwerte für einen Test.

## Was den Spielablauf derzeit bremst

1. **Mehrere kaum erkennbare Voraussetzungen.** In den Farbphasen braucht man
   fünf Farbpartikel UND 60/80/100 Prozent weiße Energie UND Bereitschaft plus
   eine interne Ringbedingung. Farben spawnen erst ab 20 Prozent Energie. Ein
   voller Teil der Anzeige kann deshalb trotzdem einen wirkungslosen Klick
   bedeuten. Zusätzlich setzt die Klicklogik Ringzähler: ein Darstellungsdetail
   ist mit der Bedienung verknüpft. Das fördert Versuch-und-Irrtum.
2. **Die Darstellung wechselt ihre Bedeutung.** Weiße Ringe zeigen Energie,
   die Kammer zeigt gesammelte Farben, spätere rote Herzen werden zu gestapelten
   Leveln und färben Ringe cyan. Jede Phase verlangt ein neues mentales Modell.
3. **Warten wird als Schwierigkeit verwendet.** Fünf Farbpartikel werden mit
   1,5 Sekunden Spawnabstand erzeugt: mindestens sechs Sekunden zwischen erstem
   und fünftem Spawn, zuzüglich Freigabe und Flugwegen. Längeres Laden erzeugt
   hier wenig zusätzliche Entscheidung.
4. **Sammeln und Verteidigen konkurrieren kaum.** Farbpartikel werden beim Spawn
   zum damaligen Cursorort geschickt. Gegner fliehen vor dem Cursor, sterben
   bei Berührung und richten am Kern Schaden an. Abfangen spart Verlust, hat
   aber keinen positiven Fortschrittsertrag. Nahe der Mitte zu bleiben kann
   deshalb viel abdecken, ohne eine interessante Route wählen zu müssen.
5. **Schwierigkeit ist teilweise Zufall.** Das Original würfelt Faktoren von
   1× bis 8×. Nach den Credits kommen größere, schnellere Gegner mit höherem
   Schaden dazu. Das erzeugt Spitzen, aber wenig planbar erlernbare Meisterung.
   Im früheren Umbau hatte ich diese Spitzen bereits begrenzt; diese Begrenzung
   gehört ausdrücklich nicht zur originalbasierten Spielprobe auf Port 4325.

## Empfohlener Umbau: kurze, sichtbare Lieferungen

Der Cursor ist ein Sammler, die Brücke ein Empfänger. Der wiederholte Ablauf:

**Licht sammeln → eine Farbe aufnehmen → zur Brücke zurückkehren → entladen.**

### Ein voller, gefärbter Ring bedeutet bereit

- Statt mehrerer Energieringe und einer Kammer mit fünf bewegten Teilchen:
  ein gut lesbarer Energiering und höchstens eine mitgeführte Farbe.
- Weiße Sterne füllen den Ring. Ein Farbpartikel färbt den Ring und lässt eine
  erkennbare farbige Perle im Cursor sitzen. Beides darf in beliebiger Reihenfolge
  passieren; Farbpartikel sind von Anfang der Farbphase an sichtbar.
- Nur der volle farbige Ring aktiviert die neue Verbindung zur Brücke. Ein
  teilgefüllter farbiger Ring zeigt klar: Farbe vorhanden, Energie fehlt.
  Ein voller weißer Ring zeigt: Energie vorhanden, Farbe fehlt. Ein leerer
  farbiger Umriss am Empfänger zeigt die aktuell gesuchte Farbe.
- Die Brücke hat drei deutlich sichtbare Fassungen. Jede Lieferung füllt eine;
  die dritte baut die jeweilige Projektbrücke. Orange, Sand und Grün behalten
  ihre bisherigen Ziele. Nach jeder Rückkehr gibt es sichtbaren Fortschritt.
- Beim Farbwechsel bleibt ein Teil der Szene bestehen; kurze Ruhephase, neuer
  farbiger Empfänger und ein sichtbar eintretender erster Farbpartikel reichen
  als Erklärung. Kein separates Texttutorial für jede Regel.

Die erste Tutoriallieferung darf weiterhin nur weiße Energie verlangen. Dann
wird die eine neue Bedingung „Farbe“ gezielt eingeführt. Keine gleichzeitige
Einführung von drei unterschiedlichen Farbfähigkeiten.

### Automatisches Andocken als bevorzugte Bedienung

Eine bereite Ladung wird beim bewussten Einfahren in den kleinen Kernbereich
nach ungefähr 150 ms übertragen. Beim Verlassen wird die Andockzeit verworfen.
Damit entsteht die körperlich nachvollziehbare Geste „hinbringen“. Ein Klick
kann die Übertragung im Zielbereich sofort auslösen; zufälliges Klicken ohne
Ladung bringt keinen Fortschritt. Kein automatisches Entladen von beliebiger
Entfernung und keine Bewegung des Cursors durch einen neuen Zwangssog.

Das ist eine vorgeschlagene Änderung zur jetzigen Klick-/Touch-Entladung und
sollte zuerst mit Maus UND Touch getestet werden. Der heutige Verbindungs-Effekt
ändert die Bedienung noch nicht.

## Gegner besiegen soll den nächsten Zug verbessern

Für einen ersten Prototyp reicht **ein nicht stapelbarer Überladungsbonus**:

- Ein abgefangener Gegner hinterlässt einen sichtbaren Funken, der unmittelbar
  zum Cursor fliegt. Der nächste erfolgreiche Transfer zählt zwei Fassungen
  statt einer. Das bestehende Sammeln bleibt erforderlich; der Abschuss allein
  erledigt die Lieferung nicht.
- Ein einzelner zusätzlicher Lichtpunkt am Ring zeigt den Bonus. Beim Entladen
  werden tatsächlich zwei Fassungen gefüllt, mit passendem Audio-Akzent.
- Es gibt maximal einen gespeicherten Bonus, keinen Timer und kein Inventar.
  Der Bonus gilt nur für die aktuelle Farbe. Ist nur noch eine Fassung frei,
  wird sie gefüllt; es gibt keinen stillen Übertrag in die nächste Farbe.
- Weitere Abschüsse bei bereits gespeichertem Bonus geben einen kleinen
  Energieschub (als Startwert 25 Prozent eines Rings, begrenzt auf volle Energie).
  Damit bleibt Verteidigen lohnend, ohne einen Bonusstapel zu farmen.

Die Entscheidung wird: **Jetzt sicher liefern oder erst abfangen und doppelt
liefern?** Schwierigkeit entsteht durch die Strecke und die Bedrohung während
dieser Entscheidung. Wenn Playtests zeigen, dass Doppel-Lieferungen die Phasen
zu stark verkürzen, zuerst den Bonus reduzieren, nicht wieder die Ringladung
verlängern.

## Anspruch durch lesbare Bedrohungen und Routen

- Gegner erscheinen mit einem kurzen, sichtbaren Randhinweis. Anfangs ein
  einfacher Angreifer. Später zwei zeitlich versetzte Angreifer aus verschiedenen
  Richtungen, nicht bloß unvorhersehbar achtmal schnellere Exemplare.
- Neue Farbe und Gegner erscheinen so, dass eine kurze Routenentscheidung
  nötig ist. Keine Zufallsanordnung ohne ausreichende Reaktionszeit. Partikel
  sollen nicht grundsätzlich zum geparkten Cursor reisen.
- Höchstens zwei klar unterscheidbare Gegnertypen im ersten Umbau: ein direkter
  Angreifer und ein sichtbar angekündigter Richtungswechsler. Form, Bewegung
  und Eintrittssignal unterscheiden sie; Farbe allein reicht nicht.
- Kernzustand und Baufortschritt trennen: drei sichtbare Schutzsegmente am
  Brückensymbol. Ein Treffer bricht ein Segment. Drei Treffer beenden den Run.
  Die gerade mitgeführte Farbe geht bei einem Treffer verloren, bereits
  gelieferte Fassungen bleiben. Eine fertig gebaute Farbbrücke repariert ein
  Segment, höchstens bis drei. Damit kann aktives Vorankommen einen Run retten.
- Nach einer fertigen Farbbrücke einige Sekunden Ruhe lassen. Bei niedrigem
  Kernzustand keine neue Doppelwelle unmittelbar nach einem Treffer auslösen.
  Aggressive Spielweise kann später durch kürzere, angekündigte Abstände
  belohnt und gefordert werden. Kein permanenter unsichtbarer Zeitdruck.

Erste Testwerte: ein vollständiger Sammel-und-Lieferzyklus etwa 4–8 Sekunden,
maximal ein Gegner in der ersten Farbe und zwei in den folgenden Farben,
Randwarnung ungefähr 0,8–1,2 Sekunden. Diese Zeiten müssen im tatsächlich
verwendeten Browser gemessen werden. Die bisher beobachtete 30-Hz-Problematik
verbietet, sie einfach aus Framezahlen abzuleiten.

## Was zuerst getestet werden sollte

1. **Verständlichkeit:** drei Lieferungen, ein voller gefärbter Ring, sichtbare
   Fassungen und die Entladeverbindung. Noch keine neue Gegnerfähigkeit.
2. **Entscheidungen:** Überladung als Verteidigungsbelohnung und begrenzte,
   angekündigte Doppelwellen. Erst hier nach höherer Schwierigkeit urteilen.
3. **Spätere Erweiterung:** Farbidentitäten oder unterschiedliche Ladungsmodi,
   falls die kurze Schleife schon trägt. Noch kein Shop, Skilltree oder mehrere
   neue Ressourcen, bevor die Kernhandlungen ohne Erklärung verständlich sind.

Prüffragen mit neuen Spielern: Wird die erste farbige Lieferung ohne Erklärung
verstanden? Wie viele erfolglose Klicks passieren? Gibt es sichtbare Momente
von „mir fehlt Farbe“ statt ziellosem Warten? Wird ein Gegner freiwillig
abgefangen? Wechseln Spieler bewusst zwischen Liefern und Abfangen? Können sie
nach einem Treffer sagen, weshalb er passiert ist? Maus und Touch separat
beobachten; Schwierigkeit nicht durch schlechtere Touchpräzision erzeugen.
