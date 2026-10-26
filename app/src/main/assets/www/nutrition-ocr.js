// Conservative label extraction. Suggestions only; never writes a food or diary entry.
const labels = {
  sugar: /^(?:(?:davon|of which)\s+)?(?:zucker|(?:total )?sugars?)\b/i,
  saturatedFat: /^(?:(?:davon|of which)\s+)?(?:ges[äa]ttigte(?:\s+fetts[äa]uren)?|saturated(?:\s+fat)?)\b/i,
  monoFat: /^(?:(?:davon|of which)\s+)?(?:einfach\s+unges[äa]ttigte(?:\s+fetts[äa]uren)?|monounsaturated(?:\s+fat)?)\b/i,
  polyFat: /^(?:(?:davon|of which)\s+)?(?:mehrfach\s+unges[äa]ttigte(?:\s+fetts[äa]uren)?|polyunsaturated(?:\s+fat)?)\b/i,
  transFat: /^(?:(?:davon|of which)\s+)?(?:trans[- ]?fetts[äa]uren|trans[- ]?fette?|trans\s+fat)\b/i,
  protein: /^(?:eiwei(?:ß|ss|b)|protein[es]?|proteine)(?=\s|:|$)/i,
  carbs: /^(?:kohlenhydrate|carbohydrates?|carbs)\b/i,
  fat: /^(?:fett|fat|total fat)\b/i,
  fiber: /^(?:ballaststoffe?|fib(?:er|re)|dietary fib(?:er|re))\b/i,
};
const decimal = (s) => Number(s.replace(/\s/g, "").replace(",", "."));
export function parseNutritionLabel(text, column = 0) {
  if (
    typeof text !== "string" ||
    text.length > 20000 ||
    !Number.isInteger(column) ||
    column < 0 ||
    column > 3
  )
    throw Error("Ungültiger Erkennungstext.");
  const lines = text
    .normalize("NFKC")
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^[-–—−•·]+\s*/, ""))
    .filter(Boolean);
  const values = {
      kcal: null,
      protein: null,
      carbs: null,
      fat: null,
      fiber: null,
      sugar: null, saturatedFat: null, monoFat: null, polyFat: null, transFat: null,
    },
    evidence = {},
    suggestions = {},
    unitless = {},
    warnings = [];
  const uncertain = new Set();
  let maxColumns = 1;
  const combined = lines.map((line, i) =>
    /\d/.test(line)
      ? line
      : line +
        " " +
        (lines[i + 1] && /^\s*[<\d]/.test(lines[i + 1]) ? lines[i + 1] : ""),
  );
  for (const line of combined) {
    let key = Object.keys(labels).find((k) => labels[k].test(line));
    const energy =
      /^(?:energie|energy|brennwert|kalorien|calories)\b/i.test(line) ||
      (/\bkcal\b/i.test(line) && /^[\d\s<]/.test(line));
    if (energy) key = "kcal";
    if (!key || uncertain.has(key)) continue;
    let matches;
    if (key === "kcal") {
      matches = [...line.matchAll(/([<]?\s*\d+(?:[.,]\d+)?)\s*kcal\b/gi)].map(
        (m) => ({ s: m[1], n: decimal(m[1]) }),
      );
      if (!matches.length)
        matches = [...line.matchAll(/([<]?\s*\d+(?:[.,]\d+)?)\s*k[jJ]\b/g)].map(
          (m) => ({ s: m[1], n: decimal(m[1]) / 4.184 }),
        );
    } else {
      const tail = line.replace(labels[key], "");
      // Keep unitless cells in place: removing them would shift the chosen column.
      matches = [...tail.matchAll(/([<>≤≥]?\s*[+-]?\d+(?:[.,]\d+)?)\s*(mg|g|%)?/gi)]
        .filter((m) => m[2] !== "%")
        .map((m) => ({
          s: m[1],
          unit: m[2]?.toLowerCase(),
          n: m[2] ? decimal(m[1]) * (m[2].toLowerCase() === "mg" ? 0.001 : 1) : null,
        }));
    }
    maxColumns = Math.max(maxColumns, matches.length);
    const match = matches[column];
    if (!match) continue;
    if (match.n === null) {
      warnings.push(`${key}: Einheit nicht sicher erkannt. Bitte ergänzen.`);
      const raw = match.s.trim();
      // A final 9 may be an OCR 'g'. Never accept this inference as a value.
      const candidate = /^(?:\d+|\d+[.,]\d+)9$/.test(raw)
        ? decimal(raw.slice(0, -1)) : null;
      const plausible = candidate !== null && candidate >= 0 && candidate <= 100;
      const previous = unitless[key];
      unitless[key] = previous === undefined ? (plausible ? candidate : null)
        : previous !== null && plausible && previous === candidate ? previous : null;
      if (unitless[key] !== null) suggestions[key] = {value: unitless[key], raw, evidence: line.slice(0,180)};
      else delete suggestions[key];
      continue;
    }
    if (
      /[<>≤≥]/.test(match.s) ||
      !Number.isFinite(match.n) ||
      match.n < 0 ||
      match.n > (key === "kcal" ? 10000 : 1000)
    ) {
      uncertain.add(key); values[key]=null;
      warnings.push(`${key}: bitte Wert auf der Packung prüfen.`);
      continue;
    }
    if (values[key] !== null && Math.abs(values[key] - match.n) > 0.01) {
      uncertain.add(key);
      values[key] = null;
      evidence[key] = "Mehrere widersprüchliche Angaben";
      warnings.push(`${key}: mehrere Angaben gefunden.`);
      continue;
    }
    values[key] = Math.round(match.n * 100) / 100;
    evidence[key] = line.slice(0, 180);
  }
  for (const key of Object.keys(suggestions)) {
    if (values[key] !== null || uncertain.has(key)) delete suggestions[key];
  }
  const basis100 = /100\s*(?:g|ml)\b/i.test(text);
  const portion =
    /(?:portion|serving)[^\n\d]{0,15}(\d+(?:[.,]\d+)?)\s*(?:g|ml)\b/i.exec(
      text,
    );
  if (maxColumns > 1)
    warnings.push(
      "Mehrere Zahlenspalten erkannt. Spalte und Bezugsmenge ausdrücklich prüfen.",
    );
  if (!basis100)
    warnings.push(
      "Keine eindeutige Angabe pro 100 g/ml. Bezugsmenge auf der Packung prüfen.",
    );
  return {
    values,
    evidence,
    suggestions,
    maxColumns,
    basis100,
    portion: portion ? decimal(portion[1]) : null,
    warnings: [...new Set(warnings)].map(w => w.replace(/^(\w+):/, (_, key) =>
      ({kcal:"Energie",protein:"Eiweiß",carbs:"Kohlenhydrate",fat:"Fett",fiber:"Ballaststoffe",sugar:"Zucker",saturatedFat:"Gesättigte Fettsäuren",monoFat:"Einfach ungesättigte Fettsäuren",polyFat:"Mehrfach ungesättigte Fettsäuren",transFat:"Transfettsäuren"}[key] || key) + ":")),
  };
}
export function normalizeLabel(values, basis) {
  const quantity = Number(String(basis).replace(",", "."));
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 10000)
    throw Error("Bezugsmenge: 1 bis 10.000 g/ml eingeben.");
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      if (value === null) return [key, null];
      const n = Math.round((value / quantity) * 10000) / 100;
      if (!Number.isFinite(n) || n < 0 || n > (key === "kcal" ? 1000 : 100))
        throw Error(
          "Nährwert oder Bezugsmenge unplausibel. Bitte Packung prüfen.",
        );
      return [key, n];
    }),
  );
}
