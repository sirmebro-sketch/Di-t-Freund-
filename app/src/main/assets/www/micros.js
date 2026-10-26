// DGE/ÖGE reference values checked 2026-10-26. These are dietary reference
// values, not individual requirements, diagnostic thresholds or supplement doses.
export const micros = [
  {
    key: "vitaminC",
    name: "Vitamin C",
    unit: "mg",
    off: "vitamin-c",
    male: 110,
    female: 95,
    note: "Für Nichtrauchende; Rauchen erhöht den Referenzwert.",
    slug: "vitamin-c",
  },
  {
    key: "vitaminD",
    name: "Vitamin D",
    unit: "µg",
    off: "vitamin-d",
    male: 20,
    female: 20,
    note: "Nur bei fehlender körpereigener Bildung. Nahrung allein zeigt den Versorgungsstatus nicht.",
    slug: "vitamin-d",
  },
  {
    key: "vitaminE",
    name: "Vitamin E",
    unit: "mg",
    off: "vitamin-e",
    male: 8,
    female: 8,
    note: "Schätzwert für eine angemessene Zufuhr.",
    slug: "vitamin-e",
  },
  {
    key: "vitaminB12",
    name: "Vitamin B12",
    unit: "µg",
    off: "vitamin-b12",
    male: 4,
    female: 4,
    note: "Schätzwert; Aufnahme und Körperversorgung werden nicht gemessen.",
    slug: "vitamin-b12",
  },
  {
    key: "folate",
    name: "Folat",
    unit: "µg",
    off: "folates",
    male: 300,
    female: 300,
    note: "Folat-Äquivalente. Synthetische Folsäure nicht ungeprüft gleichsetzen.",
    slug: "folat",
  },
  {
    key: "calcium",
    name: "Calcium",
    unit: "mg",
    off: "calcium",
    male: 1000,
    female: 1000,
    note: "Referenzwert für Erwachsene ab 19 Jahren.",
    slug: "calcium",
  },
  {
    key: "magnesium",
    name: "Magnesium",
    unit: "mg",
    off: "magnesium",
    male: 350,
    female: 300,
    note: "Schätzwert; keine Empfehlung für ein Präparat.",
    slug: "magnesium",
  },
  {
    key: "potassium",
    name: "Kalium",
    unit: "mg",
    off: "potassium",
    male: 4000,
    female: 4000,
    note: "Bei Nierenkrankheiten oder medizinischen Vorgaben individuell abstimmen.",
    slug: "kalium",
  },
  {
    key: "iodine",
    name: "Jod",
    unit: "µg",
    off: "iodine",
    male: 150,
    female: 150,
    note: "Aktualisierter Referenzwert seit 2025; bei Schilddrüsenerkrankungen individuell abstimmen.",
    slug: "jod",
  },
  {
    key: "selenium",
    name: "Selen",
    unit: "µg",
    off: "selenium",
    male: 70,
    female: 60,
    note: "Schätzwert; mehr ist nicht automatisch besser.",
    slug: "selen",
  },
  {
    key: "iron",
    name: "Eisen",
    unit: "mg",
    off: "iron",
    male: 11,
    female: null,
    note: "Bei Frauen abhängig von Menstruation und Lebensphase; deshalb kein pauschales Ziel.",
    slug: "eisen",
  },
  {
    key: "zinc",
    name: "Zink",
    unit: "mg",
    off: "zinc",
    male: null,
    female: null,
    note: "Abhängig von Phytatzufuhr: Männer 11–16, Frauen 7–10 mg/Tag. Kein fixer Zielwert.",
    slug: "zink",
  },
];
export function microTotals(entries) {
  return Object.fromEntries(
    micros.map((m) => {
      const known = entries.filter((e) => Number.isFinite(e.micros?.[m.key]));
      return [
        m.key,
        {
          value: known.length
            ? known.reduce(
                (sum, e) => sum + (e.micros[m.key] * e.amount) / 100,
                0,
              )
            : null,
          known: known.length,
          total: entries.length,
        },
      ];
    }),
  );
}
export function parseMicros(n) {
  return Object.fromEntries(
    micros.map((m) => {
      const raw = n[`${m.off}_100g`];
      const value =
        raw !== undefined && raw !== null && raw !== "" ? Number(raw) : NaN;
      const converted = value * (m.unit === "µg" ? 1e6 : 1000);
      return [
        m.key,
        Number.isFinite(converted) && converted >= 0 && converted <= 1e7
          ? converted
          : null,
      ];
    }),
  );
}
export function recipeMicros(items, weight) {
  const t = microTotals(items);
  return Object.fromEntries(
    micros.map((m) => [
      m.key,
      t[m.key].known === items.length && items.length
        ? Math.round((t[m.key].value / weight) * 100000) / 1000
        : null,
    ]),
  );
}
export function referenceFor(m, coach, date) {
  if (!coach || coach.nutritionCare) return null;
  const birth = new Date(coach.birthDate + "T12:00:00"),
    now = new Date(date + "T12:00:00");
  let age = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  )
    age--;
  if (age < 19) return null;
  if (m.key === "vitaminC" && coach.smoker)
    return coach.sex === "male" ? 155 : coach.sex === "female" ? 135 : null;
  return m[coach.sex] ?? null;
}
