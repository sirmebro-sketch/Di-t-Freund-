# Johto ab 0.5.0

100 zusätzliche Pokémon (Nationaldex 152–251), deutsche Namen, Gen-II-Typen und statische Originalsprites offline. Der Pokédex zeigt Kanto, Johto oder alle 251. Entwicklungen mit Freundschaft, Tausch und Gegenständen sind vereinfacht; benötigte Level stehen im Detailfenster. Rabauz kann vor Level 20 Kicklee, Nockchan oder Kapoera als Wunschentwicklung wählen. Die bestehenden Kanto-Pfade werden nicht rückwirkend verändert: etwa Iksbat, Stahlos und Scherox sind separat fangbar, statt alte Begleiter unerwartet umzuwandeln.

## Reise und Langzeitfortschritt

- Nach dem ersten Kanto-Orden über „Region wechseln“ nach Johto reisen und Endivie, Feurigel oder Karnimani dazu wählen. Kein Zurücksetzen vorhandener Begleiter, Erfahrung, Orden, Freundschaft oder Forschung.
- Die drei Tagesaufgaben gelten regionsübergreifend. Neue Aufgabenpunkte werden ausschließlich in der gerade aktiven Region verbucht. Wechseln, erneutes Öffnen oder Nachtragen derselben bereits belohnten Aufgabe erzeugt keine Extrapunkte.
- 20 Ziele: Neuborkia, Rosalia City, Viola City, Alph-Ruinen, Azalea City, Steineichenwald, Dukatia City, Nationalpark, Teak City, Turmruine, Oliviana/Leuchtturm, Anemonia City, See des Zorns, Mahagonia City, Radioturm, Ebenholz/Drachenhöhle, Indigo-Plateau, Strudelinseln, Glockenturm und Waldschrein.
- Falk, Kai, Bianka, Jens, Hartwig, Jasmin, Norbert und Sandra vergeben eigene Orden nach gewonnenen Begegnungen. Danach Willi, Koga, Bruno, Melanie und Siegfried. Kampf, Karte und Ordenansicht beziehen sich auf die ausgewählte Region.
- Raikou: 150 Punkte/4 Orden; Entei: 162/5; Suicune: 180/6. Lugia: 258 Punkte und Champ; Ho-Oh: 276 und Champ; Celebi: 300 und Champ plus 75 entdeckte Johto-Formen. Keine zeitlich begrenzten Events, Käufe oder exklusiven Versionen nötig.
- Forschungsrang, wiederholbare Expeditionen, Freundschaften und Kulissen verwenden weiterhin den gemeinsamen Karrierefortschritt. Ein vollständiger Pokédex beendet sie nicht. Hoenn und Sinnoh sind noch nicht implementiert.

## Daten und Migration

`game.regions.kanto.points` erhält beim Import eines alten Spielstands dessen bisherige Routinepunkte. Die bisherigen `game.badges` und `game.leagueWins` bleiben Kanto zugeordnet. `game.regions.johto` wird erst bei der ersten Reise angelegt und startet bei null. Die Summe der Regionspunkte muss mit dem gemeinsamen Aufgabenbuch übereinstimmen; ungültige Sicherungen werden vor dem Ersetzen abgelehnt. Nationale IDs und Sammlungsobjekte bleiben unverändert. Schema 2 wird um validierte optionale Felder ergänzt.

`game-registry.js` bündelt Inhaltsmodule, `region-progress.js` verwaltet Regionen. Neue Generationen brauchen echte Datensätze, Reiseinhalte, Validierung und Migrationstests; es gibt keinen automatischen Download unbekannter Inhalte.

## Quellen

- https://pokemondb.net/sprites – vom Nutzer angegebene Sprite-Referenz
- https://pokemondb.net/gold-silver/gymleaders-elitefour – Arenen und Liga
- https://pokeapi.co/docs/v2 – Datenschema
- PokeAPI CSV und Originalsprite-Spiegel: genaue URLs und Prüfsummen in `JOHTO-DATA-SOURCES.json` / `JOHTO-ASSETS.json`.

Eigene kurze Begleittexte, eigene vereinfachte Spielregeln und symbolische Vektororden. Kein originalgetreues Remake, keine vollständigen NPC-Dialoge. Rechtehinweise: [GAME.md](GAME.md).
