"""Map 2 tileset: a small fashion boutique. Writes tools/out/boutique/*.png"""
from PIL import Image
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import konbini  # reuse its parser, palette and themed counter tiles
OUT = os.path.join(HERE, 'out', 'boutique'); os.makedirs(OUT, exist_ok=True)

P = dict(konbini.BASE)
P.update({
 'w': (214, 180, 140), 'v': (196, 160, 120),   # wood floor
 'k': (250, 225, 232), 'j': (236, 200, 212),   # boutique wall pink
 'q': (224, 96, 140), 'Q': (200, 70, 120),     # curtain
 'y': (250, 240, 230),                         # cream
 'r': (120, 120, 230), 'o': (240, 160, 60), 'e': (90, 180, 120), 'i': (230, 60, 60),  # clothes
 'z': (190, 225, 245), 'Z': (232, 246, 255),   # mirror glass
 'b': (120, 90, 60),                           # table wood
 'l': (60, 60, 80),
})
def parse(rows, theme=None):
    return konbini.parse(rows, theme) if theme else _parse(rows)
def _parse(rows):
    rows = rows.strip('\n').split('\n'); img = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); px = img.load()
    for y, r in enumerate(rows):
        assert len(r) == 16, r
        for x, c in enumerate(r):
            col = P[c]
            if col: px[x, y] = col + (255,)
    return img

T = {}
T['floor_wood'] = """
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
vvvvvvvvvvvvvvvv
wwwvwwwwwwwvwwww
wwwvwwwwwwwvwwww
wwwvwwwwwwwvwwww
vvvvvvvvvvvvvvvv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
vvvvvvvvvvvvvvvv
wwwvwwwwwwwvwwww
wwwvwwwwwwwvwwww
wwwvwwwwwwwvwwww
vvvvvvvvvvvvvvvv
"""
T['wall_pink'] = """
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
T['fitting_room'] = """
KKKKKKKKKKKKKKKK
KMMMMMMMMMMMMMMK
KqQqQqQqQqQqQqQK
KqQqQqQqQqQqQqQK
KqQqQqQqQqQqQqQK
KqQqQqQqQqQqQqQK
KqQqQqQqQqQqQqQK
KqQqQqQqQqQqQqQK
KqQqQqQqQqQqQqQK
KqQqQqQqQqQqQqQK
KqQqQqQqQqQqQqQK
KqQqQqQqQqQqQqQK
KqQqQqQqQqQqQqQK
KqqqqqqqqqqqqqqK
KKKKKKKKKKKKKKKK
KllllllllllllllK
"""
T['mannequin'] = """
......KKKK......
.....KyyyyK.....
.....KyyyyK.....
......KyyK......
....KKKrrKKK....
...KrrrrrrrrK...
...KrrKrrrrKrK..
...KrrKrrrrKrK..
...KrrKrrrrKrK..
....KKrrrrKK....
.....KiiiiK.....
.....KiiiiK.....
.....KiiiiK.....
......KMMK......
.....KMMMMK.....
.....KKKKKK.....
"""
T['display_table'] = """
................
KKKKKKKKKKKKKKKK
KbbbbbbbbbbbbbbK
KbKKKKKbKKKKKKbK
KbKrrrKbKooooKbK
KbKrrrKbKooooKbK
KbKKKKKbKKKKKKbK
KbKeeeKbKiiiiKbK
KbKeeeKbKiiiiKbK
KbKKKKKbKKKKKKbK
KbbbbbbbbbbbbbbK
KKKKKKKKKKKKKKKK
.KbK........KbK.
.KbK........KbK.
.KKK........KKK.
................
"""
T['mirror'] = """
KKKKKKKKKKKKKKKK
KMMMMMMMMMMMMMMK
KMKKKKKKKKKKKKMK
KMKZzzzzzzzzzKMK
KMKzZzzzzzzzzKMK
KMKzzZzzzzzzzKMK
KMKzzzzzzzzzzKMK
KMKzzzzzzZzzzKMK
KMKzzzzzzzZzzKMK
KMKzzzzzzzzZzKMK
KMKzzzzzzzzzzKMK
KMKzzzzzzzzzzKMK
KMKKKKKKKKKKKKMK
KMMMMMMMMMMMMMMK
KKKKKKKKKKKKKKKK
KllllllllllllllK
"""
T['rack_clothes'] = """
KKKKKKKKKKKKKKKK
KMMMMMMMMMMMMMMK
KMKKKKKKKKKKKKMK
KMKrKoKeKiKrKoMK
KMKrKoKeKiKrKoMK
KMKrKoKeKiKrKoMK
KMKrKoKeKiKrKoMK
KMKrKoKeKiKrKoMK
KMKrKoKeKiKrKoMK
KMKrKoKeKiKrKoMK
KMKKKKKKKKKKKKMK
KMMMMMMMMMMMMMMK
.KM..........MK.
.KM..........MK.
.KK..........KK.
................
"""
T['storefront_boutique'] = """
qyqyqyqyqyqyqyqy
qyqyqyqyqyqyqyqy
yqyqyqyqyqyqyqyq
yqyqyqyqyqyqyqyq
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
T['door_boutique'] = """
qyqyqyqyqyqyqyqy
qyqyqyqyqyqyqyqy
yqyqyqyqyqyqyqyq
yqyqyqyqyqyqyqyq
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
T['sign_boutique'] = """
qyqyqyqyqyqyqyqy
qyqyqyqyqyqyqyqy
yqyqyqyqyqyqyqyq
yqyqyqyqyqyqyqyq
KKKKKKKKKKKKKKKK
KyyyyyyyyyyyyyyK
KyyqqyyyyyyqqyyK
KyqqqqyyyyqqqqyK
KyqqqqqyyqqqqqyK
KyyqqqqqqqqqqyyK
KyyyqqqqqqqqyyyK
KyyyyqqqqqqyyyyK
KyyyyyqqqqyyyyyK
KyyyyyyqqyyyyyyK
KyyyyyyyyyyyyyyK
KKKKKKKKKKKKKKKK
"""
for k, v in T.items(): _parse(v).save(os.path.join(OUT, k + '.png'))
# counter and register in a pink theme via the konbini templates
PINK = ((224, 96, 140), (250, 240, 230), (224, 96, 140))
for k in ('counter', 'register'):
    konbini.parse(konbini.T[k], PINK).save(os.path.join(OUT, k + '_boutique.png'))
print('boutique tiles ->', OUT)
