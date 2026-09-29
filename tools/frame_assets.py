# -*- coding: utf-8 -*-
"""Pozadie a rám okna prehliadača pre video (1920x1080 na šírku, 1080x1920 na výšku).

bg_*.png     pozadie s tieňom okna a lištou prehliadača
mask_*.png   to isté s priehľadným otvorom na obsah (prekryje rohy videa do oblúka)
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'video')
CREAM, INK, RED = (243, 239, 230), (24, 22, 20), (167, 15, 25)
BAR = 44


def font(size, bold=False):
    for f in (['georgiab.ttf', 'timesbd.ttf'] if bold else ['georgia.ttf', 'times.ttf']):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            pass
    return ImageFont.load_default()


def sans(size):
    for f in ('segoeui.ttf', 'arial.ttf'):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            pass
    return ImageFont.load_default()


def build(name, W, H, cw, ch, cx, cy, title=None, sub=None):
    """cw×ch = veľkosť obsahu (videa), cx,cy = ľavý horný roh obsahu."""
    S = 2
    bg = Image.new('RGB', (W * S, H * S), CREAM)
    d = ImageDraw.Draw(bg)
    # jemný prechod pozadia
    for y in range(H * S):
        k = y / (H * S)
        d.line([(0, y), (W * S, y)], fill=tuple(int(a + (b - a) * k) for a, b in zip((247, 243, 235), (233, 226, 212))))
    # tieň okna
    sh = Image.new('L', (W * S, H * S), 0)
    ImageDraw.Draw(sh).rounded_rectangle([(cx) * S, (cy - BAR + 26) * S, (cx + cw) * S, (cy + ch + 26) * S], 28 * S, fill=150)
    sh = sh.filter(ImageFilter.GaussianBlur(46 * S))
    bg.paste(Image.new('RGB', bg.size, (60, 40, 25)), (0, 0), sh)
    d = ImageDraw.Draw(bg)
    # okno s lištou
    d.rounded_rectangle([cx * S, (cy - BAR) * S, (cx + cw) * S, (cy + ch) * S], 16 * S, fill=(250, 247, 240))
    for i, c in enumerate([(226, 96, 86), (230, 184, 76), (110, 190, 100)]):
        x = cx + 22 + i * 20
        d.ellipse([(x - 6) * S, (cy - BAR / 2 - 6) * S, (x + 6) * S, (cy - BAR / 2 + 6) * S], fill=c)
    pw = min(420, cw - 260)
    d.rounded_rectangle([(cx + cw / 2 - pw / 2) * S, (cy - BAR + 9) * S, (cx + cw / 2 + pw / 2) * S, (cy - 9) * S], 13 * S, fill=(236, 230, 218))
    f = sans(15 * S)
    t = 'krojarka.sk'
    tw = d.textlength(t, font=f)
    d.text(((cx + cw / 2) * S - tw / 2, (cy - BAR / 2 - 10) * S), t, font=f, fill=(90, 84, 76))
    if title:
        f1 = font(64 * S)
        tw = d.textlength(title, font=f1)
        d.text((W * S / 2 - tw / 2, (cy - BAR - 250) * S), title, font=f1, fill=INK)
        f2 = sans(22 * S)
        tw = d.textlength(sub, font=f2)
        d.text((W * S / 2 - tw / 2, (cy - BAR - 150) * S), sub, font=f2, fill=(124, 117, 107))
        d.line([(W * S / 2 - 40 * S, (cy - BAR - 95) * S), (W * S / 2 + 40 * S, (cy - BAR - 95) * S)], fill=RED, width=2 * S)
        f3 = sans(20 * S)
        b = 'Web pre Krojárku  ·  zenko.sk'
        tw = d.textlength(b, font=f3)
        d.text((W * S / 2 - tw / 2, (cy + ch + 150) * S), b, font=f3, fill=(124, 117, 107))
    bg = bg.resize((W, H), Image.LANCZOS)
    bg.save(os.path.join(OUT, f'bg_{name}.png'))
    # maska: otvor na obsah, dolné rohy do oblúka
    a = Image.new('L', (W * S, H * S), 255)
    da = ImageDraw.Draw(a)
    da.rounded_rectangle([cx * S, (cy - 40) * S, (cx + cw) * S, (cy + ch) * S], 16 * S, fill=0)
    da.rectangle([0, 0, W * S, cy * S - 1], fill=255)
    a = a.resize((W, H), Image.LANCZOS)
    m = bg.convert('RGBA'); m.putalpha(a)
    m.save(os.path.join(OUT, f'mask_{name}.png'))
    print(name, W, H, 'content', cw, ch, 'at', cx, cy)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    build('wide', 1920, 1080, 1536, 960, 192, 82)                     # na šírku: okno 1:1
    build('tall', 1080, 1920, 1000, 625, 40, 690, 'Krojárka', 'ĽUDOVÉ KROJE V NOVOM PRÍBEHU')   # na výšku: okno zmenšené
