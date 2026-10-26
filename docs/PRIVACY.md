# Datenschutz im aktuellen Prototyp

- Verantwortlicher für eine mögliche spätere Veröffentlichung ist vor Release festzulegen; diese Dokumentation ersetzt keine veröffentlichungsfertige rechtliche Prüfung.
- Tagebuch, Profil und Trainingsdaten werden lokal verarbeitet; ausdrücklich gewählte Gewichtsexporte an Health Connect sind optional. Kein Analytics SDK, Werbenetzwerk, Crash-Upload oder Nutzerkonto.
- Android speichert im privaten App-Verzeichnis. Die JSON-Datei wird über AtomicFile ersetzt. Keine eigene Verschlüsselung/PIN; Schutz beruht auf Android-App-Sandbox und Gerätesperre.
- Android-Cloud-Backup und Geräteübertragung sind deaktiviert. Keine Speicher-/Kontakt-/Standortberechtigung. Kamera nur beim Scannen; Internet nur für ausdrücklich aufgerufene Produktabfragen.
- Barcode-Suche: Barcode und technisch notwendige Verbindungsdaten (IP, Browserkennung) an `world.openfoodfacts.org`. Keine Kamerabilder oder Tagebucheinträge. Der Dienst unterliegt seiner eigenen Datenschutzregelung.
- Export über Android-Dateiauswahl: Ziel bestimmt der Nutzer, einschließlich dort angebotener Cloud-Anbieter. Dateien sind unverschlüsselt. Temporäre Exportdatei liegt im privaten Cache und wird nach Abschluss/Abbruch entfernt.
- Import ersetzt nach Bestätigung den kompletten lokalen Zustand. Vorhandene Daten werden bei Schemafehlern nicht überschrieben.
- Deinstallation löscht App-Daten. JSON-Export ist für Gerätewechsel nötig. Exportierte Kopien außerhalb der App muss der Nutzer separat löschen.
- Kein Medizinproduktanspruch, keine Notfallüberwachung. Vor öffentlicher Distribution Datenschutztext, Drittanbieter-Lizenzen, Produktsicherheit, Store-Gesundheitsangaben und mögliche regulatorische Einordnung am tatsächlich angebotenen Funktionsumfang prüfen.

## Health Connect (ab 0.4)

Lesen von Schritten, Schlafdauer und Gewicht sowie Schreiben eigener Gewichte sind getrennte, widerrufbare Systemfreigaben. Standardmäßig wird nichts gelesen oder geschrieben. Automatisches Einlesen erfolgt nur nach Opt-in beim Öffnen/im Vordergrund. Kein Hintergrundzugriff. Datenkopien verbleiben im privaten App-Speicher und sind Bestandteil der JSON-Sicherung. Schritt-/Schlafkopien sind auf 366 Tage, Gewichtsimporte auf 5000 Datensätze begrenzt. CSV enthält eigene Journaleinträge; die vollständige Sicherung ist JSON.

Gewichtsexport erfolgt erst nach Vorschau und ausdrücklichem Senden. Apps mit eigener Lesefreigabe können geteilte Werte übernehmen. Importierte Werte werden nicht zurückgeschrieben. Lokales Löschen entfernt keine bereits geteilten Daten; diese können in Health Connect verwaltet werden. Freigaben der Quell-/Ziel-App, etwa Samsung Health, sind unabhängig zu setzen.
