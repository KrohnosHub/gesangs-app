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

Die Dateien liegen bereits entpackt in `D:\OneDrive\Musik\Gesangs-App` (bei jeder neuen Version wird die Vorversion zuerst nach `Archiv\vALT` verschoben). Für GitHub Pages einfach den **Inhalt** dieses Ordners (nicht den Ordner selbst, und nicht `Archiv/`) im GitHub-Webinterface per «Add file → Upload files» hochladen (Ordner lassen sich dort per Drag & Drop mitziehen).

In `index.html` oben im `CONFIG`-Block steht die `CLIENT_ID` (OAuth-Client-Typ «Webanwendung», JavaScript-Ursprung = `https://krohnoshub.github.io`). **Sie ist in dieser Lieferung bereits auf `159994249880-flb4nhh2aq51tspov0d7nv787hir84e5…` gesetzt** und wurde vor der Auslieferung geprüft.

**Wichtig beim Umstieg:** Ab v2.0 speichern Notizen im Format v3. Ältere App-Versionen (v1.x) können Textfelder/Symbole daraus nicht darstellen. Bitte alle Geräte auf v2.0 aktualisieren (Seite einmal neu laden; ggf. zweimal, bis der Service Worker die neue Version übernommen hat).

## Änderungslog

### v2.3.3 – Verknüpfungen/Aufnahmen überdecken das Blatt nicht mehr, Fix «Bitte zuerst anmelden» hängengeblieben (23.09.2026)

- **Neu: Persistenter Mini-Player statt Video/Audio im Dialog eingebettet.** Bisher lief die Wiedergabe einer Verknüpfung (▶ bei «Verknüpfungen») bzw. des Mitspiel-Tracks (bei «Neue Aufnahme») direkt im jeweiligen Dialog – der mit seinem abgedunkelten Hintergrund das Notenblatt komplett verdeckte, wie gemeldet. Jetzt läuft die Wiedergabe in einem **kleinen, eigenständigen Player unten rechts** («Mini-Player»): Dialog öffnen, Verknüpfung/Mitspiel-Option antippen, Dialog mit «Fertig»/«Schliessen» wieder zumachen – das Notenblatt ist sofort wieder voll sichtbar und bedienbar, während die Wiedergabe im Mini-Player weiterläuft. Eigenes ✕ im Mini-Player stoppt sie, ↗ öffnet den Link zusätzlich extern, Antippen des Titels klappt den Player ein/aus.
- **Läuft jetzt auch im Vollbildmodus (Auftrittsmodus) weiter im Hintergrund**, wie gewünscht – der Mini-Player ist bewusst von den Elementen ausgenommen, die im Vollbildmodus ausgeblendet werden.
- Bei der Aufnahme-Ansicht wird die gewählte Mitspiel-Option jetzt schon beim Öffnen/Auswählen probeweise gestartet (nicht erst bei «Aufnahme starten»), damit man vorher hören kann, ob die richtige Version ausgewählt ist.
- **Zum gemeldeten Fehler «Auswahl ‹Mitspielen mit› erscheint nicht»:** Ich habe den genauen von dir beschriebenen Ablauf (Verknüpfungen öffnen, automatische Suche abwarten, Karaoke-Link sehen, Dialog schliessen, dann «Aufnahmen» → «Neue Aufnahme» öffnen – sowohl über die neue 2. Menüleiste als auch über das alte ⋯-Menü) mehrfach automatisiert nachgestellt und dabei **keinen Fehler gefunden** – die Auswahl erscheint in jedem geprüften Ablauf korrekt, sobald ein YouTube-Link am Song hängt. Da die betroffene Ansicht mit dieser Version ohnehin grundlegend umgebaut wurde (siehe oben), **bitte einmal neu testen** – falls die Auswahl weiterhin fehlt, bräuchte ich zur weiteren Eingrenzung: welchen Weg genau du zu «Neue Aufnahme» nimmst, ob du die Seite zwischendurch neu geladen hast, und wenn möglich eine Konsolenausgabe/einen Screenshot direkt nach dem Öffnen von «Neue Aufnahme».
- **Fehler behoben: Hinweis «Bitte zuerst anmelden» blieb stehen, obwohl bereits wieder «Angemeldet».** Ursache: Dieser Hinweis erscheint, wenn eine Online-Aktion (Aufnahme speichern, Backing-Track hochladen, Blatt hinzufügen, Scannen) auf einen inzwischen abgelaufenen Anmelde-Token trifft. Meldete man sich danach erneut an, wurde zwar der Anmelde-Knopf korrekt auf «Angemeldet» aktualisiert, der alte Hinweistext daneben aber nirgends aufgeräumt – er blieb bis zur nächsten zufälligen Statusänderung stehen. Wird jetzt nach jeder erfolgreichen (Neu-)Anmeldung automatisch entfernt.

