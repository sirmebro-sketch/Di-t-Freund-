# Datenschutz im aktuellen Prototyp

- Verantwortlicher für eine mögliche spätere Veröffentlichung ist vor Release festzulegen; diese Dokumentation ersetzt keine veröffentlichungsfertige rechtliche Prüfung.
- Tagebuch, Profil und Trainingsdaten werden lokal verarbeitet; ausdrücklich gewählte Gewichtsexporte an Health Connect sind optional. Kein Analytics SDK, Werbenetzwerk, Crash-Upload oder Nutzerkonto.
- Android speichert im privaten App-Verzeichnis. Die JSON-Datei wird über AtomicFile ersetzt. Keine eigene Verschlüsselung/PIN; Schutz beruht auf Android-App-Sandbox und Gerätesperre.
- Android-Cloud-Backup und Geräteübertragung sind deaktiviert. Keine Speicher-/Kontakt-/Standortberechtigung. Kamera nur beim Barcode-Scannen oder ausdrücklich gewählten Nährwertfoto; Internet nur für ausdrücklich aufgerufene Produktabfragen.
- Barcode-Suche: Barcode und technisch notwendige Verbindungsdaten (IP, Browserkennung) an `world.openfoodfacts.org`. Keine Kamerabilder oder Tagebucheinträge. Der Dienst unterliegt seiner eigenen Datenschutzregelung.
- Export über Android-Dateiauswahl: Ziel bestimmt der Nutzer, einschließlich dort angebotener Cloud-Anbieter. Dateien sind unverschlüsselt. Temporäre Exportdatei liegt im privaten Cache und wird nach Abschluss/Abbruch entfernt.
- Import ersetzt nach Bestätigung den kompletten lokalen Zustand. Vorhandene Daten werden bei Schemafehlern nicht überschrieben.
- Deinstallation löscht App-Daten. JSON-Export ist für Gerätewechsel nötig. Exportierte Kopien außerhalb der App muss der Nutzer separat löschen.
- Kein Medizinproduktanspruch, keine Notfallüberwachung. Vor öffentlicher Distribution Datenschutztext, Drittanbieter-Lizenzen, Produktsicherheit, Store-Gesundheitsangaben und mögliche regulatorische Einordnung am tatsächlich angebotenen Funktionsumfang prüfen.

## Health Connect (ab 0.4)

Lesen von Schritten, Schlafdauer und Gewicht sowie Schreiben eigener Gewichte sind getrennte, widerrufbare Systemfreigaben. Standardmäßig wird nichts gelesen oder geschrieben. Automatisches Einlesen erfolgt nur nach Opt-in beim Öffnen/im Vordergrund. Kein Hintergrundzugriff. Datenkopien verbleiben im privaten App-Speicher und sind Bestandteil der JSON-Sicherung. Schritt-/Schlafkopien sind auf 3660 erfasste Tage, Gewichtsimporte auf 5000 Datensätze begrenzt. CSV enthält eigene Journaleinträge; die vollständige Sicherung ist JSON.

Gewichtsexport erfolgt erst nach Vorschau und ausdrücklichem Senden. Apps mit eigener Lesefreigabe können geteilte Werte übernehmen. Importierte Werte werden nicht zurückgeschrieben. Lokales Löschen entfernt keine bereits geteilten Daten; diese können in Health Connect verwaltet werden. Freigaben der Quell-/Ziel-App, etwa Samsung Health, sind unabhängig zu setzen.


## Nährwertfotos ab 0.6

Tesseract-OCR verarbeitet den gewählten Fotoausschnitt vollständig lokal. Keine OCR-Analyse- oder Telemetrie-Dienste. Fotoauswahl über Android-Dateiauswahl benötigt keine allgemeine Galerie-/Speicherfreigabe. Temporäre Kameraaufnahme im privaten Cache; Löschung beim Beenden der Fotoaktivität. Bereits vorhandene Galerieoriginale werden nicht verändert oder gelöscht. Nach Prozessabbruch kann eine temporäre Aufnahme bis zum nächsten Fotovorgang im Cache bleiben. Weder Foto noch Rohtext werden im Tagebuch/Backup gespeichert; ausdrücklich übernommene und geprüfte Nährwerte werden als Lebensmittel gespeichert. Das Modell ist im APK enthalten, kein Download bei Nutzung.

Beim ausdrücklich ausgelösten Aktualisieren können bereits in Android erteilte Lesefreigaben übernommen werden; danach ist „Beim Öffnen aktualisieren“ aktiv und in der Verbindungsansicht abschaltbar. Ein fehlerhafter Datentyp ändert seine bisherigen lokalen Kopien nicht. Schrittquellen und letzter Abgleichstatus liegen nur lokal.
# Ergänzung 0.6.1

USDA-Grundnahrungsmittel sind im APK enthalten. Suchen und Eintragen benötigen keinen zusätzlichen Netzwerkzugriff. Die Daten sind generisch und enthalten keine persönlichen Gesundheitsdaten.

Die optionale persönliche Profildatei ergänzt nach Vorschau ausschließlich die bestätigten Einstellungen; sie ersetzt kein Tagebuch. Arbeitsweg, Bewegungsziele und Gesundheitsflags bleiben im lokalen Speicher und sind Bestandteil normaler Sicherungen. Solche Dateien enthalten private Angaben, sind unverschlüsselt und gehören nicht in öffentliche Repositories.

# Ergänzung 0.7.0

Musik wird offline erzeugt; Bilder und kurze Effekte sind lokal gebündelt. Audiofokus verwendet Android-Systemfunktionen ohne neue Datenerhebung. Eigene Trainingspläne und Toneinstellungen liegen im bestehenden privaten Speicher und sind Bestandteil der Sicherung. Der optionale private Profilimport kann ein ausdrücklich angegebenes datiertes Gewicht und den Trainingsstand übernehmen; die Vorschau zeigt dies vor der Bestätigung.

## Ergänzung 0.8.0

Importierte Menümusik wird nach eigener Dateiauswahl in der privaten WebView-Datenbank gespeichert. Kein Upload; die Originaldatei wird nicht verändert. Musikdateien sind nicht in JSON-Exporten enthalten und müssen bei einem Gerätewechsel erneut ausgewählt werden. „Datei entfernen“ und das vollständige Zurücksetzen löschen die lokale Musikkopie. Android-Dateiauswahl gewährt nur Zugriff auf die ausgewählte Audiodatei; keine allgemeine Speicherfreigabe. Vibration beachtet die Android-Einstellung für Berührungsfeedback. Trends entstehen ausschließlich aus den schon gespeicherten Daten.

## Brutstation ab 0.9.0

Erfolgskennungen, Ei-Inhalte, Shiny-Freischaltungen, Brutstrecke, maximal beobachtete Schritt-Tageswerte und der Zeitstempel des letzten erfolgreichen Schritte-Abgleichs bleiben lokal und sind Teil der JSON-Sicherung. Die Schritt-Maxima verhindern doppelte Belohnungen bei erneuten Importen. Es erfolgt kein neuer Netzwerkaufruf für Pokémon-Bilder, Zufall oder Fortschritt.
