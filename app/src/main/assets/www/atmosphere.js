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
export function setupAtmosphere({getState,commit,render,sheet,btn,select,num,notify}) {
 let context=null,master=null,loop=null,nextTime=0,step=0,unlocked=false,foreground=true,focus=true,playing=null,lastEffect=0,activeTrack=null,generation=0;
 const activeNotes=new Set();
 const settings=()=>getState().audioSettings||{...defaultAudio(),effects:getState().game?.sound||false};
 function stop(){generation++;for(const note of activeNotes){try{note.stop();}catch{}}activeNotes.clear();clearInterval(loop);loop=null;playing?.pause();playing=null;if(context&&context.state==='running')context.suspend().catch(()=>{});}
 function hasFocus(){if(!window.Android?.requestAppAudioFocus)return true;try{return !!window.Android.requestAppAudioFocus();}catch{return false;}}
 function start(){const a=settings();if(!unlocked||!foreground||document.hidden||!focus||!a.music)return;
  if(!context){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;context=new C();master=context.createGain();master.connect(context.destination);}
  master.gain.value=a.musicVolume/100;
  if(activeTrack!==a.track){step=0;activeTrack=a.track;}
  if(loop)return;
  const ticket=generation;context.resume().then(()=>{if(ticket!==generation||loop||!settings().music||!foreground||!focus)return;nextTime=context.currentTime+.06;const tick=()=>{const a=settings();if(!a.music||!foreground||document.hidden||!focus){stop();return;}master.gain.value=a.musicVolume/100;const beat=60/tracks[a.track].bpm/2;if(nextTime<context.currentTime-.2)nextTime=context.currentTime+.03;while(nextTime<context.currentTime+.25){scoreNotes(a.track,step).forEach(n=>{const note=scheduleNote(context,master,n,nextTime,beat);activeNotes.add(note);note.addEventListener("ended",()=>activeNotes.delete(note),{once:true});});nextTime+=beat;step=(step+1)%128;}};tick();loop=setInterval(tick,100);}).catch(()=>{});
 }
 function unlock(){if(document.hidden||!foreground)return;const a=settings();if(!a.music&&!a.effects)return;focus=hasFocus();if(!focus)return;unlocked=true;start();}
 function effect(key){const a=settings();if(!a.effects||!unlocked||!focus||!foreground||document.hidden||Date.now()-lastEffect<90)return;const map={...classicSounds,hit:platinum.sfx.hit,heal:platinum.sfx.heal,recall:platinum.sfx.recall,bubble:platinum.sfx.bubble};const url=map[key]||classicSounds.menu;if(!url)return;lastEffect=Date.now();playing?.pause();playing=new Audio(url);playing.volume=a.effectsVolume/100;playing.play().catch(()=>{});}
 function view(){const a=settings();sheet('Musik & Klänge',`<p>Drei eigene Retro-Begleitstücke und kurze Originaleffekte aus Pokémon. Alles offline. Musik startet erst nach deinem Tippen und pausiert beim Verlassen der App.</p><form data-form="audio-settings"><label class="checkbox"><input name="music" type="checkbox" ${a.music?'checked':''}> Hintergrundmusik</label><label class="checkbox"><input name="effects" type="checkbox" ${a.effects?'checked':''}> Menü-, Kampf- und Fortschrittsklänge</label>${select('Musikstück','track',Object.entries(tracks).map(([id,t])=>[id,t.name]),a.track)}${num('Musiklautstärke · %','musicVolume',a.musicVolume,0,100,1)}${num('Effektlautstärke · %','effectsVolume',a.effectsVolume,0,100,1)}<p class="error" role="alert"></p><button type="submit" class="primary wide">Übernehmen & anhören</button></form><div class="toolbar">${btn('Alles stumm','audio-mute','secondary')}${btn('Effekt testen','audio-test','secondary')}</div><p class="footnote">Musik: eigene Kompositionen, keine Original-Soundtrackaufnahmen. Grafiken/SFX: Pokémon © Nintendo / Creatures / GAME FREAK; Quellen in der Hilfe.</p>`);}
 function apply(d){const a={music:d.music==='on',effects:d.effects==='on',track:d.track,musicVolume:Number(d.musicVolume),effectsVolume:Number(d.effectsVolume)};validateAudio(a);if(commit(s=>{s.audioSettings=a;if(s.game)s.game.sound=a.effects;})){stop();unlocked=true;focus=(a.music||a.effects)?hasFocus():false;start();effect('menu');if(!a.music&&!a.effects)window.Android?.abandonAppAudioFocus?.();render();return true;}return false;}
 document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 window.onAppPause=()=>{foreground=false;stop();};
 window.onAudioFocusChanged=granted=>{focus=!!granted;if(!focus)stop();};
 const previousResume=window.onAppResume;window.onAppResume=()=>{foreground=true;previousResume?.();};
 const actions={'audio-open':view,'audio-mute':()=>{if(commit(s=>{s.audioSettings={...settings(),music:false,effects:false};if(s.game)s.game.sound=false;})){stop();window.Android?.abandonAppAudioFocus?.();view();render();}},'audio-test':()=>{unlock();if(!settings().effects)notify('Aktiviere Effekte und übernimm die Einstellung.');else effect('heal');}};
 return {actions,apply,effect,stop,unlock,settings,refresh:()=>{if(!settings().music)stop();else start();}};
}
