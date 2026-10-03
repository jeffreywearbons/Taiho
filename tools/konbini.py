from PIL import Image, ImageDraw
import os
OUT = os.path.dirname(os.path.abspath(__file__))
TOUT = os.path.join(OUT,'konbini'); os.makedirs(TOUT, exist_ok=True)

BASE = {
 '.': None,
 'K': (26,26,46),     # outline
 'W': (255,255,255),  # white
 'F': (236,236,232),  # floor
 'f': (212,212,208),  # floor seam
 'e': (244,244,240),  # floor highlight
 'u': (176,176,190),  # wall / pavement
 'U': (222,222,230),  # shelf frame light
 'm': (96,96,112),    # dark metal / shelf back
 'M': (156,156,168),  # metal
 'G': (188,224,244),  # glass
 'g': (232,246,255),  # glass highlight
 'C': (120,80,45),    # fried food brown
 'c': (120,120,230),  # violet pack
 'a': (90,180,120),   # green pack
 'b': (240,160,60),   # orange pack
 'N': (255,215,70),   # yellow
 'n': (255,240,180),  # warm light
 'R': (230,60,60),    # red
 'L': (60,120,220),   # blue
 'p': (240,130,170),  # pink
 'd': (70,70,90),     # dark grey
 'x': (40,40,52),     # near black
 's': (200,200,210),  # seam light
 'o': (255,150,60),   # orange lid
 't': (170,210,120),  # rice ball nori-light green? no: bento green
 'h': (235,210,180),  # bento rice
 '1': None, '2': None, '3': None,  # theme slots
}

THEMES = {
 'Stripe (7-Eleven colors)':   ((245,130,32),(0,140,69),(238,28,37)),
 'Blue (Lawson colors)':       ((0,104,183),(255,255,255),(0,104,183)),
 'Green-Blue (FamilyMart colors)': ((0,160,64),(255,255,255),(0,104,183)),
 'Red (NewDays colors)':       ((220,40,50),(255,255,255),(220,40,50)),
 'Yellow-Blue (Ministop colors)': ((0,90,180),(255,215,0),(0,90,180)),
}

def parse(rows, theme=None, w=16, h=16):
    rows=[r for r in rows.strip('\n').split('\n')]
    assert len(rows)==h, (len(rows),h,rows[0])
    for r in rows: assert len(r)==w, (r,len(r))
    pal = dict(BASE)
    if theme: pal['1'],pal['2'],pal['3']=theme
    img = Image.new('RGBA',(w,h),(0,0,0,0)); px=img.load()
    for y,row in enumerate(rows):
        for x,ch in enumerate(row):
            c=pal[ch]
            if c: px[x,y]=c+(255,)
    return img

T = {}

T['floor'] = """
eFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
FFFFFFFFFFFFFFFf
ffffffffffffffff
"""

T['entrance_mat'] = """
KKKKKKKKKKKKKKKK
KddddddddddddddK
KdmmmmmmmmmmmmdK
KdmddddddddddmdK
KdmdmmmmmmmmdmdK
KdmdmddddddmdmdK
KdmdmdmmmmdmdmdK
KdmdmdmmmmdmdmdK
KdmdmdmmmmdmdmdK
KdmdmdmmmmdmdmdK
KdmdmddddddmdmdK
KdmdmmmmmmmmdmdK
KdmddddddddddmdK
KdmmmmmmmmmmmmdK
KddddddddddddddK
KKKKKKKKKKKKKKKK
"""

T['wall'] = """
uuuuuuuuuuuuuuuu
uuuuuuuuuuuuuuuu
uuuuuuuuuuuuuuuu
uuuuuuuuuuuuuuuu
uuuuuuuuuuuuuuuu
uuuuuuuuuuuuuuuu
uuuuuuuuuuuuuuuu
uuuuuuuuuuuuuuuu
uuuuuuuuuuuuuuuu
uuuuuuuuuuuuuuuu
uuuuuuuuuuuuuuuu
uuuuuuuuuuuuuuuu
KKKKKKKKKKKKKKKK
UUUUUUUUUUUUUUUU
ssssssssssssssss
KKKKKKKKKKKKKKKK
"""

T['pavement'] = """
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
MMMMMMMMMMMMMMMM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
MMMMMMMMMMMMMMMM
"""

T['storefront'] = """
1111111111111111
1111111111111111
2222222222222222
2222222222222222
3333333333333333
3333333333333333
KKKKKKKKKKKKKKKK
KgGGGGGGKgGGGGGK
KGGGGGGGKGGGGGGK
KGGGGGGGKGGGGGGK
KgGGGGGGKgGGGGGK
KGGGGGGGKGGGGGGK
KGGGGGGGKGGGGGGK
KGGGGGGGKGGGGGGK
KKKKKKKKKKKKKKKK
MMMMMMMMMMMMMMMM
"""

