# Gesangs-App – Lyric-Blätter

Single-File-HTML-App (`index.html`) zum Anzeigen und Beschriften von Lyric-Blättern (PDF/Bild). Ablage und Sync über Google Drive (Scope `drive.file`), Hosting z. B. GitHub Pages.

## Einrichtung / Veröffentlichung (ab v2.0 mehrere Dateien)

Seit v2.0 besteht die App nicht mehr nur aus `index.html`. **Alle folgenden Dateien/Ordner müssen zusammen in dasselbe GitHub-Pages-Verzeichnis** (Repository `gesangs-app`, Hauptebene):

| Datei / Ordner | Zweck |
|---|---|
| `index.html` | die App |
| `sw.js` | Service Worker (Offline-Betrieb) |
| `manifest.webmanifest` + `icons/` | Installation als App auf Handy/Tablet («Zum Startbildschirm») |
| `vendor/` | pdf.js und pdf-lib lokal (kein CDN mehr nötig – Voraussetzung für Offline) inkl. Lizenzdateien |

Am einfachsten: `gesangs-app-v2.0.zip` entpacken und den **Inhalt** (nicht den Ordner selbst) im GitHub-Webinterface per «Add file → Upload files» hochladen (Ordner lassen sich dort per Drag & Drop mitziehen).

In `index.html` oben im `CONFIG`-Block steht die `CLIENT_ID` (OAuth-Client-Typ «Webanwendung», JavaScript-Ursprung = `https://krohnoshub.github.io`). **Sie ist in dieser Lieferung bereits auf `159994249880-flb4nhh2aq51tspov0d7nv787hir84e5…` gesetzt** und wurde vor der Auslieferung geprüft.

**Wichtig beim Umstieg:** Ab v2.0 speichern Notizen im Format v3. Ältere App-Versionen (v1.x) können Textfelder/Symbole daraus nicht darstellen. Bitte alle Geräte auf v2.0 aktualisieren (Seite einmal neu laden; ggf. zweimal, bis der Service Worker die neue Version übernommen hat).

## Änderungslog

### v2.0 – Offline, Organisation, Werkzeuge, Auftrittsmodus, Scan (21.09.2026)

Grosser Ausbau; die Bedienlogik der v1.x-Versionen bleibt erhalten. Intern wurde die App **offline-first** umgebaut: alles wird zuerst lokal gespeichert (IndexedDB) und im Hintergrund mit Drive abgeglichen.

**Offline & installierbar (PWA)**
- Service Worker + Manifest: App startet ohne Internet, lässt sich auf Handy/Tablet installieren. pdf.js liegt lokal in `vendor/`.
- Blätter werden beim Öffnen automatisch lokal abgelegt; im ⋯-Menü «Offline speichern» oder unten «Alle offline speichern». Ein grüner Punkt in der Liste zeigt «offline verfügbar».
- **Notizen/Handschrift werden sofort lokal gespeichert** und später automatisch nach Drive übertragen (beim Wiederverbinden, beim Zurückkehren in die App, alle 60 s). Der Status oben zeigt: `✓ Synchronisiert` · `● n ausstehend` · `⚠ Offline · n offen` · `Nicht angemeldet · n offen`. Antippen synchronisiert sofort.
- Der Google-Login gilt ~1 h. Danach arbeitet die App **weiter lokal**; ein Tipp auf «Nicht angemeldet» meldet neu an und überträgt alles Ausstehende.
- Nur mit Internet möglich: Hochladen, Scannen, Umbenennen, In den Papierkorb, erstes Laden eines noch nie geöffneten Blatts.

**Auftritts-/Übungsmodus** (Knopf ⛶ in der Kopfzeile oder «▶ Auftritt» in einer Setliste)
- Vollbild ohne Werkzeuge, Seite passt ganz ins Bild, Display bleibt an (Wake Lock, wenn der Browser es kann).
- Umblättern: **Tippen an den linken/rechten Rand** (30 %), **Wischen**, **Pfeiltasten / Bild auf/ab / Leertaste** (Fusspedal). Tippen in die Mitte blendet eine Leiste ein (Beenden, Helligkeit, Ebenen, Vollbild), sie verschwindet nach 5 s.
- Die nächste Seite wird im Voraus gerendert. In einer Setliste geht es nach der letzten Seite mit dem **nächsten Lied** weiter (zurück entsprechend).
- Kein versehentliches Zeichnen im Auftrittsmodus.

