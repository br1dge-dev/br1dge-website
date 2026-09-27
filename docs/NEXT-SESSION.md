# Übergabe für die nächste Codex-Sitzung

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

25 Regressionstests, Astro check und Produktionsbuild vor Abschluss erneut
prüfen. Prüfungen betreffen Logik, nicht eine Abnahme des Spielgefühls.
Kein echter Mobilgeräte-/Haptik-Test und keine vollständige Endgame-Abnahme.
Ältere Auditabschnitte beschreiben teils bereits zurückgenommene Zwischenstände;
diese Übergabe und der aktuelle Code haben Vorrang.
Push erfolgt auf den Arbeitsbranch, kein Merge nach main. Ein eventuell von
GitHub/Vercel automatisch gestarteter Preview-Build ist vom manuellen Deployment
zu unterscheiden.
