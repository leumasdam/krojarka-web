# -*- coding: utf-8 -*-
"""Otvorí web v okne presne ako iPhone 16 Pro Max (440×956 CSS px, 3×, dotyk, mobilný Safari UA).

    python tools/phone.py                       # ostrý web
    python tools/phone.py http://localhost:5178 # lokálny server
    python tools/phone.py --pro                 # iPhone 16 Pro (402×874)

Okno nechaj otvorené, zavri ho, keď skončíš (skript sa potom sám ukončí).
"""
import sys, time
from playwright.sync_api import sync_playwright

pro = '--pro' in sys.argv
args = [a for a in sys.argv[1:] if not a.startswith('--')]
url = (args[0] if args else 'https://leumasdam.github.io/krojarka-web/') + ('&' if '?' in (args[0] if args else '') else '?') + f'x={int(time.time())}'
w, h = (402, 874) if pro else (440, 956)
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', headless=False, args=[f'--window-size={w},{h + 90}', '--hide-scrollbars'])
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=3, is_mobile=True, has_touch=True, user_agent=UA)
    page = ctx.new_page()
    page.goto(url)
    print(f'iPhone 16 {"Pro" if pro else "Pro Max"} · {w}×{h} · {url}')
    try:
        while not page.is_closed():
            time.sleep(.5)
    except Exception:
        pass
    b.close()
