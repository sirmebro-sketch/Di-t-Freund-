import { platinum } from './platinum-assets.js';
const dims={battle:[1536,2016],box:[474,1417]};
export function platinumCrop(sheet,box,cls='') {
 const [w,h]=dims[sheet];
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}" aria-hidden="true" preserveAspectRatio="xMidYMid slice"><image href="${platinum[sheet]}" width="${w}" height="${h}"/></svg>`;
}
// CSS SVG images cannot reliably load a nested PNG in Android WebView.
// Extract display viewports from the unchanged bundled sheet at runtime.
export async function installPlatinum() {
 const style=document.documentElement.style;
 for(const sheet of ['box','battle']) {
  const source=new Image();source.src=platinum[sheet];
  try { await source.decode(); } catch { continue; }
  const crops=sheet==='box'?[['--pt-paper',2,238,152,112],['--pt-night-paper',2,356,152,112],['--pt-team-paper',318,356,152,112]]:[['--pt-battle',0,16,256,152]];
  for(const [key,x,y,w,h] of crops) {
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   const context=canvas.getContext('2d');if(!context)continue;
   context.drawImage(source,x,y,w,h,0,0,w,h);
   style.setProperty(key,`url("${canvas.toDataURL('image/png')}")`);
  }
 }
}
export function platinumScene(theme='classic') {
 const rect={classic:[0,16,256,152],sunrise:[256,16,256,152],coast:[0,184,256,152],night:[512,16,256,152],autumn:[256,520,256,152]}[theme]||[0,16,256,152];
 const plateX=theme==='night'?1336:theme==='sunrise'||theme==='autumn'?1080:824;
 return `${platinumCrop('battle',rect,'platinum-backdrop')}<div class="platinum-platform">${platinumCrop('battle',[plateX,16,144,48])}</div>`;
}
