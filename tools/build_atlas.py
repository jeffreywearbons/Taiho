"""
Runs every art script and packs the results into src/assets/atlas.png + atlas.json.
Usage: python3 tools/build_atlas.py   (needs Pillow)
"""
import os, json, runpy
from PIL import Image

TOOLS = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(TOOLS, 'out')
ASSETS = os.path.join(TOOLS, '..', 'src', 'assets')
os.makedirs(OUT, exist_ok=True)

for script in ('sprites.py', 'konbini.py', 'bonsai.py', 'boutique.py', 'dept.py'):
    runpy.run_path(os.path.join(TOOLS, script), run_name='__main__')
chars = runpy.run_path(os.path.join(TOOLS, 'characters.py'), run_name='build')['build']()

def load(p): return Image.open(p).convert('RGBA')
items = []
for key, im in chars.items(): items.append((key, im))
def lift_leaves(im):
    im2 = Image.new('RGBA', im.size, (0, 0, 0, 0)); src = im.load(); dst = im2.load()
    for y in range(im.height):
        for x in range(im.width):
            c = src[x, y]
            if not c[3]: continue
            dst[x, y - 1 if (y < 11 and y > 0) else y] = c
    return im2
bonsai = load(os.path.join(OUT, 'bonsai.png'))
items.append(('bonsai_0', bonsai)); items.append(('bonsai_1', lift_leaves(bonsai)))
items.append(('bonsai_portrait', load(os.path.join(OUT, 'bonsai_portrait.png'))))
# Bonsai in yellow and brown while the trainer costume is worn
def electric(im):
    im = im.copy(); px = im.load()
    swap = {(86,170,96): (250,210,50), (58,128,72): (200,150,30), (140,210,120): (255,240,130), (70,110,170): (120,70,40), (50,80,130): (90,50,30), (120,160,210): (160,110,60), (120,220,255): (255,80,80)}
    for y in range(im.height):
        for x in range(im.width):
            c = px[x, y]
            if c[3] and c[:3] in swap: px[x, y] = swap[c[:3]] + (255,)
    return im
items.append(('bonsai_pika_0', electric(bonsai))); items.append(('bonsai_pika_1', electric(lift_leaves(bonsai))))
items.append(('bonsai_pika_portrait', electric(load(os.path.join(OUT, 'bonsai_portrait.png')))))
for n in ('scoping', 'setting_up', 'in_progress', 'finishing', 'hint'):
    items.append(('icon_' + n, load(os.path.join(OUT, n + '.png'))))
kdir = os.path.join(OUT, 'konbini')
for f in sorted(os.listdir(kdir)):
    if f.endswith('.png') and not any(t in f for t in ('_stripe', '_blue', '_green', '_red', '_yellow')):
        items.append(('tile_' + f[:-4], load(os.path.join(kdir, f))))
bdir = os.path.join(OUT, 'boutique')
for f in sorted(os.listdir(bdir)):
    if f.endswith('.png'): items.append(('tile_' + f[:-4], load(os.path.join(bdir, f))))
ddir = os.path.join(OUT, 'dept')
for f in sorted(os.listdir(ddir)):
    if f.endswith('.png'): items.append((('' if f.startswith('obs_') else 'tile_') + f[:-4], load(os.path.join(ddir, f))))
# obstacles
from PIL import ImageDraw
bag = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); d = ImageDraw.Draw(bag)
d.rectangle((3, 6, 12, 14), fill=(232, 93, 117), outline=(26, 26, 46)); d.rectangle((5, 3, 10, 6), outline=(26, 26, 46)); d.rectangle((6, 9, 9, 11), fill=(255, 255, 255))
items.append(('obs_bag', bag))
box = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); d = ImageDraw.Draw(box)
d.rectangle((1, 3, 14, 14), fill=(196, 150, 90), outline=(26, 26, 46)); d.line((1, 8, 14, 8), fill=(26, 26, 46)); d.line((8, 3, 8, 14), fill=(140, 100, 55))
items.append(('obs_box', box))

W = 256; x = y = rowh = 0; frames = {}
atlas = Image.new('RGBA', (W, 1024), (0, 0, 0, 0))
for n, im in items:
    if x + im.width > W: x = 0; y += rowh; rowh = 0
    atlas.paste(im, (x, y)); frames[n] = [x, y, im.width, im.height]; x += im.width; rowh = max(rowh, im.height)
atlas = atlas.crop((0, 0, W, y + rowh))
atlas.save(os.path.join(ASSETS, 'atlas.png'))
json.dump(frames, open(os.path.join(ASSETS, 'atlas.json'), 'w'))
print('atlas', atlas.size, len(frames), 'frames')