### v2.3.2 – Karaoke-Link als Mitspielen-Quelle, Fixversuch Stift auf Handy (23.09.2026)

- **Neu: Mitspielen mit verlinkter YouTube-Version.** In der Aufnahme-Ansicht («🔴 Neue Aufnahme») steht jetzt eine Auswahl **«🎧 Mitspielen mit:»**, sobald ein Song mindestens einen hochgeladenen Backing-Track und/oder mindestens einen YouTube-Link unter «🔗 Verknüpfungen» hat. Ein eigener Datei-Upload ist damit nicht mehr zwingend nötig – jede verlinkte YouTube-Version (z. B. die automatisch gefundene Karaoke-Fassung) lässt sich direkt als Mitspiel-Track verwenden, inklusive eingeblendetem Video. Ist eine Karaoke-Verknüpfung vorhanden, wird sie automatisch vorausgewählt (vor einer hochgeladenen Datei). Start/Stopp der Aufnahme startet/stoppt automatisch auch das YouTube-Mitspielen.
- **Fixversuch: Stift-/Marker-Striche auf dem Handy unsichtbar (weiterhin gemeldet, u. a. Samsung Internet).** Der v2.0.2-Fix (kein CSS-Blending mehr) hat das Problem laut Rückmeldung nicht behoben. Neuer Ansatz: Die Zeichenebene wurde bisher ausschliesslich über `requestAnimationFrame` neu gezeichnet; auf manchen Handy-Browsern scheint dieser Aufruf während/nach Touch-Gesten gelegentlich auszubleiben, wodurch die Ebene lokal eingefroren bleibt (der Strich ist aber korrekt gespeichert und nach Sync auf anderen Geräten sichtbar – passt zum gemeldeten Verhalten). Es gibt jetzt zusätzlich ein Zeitlimit von 150 ms, das die Aktualisierung notfalls erzwingt, auch wenn `requestAnimationFrame` ausbleibt. **Bitte auf dem betroffenen Handy erneut prüfen** – falls weiterhin unsichtbar, brauche ich mehr Details (z. B. ob es nur beim Live-Zeichnen passiert oder auch danach, ob Zoomen/Scrollen hilft) für einen weiteren Versuch.
- **Service-Worker-Update robuster:** Die Netzwerk-zuerst-Anfrage für `index.html` erzwingt jetzt `cache: 'no-store'`, damit eine neue Version nicht durch einen HTTP-Zwischenspeicher (Browser oder Hosting) verzögert ausgeliefert wird. Trotzdem gilt weiterhin: nach einem Update hilft ein vollständiges Schliessen und Neuöffnen der App (nicht nur in den Hintergrund wechseln), damit der neue Service Worker sicher übernommen wird.

### v2.3.1 – Song-Aktionen als sichtbare 2. Menüleiste (23.09.2026)

- Beim Öffnen eines Songs erscheint jetzt direkt unter der Zeichenwerkzeugleiste eine **zweite Leiste** mit allen Song-Aktionen (Favorit, Umbenennen, Verschieben, Tags, Setliste, Blätter verwalten, Verknüpfungen, Aufnahmen & Backing-Track, Offline speichern, Löschen) – ohne erst über das ⋯-Menü gehen zu müssen. Das ⋯-Menü in der Song-Liste bleibt zusätzlich bestehen (nützlich, um einen Song zu bearbeiten, ohne ihn zu öffnen).
- Reine UI-Änderung, keine Datenformat-Änderung.

### v2.3.0 – Aufnahme mit Pitch-Feedback, Backing-Track (22.09.2026)

Dritter und letzter der drei geplanten Schritte.

