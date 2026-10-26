import {setupExerciseHistory} from './exercise-history-ui.js';
import {nutrientParts,partWarnings} from './nutrient-parts.js';
import {fiberIsKnown} from './nutrition-balance.js';
import {setupEggUI} from './egg-ui.js';
import {syncHatchery} from './egg-game.js';
import {setupNutritionBalance} from './nutrition-balance-ui.js';
import {setupTrends} from './trends-ui.js';
import { setupAtmosphere } from './atmosphere.js';
import { installPlatinum } from './platinum-ui.js';
installPlatinum();
import { setupTrainingUI } from './training-ui.js';
import { makeSets } from './training.js';
import { setupTrainerUI, dsIcon } from "./trainer-ui.js";
import { offlineFoods, usdaFoods, matchesFood, foodDetails } from "./food-catalogue.js";
import { parsePersonalPlan, applyPersonalPlan, commuteNames } from "./personal-plan.js";
import { setupNutritionOCR } from "./nutrition-ocr-ui.js";
import { setupMealUI } from "./meal-templates-ui.js";
import { combinedWeights } from "./health-sync.js";
import { setupHealthUI } from "./health-ui.js";
import { syncGame } from "./game.js";
import { setupGameUI } from "./game-ui.js";
import {
  meals,
  nutrients,
  uid,
  today,
  shiftDate,
  number,
  emptyState,
  totals,
  estimate,
  recipeFood,
  weightTrend,
  parseProduct,
  parseBackup,
  validateState,
  invalidateCompletedDays,
  routines,
  cues,
} from "./core.js";
import { micros } from "./micros.js";
import { setupCoachUI } from "./coach-ui.js";
import {
  trainingRoutines,
  previousSets,
  rememberedAmount,
  foodKey,
  readiness,
} from "./coach.js";
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const fmt = (n, d = 0) =>
  Number(n).toLocaleString("de-DE", {
    maximumFractionDigits: d,
    minimumFractionDigits: d,
  });
const icons = {
  home: '<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',
  food: '<path d="M5 3v6m3-6v6M3 3v6q0 3 3 3v9M19 21V3q-6 3-4 10h4"/>',
  chart: '<path d="M4 3v17h17M7 15l4-5 4 2 5-7"/>',
  train: '<path d="M3 8v8m4-11v14m10-14v14m4-11v8M7 12h10"/>',
  more: '<circle cx="12" cy="12" r="8"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  water: '<path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/>',
  leaf: '<path d="M20 3C7 2 1 8 6 16c8 5 14-1 14-13ZM5 20 15 9"/>',
  scan: '<path d="M3 8V3h5m8 0h5v5m0 8v5h-5M8 21H3v-5M7 7v10m4-10v10m3-10v10m3-10v10"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
};
const icon = (k) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[k] || icons.leaf}</svg>`;
const btn = (text, action, cls = "", attrs = "") =>
  `<button class="${cls}" data-action="${action}" ${attrs}>${text}</button>`;
const field = (label, name, value = "", type = "text", attrs = "") =>
  `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
const num = (label, name, value, min, max, step = "any", required = true) =>
  field(
    label,
    name,
    value ?? "",
    "number",
    `min="${min}" max="${max}" step="${step}" inputmode="decimal" ${required ? "required" : ""}`,
  );
const select = (label, name, options, value) =>
  `<label>${label}<select name="${name}">${options
    .map((o) => {
      const [v, t] = Array.isArray(o) ? o : [o, o];
      return `<option value="${esc(v)}" ${v == value ? "selected" : ""}>${esc(t)}</option>`;
    })
    .join("")}</select></label>`;
let state,
  loadError = false;
try {
  const raw = window.Android
    ? Android.readState()
    : localStorage.getItem("diaetfreund-v1");
  state = raw ? parseBackup(raw) : emptyState();
} catch {
  state = emptyState();
  loadError = true;
}
let tab = "home",
  date = today(),
  meal = "Frühstück",
  selectedFood = null,
  nutrientEditTarget = null,
  editing = null,
  recipeItems = [],
  timerEnd = 0,
  searchToken = 0,
  lastLookup = 0;
const foods = () => [...state.foods, ...offlineFoods];
let pendingPlan = null;
const dayEntries = () => state.entries.filter((e) => e.date === date);
const notify = (s) => {
  const t = $("#toast");
  t.textContent = s;
  t.classList.add("visible");
  clearTimeout(notify.t);
  notify.t = setTimeout(() => t.classList.remove("visible"), 4200);
};
function commit(mutator, preserveCompletion = false) {
  const next = structuredClone(state);
  try {
    mutator(next);
    if (!preserveCompletion) invalidateCompletedDays(state, next);
    if (!preserveCompletion) syncGame(next, today());
    syncHatchery(next, today());
    validateState(next);
    const raw = JSON.stringify(next);
    if (window.Android) {
      if (!Android.writeState(raw)) throw Error("Speicher voll");
    } else localStorage.setItem("diaetfreund-v1", raw);
    const previous = state;
    state = next;
    if (!preserveCompletion) {
      gameUI.celebrate(previous, next);
      trainerUI.celebrate(previous, next);
    }
    eggUI?.celebrate(previous, next);
    if(preserveCompletion)eggUI?.refresh();
    return true;
  } catch (e) {
    notify("Nicht gespeichert: " + e.message);
    return false;
  }
}
function close() {
  pendingPlan = null;
  searchToken++;
  ocrUI.invalidate();
  $("#sheet").close();
}
function sheet(title, html) {
  pendingPlan = null;
  const d = $("#sheet");
  const reward = document.querySelector("#reward");
  d.innerHTML = `<div class="sheet-head"><h2 id="sheet-title">${esc(title)}</h2>${btn("×", "close", "icon-button", 'aria-label="Schließen"')}</div>${reward && !reward.hidden ? `<div class="inline-reward" role="status">${reward.innerHTML}</div>` : ""}${html}`;
  d.setAttribute("aria-labelledby", "sheet-title");
  if (!d.open) d.showModal();
  d.scrollTop = 0;
}
function form(title, kind, html, button = "Speichern") {
  sheet(
    title,
    `<form data-form="${kind}">${html}<p class="error" role="alert"></p><button class="primary wide" type="submit">${button}</button></form>`,
  );
}
function dateLabel(d) {
  return new Date(d + "T12:00:00").toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}
