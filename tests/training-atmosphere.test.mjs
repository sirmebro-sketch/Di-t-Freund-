import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,validateState,parseBackup} from '../app/src/main/assets/www/core.js';
import {exercises,makeSets,setGroups,moveGroup,freshSets} from '../app/src/main/assets/www/training.js';
import {defaultAudio,validateAudio} from '../app/src/main/assets/www/atmosphere-settings.js';
import {applyPersonalPlan,parsePersonalPlan} from '../app/src/main/assets/www/personal-plan.js';
const workout=sets=>({id:'test',name:'Einheit',date:'2026-01-02',started:1,note:'',sets});
test('Exercise groups retain completed sets and loads when reordered; templates reset only completion and identity',()=>{
 const a=makeSets(exercises[0],2,8,40),b=makeSets(exercises[1],1,12,15);a[0].done=true;
 const all=[...a,...b],moved=moveGroup(all,0,1);
 assert.equal(setGroups(moved)[0].name,exercises[1].name);assert.deepEqual(moved.slice(1),a);assert.deepEqual(all,[...a,...b]);
 const copy=freshSets(moved);assert(copy.every(s=>!s.done));assert.notEqual(copy[0].blockId,moved[0].blockId);assert.equal(copy[1].kg,40);assert.equal(copy[1].reps,8);
 const s={...emptyState(),activeWorkout:workout(moved),trainingPlans:[{id:'p',name:'Plan',sets:copy}]};assert.deepEqual(parseBackup(JSON.stringify(s)),s);
});
test('Timed and custom exercises validate; malformed or duplicate plans fail without mutation',()=>{
 const sets=makeSets(exercises.find(x=>x.id==='plank'),2,1,0,25),s={...emptyState(),activeWorkout:workout(sets)};validateState(s);
 assert.equal(sets[0].seconds,25);assert.equal(sets[0].mode,'time');
 for(const seconds of [0,3601,1.5,NaN]) assert.throws(()=>validateState({...s,activeWorkout:workout([{...sets[0],seconds}])}));
 assert.throws(()=>makeSets(exercises[0],1.5,8,0));
 const p={id:'p',name:'Plan',sets:freshSets(sets)};
 assert.throws(()=>validateState({...s,trainingPlans:[p,p]}));
 assert.throws(()=>validateState({...s,trainingPlans:[{...p,sets:[]}]}));
 assert.throws(()=>validateState({...s,trainingPlans:[{...p,sets:[{...sets[0],done:true}]}]}));
 const legacy={exercise:'Eigene alte Übung',kg:5,reps:10,done:true};validateState({...s,activeWorkout:workout([legacy])});
 assert.equal(new Set(exercises.map(e=>e.id)).size,exercises.length);
});
test('Audio settings reject invalid tracks, volumes and types; old backups need no settings',()=>{
 validateState(emptyState());const s={...emptyState(),audioSettings:defaultAudio()};assert.deepEqual(parseBackup(JSON.stringify(s)),s);
 for(const patch of [{music:'yes'},{effects:null},{track:'external-url'},{musicVolume:-1},{effectsVolume:101},{musicVolume:NaN}])assert.throws(()=>validateAudio({...defaultAudio(),...patch}));
});
test('Explicit dated weight import is idempotent, preserves history, calories, game and input; training restart is not clearance',()=>{
 const plan={height:180,goal:85,sex:'male',hypertension:true,betaBlocker:true,muscleBuild:true,commuteMode:'bicycle',nextCommuteMode:'ebike',commuteKm:18,stepMin:5000,stepMax:8000,currentWeight:{date:'2026-01-02',value:99},trainingStage:'restart'};
 const s={...emptyState(),profile:{name:'Alex',height:182,start:100,goal:92,kcal:2300,protein:140,water:2000,sessions:2},weights:[{date:'2026-01-01',value:100},{date:'2026-01-02',value:101}]},before=structuredClone(s);
 const parsed=parsePersonalPlan(JSON.stringify({kind:'diaetfreund-personal-plan',version:2,values:plan})),n=applyPersonalPlan(s,parsed);validateState(n);
 assert.deepEqual(s,before);assert.equal(n.weights.length,2);assert.equal(n.weights[0].value,100);assert.equal(n.weights[1].value,99);assert.deepEqual(applyPersonalPlan(n,parsed),n);
 assert.equal(n.trainingStage,'restart');assert.equal(n.profile.start,100);assert.equal(n.profile.kcal,2300);assert.equal(n.coach,null);assert.deepEqual(n.game,s.game);
 for(const patch of [{currentWeight:{date:'2026-02-30',value:99}},{currentWeight:{date:'2999-01-01',value:99}},{currentWeight:{date:'2026-01-02',value:0}},{trainingStage:'cleared'}])assert.throws(()=>applyPersonalPlan(s,{...plan,...patch}));
});
