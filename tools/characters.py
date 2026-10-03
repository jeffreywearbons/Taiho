"""
Character sprite generator. Every character is a parameter set drawn as
16x24 sprites in three directions (down, up, side; left is the flipped side)
with three frames each (stand, step left, step right).

Run: python3 tools/characters.py  -> tools/out/chars/<name>_<dir>_<frame>.png + preview
"""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', 'chars')
os.makedirs(OUT, exist_ok=True)

K = (26, 26, 46)        # outline
W = (255, 255, 255)
E = (20, 20, 30)
SKIN = (246, 201, 160); SKIN_S = (224, 160, 120)

def rgba(c): return c + (255,)

class Canvas:
    def __init__(self):
        self.im = Image.new('RGBA', (16, 24), (0, 0, 0, 0)); self.px = self.im.load()
    def p(self, x, y, c):
        if 0 <= x < 16 and 0 <= y < 24 and c is not None: self.px[x, y] = rgba(c)
    def rect(self, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): self.p(x, y, c)
    def outline(self):
        """Draw a dark outline around every opaque pixel that touches transparency."""
        src = self.im.copy(); sp = src.load()
        for y in range(24):
            for x in range(16):
                if sp[x, y][3]: continue
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    nx, ny = x+dx, y+dy
                    if 0 <= nx < 16 and 0 <= ny < 24 and sp[nx, ny][3] and sp[nx, ny][:3] != K:
                        self.px[x, y] = rgba(K); break
    def shift_rows(self, y0, y1, dy):
        """Move rows y0..y1 by dy (used for the 1px body bob)."""
        src = self.im.copy(); sp = src.load()
        for y in range(y0, y1 + 1):
            for x in range(16): self.px[x, y] = (0, 0, 0, 0)
        for y in range(y0, y1 + 1):
            for x in range(16):
                if sp[x, y][3]: self.p(x, y + dy, sp[x, y][:3])

# ---------------- parts ----------------

def head_front(c, ch, frame):
    """Big round head, hair cap, face. ch = character dict."""
    hair, style = ch['hair'], ch['style']
    bob = -1 if frame else 0
    y = 1 + bob
    # hair cap
    c.rect(5, y, 10, y, hair); c.rect(4, y+1, 11, y+1, hair); c.rect(3, y+2, 12, y+2, hair); c.rect(3, y+3, 12, y+4, hair)
    # face
    c.rect(3, y+5, 12, y+10, SKIN); c.rect(4, y+11, 11, y+11, SKIN)
    # fringe over the forehead by style
    if style == 'short':
        c.rect(3, y+5, 12, y+5, hair); c.rect(3, y+6, 4, y+6, hair); c.rect(7, y+6, 8, y+6, hair); c.rect(11, y+6, 12, y+6, hair)
    elif style == 'slick':
        c.rect(3, y+5, 12, y+5, hair); c.rect(3, y+6, 3, y+6, hair); c.rect(12, y+6, 12, y+6, hair)
    elif style == 'long':
        c.rect(3, y+5, 12, y+5, hair); c.rect(3, y+6, 4, y+6, hair); c.rect(11, y+6, 12, y+6, hair)
        c.rect(2, y+5, 2, y+13, hair); c.rect(13, y+5, 13, y+13, hair); c.rect(3, y+9, 3, y+12, hair); c.rect(12, y+9, 12, y+12, hair)
    elif style == 'bob':
        c.rect(3, y+5, 12, y+5, hair); c.rect(3, y+6, 5, y+6, hair); c.rect(10, y+6, 12, y+6, hair)
        c.rect(2, y+5, 2, y+10, hair); c.rect(13, y+5, 13, y+10, hair); c.rect(3, y+9, 3, y+10, hair); c.rect(12, y+9, 12, y+10, hair)
    elif style == 'cowl':
        # vigilante cowl: covers everything but the mouth and chin
        cw = ch['cowl']
        c.rect(3, y+5, 12, y+8, cw); c.rect(3, y+9, 3, y+10, cw); c.rect(12, y+9, 12, y+10, cw)
        c.p(4, y-1, cw); c.p(11, y-1, cw); c.p(4, y-2, cw); c.p(11, y-2, cw)  # ears
        c.rect(5, y+6, 6, y+7, W); c.rect(9, y+6, 10, y+7, W)  # eye slits
        c.rect(4, y, 11, y, cw)
    # eyes (not for cowl)
    if style != 'cowl':
        c.rect(5, y+7, 6, y+8, E); c.rect(9, y+7, 10, y+8, E); c.p(5, y+7, W); c.p(9, y+7, W)
        if ch.get('glasses'):
            g = (120, 200, 255)
            c.rect(4, y+7, 6, y+8, g); c.rect(9, y+7, 11, y+8, g); c.p(7, y+7, K); c.p(8, y+7, K); c.p(5, y+7, E); c.p(10, y+7, E)
        if ch.get('mask'):
            m = ch['mask']
            c.rect(3, y+6, 12, y+9, m); c.rect(5, y+7, 6, y+8, W); c.rect(9, y+7, 10, y+8, W); c.p(5, y+7, E); c.p(10, y+7, E)
    if ch.get('blush'): c.p(4, y+9, SKIN_S); c.p(11, y+9, SKIN_S)
    c.rect(7, y+10, 8, y+10, SKIN_S)  # mouth

