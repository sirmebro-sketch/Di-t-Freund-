# Stand für die persönliche Nutzung · 0.3.0

Die App ist eine funktionsfähige persönliche Android-Testversion. Der Kern ist für tägliche manuelle Erfassung ausgelegt, nicht als klinisch validierter oder vollständig automatischer Gesundheitscoach.

| Bereich | Nutzbarer Stand | Grenze |
|---|---|---|
| Ernährung | Mahlzeiten, Portionen, Favoriten, letzte Portion, Rezepte, eigene Lebensmittel, Barcode, Makros | Kleine Offline-Grundauswahl; Barcode braucht Internet und Etikettkontrolle; keine Fotoerkennung |
| Gewicht | Einträge, gleitender Trend, Zielverlauf | Keine Messung von Körperfett/Muskelmasse |
| Personalisierung | Optionales Coach-Profil, Energie-Schätzung, 21-Tage-Auswertung, bestätigte Zielvorschläge | On-device Angaben erforderlich; keine Verbrauchsmessung, keine stille Kaloriensenkung |
| Nährstoffe | 12 Vitamine/Mineralstoffe mit Abdeckung und passenden Referenzen | Viele Lebensmittel haben keine Werte; keine vollständige Bedarfs- oder Mangelanalyse |
| Training | Gym-/Zuhause-Vorlagen, eigene Übungen, Satzprotokoll, letzte Lasten, Erholungshinweise | Keine individuelle ärztliche Belastungsfreigabe; kein vollständiger automatisch periodisierter Trainingsplan |
| Gesundheit | Manuelle Schritte, Schlaf, Blutdruck, Puls, Umfang und Notizen | Kein Health Connect, Wearable-Import, automatischer Schrittzähler oder medizinische Alarmierung |
| Motivation | Alle 151 Kanto-Pokémon, Entwicklung, Reise, acht Arenaorden, Liga, Sammelfortschritt | Vereinfachtes Fan-Spiel, kein Originalspiel-Remake |
| Daten | Privater lokaler Speicher, geprüfter Import, JSON-/CSV-Export | Sicherungen unverschlüsselt, keine Cloud-Synchronisierung, keine automatische Sicherungsplanung |

## Vor verlässlichem täglichem Einsatz auf dem eigenen Gerät prüfen

- Installieren und nach App-Neustart prüfen, ob ein Testeintrag erhalten bleibt.
- Barcode-Kamera mit erteilter und abgelehnter Berechtigung ausprobieren.
- Sicherung exportieren, aufbewahren und die Wiederherstellung mit Testdaten prüfen.
- Große Systemschrift/TalkBack nach Bedarf; Ton an/aus und App-Wechsel prüfen.

Noch keine reale Android-Geräteabnahme durch den Entwickler. Debug-Builds können verschiedene Signaturen haben: vor Update sichern; bei Signaturkonflikt nur nach erfolgreichem Export neu installieren und importieren. Ein fester privater Release-Signaturschlüssel bleibt Voraussetzung für dauerhaft komfortable Updates.

Keine persönlichen Daten aus dem Chat werden in das öffentliche Repository geschrieben. Profil und freiwillige Coach-Angaben werden auf dem Smartphone gesetzt. Die vom Nutzer gewünschte kostenlose lokale Architektur bleibt erhalten.
