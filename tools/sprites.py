from PIL import Image, ImageDraw
import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out'); os.makedirs(OUT, exist_ok=True)

PAL = {
 '.': None,
 'K': (26,26,46),      # outline
 'S': (246,201,160),   # skin
 's': (224,160,120),   # skin shade / blush
 'H': (43,43,58),      # dark hair
 'h': (120,70,40),     # brown hair
 'p': (240,130,170),   # pink hair
 'E': (20,20,30),      # eye
 'W': (255,255,255),   # white
 'G': (74,144,217),    # hoodie blue
 'g': (47,108,179),    # hoodie shade
 'P': (58,58,74),      # pants
 'D': (200,60,70),     # red shoes / skirt
 'B': (232,93,117),    # shopping bag pink
 'J': (42,42,53),      # suit
 'T': (200,50,50),     # tie
 'C': (107,75,42),     # camera bag brown
 'L': (120,200,255),   # glasses lens
 'V': (35,35,58),      # vigilante cowl
 'v': (70,50,110),     # cape purple
 'Y': (255,210,60),    # emblem yellow
 'R': (230,60,60),     # red icon
 'r': (255,140,140),   # red light
 'F': (236,228,210),   # floor
 'f': (214,204,184),   # floor line
 'M': (150,150,160),   # metal rack
 'a': (90,180,120),    # clothes green
 'b': (240,160,60),    # clothes orange
 'c': (120,120,230),   # clothes violet
 'O': (255,255,255),   # icon white
 'Q': (60,60,80),      # icon dark
 'N': (255,230,120),   # icon yellow
}

def parse(rows, w, h):
    assert len(rows)==h, (len(rows),h)
    for r in rows: assert len(r)==w, (r,len(r),w)
    img = Image.new('RGBA',(w,h),(0,0,0,0))
    px = img.load()
    for y,row in enumerate(rows):
        for x,ch in enumerate(row):
            c = PAL[ch]
            if c: px[x,y]=c+(255,)
    return img

# ---------- characters 16x24 ----------
HERO_CIV = """
................
.....KKKKKK.....
....KHHHHHHK....
...KHHHHHHHHK...
..KHHHHHHHHHHK..
..KHHSSHHSSHHK..
..KHSSSSSSSSHK..
..KSSEWSSEWSSK..
..KSSEESSEESSK..
..KSsSSSSSSsSK..
..KSSSSSKSSSSK..
...KSSSSSSSSK...
....KSSSSSSK....
...KGgGGGGgGK...
..KGGGGGGGGGGK..
..KGGGGGGGGGGKB.
..KgGGGGGGGGgKBB
..KSKGGGGGGKSKBB
...K.KGGGGK.K.B.
.....KPPPPK.....
.....KPPPPK.....
.....KPKKPK.....
....KDDKKDDK....
....KKKK.KKKK...
""".strip().split('\n')

HERO_VIG = """
....K......K....
....KVK..KVK....
....KVVKKVVK....
...KVVVVVVVVK...
..KVVVVVVVVVVK..
..KVVVVVVVVVVK..
..KVVVVVVVVVVK..
..KVVWWVVWWVVK..
..KVVVVVVVVVVK..
..KSSSSSSSSSSK..
..KSSSSSKSSSSK..
...KSSSSSSSSK...
...KvSSSSSSvK...
..KvvVYVVYVvvK..
.KvvVVVYYVVVvvK.
.KvvVVVVVVVVvvK.
.KvvVVVVVVVVvvK.
.KvvKVVVVVVKvvK.
.KvvK.VVVV.KvvK.
.KvvK.KPPK.KvvK.
..KvK.KPPK.KvK..
...K..KPKK..K...
....KDDKKDDK....
....KKKK.KKKK...
""".strip().split('\n')

PERV = """
................
.....KKKKKK.....
....KHHHHHHK....
...KHHHHHHHHK...
..KHHHHHHHHHHK..
..KHSSSSSSSSHK..
..KSSSSSSSSSSK..
..KKLLKSSKLLKK..
..KSLLSSSSLLSK..
..KSSSSSSSSSSK..
..KSSSSKKSSSSK..
...KSSSSSSSSK...
....KSSSSSSK....
...KJJWWTWWJK...
..KJJJWTTWJJJK..
..KJJJJWTWJJJK..
..KJJJJWTWJJJK..
..KSKJJJJJJKSK..
...K.KJJJJK.KCK.
.....KPPPPK.KCK.
.....KPPPPK.KCK.
.....KPKKPK..K..
....KHHKKHHK....
....KKKK.KKKK...
""".strip().split('\n')

TARGET = """
................
.....KKKKKK.....
....KhhhhhhK....
...KhhhhhhhhK...
..KhhhhhhhhhhK..
..KhhSShhSShhK..
..KhSSSSSSSShK..
..KhSEWSSEWShK..
..KhSEESSEEShK..
..KhsSSSSSSshK..
..KhSSSSKSSShK..
..KhKSSSSSSKhK..
..Kh.KSSSSK.hK..
..KhKWWWWWWKhK..
..KKWWWWWWWWKK..
..KWWWWWWWWWWK..
..KSKWWWWWWKSK..
...K.KDDDDK.K...
....KDDDDDDK....
...KDDDDDDDDK...
...KKKKKKKKKK...
.....KSSSSK.....
....KHHKKHHK....
....KKKK.KKKK...
""".strip().split('\n')