function render() {
  document.documentElement.dataset.theme = state.theme;
  const p = state.profile;
  if (!p) {
    $("#app").innerHTML =
      `<main class="welcome"><div class="brand"><img class="fitdex-icon" src="fitdex-icon.jpg" width="48" height="48" alt=""> FitDex</div><span class="eyebrow">DEIN ALLTAG. DEIN TEMPO.</span><h1>Kleine Schritte.<br><em>Großes Gefühl.</em></h1><p>Essen verstehen. Stärker werden.<br>Deinen Fortschritt sichtbar machen.</p><div class="welcome-art"><span>${icon("leaf")}</span><div>Mehr für dich.<small>Ohne Abo. Ohne Konto.</small></div></div><div class="card"><h3>Ein guter Anfang zählt.</h3><p>Dein persönliches Tagebuch für Ernährung, Bewegung und Wohlbefinden. Alles bleibt auf deinem Gerät.</p>${btn("Meinen Weg starten →", "onboard", "primary wide")}${btn("Sicherung wiederherstellen", "import", "text-button wide")}</div><p class="muted">Für Erwachsene · Kein Ersatz für medizinische Beratung</p></main>`;
    if (loadError) {
      sheet(
        "Daten konnten nicht geladen werden",
        `<p>Der vorhandene Speicher wurde nicht überschrieben. Starte die App erneut oder stelle eine gültige Sicherung wieder her. Beim Einrichten eines neuen Profils wird der bisherige Speicher ersetzt.</p>${btn("Sicherung auswählen", "import", "primary")}`,
      );
      loadError = false;
    }
    return;
  }
  $("#app").innerHTML =
    `<div class="shell"><aside><div class="brand"><img class="fitdex-icon" src="fitdex-icon.jpg" width="48" height="48" alt=""> FitDex</div><p>Mehr für dich. Jeden Tag.</p><div class="desktop-nav">${nav()}</div><div class="aside-note">${icon("leaf")} Fortschritt braucht<br>keine Perfektion.</div></aside><div class="content"><header class="fitdex-header"><a class="wordmark" href="#" aria-label="FitDex – zur Startseite"><img class="fitdex-icon" src="fitdex-icon.jpg" width="48" height="48" alt=""><span class="fitdex-wordmark"><strong>Fit<span>Dex</span></strong><small>Ernährung · Training · Abenteuer</small></span></a>${btn("♪ Ton", "audio-open", "audio-header", 'aria-label="Musik und Klänge einstellen"')}</header>${trainerUI.status()}<main><div class="page-title"><div><span class="eyebrow">${{ home: "DEIN TÄGLICHER BEGLEITER", food: "BEWUSST GENIESSEN", chart: "JEDER SCHRITT ZÄHLT", train: "STÄRKER IM ALLTAG", more: "DEINE TRAINERKARTE", journey: "DEINE REISE" }[tab]}</span><h1>${{ home: `Hallo${p.name ? ", " + esc(p.name) : " Trainer"}!`, food: "Dein Proviant", chart: "Dein Fortschritt", train: "Training & Erholung", more: "Profil & Einstellungen", journey: "Dein Abenteuer" }[tab]}</h1></div>${tab === "food" ? `<div class="date-picker">${btn("‹", "prev", "icon-button", 'aria-label="Vorheriger Tag"')}<input type="date" id="day" aria-label="Tag auswählen" value="${date}" max="${today()}">${btn("›", "next", "icon-button", date >= today() ? 'disabled aria-label="Nächster Tag"' : 'aria-label="Nächster Tag"')}</div>` : ""}</div>${{ home: homeView, food: foodView, chart: chartView, train: trainView, more: moreView, journey: () => trainerUI.journey() }[tab]()}</main></div><nav class="bottom-nav" aria-label="Hauptnavigation">${nav()}</nav></div>`;
}
function nav() {
  return [
    ["home", "Heute"],
    ["food", "Essen"],

    ["train", "Training"],
    ["chart", "Trends"],
    ["journey", "Reise"],
    ["more", "Profil"],
  ]
    .map(([k, t]) =>
      btn(
        `${dsIcon(k === "more" ? "profile" : k === "chart" ? "trends" : k)}<span>${t}</span>`,
        "tab",
        tab === k ? "active" : "",
        `data-tab="${k}" ${tab === k ? 'aria-current="page"' : ""}`,
      ),
    )
    .join("");
}
function homeView() {
  const p = state.profile,
    t = totals(dayEntries()),
    water = state.water[date] || 0,
    w = combinedWeights(state).sort((a, b) => b.date.localeCompare(a.date))[0];
  return `${trainerUI.home()}<section class="card energy compact-energy"><div class="section-head"><h2>${date === today() ? "Heute" : dateLabel(date)} · Ernährung</h2>${btn("Tagesbilanz", "nutrition-day", "text-button")}${btn("Tagebuch", "go-food", "text-button")}</div><div class="energy-numbers"><div><strong>${fmt(t.kcal)}</strong><small>von ${fmt(p.kcal)} kcal · Orientierung</small></div><div><strong>${fmt(t.protein)} g</strong><small>von ${p.protein} g Protein</small></div></div><div class="toolbar">${btn(dsIcon("food") + " Barcode scannen", "barcode", "primary")}${btn("Nährwertfoto", "ocr-open", "secondary")}${btn("Essen suchen", "add-food", "secondary")}</div></section><div class="home-vitals below">${healthUI.card(date)}<section class="card water-card"><h2>Trinken</h2><div class="big-number">${fmt(water / 1000, 2)} <small>/ ${fmt(p.water / 1000, 1)} l</small></div><p>Dein selbst gesetztes Ziel.</p><div class="row">${btn("− 250", "water", "secondary", 'data-amount="-250" aria-label="250 Milliliter entfernen"')}${btn("+ 250 ml", "water", "primary", 'data-amount="250"')}</div></section></div><section class="card below weight-card"><div class="section-head"><div><h2>Dein Gewichtsverlauf</h2><p>${w ? fmt(w.value, 1) + " kg · " + dateLabel(w.date) : "Noch kein Gewicht erfasst."}</p></div>${btn("Gewicht eintragen", "weight", "secondary")}</div>${btn("Alle Trends & Diagramme", "go-chart", "text-button")}</section>`;
}
function macro(name, value, target, color) {
  return `<div><span><i class="dot ${color}"></i>${name}</span><strong>${fmt(value)} <small>${target ? "/ " + target + " " : ""}g</small></strong>${target ? `<div class="track"><i style="width:${Math.min(100, (value / target) * 100)}%"></i></div>` : ""}</div>`;
}
function foodView() {
  return `<div class="toolbar">${btn(icon("plus") + " Essen eintragen", "add-food", "primary")}${btn(icon("scan") + " Barcode", "barcode", "secondary")}${btn("Nährwerttabelle fotografieren", "ocr-open", "secondary")}${btn("Gespeicherte Mahlzeiten", "templates", "secondary")}<details class="food-tools"><summary>Weitere Möglichkeiten</summary><div class="toolbar">${btn("Vortag kopieren", "copy-day", "secondary")}${btn("Eigenes Rezept", "recipe", "secondary")}</div></details></div>${nutritionBalance.view()}<section class="day-complete"><div><strong>${state.completeDays[date] ? "✓ Tag als vollständig markiert" : "Alles für diesen Tag erfasst?"}</strong><small>Nur vollständige Tage fließen in die Verbrauchsschätzung ein.</small></div>${btn(state.completeDays[date] ? "Wieder öffnen" : "Tag abschließen", "complete-day", "secondary", `aria-pressed="${!!state.completeDays[date]}"`)}</section><div class="diary">${meals
    .map((m, i) => {
      const e = dayEntries().filter((e) => e.meal === m);
      return `<section class="card"><div class="section-head"><h2><span class="meal-symbol small">${["☀", "◒", "☾", "✦"][i]}</span>${m}</h2><span>${fmt(totals(e).kcal)} kcal</span></div>${e.length ? e.map((e) => `<button class="food-row" data-action="edit-entry" data-id="${esc(e.id)}"><div><strong>${esc(e.name)}</strong><small>${fmt(e.amount)} ${e.name.includes("100 ml") ? "ml" : "g"} · ${fmt((e.protein * e.amount) / 100, 1)} g Protein</small></div><strong>${fmt((e.kcal * e.amount) / 100)}<small>kcal</small></strong></button>`).join("") : `<p class="empty-line">Noch nichts eingetragen. Was schmeckt dir heute?</p>`}<div class="meal-actions">${btn("+ Hinzufügen", "add-food", "text-button", `data-meal="${m}"`)}${e.length ? btn("Als Mahlzeit speichern", "template-save", "text-button", `data-meal="${m}"`) : ""}</div></section>`;
    })
    .join(
      "",
    )}</div><p class="footnote">Fehlende Nährstoffangaben können die erfassten Summen zu niedrig erscheinen lassen. Produktdaten bitte mit der Packung abgleichen. Sportkalorien werden nicht auf dein Budget aufgeschlagen.</p>`;
}
function miniChart(values) {
  if (values.length < 2)
    return `<div class="chart-empty">${values.length ? "Ein Anfang ist gemacht. Ab zwei Einträgen siehst du deine Kurve." : "Mit deinen Einträgen entsteht hier dein Verlauf."}</div>`;
  const sorted = [...values].sort((a, b) => a.date.localeCompare(b.date)),
    min = Math.min(...sorted.map((w) => w.value)) - 0.5,
    max = Math.max(...sorted.map((w) => w.value)) + 0.5,
    start = Date.parse(sorted[0].date),
    span = Math.max(1, Date.parse(sorted.at(-1).date) - start);
  const x = (w) => 12 + ((Date.parse(w.date) - start) / span) * 476,
    y = (w) => 120 - ((w.value - min) / (max - min)) * 100;
  return `<svg class="chart" viewBox="0 0 500 148" role="img" aria-label="Gewicht von ${fmt(sorted[0].value, 1)} bis ${fmt(sorted.at(-1).value, 1)} Kilogramm. Einzelwerte stehen darunter."><path d="M12 120H488M12 70H488M12 20H488" stroke="var(--border)" fill="none"/><polyline points="${sorted.map((w) => `${x(w)},${y(w)}`).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>${sorted.map((w) => `<circle cx="${x(w)}" cy="${y(w)}" r="4" fill="var(--accent)"/>`).join("")}<text x="12" y="144">${esc(sorted[0].date.slice(5))}</text><text x="440" y="144">${esc(sorted.at(-1).date.slice(5))}</text></svg>`;
}
function chartView() {
 return `${trendsUI.view()}<div class="toolbar below">${btn("Gewicht eintragen", "weight", "primary")}${btn("Messwert eintragen", "health", "secondary")}</div>`;
}

