"""Build code-native SVG clipping masks for the bundled HGSS menu sheet.
The original raster/source hash stays unchanged. Remove only the exterior matte,
white contour and gray sheet shadow; enclosed white details remain visible.
"""
from pathlib import Path
from collections import deque
from PIL import Image
from io import BytesIO
import base64, hashlib, json
root=Path(__file__).resolve().parents[1]
www=root/'app/src/main/assets/www'
assets=json.loads((www/'gen4-assets.js').read_text().split('export const gen4=')[1].rstrip(';\n'))
raw=base64.b64decode(assets['menu'].split(',')[1])
assert hashlib.sha256(raw).hexdigest()=='e3bdc6f32f43816e9cffe953a21a3bb75cee2a70b89d6d97d8c9f8b22574abb4'
im=Image.open(BytesIO(raw)).convert('RGB')
matte={(0,128,128),(248,248,248),(189,189,189)}
css=['/* Generated SVG masks: python3 scripts/build-menu-masks.py. Original sheet unchanged. */']
for name,x0 in [('home',72),('food',136),('train',200),('journey',104),('profile',40)]:
 pixels=[[im.getpixel((x0+x,6+y)) for x in range(24)] for y in range(24)]
 removed=set(); q=deque((x,y) for y in range(24) for x in range(24) if (x in (0,23) or y in (0,23)) and pixels[y][x] in matte)
 while q:
  x,y=q.popleft()
  if (x,y) in removed:continue
  removed.add((x,y))
  for a,b in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
   if 0<=a<24 and 0<=b<24 and (a,b) not in removed and pixels[b][a] in matte:q.append((a,b))
 paths=[]
 for y in range(24):
  x=0
  while x<24:
   if (x,y) in removed:x+=1;continue
   start=x
   while x<24 and (x,y) not in removed:x+=1
   paths.append(f'M{start} {y}h{x-start}v1h{start-x}z')
 svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="'+''.join(paths)+'"/></svg>'
 (www/f'menu-mask-{name}.svg').write_text(svg+'\n')
 css.append(f'.ds-{name}{{background-position:-{x0}px -6px;-webkit-mask-image:url("menu-mask-{name}.svg");mask-image:url("menu-mask-{name}.svg")}}')
css.append('.ds-icon{transform:scale(1.2);-webkit-mask-size:24px 24px;mask-size:24px 24px;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}')
(www/'menu-icons.css').write_text('\n'.join(css)+'\n')
print('5 transparent SVG masks generated; original sheet preserved.')
