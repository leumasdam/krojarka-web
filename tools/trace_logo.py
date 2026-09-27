"""Vektorizácia loga Krojárka z referenčnej tabule (refs/logo-system.png).
Výrez -> 8x upscale -> blur -> prah -> potrace -> SVG path."""
import sys
import numpy as np
from PIL import Image, ImageFilter
import potrace

SRC = 'refs/logo-system.png'
UP = 8

CROPS = {
    'symbol':   (455, 462, 600, 598),   # 05 symbol-only
    'wordmark': (70, 482, 330, 560),    # 04 wordmark-only
}

def trace(box, pad=6):
    im = Image.open(SRC).convert('L')
    x0, y0, x1, y1 = box
    im = im.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))
    im = im.resize((im.width * UP, im.height * UP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(UP * .45))
    a = np.array(im) < 128                      # tmavé = tvar
    ys, xs = np.where(a)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    bm = potrace.Bitmap(~a)   # potracer berie False ako výplň
    plist = bm.trace(turdsize=UP * UP * 2, alphamax=1.0, opticurve=True, opttolerance=0.3)
    s = 1 / UP
    d = []
    for curve in plist:
        sp = curve.start_point
        d.append(f'M{sp.x*s:.2f} {sp.y*s:.2f}')
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f'L{seg.c.x*s:.2f} {seg.c.y*s:.2f}L{seg.end_point.x*s:.2f} {seg.end_point.y*s:.2f}')
            else:
                d.append(f'C{seg.c1.x*s:.2f} {seg.c1.y*s:.2f} {seg.c2.x*s:.2f} {seg.c2.y*s:.2f} {seg.end_point.x*s:.2f} {seg.end_point.y*s:.2f}')
        d.append('Z')
    return ''.join(d), a.shape[1] / UP, a.shape[0] / UP

if __name__ == '__main__':
    import json
    out = {k: dict(zip(('d', 'w', 'h'), trace(b))) for k, b in CROPS.items()}
    json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else 'tools/logo-paths.json', 'w'))
    for k, v in out.items(): print(k, round(v['w'], 1), round(v['h'], 1), len(v['d']))
