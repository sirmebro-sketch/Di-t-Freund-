import { saveMeal, addMeal, renameMeal } from "./meal-templates.js";
import { meals, totals, number, today } from "./core.js";
export function setupMealUI({
  getState,
  getDate,
  commit,
  sheet,
  btn,
  esc,
  fmt,
  notify,
  render,
  close,
}) {
  let selected = null;
  const find = (id) => getState().mealTemplates?.find((t) => t.id === id);
  const chooseMeal = (value) =>
    `<label>Mahlzeit<select id="template-meal">${meals.map((m) => `<option ${m === value ? "selected" : ""}>${m}</option>`).join("")}</select></label>`;
  const nameField = (value) =>
    `<label>Name der Mahlzeit<input id="template-name" maxlength="80" value="${esc(value)}" placeholder="z. B. Mein Haferfrühstück" autocomplete="off"></label>`;
  function list() {
    const templates = getState().mealTemplates || [];
    sheet(
      "Deine gespeicherten Mahlzeiten",
      `<p>Einmal zusammenstellen, später mit passenden Mengen wieder eintragen. Die Lebensmittel und ihre Nährwerte werden als Kopie gespeichert.</p>${templates.length ? templates.map((t) => `<section class="card"><h3>${esc(t.name)}</h3><p>${t.items.length} Lebensmittel · ${fmt(totals(t.items).kcal)} kcal</p><div class="toolbar">${btn("Mengen prüfen & verwenden", "template-preview", "primary", `data-id="${esc(t.id)}"`)}${btn("Umbenennen", "template-rename", "secondary", `data-id="${esc(t.id)}"`)}${btn("Entfernen", "template-delete", "text-button", `data-id="${esc(t.id)}"`)}</div></section>`).join("") : '<p class="hint">Trage eine Mahlzeit ins Tagebuch ein und tippe dort auf „Als Mahlzeit speichern“.</p>'}<p class="footnote">Vorlagen sind in deiner Datensicherung enthalten. Entfernen einer Vorlage verändert keine Tagebucheinträge.</p>`,
    );
  }
  function preview(id) {
    const t = find(id);
    if (!t) return;
    selected = id;
    sheet(
      t.name,
      `<p>Prüfe die Mengen. Erst mit „Ins Tagebuch eintragen“ wird etwas gespeichert.</p><div class="two-grid"><label>Datum<input id="template-date" type="date" value="${getDate()}" max="${today()}"></label>${chooseMeal(t.meal)}</div><label>Portionsfaktor<select id="template-scale"><option value="0.5">Halbe Portion</option><option value="1" selected>Gespeicherte Portion</option><option value="1.5">Anderthalbe Portion</option><option value="2">Doppelte Portion</option></select></label><p class="footnote">Ein Faktor setzt alle Mengen neu. Du kannst jede Menge anschließend einzeln anpassen.</p>${t.items.map((item, i) => `<label>${esc(item.name)} · ${item.name.includes("100 ml") ? "ml" : "g"}<input data-template-amount="${i}" inputmode="decimal" value="${item.amount}"></label>`).join("")}<p id="template-total" role="status"></p><div class="toolbar">${btn("Ins Tagebuch eintragen", "template-add", "primary")}${btn("Zurück zu Mahlzeiten", "templates", "secondary")}</div>`,
    );
    updateTotal();
  }
  function amounts() {
    return [...document.querySelectorAll("[data-template-amount]")].map((e) =>
      number(e.value, 1, 10000, "Menge"),
    );
  }
  function updateTotal() {
    const output = document.querySelector("#template-total"),
      t = find(selected);
    if (!output || !t) return;
    try {
      const values = amounts(),
        total = totals(
          t.items.map((item, i) => ({ ...item, amount: values[i] })),
        );
      output.textContent = `${fmt(total.kcal)} kcal · ${fmt(total.protein, 1)} g Protein · ${fmt(total.carbs, 1)} g Kohlenhydrate · ${fmt(total.fat, 1)} g Fett`;
    } catch {
      output.textContent = "Bitte für jede Menge 1 bis 10.000 eingeben.";
    }
  }
  document.addEventListener("input", (e) => {
    if (e.target.matches("[data-template-amount]")) updateTotal();
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "template-scale") {
      const t = find(selected);
      if (!t) return;
      document
        .querySelectorAll("[data-template-amount]")
        .forEach(
          (el, i) =>
            (el.value =
              Math.round(t.items[i].amount * Number(e.target.value) * 10) / 10),
        );
      updateTotal();
    }
  });
  const actions = {
    templates: list,
    "template-save": (b) =>
      sheet(
        "Mahlzeit speichern",
        `${nameField(b.dataset.meal)}<p>Alle Lebensmittel dieser Mahlzeit am ${esc(getDate())} werden übernommen. Später kannst du die Mengen vor jedem Eintragen anpassen.</p>${btn("Vorlage speichern", "template-save-confirm", "primary", `data-meal="${esc(b.dataset.meal)}" data-date="${getDate()}"`)}`,
      ),
    "template-save-confirm": (b) => {
      const name = document.querySelector("#template-name").value;
      if (
        commit((s) => saveMeal(s, name, b.dataset.meal, b.dataset.date), true)
      ) {
        list();
        render();
        notify("Mahlzeit gespeichert.");
      }
    },
    "template-preview": (b) => preview(b.dataset.id),
    "template-add": () => {
      const id = selected,
        values = amounts(),
        date = document.querySelector("#template-date").value,
        meal = document.querySelector("#template-meal").value;
      if (date > today())
        throw Error("Bitte heute oder ein früheres Datum wählen.");
      if (commit((s) => addMeal(s, id, { date, meal, amounts: values }))) {
        selected = null;
        close();
        render();
        notify(
          "Mahlzeit ins Tagebuch eingetragen. Einzelne Einträge kannst du dort ändern.",
        );
      }
    },
    "template-rename": (b) => {
      const t = find(b.dataset.id);
      if (t)
        sheet(
          "Mahlzeit umbenennen",
          `${nameField(t.name)}${btn("Namen speichern", "template-rename-confirm", "primary", `data-id="${esc(t.id)}"`)}`,
        );
    },
    "template-rename-confirm": (b) => {
      const name = document.querySelector("#template-name").value;
      if (commit((s) => renameMeal(s, b.dataset.id, name), true)) list();
    },
    "template-delete": (b) => {
      const t = find(b.dataset.id);
      if (t)
        sheet(
          "Vorlage entfernen?",
          `<p>„${esc(t.name)}“ aus deinen Vorlagen entfernen? Bereits eingetragene Mahlzeiten bleiben erhalten.</p><div class="toolbar">${btn("Vorlage entfernen", "template-delete-confirm", "danger", `data-id="${esc(t.id)}"`)}${btn("Abbrechen", "templates", "secondary")}</div>`,
        );
    },
    "template-delete-confirm": (b) => {
      if (
        commit(
          (s) =>
            (s.mealTemplates = s.mealTemplates.filter(
              (t) => t.id !== b.dataset.id,
            )),
          true,
        )
      )
        list();
    },
  };
  return { actions };
}
