import {fiberIsKnown} from './nutrition-balance.js';
import {combinedWeights} from './health-sync.js';
import {micros} from './micros.js';
export const trendMetrics=[
 {id:'weight',name:'Gewicht',unit:'kg',group:'Körper',digits:1},
 ...['kcal','protein','carbs','fat','fiber'].map((id,i)=>({id,name:['Energie','Protein','Kohlenhydrate','Fett','Ballaststoffe'][i],unit:i?'g':'kcal',group:'Ernährung',nutrition:true,digits:i?1:0})),
 {id:'water',name:'Trinkmenge',unit:'l',group:'Alltag',digits:2},
 {id:'steps',name:'Schritte',unit:'Schritte',group:'Alltag',digits:0},
 {id:'sleep',name:'Schlaf',unit:'h',group:'Alltag',digits:1},
 {id:'training',name:'Trainingsdauer',unit:'min',group:'Training',sum:true,digits:0},
 {id:'sessions',name:'Erfasste Aktivitäten',unit:'Einheiten',group:'Training',sum:true,digits:0},
 ...['waist','sys','dia','pulse'].map((id,i)=>({id,name:['Bauchumfang','Blutdruck systolisch','Blutdruck diastolisch','Ruhepuls'][i],unit:['cm','mmHg','mmHg','/min'][i],group:'Messwerte',digits:i?0:1})),
 ...micros.map(m=>({id:'micro-'+m.key,name:m.name,unit:m.unit,group:'Mikronährstoffe',nutrition:true,micro:m.key,digits:1})),
];
const dayMs=86400000;
export const shiftDay=(date,n)=>new Date(Date.parse(date+'T12:00:00Z')+n*dayMs).toISOString().slice(0,10);
export const dayCount=(a,b)=>Math.round((Date.parse(b)-Date.parse(a))/dayMs)+1;
const mean=values=>values.reduce((a,b)=>a+b,0)/values.length;
export function metricSeries(state,id,completeOnly=false){
 const metric=trendMetrics.find(m=>m.id===id);if(!metric)throw Error('Unbekannter Verlauf.');
 if(id==='weight')return combinedWeights(state);
 const days=new Map();
 const add=(date,value,partial=false)=>{if(!Number.isFinite(value))return;const d=days.get(date)||{values:[],partial:false};d.values.push(value);d.partial||=partial;days.set(date,d);};
 if(metric.nutrition){
  const byDay=new Map();for(const e of state.entries){if(completeOnly&&!state.completeDays?.[e.date])continue;const a=byDay.get(e.date)||[];a.push(e);byDay.set(e.date,a);}
  for(const [date,entries] of byDay){const values=entries.map(e=>id==='fiber'&&!fiberIsKnown(e)?null:metric.micro?e.micros?.[metric.micro]:e[id]);const known=values.filter(Number.isFinite).length;if(known)add(date,entries.reduce((sum,e,i)=>sum+(Number.isFinite(values[i])?values[i]*e.amount/100:0),0),known<entries.length||!state.completeDays?.[date]);}
 }else if(id==='water')Object.entries(state.water).forEach(([date,ml])=>add(date,ml/1000));
 else if(metric.group==='Training')for(const w of state.workouts)add(w.date,id==='sessions'?1:w.minutes);
 else {
  if(['steps','sleep'].includes(id))for(const [date,d] of Object.entries(state.healthConnect?.days||{}))add(date,d[id]);
  const manual=new Map();for(const h of state.health){if(Number.isFinite(h[id])){const a=manual.get(h.date)||[];a.push(h[id]);manual.set(h.date,a);}}
  for(const [date,values] of manual){days.delete(date);add(date,['steps','sleep'].includes(id)?values.at(-1):mean(values));}
 }
 return [...days].map(([date,d])=>({date,value:metric.sum?d.values.reduce((a,b)=>a+b,0):mean(d.values),partial:d.partial})).sort((a,b)=>a.date.localeCompare(b.date));
}
export function trendWindow(period,end,series){
 if(!['7','30','90','365','all'].includes(period))throw Error('Unbekannter Zeitraum.');
 const start=period==='all'?(series.find(p=>p.date<=end)?.date||shiftDay(end,-29)):shiftDay(end,1-Number(period));
 return {start,end};
}
export function trendData(series,metric,start,end){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||!Number.isFinite(Date.parse(start))||!Number.isFinite(Date.parse(end))||new Date(start).toISOString().slice(0,10)!==start||new Date(end).toISOString().slice(0,10)!==end||start>end)throw Error('Ungültiger Zeitraum.');
 const length=dayCount(start,end),unit=length<=45?'day':length<=180?'week':length<=1830?'month':'year';
 const key=date=>unit==='day'?date:unit==='week'?shiftDay(date,-((new Date(date+'T12:00:00Z').getUTCDay()+6)%7)):unit==='month'?date.slice(0,7)+'-01':date.slice(0,4)+'-01-01';
 const next=date=>unit==='day'?shiftDay(date,1):unit==='week'?shiftDay(date,7):unit==='month'?new Date(Date.UTC(Number(date.slice(0,4)),Number(date.slice(5,7)),1,12)).toISOString().slice(0,10):`${Number(date.slice(0,4))+1}-01-01`;
 const selected=series.filter(p=>p.date>=start&&p.date<=end),groups=new Map();
 for(const p of selected){const k=key(p.date),list=groups.get(k)||[];list.push(p);groups.set(k,list);}
 const buckets=[];
 for(let d=key(start),limit=0;d<=end&&limit<4000;d=next(d),limit++){
  const points=groups.get(d)||[],a=d<start?start:d,b=shiftDay(next(d),-1),z=b>end?end:b;
  buckets.push({date:a,end:z,days:points.length,totalDays:dayCount(a,z),partial:points.some(p=>p.partial),value:points.length?(metric.sum?points.reduce((s,p)=>s+p.value,0):mean(points.map(p=>p.value))):null});
 }
 const average=selected.length?mean(selected.map(p=>p.value)):null;
 return {start,end,unit,buckets,selected,count:selected.length,totalDays:length,average,first:selected[0]?.value??null,last:selected.at(-1)?.value??null,delta:selected.length>1?selected.at(-1).value-selected[0].value:null};
}
export function movingWeight(series,date){const p=series.filter(p=>p.date>=shiftDay(date,-6)&&p.date<=date);return p.length>=2?mean(p.map(p=>p.value)):null;}
