# Brutstation · FitDex 0.9.0

Über „Eier & Brutstation“ auf der Startseite, im Abenteuer oder im Reisebereich erreichbar. Original-HG/SS-Ei, drei gleichzeitige Brutplätze, Vorrat und Schlüpfalbum. Ein Ei einlegen und Health Connect abgleichen; dieser erste Abgleich setzt den Startpunkt. Danach zählen neue importierte Schritte gleichzeitig für alle gestarteten Eier. Samsung Health muss Schritte an Health Connect schreiben und FitDex lesen dürfen. Die App ist kein eigener Hintergrund-Schrittzähler.

## Eier verdienen

- Täglich: zwei der drei bestehenden Routinen.
- Wöchentlich: mindestens eine Routine an vier Tagen (Montag bis Sonntag).
- Monatlich: mindestens eine Routine an zwölf Tagen.
- Dauerhaft: 10, 30 und jedes Vielfache von 60 Routinepunkten.

Woche/Monat zählen ab erstmaliger Einrichtung der Brutstation; frühere Routinepunkte zählen für Meilensteine. Jede Belohnung genau einmal. Bereits erreichte, später abgeglichene Erfolge verfallen nicht. Erholung zählt wie Bewegung; kein Bonus für Gewichtsverlust, Defizit oder Intensität. Vorrat maximal 10.000 Eier, Oberfläche zeigt die ersten 30. Album speichert die letzten 100 Schlupfereignisse, zeigt die letzten 20; Sammlung und Gesamtzahl bleiben erhalten.

## Schritte und Datensicherheit

Nur erfolgreiche Health-Connect-Lesungen mit Schritten zählen. Manuelle Schritte, erneutes Lesen gleicher Werte und nach unten korrigierte Werte bringen keinen doppelten Fortschritt. Pro Datum wird der höchste beobachtete Wert gespeichert. Neue Eier erhalten keinen rückwirkenden Vorrat aus früher gelaufenen Schritten. Nach einer Abenteuerpause setzt der nächste erfolgreiche Abgleich ebenfalls nur die neue Basis; vorherige Brutfortschritte bleiben erhalten. Aktualisierung und Schlupf werden zusammen atomar gespeichert. Ein fehlgeschlagener Schreibversuch verändert weder Eier noch Health-Daten. Bestehende Spielstände erhalten das optionale Brutstationsfeld beim nächsten Speichern; Sammlung, EP, Orden und Ziele bleiben bestehen.

## Pokémon und eigene Spielregeln

Alle 1.025 Nationaldex-Grundarten der Generationen 1–9 können mit gleicher Auswahlchance schlüpfen, einschließlich entwickelter, legendärer und mysteriöser Arten. Keine Regional-, Mega- oder sonstigen Alternativformen. Neue Arten sind als Begleiter und in Kämpfen verwendbar. Reisen und Arenen bleiben Kanto/Johto. Neue Entwicklungspfade sind vereinfacht: bekannte Mindestlevel, sonst meist Level 24 bzw. Tausch Level 32; weitere Originalbedingungen entfallen, Verzweigungen folgen dem ersten hinterlegten Pfad. Alle Zweige können unabhängig als Ei-Inhalt erhalten werden. Bisherige Kanto-/Johto-Pfade bleiben maßgeblich.

Shiny-Chance 1:64 pro vergebenem Ei; spätestens das 32. erhaltene Ei seit dem letzten vergebenen Shiny-Ei garantiert shiny. Inhalt und Shiny-Status stehen beim Erhalt fest. Dies sind FitDex-Regeln, keine originalen Spielwahrscheinlichkeiten. Normale und Shiny-Fänge derselben Grundart teilen sich Sammlung und Erfahrung. Shiny ist eine dauerhafte, im Pokédex umschaltbare Optik und bleibt bei Entwicklungen erhalten; doppelte Eier geben keinen Kampfvorteil.

Strecke: 255 × (PokeAPI-hatch_counter + 1), angelehnt an den Gen-IV-Ei-Zyklus. Die Übertragung auf spätere Generationen und normalerweise nicht brütbare Arten ist eine eigene Regel. Keine Simulation historischer Zyklus-Rundungen, Fähigkeiten oder Boni; keine Behauptung einer offiziellen FitDex-Regel.

## Quellen

- [PokeAPI-Artenfelder](https://pokeapi.co/docs/v2#pokemon-species)
- [PokeAPI-Datensätze](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv)
- [Ei-Zyklen](https://bulbapedia.bulbagarden.net/wiki/Egg_cycle)
- [Spritearchiv](https://github.com/PokeAPI/sprites)
- [HG/SS-Eigrafik](https://github.com/pret/pokeheartgold/tree/master/files/poketool/pokegra/otherpoke/egg)

Reproduktionsskript: `scripts/build-national-eggs.py`; jede Quelldatei und jedes Sprite mit URL/SHA-256 in `NATIONAL-EGG-SOURCES.json`. Gen I–IV verwenden HG/SS-, Gen V Black/White-Sprites; spätere Generationen PokeAPI-Standards, teils Community-Pixelsprites. Pokémon © Nintendo / Creatures / GAME FREAK. Inoffizielles persönliches Fanprojekt, keine Behauptung freier Lizenz oder offizieller Zugehörigkeit.

## Geräteprüfung

Native Schnittstelle in Browsertests simuliert. Auf dem Samsung-Gerät: Ei einlegen, erfolgreichen ersten Abgleich abwarten, später erneut abgleichen und den Zuwachs prüfen. Keine Deinstallation nötig; Update mit unverändertem Paket und fester Signatur installieren.
