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
  window.__recRate = R;
  const st = window.setTimeout, si = window.setInterval;
  window.setTimeout = (f, d, ...a) => st(f, (d || 0) / R, ...a);
  window.setInterval = (f, d, ...a) => si(f, (d || 0) / R, ...a);
  const slow = () => document.querySelectorAll('video').forEach(v => { try { v.playbackRate = Math.max(R, 0.07); } catch (e) {} });
  document.addEventListener('DOMContentLoaded', () => { slow(); st(slow, 1500); st(slow, 4000); });
})();
""" % RATE
CSS = 'html{scroll-behavior:auto!important} ::-webkit-scrollbar{display:none} .progress-thread,.sc-nav{display:none!important}'

HAND = """
(() => {
  // vlastná ruka: dlaň a prsty zo zaoblených obdĺžnikov, obrys len po vonkajšej hrane
  const parts = g => [
    `<rect x="12" y="${g ? 25 : 22}" width="24" height="${g ? 18 : 21}" rx="9"/>`,
    `<rect x="12.4" y="${g ? 19 : 9}"  width="5.4" height="${g ? 12 : 21}" rx="2.7"/>`,
    `<rect x="18.5" y="${g ? 17 : 5}"  width="5.4" height="${g ? 14 : 24}" rx="2.7"/>`,
    `<rect x="24.6" y="${g ? 17.5 : 6.5}" width="5.4" height="${g ? 14 : 23}" rx="2.7"/>`,
    `<rect x="30.7" y="${g ? 20 : 11}" width="5.3" height="${g ? 11 : 19}" rx="2.65"/>`,
    `<rect x="5" y="${g ? 25 : 23}" width="6.4" height="${g ? 13 : 16}" rx="3.2" transform="rotate(${g ? -12 : -32} 8 ${g ? 32 : 31})"/>`,
  ].join('');
  const svg = g => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="62" height="62">` +
    `<g fill="#181614" stroke="#181614" stroke-width="3.2" stroke-linejoin="round">${parts(g)}</g><g fill="#fffdf8">${parts(g)}</g></svg>`;
  const el = document.createElement('div');
  el.id = 'rec-hand';
  el.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;pointer-events:none;width:62px;height:62px;margin:-34px 0 0 -31px;opacity:0;' +
    'transition:opacity .5s, transform .25s cubic-bezier(.16,1,.3,1);filter:drop-shadow(0 8px 14px rgba(24,22,20,.35));will-change:transform';
  el.innerHTML = svg(false);
  document.body.appendChild(el);
  let x = 0, y = 0, down = false;
  const put = () => { el.style.transform = `translate3d(${x}px,${y}px,0) scale(${down ? .9 : 1}) rotate(${down ? -4 : 0}deg)`; };
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; el.style.opacity = 1; put(); }, true);
  addEventListener('mousedown', () => { down = true; el.innerHTML = svg(true); put(); }, true);
  addEventListener('mouseup', () => { down = false; el.innerHTML = svg(false); put(); }, true);
  window.__hideHand = () => { el.style.opacity = 0; };
})();
"""

ease = lambda t: t * t * t * (t * (6 * t - 15) + 10)          # smootherstep


def scenes(page):
    """Vráti zoznam (názov, url, kroky). Kroky: ('hold', n) ('click', sel) ('scroll', y, n)."""
    return [
        ('01-home', 'index.html', lambda q: [
            ('hold', 26),
            ('move', 1180, 760, 1), ('move', 800, 600, 30), ('hold', 8),
            ('down',), ('move', 470, 592, 24), ('up',), ('hold', 52),          # potiahnutie doľava: ďalší kroj
            ('move', 640, 600, 14), ('hold', 6),
            ('down',), ('move', 990, 608, 26), ('up',), ('hold', 56),          # späť na červený kroj
            ('move', 1330, 800, 24), ('hide',), ('hold', 12),
            ('scroll', q('#macro') + 4, 46),
            ('glide', q('#macro', 1) - H, 330), ('hold', 20),      # rovnomerne cez celé priblíženie
            ('scroll', q('#remeslo') + 110, 64), ('hold', 30),
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
            page.evaluate(HAND)
            page.wait_for_timeout(1200)

            def q(sel, end=0):
                return page.evaluate("""([s, e]) => { const el = document.querySelector(s); return el.offsetTop + (e ? el.offsetHeight : 0); }""", [sel, end])
            steps = plan(q)
            maxy = page.evaluate('document.body.scrollHeight') - H
            y, n, t0, slow = 0.0, 0, time.perf_counter(), 0
            mx, my = 1180.0, 760.0

            def shot():
                nonlocal n, slow
                wait = t0 + (n + 1) * STEP - time.perf_counter() - 0.06
                if wait > 0: time.sleep(wait)
                else: slow += 1
                page.screenshot(path=os.path.join(d, f'{n:05d}.jpg'), type='jpeg', quality=92)
                n += 1

            for st in steps:
                k = st[0]
                if k == 'click': page.click(st[1])
                elif k == 'down': page.mouse.down()
                elif k == 'up': page.mouse.up()
                elif k == 'hide': page.evaluate('window.__hideHand()')
                elif k == 'move':
                    x0, y0m, x1, y1m, fr = mx, my, st[1], st[2], st[3]
                    for i in range(fr):
                        t = ease((i + 1) / fr)
                        mx, my = x0 + (x1 - x0) * t, y0m + (y1m - y0m) * t
                        page.mouse.move(mx, my)
                        shot()
                else:
                    frames = st[1] if k == 'hold' else st[2]
                    ez = (lambda t: .75 * t + .25 * t * t * (3 - 2 * t)) if k == 'glide' else ease
                    ys, ye = y, (y if k == 'hold' else max(0, min(maxy, st[1])))
                    for i in range(frames):
                        y = ys + (ye - ys) * ez((i + 1) / frames)
                        page.evaluate('y => window.scrollTo(0, y)', y)
                        shot()
            print(name, 'frames', n, 'late', slow, 'secs', round(time.perf_counter() - t0), flush=True)
            cdp.detach()
        b.close()


if __name__ == '__main__':
    main()