function trainView() {
  const active = state.activeWorkout,
    weekStart = shiftDate(today(), -((new Date().getDay() + 6) % 7)),
    count = state.workouts.filter(
      (w) =>
        w.date >= weekStart &&
        w.date <= today() &&
        w.sets.some((set) => set.done),
    ).length;
  const guidance=`<strong>${esc(readiness(state).title)}</strong><p>${esc(readiness(state).message)}</p>${btn("Tages-Check-in", "checkin", "text-button")}`;
  return `${active ? `<details class="training-readiness"><summary>${count} / ${state.profile.sessions} Einheiten diese Woche · Hinweise</summary>${guidance}</details>` : `<section class="training-readiness">${guidance}</section><div class="training-banner"><div><span class="eyebrow">DEINE WOCHE</span><h2>${count} / ${state.profile.sessions} Einheiten</h2><p>Regelmäßigkeit vor Rekorden. Zwischen Krafttagen Zeit zur Erholung lassen.</p></div><span class="training-mark">${icon("train")}</span></div>`}${
    active
      ? trainingUI.activeView(active)
      : `${trainingUI.startView()}<details class="training-presets below"><summary>Mit einer Einstiegsvorlage beginnen</summary><div class="two-grid below">${trainingRoutines(state, routines)
          .map(
            (r, i) =>
              `<section class="card routine"><div class="tile-icon">${icon("train")}</div><h2>${r.name}</h2><p>${r.subtitle}</p><ul>${r.exercises.map((e) => `<li>${e}</li>`).join("")}</ul><p>Je 2 Sätze · Einstieg mit 8 Wiederholungen.<br>Vorherige Lasten werden als editierbare Erinnerung übernommen, niemals automatisch gesteigert. 5–10 Minuten locker aufwärmen.</p>${btn("Einheit starten →", "start-workout", "primary wide", `data-index="${i}"`)}</section>`,
          )
          .join("")}</div></details>`
  }<p class="footnote">Allgemeine Einstiegsvorlagen, kein individueller Therapieplan. Bei Vorerkrankungen oder längerem Wiedereinstieg Belastung ärztlich abstimmen. Bei Schmerzen, Schwindel oder Atemnot abbrechen.</p><section class="card below"><div class="section-head"><h2>Trainingsjournal</h2>${btn("+ Aktivität", "activity", "secondary")}</div>${
    state.workouts.length
      ? state.workouts
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map(
            (w) =>
              `<button class="food-row" data-action="workout-detail" data-id="${w.id}"><div><strong>${esc(w.name)}</strong><small>${dateLabel(w.date)} · ${w.sets.filter((s) => s.done).length} Sätze${w.note ? " · " + esc(w.note) : ""}</small></div><strong>${fmt(w.minutes)}<small>Minuten</small></strong></button>`,
          )
          .join("")
      : "<p>Dein nächstes Training ist ein guter Anfang. Hier findest du danach deine Sätze und Wiederholungen.</p>"
  }</section>`;
}
function moreView() {
  return `<div class="profile-menu"><section class="card"><h2>${dsIcon("profile")} Dein Profil & Plan</h2><p>Ziele, persönliche Voraussetzungen und Vorschläge haben hier ihren gemeinsamen Platz.</p>${state.personalPlan ? `<p><strong>${fmt(state.profile.goal)} kg${state.personalPlan.muscleBuild ? " + Muskelaufbau" : ""}</strong><br>${esc(commuteNames[state.personalPlan.commuteMode])} · ${fmt(state.personalPlan.commuteKm)} km pro Arbeitstag<br>Schrittziel: ${fmt(state.personalPlan.stepMin)}–${fmt(state.personalPlan.stepMax)} · tatsächliche Werte unter Messwerte & Verbindungen</p>` : ""}<div class="toolbar">${btn("Profil & Ziele", "settings", "primary")}${btn("Persönliche Voraussetzungen", "coach-settings", "secondary")}${btn("Profildatei laden", "import", "secondary")}${btn("Ziele & Empfehlungen", "coach", "secondary")}${btn("Trends & Diagramme", "go-chart", "secondary")}</div></section><section class="card"><h2>Messwerte & Verbindungen</h2><p>Der Tages-Check-in für Hunger und Befinden liegt unter Heute. Hier findest du gemessene Werte und verbundene Apps.</p><div class="toolbar">${btn("Samsung Health / Schritte", "hc-open", "primary")}${btn("Messwert eintragen", "health", "secondary")}${btn("Messwerte ansehen", "health-history", "secondary")}</div></section><section class="card"><h2>Darstellung & Sicherung</h2><div class="toolbar">${btn("Musik & Klänge", "audio-open", "primary")}${btn(state.theme === "light" ? "Dunkles Design" : "Helles Design", "theme", "secondary")}${btn("Sicherung exportieren", "export", "primary")}${btn("Sicherung importieren", "import", "secondary")}${btn("CSV exportieren", "csv", "secondary")}</div><p class="footnote">Sicherungen enthalten deine persönlichen Daten. Bewahre sie geschützt auf.</p></section><section class="card"><h2>Hilfe</h2>${btn("Datenschutz, Quellen & Hilfe", "about", "text-button")}${btn("Alle Daten löschen", "reset", "text-button danger")}</section></div>`;
}
function healthHistory() {
  sheet(
    "Deine Messwerte",
    `<section>${
      state.health.length
        ? state.health
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .map(
              (h) =>
                `<button class="food-row" data-action="edit-health" data-id="${h.id}"><div><strong>${dateLabel(h.date)}</strong><small>${[
                  ["sleep", "h Schlaf"],
                  ["steps", "Schritte"],
                  ["waist", "cm Bauchumfang"],
                  ["pulse", "Puls/min"],
                ]
                  .filter(([k]) => h[k] !== null)
                  .map(([k, u]) => fmt(h[k], k === "sleep" ? 1 : 0) + " " + u)
                  .join(
                    " · ",
                  )}${h.sys !== null ? " · " + h.sys + "/" + h.dia + " mmHg" : ""}</small><small>${esc(h.note)}</small></div><span>›</span></button>`,
            )
            .join("")
        : "<p>Noch keine Werte. Trage nur ein, was für dich hilfreich ist.</p>"
    }</section>`,
  );
}
function profileForm(initial = false) {
  const p = state.profile || {};
  form(
    initial ? "Dein Start, dein Tempo" : "Profil & Ziele",
    "profile",
    `<p>Nur auf deinem Gerät gespeichert. Ziele kannst du jederzeit ändern.</p>${field("Wie darf dich die App nennen?", "name", p.name || "", "text", 'maxlength="60" autocomplete="given-name"')}<div class="two-grid">${num("Körpergröße · cm", "height", p.height, 130, 230)}${num(initial ? "Startgewicht · kg" : "Ausgangsgewicht · kg", "start", p.start, 35, 350)}${num("Dein nächstes Gewichtsziel · kg", "goal", p.goal, 35, 350)}${num("Kalorienziel · kcal / Tag", "kcal", p.kcal, 1500, 6000, 1)}${num("Proteinziel · g / Tag", "protein", p.protein, 30, 300, 1)}${num("Trinkziel · ml / Tag", "water", p.water ?? 2000, 500, 5000, 50)}${num("Trainingseinheiten / Woche", "sessions", p.sessions ?? 2, 1, 7, 1)}</div><details><summary>Kalorienziel grob schätzen</summary><p>Mifflin-St.-Jeor-Schätzung minus 300 kcal, gerundet. Aktivität enthält deinen Alltag und Sport bereits. Keine medizinische Empfehlung. Bei Erkrankungen oder speziellen Bedürfnissen Ziel fachlich abstimmen.</p><div class="two-grid">${num("Alter · Jahre", "age", "", 18, 100, 1, false)}${select(
      "Formelgrundlage",
      "sex",
      [
        ["", "Bitte auswählen"],
        ["male", "Männlich (+5)"],
        ["female", "Weiblich (−161)"],
      ],
      "",
    )}${select(
      "Aktivität",
      "activity",
      [
        ["1.2", "Überwiegend sitzend"],
        ["1.4", "Leicht aktiv"],
        ["1.6", "Regelmäßig aktiv"],
        ["1.8", "Sehr aktiv"],
      ],
      "1.4",
    )}</div>${btn("Schätzung übernehmen", "calculate", "secondary")}<p>Passt die binäre Formel nicht, kannst du stattdessen ein selbst festgelegtes Ziel eintragen.</p></details><p class="hint">Für Erwachsene. Keine Anwendung als Diätplan bei Schwangerschaft, Stillzeit oder Essstörungen. Bei Erkrankungen individuelle Ziele mit einer Fachperson abstimmen.</p><label class="checkbox"><input type="checkbox" name="adult" required ${initial ? "" : "checked"}> Ich bin mindestens 18 und verstehe, dass die App ein Tagebuch ist.</label>`,
    initial ? "Los geht’s" : "Änderungen speichern",
  );
}
function foodPicker() {
  selectedFood = null;
  editing = null;
  sheet(
    "Essen hinzufügen",
    `${select("Mahlzeit", "meal", meals, meal)}<label class="search">Lebensmittel finden<input id="food-search" type="search" placeholder="z. B. Quark, Kartoffeln, Haferflocken" autocomplete="off"></label><div class="toolbar">${btn(icon("scan") + " Barcode", "barcode", "secondary")}${btn("Nährwerttabelle fotografieren", "ocr-open", "secondary")}${btn("Gespeicherte Mahlzeiten", "templates", "secondary")}${btn("+ Eigenes Lebensmittel", "custom-food", "secondary")}</div><div id="food-results"></div><p class="footnote">Offline-Suche: ${usdaFoods.length} deutsch beschriftete USDA-Lebensmittel, eigene Produkte und ergänzende Orientierungswerte. Alle USDA-Werte pro 100 g; Zubereitungszustand beachten. Markenprodukte über Barcode.</p>`,
  );
  foodResults("");
}
function foodResults(q, showAll = false) {
  const recent = new Set(state.entries.slice(-20).map(foodKey));
  const list = foods()
    .filter((f) => matchesFood(f, q))
    .sort(
      (a, b) =>
        Number(state.favorites.includes(foodKey(b))) * 2 +
        Number(recent.has(foodKey(b))) -
        Number(state.favorites.includes(foodKey(a))) * 2 -
        Number(recent.has(foodKey(a))),
    );
  const shown = q || showAll ? list : list.slice(0, 8);
  $("#food-results").innerHTML =
    shown
      .map((f) => {
        const amount = rememberedAmount(state, f),
          fav = state.favorites.includes(foodKey(f));
        return `<div class="food-result"><button class="food-row" data-action="pick-food" data-id="${esc(f.id)}"><div><strong>${esc(f.name)}</strong><small>${esc(f.source)}${recent.has(foodKey(f)) ? " · Kürzlich verwendet" : ""}</small></div><strong>${fmt(f.kcal)}<small>kcal / 100</small></strong></button><div class="food-shortcuts">${btn(fav ? "★" : "☆", "favorite", "icon-button", `data-id="${esc(f.id)}" aria-label="${fav ? "Favorit entfernen" : "Als Favorit speichern"}: ${esc(f.name)}" aria-pressed="${fav}"`)}${btn(`+ ${fmt(amount)} ${f.name.includes("100 ml") ? "ml" : "g"} direkt`, "quick-food", "secondary", `data-id="${esc(f.id)}"`)}</div></div>`;
      })
      .join("") ||
    "<p>Kein Treffer. Lege das Lebensmittel selbst an oder nutze den Barcode.</p>";
  if (shown.length < list.length)
    $("#food-results").innerHTML += btn(
      "Alle Lebensmittel anzeigen",
      "food-all",
      "secondary wide",
    );
}
function portion(f, entry = null) {
  selectedFood = f;
  editing = entry?.id || null;
  form(
    entry ? "Eintrag bearbeiten" : "Deine Portion",
    "portion",
    `<h3>${esc(f.name)}</h3><p>${esc(f.source)}</p>${foodDetails(f) ? `<p class="footnote">${esc(foodDetails(f))}</p>` : ""}${num(f.name.includes("100 ml") ? "Menge · ml" : "Menge · g", "amount", entry?.amount || rememberedAmount(state, f), 1, 10000)}${select("Mahlzeit", "meal", meals, entry?.meal || meal)}<div class="portion-preview" id="portion-preview" aria-live="polite"></div><div id="portion-nutrients"></div>${btn("Nährwerte ergänzen / korrigieren", "food-nutrients", "text-button")}${entry ? btn("Eintrag löschen", "delete-entry", "text-button danger") : ""}`,
    "Ins Tagebuch speichern",
  );
  updatePortionPreview();
}
function updatePortionPreview() {
  const input = $('#sheet [name="amount"]'),
    preview = $("#portion-preview");
  if (!input || !preview || !selectedFood) return;
  const value = Number(input.value);
  preview.textContent =
    Number.isFinite(value) && value > 0
      ? `${fmt((selectedFood.kcal * value) / 100)} kcal · ${fmt((selectedFood.protein * value) / 100, 1)} g Protein für deine Portion`
      : "Bitte eine gültige Portionsgröße eingeben.";
  const detail=$("#portion-nutrients");
  if(detail)detail.innerHTML=Number.isFinite(value)&&value>0?`<details open><summary>Nährwerte deiner Portion</summary><dl class="portion-nutrient-list">${[['carbs','Kohlenhydrate'],['fat','Fett'],['fiber','Ballaststoffe']].map(([key,name])=>`<div><dt>${name}</dt><dd>${key==='fiber'&&!fiberIsKnown(selectedFood)?'Unbekannt':fmt(selectedFood[key]*value/100,1)+' g'}</dd></div>${nutrientParts.filter(p=>p.parent===key).map(p=>`<div class="nutrient-sub"><dt>${p.key==='sugar'?'davon Zucker':p.name}</dt><dd>${Number.isFinite(selectedFood[p.key])?fmt(selectedFood[p.key]*value/100,2)+' g':'Unbekannt'}</dd></div>`).join('')}`).join('')}</dl><p class="footnote">Unterwerte sind bereits in Kohlenhydraten und Fett enthalten. Zucker umfasst auch natürlich enthaltenen Zucker; zugesetzter oder freier Zucker wird daraus nicht abgeleitet.</p>${partWarnings(selectedFood).map(w=>`<p class="hint">${esc(w)}</p>`).join('')}</details>`:'';
}
function microFields(food) {
  return `<details><summary>Vitamine & Mineralstoffe ergänzen (optional)</summary><p>Nur bekannte Werte pro 100 g/ml eintragen. Leer = unbekannt, 0 = tatsächlich null. Folat als Folat-Äquivalent.</p><div class="two-grid">${micros.map((m) => num(`${m.name} · ${m.unit}`, `micro_${m.key}`, food?.micros?.[m.key] ?? "", 0, 1e7, "any", false)).join("")}</div></details>`;
}
function customFood(f = null, target = null) {
  selectedFood = f;
  nutrientEditTarget = target;
  form(
    "Lebensmittel speichern",
    "custom-food",
    `${target?`<p class="hint">${target.kind==="entry"?"Die Korrektur gilt nur für diesen Tagebucheintrag.":"Die Korrektur gilt für künftige Portionen. Frühere Tagebucheinträge bleiben unverändert."}</p>`:""}${field("Name", "name", f?.name || "", "text", 'required maxlength="100"')}<p>Nährwerte pro 100 g oder 100 ml laut Verpackung. Bei Getränken „(pro 100 ml)“ im Namen ergänzen.</p><div class="two-grid">${[
      ["kcal", "Energie · kcal", 1000],
      ["protein", "Protein · g", 100],
      ["carbs", "Kohlenhydrate · g", 100],
      ["fat", "Fett · g", 100],
      ["fiber", "Ballaststoffe · g", 100],
    ]
      .map(([k, t, max]) =>
        num(t, k, (k === "fiber" && f && !fiberIsKnown(f)) ? "" : (f?.[k] ?? ""), 0, max, "any", k !== "fiber"),
      )
      .join(
        "",
      )}</div><fieldset class="nutrient-fields"><legend>Kohlenhydrate im Detail</legend>${num('Davon Zucker · g','sugar',f?.sugar??'',0,100,'any',false)}</fieldset><details class="nutrient-fields" ${nutrientParts.some(p=>p.parent==='fat'&&Number.isFinite(f?.[p.key]))?'open':''}><summary>Fett im Detail · optional</summary><div class="two-grid">${nutrientParts.filter(p=>p.parent==='fat').map(p=>num(p.name+' · g',p.key,f?.[p.key]??'',0,100,'any',false)).join('')}</div></details><p class="hint">Ballaststoffe, Zucker und Fettsäuren: leer = unbekannt, 0 = tatsächlich null. Unterwerte sind in Kohlenhydraten bzw. Gesamtfett enthalten und werden nicht nochmals zu Kalorien addiert.</p>${microFields(f)}<p class="hint">Produktdaten und erkannte Werte mit der Verpackung abgleichen.</p>`,
    target?.kind === "entry" ? "Eintrag korrigieren" : target?.kind === "food" ? "Lebensmittel aktualisieren" : "Speichern & Portion wählen",
  );
}
function weightForm(d = today()) {
  editing = d;
  const own = state.weights.find((w) => w.date === d);
  const w = own || combinedWeights(state).find((w) => w.date === d);
  form(
    "Gewicht eintragen",
    "weight",
    `${field("Datum", "date", d, "date", `required max="${today()}"`)}${num("Gewicht · kg", "value", w?.value, 35, 350, 0.1)}<p>Ein Wert pro Tag. Ein vorhandener Wert desselben Tages wird ersetzt. Möglichst unter ähnlichen Bedingungen messen.</p>${own ? btn("Messung löschen", "delete-weight", "text-button danger") : ""}`,
  );
}
function healthForm(h = null) {
  editing = h?.id || null;
  form(
    "Dein Gesundheitsjournal",
    "health",
    `${field("Datum", "date", h?.date || today(), "date", `required max="${today()}"`)}<div class="two-grid">${[
      ["sleep", "Schlaf · Stunden", 0, 24],
      ["steps", "Schritte", 0, 100000],
      ["waist", "Bauchumfang · cm", 30, 250],
      ["sys", "Blutdruck systolisch", 60, 260],
      ["dia", "Blutdruck diastolisch", 30, 180],
      ["pulse", "Ruhepuls / Minute", 25, 220],
    ]
      .map(([k, t, min, max]) => num(t, k, h?.[k], min, max, "any", false))
      .join(
        "",
      )}</div><label>Notiz<textarea name="note" maxlength="1000" placeholder="Notiz zur Messung (optional)">${esc(h?.note || "")}</textarea></label><p>Freiwillige Dokumentation, keine medizinische Auswertung. Einträge lösen keine Warnmeldungen aus.</p>${h ? btn("Eintrag löschen", "delete-health", "text-button danger") : ""}`,
  );
}
function recipeForm() {
  form(
    "Dein eigenes Rezept",
    "recipe",
    `${field("Rezeptname", "name", "", "text", 'required maxlength="100"')}<div class="ingredient-box">${select(
      "Zutat",
      "ingredient",
      foods().map((f) => [f.id, f.name]),
      "",
    )}${num("Menge der Zutat · g / ml", "ingredientAmount", 100, 1, 10000)}${btn("+ Zutat übernehmen", "recipe-add", "secondary")}<div id="ingredients"></div></div>${num("Gesamtgewicht nach Zubereitung · g", "cookedWeight", "", 1, 20000)}<p>Wiege das fertige Gericht ohne Gefäß. So werden Wasseraufnahme und Kochverlust korrekt berücksichtigt. Danach kannst du beliebige Portionen in Gramm buchen.</p>`,
    "Rezept speichern",
  );
  renderIngredients();
}
function renderIngredients() {
  if ($("#ingredients"))
    $("#ingredients").innerHTML = recipeItems
      .map(
        (e, i) =>
          `<div class="food-row"><span>${esc(e.name)} · ${fmt(e.amount)} g/ml</span>${btn("×", "recipe-remove", "icon-button", `data-index="${i}" aria-label="Zutat entfernen"`)}</div>`,
      )
      .join("");
}
function barcode() {
  sheet(
    "Produkt per Barcode",
    `<p>Die Abfrage sendet nur den Barcode an Open Food Facts. Deine Tagebuch- und Gesundheitsdaten werden nicht übertragen. Internet erforderlich; Daten können fehlen oder fehlerhaft sein.</p>${typeof window.Android?.scanBarcode === "function" ? btn(icon("scan") + " Erneut scannen", "scan", "primary wide") : ""}<form data-form="barcode">${field("EAN / UPC", "code", "", "text", 'required inputmode="numeric" pattern="[0-9]{8,14}" minlength="8" maxlength="14" placeholder="Barcode-Ziffern eingeben"')}<p class="error" role="alert"></p><button class="secondary wide">Produkt abrufen</button></form><div class="toolbar">${btn("Stattdessen Nährwerttabelle fotografieren", "ocr-open", "secondary")}${btn("Manuell erfassen", "custom-food", "secondary")}</div><p class="footnote">Daten: Open Food Facts · ODbL. Kein kostenpflichtiger Dienst.</p>`,
  );
  if (typeof window.Android?.scanBarcode === "function")
    window.Android.scanBarcode();
}
async function lookup(code) {
  if (!/^\d{8,14}$/.test(code))
    return notify("Bitte 8 bis 14 Barcode-Ziffern eingeben.");
  const cached = state.foods.find((f) => f.barcode === code);
  if (cached) return portion(cached);
  if (Date.now() - lastLookup < 4500) {
    const error = $("#sheet .error");
    if (error) error.textContent = "Bitte kurz warten, bevor du erneut suchst.";
    return;
  }
  lastLookup = Date.now();
  const token = ++searchToken;
  const error = $("#sheet .error");
  if (error) error.textContent = "Produkt wird gesucht …";
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_de,nutriments`,
      { signal: AbortSignal.timeout(12000) },
    );
    if (!response.ok)
      throw Error(
        "Dienst gerade nicht erreichbar. Bitte später erneut versuchen.",
      );
    const f = parseProduct(await response.json(), code);
    if (token !== searchToken || !$("#sheet").open) return;
    customFood(f);
  } catch (e) {
    if (token === searchToken) {
      const target = $("#sheet .error");
      if (target)
        target.textContent =
          e.name === "TimeoutError"
            ? "Zeitüberschreitung. Du kannst das Produkt manuell erfassen."
            : e.message;
      else notify(e.message);
    }
  }
}
window.onBarcode = (code) => {
  if (code) lookup(code);
};
window.onNativeError = (message) => notify(message);
window.onExportComplete = () => notify("Sicherung gespeichert.");
window.onImport = (raw) => importData(raw);
function importData(raw) {
  try {
    pendingPlan = null;
    if (raw.length > 10 * 1024 * 1024) throw Error("Datei ist zu groß.");
    if (JSON.parse(raw)?.kind === "diaetfreund-personal-plan") {
      const plan = parsePersonalPlan(raw);
      applyPersonalPlan(state, plan);
      sheet("Persönliche Einstellungen übernehmen?", `<p>Diese Profildatei ergänzt ausschließlich folgende Einstellungen:</p><ul><li>Größe: ${plan.height} cm · Zielgewicht: ${plan.goal} kg</li><li>Berechnungsgrundlage: ${esc({male:"Männlich",female:"Weiblich",unspecified:"Keine Angabe"}[plan.sex])}</li><li>Muskelaufbau: ${plan.muscleBuild ? "Ja" : "Nein"}</li>${plan.currentWeight ? `<li>Gewicht am ${esc(plan.currentWeight.date)}: ${plan.currentWeight.value} kg${state.weights.some(w=>w.date===plan.currentWeight.date)?" · ersetzt den vorhandenen Wert dieses Tages":""}</li>` : ""}${plan.trainingStage ? `<li>Trainingsstand: ${esc({restart:"Gerade wieder eingestiegen",regular:"Regelmäßig dabei",unspecified:"Keine Angabe"}[plan.trainingStage])}</li>` : ""}<li>Arbeitsweg: ${esc(commuteNames[plan.commuteMode])} · ${plan.commuteKm} km insgesamt pro Arbeitstag</li><li>Später geplant: ${esc(commuteNames[plan.nextCommuteMode])}</li><li>Schrittziel: ${plan.stepMin}–${plan.stepMax} pro Tag · keine gemessenen Schritte</li><li>Bluthochdruck berücksichtigen: ${plan.hypertension ? "Ja" : "Nein"}</li><li>Betablocker berücksichtigen: ${plan.betaBlocker ? "Ja" : "Nein"}</li></ul><p>Tagebuch, Pokémon und bisherige Kalorienziele bleiben erhalten. ${plan.currentWeight ? "Nur der oben angezeigte Gewichtstag wird ergänzt oder ersetzt; alle anderen Gewichtswerte bleiben erhalten." : "Vorhandene Gewichtswerte bleiben erhalten."} Keine automatische Sportfreigabe oder Aktivitätsberechnung.</p>${!state.coach ? '<p>Geburtsdatum und tatsächlichen Aktivitätsumfang bitte anschließend unter „Persönliche Voraussetzungen“ ergänzen.</p>' : ''}${btn("Abbrechen", "close", "secondary")}${btn("Einstellungen übernehmen", "confirm-personal-plan", "primary wide")}`);
      pendingPlan = plan;
      return;
    }
    const imported = parseBackup(raw);
    sheet(
      "Sicherung wiederherstellen?",
      `<p>Diese Sicherung enthält ${imported.entries.length} Essenseinträge, ${imported.weights.length} Gewichtswerte und ${imported.workouts.length} Aktivitäten. Sie ersetzt deine aktuellen Daten vollständig.</p><p>Exportiere vorher deine aktuelle Sicherung, wenn du sie behalten möchtest.</p>${btn("Aktuelle Daten sichern", "export", "secondary")}${btn("Daten ersetzen", "confirm-import", "primary wide")}`,
    );
    window.pendingImport = imported;
  } catch (e) {
    notify(e.message);
  }
}
function download(content, name, mime) {
  if (window.Android) {
    Android.exportFile(content, name, mime);
    return;
  }
  const a = document.createElement("a"),
    url = URL.createObjectURL(new Blob([content], { type: mime }));
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function csvExport() {
  const rows = [
    [
      "Typ",
      "Datum",
      "Bezeichnung",
      "Menge",
      "Einheit",
      "kcal",
      "Protein_g",
      "Kohlenhydrate_g",
      "Fett_g",
      "Ballaststoffe_g",
      ...nutrientParts.map(p=>p.key+"_g"),
    ],
  ];
  state.entries.forEach((e) =>
    rows.push([
      "Essen",
      e.date,
      e.name,
      e.amount,
      "g/ml",
      ...nutrients.map((k) => k==="fiber"&&!fiberIsKnown(e)?"":((e[k] * e.amount) / 100).toFixed(2)),
      ...nutrientParts.map(p=>Number.isFinite(e[p.key])?((e[p.key]*e.amount)/100).toFixed(3):""),
    ]),
  );
  state.weights.forEach((w) =>
    rows.push(["Gewicht", w.date, "Gewicht", w.value, "kg"]),
  );
  Object.entries(state.water).forEach(([d, v]) =>
    rows.push(["Wasser", d, "Wasser", v, "ml"]),
  );
  state.health.forEach((h) => {
    for (const [k, u] of [
      ["sleep", "h"],
      ["steps", "Schritte"],
      ["waist", "cm"],
      ["sys", "mmHg"],
      ["dia", "mmHg"],
      ["pulse", "/min"],
    ])
      if (h[k] !== null) rows.push(["Gesundheit", h.date, k, h[k], u]);
    if (h.note) rows.push(["Notiz", h.date, h.note]);
  });
  state.workouts.forEach((w) => {
    rows.push(["Training", w.date, w.name, w.minutes, "min"]);
    w.sets
      .filter((s) => s.done)
      .forEach((s) =>
        rows.push([
          "Satz",
          w.date,
          s.exercise,
          s.kg,
          "kg × " + (s.mode === "time" ? s.seconds + " Sek." : s.reps + " Wdh."),
        ]),
      );
  });
  const cell = (x) =>
    '"' +
    String(x ?? "")
      .replace(/^[\t\r\n =+@-]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  download(
    "\uFEFF" + rows.map((r) => r.map(cell).join(";")).join("\r\n"),
    "fitdex-" + today() + ".csv",
    "text/csv",
  );
}
function confirmAction(title, message, action) {
  sheet(
    title,
    `<p>${message}</p>${btn("Abbrechen", "close", "secondary")}${btn("Bestätigen", action, "primary")}`,
  );
}
const gameUI = setupGameUI({
  playEffect: key => atmosphere.effect(key),
  getState: () => state,
  commit,
  render,
  sheet,
  btn,
  esc,
  notify,
  close,
});
const exerciseHistory=setupExerciseHistory({getState:()=>state,today,sheet,btn,esc,fmt});
const trainingUI = setupTrainingUI({ getState: () => state, commit, render, form, sheet, btn, field, num, select, esc, notify, close });
const coachUI = setupCoachUI({
  getState: () => state,
  getDate: () => date,
  form,
  sheet,
  btn,
  field,
  num,
  select,
  esc,
  fmt,
  commit,
  render,
  close,
  notify,
});
const healthUI = setupHealthUI({
  getState: () => state,
  commit,
  render,
  sheet,
  btn,
  esc,
  fmt,
  notify,
});
const mealUI = setupMealUI({
  getState: () => state,
  getDate: () => date,
  setDate: value => {date=value;tab="food";},
  commit,
  sheet,
  btn,
  esc,
  fmt,
  notify,
  render,
  close,
});
const ocrUI = setupNutritionOCR({
  sheet,
  btn,
  esc,
  notify,
  customFood,
  beforeOpen: () => searchToken++,
});
const trainerUI = setupTrainerUI({ getState: () => state, btn, esc, sheet });
const atmosphere = setupAtmosphere({getState:()=>state,commit,render,sheet,btn,select,num,notify,esc});
const trendsUI = setupTrends({getState:()=>state,today,render,btn,esc,fmt,sheet});
const nutritionBalance = setupNutritionBalance({getState:()=>state,getDate:()=>date,today,fmt,esc,btn,sheet});
const eggUI=setupEggUI({getState:()=>state,commit,render,sheet,btn,esc,fmt,today,notify,effect:k=>atmosphere.effect(k),syncSteps:()=>healthUI.sync(false)});
const actions = {
  ...eggUI.actions,
  ...nutritionBalance.actions,
  ...trendsUI.actions,
  ...atmosphere.actions,
  ...trainerUI.actions,
  ...trainingUI.actions,
  ...exerciseHistory.actions,
  "health-history": healthHistory,
  "go-chart": () => {
    close();
    tab = "chart";
    render();
    window.scrollTo(0, 0);
  },
  "go-home": () => {
    close();
    tab = "home";
    render();
    window.scrollTo(0, 0);
  },
  "care-choice": () =>
    sheet(
      "Bewegen oder erholen",
      `<p>Beides zählt gleich viel. Wähle, was heute zu dir passt.</p><div class="toolbar">${btn("Zum Training", "go-train", "primary")}${btn("Bewusste Erholung festhalten", "game-rest", "secondary")}</div>`,
    ),
  ...ocrUI.actions,
  "food-all": () => foodResults($("#food-search")?.value || "", true),
  ...mealUI.actions,
  ...coachUI.actions,
  ...gameUI.actions,
  ...healthUI.actions,
  favorite: (b) => {
    const food = foods().find((f) => f.id === b.dataset.id),
      key = foodKey(food);
    if (
      commit(
        (s) =>
          (s.favorites = s.favorites.includes(key)
            ? s.favorites.filter((k) => k !== key)
            : [...s.favorites, key]),
      )
    )
      foodResults($("#food-search")?.value || "");
  },
  "quick-food": (b) => {
    const food = foods().find((f) => f.id === b.dataset.id),
      amount = rememberedAmount(state, food);
    meal = $("#sheet [name=meal]")?.value || meal;
    if (
      commit((s) => {
        s.entries.push({
          ...food,
          foodId: foodKey(food),
          id: uid(),
          amount,
          date,
          meal,
        });
        s.completeDays[date] = false;
      })
    ) {
      close();
      render();
      notify("Portion übernommen. Zum Ändern im Tagebuch antippen.");
    }
  },
  close,
  onboard: () => profileForm(true),
  settings: () => profileForm(),
  tab: (b) => {
    tab = b.dataset.tab;
    if (tab === "home") date = today();
    render();
    window.scrollTo(0, 0);
  },
  "go-food": () => {
    tab = "food";
    render();
  },
  "go-train": () => {
    close();
    tab = "train";
    render();
  },
  prev: () => {
    date = shiftDate(date, -1);
    render();
  },
  next: () => {
    if (date < today()) date = shiftDate(date, 1);
    render();
  },
  "add-food": (b) => {
    meal = b.dataset.meal || meal;
    foodPicker();
  },
  "pick-food": (b) => {
    meal = $('#sheet [name="meal"]')?.value || meal;
    portion(foods().find((f) => f.id === b.dataset.id));
  },
  "edit-entry": (b) => {
    const e = state.entries.find((e) => e.id === b.dataset.id);
    portion(e, e);
  },
  "custom-food": () => customFood(),
  "food-nutrients": () => {if(selectedFood)customFood(selectedFood,editing?{kind:'entry',id:editing}:state.foods.some(f=>f.id===selectedFood.id)?{kind:'food',id:selectedFood.id}:null);},
  barcode,
  scan: () => Android.scanBarcode(),
  weight: (b) => weightForm(b.dataset.date || today()),
  health: () => healthForm(),
  "edit-health": (b) =>
    healthForm(state.health.find((h) => h.id === b.dataset.id)),
  theme: () => {
    if (commit((s) => (s.theme = s.theme === "light" ? "dark" : "light")))
      render();
  },
  water: (b) => {
    if (
      commit(
        (s) =>
          (s.water[date] = Math.max(
            0,
            Math.min(10000, (s.water[date] || 0) + Number(b.dataset.amount)),
          )),
      )
    ) {
      atmosphere.effect('bubble');
      render();
    }
  },
  "delete-entry": () => {
    if (
      commit((s) => (s.entries = s.entries.filter((e) => e.id !== editing)))
    ) {
      close();
      render();
      notify("Eintrag gelöscht.");
    }
  },
  "delete-weight": () => {
    if (
      commit((s) => (s.weights = s.weights.filter((w) => w.date !== editing)))
    ) {
      close();
      render();
    }
  },
  "delete-health": () => {
    if (commit((s) => (s.health = s.health.filter((h) => h.id !== editing)))) {
      close();
      render();
    }
  },
  "copy-day": () => {
    const prev = state.entries.filter((e) => e.date === shiftDate(date, -1));
    if (!prev.length) return notify("Am Vortag gibt es noch keine Mahlzeiten.");
    confirmAction(
      "Vortag übernehmen?",
      `${prev.length} Einträge werden zusätzlich in den gewählten Tag kopiert. Bestehende Einträge bleiben erhalten.`,
      "confirm-copy",
    );
  },
  "confirm-copy": () => {
    if (
      commit((s) =>
        s.entries.push(
          ...s.entries
            .filter((e) => e.date === shiftDate(date, -1))
            .map((e) => ({ ...e, id: uid(), date })),
        ),
      )
    ) {
      close();
      render();
      notify("Mahlzeiten übernommen.");
    }
  },
  calculate: () => {
    try {
      const f = $("#sheet form"),
        data = Object.fromEntries(new FormData(f));
      f.elements.kcal.value = estimate({
        weight: data.start,
        height: data.height,
        age: data.age,
        sex: data.sex,
        activity: data.activity,
      });
      notify("Schätzung übernommen. Bitte als Startwert überprüfen.");
    } catch (e) {
      $("#sheet .error").textContent = e.message;
    }
  },
  recipe: () => {
    recipeItems = [];
    recipeForm();
  },
  "recipe-add": () => {
    try {
      const f = $("#sheet form"),
        item = foods().find((x) => x.id === f.elements.ingredient.value);
      recipeItems.push({
        ...item,
        amount: number(
          f.elements.ingredientAmount.value,
          1,
          10000,
          "Zutatenmenge",
        ),
      });
      renderIngredients();
    } catch (e) {
      $("#sheet .error").textContent = e.message;
    }
  },
  "recipe-remove": (b) => {
    recipeItems.splice(Number(b.dataset.index), 1);
    renderIngredients();
  },
  "start-workout": (b) => {
    if (state.activeWorkout) return;
    const r = trainingRoutines(state, routines)[Number(b.dataset.index)];
    const previous = previousSets(state, r.name);
    if (
      commit(
        (s) =>
          (s.activeWorkout = {
            id: uid(),
            name: r.name,
            date: today(),
            started: Date.now(),
            note: "",
            sets: r.exercises.flatMap((exercise) =>
              Array.from({ length: 2 }, (_, index) => ({
                exercise,
                kg:
                  previous.filter((x) => x.exercise === exercise)[index]?.kg ||
                  0,
                reps:
                  previous.filter((x) => x.exercise === exercise)[index]
                    ?.reps || 8,
                done: false,
              })),
            ),
          }),
      )
    )
      render();
  },
  "toggle-set": (b) => {
    const i = Number(b.dataset.index);
    if (
      commit(
        (s) => (s.activeWorkout.sets[i].done = !s.activeWorkout.sets[i].done),
      )
    ) {
      if (state.activeWorkout.sets[i].done) { timerEnd = Date.now() + 90000; atmosphere.effect("heal"); }
      render();
    }
  },
  rest: () => {
    timerEnd = Date.now() + 90000;
    notify("90 Sekunden Pause gestartet.");
  },
  "custom-exercise": () =>
    form(
      "Eigene Übung",
      "exercise",
      `${field("Übungsname", "exercise", "", "text", 'required maxlength="100"')}${field("Gerät / Variante", "equipment", "Eigene Angabe", "text", 'maxlength="100"')}${num("Anzahl Sätze", "sets", 2, 1, 10, 1)}${select("Erfassung", "exerciseMode", [["reps","Wiederholungen"],["time","Zeit in Sekunden"]], "reps")}<div id="custom-reps">${num("Wiederholungen", "reps", 8, 1, 100, 1)}</div><div id="custom-seconds" hidden>${num("Sekunden pro Satz", "seconds", 30, 1, 3600, 1)}</div>${num("Zusatzgewicht · kg", "kg", 0, 0, 500, 0.5)}`,
    ),
  "finish-workout": () => {
    const w = state.activeWorkout;
    if (!w.sets.some((s) => s.done))
      return notify("Hake zuerst mindestens einen absolvierten Satz ab.");
    form(
      "Gut gemacht. Einheit abschließen",
      "finish",
      `${num("Dauer · Minuten", "minutes", Math.min(1440, Math.max(1, Math.round((Date.now() - w.started) / 60000))), 1, 1440, 1)}${num("Anstrengung (optional) · 1 leicht bis 10 maximal", "effort", "", 1, 10, 1, false)}<label>Notiz<textarea name="note" maxlength="1000" placeholder="Wie lief es heute?"></textarea></label><p>Nur abgehakte Sätze werden ins Journal übernommen.</p>`,
      "Training speichern",
    );
  },
  "discard-workout": () =>
    confirmAction(
      "Training verwerfen?",
      "Die laufenden Sätze werden gelöscht.",
      "confirm-discard",
    ),
  "confirm-discard": () => {
    if (commit((s) => (s.activeWorkout = null))) {
      timerEnd = 0;
      close();
      render();
    }
  },
  activity: () => {
    editing = null;
    form(
      "Aktivität eintragen",
      "activity",
      `${field("Aktivität", "name", "", "text", 'required maxlength="100" placeholder="z. B. Radfahren oder Spaziergang"')}${field("Datum", "date", today(), "date", `required max="${today()}"`)}${num("Dauer · Minuten", "minutes", 30, 1, 1440, 1)}`,
    );
  },
  "workout-detail": (b) => {
    editing = b.dataset.id;
    const w = state.workouts.find((w) => w.id === editing);
    sheet(
      w.name,
      `<p>${dateLabel(w.date)} · ${w.minutes} Minuten${w.effort ? " · Anstrengung " + w.effort + "/10" : ""}</p>${w.sets.map((s) => `<div class="food-row"><strong>${esc(s.exercise)}</strong><span>${s.kg} kg · ${s.mode === "time" ? s.seconds + " s" : s.reps + " Wdh."}</span></div>`).join("")}<p>${esc(w.note)}</p>${w.sets.some(s=>s.done)?btn("Als neue Einheit starten","workout-repeat","primary",`data-id="${esc(w.id)}"`):""}${btn("Übungsverlauf","exercise-history","secondary")}${btn("Aktivität löschen", "delete-workout", "text-button danger")}`,
    );
  },
  "delete-workout": () =>
    confirmAction(
      "Aktivität löschen?",
      "Dieser Journaleintrag wird entfernt.",
      "confirm-delete-workout",
    ),
  "confirm-delete-workout": () => {
    if (
      commit((s) => (s.workouts = s.workouts.filter((w) => w.id !== editing)))
    ) {
      close();
      render();
    }
  },
  export: () =>
    download(
      JSON.stringify(state, null, 2),
      "fitdex-" + today() + ".json",
      "application/json",
    ),
  csv: csvExport,
  import: () => {
    if (window.Android) {
      Android.importFile();
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      const f = input.files[0];
      if (f) {
        if (f.size > 10 * 1024 * 1024) return notify("Sicherung ist zu groß.");
        importData(await f.text());
      }
    };
    input.click();
  },
  "confirm-personal-plan": () => {
    if (!pendingPlan) return;
    const plan = pendingPlan;
    if (commit(s => Object.assign(s, applyPersonalPlan(s, plan)))) {
      close();
      render();
      notify("Deine persönlichen Einstellungen sind übernommen. Tagebuch und Spielstand bleiben erhalten.");
    }
  },
  "confirm-import": () => {
    if (
      window.pendingImport &&
      commit((s) => {
        for (const key of Object.keys(s)) delete s[key];
        Object.assign(s, window.pendingImport);
      }, true)
    ) {
      healthUI.invalidatePending();
      ocrUI.invalidate();
      atmosphere.stop();
      delete window.pendingImport;
      timerEnd = 0;
      date = today();
      close();
      render();
      notify("Sicherung wiederhergestellt.");
    }
  },
  reset: () =>
    form(
      "Alle Daten löschen",
      "reset",
      `<p>Dein gesamtes lokales Tagebuch wird unwiderruflich gelöscht. Exportiere bei Bedarf zuerst eine Sicherung.</p>${field("Zum Bestätigen LÖSCHEN eingeben", "confirm", "", "text", 'required autocomplete="off"')}`,
      "Alle Daten löschen",
    ),
  licenses: async () => {
    try {
      const response = await fetch("licenses.txt");
      if (!response.ok) throw Error("Lizenzen nicht lesbar.");
      const text = await response.text();
      sheet(
        "Drittanbieter-Lizenzen",
        `<pre class="licenses">${esc(text)}</pre>`,
      );
    } catch (error) {
      notify(error.message);
    }
  },
  about: () =>
    sheet(
      "Über FitDex",
      `<h3>Dein Alltag, ohne Abo.</h3><p>Version 0.11.3 · Offline-Tagebuch für Erwachsene. Keine Werbung, Telemetrie, Konten oder kostenpflichtigen KI-Dienste.</p><h3>Datenschutz</h3><p>Deine Daten liegen im privaten App-Speicher. Android-Cloud-Backup ist deaktiviert. Die App setzt die Gerätesperre voraus; sie bietet keine eigene Verschlüsselung oder PIN. Exportdateien sind unverschlüsselt. Deinstallation entfernt lokale Daten. Sichere regelmäßig.</p><h3>Health Connect</h3><p>Optional Schritte, Schlafdauer und Gewicht lesen. Eigene Gewichte nur nach Vorschau ausdrücklich teilen. Freigaben lassen sich in Android widerrufen. Lokale Importkopien kannst du unter Schritte & Erholung entfernen; bereits geteilte Werte verwaltest du in Health Connect.</p><h3>Barcode & Kamera</h3><p>Nur nach deiner Aktion wird ein Barcode an world.openfoodfacts.org gesendet (einschließlich technisch notwendiger IP-Adresse). Kamerabilder verlassen das Gerät nicht. Nährwerttabellen werden mit Tesseract lokal erkannt; übernommene Werte müssen geprüft werden. Kein automatisches Schätzen von Mahlzeitenfotos.</p><h3>Quellen & Lizenzen</h3><p>Produktdaten: Open Food Facts (opendatacommons.org/licenses/odbl/1-0/). Datenbank ODbL, einzelne Inhalte Database Contents License. Eigene Lebensmittel sind getrennt gekennzeichnet. Prüfe die Verpackung, insbesondere Portionsgrößen und Allergene. Die App beurteilt keine Allergensicherheit.</p><p>Offline-Lebensmittel: ${usdaFoods.length} ausgewählte Datensätze aus USDA FoodData Central, SR Legacy April 2018 (CC0). Deutsche Bezeichnungen, FDC-IDs und Herkunft sind hinterlegt. US-Durchschnittswerte; keine vollständige Datenbank und kein Ersatz für aktuelle Packungsangaben. Kohlenhydrate näherungsweise ohne Ballaststoffe, Vitamin E als Alpha-Tocopherol, Folat als DFE. Fehlende Werte bleiben unbekannt.</p><p>Barcode-Erkennung: ZXing / JourneyApps (Apache 2.0). AndroidX (Apache 2.0). Foto-OCR: Tesseract4Android / Tesseract und deutsches tessdata_fast-Modell (Apache 2.0), Leptonica, libjpeg und libpng. Keine OCR-Telemetrie oder Bild-Uploads. Vollständige Hinweise im Repository.</p>${btn("Lizenztexte offline lesen", "licenses", "secondary")}<p>Zusätzliche Originalgrafiken aus Pokémon Platin: Kampfkulissen (Sunday_Domeko), Box-Hintergründe (Dragoon), The Spriters Resource. Vier kurze Originaleffekte aus Diamant/Perl (BellBlitzKing, The Sounds Resource). Hintergrundmusik: drei eigene prozedurale Kompositionen, keine Original-Soundtrackaufnahmen. Originalgrafiken aus Pokémon HeartGold/SoulSilver: PokeAPI-Sprite-Spiegel und The Spriters Resource (Menü: redblueyellow; Orte: Latias Tamer). Pokémon © Nintendo / Creatures / GAME FREAK. Inoffizielles Fanprojekt; keine freie Lizenz für die Originalgrafiken.</p><h3>Gesundheit</h3><p>Kalorienformel: Mifflin–St. Jeor (1990), Schätzung mit individuell gewähltem Aktivitätsfaktor. Bewegungsvorlagen orientieren sich an allgemeinen NHS-Empfehlungen. Keine Diagnose, Überwachung, Notfallerkennung oder garantierte Gewichtsabnahme. Gesundheitseinträge werden nicht medizinisch bewertet.</p><h3>Bedienung</h3><p>Essen: Lebensmittel wählen, Gramm eingeben, speichern. Einträge antippen zum Bearbeiten. Verlauf: pro Datum ein Gewicht. Training: Sätze bearbeiten, abhaken, abschließen. Mehr: Gesundheitsjournal, Ziele und Sicherungen. Barcode braucht Internet; alles andere funktioniert offline.</p>`,
    ),
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (b && !b.disabled) {
    e.preventDefault();
    try {
      actions[b.dataset.action]?.(b);

    } catch (err) {
      notify(err.message);
    }
  }
  if (e.target.closest(".wordmark")) {
    e.preventDefault();
    tab = "home";
    render();
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "exercise-search") trainingUI.results();
  if (e.target.id === "food-search") foodResults(e.target.value);
  if (e.target.name === "amount") updatePortionPreview();
});
document.addEventListener("change", (e) => {
  trendsUI.change(e.target);
  if(e.target.name==="exerciseMode"){const timed=e.target.value==="time";$("#custom-reps").hidden=timed;$("#custom-seconds").hidden=!timed;$('[name="reps"]').disabled=timed;$('[name="seconds"]').disabled=!timed;}
  if (e.target.name === "equipmentFilter") trainingUI.results();
  if (e.target.id === "day") {
    if (e.target.value && e.target.value <= today()) {
      date = e.target.value;
      render();
    }
  }
  if (e.target.matches("[data-set]")) {
    const t = e.target;
    try {
      const n = number(
        t.value,
        t.dataset.key === "kg" ? 0 : 1,
        t.dataset.key === "kg" ? 500 : t.dataset.key === "seconds" ? 3600 : 100,
      );
      if (
        !commit(
          (s) =>
            (s.activeWorkout.sets[Number(t.dataset.set)][t.dataset.key] = n),
        )
      )
        render();
    } catch (err) {
      notify(err.message);
      render();
    }
  }
});
document.addEventListener("submit", (e) => {
  const f = e.target;
  if (!f.dataset.form) return;
  e.preventDefault();
  const d = Object.fromEntries(new FormData(f));
  try {
    let ok = false;
    if (f.dataset.form === "audio-settings") { if(atmosphere.apply(d)) close(); return; }
    const trainingResult = trainingUI.submit(f.dataset.form, d);
    if (trainingResult !== null) return;
    const coachResult = coachUI.submit(f.dataset.form, d);
    if (coachResult !== null) {
      if (coachResult) {
        close();
        render();
        notify(
          f.dataset.form === "checkin"
            ? "Dein Tages-Check-in ist gespeichert."
            : "Deine persönlichen Angaben sind gespeichert.",
        );
      }
      return;
    }
    switch (f.dataset.form) {
      case "profile": {
        const p = {
          name: d.name.trim(),
          height: number(d.height, 130, 230),
          start: number(d.start, 35, 350),
          goal: number(d.goal, 35, 350),
          kcal: number(d.kcal, 1500, 6000),
          protein: number(d.protein, 30, 300),
          water: number(d.water, 500, 5000),
          sessions: number(d.sessions, 1, 7),
        };
        if (p.goal >= p.start)
          throw Error(
            "Für dieses Abnehmziel bitte ein Ziel unter dem Ausgangsgewicht wählen.",
          );
        if (p.goal / (p.height / 100) ** 2 < 18.5)
          throw Error(
            "Das Ziel liegt unter dem unterstützten Gewichtsbereich. Bitte fachlich abstimmen.",
          );
        ok = commit((s) => {
          const first = !s.profile;
          if (s.profile && s.profile.kcal !== p.kcal)
            s.targetHistory.push({
              date: today(),
              from: s.profile.kcal,
              to: p.kcal,
              reason: "Manuell angepasst",
            });
          s.profile = p;
          if (s.personalPlan) Object.assign(s.personalPlan, {height:p.height,goal:p.goal});
          if (first && !s.weights.length)
            s.weights.push({ date: today(), value: p.start });
        });
        break;
      }
      case "portion": {
        const entry = {
          ...selectedFood,
          foodId: foodKey(selectedFood),
          id: editing || uid(),
          date,
          meal: d.meal,
          amount: number(d.amount, 1, 10000),
        };
        ok = commit((s) => {
          s.entries = s.entries.filter((e) => e.id !== entry.id);
          s.entries.push(entry);
          s.completeDays[date] = false;
        });
        break;
      }
      case "custom-food": {
        const food = {
          id: uid(),
          name: d.name.trim(),
          source: selectedFood?.source || "Eigene Packungsangabe",
          fiberKnown: d.fiber.trim() !== "",
          ...Object.fromEntries(nutrientParts.map(p=>[p.key,d[p.key].trim()===""?null:number(d[p.key],0,100,p.name)])),
          micros: Object.fromEntries(
            micros.map((m) => [
              m.key,
              d[`micro_${m.key}`] === ""
                ? null
                : number(d[`micro_${m.key}`], 0, 1e7, m.name),
            ]),
          ),
          ...Object.fromEntries(
            nutrients.map((k) => [
              k,
              number(k==="fiber"&&d[k].trim()===""?0:d[k], 0, k === "kcal" ? 1000 : 100, k),
            ]),
          ),
        };
        if (!food.name) throw Error("Bitte einen Namen eingeben.");
        if (selectedFood?.barcode) food.barcode = selectedFood.barcode;
        if(nutrientEditTarget?.kind==='entry'){
          const id=nutrientEditTarget.id;
          if(commit(s=>{const entry=s.entries.find(e=>e.id===id);if(!entry)throw Error('Eintrag nicht mehr vorhanden.');Object.assign(entry,food,{id});})){close();render();}
        }else if(nutrientEditTarget?.kind==='food'){
          food.id=nutrientEditTarget.id;
          if(commit(s=>{const index=s.foods.findIndex(f=>f.id===food.id);if(index<0)throw Error('Lebensmittel nicht mehr vorhanden.');s.foods[index]=food;}))portion(food);
        }else if (commit((s) => s.foods.push(food))) portion(food);
        return;
      }
      case "weight": {
        if (d.date > today())
          throw Error("Bitte kein zukünftiges Datum verwenden.");
        ok = commit((s) => {
          s.weights = s.weights.filter((w) => w.date !== d.date);
          s.weights.push({ date: d.date, value: number(d.value, 35, 350) });
        });
        break;
      }
      case "health": {
        const h = { id: editing || uid(), date: d.date, note: d.note.trim() };
        for (const [k, min, max] of [
          ["sleep", 0, 24],
          ["steps", 0, 100000],
          ["waist", 30, 250],
          ["sys", 60, 260],
          ["dia", 30, 180],
          ["pulse", 25, 220],
        ])
          h[k] = d[k] === "" ? null : number(d[k], min, max, k);
        if ((h.sys === null) !== (h.dia === null))
          throw Error("Bitte beide Blutdruckwerte eintragen.");
        if (h.sys !== null && h.sys <= h.dia)
          throw Error(
            "Systolischer Wert muss höher als diastolischer Wert sein.",
          );
        if (
          !h.note &&
          ["sleep", "steps", "waist", "sys", "pulse"].every(
            (k) => h[k] === null,
          )
        )
          throw Error("Bitte mindestens einen Wert oder eine Notiz eintragen.");
        ok = commit((s) => {
          s.health = s.health.filter((x) => x.id !== h.id);
          s.health.push(h);
        });
        break;
      }
      case "recipe": {
        if (!recipeItems.length)
          throw Error("Bitte mindestens eine Zutat hinzufügen.");
        const r = recipeFood(d.name.trim(), recipeItems, d.cookedWeight);
        if (!r.name) throw Error("Bitte einen Namen eingeben.");
        if (commit((s) => s.foods.push(r))) portion(r);
        return;
      }
      case "barcode":
        lookup(d.code.trim());
        return;
      case "exercise":
        ok = commit((s) =>
          s.activeWorkout.sets.push(
            ...makeSets({name:d.exercise.trim(),equipment:d.equipment?.trim()||"Eigene Angabe",mode:d.exerciseMode==="time"?"time":"reps"}, number(d.sets,1,10), d.exerciseMode==="time"?1:number(d.reps,1,100), number(d.kg,0,500), d.exerciseMode==="time"?number(d.seconds,1,3600):30),
          ),
        );
        break;
      case "finish":
        ok = commit((s) => {
          const w = s.activeWorkout;
          s.workouts.push({
            id: w.id,
            name: w.name,
            date: w.date,
            sets: w.sets.filter((x) => x.done),
            minutes: number(d.minutes, 1, 1440),
            ...(d.effort ? { effort: number(d.effort, 1, 10) } : {}),
            note: d.note.trim(),
          });
          s.activeWorkout = null;
        });
        if(ok)timerEnd = 0;
        break;
      case "activity":
        ok = commit((s) =>
          s.workouts.push({
            id: uid(),
            date: d.date,
            name: d.name.trim(),
            minutes: number(d.minutes, 1, 1440),
            sets: [],
            note: "",
          }),
        );
        break;
      case "reset":
        if (d.confirm !== "LÖSCHEN") throw Error("Bitte LÖSCHEN eingeben.");
        ok = commit((s) => {
          for (const key of Object.keys(s)) delete s[key];
          Object.assign(s, emptyState());
        }, true);
        if (ok) { healthUI.invalidatePending(); atmosphere.stop(); atmosphere.clearMusic().catch(error=>notify(error.message)); }
        ocrUI.invalidate();
        break;
    }
    if (ok) {
      close();
      render();
      notify("Gespeichert. Ein guter Schritt für dich.");
    }
  } catch (err) {
    f.querySelector(".error").textContent = err.message;
  }
});
setInterval(() => {
  const el = $("#rest");
  if (el) {
    const remaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
    el.textContent = remaining
      ? `Pause · ${remaining} s`
      : timerEnd
        ? "Pause beendet"
        : "Pause bereit";
  }
}, 1000);
window.onAppBack = () => {
  if ($("#sheet").open) {
    close();
    return;
  }
  if (tab !== "home") {
    tab = "home";
    render();
    return;
  }
  window.Android?.exitApp();
};
render();
setTimeout(() => healthUI.sync(true), 800);
