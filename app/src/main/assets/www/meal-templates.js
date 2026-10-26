import {nutrientParts} from './nutrient-parts.js';
// Stored nutrient snapshots: editing a product later never rewrites a saved meal.
const meals = ["Frühstück", "Mittagessen", "Abendessen", "Snacks"];
const validDate = (d) =>
  typeof d === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(d) &&
  !isNaN(new Date(d + "T12:00:00Z")) &&
  new Date(d + "T12:00:00Z").toISOString().slice(0, 10) === d;
const validName = (n) =>
  typeof n === "string" && n.trim().length > 0 && n.length <= 80;
export function validateTemplates(list, validateFood) {
  if (list === undefined) return;
  if (
    !Array.isArray(list) ||
    list.length > 100 ||
    new Set(list.map((t) => t?.id)).size !== list.length
  )
    throw Error("Ungültige gespeicherte Mahlzeiten.");
  for (const t of list) {
    if (
      !t ||
      typeof t.id !== "string" ||
      !t.id ||
      t.id.length > 100 ||
      !validName(t.name) ||
      !meals.includes(t.meal) ||
      !Array.isArray(t.items) ||
      !t.items.length ||
      t.items.length > 50
    )
      throw Error("Ungültige Mahlzeitenvorlage.");
    for (const item of t.items) {
      validateFood(item);
      if (
        !Number.isFinite(item.amount) ||
        item.amount < 1 ||
        item.amount > 10000
      )
        throw Error("Ungültige Portionsmenge.");
    }
  }
}
export function saveMeal(s, name, meal, date, id = crypto.randomUUID()) {
  if (!validName(name) || !meals.includes(meal) || !validDate(date))
    throw Error("Bitte einen Namen und eine gültige Mahlzeit wählen.");
  const entries = s.entries.filter((e) => e.date === date && e.meal === meal);
  if (!entries.length || entries.length > 50)
    throw Error("Eine Vorlage braucht 1 bis 50 Lebensmittel.");
  if ((s.mealTemplates || []).length >= 100)
    throw Error("Maximal 100 gespeicherte Mahlzeiten.");
  if ((s.mealTemplates || []).some((t) => t.id === id))
    throw Error("Vorlage bereits vorhanden.");
  const keys = [
    "id",
    "name",
    "source",
    "foodId",
    "barcode",
    "kcal",
    "protein",
    "carbs",
    "fat",
    "fiber",
    "fiberKnown",
    ...nutrientParts.map(p=>p.key),
    "micros",
    "amount",
  ];
  const items = entries.map((e) =>
    Object.fromEntries(
      keys
        .filter((k) => e[k] !== undefined)
        .map((k) => [k, structuredClone(e[k])]),
    ),
  );
  const template = { id, name: name.trim(), meal, items };
  s.mealTemplates = [...(s.mealTemplates || []), template];
  return template;
}
export function addMeal(
  s,
  id,
  { date, meal, amounts },
  makeId = () => crypto.randomUUID(),
) {
  const t = s.mealTemplates?.find((t) => t.id === id);
  if (
    !t ||
    !validDate(date) ||
    !meals.includes(meal) ||
    !Array.isArray(amounts) ||
    amounts.length !== t.items.length ||
    !amounts.every((a) => Number.isFinite(a) && a >= 1 && a <= 10000)
  )
    throw Error("Bitte Datum, Mahlzeit und alle Mengen prüfen.");
  if (s.entries.length + t.items.length > 50000)
    throw Error("Das Tagebuch ist voll.");
  const items = t.items.map((item, i) => ({
    ...structuredClone(item),
    foodId: item.foodId || item.id,
    id: makeId(),
    amount: amounts[i],
    date,
    meal,
  }));
  if (
    new Set([...s.entries.map((e) => e.id), ...items.map((e) => e.id)]).size !==
    s.entries.length + items.length
  )
    throw Error("Eintrag konnte nicht eindeutig angelegt werden.");
  s.entries.push(...items);
  s.completeDays[date] = false;
  return items.map((e) => e.id);
}
export function renameMeal(s, id, name) {
  if (!validName(name))
    throw Error("Bitte einen Namen mit 1 bis 80 Zeichen eingeben.");
  const t = s.mealTemplates?.find((t) => t.id === id);
  if (!t) throw Error("Vorlage nicht gefunden.");
  t.name = name.trim();
}
