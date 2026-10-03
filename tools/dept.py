"""Map 3 tileset: a department store floor plus its back halls. Writes tools/out/dept/*.png"""
from PIL import Image, ImageDraw
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import konbini
OUT = os.path.join(HERE, 'out', 'dept'); os.makedirs(OUT, exist_ok=True)

P = dict(konbini.BASE)
P.update({
 'w': (238, 236, 232), 'v': (222, 220, 214), 'x': (210, 208, 200),   # marble floor
 'k': (226, 232, 240), 'j': (196, 204, 216),                         # wall, light blue-grey
 'y': (250, 240, 230), 'q': (224, 96, 140),
 'r': (120, 120, 230), 'o': (240, 160, 60), 'e': (90, 180, 120), 'i': (230, 60, 60), 'p': (240, 130, 170), 'l': (60, 60, 80),
 'c': (150, 150, 150), 'C': (120, 120, 120), 'h': (100, 100, 110),    # concrete hall
 'b': (196, 150, 90), 'B': (140, 100, 55),                            # crate wood
 't': (70, 70, 90), 'u': (176, 176, 190),
 'z': (255, 215, 70), 'Z': (232, 246, 255),
})
def parse(rows):
    rows = rows.strip('\n').split('\n'); img = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); px = img.load()
    for y, r in enumerate(rows):
        assert len(r) == 16, r
        for x, ch in enumerate(r):
            col = P[ch]
            if col: px[x, y] = col + (255,)
    return img

