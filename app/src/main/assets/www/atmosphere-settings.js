export const defaultAudio=()=>({music:false,effects:true,haptics:true,musicVolume:18,effectsVolume:50,track:'meadow'});
export function validateAudio(a) {
 if(a===undefined)return;
 if(a?.haptics!==undefined&&typeof a.haptics!=='boolean')throw Error('Ungültige Vibrationseinstellung.');
 if(!a||typeof a.music!=='boolean'||typeof a.effects!=='boolean'||!['meadow','coast','focus','custom'].includes(a.track)||!['musicVolume','effectsVolume'].every(k=>Number.isFinite(a[k])&&a[k]>=0&&a[k]<=100))throw Error('Ungültige Toneinstellungen.');
}
