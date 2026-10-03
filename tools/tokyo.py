"""Floors 11-20: outdoor Tokyo districts. Streets, station stairs, a koban, back alleys, and one set of
street fixtures per district. Writes tools/out/tokyo/*.png"""
from PIL import Image, ImageDraw
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import konbini
OUT = os.path.join(HERE, 'out', 'tokyo'); os.makedirs(OUT, exist_ok=True)

P = dict(konbini.BASE)
P.update({
 'w': (214, 214, 206), 'v': (190, 190, 182),                 # sidewalk
 'z': (92, 92, 104), 'Z': (72, 72, 84),                      # night sidewalk
 'q': (232, 224, 204), 'Q': (210, 200, 176),                 # temple stone
 'A': (58, 58, 66), 'a': (70, 70, 78),                       # asphalt
 'y': (255, 215, 70), 'i': (230, 60, 60), 'o': (255, 150, 60), 'p': (240, 130, 170), 'c': (120, 120, 230), 'e': (90, 180, 120), 'l': (60, 120, 220),
 'n': (255, 240, 180), 'b': (196, 150, 90), 'B': (140, 100, 55), 'r': (170, 50, 40), 'R': (120, 30, 25),
 'k': (236, 230, 220), 'j': (200, 192, 180),                 # stone building
 'd': (40, 40, 52), 'D': (26, 26, 46), 'h': (100, 100, 110),
 'C': (120, 120, 120), 'x': (150, 150, 150),
 'S': (170, 210, 240), 'Z': (72, 72, 84),
 't': (120, 190, 170), 'T': (80, 150, 130),
 'E': (60, 150, 80), 'u': (176, 176, 190), 'm': (96, 96, 112),
})
def parse(rows):
    rows = rows.strip('\n').split('\n'); img = Image.new('RGBA', (16, 16), (0, 0, 0, 0)); px = img.load()
    assert len(rows) == 16, len(rows)
    for yy, r in enumerate(rows):
        assert len(r) == 16, r
        for xx, chh in enumerate(r):
            col = P[chh]
            if col: px[xx, yy] = col + (255,)
    return img

