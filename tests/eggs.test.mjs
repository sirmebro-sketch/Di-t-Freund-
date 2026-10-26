import test from 'node:test';import assert from 'node:assert/strict';
import{emptyState,validateState}from'../app/src/main/assets/www/core.js';
import{newGame,monster,battle,validateGame,canEncounter,migrateGame,syncGame}from'../app/src/main/assets/www/game.js';
import{ensureHatchery,syncHatchery,incubateEgg,eggSteps,validateHatchery}from'../app/src/main/assets/www/egg-game.js';
import{nationalDex,catalogSize,inDexRegion}from'../app/src/main/assets/www/game-registry.js';
import{normalSprites,shinySprites}from'../app/src/main/assets/www/national-sprites.js';
import{applyHealthSnapshot,emptyConnection}from'../app/src/main/assets/www/health-sync.js';
const date='2026-10-01';
const fixture=()=>({...emptyState(),game:newGame(1,date),healthConnect:{...emptyConnection(),readSteps:true,stepsSyncAt:date+'T10:00:00Z',lastSync:date+'T10:00:00Z',days:{[date]:{steps:1000,sleep:null}}}});
function points(s,count){s.game.earned={};for(let i=0;i<count;i++){const d=new Date(Date.parse(date+'T12:00:00Z')-Math.floor(i/3)*86400000).toISOString().slice(0,10);(s.game.earned[d]||=[]).push(['food','check','care'][i%3]);}s.game.regions.kanto.points=count;}
const rng=n=>n===64?1:128;
function ready(){const s=fixture();points(s,60);syncHatchery(s,date,rng);return s;}
let tick=0;function read(s,steps,day=date){applyHealthSnapshot(s,{kind:'sync',read:['steps'],from:day,to:day,days:[{date:day,steps}],weights:[],at:new Date(Date.parse(date+'T11:00:00Z')+tick++*1000).toISOString()});syncHatchery(s,day,rng);}
test('1025 complete species, normal/shiny assets and valid usable evolution graphs',()=>{
 assert.equal(catalogSize(),1025);assert.equal(Object.keys(normalSprites).length,1025);assert.equal(Object.keys(shinySprites).length,1025);
 for(let id=1;id<=1025;id++){const p=nationalDex[id];assert(p.name&&p.types.length);assert(Number.isInteger(p.hatchCycles));assert.equal(eggSteps(id),255*(p.hatchCycles+1));for(const map of[normalSprites,shinySprites])assert.equal(Buffer.from(map[id].split(',')[1],'base64').subarray(1,4).toString(),'PNG');const seen=new Set();let m=id;while(nationalDex[m]?.evolutions.length){assert(!seen.has(m),'cycle '+id);seen.add(m);const e=nationalDex[m].evolutions[0];assert(e.level>=1&&e.level<=100);assert(nationalDex[e.to]);m=e.to;}}
 assert.equal(inDexRegion(252,'johto'),false);assert.equal(inDexRegion(1000,'9'),true);const s=fixture();assert.equal(canEncounter(s.game,1025),false);s.game.collection.push({base:1025,xp:100,shiny:true,useShiny:true,caught:date});s.game.discovered.push(1025);s.game.buddy=1025;validateGame(s.game);assert.equal(battle(s.game,1).ally.id,1025);assert.equal(battle(s.game,1).ally.shiny,true);
});
test('Daily, weekly, monthly and permanent milestone eggs are awarded once without streaks',()=>{
 const s=fixture();ensureHatchery(s,date);
 for(let i=0;i<12;i++){const d=new Date(Date.parse(date+'T12:00:00Z')+i*2*86400000).toISOString().slice(0,10);s.game.earned[d]=['food','care'];s.game.regions.kanto.points+=2;syncHatchery(s,d,rng);}
 const h=s.game.hatchery;assert.equal(Object.keys(h.rewards).filter(k=>k.startsWith('d:')).length,12);assert(h.rewards['m:2026-10']);assert(h.rewards['p:10']);const issued=h.issued;syncHatchery(s,'2026-10-31',rng);syncHatchery(s,'2026-11-01',rng);assert.equal(h.issued,issued);validateState(s);
 const w=fixture();ensureHatchery(w,date);for(const d of['2026-10-05','2026-10-06','2026-10-08','2026-10-11']){w.game.earned[d]=['care'];w.game.regions.kanto.points++;}syncHatchery(w,'2026-10-12',rng);assert(w.game.hatchery.rewards['w:2026-10-05']);
});
test('Three slots use a fresh baseline; duplicate sync, corrections, manual steps and pause cannot double count',()=>{
 const s=ready(),h=s.game.hatchery;assert(h.eggs.length>=4);for(const e of h.eggs.slice(0,3))incubateEgg(s,e.id,date);assert.throws(()=>incubateEgg(s,h.eggs[3].id,date),/drei/);read(s,2000);assert(h.eggs.slice(0,3).every(e=>e.progress===0));read(s,2500);assert.equal(h.eggs[0].progress,500);read(s,2500);read(s,2000);read(s,2500);assert.equal(h.eggs[0].progress,500);
 s.health.push({steps:99999,date});syncHatchery(s,date,rng);assert.equal(h.eggs[0].progress,500);s.health=[];
 s.game.paused=true;read(s,6000);assert.equal(h.eggs[0].progress,500);s.game.paused=false;read(s,6200);assert.equal(h.eggs[0].progress,500);read(s,6400);assert.equal(h.eggs[0].progress,700);validateState(s);
 const copy=JSON.parse(JSON.stringify(s));read(copy,6400);assert.equal(copy.game.hatchery.eggs[0].progress,700);
});
test('Hatching is atomic and permanent; three simultaneous hatches merge duplicates and keep shiny through evolution',()=>{
 const s=fixture();points(s,60);syncHatchery(s,date,n=>n===64?0:128);const h=s.game.hatchery;for(const e of h.eggs.slice(0,3))incubateEgg(s,e.id,date);read(s,2000);read(s,2000+eggSteps(129));assert.equal(h.hatched,3);assert.equal(h.eggs.filter(e=>e.status==='incubating').length,0);assert.equal(h.history.length,3);const m=s.game.collection.find(m=>m.base===129);assert.equal(m.hatches,3);assert.equal(m.xp,0);assert.equal(m.shiny,true);m.xp=300;assert.equal(monster(m).id,130);assert.equal(monster(m).shiny,true);read(s,2000+eggSteps(129));assert.equal(h.hatched,3);
 incubateEgg(s,h.eggs[0].id,date);assert.equal(h.eggs[0].startDistance,null);read(s,2000+eggSteps(129)+200);assert.equal(h.eggs[0].progress,0);validateState(s);
});
test('New day and late increments count once; non-step reads cannot start an egg; guarantee is fixed at receipt',()=>{
 const s=ready(),h=s.game.hatchery;incubateEgg(s,h.eggs[0].id,date);applyHealthSnapshot(s,{kind:'sync',read:['weight'],from:date,to:date,days:[],weights:[],at:date+'T12:00:00Z'});syncHatchery(s,date,rng);assert.equal(h.eggs[0].startDistance,null);read(s,1000);read(s,300,'2026-10-02');assert.equal(h.eggs[0].progress,300);
 const original=s.game.hatchery.eggs[0].species;const copy=JSON.parse(JSON.stringify(s));syncHatchery(copy,'2026-10-02',()=>0);assert.equal(copy.game.hatchery.eggs[0].species,original);
 const t=fixture();ensureHatchery(t,date);for(let i=0;i<40;i++){const d=new Date(Date.parse(date+'T12:00:00Z')+i*86400000).toISOString().slice(0,10);t.game.earned[d]=['food','care'];t.game.regions.kanto.points+=2;syncHatchery(t,d,rng);}const eggs=t.game.hatchery.eggs;assert(eggs.some(e=>e.shiny));assert(eggs.filter(e=>e.id<=32).some(e=>e.shiny));
});
test('Migration preserves old progress; malformed egg inventories and shiny flags are rejected',()=>{
 const old=fixture().game,before=structuredClone(old);migrateGame(old);assert.deepEqual(old,before);validateGame(old);
 const s=ready();for(const mutate of[h=>h.eggs[0].species=1026,h=>h.eggs[0].required=1,h=>h.eggs[0].shiny='yes',h=>h.eggs.push(structuredClone(h.eggs[0])),h=>h.issued++,h=>h.observed[date]=-1]){const copy=structuredClone(s.game.hatchery);mutate(copy);assert.throws(()=>validateHatchery(copy));}
 s.game.collection[0].shiny='yes';assert.throws(()=>validateState(s));
});
