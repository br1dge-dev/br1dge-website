# Übergabe für die nächste Codex-Sitzung

## Aktuelle Ausbaustufe — 28. September 2026

Christian hat nach der Konzeptbesprechung eine selbstständig ausgearbeitete,
spielbare Ausbaustufe autorisiert. Die Wallet-/Presale-Anfrage gehörte in einen
anderen Chat und ist hier ausdrücklich verworfen.

- Neue lokale Vorschau: `/evolution`, vollständig ohne sichtbare Texte.
- Nutzt dieselbe originalbasierte Runtime wie `/playtest`, mit explizitem Opt-in
  am Canvas; kein kopierter zweiter Spielkern. Die bisherigen Regeln bleiben
  auf `/playtest` aktiv. Die Hauptseite ist unverändert.
- Ladungsabhängige Anziehung von trägen Gefahren, drei separate Strukturtreffer,
  Ladungsverlust bei Cursor-Kontakt, Rückstoß beim Entladen.
- Farbige Projekt-Symbole auf dünnen elliptischen Orbits um das Zentrum.
- Symbolphasen statt sichtbarer Levelzahlen; die bestehenden Musikdateien
  werden nach Phase zugeordnet.
- Nachspiel mit Echo, Gezeiten und zweiter Gravitationsquelle. Keine
  Kapitelauswahl: Regeln werden im laufenden Spiel vermittelt.
- Kleine rote Gefahrenpunkte mit leichtem Glow; erste Verfolgung einzeln und langsam.
  Ausweichen setzt Licht frei, Kontakt reißt Ladung ab.
- Gameplay und Spielzeit pausieren bei Abschluss, Niederlage und manueller Pause;
  Musik läuft weiter. Hintergrund-Tabs pausieren die Ausbaustufe ebenfalls.
- Bewusste Variante: Nach den drei Farbphasen erfolgt Fortschritt über volle
  Ladung; rote Herzen und Bildschirm-Inversion sind nur im bisherigen Playtest.
- Regeln und Grenzen stehen in `docs/EVOLUTION.md`. Christian hat die reduzierte Gegnerdarstellung und Projekt-Orbits positiv
  bewertet. Dieser Stand wird auf seinen Wunsch gesichert.

Der vorherige gepushte Stand ist `1d50bb8`: organischer Partikelstrom und
Pause während der Success Cards, einschließlich 29 erfolgreicher Tests.

## Neueste Rückmeldung

Christian möchte die sichtbare Progression wieder deutlicher: römische Zahlen
über dem Symbol und stärkeres Anwachsen. Level 10 und Nachspiel bis 20 sind
weiter implementiert, aber die Zahlen wurden in `/evolution` ausgeblendet.
Die roten Herzen sind dort deaktiviert. Ein freiwilliger Power-Modus mit mehr
Belohnung und zugleich mehr Gegnern ist als nächste Richtung im Gespräch,
noch nicht umgesetzt. Zuerst wurde ausdrücklich Commit und Push angefordert.

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

Die Hauptseite `/` ist wieder der Stand VOR dem abgelehnten letzten Umbau.
Sie enthält zusätzlich die älteren Hygiene-/Refactor-Änderungen (ausgelagerter
Runtime, pausierbare Timer, Reset-Fixes, Gegner-Speedcaps). Nicht ungeprüft mit
der originalbasierten Spielprobe gleichsetzen. Zuerst beide vergleichen und
mit Christian entscheiden, welche früheren Änderungen übernommen werden.
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

45 Verhaltenstests, Astro check und Produktionsbuild vor Abschluss erneut
prüfen. Prüfungen betreffen Logik, nicht eine Abnahme des Spielgefühls.
Kein echter Mobilgeräte-/Haptik-Test und keine vollständige Endgame-Abnahme.
Ältere Auditabschnitte beschreiben teils bereits zurückgenommene Zwischenstände;
diese Übergabe und der aktuelle Code haben Vorrang.
Push erfolgt auf den Arbeitsbranch, kein Merge nach main. Ein eventuell von
GitHub/Vercel automatisch gestarteter Preview-Build ist vom manuellen Deployment
zu unterscheiden.
