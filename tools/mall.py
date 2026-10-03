"""Maps 4+ tilesets: an electronics store and a shopping mall (also used by the procedural mega malls).
Writes tools/out/mall/*.png"""
from PIL import Image, ImageDraw
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import konbini
OUT = os.path.join(HERE, 'out', 'mall'); os.makedirs(OUT, exist_ok=True)

P = dict(konbini.BASE)
P.update({
 # electronics
 'w': (228, 232, 238), 'v': (205, 210, 220),                           # tech floor
 'k': (244, 244, 248), 'j': (214, 216, 226),                           # wall
 'Z': (120, 200, 255), 'z': (60, 140, 220), 'l': (40, 40, 52),         # screens, bezel
 'i': (230, 60, 60), 'y': (255, 215, 70),                              # brand red / yellow
 'q': (236, 240, 244), 'r': (120, 120, 230), 'e': (90, 180, 120), 'o': (240, 160, 60), 'p': (240, 130, 170),
 'b': (196, 150, 90), 'B': (140, 100, 55),                             # wood
 'c': (150, 150, 150), 'C': (120, 120, 120), 'h': (100, 100, 110),
 # mall
 'Y': (246, 238, 222), 'X': (226, 214, 192),                           # beige mall floor
 't': (120, 190, 170), 'T': (80, 150, 130),                            # teal partitions
 'E': (60, 150, 80), 'D': (40, 110, 60), 'a': (150, 200, 100),         # plants
 'A': (90, 160, 230), 'S': (170, 210, 240),                            # water
 'n': (255, 240, 180),
})
def parse(rows):
    rows = rows.strip('\n').split('\n'); img = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); px = img.load()
    assert len(rows) == 16, len(rows)
    for y, r in enumerate(rows):
        assert len(r) == 16, r
        for x, ch in enumerate(r):
            col = P[ch]
            if col: px[x, y] = col + (255,)
    return img

