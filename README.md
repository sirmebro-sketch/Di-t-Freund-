# DiätFreund 🌿

Ein ruhiger, deutschsprachiger Android-Begleiter für Ernährung, Gewicht, Krafttraining und Wohlbefinden. **Ohne Abo, Konto, Werbung oder Backend.**

## Auf Android installieren

1. Unter [Actions → Android APK & Checks](https://github.com/sirmebro-sketch/Di-t-Freund-/actions/workflows/android.yml) den neuesten **grünen** Lauf öffnen.
2. Bei **Artifacts** `DiaetFreund-Android-APK` herunterladen (GitHub-Anmeldung erforderlich).
3. ZIP entpacken, `app-debug.apk` auf dem Smartphone öffnen und die Installation für die verwendete Dateien-App erlauben.
4. Profil und Ziele auf dem Gerät einrichten. Persönliche Angaben sind nicht im Repository hinterlegt.

Android 8.0 oder neuer, aktuelles Android System WebView. Das ist ein persönlicher Testbuild, keine Play-Store-Veröffentlichung. Der erste Build muss erfolgreich abgeschlossen sein, bevor ein APK verfügbar ist. Debug-Zertifikate können zwischen CI-Läufen wechseln: vor einem Update Sicherung exportieren; bei Signaturkonflikt bisherige App erst nach Sicherung deinstallieren. Für dauerhaft nahtlose Updates ist später ein festes privates Release-Signaturzertifikat erforderlich.

## Neu in 0.3.0 · Kanto

- **Alle 151 Pokémon:** deutsche Namen, Gen-I-Typen, lokale Originalsprites, durchsuchbarer Pokédex mit Typ-/Entdeckungsfilter und Entwicklungsdetails. Jede entdeckte Zwischenform bleibt registriert.
- **23 Reiseziele:** von Alabastia über Vertania-Wald, Mondberg, M.S. Anne, Safari-Zone, Silph Co. und Kraftwerk bis zur Liga und Azuria-Höhle. Professor Eich, Bill, Mr. Fuji und weitere Personen begleiten die Stationen mit eigenen kurzen App-Texten.
- **Acht echte Arenaorden:** Rocko, Misty, Major Bob, Erika, Koga, Sabrina, Pyro und Giovanni; danach Lorelei, Bruno, Agathe, Siegfried und Champ Blau. Begegnungen verwenden jeweils ein Signatur-Pokémon und vereinfachte Regeln.
- **Besondere Begegnungen:** Arktos, Zapdos, Lavados, Mewtu und Mew mit Fortschrittsbedingungen; Evolis Wunschentwicklung vor Level 24 wählbar.
- **Bestehende Spielstände bleiben erhalten:** Team, Erfahrung, Tonoptionen und bisherige Ereignisse werden migriert. Frühere allgemeine Orden bleiben Erinnerungsbänder und werden nicht als gewonnene Arenen ausgegeben.
- **Kein Zeitdruck:** unverändert höchstens drei belohnte Routinen pro Tag, Erholung gleichwertig, keine Verluste bei Pausen. Simulationen bestätigen: alle drei Starter können die Liga und alle 151 Entdeckungen erreichen.

Stand zur täglichen Nutzung und verbleibende Gerätetests: [Nutzungsreife](docs/READINESS.md).

## Bereits enthalten seit 0.2.0

- **Pokémon-Abenteuer:** Starter wählen, automatisch Team-EP erhalten, Pokémon fangen, entwickeln und kurze Kämpfe bestreiten. Ursprünglich 9 Entwicklungslinien / 22 Formen; in 0.3 auf alle 151 erweitert. Wechselbarer Begleiter, Orden und Kampfberichte. Originalsprites und sechs kurze Originaleffekte aus Rot/Blau lokal gebündelt. Ton standardmäßig aus; Animationen abschaltbar. Kein Abo, Server oder Download beim Spielen.
- **Gesunde Spielregeln:** Ernährungseintrag, Check-in und Bewegung **oder** bewusste Erholung zählen jeweils einmal täglich. Keine Punkte für weniger Kalorien, Gewichtsverlust, zusätzliches Training oder mehr Trinken. Pausen und Niederlagen nehmen nichts weg.
- **Persönlicher Kompass:** lokale Angaben zu Alter, Alltag, Trainingsort/-zeit und freiwilligen Einschränkungen. Energieformel aktualisiert sich mit dem Gewicht; ein 21-Tage-Rückblick erklärt mögliche Anpassungen. Kalorienziele ändern sich ausschließlich nach ausdrücklicher Übernahme.
- **Einfacher erfassen:** Favoriten, gemerkte Portionen und Direktbuchung; Kennzeichnung vollständiger Esstage. Änderungen öffnen den Tag wieder.
- **12 Mikronährstoffe:** bekannte Werte und Datenabdeckung, passende DGE/ÖGE-Referenzen; unbekannte Werte bleiben unbekannt. Eigene Angaben ergänzbar. Keine Mangel- oder Supplementdiagnose.
- **Gym & Zuhause:** alternative Routinen und Zeitfenster, letzte Satzwerte als editierbare Erinnerung, Tagesbefinden und Erholungshinweise; keine Standard-Pulszonen bei angegebenen Betablockern.

Inoffizieller Pokémon-Fan-Spielteil mit vereinfachten Regeln, kein vollständiges Pokémon-Spiel. Quellen und Rechtehinweise: [Spielassets](docs/GAME.md).

## Enthalten

- **Heute:** Kalorienübersicht, Protein, Kohlenhydrate, Fett, Wasser und schnelle Mahlzeiteneingabe.
- **Essen:** vier Mahlzeiten, freie Datumswahl, Portionsberechnung, Bearbeiten/Löschen, Vortag kopieren, Favoriten und zuletzt verwendete Lebensmittel zuerst.
- **Lebensmittel:** kleine Offline-Grundauswahl mit ausdrücklich ungefähren Werten, eigene Packungsangaben, Barcode-Kamera sowie manuelle EAN-/UPC-Abfrage bei Open Food Facts. Neue Produktwerte müssen vor dem Speichern bestätigt werden. Gespeicherte Produkte sind offline verfügbar.
- **Rezepte:** Zutaten mit Mengen, tatsächliches Endgewicht nach Zubereitung, beliebige Grammportionen. Rezepte bleiben als wiederverwendbare Lebensmittel gespeichert.
- **Verlauf:** Gewicht, 7-Kalendertage-Mittel, Zielverlauf und Wochenübersicht. Keine Behauptung, Fett- oder Muskelmasse messen zu können.
- **Training:** allgemeine Ganzkörpervorlagen für Gym und Zuhause, eigene Übungen, editierbare Sätze/Last/Wiederholungen, 90-Sekunden-Pausentimer, Wiederaufnahme nach App-Neustart, Trainingshistorie und manuelle Aktivitäten. Nur tatsächlich abgehakte Sätze werden abgeschlossen.
- **Gesundheit:** freiwilliges Journal für Schlaf, Schritte, Bauchumfang, Blutdruck, Puls und Notizen. Keine Diagnosen oder Alarmüberwachung.
- **Daten:** atomare Speicherung im privaten Android-App-Verzeichnis, JSON-Sicherung/Wiederherstellung mit Schema-Prüfung, CSV-Export, komplette lokale Löschung. Helles und dunkles Design.

## Bewusste Grenzen

Kein automatischer Schrittzähler, Health Connect oder Wearable-Sync, keine Hintergrundbenachrichtigungen, kein Cloud-Sync, keine Foto-Kalorienerkennung, keine medizinische Auswertung. Barcode-Daten brauchen Internet; Kernfunktionen nicht. Kein eigener PIN-/Biometrieschutz, keine zusätzliche Datenbankverschlüsselung: Gerätesperre verwenden. Sicherungen enthalten Gesundheitsdaten **unverschlüsselt**. App-Deinstallation löscht lokale Daten.

Das ist eine erste Implementierung und kein behauptet perfektes oder medizinisch validiertes Produkt. Android-Gerätetests für Kamera, Dateidialoge, Prozesswiederherstellung und Bedienhilfen sind vor einer öffentlichen Veröffentlichung erforderlich. Details: [Testplan](docs/TESTING.md), [Entscheidungen](docs/PRODUCT.md), [Datenschutz](docs/PRIVACY.md), [Quellen und Lizenzen](docs/SOURCES.md).

## Entwickeln und prüfen

Keine Node-Abhängigkeiten für App oder Berechnungstests:

```sh
npm run check
npm test
npm run serve
# Browser: http://localhost:4173
```

Android Studio: Projekt öffnen, Gradle 8.9 / Java 17 wählen, SDK 35 installieren. Alternativ mit installiertem Gradle 8.9:

```sh
gradle :app:assembleDebug :app:lintDebug
```

Der CI-Workflow installiert die Build-Werkzeuge und erstellt den APK. Ein Gradle Wrapper ist noch nicht eingecheckt; `gradle wrapper --gradle-version 8.9` erzeugt ihn in einer eingerichteten Entwicklungsumgebung.

## Architektur

Java + AndroidX: sicherer WebViewAssetLoader, lokal gebündelte HTML/CSS/ES-Module, kontrollierte JavaScript-Bridge, Android Storage Access Framework für Exporte/Importe, ZXing für Kamera-Barcodes. Keine Webseite wird innerhalb der Bridge-WebView geöffnet. Nur der feste Open-Food-Facts-Produktendpunkt ist als externe Datenquelle erlaubt. CSP blockiert Fremdskripte und Frames.

`core.js` enthält Berechnung und Schema-Validierung; `coach.js` die erklärbare Anpassungslogik, `micros.js` Referenzwerte und Datenabdeckung, `game.js` den unabhängig testbaren Spielkreislauf. `app.js` bündelt Ansichten und atomare Transaktionen. Fehlgeschlagene Speicherung übernimmt keinen neuen In-Memory-Zustand. Trainingsänderungen und Tagebucheinträge werden sofort persistiert. Android-Backup und Geräteübertragung sind deaktiviert. Im lokalen Desktop-Test ersetzt Browser-localStorage den Android-Dateispeicher.

## Kosten

Die App verlangt weder Bezahlung noch API-Schlüssel. Es gibt keinen kostenpflichtigen Server. Open Food Facts ist ein unabhängiger Dienst ohne zugesicherte Verfügbarkeit; manuelle/offline Erfassung bleibt möglich. GitHub- und eventuelle spätere Store-/Hosting-Kosten hängen vom jeweiligen Konto und Vertriebsweg ab; es wird kein kostenpflichtiger Dienst eingerichtet.
