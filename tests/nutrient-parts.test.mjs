import test from 'node:test';import assert from 'node:assert/strict';
import{nutrientParts,partTotals,partWarnings,validateParts}from'../app/src/main/assets/www/nutrient-parts.js';
import{emptyState,validateState,parseBackup,parseProduct,recipeFood,totals}from'../app/src/main/assets/www/core.js';
import{saveMeal,addMeal}from'../app/src/main/assets/www/meal-templates.js';
import{parseNutritionLabel,normalizeLabel}from'../app/src/main/assets/www/nutrition-ocr.js';
import{dailyNutrition}from'../app/src/main/assets/www/nutrition-balance.js';
import{metricSeries}from'../app/src/main/assets/www/trends.js';
import{usdaFoods}from'../app/src/main/assets/www/usda-foods.js';
const food={id:'food',name:'Testprodukt',source:'Eigene Angabe',amount:150,date:'2026-10-01',meal:'Frühstück',kcal:200,protein:10,carbs:20,fat:8,fiber:0,fiberKnown:false,sugar:4,saturatedFat:2,monoFat:3,polyFat:1,transFat:0};
const state=()=>({...emptyState(),profile:{name:'Alex',height:180,start:100,goal:90,kcal:2200,protein:140,water:2000,sessions:2},entries:[structuredClone(food)]});
test('Optional sub-nutrients preserve real zero, missing values and existing macro calories',()=>{
 const missing={...food,id:'missing',amount:50};for(const p of nutrientParts)delete missing[p.key];const t=partTotals([food,missing]);assert.equal(t.sugar.value,6);assert.equal(t.sugar.known,1);assert.equal(t.sugar.total,2);assert.equal(t.transFat.value,0);assert.equal(partTotals([missing]).sugar.value,null);assert.equal(totals([food]).kcal,300);
 const s=state();s.entries.push(missing);const d=dailyNutrition(s,food.date);assert.equal(d.actual.carbs,40);assert.equal(d.actual.fat,16);assert.equal(d.parts.sugar.value,6);assert.equal(metricSeries(s,'sugar')[0].value,6);assert(metricSeries(s,'sugar')[0].partial);
});
test('OFF imports sugar and four fat types, rejects absent main macros and honours energy units',()=>{
 const n={'energy-kcal_100g':200,proteins_100g:10,carbohydrates_100g:20,fat_100g:8,sugars_100g:4,'saturated-fat_100g':2,'monounsaturated-fat_100g':3,'polyunsaturated-fat_100g':1,'trans-fat_100g':0};
 const parse=n=>parseProduct({status:1,product:{product_name:'Test',nutriments:n}},'12345678');const p=parse(n);assert.equal(p.sugar,4);assert.equal(p.transFat,0);assert.equal(p.fiberKnown,false);assert.equal(parse({...n,sugars_100g:''}).sugar,null);assert.equal(parse({...n,sugars_100g:'bad'}).sugar,null);assert.equal(parse({...n,sugars_100g:101}).sugar,null);assert.equal(parse({...n,'energy-kcal_100g':undefined,energy_100g:200,energy_unit:'kcal'}).kcal,200);assert(Math.abs(parse({...n,'energy-kcal_100g':undefined,'energy-kj_100g':418.4}).kcal-100)<1e-10);assert.throws(()=>parse({...n,carbohydrates_100g:''}));
});
test('Recipes and saved meals preserve optional amounts and unknown fibre without backfilling history',()=>{
 const r=recipeFood('Rezept',[food],300);assert.equal(r.sugar,2);assert.equal(r.fiberKnown,false);const missing={...food,id:'other',sugar:null};assert.equal(recipeFood('Gemischt',[food,missing],300).sugar,null);
 const s=state();const saved=saveMeal(s,'Vorlage','Frühstück',food.date,'template');assert.equal(saved.items[0].fiberKnown,false);assert.equal(saved.items[0].sugar,4);addMeal(s,'template',{date:'2026-10-02',meal:'Mittagessen',amounts:[75]},()=> 'entry2');assert.equal(s.entries[1].sugar,4);assert.equal(s.entries[1].transFat,0);assert.equal(s.entries[1].fiberKnown,false);validateState(s);assert.deepEqual(parseBackup(JSON.stringify(s)),s);
});
test('OCR separates sugars and fatty acids, normalizes portions and never revives conflicting values',()=>{
 const p=parseNutritionLabel('pro 100 g\nFett 8 g\ndavon gesättigte Fettsäuren 2 g\neinfach ungesättigte Fettsäuren 3 g\nmehrfach ungesättigte Fettsäuren 1 g\nTransfettsäuren 0 g\nKohlenhydrate 20 g\ndavon Zucker 4 g');assert.equal(p.values.fat,8);assert.equal(p.values.carbs,20);for(const {key}of nutrientParts)assert.equal(p.values[key],food[key]);assert.equal(normalizeLabel(p.values,50).sugar,8);
 assert.equal(parseNutritionLabel('Fett 5 g\nFett 8 g\nFett 5 g').values.fat,null);assert.equal(parseNutritionLabel('davon Zucker <0,5 g\ndavon Zucker 2 g').values.sugar,null);assert.equal(parseNutritionLabel('Added sugars 3 g').values.sugar,null);assert.equal(parseNutritionLabel('Total sugars 3 g\nSaturated fat 1 g').values.sugar,3);
});
test('USDA values include traceable sugar and fatty-acid data without inventing missing trans fats',()=>{
 const oil=usdaFoods.find(f=>f.fdcId===171413);assert(oil.monoFat>60);assert.equal(oil.sugar,0);assert(usdaFoods.some(f=>f.transFat===null));for(const f of usdaFoods)validateParts(f);
});
test('Backups reject malformed detail values and duplicate entry identifiers; inconsistencies remain visible',()=>{
 const s=state();for(const value of[-1,101,'2',true,Infinity]){const a=structuredClone(s);a.entries[0].sugar=value;assert.throws(()=>validateState(a));}const duplicate=structuredClone(s);duplicate.entries.push(structuredClone(food));assert.throws(()=>validateState(duplicate));assert(partWarnings({...food,sugar:90}).length);assert.equal(partWarnings(food).length,0);
 const old=state();for(const p of nutrientParts)delete old.entries[0][p.key];validateState(old);assert.equal(dailyNutrition(old,food.date).parts.sugar.value,null);
});