**Organisation**
- **Ordner und Unterordner** (📁＋): anlegen, umbenennen, verschieben, löschen (Inhalt bleibt erhalten); Blätter per ⋯ → «In Ordner verschieben». Neue Uploads/Scans landen im gerade geöffneten Ordner. Die Ordner sind **virtuell** (liegen in `library.json`); in Drive bleiben die Dateien flach in einem Ordner.
- **Suche** (Name, Tag, Ordnername), **Tags** (Vorschläge: Stimmlage, Genre, «Lehrer-Aufgabe» … oder eigene), **Favoriten** (★), **Sortierung** Name / zuletzt geöffnet / zuletzt hinzugefügt.
- **Setlisten**: anlegen, Blätter hinzufügen, sortieren (▲▼), im Auftrittsmodus durchspielen, komplett offline speichern.
- Ordner, Tags, Favoriten, Setlisten, «zuletzt geöffnet» und die Helligkeit pro Blatt synchronisieren sich über `library.json` zwischen den Geräten.

**Werkzeuge**
- **Textmarker** (transparent, Farbe scheint durch), **Textfeld** (Tippen → Dialog; erneutes Tippen bearbeitet), **Symbole** (Atem ’ ∨, Crescendo/Decrescendo, Fermate, Zäsur, Bindebogen, Höher/Tiefer, pp–ff), **Auswahl** (verschieben, Farbe, Grösse, Ebene wechseln, Löschen).
- **Ebenen** (▤): «Eigene Notizen» und «Unterricht» (weitere möglich, umbenennbar); jede Ebene lässt sich ein-/ausblenden – z. B. Anmerkungen der Lehrperson zum Üben ausblenden. Neue Objekte landen auf der Ebene, die «hier schreibt». Sichtbarkeit gilt pro Gerät.
- **Helligkeit/Kontrast der Datei** (☀ Anzeige, auch im Auftrittsmodus): pro Blatt gespeichert und synchronisiert. Bei PDFs nur Anzeige; beim PDF-Export von *Bildern* wird sie eingebrannt.
- Undo/Rückgängig gilt jetzt für alle Objekttypen (Hinzufügen, Radieren, Verschieben, Ändern, «Seite leeren» → betrifft nur die aktive Ebene).

**Zusammenarbeit**
- **Konflikterkennung:** Vor jedem Hochladen wird geprüft, ob das andere Gerät inzwischen etwas geändert hat (`modifiedTime`). Dann werden beide Stände **objektweise zusammengeführt** (3-Wege-Merge mit dem letzten gemeinsamen Stand): neue Striche beider Geräte bleiben, Löschungen und Änderungen von einem Gerät werden übernommen, Notizen beider Seiten bleiben (bei Kollision untereinander, getrennt durch «— Änderung von anderem Gerät —»). Nichts wird stillschweigend überschrieben.
- **PDF-Export** («⤓ PDF» / ⋯-Menü): Blatt mit eingebrannter Handschrift (nur sichtbare Ebenen). Die Original-Seiten bleiben Vektor, die Annotationen werden als 200-dpi-Ebene mit Multiply-Überblendung darübergelegt; gedrehte Seiten und CropBox werden berücksichtigt. Auf Handy/Tablet öffnet sich das Teilen-Menü, am PC der Download.

**Import: Foto-Scan** (📷 Scan)
- Foto aufnehmen (Kamera) oder Bild wählen → **Ecken werden automatisch erkannt** und lassen sich mit dem Finger korrigieren → Seite wird begradigt (Perspektive), Seitenverhältnis geschätzt (A4 rastet ein) und je nach Modus verbessert: *Dokument* (Beleuchtung/Schatten ausgleichen, weisser Grund), *Schwarz-Weiss*, *Farbe*, *Graustufen*, *Original*. Mehrere Seiten → **ein PDF**; alternativ JPG.

**Ausserdem:** Toolbar scrollt auf Handy/Tablet seitlich statt viel Platz zu belegen; pdf.js-Ressourcen (Schriften, WASM) lokal.


