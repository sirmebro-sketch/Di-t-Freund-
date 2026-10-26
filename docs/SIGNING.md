# Dauerhafte Android-Signatur

Ab 0.4.1 ist ein fester RSA-4096-Signaturschlüssel vorgesehen. Der private Schlüssel liegt ausdrücklich NICHT im Repository, auch nicht in versteckten Dateien. `signing/certificate-sha256.txt` enthält nur den öffentlichen SHA-256-Fingerabdruck des Zertifikats. Alias: `diaetfreund-release`, Storetyp PKCS12, Laufzeit etwa 50 Jahre.

## Einmalige Einrichtung durch den Eigentümer

Die private Sicherung enthält den Keystore und die beiden fertig vorbereiteten Secret-Werte. Das Archiv enthält damit alle zum Signieren nötigen Geheimnisse; es gehört in einen privaten Passworttresor oder eine geschützte Sicherung, niemals in ein Issue, eine öffentliche Datei oder einen Chat mit Dritten.

Repository → Settings → Secrets and variables → Actions → New repository secret:

| Name | Inhalt aus privater Sicherung |
|---|---|
| `DIAETFREUND_KEYSTORE_BASE64` | Gesamter Text von `DIAETFREUND_KEYSTORE_BASE64.txt` |
| `DIAETFREUND_KEYSTORE_PASSWORD` | Inhalt von `DIAETFREUND_KEYSTORE_PASSWORD.txt` |

Danach unter Actions den Workflow „Android APK & Checks“ auf main starten. Die Einrichtung gilt erst als abgeschlossen, wenn der Job `sign-release` tatsächlich „Sign and verify fixed certificate“ ausgeführt hat und das Artifact `DiaetFreund-Android-APK` existiert. Ein grüner Lauf mit Hinweis „Signing not configured“ ist KEIN Nachweis einer signierten APK.

Secret-Werte sind für öffentliche Repository-Besucher nicht lesbar. GitHub Actions muss sie zum Signieren verarbeiten können. Personen mit Schreibzugriff auf Workflows können deren Verwendung beeinflussen; Repository-Zugriff entsprechend begrenzen. Diese Konfiguration behauptet nicht, dass ausschließlich zwei Personen technisch Zugriff haben.

## Build und Prüfungen

- Build/Tests laufen ohne Schlüssel. Release wird unsigned gebaut; Debug hat das getrennte Paket `de.diaetfreund.app.dev` und dient ausschließlich Entwicklungstests.
- Signierjob nur für main, niemals für Pull Requests. Er wartet auf erfolgreiche Android- und Oberflächentests.
- Schlüssel nur temporär im Runner-Verzeichnis, Dateirechte eingeschränkt, Löschen per EXIT-Trap. Keine Passwörter als Befehlsargument oder in Logs; ausschließlich Umgebungsvariablen. Keine Keystore-Caches oder Uploads.
- APK wird vor Veröffentlichung mit Androids apksigner verifiziert. Zertifikatsfingerabdruck muss exakt dem eingecheckten öffentlichen Fingerabdruck entsprechen. Falscher Schlüssel führt zum Abbruch; kein stiller Fallback auf einen neuen Schlüssel.
- Bei fehlenden Secrets wird kein installierbares Release veröffentlicht. Das unsigned Artifact ist nur für kontrolliertes lokales Signieren geeignet.

Lokales Signieren mit der privaten Sicherung und Android SDK Build Tools 36.0.0 ist ebenfalls möglich. Passwort über `--ks-pass env:KEYSTORE_PASSWORD` und `--key-pass env:KEYSTORE_PASSWORD` übergeben, nicht im Repository oder in der Shell-History ablegen. Anschließend `apksigner verify --verbose --print-certs` ausführen und Fingerabdruck vergleichen.

## Update und vorhandene Daten

Gleiches Paket, identisches Signaturzertifikat und steigender versionCode ermöglichen die Installation als Update unter Beibehaltung der privaten App-Daten. Zusätzlich muss jede neue App-Version die Datenmigration erhalten. Die Signatur ersetzt keine Sicherung und verhindert keinen Datenverlust durch Deinstallation, „Daten löschen“ oder Programmfehler.

Die früheren CI-Testbuilds 0.1–0.4 wurden mit automatisch erzeugten Debug-Schlüsseln signiert. Deren private Schlüssel wurden nicht archiviert. Deshalb vor dem einmaligen Umstieg JSON exportieren und sicher aufbewahren, bei Signaturkonflikt erst dann alte App deinstallieren, dauerhaft signierte App installieren und JSON importieren. Spätere gleich signierte Updates direkt über die installierte App installieren, nicht vorher deinstallieren.

Den festen Schlüssel inklusive Passwort unabhängig sichern. Ein neuer Schlüssel mit demselben Namen ist kryptografisch ein anderer Schlüssel und löst das Updateproblem erneut aus. Bei Verlust keine automatische Neuerzeugung.

Grundlagen:
- https://developer.android.com/studio/publish/app-signing
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