- Neuer Menüpunkt pro Song: **«🎙 Aufnahmen & Backing-Track»**.
- **Aufnehmen:** «🔴 Neue Aufnahme» fragt das Mikrofon an und zeigt währenddessen ein **Live-Stimmgerät** – grosse Notenanzeige (deutsche Bezeichnung: C, C♯, D, … A, B, H), Cent-Abweichung mit Zeiger (grün/gelb/rot) und eine **scrollende Tonhöhenkurve** der letzten Sekunden, ähnlich einem einfachen Tuner. Die Erkennung läuft per Autokorrelation direkt im Browser, ohne Internet oder externe Bibliothek. Nach «⏹ Aufnahme beenden» gibt es eine Vorhör-Vorschau, dann **Speichern** (lädt in den Drive-Ordner des Songs hoch, wird sofort offline verfügbar) oder **Verwerfen**.
- Beliebig viele Aufnahmen pro Song, mit Datum/Uhrzeit, abspielbar (auch offline, wenn zwischengespeichert) und einzeln löschbar.
- **Backing-Track:** eigene Audiodatei (MP3 etc.) pro Song hochladen, im selben Menü abspielbar, ersetzbar, entfernbar.
- **Mitsingen mit Backing-Track:** Ist ein Backing-Track hinterlegt, bietet die Aufnahme-Ansicht «🎵 mithören» an (standardmässig aktiv) – er läuft beim Start automatisch mit. Landet **nicht** in der Aufnahme selbst; für ein sauberes Ergebnis am besten mit Kopfhörern arbeiten, sonst nimmt das Mikrofon ihn zwangsläufig etwas mit auf (physikalische Grenze, keine App kann das umgehen ohne eine spezielle Rückkopplungsunterdrückung).
- Aufnahmen/Backing-Track erscheinen bewusst **nicht** in der Blatt-Liste (andere Dateiendung/Typ als PDF/Bild) und werden zwischen Geräten über `library.json` mitsynchronisiert (`songs[…].audio`).
- Die Tonhöhenerkennung vergleicht **nicht** mit den Noten des Blatts (dafür läge keine maschinenlesbare Melodie vor) – sie zeigt, welche Note gerade gesungen wird und wie sauber getroffen, wie ein klassisches Stimmgerät. Sinnvoll fürs Einsingen, Intonationstraining und zum Nachhören der eigenen Aufnahmen.

### v2.2.0 – Spotify-/YouTube-Verknüpfungen pro Song (22.09.2026)

Zweiter der drei geplanten Schritte (danach: Aufnahme mit Pitch-Feedback).

- Jeder Song hat jetzt einen Menüpunkt **«🔗 Verknüpfungen»**: Songs lassen sich mit YouTube- und Spotify-Links verbinden, je einmal als **Original** und – wo verfügbar – als **Karaoke-Version**.
- **Automatische Vorschläge:** Ist mindestens ein API-Schlüssel eingerichtet (siehe unten), sucht die App beim ersten Öffnen der «Verknüpfungen» eines Songs automatisch nach «‹Songname›» und «‹Songname› karaoke» und verlinkt den jeweils besten Treffer selbstständig (als «Vorschlag» markiert). Über **«🔍 Vorschläge suchen»** lassen sich weitere Treffer ansehen und gezielt hinzufügen – etwa wenn der automatische Vorschlag nicht passt.
- **Entfernen/manuell verlinken:** Jede Verknüpfung lässt sich per 🗑 wieder entfernen. Zusätzlich kann jederzeit ein eigener YouTube- oder Spotify-Link eingefügt werden (einfach die URL einfügen, Titel optional).
- **Abspielen direkt in der App:** ▶ neben einer Verknüpfung blendet einen eingebetteten Player ein (YouTube-Video bzw. Spotify-Track), ohne YouTube/Spotify öffnen zu müssen. ↗ öffnet den Link zusätzlich extern. Spotify spielt in voller Länge nur, wenn im selben Browser bereits ein Spotify-Premium-Konto eingeloggt ist (siehe Hinweis unten) – ohne Login/Premium zeigt der eingebettete Player nur eine kurze Vorschau, der Link funktioniert aber immer.
- Ohne hinterlegte API-Schlüssel funktioniert weiterhin alles **manuell** (Link einfügen, entfernen, abspielen) – nur die automatische Suche bleibt dann aus (mit entsprechendem Hinweis im Verknüpfungen-Dialog).
- `library.json`: `songs[…].links` (Liste der Verknüpfungen, pro Song) wird jetzt aktiv genutzt und zwischen Geräten synchronisiert (siehe Datenformat unten).