### v1.1 – Fehlerkorrekturen (20.09.2026)

Sicherung der Vorversion: `index.v1.html`.

| # | Problem in v1 | Korrektur in v1.1 |
|---|---------------|-------------------|
| 1 | Striche wurden in Canvas-Pixeln gespeichert; die Canvas-Breite hängt vom Gerät ab → Handschrift sass auf Handy/Tablet an der falschen Stelle | Koordinaten und Strichstärke werden **relativ zur Seitenbreite** gespeichert (Format v2). Striche passen auf jedem Gerät, bei jeder Fenstergrösse und jedem Zoom. Alte v1-Annotationen werden beim Laden automatisch umgerechnet (Annahme: 900 px Bezugsbreite; gespeichert wird erst bei der nächsten Änderung). |
| 2 | Bilder grösser als 900 px wurden als Ausschnitt (oben links) angezeigt | Bild wird auf die Zielgrösse skaliert gezeichnet (`drawImage` mit Zielbreite/-höhe). |
| 3 | Wechsel des Blatts innerhalb von 2 s nach dem Zeichnen verlor die letzten Striche | Vor jedem Blattwechsel wird sofort gespeichert. Zusätzlich Speichern bei App-Wechsel/Tab schliessen (`visibilitychange`, `pagehide`, `beforeunload`-Warnung). Speichervorgänge laufen nacheinander (keine doppelten Annotationsdateien), bei Fehlern automatischer Neuversuch nach 10 s. Ändert man während eines Uploads weiter, bleibt der Zustand korrekt «ungespeichert». |
| 4 | Google-Token lief nach ca. 1 h ab; nach dem Neuladen musste man sich jedes Mal neu anmelden; ungespeicherte Änderungen gingen verloren | Ablaufzeit wird geprüft und bei 401 einmal automatisch wiederholt. *(Korrigiert in v1.2: ein völlig stilles Erneuern klappt bei Google nur, wenn der Browser das Login-Popup zulässt; sonst genügt ein Tipp auf «Neu anmelden». Änderungen bleiben erhalten und werden danach nachgespeichert. Siehe v1.2 zum Zwischenspeichern des Tokens.)* |
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

### v1.2 – Login und Upload (21.09.2026)

Rückmeldung aus dem ersten Praxistest auf dem Handy: Foto-Upload blieb bei «Lade hoch …» hängen, nach dem Neuladen war man abgemeldet und der Login scheiterte mit «Fehler 400: origin_mismatch».

- **Upload:** Läuft jetzt mit **Fortschrittsanzeige** (`Lade hoch … 45 %`), **Zeitlimit** (5 min) und klarer Fehlermeldung statt endlosem «Lade hoch». Handyfotos werden vor dem Upload auf **max. 3000 px (lange Seite) als JPEG** verkleinert (z. B. 16 MB → 4 MB; für Lyric-Blätter reicht das auch beim Hineinzoomen). Dateien über 5 MB (grosse PDFs) gehen über den **resumable Upload** von Drive (Multipart ist nur bis ca. 5 MB vorgesehen); schlägt das fehl, wird Multipart versucht. Das hochgeladene Blatt wird **direkt geöffnet**.
- **Login bleibt beim Neuladen erhalten:** Das Google-Token (gültig ca. 1 h) wird im Browser zwischengespeichert. Neuladen innerhalb der Stunde braucht kein neues Login. Danach ist ein Tipp auf «Anmelden»/«Neu anmelden» nötig (bei Google ohne eigenen Server nicht anders möglich). Das frühere automatische Anmeldeversuch beim Start entfällt (wurde von Browsern als Popup blockiert).
- **Diagnose-Zeile** auf dem Anmeldebildschirm: zeigt die Adresse, auf der die App läuft, und die verwendete Client-ID.

### v1.3 – «Blatt hinzufügen» reagierte nicht (21.09.2026)

