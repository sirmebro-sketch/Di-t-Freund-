# Pokémon-Abenteuer · Kanto (0.3.0)

Ein lokaler, inoffizieller Fan-Spielteil auf ausdrücklichen Nutzerwunsch. Kein Konto, Server, Kauf, Zufallskauf oder laufender Dienst. Nicht mit Nintendo, Creatures oder GAME FREAK verbunden. Pokémon-Inhalte werden nicht als frei lizenzierte eigene Inhalte ausgegeben.

## Umfang

Alle 151 Pokémon der ersten Generation mit deutschen Namen, den damaligen Typen (keine spätere Fee-/Stahl-Umtypisierung), 151 statischen Originalsprites und Entwicklungsdaten. Der Pokédex ist nach Name/Nummer, Typ und Entdeckungsstand filterbar. Er zeigt Fundort-Hinweise, Fortschrittsbedingungen und die tatsächlichen Unterschiede der vereinfachten App-Entwicklungen.

23 Reiseziele verbinden die Stationen mit eigenen kurzen Begleittexten. Bekannte Personen wie Professor Eich, Bill, Mr. Fuji, der Kapitän, die Arenaleiter, Team Rocket und die Top Vier haben passende Rollen. Es ist kein begehbares Remake und kein vollständiger NPC-/Dialogbestand der Originalspiele.

Die acht Arenaorden sind Fels-, Quell-, Donner-, Farb-, Seelen-, Sumpf-, Vulkan- und Erdorden. Eigene Vektor-Abzeichen symbolisieren sie. Die Kämpfe gegen Rocko, Misty, Major Bob, Erika, Koga, Sabrina, Pyro und Giovanni werden in dieser Reihenfolge freigeschaltet. Danach folgen Lorelei, Bruno, Agathe, Siegfried und Champ Blau. Trainerbilder werden nicht vorgetäuscht: gezeigt werden Namen, Ort und ihr Signatur-Pokémon.

## Fortschritt

1. Bisasam, Glumanda oder Schiggy wählen. Das gesamte Team erhält 10 EP je Tagesaufgabe.
2. Drei Aufgaben zählen je höchstens einmal täglich: Ernährungseintrag, Check-in, protokollierte Bewegung oder bewusst eingetragene Erholung. Kein Kalorien-, Wasser-, Gewicht- oder Intensitätsbonus.
3. Alle 3 Punkte automatische Begegnung mit garantiertem Fang einer noch nicht entdeckten, freigeschalteten Art. Aktuelle Orts-Pools haben Vorrang; weitere Arten werden über freigeschaltete Orte und ab 96 Punkten über Kanto-Routen erreichbar. Entwicklungen registrieren dauerhaft jede Zwischenform, ohne den Basiseintrag zu verlieren.
4. Level 5 + 1 je 20 EP, maximal Level 100. Alle bereits gefangenen Pokémon erhalten Erfahrung, nicht nur der aktive Begleiter. Der Begleiter lässt sich auch über den Pokédex wechseln. Neu gefangene Pokémon starten mit Level 5.
5. Alle 6 Punkte ein automatischer Kampf. Ein freigegebener, noch offener Arena-/Liga-Gegner hat Vorrang; andernfalls kommen bekannte Trainerklassen, Rocket-Rüpel oder der Rivale. Ein Signatur-Pokémon pro Gegner, vereinfachter Typenvorteil und Rundenberechnung. Keine Gesundheitsdaten in Kampfformeln.
6. Arena-Freigaben bei 24/48/72/96/120/144/168/192 Punkten; ein Sieg ist zusätzlich erforderlich. Top Vier und Champ bei 204/216/228/240/252 Punkten und nach allen acht Arena-Siegen. Niederlagen werden im nächsten passenden Kampf erneut versucht, ohne Verlust. Nach dem Champ bleibt die Sammlung offen.
7. Arktos: 180 Punkte + 6 Orden; Zapdos: 204 + 8; Lavados: 216 + 8; Mewtu: 264 + Champ; Mew: 300 + Champ + 100 entdeckte Formen. Keine zeitlich verfallenden Begegnungen.

Pausen entfernen nichts. Bereits erhaltene Punkte bleiben auch nach Tagebuchkorrekturen bestehen; dieselbe Tagesaufgabe kann nicht erneut belohnt werden. Das Spiel ist ein privater Motivationsbegleiter, kein manipulationssicherer Wettkampf. Kampfberichte bringen beim Wiederansehen keine Belohnung.

## Vereinfachte Entwicklungen

Levelentwicklungen verwenden die Kanto-Levelgrenzen. Stein-Entwicklungen passieren in dieser App auf Level 24, Tausch-Entwicklungen auf Level 32 – ohne Gegenstände oder Tauschpartner. Evoli hat die drei Gen-I-Ziele Aquana, Blitza und Flamara; vor Level 24 wählbar, Standard Aquana. Alle drei Formen sind zusätzlich direkt fangbar. Keine später eingeführten Baby-Pokémon, Entwicklungen, Megaformen oder regionalen Formen.

