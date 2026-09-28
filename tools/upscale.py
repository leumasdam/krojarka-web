# -*- coding: utf-8 -*-
"""
Zvacsi fotky krojov pre zoom v makre a v zasuvke s bodmi.

Preco to nie je len obycajne resize:
  1. Fotky su orezy s priehladnym pozadim. Ak sa RGB zvacsuje aj s ciernymi
     priehladnymi pixelmi, po interpolacii vznikne tmava obruba okolo kroja.
     Preto sa farba najprv rozsiri do priehladnej oblasti (nearest fill).
  2. kroj-fialovy a kroj-cerveny maju jednobitovu masku, cize schodovitu hranu.
     Alfa sa preto zvacsuje zvlast a jemne sa vyhladi, aby hrana bola cista.
  3. Doostrenie sa robi tu pri exporte, nie v prehliadaci, kde sa len
     interpoluje a vysledok je mekky.

Spustenie:
    python tools/upscale.py                # vyrobi varianty do img/
    python tools/upscale.py --factor 2.5   # ine zvacsenie
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "img")

# fotky, ktore sa na webe zoomuju: hero kroje (makro + zasuvka s bodmi)
HERO = [
    "kroj-trukovanie", "kroj-basovsky-v2", "kroj-cerveny", "kroj-modrotlac",
    "kroj-fialovy", "zasterky-pobedim", "cepcenie", "prucel-bucany",
    "kroj-ockovsky-detsky", "krojarka-stroj",
]
# detailne zabery na konci makra a galeria, zobrazuju sa v kruhu az do 980 px
DETAIL = [
    "detail-vysivka", "trukovka-zlata", "detail-modrotlac", "zasterky-foto",
    "detail-stuha", "prucel-foto", "krojarka-stroj",
    "fialovy-brokat", "fialovy-rukav", "fialovy-zastera", "fialovy-zivotik",
]


def extend_edge_colors(rgb, alpha):
    """Rozsiri farbu z nepriehladnych pixelov do priehladnych.

    Bez tohto kroku sa pri zvacseni primiesa do hrany cierna z priehladnej
    oblasti a kroj dostane tmavu obrubu.
    """
    opaque = alpha > 0
    if opaque.all() or not opaque.any():
        return rgb
    # pre kazdy priehladny pixel najdi najblizsi nepriehladny a vezmi jeho farbu
    _, idx = ndimage.distance_transform_edt(~opaque, return_indices=True)
    return rgb[idx[0], idx[1]]


def smooth_alpha(alpha, target, hard):
    """Zvacsi masku a spravi z nej cistu hranu s polotonmi."""
    a = Image.fromarray(alpha, "L").resize(target, Image.BICUBIC)
    if hard:
        # jednobitova maska: rozmazat a znova stiahnut kontrast, aby schody
        # zmizli, ale silueta zostala na svojom mieste
        a = a.filter(ImageFilter.GaussianBlur(1.6))
        arr = np.asarray(a).astype(np.float32) / 255.0
        arr = np.clip((arr - 0.5) * 2.2 + 0.5, 0, 1)      # smerom k ostrej hrane
        arr = arr * arr * (3 - 2 * arr)                    # smoothstep
        a = Image.fromarray((arr * 255).astype(np.uint8), "L")
    else:
        a = a.filter(ImageFilter.GaussianBlur(0.4))
    return a


def upscale(name, factor, quality, sharpen):
    src = os.path.join(IMG, name + ".webp")
    if not os.path.exists(src):
        return "%-26s CHYBA: subor neexistuje" % name

    im = Image.open(src)
    has_alpha = "A" in im.mode
    im = im.convert("RGBA" if has_alpha else "RGB")
    target = (int(round(im.width * factor)), int(round(im.height * factor)))

    if has_alpha:
        arr = np.asarray(im)
        rgb, alpha = arr[:, :, :3], arr[:, :, 3]
        hard = np.count_nonzero((alpha > 8) & (alpha < 247)) == 0
        rgb = extend_edge_colors(rgb, alpha)
        big = Image.fromarray(rgb, "RGB").resize(target, Image.LANCZOS)
        if sharpen:
            big = big.filter(ImageFilter.UnsharpMask(radius=2.0, percent=110, threshold=3))
        big.putalpha(smooth_alpha(alpha, target, hard))
        note = "tvrda maska opravena" if hard else ""
    else:
        big = im.resize(target, Image.LANCZOS)
        if sharpen:
            big = big.filter(ImageFilter.UnsharpMask(radius=2.0, percent=110, threshold=3))
        note = ""

    out = os.path.join(IMG, "%s@%sx.webp" % (name, ("%g" % factor).replace(".", "-")))
    big.save(out, "WEBP", quality=quality, method=6)
    kb = os.path.getsize(out) / 1024
    return "%-26s %5d x %-5d %6d kB  %s" % (
        os.path.basename(out), big.width, big.height, kb, note)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--factor", type=float, default=2.0)
    p.add_argument("--quality", type=int, default=72)
    p.add_argument("--no-sharpen", action="store_true")
    p.add_argument("--only", nargs="*", help="konkretne nazvy bez pripony")
    a = p.parse_args()

    names = a.only if a.only else HERO + DETAIL
    print("zvacsenie %gx, kvalita %d\n" % (a.factor, a.quality))
    total = 0
    for n in names:
        line = upscale(n, a.factor, a.quality, not a.no_sharpen)
        print(" ", line)
        if "kB" in line:
            total += float(line.split("kB")[0].split()[-1])
    print("\nspolu %d suborov, %.1f MB" % (len(names), total / 1024))


if __name__ == "__main__":
    sys.exit(main())
