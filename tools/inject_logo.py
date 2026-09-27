"""Vloží vektorové logo (symbol + wordmark) do index.html ako SVG <symbol> a nahradí textové logo."""
import io, json, re

P = json.load(open('tools/logo-paths.json'))
S, W = P['symbol'], P['wordmark']
H = 'index.html'
h = io.open(H, encoding='utf-8').read()

defs = (f'<symbol id="orn" viewBox="0 0 {S["w"]:.2f} {S["h"]:.2f}"><path fill="currentColor" d="{S["d"]}"/></symbol>\n'
        f'    <symbol id="wordmark" viewBox="0 0 {W["w"]:.2f} {W["h"]:.2f}"><path fill="currentColor" d="{W["d"]}"/></symbol>')
h = re.sub(r'<symbol id="orn".*?</symbol>(\s*<symbol id="wordmark".*?</symbol>)?', lambda m: defs, h, count=1, flags=re.S)

h = h.replace('<span class="logo-word">Krojárka</span>',
              '<svg class="logo-word" viewBox="0 0 %.2f %.2f"><use href="#wordmark"/></svg>' % (W['w'], W['h']))
h = h.replace('<svg class="logo-orn"><use href="#orn"/></svg>',
              '<svg class="logo-orn" viewBox="0 0 %.2f %.2f"><use href="#orn"/></svg>' % (S['w'], S['h']))
h = h.replace('<div class="ft-word" aria-hidden="true">Krojárka</div>',
              '<svg class="ft-word" viewBox="0 0 %.2f %.2f" aria-hidden="true"><use href="#wordmark"/></svg>' % (W['w'], W['h']))
if 'rel="icon"' not in h:
    h = h.replace('<link rel="preconnect" href="https://fonts.googleapis.com">',
                  '<link rel="icon" href="logo/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="logo/favicon.svg">\n<link rel="preconnect" href="https://fonts.googleapis.com">')
io.open(H, 'w', encoding='utf-8').write(h)
print('ok', h.count('#wordmark'), h.count('id="orn"'))
