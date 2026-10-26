import { dex, newGame, monster, gamePoints, quests } from "./game.js";
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
    return `<section class="adventure-teaser ${g.motion ? "" : "still"}">${sprite(m.id)}<div><span class="eyebrow">DEIN ABENTEUER · ${g.paused ? "PAUSIERT" : "LEVEL " + m.level}</span><h2>${m.name} ist an deiner Seite.</h2><p>${g.collection.length} Pokémon · ${g.wins} Siege · ${Math.floor(g.wins / 3)} Orden</p>${btn("Team & Abenteuer öffnen", "game", "primary")}</div></section>`;
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
      `<div class="game-world ${g.motion ? "" : "still"}"><div class="game-topline"><span>ROUTE ${1 + Math.floor(points / 12)} · ${g.paused ? "PAUSE" : "UNTERWEGS"}</span><span>${Math.floor(g.wins / 3)} ◈ ORDEN</span></div><div class="game-scene"><div class="game-cloud cloud-one"></div><div class="game-cloud cloud-two"></div><div class="scene-platform"></div>${sprite(m.id, "companion")}<span class="scene-caption">Jeder kleine Schritt zählt.</span></div><div class="game-status"><div><strong>${m.name}</strong><span>Lv. ${m.level} · ${m.type}</span></div><div class="track"><i style="width:${m.level === 100 ? 100 : (m.xp % 20) * 5}%"></i></div><small>${m.level === 100 ? "Maximales Level erreicht" : `${20 - (m.xp % 20)} EP bis zum nächsten Level`} · EP gelten fürs ganze Team</small></div></div><section class="game-section"><div class="section-head"><h3>Deine heutigen Abenteuerpunkte</h3><strong>${earned.length}/3</strong></div>${quests(
        s,
        today(),
      )
        .map(
          (q) =>
            `<div class="quest"><span class="quest-check" aria-hidden="true">${earned.includes(q.key) ? "✓" : "○"}</span><div><strong>${q.label}</strong><small>${earned.includes(q.key) ? "Erledigt · 10 Team-EP" : "+10 Team-EP"}</small></div>${earned.includes(q.key) ? "" : btn(q.key === "care" ? "Erholung" : "Los", q.action, "secondary", q.key === "care" ? 'aria-label="Bewusste Erholung für heute festhalten"' : "")}</div>`,
        )
        .join(
          "",
        )}<p class="footnote">Eine protokollierte Bewegungseinheit zählt genauso wie bewusste Erholung. Mehr Training, Wasser, Wiegen oder weniger Essen bringen keine Extrapunkte. Einmal erhaltene EP bleiben auch nach Korrekturen erhalten.</p></section><div class="two-grid game-counters"><div class="mini-stat"><small>Nächste Begegnung</small><strong>${3 - (points % 3)} Punkte</strong></div><div class="mini-stat"><small>Nächster automatischer Kampf</small><strong>${6 - (points % 6)} Punkte</strong></div></div><section class="game-section"><h3>Dein Team <small>· ${g.collection.length}/9 Linien</small></h3><p>Wähle deinen Begleiter für die nächste Begegnung. Alle erhalten Erfahrung.</p><div class="team-grid">${g.collection
        .map((x) => {
          const p = monster(x);
          return `<button class="team-mon ${x.base === g.buddy ? "selected" : ""}" data-action="game-buddy" data-id="${x.base}" aria-pressed="${x.base === g.buddy}">${sprite(p.id)}<strong>${p.name}</strong><small>Lv. ${p.level} · ${p.type}</small></button>`;
        })
        .join(
          "",
        )}</div></section><section class="game-section"><h3>Was auf deiner Reise passiert ist</h3>${latest.length ? latest.map((e) => `<article class="game-event">${e.species ? sprite(e.species) : '<span class="event-medal" aria-hidden="true">' + (e.kind === "battle" ? "⚔" : "◈") + "</span>"}<div><small>${esc(e.date)}</small><p>${esc(e.text)}</p>${e.kind === "battle" ? btn("Kampf ansehen", "game-battle", "text-button", `data-index="${g.events.indexOf(e)}"`) : e.species ? btn("Moment ansehen", "game-moment", "text-button", `data-index="${g.events.indexOf(e)}"`) : ""}</div></article>`).join("") : "<p>Dein erstes Kapitel beginnt mit einem kleinen Eintrag.</p>"}</section><div class="toolbar">${btn(g.sound ? "Ton an" : "Ton aus", "game-sound", "secondary", `aria-pressed="${g.sound}"`)}${btn(g.motion ? "Animationen an" : "Animationen aus", "game-motion", "secondary", `aria-pressed="${g.motion}"`)}${btn(g.paused ? "Abenteuer fortsetzen" : "Abenteuer pausieren", "game-pause", "secondary")}</div><details class="below"><summary>Spielregeln & Bild-/Tonquellen</summary><p>Pro 3 Abenteuerpunkten wird eine neue Entwicklungslinie automatisch gefangen, bis alle 9 Linien im Team sind (22 mögliche Formen). Pro 6 Punkten findet ein automatischer Kampf statt. Alle Teammitglieder erhalten 10 EP pro Aufgabe; 20 EP bedeuten ein Level. Nach je 3 Siegen gibt es einen Orden. Der Spielstand wird mit deiner Sicherung exportiert.</p><p>Kämpfe sind kurze lokale Simulationen mit vereinfachtem Typenvorteil. Deine Kalorien, dein Gewicht und deine körperliche Leistung beeinflussen keinen Kampfschaden. Niederlagen kosten nichts. Entwicklungen folgen eigenen vereinfachten Regeln: Pikachu und Evoli entwickeln sich hier mit Level 24 statt mit einem Stein. Kein vollständiges Pokémon-Spiel.</p><p>Sprites: pokemondb.net/sprites (Schwarz/Weiß). Originaleffekte aus Rot/Blau: The Sounds Resource, „General Sound Effects“, hochgeladen von thatrs. Namen und Spielgrafiken bleiben Eigentum ihrer jeweiligen Rechteinhaber. Inoffizielles Fanprojekt.</p></details>`,
    );
    sound("open");
  }
  function replay(index) {
    const g = getState().game,
      e = g?.events[index];
    if (e?.kind !== "battle") return;
    const r = e.result,
      last = r.rounds.at(-1);
    sheet(
      "Automatischer Teamkampf",
      `<div class="battle-view ${g.motion ? "" : "still"}"><p class="eyebrow">AUFZEICHNUNG · KEINE NEUEN EP</p><div class="battle-arena"><div class="fighter">${sprite(r.ally.id)}<strong>${esc(r.ally.name)} · Lv. ${r.ally.level}</strong><span>${last.hp}/${r.maxHp} KP am Ende</span></div><span aria-hidden="true">VS</span><div class="fighter foe">${sprite(r.enemy.id)}<strong>${esc(r.enemy.name)} · Lv. ${r.enemy.level}</strong><span>${last.foe}/${r.maxFoe} KP am Ende</span></div></div><h3>${r.won ? "Geschafft! Dein Team gewinnt." : "Guter Einsatz. Dein Team erholt sich."}</h3><ol class="battle-rounds">${r.rounds.map((round, i) => `<li style="--delay:${i * 0.35}s">${esc(round.text)}<small>Dein Team: ${round.hp} KP · Gegner: ${round.foe} KP</small></li>`).join("")}</ol><p>Nach der Begegnung ist dein Team wieder vollständig erholt.</p>${btn("Zurück zum Abenteuer", "game", "primary")}</div>`,
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
