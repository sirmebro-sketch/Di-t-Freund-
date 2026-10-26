import { staples } from './core.js';
import { usdaFoods } from './usda-foods.js';
export { usdaFoods };
const supplied = new Set(usdaFoods.map(f => f.id));
const legacy = new Map(staples.map(f => [f.id, f]));
// Older versions used names as preference keys, even for base IDs. Preserve
// those exact keys when the clearer USDA name differs; never rewrite entries.
export const offlineFoods = [
  ...usdaFoods.map(f => ({...f, foodId: legacy.get(f.id)?.name || f.id})),
  ...staples.filter(f => !supplied.has(f.id)),
];
const normalize = s => String(s).toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export function matchesFood(food, query) {
  const name = normalize(food.name);
  return normalize(query).trim().split(/\s+/).every(word => name.includes(word));
}
export function foodDetails(food) {
  return Number.isInteger(food.fdcId)
    ? 'USDA-Durchschnittswerte pro 100 g essbarem Anteil. Roh und gekocht unterscheiden. Kohlenhydrate näherungsweise ohne Ballaststoffe; konkrete Packungsangaben haben Vorrang. Fehlende Mikronährstoffe bleiben unbekannt.'
    : '';
}
