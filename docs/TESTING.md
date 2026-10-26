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

## Version 0.3 · Kanto

- 34 Unit-Tests lokal bestanden: zusätzlich vollständiger 151er-Datensatz mit Sprites, Gen-I-Typen/Entwicklungen, alte Spielstände ohne Erfahrungsverlust, separate Arenaorden statt erfundener Siege, legendäre Freigabebedingungen, drei erreichbare Evoli-Zweige.
- Für jeden der drei Starter 250 synthetische Tage simuliert: alle 151 Entdeckungen, alle acht Orden und vollständige Liga erreichbar; Backup-Roundtrip gültig.
- `tests/kanto-ui.mjs`: Migration eines 0.2-Spielstands, 151 geladene Bilder, Nummer-/Namens-/Typ-/Statusfilter, Evoli-Auswahl, 23 Reiseziele, acht Orden, fünf Liga-Gegner, vollständiger Pokédex, 360-Pixel-Dialoge, ausgewählte helle/dunkle Ansichten ohne axe WCAG2 A/AA-Verstöße.
- Alle bestehenden Browserabläufe weiter erfolgreich. Pokédex und Ordenseite visuell kontrolliert. Gerätetests weiterhin offen (READINESS.md).
- CI 0.2: Android erfolgreich, alle drei Browser-Skripte meldeten PASS; der Interface-Job wurde nach langsamer Systempaketinstallation am Zeitlimit abgebrochen. 0.3 lädt Chromium ohne unnötige apt-Aktualisierung auf dem vorbereiteten Runner und beendet den Testserver explizit.

## Version 0.5 · Johto und Mahlzeitenvorlagen

- Lokal 45 Unit-Tests bestanden. Für jeden Johto-Starter jeweils 250 synthetische Tage in Kanto und 250 in Johto: 251 Entdeckungen, beide vollständigen Ordenreihen und Ligen, Kanto-Fortschritt unverändert, gültiger Sicherungs-Roundtrip.
- Regionswechsel bringt weder doppelte Tagespunkte noch doppelte Starter; alte 0.4-Spielstände übernehmen ihre Punkte vollständig nach Kanto. Legendäre Johto-Begegnungen bleiben vor ihren Bedingungen gesperrt.
- Vorlagen speichern Quellen und Mikronährstoff-Unbekanntwerte; Portionsberechnung, alte Sicherungen und fehlerhafte Importdaten geprüft. Ungültige Mengen, Datumswerte oder IDs dürfen keine Teilbuchung erzeugen.
- Alle sechs Browser-Skripte lokal bestanden. Neu `tests/johto-meals-ui.mjs`: Reisen, 100 Johto-Sprites, 251er-Filter, 20 Reiseziele, acht Orden, legendäre Hinweise; Mahlzeit speichern, skalieren, mit Dezimalkomma ändern, wiederverwenden, umbenennen und entfernen, Zustand nach Neuladen. 360-Pixel-Ansichten und ausgewählte helle/dunkle Dialoge ohne automatisch erkannte axe WCAG2 A/AA-Verstöße. Regionsauswahl und Mahlzeitenvorschau visuell geprüft.
- CI führt dieselben Unit-/Browser-Tests aus, baut Debug und Release, prüft beide mit Android Lint und signiert erst danach mit dem festen Zertifikat.
- Offen: tatsächliches Update über die signierte 0.4.1 auf dem Smartphone, Android-TalkBack/Systemschrift, Kamera/Dateidialoge und echte Samsung-Health-/Health-Connect-Daten. Browser-Nativaufrufe sind simuliert.


## Version 0.6

50 Unit-Tests einschließlich Nährwert-OCR-Parser (kJ/kcal, zwei Spalten, Portionsumrechnung, fehlende Einheiten, Konflikte, unbekannte Werte). Bestehende sechs Browser-Skripte sowie `update06-ui.mjs` prüfen Gen-IV-Navigation, Foto-Bridge mit simuliertem Text, Bestätigung vor Übernahme, Barcode-Direktstart, Belohnung ohne Doppelvergabe, externe Health-Connect-Freigaben, Vordergrund-Rückkehr, Fehlererhalt und 360-Pixel-/Hell-/Dunkelansichten mit axe.

