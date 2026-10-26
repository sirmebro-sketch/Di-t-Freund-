import {nationalDex} from './game-registry.js';
const ids=Object.keys(nationalDex).map(Number);
const dayMs=86400000;
const shift=(d,n)=>new Date(Date.parse(d+'T12:00:00Z')+n*dayMs).toISOString().slice(0,10);
export const eggRules={slots:3,shinyOdds:64,guarantee:32,daily:2,weekly:4,monthly:12};
export const eggSteps=id=>255*((nationalDex[id]?.hatchCycles??40)+1);
const random=n=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n;};
export function ensureHatchery(s,date){
 if(!s.game)return null;
 if(!s.game.hatchery)s.game.hatchery={version:1,started:date,rewards:{},eggs:[],history:[],issued:0,hatched:0,sinceShiny:0,distance:0,stepSource:s.healthConnect?.lastStepSource||"all",seenSync:s.healthConnect?.stepsSyncAt||null,observed:Object.fromEntries(Object.entries(s.healthConnect?.days||{}).filter(([d,v])=>d<=date&&Number.isInteger(v.steps)).map(([d,v])=>[d,v.steps]))};
 return s.game.hatchery;
}
export function eggAchievements(g,date){
 const h=g.hatchery,week=shift(date,-((new Date(date+'T12:00:00Z').getUTCDay()+6)%7)),month=date.slice(0,7);
 const days=Object.entries(g.earned).filter(([d,q])=>d>=h.started&&d<=date&&q.length);
 return [
  {key:'d:'+date,label:'Tagesbegleiter',progress:(g.earned[date]||[]).length,goal:2,description:'Zwei deiner drei Routinen heute'},
  {key:'w:'+week,label:'Wochenreise',progress:days.filter(([d])=>d>=week).length,goal:4,description:'Vier Tage mit mindestens einer Routine (Mo–So)'},
  {key:'m:'+month,label:'Monatsalbum',progress:days.filter(([d])=>d.startsWith(month)).length,goal:12,description:'Zwölf Tage mit mindestens einer Routine in diesem Monat'},
 ];
}
function grant(g,h,key,label,date,rng){
 if(h.rewards[key]||h.eggs.length>=10000)return;
 const species=ids[rng(ids.length)],shiny=rng(eggRules.shinyOdds)===0||h.sinceShiny>=eggRules.guarantee-1;
 h.sinceShiny=shiny?0:h.sinceShiny+1;h.issued++;
 h.eggs.push({id:h.issued,species,shiny,required:eggSteps(species),progress:0,status:'stored',startDistance:null,received:date,source:label});h.rewards[key]=true;
 g.events.push({kind:'egg',date,text:label+' erreicht! Ein Pokémon-Ei wartet in deiner Brutstation.'});
}
export function syncHatchery(s,date,rng=random){
 const g=s.game;if(!g)return;
 const h=ensureHatchery(s,date),hc=s.healthConnect;
 if(g.paused)h.resumePending=true;
 // Only a successful, fresh steps read can advance incubation. Manual entries never count.
 if(hc?.stepsSyncAt&&hc.stepsSyncAt!==h.seenSync){
  let delta=0;
  const source=hc.lastStepSource||'all';
  if((h.stepSource||'all')!==source){
   // A different source is a new counter, not newly walked distance.
   h.observed={};h.sourceBaselineThrough=date;
  }
  h.stepSource=source;
  for(const [d,v] of Object.entries(hc.days||{})){
   if(d>date||!Number.isInteger(v.steps)||v.steps<0)continue;
   const old=h.observed[d]||0;
   const firstSourceReading=h.sourceBaselineThrough && d<=h.sourceBaselineThrough && !Object.hasOwn(h.observed,d);
   if(d>=h.started&&!firstSourceReading)delta+=Math.max(0,v.steps-old);
   h.observed[d]=Math.max(old,v.steps); // corrections/deletion/reimport cannot reward the same steps again
  }
  h.seenSync=hc.stepsSyncAt;
  if(!g.paused&&!h.resumePending)h.distance+=delta;
  if(!g.paused)h.resumePending=false;
  for(const e of h.eggs.filter(e=>e.status==='incubating')){
   // Fresh synchronization establishes the baseline AFTER preceding steps were accounted for.
   if(e.startDistance===null){e.startDistance=h.distance;continue;}
   e.progress=Math.min(e.required,h.distance-e.startDistance);
   if(e.progress<e.required)continue;
   let member=g.collection.find(m=>m.base===e.species);
   if(!member){member={base:e.species,xp:0,caught:date};g.collection.push(member);}
   if(e.shiny){member.shiny=true;member.useShiny=true;}
   member.hatches=(member.hatches||0)+1;
   if(!g.discovered.includes(e.species))g.discovered.push(e.species);
   h.hatched++;h.history.push({id:e.id,species:e.species,shiny:e.shiny,date});e.status='hatched';
   g.events.push({kind:'hatch',date,species:e.species,shiny:e.shiny,text:(e.shiny?'✨ Shiny ':'')+nationalDex[e.species].name+' ist aus deinem Ei geschlüpft!'+(member.hatches>1?' Wiedersehen im Team.':' Willkommen im Team.')});
  }
  h.eggs=h.eggs.filter(e=>e.status!=='hatched');h.history=h.history.slice(-100);
 }
 if(!g.paused){
  // Check past earned days/periods too: a missed app opening never expires an earned egg.
  const weeks=new Map(),months=new Map();
  for(const [d,q] of Object.entries(g.earned).filter(([d,q])=>d>=h.started&&d<=date&&q.length).sort(([a],[b])=>a.localeCompare(b))){
   if(q.length>=2)grant(g,h,'d:'+d,'Tagesbegleiter',d,rng);
   const week=shift(d,-((new Date(d+'T12:00:00Z').getUTCDay()+6)%7)),month=d.slice(0,7);
   weeks.set(week,(weeks.get(week)||0)+1);months.set(month,(months.get(month)||0)+1);
   if(weeks.get(week)>=4)grant(g,h,'w:'+week,'Wochenreise',d,rng);
   if(months.get(month)>=12)grant(g,h,'m:'+month,'Monatsalbum',d,rng);
  }
  const points=Object.values(g.earned).reduce((n,q)=>n+q.length,0);
  for(const n of [10,30,...Array.from({length:Math.floor(points/60)},(_,i)=>(i+1)*60)])if(points>=n)grant(g,h,'p:'+n,n+' Routinepunkte',date,rng);
 }
 g.discovered.sort((a,b)=>a-b);g.events=g.events.slice(-80);
}
export function incubateEgg(s,id,date){
 syncHatchery(s,date);
 const g=s.game,h=g?.hatchery,e=h?.eggs.find(e=>e.id===id);
 if(!e||e.status!=='stored')throw Error('Dieses Ei ist nicht im Vorrat.');
 if(g.paused)throw Error('Setze dein Abenteuer zuerst fort.');
 if(h.eggs.filter(e=>e.status==='incubating').length>=3)throw Error('Alle drei Brutplätze sind belegt.');
 e.status='incubating';e.startDistance=null;e.progress=0;
}
export function validateHatchery(h){
 if(h===undefined)return;
 const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),n=(v,max=1e10)=>Number.isSafeInteger(v)&&v>=0&&v<=max,date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,stamp=v=>v===null||(typeof v==='string'&&Number.isFinite(Date.parse(v)));
 if(!obj(h)||(h.stepSource!==undefined&&!["samsung","all"].includes(h.stepSource))||(h.sourceBaselineThrough!==undefined&&!date(h.sourceBaselineThrough))||(h.resumePending!==undefined&&typeof h.resumePending!=='boolean')||h.version!==1||!date(h.started)||!obj(h.rewards)||Object.keys(h.rewards).length>100000||!Object.entries(h.rewards).every(([k,v])=>/^(d:\d{4}-\d{2}-\d{2}|w:\d{4}-\d{2}-\d{2}|m:\d{4}-\d{2}|p:\d+)$/.test(k)&&v===true)||!n(h.issued,100000)||!n(h.hatched,h.issued)||!n(h.sinceShiny,31)||!n(h.distance)||!stamp(h.seenSync)||!obj(h.observed)||Object.keys(h.observed).length>36500||!Object.entries(h.observed).every(([d,v])=>date(d)&&n(v,100000))||!Array.isArray(h.eggs)||h.eggs.length>10000||!Array.isArray(h.history)||h.history.length>100)throw Error('Ungültige Brutstation.');
 if(h.eggs.filter(e=>e.status==='incubating').length>3||new Set([...h.eggs,...h.history].map(e=>e.id)).size!==h.eggs.length+h.history.length)throw Error('Ungültige Brutplätze.');
 for(const e of h.eggs)if(!obj(e)||!n(e.id,h.issued)||e.id<1||!nationalDex[e.species]||typeof e.shiny!=='boolean'||e.required!==eggSteps(e.species)||!n(e.progress,e.required)||!['stored','incubating'].includes(e.status)||!(e.startDistance===null||n(e.startDistance,h.distance))||!date(e.received)||typeof e.source!=='string'||e.source.length>100||(e.status==='stored'&&(e.progress!==0||e.startDistance!==null))||(e.startDistance===null&&e.progress!==0)||(e.startDistance!==null&&e.progress!==Math.min(e.required,h.distance-e.startDistance)))throw Error('Ungültiges Pokémon-Ei.');
 for(const e of h.history)if(!obj(e)||!n(e.id,h.issued)||e.id<1||!nationalDex[e.species]||typeof e.shiny!=='boolean'||!date(e.date))throw Error('Ungültiges Schlüpfalbum.');
 if(h.issued!==h.hatched+h.eggs.length||Object.keys(h.rewards).length!==h.issued||h.history.length>h.hatched)throw Error('Eierbestand stimmt nicht.');
}
