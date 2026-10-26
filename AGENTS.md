# Projektregeln

- Ziel: verständliche, attraktive Android-App ohne laufende App-/Backend-/KI-Kosten.
- Keine persönlichen Gesundheitsdaten, Namen, Geburtsdaten oder echten Tagebucheinträge ins Repository, Screenshots oder Testfixtures schreiben. Generische synthetische Testdaten verwenden.
- Offline-Kernfunktionen erhalten. Kein Analytics, keine Werbung, keine Konten und keine unbestellten externen Uploads.
- Änderungen mit `npm run check`, `npm test` und passenden UI-Tests prüfen. Android-Änderungen zusätzlich `assembleDebug` und `lintDebug`.
- Speichern atomar; Import zuerst vollständig validieren und explizit bestätigen. Bei Fehlern bestehende Daten bewahren.
- Keine Diagnosen, Erfolgsgarantien, automatische Kaloriendefizitverschärfung, Strafsprache oder Belohnung von Unteressen.
- Keine fremden Fitness-App-Designs oder proprietären Lebensmitteldaten kopieren. OFF-Herkunft/Attribution erhalten.
- Der Eigentümer hat den Pokémon-Fan-Spielteil mit Originalsprites und kurzen Original-Menü-/Kampfeffekten ausdrücklich beauftragt. Herkunft in docs/GAME-ASSETS.json erhalten; keine freie Lizenz oder offizielle Zugehörigkeit behaupten. Keine vollständigen Soundtracks hinzufügen.
- Spielbelohnungen niemals an Defizit, Gewichtsverlust, Trainingsintensität oder Trinkmengen koppeln. Erholung gleichwertig behandeln; Pausen kosten keinen Fortschritt.
- Bridge nur für gebündelte App-Inhalte; niemals beliebige Web-Navigation oder Dateipfade zulassen.
- Tatsächliche Testergebnisse klar von ausstehenden Gerätetests trennen. Keine APK-Verfügbarkeit behaupten, bevor ein Build erfolgreich ist.
- Neue kostenpflichtige Dienste oder öffentliche Store-Veröffentlichung erfordern eine gesonderte Entscheidung des Eigentümers.

## Dauerhafte Android-Signatur

- Fester öffentlicher Zertifikatsfingerabdruck: `signing/certificate-sha256.txt`. Nicht ersetzen oder selbstständig einen neuen Schlüssel erzeugen.
- Private Signierung ausschließlich über die beiden GitHub-Actions-Secrets `DIAETFREUND_KEYSTORE_BASE64` und `DIAETFREUND_KEYSTORE_PASSWORD` oder die private Sicherung des Eigentümers. Schlüssel niemals in Git, APK, öffentliche Logs oder CI-Artefakte übernehmen.
- Hauptpaket `de.diaetfreund.app` bleibt stabil, `versionCode` bei jedem Update erhöhen. Debug-Paket `.dev` ist getrennt.
- Ohne Secrets keine mit zufälligem Debug-Schlüssel signierte APK als Update ausgeben. Unsigned-Artifact ist kein installierbares Update. Siehe `docs/SIGNING.md`.
