"""Append Gen-II species without changing legacy Kanto evolution paths or assets."""
import csv,io,json,pathlib,urllib.request,hashlib,base64
from concurrent.futures import ThreadPoolExecutor
root=pathlib.Path(__file__).resolve().parents[1];www=root/'app/src/main/assets/www'
base='https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/'
files=['pokemon_species.csv','pokemon_species_names.csv','pokemon_types.csv','type_names.csv','pokemon_evolution.csv','item_names.csv']
def fetch(url):return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read()
def download(name):
 b=fetch(base+name);return name,list(csv.DictReader(io.StringIO(b.decode()))),hashlib.sha256(b).hexdigest()
rows=list(ThreadPoolExecutor(max_workers=4).map(download,files));data={n:r for n,r,h in rows}
sp={int(r['id']):r for r in data['pokemon_species.csv'] if int(r['id'])<=251}
names={int(r['pokemon_species_id']):r['name'] for r in data['pokemon_species_names.csv'] if r['local_language_id']=='6'}
types={int(r['type_id']):r['name'] for r in data['type_names.csv'] if r['local_language_id']=='6'}
items={r['item_id']:r['name'] for r in data['item_names.csv'] if r['local_language_id']=='6'}
pt={i:[] for i in range(152,252)}
for r in data['pokemon_types.csv']:
 i=int(r['pokemon_id'])
 if i in pt:pt[i].append(types[int(r['type_id'])])
for i in [173,174,175,209,210]:pt[i]=['Normal']
pt[176]=['Normal','Flug'];pt[183]=pt[184]=['Wasser']
evos={i:[] for i in pt}
for r in data['pokemon_evolution.csv']:
 target=int(r['evolved_species_id'])
 if target not in sp:continue
 prev=sp[target]['evolves_from_species_id']
 if not prev or int(prev) not in evos:continue
 trigger=int(r['evolution_trigger_id']);level=int(r['minimum_level'] or (32 if trigger==2 else 24))
 note='Freundschaft' if r['minimum_happiness'] else ('Level '+str(level)) if trigger==1 else 'Tausch' if trigger==2 else items.get(r['trigger_item_id'],'Entwicklungsstein')
 if r['relative_physical_stats']:note+=' · abhängig von Angriff/Verteidigung'
 item={'to':target,'level':level,'original':note,'kind':'level' if r['minimum_level'] else 'simplified'}
 if item not in evos[int(prev)]:evos[int(prev)].append(item)
result={i:{'name':names[i],'slug':sp[i]['identifier'],'types':pt[i],'evolutions':evos[i],'special':i in [243,244,245,249,250,251]} for i in pt}
(www/'johto-data.js').write_text('// Gen-II snapshot, preserving Kanto paths. See docs/JOHTO-DATA-SOURCES.json.\nexport const pokemon='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n')
(root/'docs/JOHTO-DATA-SOURCES.json').write_text(json.dumps([{'url':base+n,'sha256':h} for n,r,h in rows],indent=2)+'\n')
def sprite(id):
 url=f'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/{id}.png';b=fetch(url);assert b.startswith(b'\x89PNG')
 return str(id),'data:image/png;base64,'+base64.b64encode(b).decode(),{'id':id,'url':url,'sha256':hashlib.sha256(b).hexdigest()}
images=list(ThreadPoolExecutor(max_workers=4).map(sprite,pt))
(www/'johto-assets.js').write_text('// Original sprites, bundled offline. See docs/JOHTO-ASSETS.json.\nexport const sprites='+json.dumps({i:b for i,b,m in images})+';\n')
(root/'docs/JOHTO-ASSETS.json').write_text(json.dumps([m for i,b,m in images],indent=2)+'\n')
print('Generated 100 German Gen-II species and bundled 100 sprites; Kanto unchanged.')
