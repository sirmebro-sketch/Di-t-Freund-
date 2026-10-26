"""Bundle Nationaldex base species, hatch counters and normal/shiny sprites offline."""
import csv,io,json,pathlib,urllib.request,hashlib,base64,time
from concurrent.futures import ThreadPoolExecutor,as_completed
root=pathlib.Path(__file__).resolve().parents[1];www=root/'app/src/main/assets/www';cache=root/'.national-cache';cache.mkdir(exist_ok=True)
provenance=[]
def fetch(url):
 p=cache/hashlib.sha256(url.encode()).hexdigest()
 if p.exists():return p.read_bytes()
 for attempt in range(4):
  try:
   b=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'FitDex-personal-offline-build'}),timeout=40).read();p.write_bytes(b);return b
  except Exception:
   if attempt==3:raise
   time.sleep(attempt+1)
def rows(name):
 url='https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/'+name;b=fetch(url);provenance.append({'url':url,'sha256':hashlib.sha256(b).hexdigest()});return list(csv.DictReader(io.StringIO(b.decode())))
sp={int(r['id']):r for r in rows('pokemon_species.csv')};names={int(r['pokemon_species_id']):r['name'] for r in rows('pokemon_species_names.csv') if r['local_language_id']=='6'}
types={int(r['type_id']):r['name'] for r in rows('type_names.csv') if r['local_language_id']=='6'};pt={i:[] for i in sp}
for r in rows('pokemon_types.csv'):
 i=int(r['pokemon_id'])
 if i in pt:pt[i].append(types[int(r['type_id'])])
evos={i:[] for i in sp}
for r in rows('pokemon_evolution.csv'):
 to=int(r['evolved_species_id']);prev=sp.get(to,{}).get('evolves_from_species_id')
 if not prev or int(prev)<=251 or to>max(sp):continue
 level=int(r['minimum_level'] or (32 if r['evolution_trigger_id']=='2' else 24));e={'to':to,'level':level,'kind':'level' if r['minimum_level'] else 'simplified','original':('Level '+str(level)+' (weitere Bedingungen möglich)') if r['minimum_level'] else 'Sonderbedingung (hier vereinfacht)'}
 if e not in evos[int(prev)]:evos[int(prev)].append(e)
result={i:{'name':names[i],'slug':r['identifier'],'types':pt[i],'evolutions':evos[i],'special':r['is_legendary']=='1' or r['is_mythical']=='1','generation':int(r['generation_id']),'hatchCycles':int(r['hatch_counter'] or 40)} for i,r in sp.items()}
(www/'national-data.js').write_text('// PokeAPI snapshot. Existing Gen-I/II evolution paths remain authoritative.\nexport const nationalSpecies='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n')
def sprite(task):
 i,shiny=task;folder='versions/generation-iv/heartgold-soulsilver/' if i<=493 else 'versions/generation-v/black-white/' if i<=649 else ''
 url='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+folder+('shiny/' if shiny else '')+str(i)+'.png';b=fetch(url)
 if not b.startswith(b'\x89PNG'):raise ValueError(url)
 return i,shiny,'data:image/png;base64,'+base64.b64encode(b).decode(),{'id':i,'shiny':shiny,'url':url,'sha256':hashlib.sha256(b).hexdigest()}
images=[]
with ThreadPoolExecutor(max_workers=12) as pool:
 futures=[pool.submit(sprite,(i,s)) for i in sp for s in [False,True]]
 for f in as_completed(futures):
  images.append(f.result())
  if len(images)%200==0:print('Sprites',len(images),'/',len(futures),flush=True)
for generation in range(1,10):
 a=[r for r in images if result[r[0]]['generation']==generation]
 (www/f'national-assets-{generation}.js').write_text('// Offline normal and shiny sprites. See docs/NATIONAL-EGG-SOURCES.json.\nexport const normal='+json.dumps({i:b for i,s,b,m in a if not s},separators=(',',':'))+';\nexport const shiny='+json.dumps({i:b for i,s,b,m in a if s},separators=(',',':'))+';\n')
u='https://raw.githubusercontent.com/pret/pokeheartgold/master/files/poketool/pokegra/otherpoke/egg/normal.png';b=fetch(u);provenance.append({'kind':'HGSS egg sheet','url':u,'sha256':hashlib.sha256(b).hexdigest()})
(www/'egg-assets.js').write_text('export const eggSheet="data:image/png;base64,'+base64.b64encode(b).decode()+'";\n')
(root/'docs/NATIONAL-EGG-SOURCES.json').write_text(json.dumps({'notice':'Unofficial fan project. Pokémon © Nintendo / Creatures / GAME FREAK. Later generations have no HGSS sprites; PokeAPI default sprites may include community sprites. Base species only, no alternate forms.','sources':provenance,'sprites':[m for i,s,b,m in sorted(images,key=lambda r:(r[0],r[1]))]},ensure_ascii=False,indent=2)+'\n')
print('DONE',len(sp),'species',len(images),'sprites',flush=True)
