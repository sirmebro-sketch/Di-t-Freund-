import test from "node:test";
import assert from "node:assert/strict";
import {
  newGame,
  syncGame,
  monster,
  gamePoints,
  battle,
  validateGame,
} from "../app/src/main/assets/www/game.js";
import {
  emptyState,
  staples,
  shiftDate,
  parseBackup,
} from "../app/src/main/assets/www/core.js";
function fixture() {
  return { ...emptyState(), game: newGame(4, "2026-01-01") };
}
function day(s, date) {
  s.entries.push({
    ...staples[0],
    id: date,
    date,
    amount: 100,
    meal: "Frühstück",
  });
  s.checkins[date] = { hunger: 3, fatigue: 2, pain: false };
  s.game.restDays.push(date);
  syncGame(s, date);
}
test("daily points are idempotent and independent of calorie amount, weight or training load", () => {
  const s = fixture();
  day(s, "2026-01-01");
  assert.equal(gamePoints(s.game), 3);
  assert.equal(s.game.collection[0].xp, 30);
  assert.equal(s.game.collection.length, 2);
  s.entries[0].amount = 1000;
  syncGame(s, "2026-01-01");
  assert.equal(gamePoints(s.game), 3);
  assert.equal(s.game.collection[0].xp, 30);
  s.entries = [];
  syncGame(s, "2026-01-01");
  assert.equal(gamePoints(s.game), 3);
});
test("capture, automatic battles, evolution and badges progress without duplicate species", () => {
  const s = fixture();
  for (let i = 0; i < 50; i++) day(s, shiftDate("2026-01-01", i));
  assert.ok(s.game.collection.length > 40);
  assert.equal(
    new Set(s.game.collection.map((m) => m.base)).size,
    s.game.collection.length,
  );
  assert.equal(s.game.battles, 25);
  assert.ok(s.game.wins >= 3);
  assert.equal(monster(s.game.collection[0]).id, 6);
  assert.ok(s.game.events.some((e) => e.kind === "battle"));
  assert.equal(validateGame(s.game), true);
  assert.ok(s.game.events.length <= 80);
});
test("pauses and missing days remove nothing and backdated logs before start do not farm points", () => {
  const s = fixture();
  day(s, "2025-12-30");
  assert.equal(gamePoints(s.game), 0);
  day(s, "2026-01-01");
  s.game.paused = true;
  day(s, "2026-01-02");
  assert.equal(gamePoints(s.game), 3);
  syncGame(s, "2026-02-01");
  assert.equal(gamePoints(s.game), 3);
  assert.equal(s.game.collection[0].xp, 30);
});
test("battle replay is deterministic and never mutates experience or progress", () => {
  const s = fixture();
  day(s, "2026-01-01");
  const before = structuredClone(s.game);
  assert.deepEqual(battle(s.game, 0), battle(s.game, 0));
  assert.deepEqual(s.game, before);
});
test("invalid game saves fail and valid game state survives backup roundtrip", () => {
  const s = fixture();
  day(s, "2026-01-01");
  assert.deepEqual(parseBackup(JSON.stringify(s)).game, s.game);
  for (const mutate of [
    (g) => (g.collection[0].xp = -1),
    (g) => (g.buddy = 999),
    (g) => g.earned["2026-01-01"].push("food"),
    (g) =>
      g.events.push({
        kind: "battle",
        text: "x",
        date: "2026-01-01",
        result: {},
      }),
  ]) {
    const g = structuredClone(s.game);
    mutate(g);
    assert.throws(() => validateGame(g));
  }
});
