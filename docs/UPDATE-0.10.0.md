# FitDex 0.10.0 · Zucker, Fettarten und Qualitätsdurchgang

## Neue Nährwertdetails

Kohlenhydrate erhalten den Unterwert „davon Zucker“. Fett wird nach gesättigten, einfach ungesättigten, mehrfach ungesättigten Fettsäuren und Transfettsäuren aufgeschlüsselt. Alle Werte gelten pro 100 g/ml und werden proportional zur Portion gerechnet. Unterwerte werden nicht nochmals zu Kalorien oder Makros addiert.

Erfassung über eigene Angaben, Open Food Facts und lokale Nährwertfoto-OCR. Der vorhandene Offline-Katalog mit 118 USDA-Lebensmitteln enthält jetzt die im gleichen geprüften SR-Legacy-Archiv verfügbaren Unterwerte. Quelle, FDC-IDs und Prüfsummen bleiben dokumentiert. Neue Daten werden nicht rückwirkend in frühere Tagebucheinträge geschrieben.

Werte erscheinen in der Portionsvorschau, Tagesbilanz, vollständigen Bilanz, als eigene Trendmessgrößen und in JSON-/CSV-Exporten. Im normalen Tagebuch sind die Fettarten aufklappbar, in der vollständigen Bilanz geöffnet. Auf sehr schmalen Bildschirmen stehen die Makrokarten untereinander.

Optionales Feld leer/null/fehlend bedeutet unbekannt; eine eingetragene Null bleibt eine echte Null. Teilweise bekannte Tagesmengen erhalten „≥“ und eine Datenabdeckung. Bei Rezepten gilt ein Unterwert nur dann als vollständig bekannt, wenn alle Zutaten ihn besitzen. Vorlagen erhalten diese Angaben und die Ballaststoff-Kennzeichnung. Es gibt keine nachträgliche Schätzung fehlender Werte.

„Nährwerte ergänzen / korrigieren“ in der Portion erlaubt die gezielte Korrektur: Ein eigener gespeicherter Katalogeintrag wird für künftige Portionen aktualisiert; eine Tagebuchkorrektur betrifft genau den gewählten Eintrag und öffnet einen zuvor abgeschlossenen Tag wieder. Frühere Portionen und gespeicherte Mahlzeiten bleiben eigenständige Momentaufnahmen. Bei Offline-Katalogeinträgen wird eine eigene Variante angelegt. Speichern bleibt atomar.

## Inhaltliche Abgrenzung

Zucker bedeutet Gesamtzucker laut Quelle, einschließlich natürlich enthaltenem Zucker. Daraus wird weder zugesetzter noch freier Zucker berechnet. Deshalb kein aus einem Freizucker-Richtwert abgeleitetes falsches Budget für Gesamtzucker. Fett-Unterarten bekommen kein automatisch erfundenes persönliches Soll. Fettsäuren müssen in Summe nicht exakt Gesamtfett ergeben; Transfettsäuren nicht erneut auf andere Kategorien addieren. Auffällige Unterwerte oberhalb der Gesamtangabe werden in der Portion zur Quellen-/Rundungsprüfung markiert.

## Im Qualitätsdurchgang korrigiert

- Mahlzeitenvorlagen verloren bisher `fiberKnown`; unbekannte Ballaststoffe konnten dadurch später als bekannte Null erscheinen.
- Eigene Erfassung und Fotoübernahme setzten fehlende Ballaststoffe auf Null. Das Eingabefeld ist jetzt optional und erhält die Unbekannt-Kennzeichnung.
- OCR konnte bei drei widersprüchlichen Vorkommen einen zuvor verworfenen Wert wieder einsetzen. Ein widersprüchliches/unsicheres Feld bleibt nun ungefüllt.
- OFF-Energie-Fallback berücksichtigt explizite kJ-Felder und die kcal-Einheit; leere Pflichtmakros werden abgewiesen.
- Sicherungen mit doppelten Tagebuch-, Lebensmittel-, Gesundheits- oder Trainings-IDs werden abgewiesen, damit Änderungen/Löschungen nicht mehrere Datensätze treffen.
- Fehler während einer Zustandsänderung werden ebenfalls von der atomaren Speicherbehandlung abgefangen.
- Kalorienbilanz ohne berechenbaren Verbrauch konnte bei 393 px seitlich überlaufen; Budgetzeilen umbrechen jetzt sauber.
- Beim Wechsel hell/dunkel wechselte die Schrift sofort, der Schaltflächenhintergrund aber verzögert. Farben wechseln nun gemeinsam; das vermeidet kurzzeitig schlechten Kontrast.
- Mahlzeitenaktionen standen ohne Abstand direkt aneinander. Sie haben jetzt getrennte Berührungsflächen und umbrechen auf kleinen Displays.
- Belohnungsmeldungen teilen sich einen Ablauf-Timer. Ein alter Routine-Timer kann eine neue Ei-/Schlupfmeldung nicht mehr frühzeitig ausblenden.
- CSV gab zeitbasierte Trainingssätze als Wiederholungen aus. Nun stehen dort Sekunden; die fünf neuen Nährwertspalten und unbekannte Ballaststoffe werden korrekt exportiert.

## Prüfung und Grenzen

Domänentests und Browserabläufe decken Profil/Onboarding, Essen/Rezepte/Vorlagen/OCR/Barcode, Ziele/Bilanzen/Trends, Gewichte/Gesundheitsdaten, Training, Health Connect, Abenteuer/Eier/Shinys, Audio, Navigation, Speicherung und Sicherungen ab. Neue Eingaben und Bilanzansichten werden bei 320/393/1280 px sowie hell/dunkel geprüft. Das ist keine Garantie vollständiger Fehlerfreiheit oder eine vollständige Barrierefreiheitszertifizierung.

Native Kamera, tatsächliche Samsung-Health-Lieferung und Gerätevibration bleiben Hardwareprüfungen. Die Browser verwenden simulierte Android-Schnittstellen. Paketkennung und fester Signaturschlüssel bleiben erhalten; versionCode 16.

## Quellen

- [Open Food Facts – API-Felder](https://wiki.openfoodfacts.org/API_Fields)
- [USDA – Foundation Foods Documentation](https://fdc.nal.usda.gov/Foundation_Foods_Documentation/)
- [USDA SR Legacy April 2018](https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_json_2018-04.zip); Archiv- und Ausgabedigest: `USDA-DATA.json`.
- [WHO – Sugars Factsheet](https://cdn.who.int/media/docs/librariesprovider2/euro-health-topics/obesity/sugars-factsheet.pdf)

USDA-Nährstoff-IDs: Zucker 2000, gesättigte Fettsäuren 1258, einfach ungesättigte 1292, mehrfach ungesättigte 1293, Transfettsäuren 1257. Fehlende Analysen bleiben null.
