import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyConnection, applyHealthSnapshot, combinedWeights, weightsForSharing, validateConnection} from '../app/src/main/assets/www/health-sync.js';
import {emptyState, staples, shiftDate, parseBackup} from '../app/src/main/assets/www/core.js';
import {newGame, syncGame, gamePoints} from '../app/src/main/assets/www/game.js';
import {startExpedition, friendship, careerRank, validateCareer} from '../app/src/main/assets/www/game-career.js';
import {pack, catalogSize} from '../app/src/main/assets/www/game-registry.js';
const weight = (value=95) => ({id:'synthetic',origin:'test.provider',date:'2026-10-25',time:'2026-10-25T08:00:00Z',value});
const payload = (extra={}) => ({kind:'sync',from:'2026-10-01',to:'2026-10-26',at:'2026-10-26T08:00:00Z',read:['steps','sleep','weight'],days:[{date:'2026-10-25',steps:0,sleep:null}],weights:[weight()],...extra});
test('Health Connect preserves unknown vs zero, manual priority, own exports and idempotency',()=>{
 const s=emptyState();s.weights=[{date:'2026-10-25',value:96}];
 applyHealthSnapshot(s,payload());const snapshot=structuredClone(s);
 applyHealthSnapshot(s,payload());assert.deepEqual(s,snapshot);
 assert.equal(s.healthConnect.days['2026-10-25'].steps,0);assert.equal(s.healthConnect.days['2026-10-25'].sleep,null);
 assert.equal(combinedWeights(s)[0].value,96);assert.deepEqual(weightsForSharing(s),s.weights);
 s.weights=[];assert.equal(combinedWeights(s)[0].source,'Health Connect');assert.deepEqual(weightsForSharing(s),[]);
 assert.deepEqual(parseBackup(JSON.stringify(s)).healthConnect,s.healthConnect);
});
test('partial permissions do not erase denied types; successful empty reads remove external deletions',()=>{
 const s=emptyState();applyHealthSnapshot(s,payload());
 applyHealthSnapshot(s,payload({read:['sleep'],days:[{date:'2026-10-25',sleep:7.5}],weights:[]}));
 assert.equal(s.healthConnect.days['2026-10-25'].steps,0);assert.equal(s.healthConnect.weights.length,1);
 applyHealthSnapshot(s,payload({read:['weight'],days:[],weights:[]}));
 assert.equal(s.healthConnect.weights.length,0);assert.equal(s.healthConnect.days['2026-10-25'].sleep,7.5);
});
test('invalid Health Connect payloads are atomic and cache works beyond a year',()=>{
 const s=emptyState();applyHealthSnapshot(s,payload());const before=structuredClone(s);
 for(const p of [payload({read:['unknown']}),payload({days:[{date:'2026-10-25',steps:-1}]}),payload({weights:[weight(NaN)]}),payload({at:'bad'}),payload({from:'2026-11-01'})]){
  assert.throws(()=>applyHealthSnapshot(s,p));assert.deepEqual(s,before);
 }
 for(let i=0;i<400;i++){const date=shiftDate('2025-01-01',i);applyHealthSnapshot(s,payload({from:date,to:date,read:['steps'],days:[{date,steps:i}],weights:[]}));}
 assert.equal(Object.keys(s.healthConnect.days).length,366);assert.equal(validateConnection(s.healthConnect),true);
});
function routine(s,date){s.entries.push({...staples[0],id:date,date,amount:100,meal:'Frühstück'});s.checkins[date]={hunger:2,fatigue:2,pain:false};s.game.restDays.push(date);syncGame(s,date);}
test('research lasts through breaks, completes exactly once, and repeats without new health duties',()=>{
 const s={...emptyState(),game:newGame(4,'2026-01-01')};
 assert.equal(startExpedition(s.game,'forest',0,'2026-01-01'),true);
 routine(s,'2026-01-01');syncGame(s,'2026-02-01');assert.equal(s.game.career.expedition.kind,'forest');
 for(let i=0;i<5;i++)routine(s,shiftDate('2026-02-01',i));
 assert.equal(s.game.career.completed.length,1);assert.equal(s.game.career.expedition,null);
 assert.equal(s.game.career.bond[4],18);assert.equal(friendship(18),'Gute Freunde');
 syncGame(s,'2026-02-05');assert.equal(s.game.career.completed.length,1);assert.equal(s.game.career.research,18);
 assert.equal(startExpedition(s.game,'coast',gamePoints(s.game),'2026-02-06'),true);
 s.game.paused=true;routine(s,'2026-02-07');assert.equal(s.game.career.research,18);
 assert.deepEqual(parseBackup(JSON.stringify(s)).game.career,s.game.career);
});
test('old game migration adds an empty career without retroactive rewards; unavailable regions stay unavailable',()=>{
 const s={...emptyState(),game:newGame(4,'2026-01-01')};routine(s,'2026-01-01');const xp=s.game.collection[0].xp;delete s.game.career;
 const migrated=parseBackup(JSON.stringify(s));assert.equal(migrated.game.collection[0].xp,xp);assert.equal(migrated.game.career.research,0);
 assert.equal(catalogSize(),251);assert.equal(pack('kanto').generation,1);assert.equal(pack('johto').generation,2);assert.throws(()=>pack('hoenn'));
 assert.equal(careerRank({research:600}).level,11);assert.throws(()=>validateCareer({...migrated.game.career,activeRegion:'hoenn'}));
});