T['door'] = """
1111111111111111
1111111111111111
2222222222222222
2222222222222222
3333333333333333
3333333333333333
KKKKKKKKKKKKKKKK
KGGGGGGKKGGGGGGK
KgGGGGGKKGGGGGgK
KGGGGGGKKGGGGGGK
KGGGGGGKKGGGGGGK
KGGGGGGKKGGGGGGK
KGGGGGGKKGGGGGGK
KMMMMMMKKMMMMMMK
KKKKKKKKKKKKKKKK
dddddddddddddddd
"""

T['sign'] = """
1111111111111111
1111111111111111
2222222222222222
2222222222222222
3333333333333333
3333333333333333
KKKKKKKKKKKKKKKK
KWWWWWWWWWWWWWWK
KWWWW1111111WWWK
KWWW1WWWWWWW1WWK
KWWW1WW3WW3W1WWK
KWWW1WWWWWWW1WWK
KWWW1W3333WW1WWK
KWWWW1111111WWWK
KWWWWWWWWWWWWWWK
KKKKKKKKKKKKKKKK
"""

T['shelf_snacks'] = """
KKKKKKKKKKKKKKKK
KUUUUUUUUUUUUUUK
KUmmmmmmmmmmmmUK
KUmaamRRmppmbbUK
KUmaamRRmppmbbUK
KUmmmmmmmmmmmmUK
KUUUUUUUUUUUUUUK
KUmmmmmmmmmmmmUK
KUmNNmccmLLmaaUK
KUmNNmccmLLmaaUK
KUmmmmmmmmmmmmUK
KUUUUUUUUUUUUUUK
KUmmmmmmmmmmmmUK
KUmRRmbbmNNmppUK
KUmRRmbbmNNmppUK
KKKKKKKKKKKKKKKK
"""

T['shelf_onigiri'] = """
KKKKKKKKKKKKKKKK
KgggggggggggggGK
KgGGGGGGGGGGGGGK
KgGKWKGKWKGKWKGK
KgGWWWGWWWGWWWGK
KgGKKKGKKKGKKKGK
KgGGGGGGGGGGGGGK
KgGKKKKKGKKKKKGK
KgGKhhtKGKhhtKGK
KgGKhhCKGKhhCKGK
KgGKKKKKGKKKKKGK
KgGGGGGGGGGGGGGK
KgGKWKGKWKGKWKGK
KgGWWWGWWWGWWWGK
KgGKKKGKKKGKKKGK
KKKKKKKKKKKKKKKK
"""

T['fridge_drinks'] = """
KKKKKKKKKKKKKKKK
KmmmmmmmmmmmmmmK
KmnnnnnnnnnnnnmK
KKKKKKKKKKKKKKKK
KgGGGGGGGGGGGGGK
KGLLGaaGbbGNNGGK
KGLLGaaGbbGNNGMK
KGKKGKKGKKGKKGMK
KGGGGGGGGGGGGGGK
KGppGLLGWWGaaGGK
KGppGLLGWWGaaGMK
KGKKGKKGKKGKKGMK
KGGGGGGGGGGGGGGK
KGGGGGGGGGGGGGGK
KKKKKKKKKKKKKKKK
KmmmmmmmmmmmmmmK
"""

T['ice_cream'] = """
KKKKKKKKKKKKKKKK
KWWWWWWWWWWWWWWK
KWKKKKKKKKKKKKWK
KWKggggggggggKWK
KWKgGGGGGGGGgKWK
KWKgGpGLGNGpgKWK
KWKgGpGLGNGpgKWK
KWKgGGGGGGGGgKWK
KWKgGLGNGpGLgKWK
KWKgGLGNGpGLgKWK
KWKgGGGGGGGGgKWK
KWKggggggggggKWK
KWKKKKKKKKKKKKWK
KWWWWWWWWWWWWWWK
KKKKKKKKKKKKKKKK
KmmmmmmmmmmmmmmK
"""

T['counter'] = """
KKKKKKKKKKKKKKKK
KWWWWWWWWWWWWWWK
KWWWWWWWWWWWWWWK
KWWWWWWWWWWWWWWK
KWWWWWWWWWWWWWWK
KWWWWWWWWWWWWWWK
KWWWWWWWWWWWWWWK
KKKKKKKKKKKKKKKK
K11111111111111K
K11111111111111K
K22222222222222K
K22222222222222K
K33333333333333K
K33333333333333K
K11111111111111K
KKKKKKKKKKKKKKKK
"""

