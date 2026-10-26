// Exercise selection, not a prescription. Loads/repetitions stay user-controlled.
export const equipment = ['Alle Geräte','Maschine','Kabelzug','Kurzhantel','Langhantel','Körpergewicht','Band'];
export const exercises = [
 ['leg-press','Beinpresse','Maschine','Beine'],['leg-extension','Beinstrecker','Maschine','Beine'],['leg-curl','Beinbeuger','Maschine','Beine'],['hip-abduction','Abduktorenmaschine','Maschine','Beine'],['hip-adduction','Adduktorenmaschine','Maschine','Beine'],['calf-machine','Wadenheben an der Maschine','Maschine','Beine'],
 ['chest-press','Brustpresse','Maschine','Brust'],['pec-deck','Butterfly','Maschine','Brust'],['shoulder-press','Schulterpresse','Maschine','Schultern'],['lat-pull','Latzug zur Brust','Kabelzug','Rücken'],['cable-row','Rudern am Kabelzug','Kabelzug','Rücken'],['machine-row','Rudermaschine (Kraft)','Maschine','Rücken'],['reverse-fly','Reverse Butterfly','Maschine','Rücken'],['face-pull','Face Pulls','Kabelzug','Schultern'],['triceps-cable','Trizepsdrücken am Kabel','Kabelzug','Arme'],['cable-curl','Bizepscurls am Kabel','Kabelzug','Arme'],['cable-fly','Brust-Flys am Kabel','Kabelzug','Brust'],['pallof','Pallof Press','Kabelzug','Rumpf'],
 ['db-bench','Kurzhantel-Bankdrücken','Kurzhantel','Brust'],['db-row','Einarmiges Kurzhantelrudern','Kurzhantel','Rücken'],['db-shoulder','Kurzhantel-Schulterdrücken','Kurzhantel','Schultern'],['db-lateral','Seitheben','Kurzhantel','Schultern'],['db-curl','Kurzhantel-Bizepscurls','Kurzhantel','Arme'],['goblet','Goblet Squat','Kurzhantel','Beine'],['db-rdl','Rumänisches Kreuzheben mit Kurzhanteln','Kurzhantel','Beine'],
 ['bar-bench','Langhantel-Bankdrücken','Langhantel','Brust'],['bar-row','Langhantelrudern','Langhantel','Rücken'],['bar-squat','Langhantel-Kniebeuge','Langhantel','Beine'],['bar-rdl','Rumänisches Kreuzheben','Langhantel','Beine'],['hip-thrust','Hip Thrust','Langhantel','Beine'],
 ['chair','Aufstehen vom Stuhl','Körpergewicht','Beine'],['wall-push','Liegestütz an der Wand','Körpergewicht','Brust'],['incline-push','Erhöhter Liegestütz','Körpergewicht','Brust'],['bridge','Hüftheben','Körpergewicht','Beine'],['bird-dog','Bird Dog','Körpergewicht','Rumpf'],['dead-bug','Dead Bug','Körpergewicht','Rumpf'],['step-up','Step-ups','Körpergewicht','Beine'],['plank','Unterarmstütz','Körpergewicht','Rumpf','time'],['side-plank','Seitstütz','Körpergewicht','Rumpf','time'],['band-row','Rudern mit Band','Band','Rücken'],['band-pull','Band Pull-Aparts','Band','Schultern'],['band-press','Brustdrücken mit Band','Band','Brust'],
].map(([id,name,equipment,muscle,mode='reps'])=>({id,name,equipment,muscle,mode}));
export function setGroups(sets) {
 const result=[];
 sets.forEach((s,index)=>{const last=result.at(-1);const key=s.blockId||`${s.exercise}\n${s.equipment||''}`;if(last?.key===key)last.sets.push({...s,index});else result.push({key,start:index,name:s.exercise,equipment:s.equipment||'Eigene Angabe',sets:[{...s,index}]});});
 return result;
}
export function makeSets(exercise,count,reps,kg,seconds=30) {
 if(!Number.isInteger(count)||count<1||count>10)throw Error('Bitte 1–10 Sätze wählen.');
 const blockId=crypto.randomUUID();
 return Array.from({length:count},()=>({exercise:exercise.name,equipment:exercise.equipment||'Eigene Angabe',exerciseId:exercise.id||'custom',blockId,kg,reps,done:false,...(exercise.mode==='time'?{mode:'time',seconds}: {})}));
}
export function moveGroup(sets,start,direction) {
 const gs=setGroups(sets),i=gs.findIndex(g=>g.start===start),target=i+direction;
 if(i<0||target<0||target>=gs.length)return sets;
 [gs[i],gs[target]]=[gs[target],gs[i]];
 return gs.flatMap(g=>g.sets.map(({index,...set})=>set));
}
export function freshSets(sets) {
 // New blocks must not share IDs with the previous active session.
 return setGroups(sets).flatMap(g=>{const blockId=crypto.randomUUID();return g.sets.map(({index,...s})=>({...s,blockId,done:false}));});
}
export function validateTrainingExtras(state) {
 const check=(ok)=>{if(!ok)throw Error('Ungültige Trainingsdaten.');};
 const str=(v,n)=>typeof v==='string'&&v.length>0&&v.length<=n;
 const validSets=(sets)=>{
  check(Array.isArray(sets)&&sets.length<=500);
  sets.forEach(s=>{
   check(s&&str(s.exercise,100)&&Number.isFinite(s.kg)&&s.kg>=0&&s.kg<=500&&Number.isFinite(s.reps)&&s.reps>=1&&s.reps<=100&&typeof s.done==='boolean');
   for(const k of ['equipment','exerciseId','blockId'])if(s[k]!==undefined)check(str(s[k],100));
   if(s.mode!==undefined)check(['reps','time'].includes(s.mode));
   if(s.mode==='time')check(Number.isInteger(s.seconds)&&s.seconds>=1&&s.seconds<=3600);
  });
 };
 if(state.trainingPlans!==undefined){
  check(Array.isArray(state.trainingPlans)&&state.trainingPlans.length<=50);
  const ids=new Set();
  state.trainingPlans.forEach(p=>{check(p&&str(p.id,100)&&str(p.name,100)&&!ids.has(p.id));ids.add(p.id);validSets(p.sets);check(p.sets.length>0&&p.sets.every(s=>!s.done));});
 }
 if(state.activeWorkout)validSets(state.activeWorkout.sets);
 for(const w of state.workouts||[])validSets(w.sets);
 if(state.trainingStage!==undefined)check(['restart','regular','unspecified'].includes(state.trainingStage));
}
