import test from "node:test";
import assert from "node:assert/strict";
import {
  pokemon,
  dex,
  newGame,
  syncGame,
  monster,
  gamePoints,
  migrateGame,
  validateGame,
  canEncounter,
  nextChallenge,
  gyms,
  league,
  evolutionPath,
} from "../app/src/main/assets/www/game.js";
import { sprites } from "../app/src/main/assets/www/game-assets.js";
import {
  emptyState,
  staples,
  shiftDate,
  parseBackup,
} from "../app/src/main/assets/www/core.js";
const fixture = (starter) => ({
  ...emptyState(),
  game: newGame(starter, "2026-01-01"),
});
function day(s, i) {
  const d = shiftDate("2026-01-01", i);
  s.entries.push({
    ...staples[0],
    id: "d" + i,
    date: d,
    amount: 100,
    meal: "Frühstück",
  });
  s.checkins[d] = { hunger: 2, fatigue: 2, pain: false };
  s.game.restDays.push(d);
  syncGame(s, d);
  return d;
}
test("all 151 have sprites, German names, Gen-I-only types and valid evolution edges", () => {
  assert.equal(Object.keys(pokemon).length, 151);
  assert.equal(Object.keys(sprites).length, 151);
  for (let i = 1; i <= 151; i++) {
    assert.ok(pokemon[i].name);
    assert.ok(sprites[i].startsWith("data:image/png;base64,"));
    assert.ok(
      !pokemon[i].types.some((t) => ["Fee", "Stahl", "Unlicht"].includes(t)),
    );
    for (const e of pokemon[i].evolutions) assert.ok(pokemon[e.to]);
  }
  assert.equal(pokemon[151].name, "Mew");
  assert.deepEqual(
    pokemon[133].evolutions.map((e) => e.to),
    [134, 135, 136],
  );
});
test("old saves preserve party and experience; generic medals do not become unearned gym badges", () => {
  const s = fixture(4),
    g = s.game;
  g.version = undefined;
  delete g.discovered;
  delete g.badges;
  delete g.leagueWins;
  delete g.legacyRibbons;
  g.collection.push({ base: 133, xp: 500, caught: "2026-01-01" });
  g.collection[0].xp = 700;
  g.battles = 12;
  g.wins = 9;
  const migrated = parseBackup(JSON.stringify(s)).game;
  assert.equal(migrated.collection[0].xp, 700);
  assert.equal(migrated.buddy, 4);
  assert.equal(migrated.legacyRibbons, 3);
  assert.deepEqual(migrated.badges, []);
  assert.ok(
    [4, 5, 6, 133, 134].every((id) => migrated.discovered.includes(id)),
  );
  assert.deepEqual(migrateGame(structuredClone(migrated)), migrated);
});
test("all starters can complete eight gyms, Elite Four and all 151 without time pressure or purchases", () => {
  for (const starter of [1, 4, 7]) {
    const s = fixture(starter);
    for (let i = 0; i < 250; i++) day(s, i);
    assert.equal(s.game.discovered.length, 151);
    assert.deepEqual(
      s.game.badges,
      gyms.map((x) => x.id),
    );
    assert.deepEqual(
      s.game.leagueWins,
      league.map((x) => x.id),
    );
    assert.equal(nextChallenge(s.game), null);
    assert.equal(validateGame(s.game), true);
    assert.deepEqual(parseBackup(JSON.stringify(s)).game, s.game);
  }
});
test("legendary gates require actual badges and championship, not just days", () => {
  const s = fixture(4);
  for (let i = 0; i < 110; i++) day(s, i);
  const g = s.game;
  g.badges = [];
  g.leagueWins = [];
  assert.equal(canEncounter(g, 144), false);
  assert.equal(canEncounter(g, 150), false);
  assert.equal(canEncounter(g, 151), false);
  g.badges = gyms.map((x) => x.id);
  assert.equal(canEncounter(g, 144), true);
  assert.equal(canEncounter(g, 150), false);
  g.leagueWins = league.map((x) => x.id);
  assert.equal(canEncounter(g, 150), true);
  g.discovered = [1, 4, 7];
  assert.equal(canEncounter(g, 151), false);
});
test("Eevee branches are supported while later-generation evolutions stay excluded", () => {
  for (const id of [134, 135, 136])
    assert.equal(monster({ base: 133, xp: 380, choice: id }).id, id);
  assert.deepEqual(evolutionPath({ base: 1, xp: 1000 }), [1, 2, 3]);
  assert.equal(pokemon[42].evolutions.length, 0);
  assert.equal(pokemon[95].evolutions.length, 0);
});
test("badges cannot duplicate or skip order and daily corrections never grant bonus points", () => {
  const s = fixture(7);
  day(s, 0);
  const points = gamePoints(s.game);
  syncGame(s, "2026-01-01");
  assert.equal(gamePoints(s.game), points);
  s.game.badges = ["cascade"];
  assert.throws(() => validateGame(s.game));
  s.game.badges = ["rock", "rock"];
  assert.throws(() => validateGame(s.game));
});