T['register'] = """
KKKKKKKKKKKKKKKK
KWWWKKKKKKKWWWWK
KWWKxLLLLLxKWWWK
KWWKxLLLLLxKWWWK
KWWKxxxxxxxKWWWK
KWWKKKKKKKKKWWWK
KWWWWWWWWWWWWWWK
KKKKKKKKKKKKKKKK
K11111111111111K
K11111111111111K
K22222222222222K
K22222222222222K
K33333333333333K
K33333333333333K
K11111111111111K
KKKKKKKKKKKKKKKK
"""

T['hot_case'] = """
KKKKKKKKKKKKKKKK
KmmmmmmmmmmmmmmK
KKKKKKKKKKKKKKKK
KgnnnnnnnnnnnnGK
KgnCCnnCCnnCCnGK
KgnCCnnCCnnCCnGK
KgnnnnnnnnnnnnGK
KKKKKKKKKKKKKKKK
K11111111111111K
K11111111111111K
K22222222222222K
K22222222222222K
K33333333333333K
K33333333333333K
K11111111111111K
KKKKKKKKKKKKKKKK
"""

T['atm'] = """
KKKKKKKKKKKKKKKK
KMMMMMMMMMMMMMMK
KMKKKKKKKKKKKKMK
KMKLLLLLLLLLLKMK
KMKLLWWWWWWLLKMK
KMKLLLLLLLLLLKMK
KMKKKKKKKKKKKKMK
KMMMMMMMMMMMMMMK
KMMsMsMsMsMsMMMK
KMMsMsMsMsMsMMMK
KMMMMMMMMMMMMMMK
KMKKKKKKKKKKKKMK
KMMMMMMMMMMMMMMK
KMMMMMMMMMMMMMMK
KMMMMMMMMMMMMMMK
KKKKKKKKKKKKKKKK
"""

T['magazine_rack'] = """
KKKKKKKKKKKKKKKK
KmmmmmmmmmmmmmmK
KmKKKmKKKmKKKmmK
KmKppmKLLmKNNmmK
KmKWpmKWLmKWNmmK
KmKppmKLLmKNNmmK
KmmmmmmmmmmmmmmK
KmKKKmKKKmKKKmmK
KmKaamKRRmKccmmK
KmKWamKWRmKWcmmK
KmKaamKRRmKccmmK
KmmmmmmmmmmmmmmK
KmMMMMMMMMMMMMmK
KmMMMMMMMMMMMMmK
KKKKKKKKKKKKKKKK
KmmmmmmmmmmmmmmK
"""

T['elevator'] = """
KKKKKKKKKKKKKKKK
KMMMMMMNNMMMMMMK
KMMMMMMNNMMMMMMK
KKKKKKKKKKKKKKKK
KMMMMMMKKMMMMMMK
KMsssssKKsssssMK
KMsMMMsKKsMMMsMK
KMsMMMsKKsMMMsMK
KMsMMMsKKsMMMsMK
KMsMMMsKKsMMMsMK
KMsMMMsKKsMMMsMK
KMsMMMsKKsMMMsMK
KMsssssKKsssssMK
KMMMMMMKKMMMMMMK
KKKKKKKKKKKKKKKK
KddddddddddddddK
"""

T['trash_bins'] = """
uuuuuuuMuuuuuuuM
uKKKKuKKKKuKKKKM
uKLLKuKaaKuKooKM
uKKKKuKKKKuKKKKM
uKMMKuKMMKuKMMKM
uKMMKuKMMKuKMMKM
uKMMKuKMMKuKMMKM
MKMMKMKMMKMKMMKM
uKMMKuKMMKuKMMKM
uKMMKuKMMKuKMMKM
uKMMKuKMMKuKMMKM
uKMMKuKMMKuKMMKM
uKKKKuKKKKuKKKKM
uuuuuuuMuuuuuuuM
uuuuuuuMuuuuuuuM
MMMMMMMMMMMMMMMM
"""

T['vending'] = """
KKKKKKKKKKKKKKKK
KRRRRRRRRRRRRRRK
KRKKKKKKKKKKKKRK
KRKgGGGGGGGGGKRK
KRKGLGaGbGNGWKRK
KRKGLGaGbGNGWKRK
KRKGKGKGKGKGKKRK
KRKGpGLGWGaGbKRK
KRKGpGLGWGaGbKRK
KRKKKKKKKKKKKKRK
KRRRRRRRKKKRRRRK
KRRRRRRRKmKRRRRK
KRRRRRRRKKKRRRRK
KRRRRRRRRRRRRRRK
KKKKKKKKKKKKKKKK
KddddddddddddddK
"""