## Migration

App-Datenschema bleibt Version 2; der Spielstand erhält ein eigenes `version: 2`. Alte Version-0.2-Spielstände behalten Fänge, Erfahrung, Begleiter, Optionen, Punkte und Ereignisse. Entdeckte Zwischenformen werden rekonstruiert. Alte allgemeine Orden werden als Erinnerungsbänder bewahrt, nicht nachträglich als Arena-Siege ausgegeben. Ungültige Spielstände werden vor Migration abgelehnt. JSON-Sicherungen enthalten den vollständigen Spielstand.

## Daten und Assets

- Sprites: https://pokemondb.net/sprites (Schwarz/Weiß), bei Abrufproblemen PokeAPI-Spritearchiv. Original-URLs und Quell-Hashes in GAME-ASSETS.json. Kein Hotlinking zur Laufzeit.
- Namen, Gen-I-Typanpassung und Entwicklungsgraph: PokeAPI-CSV-Snapshot. Quell-URLs und Hashes in KANTO-DATA-SOURCES.json. `scripts/build-kanto-data.py` erzeugt den kompakten Snapshot. Keine übernommenen Pokédex-Fließtexte.
- Deutsche Orte/Orden: https://www.bisafans.de/routendex/kanto/index.php ; https://nintendo.fandom.com/de/wiki/Kanto . Original Trainer-/Liga-Zuordnung: https://pokemondb.net/red-blue/gymleaders-elitefour ; deutsche Namen auch https://pokemonletsgo.pokemon.com/de-de/kanto-region/ . Eigene Reisebeschreibungen; keine Originaldialoge kopiert.
- Sechs kurze Originaleffekte aus Rot/Blau, zusammen ca. 6,8 Sekunden: PRESS_AB, START_MENU, BALL_TOSS, FAINT_THUD, LEVEL_UP, CAUGHT_MON. The Sounds Resource, „General Sound Effects“, hochgeladen von thatrs: https://sounds.spriters-resource.com/game_boy_gbc/pokemonredblue/asset/410769/ . Mono-Vorbis-Transkodierung, keine vollständigen Musikstücke. Ton standardmäßig aus, bei aktivem Ton 30 % Lautstärke, App-Ausblendung stoppt Wiedergabe.
- `scripts/fetch-game-assets.py` erneuert die 151 Sprites und erhält die bereits verifizierten kurzen Soundeffekte unverändert. Anwendung lädt keine Spielassets extern nach.

Die Nutzung im Fanprojekt begründet keine allgemeine Lizenz zur öffentlichen oder kommerziellen Weiterverwertung fremder Inhalte. Eine spätere Store-Veröffentlichung ist damit nicht als rechtlich freigegeben behauptet.

## Zugänglichkeit

Beschriftete Auswahlbuttons, aria-pressed für aktive Auswahl, Text-Kampfberichte, Ton standardmäßig aus. Animationen abschaltbar; „reduzierte Bewegung“ des Systems hat Vorrang. Kein Blinkeffekt oder Bedienzeitlimit. Kleine Bildschirmbreiten, helle/dunkle Ansichten und automatisierte axe-Prüfungen sind Teil der Browser-Tests; reale TalkBack-Prüfung bleibt erforderlich.

## Langfristige Karriere ab 0.4

Forschung und Freundschaft werden aus denselben drei täglichen Routinen gespeist. Alle 60 neuen Routinepunkte steigt der Forschungsrang, auch nach Kanto-Abschluss. Ein ausgewählter Begleiter erhält Freundschaft: 12/30/60 Punkte bedeuten gute Freunde/vertraut/unzertrennlich. Andere behalten ihre Werte. Vier wiederholbare Forschungsreisen dauern jeweils 18 neue Routinepunkte, ohne Ablaufdatum, Strafpunkte oder Pflicht zur täglichen Nutzung. Das Album behält die letzten 100 abgeschlossenen Reisen. Fünf Kulissen werden nach 0/30/90/180/300 gesamten Routinepunkten freigeschaltet.

Bestehende Spielstände bekommen eine leere Karriere; keine rückwirkend erfundene gemeinsame Zeit. Nationaldex-IDs, Regionsregister und eigene Karrieredaten bereiten spätere Inhaltspakete vor. Aktuell ist ausschließlich Kanto implementiert. Johto/Hoenn/Sinnoh sind Erweiterungsziele ohne Terminzusage. Eine spätere Region benötigt neue Inhalte, eigene Reise-/Ordensstände und getestete Migration; allein ein Datensatz macht noch keine fertige Region. Bestehende Sammlung, Orden und Freundschaft sollen erhalten bleiben. Kein Zurücksetzen auf null und keine zeitlich verpassbaren Saisonbelohnungen.

Motivation ist ein Gestaltungsziel, keine Wirksamkeitsgarantie. Wiederholbare Forschung erweitert den kleinen Begleiter; sie ersetzt kein großes Rollenspiel mit endlos neuen Geschichten.
