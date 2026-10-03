from PIL import Image
import os, json
OUT=os.path.dirname(os.path.abspath(__file__))
def load(p): return Image.open(os.path.join(OUT,p)).convert('RGBA')
frames={}
# characters (civilian hero was overwritten by vigilante in 'hero.png'); regenerate from sprites.py maps
import importlib.util
spec=importlib.util.spec_from_file_location('sp',os.path.join(OUT,'sprites.py')); sp=importlib.util.module_from_spec(spec); spec.loader.exec_module(sp)
chars={'hero':sp.chars['Hero (civilian)'],'hero_vig':sp.chars['Hero (full vigilante)'],'perv':sp.chars['Perv'],'target':sp.chars['Target shopper']}
def swap(img,mapping):
    im=img.copy(); px=im.load()
    for y in range(im.height):
        for x in range(im.width):
            c=px[x,y]
            if c[3] and c[:3] in mapping: px[x,y]=mapping[c[:3]]+(255,)
    return im
G=(74,144,217); g=(47,108,179); H=(43,43,58); h=(120,70,40); D=(200,60,70)
chars['shopper1']=swap(chars['hero'],{G:(90,180,120),g:(58,128,72),H:(120,70,40)})
chars['shopper2']=swap(chars['hero'],{G:(240,160,60),g:(200,120,40),H:(240,130,170)})
chars['shopper3']=swap(chars['target'],{h:(43,43,58),D:(60,120,220)})
chars['perv2']=swap(chars['perv'],{(42,42,53):(90,90,110),(200,50,50):(60,120,220)})
chars['bonsai']=load('bonsai.png')
def walk(img):
    im=img.copy(); px=im.load(); w,h=im.size
    # step frame: left leg (x<8) rows 19.. shift up 1px
    for y in range(19,h):
        for x in range(0,8):
            px[x,y-1]=px[x,y] if y<h else (0,0,0,0)
    for x in range(0,8): px[x,h-1]=(0,0,0,0)
    return im
items=[]
for n,im in chars.items():
    items.append((n+'_0',im)); items.append((n+'_1',walk(im)))
items.append(('bonsai_portrait',load('bonsai_portrait.png')))
for n in ['scoping','setting_up','in_progress','finishing','hint']:
    items.append(('icon_'+n,load(n+'.png')))
for f in sorted(os.listdir(os.path.join(OUT,'konbini'))):
    if f.endswith('.png') and not any(t in f for t in ['_stripe','_blue','_green','_red','_yellow']):
        items.append(('tile_'+f[:-4],load('konbini/'+f)))
# hero civ overworld with different hoodie for 'hero_mask' (tier 2 look): domino mask = darken eyes row
# obstacles: bag (16x16) and box (16x16)
from PIL import ImageDraw
bag=Image.new('RGBA',(16,16),(0,0,0,0)); d=ImageDraw.Draw(bag)
d.rectangle((3,6,12,14),fill=(232,93,117),outline=(26,26,46)); d.rectangle((5,3,10,6),outline=(26,26,46)); d.rectangle((6,9,9,11),fill=(255,255,255))
items.append(('obs_bag',bag))
box=Image.new('RGBA',(16,16),(0,0,0,0)); d=ImageDraw.Draw(box)
d.rectangle((1,3,14,14),fill=(196,150,90),outline=(26,26,46)); d.line((1,8,14,8),fill=(26,26,46)); d.line((8,3,8,14),fill=(140,100,55))
items.append(('obs_box',box))
# pack
W=256; x=y=0; rowh=0; atlas=Image.new('RGBA',(W,256),(0,0,0,0))
for n,im in items:
    if x+im.width>W: x=0; y+=rowh; rowh=0
    atlas.paste(im,(x,y)); frames[n]=[x,y,im.width,im.height]; x+=im.width; rowh=max(rowh,im.height)
atlas=atlas.crop((0,0,W,y+rowh)); atlas.save(os.path.join(OUT,'atlas.png'))
json.dump(frames,open(os.path.join(OUT,'atlas.json'),'w'))
print(atlas.size, len(frames))