Erster Android-Prüflauf für die neue native OCR und aggregierten Health-Abfragen: Build Debug/Release und beide Lint-Varianten erfolgreich (Actions 40304417355). Desktop-Tesseract mit demselben deutschen Modell an einer synthetischen Tabelle erprobt; ein falsch gelesenes Grammzeichen hat eine zusätzliche Parserprüfung ausgelöst. Native Android-Kamera, Touch-Ausschnitt und echter Samsung-Schrittimport sind weiterhin nicht am physischen Gerät abgenommen.

## Ergänzung 0.6.1

57 Unit-Tests insgesamt. `tests/catalogue-personal-ui.mjs` ergänzt die sieben vorhandenen Browser-Skripte um USDA-Erfassung, Mikronährstoffe, stabile Favoriten-IDs, gezielten Profilimport mit Vorschau und Abbruch, Schreibfehler und Datenerhalt. CI führt alle acht aus. Die Rezept-Erwartung verwendet für neu ausgewählte Haferflocken jetzt den USDA-Quellenwert 379 kcal/100 g; vorhandene Tagebuch-Snapshots bleiben unverändert.

## Ergänzung 0.7.0

`node tests/training-atmosphere-ui.mjs` bei laufendem lokalen Server ergänzt flexible Einheiten, Gerätefilter, Satzgruppen, Zeitübungen, eigene Pläne, Reload, fehlgeschlagene Writes, Journalabschluss, Audiopause/Fokusverlust, tatsächliches Rendern aller drei Musikstücke und geladene Hintergrundgrafiken. `npm test` enthält vier weitere Domänentests (insgesamt 61). Signierte Android-Installation und Audiofokus auf echtem Gerät separat prüfen.

## Ergänzung 0.7.2

`node tests/audio-navigation-ui.mjs` ergänzt einen Regressionstest mit echtem Web Audio und simuliertem Android-Audiofokus. Die alte HTML-Media-Effektwiedergabe löst im Test Fokusverlust aus und lässt die Prüfung fehlschlagen. Geprüft werden durchgehende Musikquelle bei Navigation und Lautstärkeänderung, gemeinsame Musik-/Effektausgabe, gespeicherter Offset nach Pause, Fokusverweigerung, bewusster Titelwechsel, Stummschaltung und keine verspäteten Effekte nach Pause. Damit laufen zehn Browser-Testprogramme. Die Fokus-Simulation ersetzt keinen Samsung-Gerätetest.

## Version 0.8.0 · Feedback & Trends

- Lokal: 36 App-Module syntaxgeprüft, 66 Unit-Tests und elf Browserprogramme erfolgreich.
- `tests/trends.test.mjs`: echte Nullwerte vs. fehlende Daten, Schaltjahr/ungültige Tage, unvollständige Nahrung und Mikronährstoffe, manuelle Priorität vor Health Connect, gemittelte Messungen, Monats-/Jahresaggregation, Trainingssummen, Gewichtsmittel sowie ungültige/zu große/zu lange Musikdateien.
- `tests/trends-feedback-ui.mjs`: Zeiträume und Filter, Tabellen/Details, Ton und je eine Haptik-Rückmeldung für Reiter/Buttons/Select/Summary/Formular, getrennte Stummschaltung, expliziter Test, gültiger lokaler Musikimport mit Wiederöffnung und Entfernung, Erhalt nach ungültiger Datei. Testaudio ist ein synthetischer kurzer Sinuston.
- Trends in 320/393/1280 Pixel Breite ohne Seitenüberlauf; ausgewählte Ansichten hell/dunkel ohne automatisch erkannte axe-core WCAG2 A/AA-Verstöße. Screenshots visuell geprüft. Keine vollständige Barrierefreiheitszertifizierung.
- Alle bisherigen Browserprogramme einschließlich Musik-Navigationsregression erfolgreich. Android-Kompilierung/Lint und signiertes Artifact sind separat im Workflow nachzusehen.
- Offen am realen Android-Gerät: tatsächliche Medienlautstärke, Berührungsvibration/Systemeinstellung, SAF-Musikdateiauswahl, Audiofokus bei Unterbrechungen und Rückkehr zur App. Browser-Bridges sind simuliert.

