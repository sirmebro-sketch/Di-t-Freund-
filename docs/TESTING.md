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
