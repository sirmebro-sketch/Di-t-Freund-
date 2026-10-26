import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {emptyState} from '../app/src/main/assets/www/core.js';
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:393,height:852},locale:'de-DE'});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 window.failWrite=false;window.focusRequests=0;window.audioContexts=[];window.audioEvents=[];
 const RealContext=window.AudioContext;window.AudioContext=class extends RealContext{constructor(){super();window.audioContexts.push(this);}};
 const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.audioEvents.push(this.src.slice(0,30));return play.call(this);};
 window.Android={readState:()=>localStorage.getItem('diaetfreund-v1'),writeState:raw=>{if(window.failWrite)return false;localStorage.setItem('diaetfreund-v1',raw);return true;},requestAppAudioFocus:()=>{window.focusRequests++;return true;},abandonAppAudioFocus:()=>{}};
});
await page.goto(process.env.APP_URL||'http://127.0.0.1:4173');
const initial={...emptyState(),profile:{name:'Alex',height:182,start:100,goal:92,kcal:2300,protein:140,water:2000,sessions:2},trainingStage:'restart'};
await page.evaluate(s=>localStorage.setItem('diaetfreund-v1',JSON.stringify(s)),initial);await page.reload();
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('diaetfreund-v1')));
const click=async a=>page.locator(`[data-action="${a}"]:visible`).first().click();
const submit=()=>page.locator('#sheet button[type="submit"]').click();
await page.locator('.bottom-nav [data-tab="train"]').click();await click('tw-new');await page.locator('[name="name"]').fill('Freie Gerätewahl');await submit();
await click('tw-library');await page.locator('[name="equipmentFilter"]').selectOption('Maschine');await page.locator('#exercise-search').fill('Beinpresse');assert.equal(await page.locator('[data-action="tw-select"]').count(),1);await click('tw-select');await page.locator('[name="kg"]').fill('35');await submit();
await page.locator('[data-set="0"][data-key="kg"]').fill('37.5');await page.locator('[data-set="0"][data-key="kg"]').blur();await click('toggle-set');
await click('tw-library');await page.locator('#exercise-search').fill('Unterarmstütz');await click('tw-select');await page.locator('[name="seconds"]').fill('20');await submit();
assert.equal((await read()).activeWorkout.sets.length,4);assert.equal((await read()).activeWorkout.sets[2].seconds,20);
await click('tw-down');let s=await read();assert.equal(s.activeWorkout.sets[0].mode,'time');assert.equal(s.activeWorkout.sets[2].kg,37.5);assert(s.activeWorkout.sets[2].done);
await click('tw-add-set');assert.equal((await read()).activeWorkout.sets.length,5);
await click('tw-remove-set');assert.equal((await read()).activeWorkout.sets.length,4);
await click('custom-exercise');await page.locator('[name="exercise"]').fill('Meine Gerätevariante');await page.locator('[name="equipment"]').fill('Studio Gerät 7');await submit();
await click('tw-save-plan');await page.locator('[name="name"]').fill('Mein Geräteplan');await submit();s=await read();assert.equal(s.trainingPlans.length,1);assert(s.trainingPlans[0].sets.every(x=>!x.done));assert(s.activeWorkout.sets.some(x=>x.done));
const snapshot=structuredClone(s.activeWorkout);await page.reload();assert.deepEqual((await read()).activeWorkout,snapshot);
await page.locator('.bottom-nav [data-tab="train"]').click();await click('tw-replace');await page.locator('#exercise-search').fill('Brustpresse');await click('tw-select');await submit();assert.equal((await read()).activeWorkout.sets[0].exercise,'Brustpresse');
await click('tw-remove-group');await click('tw-confirm-group');assert(!(await read()).activeWorkout.sets.some(x=>x.exercise==='Brustpresse'));
await page.setViewportSize({width:360,height:800});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze()).violations,[]);
await page.screenshot({path:'test-results/training-flexible.png',fullPage:true});
await page.evaluate(()=>document.documentElement.dataset.theme='dark');
// Measure the settled theme, not a frame halfway through button background transitions.
await page.waitForFunction(()=>[...document.querySelectorAll('button')].every(e=>e.getAnimations().every(a=>a.playState!=='running')));
assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze()).violations,[]);await page.screenshot({path:'test-results/training-dark.png',fullPage:true});await page.evaluate(()=>document.documentElement.dataset.theme='light');
await click('finish-workout');await page.locator('[name="minutes"]').fill('30');await submit();s=await read();assert.equal(s.activeWorkout,null);assert.equal(s.workouts[0].sets.length,1);assert.equal(s.workouts[0].sets[0].kg,37.5);
await click('tw-plans');await click('tw-load');assert((await read()).activeWorkout.sets.every(x=>!x.done));assert((await read()).activeWorkout.sets.some(x=>x.mode==='time'));
// A failed write must preserve the running session.
await page.evaluate(()=>window.failWrite=true);const before=await read();await click('tw-add-set');assert.deepEqual(await read(),before);await page.evaluate(()=>window.failWrite=false);
await click('audio-open');await page.locator('[name="music"]').check();await page.locator('[name="effects"]').check();await page.locator('[name="track"]').selectOption('coast');await submit();
await page.waitForFunction(()=>window.audioContexts.some(c=>c.state==='running'));assert.equal((await read()).audioSettings.track,'coast');
await page.evaluate(()=>window.onAppPause());await page.waitForFunction(()=>window.audioContexts.every(c=>c.state!=='running'));
await page.evaluate(()=>window.onAppResume());assert(await page.evaluate(()=>window.audioContexts.every(c=>c.state!=='running')));
await click('audio-open');await page.waitForFunction(()=>window.audioContexts.some(c=>c.state==='running'));await click('audio-test');assert(await page.evaluate(()=>window.audioEvents.length>0));
await page.evaluate(()=>window.onAudioFocusChanged(false));await page.waitForFunction(()=>window.audioContexts.every(c=>c.state!=='running'));
await click('audio-mute');assert.equal((await read()).audioSettings.music,false);assert.equal((await read()).audioSettings.effects,false);
await click('close');await page.reload();assert.equal(await page.evaluate(()=>window.audioContexts.length),0);
// Render the actual score, inspect signal energy and clipping; all three pieces differ.
const rendered=await page.evaluate(async()=>{
 const {tracks,scoreNotes,scheduleNote}=await import('./atmosphere.js'),out=[];
 for(const [id,t] of Object.entries(tracks)){
  const c=new OfflineAudioContext(1,44100*12,44100),beat=60/t.bpm/2;
  for(let step=0;step*beat<11;step++)for(const note of scoreNotes(id,step))scheduleNote(c,c.destination,note,.05+step*beat,beat);
  const data=(await c.startRendering()).getChannelData(0);let sum=0,max=0;for(const x of data){sum+=x*x;max=Math.max(max,Math.abs(x));}out.push({id,rms:Math.sqrt(sum/data.length),max});
 }return out;
});
for(const r of rendered){assert(r.rms>.01&&r.rms<.2);assert(r.max<1);}assert.equal(new Set(rendered.map(x=>x.rms)).size,3);
// Embedded Platinum background must decode as a CSS image, not just an SVG element.
assert(await page.evaluate(async()=>{const css=getComputedStyle(document.body).backgroundImage;const url=css.slice(css.indexOf('url("')+5,-2);return new Promise(resolve=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas");c.width=i.width;c.height=i.height;const ctx=c.getContext("2d");ctx.drawImage(i,0,0);const pixels=ctx.getImageData(0,0,c.width,c.height).data;resolve(pixels.some((v,n)=>n%4===3&&v>0)&&new Set(pixels).size>3);};i.onerror=()=>resolve(false);i.src=url;});}));
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: flexible session, filtering, timed sets, ordering, plans, persistence, failures, finish, audio lifecycle, actual score rendering, backgrounds and accessibility.',rendered);
