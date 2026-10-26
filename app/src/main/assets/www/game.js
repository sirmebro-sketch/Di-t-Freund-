import {validateHatchery} from './egg-game.js';
import {
  activeRegion,
  ensureRegions,
  regionPoints,
  regionProgress,
  regionWorld,
  validateRegions,
} from "./region-progress.js";
// A local, simplified fan game. Health values never determine combat strength.
import { nationalDex as pokemon, catalogSize } from "./game-registry.js";
import {
  ensureCareer,
  emptyCareer,
  progressCareer,
  validateCareer,
  expeditionTypes,
} from "./game-career.js";
import {
  gyms,
  league,
  places,
  placeAt,
  encounters,
  specialGates,
} from "./kanto-world.js";
export { pokemon, gyms, league, places, placeAt };
export const dex = Object.fromEntries(
  Object.entries(pokemon).map(([id, p]) => [
    id,
    [p.name, p.types.join(" / "), p.evolutions[0]?.to, p.evolutions[0]?.level],
  ]),
);
export const wild = Object.keys(pokemon).map(Number);
export const newGame = (starter, date) => ({
  version: 2,
  regions: { kanto: { points: 0 }, johto: null },
  career: emptyCareer(),
  discovered: [starter],
  badges: [],
  leagueWins: [],
  legacyRibbons: 0,
  starter,
  buddy: starter,
  started: date,
  sound: false,
  motion: true,
  paused: false,
  restDays: [],
  earned: {},
  collection: [{ base: starter, xp: 0, caught: date }],
  events: [],
  battles: 0,
  wins: 0,
});
export function evolutionPath(m) {
  const level = Math.min(100, 5 + Math.floor(m.xp / 20)),
    path = [m.base];
  let id = m.base;
  while (pokemon[id]) {
    const choices = pokemon[id].evolutions;
    const e = choices.find((e) => e.to === m.choice) || choices[0];
    if (!e || level < e.level) break;
    id = e.to;
    path.push(id);
  }
  return path;
}
export function monster(m) {
  const id = evolutionPath(m).at(-1);
  return {
    id,
    name: pokemon[id].name,
    type: pokemon[id].types[0],
    types: pokemon[id].types,
    level: Math.min(100, 5 + Math.floor(m.xp / 20)),
    xp: m.xp,
    base: m.base,
    shiny: m.shiny === true && m.useShiny !== false,
  };
}
export function migrateGame(g) {
  if (!g) return g;
  if (g.version === 2) {
    ensureCareer(g);
    ensureRegions(g);
    return g;
  }
  if (g.version !== undefined) throw Error("Unbekannte Abenteuer-Version.");
  // Preserve existing partner, experience, catches, settings and events. Generic ribbons are not gym victories.
  g.version = 2;
  g.discovered = [...new Set(g.collection.flatMap(evolutionPath))].sort(
    (a, b) => a - b,
  );
  g.badges = [];
  g.leagueWins = [];
  g.legacyRibbons = Math.floor(g.wins / 3);
  ensureCareer(g);
  ensureRegions(g);
  return g;
}
export function recordDiscovery(g) {
  g.discovered = [
    ...new Set([...g.discovered, ...g.collection.flatMap(evolutionPath)]),
  ].sort((a, b) => a - b);
}
export function nextChallenge(g) {
  const { gyms, league } = regionWorld(g),
    progress = regionProgress(g);
  const gym = gyms.find((x) => !progress.badges.includes(x.id));
  if (gym) return { ...gym, kind: "gym" };
  const elite = league.find((x) => !progress.leagueWins.includes(x.id));
  return elite ? { ...elite, city: "Indigo-Plateau", kind: "league" } : null;
}
export function canEncounter(g, id) {
  if(id>251)return false;
  const region = id > 151 ? "johto" : "kanto",
    world = regionWorld(g, region),
    progress = regionProgress(g, region),
    points = progress.points;
  if (region === "johto" && !g.regions?.johto) return false;
  const gate = world.specialGates[id];
  if (gate)
    return (
      points >= gate.points &&
      (!gate.badges || progress.badges.length >= gate.badges) &&
      (!gate.champion ||
        progress.leagueWins.includes(region === "kanto" ? "blue" : "lance")) &&
      (!gate.discovered ||
        g.discovered.filter((n) => (region === "kanto" ? n <= 151 : n > 151 && n <= 251))
          .length >= gate.discovered)
    );
  const homes = world.places.filter((p) => p.pool.includes(id));
  return (
    points >= (homes.length ? Math.min(...homes.map((p) => p.points)) : 96)
  );
}
export function encounterLocation(id) {
  if(id>251)return "Über Pokémon-Eier in der Brutstation erreichbar.";
  const region = id > 151 ? "johto" : "kanto",
    world = regionWorld(null, region);
  return (
    world.specialGates[id]?.place ||
    world.places.find((p) => p.pool.includes(id))?.name ||
    `${region === "kanto" ? "Kanto" : "Johto"}-Routen · ab 96 Punkten`
  );
}
export function gamePoints(g) {
  return Object.values(g.earned).reduce((n, a) => n + a.length, 0);
}
export function quests(s, date) {
  return [
    {
      key: "food",
      label: "Etwas ins Ernährungstagebuch eintragen",
      done: s.entries.some((e) => e.date === date),
      action: "add-food",
    },
    {
      key: "check",
      label: "Kurz bei dir selbst einchecken",
      done: !!s.checkins[date],
      action: "checkin",
    },
    {
      key: "care",
      label: "Bewegung oder bewusste Erholung festhalten",
      done:
        s.workouts.some((w) => w.date === date) ||
        !!s.game?.restDays.includes(date),
      action: "game-rest",
    },
  ];
}
function advantage(a, b) {
  const strengths = {
    Normal: [],
    Feuer: ["Pflanze", "Eis", "Käfer"],
    Wasser: ["Feuer", "Boden", "Gestein"],
    Elektro: ["Wasser", "Flug"],
    Pflanze: ["Wasser", "Boden", "Gestein"],
    Eis: ["Pflanze", "Boden", "Flug", "Drache"],
    Kampf: ["Normal", "Eis", "Gestein"],
    Gift: ["Pflanze", "Käfer"],
    Boden: ["Feuer", "Elektro", "Gift", "Gestein"],
    Flug: ["Pflanze", "Kampf", "Käfer"],
    Psycho: ["Kampf", "Gift"],
    Käfer: ["Pflanze", "Gift", "Psycho"],
    Gestein: ["Feuer", "Eis", "Flug", "Käfer"],
    Geist: ["Geist"],
    Drache: ["Drache"],
    Unlicht: ["Psycho", "Geist"],
    Stahl: ["Eis", "Gestein", "Fee"],
    Fee: ["Kampf", "Drache", "Unlicht"],
  };
  return strengths[a]?.includes(b) ? 1.25 : 1;
}
export function battle(g, index, challenge = null) {
  const ally = monster(
    g.collection.find((m) => m.base === g.buddy) || g.collection[0],
  );
  const encounters = regionWorld(g).encounters;
  const trainer = encounters[index % encounters.length];
  const enemyId = challenge?.pokemon || trainer[1],
    enemy = {
      id: enemyId,
      name: dex[enemyId][0],
      type: pokemon[enemyId].types[0],
      level: challenge?.level || Math.min(90, 5 + index * 2),
    };
  let hp = 35 + ally.level * 3,
    foe = 35 + enemy.level * 3;
  const maxHp = hp,
    maxFoe = foe,
    rounds = [];
  for (let i = 0; i < 20 && hp > 0 && foe > 0; i++) {
    const damage = Math.round(
      (8 + ally.level) * advantage(ally.type, enemy.type),
    );
    foe = Math.max(0, foe - damage);
    const hit =
      foe > 0
        ? Math.round((6 + enemy.level) * advantage(enemy.type, ally.type))
        : 0;
    hp = Math.max(0, hp - hit);
    rounds.push({
      text: `${ally.name} trifft für ${damage} KP.${foe > 0 ? ` ${enemy.name} antwortet mit ${hit} KP.` : " Treffer!"} `,
      hp,
      foe,
    });
  }
  return {
    ally,
    enemy,
    maxHp,
    maxFoe,
    rounds,
    won: foe === 0,
    trainer: challenge?.trainer || trainer[0],
    place: challenge?.city || trainer[2],
    challenge: challenge ? { kind: challenge.kind, id: challenge.id } : null,
  };
}
export function syncGame(s, date) {
  const g = s.game;
  if (!g || g.paused || date < g.started) return;
  const earned = g.earned[date] || [],
    fresh = quests(s, date).filter((q) => q.done && !earned.includes(q.key));
  if (!fresh.length) return;
  migrateGame(g);
  const region = activeRegion(g),
    world = regionWorld(g),
    progress = regionProgress(g);
  const before = regionPoints(g);
  g.earned[date] = [...earned, ...fresh.map((q) => q.key)];
  g.regions[region].points += fresh.length;
  const old = new Map(g.collection.map((m) => [m.base, monster(m)]));
  g.collection.forEach(
    (m) => (m.xp = Math.min(20000, m.xp + fresh.length * 10)),
  );
  const event = (kind, text, extra = {}) =>
    g.events.push({ kind, text, date, ...extra });
  event(
    "xp",
    `+${fresh.length * 10} EP für dein Team. Dein Alltag bewegt etwas.`,
  );
  g.collection.forEach((m) => {
    const was = old.get(m.base),
      now = monster(m);
    if (was.id !== now.id)
      event("evolve", `${was.name} entwickelt sich zu ${now.name}!`, {
        species: now.id,
      });
    else if (was.level < now.level)
      event("level", `${now.name} erreicht Level ${now.level}.`, {
        species: now.id,
      });
  });
  recordDiscovery(g);
  const after = regionPoints(g);
  const expedition = progressCareer(g, fresh.length, gamePoints(g), date);
  if (expedition)
    event(
      "research",
      `${expeditionTypes.find((t) => t[0] === expedition)[1]} abgeschlossen! Dein Forschungsalbum wächst.`,
    );
  const oldPlace = world.placeAt(before),
    newPlace = world.placeAt(after);
  if (oldPlace.id !== newPlace.id)
    event(
      "place",
      `${newPlace.name} erreicht. ${newPlace.person} erwartet dich.`,
      { placeId: newPlace.id },
    );
  for (let i = Math.floor(before / 3) + 1; i <= Math.floor(after / 3); i++) {
    const available = wild.filter(
      (id) =>
        (region === "kanto" ? id <= 151 : id > 151 && id <= 251) &&
        !g.discovered.includes(id) &&
        !g.collection.some((m) => m.base === id) &&
        canEncounter(g, id),
    );
    const local = available.filter((id) => newPlace.pool.includes(id));
    const pool = local.length ? local : available;
    if (pool.length) {
      const base = pool[(i - 1) % pool.length];
      g.collection.push({ base, xp: 0, caught: date });
      recordDiscovery(g);
      event(
        "catch",
        `${dex[base][0]} ist dir begegnet. Pokéball geworfen – gefangen!`,
        { species: base },
      );
    } else
      event(
        "explore",
        g.discovered.filter((id) => (region === "kanto" ? id <= 151 : id > 151 && id <= 251))
          .length === (region === "kanto" ? 151 : 100)
          ? `Alle Pokémon dieser Region entdeckt! Deine Forschungsreise geht weiter.`
          : "Dieses Gebiet ist gut erforscht. Auf deiner Reise warten neue Pokémon.",
      );
  }
  for (let i = Math.floor(before / 6) + 1; i <= Math.floor(after / 6); i++) {
    const next = nextChallenge(g),
      challenge = next && after >= next.points ? next : null;
    if (challenge?.id === "blue")
      challenge.pokemon = { 1: 6, 4: 9, 7: 3 }[g.starter];
    const result = battle(g, g.battles, challenge);
    g.battles++;
    if (result.won) g.wins++;
    event(
      "battle",
      result.won
        ? `Sieg gegen ${result.trainer}!`
        : `Begegnung mit ${result.trainer}: Dein Team erholt sich vollständig.`,
      { result },
    );
    if (result.won && challenge) {
      if (challenge.kind === "gym") {
        progress.badges.push(challenge.id);
        event("badge", `${challenge.name} von ${challenge.trainer} erhalten!`, {
          badgeId: challenge.id,
        });
      } else {
        progress.leagueWins.push(challenge.id);
        event(
          "league",
          ["blue", "lance"].includes(challenge.id)
            ? `Du bist ${region === "kanto" ? "Kanto" : "Johto"}-Champ! Willkommen in der Ruhmeshalle.`
            : `${challenge.trainer} besiegt. Der nächste Abschnitt der Liga wartet.`,
          { leagueId: challenge.id },
        );
      }
    }
  }
  g.events = g.events.slice(-80);
}
export function validateGame(g) {
  if (g === null || g === undefined) return true;
  validateHatchery(g.hatchery);
  validateCareer(g.career);
  validateRegions(g);
  const obj = (x) => x && typeof x === "object" && !Array.isArray(x),
    integer = (x, max) => Number.isInteger(x) && x >= 0 && x <= max,
    date = (x) => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x),
    ids = wild;
  if (
    !obj(g) ||
    ![1, 4, 7].includes(g.starter) ||
    !date(g.started) ||
    !["sound", "motion", "paused"].every((k) => typeof g[k] === "boolean") ||
    !Array.isArray(g.restDays) ||
    g.restDays.length > 36500 ||
    !g.restDays.every(date) ||
    !obj(g.earned) ||
    Object.keys(g.earned).length > 36500 ||
    !Array.isArray(g.collection) ||
    !g.collection.length ||
    g.collection.length > catalogSize() ||
    !Array.isArray(g.events) ||
    g.events.length > 80 ||
    !integer(g.battles, 20000) ||
    !integer(g.wins, g.battles)
  )
    throw Error("Ungültiger Abenteuer-Spielstand.");
  if (
    !g.collection.every(
      (m) =>
        obj(m) &&
        ids.includes(m.base) &&
        integer(m.xp, 20000) &&
        (m.shiny === undefined || typeof m.shiny === "boolean") &&
        (m.useShiny === undefined || (typeof m.useShiny === "boolean" && m.shiny === true)) &&
        (m.hatches === undefined || integer(m.hatches, 100000)) &&
        date(m.caught) &&
        (m.choice === undefined ||
          pokemon[m.base].evolutions.some((e) => e.to === m.choice)),
    ) ||
    new Set(g.collection.map((m) => m.base)).size !== g.collection.length ||
    !g.collection.some((m) => m.base === g.buddy)
  )
    throw Error("Ungültiges Pokémon-Team.");
  if (
    !Object.entries(g.earned).every(
      ([d, a]) =>
        date(d) &&
        Array.isArray(a) &&
        a.length <= 3 &&
        new Set(a).size === a.length &&
        a.every((x) => ["food", "check", "care"].includes(x)),
    )
  )
    throw Error("Ungültige Abenteuerpunkte.");
  if (g.version !== undefined) {
    if (
      g.version !== 2 ||
      !Array.isArray(g.discovered) ||
      g.discovered.length > catalogSize() ||
      new Set(g.discovered).size !== g.discovered.length ||
      !g.discovered.every((id) => ids.includes(id)) ||
      !Array.isArray(g.badges) ||
      g.badges.length > 8 ||
      !g.badges.every((id, i) => id === gyms[i].id) ||
      !Array.isArray(g.leagueWins) ||
      g.leagueWins.length > 5 ||
      !g.leagueWins.every((id, i) => id === league[i].id) ||
      (g.leagueWins.length > 0 && g.badges.length !== 8) ||
      !integer(g.legacyRibbons, 20000)
    )
      throw Error("Ungültiger Kanto-Fortschritt.");
  }
  for (const e of g.events) {
    if (
      !obj(e) ||
      ![
        "xp",
        "evolve",
        "level",
        "catch",
        "explore",
        "battle",
        "badge",
        "place",
        "league",
        "research",
        "egg",
        "hatch",
      ].includes(e.kind) ||
      typeof e.text !== "string" ||
      e.text.length > 500 ||
      !date(e.date) ||
      (e.species !== undefined && !dex[e.species])
    )
      throw Error("Ungültiges Abenteuerereignis.");
    if (e.kind === "battle") {
      const r = e.result;
      if (
        r?.trainer !== undefined &&
        (typeof r.trainer !== "string" ||
          r.trainer.length > 100 ||
          typeof r.place !== "string" ||
          r.place.length > 100)
      )
        throw Error("Ungültige Trainerbegegnung.");
      if (
        !obj(r) ||
        typeof r.won !== "boolean" ||
        !integer(r.maxHp, 1000) ||
        !integer(r.maxFoe, 1000) ||
        !Array.isArray(r.rounds) ||
        !r.rounds.length ||
        r.rounds.length > 20 ||
        ![r.ally, r.enemy].every(
          (m) =>
            obj(m) &&
            dex[m.id] &&
            typeof m.name === "string" &&
            m.name.length <= 40 &&
            integer(m.level, 100),
        ) ||
        !r.rounds.every(
          (x) =>
            obj(x) &&
            typeof x.text === "string" &&
            x.text.length <= 500 &&
            integer(x.hp, 1000) &&
            integer(x.foe, 1000),
        )
      )
        throw Error("Ungültiger Kampfbericht.");
    }
  }
  return true;
}
