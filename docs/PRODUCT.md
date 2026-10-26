# Produktentscheidungen

DiätFreund unterstützt nachhaltige Gewichtsabnahme und den Wiedereinstieg ins Krafttraining. Die App reduziert Eingabeaufwand, statt möglichst viele Zahlen auf einen Bildschirm zu setzen.

## Orientierung an bestehenden Produkten

- **YAZIO:** klarer Tagesüberblick, Mahlzeitenstruktur, direkt anpassbare Ziele. Eigene grüne/cremefarbene Gestaltung, keine kopierten Assets.
- **Cronometer:** Makronährstoffe, wiederverwendbare Lebensmittel und Rezepte, frei zugängliche Barcode-Erfassung.
- **Hevy:** einfache Satzprotokolle, Routinen, individuelle Übungen und Pausenzeit.

Keine Übernahme fremder Inhalte, Datenbanken, Screenshots, Logos, Textpassagen oder kostenpflichtiger Schnittstellen. Quellen in SOURCES.md.

## Gesundheit und Ziele

Profil und Ziele werden bei Einrichtung lokal eingegeben. Nicht ohne Bestätigung aus Chatkontext in ein öffentliches Repository übernehmen. Die grobe Energieformel ist optional; manuelle Ziele sind möglich. Tagesziel-Untergrenze 1500 kcal ist eine Produktbeschränkung, keine Aussage, dass dieser Wert für jeden ausreichend wäre. Untergewichtige Zielwerte werden bei Einrichtung abgelehnt. Protein- und Trinkziele werden vom Nutzer gesetzt, nicht aus Erkrankungen abgeleitet. Keine automatischen Defizitanpassungen und keine doppelte Anrechnung von Sportkalorien.

Trend: Mittel vorhandener Messungen innerhalb von sieben lokalen Kalendertagen, fehlende Tage nicht ergänzt. Rohwerte bleiben sichtbar. Gewichtsveränderung ist kein Messwert für Körperfett oder Muskelaufbau.

Training: zwei optionale allgemeine Einstiegsvorlagen. Lasten starten bei 0 kg, damit keine individuelle Leistungsfähigkeit vorausgesetzt wird. Erholung, Atemführung und kontrollierte Bewegung werden erklärt. Medizinische Belastungsfreigabe ersetzt die App nicht.

## Nächste Ausbaustufen

1. Echtes Android-Gerät: Installation, Kamera/Permission, SAF, TalkBack, große Systemschrift, Hintergrund/Prozesstod testen.
2. Privates stabiles Signaturzertifikat für konfliktfreie Updates; Release-Prozess dokumentieren.
3. Bearbeitbare Rezeptzutaten und Trainingspläne, Wochenplanung/Einkaufsliste, größere lizenzkonforme Offline-Lebensmitteldatenbank.
4. Optionale lokale Erinnerungen und Health Connect nur mit transparenten Einzelberechtigungen.
5. Optional Biometrie und verschlüsselte Backups; Wiederherstellung/Schlüsselverlust zuerst durchdenken.

Kein Anspruch, dass Roadmap-Funktionen bereits vorhanden sind. Der Pausentimer ist ein Vordergrundtimer, keine Hintergrundbenachrichtigung.

## Erklärbare Anpassung (0.2)

Keine kostenpflichtige KI: lokale transparente Regeln. Die optionale Mifflin-Schätzung nutzt Alter, letzte vergangene Gewichtsmessung, Größe, gewählte Formelgrundlage und Alltag einschließlich Sport. Die ±15-%-Spanne ist eine illustrative Orientierung, kein validiertes Konfidenzintervall.

Der Rückblick umfasst 21 abgeschlossene Kalendertage ohne heute. Vorschläge verlangen mindestens 18 ausdrücklich vollständige Esstage sowie mindestens je 3 Gewichtswerte in der ersten/letzten Woche. Gewichtsrate verwendet die tatsächlichen mittleren Messzeitpunkte. Eine grobe 7.700-kcal/kg-Näherung kombiniert Gewichtsrate mit erfasster Energie. Das ist keine Verbrauchsmessung; Wasserverschiebung, unvollständige Erfassung und Muskelveränderung können sie verzerren.

Anpassung höchstens ±100 kcal, frühestens 14 Tage nach einer Zieländerung, nur mit konkreter Vorschau und Bestätigung. Bei starkem Hunger, Erschöpfung, Schmerzen, besonderem medizinischen Ernährungsbedarf, schnellem Gewichtsverlust, Stillstand/Zunahme oder erreichtem Ziel keine weitere Defizitvorgabe. Produkt-Untergrenze 1500 kcal garantiert keine individuelle Eignung. Kein klinisch validierter Algorithmus.

Mikronährstoff-Referenzen nur für passende erwachsene Angaben, keine pauschalen Referenzen bei besonderem Ernährungsbedarf. Fehlende Daten nicht als null behandeln. Die Offline-Grundauswahl hat keine verifizierten Mikronährstoffangaben. Rezept-Mikronährwerte bleiben unbekannt, wenn eine Zutat keine Angaben hat. Nährstoffübersicht umfasst eine Auswahl von 12, nicht alle essenziellen Nährstoffe.

## Motivation durch Spiel (0.2)

Der ausdrücklich gewünschte Pokémon-Fan-Spielteil ist die Ausnahme zur ursprünglichen Beschränkung auf eigene Grafikassets. Fitness-App-Designs werden weiterhin nicht kopiert. Details und vereinfachte Regeln: GAME.md. Spielwerte sind vollständig von Energiebedarf und Gesundheitsauswertung getrennt. Keine automatische Kaloriensenkung oder Trainingssteigerung als Spielaufgabe.
