# -*- coding: utf-8 -*-
"""Nahrá prechádzanie webu po snímkach (30 fps) s plynulým scrollom.

Snímanie jednej snímky trvá dlhšie než 1/30 s, preto sa stránka spomalí:
CSS animácie cez CDP (Animation.setPlaybackRate), časovače a videá cez init skript.
Výsledné snímky potom pri 30 fps bežia v správnom tempe.

    python tools/record.py            # všetky scény do video/frames/<scéna>/
"""
import os, sys, time, math
from playwright.sync_api import sync_playwright

BASE = 'http://localhost:5178/'
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'video', 'frames')
W, H, FPS = 1536, 960, 30
RATE = 0.2                       # 1 snímka = 1/30 s videa = 167 ms reálneho času
STEP = (1 / FPS) / RATE

INIT = """
(() => {
  const R = %s;
  const st = window.setTimeout, si = window.setInterval;
  window.setTimeout = (f, d, ...a) => st(f, (d || 0) / R, ...a);
  window.setInterval = (f, d, ...a) => si(f, (d || 0) / R, ...a);
  const slow = () => document.querySelectorAll('video').forEach(v => { try { v.playbackRate = Math.max(R, 0.07); } catch (e) {} });
  document.addEventListener('DOMContentLoaded', () => { slow(); st(slow, 1500); st(slow, 4000); });
})();
""" % RATE
CSS = 'html{scroll-behavior:auto!important} ::-webkit-scrollbar{display:none} .progress-thread,.sc-nav{display:none!important}'

ease = lambda t: t * t * t * (t * (6 * t - 15) + 10)          # smootherstep


def scenes(page):
    """Vráti zoznam (názov, url, kroky). Kroky: ('hold', n) ('click', sel) ('scroll', y, n)."""
    return [
        ('01-home', 'index.html', lambda q: [
            ('hold', 30), ('click', '#next'), ('hold', 52), ('click', '#next'), ('hold', 56),
            ('scroll', q('#macro', 1) - H, 215), ('hold', 8),
            ('scroll', q('#remeslo') + 110, 62), ('hold', 28),
            ('scroll', q('#kroje') - 30, 96), ('hold', 30),
            ('scroll', q('#regiony') - 10, 54), ('hold', 44),
        ]),
        ('02-o-krojarke', 'o-krojarke.html', lambda q: [
            ('hold', 36), ('scroll', q('.sc-wrap:nth-of-type(2)') + 60, 70), ('hold', 16),
            ('scroll', q('.sc-wrap:nth-of-type(3)') + 60, 64), ('hold', 16),
            ('scroll', q('.sc-wrap:nth-of-type(4)', 1) - H - 40, 96), ('hold', 10),
            ('scroll', q('.sc-wrap:nth-of-type(5)', 1) - H - 20, 170), ('hold', 8),
            ('scroll', q('.sc-wrap:nth-of-type(6)', 1) - H, 70), ('hold', 34),
        ]),
        ('03-muzeum', 'podpor-nas.html', lambda q: [
            ('hold', 12), ('scroll', q('.mz-wrap', 1) - H, 170), ('hold', 26),
            ('scroll', q('#podporit') - 60, 56), ('hold', 30),
        ]),
    ]


def main():
    only = sys.argv[1:] or None
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome', headless=True, args=['--hide-scrollbars', '--force-device-scale-factor=1'])
        ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1)
        ctx.add_init_script(INIT)
        page = ctx.new_page()
        for name, url, plan in scenes(page):
            if only and name not in only:
                continue
            d = os.path.join(OUT, name); os.makedirs(d, exist_ok=True)
            for f in os.listdir(d): os.remove(os.path.join(d, f))
            page.goto(BASE + url + '?rec=1'); page.wait_for_load_state('networkidle')
            page.add_style_tag(content=CSS)
            page.evaluate('document.fonts.ready')
            # prednačítaj lazy obrázky, inak sa pri scrolle objavujú prázdne miesta
            page.evaluate("""async () => {
              document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager');
              for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => requestAnimationFrame(() => r())); }
              await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
              scrollTo(0, 0);
            }""")
            page.reload(); page.wait_for_load_state('networkidle'); page.add_style_tag(content=CSS)
            cdp = ctx.new_cdp_session(page)
            cdp.send('Animation.enable'); cdp.send('Animation.setPlaybackRate', {'playbackRate': RATE})
            page.wait_for_timeout(int(1200 / 1))

            def q(sel, end=0):
                return page.evaluate("""([s, e]) => { const el = document.querySelector(s); return el.offsetTop + (e ? el.offsetHeight : 0); }""", [sel, end])
            steps = plan(q)
            maxy = page.evaluate('document.body.scrollHeight') - H
            y, n, t0, slow = 0.0, 0, time.perf_counter(), 0
            for st in steps:
                if st[0] == 'click':
                    page.click(st[1]); continue
                frames = st[1] if st[0] == 'hold' else st[2]
                y0, y1 = y, (y if st[0] == 'hold' else max(0, min(maxy, st[1])))
                for i in range(frames):
                    y = y0 + (y1 - y0) * ease((i + 1) / frames)
                    page.evaluate('y => window.scrollTo(0, y)', y)
                    target = t0 + (n + 1) * STEP
                    wait = target - time.perf_counter() - 0.06
                    if wait > 0: time.sleep(wait)
                    else: slow += 1
                    page.screenshot(path=os.path.join(d, f'{n:05d}.jpg'), type='jpeg', quality=92)
                    n += 1
            print(name, 'frames', n, 'late', slow, 'secs', round(time.perf_counter() - t0), flush=True)
            cdp.detach()
        b.close()


if __name__ == '__main__':
    main()
