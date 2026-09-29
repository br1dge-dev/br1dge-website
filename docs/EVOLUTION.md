# Resonance — erste spielbare Ausbaustufe

Lokaler Einstieg: `/evolution`. Das Spiel beginnt unmittelbar ohne sichtbaren
Text, Tutorial-Karten, HUD oder Kapitelauswahl. Nahe Sterne laden den Ring;
volle Ladung lässt Verbindung und Symbol reagieren. Ein erfolgloser Versuch
am Symbol erzeugt einen kleinen Rückstoß. Die zwei ersten Entladungen bleiben
als ungefährliche Spielsequenz erhalten, ohne sie zu beschriften.

Die erste Gefahr bleibt einzeln und langsam. Erst eine erlebte Verfolgung mit
anschließender Entladung erlaubt mehrere Gegner. Kleine rote, organisch wabernde Blobs in unterschiedlichen Größen mit schwachem Glow und einem feinen Ankunftsring
trennen Gefahr vom sammelbaren Licht. Eine saubere Flucht setzt sammelbare Sterne frei; bei
Kontakt reißen sichtbar Partikel vom Spieler zur Gefahr ab. Neue Abschnitte
lösen bestehende Gefahren auf und lassen fünf Sekunden zum Ankommen.

## Spielregeln

Die Cursorbewegung bleibt direkt. Evolution rechnet Bewegung, Interpolation,
Partikelnachschub und Effektlaufzeiten nach verstrichener Zeit mit 60 Hz als
Referenz; niedrigere Bildraten verlangsamen das Spiel nicht mehr. Der alte
Playtest behält seine ursprüngliche Bewegung pro Bild.
Volle Ladung erweitert die Sternanziehung und zieht auch Gefahren an. Diese
behalten ihren Schwung; Kurven lassen sie vorbeiziehen. Nach 1,6 Sekunden
sichtbarer Ankunftswarnung bewegen sie sich zum Symbol und reagieren auf den
Spieler. Gleichzeitig existieren anfangs eine, später zwei und im Nachspiel
höchstens drei Gefahren. Geschwindigkeiten sind begrenzt und zeitbasiert.

Kontakt mit dem sichtbaren Ring kostet 1–4 Ringe: ein Grundring,
ein weiterer je sieben Level und ein weiterer bei großen Gegnern (gedeckelt auf vier).
Ein Ring entspricht 20 % Ladung. Bei null oder weniger verbleibender Ladung
endet der Versuch. 1,8 Sekunden Schutzzeit verhindern Mehrfachtreffer direkt
hintereinander; durchquerte Gegner werden auch zwischen zwei Bildern erkannt. Ein Treffer am Symbol kostet einen von drei
Strukturpunkten; er setzt den musikalischen und visuellen Fortschritt nicht
zurück. Alle aktuellen Gefahren lösen sich bei einem Symboltreffer auf, mit
sechs Sekunden bis zur nächsten Ankunft. Der dritte Treffer beendet den Versuch.
„Get gud – try again“ unter dem dunkelroten „YOU DIED“ startet vor den Farbphasen, ohne das Tutorial zu wiederholen. Keine
persistenten Freischaltungen oder Ranglisten.

Nach den drei Farbphasen wird eine vollständige Ladung am Symbol entladen.
Jede Entladung treibt den Aufbau weiter und stößt nahe Gefahren zurück. Die alte
Inversion ist in dieser Variante deaktiviert. Goldene Blitz-Power-ups aktivieren stattdessen
einen freiwilligen Overdrive nach den drei Farbphasen: acht Sekunden doppelte
Ladung pro Stern, stärkere Anziehung, bis zu zwei zusätzliche Gegner und
schnellere Ankünfte. Eine volle Entladung bringt zwei Stufen (maximal X/XX)
und verbraucht den Bonus. Kontakt oder ein Strukturtreffer beendet ihn. Ein vollständig goldener Cursor mit Blitzkern und rotierenden Außenbögen
zeigt den aktiven Zustand. Ein zusätzlicher Außenbogen zeigt die Restzeit; Pausen halten auch den Overdrive an. Der ursprüngliche
Playtest behält sie. Das Nachspiel folgt nach dem ersten Abschluss, mit drei
unterschiedlichen Feldbedingungen statt bloß höherer Gegnergeschwindigkeit.

Projekt-Symbole kreisen auf drei dünn angedeuteten, elliptischen Bahnen.
Ihre ursprünglichen Projektfarben bleiben gesättigt. Die Umlaufbewegung folgt
der Spielzeit, pausiert mit dem Spiel und passt sich der Fenstergröße an.

## Aufbau und Klang

| Abschnitt | Interner Fortschritt | Sichtbare Entwicklung | Bestehender Musiktrack |
|---|---|---|---|
| Awakening | 0–1 | schlichte, atmende Kontur | still / base |
| Resonance | 2–3 | zweite Kontur, erste Lichtpunkte | hihat |
| Tension | 4–6 | versetzte Konturen, Filamente zwischen den Enden | saw |
| Connection | 7–9 | verdichtete Konturen und weitere Ankerpunkte | bass |
| Breakthrough | 10 | klare Form, geschlossene Form | bass |
| Echo | 10–13 im Nachspiel | flacher Orbit, kühler Akzent; Gefahren folgen der etwa 650 ms alten Position | saw |
| Tides | 14–16 | langsames Atmen; Anziehung von Licht und Gefahren schwankt | hihat |
| Twin pull | 17–19 | gekreuzte feine Orbits; zusätzliche bewegliche Quelle zieht Licht und Gefahren an | bass |
| Equilibrium | 20 | Abschluss des Nachspiels | bass |

Römische Zahlen I–X und XI–XX stehen über dem Symbol; seine Größe wächst
mit jeder Stufe deutlich. Strukturbrüche zeigen Schaden; die
Entwicklung der Kontur zeigt Fortschritt. Bestehende Musikloops werden über die
vorhandenen Übergänge gewechselt; diese Fassung enthält keine neue Komposition.

## Umsetzung und Prüfung

`evolution.ts` kapselt Gefahrenphysik, Phasen, Musikzuordnung und Symbolzeichnung.
`accepted-preview.js` aktiviert die Ausbaustufe nur für ein Canvas mit
`data-evolution="true"`. Pause, Abschluss und Niederlage frieren
Spielzeit und Spieltimer ein, ohne die Musik stummzuschalten. Neustarts entfernen
alte Timer. Abschluss und Zerfall animieren außerhalb der angehaltenen Spielzeit;
der zentrale Wiedereinstieg ist gegen sofortiges Weiterklicken gesichert.
Der textfreie Einstieg, Pause und Gegnerdarstellung wurden im Desktop-Browser
geprüft. Die neue Gegnerdarstellung wurde zusätzlich bei 390 × 844 in einer temporären
Renderprobe geprüft. Kein echter Touch-/Haptik-Test.

Die Tests prüfen unter anderem Anziehung, Vorwarnung, getrennte Strukturtreffer,
Rückstoß, Bildratenverhalten, Neustart und den Abschluss mit laufender Musik.
Schwierigkeit und Dauer sind eine erste Abstimmung und brauchen Christians
Spieltest. Der bereits abgelehnte Flow-Umbau bleibt verworfen.
