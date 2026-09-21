# Gesangs-App – Lyric-Blätter

Single-File-HTML-App (`index.html`) zum Anzeigen und Beschriften von Lyric-Blättern (PDF/Bild). Ablage und Sync über Google Drive (Scope `drive.file`), Hosting z. B. GitHub Pages.

## Einrichtung

In `index.html` oben im `CONFIG`-Block die eigene `CLIENT_ID` eintragen (OAuth-Client-Typ «Webanwendung», JavaScript-Ursprung = URL der gehosteten App). Alles andere ist unverändert.

## Änderungslog

### v1.1 – Fehlerkorrekturen (20.09.2026)

Sicherung der Vorversion: `index.v1.html`.

| # | Problem in v1 | Korrektur in v1.1 |
|---|---------------|-------------------|
| 1 | Striche wurden in Canvas-Pixeln gespeichert; die Canvas-Breite hängt vom Gerät ab → Handschrift sass auf Handy/Tablet an der falschen Stelle | Koordinaten und Strichstärke werden **relativ zur Seitenbreite** gespeichert (Format v2). Striche passen auf jedem Gerät, bei jeder Fenstergrösse und jedem Zoom. Alte v1-Annotationen werden beim Laden automatisch umgerechnet (Annahme: 900 px Bezugsbreite; gespeichert wird erst bei der nächsten Änderung). |
| 2 | Bilder grösser als 900 px wurden als Ausschnitt (oben links) angezeigt | Bild wird auf die Zielgrösse skaliert gezeichnet (`drawImage` mit Zielbreite/-höhe). |
| 3 | Wechsel des Blatts innerhalb von 2 s nach dem Zeichnen verlor die letzten Striche | Vor jedem Blattwechsel wird sofort gespeichert. Zusätzlich Speichern bei App-Wechsel/Tab schliessen (`visibilitychange`, `pagehide`, `beforeunload`-Warnung). Speichervorgänge laufen nacheinander (keine doppelten Annotationsdateien), bei Fehlern automatischer Neuversuch nach 10 s. Ändert man während eines Uploads weiter, bleibt der Zustand korrekt «ungespeichert». |
| 4 | Google-Token lief nach ca. 1 h ab; nach dem Neuladen musste man sich jedes Mal neu anmelden; ungespeicherte Änderungen gingen verloren | Ablaufzeit wird geprüft, Token wird vor Requests still erneuert, bei 401 einmal automatisch wiederholt. Wer schon angemeldet war, wird beim Öffnen automatisch wieder angemeldet (`prompt:''`). Schlägt das fehl, bleibt die App offen, Änderungen bleiben erhalten, Button zeigt «Neu anmelden» und speichert danach nach. |
| 5 | Schnelles Blättern/Zoomen startete mehrere `page.render()` auf derselben Canvas (pdf.js-Fehler) | Rendern erfolgt offscreen; laufendes Rendern wird abgebrochen, nur das neueste Ergebnis wird übernommen. Zeichnen ist erst nach dem Rendern der Seite möglich. Zusätzlich: schnelles Durchklicken der Blattliste wird abgesichert, geöffnete PDFs werden freigegeben. |
| 6 | Unscharf auf Retina-/Tablet-Displays, Breite bei 900 px gedeckelt | Zeichenfläche nutzt `devicePixelRatio` (max. 3×), Seitenbreite passt sich dem Fenster an (max. 1400 px), Speicher-Obergrenze 4096 px / 16 MP. |
| 7 | Kein Zoomen/Verschieben, Handballen zeichnete mit | **Zoom** (−/+/Einpassen, Strg+Mausrad, Zwei-Finger-Pinch; danach scharf nachgerendert). **Zwei Finger** verschieben/zoomen immer. Knopf **«✋»** steuert den Einzelfinger: *Auto* (Finger zeichnet, bis ein Stift erkannt wird; danach scrollt der Finger), *zeichnet*, *scrollt*. Handballen wird ignoriert, solange der Stift aufliegt. Gezoomte Seiten sind links nicht mehr abgeschnitten. |
| 8a | Dateinamen per `innerHTML` in die Liste geschrieben | `textContent` – keine HTML-Injektion über Dateinamen. |
| 8b | Radierer speicherte Radier-Striche als Daten (wuchs unbegrenzt) | Radierer **entfernt ganze Striche** (auch Stift-Radiertaste). Alte Radier-Striche aus v1 werden weiterhin korrekt dargestellt. |
| 8c | Eckige Linien | Glättung über quadratische Kurven, Stiftdruck (nur Stift) wirkt auf die Strichstärke, Punkte werden per gebündelten Eingabeereignissen erfasst. |
| 8d | Notizen nur pro Blatt | Neu: Reiter **«Gesamtes Blatt»** und **«Seite N»** (bei mehrseitigen PDFs). Alte Notizen bleiben unter «Gesamtes Blatt». |

### Zusätzlich behoben / verbessert (nicht in der ersten Liste)

- **Undo** arbeitet mit Verlauf (Striche, Radieren, «Seite leeren» sind rückgängig machbar, auch Strg+Z); ohne Verlauf (nach Neuladen) wird der letzte gespeicherte Strich entfernt wie bisher.
- **Antippen** mit dem Stift/Finger erzeugt keine Zufallspunkte (Striche unter 2 Punkten werden verworfen, wie in v1).
- **Blattliste** lädt auch bei mehr als 100 Dateien vollständig (Seitenweise-Abruf).
- **Ordner-ID-Cache** wird geprüft (Ordner gelöscht / anderes Konto → wird neu ermittelt).
- **Fehlermeldungen** bei Upload, Laden und Löschen (bisher stiller Abbruch); beim Löschen des offenen Blatts wird die App sauber zurückgesetzt.
- **pdf.js wird erst beim ersten Öffnen einer PDF geladen**, die App startet also auch, wenn das CDN nicht erreichbar ist. Polyfill für `Map.getOrInsertComputed`, das pdf.js 6.x braucht (ältere Tablet-Browser).

## Datenformat der Annotationen (`<Drive-ID>.annotations.json`)

```json
{
  "version": 2,
  "notes": "Notiz zum ganzen Blatt",
  "pageNotes": { "3": "Notiz nur zu Seite 3" },
  "pages": {
    "1": [ { "c": "#c0392b", "w": 0.0033, "p": [[0.30, 0.45], [0.31, 0.46, 0.7]] } ]
  }
}
```

`x`/`y` in Seitenbreiten (1.0 = volle Breite, `y` ebenfalls in Breiten), `w` = Strichstärke in Seitenbreiten, dritter Wert im Punkt = Stiftdruck (optional), `er:1` nur bei migrierten Radier-Strichen.

## Getestet

Automatisierter Test im Headless-Chromium mit simuliertem Google-Login und simuliertem Drive (32 Prüfungen, alle bestanden): Bild vollständig sichtbar, Retina-Auflösung, Speichern im v2-Format, Strichposition nach Fenster-Resize identisch, Radierer + Undo, Sicherung beim Blattwechsel, Notizen pro Blatt/Seite, v1-Migration, Zoom (inkl. linker Rand erreichbar), PDF mit 3 Seiten und schnellem Blättern, stille Token-Erneuerung, Pinch-Zoom per Touch ohne Zufallsstrich.

**Nicht getestet** (braucht echte Geräte/Konten): echter Google-OAuth-Login, Stiftdruck und Handballenunterdrückung auf einem realen Tablet/Handy, Verhalten von iOS-Safari.

## Nächste Schritte (Vorschlag)

Offline/PWA, Song-Datenmodell, Auftrittsmodus, danach Aufnahme mit Pitch-Feedback.