T = {}
T['sidewalk'] = """
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
vvvvvvvvvvvvvvvv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
vvvvvvvvvvvvvvvv
"""
T['sidewalk_night'] = T['sidewalk'].replace('w', 'z').replace('v', 'Z')
T['stone_plaza'] = T['sidewalk'].replace('w', 'q').replace('v', 'Q')
T['road'] = """
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAA
"""
T['crosswalk'] = """
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
AWWWAAAWWWAAAWWW
"""
# guardrail along the road (the storefront row outdoors)
T['guardrail'] = """
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
wwwwwwwvwwwwwwwv
KKKKKKKKKKKKKKKK
uuuuuuuuuuuuuuuu
KKKKKKKKKKKKKKKK
wKKwwwwvwwwwKKwv
wKKwwwwvwwwwKKwv
KKKKKKKKKKKKKKKK
uuuuuuuuuuuuuuuu
KKKKKKKKKKKKKKKK
wKKwwwwvwwwwKKwv
wKKwwwwvwwwwKKwv
wKKwwwwvwwwwKKwv
vvvvvvvvvvvvvvvv
"""
# station stairs: the IN / OUT of an outdoor map
T['stairs'] = """
KKKKKKKKKKKKKKKK
KyyyyyyyyyyyyyyK
KyKKKKKKKKKKKKyK
KyKuuuuuuuuuuKyK
KyKhhhhhhhhhhKyK
KyKuuuuuuuuuuKyK
KyKhhhhhhhhhhKyK
KyKuuuuuuuuuuKyK
KyKhhhhhhhhhhKyK
KyKmmmmmmmmmmKyK
KyKhhhhhhhhhhKyK
KyKddddddddddKyK
KyKKKKKKKKKKKKyK
KyyyyyyyyyyyyyyK
KKKKKKKKKKKKKKKK
hhhhhhhhhhhhhhhh
"""
# district sign (blue board on a post)
T['district_sign'] = """
KKKKKKKKKKKKKKKK
KllllllllllllllK
KlWWWWWWWWWWWWlK
KlWllWlWlWWlWWlK
KlWWWWWWWWWWWWlK
KlWlWWlWWlWlWWlK
KlWWWWWWWWWWWWlK
KllllllllllllllK
KKKKKKKKKKKKKKKK
.......KK.......
.......KK.......
.......KK.......
.......KK.......
.....KKKKKK.....
.....KKKKKK.....
................
"""
# koban (police box): the "shop" outdoors
T['koban'] = """
KKKKKKKKKKKKKKKK
KiiiiiiiiiiiiiiK
KiKKKKKKKKKKKKiK
KiKWWWWWWWWWWKiK
KiKWyyWWWWyyWKiK
KiKWWWWWWWWWWKiK
KiKKKKKKKKKKKKiK
KkkkkkkkkkkkkkkK
KkKKKkkkkkkKKKkK
KkKgGkkkkkkKlKkK
KkKGGkkkkkkKlKkK
KkKKKkkkkkkKKKkK
KkkkkkkkkkkkkkkK
KKKKKKKKKKKKKKKK
KhhhhhhhhhhhhhhK
KKKKKKKKKKKKKKKK
"""
T['koban_wall'] = """
KKKKKKKKKKKKKKKK
KkkkkkkkkkkkkkkK
KkkkkkkkkkkkkkkK
KkKKKKKkkKKKKKkK
KkKgGGGkkKgGGGkK
KkKGGGGkkKGGGGkK
KkKGGGGkkKGGGGkK
KkKKKKKkkKKKKKkK
KkkkkkkkkkkkkkkK
KkkkkkkkkkkkkkkK
KjjjjjjjjjjjjjjK
KjjjjjjjjjjjjjjK
KkkkkkkkkkkkkkkK
KKKKKKKKKKKKKKKK
KhhhhhhhhhhhhhhK
KKKKKKKKKKKKKKKK
"""
# station entrance: the elevator outdoors (green sign, stairs down)
T['station'] = """
KKKKKKKKKKKKKKKK
KEEEEEEEEEEEEEEK
KEWWWWWWWWWWWWEK
KEWEEWWEEWWEEWEK
KEWWWWWWWWWWWWEK
KEEEEEEEEEEEEEEK
KKKKKKKKKKKKKKKK
KuuuuuuuuuuuuuuK
KhhhhhhhhhhhhhhK
KuuuuuuuuuuuuuuK
KhhhhhhhhhhhhhhK
KmmmmmmmmmmmmmmK
KddddddddddddddK
KDDDDDDDDDDDDDDK
KKKKKKKKKKKKKKKK
hhhhhhhhhhhhhhhh
"""
# railing: the partition outdoors
T['railing'] = """
.KK..........KK.
.KK..........KK.
KKKKKKKKKKKKKKKK
uuuuuuuuuuuuuuuu
KKKKKKKKKKKKKKKK
.KK..........KK.
.KK..........KK.
.KK..........KK.
KKKKKKKKKKKKKKKK
uuuuuuuuuuuuuuuu
KKKKKKKKKKKKKKKK
.KK..........KK.
.KK..........KK.
.KK..........KK.
.KK..........KK.
................
"""
T['alley'] = """
CCCCCCCCCCCCCCCC
CCCCCCCxCCCCCCCC
CCCCCCCCCCCCCCCC
CCCxCCCCCCCCxCCC
CCCCCCCCCCCCCCCC
CCCCCCCCCCCCCCCC
CCCCCCCCCxCCCCCC
CCCCCCCCCCCCCCCC
CCxCCCCCCCCCCCCC
CCCCCCCCCCCCCCCC
CCCCCCxCCCCCCCCC
CCCCCCCCCCCCCCCC
CCCCCCCCCCCCxCCC
CCCCCCCCCCCCCCCC
CCCxCCCCCCCCCCCC
CCCCCCCCCCCCCCCC
"""
T['brick'] = """
rrrrrrrKrrrrrrrK
rrrrrrrKrrrrrrrK
rrrrrrrKrrrrrrrK
KKKKKKKKKKKKKKKK
rrrKrrrrrrrKrrrr
rrrKrrrrrrrKrrrr
rrrKrrrrrrrKrrrr
KKKKKKKKKKKKKKKK
rrrrrrrKrrrrrrrK
rrrrrrrKrrrrrrrK
rrrrrrrKrrrrrrrK
KKKKKKKKKKKKKKKK
rrrKrrrrrrrKrrrr
rrrKrrrrrrrKrrrr
rrrKrrrrrrrKrrrr
KKKKKKKKKKKKKKKK
"""
T['dumpster'] = """
................
.KKKKKKKKKKKKKK.
.KeeeeeeeeeeeeK.
.KeeeeeeeeeeeeK.
.KKKKKKKKKKKKKK.
.KeeeeeeeeeeeeK.
.KeeKKKKKKKKeeK.
.KeeeeeeeeeeeeK.
.KeeeeeeeeeeeeK.
.KeeeeeeeeeeeeK.
.KeeeeeeeeeeeeK.
.KKKKKKKKKKKKKK.
..KK........KK..
..KK........KK..
................
................
"""
T['bicycle'] = """
................
................
................
..........KK....
.........KdK....
.........K.K....
.....KKKKK.K....
....K....K.KK...
...K.....K.K.K..
..K..KKKKKKK..K.
.K.K.K.....K.K.K
.K..KK......KK.K
.K.K.K.....K.K.K
..K.K.......K.K.
...K.........K..
................
"""
# building fronts (the top strip and outer walls)
T['building_neon'] = """
dddddddddddddddd
dpppdddiiidddyyy
dpppdddiiidddyyy
dddddddddddddddd
dcccdddeeedddooo
dcccdddeeedddooo
dddddddddddddddd
dyyydddpppdddiii
dyyydddpppdddiii
dddddddddddddddd
ddddKKKKKKKKdddd
ddddKnnnnnnKdddd
ddddKnnnnnnKdddd
ddddKKKKKKKKdddd
KKKKKKKKKKKKKKKK
hhhhhhhhhhhhhhhh
"""
T['building_stone'] = """
kkkkkkkkkkkkkkkk
kjjjjkkjjjjkkjjj
kjSSjkkjSSjkkjSS
kjSSjkkjSSjkkjSS
kjjjjkkjjjjkkjjj
kkkkkkkkkkkkkkkk
kjjjjkkjjjjkkjjj
kjSSjkkjSSjkkjSS
kjSSjkkjSSjkkjSS
kjjjjkkjjjjkkjjj
kkkkkkkkkkkkkkkk
kkkKKKKKKKKKKkkk
kkkKnnnnnnnnKkkk
kkkKKKKKKKKKKkkk
KKKKKKKKKKKKKKKK
hhhhhhhhhhhhhhhh
"""
T['building_temple'] = """
KKKKKKKKKKKKKKKK
RRRRRRRRRRRRRRRR
rrrrrrrrrrrrrrrr
KKKKKKKKKKKKKKKK
rrKrrrrKKrrrrKrr
rrKrrrrKKrrrrKrr
rrKbbbbKKbbbbKrr
rrKbbbbKKbbbbKrr
rrKrrrrKKrrrrKrr
rrKrrrrKKrrrrKrr
KKKKKKKKKKKKKKKK
rrrrrrrrrrrrrrrr
rrrrrrrrrrrrrrrr
RRRRRRRRRRRRRRRR
KKKKKKKKKKKKKKKK
hhhhhhhhhhhhhhhh
"""
# ---------------- district fixtures ----------------
T['neon_sign'] = """
.....KKKKKK.....
....KppppppK....
....KpyyyypK....
....KppppppK....
....KpiiiipK....
....KppppppK....
....KpccccpK....
....KppppppK....
....KpeeeepK....
....KppppppK....
....KKKKKKKK....
......KKKK......
......KKKK......
......KKKK......
.....KKKKKK.....
................
"""
T['izakaya_lantern'] = """
.....KKKKK......
....KiiiiiK.....
...KiiiiiiiK....
...KiKiiiKiK....
...KiiiiiiiK....
...KiiKiiiiK....
...KiiiiiiiK....
....KiiiiiK.....
.....KKKKK......
......KKK.......
...KKKKKKKKK....
...KbbbbbbbK....
...KbnnnnnbK....
...KbbbbbbbK....
...KKKKKKKKK....
................
"""
T['hachiko'] = """
................
......KKK.......
.....KbbbK......
.....KbKbK......
......KbbK......
.....KbbbbKK....
....KbbbbbbbK...
....KbbbbbbbK...
....KbKbbbKbK...
....KKKKKKKKK...
...KxxxxxxxxxK..
...KxxxxxxxxxK..
...KCCCCCCCCCK..
...KxxxxxxxxxK..
...KKKKKKKKKKK..
................
"""
T['big_screen'] = """
KKKKKKKKKKKKKKKK
KddddddddddddddK
KdSSSSpppSSSSSdK
KdSSSpppppSSSSdK
KdSSSpppppSSSSdK
KdSSSSpppSSSSSdK
KdyyyyyyyyyyyydK
KdSSSSSSSSSSSSdK
KddddddddddddddK
KKKKKKKKKKKKKKKK
.....KKKKKK.....
.....KhhhhK.....
.....KhhhhK.....
.....KhhhhK.....
.....KKKKKK.....
................
"""
T['show_window'] = """
KKKKKKKKKKKKKKKK
KyyyyyyyyyyyyyyK
KKKKKKKKKKKKKKKK
KgGGGGGGGGGGGGGK
KGGGpGGGGGGcGGGK
KGGpppGGGGcccGGK
KGGGpGGGGGGcGGGK
KGGGGGGGGGGGGGGK
KGGyyyGGGGGeeGGK
KGGyyyGGGGGeeGGK
KGGGGGGGGGGGGGGK
KKKKKKKKKKKKKKKK
KkkkkkkkkkkkkkkK
KKKKKKKKKKKKKKKK
KhhhhhhhhhhhhhhK
KKKKKKKKKKKKKKKK
"""
T['street_clock'] = """
......KKKK......
.....KnnnnK.....
....KnnKKnnK....
....KnKnnKnK....
....KnnnKnnK....
....KnnnnnnK....
.....KnnnnK.....
......KKKK......
.......KK.......
.......KK.......
.......KK.......
.......KK.......
.....KKKKKK.....
....KKKKKKKK....
................
................
"""
T['paper_lantern'] = """
......KKKK......
.....KiiiiK.....
....KiiiiiiK....
...KiiKiiKiiK...
...KiiiiiiiiK...
...KiKiiiiKiK...
...KiiiiiiiiK...
...KiiKiiKiiK...
....KiiiiiiK....
.....KiiiiK.....
......KKKK......
.......KK.......
.......KK.......
......KKKK......
.....KKKKKK.....
................
"""
T['nakamise_stall'] = """
KKKKKKKKKKKKKKKK
KiiWWiiWWiiWWiiK
KiiWWiiWWiiWWiiK
KKKKKKKKKKKKKKKK
.KbbbbbbbbbbbbK.
.KbooobnnnbyybK.
.KbooobnnnbyybK.
.KbbbbbbbbbbbbK.
.KbppbbeeebbobK.
.KbppbbeeebbobK.
.KbbbbbbbbbbbbK.
.KKKKKKKKKKKKKK.
.KhhhhhhhhhhhhK.
.KKKKKKKKKKKKKK.
................
................
"""
T['incense_burner'] = """
................
....xx.x.xx.....
...x.x.x.x.x....
....x.xx.x......
..KKKKKKKKKKKK..
.KmmmmmmmmmmmmK.
.KmKKKKKKKKKKmK.
.KmKbbbbbbbbKmK.
.KmKKKKKKKKKKmK.
.KmmmmmmmmmmmmK.
..KKKKKKKKKKKK..
...KmmmmmmmmK...
...KKKKKKKKKK...
..KKKKKKKKKKKK..
................
................
"""
T['crepe_stand'] = """
.KKKKKKKKKKKKKK.
KppWWppWWppWWppK
KppWWppWWppWWppK
.KKKKKKKKKKKKKK.
..KnnnnnnnnnnK..
..KnoonppnyynK..
..KnnnnnnnnnnK..
..KKKKKKKKKKKK..
..KWWWWWWWWWWK..
..KWWpppppWWWK..
..KWWWWWWWWWWK..
..KKKKKKKKKKKK..
..KhhhhhhhhhhK..
..KKKKKKKKKKKK..
................
................
"""
T['photo_booth'] = """
KKKKKKKKKKKKKKKK
KppppppppppppppK
KpKKKKKKKKKKKKpK
KpKSSSSSSSSSSKpK
KpKSSpSSSSpSSKpK
KpKSSSSSSSSSSKpK
KpKKKKKKKKKKKKpK
KppppppppppppppK
KpWWWWppppWWWWpK
KpWWWWppppWWWWpK
KppppppppppppppK
KppppppppppppppK
KKKKKKKKKKKKKKKK
KhhhhhhhhhhhhhhK
KKKKKKKKKKKKKKKK
................
"""
T['arcade_cab'] = """
..KKKKKKKKKKKK..
..KccccccccccK..
..KcKKKKKKKKcK..
..KcKSSSSSSKcK..
..KcKSySSySKcK..
..KcKSSSSSSKcK..
..KcKKKKKKKKcK..
..KccccccccccK..
..KcKKKKKKKKcK..
..KcKiKyKKKKcK..
..KcKKKKKKKKcK..
..KccccccccccK..
..KccccccccccK..
..KKKKKKKKKKKK..
..KhhhhhhhhhhK..
..KKKKKKKKKKKK..
"""
T['poster_board'] = """
KKKKKKKKKKKKKKKK
KWWWWWWWWWWWWWWK
KWppppWWWcccccWK
KWppppWWWcccccWK
KWppppWWWcccccWK
KWWWWWWWWWWWWWWK
KWyyyyyWWWooooWK
KWyyyyyWWWooooWK
KWyyyyyWWWooooWK
KWWWWWWWWWWWWWWK
KKKKKKKKKKKKKKKK
.......KK.......
.......KK.......
.......KK.......
.....KKKKKK.....
................
"""
T['fish_stall'] = """
KKKKKKKKKKKKKKKK
KllWWllWWllWWllK
KllWWllWWllWWllK
KKKKKKKKKKKKKKKK
.KSSSSSSSSSSSSK.
.KSlSSlSSSlSSlK.
.KSSSSSSSSSSSSK.
.KSSlSSSlSSSSSK.
.KSSSSSSSSSSSSK.
.KKKKKKKKKKKKKK.
.KbbbbbbbbbbbbK.
.KbbbbbbbbbbbbK.
.KKKKKKKKKKKKKK.
..KK........KK..
................
................
"""
T['fish_crates'] = """
................
..KKKKKKKKKKK...
..KWWWWWWWWWK...
..KWSSSSSSSWK...
..KWWWWWWWWWK...
.KKKKKKKKKKKKK..
.KWWWWWWWWWWWK..
.KWSSSSSlSSSWK..
.KWWWWWWWWWWWK..
KKKKKKKKKKKKKKK.
KWWWWWWWWWWWWWK.
KWSSlSSSSSSlSWK.
KWWWWWWWWWWWWWK.
KKKKKKKKKKKKKKK.
................
................
"""
T['market_awning'] = """
KKKKKKKKKKKKKKKK
KiiiiyyyyiiiiyyK
KiiiiyyyyiiiiyyK
KKKKKKKKKKKKKKKK
.K............K.
.K............K.
.KbbbbbbbbbbbbK.
.KbooobcccbeebK.
.KbooobcccbeebK.
.KbbbbbbbbbbbbK.
.KbbbbbbbbbbbbK.
.KKKKKKKKKKKKKK.
.KhhhhhhhhhhhhK.
.KKKKKKKKKKKKKK.
................
................
"""
T['tower_leg'] = """
.......KK.......
......KooK......
......KooK......
.....KoWWoK.....
.....KoWWoK.....
....KooWWooK....
....KoWWWWoK....
...KooWWWWooK...
...KoWWWWWWoK...
..KooWWWWWWooK..
..KoWWWWWWWWoK..
.KooWWWWWWWWooK.
.KoWWWWWWWWWWoK.
KKKKKKKKKKKKKKKK
KhhhhhhhhhhhhhhK
KKKKKKKKKKKKKKKK
"""
T['taxi'] = """
................
................
....KKKKKKK.....
...KyyyyyyyK....
..KyKKKKKKKyK...
.KyKSSSSSSSKyK..
KyyKSSSSSSSKyyK.
KyyyKKKKKKKyyyK.
KyyyyyyyyyyyyyK.
KyyyyKyyyyKyyyK.
KKKKKKKKKKKKKKK.
.KddK.....KddK..
.KddK.....KddK..
..KK.......KK...
................
................
"""
T['bar_sign'] = """
....KKKKKKKK....
...KddddddddK...
...KdyyKKyydK...
...KdyKyyKydK...
...KdyKyyKydK...
...KdyyKKyydK...
...KddddddddK...
...KdppppppdK...
...KddddddddK...
....KKKKKKKK....
.......KK.......
.......KK.......
.......KK.......
.....KKKKKK.....
................
................
"""
T['robot_statue'] = """
.....KKKKKK.....
....KWWWWWWK....
....KWKKKKWK....
....KWKeeKWK....
....KWKKKKWK....
...KKWWWWWWKK...
..KiiKWWWWKiiK..
..KiiKWllWKiiK..
..KiiKWWWWKiiK..
...KKKWWWWKKK...
.....KWWWWK.....
.....KWKKWK.....
.....KWKKWK.....
....KKKKKKKK....
....KhhhhhhK....
....KKKKKKKK....
"""
T['palm'] = """
......KKK.......
....KKeeeKK.....
..KKeeEeeeeKK...
.KeeEEeEeeEeeK..
.KeEeeKKKeeEeK..
..KKeKbbbKeKK...
....KKbbbKK.....
......KbK.......
......KbK.......
......KbK.......
.....KbbbK......
.....KbbbK......
....KKKKKKK.....
....KqqqqqK.....
....KKKKKKK.....
................
"""
T['ferris_cabin'] = """
.......KK.......
......KuuK......
.....KuKKuK.....
....KuK..KuK....
...KKKKKKKKKK...
..KppppppppppK..
..KpKKKKKKKKpK..
..KpKSSSSSSKpK..
..KpKSSSSSSKpK..
..KpKKKKKKKKpK..
..KppppppppppK..
..KppppppppppK..
..KKKKKKKKKKKK..
................
................
................
"""
for k, v in T.items(): parse(v).save(os.path.join(OUT, k + '.png'))
print('tokyo tiles ->', OUT, len(T))
