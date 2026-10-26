# FitDex 0.8.1 · Tagesbilanz Ernährung

Im Reiter **Essen** stehen Kalorienziel und erfasste Kalorien, verbleibender Betrag bzw. Überschreitung, geschätzter Gesamtverbrauch und die vorzeichenrichtige Differenz (Zufuhr minus Verbrauch). Solange der Tag offen ist, heißt sie ausdrücklich „Vorläufiger Vergleich“. Leere Tage zeigen keine scheinbare Verbrauchsbilanz. Schritte und Trainingskalorien werden nicht nochmals auf den bereits aktivitätsbezogenen Modellverbrauch addiert.

Eiweiß, Fett, Kohlenhydrate und Ballaststoffe stehen in vier Karten mit Ist, Soll/Planwert, Einheit und Anteil. Kalorien und Eiweiß bleiben die bestehenden persönlichen Einstellungen. Für Erwachsene ohne besondere Ernährungsvorgaben werden Fett mit 30 % der Zielenergie und Kohlenhydrate als Restenergie nach Eiweiß/Fett geplant. Die Näherung verwendet 4/4/9 kcal pro Gramm und bildet weitere Energieträger nicht separat ab; Lebensmittelenergie wird weiterhin aus den gespeicherten kcal-Angaben summiert. Das ist eine transparente Planaufteilung, keine Messung des individuellen Bedarfs. Rechnerisch negative Kohlenhydratziele werden nicht ausgegeben. Ballaststoffe: DGE-Richtwert mindestens 30 g/Tag. Ohne geeignete Altersangaben oder bei nutritionCare bleiben automatische Planwerte aus.

**Vitamine & Mineralstoffe · Ist / Soll** ist direkt in der Bilanz aufklappbar. **Gesamte Nährstoffbilanz öffnen** zeigt alles gemeinsam, auch von der Startseite über **Tagesbilanz** erreichbar. Alle zwölf bereits unterstützten Mikronährstoffe sind nach Vitaminen und Mineralstoffen geordnet. Referenzen berücksichtigen die bereits vorhandenen Profilregeln. Kein pauschaler Wert wird bei ungeeigneten/fehlenden Angaben erfunden. Zink bleibt wegen Phytatabhängigkeit ohne festen Sollwert. Keine Analyse aller essenziellen Nährstoffe und keine Ableitung von Supplementdosen.

Unbekannt, bekannte Null und teilweise erfasste Zufuhr bleiben unterscheidbar. Teilwerte tragen ≥ sowie die Zahl der Einträge mit Angaben. Neue OFF-Produkte bewahren fehlende Ballaststoffangaben in einem optionalen `fiberKnown`-Feld; Rezeptberechnung und Sicherungsvalidierung erhalten diese Information. Bei älteren OFF-Nullwerten ohne Kennzeichnung lässt sich eine echte Null nicht von einer früheren Ersatznull unterscheiden; sie werden vorsichtig als unbekannt behandelt. Trends beachten diese Kennzeichnung ebenfalls. Die bisherigen numerischen Werte bleiben für alte Daten kompatibel.

Historische Tage zeigen ausdrücklich den Vergleich mit **aktuellen** Zielen/Profileinstellungen, da nicht für alle Ziele ein vollständiger historischer Verlauf vorliegt. Tageswechsel filtert ausschließlich die Einträge des gewählten Datums. Das Update ändert keine Ziele, Gesundheitsdaten oder Spielbelohnungen.

## Quellen, geprüft 26.10.2026

- https://www.dge.de/wissenschaft/referenzwerte/ballaststoffe/
- https://www.dge.de/wissenschaft/referenzwerte-tool/
- https://www.dge.de/blog/2023/fett-in-der-ernaehrung-fakten-rund-um-die-bedeutung-von-fett-fuer-den-koerper/
- Mikronährstoffquellen und bisherige Referenzregeln: `micros.js`, `docs/SOURCES.md`.

Version 0.8.1 / versionCode 13, gleiche Paketkennung und feste Signatur. Keine neuen Berechtigungen, Dienste oder Datenübertragungen.
