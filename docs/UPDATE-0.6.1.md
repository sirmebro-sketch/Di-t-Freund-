# 0.6.1 · Offline-Lebensmittel und privates persönliches Profil

## USDA FoodData Central

118 ausgewählte, deutsch beschriftete Lebensmittel aus dem offiziellen SR-Legacy-Datensatz vom April 2018. Die Auswahl ist komplett im APK enthalten und benötigt weder Internet noch API-Schlüssel. Open Food Facts bleibt für aktuelle Markenprodukte per Barcode zuständig. Dies ist eine kuratierte Auswahl, nicht die vollständige USDA-Datenbank mit 7.793 Datensätzen oder eine Sammlung deutscher Markenprodukte.

Roh/trocken und gekocht/gegart sind getrennte Einträge. Alle USDA-Werte beziehen sich auf 100 g essbaren Anteil, auch Milch und Öle. Flüssigkeiten werden nicht ohne Dichte in Milliliter umgedeutet. Übersetzungen kennzeichnen angereicherte, zubereitete oder US-spezifische Varianten; Quark und Skyr werden nicht durch unpassende US-Produkte ersetzt.

Enthalten sind Energie, Protein, Fett, Ballaststoffe, eine Kohlenhydrat-Näherung sowie die 12 von der App unterstützten Mikronährstoffe, soweit vorhanden. Fehlende Angaben bleiben `null`, echte Quellenwerte von 0 bleiben 0. Jod fehlt in dieser Auswahl. Folat verwendet USDA-Nährstoff 1190 (DFE), Vitamin D 1114 in µg statt IU, Vitamin E 1109 (Alpha-Tocopherol). US-Kohlenhydrate nach Differenzmethode enthalten Ballaststoffe: angezeigt wird 1005 minus 1079, ausdrücklich als Näherung ohne Ballaststoffe. Energie bleibt der USDA-Quellenwert und wird nicht aus gerundeten Makros neu errechnet.

Provenienz: `docs/USDA-DATA.json` enthält Download-URL, SHA-256, FDC-IDs, Originalbeschreibungen und deutsche Namen. Reproduzierbar mit `python3 scripts/import-usda.py /path/to/official.zip`; ausschließlich das archivierte Original mit passendem Hash wird akzeptiert. Die Auswahl steht in `scripts/usda-selection.json`. USDA-Daten: Public Domain / CC0 1.0, https://fdc.nal.usda.gov/ und https://fdc.nal.usda.gov/download-datasets/.

Bisherige Standard-IDs und die früher verwendeten Namensschlüssel bleiben bestehen, damit Favoriten und gemerkte Portionen trotz präziserer Bezeichnungen erhalten bleiben. Bereits gespeicherte Mahlzeiten, Vorlagen und Rezepte enthalten ihre eigenen Nährwert-Snapshots und werden nicht neu berechnet. Neue Einträge verwenden die neue Quelle. Nicht ersetzte Orientierungswerte bleiben ausdrücklich gekennzeichnet.

## Persönliche Einstellungen

Ein optionales lokales Profil ergänzt Arbeitsweg (Fahrrad/E-Bike/gemischt), Gesamtstrecke pro Arbeitstag, später geplanten Wechsel, einen Schrittzielbereich und das Ziel Muskelaufbau. Angaben sind unter „Profil → Persönliche Voraussetzungen → Arbeitsweg & persönliche Ziele“ änderbar. Die App rechnet weder Wunschschritte noch Radstrecke automatisch als gemessene Aktivität oder zusätzliche Essenskalorien an. Ein geplanter E-Bike-Wechsel verändert den aktuellen Alltag nicht selbstständig.

„Profil → Profildatei laden“ verwendet denselben privaten Android-Dateiauswahldialog wie Sicherungen, unterscheidet aber einen separaten Dateityp `diaetfreund-personal-plan`, Version 1. Vor jeder Übernahme werden genau die betroffenen Werte angezeigt. Nur Größe, Zielgewicht, Berechnungsgrundlage, zwei Gesundheitsflags und die genannten Alltagsziele werden ergänzt. Tagebuch, Spielstand, Gewichte, Kalorienziel, ärztliche Belastungsfreigabe und Aktivitätsfaktor bleiben erhalten. Es wird kein aktuelles Gewicht, Geburtsdatum oder medizinischer Befund erfunden. Ohne Grundprofil muss dieses zuerst eingerichtet werden.

Gesundheitsflags gelten auch, wenn das vollständige Coach-Profil noch fehlt. Die spätere Coach-Einrichtung übernimmt sie als Vorgaben und lässt sie ändern. Persönliche Profildateien werden separat privat bereitgestellt und gehören nicht ins öffentliche Repository. Reguläre Sicherungen enthalten diese Angaben und müssen geschützt aufbewahrt werden. Keine neuen Netzwerkzugriffe durch den Profilimport.

## Validierung

Unit-Tests: eindeutige FDC-/Standard-IDs, Manifest-Prüfsumme, konkrete Apfel-Nährwerte und Einheiten, roh/gekocht, deutsche Suche, fehlende Werte, nicht destruktiver Profilimport, ungültige Eingaben und vorhandene Coach-Einstellungen.

Zusätzlicher Browser-Test `tests/catalogue-personal-ui.mjs`: Vorschau/Abbruch, simulierter Schreibfehler, Erhalt von Tagebuch und Favoriten, Coach-Bearbeitung, Lebensmittelsuche, Portion/Mikronährstoffe, Neuladen und automatisierte WCAG-Prüfung. Bestehende sieben Browser-Skripte bleiben erforderlich. Android-Release mit unveränderter Paketkennung und festem Zertifikat, versionCode 8. Die bestehende Grenze bleibt: reale Kamera, Samsung-Health-Datenfluss und Bedienung auf dem persönlichen Android-Gerät benötigen Gerätetests.
