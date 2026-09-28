/* ─────────────────────────────────────────────────────────────
   Scroll-viazaný motion podstránok. Načítava sa po podstranky.js.
   Všetko sa počíta z polohy prvku voči oknu, žiadna knižnica.
   ───────────────────────────────────────────────────────────── */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const range = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* ───────── slová nadpisov ─────────
     Nadpis s data-words sa rozbije na slová, každé vyjde spod linky s malým oneskorením.
     <br> ostáva zachované. */
  $$('[data-words]').forEach(el => {
    if (reduce) return;
    let i = 0;
    const wrap = node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const inner = document.createElement('i'); inner.textContent = part; inner.style.setProperty('--i', i++);
          w.appendChild(inner); frag.appendChild(w);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        [...node.childNodes].forEach(wrap);
      }
    };
    [...el.childNodes].forEach(wrap);
    el.classList.add('wr');
    const show = () => el.classList.add('in');
    if (el.closest('.mz-hero, .sp-hero, .kt-hero, .ab-hero, .pg-hero')) setTimeout(show, 150);
    else { const ob = new IntersectionObserver(es => { if (es[0].isIntersecting) { show(); ob.disconnect(); } }, { threshold: .3 }); ob.observe(el); }
  });

  /* ───────── stagger: index položkám ───────── */
  $$('.stagger').forEach(list => [...list.children].forEach((c, i) => c.style.setProperty('--i', i)));

  /* ───────── mapa: odkrytie ───────── */
  const maps = $$('.mapbox.km');
  if (maps.length) new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .3 }).observe(maps[0]);

  /* ───────── časová os: niť ─────────
     Vlnitá čiara od prvého po posledný míľnik, kreslí sa podľa toho, kam si doscrolloval. */
  const line = $('.ab-line');
  let tlPath = null;
  if (line && !reduce) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'tl-thread'); svg.setAttribute('preserveAspectRatio', 'none');
    tlPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tlPath.setAttribute('class', 'thread'); tlPath.setAttribute('pathLength', '1');
    svg.appendChild(tlPath); line.prepend(svg);
    $$('.ab-ev', line).forEach(ev => { const s = document.createElement('i'); s.className = 'ab-stitch'; ev.prepend(s); });
    const buildPath = () => {
      const h = line.offsetHeight; svg.setAttribute('viewBox', `0 0 28 ${h}`);
      let d = 'M14 0'; const step = 140;
      for (let y = step; y <= h; y += step) { const x = (y / step) % 2 ? 22 : 6; d += ` Q${x} ${y - step / 2} 14 ${y}`; }
      d += ` L14 ${h}`; tlPath.setAttribute('d', d);
    };
    buildPath(); addEventListener('resize', buildPath);
  }

  /* ───────── stroj s hotspotmi ───────── */
  const mach = $('.mach');
  if (mach) {
    const spots = $$('.mh', mach), items = $$('.mach-list li', mach);
    const pick = i => { spots.forEach((s, j) => s.classList.toggle('is-on', j === i)); items.forEach((s, j) => s.classList.toggle('is-on', j === i)); };
    spots.forEach((s, i) => { s.addEventListener('click', () => pick(i)); s.addEventListener('mouseenter', () => pick(i)); });
    items.forEach((s, i) => { s.addEventListener('click', () => pick(i)); s.addEventListener('mouseenter', () => pick(i)); });
    pick(0);
  }

  /* ───────── počítadlá súm ───────── */
  const counters = $$('[data-count]');
  if (counters.length) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = reduce ? 1 : 1100;
      const tick = now => { const p = ease(clamp((now - t0) / dur)); el.textContent = Math.round(to * p) + ' €'; if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: .6 });
    counters.forEach(c => io.observe(c));
  }

  /* ───────── scroll-viazané hodnoty ───────── */
  const zooms = $$('[data-zoom]');
  const mz = $('.mz-hero'), mzDraw = $('.mz-draw'), mzWrap = $('.mz-wrap');
  const sp = $('.sp-hero');
  const kt = $('.kt-hero'), ktSteps = $$('.kt-steps li'), ktSticky = $('.kt-sticky');
  const stepsThread = $('.steps-thread path');
  const vh = () => innerHeight;

  const onScroll = () => {
    const H = vh();
    // zoom: 1.14 → 1 keď prvok prechádza oknom
    zooms.forEach(el => {
      const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > H) return;
      const p = range((H - r.top) / (H + r.height), .05, .75);
      el.style.setProperty('--zm', (1.14 - ease(p) * .14).toFixed(4));
    });
    // niť časovej osi
    if (tlPath && line) {
      const r = line.getBoundingClientRect();
      const p = range((H * .72 - r.top) / r.height, 0, 1);
      tlPath.style.setProperty('--t', (1 - p).toFixed(4));
    }
    // múzeum: najprv sa nakreslí dom, potom sa objaví fotka
    if (mz && mzDraw) {
      const r = mzWrap.getBoundingClientRect();
      const p = range(-r.top / Math.max(1, r.height - H), 0, 1);
      const draw = range(p, 0, .55), veil = 1 - range(p, .45, .9), fade = 1 - range(p, .7, 1);
      mzDraw.style.setProperty('--t', (1 - ease(draw)).toFixed(4));
      mz.style.setProperty('--veil', (reduce ? 0 : veil).toFixed(3));
      mzDraw.style.setProperty('--draw', fade.toFixed(3));
      mz.style.setProperty('--zm', (1.12 - range(p, .4, 1) * .12).toFixed(4));
    }
    // priestor: svetlo putuje po stene
    if (sp) {
      const r = sp.getBoundingClientRect();
      const p = range(-r.top / (r.height), 0, 1);
      sp.style.setProperty('--lx', (12 + p * 76).toFixed(1) + '%');
      sp.style.setProperty('--zm', (1.1 + p * .08).toFixed(4));
    }
    // kontakt: makro na ihlu
    if (kt && ktSticky) {
      const r = kt.getBoundingClientRect();
      const p = range(-r.top / (r.height - H), 0, 1);
      ktSticky.style.setProperty('--mz', (1 + ease(range(p, 0, .8)) * 1.9).toFixed(4));
      ktSticky.style.setProperty('--co', (1 - range(p, .15, .5)).toFixed(3));
      const si = Math.min(ktSteps.length - 1, Math.floor(p * ktSteps.length * 1.05));
      ktSteps.forEach((s, i) => s.classList.toggle('is-on', i === si));
    }
    if (stepsThread) {
      const r = stepsThread.closest('.steps').getBoundingClientRect();
      stepsThread.style.setProperty('--t', (1 - range((H * .85 - r.top) / (H * .5), 0, 1)).toFixed(4));
    }
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
