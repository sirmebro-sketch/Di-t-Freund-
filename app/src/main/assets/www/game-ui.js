import {spriteUrl} from './national-sprites.js';
import {catalogSize,inDexRegion} from './game-registry.js';
import { platinumScene } from './platinum-ui.js';
import {gen4} from "./gen4-assets.js";
import {
  activeRegion,
  regionPoints,
  regionProgress,
  regionWorld,
  switchRegion,
} from "./region-progress.js";
import { sprites as johtoSprites } from "./johto-assets.js";
import {
  ensureCareer,
  startExpedition,
  friendship,
  careerRank,
  campThemes,
  expeditionTypes,
} from "./game-career.js";
import { plannedRegions, regionPacks } from "./game-registry.js";
import {
  dex,
  evolutionPath,
  newGame,
  monster,
  gamePoints,
  quests,
  pokemon,
  gyms,
  league,
  places,
  placeAt,
  nextChallenge,
  encounterLocation,
  canEncounter,
} from "./game.js";
import { badgeSvg } from "./kanto-world.js";
import { sprites as kantoSprites, sounds } from "./game-assets.js";
import { today } from "./core.js";
export function setupGameUI({
  getState,
  commit,
  render,
  sheet,
  btn,
  esc,
  notify,
  close,
  playEffect,
}) {
  const sprite = (id, cls = "", shiny = false) =>
    `<img class="pokemon-sprite ${cls}" src="${spriteUrl(id,shiny)}" alt="${shiny?"Shiny ":""}${esc(dex[id][0])}" width="96" height="96">`;
  function sound(key) { playEffect?.(key); }
  function card() {
    const g = getState().game;
    if (!g)
      return `<section class="adventure-teaser"><div>${sprite(4)}<span class="eyebrow">DEIN ALLTAG. DEIN ABENTEUER.</span><h2>Ein kleiner Anfang.<br>Ein starkes Team.</h2><p>Fangen, trainieren, entwickeln. Dein Pokémon-Team wächst mit deinen Routinen.</p>${btn("Mein Abenteuer starten", "game", "primary")}</div></section>`;
    const m = monster(g.collection.find((x) => x.base === g.buddy)),
      points = gamePoints(g);
    return `<section class="adventure-teaser ${g.motion ? "" : "still"}">${sprite(m.id,"",m.shiny)}<div><span class="eyebrow">DEIN ABENTEUER · ${g.paused ? "PAUSIERT" : "LEVEL " + m.level}</span><h2>${m.name} ist an deiner Seite.</h2><p>${g.discovered.length}/${catalogSize()} entdeckt · ${regionProgress(g).badges.length}/8 Orden in ${regionPacks[activeRegion(g)].name}</p>${btn("Team & Abenteuer öffnen", "game", "primary")}</div></section>`;
  }
  function view() {
    const s = getState(),
      g = s.game;
    if (!g)
      return sheet(
        "Dein Pokémon-Abenteuer",
        `<div class="game-intro"><span class="eyebrow">WÄHLE DEINEN ERSTEN PARTNER</span><h3>Zusammen ist jeder kleine Schritt größer.</h3><p>Du kümmerst dich um dich. Dein Team sammelt dabei automatisch Erfahrung, fängt Pokémon und bestreitet kleine Kämpfe.</p><div class="starter-grid">${[1, 4, 7].map((id) => `<button class="starter" data-action="game-start" data-id="${id}">${sprite(id)}<strong>${dex[id][0]}</strong><small>${dex[id][1]}</small></button>`).join("")}</div><p class="hint">Keine Belohnung für Unteressen, Gewichtsverlust oder extra Training. Kein Verlust bei Pausen. Ernährungseintrag, Check-in und Bewegung oder Erholung zählen jeweils höchstens einmal täglich.</p><p class="footnote">Inoffizieller Fan-Spielteil mit vereinfachten Regeln. Pokémon © Nintendo / Creatures / GAME FREAK. Originalsprites: Pokémon Database. Hintergründe: Pokémon Platin, The Spriters Resource (Sunday_Domeko, Dragoon). Kurze Originaleffekte: Rot/Blau und Diamant/Perl, The Sounds Resource (BellBlitzKing). Musik: drei eigene Retro-Kompositionen.</p></div>`,
      );
    const m = monster(g.collection.find((x) => x.base === g.buddy)),
      points = regionPoints(g),
      world = regionWorld(g),
      progress = regionProgress(g),
      regionName = regionPacks[activeRegion(g)].name,
      earned = g.earned[today()] || [],
      latest = g.events
        .filter((e) => !["xp", "level"].includes(e.kind))
        .slice(-8)
        .reverse();
    sheet(
      "Dein Abenteuer",
      `<div class="game-world ${g.motion ? "" : "still"}"><div class="game-topline"><span>${esc(world.placeAt(points).name.toUpperCase())} · ${g.paused ? "PAUSE" : "UNTERWEGS"}</span><span>${progress.badges.length}/8 ◈ ORDEN</span></div><div class="game-scene theme-${g.career?.theme || "classic"}">${platinumScene(g.career?.theme)}${sprite(m.id, "companion",m.shiny)}<span class="scene-caption">Jeder kleine Schritt zählt.</span></div><div class="game-status"><div><strong>${m.name}</strong><span>Lv. ${m.level} · ${m.type}</span></div><div class="track"><i style="width:${m.level === 100 ? 100 : (m.xp % 20) * 5}%"></i></div><small>${m.level === 100 ? "Maximales Level erreicht" : `${20 - (m.xp % 20)} EP bis zum nächsten Level`} · EP gelten fürs ganze Team</small></div></div><div class="toolbar game-links">${btn("Pokédex · " + g.discovered.length + "/" + catalogSize(), "game-dex", "secondary")}${btn(regionName + "-Karte", "game-map", "secondary")}${btn("Region wechseln", "game-regions", "secondary")}${btn("Orden & Liga", "game-badges", "secondary")}${btn("Forschung & Freundschaft", "game-career", "secondary")}${btn("Eier & Brutstation", "egg-open", "primary")}</div><section class="journey-next"><span class="eyebrow">${esc(world.placeAt(points).person)}</span><p>${esc(world.placeAt(points).text)}</p>${nextChallenge(g) ? `<strong>Nächstes Ziel: ${esc(nextChallenge(g).trainer)} · ${Math.max(0, nextChallenge(g).points - points)} Punkte bis zur Freigabe</strong><small>Bei Freigabe im nächsten automatischen Kampf. Nach einer Niederlage erneut, ohne Verlust.</small>` : "<strong>Du bist Champ dieser Region. Entdecke die übrigen Pokémon!</strong>"}</section><section class="game-section"><div class="section-head"><h3>Deine heutigen Abenteuerpunkte</h3><strong>${earned.length}/3</strong></div>${quests(
        s,
        today(),
      )
        .map(
          (q) =>
            `<div class="quest"><span class="quest-check" aria-hidden="true">${earned.includes(q.key) ? "✓" : "○"}</span><div><strong>${q.label}</strong><small>${earned.includes(q.key) ? "Erledigt · 10 Team-EP" : "+10 Team-EP"}</small></div>${earned.includes(q.key) ? "" : btn(q.key === "care" ? "Erholung" : "Los", q.action, "secondary", q.key === "care" ? 'aria-label="Bewusste Erholung für heute festhalten"' : "")}</div>`,
        )
        .join(
          "",
        )}<p class="footnote">Eine protokollierte Bewegungseinheit zählt genauso wie bewusste Erholung. Mehr Training, Wasser, Wiegen oder weniger Essen bringen keine Extrapunkte. Einmal erhaltene EP bleiben auch nach Korrekturen erhalten.</p></section><div class="two-grid game-counters"><div class="mini-stat"><small>Nächste Begegnung</small><strong>${g.discovered.filter((id) => (activeRegion(g) === "kanto" ? id <= 151 : id > 151 && id <= 251)).length === (activeRegion(g) === "kanto" ? 151 : 100) ? "Alle entdeckt" : 3 - (points % 3) + " Punkte"}</strong></div><div class="mini-stat"><small>Nächster automatischer Kampf</small><strong>${6 - (points % 6)} Punkte</strong></div></div><section class="game-section"><h3>Deine Begleiter <small>· ${g.collection.length} gefangen</small></h3><p>Wähle deinen Begleiter für die nächste Begegnung. Alle erhalten Erfahrung. Weitere findest du im Pokédex.</p><div class="team-grid">${[
        ...g.collection,
      ]
        .sort((a, b) => Number(b.base === g.buddy) - Number(a.base === g.buddy))
        .slice(0, 6)
        .map((x) => {
          const p = monster(x);
          return `<button class="team-mon ${x.base === g.buddy ? "selected" : ""}" data-action="game-buddy" data-id="${x.base}" aria-pressed="${x.base === g.buddy}">${sprite(p.id,"",p.shiny)}<strong>${p.shiny?"✨ ":""}${p.name}</strong><small>Lv. ${p.level} · ${p.type}</small></button>`;
        })
        .join(
          "",
        )}</div></section><section class="game-section"><h3>Was auf deiner Reise passiert ist</h3>${latest.length ? latest.map((e) => `<article class="game-event">${e.species ? sprite(e.species,"",e.shiny) : '<span class="event-medal" aria-hidden="true">' + (e.kind === "battle" ? "⚔" : "◈") + "</span>"}<div><small>${esc(e.date)}</small><p>${esc(e.text)}</p>${e.kind === "battle" ? btn("Kampf ansehen", "game-battle", "text-button", `data-index="${g.events.indexOf(e)}"`) : e.species ? btn("Moment ansehen", "game-moment", "text-button", `data-index="${g.events.indexOf(e)}"`) : ""}</div></article>`).join("") : "<p>Dein erstes Kapitel beginnt mit einem kleinen Eintrag.</p>"}</section><div class="toolbar">${btn("Musik & Klänge", "audio-open", "secondary")}${btn(g.motion ? "Animationen an" : "Animationen aus", "game-motion", "secondary", `aria-pressed="${g.motion}"`)}${btn(g.paused ? "Abenteuer fortsetzen" : "Abenteuer pausieren", "game-pause", "secondary")}</div><details class="below"><summary>Spielregeln & Bild-/Tonquellen</summary><p>Pro 3 Punkten wird automatisch ein noch nicht entdecktes, freigeschaltetes Pokémon gefangen. Entwicklungen registrieren jede Zwischenform im Pokédex. Alle 151 Kanto- und 100 Johto-Pokémon sind auf Reisen erreichbar. Über die Brutstation kommen alle 1.025 Nationaldex-Grundarten der Generationen 1–9 und ihre Shiny-Optik hinzu. Reise- und Ordenfortschritt werden je Region geführt. Insgesamt bleiben es höchstens drei tägliche Aufgaben. Pro 6 Punkten findet ein Kampf statt; freigegebene Arenen und danach die Top Vier haben Vorrang.</p><p>Alle Begleiter erhalten 10 EP je täglicher Aufgabe; 20 EP bedeuten ein Level. Kein Punkteverlust bei Pausen oder Niederlagen. Acht Arenaorden werden einzeln durch Siege verdient. Alte Abenteuerorden bleiben als Erinnerungsbänder erhalten: ${g.legacyRibbons}.</p><p>Vereinfachte eigene Kampfregeln mit jeweils einem Signatur-Pokémon des Trainers. Stein-Entwicklungen erfolgen hier automatisch auf Level 24, Tausch-Entwicklungen auf Level 32. Evoli: Wunschentwicklung vor Level 24 wählen; alle drei Formen sind zusätzlich einzeln fangbar. Keine Originalspiel-Kopie, kein vollständiges Kampfsystem.</p><p>Sprites und deutsche Artendaten: PokeAPI. Gen I–IV: HeartGold/SoulSilver, Gen V: Black/White, spätere Arten: neuere bzw. Community-Sprites. Eigrafik: pret/pokeheartgold. Hintergründe: Pokémon Platin, The Spriters Resource (Sunday_Domeko, Dragoon). Kurze Originaleffekte: Rot/Blau und Diamant/Perl, The Sounds Resource (BellBlitzKing). Musik: drei eigene Retro-Kompositionen. Pokémon © Nintendo / Creatures / GAME FREAK. Inoffizielles Fanprojekt.</p></details>`,
    );
    sound("open");
  }
  function careerView() {
    const g = getState().game,
      c = g.career || { ...ensureCareer(structuredClone(g)) },
      rank = careerRank(c),
      points = gamePoints(g),
      buddy = monster(g.collection.find((m) => m.base === g.buddy)),
      bond = c.bond[g.buddy] || 0;
    sheet(
      "Deine langfristige Forschungsreise",
      `<div class="kanto-banner"><span class="eyebrow">FORSCHUNGSRANG ${rank.level}</span><h3>Es gibt noch mehr zu entdecken.</h3><p>${rank.next} weitere Routinepunkte bis zum nächsten Rang. Der Rang wächst auch nach dem vollständigen Pokédex und ohne neue Generation weiter.</p></div><section class="game-section"><h3>${esc(buddy.name)} & du</h3><div class="species-hero">${sprite(buddy.id,"",buddy.shiny)}<div><strong>${friendship(bond)}</strong><p>${bond} gemeinsame Routinepunkte</p></div></div><p>Der gewählte Begleiter sammelt Freundschaft mit deinen täglichen Aufgaben. Alle anderen behalten Erfahrung und Freundschaft. Wechsel ihn, wenn du einen neuen Freund näher kennenlernen möchtest.</p><p class="footnote">Gute Freunde ab 12, vertraut ab 30, unzertrennlich ab 60 Punkten. Keine zusätzlichen Aufgaben oder Schritte nötig.</p></section><section class="game-section"><h3>Forschungsreisen ohne Ablaufdatum</h3>${c.expedition ? `<p><strong>${expeditionTypes.find((t) => t[0] === c.expedition.kind)[1]}</strong> · ${Math.min(18, points - c.expedition.start)}/18 Routinepunkte</p><div class="track"><i style="width:${Math.min(100, ((points - c.expedition.start) / 18) * 100)}%"></i></div><p>Deine Reise bleibt bei Pausen offen. Danach kommt ein Eintrag ins Forschungsalbum.</p>` : `<p>Wähle eine Reise für einen thematischen Albumeintrag. 18 Routinepunkte schließen sie ab – bei drei Punkten täglich frühestens nach sechs Tagen, ohne Zeitlimit.</p><div class="two-grid">${expeditionTypes.map(([kind, label]) => btn(label, "game-expedition", "secondary", `data-kind="${kind}"`)).join("")}</div>`}<h3 class="below">Dein Forschungsalbum</h3>${
        c.completed.length
          ? c.completed
              .slice(-8)
              .reverse()
              .map(
                (e) =>
                  `<p>✧ ${expeditionTypes.find((t) => t[0] === e.kind)[1]} · ${esc(e.date)}</p>`,
              )
              .join("")
          : "<p>Dein erstes Erinnerungsblatt wartet auf dich.</p>"
      }</section><section class="game-section"><h3>Dein Lager gestalten</h3><div class="toolbar">${campThemes.map(([id, name, need]) => btn(points >= need ? name : `${name} · ab ${need} Punkten`, "game-theme", "secondary", `data-theme="${id}" ${points < need ? "disabled" : ""} aria-pressed="${c.theme === id}"`)).join("")}</div></section><section class="game-section"><h3>Ein Pokédex, mehrere Regionen</h3><p>Kanto und Johto sind installiert. Team, nationale Pokédex-Nummern, Freundschaft und Forschung gehören zu deinem dauerhaften Spielstand. Jede Region hat eigene Reise- und Ordenfortschritte; bestehende Erfolge werden nicht zurückgesetzt.</p>${btn("Regionen entdecken", "game-regions", "secondary")}${plannedRegions.map((r) => `<p><strong>${r.name} · Generation ${r.generation}</strong> – vorbereitet als Erweiterungsziel, noch nicht spielbar.</p>`).join("")}<p class="footnote">Weitere Regionen brauchen ein App-Update mit neuen Inhalten. Die Pokémon-Arten der Generationen 1–9 sind bereits über Eier verfügbar. Neue Reisen und Arenen brauchen eigene Inhalte; dafür gibt es noch keinen Veröffentlichungstermin.</p></section>${btn("Zurück zum Abenteuer", "game", "secondary")}`,
    );
  }
  function regionsView() {
    const g = getState().game;
    sheet(
      "Deine Regionen",
      `<p>Dein Team, Pokédex und Freundschaften reisen mit. Neue Routinepunkte zählen für die ausgewählte Region. Bereits verdiente Punkte bleiben an ihrem Ort. Ein Wechsel gibt keine Extrapunkte.</p><div class="two-grid">${Object.values(
        regionPacks,
      )
        .map((pack) => {
          const r = regionProgress(g, pack.id),
            current = activeRegion(g) === pack.id,
            open = pack.id === "kanto" || g.badges.length > 0,
            started = pack.id === "kanto" || !!g.regions?.johto;
          return `<section class="card"><span class="eyebrow">GENERATION ${pack.generation}${current ? " · AKTIV" : ""}</span><h3>${pack.name}</h3><p>${r.points} Regionspunkte · ${r.badges.length}/8 Orden · ${r.leagueWins.length}/5 Liga-Siege</p>${!open ? "<p>Nach deinem ersten Kanto-Orden öffnet sich diese Reise.</p>" : current ? "<p>Hier geht dein Abenteuer gerade weiter.</p>" : started ? btn("Nach " + pack.name + " reisen", "game-travel", "primary", `data-region="${pack.id}"`) : `<p>Professor Lind wartet in Neuborkia. Wähle deinen neuen Freund. Dein bisheriges Team bleibt erhalten.</p><div class="starter-grid">${[152, 155, 158].map((id) => `<button class="starter" data-action="game-travel" data-region="johto" data-starter="${id}">${sprite(id)}<strong>${dex[id][0]}</strong></button>`).join("")}</div>`}</section>`;
        })
        .join(
          "",
        )}</div><p class="hint">Insgesamt höchstens drei tägliche Aufgaben – auch beim Regionswechsel. Keine Fristen, keine verlorenen Erfolge bei Pausen.</p>${btn("Zurück zum Abenteuer", "game", "secondary")}`,
    );
  }
  function dexView() {
    sheet(
      "Dein nationaler Pokédex",
      `<p>${catalogSize()} Pokémon-Arten aus neun Generationen. Kanto und Johto sind bereisbar; alle Arten sind über Eier erhältlich. Entdeckte Formen bleiben dauerhaft eingetragen.</p><label>Region<select id="dex-region"><option value="kanto" ${activeRegion(getState().game) === "kanto" ? "selected" : ""}>Kanto · 151</option><option value="johto" ${activeRegion(getState().game) === "johto" ? "selected" : ""}>Johto · 100</option>${[[3,"Hoenn"],[4,"Sinnoh"],[5,"Einall"],[6,"Kalos"],[7,"Alola"],[8,"Galar / Hisui"],[9,"Paldea"]].map(([n,name])=>`<option value="${n}">${name}</option>`).join("")}<option value="all">Alle · ${catalogSize()}</option></select></label><label>Pokémon suchen<input id="dex-search" type="search" placeholder="Name oder Pokédex-Nummer" autocomplete="off"></label><div class="two-grid"><label>Entdeckung<select id="dex-status"><option value="all">Alle Pokémon</option><option value="found">Entdeckt</option><option value="missing">Noch nicht entdeckt</option><option value="shiny">Shiny freigeschaltet</option></select></label><label>Typ<select id="dex-type"><option value="all">Alle Typen</option>${[
        ...new Set(Object.values(pokemon).flatMap((p) => p.types)),
      ]
        .sort()
        .map((t) => `<option>${t}</option>`)
        .join(
          "",
        )}</select></label></div><p id="dex-count" role="status"></p><div id="dex-grid" class="dex-grid"></div><div class="toolbar">${btn("Zurück zum Abenteuer", "game", "secondary")}</div>`,
    );
    dexResults();
  }
  let dexLimit=120;
  function dexResults(more=false) {
    if(!more)dexLimit=120;
    const grid = document.querySelector("#dex-grid");
    if (!grid) return;
    const query = document
        .querySelector("#dex-search")
        .value.trim()
        .toLocaleLowerCase("de"),
      status = document.querySelector("#dex-status").value,
      type = document.querySelector("#dex-type").value,
      region = document.querySelector("#dex-region").value,
      g = getState().game;
    const shinyFound=id=>g.collection.some(m=>m.shiny&&evolutionPath(m).includes(id));
    const ids = Object.keys(pokemon)
      .map(Number)
      .filter(
        (id) =>
          inDexRegion(id,region) &&
          (pokemon[id].name.toLocaleLowerCase("de").includes(query) ||
            String(id).padStart(3, "0").includes(query.replace(/^#/, ""))) &&
          (status === "all" || (status === "shiny" ? shinyFound(id) : (status === "found") === g.discovered.includes(id))) &&
          (type === "all" || pokemon[id].types.includes(type)),
      );
    document.querySelector("#dex-count").textContent =
      `${ids.length} Treffer · ${g.discovered.filter((id) => inDexRegion(id,region)).length}/${Object.keys(pokemon).filter(id=>inDexRegion(Number(id),region)).length} entdeckt`;
    grid.innerHTML =
      (ids.length>251?ids.slice(0,dexLimit):ids)
        .map(
          (id) =>
            `<button class="dex-mon ${g.discovered.includes(id) ? "discovered" : "undiscovered"}" data-action="game-species" data-id="${id}"><small>#${String(id).padStart(3, "0")} · ${g.discovered.includes(id) ? "✓" : "offen"}${shinyFound(id)?" · ✨ Shiny":""}</small>${sprite(id,"",shinyFound(id))}<strong>${esc(pokemon[id].name)}</strong><small>${esc(pokemon[id].types.join(" / "))}</small></button>`,
        )
        .join("") || "<p>Keine passenden Pokémon gefunden.</p>";
    if(ids.length>251&&dexLimit<ids.length)grid.innerHTML+=btn("Weitere Pokémon anzeigen", "game-dex-more", "secondary");
  }
  document.addEventListener("input", (e) => {
    if (
      ["dex-search", "dex-status", "dex-type", "dex-region"].includes(
        e.target.id,
      )
    )
      dexResults();
  });
  document.addEventListener("change", (e) => {
    if (["dex-status", "dex-type", "dex-region"].includes(e.target.id))
      dexResults();
  });
  function speciesView(id) {
    const p = pokemon[id],
      g = getState().game;
    if (!p || !g) return;
    const member =
        g.collection.find((m) => monster(m).id === id) ||
        g.collection.find((m) => m.base === id),
      active = member ? monster(member) : null;
    sheet(
      `#${String(id).padStart(3, "0")} · ${p.name}`,
      `<div class="species-hero">${sprite(id,"",active?.shiny)}<div><span class="eyebrow">${g.discovered.includes(id) ? "IM POKÉDEX ENTDECKT" : "NOCH NICHT ENTDECKT"}</span><h3>${esc(p.name)}</h3><p>${esc(p.types.join(" / "))}</p></div></div><section class="card"><h3>Auf deiner Reise</h3><p>${esc(encounterLocation(id))}</p><p>${canEncounter(g, id) ? "Als Begegnung freigeschaltet. Noch nicht entdeckte Formen werden bevorzugt." : "Über Eier erhältlich; Reisebegegnungen hängen von Region und Fortschritt ab."}</p>${
        p.special && id<=251
          ? `<p class="hint">${(() => {
              const gate = regionWorld(g, id > 151 ? "johto" : "kanto")
                .specialGates[id];
              return `${p.name}: ab ${gate.points} Regionspunkten${gate.badges ? ` und ${gate.badges} Orden` : ""}${gate.champion ? " · nach dem Champ" : ""}${gate.discovered ? ` · ${gate.discovered} entdeckte Formen dieser Region` : ""}.`;
            })()}</p>`
          : ""
      }${active ? `<p>Dein Begleiter aus diesem Fang: <strong>${esc(active.name)}</strong> · Level ${active.level}</p>${btn("Als Begleiter wählen", "game-buddy", "primary", `data-id="${member.base}"`)}${member.shiny?btn(active.shiny?"✨ Shiny aktiv · Normal wählen":"Normal aktiv · Shiny wählen","game-shiny","secondary",`data-id="${member.base}" aria-pressed="${active.shiny}"`):""}` : ""}</section><section class="game-section"><h3>Entwicklungen in dieser App</h3>${p.evolutions.length ? p.evolutions.map((e) => `<button class="evolution-row" data-action="game-species" data-id="${e.to}">${sprite(e.to)}<span><strong>${esc(pokemon[e.to].name)}</strong><small>Original: ${esc(e.original)}<br>In dieser App: Level ${e.level}${e.kind === "level" ? "" : " · vereinfacht, ohne Gegenstand/Tausch"}</small></span></button>`).join("") : "<p>Keine weitere automatische Entwicklung. Bestehende Kanto-/Johto-Pfade bleiben erhalten; alle späteren Arten sind separat über Eier erreichbar.</p>"}${
        [133, 236].includes(id) &&
        member &&
        active.level < 20 + (id === 133 ? 4 : 0)
          ? `<p>Wähle deine Wunschentwicklung vor dem Entwicklungslevel:</p><div class="toolbar">${pokemon[
              id
            ].evolutions
              .map((e) => e.to)
              .map((choice) =>
                btn(
                  pokemon[choice].name,
                  "game-evolution",
                  "secondary",
                  `data-base="${id}" data-id="${choice}" aria-pressed="${(member.choice || p.evolutions[0].to) === choice}"`,
                ),
              )
              .join("")}</div>`
          : ""
      }</section>${btn("Zurück zum Pokédex", "game-dex", "secondary")}`,
    );
  }
  function mapView() {
    const g = getState().game,
      points = regionPoints(g),
      world = regionWorld(g),
      current = world.placeAt(points);
    sheet(
      "Deine Reise durch " + regionPacks[activeRegion(g)].name,
      `<div class="kanto-banner"><span class="eyebrow">${points} ABENTEUERPUNKTE</span><h3>${esc(current.name)}</h3><p>${esc(current.person)} · ${esc(current.text)}</p></div><p>Eine vereinfachte Reisekarte: Orte öffnen sich durch deine täglichen Routinen. Arena- und Liga-Siege werden separat verdient.</p><ol class="kanto-route">${world.places.map((p, i) => `<li class="${points >= p.points ? "visited" : "future"} ${current.id === p.id ? "current" : ""}"><button data-action="game-place" data-id="${p.id}" ${current.id === p.id ? 'aria-current="step"' : ""}><span class="route-node" aria-hidden="true">${points >= p.points ? "✓" : i + 1}</span><span><strong>${esc(p.name)}</strong><small>${esc(p.person)} · ${points >= p.points ? "Erreicht" : `ab ${p.points} Punkten`}</small></span></button></li>`).join("")}</ol>${btn("Zurück zum Abenteuer", "game", "secondary")}`,
    );
  }
  function placeView(id) {
    const g = getState().game,
      p = regionWorld(g).places.find((p) => p.id === id);
    if (!p) return;
    const open = regionPoints(g) >= p.points;
    sheet(
      p.name,
      `<span class="eyebrow">${esc(p.person)}</span><p>${esc(p.text)}</p><p class="hint">${open ? "Dieses Reiseziel hast du erreicht." : `Noch ${p.points - regionPoints(g)} Punkte bis zu diesem Reiseziel.`} Seltene Pokémon können zusätzliche Orden oder den Champ voraussetzen.</p><h3>Passende Begegnungen</h3><div class="team-grid">${p.pool.map((id) => `<button class="team-mon" data-action="game-species" data-id="${id}">${sprite(id)}<strong>${esc(pokemon[id].name)}</strong><small>${g.discovered.includes(id) ? "Entdeckt" : "Noch offen"}</small></button>`).join("")}</div><div class="toolbar">${btn("Zurück zur Regionskarte", "game-map", "secondary")}${btn("Orden & Liga", "game-badges", "secondary")}${btn("Forschung & Freundschaft", "game-career", "secondary")}</div>`,
    );
  }
  function badgeView() {
    const g = getState().game,
      next = nextChallenge(g),
      world = regionWorld(g),
      progress = regionProgress(g),
      name = regionPacks[activeRegion(g)].name;
    sheet(
      "Orden, Top Vier & Ruhmeshalle",
      `<div class="kanto-banner"><span class="eyebrow">DEINE ${name.toUpperCase()}-LIGA</span><h3>${progress.badges.length}/8 Arenaorden</h3><p>${progress.leagueWins.length === 5 ? `${name}-Champ! Dein Platz in der Ruhmeshalle bleibt erhalten.` : next ? `Nächster Gegner: ${next.trainer}. Freigabe ab ${next.points} Punkten.` : ""}</p></div><div class="badge-grid">${world.gyms.map((gym) => `<article class="badge-card">${badgeSvg(gym, progress.badges.includes(gym.id))}<h3>${gym.name}</h3><strong>${gym.trainer}</strong><small>${gym.city} · ${gym.type}</small><p>${progress.badges.includes(gym.id) ? "✓ Verdient" : `Ab ${gym.points} Punkten · Sieg erforderlich`}</p>${sprite(gym.pokemon)}</article>`).join("")}</div><h3 class="below">Top Vier & Champ</h3><p>Nach allen acht Orden folgen diese fünf Begegnungen der Reihe nach. Dein Fortschritt bleibt auch nach einer Niederlage erhalten.</p>${world.league.map((t) => `<div class="league-row">${sprite(t.id === "blue" ? { 1: 6, 4: 9, 7: 3 }[g.starter] : t.pokemon)}<div><strong>${t.trainer}</strong><small>${t.type} · ab ${t.points} Punkten</small><p>${progress.leagueWins.includes(t.id) ? "✓ Besiegt" : "Noch vor dir"}</p></div></div>`).join("")}<p class="footnote">Vereinfachte Begegnungen mit je einem Signatur-Pokémon. Alte Erinnerungsbänder aus Version 0.2: ${g.legacyRibbons}. Diese ersetzen keine Arena-Siege.</p>${btn("Zurück zum Abenteuer", "game", "secondary")}`,
    );
  }
  function replay(index) {
    const g = getState().game,
      e = g?.events[index];
    if (e?.kind !== "battle") return;
    const r = e.result,
      last = r.rounds.at(-1);
    sheet(
      "Automatischer Teamkampf",
      `<div class="battle-view ${g.motion ? "" : "still"}"><p class="eyebrow">AUFZEICHNUNG · KEINE NEUEN EP</p>${r.trainer ? `<h3>${esc(r.trainer)}</h3><p>${esc(r.place)}</p>` : ""}<div class="battle-arena"><div class="fighter">${sprite(r.ally.id,"",r.ally.shiny)}<strong>${esc(r.ally.name)} · Lv. ${r.ally.level}</strong><span>${last.hp}/${r.maxHp} KP am Ende</span></div><span aria-hidden="true">VS</span><div class="fighter foe">${sprite(r.enemy.id)}<strong>${esc(r.enemy.name)} · Lv. ${r.enemy.level}</strong><span>${last.foe}/${r.maxFoe} KP am Ende</span></div></div><h3>${r.won ? "Geschafft! Dein Team gewinnt." : "Guter Einsatz. Dein Team erholt sich."}</h3><ol class="battle-rounds">${r.rounds.map((round, i) => `<li style="--delay:${i * 0.35}s">${esc(round.text)}<small>Dein Team: ${round.hp} KP · Gegner: ${round.foe} KP</small></li>`).join("")}</ol><p>Nach der Begegnung ist dein Team wieder vollständig erholt.</p>${btn("Zurück zum Abenteuer", "game", "primary")}</div>`,
    );
    sound("hit");
  }
  function change(mutator) {
    if (commit(mutator)) {
      view();
      render();
    }
  }
  const actions = {
    game: view,
    "game-regions": regionsView,
    "game-dex-more":()=>{dexLimit+=120;dexResults(true);},
    "game-travel": (b) => {
      if (
        commit(
          (s) =>
            switchRegion(
              s.game,
              b.dataset.region,
              Number(b.dataset.starter),
              today(),
            ),
          true,
        )
      ) {
        view();
        render();
      }
    },
    "game-dex": () => dexView(),
    "game-career": careerView,
    "game-expedition": (b) => {
      if (
        commit((s) =>
          startExpedition(s.game, b.dataset.kind, gamePoints(s.game), today()),
        )
      )
        careerView();
    },
    "game-theme": (b) => {
      const theme = campThemes.find((t) => t[0] === b.dataset.theme);
      if (!theme || gamePoints(getState().game) < theme[2]) return;
      if (commit((s) => (ensureCareer(s.game).theme = theme[0]))) {
        careerView();
        render();
      }
    },
    "game-map": mapView,
    "game-badges": badgeView,
    "game-species": (b) => speciesView(Number(b.dataset.id)),
    "game-place": (b) => placeView(b.dataset.id),
    "game-evolution": (b) => {
      const base = Number(b.dataset.base || 133);
      const m = getState().game?.collection.find((m) => m.base === base);
      const choice = Number(b.dataset.id);
      if (
        !m ||
        monster(m).level >= (base === 133 ? 24 : 20) ||
        ![133, 236].includes(base) ||
        !pokemon[base].evolutions.some((e) => e.to === choice)
      )
        return;
      if (
        commit(
          (s) =>
            (s.game.collection.find((m) => m.base === base).choice = choice),
        )
      )
        speciesView(base);
    },
    "game-start": (b) => {
      const id = Number(b.dataset.id);
      if (getState().game || ![1, 4, 7].includes(id)) return;
      change((s) => (s.game = newGame(id, today())));
    },
    "game-shiny": (b) => { const id=Number(b.dataset.id),m=getState().game?.collection.find(m=>m.base===id);if(!m?.shiny)return;change(s=>{const member=s.game.collection.find(m=>m.base===id);member.useShiny=member.useShiny===false;}); },
    "game-buddy": (b) => {
      const id = Number(b.dataset.id);
      if (!getState().game?.collection.some((m) => m.base === id)) return;
      sound("recall");
      change((s) => (s.game.buddy = id));
    },
    "game-rest": () => {
      if (!getState().game) return;
      change((s) => {
        if (!s.game.restDays.includes(today())) s.game.restDays.push(today());
      });
      notify("Bewusste Erholung festgehalten.");
    },
    "game-motion": () => change((s) => (s.game.motion = !s.game.motion)),
    "game-pause": () => change((s) => (s.game.paused = !s.game.paused)),
    "game-battle": (b) => replay(Number(b.dataset.index)),
    "game-moment": (b) => {
      const g = getState().game,
        e = g?.events[Number(b.dataset.index)];
      if (!e?.species) return;
      sheet(
        e.kind === "catch" ? "Ein neuer Freund!" : "Dein Team wächst!",
        `<div class="game-world ${g.motion ? "" : "still"}"><div class="game-scene">${platinumScene(g.career?.theme)}${sprite(e.species, "companion",e.shiny)}<div class="catch-ball" aria-hidden="true"></div></div><div class="game-status"><h3>${esc(e.text)}</h3><p>Dieser Moment gehört zu deiner Reise. Wiederansehen verändert deinen Spielstand nicht.</p>${btn("Zurück zum Team", "game", "primary")}</div></div>`,
      );
      sound(e.kind === "catch" ? "capture" : "level");
    },
  };
  function celebrate(before, after) {
    if (!after.game || !before.game) return;
    const old = gamePoints(before.game),
      points = gamePoints(after.game);
    if (points <= old) return;
    const recent = after.game.events.slice(-6);
    sound(
      recent.some((e) => e.kind === "evolve")
        ? "level"
        : points % 3 === 0
          ? "caught"
          : "menu",
    );
    notify(
      `+${(points - old) * 10} Team-EP · ${points % 3 === 0 ? "Dein Abenteuer geht weiter!" : "Dein Team wächst mit dir."}`,
    );
  }
  return { card, actions, celebrate, sound };
}