T = {}
T['floor_marble'] = """
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwxwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwxwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwxwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
vvvvvvvvvvvvvvvv
"""
T['wall_dept'] = """
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
kkkkkkkkkkkkkkkk
KKKKKKKKKKKKKKKK
jjjjjjjjjjjjjjjj
yyyyyyyyyyyyyyyy
KKKKKKKKKKKKKKKK
"""
T['cosmetics'] = """
................
.KKKKKKKKKKKKKK.
.KyyyyyyyyyyyyK.
.KyKpKrKoKeKiyK.
.KyKpKrKoKeKiyK.
.KyKKKKKKKKKKyK.
.KyyyyyyyyyyyyK.
.KKKKKKKKKKKKKK.
.KqqqqqqqqqqqqK.
.KqqqqqqqqqqqqK.
.KyyyyyyyyyyyyK.
.KqqqqqqqqqqqqK.
.KqqqqqqqqqqqqK.
.KKKKKKKKKKKKKK.
................
................
"""
T['shoes'] = """
................
KKKKKKKKKKKKKKKK
KuuuuuuuuuuuuuuK
KuKKKKuKKKKuKKuK
KuKiiKuKrrKuKeuK
KuKiKKuKrKKuKKuK
KuuuuuuuuuuuuuuK
KuKKKKuKKKKuKKuK
KuKooKuKppKuKluK
KuKoKKuKpKKuKKuK
KuuuuuuuuuuuuuuK
KKKKKKKKKKKKKKKK
.KuK........KuK.
.KuK........KuK.
.KKK........KKK.
................
"""
T['bags'] = """
................
KKKKKKKKKKKKKKKK
KyyyyyyyyyyyyyyK
KyKKKyKKKyKKKyyK
KyKpKyKrKyKoKyyK
KyKpKyKrKyKoKyyK
KyKpKyKrKyKoKyyK
KyKKKyKKKyKKKyyK
KyyyyyyyyyyyyyyK
KyKKKyKKKyKKKyyK
KyKeKyKiKyKlKyyK
KyKeKyKiKyKlKyyK
KyKKKyKKKyKKKyyK
KyyyyyyyyyyyyyyK
KKKKKKKKKKKKKKKK
................
"""
T['escalator'] = """
KKKKKKKKKKKKKKKK
KMMMMMMMMMMMMMMK
KMKKKKKKKKKKKKMK
KMKuuuuuuuuuuKMK
KMKttttttttttKMK
KMKuuuuuuuuuuKMK
KMKttttttttttKMK
KMKuuuuuuuuuuKMK
KMKttttttttttKMK
KMKuuuuuuuuuuKMK
KMKttttttttttKMK
KMKuuuuuuuuuuKMK
KMKKKKKKKKKKKKMK
KMMMMMMMMMMMMMMK
KKKKKKKKKKKKKKKK
KllllllllllllllK
"""
T['hall_floor'] = """
ccccccccccccccch
ccccccccccccccch
ccccCcccccccccch
ccccccccccccccch
ccccccccccccccch
ccccccccccccCcch
ccccccccccccccch
hhhhhhhhhhhhhhhh
ccccccccccccccch
ccccccccCcccccch
ccccccccccccccch
ccccccccccccccch
ccCcccccccccccch
ccccccccccccccch
ccccccccccccccch
hhhhhhhhhhhhhhhh
"""
T['hall_wall'] = """
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
KKKKKKKKKKKKKKKK
zzzzzzzzzzzzzzzz
KKKKKKKKKKKKKKKK
ttttttttttttttttt
"""[:-1].replace('ttttttttttttttttt', 'tttttttttttttttt')
T['stock_shelf'] = """
KKKKKKKKKKKKKKKK
KMMMMMMMMMMMMMMK
KMKKKKKKKKKKKKMK
KMKbbbKbbbKbbbMK
KMKbbbKbbbKbbbMK
KMKKKKKKKKKKKKMK
KMMMMMMMMMMMMMMK
KMKKKKKKKKKKKKMK
KMKbbbKbbbKbbbMK
KMKbbbKbbbKbbbMK
KMKKKKKKKKKKKKMK
KMMMMMMMMMMMMMMK
KMKKKKKKKKKKKKMK
KMKbbbKbbbKbbbMK
KMKbbbKbbbKbbbMK
KKKKKKKKKKKKKKKK
"""
T['arena_door'] = """
hhhhhhhhhhhhhhhh
hhhhhhhhhhhhhhhh
hKKKKKKKKKKKKKKh
hKzzzzzzzzzzzzKh
hKKKKKKKKKKKKKKh
hKttttttKttttttKh
"""  # placeholder, replaced below
T['arena_door'] = """
hhhhhhhhhhhhhhhh
hKKKKKKKKKKKKKKh
hKzzzzzzzzzzzzKh
hKKKKKKKKKKKKKKh
hKttttttKttttttKh
"""
T['arena_door'] = """
hhhhhhhhhhhhhhhh
hKKKKKKKKKKKKKKh
hKzzzzzzzzzzzzKh
hKKKKKKKKKKKKKKh
hKttttttKttttttK
hKttttttKttttttK
hKttttttKttttttK
hKttttttKttttttK
hKttttttKttttttK
hKttttttKttttttK
hKttttttKttttttK
hKttttttKttttttK
hKttttttKttttttK
hKttttttKttttttK
hKKKKKKKKKKKKKKK
hhhhhhhhhhhhhhhh
"""
T['storefront_dept'] = """
jjjjjjjjjjjjjjjj
kkkkkkkkkkkkkkkk
jjjjjjjjjjjjjjjj
kkkkkkkkkkkkkkkk
KKKKKKKKKKKKKKKK
KgGGGGGGKgGGGGGK
KGGGGGGGKGGGGGGK
KGGGGGGGKGGGGGGK
KgGGGGGGKgGGGGGK
KGGGGGGGKGGGGGGK
KGGGGGGGKGGGGGGK
KGGGGGGGKGGGGGGK
KGGGGGGGKGGGGGGK
KGGGGGGGKGGGGGGK
KKKKKKKKKKKKKKKK
MMMMMMMMMMMMMMMM
"""
T['door_dept'] = """
jjjjjjjjjjjjjjjj
kkkkkkkkkkkkkkkk
jjjjjjjjjjjjjjjj
kkkkkkkkkkkkkkkk
KKKKKKKKKKKKKKKK
KGGGGGGKKGGGGGGK
KgGGGGGKKGGGGGgK
KGGGGGGKKGGGGGGK
KGGGGGGKKGGGGGGK
KGGGGGGKKGGGGGGK
KGGGGGGKKGGGGGGK
KGGGGGGKKGGGGGGK
KGGGGGGKKGGGGGGK
KMMMMMMKKMMMMMMK
KKKKKKKKKKKKKKKK
dddddddddddddddd
"""
T['sign_dept'] = """
jjjjjjjjjjjjjjjj
kkkkkkkkkkkkkkkk
jjjjjjjjjjjjjjjj
kkkkkkkkkkkkkkkk
KKKKKKKKKKKKKKKK
KyyyyyyyyyyyyyyK
KyzzzzyyyyzzzzyK
KyzyyyyyyyyyyzyK
KyzyyyzzzzyyyzyK
KyzyyyzyyzyyyzyK
KyzyyyzzzzyyyzyK
KyzyyyyyyyyyyzyK
KyzzzzyyyyzzzzyK
KyyyyyyyyyyyyyyK
KKKKKKKKKKKKKKKK
KKKKKKKKKKKKKKKK
"""
for k, v in T.items(): parse(v).save(os.path.join(OUT, k + '.png'))
BLUE = ((60, 120, 200), (250, 240, 230), (60, 120, 200))
for k in ('counter', 'register'):
    konbini.parse(konbini.T[k], BLUE).save(os.path.join(OUT, k + '_dept.png'))
# crate obstacle (strength 2)
crate = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); d = ImageDraw.Draw(crate)
d.rectangle((0, 1, 15, 15), fill=(196, 150, 90), outline=(26, 26, 46))
d.line((0, 1, 15, 15), fill=(140, 100, 55)); d.line((15, 1, 0, 15), fill=(140, 100, 55))
d.rectangle((0, 1, 15, 3), fill=(160, 115, 65)); d.rectangle((0, 13, 15, 15), fill=(160, 115, 65))
crate.save(os.path.join(OUT, 'obs_crate.png'))
print('dept tiles ->', OUT)
