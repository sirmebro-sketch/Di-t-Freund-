import {totals} from './core.js';
import {energyModel,ageAt} from './coach.js';
import {micros,microTotals,referenceFor} from './micros.js';
export function fiberIsKnown(e){return e.fiberKnown!==false&&!(e.fiberKnown===undefined&&e.fiber===0&&e.source?.includes('Open Food Facts'));}
export function dailyNutrition(s,date){
 const entries=s.entries.filter(e=>e.date===date),actual=totals(entries),p=s.profile,c=s.coach;
 const eligible=!!c&&!c.nutritionCare&&ageAt(c.birthDate,date)>=19&&ageAt(c.birthDate,date)<=100;
 const fat=eligible?p.kcal*.3/9:null,carbs=eligible?(p.kcal-p.protein*4-fat*9)/4:null;
 const targets={kcal:p.kcal,protein:p.protein,fat,carbs:carbs!==null&&carbs>=0?carbs:null,fiber:eligible?30:null};
 const fiberEntries=entries.filter(fiberIsKnown),fiber={known:fiberEntries.length,total:entries.length,value:fiberEntries.length?totals(fiberEntries).fiber:null};
 const mt=microTotals(entries),model=energyModel(s,date),complete=s.completeDays[date]===true&&entries.length>0;
 return {date,entries:entries.length,actual,targets,fiber,complete,model,remaining:p.kcal-actual.kcal,balance:entries.length&&model?actual.kcal-model.tdee:null,plannedBalance:model?p.kcal-model.tdee:null,
  micros:micros.map(m=>({...m,...mt[m.key],reference:referenceFor(m,c,date),group:m.key.startsWith('vitamin')||m.key==='folate'?'Vitamine':'Mineralstoffe'}))};
}
