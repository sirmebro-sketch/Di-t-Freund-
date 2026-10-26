# FitDex 0.11.3 · Eindeutige Schrittquelle

## Ursache und Verhalten

Bislang las die native Bridge einen von Health Connect aggregierten Tageswert ohne Quellenfilter. Darin können neben Samsung Health auch die Health-Connect-eigene Handyquelle und weitere freigegebene Quellen berücksichtigt werden. Das ist nicht zwangsläufig eine doppelte Addition: Health Connect aggregiert nach seinen Quellenprioritäten. Der Wert muss aber nicht mit der Anzeige in Samsung Health identisch sein. Die bisherige Quellenliste umfasste bis zu 30 Tage, nicht nur den aktuellen Tag.

- **Standard jetzt „Nur Samsung Health“:** `AggregateGroupByPeriodRequest` für `StepsRecord.COUNT_TOTAL` erhält `dataOriginFilter = setOf(DataOrigin("com.sec.android.app.shealth"))`. Gilt auch für vorhandene Einstellungen ohne bisherige Quellenauswahl. Schlaf-/Gewichtsabfragen bleiben unverändert.
- **Optional „Health Connect · Gesamtwert“:** ausdrücklich unter Profil → Samsung Health / Schritte auswählen und mit „Auswahl speichern & Zugriff erlauben“ speichern. Kein heimlicher Rückfall auf den Gesamtwert, wenn Samsung keine Daten liefert.
- Der heutige Schrittwert und sein tatsächlicher Schritt-Abgleichzeitpunkt sind beschriftet. Noch nicht neu geladene alte Werte bleiben als Gesamtwert gekennzeichnet. Fehlgeschlagene Lesevorgänge bewahren die bisherigen Daten; ein erfolgreicher leerer Samsung-Abgleich ergibt „unbekannt“, nicht die alte höhere Summe oder erfundene 0.
- Quellenliste heißt nun „Quellen im Abgleich (bis zu 30 Tage)“. Die lange Health-Connect-Handykennung wird als „Handy-Schrittzähler (Health Connect)“ angezeigt; sonstige lange Kennungen umbrechen innerhalb des Dialogs.
- Der Import ersetzt die erfolgreichen Datentypen im 30-Tage-Fenster, addiert sie nicht. Ältere Verlaufseinträge bleiben erhalten und werden nicht nachträglich als Samsung-Werte umgedeutet. In Trends haben bewusst manuell erfasste Schritte weiterhin Vorrang; sie werden nicht addiert.

## Brutstation

Ein Quellenwechsel bedeutet einen anderen Zähler, keine neu gegangene Strecke. Die Brutstation setzt dafür neue Vergleichswerte und erhält ihre bisherige Entfernung, Eier und Fortschritte. Auch zuerst fehlende und später nachgelieferte Werte bis einschließlich Wechseltag bilden beim ersten Auftauchen nur eine Ausgangsbasis. Anschließende Zuwächse zählen normal; wiederholte oder nach unten korrigierte Werte bringen keine doppelten Schritte. Fehlgeschlagene Schritte-Abfragen und reine Schlaf-/Gewichtsimporte ändern die Quelle der Brutstation nicht.

## Grenzen / Prüfung

Die App liest weiterhin die Samsung-Daten **in Health Connect**, nicht direkt den Bildschirm von Samsung Health. Verzögerte Watch-/Handy-Synchronisierung, Samsung-Export oder Korrekturen können weiterhin zeitweise Abweichungen erzeugen. Nach dem Update Samsung Health öffnen/synchronisieren, danach FitDex aktualisieren. Keine neue Berechtigung und kein Datenupload.

93 Unit-Tests, einschließlich Quellenmetadaten/Altsicherungen, atomaren Fehlern, Quellenwechsel, Wiederholungen und verzögerten ersten Schrittdaten. Neues 17. Browserprogramm `step-source-ui.mjs`: Standardfilter, explizite Gesamtwertauswahl, persistierte Quelle, alte Werte bei Fehlern, kein Rückfall bei leerer Samsung-Quelle, freundliche Quellennamen und lange unbekannte Namen bei 320/393 px in Hell/Dunkel. Bestehende Health-/Ei-Tests bleiben aktiv. Android-Debug-/Release-Build und Lint im Workflow. Browserantworten sind simuliert; tatsächliche Samsung-Schrittzahlen sind erst am Gerät überprüfbar.

Paket `de.diaetfreund.app`, festes Zertifikat, versionCode 20. Vorhandene Sicherungen bleiben lesbar.

## Technische Quellen

- AndroidX API: https://developer.android.com/reference/kotlin/androidx/health/connect/client/request/AggregateGroupByPeriodRequest (`dataOriginFilter`)
- Aggregation und Quellenpriorität: https://developer.android.com/health-and-fitness/health-connect/aggregate-data
- Health-Connect-eigene Schrittquelle: https://developer.android.com/health-and-fitness/health-connect/read-data
