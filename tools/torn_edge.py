# -*- coding: utf-8 -*-
"""Vygeneruje dlazdicu otrhanej papierovej hrany ako SVG path pre CSS masku.

Hrana musi byt bezsva: prvy a posledny bod maju rovnaku vysku, aby sa
dlazdica dala opakovat cez repeat-x bez viditelneho styku.
"""
import random

W, H = 300, 18          # sirka a vyska dlazdice
BASE = 7                # zakladna linia, nad nou je papier
AMP = 4.5               # ako hlboko siaha trhanie
STEP = 6                # hustota zubov
SEED = 7

random.seed(SEED)
pts = []
x = 0
while x <= W:
    if x == 0 or x >= W:
        y = BASE
    else:
        # dva sumy: pomala vlna + drobne vlakna papiera
        slow = AMP * 0.6 * random.uniform(-1, 1)
        fine = AMP * 0.5 * random.uniform(-1, 1)
        y = BASE + slow + fine
        y = max(1.5, min(H - 1.5, y))
    pts.append((round(x, 1), round(y, 1)))
    x += STEP + random.uniform(-1.5, 1.5)

# bezsvy styk: posledny bod musi sediet presne na W a na zakladnej linii
if pts[-1][0] != W:
    pts.append((W, BASE))
else:
    pts[-1] = (W, BASE)

d = "M0 0 H%d V%s " % (W, pts[-1][1])
for px, py in reversed(pts[:-1]):
    d += "L%s %s " % (px, py)
d += "Z"

svg = ("%%3Csvg xmlns='http://www.w3.org/2000/svg' width='%d' height='%d' "
       "viewBox='0 0 %d %d'%%3E%%3Cpath fill='%%23000' d='%s'/%%3E%%3C/svg%%3E"
       % (W, H, W, H, d))
print("--- CSS maska (%d bodov) ---" % len(pts))
print('url("data:image/svg+xml,%s")' % svg)
