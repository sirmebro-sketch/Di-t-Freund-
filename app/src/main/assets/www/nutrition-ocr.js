// Conservative label extraction. Suggestions only; never writes a food or diary entry.
const labels = {
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
    .map((l) => l.trim())
    .filter(Boolean);
  const values = {
      kcal: null,
      protein: null,
      carbs: null,
      fat: null,
      fiber: null,
    },
    evidence = {},
    warnings = [];
  let maxColumns = 1;
  const combined = lines.map((line, i) =>
    /\d/.test(line)
      ? line
      : line +
        " " +
        (lines[i + 1] && /^\s*[<\d]/.test(lines[i + 1]) ? lines[i + 1] : ""),
  );
  for (const line of combined) {
    const lower = line.toLocaleLowerCase("de");
    if (
      /^(davon|of which|gesattigt|gesättigt|saturat|zucker|sugar|salz|salt)/.test(
        lower,
      )
    )
      continue;
    let key = Object.keys(labels).find((k) => labels[k].test(line));
    const energy =
      /^(?:energie|energy|brennwert|kalorien|calories)\b/i.test(line) ||
      (/\bkcal\b/i.test(line) && /^[\d\s<]/.test(line));
    if (energy) key = "kcal";
    if (!key) continue;
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
      matches = [...tail.matchAll(/([<]?\s*\d+(?:[.,]\d+)?)\s*(g|%|mg)?/gi)]
        .filter((m) => {
          if (m[2] === "%") return false;
          if (!m[2]) {
            warnings.push(
              `${key}: Einheit nicht sicher erkannt. Bitte ergänzen.`,
            );
            return false;
          }
          return true;
        })
        .map((m) => ({
          s: m[1],
          n: decimal(m[1]) * (m[2]?.toLowerCase() === "mg" ? 0.001 : 1),
        }));
    }
    maxColumns = Math.max(maxColumns, matches.length);
    const match = matches[column];
    if (!match) continue;
    if (
      match.s.includes("<") ||
      !Number.isFinite(match.n) ||
      match.n < 0 ||
      match.n > (key === "kcal" ? 10000 : 1000)
    ) {
      warnings.push(`${key}: bitte Wert auf der Packung prüfen.`);
      continue;
    }
    if (values[key] !== null && Math.abs(values[key] - match.n) > 0.01) {
      values[key] = null;
      evidence[key] = "Mehrere widersprüchliche Angaben";
      warnings.push(`${key}: mehrere Angaben gefunden.`);
      continue;
    }
    values[key] = Math.round(match.n * 100) / 100;
    evidence[key] = line.slice(0, 180);
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
    maxColumns,
    basis100,
    portion: portion ? decimal(portion[1]) : null,
    warnings: [...new Set(warnings)],
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
