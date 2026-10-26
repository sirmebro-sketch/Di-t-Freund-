# 0.7.0 · Platin-Kulissen, Musik und freie Trainingseinheiten

## Gestaltung und Ton

Originale Kampf- und Box-Hintergründe aus Pokémon Platin ersetzen die selbst gezeichnete Team-Kulisse, rahmen die Team-Auswahl und strukturieren den App-Hintergrund. Opaque Leseflächen, heller/dunkler Modus und reduzierte Bewegung bleiben erhalten. Die vorhandenen HGSS-Sprites und Menüelemente bleiben eingebunden.

Über **♪ Ton** im Kopfbereich oder Profil → Darstellung lassen sich Musik und Effekte getrennt aktivieren und in der Lautstärke regeln. Drei eigene, offline erzeugte Retro-Kompositionen (Morgenroute, Abend am Wasser, Trainingsreise) begleiten die Nutzung. Es handelt sich ausdrücklich nicht um Original-Soundtrackaufnahmen. Vier kurze originale Diamant/Perl-Effekte ergänzen die vorhandenen Effekte: Treffer beim Kampf, Heilklang beim Abhaken/Testen, Rückruf beim Begleiterwechsel, Blasen beim Trinkeintrag. Kein zusätzlicher Spielpunkt wird dadurch vergeben.

Neue Installation startet stumm; vorhandene Effekt-Präferenz bleibt erhalten. Nach Neustart oder App-Wechsel beginnt Musik erst mit einer Berührung. Android-Audiofokus, App-Pause und Sichtbarkeitswechsel stoppen Audio. Quellen, Hashes und kurze Effektdauern stehen in [PLATINUM-ASSETS.json](PLATINUM-ASSETS.json). Vollständige Musikaufnahmen wurden nicht hinzugefügt.

## Training

- Freie Einheiten mit eigenem Namen; 42 auswählbare Übungen, Suche nach Name/Muskel/Gerät, sechs Gerätearten plus eigene Geräte/Übungen.
- Übungen hinzufügen, austauschen, entfernen und als ganze Satzgruppe verschieben; Sätze einzeln ergänzen/entfernen.
- Last und Wiederholungen je Satz; Unterarm-/Seitstütz mit Sekunden statt Wiederholungen. Kein automatisches Erhöhen von Belastungen.
- Eigene Pläne speichern, gezielt ersetzen, starten und löschen. Ein Planstart übernimmt Auswahl und Lasten, setzt alle Häkchen zurück und überschreibt keine laufende Einheit.
- Laufende Einheiten werden lokal gesichert. Beim Abschluss gehen nur abgehakte Sätze ins Journal. Bestehende Einheiten und Vorlagen bleiben lesbar.

## Persönliches Profil

Das private Importformat kann jetzt ausdrücklich bestätigtes Gewicht mit Datum und den Trainingsstand übernehmen. Die Vorschau benennt den betroffenen Tag; nur ein vorhandenes Gewicht desselben Tages wird ersetzt. Historie, ursprüngliches Startgewicht, Kalorienziel und Pokémon-Spielstand bleiben erhalten. Der Trainingsstand erteilt keine medizinische Freigabe. Persönliche Werte werden nicht mit dem Quellcode veröffentlicht.

Paketkennung und festes Signaturzertifikat bleiben unverändert, versionCode steigt auf 9. Signierte APK als Update installieren, nicht vorher deinstallieren. Eine vollständige Datensicherung vor dem Update ist sinnvoll.

## Prüfung

61 Domänentests, Syntaxprüfung aller 33 App-Module und neun Browser-Testprogramme einschließlich neuer Trainings-/Audioprüfungen. Neue Tests prüfen Gruppenumordnung, Vorlagen, Zeitübungen, Speicherung/Fehler, Import, 360-px-Layout, WCAG-A/AA-Prüfung, Audiopause/Fokuswechsel und tatsächliche Offline-Signalerzeugung aller Musikstücke. Der Release-Workflow baut und lintet Debug/Release und prüft die feste Signatur.

Eine echte Geräteabnahme von Android-Audiofokus (Telefonat/Bluetooth/App-Wechsel), Kamera und Samsung-Health-Abgleich steht weiterhin aus. Browserprüfungen ersetzen diese nicht.
