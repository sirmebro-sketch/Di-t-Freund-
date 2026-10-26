# Stand für die persönliche Nutzung · 0.5.0

Die App ist eine funktionsfähige persönliche Android-Testversion. Der Kern ist für tägliche manuelle Erfassung ausgelegt, nicht als klinisch validierter oder vollständig automatischer Gesundheitscoach.

| Bereich | Nutzbarer Stand | Grenze |
|---|---|---|
| Ernährung | Mahlzeitenvorlagen mit Mengen-Vorschau, Portionen, Favoriten, letzte Portion, Rezepte, eigene Lebensmittel, Barcode, Makros | Kleine Offline-Grundauswahl; Barcode braucht Internet und Etikettkontrolle; keine Fotoerkennung |
| Gewicht | Einträge, gleitender Trend, Zielverlauf | Keine Messung von Körperfett/Muskelmasse |
| Personalisierung | Optionales Coach-Profil, Energie-Schätzung, 21-Tage-Auswertung, bestätigte Zielvorschläge | On-device Angaben erforderlich; keine Verbrauchsmessung, keine stille Kaloriensenkung |
| Nährstoffe | 12 Vitamine/Mineralstoffe mit Abdeckung und passenden Referenzen | Viele Lebensmittel haben keine Werte; keine vollständige Bedarfs- oder Mangelanalyse |
| Training | Gym-/Zuhause-Vorlagen, eigene Übungen, Satzprotokoll, letzte Lasten, Erholungshinweise | Keine individuelle ärztliche Belastungsfreigabe; kein vollständiger automatisch periodisierter Trainingsplan |
| Gesundheit | Manuelle Schritte, Schlaf, Blutdruck, Puls, Umfang und Notizen | Optional Health Connect für Schritte/Schlaf/Gewicht, eigene Gewichte teilen; keine eigene Sensorzählung oder medizinische Alarmierung |
| Motivation | 251 Pokémon aus Kanto und Johto, Entwicklungen, zwei Reisen, 16 Arenaorden, zwei Ligen, Sammelfortschritt, Forschung, Freundschaft und Kulissen | Vereinfachtes Fan-Spiel, kein Originalspiel-Remake |
| Daten | Privater lokaler Speicher, geprüfter Import, JSON-/CSV-Export | Sicherungen unverschlüsselt, keine Cloud-Synchronisierung, keine automatische Sicherungsplanung |

## Vor verlässlichem täglichem Einsatz auf dem eigenen Gerät prüfen

- Installieren und nach App-Neustart prüfen, ob ein Testeintrag erhalten bleibt.
- Barcode-Kamera mit erteilter und abgelehnter Berechtigung ausprobieren.
- Sicherung exportieren, aufbewahren und die Wiederherstellung mit Testdaten prüfen.
- Health Connect mit Samsung Health: einzelne Freigaben erlauben/ablehnen, widerrufen, Daten einmal und wiederholt abgleichen, eigene Gewichte mit Vorschau teilen und auf Duplikate prüfen. Schrittzahlen gegen Samsung Health vergleichen; Verzögerungen sind möglich.
- Große Systemschrift/TalkBack nach Bedarf; Ton an/aus und App-Wechsel prüfen.

Noch keine reale Android-Geräteabnahme durch den Entwickler. Die feste Release-Signatur ist seit 0.4.1 eingerichtet und geprüft. 0.5.0 verwendet denselben Fingerabdruck und die gleiche Paketkennung; über eine signierte 0.4.1 installieren, nicht vorher deinstallieren. Alte Debug-APKs erfordern gegebenenfalls den einmaligen Export-/Import-Umstieg: [Signierung](SIGNING.md).

Keine persönlichen Daten aus dem Chat werden in das öffentliche Repository geschrieben. Profil und freiwillige Coach-Angaben werden auf dem Smartphone gesetzt. Die vom Nutzer gewünschte kostenlose lokale Architektur bleibt erhalten.
