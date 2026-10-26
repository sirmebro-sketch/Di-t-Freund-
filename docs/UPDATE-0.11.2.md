# FitDex 0.11.2 · Foto-Nährwerte auswerten

## Korrekturen

- Die Auswertung toleriert Aufzählungszeichen und Bindestrich/Gedankenstrich vor Zeilenbezeichnungen, einschließlich Unterzeilen für Zucker und Fettsäuren. Ein allein stehendes „davon“ verhindert die Erkennung der folgenden Unterzeile nicht.
- Eine Ziffer 9 am Ende eines einheitenlosen Werts kann aus einem falsch erkannten Grammzeichen stammen. Beispiel mit synthetischen Daten: „Fett 189“ → **möglicherweise** 18 g; „Protein 6,79“ → **möglicherweise** 6,7 g. Diese Annahme wird nur als separater Vorschlag dargestellt. Der eigentliche Wert bleibt unbekannt, bis der Vorschlag ausdrücklich eingesetzt und die gesamte Vorschau mit der Packung verglichen/bestätigt wird. Erkannte echte „189 g“ werden nicht auf 18 g gekürzt. Nicht passende, widersprüchliche, negative oder Grenzwertangaben erzeugen keine solchen Korrekturvorschläge.
- Einheitenlose Zellen behalten ihre Spaltenposition. Bisher konnte das Herausfiltern einer solchen Zelle eine andere Grammangabe in die gewählte Spalte verschieben. Prozentangaben bleiben ausgeschlossen.
- Jede eingesetzte Korrektur und Änderung an Text, Spalte oder Bezugsmenge hebt das Prüfhäkchen auf. Text-/Spaltenänderungen erfordern vor der Übernahme ein erneutes Auslesen; alte Korrekturen werden dabei verworfen. Anschließend folgt weiterhin die Lebensmittelprüfung und erst danach die Portion.
- Fehlermeldungen verwenden deutsche Nährstoffnamen. Fehlende Nährwerte, insbesondere Ballaststoffe, bleiben unbekannt.

## Grenzen und Prüfung

Keine Änderung am lokalen Tesseract-Modell oder am Kameraablauf. Verbessert wird die Auswertung des erkannten Texts; dies garantiert keine richtige Erkennung jedes Fotos. Die tatsächliche Einheit und Menge müssen mit der Originalpackung verglichen werden. Salz wird weiterhin nicht in der OCR-Vorschau als eigenes Feld übernommen. Es wird kein automatischer Natriumwert daraus berechnet.

90 Unit-Tests, darunter neue Fälle für Aufzählungszeichen, Zeilenwechsel, g/9-Vorschläge, getrennte Spalten, Konflikte und Grenzwerte. Neuer Browserablauf `ocr-corrections-ui.mjs` mit simuliertem Android-Textrückruf, bewusster Vorschlagsübernahme, unverändert unbekannten Werten, Schutz vor veralteten Vorschlägen, Speicherung/Reload und Hell-/Dunkel-Prüfung bei 320/393 px. Zusammen 16 Browserprogramme im CI-Workflow. Zusätzliche bestehende OCR-/Nährwertabläufe bleiben Teil der Regression. Das ist kein physischer Kameratest.

Paketkennung und festes Zertifikat bleiben erhalten. versionCode 19. Keine Migration und keine Änderung bereits gespeicherter Lebensmittel oder Einträge; neue Auswertung nach dem Update erneut starten.
