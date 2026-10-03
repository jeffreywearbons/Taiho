from PIL import Image, ImageDraw, ImageFont
import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out'); os.makedirs(OUT, exist_ok=True)

PAL = {
 '.': None,
 'K': (26,26,46),     # outline
 'T': (121,80,48),    # trunk
 't': (92,58,34),     # trunk shade
 'A': (86,170,96),    # leaf
 'a': (58,128,72),    # leaf shade
 'l': (140,210,120),  # leaf light
 'P': (70,110,170),   # pot blue
 'p': (50,80,130),    # pot shade
 'q': (120,160,210),  # pot rim light
 'W': (255,255,255),
 'E': (20,20,30),
 'S': (210,150,100),  # cheek / mouth
 'C': (120,220,255),  # LED cyan
 'c': (40,150,200),
 'F': (236,236,232), 'f': (212,212,208),
 'U': (248,248,248), 'u': (200,200,210), 'd': (70,70,90),
}

def parse(s):
    rows=s.strip('\n').split('\n'); w=len(rows[0])
    for r in rows: assert len(r)==w,(r,len(r),w)
    img=Image.new('RGBA',(w,len(rows)),(0,0,0,0)); px=img.load()
    for y,r in enumerate(rows):
        for x,ch in enumerate(r):
            c=PAL[ch]
            if c: px[x,y]=c+(255,)
    return img

# overworld sprite 16x24: bonsai in a pot, club-leaf hands, face on trunk
BONSAI = parse("""
......KKKK......
....KKlAAlKK....
...KlAAAAAAlK...
..KAAAAlAAAAAK..
..KaAAAAAAAAaK..
...KaaAAAAaaK...
.KK.KKaAAaKK.KK.
KlAK.KTTTTK.KAlK
KAAAK.KTTK.KAAAK
KaAAKKTTTTKKAAaK
.KaKKTTTTTTKKaK.
..K.KTWETWEK.K..
....KTTTTTTK....
....KTSTTSTK....
....KTTKKTTK....
.....KTTTTK.....
...KKKKKKKKKK...
..KqqqqqqqqqqK..
..KPPPPPPPPPPK..
..KPPPPPPPPPPK..
...KPPCPPPPPK...
...KpppppppppK..
....KppppppK....
....KKKKKKKK....
""")

# portrait 32x32 for the dialogue box
PORTRAIT = parse("""
.........KKKKKKKKKKKK...........
.......KKllAAAAAAAAllKK.........
......KlAAAAAAAAAAAAAAlK........
.....KAAAAAAlAAAAAAAAAAAK.......
....KAAAAAAlllAAAAAAAAAAK.......
....KAAAAAAAAAAAAAAAAAAAAK......
....KaAAAAAAAAAAAAAAAAAaK.......
.....KaaAAAAAAAAAAAAAaaK........
......KKaaaAAAAAAaaaKK..........
..KKK...KKKaaAAaaKKK...KKK......
.KlAAK....KKTTTTKK....KAAlK.....
KlAAAAK....KTTTTK....KAAAAlK....
KAAAAAAK...KTTTTK...KAAAAAAK....
KAAAAAAKK..KTTTTK..KKAAAAAAK....
KaAAAAKKTK.KTTTTK.KTKKAAAAaK....
.KaAAK.KTTKKTTTTKKTTK.KAAaK.....
..KKK..KTTTTTTTTTTTTK..KKK......
.......KTTTTTTTTTTTTK...........
......KTTTWWEKTTKWWEK...........
......KTTTWEEKTTKWEEK...........
......KTTTTTTTTTTTTTTK..........
......KTSSTTTTTTTTSSTK..........
......KTSSTTTKKKKTSSTK..........
.......KTTTTKSSSSKTTK...........
.......KTTTTTKKKKTTTK...........
........KtTTTTTTTTtK............
......KKKKKKKKKKKKKKKK..........
.....KqqqqqqqqqqqqqqqqK.........
.....KPPPPPPPPPPPPPPPPK.........
.....KPPPPPCcPPPPPPPPPK.........
......KpppppppppppppppK.........
.......KKKKKKKKKKKKKKK..........
""")

BONSAI.save(os.path.join(OUT,'bonsai.png'))
PORTRAIT.save(os.path.join(OUT,'bonsai_portrait.png'))

# ---------- dialogue box mock, 240x160 game screen at 1x ----------
import sys
if not os.path.exists(os.path.join(OUT,'konbini_map1_mock.png')): sys.exit(0)
mock4 = Image.open(os.path.join(OUT,'konbini_map1_mock.png')).convert('RGBA')
scene = mock4.crop((320*4//4*0+ 32*4, 32*4, 32*4+240*4, 32*4+160*4)).resize((240,160),Image.NEAREST)

def draw_box(scene, text_lines, font, portrait, name_font, name):
    s = scene.copy(); d = ImageDraw.Draw(s)
    H=48; y0=160-H-2
    # Pokémon-style box: dark outer border, white inner, light inner shadow line
    d.rectangle((2,y0,237,157),fill=(26,26,46))
    d.rectangle((4,y0+2,235,155),fill=(248,248,248))
    d.rectangle((4,y0+2,235,y0+2),fill=(200,200,210))
    # portrait frame
    d.rectangle((7,y0+5,42,y0+40),fill=(26,26,46))
    d.rectangle((9,y0+7,40,y0+38),fill=(220,235,255))
    s.paste(portrait,(8,y0+6),portrait)
    # name tag
    d.rectangle((6,y0-9,6+int(name_font.getlength(name))+6,y0+1),fill=(26,26,46))
    d.text((9,y0-8),name,font=name_font,fill=(248,248,248))
    # text
    ty=y0+8
    for line in text_lines:
        d.text((48,ty),line,font=font,fill=(40,40,52)); ty+=13
    # continue arrow
    d.polygon([(226,150),(232,150),(229,154)],fill=(26,26,46))
    return s

FONT=os.path.join(os.path.dirname(OUT),'..','src','assets','fonts','PixelMplus10-subset.ttf')
f_ja = ImageFont.truetype(FONT,10)
f_en = ImageFont.truetype(FONT,10)
f_name = ImageFont.truetype(FONT,10)

ja = draw_box(scene, ["あかい マークが でたら","いまだ! タックルしろ!"], f_ja, PORTRAIT, f_name, "ボンサイ")
en = draw_box(scene, ["When the red mark pops up,","that's your cue. TACKLE!"], f_en, PORTRAIT, f_name, "BONSAI")

S=4
sheet = Image.new('RGBA',(240*S*2+30, 160*S+120),(40,40,52,255))
sheet.paste(ja.resize((240*S,160*S),Image.NEAREST),(10,40))
sheet.paste(en.resize((240*S,160*S),Image.NEAREST),(240*S+20,40))
d=ImageDraw.Draw(sheet)
big = ImageFont.truetype(FONT,24)
d.text((10,8),"Japanese (kana only, PixelMplus 10)",font=big,fill=(255,255,255))
d.text((240*S+20,8),"English (same font)",font=big,fill=(255,255,255))
# bonsai sprite + portrait reference row
d.text((10,160*S+50),"Bonsai overworld 16x24 and portrait 32x32",font=big,fill=(255,230,120))
sheet.paste(BONSAI.resize((16*4,24*4),Image.NEAREST),(10+520,160*S+44))
sheet.paste(PORTRAIT.resize((32*4,32*4),Image.NEAREST),(10+600,160*S+40))
sheet.save(os.path.join(OUT,'tutorial_mock.png'))
print('ok')
