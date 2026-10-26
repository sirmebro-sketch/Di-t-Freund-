import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyState,
  staples,
  shiftDate,
  parseBackup,
  validateState,
  totals,
} from "../app/src/main/assets/www/core.js";
import {
  newGame,
  syncGame,
  gamePoints,
  validateGame,
  canEncounter,
  monster,
} from "../app/src/main/assets/www/game.js";
import {
  switchRegion,
  regionPoints,
  regionProgress,
} from "../app/src/main/assets/www/region-progress.js";
import { pokemon } from "../app/src/main/assets/www/johto-data.js";
import { sprites } from "../app/src/main/assets/www/johto-assets.js";
import {
  saveMeal,
  addMeal,
  renameMeal,
} from "../app/src/main/assets/www/meal-templates.js";
const start = "2025-01-01";
const state = () => ({ ...emptyState(), game: newGame(4, start) });
function routine(s, i) {
  const date = shiftDate(start, i);
  s.entries.push({
    ...staples[0],
    id: "f" + i,
    date,
    meal: "Frühstück",
    amount: 100,
  });
  s.checkins[date] = { hunger: 2, fatigue: 2, pain: false };
  s.game.restDays.push(date);
  syncGame(s, date);
}
test("Johto has all 100 offline sprites and valid evolution paths including all three Tyrogue choices", () => {
  assert.equal(Object.keys(pokemon).length, 100);
  assert.equal(Object.keys(sprites).length, 100);
  for (let id = 152; id <= 251; id++) {
    assert.ok(pokemon[id].name);
    assert.ok(sprites[id].startsWith("data:image/png;base64,iVBOR"));
    assert.ok(!pokemon[id].types.includes("Fee"));
  }
  assert.equal(pokemon[152].name, "Endivie");
  assert.equal(pokemon[251].name, "Celebi");
  for (const choice of [106, 107, 237])
    assert.equal(monster({ base: 236, xp: 300, choice }).id, choice);
  assert.equal(monster({ base: 172, xp: 1000 }).id, 26);
});
test("every Johto starter can finish all 100 species, eight badges and league while Kanto remains intact", () => {
  for (const starter of [152, 155, 158]) {
    const s = state();
    for (let i = 0; i < 250; i++) routine(s, i);
    const kanto = structuredClone(regionProgress(s.game, "kanto")),
      team = structuredClone(s.game.collection);
    switchRegion(s.game, "johto", starter, shiftDate(start, 250));
    assert.equal(regionPoints(s.game), 0);
    for (let i = 250; i < 500; i++) routine(s, i);
    assert.equal(s.game.discovered.length, 251);
    assert.equal(s.game.regions.johto.badges.length, 8);
    assert.equal(s.game.regions.johto.leagueWins.at(-1), "lance");
    assert.deepEqual(regionProgress(s.game, "kanto"), kanto);
    assert.ok(
      team.every((m) =>
        s.game.collection.some((n) => n.base === m.base && n.xp >= m.xp),
      ),
    );
    assert.equal(validateGame(s.game), true);
    assert.deepEqual(parseBackup(JSON.stringify(s)).game, s.game);
  }
});
test("switching regions cannot double daily rewards or duplicate a starter; fresh region gates are closed", () => {
  const s = state();
  assert.throws(() => switchRegion(s.game, "johto", 152, start));
  for (let i = 0; i < 40; i++) routine(s, i);
  const points = gamePoints(s.game),
    xp = s.game.collection[0].xp;
  switchRegion(s.game, "johto", 152, shiftDate(start, 39));
  syncGame(s, shiftDate(start, 39));
  assert.equal(gamePoints(s.game), points);
  assert.equal(s.game.collection[0].xp, xp);
  assert.equal(regionPoints(s.game), 0);
  assert.equal(canEncounter(s.game, 249), false);
  const size = s.game.collection.length;
  switchRegion(s.game, "kanto", 0, shiftDate(start, 39));
  switchRegion(s.game, "johto", 155, shiftDate(start, 39));
  assert.equal(s.game.collection.length, size);
  routine(s, 40);
  assert.equal(regionPoints(s.game), 3);
  assert.equal(regionPoints(s.game, "kanto"), points);
  s.game.regions.johto.points++;
  assert.throws(() => validateGame(s.game));
});
test("v0.4 migration assigns earned points to Kanto and preserves every existing achievement", () => {
  const s = state();
  for (let i = 0; i < 50; i++) routine(s, i);
  delete s.game.regions;
  const before = structuredClone(s.game);
  const migrated = parseBackup(JSON.stringify(s));
  assert.deepEqual(migrated.game.collection, before.collection);
  assert.deepEqual(migrated.game.badges, before.badges);
  assert.deepEqual(migrated.game.career, before.career);
  assert.equal(migrated.game.regions.kanto.points, 150);
});
const foodFixture = () => {
  const s = emptyState();
  s.entries = [
    {
      ...staples[0],
      id: "entry1",
      foodId: "food1",
      micros: { iron: 2, calcium: null },
      date: start,
      meal: "Frühstück",
      amount: 50,
    },
    {
      ...staples[1],
      id: "entry2",
      date: start,
      meal: "Frühstück",
      amount: 200,
    },
  ];
  return s;
};
test("saved meal snapshots preserve source, micronutrient unknowns and adjusted totals after food changes and backup", () => {
  const s = foodFixture();
  const original = structuredClone(s.entries);
  saveMeal(s, "Mein Frühstück", "Frühstück", start, "meal1");
  s.entries[0].kcal = 10;
  const migrated = parseBackup(JSON.stringify(s));
  assert.equal(migrated.mealTemplates[0].items[0].kcal, original[0].kcal);
  let id = 0;
  addMeal(
    s,
    "meal1",
    { date: "2025-01-02", meal: "Abendessen", amounts: [75, 100] },
    () => `new${id++}`,
  );
  const added = s.entries.slice(-2);
  assert.deepEqual(added[0].micros, { iron: 2, calcium: null });
  assert.equal(added[0].source, original[0].source);
  assert.equal(added[0].foodId, "food1");
  assert.equal(added[0].meal, "Abendessen");
  assert.equal(totals(added).kcal, original[0].kcal * 0.75 + original[1].kcal);
  renameMeal(s, "meal1", "Neuer Name");
  s.mealTemplates = [];
  assert.equal(s.entries.length, 4);
  assert.equal(validateState(s), s);
});
test("invalid template imports and additions fail without partial diary writes; old backups stay valid", () => {
  const s = foodFixture();
  saveMeal(s, "Frühstück", "Frühstück", start, "meal1");
  const before = structuredClone(s);
  for (const amounts of [
    [0, 100],
    [NaN, 100],
    [100, Infinity],
    [100],
    [100, 10001],
  ]) {
    assert.throws(() =>
      addMeal(s, "meal1", { date: start, meal: "Snacks", amounts }),
    );
    assert.deepEqual(s, before);
  }
  assert.throws(() =>
    addMeal(s, "meal1", {
      date: "2025-02-30",
      meal: "Snacks",
      amounts: [100, 100],
    }),
  );
  assert.deepEqual(s, before);
  assert.throws(() =>
    addMeal(
      s,
      "meal1",
      { date: start, meal: "Snacks", amounts: [100, 100] },
      () => s.entries[0].id,
    ),
  );
  assert.deepEqual(s, before);
  for (const change of [
    (t) => (t.items[0].amount = -1),
    (t) => (t.items[0].micros.iron = "2"),
    (t) => (t.name = ""),
    (t) => (t.items = []),
    (t) => (t.items[0].kcal = 2000),
  ]) {
    const bad = structuredClone(s);
    change(bad.mealTemplates[0]);
    assert.throws(() => parseBackup(JSON.stringify(bad)));
  }
  const duplicate = structuredClone(s);
  duplicate.mealTemplates.push(duplicate.mealTemplates[0]);
  assert.throws(() => parseBackup(JSON.stringify(duplicate)));
  delete s.mealTemplates;
  assert.equal(parseBackup(JSON.stringify(s)).entries.length, 2);
});
