import {nationalSpecies} from './national-data.js';
import { pokemon as kantoPokemon } from "./kanto-data.js";
import { pokemon as johtoPokemon } from "./johto-data.js";
import * as johtoWorld from "./johto-world.js";
import * as kantoWorld from "./kanto-world.js";
// National Pokédex IDs are global. Region IDs and archive keys never change across releases.
export const regionPacks = {
  johto: {
    id: "johto",
    generation: 2,
    name: "Johto",
    pokemon: johtoPokemon,
    world: johtoWorld,
  },
  kanto: {
    id: "kanto",
    generation: 1,
    name: "Kanto",
    pokemon: kantoPokemon,
    world: kantoWorld,
  },
};
export const nationalDex = Object.assign(
  structuredClone(nationalSpecies),
  ...Object.values(regionPacks).map((r) => r.pokemon),
);
for(const [id,p] of Object.entries(nationalDex)){p.generation=nationalSpecies[id].generation;p.hatchCycles=nationalSpecies[id].hatchCycles;}
export const inDexRegion=(id,region)=>region==='all'||(region==='kanto'?id<=151:region==='johto'?id>151&&id<=251:nationalDex[id]?.generation===Number(region));
export const plannedRegions = [
  { id: "hoenn", name: "Hoenn", generation: 3 },
  { id: "sinnoh", name: "Sinnoh", generation: 4 },
];
export const catalogSize = () => Object.keys(nationalDex).length;
export function pack(id) {
  if (!regionPacks[id]) throw Error("Region ist noch nicht installiert.");
  return regionPacks[id];
}
