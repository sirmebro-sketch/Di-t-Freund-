# 0.6.0 · Trainer-Tagebuch, Nährwertfotos und Schritte

## Die neue Bedienung

- **Heute:** Begleiter, drei Tagesroutinen, Ernährung, Schritte/Schlaf, Wasser und Gewicht. Genau ein Tages-Check-in für Hunger, Erschöpfung und Beschwerden.
- **Essen:** Tagebuch, Barcode, Foto einer Nährwerttabelle, gespeicherte Lebensmittel und Mahlzeiten. Seltenere Werkzeuge (Rezepte, Vortag kopieren, Mikronährstoffe) liegen unter „Weitere Möglichkeiten“.
- **Training:** Übungen, laufende Einheiten, Aktivitäten und Erholung.
- **Reise:** Team, Pokédex, Regionen, Orden/Liga, Forschung/Freundschaft und Trainerpass.
- **Profil:** Ziele, persönliche Voraussetzungen und Empfehlungen, gemessene Gesundheitswerte, Verbindungen, Darstellung und Sicherungen. „Kompass“ ist kein zusätzliches paralleles Menü mehr.

Die DS-Touchmenü-Optik gilt auch für Tagebuch, Formulare und Einstellungen. Originale HeartGold/SoulSilver-Sprites, Menüicons und Nationalpark-Szene; klare Textbeschriftung, große Touchflächen und flexible Smartphone-Layouts statt einer starren 256×192-Abbildung. Quellen und Prüfsummen: `GEN4-ASSETS.json`. Menü-Sheet: redblueyellow; Location-Sheet: Latias Tamer. Pokémon © Nintendo / Creatures / GAME FREAK; keine freie Lizenz oder offizielle Verbindung behauptet. Inhaltlich bleiben Kanto und Johto mit 251 Pokémon erhalten; der Grafikstil fügt nicht automatisch die Pokémon der dritten/vier­ten Generation hinzu.

## Belohnungen

Begleiter, Level und EP bis zum nächsten Level sind auf allen Hauptseiten sichtbar. Die drei Tagesaufgaben zeigen die tatsächlich verdienten EP. Fänge, Entwicklungen, Orden und Forschung bekommen eine separate sichtbare Rückmeldung; gewöhnliche Speichermeldungen verdrängen sie nicht mehr. Der Trainerpass enthält bleibende Meilensteine aus Routinepunkten, ohne neues Speicherschema.

Weiterhin insgesamt höchstens drei belohnte Routinen pro Kalendertag, Erholung gleichwertig, keine Boni für weniger Essen, mehr Training, mehr Trinken, mehr Schritte oder schnelleres Abnehmen. Bearbeiten derselben Routine gibt keine neuen Punkte. Pausen löschen nichts. Kein Countdown, verlorener Streak oder zufälliger Kaufanreiz. Motivation ist ein Gestaltungsziel, keine garantierte psychologische Wirkung.

## Foto-Erfassung

1. „Nährwertfoto“ wählen, Foto aufnehmen oder vorhandenes Bild auswählen.
2. Auf dem Foto einen Rahmen um die Tabelle ziehen; möglichst nur die relevante Spalte. Drehen möglich. Ohne Rahmen wird das ganze Bild erkannt.
3. OCR-Text und Vorschläge ansehen, Zahlenspalte und Bezugsmenge prüfen. Pro Portion 30 g bedeutet Bezugsmenge 30, nicht 100.
4. Nach Bestätigung die Lebensmittelangaben korrigieren/ergänzen, Namen vergeben und Portion eintragen.

Tesseract4Android 4.9.0 mit deutschem tessdata_fast-4.1.0-Modell ist im APK enthalten und läuft offline, ohne Konto, KI-Kosten, OCR-Netzwerkaufrufe oder SDK-Telemetrie. Fotos gelangen nicht ins WebView oder den Tagebuchspeicher; temporäre Kameraaufnahmen werden beim Beenden entfernt. Erkannter Text wird nicht mitexportiert. Gespeichert werden nur ausdrücklich bestätigte Lebensmittelwerte und Quellen.

