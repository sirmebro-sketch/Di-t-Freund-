# Stand für die persönliche Nutzung · 0.9.0

Die App ist eine funktionsfähige persönliche Android-Testversion. Der Kern ist für tägliche manuelle Erfassung ausgelegt, nicht als klinisch validierter oder vollständig automatischer Gesundheitscoach.

| Bereich | Nutzbarer Stand | Grenze |
|---|---|---|
| Ernährung | Lokale Nährwertfoto-OCR mit Prüfung, Mahlzeitenvorlagen mit Mengen-Vorschau, Portionen, Favoriten, letzte Portion, Rezepte, eigene Lebensmittel, Barcode, Makros | 118 deutsch beschriftete USDA-Lebensmittel, ergänzende Orientierungswerte; Barcode braucht Internet und Etikettkontrolle; keine Kalorienschätzung von Tellerfotos |
| Gewicht | Einträge, gleitender Trend, Zielverlauf | Keine Messung von Körperfett/Muskelmasse |
| Personalisierung | Optionales Coach-Profil, Energie-Schätzung, 21-Tage-Auswertung, bestätigte Zielvorschläge | On-device Angaben erforderlich; keine Verbrauchsmessung, keine stille Kaloriensenkung |
| Nährstoffe | 12 Vitamine/Mineralstoffe mit Abdeckung und passenden Referenzen | Viele Lebensmittel haben keine Werte; keine vollständige Bedarfs- oder Mangelanalyse |
| Training | Freie Einheiten, 42 Übungen/Gerätefilter, eigene Pläne, Satz-/Zeitprotokoll, Gym-/Zuhause-Vorlagen und Erholungshinweise | Keine individuelle ärztliche Belastungsfreigabe; kein vollständiger automatisch periodisierter Trainingsplan |
| Gesundheit | Manuelle Schritte, Schlaf, Blutdruck, Puls, Umfang und Notizen | Optional Health Connect für Schritte/Schlaf/Gewicht, eigene Gewichte teilen; keine eigene Sensorzählung oder medizinische Alarmierung |
| Motivation | 1.025 Grundarten mit Normal-/Shiny-Optik, drei Schritt-Brutplätze, Eier aus Erfolgen, Entwicklungen, zwei Reisen, 16 Arenaorden, zwei Ligen, Sammelfortschritt, Forschung, Freundschaft, Trainerpass und Kulissen | Reisen weiterhin nur Kanto/Johto; spätere Arten aus Eiern, keine Alternativformen. Vereinfachtes Fan-Spiel |
| Daten | Privater lokaler Speicher, geprüfter Import, JSON-/CSV-Export | Sicherungen unverschlüsselt, keine Cloud-Synchronisierung, keine automatische Sicherungsplanung |

## Vor verlässlichem täglichem Einsatz auf dem eigenen Gerät prüfen

- Installieren und nach App-Neustart prüfen, ob ein Testeintrag erhalten bleibt.
- Barcode-Kamera mit erteilter und abgelehnter Berechtigung ausprobieren.
- Sicherung exportieren, aufbewahren und die Wiederherstellung mit Testdaten prüfen.
- Health Connect mit Samsung Health: einzelne Freigaben erlauben/ablehnen, widerrufen, Daten einmal und wiederholt abgleichen, eigene Gewichte mit Vorschau teilen und auf Duplikate prüfen. Schrittzahlen gegen Samsung Health vergleichen; Verzögerungen sind möglich.
- Große Systemschrift/TalkBack nach Bedarf; Ton an/aus und App-Wechsel prüfen.

Noch keine reale Android-Geräteabnahme durch den Entwickler. Die feste Release-Signatur ist seit 0.4.1 eingerichtet und geprüft. 0.8.2 verwendet denselben Fingerabdruck und die gleiche Paketkennung; über die vorhandene signierte Version installieren, nicht vorher deinstallieren. Alte Debug-APKs erfordern gegebenenfalls den einmaligen Export-/Import-Umstieg: [Signierung](SIGNING.md).

Keine persönlichen Daten aus dem Chat werden in das öffentliche Repository geschrieben. Profil und freiwillige Coach-Angaben werden auf dem Smartphone gesetzt. Die vom Nutzer gewünschte kostenlose lokale Architektur bleibt erhalten.

Version 0.6 bündelt das Gen-IV-Design auch außerhalb des Spielteils. Kamera-/Fotoauswahl, Bildausschnitt und OCR auf echten Verpackungen sind zusätzliche ausstehende Gerätetests. Die gelesenen Schritte werden bei einem Fehler in anderen Datentypen nicht mehr verworfen; eine erfolgreiche Übernahme auf dem konkreten Samsung-Gerät ist noch nicht bestätigt.

Version 0.7 ergänzt Platin-Kulissen, vier kurze Effekte und drei eigene Retro-Musikstücke. Telefonat, Bluetooth und App-Wechsel auf dem Smartphone prüfen; Musik und Effekte lassen sich getrennt ausschalten.

Version 0.7.1 heißt FitDex. Paketkennung, Speicherformat, Health-Connect-Datensatzkennungen und Signatur bleiben absichtlich unverändert. Das neue adaptive Launcher-Icon nutzt unveränderte, vom Eigentümer bereitgestellte Bilddaten. Darstellung mit dem konkreten Samsung-Launcher auf dem Gerät prüfen.

Version 0.7.2 behebt konkurrierende Wiedergabewege für Musik und Menüeffekte. Ein Regressionstest prüft Reiter-/Menüwechsel, Lautstärkeänderung, Pausenposition, verweigerten Audiofokus, Stummschaltung und verspätete Effektdekodierung. Die tatsächliche Wiedergabe auf dem betroffenen Samsung-Gerät bleibt separat zu bestätigen.

Version 0.8.0 ergänzt zentrale Bedienungstöne, native Berührungsvibration, Langzeitdiagramme und lokalen Musikimport. Auf dem realen Smartphone bleiben Medienlautstärke, Android-Haptikeinstellung, Audio-Dateiauswahl und die unterbrechungsfreie Wiedergabe zu prüfen. Kein automatisierter Browser-Test belegt das tatsächliche Verhalten der Samsung-Hardware. Details: [Update 0.8.0](UPDATE-0.8.md).

Version 0.8.1 ergänzt die Tagesbilanz mit Zielvergleich und Datenabdeckung. Der angezeigte Verbrauch ist ein Modellwert, kein gemessener Tagesverbrauch. Frühe Tagesvergleiche sind vorläufig; historische Tage verwenden die aktuellen Profileinstellungen. Details: [Tagesbilanz](UPDATE-0.8.1.md).

Version 0.8.2 entfernt die Rahmenkante aus den gekachelten hellen/dunklen Platin-Hintergründen. Reine Darstellungskorrektur; gespeicherte Daten und Audioverhalten unverändert.
