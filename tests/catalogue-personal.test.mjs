import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { emptyState, validateState, parseBackup, staples } from '../app/src/main/assets/www/core.js';
import { usdaFoods, offlineFoods, matchesFood } from '../app/src/main/assets/www/food-catalogue.js';
import { parsePersonalPlan, applyPersonalPlan, validatePersonalPlan } from '../app/src/main/assets/www/personal-plan.js';
import { readiness, energyModel, foodKey, rememberedAmount } from '../app/src/main/assets/www/coach.js';
const plan = {height:180,goal:85,sex:'male',hypertension:true,betaBlocker:true,muscleBuild:true,commuteMode:'bicycle',nextCommuteMode:'ebike',commuteKm:18,stepMin:5000,stepMax:8000};
const envelope = values => JSON.stringify({kind:'diaetfreund-personal-plan',version:1,values});
const state = () => ({...emptyState(),profile:{name:'Alex',height:182,start:100,goal:92,kcal:2300,protein:140,water:2000,sessions:2},weights:[{date:'2026-01-01',value:100}]});
test('USDA selection is valid, uniquely identified and retains legacy food IDs',()=>{
  assert.equal(usdaFoods.length,118);
  assert.equal(new Set(offlineFoods.map(f=>f.id)).size,offlineFoods.length);
  for (const f of staples) {
    const updated = offlineFoods.find(x=>x.id===f.id);
    assert(updated);assert.equal(foodKey(updated),foodKey(f));
    assert.equal(rememberedAmount({entries:[{...f,foodId:foodKey(f),amount:175}]},updated),175);
  }
  validateState({...emptyState(),foods:offlineFoods});
  for (const f of usdaFoods) {assert(Number.isInteger(f.fdcId));assert(f.source.includes(String(f.fdcId)));}
});
test('Bundled USDA data matches audited manifest checksum',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../docs/USDA-DATA.json',import.meta.url)));
  assert.equal(createHash('sha256').update(readFileSync(new URL('../app/src/main/assets/www/usda-foods.js',import.meta.url))).digest('hex'),manifest.generatedSha256);
  assert.equal(manifest.records.length,usdaFoods.length);
});
test('Apple nutrient mapping keeps DFE and micrograms; excludes fibre only from carbs',()=>{
  const apple=usdaFoods.find(f=>f.fdcId===171688);
  assert.equal(apple.kcal,52);assert.equal(apple.carbs,11.4);assert.equal(apple.usdaTotalCarbs,13.8);
  assert.equal(apple.fiber,2.4);assert.equal(apple.micros.folate,3);assert.equal(apple.micros.vitaminC,4.6);
  assert.equal(apple.micros.vitaminD,0);assert.equal(apple.micros.iodine,null);
});
test('Cooked and dry staples stay distinct and German search tolerates accents and word order',()=>{
  const dry=usdaFoods.find(f=>f.fdcId===169756), cooked=usdaFoods.find(f=>f.fdcId===169757);
  assert(dry.kcal>cooked.kcal*2);assert(matchesFood(cooked,'gekocht Reis'));
  assert(matchesFood(usdaFoods.find(f=>f.fdcId===170394),'mohre gekocht'));
  assert(!matchesFood(cooked,'trocken'));
});
test('Personal import patches confirmed fields while preserving diary, targets and original state',()=>{
  const s=state();s.foods=[staples[0]];s.water={'2026-01-01':1000};
  const before=structuredClone(s),next=applyPersonalPlan(s,parsePersonalPlan(envelope(plan)));
  assert.deepEqual(s,before);assert.equal(next.profile.height,180);assert.equal(next.profile.goal,85);
  for(const k of Object.keys(s).filter(k=>k!=='profile')) assert.deepEqual(next[k],s[k]);
  assert.equal(next.profile.kcal,2300);assert.equal(next.coach,null);
  assert.equal(energyModel(next),null);assert.equal(readiness(next).level,'caution');
  assert.deepEqual(parseBackup(JSON.stringify(next)),next);
});
test('Personal import preserves physician clearance and activity factor in existing coach',()=>{
  const s=state();s.coach={birthDate:'1990-01-01',sex:'unspecified',activity:1.4,location:'home',homeMinutes:30,gymMinutes:60,sessions:2,hypertension:false,betaBlocker:false,nutritionCare:false,trainingCleared:true,smoker:false};
  const next=applyPersonalPlan(s,plan);validateState(next);
  assert.equal(next.coach.sex,'male');assert.equal(next.coach.activity,1.4);assert.equal(next.coach.trainingCleared,true);
  assert.equal(next.coach.hypertension,true);assert.equal(next.coach.betaBlocker,true);
});
test('Invalid personal values, extra keys, versions and oversized imports are rejected',()=>{
  for(const change of [{stepMin:9000},{stepMax:8000.5},{height:0},{goal:35},{commuteMode:'<script>'},{commuteMode:['bicycle']},{commuteKm:-1},{hypertension:'true'},{unexpected:123}])
    assert.throws(()=>parsePersonalPlan(envelope({...plan,...change})));
  assert.throws(()=>parsePersonalPlan(JSON.stringify({kind:'diaetfreund-personal-plan',version:2,values:plan})));
  assert.throws(()=>parsePersonalPlan(' '.repeat(64001)));
  assert.throws(()=>validatePersonalPlan(null));
  assert.throws(()=>applyPersonalPlan(emptyState(),plan),/Grundprofil/);
});