### v2.1.0 – Song als zentrale Einheit (22.09.2026)

Grösserer Umbau der Bibliothek, erster Teil von drei geplanten Schritten (als Nächstes: automatische Spotify-/YouTube-Verknüpfung pro Song, danach Aufnahme mit Pitch-Feedback).

- **Neu:** Nicht mehr das einzelne Blatt (PDF/Foto) ist die oberste Einheit, sondern der **Song**. Ein Song kann ein oder mehrere Blätter enthalten (z. B. «Text» + «Noten» desselben Lieds) und bündelt Ordner, Tags, Favorit und Setlisten-Zugehörigkeit.
- **Umstieg automatisch:** Beim ersten Start nach dem Update wird für jedes bestehende Blatt automatisch ein Song angelegt (Name = Dateiname ohne Endung), inklusive Ordner, Tags, Favorit und Setlisten-Einträgen – es geht nichts verloren. Das läuft auf jedem Gerät unabhängig und erzeugt dieselben Songs (kein Duplikat, wenn zwei Geräte gleichzeitig aktualisiert werden).
- Sidebar-Reiter heisst jetzt **«Songs»**; die Kopfzeile zeigt den Songnamen. Hat ein Song mehrere Blätter, erscheint darunter ein **Umschalter** («Text» / «Noten» …) zum Wechseln, ohne die Seite zu verlassen.
- Menü pro Song (⋯): Umbenennen (Songname, unabhängig vom Dateinamen), Ordner, Tags, Favorit, Zur Setliste, **«Blätter verwalten»** (weitere Blätter anhängen/hochladen/scannen, einzeln umbenennen [Drive-Dateiname], Reihenfolge ändern, entfernen), Papierkorb (verschiebt alle Blätter des Songs).
- «+ Blatt» / «📷 Scan» legen wie bisher direkt einen neuen Song an; über «Blätter verwalten» eines bestehenden Songs lässt sich stattdessen ein weiteres Blatt demselben Song hinzufügen.
- Setlisten enthalten jetzt Songs statt einzelner Blätter; der Auftrittsmodus blättert wie bisher zwischen den Setlisten-Einträgen.
- `library.json` hat ein neues Feld `songs`; das bisherige `files`-Feld bleibt (dort stehen nur noch Helligkeit/Kontrast und zuletzt geöffnet pro Blatt sowie die Song-Zuordnung).

### v2.0.2 – Stift und Marker auf dem Handy sichtbar (22.09.2026)

- **Fehler:** Auf dem Handy waren Stift- und Marker-Striche beim Zeichnen nicht zu sehen, obwohl sie gespeichert und am PC nach der Synchronisation sichtbar waren.
- **Vermutete Ursache:** Die Ink-Ebene wurde per CSS `mix-blend-mode: multiply` über das Blatt gelegt; manche Handy-Browser stellen solche Ebenen in scrollbaren Containern nicht dar. **Auf dem Handy selbst nicht reproduzierbar (nur Chromium-Handy-Emulation, dort trat der Fehler nicht auf) – bitte auf dem Gerät prüfen.**
- **Jetzt:** Kein CSS-Blending mehr. Stift/Text/Symbole liegen normal auf der Ink-Ebene, der Marker wird per Canvas-Multiply direkt ins Blatt gerechnet (auch beim Live-Zeichnen). PDF-Export unverändert.
- Zusätzlich: Strichstärke hat auf schmalen Bildschirmen eine Mindestbreite (~0.7 px pro Schieberstufe), damit Striche nicht zum Haarstrich werden. Am PC unverändert. Gilt nur für neu gezeichnete Striche.
- Hinweis: Der Marker verwendet die gewählte Farbe; bei Schwarz erscheint er grau (Schwarz mit 38 % Deckkraft) – für einen gelben Marker bitte die Farbe wählen.

### v2.0.1 – Blattliste nach dem Update (21.09.2026)