def head_back(c, ch, frame):
    hair, style = ch['hair'], ch['style']
    bob = -1 if frame else 0; y = 1 + bob
    c.rect(5, y, 10, y, hair); c.rect(4, y+1, 11, y+1, hair); c.rect(3, y+2, 12, y+10, hair); c.rect(4, y+11, 11, y+11, hair)
    if style == 'long': c.rect(2, y+5, 13, y+15, hair)
    if style == 'bob': c.rect(2, y+5, 13, y+11, hair)
    if style == 'short': c.rect(4, y+11, 11, y+11, SKIN)   # neck
    if style == 'slick': c.rect(4, y+10, 11, y+11, SKIN)
    if style == 'cowl':
        cw = ch['cowl']; c.rect(3, y, 12, y+11, cw); c.rect(5, y, 10, y, cw); c.p(4, y-1, cw); c.p(11, y-1, cw); c.p(4, y-2, cw); c.p(11, y-2, cw)
        c.rect(3, y+1, 3, y+1, None)

def head_side(c, ch, frame):
    """Facing right."""
    hair, style = ch['hair'], ch['style']
    bob = -1 if frame else 0; y = 1 + bob
    c.rect(6, y, 10, y, hair); c.rect(5, y+1, 11, y+1, hair); c.rect(4, y+2, 12, y+4, hair)
    c.rect(4, y+5, 12, y+10, SKIN); c.rect(5, y+11, 11, y+11, SKIN)
    # hair back of head
    c.rect(4, y+5, 6, y+9, hair); c.rect(4, y+5, 12, y+5, hair)
    if style == 'long': c.rect(3, y+5, 5, y+14, hair); c.rect(4, y+10, 6, y+13, hair)
    if style == 'bob': c.rect(3, y+5, 5, y+10, hair); c.rect(4, y+10, 6, y+10, hair)
    if style == 'slick': c.rect(4, y+5, 5, y+8, hair)
    if style == 'cowl':
        cw = ch['cowl']; c.rect(4, y, 12, y+8, cw); c.rect(4, y+9, 7, y+10, cw); c.p(6, y-1, cw); c.p(6, y-2, cw); c.p(9, y-1, cw)
        c.rect(10, y+6, 11, y+7, W)
    else:
        c.rect(10, y+7, 11, y+8, E); c.p(10, y+7, W)
        if ch.get('glasses'): c.rect(9, y+7, 11, y+8, (120, 200, 255)); c.p(10, y+7, E)
        if ch.get('mask'): c.rect(8, y+6, 12, y+8, ch['mask']); c.rect(10, y+7, 11, y+8, W); c.p(11, y+7, E)
    c.p(13, y+9, SKIN)  # nose
    c.p(11, y+10, SKIN_S)

