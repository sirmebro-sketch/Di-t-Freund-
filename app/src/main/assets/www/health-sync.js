// Health Connect copies are separate from manual entries. Egg incubation uses successful step reads only.
export const emptyConnection = () => ({
  autoRead: false,
  readSteps: false,
  readSleep: false,
  readWeight: false,
  lastSync: null,
  days: {},
  weights: [],
});
const validDate = (d) =>
  typeof d === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(d) &&
  new Date(d + "T12:00:00Z").toISOString().slice(0, 10) === d;
export function validateConnection(c) {
  if (c === undefined) return true;
  if(c.stepsSyncAt!==undefined && (typeof c.stepsSyncAt!=="string" || !Number.isFinite(Date.parse(c.stepsSyncAt)))) throw Error("Ungültiger Schritte-Abgleich.");
  const obj = (x) => x && typeof x === "object" && !Array.isArray(x);
  if (
    !obj(c) ||
    !["autoRead", "readSteps", "readSleep", "readWeight"].every(
      (k) => typeof c[k] === "boolean",
    ) ||
    !(
      c.lastSync === null ||
      (typeof c.lastSync === "string" &&
        Number.isFinite(Date.parse(c.lastSync)))
    ) ||
    !obj(c.days) ||
    Object.keys(c.days).length > 3660 ||
    !Array.isArray(c.weights) ||
    c.weights.length > 5000
  )
    throw Error("Ungültige Health-Connect-Daten.");
  if (
    c.statusText !== undefined &&
    (typeof c.statusText !== "string" || c.statusText.length > 2000)
  )
    throw Error("Ungültiger Verbindungsstatus.");
  for (const [d, v] of Object.entries(c.days)) {
    if (
      !validDate(d) ||
      !obj(v) ||
      !(
        v.steps === null ||
        (Number.isInteger(v.steps) && v.steps >= 0 && v.steps <= 100000)
      ) ||
      !(
        v.sleep === null ||
        (Number.isFinite(v.sleep) && v.sleep >= 0 && v.sleep <= 24)
      )
    )
      throw Error("Ungültige Tagesdaten.");
  }
  for (const w of c.weights) {
    if (
      !validDate(w.date) ||
      !Number.isFinite(w.value) ||
      w.value < 35 ||
      w.value > 350 ||
      typeof w.id !== "string" ||
      w.id.length > 150 ||
      typeof w.origin !== "string" ||
      w.origin.length > 200 ||
      !Number.isFinite(Date.parse(w.time))
    )
      throw Error("Ungültiger Gewichtsimport.");
  }
  return true;
}
export function applyHealthSnapshot(state, payload) {
  if (
    payload?.kind !== "sync" ||
    !Array.isArray(payload.days) ||
    !Array.isArray(payload.weights) ||
    !Array.isArray(payload.read) ||
    !payload.read.length ||
    !payload.read.every((t) => ["steps", "sleep", "weight"].includes(t)) ||
    !validDate(payload.from) ||
    !validDate(payload.to) ||
    payload.from > payload.to ||
    payload.days.length > 31 ||
    payload.weights.length > 5000
  )
    throw Error("Ungültige Synchronisierung.");
  if (
    payload.weights.some(
      (w) => !validDate(w.date) || w.date < payload.from || w.date > payload.to,
    )
  )
    throw Error("Gewicht außerhalb des Importzeitraums.");
  const c = state.healthConnect || emptyConnection();
  const next = structuredClone(c);
  // Replace only successful read types in the returned window, including external deletions.
  for (const [d, v] of Object.entries(next.days))
    if (d >= payload.from && d <= payload.to) {
      if (payload.read.includes("steps")) v.steps = null;
      if (payload.read.includes("sleep")) v.sleep = null;
    }
  for (const day of payload.days) {
    if (
      !validDate(day.date) ||
      day.date < payload.from ||
      day.date > payload.to
    )
      throw Error("Ungültiger Importzeitraum.");
    const target = next.days[day.date] || { steps: null, sleep: null };
    if (payload.read.includes("steps")) target.steps = day.steps ?? null;
    if (payload.read.includes("sleep")) target.sleep = day.sleep ?? null;
    next.days[day.date] = target;
  }
  if (payload.read.includes("weight"))
    next.weights = [
      ...next.weights.filter(
        (w) => w.date < payload.from || w.date > payload.to,
      ),
      ...payload.weights,
    ];
  // Keep a bounded local cache without making long-term use fail after one year.
  next.days = Object.fromEntries(
    Object.entries(next.days)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-3660),
  );
  next.weights = next.weights
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(-5000);
  next.lastSync = payload.at;
  if(payload.read.includes("steps")) next.stepsSyncAt = payload.at;
  validateConnection(next);
  state.healthConnect = next;
}
export function combinedWeights(state) {
  const byDay = new Map();
  for (const w of [...(state.healthConnect?.weights || [])].sort((a, b) =>
    a.time.localeCompare(b.time),
  ))
    byDay.set(w.date, {
      date: w.date,
      value: w.value,
      source: "Health Connect",
    });
  // A manual entry always takes precedence on the same day. Imported copies are never re-exported.
  for (const w of state.weights) byDay.set(w.date, w);
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}
export function weightsForSharing(state) {
  return state.weights
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)
    .map((w) => ({ date: w.date, value: w.value }));
}
