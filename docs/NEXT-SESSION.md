# Übergabe für die nächste Codex-Sitzung

## Aktuelle Ausbaustufe — 28. September 2026

Christian hat nach der Konzeptbesprechung eine selbstständig ausgearbeitete,
spielbare Ausbaustufe autorisiert. Die Wallet-/Presale-Anfrage gehörte in einen
anderen Chat und ist hier ausdrücklich verworfen.

- Freigegebene Spielfassung: `/` und `/evolution`, ohne Tutorialtexte, mit römischen Levelzahlen.
- Nutzt dieselbe originalbasierte Runtime wie `/playtest`, mit explizitem Opt-in
  am Canvas; kein kopierter zweiter Spielkern. Die bisherigen Regeln bleiben
  auf `/playtest` aktiv. Die Hauptseite verwendet nach Freigabe dieselbe Evolution-Fassung.
- Ladungsabhängige Anziehung von trägen Gefahren, drei separate Strukturtreffer,
  Ladungsverlust bei Cursor-Kontakt, Rückstoß beim Entladen.
- Farbige Projekt-Symbole auf dünnen elliptischen Orbits um das Zentrum.
- Symbolphasen mit römischen Levelzahlen und deutlichem Wachstum; die bestehenden Musikdateien
  werden nach Phase zugeordnet.
- Nachspiel mit Echo, Gezeiten und zweiter Gravitationsquelle. Keine
  Kapitelauswahl: Regeln werden im laufenden Spiel vermittelt.
- Kleine rote Gefahren mit verbundenen, wabernden Blasen wie im alten Spiel,
  unterschiedlichen Größen und leichtem Glow; erste Verfolgung einzeln und langsam.
  Ausweichen setzt Licht frei, Kontakt reißt Ladung ab.
- Gameplay und Spielzeit pausieren bei Abschluss, Niederlage und manueller Pause;
  Musik läuft weiter. Hintergrund-Tabs pausieren die Ausbaustufe ebenfalls.
- Bewusste Variante: Nach den drei Farbphasen erfolgt Fortschritt über volle
  Ladung; Goldene Blitz-Power-ups aktivieren einen achtsekündigen Overdrive mit doppelter
  Ladung/Entladungsbelohnung und zusätzlichen Gegnern. Keine Bildschirm-Inversion.
- Regeln und Grenzen stehen in `docs/EVOLUTION.md`. Christian hat die reduzierte Gegnerdarstellung und Projekt-Orbits positiv
  bewertet. Dieser Stand wird auf seinen Wunsch gesichert.

Der vorherige gepushte Stand ist `1d50bb8`: organischer Partikelstrom und
Pause während der Success Cards, einschließlich 29 erfolgreicher Tests.

## Neueste Rückmeldung

Nach der Sicherung als `a9fa30d` wurde der freigegebene nächste Ausbau umgesetzt:
römische Zahlen, stärkeres Symbolwachstum und Blitz-Power-ups als freiwilliger Overdrive.
Der Bonus endet bei Entladung, Kontakt, Strukturtreffer oder nach acht Sekunden.
Christian hat am 29. September die Veröffentlichung freigegeben.
49 Verhaltenstests bestanden; Deployment über main und das bestehende Vercel-Projekt.

## Einstieg

Projekt in Codex: br1dge-website
Lokaler Ordner: /Users/christian/+CODING/Hobby/br1dge-website
Branch: codex/game-hygiene-audit
Remote: https://github.com/br1dge-dev/br1dge-website.git
Node 22.12+; npm ci; npm run dev.

**Für das von Christian zuletzt positiv getestete Spielgefühl `/playtest` öffnen.**
Diese Route konserviert die vorherige Spielprobe auf Port 4325 direkt im Repo:
Originalbewegung und Originalspiel mit schnellerem Laden, korrigierter
Soundfreigabe und subtiler Entladeverbindung. Die temporären Ordner und Ports
der alten Chat-Sitzung sind zum Fortsetzen nicht nötig.

Die Hauptseite `/` ist jetzt die freigegebene Evolution-Fassung.
`src/pages/playtest.astro` und `src/lib/game/accepted-preview.js` sind eine
konservierte Referenz (der damalige Inline-Code wurde ohne Verhaltensänderung
in JavaScript überführt), kein
zweiter Runtime, der parallel weiterentwickelt werden soll.

## Letzte Entscheidung — verbindlich

Christian: „gefällt mir überhaupt nicht. gehe zum letzten state zurück.“
Der neue Flow-Umbau (ein Ring, einzelne Farbladung, drei Lieferungen,
automatisches Andocken, Doppellieferung, neue Gegner und Schildsystem) wurde
vollständig entfernt. Nicht erneut implementieren oder als beschlossene
Richtung behandeln. docs/GAMEPLAY-PROPOSAL.md dokumentiert den abgelehnten
Vorschlag ausschließlich als Historie.

## Beibehaltene, gezielt gewünschte Verbesserungen

- Schnelleres Aufladen und kräftigere Sternanziehung; charge.ts.
- Gemeinsame Soundfreigabe durch Klick/Touch, explizites Mute bleibt erhalten.
- Dezente Entladeverbindung Cursor → Brücke nur bei erfüllten Bedingungen;
  discharge.ts, dieselbe Bereitschaftsprüfung wie bei der Aktion.
