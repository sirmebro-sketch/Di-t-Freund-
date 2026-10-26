"""Bundle original fan graphics and four short Gen-IV effects, with provenance.
Input: downloaded original files in a directory (no game ROM required).
Full sheets remain unedited; SVG viewports select scenes at runtime.
MP3 audio streams are copied without artwork/metadata; no music ripped.
"""
from pathlib import Path
import base64, hashlib, json, subprocess, sys, tempfile, zipfile
root=Path(__file__).resolve().parents[1]; source=Path(sys.argv[1]); assets={}; manifest=[]
for name,url,credit in [
 ('battle','https://www.spriters-resource.com/media/assets/17/18502.png?updated=1755472519','Sunday_Domeko'),
 ('box','https://www.spriters-resource.com/media/assets/17/18504.png?updated=1755472519','Dragoon')]:
 data=(source/f'platinum-{name}.png').read_bytes();assert data.startswith(b'\x89PNG')
 assets[name]='data:image/png;base64,'+base64.b64encode(data).decode()
 manifest.append({'id':name,'url':url,'credit':credit,'sha256':hashlib.sha256(data).hexdigest(),'handling':'Unedited original PNG sheet; display through SVG viewports.'})
assets['sfx']={}
archive=source/'platinum-sfx.zip'
with zipfile.ZipFile(archive) as z, tempfile.TemporaryDirectory() as temp:
 for key,name in [('hit','Hit Normal Damage.mp3'),('heal','In-Battle Heal HP Restore.mp3'),('recall','In-Battle Recall Switch Pokeball.mp3'),('bubble','Bubble.mp3')]:
  original=z.read(name); inp=Path(temp)/'input.mp3';out=Path(temp)/f'{key}.mp3';inp.write_bytes(original)
  subprocess.run(['ffmpeg','-v','error','-i',str(inp),'-map','0:a:0','-c:a','copy','-map_metadata','-1',str(out)],check=True)
  data=out.read_bytes();duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(out)]))
  assert duration<5
  assets['sfx'][key]='data:audio/mpeg;base64,'+base64.b64encode(data).decode()
  manifest.append({'id':key,'game':'Pokémon Diamond/Pearl','archiveUrl':'https://sounds.spriters-resource.com/media/assets/425/428218.zip?updated=1755546054','archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'file':name,'credit':'BellBlitzKing','originalSha256':hashlib.sha256(original).hexdigest(),'sha256':hashlib.sha256(data).hexdigest(),'seconds':duration,'handling':'Audio stream copied; artwork and metadata removed.'})
(root/'app/src/main/assets/www/platinum-assets.js').write_text('// Original Pokémon fan assets; sources and rights: docs/PLATINUM-ASSETS.json\nexport const platinum='+json.dumps(assets,separators=(',',':'))+';\n')
(root/'docs/PLATINUM-ASSETS.json').write_text(json.dumps({'rights':'Pokémon © Nintendo / Creatures / GAME FREAK. Fan project; no free licence or affiliation claimed.','assets':manifest,'music':'Original procedural compositions in atmosphere.js; not copied Pokémon soundtrack recordings.'},indent=2,ensure_ascii=False)+'\n')
print([(m['id'],m.get('seconds')) for m in manifest])