- **Ursache:** Der Knopf tat still nichts, solange die App keinen Drive-Ordner kannte (in v1.2 hatte ich das so eingebaut, ohne Rückmeldung). Wenn nach dem Login das Verbinden mit Drive scheiterte, blieb der Fehler unsichtbar.
- **Jetzt:** Ohne Login startet der Knopf die Anmeldung («Bitte zuerst anmelden»). Ist man angemeldet, aber der Ordner fehlt, versucht er die Verbindung erneut und **zeigt den Fehler an**. Der Anmeldebildschirm zeigt Verbindungsfehler im Klartext (rot). Tippen auf die rote Statuszeile oben zeigt die Details (auf dem Handy gibt es keine Konsole). Häufige Ursachen werden erklärt: **Google Drive API im Cloud-Projekt nicht aktiviert**, Konto nicht als Testnutzer eingetragen, Popup blockiert, Sitzung abgelaufen.

### v1.4 – Blätter umbenennen (21.09.2026)

- **Umbenennen:** Knopf **✎** in der Blattliste (neben dem Papierkorb) und **✎** in der Kopfzeile beim geöffneten Blatt. Es öffnet sich ein Eingabefeld mit dem aktuellen Namen. Der neue Name wird in Google Drive geändert, die Liste wird neu nach Namen sortiert. Notizen und Handschrift bleiben erhalten (sie hängen an der Datei-ID, nicht am Namen). Abbrechen ändert nichts. Schrägstriche im Namen werden durch «-» ersetzt.
- Die **Client-ID** in `index.html` ist unverändert (`159994249880-flb4nhh2aq51tspov0d7nv787hir84e5…`).

## Fehlerbehebung: «Fehler 400: origin_mismatch»

Google prüft, ob die Adresse, von der die App geladen wird, in der Cloud Console für **genau diese Client-ID** freigegeben ist.

1. Adresse ablesen: steht in der Diagnose-Zeile («Diese Seite läuft auf: …»). Aufbau: `https://benutzername.github.io` – **nur Schema + Host**, ohne `/gesangs-app`, ohne Schrägstrich am Ende.
2. Google Cloud Console → *APIs & Dienste* → *Anmeldedaten* → OAuth-2.0-Client-ID (Typ *Webanwendung*) → **Autorisierte JavaScript-Quellen** → genau diese Adresse eintragen → speichern (Wirkung: wenige Minuten, manchmal länger).
3. Prüfen, dass die `CLIENT_ID` in `index.html` zu **diesem** Client gehört (die Diagnose-Zeile zeigt Anfang und Ende).
4. Die App nur über die gehostete https-Adresse öffnen – nicht als lokale Datei (`file://`), nicht über `localhost`, nicht aus GitHubs Datei-Vorschau oder einem In-App-Browser.

## Datenformat

**Annotationen** `<Drive-ID>.annotations.json` (Format v3; v1/v2 werden beim Laden automatisch übernommen):

```json
{
  "version": 3,
  "layers": [ {"id":"e","n":"Eigene Notizen"}, {"id":"u","n":"Unterricht"} ],
  "notes": "Notiz zum ganzen Blatt",
  "pageNotes": { "3": "Notiz nur zu Seite 3" },
  "pages": { "1": [
    { "id":"o1", "l":"e", "c":"#c0392b", "w":0.0033, "p":[[0.30,0.45],[0.31,0.46]] },
    { "id":"o2", "l":"u", "c":"#f1c40f", "w":0.0167, "hl":1, "p":[[0.1,0.3],[0.8,0.3]] },
    { "id":"o3", "l":"e", "t":"x", "x":0.2, "y":0.7, "s":"Refrain", "z":0.021, "c":"#1a1a1a" },
    { "id":"o4", "l":"e", "t":"m", "k":"fermata", "x":0.7, "y":0.5, "z":0.03, "c":"#c0392b" }
  ] }
}
```

Koordinaten in Seitenbreiten (1.0 = volle Breite, `y` ebenfalls in Breiten); `w`/`z` ebenfalls in Seitenbreiten.

**Bibliothek** `library.json` im selben Drive-Ordner: `folders` (Name, Elternordner), `files` (Ordner, Tags, Favorit, zuletzt geöffnet, Helligkeit/Kontrast), `setlists`; jeder Eintrag mit Zeitstempel `u` («neuester Eintrag gewinnt» pro Eintrag; Löschungen als Marker `d:1`). Setzt gleich gehende Geräteuhren voraus.