def body_front(c, ch, frame):
    o = ch['outfit']; col = ch['col']; bob = -1 if frame else 0; y = 13 + bob
    if o in ('hoodie', 'hoodie_cape', 'vig'):
        base = col['top']; shade = col['top_s']
        c.rect(3, y, 12, y+5, base); c.rect(4, y, 11, y, shade)                   # torso + collar
        if o == 'vig': c.rect(6, y+1, 9, y+2, col['emblem']); c.rect(7, y+3, 8, y+3, col['emblem'])
        else: c.rect(6, y+3, 9, y+4, shade)                                        # pocket
        c.rect(2, y+1, 2, y+4, base); c.rect(13, y+1, 13, y+4, base)               # arms
        c.p(2, y+5, SKIN); c.p(13, y+5, SKIN)                                      # hands
        if o in ('hoodie_cape', 'vig'):
            cp = col['cape']; c.rect(1, y, 1, y+8, cp); c.rect(14, y, 14, y+8, cp); c.p(2, y+6, cp); c.p(13, y+6, cp)
    elif o == 'suit':
        c.rect(3, y, 12, y+5, col['top']); c.rect(7, y, 8, y+3, W); c.rect(7, y, 8, y+2, col['tie'])
        c.rect(2, y+1, 2, y+4, col['top']); c.rect(13, y+1, 13, y+4, col['top']); c.p(2, y+5, SKIN); c.p(13, y+5, SKIN)
    elif o == 'blouse_skirt':
        c.rect(3, y, 12, y+3, col['top']); c.rect(2, y+1, 2, y+3, col['top']); c.rect(13, y+1, 13, y+3, col['top'])
        c.p(2, y+4, SKIN); c.p(13, y+4, SKIN)
        c.rect(4, y+4, 11, y+4, col['skirt']); c.rect(3, y+5, 12, y+6, col['skirt']); c.rect(3, y+7, 12, y+7, col['skirt'])
    # accessory
    acc = ch.get('acc')
    if acc == 'bag': c.rect(14, y+3, 15, y+6, col['acc']); c.p(14, y+2, K); c.p(15, y+2, K)
    if acc == 'briefcase': c.rect(13, y+5, 15, y+8, col['acc']); c.p(14, y+4, K)

def body_back(c, ch, frame):
    o = ch['outfit']; col = ch['col']; bob = -1 if frame else 0; y = 13 + bob
    if o in ('hoodie', 'hoodie_cape', 'vig'):
        base = col['top']
        if o in ('hoodie_cape', 'vig'):
            cp = col['cape']; c.rect(2, y, 13, y+8, cp); c.rect(1, y+1, 1, y+8, cp); c.rect(14, y+1, 14, y+8, cp)
            c.rect(3, y, 12, y, base)
        else:
            c.rect(3, y, 12, y+5, base); c.rect(4, y, 11, y+1, col['top_s'])     # hood on the back
            c.rect(2, y+1, 2, y+4, base); c.rect(13, y+1, 13, y+4, base)
    elif o == 'suit':
        c.rect(3, y, 12, y+5, col['top']); c.rect(2, y+1, 2, y+4, col['top']); c.rect(13, y+1, 13, y+4, col['top'])
    elif o == 'blouse_skirt':
        c.rect(3, y, 12, y+3, col['top']); c.rect(2, y+1, 2, y+3, col['top']); c.rect(13, y+1, 13, y+3, col['top'])
        c.rect(4, y+4, 11, y+4, col['skirt']); c.rect(3, y+5, 12, y+7, col['skirt'])
    acc = ch.get('acc')
    if acc == 'bag': c.rect(0, y+3, 1, y+6, col['acc'])
    if acc == 'briefcase': c.rect(0, y+5, 2, y+8, col['acc'])

