# FitDex 0.11.1 · Kontrast und Menüsymbole

- Dunkles Design: hellere sekundäre Texte, Feld- und Kartenränder; dunklere Eingabeflächen und deutlich sichtbare Platzhalter. Helle Fehlermeldungen statt des bisherigen dunklen Rottons. Kontrastreichere grüne Fortschrittsbalken sowie orange/lila Akzente; gelber Tastaturfokus. Blaue/lila Kacheln erhalten passende dunkle Flächen. Weniger Glanz an Schaltflächen und ein stärker abgedunkelter dekorativer Platin-Hintergrund.
- HGSS-Menüsymbole: statt der eingerahmten Auswahlfelder werden die ungerahmten Originalmotive des bereits gebündelten Spritebogens angezeigt. SVG-Masken blenden dessen türkise Matte, außen verbundene weiße Kontur und grauen Schatten aus. Eingeschlossene weiße Details bleiben erhalten; kein pauschales Abdunkeln oder Farbmischen. Die Originaldatei bleibt bytegleich. Kleine Vergrößerung für bessere Erkennbarkeit.
- Trends-Reiter: eigenes transparentes Pixel-Balkendiagramm in den Blau-/Cyanfarben und derselben visuellen Größenordnung der HGSS-Motive. Kein weißer Kasten oder abweichender Schatten. Das Diagramm ist eine FitDex-Ergänzung, kein Original-Spielasset.

- Audiomenü: der interne Dateiauswahleingang bleibt wie vorgesehen verborgen; allgemeine Eingabefeld-Stile dürfen das HTML-Attribut `hidden` nicht überschreiben. Der sichtbare Knopf „Musikdatei laden“ bleibt der Einstieg.

## Quellen und Reproduzierbarkeit

Originalmenü: Pokémon HeartGold/SoulSilver, redblueyellow / The Spriters Resource; URL und SHA-256 unverändert in `docs/GEN4-ASSETS.json` (Eintrag `menu`). Originalgrafiken weiterhin © Nintendo / Creatures / GAME FREAK; inoffizielles Fanprojekt, keine freie Lizenzbehauptung.

`python3 scripts/build-menu-masks.py` erzeugt fünf codebasierte SVG-Masken und `menu-icons.css` aus dem gepinnten gebündelten PNG (Pillow erforderlich, kein Download). Außenbereiche werden vom Rand aus zusammenhängend erkannt; die Pixel im Originalbogen werden nicht verändert. CSS-Maskierung funktioniert auf hellen und dunklen Flächen gleichermaßen. `menu-trends.svg` ist separat von Hand als Pixel-Vektorgrafik definiert.

## Prüfung / Update

86 bestehende Unit-Tests und 55 Modul-Syntaxprüfungen. Gezielte Bedienungstests für Gen-IV-Navigation, Tagesbilanz, Übungsverlauf und Trends/Feedback; zusätzlich Sicht- und Axe-Prüfung der sechs Hauptreiter sowie Ernährungsbilanz, Lebensmittelsuche, Gewicht, Ton, Team und Profilformular in beiden Designs (393 px; Überlaufprüfung bei 320 px). Vollständige 15 Browserprogramme und Android-Build/Lint im Release-Workflow. Axe ersetzt keine vollständige Barrierefreiheitsprüfung; physische Display-/WebView-Darstellung ergänzend am Gerät prüfen.

Reines Darstellungsupdate: keine Änderung an gespeicherten Gesundheitsdaten, Spielständen, Zielen oder Berechtigungen. Paket `de.diaetfreund.app` und festes Zertifikat bleiben erhalten. versionCode 18.
