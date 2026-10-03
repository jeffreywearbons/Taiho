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

for script in ('sprites.py', 'konbini.py', 'bonsai.py'):
    runpy.run_path(os.path.join(TOOLS, script), run_name='__main__')
chars = runpy.run_path(os.path.join(TOOLS, 'characters.py'), run_name='build')['build']()

def load(p): return Image.open(p).convert('RGBA')
items = []
for key, im in chars.items(): items.append((key, im))
items.append(('bonsai_0', load(os.path.join(OUT, 'bonsai.png'))))
items.append(('bonsai_portrait', load(os.path.join(OUT, 'bonsai_portrait.png'))))
for n in ('scoping', 'setting_up', 'in_progress', 'finishing', 'hint'):
    items.append(('icon_' + n, load(os.path.join(OUT, n + '.png'))))
kdir = os.path.join(OUT, 'konbini')
for f in sorted(os.listdir(kdir)):
    if f.endswith('.png') and not any(t in f for t in ('_stripe', '_blue', '_green', '_red', '_yellow')):
        items.append(('tile_' + f[:-4], load(os.path.join(kdir, f))))
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