def body_side(c, ch, frame):
    o = ch['outfit']; col = ch['col']; bob = -1 if frame else 0; y = 13 + bob
    if o in ('hoodie', 'hoodie_cape', 'vig'):
        base = col['top']
        if o in ('hoodie_cape', 'vig'): c.rect(2, y, 5, y+8, col['cape']); c.p(1, y+3, col['cape']); c.p(1, y+6, col['cape'])
        c.rect(5, y, 11, y+5, base); c.rect(6, y, 10, y, col['top_s'])
        if o == 'vig': c.rect(9, y+1, 10, y+2, col['emblem'])
        c.rect(8, y+1, 9, y+4, col['top_s']); c.p(9, y+5, SKIN)                    # near arm
    elif o == 'suit':
        c.rect(5, y, 11, y+5, col['top']); c.rect(10, y, 10, y+2, W); c.p(10, y, col['tie']); c.rect(8, y+1, 9, y+4, col['top']); c.p(9, y+5, SKIN)
    elif o == 'blouse_skirt':
        c.rect(5, y, 11, y+3, col['top']); c.rect(8, y+1, 9, y+3, col['top']); c.p(9, y+4, SKIN)
        c.rect(5, y+4, 11, y+4, col['skirt']); c.rect(4, y+5, 12, y+7, col['skirt'])
    acc = ch.get('acc')
    if acc == 'bag': c.rect(12, y+3, 13, y+6, col['acc']); c.p(12, y+2, K)
    if acc == 'briefcase': c.rect(11, y+5, 13, y+8, col['acc']); c.p(12, y+4, K)

def legs_front(c, ch, frame):
    """frame 0 stand, 1 left step, 2 right step. Skirt outfits show skin legs."""
    o = ch['outfit']; col = ch['col']
    skirt = o == 'blouse_skirt'
    leg = SKIN if skirt else col['pants']; shoe = col['shoe']
    top = 21 if skirt else 19
    lift_l = 1 if frame == 1 else 0; lift_r = 1 if frame == 2 else 0
    if frame: top -= 1
    # left leg (viewer's left)
    c.rect(5, top, 6, 21 - lift_l, leg); c.rect(5, 22 - lift_l, 6, 23 - lift_l, shoe)
    c.rect(9, top, 10, 21 - lift_r, leg); c.rect(9, 22 - lift_r, 10, 23 - lift_r, shoe)
    if skirt and frame == 0: c.rect(5, 21, 10, 21, leg)

def legs_side(c, ch, frame):
    o = ch['outfit']; col = ch['col']
    skirt = o == 'blouse_skirt'
    leg = SKIN if skirt else col['pants']; shoe = col['shoe']
    top = 21 if skirt else 19
    if frame == 0:
        c.rect(6, top, 7, 21, leg); c.rect(8, top, 9, 21, leg); c.rect(6, 22, 9, 23, shoe)
    elif frame == 1:   # front leg forward, back leg back
        c.rect(9, top - 1, 10, 21, leg); c.rect(9, 22, 11, 23, shoe)
        c.rect(5, top - 1, 6, 21, leg); c.rect(4, 22, 6, 23, shoe)
    else:              # crossing: legs together, slight lift
        c.rect(7, top - 1, 8, 21, leg); c.rect(6, 22, 9, 22, shoe); c.p(7, 23, shoe); c.p(8, 23, shoe)

# ---------------- assembly ----------------

def draw(ch, direction, frame):
    c = Canvas()
    if direction == 'down':
        legs_front(c, ch, frame); body_front(c, ch, frame); head_front(c, ch, frame)
    elif direction == 'up':
        legs_front(c, ch, frame); body_back(c, ch, frame); head_back(c, ch, frame)
    else:
        legs_side(c, ch, frame); body_side(c, ch, frame); head_side(c, ch, frame)
    c.outline()
    return c.im

