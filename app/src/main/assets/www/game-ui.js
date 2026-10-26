import {
  dex,
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
import { sprites, sounds } from "./game-assets.js";
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
}) {
  let playing = null;
  const sprite = (id, cls = "") =>
    `<img class="pokemon-sprite ${cls}" src="${sprites[id]}" alt="${esc(dex[id][0])}" width="96" height="96">`;
  function sound(key) {
    if (!getState().game?.sound) return;
    playing?.pause();
    playing = new Audio(sounds[key]);
    playing.volume = 0.3;
    playing.play().catch(() => {});
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) playing?.pause();
  });
  function card() {
    const g = getState().game;
    if (!g)
      return `<section class="adventure-teaser"><div>${sprite(4)}<span class="eyebrow">DEIN ALLTAG. DEIN ABENTEUER.</span><h2>Ein kleiner Anfang.<br>Ein starkes Team.</h2><p>Fangen, trainieren, entwickeln. Dein Pokémon-Team wächst mit deinen Routinen.</p>${btn("Mein Abenteuer starten", "game", "primary")}</div></section>`;
    const m = monster(g.collection.find((x) => x.base === g.buddy)),
      points = gamePoints(g);
    return `<section class="adventure-teaser ${g.motion ? "" : "still"}">${sprite(m.id)}<div><span class="eyebrow">DEIN ABENTEUER · ${g.paused ? "PAUSIERT" : "LEVEL " + m.level}</span><h2>${m.name} ist an deiner Seite.</h2><p>${g.discovered.length}/151 entdeckt · ${g.badges.length}/8 Orden</p>${btn("Team & Abenteuer öffnen", "game", "primary")}</div></section>`;
  }
  function view() {
    const s = getState(),
      g = s.game;
    if (!g)
      return sheet(
        "Dein Pokémon-Abenteuer",
        `<div class="game-intro"><span class="eyebrow">WÄHLE DEINEN ERSTEN PARTNER</span><h3>Zusammen ist jeder kleine Schritt größer.</h3><p>Du kümmerst dich um dich. Dein Team sammelt dabei automatisch Erfahrung, fängt Pokémon und bestreitet kleine Kämpfe.</p><div class="starter-grid">${[1, 4, 7].map((id) => `<button class="starter" data-action="game-start" data-id="${id}">${sprite(id)}<strong>${dex[id][0]}</strong><small>${dex[id][1]}</small></button>`).join("")}</div><p class="hint">Keine Belohnung für Unteressen, Gewichtsverlust oder extra Training. Kein Verlust bei Pausen. Ernährungseintrag, Check-in und Bewegung oder Erholung zählen jeweils höchstens einmal täglich.</p><p class="footnote">Inoffizieller Fan-Spielteil mit vereinfachten Regeln. Pokémon © Nintendo / Creatures / GAME FREAK. Originalsprites: Pokémon Database. Kurze Originaleffekte: Rot/Blau, The Sounds Resource.</p></div>`,
      );
    const m = monster(g.collection.find((x) => x.base === g.buddy)),
      points = gamePoints(g),
      earned = g.earned[today()] || [],
      latest = g.events
        .filter((e) => !["xp", "level"].includes(e.kind))
        .slice(-8)
        .reverse();
    sheet(
      "Dein Abenteuer",
      `<div class="game-world ${g.motion ? "" : "still"}"><div class="game-topline"><span>${esc(placeAt(points).name.toUpperCase())} · ${g.paused ? "PAUSE" : "UNTERWEGS"}</span><span>${g.badges.length}/8 ◈ ORDEN</span></div><div class="game-scene"><div class="game-cloud cloud-one"></div><div class="game-cloud cloud-two"></div><div class="scene-platform"></div>${sprite(m.id, "companion")}<span class="scene-caption">Jeder kleine Schritt zählt.</span></div><div class="game-status"><div><strong>${m.name}</strong><span>Lv. ${m.level} · ${m.type}</span></div><div class="track"><i style="width:${m.level === 100 ? 100 : (m.xp % 20) * 5}%"></i></div><small>${m.level === 100 ? "Maximales Level erreicht" : `${20 - (m.xp % 20)} EP bis zum nächsten Level`} · EP gelten fürs ganze Team</small></div></div><div class="toolbar game-links">${btn("Pokédex · " + g.discovered.length + "/151", "game-dex", "secondary")}${btn("Kanto-Karte", "game-map", "secondary")}${btn("Orden & Liga", "game-badges", "secondary")}</div><section class="journey-next"><span class="eyebrow">${esc(placeAt(points).person)}</span><p>${esc(placeAt(points).text)}</p>${nextChallenge(g) ? `<strong>Nächstes Ziel: ${esc(nextChallenge(g).trainer)} · ${Math.max(0, nextChallenge(g).points - points)} Punkte bis zur Freigabe</strong><small>Bei Freigabe im nächsten automatischen Kampf. Nach einer Niederlage erneut, ohne Verlust.</small>` : "<strong>Du bist Kanto-Champ. Entdecke die übrigen Pokémon!</strong>"}</section><section class="game-section"><div class="section-head"><h3>Deine heutigen Abenteuerpunkte</h3><strong>${earned.length}/3</strong></div>${quests(
        s,
        today(),
      )
        .map(
          (q) =>
            `<div class="quest"><span class="quest-check" aria-hidden="true">${earned.includes(q.key) ? "✓" : "○"}</span><div><strong>${q.label}</strong><small>${earned.includes(q.key) ? "Erledigt · 10 Team-EP" : "+10 Team-EP"}</small></div>${earned.includes(q.key) ? "" : btn(q.key === "care" ? "Erholung" : "Los", q.action, "secondary", q.key === "care" ? 'aria-label="Bewusste Erholung für heute festhalten"' : "")}</div>`,
        )
        .join(
          "",
        )}<p class="footnote">Eine protokollierte Bewegungseinheit zählt genauso wie bewusste Erholung. Mehr Training, Wasser, Wiegen oder weniger Essen bringen keine Extrapunkte. Einmal erhaltene EP bleiben auch nach Korrekturen erhalten.</p></section><div class="two-grid game-counters"><div class="mini-stat"><small>Nächste Begegnung</small><strong>${g.discovered.length === 151 ? "Alle entdeckt" : 3 - (points % 3) + " Punkte"}</strong></div><div class="mini-stat"><small>Nächster automatischer Kampf</small><strong>${6 - (points % 6)} Punkte</strong></div></div><section class="game-section"><h3>Deine Begleiter <small>· ${g.collection.length} gefangen</small></h3><p>Wähle deinen Begleiter für die nächste Begegnung. Alle erhalten Erfahrung. Weitere findest du im Pokédex.</p><div class="team-grid">${[
        ...g.collection,
      ]
        .sort((a, b) => Number(b.base === g.buddy) - Number(a.base === g.buddy))
        .slice(0, 6)
        .map((x) => {
          const p = monster(x);
          return `<button class="team-mon ${x.base === g.buddy ? "selected" : ""}" data-action="game-buddy" data-id="${x.base}" aria-pressed="${x.base === g.buddy}">${sprite(p.id)}<strong>${p.name}</strong><small>Lv. ${p.level} · ${p.type}</small></button>`;
        })
        .join(
          "",
        )}</div></section><section class="game-section"><h3>Was auf deiner Reise passiert ist</h3>${latest.length ? latest.map((e) => `<article class="game-event">${e.species ? sprite(e.species) : '<span class="event-medal" aria-hidden="true">' + (e.kind === "battle" ? "⚔" : "◈") + "</span>"}<div><small>${esc(e.date)}</small><p>${esc(e.text)}</p>${e.kind === "battle" ? btn("Kampf ansehen", "game-battle", "text-button", `data-index="${g.events.indexOf(e)}"`) : e.species ? btn("Moment ansehen", "game-moment", "text-button", `data-index="${g.events.indexOf(e)}"`) : ""}</div></article>`).join("") : "<p>Dein erstes Kapitel beginnt mit einem kleinen Eintrag.</p>"}</section><div class="toolbar">${btn(g.sound ? "Ton an" : "Ton aus", "game-sound", "secondary", `aria-pressed="${g.sound}"`)}${btn(g.motion ? "Animationen an" : "Animationen aus", "game-motion", "secondary", `aria-pressed="${g.motion}"`)}${btn(g.paused ? "Abenteuer fortsetzen" : "Abenteuer pausieren", "game-pause", "secondary")}</div><details class="below"><summary>Spielregeln & Bild-/Tonquellen</summary><p>Pro 3 Punkten wird automatisch ein noch nicht entdecktes, freigeschaltetes Pokémon gefangen. Entwicklungen registrieren jede Zwischenform im Pokédex. Alle 151 Kanto-Pokémon sind erreichbar. Pro 6 Punkten findet ein Kampf statt; freigegebene Arenen und danach die Top Vier haben Vorrang.</p><p>Alle Begleiter erhalten 10 EP je täglicher Aufgabe; 20 EP bedeuten ein Level. Kein Punkteverlust bei Pausen oder Niederlagen. Acht Arenaorden werden einzeln durch Siege verdient. Alte Abenteuerorden bleiben als Erinnerungsbänder erhalten: ${g.legacyRibbons}.</p><p>Vereinfachte eigene Kampfregeln mit jeweils einem Signatur-Pokémon des Trainers. Stein-Entwicklungen erfolgen hier automatisch auf Level 24, Tausch-Entwicklungen auf Level 32. Evoli: Wunschentwicklung vor Level 24 wählen; alle drei Formen sind zusätzlich einzeln fangbar. Keine Originalspiel-Kopie, kein vollständiges Kampfsystem.</p><p>Sprites: Pokémon Database / PokeAPI, Schwarz/Weiß. Deutsche Namen und Gen-I-Daten: PokeAPI. Kurze Originaleffekte: Rot/Blau, The Sounds Resource. Pokémon © Nintendo / Creatures / GAME FREAK. Inoffizielles Fanprojekt.</p></details>`,
    );
    sound("open");
  }
  function dexView() {
    sheet(
      "Kanto-Pokédex",
      `<p>Alle 151 Pokémon der ersten Generation. Entdeckte Formen bleiben dauerhaft eingetragen.</p><label>Pokémon suchen<input id="dex-search" type="search" placeholder="Name oder Pokédex-Nummer" autocomplete="off"></label><div class="two-grid"><label>Entdeckung<select id="dex-status"><option value="all">Alle Pokémon</option><option value="found">Entdeckt</option><option value="missing">Noch nicht entdeckt</option></select></label><label>Typ<select id="dex-type"><option value="all">Alle Typen</option>${[
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
  function dexResults() {
    const grid = document.querySelector("#dex-grid");
    if (!grid) return;
    const query = document
        .querySelector("#dex-search")
        .value.trim()
        .toLocaleLowerCase("de"),
      status = document.querySelector("#dex-status").value,
      type = document.querySelector("#dex-type").value,
      g = getState().game;
    const ids = Object.keys(pokemon)
      .map(Number)
      .filter(
        (id) =>
          (pokemon[id].name.toLocaleLowerCase("de").includes(query) ||
            String(id).padStart(3, "0").includes(query.replace(/^#/, ""))) &&
          (status === "all" ||
            (status === "found") === g.discovered.includes(id)) &&
          (type === "all" || pokemon[id].types.includes(type)),
      );
    document.querySelector("#dex-count").textContent =
      `${ids.length} Treffer · ${g.discovered.length}/151 entdeckt`;
    grid.innerHTML =
      ids
        .map(
          (id) =>
            `<button class="dex-mon ${g.discovered.includes(id) ? "discovered" : "undiscovered"}" data-action="game-species" data-id="${id}"><small>#${String(id).padStart(3, "0")} · ${g.discovered.includes(id) ? "✓" : "offen"}</small>${sprite(id)}<strong>${esc(pokemon[id].name)}</strong><small>${esc(pokemon[id].types.join(" / "))}</small></button>`,
        )
        .join("") || "<p>Keine passenden Pokémon gefunden.</p>";
  }
  document.addEventListener("input", (e) => {
    if (["dex-search", "dex-status", "dex-type"].includes(e.target.id))
      dexResults();
  });
  document.addEventListener("change", (e) => {
    if (["dex-status", "dex-type"].includes(e.target.id)) dexResults();
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
      `<div class="species-hero">${sprite(id)}<div><span class="eyebrow">${g.discovered.includes(id) ? "IM POKÉDEX ENTDECKT" : "NOCH NICHT ENTDECKT"}</span><h3>${esc(p.name)}</h3><p>${esc(p.types.join(" / "))}</p></div></div><section class="card"><h3>Auf deiner Reise</h3><p>${esc(encounterLocation(id))}</p><p>${canEncounter(g, id) ? "Als Begegnung freigeschaltet. Noch nicht entdeckte Formen werden bevorzugt." : "Diese Begegnung wird im weiteren Reiseverlauf freigeschaltet."}</p>${p.special ? `<p class="hint">${id === 151 ? "Mew: nach dem Champ, ab 300 Punkten und 100 entdeckten Formen." : id === 150 ? "Mewtu: nach dem Champ, ab 264 Punkten." : id === 144 ? "Arktos: ab 180 Punkten und sechs Orden." : id === 145 ? "Zapdos: ab 204 Punkten und acht Orden." : "Lavados: ab 216 Punkten und acht Orden."}</p>` : ""}${active ? `<p>Dein Begleiter aus diesem Fang: <strong>${esc(active.name)}</strong> · Level ${active.level}</p>${btn("Als Begleiter wählen", "game-buddy", "primary", `data-id="${member.base}"`)}` : ""}</section><section class="game-section"><h3>Entwicklungen in Kanto</h3>${p.evolutions.length ? p.evolutions.map((e) => `<button class="evolution-row" data-action="game-species" data-id="${e.to}">${sprite(e.to)}<span><strong>${esc(pokemon[e.to].name)}</strong><small>Original: ${esc(e.original)}<br>In dieser App: Level ${e.level}${e.kind === "level" ? "" : " · vereinfacht, ohne Gegenstand/Tausch"}</small></span></button>`).join("") : "<p>Keine weitere Entwicklung innerhalb der ersten Generation.</p>"}${id === 133 && member && active.level < 24 ? `<p>Wähle Evolis Wunschentwicklung, bevor Level 24 erreicht ist:</p><div class="toolbar">${[134, 135, 136].map((choice) => btn(pokemon[choice].name, "game-evolution", "secondary", `data-id="${choice}" aria-pressed="${(member.choice || 134) === choice}"`)).join("")}</div>` : ""}</section>${btn("Zurück zum Pokédex", "game-dex", "secondary")}`,
    );
  }
  function mapView() {
    const g = getState().game,
      points = gamePoints(g),
      current = placeAt(points);
    sheet(
      "Deine Reise durch Kanto",
      `<div class="kanto-banner"><span class="eyebrow">${points} ABENTEUERPUNKTE</span><h3>${esc(current.name)}</h3><p>${esc(current.person)} · ${esc(current.text)}</p></div><p>Eine vereinfachte Reisekarte: Orte öffnen sich durch deine täglichen Routinen. Arena- und Liga-Siege werden separat verdient.</p><ol class="kanto-route">${places.map((p, i) => `<li class="${points >= p.points ? "visited" : "future"} ${current.id === p.id ? "current" : ""}"><button data-action="game-place" data-id="${p.id}" ${current.id === p.id ? 'aria-current="step"' : ""}><span class="route-node" aria-hidden="true">${points >= p.points ? "✓" : i + 1}</span><span><strong>${esc(p.name)}</strong><small>${esc(p.person)} · ${points >= p.points ? "Erreicht" : `ab ${p.points} Punkten`}</small></span></button></li>`).join("")}</ol>${btn("Zurück zum Abenteuer", "game", "secondary")}`,
    );
  }
  function placeView(id) {
    const p = places.find((p) => p.id === id),
      g = getState().game;
    if (!p) return;
    const open = gamePoints(g) >= p.points;
    sheet(
      p.name,
      `<span class="eyebrow">${esc(p.person)}</span><p>${esc(p.text)}</p><p class="hint">${open ? "Dieses Reiseziel hast du erreicht." : `Noch ${p.points - gamePoints(g)} Punkte bis zu diesem Reiseziel.`} Seltene Pokémon können zusätzliche Orden oder den Champ voraussetzen.</p><h3>Passende Begegnungen</h3><div class="team-grid">${p.pool.map((id) => `<button class="team-mon" data-action="game-species" data-id="${id}">${sprite(id)}<strong>${esc(pokemon[id].name)}</strong><small>${g.discovered.includes(id) ? "Entdeckt" : "Noch offen"}</small></button>`).join("")}</div><div class="toolbar">${btn("Zurück zur Kanto-Karte", "game-map", "secondary")}${btn("Orden & Liga", "game-badges", "secondary")}</div>`,
    );
  }
  function badgeView() {
    const g = getState().game,
      next = nextChallenge(g);
    sheet(
      "Orden, Top Vier & Ruhmeshalle",
      `<div class="kanto-banner"><span class="eyebrow">DEINE KANTO-LIGA</span><h3>${g.badges.length}/8 Arenaorden</h3><p>${g.leagueWins.includes("blue") ? "Kanto-Champ! Dein Platz in der Ruhmeshalle bleibt erhalten." : next ? `Nächster Gegner: ${next.trainer}. Freigabe ab ${next.points} Punkten.` : ""}</p></div><div class="badge-grid">${gyms.map((gym) => `<article class="badge-card">${badgeSvg(gym, g.badges.includes(gym.id))}<h3>${gym.name}</h3><strong>${gym.trainer}</strong><small>${gym.city} · ${gym.type}</small><p>${g.badges.includes(gym.id) ? "✓ Verdient" : `Ab ${gym.points} Punkten · Sieg erforderlich`}</p>${sprite(gym.pokemon)}</article>`).join("")}</div><h3 class="below">Top Vier & Champ</h3><p>Nach allen acht Orden folgen diese fünf Begegnungen der Reihe nach. Dein Fortschritt bleibt auch nach einer Niederlage erhalten.</p>${league.map((t) => `<div class="league-row">${sprite(t.id === "blue" ? { 1: 6, 4: 9, 7: 3 }[g.starter] : t.pokemon)}<div><strong>${t.trainer}</strong><small>${t.type} · ab ${t.points} Punkten</small><p>${g.leagueWins.includes(t.id) ? "✓ Besiegt" : "Noch vor dir"}</p></div></div>`).join("")}<p class="footnote">Vereinfachte Begegnungen mit je einem Signatur-Pokémon. Alte Erinnerungsbänder aus Version 0.2: ${g.legacyRibbons}. Diese ersetzen keine Arena-Siege.</p>${btn("Zurück zum Abenteuer", "game", "secondary")}`,
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
      `<div class="battle-view ${g.motion ? "" : "still"}"><p class="eyebrow">AUFZEICHNUNG · KEINE NEUEN EP</p>${r.trainer ? `<h3>${esc(r.trainer)}</h3><p>${esc(r.place)}</p>` : ""}<div class="battle-arena"><div class="fighter">${sprite(r.ally.id)}<strong>${esc(r.ally.name)} · Lv. ${r.ally.level}</strong><span>${last.hp}/${r.maxHp} KP am Ende</span></div><span aria-hidden="true">VS</span><div class="fighter foe">${sprite(r.enemy.id)}<strong>${esc(r.enemy.name)} · Lv. ${r.enemy.level}</strong><span>${last.foe}/${r.maxFoe} KP am Ende</span></div></div><h3>${r.won ? "Geschafft! Dein Team gewinnt." : "Guter Einsatz. Dein Team erholt sich."}</h3><ol class="battle-rounds">${r.rounds.map((round, i) => `<li style="--delay:${i * 0.35}s">${esc(round.text)}<small>Dein Team: ${round.hp} KP · Gegner: ${round.foe} KP</small></li>`).join("")}</ol><p>Nach der Begegnung ist dein Team wieder vollständig erholt.</p>${btn("Zurück zum Abenteuer", "game", "primary")}</div>`,
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
    "game-dex": () => dexView(),
    "game-map": mapView,
    "game-badges": badgeView,
    "game-species": (b) => speciesView(Number(b.dataset.id)),
    "game-place": (b) => placeView(b.dataset.id),
    "game-evolution": (b) => {
      const m = getState().game?.collection.find((m) => m.base === 133);
      const choice = Number(b.dataset.id);
      if (!m || monster(m).level >= 24 || ![134, 135, 136].includes(choice))
        return;
      if (
        commit(
          (s) =>
            (s.game.collection.find((m) => m.base === 133).choice = choice),
        )
      )
        speciesView(133);
    },
    "game-start": (b) => {
      const id = Number(b.dataset.id);
      if (getState().game || ![1, 4, 7].includes(id)) return;
      change((s) => (s.game = newGame(id, today())));
    },
    "game-buddy": (b) => {
      const id = Number(b.dataset.id);
      if (!getState().game?.collection.some((m) => m.base === id)) return;
      change((s) => (s.game.buddy = id));
    },
    "game-rest": () => {
      if (!getState().game) return;
      change((s) => {
        if (!s.game.restDays.includes(today())) s.game.restDays.push(today());
      });
      notify("Bewusste Erholung festgehalten.");
    },
    "game-sound": () => {
      change((s) => (s.game.sound = !s.game.sound));
      if (!getState().game.sound) playing?.pause();
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
        `<div class="game-world ${g.motion ? "" : "still"}"><div class="game-scene">${sprite(e.species, "companion")}<div class="catch-ball" aria-hidden="true"></div></div><div class="game-status"><h3>${esc(e.text)}</h3><p>Dieser Moment gehört zu deiner Reise. Wiederansehen verändert deinen Spielstand nicht.</p>${btn("Zurück zum Team", "game", "primary")}</div></div>`,
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
