"""Poskladá SVG varianty loga z vektorizovaných ciest (tools/logo-paths.json) do logo/."""
import json, os

P = json.load(open('tools/logo-paths.json'))
S, W = P['symbol'], P['wordmark']
os.makedirs('logo', exist_ok=True)
INK, PAPER = '#1E1714', '#F3EFE6'
TAG = "font-family=\"'Newsreader','Instrument Serif',Georgia,serif\" font-size=\"{fs}\" letter-spacing=\"{ls}\" text-anchor=\"{a}\""

def sym(x, y, h, fill='currentColor'):
    k = h / S['h']
    return f'<path transform="translate({x:.2f} {y:.2f}) scale({k:.4f})" fill="{fill}" d="{S["d"]}"/>'

def word(x, y, h, fill='currentColor'):
    k = h / W['h']
    return f'<path transform="translate({x:.2f} {y:.2f}) scale({k:.4f})" fill="{fill}" d="{W["d"]}"/>'

def svg(name, w, h, body, title='Krojárka'):
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" role="img" aria-label="{title}"><title>{title}</title>{body}</svg>'
    open(f'logo/{name}.svg', 'w', encoding='utf-8').write(s)

# 04 wordmark, 05 symbol
svg('krojarka-wordmark', W['w'], W['h'], word(0, 0, W['h']))
svg('krojarka-symbol', S['w'], S['h'], sym(0, 0, S['h']))

# 03 kompaktná (navbar): symbol vľavo, wordmark
sh, wh = 100, 64
ww = W['w'] * wh / W['h']; sw = S['w'] * sh / S['h']
svg('krojarka-compact', sw + 22 + ww, sh, sym(0, 0, sh) + word(sw + 22, (sh - wh) / 2 + 6, wh))

# 02 horizontálna: symbol | wordmark + tagline
sh, wh = 150, 80
sw = S['w'] * sh / S['h']; ww = W['w'] * wh / W['h']
x = sw + 26
body = sym(0, 0, sh) + f'<rect x="{x:.1f}" y="6" width="2" height="{sh-12}" fill="currentColor"/>'
tx = x + 26
body += word(tx, 8, wh)
body += f'<text x="{tx + 4:.1f}" y="{8 + wh + 30:.1f}" fill="currentColor" {TAG.format(fs=17, ls=5.4, a="start")}>ĽUDOVÉ KROJE</text>'
body += f'<text x="{tx + 4:.1f}" y="{8 + wh + 54:.1f}" fill="currentColor" {TAG.format(fs=17, ls=5.4, a="start")}>V NOVOM PRÍBEHU</text>'
svg('krojarka-horizontal', tx + ww + 4, sh, body)

# 01 hlavné vertikálne: symbol nad wordmarkom + tagline
ww = 400; wh = W['h'] * ww / W['w']; sh = 150; sw = S['w'] * sh / S['h']
cx = ww / 2
body = sym(cx - sw / 2, 0, sh) + word(0, sh - 6, wh)
ty = sh - 6 + wh + 40
body += f'<text x="{cx:.1f}" y="{ty:.1f}" fill="currentColor" {TAG.format(fs=20, ls=6.5, a="middle")}>ĽUDOVÉ KROJE</text>'
body += f'<text x="{cx:.1f}" y="{ty + 30:.1f}" fill="currentColor" {TAG.format(fs=20, ls=6.5, a="middle")}>V NOVOM PRÍBEHU</text>'
svg('krojarka-vertical', ww, ty + 36, body)

# 08 favicon / app icon: tmavý štvorec, svetlý symbol
n = 512; sh = 330; sw = S['w'] * sh / S['h']
svg('favicon', n, n, f'<rect width="{n}" height="{n}" rx="112" fill="{INK}"/>' + sym((n - sw) / 2, (n - sh) / 2 + 6, sh, PAPER))
svg('app-icon-light', n, n, f'<rect width="{n}" height="{n}" rx="112" fill="#FBF8F1"/>' + sym((n - sw) / 2, (n - sh) / 2 + 6, sh, INK))
print(sorted(os.listdir('logo')))
