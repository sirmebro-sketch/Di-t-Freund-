import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyState,
  parseBackup,
  validateState,
  staples,
  shiftDate,
  invalidateCompletedDays,
} from "../app/src/main/assets/www/core.js";
import {
  micros,
  parseMicros,
  microTotals,
  recipeMicros,
  referenceFor,
} from "../app/src/main/assets/www/micros.js";
import {
  ageAt,
  energyModel,
  weeklyReview,
  readiness,
  rememberedAmount,
  trainingRoutines,
} from "../app/src/main/assets/www/coach.js";
const c = () => ({
  birthDate: "1990-06-01",
  sex: "male",
  activity: 1.4,
  location: "both",
  sessions: 2,
  homeMinutes: 30,
  gymMinutes: 60,
  hypertension: false,
  betaBlocker: false,
  trainingCleared: false,
  nutritionCare: false,
  smoker: false,
});
const fixture = () => ({
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
  coach: c(),
});
function history() {
  const s = fixture();
  for (let i = 0; i < 21; i++) {
    const date = shiftDate("2026-10-05", i);
    s.entries.push({
      ...staples[0],
      id: "e" + i,
      kcal: 220,
      amount: 1000,
      date,
      meal: "Frühstück",
    });
    s.completeDays[date] = true;
    s.weights.push({ date, value: 100 - i * 0.07 });
  }
  return s;
}
test("v1 backup migrates without invented health facts or losing entries", () => {
  const s = fixture();
  s.version = 1;
  delete s.coach;
  delete s.favorites;
  delete s.completeDays;
  delete s.checkins;
  delete s.targetHistory;
  s.weights = [{ date: "2026-10-01", value: 100 }];
  const n = parseBackup(JSON.stringify(s));
  assert.equal(n.version, 2);
  assert.equal(n.coach, null);
  assert.deepEqual(n.weights, s.weights);
  assert.deepEqual(n.completeDays, {});
});
test("nutrition unit conversion distinguishes missing values from zero", () => {
  const m = parseMicros({
    "vitamin-c_100g": 0.025,
    "vitamin-b12_100g": 0.000002,
    calcium_100g: 0,
    iron_100g: "garbage",
  });
  assert.equal(m.vitaminC, 25);
  assert.equal(m.vitaminB12, 2);
  assert.equal(m.calcium, 0);
  assert.equal(m.iron, null);
  assert.equal(m.iodine, null);
});
test("partial micro coverage and recipes never invent missing nutrients", () => {
  const entries = [{ amount: 200, micros: { vitaminC: 10 } }, { amount: 100 }];
  assert.deepEqual(microTotals(entries).vitaminC, {
    value: 20,
    known: 1,
    total: 2,
  });
  assert.equal(recipeMicros(entries, 300).vitaminC, null);
  entries[1].micros = { vitaminC: 0 };
  assert.equal(recipeMicros(entries, 400).vitaminC, 5);
  assert.equal(microTotals([]).vitaminC.value, null);
});
test("reference values account for age, smoking and clinical needs", () => {
  const item = micros.find((m) => m.key === "vitaminC"),
    coach = c();
  assert.equal(referenceFor(item, coach, "2026-10-26"), 110);
  coach.smoker = true;
  assert.equal(referenceFor(item, coach, "2026-10-26"), 155);
  coach.nutritionCare = true;
  assert.equal(referenceFor(item, coach, "2026-10-26"), null);
  coach.nutritionCare = false;
  coach.birthDate = "2008-01-01";
  assert.equal(referenceFor(item, coach, "2026-10-26"), null);
});
test("age and energy update with calendar age and latest past weight", () => {
  const s = fixture();
  assert.equal(ageAt("1990-06-01", "2026-05-31"), 35);
  assert.equal(ageAt("1990-06-01", "2026-06-01"), 36);
  const initial = energyModel(s, "2026-10-26");
  s.weights = [
    { date: "2026-10-20", value: 95 },
    { date: "2026-10-27", value: 80 },
  ];
  assert.ok(energyModel(s, "2026-10-26").tdee < initial.tdee);
  assert.equal(energyModel(s, "2026-10-26").weight, 95);
  s.coach.nutritionCare = true;
  assert.equal(energyModel(s), null);
});
test("weekly review waits for complete days and enough measurements", () => {
  const s = fixture();
  assert.equal(weeklyReview(s, "2026-10-26").suggested, null);
  const h = history();
  delete h.completeDays["2026-10-05"];
  delete h.completeDays["2026-10-06"];
  delete h.completeDays["2026-10-07"];
  delete h.completeDays["2026-10-08"];
  assert.equal(weeklyReview(h, "2026-10-26").ready, false);
});
test("adequate history produces a bounded proposal without mutating targets", () => {
  const s = history(),
    r = weeklyReview(s, "2026-10-26");
  assert.ok(r.ready);
  assert.equal(Math.round(r.perWeek * 100), 49);
  assert.equal(r.suggested, 2300);
  assert.equal(s.profile.kcal, 2200);
});
test("recent changes, high hunger, special needs, goal and fast loss suppress proposals", () => {
  for (const mutate of [
    (s) =>
      s.targetHistory.push({
        date: "2026-10-22",
        from: 2300,
        to: 2200,
        reason: "test",
      }),
    (s) => (s.checkins["2026-10-25"] = { hunger: 5, fatigue: 2, pain: false }),
    (s) => (s.coach.nutritionCare = true),
    (s) => (s.profile.goal = 99),
    (s) => s.weights.forEach((w, i) => (w.value = 100 - i * 0.3)),
  ]) {
    const s = history();
    mutate(s);
    assert.equal(weeklyReview(s, "2026-10-26").suggested, null);
  }
});
test("missing coach and plateau never silently prescribe a cut", () => {
  const s = history();
  s.coach = null;
  assert.equal(weeklyReview(s, "2026-10-26").suggested, null);
  s.coach = c();
  s.weights.forEach((w) => (w.value = 100));
  assert.equal(weeklyReview(s, "2026-10-26").suggested, null);
});
test("food edits and deletion reopen a completed day; unchanged foods do not", () => {
  const s = history(),
    n = structuredClone(s);
  n.entries[0].amount = 500;
  invalidateCompletedDays(s, n);
  assert.equal(n.completeDays["2026-10-05"], false);
  assert.equal(n.completeDays["2026-10-06"], true);
  const deleted = structuredClone(s);
  deleted.entries = deleted.entries.filter((e) => e.date !== "2026-10-06");
  invalidateCompletedDays(s, deleted);
  assert.equal(deleted.completeDays["2026-10-06"], false);
});
test("readiness respects recovery and clinical clearance, gym/home are alternatives", () => {
  const s = fixture();
  s.coach.hypertension = true;
  assert.equal(readiness(s).level, "caution");
  s.coach.trainingCleared = true;
  s.checkins["2026-10-26"] = { hunger: 2, fatigue: 5, pain: false };
  assert.equal(readiness(s, "2026-10-26").level, "rest");
  assert.equal(
    trainingRoutines(s, [{ name: "Home", exercises: [] }]).length,
    3,
  );
  s.coach.location = "gym";
  assert.equal(trainingRoutines(s, []).length, 2);
});
test("remembered portions match stable food keys and schema rejects bad micros", () => {
  const s = fixture();
  s.entries = [
    {
      ...staples[0],
      id: "new",
      foodId: staples[0].name,
      amount: 60,
      date: "2026-10-26",
      meal: "Frühstück",
    },
  ];
  assert.equal(rememberedAmount(s, staples[0]), 60);
  s.foods = [{ ...staples[0], micros: { vitaminC: -1 } }];
  assert.throws(() => validateState(s));
});
