# FitDex 0.11.0 · Trainingsverlauf und leichteres Wiederholen

## Training

- **Übungsverlauf:** aus dem Trainingsreiter, laufenden Übungen und dem Trainingsjournal erreichbar. 30 Tage, 3 Monate, 1 Jahr oder gesamter Verlauf. Diagramm und Datentabelle für höchste protokollierte Last, gesamte Wiederholungen bzw. Haltezeit und absolvierte Sätze pro Tag.
- Gerätebezeichnung, Übungskennung/eigener Name und Zeit-/Wiederholungsmodus bilden getrennte Verläufe. Nur abgehakte Sätze abgeschlossener Einheiten zählen. Mehrere Einheiten desselben Tages werden zusammengefasst; höchste Last ist ein Maximum, Wiederholungen/Zeiten/Sätze sind Summen. Fehlende Tage werden nicht als Null ergänzt. Spätere Datumswerte bleiben ausgeschlossen.
- **Zuletzt:** laufende Übungen zeigen die letzte passende Einheit und deren tatsächlich protokollierte Lasten/Wiederholungen bzw. Zeiten.
- **Letzte absolvierte Sätze übernehmen:** bei einer Bibliotheksübung bewusst auswählbar, falls ein passender Verlauf existiert. Kopiert alle passenden absolvierten Sätze der jüngsten Einheit, mit ihren unterschiedlichen Werten. Neue Blockkennungen, keine Häkchen; keine automatische Steigerung. Bestehende Historie unverändert. Gerätewechsel bleibt die Verantwortung des Nutzers; gleiche Gerätebezeichnung garantiert kein physisch identisches Gerät.
- **Einheit wiederholen:** aus einem Journaleintrag eine neue, editierbare Einheit starten. Keine Übernahme alter Erledigt-Häkchen, Dauer oder Notizen. Laufende Einheiten werden nicht überschrieben; reine Aktivitäten ohne Sätze bieten diese Aktion nicht an.
- **Eigene Zeitübungen:** eigene Varianten lassen sich mit Wiederholungen oder Sekunden protokollieren, in Pläne übernehmen und wieder starten.

Die Diagramme beschreiben Einträge, nicht gemessenen Muskelzuwachs oder eine Belastungsempfehlung. 0 kg bedeutet kein protokolliertes Zusatzgewicht. Zeit und Wiederholungen werden nicht miteinander verrechnet. Frühere Datensätze ohne Geräte-/Bibliothekskennung bleiben eigenständig statt unsicher zusammengeführt zu werden.

## Korrigierte Abläufe

- Nach dem Eintragen einer Mahlzeitenvorlage für ein anderes Datum öffnet sich genau dieser Tag im Essen-Reiter. Bisher konnte der Eintrag außerhalb der sichtbaren Ansicht landen.
- Beim Wiederholen von Einstiegsvorlagen wird bei mehreren Einheiten am selben Tag die zuletzt gespeicherte gewählt; nicht absolvierte und zukünftige Sätze werden nicht als Vorgabe übernommen.
- Schlägt das Speichern des Trainingsabschlusses fehl, bleiben aktive Einheit und Pausentimer bestehen. Erst nach erfolgreichem Abschluss wird der Timer zurückgesetzt.

## Prüfung / Update

86 Unit-Tests, neuer Browserablauf `exercise-history-ui.mjs`, bestehende Trainings-/Mahlzeiten-/Coach-/Grundabläufe und Android-CI. Der neue Ablauf prüft Charts/Tabellen, 320/393/1280 px, hell/dunkel, bewusste Kopien, eigene Zeitübungen, Fehler beim Speichern, Wiederholung/Reload und Mahlzeit-Datumswechsel. Insgesamt 15 Browserprogramme im Workflow. Axe-core ist keine vollständige Barrierefreiheitszertifizierung. Native Samsung-Health-, Kamera- und Audiofunktionen bleiben ergänzend am Gerät zu prüfen.

Kein neuer Datendienst, keine zusätzlichen Berechtigungen, keine neuen Gesundheitsziele oder Spielbelohnungen. Bestehende Spielstände und Gesundheitsdaten bleiben erhalten. Gleiche Paketkennung und feste Signatur, versionCode 17.
