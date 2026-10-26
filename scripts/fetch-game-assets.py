"""Fetch the specifically requested fan assets; never fetch at app runtime."""
import urllib.request,zipfile,io,wave,base64,json,hashlib,pathlib,subprocess
from concurrent.futures import ThreadPoolExecutor
root=pathlib.Path(__file__).resolve().parents[1]
data=json.loads((root/'app/src/main/assets/www/kanto-data.js').read_text().split('export const pokemon=')[1].rstrip(';\n'))
ids=list(range(1,152))
names=[data[str(i)]['slug'] for i in ids]
manifest=[]
def fetch(u):
 return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read()
def sprite(pair):
 id,name=pair;u=f'https://img.pokemondb.net/sprites/black-white/normal/{name}.png'
 try:b=fetch(u)
 except Exception:
  u=f'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/{id}.png';b=fetch(u)
 assert b.startswith(b'\x89PNG');return str(id),'data:image/png;base64,'+base64.b64encode(b).decode(),{'id':str(id),'url':u,'sha256':hashlib.sha256(b).hexdigest()}
results=list(ThreadPoolExecutor(max_workers=5).map(sprite,zip(ids,names)))
assets={i:b for i,b,m in results};manifest.extend(m for i,b,m in results)
existing=(root/'app/src/main/assets/www/game-assets.js').read_text()
sounds=json.loads(existing.split('export const sounds=')[1].rstrip(';\n'))
manifest.extend(m for m in json.loads((root/'docs/GAME-ASSETS.json').read_text()) if 'seconds' in m)
(root/'app/src/main/assets/www/game-assets.js').write_text('// Requested fan assets. Attribution and original URLs: docs/GAME-ASSETS.json\nexport const sprites='+json.dumps(assets)+';\nexport const sounds='+json.dumps(sounds)+';\n')
(root/'docs/GAME-ASSETS.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Bundled {len(assets)} sprites and {len(sounds)} original short sound effects.')
