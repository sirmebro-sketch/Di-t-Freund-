import {freshSets} from './training.js';
// Keep equipment/variants and timed/repetition sets separate. No inferred strength scores.
export const exerciseKey=s=>JSON.stringify([s.exerciseId&&s.exerciseId!=='custom'?s.exerciseId:s.exercise.trim().toLocaleLowerCase('de-DE'),s.equipment||'Eigene Angabe',s.mode||'reps']);
export function exerciseCatalogue(workouts,end){
 const map=new Map();for(const w of workouts)if(w.date<=end)for(const s of w.sets)if(s.done){const key=exerciseKey(s);if(!map.has(key))map.set(key,{key,name:s.exercise,equipment:s.equipment||'Eigene Angabe',mode:s.mode||'reps'});}
 return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'de')||a.equipment.localeCompare(b.equipment,'de'));
}
export function exerciseSessions(workouts,key,end){
 return workouts.map((w,index)=>({...w,index,sets:w.sets.filter(s=>s.done&&exerciseKey(s)===key)})).filter(w=>w.date<=end&&w.sets.length).sort((a,b)=>a.date.localeCompare(b.date)||a.index-b.index);
}
export function exerciseDays(workouts,key,start,end){
 const days=new Map();for(const w of exerciseSessions(workouts,key,end))if(w.date>=start){const d=days.get(w.date)||{date:w.date,weight:0,reps:0,seconds:0,sets:0,sessions:0};d.sessions++;for(const s of w.sets){d.weight=Math.max(d.weight,s.kg);d.sets++;if(s.mode==='time')d.seconds+=s.seconds;else d.reps+=s.reps;}days.set(w.date,d);}return [...days.values()];
}
export function lastExercise(workouts,set,end){return exerciseSessions(workouts,exerciseKey(set),end).at(-1)||null;}
export function copyPreviousExercise(state,set,end,replaceStart=null){
 const last=lastExercise(state.workouts,set,end);if(!last||!state.activeWorkout)throw Error('Keine passende abgeschlossene Übung vorhanden.');
 const copied=freshSets(last.sets),sets=state.activeWorkout.sets;
 // Caller handles replacement through its currently selected exercise block.
 if(replaceStart!==null)throw Error('Vorherige Sätze bitte als neue Übung hinzufügen.');
 if(sets.length+copied.length>500)throw Error('Eine Einheit kann höchstens 500 Sätze enthalten.');
 sets.push(...copied);return copied.length;
}
export function repeatWorkout(state,id,date,now=Date.now(),makeId=()=>crypto.randomUUID()){
 if(state.activeWorkout)throw Error('Beende oder verwirf zuerst die laufende Einheit.');
 const old=state.workouts.find(w=>w.id===id),sets=old?.sets.filter(s=>s.done)||[];
 if(!sets.length)throw Error('Diese Aktivität enthält keine absolvierten Sätze.');
 const next={id:makeId(),name:old.name,date,started:now,note:'',sets:freshSets(sets)};state.activeWorkout=next;return next;
}