THEMED = {'storefront','door','sign','counter','register','hot_case'}
default_theme = list(THEMES.values())[0]
tiles = {k: parse(v, default_theme) for k,v in T.items()}
for k,img in tiles.items(): img.save(os.path.join(TOUT,k+'.png'))
for tname,th in THEMES.items():
    tag = tname.split(' (')[0].lower().replace('-','_')
    for k in THEMED:
        parse(T[k],th).save(os.path.join(TOUT,f'{k}_{tag}.png'))

# ---------- tileset preview ----------
SC=6; cols=6
names=list(T.keys())
rows=(len(names)+cols-1)//cols
sheet=Image.new('RGBA',(cols*(16*SC+30)+30, rows*(16*SC+40)+40+ (len(THEMES))*(16*SC+34)+60),(40,40,52,255))
d=ImageDraw.Draw(sheet)
for i,n in enumerate(names):
    x=30+(i%cols)*(16*SC+30); y=30+(i//cols)*(16*SC+40)
    sheet.paste(tiles[n].resize((16*SC,16*SC),Image.NEAREST),(x,y))
    d.text((x,y-14),n.replace('_',' '),fill=(255,255,255))
y=30+rows*(16*SC+40)+20
d.text((30,y),"Chain color themes (storefront / door / sign / counter / register / hot case)",fill=(255,230,120))
y+=20
for tname,th in THEMES.items():
    d.text((30,y),tname,fill=(255,255,255)); 
    x=30
    for k in ['storefront','door','sign','counter','register','hot_case']:
        sheet.paste(parse(T[k],th).resize((16*SC,16*SC),Image.NEAREST),(x,y+14))
        x+=16*SC+8
    y+=16*SC+34
sheet.save(os.path.join(OUT,'konbini_tileset_preview.png'))

# ---------- map 1 mock: 20x15 ----------
L = [
"WWWWWWWWWWWWWWWWWWWW",
"WDDDDDDDDDDIIAAEVWWW",
"WR..................",
"WC..................",
"WH...SSSSS...OOOO...",
"WC...SSSSS...OOOO...",
"W...................",
"W....SSSSS...OOOO...",
"W....SSSSS...OOOO...",
"W...................",
"W...................",
"WGGGGGGGGGGGGGGGGGGG",
"FFFFFFFFYGgFFFFFFFFF",
"PPPPPPPPPPMPPPPPPPTP",
"PPPPPPPPPPPPPPPPPPPP",
]
# fix row 11/12: inner magazine racks + storefront with door
L[11] = "WMMM......MMM......." # magazine racks near window
L[12] = "FFFFFFFFFSNFFFFFFFFF" # storefront row: F=storefront glass, S=door(left?), N=sign
L[12] = "FFFFFFFFFYDFFFFFFFFF"
MAP = {
 'W':'wall','D':'fridge_drinks','I':'ice_cream','A':'atm','E':'elevator','V':'vending',
 'R':'register','C':'counter','H':'hot_case','S':'shelf_snacks','O':'shelf_onigiri',
 'G':'floor','.':'floor','M':'magazine_rack','F':'storefront','Y':'door','P':'pavement','T':'trash_bins',
}
L[12] = "FFFFFFFFFYFFFFFFFFFF"
L[12] = list(L[12]); L[12][8]='N'; L[12]=''.join(L[12])  # sign left of door
L[13] = "PPPPPPPPPmPPPPPPPPTP"
MAP['m']='entrance_mat'; MAP['N']='sign'
TW=16; W=20; H=15
scene=Image.new('RGBA',(W*TW,H*TW))
for y,row in enumerate(L):
    for x,ch in enumerate(row):
        scene.paste(tiles['floor'],(x*TW,y*TW))
        t=tiles[MAP[ch]]
        scene.paste(t,(x*TW,y*TW),t)
# characters
def load(n): return Image.open(os.path.join(OUT,n)).convert('RGBA')
hero=load('hero.png'); perv=load('perv.png'); tgt=load('target_shopper.png')
ic_live=load('in_progress.png'); ic_scope=load('scoping.png'); ic_setup=load('setting_up.png')
def place(img,tx,ty,icon=None):
    x=tx*TW; y=ty*TW+TW-24
    scene.paste(img,(x,y),img)
    if icon is not None: scene.paste(icon,(x+4,y-10),icon)
place(tgt,7,6); place(perv,6,6,ic_live)
place(hero,9,10)
place(tgt,15,3); place(perv,17,3,ic_scope)
place(tgt,2,9); place(perv,13,9,ic_setup)
place(perv,9,13)   # walking in through the door
S=4
scene.resize((W*TW*S,H*TW*S),Image.NEAREST).save(os.path.join(OUT,'konbini_map1_mock.png'))
print('ok')
