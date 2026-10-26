// A user-selected audio file stays in this WebView's private origin storage.
// JSON diary backups deliberately do not embed large audio blobs.
export const musicLimits={bytes:10*1024*1024,seconds:300};
function database(){return new Promise((resolve,reject)=>{const r=indexedDB.open('fitdex-media',1);r.onupgradeneeded=()=>r.result.createObjectStore('music');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Lokaler Musikspeicher nicht verfügbar.'));});}
async function transaction(mode,fn){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('music',mode),r=fn(tx.objectStore('music'));let result;r.onsuccess=()=>{result=r.result;};tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=tx.onabort=()=>{db.close();reject(Error('Musik konnte nicht lokal gespeichert werden.'));};});}
export const readCustomMusic=()=>transaction('readonly',store=>store.get('menu'));
export const removeCustomMusic=()=>transaction('readwrite',store=>store.delete('menu'));
export async function decodeMusicFile(file,context){
 if(!file||file.size<1||file.size>musicLimits.bytes)throw Error('Bitte eine Audiodatei mit höchstens 10 MB wählen.');
 let buffer;try{buffer=await context.decodeAudioData(await file.arrayBuffer());}catch{throw Error('Audiodatei nicht lesbar. Bitte MP3, OGG, WAV oder M4A versuchen.');}
 if(!Number.isFinite(buffer.duration)||buffer.duration<=0||buffer.duration>musicLimits.seconds)throw Error('Die Musik darf höchstens 5 Minuten lang sein.');
 return buffer;
}
export const saveCustomMusic=(file,duration)=>transaction('readwrite',store=>store.put({blob:file,name:String(file.name||'Eigene Menümusik').slice(0,120),duration},'menu'));