T = {}
# ---------------- electronics store ----------------
T['floor_elec'] = """
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
vvvvvvvvvvvvvvvv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
wwwwwwwwwwwwwwwv
vvvvvvvvvvvvvvvv
"""
T['wall_elec'] = """
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
iiiiiiiiiiiiiiii
iiiiiiiiiiiiiiii
jjjjjjjjjjjjjjjj
KKKKKKKKKKKKKKKK
hhhhhhhhhhhhhhhh
"""
T['tv_wall'] = """
KKKKKKKKKKKKKKKK
KllllllKKllllllK
KlZZZZlKKlzzzzlK
KlZzZZlKKlzZzzlK
KlZZZZlKKlzzzzlK
KllllllKKllllllK
KKKKKKKKKKKKKKKK
KllllllKKllllllK
KlzzzzlKKlZZZZlK
KlzzZzlKKlZZzZlK
KlzzzzlKKlZZZZlK
KllllllKKllllllK
KKKKKKKKKKKKKKKK
KqqqqqqqqqqqqqqK
KKKKKKKKKKKKKKKK
KhhhhhhhhhhhhhhK
"""
T['phone_counter'] = """
KKKKKKKKKKKKKKKK
KgGGGGGGGGGGGGGK
KGlKGlKGlKGlKGGK
KGlZGlZGlZGlZGGK
KGlZGlZGlZGlZGGK
KGKKGKKGKKGKKGGK
KGGGGGGGGGGGGGGK
KGlKGlKGlKGlKGGK
KGlZGlZGlZGlZGGK
KGlZGlZGlZGlZGGK
KGKKGKKGKKGKKGGK
KgGGGGGGGGGGGGGK
KKKKKKKKKKKKKKKK
KqqqqqqqqqqqqqqK
KKKKKKKKKKKKKKKK
KhhhhhhhhhhhhhhK
"""
T['camera_case'] = """
KKKKKKKKKKKKKKKK
KllllllllllllllK
KlKKKlKKKlKKKllK
KlKMKlKMKlKMKllK
KlKKKlKKKlKKKllK
KllllllllllllllK
KlKKKlKKKlKKKllK
KlKMKlKMKlKMKllK
KlKKKlKKKlKKKllK
KllllllllllllllK
KlnnnlnnnlnnnllK
KllllllllllllllK
KKKKKKKKKKKKKKKK
KqqqqqqqqqqqqqqK
KKKKKKKKKKKKKKKK
KhhhhhhhhhhhhhhK
"""
T['pc_desk'] = """
KKKKKKKKKKKKKKKK
KlllllKKKlllllKK
KlZZZlKKKlZZZlKK
KlZZZlKKKlZZZlKK
KlllllKKKlllllKK
KKKlKKKKKKKlKKKK
KbbbbbbbbbbbbbbK
KbBBBBbbbBBBBbbK
KbbbbbbbbbbbbbbK
KKKKKKKKKKKKKKKK
KlllllKKKlllllKK
KlZZZlKKKlZZZlKK
KlllllKKKlllllKK
KbbbbbbbbbbbbbbK
KKKKKKKKKKKKKKKK
KhhhhhhhhhhhhhhK
"""
T['speakers'] = """
KKKKKKKKKKKKKKKK
KllllllKKllllllK
KlKMMKlKKlKMMKlK
KlMKKMlKKlMKKMlK
KlKMMKlKKlKMMKlK
KllllllKKllllllK
KlKMMKlKKlKMMKlK
KlMKKMlKKlMKKMlK
KlKMMKlKKlKMMKlK
KllllllKKllllllK
KlKKKKlKKlKKKKlK
KlKyyKlKKlKyyKlK
KllllllKKllllllK
KKKKKKKKKKKKKKKK
KhhhhhhhhhhhhhhK
KKKKKKKKKKKKKKKK
"""
# ---------------- mall ----------------
T['floor_mall'] = """
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
XXXXXXXXXXXXXXXX
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
YYYYYYYXYYYYYYYX
XXXXXXXXXXXXXXXX
"""
T['wall_mall'] = """
qqqqqqqqqqqqqqqq
qqqqqqqqqqqqqqqq
qqqqqqqqqqqqqqqq
qqqqqqqqqqqqqqqq
qqqqqqqqqqqqqqqq
qqqqqqqqqqqqqqqq
qqqqqqqqqqqqqqqq
qqqqqqqqqqqqqqqq
qqqqqqqqqqqqqqqq
qqqqqqqqqqqqqqqq
tttttttttttttttt
TTTTTTTTTTTTTTTT
jjjjjjjjjjjjjjjj
jjjjjjjjjjjjjjjj
KKKKKKKKKKKKKKKK
hhhhhhhhhhhhhhhh
"""
# glass partition between shops inside the mall
T['partition'] = """
KtttttttttttttTK
KgGGGGGGGGGGGGTK
KGGGGGGGGGGGGGTK
KGGGGGGGGGGGGGTK
KgGGGGGGGGGGGGTK
KGGGGGGGGGGGGGTK
KGGGGGGGGGGGGGTK
KtttttttttttttTK
KgGGGGGGGGGGGGTK
KGGGGGGGGGGGGGTK
KGGGGGGGGGGGGGTK
KgGGGGGGGGGGGGTK
KGGGGGGGGGGGGGTK
KtttttttttttttTK
KKKKKKKKKKKKKKKK
hhhhhhhhhhhhhhhh
"""
T['planter'] = """
................
.....aEEa.......
...aEEDEEEa.....
..aEEDEEEDEEa...
..EEDEEEEEEDE...
..aEEEDEEEDEa...
...aEEEEEEEa....
....KKKKKKKK....
....KbbbbbbK....
....KbBBBBbK....
....KbbbbbbK....
....KBBBBBBK....
....KKKKKKKK....
................
................
................
"""
T['bench'] = """
................
................
................
.KKKKKKKKKKKKKK.
.KbbbbbbbbbbbbK.
.KBBBBBBBBBBBBK.
.KbbbbbbbbbbbbK.
.KKKKKKKKKKKKKK.
.KbbbbbbbbbbbbK.
.KBBBBBBBBBBBBK.
.KKKKKKKKKKKKKK.
..KK........KK..
..KK........KK..
..KK........KK..
................
................
"""
T['kiosk'] = """
.KKKKKKKKKKKKKK.
KiiWWiiWWiiWWiiK
KiiWWiiWWiiWWiiK
.KKKKKKKKKKKKKK.
..KnnnnnnnnnnK..
..KnoonppnaanK..
..KnoonppnaanK..
..KnnnnnnnnnnK..
..KKKKKKKKKKKK..
..KWWWWWWWWWWK..
..KWWWiiiiWWWK..
..KWWWWWWWWWWK..
..KKKKKKKKKKKK..
..KhhhhhhhhhhK..
..KKKKKKKKKKKK..
................
"""
T['fountain'] = """
.....KKKKKK.....
...KKuuuuuuKK...
..KuSSSAAASSuK..
.KuSAAAASAAAASuK
.KuAASASSSASAAuK
KuSAASAgSSSAASuK
KuAASSSSASSSAAuK
KuSAAASSSAAASSuK
KuAASSAASSAASAuK
.KuAASSSSSSAAuK.
.KuSAAASAAAASuK.
..KuSSSSSSSSuK..
...KKuuuuuuKK...
.....KKKKKK.....
................
................
"""
T['gacha'] = """
KKKKKKKKKKKKKKKK
KiiiiiiiiiiiiiiK
KiKKKKKKKKKKKKiK
KiKgGGGGGGGGGKiK
KiKGoGpGaGyGLKiK
KiKGLGyGoGpGaKiK
KiKGaGpGLGoGyKiK
KiKKKKKKKKKKKKiK
KiiiiiiiiiiiiiiK
KiiiKKKKiiiiiiiK
KiiiKyyKiiiiiiiK
KiiiKKKKiiiiiiiK
KiiiiiiiiiiiiiiK
KKKKKKKKKKKKKKKK
KhhhhhhhhhhhhhhK
KKKKKKKKKKKKKKKK
"""
for k, v in T.items(): parse(v).save(os.path.join(OUT, k + '.png'))
# themed fronts, doors, signs, counters: red/white (electronics), teal/white/orange (mall)
ELEC = ((230, 60, 60), (255, 255, 255), (230, 60, 60))
MALL = ((80, 150, 130), (255, 255, 255), (240, 160, 60))
for name, theme in (('elec', ELEC), ('mall', MALL)):
    for k in ('storefront', 'door', 'sign', 'counter', 'register'):
        konbini.parse(konbini.T[k], theme).save(os.path.join(OUT, f'{k}_{name}.png'))
# vending machine obstacle (strength 3): a tipped-over drinks machine
vm = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); d = ImageDraw.Draw(vm)
d.rectangle((0, 2, 15, 14), fill=(230, 60, 60), outline=(26, 26, 46))
d.rectangle((2, 4, 9, 12), fill=(188, 224, 244), outline=(26, 26, 46))
for i, c in enumerate(((60, 120, 220), (90, 180, 120), (240, 160, 60), (240, 130, 170))): d.rectangle((3 + (i % 2) * 3, 5 + (i // 2) * 4, 4 + (i % 2) * 3, 7 + (i // 2) * 4), fill=c)
d.rectangle((11, 5, 13, 7), fill=(40, 40, 52)); d.rectangle((11, 9, 13, 11), fill=(40, 40, 52))
d.line((0, 15, 15, 15), fill=(100, 100, 110))
vm.save(os.path.join(OUT, 'obs_vending.png'))
print('mall tiles ->', OUT)
