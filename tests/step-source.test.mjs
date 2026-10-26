import test from 'node:test';import assert from 'node:assert/strict';
import{emptyState,parseBackup,validateState}from'../app/src/main/assets/www/core.js';
import{applyHealthSnapshot,emptyConnection,validateConnection}from'../app/src/main/assets/www/health-sync.js';
import{newGame}from'../app/src/main/assets/www/game.js';
import{syncHatchery}from'../app/src/main/assets/www/egg-game.js';
const date='2026-10-01';let tick=0;
function payload(source,steps,read=['steps']){return {kind:'sync',from:date,to:date,at:new Date(Date.parse(date+'T12:00:00Z')+1000*tick++).toISOString(),stepSource:source,read,days:[{date,steps,sleep:7}],weights:[]};}
const apply=(s,source,steps)=>{applyHealthSnapshot(s,payload(source,steps));syncHatchery(s,date,()=>0);};
test('source metadata is validated, old snapshots remain aggregate, failed updates are atomic',()=>{
 const s=emptyState();assert.equal(emptyConnection().stepSource,'samsung');applyHealthSnapshot(s,payload(undefined,9000));assert.equal(s.healthConnect.lastStepSource,'all');
 applyHealthSnapshot(s,payload('samsung',6500));assert.equal(s.healthConnect.days[date].steps,6500);assert.equal(s.healthConnect.lastStepSource,'samsung');
 applyHealthSnapshot(s,payload('all',null,['sleep']));assert.equal(s.healthConnect.lastStepSource,'samsung');assert.equal(s.healthConnect.days[date].steps,6500);
 const before=structuredClone(s);assert.throws(()=>applyHealthSnapshot(s,payload('invalid',123)));assert.deepEqual(s,before);assert.throws(()=>validateConnection({...s.healthConnect,stepSource:'device'}));assert.deepEqual(parseBackup(JSON.stringify(s)).healthConnect,s.healthConnect);
});
test('switching counters baselines incubation without bonus distance, lost progress or delayed growth',()=>{
 const s={...emptyState(),game:newGame(4,date)};apply(s,'all',9000);const h=s.game.hatchery;h.distance=200;
 apply(s,'samsung',6500);assert.equal(h.distance,200);assert.equal(h.observed[date],6500);apply(s,'samsung',6600);assert.equal(h.distance,300);
 apply(s,'all',9500);assert.equal(h.distance,300);apply(s,'all',9600);assert.equal(h.distance,400);apply(s,'all',9600);assert.equal(h.distance,400);
 apply(s,'all',9400);apply(s,'all',9600);assert.equal(h.distance,400);validateState(s);assert.equal(parseBackup(JSON.stringify(s)).game.hatchery.stepSource,'all');
});
test('an empty source never falls back and delayed first data baselines instead of hatching',()=>{
 const s={...emptyState(),game:newGame(4,date)};apply(s,'all',9000);const h=s.game.hatchery;h.distance=200;
 apply(s,'samsung',null);assert.equal(s.healthConnect.days[date].steps,null);assert.equal(h.distance,200);
 apply(s,'samsung',6500);assert.equal(h.distance,200);apply(s,'samsung',6550);assert.equal(h.distance,250);
 const old=structuredClone(s);delete old.game.hatchery.stepSource;delete old.game.hatchery.sourceBaselineThrough;assert.doesNotThrow(()=>validateState(old));
});
