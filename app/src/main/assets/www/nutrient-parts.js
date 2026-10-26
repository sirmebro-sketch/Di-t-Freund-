// Optional values per 100 g/ml. Absence is unknown, never an inferred zero.
export const nutrientParts = [
  {key:'sugar',name:'Zucker',parent:'carbs',off:'sugars_100g'},
  {key:'saturatedFat',name:'Gesättigte Fettsäuren',parent:'fat',off:'saturated-fat_100g'},
  {key:'monoFat',name:'Einfach ungesättigte Fettsäuren',parent:'fat',off:'monounsaturated-fat_100g'},
  {key:'polyFat',name:'Mehrfach ungesättigte Fettsäuren',parent:'fat',off:'polyunsaturated-fat_100g'},
  {key:'transFat',name:'Transfettsäuren',parent:'fat',off:'trans-fat_100g'},
];
export function partTotals(entries){
  return Object.fromEntries(nutrientParts.map(({key})=>{
    const known=entries.filter(e=>Number.isFinite(e[key]));
    return [key,{value:known.length?known.reduce((n,e)=>n+e[key]*e.amount/100,0):null,known:known.length,total:entries.length}];
  }));
}
export function recipeParts(entries,weight){
  const totals=partTotals(entries);
  return Object.fromEntries(nutrientParts.map(({key})=>[key,entries.length&&totals[key].known===entries.length?Math.round(totals[key].value/weight*100000)/1000:null]));
}
export function parseParts(n){
  return Object.fromEntries(nutrientParts.map(({key,off})=>{
    const raw=n[off],v=typeof raw==='number'?raw:typeof raw==='string'&&raw.trim()?Number(raw.replace(',','.')):NaN;
    return [key,Number.isFinite(v)&&v>=0&&v<=100?v:null];
  }));
}
export function validateParts(food){
  for(const {key} of nutrientParts)if(food[key]!==undefined&&food[key]!==null&&!(typeof food[key]==='number'&&Number.isFinite(food[key])&&food[key]>=0&&food[key]<=100))throw Error('Ungültige Zucker- oder Fettsäurenangabe.');
}
export function partWarnings(food){
  const warnings=nutrientParts.filter(p=>Number.isFinite(food[p.key])&&Number.isFinite(food[p.parent])&&food[p.key]>food[p.parent]+.2).map(p=>`${p.name}: höher als ${p.parent==='carbs'?'Kohlenhydrate':'Gesamtfett'}. Quelle oder Rundung prüfen.`);
  // Trans fatty acids may overlap other fatty-acid categories; never add them again.
  if(['saturatedFat','monoFat','polyFat'].every(k=>Number.isFinite(food[k]))&&food.saturatedFat+food.monoFat+food.polyFat>food.fat+.5)warnings.push('Die Fettsäuren-Summe liegt über Gesamtfett. Quelle oder Rundung prüfen.');
  return warnings;
}
