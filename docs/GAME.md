# Pokémon-Abenteuer (0.2.0)

Auf ausdrücklichen Wunsch des Eigentümers ergänzt ein lokaler Pokémon-Fan-Spielteil das Tagebuch. Kein Konto, Spielserver, Kauf, Zufallskauf oder laufender Dienst. Die App ist nicht mit Nintendo, Creatures oder GAME FREAK verbunden. Pokémon-Namen, Sprites und Originalsounds werden nicht als frei lizenzierter eigener Inhalt ausgegeben.

## Spielkreislauf

- Einmal Bisasam, Glumanda oder Schiggy wählen. Der Spielstand bleibt im privaten App-Speicher und JSON-Backup.
- Drei tägliche Aufgaben: mindestens ein Ernährungseintrag; Tages-Check-in; protokollierte Bewegung oder explizit eingetragene bewusste Erholung. Jede Aufgabe zählt einmal, jeweils 10 EP für alle bereits gefangenen Pokémon. Kein Wiege-, Kalorien-, Wasser- oder Intensitätsbonus.
- Pro 3 Punkten eine automatische Begegnung mit garantiertem Fang einer noch fehlenden Entwicklungslinie. Nach 9 Linien ist die Sammlung der Basisformen vollständig. Später gefangene Pokémon starten mit Level 5.
- Level 5 + 1 pro 20 EP, maximal 100. Die Pokémon entwickeln sich automatisch; ursprüngliche Formen verschwinden als aktive Teamform, die Linie bleibt erhalten. 22 Formen sind enthalten. Keine vollständige Nationaldex-Sammlung.
- Pro 6 Punkten ein automatischer Kampf mit dem ausgewählten Begleiter. Vereinfacht: Level, Typenvorteil und abwechselnde Treffer. Kämpfe verwenden keine Gesundheitswerte. Kampfberichte sind wiederholbare Ansichten ohne erneute Belohnung.
- Pro 3 Siege ein Orden. Keine dauerhaften KP-Verluste, keine Einbußen bei Niederlagen, keine Strafen für fehlende Tage. Keine Streak-Verluste. Fortschritt bleibt nach Tagebuchkorrekturen bestehen, damit Korrekturen nicht bestraft werden; erneutes Hinzufügen derselben Tagesaufgabe erzeugt keine weiteren EP.
- Entwicklungen der Starter, Raupy, Taubsi und Karpador orientieren sich an Levelentwicklungen. Pikachu und Evoli entwickeln sich in dieser vereinfachten App mit Level 24 zu Raichu bzw. Aquana; die Originalspiele verwenden hierfür Steine. Keine Behauptung vollständiger originalgetreuer Kampfregeln.

## Originalassets

22 statische Schwarz/Weiß-Sprites von https://pokemondb.net/sprites, auf Nutzerwunsch. Pokémon Database erlaubt im Seitenhinweis das lokale Speichern statt Hotlinking; das ist keine Aussage über eine allgemeine freie Lizenz an Pokémon-Marken oder -Grafiken. Die App lädt sie nicht extern nach.

Sechs kurze Originaleffekte aus Pokémon Rot/Blau (zusammen ca. 6,8 Sekunden) aus „General Sound Effects“, The Sounds Resource, hochgeladen von thatrs: https://sounds.spriters-resource.com/game_boy_gbc/pokemonredblue/asset/410769/ . Verwendet: PRESS_AB, START_MENU, BALL_TOSS, FAINT_THUD, LEVEL_UP, CAUGHT_MON. Keine vollständigen Musikstücke. Für kleine Dateigröße nach Mono-Vorbis transkodiert, keine nachgebauten Syntheseeffekte. Ton startet erst nach Einschalten und einer Nutzeraktion, Lautstärke 30 %, ausblendende App stoppt den Ton.

Original-URLs, Dateinamen und SHA-256 der Quelldateien: GAME-ASSETS.json. Reproduzierbarer Asset-Import: `python3 scripts/fetch-game-assets.py` (benötigt Internet und ffmpeg). Bilder und Ton sind in `game-assets.js` als lokale Daten gebündelt. Das Repository gibt keine Erlaubnis zur kommerziellen Weiterverwertung fremder Assets; vor anderer Verbreitung Rechte gesondert klären.

## Zugänglichkeit

Beschriftete Auswahlbuttons, aktive Auswahl mit aria-pressed, Text-Kampfberichte, Ton aus als Standard. Animationen können ausgeschaltet werden; Systemeinstellung „reduzierte Bewegung“ hat Vorrang. Keine Blinkeffekte und kein Zeitlimit für Aufgaben oder Bedienung.