# ---------- icons 8x8 ----------
ICON_SCOPE = """
........
.QQQQQQ.
QOOOOOOQ
QOOQQOOQ
QOQEEQOQ
QOOQQOOQ
.QQQQQQ.
........
""".strip().split('\n')

ICON_SETUP = """
..QQQQ..
..QOOQ..
..QOOQ..
..QOOQ..
..QOOQ..
..QOOQ..
..QQQQ..
...QQ...
""".strip().split('\n')

ICON_LIVE = """
..RRRR..
.RRrrRR.
RRrOOrRR
RRrOOrRR
RRrrrrRR
RRRRRRRR
.RRRRRR.
..RRRR..
""".strip().split('\n')

ICON_FINISH = """
........
..QQQ...
..QNQ...
.QQNQQ..
QN.N.NQ.
..QNQ...
.QN.NQ..
.Q...Q..
""".strip().split('\n')

ICON_HINT = """
..QQQQ..
.QNNNNQ.
.QNQQNQ.
...QNNQ.
..QNNQ..
..QNQ...
..QNQ...
..QQQ...
""".strip().split('\n')

# ---------- tiles 16x16 ----------
FLOOR = """
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
ffffffffffffffff
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
FFFFFFFfFFFFFFFf
ffffffffffffffff
""".strip().split('\n')

RACK = """
FFFFFFFfFFFFFFFf
FKMMMMMMMMMMMMKF
FKMKKKKKKKKKKMKF
FKMKaKbKcKaKbMKF
FKMKaKbKcKaKbMKF
FKMKaKbKcKaKbMKF
FKMKaKbKcKaKbMKF
FKMKaKbKcKaKbMKF
FKMKaKbKcKaKbMKF
FKMKaKbKcKaKbMKF
FKMKKKKKKKKKKMKF
FKMMMMMMMMMMMMKF
FFKMFFFfFFFFMKFF
FFKMFFFfFFFFMKFF
FFKKFFFfFFFFKKFF
ffffffffffffffff
""".strip().split('\n')

chars = {
 'Hero (civilian)': parse(HERO_CIV,16,24),
 'Hero (full vigilante)': parse(HERO_VIG,16,24),
 'Perv': parse(PERV,16,24),
 'Target shopper': parse(TARGET,16,24),
}
icons = {
 'Scoping': parse(ICON_SCOPE,8,8),
 'Setting up': parse(ICON_SETUP,8,8),
 'In progress': parse(ICON_LIVE,8,8),
 'Finishing': parse(ICON_FINISH,8,8),
 'Hint (far)': parse(ICON_HINT,8,8),
}
tiles = {'Floor': parse(FLOOR,16,16), 'Rack': parse(RACK,16,16)}

# save raw 1x assets
for d in (chars, icons, tiles):
    for name,img in d.items():
        img.save(os.path.join(OUT, name.split(' (')[0].replace(' ','_').lower()+'.png'))

# ---------- sprite sheet preview ----------
SC = 8
W = 16*SC*4 + 40*5
sheet = Image.new('RGBA',(W, 24*SC+ 8*SC + 16*SC + 140),(40,40,52,255))
d = ImageDraw.Draw(sheet)
x=40; y=30
for name,img in chars.items():
    sheet.paste(img.resize((16*SC,24*SC),Image.NEAREST),(x,y))
    d.text((x,y-16),name,fill=(255,255,255))
    x += 16*SC+40
y2 = y+24*SC+40; x=40
for name,img in icons.items():
    sheet.paste(img.resize((8*SC,8*SC),Image.NEAREST),(x,y2))
    d.text((x,y2-16),name,fill=(255,255,255))
    x += 8*SC+60
y3 = y2+8*SC+40; x=40
for name,img in tiles.items():
    sheet.paste(img.resize((16*SC,16*SC),Image.NEAREST),(x,y3))
    d.text((x,y3-16),name,fill=(255,255,255))
    x += 16*SC+40
sheet.save(os.path.join(OUT,'sprite_sheet_preview.png'))

# ---------- scene mock 12x8 tiles ----------
TW=16; cols,rows=12,8; S=5
scene = Image.new('RGBA',(cols*TW,rows*TW))
for ty in range(rows):
    for tx in range(cols):
        scene.paste(tiles['Floor'],(tx*TW,ty*TW))
for (tx,ty) in [(2,2),(3,2),(4,2),(7,2),(8,2),(9,2),(2,5),(3,5),(4,5),(7,5),(8,5),(9,5)]:
    scene.paste(tiles['Rack'],(tx*TW,ty*TW),tiles['Rack'])
def place(img,tx,ty,icon=None):
    x=tx*TW; y=ty*TW+TW-24
    scene.paste(img,(x,y),img)
    if icon is not None:
        scene.paste(icon,(x+4,y-10),icon)
place(chars['Target shopper'],6,3)
place(chars['Perv'],5,3,icons['In progress'])
place(chars['Hero (civilian)'],1,4)
place(chars['Perv'],10,6,icons['Scoping'])
place(chars['Target shopper'],10,4)
big = scene.resize((cols*TW*S,rows*TW*S),Image.NEAREST)
big.save(os.path.join(OUT,'scene_mock.png'))
print('done')
