# FitDex

Ein ruhiger, deutschsprachiger Android-Begleiter für Ernährung, Gewicht, Krafttraining und Wohlbefinden. **Ohne Abo, Konto, Werbung oder Backend.**

## Auf Android installieren

1. Unter [Actions → Android APK & Checks](https://github.com/sirmebro-sketch/Di-t-Freund-/actions/workflows/android.yml) den neuesten **grünen** Lauf öffnen.
2. Bei **Artifacts** `FitDex-Android-APK` herunterladen (GitHub-Anmeldung erforderlich).
3. ZIP entpacken, `FitDex.apk` auf dem Smartphone öffnen und die Installation für die verwendete Dateien-App erlauben.
4. Profil und Ziele auf dem Gerät einrichten. Persönliche Angaben sind nicht im Repository hinterlegt.

Android 8.0 oder neuer, aktuelles Android System WebView. Das ist ein persönlicher Testbuild, keine Play-Store-Veröffentlichung. Seit 0.4.1 ist die feste Release-Signatur eingerichtet und erfolgreich geprüft. Der private Schlüssel wird über GitHub-Actions-Secrets eingebunden; ohne eingerichtete Secrets gibt es kein installierbares Release-Artifact. Einmalige Einrichtung und Umstieg von bisherigen Debug-APKs: [Signierung](docs/SIGNING.md). Vor diesem einmaligen Wechsel JSON sichern. Künftige gleich signierte Updates über die bestehende App installieren.

## Neu in 0.11.1 · Klareres Nacht-Design

Höhere Kontraste für Hinweistexte, Eingabefelder, Fortschrittsbalken und Fokus. Ruhigerer Hintergrund, freigestellte HGSS-Menüsymbole ohne weiße Außenkontur und ein dazu passendes Pixel-Diagrammsymbol. [Details](docs/UPDATE-0.11.1.md). versionCode 18, gleiche Paketkennung und feste Signatur.

## Neu in 0.11.0 · Dein Trainingsverlauf

Diagramm und Tabelle je Übung, Erinnerungen an die letzten Sätze, bewusstes Übernehmen alter Lasten/Wiederholungen, Wiederholen abgeschlossener Einheiten und eigene Zeitübungen. Mahlzeitenvorlagen öffnen nach dem Speichern den gewählten Tag. [Details und Grenzen](docs/UPDATE-0.11.0.md). versionCode 17, gleiche Paketkennung und feste Signatur.

## Seit 0.10.0 · Zucker & Fettarten

„Davon Zucker“, gesättigte, einfach und mehrfach ungesättigte Fettsäuren sowie Transfettsäuren: in Lebensmitteln, Foto-/Barcode-Übernahme, Portionen, Tagesbilanz und Trends. Verfügbare USDA-Werte ergänzt; fehlende Daten bleiben unbekannt. Nährwerte lassen sich gezielt für künftige Portionen oder einen einzelnen Tagebucheintrag korrigieren. Zusätzlich Fehler bei Vorlagen, OCR, Energieimport, schmalen Layouts, CSV und Belohnungsmeldungen behoben. [Details und Prüfungsumfang](docs/UPDATE-0.10.0.md). versionCode 16; gleiche Paketkennung und feste Signatur.

## Seit 0.9.0 · Eier, Schritte & Shinys

Drei Brutplätze, Eier aus Tages-/Wochen-/Monatserfolgen und Meilensteinen, echte Health-Connect-Schritte und 1.025 Nationaldex-Grundarten der Generationen 1–9 mit 2.050 offline verfügbaren Normal-/Shiny-Sprites. Shiny-Chance 1:64, spätestens jedes 32. vergebene Ei seit dem letzten Shiny-Ei garantiert shiny. Eigrafik aus HG/SS; späteren Arten stehen passende neuere bzw. Community-Sprites zur Verfügung. Reisen bleiben Kanto/Johto. Details und eigene Spielregeln: [Brutstation](docs/EGGS.md). versionCode 15, gleiche Paketkennung und feste Signatur.

## Seit 0.8.2 · Hintergrund ohne Trennlinie

Der wiederholte Rahmen der Platin-Hintergrundgrafik wurde aus dem sichtbaren Musterausschnitt entfernt. Helles und dunkles Design verwenden jetzt einen rahmenfreien Ausschnitt mit ganzen Musterperioden bei gleicher Skalierung. versionCode 14, unveränderte Paketkennung und feste Signatur.

## Seit 0.8.1 · Tagesbilanz mit Ist und Soll

Im Reiter **Essen**: Kalorienziel, gegessene Kalorien, Rest/Überschreitung, geschätzter Verbrauch und vorläufige bzw. abgeschlossene Bilanz. Eiweiß, Fett, Kohlenhydrate und Ballaststoffe jeweils mit Ist und Ziel/Planwert. Vitamine und Mineralstoffe stehen direkt darunter, nach Gruppen geordnet und mit Datenabdeckung. Die gesamte Bilanz öffnet sich auch von der Startseite über **Tagesbilanz**. Unbekannte Nährwerte werden nicht als echte Null ausgegeben.

[Details, Berechnung und Grenzen](docs/UPDATE-0.8.1.md). Bestehende Ziele bleiben erhalten. versionCode 13, gleiche feste Signatur.

## Seit 0.8.0 · Bedienfeedback & langfristige Trends

- **♪ Ton:** originale kurze Pokémon-Menüeffekte für Schaltflächen, Formularbestätigungen, Aufklappfelder und Auswahlen. Vibration und Effekte getrennt einstellbar, mit direktem Test. Bereits gespeicherte Stummschaltung bleibt erhalten; „Töne & Vibration einschalten“ aktiviert beides.
- **Trends:** eigener Reiter für 7/30 Tage, drei Monate, ein Jahr oder den gesamten gespeicherten Verlauf. Gewicht, Makros, vorhandene Mikronährstoffe, Schritte, Schlaf, Trinken, Training und Messwerte. Fehlende Daten bleiben Lücken; Tabellen machen alle Werte zugänglich.
- **Eigene Menümusik:** lokale Audiodatei bis 10 MB/5 Minuten wählen und anschließend als Musikstück übernehmen. Kein Upload, keine vollständigen Original-Soundtracks im APK. Die Datei wird separat gespeichert und gehört nicht zur JSON-Sicherung.
- Health-Connect-Tageskopien bleiben ab jetzt für bis zu 3660 erfasste Tage erhalten. Bereits früher entfernte Daten werden dadurch nicht wiederhergestellt.
- Musik läuft wie seit 0.7.2 bei Menüwechseln weiter. Gleiche Paketkennung und feste Signatur; versionCode 12.

Details und Grenzen: [Update 0.8.0](docs/UPDATE-0.8.md).

## Seit 0.7.2 · Musik ohne Menü-Unterbrechung

Musik und kurze Effekte verwenden jetzt dieselbe Audioausgabe. Die Musikschleife läuft unabhängig vom Seitenaufbau weiter; Reiterwechsel, Menüs und Lautstärkeänderungen starten sie nicht neu. Bei App-Pause wird die Position gespeichert und beim nächsten bewussten Tippen fortgesetzt. versionCode 11, bisherige Signatur.

## Seit 0.7.1 · FitDex

Neuer Name, vom Eigentümer bereitgestelltes App-Icon und überarbeiteter Kopfbereich mit **FitDex · Ernährung · Training · Abenteuer**. Das Icon erscheint im Android-Launcher, beim Einstieg und in der App. Die Tonsteuerung bleibt direkt erreichbar. Datenschutzinformationen sind in den Einstellungen zu finden.

Die interne Paketkennung, der lokale Speicher und der feste Signaturschlüssel bleiben erhalten: als Update über DiätFreund installieren. Alte Sicherungen und Health-Connect-Einträge bleiben kompatibel. APK-Dateien und neue Exporte tragen den Namen FitDex. versionCode 10.

## Seit 0.7.0 · Atmosphäre & flexibles Training

- Originale Pokémon-Platin-Kulissen für Team, Kämpfe und App-Hintergrund.
- Drei eigene Retro-Musikstücke und weitere kurze Originaleffekte, offline und getrennt regelbar über **♪ Ton**.
- Freie Einheiten mit 42 Übungen, Gerätefilter, eigenen Übungen, Satzgruppen, Zeitübungen und persönlichen Trainingsplänen.
- Optionaler privater Import für datiertes Gewicht und Wiedereinstieg; keine persönlichen Daten im Repository.

Details: [Update 0.7.0](docs/UPDATE-0.7.md), [Bild-/Tonquellen](docs/PLATINUM-ASSETS.json). Gleiche feste Signatur, versionCode 9.

## Seit 0.6.1 · Lebensmittel & persönlicher Plan

- **118 USDA-Lebensmittel offline:** deutsch beschriftet, roh/gekocht getrennt, Energie/Makros und vorhandene Mikronährstoffe. Nachvollziehbare FDC-Quellen; keine API-Kosten. Markenprodukte weiterhin über Open Food Facts.
- **Persönlicher Alltag:** normales Fahrrad und E-Bike, Gesamtstrecke am Arbeitstag, Schrittzielbereich und Muskelaufbau. Geplante Bewegung wird nicht als bereits geleistete Aktivität verrechnet.
- **Private Profildatei:** Vorschau und gezielte Übernahme bestätigter Einstellungen; Tagebuch, Gewichte, Kalorienziel und Pokémon bleiben erhalten. Persönliche Daten gehören nicht in dieses Repository.

Details: [Update 0.6.1](docs/UPDATE-0.6.1.md), [USDA-Herkunft](docs/USDA-DATA.json). Gleiche feste Signatur, versionCode 8.

## Seit 0.6.0 · Dein Trainer-Tagebuch

- **Gesamte App im Gen-IV-Stil:** Originalsprites, Menüicons und Umgebung aus HeartGold/SoulSilver, passende Touchflächen, Dialoge und Hell-/Dunkelmodus. Die Inhalte bleiben Kanto + Johto, insgesamt 251 Pokémon.
- **Klarere Wege:** Heute · Essen · Training · Reise · Profil. Tages-Check-in an einem Ort; Ziele und Voraussetzungen im Profil, Messwerte separat. Seltenere Essen-Werkzeuge sind zusammengefasst.
- **Sichtbarer Fortschritt:** Begleiter/Level/EP auf den Hauptseiten, bleibender Trainerpass und eigene Rückmeldungen für neue EP, Fänge, Entwicklungen und Orden. Weiterhin drei Routinen insgesamt, Erholung gleichwertig, keine Verluste bei Pausen.
- **Nährwerttabelle fotografieren:** lokale Offline-OCR mit Kamera-/Fotoauswahl und Ausschnitt. Erkannte Energie- und Makrowerte prüfen, Bezugsmenge/Spalte bestätigen, Portion eintragen. Kein Foto-Upload oder KI-Abo. Unsichere Angaben werden nicht still erfunden.
- **Barcode mit einem Tippen:** Kamera direkt öffnen, bekannte Produkte offline wiederverwenden; bei fehlenden Daten Foto oder manuelle Eingabe.
- **Schrittimport überarbeitet:** Tagesaggregation statt vieler Einzelabfragen, getrennte Fehlerbehandlung für Schritte/Schlaf/Gewicht, sofortiger Abgleich nach Freigabe und beim Zurückkehren. Verständliche Verbindungsdiagnose. Der tatsächliche Samsung-Import muss auf dem Gerät geprüft werden.

Details und Grenzen: [Update 0.6](docs/UPDATE-0.6.md). Identische Release-Signatur; versionCode 7. Über die signierte vorherige Version installieren, nicht deinstallieren.

## Seit 0.5.0 · Johto & gespeicherte Mahlzeiten

- **Johto ist spielbar:** 100 zusätzliche Pokémon mit deutschen Namen und offline gebündelten Originalsprites. Zusammen 251 im nationalen Pokédex, mit Regionsfilter.
- **Eine eigene Reise:** 20 Stationen, Professor Lind, Rivale Silber, acht Johto-Arenen und fünf Liga-Begegnungen; besondere Bedingungen für Raikou, Entei, Suicune, Lugia, Ho-Oh und Celebi.
- **Reisen ohne Neustart:** Johto öffnet sich nach dem ersten Kanto-Orden. Ein neuer Starter kommt dazu; Team, Kanto-Orden, Forschung und Freundschaft bleiben erhalten. Neue Punkte zählen nur für die aktive Region, insgesamt weiter höchstens drei Aufgaben täglich.
- **Mahlzeiten wiederverwenden:** komplette Mahlzeit aus dem Tagebuch benennen und speichern; später Datum, Frühstück/Mittag/Abend/Snack, Portionsfaktor und einzelne Mengen vor dem Eintragen prüfen. Vorschau zeigt Energie und Makros. Umbenennen und Entfernen ändern keine alten Einträge.
- **Verlässliche Daten:** Nährwerte und Quellen werden mitgespeichert; unbekannte Mikronährstoffe bleiben unbekannt. Vorlagen sind in JSON-Sicherungen enthalten. Alte Sicherungen bleiben lesbar.
- **Update:** gleiche feste Release-Signatur und Paketkennung, versionCode 6. Über die signierte 0.4.1 installieren, vorher nicht deinstallieren; eine aktuelle JSON-Sicherung bleibt empfehlenswert.

Details: [Johto und Regionsfortschritt](docs/JOHTO.md), [Mahlzeiten](docs/MEAL-TEMPLATES.md).

## Seit 0.4.1 · Dauerhafte Signatur

Fester Zertifikatsfingerabdruck, separater Signierjob nach allen Prüfungen, private Secrets statt Schlüssel im Quellcode und getrenntes Entwicklungspaket. [Einrichtung und Sicherung](docs/SIGNING.md).

## Seit 0.4.0 · Forschung & Health Connect

- **Langfristiger Fortschritt:** wiederholbare Forschungsreisen ohne Zeitlimit, Forschungsrang, Freundschaft je Begleiter und fünf freischaltbare Kulissen. Alles aus denselben höchstens drei täglichen Routinen; keine Zusatzpflichten, keine Strafe bei Pausen.
- **Weitere Generationen vorbereitet:** eigenes Regionsregister und getrennte Karrieredaten. Kanto bleibt erhalten. Johto ist seit 0.5 spielbar. Hoenn und Sinnoh bleiben Erweiterungsziele ohne angekündigten Termin.
- **Samsung Health über Health Connect:** optional Schritte, Schlafdauer und Gewicht der letzten 30 Tage lesen. Einmalig oder beim Öffnen, ausschließlich nach Freigabe. Keine Hintergrundabfrage, keine neue Sensorzählung und kein automatisches Kalorienguthaben für Schritte.
- **Gewichte teilen:** bis zu 30 eigene Einträge nach Vorschau und ausdrücklichem Senden an Health Connect. Lesefreigabe für die empfangende App separat erteilen. Importierte Gewichte werden nicht zurückgeschrieben, manuelle Gewichte bleiben vorrangig.
- **Einrichtung und Grenzen:** [Health Connect](docs/HEALTH-CONNECT.md). Android 9+ für die Anbindung, Android 14+ mit integrierter Plattform; ältere unterstützte Geräte benötigen die Health-Connect-App. Reale Geräteabnahme steht aus.

## Seit 0.3.0 · Kanto

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
- **Lebensmittel:** 118 deutsch beschriftete USDA-Datensätze, ergänzende gekennzeichnete Orientierungswerte, eigene Packungsangaben, Barcode-Kamera sowie manuelle EAN-/UPC-Abfrage bei Open Food Facts. Neue Produktwerte müssen vor dem Speichern bestätigt werden. Gespeicherte Produkte sind offline verfügbar.
- **Rezepte:** Zutaten mit Mengen, tatsächliches Endgewicht nach Zubereitung, beliebige Grammportionen. Rezepte bleiben als wiederverwendbare Lebensmittel gespeichert.
- **Verlauf:** Gewicht, 7-Kalendertage-Mittel, Zielverlauf und Wochenübersicht. Keine Behauptung, Fett- oder Muskelmasse messen zu können.
- **Training:** allgemeine Ganzkörpervorlagen für Gym und Zuhause, eigene Übungen, editierbare Sätze/Last/Wiederholungen, 90-Sekunden-Pausentimer, Wiederaufnahme nach App-Neustart, Trainingshistorie und manuelle Aktivitäten. Nur tatsächlich abgehakte Sätze werden abgeschlossen.
- **Gesundheit:** freiwilliges Journal für Schlaf, Schritte, Bauchumfang, Blutdruck, Puls und Notizen. Keine Diagnosen oder Alarmüberwachung.
- **Daten:** atomare Speicherung im privaten Android-App-Verzeichnis, JSON-Sicherung/Wiederherstellung mit Schema-Prüfung, CSV-Export, komplette lokale Löschung. Helles und dunkles Design.

## Bewusste Grenzen

Kein eigener Sensor-Schrittzähler, kein direkter Wearable-Zugriff, keine Hintergrundbenachrichtigungen, kein Cloud-Sync, keine Kalorienschätzung von Tellerfotos, keine medizinische Auswertung. Barcode-Daten brauchen Internet; Kernfunktionen nicht. Kein eigener PIN-/Biometrieschutz, keine zusätzliche Datenbankverschlüsselung: Gerätesperre verwenden. Sicherungen enthalten Gesundheitsdaten **unverschlüsselt**. App-Deinstallation löscht lokale Daten.

Das ist eine erste Implementierung und kein behauptet perfektes oder medizinisch validiertes Produkt. Android-Gerätetests für Kamera, Dateidialoge, Prozesswiederherstellung und Bedienhilfen sind vor einer öffentlichen Veröffentlichung erforderlich. Details: [Testplan](docs/TESTING.md), [Entscheidungen](docs/PRODUCT.md), [Datenschutz](docs/PRIVACY.md), [Quellen und Lizenzen](docs/SOURCES.md).

## Entwickeln und prüfen

Keine Node-Abhängigkeiten für App oder Berechnungstests:

```sh
npm run check
npm test
npm run serve
# Browser: http://localhost:4173
```

Android Studio: Projekt öffnen, Gradle 8.11.1 / Java 17 wählen, SDK 36 installieren. Alternativ mit installiertem Gradle 8.11.1:

```sh
gradle :app:assembleDebug :app:lintDebug
```

Der CI-Workflow installiert die Build-Werkzeuge und erstellt den APK. Ein Gradle Wrapper ist noch nicht eingecheckt; `gradle wrapper --gradle-version 8.11.1` erzeugt ihn in einer eingerichteten Entwicklungsumgebung.

## Architektur

Java/Kotlin + AndroidX: sicherer WebViewAssetLoader, lokal gebündelte HTML/CSS/ES-Module, kontrollierte JavaScript-Bridge, Android Storage Access Framework für Exporte/Importe, ZXing für Kamera-Barcodes. Keine Webseite wird innerhalb der Bridge-WebView geöffnet. Nur der feste Open-Food-Facts-Produktendpunkt ist als externe Datenquelle erlaubt. CSP blockiert Fremdskripte und Frames.

`core.js` enthält Berechnung und Schema-Validierung; `coach.js` die erklärbare Anpassungslogik, `micros.js` Referenzwerte und Datenabdeckung, `game.js` den unabhängig testbaren Spielkreislauf. `app.js` bündelt Ansichten und atomare Transaktionen. Fehlgeschlagene Speicherung übernimmt keinen neuen In-Memory-Zustand. Trainingsänderungen und Tagebucheinträge werden sofort persistiert. Android-Backup und Geräteübertragung sind deaktiviert. Im lokalen Desktop-Test ersetzt Browser-localStorage den Android-Dateispeicher.

## Kosten

Die App verlangt weder Bezahlung noch API-Schlüssel. Es gibt keinen kostenpflichtigen Server. Open Food Facts ist ein unabhängiger Dienst ohne zugesicherte Verfügbarkeit; manuelle/offline Erfassung bleibt möglich. GitHub- und eventuelle spätere Store-/Hosting-Kosten hängen vom jeweiligen Konto und Vertriebsweg ab; es wird kein kostenpflichtiger Dienst eingerichtet.
