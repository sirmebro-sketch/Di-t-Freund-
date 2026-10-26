import {recipeParts,parseParts,validateParts} from './nutrient-parts.js';
import { validateTrainingExtras } from './training.js';
import { validateAudio } from './atmosphere-settings.js';
import { validateTemplates } from "./meal-templates.js";
import { validatePersonalPlan } from "./personal-plan.js";
import { validateConnection } from "./health-sync.js";
import { validateGame, migrateGame } from "./game.js";
import { micros, parseMicros, recipeMicros } from "./micros.js";
export const VERSION = 2;
export const meals = ["Frühstück", "Mittagessen", "Abendessen", "Snacks"];
export const nutrients = ["kcal", "protein", "carbs", "fat", "fiber"];
export const uid = () => globalThis.crypto.randomUUID();
export function today(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function shiftDate(date, days) {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);
  return today(d);
}
export function number(value, min, max, label = "Wert") {
  if (String(value).trim() === "") throw Error(`${label} fehlt.`);
  const n = Number(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n < min || n > max)
    throw Error(`${label}: bitte ${min} bis ${max} eingeben.`);
  return n;
}
export const emptyState = () => ({
  version: VERSION,
  profile: null,
  foods: [],
  mealTemplates: [],
  entries: [],
  weights: [],
  health: [],
  water: {},
  workouts: [],
  activeWorkout: null,
  theme: "light",
  coach: null,
  game: null,
  favorites: [],
  completeDays: {},
  checkins: {},
  targetHistory: [],
});
export function totals(entries) {
  return entries.reduce(
    (a, e) => {
      nutrients.forEach((k) => (a[k] += ((e[k] || 0) * e.amount) / 100));
      return a;
    },
    Object.fromEntries(nutrients.map((k) => [k, 0])),
  );
}
export function estimate({ weight, height, age, sex, activity }) {
  weight = number(weight, 35, 350, "Gewicht");
  height = number(height, 130, 230, "Größe");
  age = number(age, 18, 100, "Alter");
  if (!["male", "female"].includes(sex))
    throw Error("Bitte Berechnungsgrundlage wählen.");
  activity = number(activity, 1.2, 1.8, "Aktivität");
  const bmr =
    10 * weight + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161);
  return Math.round(Math.max(1500, bmr * activity - 300) / 50) * 50;
}
export function recipeFood(name, ingredients, cookedWeight) {
  const t = totals(ingredients);
  const weight = number(cookedWeight, 1, 20000, "Gesamtgewicht");
  return {
    id: uid(),
    name,
    micros: recipeMicros(ingredients, weight),
    ...recipeParts(ingredients,weight),
    fiberKnown: ingredients.every(e => e.fiberKnown !== false && !(e.fiberKnown === undefined && e.fiber === 0 && e.source?.includes("Open Food Facts"))),
    source: ingredients.some((i) => i.source.includes("ODbL"))
      ? "Rezept · mit Open Food Facts (ODbL)"
      : "Eigenes Rezept",
    ...Object.fromEntries(
      nutrients.map((k) => [k, Math.round((t[k] / weight) * 1000) / 10]),
    ),
  };
}
export function weightTrend(weights, date = today()) {
  const points = weights.filter(
    (w) => w.date <= date && w.date >= shiftDate(date, -6),
  );
  return points.length
    ? points.reduce((a, w) => a + w.value, 0) / points.length
    : null;
}
export function parseProduct(data, code) {
  if (data.status !== 1 || !data.product)
    throw Error("Produkt nicht gefunden. Bitte selbst anlegen.");
  const p = data.product,
    n = p.nutriments || {};
  const keys = {
    kcal: "energy-kcal_100g",
    protein: "proteins_100g",
    carbs: "carbohydrates_100g",
    fat: "fat_100g",
    fiber: "fiber_100g",
  };
  if (n[keys.kcal] === undefined && n['energy-kj_100g'] !== undefined)
    n[keys.kcal] = number(n['energy-kj_100g'],0,4184,'Energie') / 4.184;
  else if (n[keys.kcal] === undefined && n.energy_100g !== undefined)
    n[keys.kcal] = number(n.energy_100g,0,4184,'Energie') / (n.energy_unit==='kcal'?1:4.184);
  for (const k of ["kcal", "protein", "carbs", "fat"])
    if (n[keys[k]] === undefined || n[keys[k]] === null)
      throw Error(
        "Nährwerte unvollständig. Bitte Packungsangaben manuell erfassen.",
      );
  return {
    id: uid(),
    name: String(p.product_name_de || p.product_name || "Produkt").slice(
      0,
      100,
    ),
    source: "Open Food Facts · ODbL",
    barcode: code,
    fiberKnown: n.fiber_100g !== undefined && n.fiber_100g !== null && n.fiber_100g !== "",
    micros: parseMicros(n),
    ...parseParts(n),
    ...Object.fromEntries(
      nutrients.map((k) => [
        k,
        number(k === "fiber" && (n[keys[k]] === undefined || n[keys[k]] === null || n[keys[k]] === "") ? 0 : n[keys[k]], 0, k === "kcal" ? 1000 : 100, k),
      ]),
    ),
  };
}
function text(v, max = 200) {
  return typeof v === "string" && v.length <= max;
}
function finite(v, min, max) {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}
function date(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + "T12:00:00Z");
  return !isNaN(d) && d.toISOString().slice(0, 10) === v;
}
function assert(ok) {
  if (!ok)
    throw Error(
      "Sicherung ungültig oder aus einer nicht unterstützten Version.",
    );
}
export function validateState(s) {
  validateAudio(s?.audioSettings);
  validateTrainingExtras(s || {});
  if (s?.personalPlan != null) validatePersonalPlan(s.personalPlan);
  validateGame(s?.game);
  validateConnection(s?.healthConnect);
  assert(s && s.version === VERSION && ["light", "dark"].includes(s.theme));
  assert(
    Array.isArray(s.favorites) &&
      s.favorites.length <= 5000 &&
      s.favorites.every((x) => text(x, 100)),
  );
  for (const map of [s.completeDays, s.checkins])
    assert(map && typeof map === "object" && !Array.isArray(map));
  Object.entries(s.completeDays).forEach(([d, v]) =>
    assert(date(d) && typeof v === "boolean"),
  );
  Object.entries(s.checkins).forEach(([d, c]) =>
    assert(
      date(d) &&
        c &&
        finite(c.hunger, 1, 5) &&
        finite(c.fatigue, 1, 5) &&
        typeof c.pain === "boolean",
    ),
  );
  assert(Array.isArray(s.targetHistory) && s.targetHistory.length <= 5000);
  s.targetHistory.forEach((h) =>
    assert(
      date(h.date) &&
        finite(h.from, 1500, 6000) &&
        finite(h.to, 1500, 6000) &&
        text(h.reason, 300),
    ),
  );
  const c = s.coach;
  if (c !== null) {
    assert(
      c &&
        date(c.birthDate) &&
        ["male", "female", "unspecified"].includes(c.sex) &&
        finite(c.activity, 1.2, 1.8) &&
        ["gym", "home", "both"].includes(c.location) &&
        finite(c.homeMinutes, 15, 60) &&
        finite(c.gymMinutes, 30, 120) &&
        Number.isInteger(c.sessions) &&
        finite(c.sessions, 2, 3),
    );
    for (const k of [
      "hypertension",
      "betaBlocker",
      "nutritionCare",
      "trainingCleared",
      "smoker",
    ])
      assert(typeof c[k] === "boolean");
  }
  const p = s.profile;
  assert(
    p === null ||
      (text(p.name, 60) &&
        finite(p.height, 130, 230) &&
        finite(p.start, 35, 350) &&
        finite(p.goal, 35, 350) &&
        finite(p.kcal, 1500, 6000) &&
        finite(p.protein, 30, 300) &&
        finite(p.water, 500, 5000) &&
        finite(p.sessions, 1, 7)),
  );
  for (const k of ["foods", "entries", "weights", "health", "workouts"])
    assert(Array.isArray(s[k]) && s[k].length <= 50000);
  function food(f) {
    assert(f && text(f.id, 100) && text(f.name, 100) && text(f.source, 100));
    nutrients.forEach((k) =>
      assert(finite(f[k], 0, k === "kcal" ? 1000 : 100)),
    );
    validateParts(f);
    if (f.fiberKnown !== undefined) assert(typeof f.fiberKnown === "boolean");
    if (f.micros !== undefined) {
      assert(
        f.micros && typeof f.micros === "object" && !Array.isArray(f.micros),
      );
      for (const [k, v] of Object.entries(f.micros))
        assert(
          micros.some((m) => m.key === k) && (v === null || finite(v, 0, 1e7)),
        );
    }
    if (f.foodId !== undefined) assert(text(f.foodId, 100));
    if (f.barcode !== undefined) assert(/^\d{8,14}$/.test(f.barcode));
  }
  validateTemplates(s.mealTemplates, food);
  for(const key of ["foods","entries","health","workouts"])assert(s[key].every(e=>e&&typeof e.id==="string"&&e.id.length>0)&&new Set(s[key].map(e=>e.id)).size===s[key].length);
  s.foods.forEach(food);
  s.entries.forEach((e) => {
    food(e);
    assert(
      date(e.date) && meals.includes(e.meal) && finite(e.amount, 1, 10000),
    );
  });
  s.weights.forEach((w) => assert(date(w.date) && finite(w.value, 35, 350)));
  assert(new Set(s.weights.map((w) => w.date)).size === s.weights.length);
  s.health.forEach((h) => {
    assert(text(h.id, 100) && date(h.date) && text(h.note, 1000));
    for (const [k, min, max] of [
      ["sleep", 0, 24],
      ["steps", 0, 100000],
      ["waist", 30, 250],
      ["sys", 60, 260],
      ["dia", 30, 180],
      ["pulse", 25, 220],
    ])
      assert(h[k] === null || finite(h[k], min, max));
    assert((h.sys === null) === (h.dia === null));
    if (h.sys !== null) assert(h.sys > h.dia);
  });
  assert(s.water && typeof s.water === "object" && !Array.isArray(s.water));
  Object.entries(s.water).forEach(([d, v]) =>
    assert(date(d) && finite(v, 0, 10000)),
  );
  function workout(w, active = false) {
    assert(
      w &&
        text(w.id, 100) &&
        date(w.date) &&
        text(w.name, 100) &&
        Array.isArray(w.sets) &&
        w.sets.length <= 500 &&
        text(w.note, 1000),
    );
    w.sets.forEach((e) =>
      assert(
        text(e.exercise, 100) &&
          finite(e.kg, 0, 500) &&
          finite(e.reps, 1, 100) &&
          typeof e.done === "boolean",
      ),
    );
    if (w.effort !== undefined) assert(finite(w.effort, 1, 10));
    if (active) assert(finite(w.started, 0, 9e15));
    else assert(finite(w.minutes, 0, 1440));
  }
  s.workouts.forEach((w) => workout(w));
  if (s.activeWorkout !== null) workout(s.activeWorkout, true);
  return s;
}
export function parseBackup(raw) {
  if (raw.length > 10 * 1024 * 1024)
    throw Error("Sicherung ist zu groß (max. 10 MB).");
  const parsed = JSON.parse(raw);
  if (parsed?.version === 1) {
    parsed.version = VERSION;
    parsed.coach = null;
    parsed.favorites = [];
    parsed.completeDays = {};
    parsed.checkins = {};
    parsed.targetHistory = [];
  }
  if (parsed && parsed.game === undefined) parsed.game = null;
  validateState(parsed);
  migrateGame(parsed.game);
  return validateState(parsed);
}
// Approximate generic examples, not a branded or scraped food database. Packaging takes precedence.
export const staples = [
  ["Haferflocken, trocken", 372, 13.5, 58.7, 7, 10],
  ["Magerquark", 67, 12, 4, 0.2, 0],
  ["Skyr natur", 63, 11, 4, 0.2, 0],
  ["Banane, ohne Schale", 89, 1.1, 20, 0.3, 2.6],
  ["Apfel", 52, 0.3, 12, 0.2, 2.4],
  ["Kartoffeln, gekocht", 73, 2, 15, 0.1, 1.8],
  ["Reis, gekocht", 130, 2.7, 28, 0.3, 0.4],
  ["Vollkornnudeln, gekocht", 140, 5.5, 26, 1.1, 4],
  ["Hähnchenbrust, gegart", 165, 31, 0, 3.6, 0],
  ["Tofu natur", 144, 15, 1, 8.5, 1],
  ["Linsen, gekocht", 116, 9, 20, 0.4, 8],
  ["Ei, gekocht", 155, 13, 1.1, 11, 0],
  ["Brokkoli, gegart", 35, 2.4, 4, 0.4, 3.3],
  ["Tomaten", 18, 0.9, 2.6, 0.2, 1.2],
  ["Gurke", 12, 0.6, 1.8, 0.2, 0.5],
  ["Vollkornbrot", 220, 8, 39, 3, 7],
  ["Gouda", 356, 25, 0, 27, 0],
  ["Olivenöl", 884, 0, 0, 100, 0],
  ["Mandeln", 579, 21, 7, 50, 12],
  ["Milch 1,5 % (pro 100 ml)", 47, 3.4, 4.9, 1.5, 0],
].map(([name, kcal, protein, carbs, fat, fiber], i) => ({
  id: `base-${i}`,
  name,
  kcal,
  protein,
  carbs,
  fat,
  fiber,
  source: "Orientierungswert · bitte Etikett prüfen",
}));
export const routines = [
  {
    name: "Ganzkörper A",
    subtitle: "Ruhiger Einstieg · 5 Übungen",
    exercises: [
      "Kniebeuge zum Stuhl",
      "Rudern mit Band",
      "Liegestütz an der Wand",
      "Hüftheben",
      "Dead Bug",
    ],
  },
  {
    name: "Ganzkörper B",
    subtitle: "Abwechslung · 5 Übungen",
    exercises: [
      "Aufstehen vom Stuhl",
      "Rudern mit Kurzhantel",
      "Brustdrücken mit Kurzhanteln",
      "Hüftbeuge ohne Gewicht",
      "Bird Dog",
    ],
  },
];
export const cues = {
  "Kniebeuge zum Stuhl":
    "Langsam absetzen und kontrolliert aufstehen. Stuhl gegen Verrutschen sichern.",
  "Rudern mit Band":
    "Band sicher befestigen. Ellbogen nach hinten ziehen, Schultern locker.",
  "Liegestütz an der Wand":
    "Hände auf Brusthöhe. Körper gerade, gleichmäßig atmen.",
  Hüftheben: "Rückenlage, Füße aufstellen. Hüfte kontrolliert anheben.",
  "Dead Bug":
    "Rückenlage. Gegengleichen Arm und Fuß langsam bewegen, Rücken ruhig halten.",
  "Aufstehen vom Stuhl": "Stabilen Stuhl nutzen. Knie folgen der Fußrichtung.",
  "Rudern mit Kurzhantel":
    "Oberkörper abstützen. Hantel kontrolliert zur Hüfte ziehen.",
  "Brustdrücken mit Kurzhanteln":
    "Leichte Gewichte, sicher auf dem Boden liegend. Ruhig ausatmen beim Drücken.",
  "Hüftbeuge ohne Gewicht":
    "Hüfte nach hinten schieben. Rücken neutral, Bewegung klein beginnen.",
  "Bird Dog":
    "Vierfüßlerstand. Arm und gegenüberliegendes Bein langsam strecken.",
};

// A completed day must be confirmed again after any food edit, copy or deletion.
export function invalidateCompletedDays(previous, next) {
  const group = (entries) => {
    const map = new Map();
    for (const e of entries) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    }
    return map;
  };
  const old = group(previous.entries),
    updated = group(next.entries);
  for (const day of new Set([...old.keys(), ...updated.keys()]))
    if (JSON.stringify(old.get(day)) !== JSON.stringify(updated.get(day)))
      next.completeDays[day] = false;
}
