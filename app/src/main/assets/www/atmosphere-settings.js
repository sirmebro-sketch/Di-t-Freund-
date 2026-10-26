export const defaultAudio=()=>({music:false,effects:false,musicVolume:18,effectsVolume:35,track:'meadow'});
export function validateAudio(a) {
 if(a===undefined)return;
 if(!a||typeof a.music!=='boolean'||typeof a.effects!=='boolean'||!['meadow','coast','focus'].includes(a.track)||!['musicVolume','effectsVolume'].every(k=>Number.isFinite(a[k])&&a[k]>=0&&a[k]<=100))throw Error('Ungültige Toneinstellungen.');
}
