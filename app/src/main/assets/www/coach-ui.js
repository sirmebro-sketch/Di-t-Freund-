import { micros, microTotals, referenceFor } from "./micros.js";
import { energyModel, weeklyReview, readiness, ageAt } from "./coach.js";
import { today, number } from "./core.js";
export function setupCoachUI(ctx) {
  const {
    getState,
    getDate,
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
  } = ctx;
  const check = (label, name, value = false) =>
    `<label class="checkbox"><input name="${name}" type="checkbox" ${value ? "checked" : ""}>${label}</label>`;
  function card() {
    const s = getState();
    if (!s.coach)
      return `<section class="compass"><span class="compass-symbol" aria-hidden="true">✧</span><div><span class="eyebrow">DEIN PERSÖNLICHER KOMPASS</span><h2>Ein Plan, der dich kennenlernt.</h2><p>Dein Alltag, dein Training und dein Verlauf – gemeinsam statt einzeln betrachtet.</p>${btn("Auf mich abstimmen", "coach-settings", "primary")}</div></section>`;
    const r = weeklyReview(s),
      todayCheck = s.checkins[today()];
    return `<section class="compass"><span class="compass-symbol" aria-hidden="true">✧</span><div><span class="eyebrow">DEIN PERSÖNLICHER KOMPASS · LOKAL</span><h2>${esc(r.title)}</h2><p>${esc(r.reason)}</p><div class="toolbar">${btn("Meinen Kompass öffnen", "coach", "primary")}${btn(todayCheck ? "Check-in ändern" : "Wie geht es dir heute?", "checkin", "secondary")}</div></div></section>`;
  }
  function view() {
    const s = getState(),
      m = energyModel(s),
      r = weeklyReview(s),
      c = s.coach,
      p = s.profile;
    if (!c) return settings();
    const proteinRef = Math.min(
      m?.weight || p.start,
      25 * (p.height / 100) ** 2,
    );
    sheet(
      "Dein persönlicher Kompass",
      `<p>Die Auswertung aktualisiert sich mit deinen Einträgen. Ziele ändern sich erst, wenn du einen konkreten Vorschlag übernimmst.</p>${m ? `<div class="stats-grid"><div class="mini-stat"><small>Ruhebedarf · Schätzung</small><strong>${fmt(m.bmr)} kcal</strong></div><div class="mini-stat"><small>Gesamtbedarf · Schätzung</small><strong>${fmt(m.tdee)} kcal</strong></div></div><p class="footnote">Mifflin–St. Jeor, Alter ${m.age}, ${fmt(m.weight, 1)} kg, Aktivitätsfaktor ${c.activity}. Grobe Orientierungsspanne ${fmt(m.low)}–${fmt(m.high)} kcal (±15 %, keine statistische Sicherheit). Alltag und Sport sind bereits enthalten. Das ist keine Messung deines Verbrauchs.</p>` : '<p class="hint">Für deine gewählten Angaben wird kein pauschaler Energiebedarf berechnet. Individuelle Vorgaben in Profil & Ziele eintragen.</p>'}<section class="card"><span class="eyebrow">DEIN 21-TAGE-RÜCKBLICK</span><h3>${esc(r.title)}</h3><p>${esc(r.reason)}</p><div class="data-progress"><span>${r.complete}/18 vollständige Esstage</span><span>${r.first}/3 frühe · ${r.last}/3 aktuelle Gewichte</span></div>${r.perWeek !== null ? `<p>Gewichtstrend: ${r.perWeek >= 0 ? "−" : "+"}${fmt(Math.abs(r.perWeek), 2)} kg/Woche. ${r.meanIntake !== null ? "Erfasste Zufuhr an vollständigen Tagen: " + fmt(r.meanIntake) + " kcal/Tag." : ""}</p>` : ""}${r.measured !== null ? `<p class="footnote">Rechnerische Verlaufsschätzung des Verbrauchs: ${fmt(r.measured)} kcal/Tag. Näherung mit 7.700 kcal/kg, keine Messung. Wasser und Muskelveränderungen können sie verfälschen.</p>` : ""}${r.suggested !== null ? btn(`${p.kcal} → ${r.suggested} kcal prüfen`, "review-target", "primary wide") : ""}</section>${m && !s.targetHistory.length ? `<section class="card below"><h3>Ein möglicher Startwert</h3><p>${fmt(m.start)} kcal/Tag entsprechen der Modellschätzung minus etwa 300 kcal. Prüfe diesen Wert anhand deines Verlaufs; er ist kein medizinischer Ernährungsplan.</p>${btn("Startwert prüfen", "initial-target", "secondary")}</section>` : ""}<section class="card below"><h3>Protein & Muskelaufbau</h3>${c.nutritionCare ? "<p>Deine fachlich vereinbarten Ziele gehen vor.</p>" : `<p>Für ein Krafttrainingsziel kann ein individuell abgestimmter Bereich sinnvoll sein. Als Gesprächsgrundlage: etwa ${fmt(proteinRef * 1.2)}–${fmt(proteinRef * 1.6)} g/Tag, gerechnet mit ${fmt(proteinRef, 1)} kg Referenzgewicht (höchstens BMI 25). Das ist eine Orientierung, keine Pflichtmenge.</p>`}<p>Dein eingestelltes Ziel bleibt ${p.protein} g/Tag. Nicht jede Trainingseinheit erhöht automatisch den Bedarf.</p>${btn("Nährstoffübersicht", "micros", "secondary")}</section><section class="card below"><h3>Dein Trainingsrhythmus</h3><p>${c.sessions} geplante Krafttage pro Woche${c.sessions === 2 ? " · dritte Einheit optional, wenn erholt" : ""}. ${c.location === "both" ? "Gym und Zuhause sind Alternativen – keine addierten Pflichttermine." : ""}</p><p>Gym: Zeitfenster ${c.gymMinutes} Minuten · Zuhause: ${c.homeMinutes} Minuten. Das Zeitbudget ist kein Zwang, die gesamte Zeit intensiv zu trainieren.</p><p>${esc(readiness(s).message)}</p></section>${
        s.targetHistory.length
          ? `<details class="below"><summary>Deine bisherigen Zieländerungen</summary>${s.targetHistory
              .slice(-10)
              .reverse()
              .map(
                (h) =>
                  `<p>${h.date}: ${h.from} → ${h.to} kcal<br>${esc(h.reason)}</p>`,
              )
              .join("")}</details>`
          : ""
      }<div class="toolbar">${btn("Persönliche Angaben ändern", "coach-settings", "secondary")}${btn("Profil & Ziele", "settings", "secondary")}</div>`,
    );
  }
  function settings() {
    const c = getState().coach || {};
    form(
      "Auf dich abgestimmt",
      "coach-settings",
      `<p>Diese Angaben bleiben auf deinem Gerät. Sie helfen, Vorschläge zu erklären und ungeeignete Automatismen auszuschließen.</p><div class="two-grid">${field("Geburtsdatum", "birthDate", c.birthDate || "", "date", "required")}${select(
        "Grundlage für Referenzwerte",
        "sex",
        [
          ["unspecified", "Keine Angabe · Ziele manuell"],
          ["male", "Männlich"],
          ["female", "Weiblich"],
        ],
        c.sex || "unspecified",
      )}${select(
        "Aktueller Alltag inklusive Sport",
        "activity",
        [
          ["1.2", "Überwiegend sitzend"],
          ["1.4", "Leicht aktiv"],
          ["1.6", "Regelmäßig aktiv"],
          ["1.8", "Sehr aktiv"],
        ],
        c.activity || 1.4,
      )}${select(
        "Trainingsort",
        "location",
        [
          ["both", "Gym und Zuhause"],
          ["gym", "Gym"],
          ["home", "Zuhause"],
        ],
        c.location || "both",
      )}${select(
        "Feste Krafttage pro Woche",
        "sessions",
        [
          ["2", "2 · dritte Einheit optional"],
          ["3", "3 · mit Erholung dazwischen"],
        ],
        c.sessions || 2,
      )}${num("Zeitfenster Zuhause · Minuten", "homeMinutes", c.homeMinutes || 30, 15, 60, 5)}${num("Zeitfenster Gym · Minuten", "gymMinutes", c.gymMinutes || 60, 30, 120, 5)}</div><p class="hint">Wähle deine derzeitige Aktivität, nicht dein Wunschpensum. Sport wird später nicht ein zweites Mal zu den Kalorien addiert.</p>${check("Bluthochdruck berücksichtigen", "hypertension", c.hypertension)}${check("Betablocker / Medikament beeinflusst meinen Puls", "betaBlocker", c.betaBlocker)}${check("Belastbarkeit und Wiedereinstieg sind ärztlich abgestimmt", "trainingCleared", c.trainingCleared)}${check("Besonderer Ernährungsbedarf: z. B. Nierenkrankheit, Schwangerschaft/Stillzeit, Essstörung oder medizinische Ernährungsvorgaben", "nutritionCare", c.nutritionCare)}${check("Rauchen bei Vitamin-C-Referenz berücksichtigen", "smoker", c.smoker)}<p class="footnote">Keine Medikamentendosierung, Diagnose oder automatische medizinische Überwachung. Die App kann deine Belastbarkeit nicht feststellen.</p>`,
      "Meinen Kompass aktivieren",
    );
  }
  function checkin() {
    const c = getState().checkins[today()] || {};
    form(
      "Dein kurzer Tages-Check-in",
      "checkin",
      `${select(
        "Wie stark ist dein Hunger?",
        "hunger",
        [
          ["1", "1 · kaum"],
          ["2", "2 · leicht"],
          ["3", "3 · gut handhabbar"],
          ["4", "4 · stark"],
          ["5", "5 · sehr stark"],
        ],
        c.hunger || 3,
      )}${select(
        "Wie erschöpft fühlst du dich?",
        "fatigue",
        [
          ["1", "1 · frisch"],
          ["2", "2 · etwas müde"],
          ["3", "3 · mittel"],
          ["4", "4 · erschöpft"],
          ["5", "5 · sehr erschöpft"],
        ],
        c.fatigue || 2,
      )}${check("Ich habe Schmerzen oder andere Beschwerden", "pain", c.pain)}<p>Ein Check-in pro Tag, jederzeit änderbar. Beschwerden werden nicht medizinisch beurteilt; bei akuten oder anhaltenden Beschwerden ärztliche Hilfe nutzen.</p>`,
    );
  }
  function microView() {
    const s = getState(),
      d = getDate(),
      entries = s.entries.filter((e) => e.date === d),
      t = microTotals(entries);
    sheet(
      "Vitamine & Mineralstoffe",
      `<p>Erfasste Zufuhr am ${d}. Fehlende Angaben bleiben <strong>unbekannt</strong>. Ein niedriger erfasster Wert ist kein nachgewiesener Mangel.</p><p class="hint">Referenzwerte: DGE/ÖGE, Stand 26.10.2026. Nur soweit deine Angaben passen; keine Supplementdosierung. Protein, Kohlenhydrate, Fett und Ballaststoffe findest du im Tagebuch.</p>${micros
        .map((m) => {
          const v = t[m.key],
            ref = referenceFor(m, s.coach, d);
          return `<section class="micro-row"><div class="section-head"><h3>${m.name}</h3><strong>${v.value === null ? "Unbekannt" : fmt(v.value, 1) + " " + m.unit}</strong></div><p>${v.known}/${v.total} Einträge mit Daten${ref !== null ? " · Referenz " + ref + " " + m.unit + "/Tag" : " · kein pauschaler Referenzwert"}</p>${v.value !== null && ref !== null ? `<div class="track"><i style="width:${Math.min(100, (v.value / ref) * 100)}%"></i></div>` : ""}<small>${esc(m.note)} Quelle: dge.de/wissenschaft/referenzwerte/${m.slug}/</small></section>`;
        })
        .join(
          "",
        )}<p class="footnote">Die kleine Offline-Grundauswahl hat keine verifizierten Mikronährstoffwerte. Barcode-Daten enthalten oft nur Makronährstoffe. Fehlende Werte kannst du anhand einer belastbaren Quelle im eigenen Lebensmittel ergänzen. Diese Übersicht ist keine vollständige Analyse aller essenziellen Nährstoffe.</p>`,
    );
  }
  function targetProposal(initial = false) {
    const s = getState(),
      model = energyModel(s),
      r = weeklyReview(s),
      target = initial ? model?.start : r.suggested;
    if (!Number.isFinite(target) || target > 6000 || target < 1500)
      return notify("Zurzeit kein passender Zielvorschlag verfügbar.");
    sheet(
      "Kalorienziel bewusst ändern",
      `<p>Dein Ziel würde von <strong>${s.profile.kcal}</strong> auf <strong>${target} kcal/Tag</strong> wechseln.</p><p>${initial ? "Grobe Modellschätzung für den Einstieg." : esc(r.reason)}</p><p>Bei medizinischen Vorgaben oder Unsicherheit zuerst fachlich abstimmen. Die App misst deinen Energieverbrauch nicht.</p>${btn("Abbrechen", "close", "secondary")}${btn("Dieses Ziel übernehmen", initial ? "apply-initial" : "apply-review", "primary")}`,
    );
  }
  function applyTarget(initial) {
    const s = getState(),
      r = weeklyReview(s),
      target = initial ? energyModel(s)?.start : r.suggested;
    if (!Number.isFinite(target) || target < 1500 || target > 6000)
      return notify("Vorschlag nicht mehr verfügbar.");
    if (initial && s.targetHistory.length)
      return notify("Nutze die Verlaufsauswertung oder manuelle Ziele.");
    if (
      commit((next) => {
        next.targetHistory.push({
          date: today(),
          from: next.profile.kcal,
          to: target,
          reason: initial
            ? "Bestätigter Modell-Startwert"
            : "Bestätigter 21-Tage-Verlaufsvorschlag",
        });
        next.profile.kcal = target;
      })
    ) {
      close();
      render();
      notify("Ziel übernommen und im Verlauf dokumentiert.");
    }
  }
  const actions = {
    coach: view,
    "coach-settings": settings,
    checkin,
    micros: microView,
    "review-target": () => targetProposal(false),
    "initial-target": () => targetProposal(true),
    "apply-review": () => applyTarget(false),
    "apply-initial": () => applyTarget(true),
    "complete-day": () => {
      const d = getDate(),
        s = getState();
      if (!s.entries.some((e) => e.date === d))
        return notify("Trage zuerst die Mahlzeiten dieses Tages ein.");
      if (commit((next) => (next.completeDays[d] = !next.completeDays[d])))
        render();
    },
  };
  function submit(kind, d) {
    if (kind === "coach-settings") {
      const age = ageAt(d.birthDate);
      if (!Number.isFinite(age) || age < 18 || age > 100)
        throw Error("Bitte ein gültiges Geburtsdatum für Erwachsene eingeben.");
      return commit((s) => {
        s.coach = {
          birthDate: d.birthDate,
          sex: d.sex,
          activity: number(d.activity, 1.2, 1.8),
          location: d.location,
          sessions: number(d.sessions, 2, 3),
          homeMinutes: number(d.homeMinutes, 15, 60),
          gymMinutes: number(d.gymMinutes, 30, 120),
          ...Object.fromEntries(
            [
              "hypertension",
              "betaBlocker",
              "trainingCleared",
              "nutritionCare",
              "smoker",
            ].map((k) => [k, d[k] === "on"]),
          ),
        };
        s.profile.sessions = s.coach.sessions;
      });
    }
    if (kind === "checkin")
      return commit(
        (s) =>
          (s.checkins[today()] = {
            hunger: number(d.hunger, 1, 5),
            fatigue: number(d.fatigue, 1, 5),
            pain: d.pain === "on",
          }),
      );
    return null;
  }
  return { card, actions, submit };
}
