# Samsung Health und Health Connect · 0.4

Die App liest optional Schritte, Schlafdauer und Gewicht. Health Connect ist eine lokale Android-Datendrehscheibe; Samsung Health und DiätFreund benötigen jeweils eigene Freigaben. Keine Abo-/API-Kosten. Android 9+ erforderlich; Android 14+ enthält Health Connect, Android 9–13 benötigen die separate App. Aktuelle Samsung-Health-Version verwenden.

## Einrichten

1. Samsung Health → Einstellungen → Health Connect. Für gewünschte Daten Schreiben erlauben. Für Gewichte aus DiätFreund zusätzlich Lesen erlauben.
2. DiätFreund → Schritte & Erholung → Verbinden. Datentypen auswählen, speichern und im Android-Dialog erlauben.
3. Samsung Health aktualisieren, danach in DiätFreund „Jetzt aktualisieren“. Galaxy-Watch-Daten müssen zuerst mit dem Telefon synchronisiert sein.
4. Optional „Beim Öffnen automatisch aktualisieren“ wählen. Abgleich nur im Vordergrund, höchstens alle fünf Minuten automatisch, keine Hintergrundabfrage.
5. Zum Teilen eigener Gewichte: Vorschau öffnen, Schreibrecht erlauben, danach ausdrücklich „Diese Gewichte jetzt senden“. Bis zu 30 eigene Tageswerte; nie importierte Werte zurückschreiben.

## Verhalten und Grenzen

- Die letzten 30 Kalendertage werden eingelesen. Schritte/Schlaf verwenden Health-Connect-Aggregate statt Addition sämtlicher Rohdatensätze. Health Connect bestimmt Datenprioritäten; keine garantierte Übereinstimmung in Echtzeit mit Samsung Health.
- Schlaf ist die aggregierte Sitzungsdauer innerhalb des lokalen Kalendertags, nicht ein diagnostischer Schlafwert oder automatisch die gesamte letzte Nacht. Über Mitternacht liegende Sitzungen können auf Tage verteilt werden.
- Fehlende Werte bleiben unbekannt; null Schritte ist ein tatsächlich gelieferter Nullwert. Bei teilweise abgelehnten Freigaben bleiben zuvor gelesene andere Typen erhalten. Bei Fehler bleibt der letzte erfolgreiche Stand erhalten.
- Importierte Gewichte ergänzen die Verlaufsauswertung. Eigene Tageswerte haben Vorrang. Herkunft ist sichtbar. Zurückziehen der Freigabe löscht bereits lokale Kopien nicht automatisch; dafür gibt es „Lokale Importkopien entfernen“.
- Wiederholtes Senden aktualisiert denselben eigenen Tageswert über eine stabile Client-ID. Da die App keine Messuhrzeit erfasst, wird 12 Uhr lokal verwendet, heute höchstens die aktuelle Uhrzeit. Lokale Löschungen löschen bereits exportierte Datensätze nicht; Health Connect bietet deren Verwaltung.
- Schritte erhöhen weder Kalorienziel noch Spielpunkte. Kein eigener Hardware-Schrittzähler, kein direkter Uhrenzugriff und kein vollständiger Export von Essen, Training oder allen Gesundheitsdaten.
- Standardmäßig sind alle Freigaben aus. JSON-Sicherung enthält die lokalen Importkopien, CSV nur die eigenen Journalwerte. Cache begrenzt auf 366 Schritt-/Schlaftage und 5000 Gewichtsimporte.

## Noch auf dem Gerät zu prüfen

Android 9–13 und 14+; fehlender Anbieter, Teilfreigabe, Widerruf, erneute Freigabe, App-Neustart, Uhrzeit-/Zeitzonenwechsel, unterbrochener Sync, wiederholter Gewichtsexport, Löschung in Quell-App, Samsung-Health-Empfang. Browser-Bridge-Tests simulieren diese Antworten; sie ersetzen keine echte Geräteprüfung. Für Store-Distribution wären zusätzlich die dortigen Health-Connect-Deklarationen nötig.

Offizielle Grundlagen (abgerufen 26.10.2026):
- https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect
- https://developer.android.com/health-and-fitness/health-connect/get-started
- https://developer.android.com/health-and-fitness/health-connect/aggregate-data
- https://developer.android.com/health-and-fitness/health-connect/write-data


## Fehlerdiagnose ab 0.6

Nach einer Freigabe wird sofort gelesen. Bei „Jetzt aktualisieren“ werden bereits extern erteilte Freigaben erkannt, auch wenn die alte App-Auswahl leer war. Beim Zurückkehren aus Samsung Health/Android-Einstellungen gibt es einen nativen Vordergrund-Hook; automatische Abfragen bleiben auf mindestens fünf Minuten Abstand begrenzt.

Schritte und Schlaf werden je Datentyp als lokale Kalendertage aggregiert. Dadurch entfallen bis zu 60 Einzelabfragen; ein Schlaffehler verwirft keine erfolgreichen Schritte. Die Aggregation verwendet die Quellenpriorität von Health Connect, keine rohe Addition möglicherweise überlappender Telefon-/Uhrdaten. Die Verbindungsansicht nennt gelieferte Schrittquellen, fehlende Freigaben oder leere Ergebnisse.

Wenn weiterhin keine Schritte erscheinen: Samsung Health öffnen, dort Schreiben von Schritten erlauben; in Health Connect unter Daten → Aktivität → Schritte prüfen, ob für heute tatsächlich Einträge vorhanden sind. DiätFreund muss Schritte lesen dürfen. Danach in DiätFreund aktualisieren. Die App kann den Export von Samsung Health nicht erzwingen. Alte importierte Werte bleiben bei einem Lesefehler erhalten und tragen weiterhin ihren alten Abgleichzeitpunkt.
