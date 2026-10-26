# FitDex 0.8.0 · Feedback, Trends & eigene Menümusik

## Bedienung

Über **♪ Ton** lassen sich Musik, Effekte und Vibration unabhängig einstellen. Neue Toneinstellungen aktivieren Bedienungstöne und Haptik standardmäßig. Bereits gespeicherte ausgeschaltete Effekte werden respektiert; ein sichtbarer Einschaltknopf aktiviert Töne und Vibration. Der Testknopf funktioniert auch bei ausgeschalteten Effekten, ohne die Einstellung dauerhaft zu ändern. Android-Medienlautstärke und die systemweite Einstellung für Berührungsvibration gelten weiterhin.

Zentrale Rückmeldung für aktivierte Schaltflächen, Formularknöpfe, Aufklappfelder, Checkboxen, Radiobuttons und geänderte Auswahllisten. Texteingabe löst keinen Ton je Buchstabe aus. Kurze Originaleffekte stammen aus den bereits dokumentierten Pokémon-Assets. Musik und Effekte teilen einen AudioContext; Navigation startet die Musik nicht erneut.

## Trends

Eigener Reiter mit 7 Tagen, 30 Tagen, 90 Tagen, 365 Tagen und Gesamtzeitraum. Vorherige Zeiträume, Enddatum und Rückkehr zu heute sind auswählbar. Bis 45 Tage werden Tageswerte, bis 180 Tage Wochenwerte, bis fünf Jahre Monatswerte, darüber Jahreswerte dargestellt. Kalendergruppen am Rand umfassen nur die gewählten Tage.

Gewicht, Energie, Makros, Ballaststoffe, vorhandene Mikronährstoffe, Wasser, Schritte, Schlaf, Trainingszeit, Aktivitäten, Bauchumfang, Blutdruck und Ruhepuls. Diagramme zeigen Mittelwerte tatsächlich erfasster Tage; Trainingszeit und Aktivitäten werden summiert. Fehlende Tage bleiben Lücken und werden nicht mit Null gleichgesetzt. Tabelle und Detailansicht zeigen erfasste Tage und Werte. Der Gewichtstrend verwendet die letzten sieben Kalendertage ab zwei Messungen. Es gibt keine Belohnung für sinkendes Gewicht, höhere Trainingswerte oder Defizite.

Ernährungskurven zeigen nur erfasste Zufuhr, keinen gemessenen Bedarf. Vollständige Esstage sind filterbar. Unbekannte Mikronährstoffe bleiben unbekannt, teilweise verfügbare Werte werden gekennzeichnet. Eigene tägliche Schritt-/Schlafangaben haben Vorrang vor Health Connect; mehrere Blutdruck-/Pulsmessungen werden pro Tag gemittelt. Kein diagnostisches Urteil.

Health-Connect-Tageskopien sind nun auf 3660 erfasste Tage begrenzt. Alte, zuvor entfernte Werte werden nicht wiederhergestellt. Gewichtsimporte bleiben auf 5000 Datensätze begrenzt; eigene Journaleinträge behalten die bisherigen Grenzen.

## Eigene Musik

**♪ Ton → Musikdatei laden** öffnet die lokale Dateiauswahl. Bis 10 MB und fünf Minuten, je nach WebView MP3, OGG, WAV oder M4A. Die Datei wird vor dem Ersetzen dekodiert und geprüft; ein fehlerhafter Import bewahrt die bisherige Musik. Anschließend „Eigene Datei“ als Musikstück wählen und „Übernehmen & anhören“ drücken. Die gewählte Datei läuft als Schleife.

Keine vollständigen kommerziellen Soundtracks im APK. Drei eigene Stücke bleiben mitgeliefert. Die Musikkopie bleibt privat auf dem Gerät und wird nicht hochgeladen; JSON-Sicherungen enthalten nur die Toneinstellung, keine Audiodatei. Nach Gerätewechsel muss sie erneut ausgewählt werden. Entfernen löscht nur die App-Kopie.

## Update & Prüfung

versionCode 12, Version 0.8.0, unveränderte Paketkennung und fester Signaturschlüssel. Als Update installieren; nicht vorher deinstallieren. Automatisierte Tests und Android-Buildstatus siehe CI. Tatsächliches Audio, Haptik und Dateiauswahl auf einem Samsung-Gerät bleiben separat zu prüfen.
