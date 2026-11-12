# Gesangs-App – Hinweise für Claude

Single-File-PWA (`index.html`) für Lyric-Blätter mit Google-Drive-Sync (`drive.file`), gehostet über GitHub Pages direkt von `main`.
Ausführliche Abläufe stehen im README (Abschnitt «Einrichtung / Veröffentlichung»); hier nur die verbindlichen Regeln.

## Kommunikation
- Deutsch (Schweizer Schreibweise: «ss» statt «ß»), kurz und konkret. Unsicherheiten offen benennen.
- Vor grösseren Umbauten Vorgehen kurz vorschlagen und bestätigen lassen.

## Jede Änderung an index.html = neue Version
1. **Vorher `git fetch origin main`** und auf dem neuesten Stand aufsetzen – `main` wird oft parallel weiterentwickelt.
2. `APP_VERSION` in `index.html` erhöhen (höher als auf `origin/main`, nie doppelt vergeben).
3. Oben im Änderungslog im README einen Eintrag `### vX.Y.Z – …` ergänzen (Test `01-static` prüft das).
4. `python3 tools/finalize.py` – CSP-Hashes der Inline-Skripte und `VERSION` in `sw.js` neu setzen. Ohne das startet die App nicht.
5. Tests: `NODE_PATH=$(npm root -g) node tests/run.js` (ca. 5 Min.; Filter z. B. `node tests/run.js 04`).
6. `python3 tools/check-version.py` – prüft, dass die Version höher als auf `origin/main` ist (läuft auch in der GitHub Action bei PRs).

## Sicherheit
- Strenge CSP im `<meta>`-Tag: keine Inline-Event-Handler (`onclick="…"`), kein `eval`, neue externe Hosts nur bewusst in der CSP ergänzen.
- HTML aus fremden Quellen (Lyrics, Drive, APIs) nie ungefiltert per `innerHTML` einsetzen; vorhandene Helfer nutzen (`h()`, `escapeHtml`, `sanitizeTextDoc`).
- Keine API-Keys oder Tokens ins Repo.

## Commits / PRs
- Commit-Titel mit Version, z. B. `v2.58.1: Kurzbeschreibung`.
- Pull Requests nur auf Wunsch; sonst nach Absprache direkt auf `main`.
