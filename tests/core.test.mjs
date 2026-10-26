import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyState,
  totals,
  number,
  shiftDate,
  weightTrend,
  recipeFood,
  estimate,
  parseBackup,
  parseProduct,
  validateState,
  staples,
} from "../app/src/main/assets/www/core.js";
const valid = () => ({
  ...emptyState(),
  profile: {
    name: "Test",
    height: 180,
    start: 100,
    goal: 90,
    kcal: 2200,
    protein: 140,
    water: 2000,
    sessions: 2,
  },
});
test("decimal comma, zero, finite and missing values", () => {
  assert.equal(number("12,5", 0, 100), 12.5);
  assert.equal(number("0", 0, 100), 0);
  for (const v of ["", NaN, Infinity, -1, 101, "bad"])
    assert.throws(() => number(v, 0, 100));
});
test("portions are normalized per 100g", () => {
  const t = totals([
    { ...staples[0], amount: 50 },
    { ...staples[1], amount: 250 },
  ]);
  assert.equal(t.kcal, 353.5);
  assert.equal(t.protein, 36.75);
  assert.deepEqual(totals([]), {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  });
});
test("recipe uses cooked weight, preserving total nutrition", () => {
  const entries = [
    { ...staples[0], amount: 100 },
    { ...staples[1], amount: 200 },
  ];
  const r = recipeFood("Test", entries, 500);
  assert.equal(r.kcal, 101.2);
  assert.equal(totals([{ ...r, amount: 250 }]).kcal, 253);
  assert.throws(() => recipeFood("bad", entries, 0));
});
test("calendar days across DST and leap day", () => {
  assert.equal(shiftDate("2026-03-29", 1), "2026-03-30");
  assert.equal(shiftDate("2026-10-25", -1), "2026-10-24");
  assert.equal(shiftDate("2024-03-01", -1), "2024-02-29");
});
test("weight trend excludes old and future readings, does not invent missing days", () => {
  assert.equal(
    weightTrend(
      [
        { date: "2026-10-19", value: 105 },
        { date: "2026-10-20", value: 101 },
        { date: "2026-10-26", value: 99 },
        { date: "2026-10-27", value: 80 },
      ],
      "2026-10-26",
    ),
    100,
  );
  assert.equal(weightTrend([]), null);
});
test("estimate validates adults and formula input", () => {
  assert.equal(
    estimate({ weight: 100, height: 180, age: 35, sex: "male", activity: 1.4 }),
    2450,
  );
  assert.throws(() =>
    estimate({ weight: 100, height: 180, age: 15, sex: "male", activity: 1.4 }),
  );
  assert.throws(() =>
    estimate({ weight: 100, height: 180, age: 35, sex: "", activity: 1.4 }),
  );
});
test("backup roundtrip and unsupported/corrupted schemas", () => {
  assert.deepEqual(parseBackup(JSON.stringify(valid())), valid());
  for (const patch of [
    { version: 99 },
    { foods: {} },
    { water: [] },
    { theme: "x" },
    { profile: { name: "x" } },
    { activeWorkout: {} },
    { health: [{ date: "bad" }] },
    {
      entries: [
        { ...staples[0], date: "2026-02-31", meal: "Frühstück", amount: 100 },
      ],
    },
    { weights: [{ date: "2026-02-31", value: 100 }] },
  ])
    assert.throws(() => parseBackup(JSON.stringify({ ...valid(), ...patch })));
  assert.throws(() => parseBackup("x".repeat(10 * 1024 * 1024 + 1)));
});
test("backup rejects duplicate weight dates and invalid nutrient values", () => {
  const s = valid();
  s.weights = [
    { date: "2026-01-01", value: 100 },
    { date: "2026-01-01", value: 99 },
  ];
  assert.throws(() => validateState(s));
  s.weights = [];
  s.foods = [{ ...staples[0], kcal: -1 }];
  assert.throws(() => validateState(s));
});
test("Open Food Facts missing values are not silently treated as complete", () => {
  assert.throws(() => parseProduct({ status: 0 }, "12345678"));
  assert.throws(() =>
    parseProduct(
      { status: 1, product: { nutriments: { "energy-kcal_100g": 100 } } },
      "12345678",
    ),
  );
  const p = parseProduct(
    {
      status: 1,
      product: {
        product_name: "Test",
        nutriments: {
          energy_100g: 418.4,
          proteins_100g: 2,
          carbohydrates_100g: 3,
          fat_100g: 1,
        },
      },
    },
    "12345678",
  );
  assert.equal(Math.round(p.kcal), 100);
  assert.equal(p.fiber, 0);
  assert.match(p.source, /Open Food Facts/);
});
test("health requires paired blood pressure and plausible ordering", () => {
  const s = valid();
  const h = {
    id: "h",
    date: "2026-10-26",
    sleep: null,
    steps: null,
    waist: null,
    sys: 120,
    dia: null,
    pulse: null,
    note: "",
  };
  s.health = [h];
  assert.throws(() => validateState(s));
  h.dia = 80;
  assert.doesNotThrow(() => validateState(s));
  h.sys = 70;
  assert.throws(() => validateState(s));
});
test("active and completed workouts preserve valid sets", () => {
  const s = valid();
  s.activeWorkout = {
    id: "w",
    date: "2026-10-26",
    name: "A",
    note: "",
    started: Date.now(),
    sets: [{ exercise: "Test", kg: 0, reps: 8, done: true }],
  };
  assert.doesNotThrow(() => validateState(s));
  s.activeWorkout.sets[0].reps = 0;
  assert.throws(() => validateState(s));
});
