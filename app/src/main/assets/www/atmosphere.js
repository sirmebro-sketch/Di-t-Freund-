import {defaultAudio, validateAudio} from './atmosphere-settings.js';
export {defaultAudio, validateAudio} from './atmosphere-settings.js';
import { sounds as classicSounds } from './game-assets.js';
import { platinum } from './platinum-assets.js';
// Original compositions: 16-bar loops, no copied game melodies or recordings.
export const tracks={
 meadow:{name:'Morgenroute',bpm:92,roots:[48,53,57,55,48,53,50,55],melody:[72,0,76,79,76,74,72,0,69,72,77,76,74,72,69,0,76,79,81,79,76,74,72,76,74,71,67,0,71,74,79,0]},
 coast:{name:'Abend am Wasser',bpm:76,roots:[50,55,58,57,50,55,53,57],melody:[74,0,77,0,81,79,77,0,79,0,74,72,74,0,0,0,77,0,81,84,81,79,77,0,76,0,73,0,69,73,76,0]},
 focus:{name:'Trainingsreise',bpm:104,roots:[45,50,53,52,45,53,50,52],melody:[69,72,76,0,79,76,72,76,74,77,81,77,74,0,72,74,77,81,84,81,79,77,76,0,76,74,71,68,71,74,76,0]},
};
export function scoreNotes(track,step) {
 const t=tracks[track]||tracks.meadow,bar=Math.floor(step/8)%16,root=t.roots[bar%8],phase=step%8;
 const minor=track!=='meadow'&&(bar%8===0||bar%8===3||bar%8===7),third=minor?3:4;
 const chord=[root+12,root+12+third,root+19,root+24];
 const notes=[{midi:chord[phase%4],wave:'triangle',gain:.035,length:.8}];
 if(phase===0||phase===4)notes.push({midi:root,wave:'triangle',gain:.07,length:3.2});
 const melody=t.melody[(step+(bar>=8?8:0))%t.melody.length];
 if(melody)notes.push({midi:melody+(bar>=12?-12:0),wave:'sine',gain:.075,length:1.4});
 return notes;
}
export function scheduleNote(context,destination,note,at,beat) {
 const osc=context.createOscillator(),gain=context.createGain();
 osc.type=note.wave;osc.frequency.value=440*2**((note.midi-69)/12);
 const duration=beat*note.length;
 gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(note.gain,at+.025);
 gain.gain.exponentialRampToValueAtTime(.001,at+duration);
 osc.connect(gain);gain.connect(destination);osc.start(at);osc.stop(at+duration+.01);
 osc.onended=()=>{osc.disconnect();gain.disconnect();};
 return osc;
}
// Render once: the audio device loops the score independently of DOM rendering.
export async function renderMusic(track) {
 const t=tracks[track],beat=60/t.bpm/2,rate=44100;
 const offline=new OfflineAudioContext(1,Math.ceil(128*beat*rate),rate);
 for(let step=0;step<128;step++)for(const note of scoreNotes(track,step))
  scheduleNote(offline,offline.destination,note,step*beat,beat);
 const buffer=await offline.startRendering(),samples=buffer.getChannelData(0);
 // Smooth the boundary of the full musical loop, not navigation events.
 const fade=Math.round(rate*.02);
 for(let i=0;i<fade;i++){samples[i]*=i/fade;samples[samples.length-1-i]*=i/fade;}
 return buffer;
}
export function setupAtmosphere({getState,commit,render,sheet,btn,select,num,notify}) {
 let context=null,musicGain=null,effectsGain=null,resuming=null;
 let unlocked=false,foreground=true,focus=false,lastEffect=0;
 let music=null,musicTrack=null,musicOffset=0,musicStartedAt=0,musicEpoch=0,musicTask=null;
 let effectSource=null,effectEpoch=0;
 const scores=new Map(),effects=new Map();
 const sources={...classicSounds,...platinum.sfx};
 const settings=()=>getState().audioSettings||{...defaultAudio(),effects:getState().game?.sound||false};
 const canPlay=()=>unlocked&&foreground&&!document.hidden&&focus;
 function ensureContext(){
  if(context)return context;
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
  context=new C();musicGain=context.createGain();effectsGain=context.createGain();
  musicGain.connect(context.destination);effectsGain.connect(context.destination);
  updateGains();return context;
 }
 function updateGains(){if(!context)return;const a=settings();musicGain.gain.value=a.musicVolume/100;effectsGain.gain.value=a.effectsVolume/100;}
 function resumeContext(){
  if(!canPlay()||!ensureContext())return Promise.resolve(false);
  if(context.state==='running')return Promise.resolve(true);
  if(!resuming){
   const pending=context.resume().then(()=>canPlay()&&context.state==='running',()=>false);
   resuming=pending;pending.finally(()=>{if(resuming===pending)resuming=null;});
  }
  return resuming;
 }
 function stopMusic(reset=false){
  musicEpoch++;musicTask=null;
  if(music){
   if(!reset)musicOffset=(musicOffset+Math.max(0,context.currentTime-musicStartedAt))%music.buffer.duration;
   try{music.stop();}catch{}music.disconnect();music=null;
  }
  if(reset)musicOffset=0;
 }
 function stopEffects(){
  effectEpoch++;
  if(effectSource){try{effectSource.stop();}catch{}effectSource.disconnect();effectSource=null;}
 }
 function stop(){
  unlocked=false;focus=false;stopMusic();stopEffects();
  // Also queue a suspension if a gesture-triggered resume is still pending.
  if(context&&context.state!=='closed')context.suspend().catch(()=>{});
 }
 function requestFocus(){
  if(focus)return true;
  try{focus=window.Android?.requestAppAudioFocus?!!window.Android.requestAppAudioFocus():true;}
  catch{focus=false;}
  return focus;
 }
 function releaseFocus(){focus=false;try{window.Android?.abandonAppAudioFocus?.();}catch{}}
 function startMusic(){
  const a=settings();if(!canPlay()||!a.music||context?.state!=='running')return;
  updateGains();
  if(musicTrack!==a.track){stopMusic(true);musicTrack=a.track;}
  if(music||musicTask)return;
  const ticket=musicEpoch,track=a.track;
  if(!scores.has(track))scores.set(track,renderMusic(track).catch(e=>{scores.delete(track);throw e;}));
  const task=scores.get(track).then(buffer=>{
   if(ticket!==musicEpoch||!canPlay()||!settings().music||settings().track!==track||context.state!=='running')return;
   const source=context.createBufferSource();source.buffer=buffer;source.loop=true;
   source.connect(musicGain);musicOffset%=buffer.duration;musicStartedAt=context.currentTime;
   source.start(0,musicOffset);music=source;
  }).catch(()=>{notify('Musik konnte nicht gestartet werden. Bitte erneut über ♪ Ton versuchen.');});
  musicTask=task;task.finally(()=>{if(musicTask===task)musicTask=null;});
 }
 function unlock(){
  if(document.hidden||!foreground)return;
  const a=settings();if((!a.music&&!a.effects)||!requestFocus())return;
  unlocked=true;updateGains();
  resumeContext().then(ready=>{if(ready)startMusic();});
 }
 function effect(key){
  const a=settings();if(!a.effects||!canPlay()||Date.now()-lastEffect<90)return;
  const url=sources[key]||sources.menu;if(!url||!ensureContext())return;
  lastEffect=Date.now();const ticket=++effectEpoch;
  if(!effects.has(url)){
   const bytes=Uint8Array.from(atob(url.split(',')[1]),c=>c.charCodeAt(0));
   effects.set(url,context.decodeAudioData(bytes.buffer).catch(e=>{effects.delete(url);throw e;}));
  }
  Promise.all([resumeContext(),effects.get(url)]).then(([ready,buffer])=>{
   if(!ready||ticket!==effectEpoch||!canPlay()||!settings().effects||context.state!=='running')return;
   if(effectSource){try{effectSource.stop();}catch{}effectSource.disconnect();}
   const source=context.createBufferSource();source.buffer=buffer;source.connect(effectsGain);
   source.onended=()=>{source.disconnect();if(effectSource===source)effectSource=null;};
   updateGains();source.start();effectSource=source;
  }).catch(()=>{});
 }
 function view(){const a=settings();sheet('Musik & Klänge',`<p>Drei eigene Retro-Begleitstücke und kurze Originaleffekte aus Pokémon. Alles offline. Musik startet erst nach deinem Tippen und pausiert beim Verlassen der App.</p><form data-form="audio-settings"><label class="checkbox"><input name="music" type="checkbox" ${a.music?'checked':''}> Hintergrundmusik</label><label class="checkbox"><input name="effects" type="checkbox" ${a.effects?'checked':''}> Menü-, Kampf- und Fortschrittsklänge</label>${select('Musikstück','track',Object.entries(tracks).map(([id,t])=>[id,t.name]),a.track)}${num('Musiklautstärke · %','musicVolume',a.musicVolume,0,100,1)}${num('Effektlautstärke · %','effectsVolume',a.effectsVolume,0,100,1)}<p class="error" role="alert"></p><button type="submit" class="primary wide">Übernehmen & anhören</button></form><div class="toolbar">${btn('Alles stumm','audio-mute','secondary')}${btn('Effekt testen','audio-test','secondary')}</div><p class="footnote">Musik: eigene Kompositionen, keine Original-Soundtrackaufnahmen. Grafiken/SFX: Pokémon © Nintendo / Creatures / GAME FREAK; Quellen in der Hilfe.</p>`);}
 function apply(d){
  const a={music:d.music==='on',effects:d.effects==='on',track:d.track,musicVolume:Number(d.musicVolume),effectsVolume:Number(d.effectsVolume)};
  validateAudio(a);const before=settings();
  if(!commit(s=>{s.audioSettings=a;if(s.game)s.game.sound=a.effects;}))return false;
  if(a.track!==before.track)stopMusic(true);
  else if(!a.music)stopMusic();
  if(!a.effects)stopEffects();
  updateGains();
  if(!a.music&&!a.effects){stop();releaseFocus();}
  else{unlock();effect('menu');}
  render();return true;
 }
 document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();releaseFocus();}});
 window.onAppPause=()=>{foreground=false;stop();};
 window.onAudioFocusChanged=granted=>{focus=!!granted;if(!focus)stop();};
 const previousResume=window.onAppResume;window.onAppResume=()=>{foreground=true;previousResume?.();};
 const actions={
  'audio-open':view,
  'audio-mute':()=>{if(commit(s=>{s.audioSettings={...settings(),music:false,effects:false};if(s.game)s.game.sound=false;})){stop();releaseFocus();view();render();}},
  'audio-test':()=>{unlock();if(!settings().effects)notify('Aktiviere Effekte und übernimm die Einstellung.');else effect('heal');},
 };
 return {actions,apply,effect,stop,unlock,settings,refresh:()=>{updateGains();if(!settings().music)stopMusic();else startMusic();}};
}
