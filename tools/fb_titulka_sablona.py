# -*- coding: utf-8 -*-
"""Vyrobi sablonu FB titulnej fotky s vyznacenou bezpecnou zonou.

Preco to treba: Facebook zobrazuje tu istu titulku v dvoch roznych vyrezoch.
Na pocitaci 820 x 312 (pomer 2,628), v mobile 640 x 360 (pomer 1,778).
Pri nahratom 1640 x 624 sa v mobile ukaze len stredny pas siroky 1109 px,
zvysok je orezany. Vsetko podstatne preto musi byt v tom strede.

Navyse na pocitaci prekryva lavy dolny roh titulky profilova fotka.

Spustenie:
    python tools/fb_titulka_sablona.py
"""
import os

from PIL import Image, ImageDraw, ImageFont

W, H = 1640, 624                      # odporucane nahratie
MOBIL_W = int(round(H * 640 / 360))   # sirka, ktoru vidi mobil = 1109 px
OKRAJ = (W - MOBIL_W) // 2            # kolko sa v mobile orezhe z kazdej strany

CREAM = (243, 238, 228)
WINE = (140, 26, 42)
INK = (28, 30, 34)
SHADE = (28, 30, 34, 90)

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logo")


def font(size, bold=False):
    for name in (("arialbd.ttf" if bold else "arial.ttf"), "segoeui.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


img = Image.new("RGB", (W, H), CREAM)
d = ImageDraw.Draw(img, "RGBA")

# pasy, ktore mobil orezhe
d.rectangle([0, 0, OKRAJ, H], fill=SHADE)
d.rectangle([W - OKRAJ, 0, W, H], fill=SHADE)

# bezpecna zona
d.rectangle([OKRAJ, 0, W - OKRAJ - 1, H - 1], outline=WINE, width=3)

# miesto, kde na pocitaci sedi profilova fotka
pfp_x, pfp_d = 40, 352
d.ellipse([pfp_x, H - pfp_d // 2 - 10, pfp_x + pfp_d, H + pfp_d // 2 - 10],
          outline=WINE, width=3)
d.text((pfp_x + 30, H - 80), "profilová fotka", font=font(22), fill=WINE)

# popisy
d.text((OKRAJ + 24, 24), "BEZPEČNÁ ZÓNA · %d × %d px" % (MOBIL_W, H),
       font=font(26, True), fill=WINE)
d.text((OKRAJ + 24, 60), "toto uvidí počítač aj mobil", font=font(22), fill=INK)

d.text((24, 24), "OREŽE SA", font=font(20, True), fill=(255, 255, 255))
d.text((24, 50), "v mobile", font=font(20), fill=(255, 255, 255))
d.text((W - OKRAJ + 24, 24), "OREŽE SA", font=font(20, True), fill=(255, 255, 255))
d.text((W - OKRAJ + 24, 50), "v mobile", font=font(20), fill=(255, 255, 255))

d.text((24, H - 40), "%d × %d px · nahrať v tejto veľkosti" % (W, H),
       font=font(22), fill=INK)
d.text((W - 300, H - 40), "okraj %d px" % OKRAJ, font=font(22), fill=INK)

p = os.path.join(OUT, "fb-titulka-sablona-1640x624.png")
img.save(p)
print("hotovo:", p)
print("plátno %d x %d, bezpečná zóna %d x %d, okraj %d px z každej strany"
      % (W, H, MOBIL_W, H, OKRAJ))
