export const expeditionTypes = [
  ["forest", "Wald-Forschung", "Pflanze"],
  ["coast", "Küsten-Forschung", "Wasser"],
  ["mountain", "Berg-Forschung", "Gestein"],
  ["city", "Stadt-Forschung", "Normal"],
];
export const campThemes = [
  ["classic", "Wiese", 0],
  ["sunrise", "Morgenrot", 30],
  ["coast", "Küste", 90],
  ["night", "Sternennacht", 180],
  ["autumn", "Herbstwald", 300],
];
export const emptyCareer = () => ({
  version: 1,
  activeRegion: "kanto",
  archives: {},
  bond: {},
  expedition: null,
  completed: [],
  theme: "classic",
  research: 0,
});
export function ensureCareer(g) {
  if (g && !g.career) g.career = emptyCareer();
  return g?.career;
}
export function startExpedition(g, kind, points, date) {
  const c = ensureCareer(g);
  if (c.expedition || !expeditionTypes.some((t) => t[0] === kind)) return false;
  c.expedition = { kind, start: points, date };
  return true;
}
export function progressCareer(g, freshPoints, points, date) {
  const c = ensureCareer(g);
  c.bond[g.buddy] = Math.min(1000000, (c.bond[g.buddy] || 0) + freshPoints);
  c.research = Math.min(1000000, c.research + freshPoints);
  const e = c.expedition;
  if (e && points - e.start >= 18) {
    c.completed.push({ kind: e.kind, date, number: (c.completed.at(-1)?.number || 0) + 1 });
    c.completed = c.completed.slice(-100);
    c.expedition = null;
    return e.kind;
  }
  return null;
}
export function friendship(points) {
  return points >= 60
    ? "Unzertrennlich"
    : points >= 30
      ? "Vertraut"
      : points >= 12
        ? "Gute Freunde"
        : "Lernen sich kennen";
}
export function careerRank(c) {
  return {
    level: 1 + Math.floor(c.research / 60),
    next: 60 - (c.research % 60),
  };
}
export function validateCareer(c) {
  if (c === undefined) return;
  const obj = (x) => x && typeof x === "object" && !Array.isArray(x),
    date = (x) => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x),
    n = (x) => Number.isInteger(x) && x >= 0 && x <= 1000000;
  if (
    !obj(c) ||
    c.version !== 1 ||
    c.activeRegion !== "kanto" ||
    !obj(c.archives) ||
    Object.keys(c.archives).length !== 0 ||
    !obj(c.bond) ||
    !Object.entries(c.bond).every(([id, v]) => /^\d+$/.test(id) && n(v)) ||
    !n(c.research) ||
    !campThemes.some((t) => t[0] === c.theme) ||
    !Array.isArray(c.completed) ||
    c.completed.length > 100 ||
    !c.completed.every(
      (e) =>
        obj(e) &&
        expeditionTypes.some((t) => t[0] === e.kind) &&
        date(e.date) &&
        n(e.number),
    ) ||
    !(
      c.expedition === null ||
      (obj(c.expedition) &&
        expeditionTypes.some((t) => t[0] === c.expedition.kind) &&
        n(c.expedition.start) &&
        date(c.expedition.date))
    )
  )
    throw Error("Ungültige Forschungsreise.");
}
