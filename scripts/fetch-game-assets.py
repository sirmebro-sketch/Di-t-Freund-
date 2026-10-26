"""Fetch the specifically requested fan assets; never fetch at app runtime."""
import urllib.request,zipfile,io,wave,base64,json,hashlib,pathlib,subprocess
from concurrent.futures import ThreadPoolExecutor
root=pathlib.Path(__file__).resolve().parents[1]
names='bulbasaur ivysaur venusaur charmander charmeleon charizard squirtle wartortle blastoise caterpie metapod butterfree pidgey pidgeotto pidgeot pikachu raichu magikarp gyarados eevee vaporeon snorlax'.split()
ids=[1,2,3,4,5,6,7,8,9,10,11,12,16,17,18,25,26,129,130,133,134,143]
manifest=[]
def fetch(u):
 return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read()
def sprite(pair):
 id,name=pair;u=f'https://img.pokemondb.net/sprites/black-white/normal/{name}.png';b=fetch(u)
 assert b.startswith(b'\x89PNG');return str(id),'data:image/png;base64,'+base64.b64encode(b).decode(),{'id':str(id),'url':u,'sha256':hashlib.sha256(b).hexdigest()}
results=list(ThreadPoolExecutor(max_workers=5).map(sprite,zip(ids,names)))
assets={i:b for i,b,m in results};manifest.extend(m for i,b,m in results)
url='https://sounds.spriters-resource.com/media/assets/408/410769.zip?updated=1755537434'
z=zipfile.ZipFile(io.BytesIO(fetch(url)));sounds={}
for key,name in [('menu','PRESS_AB'),('open','START_MENU'),('capture','BALL_TOSS'),('hit','FAINT_THUD'),('level','LEVEL_UP'),('caught','CAUGHT_MON')]:
 original=z.read(f'Pokemon Red_Blue Sound Effects/SFX_{name}.wav')
 # Transcode the original short effect to mono Vorbis; no synthetic replacement.
 encoded=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i','pipe:0','-ac','1','-ar','22050','-c:a','libvorbis','-q:a','3','-f','ogg','pipe:1'],input=original,capture_output=True,check=True).stdout
 sounds[key]='data:audio/ogg;base64,'+base64.b64encode(encoded).decode()
 with wave.open(io.BytesIO(original)) as w:duration=w.getnframes()/w.getframerate()
 manifest.append({'id':key,'url':url,'file':f'SFX_{name}.wav','seconds':duration,'sha256':hashlib.sha256(original).hexdigest()})
(root/'app/src/main/assets/www/game-assets.js').write_text('// Requested fan assets. Attribution and original URLs: docs/GAME-ASSETS.json\nexport const sprites='+json.dumps(assets)+';\nexport const sounds='+json.dumps(sounds)+';\n')
(root/'docs/GAME-ASSETS.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Bundled {len(assets)} sprites and {len(sounds)} original short sound effects.')
