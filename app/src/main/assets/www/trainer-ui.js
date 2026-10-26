import {gen4} from './gen4-assets.js';
import {monster,gamePoints,quests} from './game.js';
import {activeRegion,regionPoints,regionProgress,regionWorld} from './region-progress.js';
import {today} from './core.js';
const milestones=[[1,'Der erste Schritt'],[9,'Ein Team entsteht'],[21,'Im eigenen Rhythmus'],[45,'Verlässlicher Begleiter'],[90,'Auf großer Reise'],[180,'Erfahrener Trainer'],[360,'Ein starkes Team'],[720,'Geschichten fürs Album']];
export const dsIcon=name=>`<span class="ds-icon ds-${name}" aria-hidden="true"></span>`;
export function setupTrainerUI({getState,btn,esc,sheet}){
 document.documentElement.style.setProperty('--hgss-menu',`url("${gen4.menu}")`);
 const sprite=id=>`<img class="pokemon-sprite" src="${gen4[id]}" alt="" width="96" height="96">`;
 const scenery=()=>`<svg class="ds-scenery" viewBox="${getState().theme==='dark'?'586':'70'} 1218 254 158" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="${gen4.locations}" width="1773" height="1673"/></svg>`;
 function status(){const g=getState().game;if(!g)return '';const m=monster(g.collection.find(m=>m.base===g.buddy));return `<div class="trainer-strip"><span>${sprite(m.id)}<strong>${esc(m.name)} · Lv. ${m.level}</strong></span><span>${g.paused?'Abenteuer pausiert':`${m.level===100?'Level 100':20-m.xp%20+' EP bis Level '+(m.level+1)} · ${g.discovered.length}/251`}</span></div>`;}
 function home(){
  const s=getState(),g=s.game;
  if(!g)return `<section class="ds-hero">${scenery()}<div class="hero-copy"><span class="eyebrow">DEIN ALLTAG WIRD ZUM ABENTEUER</span><h2>Ein neuer Weg.<br>Ein Freund an deiner Seite.</h2>${btn('Partner wählen','game','primary')}</div>${sprite(4)}</section><p class="hint">Essen erfassen, kurz einchecken, bewegen oder erholen: drei kleine Routinen begleiten deine Reise.</p><div class="daily-grid"><button class="routine-tile" data-action="add-food">Essen erfassen</button><button class="routine-tile" data-action="checkin">Tages-Check-in</button><button class="routine-tile" data-action="go-train">Training & Erholung</button></div>`;
  const m=monster(g.collection.find(x=>x.base===g.buddy)),earned=g.earned[today()]||[],points=regionPoints(g),place=regionWorld(g).placeAt(points);
  return `<section class="ds-hero">${scenery()}<div class="hero-copy"><span class="eyebrow">${activeRegion(g).toUpperCase()} · ${esc(place.name)}</span><h2>Zusammen geht’s weiter.</h2><p>${g.paused?'Dein Abenteuer ruht. Dein Team wartet auf dich.':`${m.name} begleitet dich. Noch ${3-points%3} Routinepunkte bis zur nächsten Begegnung.`}</p>${btn('Mein Team öffnen','game','primary')}</div>${sprite(m.id)}</section><section class="daily-routines"><div class="section-head"><h2>Deine drei Tagesroutinen</h2><strong>${earned.length}/3</strong></div><div class="daily-grid">${quests(s,today()).map(q=>{const done=earned.includes(q.key),label={food:'Essen erfassen',check:'Tages-Check-in',care:'Bewegen / erholen'}[q.key];return `<button data-action="${q.key==='care'?'care-choice':q.action}" class="routine-tile ${done?'routine-done':''}" aria-label="${label}${done?' · schon belohnt':''}">${dsIcon({food:'food',check:'profile',care:'train'}[q.key])}<strong>${label}</strong><small>${done?'✓ 10 Team-EP erhalten':g.paused?'Abenteuer pausiert':'+10 Team-EP'}</small></button>`}).join('')}</div><p class="footnote">Jede Routine zählt einmal. Erholung zählt genauso. Kein Verlust bei Pausen.</p></section>`;
 }
 function journey(){const g=getState().game;if(!g)return home();const p=regionProgress(g);return `${home().split('<section class="daily-routines">')[0]}<div class="touch-grid">${[['Pokédex','game-dex','food',g.discovered.length+'/251 entdeckt'],['Karte & Regionen','game-regions','journey','Kanto und Johto'],['Orden & Liga','game-badges','train',p.badges.length+'/8 Orden hier'],['Forschung & Freundschaft','game-career','profile','Deine langfristige Reise'],['Trainerpass','trainer-pass','home','Deine gesammelten Erfolge']].map(([label,action,icon,hint])=>`<button class="card touch-tile" data-action="${action}">${dsIcon(icon)}<strong>${label}</strong><small>${hint}</small></button>`).join('')}</div>`;}
 function passport(){const g=getState().game;if(!g)return;const n=gamePoints(g);sheet('Dein Trainerpass',`<span class="eyebrow">BLEIBENDE ERINNERUNGEN</span><h3>${n} Routinepunkte auf deiner Reise</h3><p>Diese Erfolge bleiben. Es gibt keine verlorene Serie und nichts nachzuholen.</p><div class="passport-grid">${milestones.map(([need,label])=>`<article class="passport-stamp ${n>=need?'unlocked':''}">${dsIcon('train')}<h3>${label}</h3><p>${n>=need?'✓ Erreicht':`${n}/${need} Routinepunkte`}</p></article>`).join('')}</div>${btn('Team öffnen','game','secondary')}`);}
 function celebrate(before,after){
  if(!before.game||!after.game)return;const delta=gamePoints(after.game)-gamePoints(before.game);if(delta<=0)return;
  const old=new Set(before.game.events.map(e=>JSON.stringify(e))),fresh=after.game.events.filter(e=>!old.has(JSON.stringify(e)));
  const moment=['evolve','badge','league','catch','research','level'].map(k=>fresh.find(e=>e.kind===k)).find(Boolean);
  const m=monster(after.game.collection.find(x=>x.base===after.game.buddy));
  const el=document.querySelector('#reward');if(!el)return;
  el.innerHTML=`${sprite(moment?.species||m.id)}<div><strong>+${delta*10} Team-EP</strong><p>${esc(moment?.text||`${m.name} freut sich über euren nächsten Schritt.`)}</p></div><button data-action="reward-dismiss" aria-label="Belohnung schließen">×</button>`;el.hidden=false;clearTimeout(celebrate.timer);celebrate.timer=setTimeout(()=>el.hidden=true,8000);
 }
 return {status,home,journey,celebrate,actions:{'trainer-pass':passport,'reward-dismiss':()=>document.querySelector('#reward').hidden=true}};
}
