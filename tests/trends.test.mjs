import test from 'node:test';import assert from 'node:assert/strict';
import {emptyState} from '../app/src/main/assets/www/core.js';
import {metricSeries,trendData,trendMetrics,trendWindow,movingWeight} from '../app/src/main/assets/www/trends.js';
const metric=id=>trendMetrics.find(m=>m.id===id);
test('Trend dates preserve zero, missing days, leap dates and disjoint segments',()=>{
 const s=emptyState();s.water={'2024-02-28':0,'2024-03-01':1500};
 const data=trendData(metricSeries(s,'water'),metric('water'),'2024-02-28','2024-03-01');
 assert.deepEqual(data.buckets.map(b=>b.value),[0,null,1.5]);assert.equal(data.count,2);assert.equal(data.totalDays,3);assert.equal(data.average,.75);
 assert.throws(()=>trendData([],metric('water'),'2025-02-30','2025-03-02'));
 assert.throws(()=>trendData([],metric('water'),'2026-01-02','2026-01-01'));
});
test('Nutrition graphs preserve incomplete coverage and never invent missing micronutrients',()=>{
 const s=emptyState();s.entries=[{date:'2026-01-01',amount:200,kcal:100,protein:10,micros:{vitaminC:5}},{date:'2026-01-01',amount:100,kcal:50,protein:3,micros:{vitaminC:null}},{date:'2026-01-02',amount:100,kcal:200,micros:{vitaminC:null}}];s.completeDays={'2026-01-02':true};
 assert.deepEqual(metricSeries(s,'kcal').map(p=>p.value),[250,200]);assert.equal(metricSeries(s,'kcal',true).length,1);
 s.entries[0].fiber=4;s.entries[1].fiber=0;s.entries[1].fiberKnown=false;assert.equal(metricSeries(s,'fiber')[0].value,8);assert.equal(metricSeries(s,'fiber')[0].partial,true);
 const micro=metricSeries(s,'micro-vitaminC');assert.equal(micro.length,1);assert.equal(micro[0].value,10);assert.equal(micro[0].partial,true);
});
test('Health graphs prefer own daily steps/sleep and average repeated pressure readings',()=>{
 const s=emptyState();s.healthConnect={days:{'2026-01-01':{steps:5000,sleep:7},'2026-01-02':{steps:0,sleep:null}},weights:[{date:'2026-01-01',time:'2026-01-01T10:00:00Z',value:100}]};
 s.health=[{date:'2026-01-01',steps:6000,sleep:null,sys:120},{date:'2026-01-01',steps:null,sleep:8,sys:130}];s.weights=[{date:'2026-01-01',value:99}];
 assert.equal(metricSeries(s,'steps')[0].value,6000);assert.equal(metricSeries(s,'steps')[1].value,0);assert.equal(metricSeries(s,'sleep')[0].value,8);assert.equal(metricSeries(s,'sys')[0].value,125);assert.equal(metricSeries(s,'weight')[0].value,99);
});
test('Long views aggregate observed days, sum training, preserve old years and exclude future data',()=>{
 const points=[{date:'2020-01-01',value:100},{date:'2020-01-02',value:90},{date:'2020-02-01',value:80},{date:'2099-01-01',value:70}];
 const monthly=trendData(points,metric('weight'),'2020-01-01','2020-12-31');assert.equal(monthly.unit,'month');assert.equal(monthly.buckets[0].value,95);assert.equal(monthly.buckets[0].days,2);assert.equal(monthly.buckets[2].value,null);assert.equal(monthly.count,3);assert.equal(monthly.average,90);
 const yearly=trendData(points,metric('training'),'2020-01-01','2026-01-01');assert.equal(yearly.unit,'year');assert.equal(yearly.buckets[0].value,270);assert.equal(yearly.count,3);
 assert.deepEqual(trendWindow('all','2026-01-01',points),{start:'2020-01-01',end:'2026-01-01'});
 assert.equal(movingWeight(points,'2020-01-02'),95);assert.equal(movingWeight(points,'2020-01-20'),null);
});

test('Music validation rejects oversized, unreadable and overlong files before storage',async()=>{
 const {decodeMusicFile,musicLimits}=await import('../app/src/main/assets/www/custom-music.js');
 await assert.rejects(decodeMusicFile({size:musicLimits.bytes+1},{}),/10 MB/);
 const file={size:100,arrayBuffer:async()=>new ArrayBuffer(100)};
 await assert.rejects(decodeMusicFile(file,{decodeAudioData:async()=>{throw Error('decode');}}),/nicht lesbar/);
 await assert.rejects(decodeMusicFile(file,{decodeAudioData:async()=>({duration:301})}),/5 Minuten/);
 assert.equal((await decodeMusicFile(file,{decodeAudioData:async()=>({duration:60})})).duration,60);
});
