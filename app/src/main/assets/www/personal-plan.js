export const commuteNames = {none: 'Keine Angabe', bicycle: 'Normales Fahrrad', ebike: 'E-Bike', mixed: 'Fahrrad und E-Bike im Wechsel'};
const keys = ['height','goal','sex','hypertension','betaBlocker','muscleBuild','commuteMode','nextCommuteMode','commuteKm','stepMin','stepMax'];
export function validatePersonalPlan(p) {
  const valid = p && typeof p === 'object' && !Array.isArray(p)
    && Object.keys(p).length === keys.length && keys.every(k => Object.hasOwn(p,k))
    && Number.isFinite(p.height) && p.height >= 130 && p.height <= 230
    && Number.isFinite(p.goal) && p.goal >= 35 && p.goal <= 350
    && p.goal / (p.height/100)**2 >= 18.5
    && ['male','female','unspecified'].includes(p.sex)
    && ['hypertension','betaBlocker','muscleBuild'].every(k => typeof p[k] === 'boolean')
    && typeof p.commuteMode === 'string' && typeof p.nextCommuteMode === 'string'
    && Object.hasOwn(commuteNames,p.commuteMode) && Object.hasOwn(commuteNames,p.nextCommuteMode)
    && Number.isFinite(p.commuteKm) && p.commuteKm >= 0 && p.commuteKm <= 300
    && Number.isInteger(p.stepMin) && Number.isInteger(p.stepMax)
    && p.stepMin >= 0 && p.stepMax >= p.stepMin && p.stepMax <= 50000;
  if (!valid) throw Error('Persönliche Einstellungen sind ungültig oder unvollständig.');
  return p;
}
export function parsePersonalPlan(raw) {
  if (typeof raw !== 'string' || raw.length > 64000) throw Error('Profildatei ist zu groß.');
  const data = JSON.parse(raw);
  if (data?.kind !== 'diaetfreund-personal-plan' || data.version !== 1)
    throw Error('Unbekanntes Profilformat.');
  return validatePersonalPlan(data.values);
}
export function applyPersonalPlan(state, plan) {
  validatePersonalPlan(plan);
  if (!state.profile) throw Error('Bitte zuerst dein Grundprofil in der App einrichten, dann diese Profildatei laden.');
  const next = structuredClone(state);
  next.personalPlan = structuredClone(plan);
  next.profile.height = plan.height;
  next.profile.goal = plan.goal;
  if (next.coach) for (const k of ['sex','hypertension','betaBlocker']) next.coach[k] = plan[k];
  // No assumed birth date, current weight, activity factor, training clearance,
  // measured steps, calorie target or diary/game changes.
  return next;
}
