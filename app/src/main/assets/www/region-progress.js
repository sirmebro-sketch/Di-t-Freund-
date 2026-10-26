import { regionPacks } from "./game-registry.js";
const total = (g) => Object.values(g.earned).reduce((n, a) => n + a.length, 0);
export const activeRegion = (g) => g.career?.activeRegion || "kanto";
export function ensureRegions(g) {
  if (!g.regions) g.regions = { kanto: { points: total(g) }, johto: null };
  return g.regions;
}
export function regionProgress(g, id = activeRegion(g)) {
  if (id === "kanto")
    return {
      points: g.regions?.kanto.points ?? total(g),
      badges: g.badges,
      leagueWins: g.leagueWins,
    };
  return g.regions?.[id] || { points: 0, badges: [], leagueWins: [] };
}
export const regionPoints = (g, id = activeRegion(g)) =>
  regionProgress(g, id).points;
export const regionWorld = (g, id = activeRegion(g)) => regionPacks[id].world;
export function switchRegion(g, id, starter, date) {
  if (!regionPacks[id]) throw Error("Diese Region ist noch nicht installiert.");
  ensureRegions(g);
  if (id === "johto" && !g.regions.johto) {
    if (!g.badges.length)
      throw Error("Johto öffnet sich nach deinem ersten Kanto-Orden.");
    if (![152, 155, 158].includes(starter))
      throw Error("Bitte einen Johto-Partner wählen.");
    g.regions.johto = {
      points: 0,
      badges: [],
      leagueWins: [],
      starter,
      started: date,
    };
    if (!g.collection.some((m) => m.base === starter))
      g.collection.push({ base: starter, xp: 0, caught: date });
    if (!g.discovered.includes(starter)) g.discovered.push(starter);
    g.discovered.sort((a, b) => a - b);
  }
  g.career.activeRegion = id;
}
export function validateRegions(g) {
  const r = g.regions;
  if (r === undefined) {
    if (activeRegion(g) !== "kanto") throw Error("Regionsfortschritt fehlt.");
    return;
  }
  const valid = (n) => Number.isInteger(n) && n >= 0 && n <= 109500;
  if (
    !r ||
    !r.kanto ||
    !valid(r.kanto.points) ||
    Object.keys(r).some((k) => !["kanto", "johto"].includes(k))
  )
    throw Error("Ungültige Regionsdaten.");
  const j = r.johto;
  if (j !== null) {
    const w = regionPacks.johto.world;
    if (
      !j ||
      !valid(j.points) ||
      ![152, 155, 158].includes(j.starter) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(j.started) ||
      !Array.isArray(j.badges) ||
      j.badges.length > 8 ||
      !j.badges.every((x, i) => x === w.gyms[i].id) ||
      !Array.isArray(j.leagueWins) ||
      j.leagueWins.length > 5 ||
      !j.leagueWins.every((x, i) => x === w.league[i].id) ||
      (j.leagueWins.length && j.badges.length !== 8)
    )
      throw Error("Ungültiger Johto-Fortschritt.");
  }
  if (
    r.kanto.points + (j?.points || 0) !== total(g) ||
    (activeRegion(g) === "johto" && !j)
  )
    throw Error("Regionspunkte stimmen nicht mit dem Tagebuch überein.");
}
