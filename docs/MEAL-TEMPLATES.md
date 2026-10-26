# Gespeicherte Mahlzeiten ab 0.5.0

1. Im Ernährungstagebuch eine Mahlzeit wie gewohnt erfassen.
2. Darunter „Als Mahlzeit speichern“ wählen und einen Namen vergeben.
3. „Gespeicherte Mahlzeiten“ öffnen, „Mengen prüfen & verwenden“ wählen.
4. Datum und Zielmahlzeit prüfen. Optional halbe, ganze, anderthalbe oder doppelte Portion wählen; einzelne Gramm-/Millilitermengen sind danach frei änderbar, auch mit Dezimalkomma.
5. Energie und Makros in der Vorschau prüfen und ausdrücklich „Ins Tagebuch eintragen“ wählen.

Jedes Lebensmittel bleibt ein eigener bearbeitbarer Tagebucheintrag. Eine Vorlage ist eine gespeicherte Kopie von Lebensmitteln, Quellen, Nährwerten und Mengen. Änderungen an einem Produkt oder einem alten Eintrag verändern bestehende Vorlagen nicht. Für eine neue Zusammensetzung erneut aus dem Tagebuch speichern; alte Vorlage nach Bedarf entfernen. Umbenennen und Entfernen einer Vorlage verändern keine Tagebucheinträge.

Bis zu 100 Vorlagen mit je 1–50 Lebensmitteln. Unbekannte Mikronährstoffe bleiben unbekannt. Ungültige Mengen verhindern den gesamten Eintrag; es gibt keine Teilbuchung. Neue Einträge öffnen einen zuvor abgeschlossenen Ernährungstag wieder. Das Spiel zählt weiterhin höchstens eine Ernährungsroutine pro Tag.

`mealTemplates` ist ein validiertes optionales Feld in Schema 2. JSON-Export/Import enthält die Vorlagen. Sicherungen früherer Versionen bleiben lesbar. CSV exportiert weiterhin die gebuchten Einträge, keine Vorlagensammlung. Alles funktioniert offline und ohne Konto.
