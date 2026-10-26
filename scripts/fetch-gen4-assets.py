"""Bundle requested Gen-IV original fan assets offline, with source checksums."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request,json,hashlib,base64,time
root=Path(__file__).resolve().parents[1];www=root/'app/src/main/assets/www'
def get(u):
 for attempt in range(3):
  try:return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=35).read()
  except Exception:
   if attempt==2:raise

def one(id):
 u=f'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/{id}.png';b=get(u);assert b.startswith(b'\x89PNG');return str(id),'data:image/png;base64,'+base64.b64encode(b).decode(),{'id':id,'url':u,'sha256':hashlib.sha256(b).hexdigest()}
rows=list(ThreadPoolExecutor(max_workers=6).map(one,range(1,252)))
assets={i:b for i,b,m in rows};manifest=[m for i,b,m in rows]
for name,url in [('menu','https://www.spriters-resource.com/media/assets/25/27038.png?updated=1755472588'),('locations','https://www.spriters-resource.com/media/assets/26/28243.png?updated=1755472619')]:
 b=get(url);assert b.startswith(b'\x89PNG');assets[name]='data:image/png;base64,'+base64.b64encode(b).decode();manifest.append({'id':name,'url':url,'sha256':hashlib.sha256(b).hexdigest()});Path('/tmp/hgss-'+name+'.png').write_bytes(b)
(www/'gen4-assets.js').write_text('// Original Gen-IV fan assets. See docs/GEN4-ASSETS.json.\nexport const gen4='+json.dumps(assets,separators=(',',':'))+';\n')
(root/'docs/GEN4-ASSETS.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('251 Gen-IV Pokémon sprites plus HGSS menu and location sheets bundled.')
