import test from 'node:test';import assert from 'node:assert/strict';
import{exerciseKey,exerciseCatalogue,exerciseSessions,exerciseDays,lastExercise,copyPreviousExercise,repeatWorkout}from'../app/src/main/assets/www/exercise-history.js';
import{emptyState,validateState,today,shiftDate}from'../app/src/main/assets/www/core.js';import{previousSets}from'../app/src/main/assets/www/coach.js';
const set=(patch={})=>({exercise:'Beinpresse',equipment:'Maschine',exerciseId:'leg-press',kg:40,reps:8,done:true,...patch});
const workout=(id,date,sets)=>({id,date,name:'Training',minutes:30,note:'Notiz',sets});
test('Exercise histories separate equipment, custom variants and modes; omit unfinished and future data',()=>{
 const w=[workout('a','2026-01-01',[set(),set({done:false})]),workout('b','2026-01-02',[set({equipment:'Studio 2'}),set({exerciseId:'custom',exercise:'Plank',mode:'time',seconds:20,kg:0})]),workout('future','2027-01-01',[set({kg:200})])];
 assert.equal(exerciseCatalogue(w,'2026-01-03').length,3);assert.equal(exerciseSessions(w,exerciseKey(set()),'2026-01-03').length,1);assert.equal(exerciseSessions(w,exerciseKey(set()),'2026-01-03')[0].sets.length,1);assert.notEqual(exerciseKey(set({exerciseId:'custom',exercise:'Variante A'})),exerciseKey(set({exerciseId:'custom',exercise:'Variante B'})));assert.notEqual(exerciseKey(set()),exerciseKey(set({mode:'time',seconds:20})));
});
test('Daily metrics aggregate actual completed sets; zero load and multiple same-day sessions remain valid',()=>{
 const w=[workout('a','2026-01-01',[set({kg:0}),set({kg:20,reps:10})]),workout('b','2026-01-01',[set({kg:15,reps:6})])];const d=exerciseDays(w,exerciseKey(set()),'2026-01-01','2026-01-02');assert.deepEqual(d,[{date:'2026-01-01',weight:20,reps:24,seconds:0,sets:3,sessions:2}]);const timed=set({mode:'time',seconds:30,kg:0});assert.equal(exerciseDays([workout('t','2026-01-01',[timed])],exerciseKey(timed),'2026-01-01','2026-01-02')[0].seconds,30);assert.equal(exerciseDays(w,exerciseKey(set()),'2026-01-02','2026-01-03').length,0);
});
test('Previous and repeated sets preserve loads, reset completion and IDs, and never mutate finished history',()=>{
 const s={...emptyState(),workouts:[workout('a',today(),[set({kg:30})]),workout('b',today(),[set({kg:45}),set({kg:50,reps:10})]),workout('future',shiftDate(today(),1),[set({kg:100})])]},before=structuredClone(s.workouts);assert.equal(previousSets(s,'Training')[0].kg,45);assert.equal(lastExercise(s.workouts,set(),today()).id,'b');repeatWorkout(s,'b',today(),1,()=> 'new');assert(s.activeWorkout.sets.every(x=>!x.done));assert.equal(s.activeWorkout.note,'');assert.equal(s.activeWorkout.sets[1].kg,50);assert.throws(()=>repeatWorkout(s,'a',today()));copyPreviousExercise(s,set(),today());assert.equal(s.activeWorkout.sets.length,4);assert.notEqual(s.activeWorkout.sets[0].blockId,s.activeWorkout.sets[2].blockId);assert.deepEqual(s.workouts,before);validateState(s);
});
test('No-set activities and exhausted capacity cannot silently overwrite a running session',()=>{
 const s={...emptyState(),workouts:[workout('walk','2026-01-01',[]),workout('gym','2026-01-01',[set()])]};assert.throws(()=>repeatWorkout(s,'walk','2026-01-02'));assert.equal(s.activeWorkout,null);repeatWorkout(s,'gym','2026-01-02',1,()=> 'new');s.activeWorkout.sets=Array.from({length:500},()=>set({done:false}));const before=structuredClone(s);assert.throws(()=>copyPreviousExercise(s,set(),'2026-01-02'));assert.deepEqual(s,before);
});
