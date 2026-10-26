import test from 'node:test';import assert from 'node:assert/strict';
import {emptyState,parseProduct,recipeFood,validateState} from '../app/src/main/assets/www/core.js';
import {dailyNutrition,fiberIsKnown} from '../app/src/main/assets/www/nutrition-balance.js';
const date='2026-10-26';
const fixture=()=>({...emptyState(),profile:{name:'Alex',height:180,start:100,goal:90,kcal:2200,protein:140,water:2000,sessions:2},coach:{birthDate:'1990-06-01',sex:'male',activity:1.4,location:'both',sessions:2,homeMinutes:30,gymMinutes:60,hypertension:false,betaBlocker:false,trainingCleared:false,nutritionCare:false,smoker:false}});
const entry=(id='a')=>({id,name:'Test',source:'Eigene Angabe',date,meal:'Frühstück',amount:200,kcal:200,protein:15,carbs:20,fat:6,fiber:3,micros:{vitaminC:10}});
test('Daily targets and energy balance use saved goals, portions and one total expenditure',()=>{
 const s=fixture();s.entries=[entry(),{...entry('old'),date:'2026-10-25',kcal:900}];const d=dailyNutrition(s,date);
 assert.equal(d.actual.kcal,400);assert.equal(d.targets.protein,140);assert.equal(d.targets.fat,2200*.3/9);assert.equal(d.targets.carbs,245);assert.equal(d.targets.fiber,30);assert.equal(d.remaining,1800);assert.equal(d.balance,400-d.model.tdee);assert.equal(d.complete,false);
 s.completeDays[date]=true;s.health=[{date,steps:25000}];s.workouts=[{date,minutes:150}];assert.equal(dailyNutrition(s,date).balance,d.balance);assert.equal(dailyNutrition(s,date).complete,true);
 s.entries[0].amount=1500;assert.equal(dailyNutrition(s,date).remaining,-800);
});
test('Empty and medical days never invent an actual deficit or automatic macro targets',()=>{
 const s=fixture();assert.equal(dailyNutrition(s,date).balance,null);assert.equal(dailyNutrition(s,date).fiber.value,null);
 s.coach.nutritionCare=true;s.entries=[entry()];let d=dailyNutrition(s,date);assert.equal(d.model,null);assert.equal(d.targets.fat,null);assert.equal(d.targets.fiber,null);assert.equal(d.targets.protein,140);assert(d.micros.every(m=>m.reference===null));
 s.coach=null;d=dailyNutrition(s,date);assert.equal(d.targets.carbs,null);assert.equal(d.balance,null);
 s.coach=fixture().coach;s.profile.kcal=1500;s.profile.protein=300;assert.equal(dailyNutrition(s,date).targets.carbs,null);
});
test('Micronutrient and fiber coverage distinguish unknown, partial and known zero',()=>{
 const s=fixture();s.entries=[entry(),{...entry('b'),micros:{vitaminC:null},fiberKnown:false}];let d=dailyNutrition(s,date),c=d.micros.find(m=>m.key==='vitaminC');assert.equal(c.value,20);assert.equal(c.reference,110);assert.equal(c.known,1);assert.equal(c.total,2);assert.equal(d.fiber.value,6);assert.equal(d.fiber.known,1);
 s.entries=[{...entry(),fiber:0,fiberKnown:true,micros:{vitaminC:0}}];d=dailyNutrition(s,date);assert.equal(d.fiber.value,0);assert.equal(d.micros.find(m=>m.key==='vitaminC').value,0);assert.equal(d.micros.find(m=>m.key==='iodine').value,null);
});
test('Product/recipe fiber completeness survives serialization and rejects invalid flags',()=>{
 const data={status:1,product:{nutriments:{'energy-kcal_100g':100,proteins_100g:5,carbohydrates_100g:10,fat_100g:3}}};
 let f=parseProduct(data,'12345678');assert.equal(f.fiberKnown,false);assert.equal(recipeFood('Rezept',[{...f,amount:100}],100).fiberKnown,false);
 data.product.nutriments.fiber_100g=0;f=parseProduct(data,'12345678');assert.equal(f.fiberKnown,true);assert(fiberIsKnown(f));assert(!fiberIsKnown({source:'Open Food Facts · ODbL',fiber:0}));
 const s=fixture();s.foods=[f];validateState(JSON.parse(JSON.stringify(s)));s.foods[0].fiberKnown='yes';assert.throws(()=>validateState(s));
});
