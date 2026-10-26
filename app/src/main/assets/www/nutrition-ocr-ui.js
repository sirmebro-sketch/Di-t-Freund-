import {nutrientParts} from './nutrient-parts.js';
import { parseNutritionLabel, normalizeLabel } from "./nutrition-ocr.js";
export function setupNutritionOCR({
  sheet,
  btn,
  esc,
  notify,
  customFood,
  beforeOpen,
}) {
  let request = null,
    text = "",
    draft = null;
  function view() {
    sheet(
      "Nährwerttabelle erfassen",
      `<p>Foto aufnehmen oder auswählen. Die Erkennung läuft auf deinem Gerät. Anschließend Werte und Bezugsmenge prüfen.</p><div class="toolbar">${btn("Tabelle fotografieren / Foto wählen", "ocr-scan", "primary")}</div><details ${text ? "open" : ""}><summary>Erkannten Text prüfen oder einfügen</summary><label>Nährwerttabelle<textarea id="ocr-text" rows="8" maxlength="20000" placeholder="pro 100 g\nEnergie 150 kcal\nFett 4,5 g\nKohlenhydrate 20 g\nEiweiß 7 g">${esc(text)}</textarea></label></details><div class="two-grid"><label>Zahlenspalte<select id="ocr-column"><option value="0">Erste Spalte</option><option value="1">Zweite Spalte</option><option value="2">Dritte Spalte</option></select></label><label>Diese Spalte gilt pro … g/ml<input id="ocr-basis" inputmode="decimal" placeholder="z. B. 100 oder Portionsgröße" value=""></label></div><p class="hint">Nur eine Spalte übernehmen. „Pro Portion 30 g“ bedeutet Bezugsmenge 30. Prozentwerte sind keine Grammangaben.</p>${btn("Werte auslesen", "ocr-parse", "secondary")}<div id="ocr-results"></div>`,
    );
  }
  function parse() {
    text = document.querySelector("#ocr-text").value;
    const p = parseNutritionLabel(
      text,
      Number(document.querySelector("#ocr-column").value),
    );
    const basis = document.querySelector("#ocr-basis");
    if (!basis.value && p.basis100 && p.maxColumns === 1) basis.value = "100";
    draft = p;
    document.querySelector("#ocr-results").innerHTML =
      `<h3>Erkennungsvorschläge</h3><p>Angaben in der gewählten Spalte, noch nicht umgerechnet:</p>${Object.entries(
        {
          kcal: "Energie · kcal",
          protein: "Eiweiß · g",
          carbs: "Kohlenhydrate · g",
          fat: "Fett · g",
          fiber: "Ballaststoffe · g",
          ...Object.fromEntries(nutrientParts.map(p=>[p.key,p.name+" · g"])),
        },
      )
        .map(
          ([key, label]) =>
            `<div class="ocr-result"><strong>${label}</strong><span>${p.values[key] ?? "Nicht erkannt"}</span><small>${esc(p.evidence[key] || "Bitte im nächsten Schritt ergänzen.")}</small></div>`,
        )
        .join(
          "",
        )}<p>${p.warnings.map(esc).join(" ")}</p><label class="checkbox"><input id="ocr-confirm" type="checkbox">Ich habe Zahlenspalte und Bezugsmenge mit der Packung verglichen.</label>${btn("Übernehmen & Lebensmittel prüfen", "ocr-use", "primary")}`;
  }
  window.onNutritionScan = (raw) => {
    try {
      const p = JSON.parse(raw);
      if (p.requestId !== request) return;
      request = null;
      if (!document.querySelector("#sheet[open] #ocr-text")) return;
      if (p.cancelled) {
        notify("Fotoaufnahme abgebrochen.");
        return;
      }
      text = String(p.text || "").slice(0, 20000);
      view();
      parse();
    } catch {
      notify("Foto konnte nicht ausgewertet werden. Bitte erneut versuchen.");
    }
  };
  const invalidate = () => {
    request = null;
    draft = null;
    text = "";
  };
  return {
    invalidate,
    actions: {
      "ocr-open": () => {
        beforeOpen();
        invalidate();
        view();
      },
      "ocr-scan": () => {
        if (typeof window.Android?.scanNutrition !== "function") {
          notify(
            "Foto-Erkennung ist in der Android-App verfügbar. Hier kannst du Text einfügen.",
          );
          return;
        }
        request = crypto.randomUUID();
        window.Android.scanNutrition(request);
      },
      "ocr-parse": parse,
      "ocr-use": () => {
        if (!draft || !document.querySelector("#ocr-confirm")?.checked)
          throw Error(
            "Bitte zuerst die Angaben mit der Packung vergleichen und bestätigen.",
          );
        // Reparse current input so editing text/column cannot apply a stale preview.
        const p = parseNutritionLabel(
          document.querySelector("#ocr-text").value,
          Number(document.querySelector("#ocr-column").value),
        );
        const values = normalizeLabel(
          p.values,
          document.querySelector("#ocr-basis").value,
        );
        if (Object.values(values).every((v) => v === null))
          throw Error(
            "Keine Nährwerte erkannt. Text ergänzen oder neu fotografieren.",
          );
        request = null;
        customFood({
          name: "",
          source: "Packungsfoto · lokal erkannt und geprüft",
          ...Object.fromEntries(
            Object.entries(values).map(([k, v]) => [
              k,
              v ?? "",
            ]),
          ),
        });
      },
    },
  };
}