## Getestet

Automatisierte Tests im Headless-Chromium mit simuliertem Google-Login und simuliertem Drive (**142 Prüfungen, alle bestanden**; Ausführung über `localhost`):

- **Organisation (47):** Ordner/Unterordner, Verschieben, Brotkrumen, Suche über Ordner, Tags, Favoriten, Sortierung, Setlisten, alle Werkzeuge (Stift, Marker mit Transparenz, Text anlegen/bearbeiten, alle 15 Symbole, Auswahl/Verschieben/Grösse/Löschen, Radierer), Undo aller Typen, Ebenen aus-/einblenden, «Seite leeren» nur aktive Ebene, Helligkeit, Synchronisation von Ordnern/Tags/Favoriten/Helligkeit/Setliste/Notizen nach Drive, Neuladen mit lokalem Stand.
- **Offline/Sync (25):** Service-Worker-Precache, Neuladen **ohne Netz**, PDF öffnen/zeichnen/Notiz offline, lokale Sicherung, Nachsynchronisieren beim Wiederverbinden, **Konflikt zweier Geräte** (Striche beider Seiten, Notizen beider Seiten, fremdes Löschen), kein Upload ohne Änderung, Bibliotheksänderung von anderem Gerät, abgelaufenes Token → lokal weiterarbeiten → nach Anmeldung nachsynchronisieren.
- **Auftrittsmodus/Touch (30):** Tippzonen, Wischen, Tasten/Pedal, Vorab-Rendern, Setliste über Liedgrenzen (vor/zurück), Zeichnen gesperrt, Helligkeit, Wake Lock (simuliert), Finger/Stift-Erkennung, Pinch-Zoom mit Nachrendern, Finger-Scrollen.
- **Export/Scan/Upload (36):** PDF-Export mit exakt platzierter Handschrift bei Rotate 0/90/180/270 und CropBox (Rendervergleich mit pdfium), Marker-Multiply, Bild-Export mit eingebrannter Helligkeit, Upload in aktuellen Ordner, Umbenennen, Papierkorb, **Scan** eines simuliert fotografierten, perspektivisch verzerrten Blatts mit Schatten (Ecken < 1 % genau, Seitenverhältnis, weisser Grund), mehrseitiges Scan-PDF, S/W-Modus.
- **Fehlerfälle (4):** «Drive API nicht aktiviert» wird verständlich gemeldet, Erststart offline.

## Nicht getestet (braucht echte Geräte/Konten)

- Echter Google-Login und echtes Drive (v. a. resumable Upload, Hintergrund-Sync, Konflikt zwischen zwei echten Geräten).
- Echte Kamera/Fotos (Auto-Ecken funktionieren am besten auf dunkler, einfarbiger Unterlage; sonst Ecken von Hand ziehen), Scan-Geschwindigkeit auf älteren Handys (grosse Fotos werden begradigt auf max. 2300 px).
- Stiftdruck, Handballen, Vollbild, Wake Lock und Pedale auf realen Tablets; **iOS-Safari** (Vollbild-API fehlt dort – dann «Zum Home-Bildschirm» installieren; Wake Lock erst ab iOS 16.4).
- Service-Worker-Update auf GitHub Pages (Prinzip getestet, nicht über mehrere Deployments).
- Aus früheren Versionen noch offen: **Blätter umbenennen** (v1.4) – bitte kurz mit echtem Drive prüfen.

## Bekannte Grenzen

- Auf dem Gerät gespeicherte Daten liegen im Browser-Speicher; «Websitedaten löschen» entfernt Offline-Kopien und *nicht synchronisierte* Änderungen. Vorher synchronisieren.
- PDF-Export enthält die Textnotizen unten nicht, nur die Handschrift/Objekte auf der Seite.
- Bei sehr vielen grossen Blättern ist der Browser-Speicher begrenzt; «Alle offline speichern» kann dann scheitern (Meldung erscheint).

## Nächste Schritte (vorgemerkt)

- **Lyrics-Websuche:** Lyrics direkt suchen und in eine (noch zu definierende) Vorlage formatieren, mit Änderungsmöglichkeit.
- Aufnahme mit Pitch-Feedback, Backing-Tracks.