- Originale direkte Bewegung erhalten: keine feste 60-Hz-Kappung einführen.

## Zusammenarbeit

Zuerst vorhandenes Verhalten und konkrete Probleme prüfen. Kleine überprüfbare
Änderungen am bestehenden Spielgefühl bevorzugen. Größere Spielmechanik-Umbauten
vorher konkret besprechen; die letzte weitreichende Umsetzung wurde abgelehnt.
Kein Auftrag, den abgelehnten Entwurf automatisch weiterzuführen.
Die nächste Sitzung beginnt mit Christians neuem Feedback/Auftrag.

## Verifikation und Grenzen

49 Verhaltenstests, Astro check und Produktionsbuild vor Abschluss erneut
prüfen. Prüfungen betreffen Logik, nicht eine Abnahme des Spielgefühls.
Kein echter Mobilgeräte-/Haptik-Test und keine vollständige Endgame-Abnahme.
Ältere Auditabschnitte beschreiben teils bereits zurückgenommene Zwischenstände;
diese Übergabe und der aktuelle Code haben Vorrang.
Die aktuelle Live-Freigabe autorisiert den Merge nach main und das Production-Deployment. Ein eventuell von
GitHub/Vercel automatisch gestarteter Preview-Build ist vom manuellen Deployment
zu unterscheiden.


## Framerate-Untersuchung nach Livegang — 29. September

Christian meldet einen Einbruch ab VII. Lokaler Fix in SFXEngine: unveränderte
Dauersound-Ziele erzeugen keine neuen Audio-Rampen; pro Sound maximal ein
verzögerter Stopp, bei Reaktivierung/Dispose aufgehoben. Regressionstests vorhanden.
Kontrollierter 144-Hz-Aufruftest (60 Sekunden konstant + 1 Sekunde Stopps):
43.488 Rampen/288 Stopptimer vorher, 7 Rampen/2 Timer nachher.
Temporäre Browsermessung mit realer Runtime: VI 32,38 ms/Bild, VII 33,34 ms/Bild;
mittlere synchrone Zeichenarbeit 0,37/0,51 ms. In dieser Umgebung etwa 30 Hz,
kein stufenspezifischer Einbruch reproduziert. Das bestätigt nicht die komplette
Ursache auf Christians Gerät. Messseiten wieder entfernt. Fix noch lokal.


Zweite Messung nach Rückmeldung „weiterhin extrem laggy“: Auch die ganze
Animation stockt, nicht nur der Cursor. Direkte temporäre Messung im sichtbaren
Canvas (666 × 761): 33,33 ms/Bild, p95 34,30 ms, Zeichenarbeit 0,37 ms.
Kontrollmessung: leere Zeichenfläche 33,34 ms, VII 33,36 ms, VII ohne Vignette
33,25 ms; keine Frames über 50 ms in den kurzen Fenstern. Die eingebettete
Ansicht liefert hier etwa 30 Hz auch ohne Spielarbeit. Ein Vergleich in einem
normalen Brave-/Safari-Fenster wurde angefragt; Antwort noch offen. Keine
zusätzlichen Gameplay- oder Geschwindigkeitsänderungen ohne Beleg. Alle
Messinstrumentierungen und temporären Seiten wieder entfernt.


Dritte Rückmeldung: alles läuft ungefähr mit einem Drittel der Geschwindigkeit.
Daraufhin die verbliebenen Bewegungen pro Bild in Evolution korrigiert:
Cursor-Interpolation, Stern-/Farbpartikel, Dämpfung, Partikelnachschub,
Druckwellen und Leerlauf-Ladungsverlust berücksichtigen nun die verstrichene
Zeit mit 60 Hz als Referenz. Keine Frame-Kappung, kein mehrfaches Zeichnen;
Original-/playtest-Verhalten bleibt pro Frame erhalten. Physik-Schritte sind
auf 100 ms begrenzt, auch für die neuen Gefahren. Tests vergleichen Cursor,
Burst-Laufzeit/Bewegung, Wellen und Nachschub bei 20/30/60/120 Hz: bestanden.
54 Tests insgesamt. Diese Korrektur beseitigt die Zeitlupe bei niedriger
Bildrate; sie verspricht keine höhere Bildausgaberate des eingebetteten Browsers.
Audio- und Timing-Fixes weiterhin lokal, noch nicht auf Production.


## Freigegebenes Update: Ringkollision und Todesscreen

Christian autorisiert danach Livegang inklusive Audio-/Timing-Fixes. Gegner
berühren den tatsächlich geladenen Ring bzw. den Overdrive-Außenring; eine
kontinuierliche Prüfung erfasst schnelle Durchquerungen. 1–4 Ringe Schaden
abhängig von Level und stabiler Gegnergröße, 1,8 Sekunden Trefferpause.
Restladung <= 0 beendet den Versuch. Dunkelroter „YOU DIED“-Dialog mit
„Get gud – try again“, Spielzeit angehalten, vorhandene Retry-Logik erhalten.
57 Tests, Check, Build und Dependency-Audit erfolgreich.
