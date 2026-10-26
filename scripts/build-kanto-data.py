"""Build a small Gen-I-only data snapshot from PokeAPI CSV, with original German UI text."""
import csv,io,json,pathlib,urllib.request,hashlib
from concurrent.futures import ThreadPoolExecutor
root=pathlib.Path(__file__).resolve().parents[1]
base='https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/'
files=['pokemon_species.csv','pokemon_species_names.csv','pokemon_types.csv','type_names.csv','pokemon_evolution.csv','item_names.csv']
def download(name):
 b=urllib.request.urlopen(urllib.request.Request(base+name,headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read()
 return name,list(csv.DictReader(io.StringIO(b.decode()))),hashlib.sha256(b).hexdigest()
rows=list(ThreadPoolExecutor(max_workers=4).map(download,files));data={n:r for n,r,h in rows}
names={int(r['pokemon_species_id']):r['name'] for r in data['pokemon_species_names.csv'] if r['local_language_id']=='6'}
types={int(r['type_id']):r['name'] for r in data['type_names.csv'] if r['local_language_id']=='6'}
items={r['item_id']:r['name'] for r in data['item_names.csv'] if r['local_language_id']=='6'}
sp={int(r['id']):r for r in data['pokemon_species.csv'] if int(r['id'])<=151}
pt={i:[] for i in sp}
for r in data['pokemon_types.csv']:
 i=int(r['pokemon_id'])
 if i in pt:pt[i].append(types[int(r['type_id'])])
# Restore Gen-I types (modern Fairy/Steel retypings do not belong to Kanto Gen I).
for i in [35,36,39,40]:pt[i]=['Normal']
pt[122]=['Psycho'];pt[81]=pt[82]=['Elektro']
evos={i:[] for i in sp}
for r in data['pokemon_evolution.csv']:
 target=int(r['evolved_species_id'])
 if target not in sp:continue
 prev=sp[target]['evolves_from_species_id']
 if not prev or int(prev)>151:continue
 trigger=int(r['evolution_trigger_id']);level=int(r['minimum_level'] or (32 if trigger==2 else 24))
 note=('Level '+str(level)) if trigger==1 else 'Tausch' if trigger==2 else items.get(r['trigger_item_id'],'Entwicklungsstein')
 entry={'to':target,'level':level,'original':note,'kind':'level' if trigger==1 else 'trade' if trigger==2 else 'stone'}
 if entry not in evos[int(prev)]:evos[int(prev)].append(entry)
result={i:{'name':names[i],'slug':sp[i]['identifier'],'types':pt[i],'evolutions':evos[i],'special':i in [144,145,146,150,151]} for i in sp}
assert len(result)==151 and len(result[133]['evolutions'])==3
(root/'app/src/main/assets/www/kanto-data.js').write_text('// Gen-I-only PokeAPI snapshot. See docs/KANTO-DATA-SOURCES.json.\nexport const pokemon='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n')
(root/'docs/KANTO-DATA-SOURCES.json').write_text(json.dumps([{'url':base+n,'sha256':h} for n,r,h in rows],indent=2)+'\n')
print('Generated all 151 German names, Gen-I types and Kanto evolution branches.')
