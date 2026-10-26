# Tests und Abnahme

## Automatisiert

- `npm run check`: JavaScript-Syntax.
- `npm test`: Portionen, Makros, Rezepte mit Endgewicht, Kalendertage, gleitendes Gewichtsmittel, Energieformel, fehlerhafte Sicherungen, Schema, Blutdruck-Paare, Trainingszustand, unvollständige OFF-Antworten.
- CI: Gradle `assembleDebug` und `lintDebug`, APK als Artifact.
- Browser-Abläufe: `node tests/ui.mjs` bei laufendem `npm run serve`, benötigt installiertes Playwright samt Chromium. `PLAYWRIGHT_MODULE` kann auf dessen `index.mjs` zeigen.

## Noch am Android-Gerät zu prüfen

1. Frische Installation, Profil anlegen, App schließen und wieder öffnen.
2. Kamera erlauben/ablehnen; EAN scannen und abbrechen; Produktdaten bestätigen; unbekannter Barcode/offline.
3. JSON nach Downloads exportieren, Datei prüfen, Import ersetzen/abbrechen. Ungültige und >10-MB-Datei darf nichts überschreiben.
4. Training beginnen, Sätze ändern, Prozess beenden, erneut öffnen und abschließen.
5. Rotieren, große Systemschrift, Tastatur, TalkBack, Zurück-Geste, kleine Displays und Dunkelmodus.
6. Netzwerk deaktivieren: sämtliche manuellen Tagebuchfunktionen bleiben nutzbar.
7. Schutz: keine externe Navigation in der WebView; kein Klartext-HTTP; keine Health-Daten in Logs oder Backup-Diensten.
8. Gewichts-/Essenseinträge bearbeiten/löschen, Datum wechseln, Vortag kopieren; Exporte auf Inhalt/Vollständigkeit prüfen.
9. Update mit stabiler Release-Signatur; Debug-Builds können einen Signaturwechsel verursachen (zuerst sichern).

Browser-/Unit-Tests ersetzen weder reale Android-Kamera-/SAF-Tests noch medizinische Validierung. Nicht geprüfte Punkte als offen behandeln.

## Durchgeführte Prüfung (26.10.2026)

- Version 0.2: 28 Berechnungs-/Validierungstests lokal erfolgreich; Version 0.1 zuvor 11 auch in GitHub Actions.
- Browser-Abläufe erfolgreich lokal und in GitHub Actions: Einrichtung, Wasser, Lebensmittel anlegen/bearbeiten, Rezept, simulierte Barcode-Antwort, Gewicht, Trainingswiederaufnahme, Gesundheitsjournal, Designwechsel, Import-Abbruch/Fehlerschema, JSON-Download.
- Ansichten mit 360/393 Pixeln Smartphonebreite und 1440 Pixeln Desktopbreite geprüft; kein horizontaler Seitenüberlauf. Dashboard und Training zusätzlich visuell inspiziert.
- Version 0.1: Android APK und Android Lint erfolgreich gebaut. Version 0.2 wird über denselben Workflow mit erweitertem Testumfang geprüft. Reale Android-Installation, Kamera und Dateidialoge weiterhin nicht auf einem Gerät getestet.
- OFF-Antwort ist im UI-Test simuliert; das ist kein Beleg für die momentane Erreichbarkeit des externen Dienstes.

## Zusätzliche Prüfung Version 0.2

- `tests/coach-ui.mjs`: Coach-Einrichtung, Modellhinweise, Abbruch/Bestätigung von Zielvorschlägen, Erschöpfungsreaktion, Favoriten, gemerkte Portion, Wiederöffnung vollständiger Tage, unbekannte und teilweise bekannte Mikronährstoffwerte, Dunkelmodus.
- `tests/game-ui.mjs`: Starterwahl, drei Tagesaufgaben, automatischer Fang, gespeicherte Ton-/Animationsoptionen, neun Entwicklungslinien nach synthetischem Monatsverlauf, Entwicklung, Kampfbericht ohne Mehrfachbelohnung, vollständig geladene Offline-Sprites und erfolgreiche Decodierung aller sechs Originaleffekte.
- axe-core WCAG2 A/AA: ausgewählte Hauptansichten, Coach-Einrichtung, Nährstoffdialog, Starterwahl, Abenteuer, volles Team und Kampfbericht ohne automatisch erkannte Verstöße. Helles/dunkles Design und 360-Pixel-Dialogbreite geprüft. Systemeinstellung „reduzierte Bewegung“ stoppt die Sprite-Animation. Das ist keine vollständige WCAG- oder TalkBack-Zertifizierung.
- Unit-Tests: Spielbelohnungen idempotent und unabhängig von Kalorienmenge, Pausen ohne Verlust, deterministische Kämpfe ohne Replay-Belohnung, ungültige Backups abgelehnt.
- Die UI-Testfixtures sind synthetisch. Android-Ton, Bild-Daten-URLs, echtes TalkBack und große Systemschrift bleiben Gerätetests.
