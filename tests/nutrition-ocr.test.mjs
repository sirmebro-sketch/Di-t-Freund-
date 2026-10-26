import test from "node:test";
import assert from "node:assert/strict";
import {
  parseNutritionLabel,
  normalizeLabel,
} from "../app/src/main/assets/www/nutrition-ocr.js";
const label =
  "Nährwerte pro 100 g\nEnergie 1530 kJ / 366 kcal\nFett 7,5 g\ndavon gesättigte Fettsäuren 1,2 g\nKohlenhydrate 60 g\ndavon Zucker 1,0 g\nBallaststoffe 10 g\nEiweiß 13,5 g\nSalz 0,01 g";
test("German label uses kcal rather than kJ; sugar and saturates never overwrite totals", () => {
  const p = parseNutritionLabel(label);
  assert.deepEqual(p.values, {
    kcal: 366,
    protein: 13.5,
    carbs: 60,
    fat: 7.5,
    fiber: 10,
    sugar: 1, saturatedFat: 1.2, monoFat:null, polyFat:null, transFat:null,
  });
  assert.equal(p.basis100, true);
  assert.equal(p.maxColumns, 1);
});
test("two columns require explicit selection, ignore percent RI, and can normalize a portion", () => {
  const p = parseNutritionLabel(
    "pro 100 g / Portion 30 g\nEnergie 1600 kJ / 380 kcal 480 kJ / 114 kcal\nFett 10 g 3 g 4%\nKohlenhydrate 60 g 18 g 7%\nEiweiß 12 g 3,6 g 7%",
    1,
  );
  assert.equal(p.maxColumns, 2);
  assert.equal(p.values.fat, 3);
  assert.equal(p.values.kcal, 114);
  assert.equal(p.values.protein, 3.6);
  assert.equal(p.values.fiber, null);
  assert.equal(normalizeLabel(p.values, 30).kcal, 380);
  assert.ok(p.warnings.length);
});
test("unknown, less-than, implausible and conflicting data stay unfilled", () => {
  assert.equal(parseNutritionLabel("Fett <0,5 g").values.fat, null);
  assert.equal(parseNutritionLabel("Fett 5 g\nFett 8 g").values.fat, null);
  assert.equal(parseNutritionLabel("Keine Tabelle").values.kcal, null);
  assert.throws(() => normalizeLabel({ kcal: 300 }, 0));
  assert.throws(() => normalizeLabel({ fat: 300 }, 100));
  assert.throws(() => parseNutritionLabel("x".repeat(20001)));
});
test("kJ-only labels and line breaks are handled without inventing other nutrients", () => {
  const p = parseNutritionLabel("Energie\n418,4 kJ\nEiweiß\n4,5 g");
  assert.equal(p.values.kcal, 100);
  assert.equal(p.values.protein, 4.5);
  assert.equal(p.values.fiber, null);
  assert.equal(p.basis100, false);
});

test("OCR misreading a gram symbol as a digit does not silently create a value", () => {
  const p = parseNutritionLabel("Fett 8,59");
  assert.equal(p.values.fat, null);
  assert.ok(p.warnings.some((w) => w.includes("Einheit")));
});

test("bullets and dash-prefixed child rows survive OCR line breaks", () => {
  const p = parseNutritionLabel('pro 100 g\nFett 18 g\ndavon\n— Gesättigte Fettsäuren 12g\nKohlenhydrate 62g\ndavon\n– Zucker\n22g\n• Einfach ungesättigte Fettsäuren 4g\n· Mehrfach ungesättigte Fettsäuren 1g');
  assert.equal(p.values.fat,18);assert.equal(p.values.saturatedFat,12);assert.equal(p.values.sugar,22);assert.equal(p.values.monoFat,4);assert.equal(p.values.polyFat,1);
});
test("gram/digit confusion is a separate proposal, never an accepted nutrient", () => {
  const p=parseNutritionLabel('pro 100 g\nFett 189\nProtein 6,79\nKohlenhydrate 629\nZucker 29');
  assert.equal(p.values.fat,null);assert.equal(p.values.protein,null);assert.equal(p.suggestions.fat.value,18);assert.equal(p.suggestions.protein.value,6.7);assert.equal(p.suggestions.carbs.value,62);assert.equal(p.suggestions.sugar.value,2);
  assert.equal(parseNutritionLabel('Fett 189g').values.fat,189);
  assert.deepEqual(parseNutritionLabel('Fett 18\nProtein 9\nZucker <0,19\nKohlenhydrate 10009').suggestions,{});
});
test("uncertain cells keep their columns instead of moving a different value into place", () => {
  const text='pro 100 g / Portion 30 g\nFett 189 5,4 g 8%\nProtein 6,7 g 2,09 3%';
  const first=parseNutritionLabel(text),second=parseNutritionLabel(text,1);
  assert.equal(first.values.fat,null);assert.equal(first.suggestions.fat.value,18);assert.equal(first.values.protein,6.7);assert.equal(second.values.fat,5.4);assert.equal(second.values.protein,null);assert.equal(second.suggestions.protein.value,2);assert.equal(first.maxColumns,2);
});
test("contradictory and less-than rows cannot produce an apparently certain correction",()=>{
  for(const text of ['Fett 189\nFett 209','Fett 189\nFett 18','Fett <0,5 g\nFett 189','Fett 18 g\nFett 20 g\nFett 189'])assert.equal(parseNutritionLabel(text).suggestions.fat,undefined);
  const p=parseNutritionLabel('Fett 18 g\nFett 189');assert.equal(p.values.fat,18);assert.equal(p.suggestions.fat,undefined);
  for(const text of ['Fett -5g','Fett ≤0,5g','Fett ≥10g'])assert.equal(parseNutritionLabel(text).values.fat,null);
});