## Version 0.8.1 · Tagesbilanz

- Lokal: Syntax der 38 App-Module und alle 70 Unit-Tests erfolgreich. Neue Tests prüfen Portionssummen, Rest/Überschreitung, Vorzeichen der Verbrauchsbilanz, Vermeidung doppelter Aktivitätskalorien, leere/medizinische Tage, Zielableitung sowie bekannte Nullwerte vs. unbekannte/teilweise Ballaststoff- und Mikronährstoffdaten.
- Neuer Browserablauf `tests/nutrition-balance-ui.mjs`: Ist-/Sollkarten, alle zwölf Mikronährstoffzeilen, Tagesabschluss, Datumswechsel, Änderung der gespeicherten Ziele, Wiederöffnung, 320/393/1280-Pixel-Breiten ohne Seitenüberlauf. Ausgewählte Tagesbilanzansichten hell/dunkel und Detaildialog ohne automatisch erkannte axe-core WCAG2 A/AA-Verstöße; keine vollständige Zertifizierung. Screenshots visuell geprüft.
- Bestehende Abläufe für Coach, Tagebuch, Mahlzeitenvorlagen, Katalog/Privatprofil und unterbrechungsfreie Musik lokal erfolgreich. CI führt alle zwölf Browserprogramme sowie Android-Build und Lint erneut aus.
- Keine neue native Hardwarefunktion. Bereits offene Samsung-Gerätetests bleiben offen; Berechnungen sind keine medizinische Validierung.

## Version 0.8.2 · Hintergrundkante

38 Module syntaxgeprüft, 70 Unit-Tests und der bestehende Trainings-/Atmosphäre-Browserablauf erfolgreich. Hellen und dunklen Hintergrund bei 393 Pixeln Breite separat gerendert und visuell auf die vorher sichtbare Rahmenkante geprüft. Keine neue Hardwarefunktion. CI prüft wie bisher alle Browserabläufe, Android-Build, Lint und feste Signatur.

## Version 0.9.0 · Eier & Nationaldex

- 52 App-Module syntaxgeprüft, 76 Unit-Tests erfolgreich. Die sechs neuen Domänentests prüfen 1.025 Artendatensätze, 2.050 Sprite-PNGs, Entwicklungsgraphen, spätere Begleiter/Kämpfe, idempotente Tages-/Wochen-/Monats-/Meilensteinbelohnungen, drei Brutplätze, frische Schritt-Basis, Korrekturen, Pausen, Tageswechsel, Shiny-Garantie, Duplikate, Migration und ungültige Sicherungen.
- Neuer Browserablauf `tests/eggs-ui.mjs`: native Schritt-Lesung simuliert, drei Eier, erster Abgleich ohne rückwirkende Schritte, Schlupf, fehlgeschlagener Schreibversuch ohne Datenverlust, Gen-IX-Shiny als Begleiter, Umschalten auf Normal, Reload und Dekodierung aller 2.050 offline gebündelten Sprites. Brutstation bei 320/393/1280 Pixeln ohne horizontalen Überlauf; ausgewählte helle/dunkle Ansichten ohne automatisch erkannte WCAG2-A/AA-Verstöße. Screenshots visuell geprüft. Keine vollständige Barrierefreiheitszertifizierung.
- Die bisherigen zwölf Browserprogramme bleiben Teil der CI; zusammen mit dem Ei-Ablauf dreizehn. Android-Build/Lint und feste Signatur werden separat vom Workflow geprüft.
- Echtes Samsung-Gerät weiterhin erforderlich: Samsung Health → Health Connect → FitDex, erster Brut-Abgleich, späterer Schrittzuwachs und App-Rückkehr. Browsermocks beweisen keine tatsächliche Datenlieferung durch Samsung Health.
