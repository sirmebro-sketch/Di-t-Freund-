import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { emptyState } from '../app/src/main/assets/www/core.js';
const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:393,height:852}}),page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 window.holdDecode=false;window.releaseDecodes=[];
 window.audioTrace={contexts:0,resumes:0,suspends:0,focus:0,media:0,starts:[]};
 const Real=window.AudioContext;
 window.AudioContext=class extends Real {
  constructor(){super();window.appAudio=this;window.audioTrace.contexts++;}
  resume(){window.audioTrace.resumes++;return super.resume();}
  suspend(){window.audioTrace.suspends++;return super.suspend();}
  decodeAudioData(bytes){return super.decodeAudioData(bytes).then(buffer=>window.holdDecode?new Promise(resolve=>window.releaseDecodes.push(()=>resolve(buffer))):buffer);}
 };
 const start=AudioBufferSourceNode.prototype.start;
 AudioBufferSourceNode.prototype.start=function(when,offset=0){window.audioTrace.starts.push({loop:this.loop,offset,time:this.context.currentTime});return start.call(this,when,offset);};
 const play=HTMLMediaElement.prototype.play;
 HTMLMediaElement.prototype.play=function(){window.audioTrace.media++;window.onAudioFocusChanged?.(false);return play.call(this);};
 window.allowFocus=true;
 window.Android={readState:()=>localStorage.getItem('diaetfreund-v1'),writeState:raw=>{localStorage.setItem('diaetfreund-v1',raw);return true;},requestAppAudioFocus:()=>{window.audioTrace.focus++;return window.allowFocus;},abandonAppAudioFocus:()=>{}};
});
await page.goto(process.env.APP_URL||'http://127.0.0.1:4173');
const s={...emptyState(),profile:{name:'Alex',height:180,start:100,goal:90,kcal:2200,protein:140,water:2000,sessions:2},audioSettings:{music:true,effects:true,musicVolume:18,effectsVolume:35,track:'meadow'}};
await page.evaluate(s=>localStorage.setItem('diaetfreund-v1',JSON.stringify(s)),s);await page.reload();
const tab=t=>page.locator(`.bottom-nav [data-tab="${t}"]`).click();
const click=a=>page.locator(`[data-action="${a}"]:visible`).first().click();
await tab('food');
await page.waitForTimeout(500);
assert.equal(await page.evaluate(()=>window.audioTrace.media),0,'Menu effects must not create competing HTML media playback');
await page.waitForFunction(()=>window.audioTrace.starts.some(s=>s.loop));
const read=()=>page.evaluate(()=>structuredClone(window.audioTrace));
const initial=await read();
for(const t of ['train','journey','more','home','food','train','more'])await tab(t);
await click('audio-open');await click('close');await tab('home');await click('weight');await click('close');
await page.waitForTimeout(350);
let trace=await read();assert.equal(trace.contexts,1);assert.equal(trace.focus,initial.focus);assert.equal(trace.resumes,initial.resumes);assert.equal(trace.suspends,0);assert.equal(trace.starts.filter(x=>x.loop).length,1);assert(trace.starts.some(x=>!x.loop));
assert.equal(await page.evaluate(()=>window.appAudio.state),'running');
// Editing volume or effects must leave the music source/position intact.
await click('audio-open');await page.locator('[name="musicVolume"]').fill('25');await page.locator('[name="effects"]').uncheck();await page.locator('#sheet button[type="submit"]').click();
assert.equal((await read()).starts.filter(x=>x.loop).length,1);assert.equal((await read()).suspends,0);
// A real interruption stops output. Foreground alone must not auto-play; next tap resumes at the saved offset.
await page.evaluate(()=>window.onAppPause());await page.waitForFunction(()=>window.appAudio.state==='suspended');
const paused=await read();await page.evaluate(()=>window.onAppResume());await page.waitForTimeout(150);assert.equal((await read()).starts.length,paused.starts.length);
await tab('train');await page.waitForFunction(()=>window.audioTrace.starts.filter(x=>x.loop).length===2);
assert((await read()).starts.filter(x=>x.loop)[1].offset>0);
// Denied focus must never be ignored or start a new stream.
await page.evaluate(()=>{window.allowFocus=false;window.onAudioFocusChanged(false);});await page.waitForFunction(()=>window.appAudio.state==='suspended');
const lost=await read();await tab('home');await page.waitForTimeout(150);assert.equal((await read()).starts.length,lost.starts.length);
await page.evaluate(()=>window.allowFocus=true);await tab('more');await page.waitForFunction(()=>window.audioTrace.starts.filter(x=>x.loop).length===3);
// Only deliberately selecting a different piece starts it at zero.
await click('audio-open');await page.locator('[name="track"]').selectOption('coast');await page.locator('#sheet button[type="submit"]').click();
await page.waitForFunction(()=>window.audioTrace.starts.filter(x=>x.loop).length===4);
assert.equal((await read()).starts.filter(x=>x.loop).at(-1).offset,0);
await click('audio-open');await click('audio-mute');await page.waitForFunction(()=>window.appAudio.state==='suspended');
const muted=await read();await click('close');await tab('food');assert.equal((await read()).starts.length,muted.starts.length);
// A late decoded effect must not start after the app has been paused.
await click('audio-open');await page.locator('[name="effects"]').check();await page.locator('#sheet button[type="submit"]').click();
await click('audio-open');await page.evaluate(()=>window.holdDecode=true);await page.waitForTimeout(120);await click('audio-test');
await page.waitForFunction(()=>window.releaseDecodes.length>0);
await page.evaluate(()=>window.onAppPause());await page.waitForFunction(()=>window.appAudio.state==='suspended');const delayed=await read();
await page.evaluate(()=>{window.holdDecode=false;window.releaseDecodes.splice(0).forEach(release=>release());});await page.waitForTimeout(150);
assert.equal((await read()).starts.length,delayed.starts.length);
assert.deepEqual(errors,[]);await browser.close();
console.log('PASS: persistent music across navigation, shared SFX context, live volume, pause/resume offset, denied focus, track changes and mute.');