BLUE = (74, 144, 217); BLUE_S = (47, 108, 179)
CHARS = {
  # hero costume tiers
  'hero':      dict(style='short', hair=(43,43,58), outfit='hoodie', acc='bag', col=dict(top=BLUE, top_s=BLUE_S, pants=(58,58,74), shoe=(200,60,70), acc=(232,93,117))),
  'hero_mask': dict(style='short', hair=(43,43,58), outfit='hoodie', acc='bag', mask=(110,70,170), col=dict(top=BLUE, top_s=BLUE_S, pants=(58,58,74), shoe=(200,60,70), acc=(70,50,110))),
  'hero_cape': dict(style='short', hair=(43,43,58), outfit='hoodie_cape', mask=(110,70,170), col=dict(top=(52,62,120), top_s=(38,46,92), pants=(40,40,56), shoe=(200,60,70), cape=(70,50,110), acc=(70,50,110))),
  'hero_vig':  dict(style='cowl', hair=(35,35,58), cowl=(35,35,58), outfit='vig', col=dict(top=(35,35,58), top_s=(28,28,46), pants=(35,35,58), shoe=(200,60,70), cape=(70,50,110), emblem=(255,210,60))),
  'hero_gold': dict(style='cowl', hair=(90,70,20), cowl=(120,95,30), outfit='vig', col=dict(top=(120,95,30), top_s=(90,70,20), pants=(90,70,20), shoe=(60,40,20), cape=(200,160,50), emblem=(255,240,150))),
  # pervs
  'perv':  dict(style='slick', hair=(43,43,58), glasses=True, outfit='suit', acc='briefcase', col=dict(top=(42,42,53), tie=(200,50,50), pants=(42,42,53), shoe=(30,30,40), acc=(107,75,42))),
  'perv2': dict(style='slick', hair=(90,60,40), glasses=True, outfit='suit', acc='briefcase', col=dict(top=(90,90,110), tie=(60,120,220), pants=(90,90,110), shoe=(30,30,40), acc=(60,60,70))),
  # targets
  'target':   dict(style='long', hair=(120,70,40), blush=True, outfit='blouse_skirt', col=dict(top=W, skirt=(200,60,70), pants=SKIN, shoe=(43,43,58))),
  'shopper3': dict(style='bob', hair=(43,43,58), blush=True, outfit='blouse_skirt', col=dict(top=(240,240,250), skirt=(60,120,220), pants=SKIN, shoe=(43,43,58))),
  # background shoppers
  'shopper1': dict(style='short', hair=(120,70,40), outfit='hoodie', acc='bag', col=dict(top=(90,180,120), top_s=(58,128,72), pants=(58,58,74), shoe=(43,43,58), acc=(232,93,117))),
  'shopper2': dict(style='bob', hair=(240,130,170), outfit='hoodie', acc='bag', col=dict(top=(240,160,60), top_s=(200,120,40), pants=(58,58,74), shoe=(43,43,58), acc=(90,180,120))),
}

def build():
    frames = {}
    for name, ch in CHARS.items():
        for d in ('down', 'up', 'side'):
            for f in range(3):
                im = draw(ch, d, f); key = f'{name}_{d}_{f}'; frames[key] = im
                im.save(os.path.join(OUT, key + '.png'))
    # preview sheet
    S = 5; names = list(CHARS); sheet = Image.new('RGBA', (len(names) * (16 * S + 6) + 20, 9 * (24 * S + 4) + 30), (40, 40, 52, 255))
    d = ImageDraw.Draw(sheet)
    for i, n in enumerate(names):
        d.text((10 + i * (16 * S + 6), 4), n[:9], fill=(255, 255, 255))
        r = 0
        for dd in ('down', 'up', 'side'):
            for f in range(3):
                sheet.paste(frames[f'{n}_{dd}_{f}'].resize((16 * S, 24 * S), Image.NEAREST), (10 + i * (16 * S + 6), 20 + r * (24 * S + 4))); r += 1
    sheet.save(os.path.join(OUT, '_preview.png'))
    return frames

if __name__ == '__main__':
    fr = build(); print(len(fr), 'frames ->', OUT)
