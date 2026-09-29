# -*- coding: utf-8 -*-
"""Zloží nahraté snímky do videa: okno prehliadača na krémovom pozadí, prelínanie scén, fade.

    python tools/render_video.py
Výstup: video/krojarka-web-16x9.mp4, video/krojarka-web-9x16.mp4, video/krojarka-web.gif
"""
import os, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = os.path.join(ROOT, 'video')
SC = ['01-home', '02-o-krojarke', '03-muzeum']
FPS, X = 30, 0.6                                     # X = dĺžka prelínania v sekundách


def run(args):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y'] + args, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(r.stderr[-1500:])


def graph(cw, ch, cx, cy, total):
    n = [len(os.listdir(os.path.join(V, 'frames', s))) for s in SC]
    d = [k / FPS for k in n]
    f = []
    for i in range(3):
        f.append(f'[{i}:v]scale={cw}:{ch}:flags=lanczos,format=yuv420p,setsar=1,fps={FPS}[c{i}]')
    f.append(f'[c0][c1]xfade=transition=fade:duration={X}:offset={d[0] - X:.3f}[x1]')
    f.append(f'[x1][c2]xfade=transition=fade:duration={X}:offset={d[0] + d[1] - 2 * X:.3f}[x2]')
    f.append(f'[3:v][x2]overlay={cx}:{cy}:shortest=1[a]')
    f.append(f'[a][4:v]overlay=0:0[b]')
    T = d[0] + d[1] + d[2] - 2 * X
    f.append(f'[b]fade=t=in:st=0:d=0.5,fade=t=out:st={T - 0.6:.3f}:d=0.6,format=yuv420p[out]')
    return ';'.join(f), T


def render(name, bg, cw, ch, cx, cy):
    fg, T = graph(cw, ch, cx, cy, 0)
    args = []
    for s in SC:
        args += ['-framerate', str(FPS), '-i', os.path.join(V, 'frames', s, '%05d.jpg')]
    args += ['-loop', '1', '-framerate', str(FPS), '-i', os.path.join(V, f'bg_{bg}.png'),
             '-loop', '1', '-framerate', str(FPS), '-i', os.path.join(V, f'mask_{bg}.png'),
             '-filter_complex', fg, '-map', '[out]', '-t', f'{T:.3f}',
             '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
             os.path.join(V, name)]
    run(args)
    print(name, round(T, 1), 's', os.path.getsize(os.path.join(V, name)) // 1024, 'KB')


if __name__ == '__main__':
    render('krojarka-web-16x9.mp4', 'wide', 1536, 960, 192, 82)
    render('krojarka-web-9x16.mp4', 'tall', 1000, 625, 40, 690)
    # GIF: prvých 12 s (hero a priblíženie kroja), 640 px, 12 fps
    src = os.path.join(V, 'krojarka-web-16x9.mp4')
    pal = os.path.join(V, '_pal.png')
    vf = 'fps=12,scale=640:-1:flags=lanczos'
    run(['-t', '12', '-i', src, '-vf', vf + ',palettegen=max_colors=128:stats_mode=diff', pal])
    run(['-t', '12', '-i', src, '-i', pal, '-lavfi', vf + '[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4', os.path.join(V, 'krojarka-web.gif')])
    os.remove(pal)
    print('gif', os.path.getsize(os.path.join(V, 'krojarka-web.gif')) // 1024, 'KB')
