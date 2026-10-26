import { pokemon as kantoPokemon } from "./kanto-data.js";
import * as kantoWorld from "./kanto-world.js";
// National Pokédex IDs are global. Region IDs and archive keys never change across releases.
export const regionPacks = {
  kanto: {
    id: "kanto",
    generation: 1,
    name: "Kanto",
    pokemon: kantoPokemon,
    world: kantoWorld,
  },
};
export const nationalDex = Object.assign(
  {},
  ...Object.values(regionPacks).map((r) => r.pokemon),
);
export const plannedRegions = [
  { id: "johto", name: "Johto", generation: 2 },
  { id: "hoenn", name: "Hoenn", generation: 3 },
  { id: "sinnoh", name: "Sinnoh", generation: 4 },
];
export const catalogSize = () => Object.keys(nationalDex).length;
export function pack(id) {
  if (!regionPacks[id]) throw Error("Region ist noch nicht installiert.");
  return regionPacks[id];
}