- **Fehler:** Nach dem Umstieg auf v2.0 zeigte die App bei abgelaufener Anmeldung «Noch keine Blätter», obwohl die Dateien unverändert in Drive liegen (v2.0 zeigt zuerst lokale Daten, und die sind auf dem Gerät anfangs leer).
- **Jetzt:** Solange die Liste auf dem Gerät noch nie geladen wurde, erscheint der Hinweis «Deine Blätter liegen in Google Drive …» mit Knopf **«Mit Google anmelden»**; nach der Anmeldung erscheint die Liste. Fehlermeldungen sind auch auf dem Handy sichtbar (rote Statuszeile).
- Speicherort unverändert: Drive-Ordner **«Gesangs-App Lyrics»**; v2.0 legt dort zusätzlich `library.json` an.

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

## Einrichtung: automatische Spotify-/YouTube-Vorschläge (optional)

Ohne diese Einrichtung funktioniert das Verlinken weiterhin **manuell** (Link einfügen, abspielen, entfernen) – nur die automatische Suche nach Vorschlägen bleibt aus. Beide Schlüssel sind unabhängig voneinander; du kannst auch nur einen der beiden einrichten.

**YouTube Data API v3 (API-Schlüssel):**

1. [console.cloud.google.com](https://console.cloud.google.com) öffnen – am besten im **selben Projekt**, in dem auch die `CLIENT_ID` der App angelegt wurde (oben im Projekt-Auswahlmenü prüfen/wählen).
2. Menü *APIs & Dienste* → *Bibliothek* → «**YouTube Data API v3**» suchen → **Aktivieren**.
3. *APIs & Dienste* → *Anmeldedaten* → **+ Anmeldedaten erstellen** → **API-Schlüssel**. Der Schlüssel wird sofort angezeigt.
4. Empfohlen: Schlüssel direkt einschränken (**Schlüssel bearbeiten**) → *API-Einschränkungen* → nur «YouTube Data API v3» erlauben. Das verhindert Missbrauch, falls der Schlüssel versehentlich sichtbar wird (er steht offen in `index.html`, da die App ohne eigenen Server läuft).
5. Den Schlüssel in `index.html` im `CONFIG`-Block bei `YOUTUBE_API_KEY: ''` zwischen die Anführungszeichen eintragen.
6. Kostenlos bis 10.000 «Einheiten» pro Tag; eine Suche verbraucht 100 Einheiten – reicht für gut 50 Song-Suchen täglich (jede Suche fragt YouTube zweimal ab: Original + Karaoke).

**Spotify (Client-ID + Client-Secret):**

1. [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) öffnen, mit dem eigenen Spotify-Konto anmelden.
2. **Create app**: Name/Beschreibung frei wählbar (z. B. «Gesangs-App»); als *Redirect URI* reicht `https://krohnoshub.github.io/gesangs-app` (wird für die Suche selbst nicht gebraucht, ist aber ein Pflichtfeld); API: **Web API** ankreuzen.
3. In der neuen App → **Settings**: **Client ID** direkt sichtbar; **Client secret** über «View client secret» anzeigen.
4. Beide Werte in `index.html` eintragen: `SPOTIFY_CLIENT_ID: '…'` und `SPOTIFY_CLIENT_SECRET: '…'`.
5. Das reicht **nur für die Suche** (Client-Credentials-Verfahren, ohne dass sich jemand einloggen muss). Für das **Abspielen in voller Länge** ist zusätzlich nötig, dass im selben Browser bereits ein Spotify-**Premium**-Konto eingeloggt ist (z. B. weil man ohnehin auf open.spotify.com angemeldet ist) – das hat mit diesem Schlüssel nichts zu tun und lässt sich aus der App heraus nicht auslösen.

Nach dem Eintragen: `index.html` (und ggf. `sw.js`, falls neu gebaut) wie gewohnt auf GitHub Pages hochladen.

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

**Bibliothek** `library.json` im selben Drive-Ordner (ab v2.1):

- `songs` (zentrale Einheit): Name, Ordner, Tags, Favorit, zuletzt geöffnet, `sheets` (Liste der zugehörigen Blatt-IDs), `links` (ab v2.2: Spotify-/YouTube-Verknüpfungen, je `{id, type:'yt'|'sp', kind:'orig'|'karaoke'|'manual', mediaId, title, url, auto?, u}`), `audio` (ab v2.3: Aufnahmen/Backing-Track, je `{id (=Drive-Datei-id), name, kind:'take'|'backing', u}`).
- `files`: pro Blatt nur noch `sg` (zugehöriger Song), Helligkeit/Kontrast, zuletzt geöffnet.
- `folders`, `setlists` (Setlisten enthalten jetzt Song-IDs statt Blatt-IDs) wie bisher.

Jeder Eintrag mit Zeitstempel `u` («neuester Eintrag gewinnt» pro Eintrag; Löschungen als Marker `d:1`). Setzt gleich gehende Geräteuhren voraus.

## Getestet

Automatisierte Tests im Headless-Chromium mit simuliertem Google-Login und simuliertem Drive/YouTube/Spotify/Mikrofon (**≈250 Prüfungen, alle bestanden**; Ausführung über `localhost`, teils mit Handy-Emulation: Viewport, Touch, Pixelverhältnis):

- **Aufnahme/Pitch-Feedback/Backing-Track/Mini-Player (33):** Tonhöhenerkennung als reine Funktion geprüft (u. a. 440 Hz → A4 ±0 Cent, 220 Hz → A3, 261.63 Hz → C4, 445 Hz → A4 +20 Cent, Stille/Rauschen → keine Erkennung), Aufnahme über Chromiums simuliertes Mikrofon (Start/Stopp, Vorschau, Speichern lädt zu Drive hoch, sofort offline verfügbar, im Song-Datenmodell verknüpft, abspielbar, löschbar inkl. Drive-Papierkorb), **Live-Stimmgerät mit echtem simuliertem 440-Hz-Sinuston geprüft** (zeigt «A4» mit kleiner Cent-Abweichung während laufender Aufnahme), Backing-Track hochladen/abspielen/ersetzen (alter Track landet im Drive-Papierkorb)/entfernen, Mitspiel-Auswahl wird bei laufender Aufnahme angeboten, Verknüpfungen synchronisieren zwischen zwei Geräten ohne Duplikate (Merge nach `id`).
- **Karaoke-/Verknüpfungs-Wiedergabe im Mini-Player (18):** YouTube-Link als Mitspiel-Quelle (mit gestubbter IFrame-API: Player wird tatsächlich gestartet/pausiert/zurückgespult/zerstört, geprüft über Ereigniszähler), Karaoke-Verknüpfung ist voreingestellt (vor Datei-Backing), Umschalten zwischen Original/Karaoke/«Nicht mitspielen» aktualisiert den Mini-Player korrekt, **läuft nach Schliessen des Aufnahme-Dialogs weiter** (kein Modal mehr offen, Blatt bedienbar), eigenes Schliessen (✕) stoppt/zerstört den Player.
- **Song-Verknüpfungen (25):** manueller Link (YouTube/Spotify, aus eingefügter URL erkannt), ungültige Links werden abgelehnt, Entfernen, Wiedergabe über den Mini-Player mit korrekter Embed-URL (Toggle: erneutes Antippen stoppt), automatische Suche nach Original + Karaoke mit gestubbten API-Schlüsseln (verlinkt automatisch, keine doppelte Suche bei erneutem Öffnen), «Vorschläge suchen» zeigt Pickliste ohne automatisch hinzuzufügen, keine Duplikate beim erneuten Antippen eines schon verlinkten Vorschlags, Verknüpfungen synchronisieren zwischen zwei Geräten ohne Duplikate (Merge nach `id`, neuerer Eintrag gewinnt bei Konflikt).
- **Anmelde-Status (6, neu in v2.3.3):** Fehlhinweis «Bitte zuerst anmelden»/«Sitzung abgelaufen» wird nach erneuter erfolgreicher Anmeldung automatisch aus der Statuszeile entfernt, statt neben dem korrekt aktualisierten Anmelde-Knopf stehen zu bleiben.
- **2. Menüleiste «songBar» (10):** erscheint/verschwindet korrekt beim Öffnen/Schliessen eines Songs, enthält alle erwarteten Aktionen, Favorit-Umschalten und Umbenennen funktionieren darüber, bleibt beim Wechsel zwischen Songs korrekt pro Song synchron, im Auftrittsmodus ausgeblendet.
- **Organisation (49):** Ordner/Unterordner, Verschieben, Brotkrumen, Suche über Ordner, Tags, Favoriten, Sortierung, Setlisten, alle Werkzeuge (Stift, Marker mit Transparenz, Text anlegen/bearbeiten, alle 15 Symbole, Auswahl/Verschieben/Grösse/Löschen, Radierer), Undo aller Typen, Ebenen aus-/einblenden, «Seite leeren» nur aktive Ebene, Helligkeit, Synchronisation von Ordnern/Tags/Favoriten/Helligkeit/Setliste/Notizen nach Drive, Neuladen mit lokalem Stand.
- **Offline/Sync (25):** Service-Worker-Precache, Neuladen **ohne Netz**, PDF öffnen/zeichnen/Notiz offline, lokale Sicherung, Nachsynchronisieren beim Wiederverbinden, **Konflikt zweier Geräte** (Striche beider Seiten, Notizen beider Seiten, fremdes Löschen), kein Upload ohne Änderung, Bibliotheksänderung von anderem Gerät, abgelaufenes Token → lokal weiterarbeiten → nach Anmeldung nachsynchronisieren.
- **Auftrittsmodus/Touch (30):** Tippzonen, Wischen, Tasten/Pedal, Vorab-Rendern, Setliste über Liedgrenzen (vor/zurück), Zeichnen gesperrt, Helligkeit, Wake Lock (simuliert), Finger/Stift-Erkennung, Pinch-Zoom mit Nachrendern, Finger-Scrollen.
- **Export/Scan/Upload (36):** PDF-Export mit exakt platzierter Handschrift bei Rotate 0/90/180/270 und CropBox (Rendervergleich mit pdfium), Marker-Multiply, Bild-Export mit eingebrannter Helligkeit, Upload in aktuellen Ordner, Umbenennen, Papierkorb, **Scan** eines simuliert fotografierten, perspektivisch verzerrten Blatts mit Schatten (Ecken < 1 % genau, Seitenverhältnis, weisser Grund), mehrseitiges Scan-PDF, S/W-Modus.
- **Fehlerfälle (4):** «Drive API nicht aktiviert» wird verständlich gemeldet, Erststart offline.
- **Songs/Migration (13):** bestehende Blätter werden beim Update automatisch zu Songs (Ordner/Tags/Favorit/Setliste bleiben erhalten), zwei Geräte erzeugen dieselben Song-IDs (kein Duplikat), Song mit mehreren Blättern samt Umschalter in der Kopfzeile, Upload in den aktuellen Ordner landet beim Song, Blatt umbenennen weiterhin über «Blätter verwalten» möglich.

## Nicht getestet (braucht echte Geräte/Konten)

- Echter Google-Login und echtes Drive (v. a. resumable Upload, Hintergrund-Sync, Konflikt zwischen zwei echten Geräten).
- Echte Kamera/Fotos (Auto-Ecken funktionieren am besten auf dunkler, einfarbiger Unterlage; sonst Ecken von Hand ziehen), Scan-Geschwindigkeit auf älteren Handys (grosse Fotos werden begradigt auf max. 2300 px).
- Stiftdruck, Handballen, Vollbild, Wake Lock und Pedale auf realen Tablets; **iOS-Safari** (Vollbild-API fehlt dort – dann «Zum Home-Bildschirm» installieren; Wake Lock erst ab iOS 16.4).
- Service-Worker-Update auf GitHub Pages (Prinzip getestet, nicht über mehrere Deployments).
- Aus früheren Versionen noch offen: **Blätter umbenennen** (v1.4) – bitte kurz mit echtem Drive prüfen.
- Song-Migration und «Blätter verwalten» nur mit simuliertem Drive geprüft, nicht mit deiner echten, gewachsenen Bibliothek – bitte nach dem Update kurz durchsehen, ob alle Songs/Ordner/Tags wie erwartet aussehen.
- **Song-Verknüpfungen:** YouTube-Data-API und Spotify-Suche wurden nur gegen simulierte Antworten getestet (kein echter Schlüssel in dieser Umgebung verfügbar) – Trefferqualität/Relevanz der echten Suche bitte nach der Einrichtung kurz prüfen. Spotify-Wiedergabe in voller Länge (Premium-Login im selben Browser) ist nur anhand der Spotify-Dokumentation bestätigt, nicht mit deinem echten Account getestet; bitte einmal ausprobieren, insbesondere auf iOS Safari (dort ist eingebettetes Premium-Abspielen laut Spotify eingeschränkt).
- **Aufnahme/Pitch-Feedback:** Mikrofonzugriff, Aufnahme und Live-Stimmgerät wurden nur mit Chromiums *simuliertem* Mikrofon (u. a. echtem 440-Hz-Testton) geprüft – bitte einmal mit deiner echten Stimme auf PC/Handy/Tablet ausprobieren, insbesondere Mikrofonberechtigung, Erkennungsgenauigkeit tiefer/hoher Stimmen und Hintergrundgeräusche. **iOS Safari:** `MediaRecorder` wird erst seit iOS 14.3 unterstützt und liefert dort AAC/MP4 statt WebM – ungetestet, bitte kurz prüfen. Die Tonhöhenerkennung vergleicht nicht mit den Noten des Blatts, sondern zeigt nur, welche Note gerade gesungen wird (wie ein Stimmgerät).
- **Mitspielen mit YouTube-Link / Mini-Player (ab v2.3.2, überarbeitet in v2.3.3):** In dieser Umgebung ist kein Netzwerkzugriff auf YouTube möglich; das Verhalten des Mini-Players (Play/Pause/Seek/Destroy, Titel-/Sichtbarkeits-Logik, Weiterlaufen nach Dialog-Schliessen) ist automatisiert mit einer **nachgebauten YouTube-IFrame-API** geprüft (reagiert wie die echte API, läuft aber ohne Netzwerk) – nicht geprüft ist das tatsächliche Laden des echten YouTube-Players, ob Ton hörbar ist, und ob Browser automatisches Abspielen blockieren (v. a. auf dem Handy). Bitte einmal mit echtem Internetzugang ausprobieren.
- **Karaoke-Auswahl «erscheint nicht» (gemeldet nach v2.3.2):** Trotz mehrfacher automatisierter Nachstellung des genauen gemeldeten Ablaufs konnte ich den Fehler nicht reproduzieren – die zugrundeliegende Ansicht wurde in v2.3.3 ohnehin umgebaut (Mini-Player). Bitte mit dieser Version erneut prüfen und bei erneutem Auftreten möglichst genau den Ablauf (Menüleiste vs. altes ⋯-Menü, ob zwischendurch neu geladen wurde) und wenn möglich einen Screenshot der Browser-Konsole mitteilen.
- **Stift-Strich-Sichtbarkeit auf dem Handy (Samsung Internet u. a.):** Der Fixversuch in v2.3.2 (Zeitlimit statt reinem `requestAnimationFrame`) wurde von dir mittlerweile auf dem echten Gerät als behoben bestätigt.
- **«Bitte zuerst anmelden» hängengeblieben (Fix in v2.3.3):** Der Fix (Fehlhinweis wird nach erneuter Anmeldung aufgeräumt) ist automatisiert geprüft, aber noch nicht auf einem echten Gerät bei einer echten Token-Ablauf-Situation (nach ca. 1 h) verifiziert – bitte bei Gelegenheit im Alltag im Auge behalten.

## Bekannte Grenzen

- Auf dem Gerät gespeicherte Daten liegen im Browser-Speicher; «Websitedaten löschen» entfernt Offline-Kopien und *nicht synchronisierte* Änderungen. Vorher synchronisieren.
- PDF-Export enthält die Textnotizen unten nicht, nur die Handschrift/Objekte auf der Seite.
- Bei sehr vielen grossen Blättern ist der Browser-Speicher begrenzt; «Alle offline speichern» kann dann scheitern (Meldung erscheint).

## Nächste Schritte (vorgemerkt)

Die drei ursprünglich geplanten Bausteine (Song-Architektur, Spotify/YouTube-Verknüpfung, Aufnahme mit Pitch-Feedback) sind damit umgesetzt. Offen, nur bei Bedarf:

- **Lyrics-Websuche:** Lyrics direkt suchen und in eine (noch zu definierende) Vorlage formatieren, mit Änderungsmöglichkeit.
- Denkbare Erweiterung der Aufnahme-Funktion, falls gewünscht: Tonhöhenkurve der Aufnahme im Nachhinein ansehen (nicht nur live), mehrere Backing-Tracks pro Song, Referenz-Melodie (aus Noten/MIDI) zum Vergleich statt nur reines Stimmgerät.
