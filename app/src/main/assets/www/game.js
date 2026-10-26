// A local, simplified fan game. Health values never determine combat strength.
export const dex = {
  1: ["Bisasam", "Pflanze", 2, 16],
  2: ["Bisaknosp", "Pflanze", 3, 32],
  3: ["Bisaflor", "Pflanze"],
  4: ["Glumanda", "Feuer", 5, 16],
  5: ["Glutexo", "Feuer", 6, 36],
  6: ["Glurak", "Feuer"],
  7: ["Schiggy", "Wasser", 8, 16],
  8: ["Schillok", "Wasser", 9, 36],
  9: ["Turtok", "Wasser"],
  10: ["Raupy", "Käfer", 11, 7],
  11: ["Safcon", "Käfer", 12, 10],
  12: ["Smettbo", "Käfer"],
  16: ["Taubsi", "Flug", 17, 18],
  17: ["Tauboga", "Flug", 18, 36],
  18: ["Tauboss", "Flug"],
  25: ["Pikachu", "Elektro", 26, 24],
  26: ["Raichu", "Elektro"],
  129: ["Karpador", "Wasser", 130, 20],
  130: ["Garados", "Wasser"],
  133: ["Evoli", "Normal", 134, 24],
  134: ["Aquana", "Wasser"],
  143: ["Relaxo", "Normal"],
};
export const wild = [10, 16, 25, 129, 133, 143, 1, 4, 7];
export const newGame = (starter, date) => ({
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
export function monster(m) {
  const level = Math.min(100, 5 + Math.floor(m.xp / 20));
  let id = m.base;
  while (dex[id][2] && level >= dex[id][3]) id = dex[id][2];
  return {
    id,
    name: dex[id][0],
    type: dex[id][1],
    level,
    xp: m.xp,
    base: m.base,
  };
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
  return {
    Feuer: "Pflanze",
    Pflanze: "Wasser",
    Wasser: "Feuer",
    Elektro: "Wasser",
    Flug: "Käfer",
  }[a] === b
    ? 1.25
    : 1;
}
export function battle(g, index) {
  const ally = monster(
    g.collection.find((m) => m.base === g.buddy) || g.collection[0],
  );
  const enemyId = wild[(index * 3 + 1) % wild.length],
    enemy = {
      id: enemyId,
      name: dex[enemyId][0],
      type: dex[enemyId][1],
      level: Math.min(90, 5 + index * 2),
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
  return { ally, enemy, maxHp, maxFoe, rounds, won: foe === 0 };
}
export function syncGame(s, date) {
  const g = s.game;
  if (!g || g.paused || date < g.started) return;
  const earned = g.earned[date] || [],
    fresh = quests(s, date).filter((q) => q.done && !earned.includes(q.key));
  if (!fresh.length) return;
  const before = gamePoints(g);
  g.earned[date] = [...earned, ...fresh.map((q) => q.key)];
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
  const after = gamePoints(g);
  for (let i = Math.floor(before / 3) + 1; i <= Math.floor(after / 3); i++) {
    const available = wild.filter(
      (id) => !g.collection.some((m) => m.base === id),
    );
    if (available.length) {
      const base = available[(i - 1) % available.length];
      g.collection.push({ base, xp: 0, caught: date });
      event(
        "catch",
        `${dex[base][0]} ist dir begegnet. Pokéball geworfen – gefangen!`,
        { species: base },
      );
    } else
      event(
        "explore",
        "Dein Team erkundet einen neuen Abschnitt. Alle 9 Entwicklungslinien sind bei dir.",
      );
  }
  for (let i = Math.floor(before / 6) + 1; i <= Math.floor(after / 6); i++) {
    const result = battle(g, g.battles);
    g.battles++;
    if (result.won) g.wins++;
    event(
      "battle",
      result.won
        ? `Dein Team gewinnt Begegnung ${g.battles}!`
        : `Begegnung ${g.battles}: guter Einsatz. Dein Team erholt sich vollständig.`,
      { result },
    );
    if (result.won && g.wins % 3 === 0)
      event("badge", `Abenteuerorden ${g.wins / 3} erhalten!`);
  }
  g.events = g.events.slice(-80);
}
export function validateGame(g) {
  if (g === null || g === undefined) return true;
  const obj = (x) => x && typeof x === "object" && !Array.isArray(x),
    integer = (x, max) => Number.isInteger(x) && x >= 0 && x <= max,
    date = (x) => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x),
    ids = [1, 4, 7, ...wild];
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
    g.collection.length > 9 ||
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
        date(m.caught),
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
