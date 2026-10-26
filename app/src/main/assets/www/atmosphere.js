import {readCustomMusic,removeCustomMusic,decodeMusicFile,saveCustomMusic} from './custom-music.js';
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
export function setupAtmosphere({getState,commit,render,sheet,btn,select,num,notify,esc}) {
 let context=null,musicGain=null,effectsGain=null,resuming=null;
 let unlocked=false,foreground=true,focus=false;
 let music=null,musicTrack=null,musicOffset=0,musicStartedAt=0,musicEpoch=0,musicTask=null;
 let effectSource=null,effectEpoch=0;
 const scores=new Map(),effects=new Map();
 let customInfo=null,importEpoch=0;
 readCustomMusic().then(info=>{customInfo=info||null;}).catch(()=>{});
 const sources={...classicSounds,...platinum.sfx};
 const settings=()=>({...defaultAudio(),...getState().audioSettings,effects:getState().audioSettings?.effects??defaultAudio().effects});
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
  if(!scores.has(track)){const load=track==='custom'?readCustomMusic().then(info=>{if(!info)throw Error('Bitte deine Musikdatei erneut auswählen.');customInfo=info;return decodeMusicFile(info.blob,context);}):renderMusic(track);scores.set(track,load.catch(e=>{scores.delete(track);throw e;}));}
  const task=scores.get(track).then(buffer=>{
   if(ticket!==musicEpoch||!canPlay()||!settings().music||settings().track!==track||context.state!=='running')return;
   const source=context.createBufferSource();source.buffer=buffer;source.loop=true;
   source.connect(musicGain);musicOffset%=buffer.duration;musicStartedAt=context.currentTime;
   source.start(0,musicOffset);music=source;
  }).catch(error=>{if(ticket===musicEpoch&&canPlay())notify(error.message||'Musik konnte nicht gestartet werden. Bitte erneut über ♪ Ton versuchen.');});
  musicTask=task;task.finally(()=>{if(musicTask===task)musicTask=null;});
 }
 function unlock(preview=false){
  if(document.hidden||!foreground)return;
  const a=settings();if((!preview&&!a.music&&!a.effects)||!requestFocus())return;
  unlocked=true;updateGains();
  resumeContext().then(ready=>{if(ready)startMusic();});
 }
 function effect(key,preview=false){
  const a=settings();if((!preview&&!a.effects)||!canPlay())return;
  const url=sources[key]||sources.menu;if(!url||!ensureContext())return;
  const ticket=++effectEpoch;
  if(!effects.has(url)){
   const bytes=Uint8Array.from(atob(url.split(',')[1]),c=>c.charCodeAt(0));
   effects.set(url,context.decodeAudioData(bytes.buffer).catch(e=>{effects.delete(url);throw e;}));
  }
  Promise.all([resumeContext(),effects.get(url)]).then(([ready,buffer])=>{
   if(!ready||ticket!==effectEpoch||!canPlay()||(!preview&&!settings().effects)||context.state!=='running')return;
   if(effectSource){try{effectSource.stop();}catch{}effectSource.disconnect();}
   const source=context.createBufferSource();source.buffer=buffer;source.connect(effectsGain);
   source.onended=()=>{source.disconnect();if(effectSource===source)effectSource=null;if(preview&&!settings().music&&!settings().effects){stop();releaseFocus();}};
   updateGains();if(preview)effectsGain.gain.value=Math.max(.35,a.effectsVolume/100);source.start();effectSource=source;
  }).catch(()=>{});
 }
 function haptic(preview=false){
  if(!foreground||document.hidden||(!preview&&!settings().haptics))return;
  try{if(window.Android?.hapticFeedback)window.Android.hapticFeedback();else navigator.vibrate?.(12);}catch{}
 }
 function feedback(target){
  if(target.disabled||target.getAttribute('aria-disabled')==='true'||['audio-test','audio-feedback-on'].includes(target.dataset.action))return;
  unlock();haptic();
  const a=target.dataset.action||'';
  effect(target.matches('button[type="submit"],button:not([type])')&&!a?'open':'menu');
 }
 document.addEventListener('click',event=>{const target=event.target.closest('button,a.wordmark,summary,input[type="checkbox"],input[type="radio"]');if(target)feedback(target);},true);
 document.addEventListener('change',event=>{if(event.target.matches('select'))feedback(event.target);},true);
 function view(){const a=settings();sheet('Musik, Töne & Vibration',`<p>Originale kurze Pokémon-Klänge für Schaltflächen, Menüs und Bestätigungen. Musik, Bedienungstöne und Vibration sind getrennt einstellbar.</p>${!a.effects?`<p class="hint">Bedienungstöne sind ausgeschaltet.</p>${btn('Töne & Vibration einschalten','audio-feedback-on','primary wide')}`:''}<form data-form="audio-settings"><label class="checkbox"><input name="music" type="checkbox" ${a.music?'checked':''}> Hintergrundmusik</label><label class="checkbox"><input name="effects" type="checkbox" ${a.effects?'checked':''}> Pokémon-Bedienungstöne & Spieleffekte</label><label class="checkbox"><input name="haptics" type="checkbox" ${a.haptics?'checked':''}> Kurzes Vibrationsfeedback</label>${select('Musikstück','track',[...Object.entries(tracks).map(([id,t])=>[id,t.name]),['custom',customInfo?'Eigene Datei: '+customInfo.name:'Eigene Musikdatei (zuerst laden)']],a.track)}${num('Musiklautstärke · %','musicVolume',a.musicVolume,0,100,1)}${num('Effektlautstärke · %','effectsVolume',a.effectsVolume,0,100,1)}<p class="error" role="alert"></p><button type="submit" class="primary wide">Übernehmen & anhören</button></form><div class="toolbar">${btn('Ton stumm','audio-mute','secondary')}${btn('Ton & Vibration testen','audio-test','secondary')}</div><p class="footnote">Der Test spielt einen kurzen Pokémon-Menüton auch bei ausgeschalteten Effekten ab. Android-Medienlautstärke und Systemeinstellung für Berührungsvibration beachten.</p><section class="card below"><h3>Deine eigene Menümusik</h3><p>${customInfo?esc(customInfo.name)+' · '+Math.round(customInfo.duration)+' Sekunden':'Noch keine Datei geladen.'}</p><p>Wähle eine von dir bereitgestellte Audiodatei, z. B. deine passende HG/SS- oder Platin-Menümusik. Bis 10 MB und 5 Minuten; MP3, OGG, WAV oder M4A je nach Gerät.</p><input id="custom-music-file" type="file" accept="audio/*" hidden><div class="toolbar">${btn('Musikdatei laden','audio-import','primary')}${customInfo?btn('Datei entfernen','audio-remove','text-button'):''}</div><p class="footnote">Nur lokal gespeichert, kein Upload. Musikdateien sind nicht in der JSON-Tagebuchsicherung enthalten. Original-Soundtracks werden nicht mitgeliefert.</p></section><p class="footnote">Die drei mitgelieferten Retro-Stücke sind eigene Kompositionen. Grafiken/SFX: Pokémon © Nintendo / Creatures / GAME FREAK; Quellen in der Hilfe.</p>`);}
 async function importMusic(file){
  const ticket=++importEpoch;
  try{
   const ctx=ensureContext();if(!ctx)throw Error('Audiowiedergabe ist nicht verfügbar.');
   const buffer=await decodeMusicFile(file,ctx);if(ticket!==importEpoch)return;
   await saveCustomMusic(file,buffer.duration);if(ticket!==importEpoch)return;
   if(musicTrack==='custom')stopMusic(true);
   scores.set('custom',Promise.resolve(buffer));customInfo={name:String(file.name).slice(0,120),duration:buffer.duration};
   view();notify('Musik lokal gespeichert. Wähle „Eigene Datei“ und übernimm die Einstellung.');
  }catch(error){if(ticket===importEpoch)notify(error.message);}
 }
 async function clearMusic(){importEpoch++;await removeCustomMusic();if(musicTrack==='custom')stopMusic(true);scores.delete('custom');customInfo=null;}
 document.addEventListener('change',e=>{if(e.target.id==='custom-music-file'&&e.target.files?.[0])importMusic(e.target.files[0]);});
 function apply(d){
  const a={music:d.music==='on',effects:d.effects==='on',haptics:d.haptics==='on',track:d.track,musicVolume:Number(d.musicVolume),effectsVolume:Number(d.effectsVolume)};
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
 document.addEventListener('pointerdown',()=>unlock(),{passive:true});document.addEventListener('keydown',()=>unlock());
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();releaseFocus();}});
 window.onAppPause=()=>{foreground=false;stop();};
 window.onAudioFocusChanged=granted=>{focus=!!granted;if(!focus)stop();};
 const previousResume=window.onAppResume;window.onAppResume=()=>{foreground=true;previousResume?.();};
 const actions={
  'audio-open':view,
  'audio-mute':()=>{if(commit(s=>{s.audioSettings={...settings(),music:false,effects:false};if(s.game)s.game.sound=false;})){stop();releaseFocus();view();render();}},
  'audio-test':()=>{unlock(true);haptic(true);effect('menu',true);},
  'audio-feedback-on':()=>{if(commit(s=>{s.audioSettings={...settings(),effects:true,haptics:true,effectsVolume:Math.max(35,settings().effectsVolume)};if(s.game)s.game.sound=true;})){unlock();haptic();effect('menu');view();render();}},
  'audio-import':()=>document.querySelector('#custom-music-file')?.click(),
  'audio-remove':()=>sheet('Musikdatei entfernen?',`<p>Die importierte Datei wird aus FitDex gelöscht. Deine Originaldatei bleibt erhalten.</p>${btn('Abbrechen','audio-open','secondary')}${btn('Datei entfernen','audio-confirm-remove','primary')}`),
  'audio-confirm-remove':async()=>{try{await clearMusic();if(settings().track==='custom')commit(s=>{s.audioSettings={...settings(),track:'meadow',music:false};});view();render();}catch(e){notify(e.message);}},
 };
 return {actions,apply,effect,stop,unlock,settings,clearMusic,refresh:()=>{updateGains();if(!settings().music)stopMusic();else startMusic();}};
}
