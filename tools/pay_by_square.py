# -*- coding: utf-8 -*-
"""Generator platobnych QR kodov v slovenskom standarde PAY by square.

Kniznica pre Python neexistuje, format je preto naprogramovany rucne podla
specifikacie. Postup je:

  1. udaje platby sa poskladaju do retazca oddeleneho tabulatormi
  2. pred ne sa da CRC32 toho retazca (4 bajty, little endian)
  3. vsetko sa skomprimuje LZMA1 v surovom rezime (lc=3, lp=0, pb=2, 128 kB)
  4. pred to ide hlavicka: 2 bajty typu a verzie + 2 bajty dlzky pred kompresiou
  5. vysledok sa zakoduje do base32hex bez vyplnovych znakov

Spustenie:
    python tools/pay_by_square.py --iban SK0000000000000000000000 ^
        --prijemca "OZ Tym spravnym smerom" --vs 2026 --ukazka

Kym nie je zadany skutocny IBAN, nechaj prepinac --ukazka. Cez kod sa
vykresli vodoznak, aby nikto omylom neposlal peniaze na neplatny ucet.
"""
import argparse
import base64
import binascii
import lzma
import os

import segno
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "img", "qr")

# poradie poli je dane specifikaciou, nesmie sa menit
POLIA = [
    "invoice_id", "pocet_platieb", "moznosti_platby", "suma", "mena",
    "splatnost", "vs", "ks", "ss", "referencia", "poznamka",
    "pocet_uctov", "iban", "bic", "trvaly_prikaz", "inkaso",
    "prijemca", "adresa1", "adresa2",
]


def tabbed(**kw):
    """Poskladá retazec platby v poradí, ktoré žiada špecifikácia."""
    return "\t".join(str(kw.get(p, "")) for p in POLIA)


def zakoduj(data):
    """Z retazca platby spraví text, ktorý sa vkladá do QR kódu."""
    telo = data.encode("utf-8")
    crc = binascii.crc32(telo) & 0xFFFFFFFF
    payload = crc.to_bytes(4, "little") + telo

    komp = lzma.LZMACompressor(
        format=lzma.FORMAT_RAW,
        filters=[{"id": lzma.FILTER_LZMA1, "dict_size": 128 * 1024,
                  "lc": 3, "lp": 0, "pb": 2}],
    )
    stlacene = komp.compress(payload) + komp.flush()

    hlavicka = bytes([0x00, 0x00]) + len(payload).to_bytes(2, "little")
    return base64.b32hexencode(hlavicka + stlacene).decode("ascii").rstrip("=")


def dekoduj(kod):
    """Spätný prevod, slúži len na kontrolu, že kodér nestráca údaje."""
    surove = base64.b32hexdecode(kod + "=" * (-len(kod) % 8))
    dlzka = int.from_bytes(surove[2:4], "little")
    dek = lzma.LZMADecompressor(
        format=lzma.FORMAT_RAW,
        filters=[{"id": lzma.FILTER_LZMA1, "dict_size": 128 * 1024,
                  "lc": 3, "lp": 0, "pb": 2}],
    )
    payload = dek.decompress(surove[4:], max_length=dlzka)
    crc = int.from_bytes(payload[:4], "little")
    telo = payload[4:]
    if binascii.crc32(telo) & 0xFFFFFFFF != crc:
        raise ValueError("kontrolný súčet nesedí")
    return telo.decode("utf-8")


def vodoznak(img):
    d = ImageDraw.Draw(img, "RGBA")
    w, h = img.size
    t = "UKÁŽKA · NEPLATNÝ ÚČET"
    # veľkosť písma sa zmenšuje, kým sa text nezmestí do šírky kódu
    velkost = int(h * 0.09)
    while velkost > 8:
        try:
            f = ImageFont.truetype("arialbd.ttf", velkost)
        except OSError:
            f = ImageFont.load_default()
            break
        if d.textbbox((0, 0), t, font=f)[2] <= w * 0.88:
            break
        velkost -= 2
    bb = d.textbbox((0, 0), t, font=f)
    vyska = bb[3] - bb[1]
    stred = h // 2
    d.rectangle([0, stred - vyska, w, stred + vyska], fill=(140, 26, 42, 225))
    d.text(((w - bb[2]) / 2, stred - vyska / 2 - bb[1] / 2), t, font=f, fill=(255, 255, 255, 255))
    return img


def kod_pre(suma, args):
    data = tabbed(
        invoice_id="", pocet_platieb=1, moznosti_platby=1,
        suma=("%.2f" % suma) if suma else "", mena="EUR", splatnost="",
        vs=args.vs, ks="", ss="", referencia="",
        poznamka=args.poznamka, pocet_uctov=1,
        iban=args.iban.replace(" ", ""), bic="",
        trvaly_prikaz=0, inkaso=0,
        prijemca=args.prijemca, adresa1=args.adresa, adresa2="",
    )
    kod = zakoduj(data)
    if dekoduj(kod) != data:
        raise SystemExit("kodér stráca údaje, nepokračujem")
    return kod


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--iban", required=True)
    p.add_argument("--prijemca", required=True)
    p.add_argument("--vs", default="")
    p.add_argument("--poznamka", default="Dar na muzeum krojov")
    p.add_argument("--adresa", default="")
    p.add_argument("--sumy", default="10,20,50,100")
    p.add_argument("--ukazka", action="store_true",
                   help="cez kód vykreslí vodoznak, kým nie je známy skutočný IBAN")
    a = p.parse_args()

    os.makedirs(OUT, exist_ok=True)
    sumy = [float(s) for s in a.sumy.split(",") if s.strip()] + [0]
    print("QR kódy do %s\n" % OUT)
    for s in sumy:
        kod = kod_pre(s, a)
        nazov = ("qr-%d.png" % s) if s else "qr-volna-suma.png"
        q = segno.make(kod, error="m")
        cesta = os.path.join(OUT, nazov)
        q.save(cesta, scale=10, border=2, dark="#1e1a17", light="#f3efe6")
        if a.ukazka:
            vodoznak(Image.open(cesta).convert("RGB")).save(cesta)
        print("  %-20s %4s EUR   %d znakov v kóde" % (nazov, int(s) if s else "—", len(kod)))

    print("\nHOTOVO. Pred spustením naskenuj aspoň jeden kód bankovou aplikáciou")
    print("a skontroluj, či sa predvyplnil účet, suma aj variabilný symbol.")


if __name__ == "__main__":
    main()