Unterstützt: kcal (oder Umrechnung aus kJ), Protein, Kohlenhydrate, Fett und Ballaststoffe. Zucker/gesättigte Fette überschreiben keine Makros; Prozentwerte werden nicht als Gramm gelesen. Fehlende, widersprüchliche oder unsichere Einheiten bleiben zur Kontrolle offen. Fehlende Ballaststoffe werden wie bisher ausdrücklich als 0 in Summen behandelt, nicht als Nachweis ihrer Abwesenheit. Vitamine/Mineralstoffe lassen sich weiterhin manuell ergänzen.

Keine Erkennung von Kalorien aus einem Tellerfoto und keine Garantie fehlerfreier OCR. Glanz, Unschärfe, Rundungen, kleine Schrift und mehrere Spalten können Fehler verursachen. Auf eine Grammangabe wird nicht blind aus Ziffern wie „8,59“ geschlossen, wenn OCR das „g“ falsch gelesen hat.

Barcode startet in Android direkt mit einem Tippen. Gespeicherte Barcodes funktionieren offline; neue Produkte kommen nach ausdrücklicher Aktion von Open Food Facts und werden vor dem Speichern geprüft. Bei fehlendem Produkt sind Nährwertfoto und manuelle Eingabe direkt erreichbar. Die Lebensmittelsuche zeigt zunächst bis zu acht Favoriten/zuletzt verwendete Produkte; alle bleiben über Suche oder „Alle … anzeigen“ zugänglich.

## Reparierter Health-Connect-Ablauf

Bisher bis zu 60 einzelne Tagesabfragen für Schritte/Schlaf, bei einer Ausnahme Abbruch des gesamten Imports. Jetzt je Datentyp eine Kalender-Tagesaggregation für 30 Tage, fehlgeschlagene Typen getrennt: Schlafprobleme verhindern nicht die Übernahme erfolgreich gelesener Schritte. Keine Addition roher überlappender Datensätze; Health Connect berücksichtigt die vom Nutzer gewählten Quellenprioritäten.

Nach Lesefreigabe startet sofort ein Abgleich. Eine native Rückkehr in die App löst bei aktivierter Automatik einen gedrosselten Abgleich aus (mindestens fünf Minuten zwischen Versuchen). Explizites Aktualisieren kann bereits außerhalb der App erteilte Lesefreigaben übernehmen. Erfolgreich gelesene Typen, Schrittquellen und fehlende Daten werden erklärt. Fehler erhalten vorhandene Daten; erfolgreich leere Ergebnisse bleiben unbekannt, echte 0 bleibt 0. Es gibt keine Hintergrund- oder neue Sensorzählung.

Auf dem konkreten Smartphone muss weiterhin geprüft werden, ob Samsung Health tatsächlich Schritte in Health Connect geschrieben hat. DiätFreund kann Daten nicht aus einer fremden App holen, wenn sie dort nicht freigegeben/geschrieben wurden. Die gefundenen Fehlerpfade sind behoben; die individuelle Ursache kann ohne Geräteprüfung nicht als sicher bestätigt werden.

## Entwicklung und Tests

Build lädt das OCR-Modell ausschließlich zur Buildzeit von einer festen Version und prüft SHA-256 `19d219bbb6672c869d20a9636c6816a81eb9a71796cb93ebe0cb1530e2cdb22d`. Das Modell ist im installierten APK enthalten. Quelltext enthält keine Signierschlüssel. App-ID und Zertifikat bleiben gleich, versionCode 7.

- 50 Unit-Tests, bestehende sechs Browser-Skripte plus `update06-ui.mjs` für Foto-Bridge (simuliert), sichere Übernahme, Barcode-Direktstart, Belohnungsgrenze, Navigation, externe Health-Freigaben, Rückkehr und Fehlererhalt.
- Reale Tesseract-Desktop-Erkennung mit demselben deutschen Modell auf einer synthetischen Tabelle ausprobiert: Energie/Protein/Kohlenhydrate erkannt; ein als Ziffer gelesenes Grammzeichen führte zur strengeren Einheitenprüfung. Kein Ersatz für einen Android-Kameratest.
- Android-Build und Lint prüfen die native Integration. Reale Kamera, Ausschnittbedienung, TalkBack, Prozessabbruch und tatsächlicher Samsung-Schrittimport bleiben Gerätetests.

Technische Primärquellen:
- https://developer.android.com/health-and-fitness/health-connect/aggregate-data
- https://developer.samsung.com/health/health-connect-faq.html
- https://github.com/adaptech-cz/Tesseract4Android
- https://github.com/tesseract-ocr/tessdata_fast/tree/4.1.0
