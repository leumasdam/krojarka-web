/* ─────────────────────────────────────────────────────────────
   O Krojárke — skladané scény.
   Každá scéna je lepkavá na celú výšku okna. Obal scény (.sc-wrap) je
   vyšší než okno a z jeho prejdenej časti sa počíta postup p ∈ <0,1>.
   Keď nasledujúca scéna nabieha, predošlá dostane krytie c ∈ <0,1>
   a podľa neho sa zmenší a stmavne. Všetko cez CSS premenné.
   ───────────────────────────────────────────────────────────── */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const range = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const wraps = $$('.sc-wrap');
  if (!wraps.length) return;
  const scenes = wraps.map(w => $('.sc', w));
  const dots = $$('.sc-nav button');

  /* horizontálna časová os v scéne 05 */
  const track = $('.tl-track'), tlWrap = track && track.closest('.sc-wrap');
  /* kroky procesu v scéne 04 */
  const steps = $$('.pr-steps li');
  /* porovnanie v scéne 03 */
  const cmp = $('.vz-compare');
  if (cmp) $('input', cmp).addEventListener('input', e => cmp.style.setProperty('--cx', e.target.value + '%'));
  /* lupa v scéne 06 */
  const lens = $('.dt-fig');
  if (lens) {
    const move = (x, y) => { lens.style.setProperty('--mx', (x * 100).toFixed(2) + '%'); lens.style.setProperty('--my', (y * 100).toFixed(2) + '%'); };
    lens.addEventListener('pointermove', e => { const r = lens.getBoundingClientRect(); move(clamp((e.clientX - r.left) / r.width), clamp((e.clientY - r.top) / r.height)); lens.classList.add('is-hover'); });
    lens.addEventListener('pointerleave', () => lens.classList.remove('is-hover'));
  }
  /* hotspoty v scéne 01 */
  $$('.sc .hs').forEach(h => h.addEventListener('click', () => {
    const on = h.classList.contains('is-on');
    $$('.sc .hs').forEach(x => x.classList.remove('is-on'));
    if (!on) h.classList.add('is-on');
  }));
  /* bodky: skok na scénu */
  dots.forEach((d, i) => d.addEventListener('click', () => {
    const w = wraps[i]; window.scrollTo({ top: w.offsetTop + 2, behavior: reduce ? 'auto' : 'smooth' });
  }));

  let active = -1;
  const onScroll = () => {
    const H = innerHeight;
    let cur = 0;
    wraps.forEach((w, i) => {
      const r = w.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - H));        // postup vnútri scény
      const nxt = wraps[i + 1];
      const c = nxt ? range((H - nxt.getBoundingClientRect().top) / H, 0, 1) : 0; // koľko ju kryje ďalšia
      const sc = scenes[i];
      sc.style.setProperty('--p', p.toFixed(4));
      sc.style.setProperty('--c', ease(c).toFixed(4));
      const on = r.top <= H * .5 && c < .5;
      sc.classList.toggle('is-on', on);
      if (r.top <= H * .5) cur = i;
      /* parallax vrstvy podľa postupu scény */
      $$('[data-depth]', sc).forEach(el => {
        const k = parseFloat(el.dataset.depth) || 0;
        el.style.setProperty('--py', (-(p - .5) * k * 120).toFixed(1) + 'px');
      });
    });
    if (cur !== active) { active = cur; dots.forEach((d, i) => d.classList.toggle('is-on', i === cur)); document.body.dataset.scene = cur + 1; }

    if (track && tlWrap) {
      const r = tlWrap.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - H));
      const max = track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingRight || 0) * 2;
      track.style.transform = `translate3d(${(-ease(range(p, .08, .96)) * max).toFixed(1)}px, 0, 0)`;
      const n = $$('.tl-card', track).length;
      const k = Math.min(n - 1, Math.floor(range(p, .08, .96) * n));
      $$('.tl-card', track).forEach((c, i) => c.classList.toggle('is-cur', i === k));
    }
    const idx = $$('.s2 .idx li');
    if (idx.length > 1) {
      const p = parseFloat($('.s2').style.getPropertyValue('--p')) || 0;
      const k = 1 + Math.min(idx.length - 2, Math.floor(range(p, .05, .95) * (idx.length - 1)));
      idx.forEach((li, i) => li.classList.toggle('is-on', i === k));
    }
    if (steps.length) {
      const sc = steps[0].closest('.sc'), p = parseFloat(sc.style.getPropertyValue('--p')) || 0;
      const k = Math.min(steps.length - 1, Math.floor(range(p, .1, .9) * steps.length));
      steps.forEach((s, i) => s.classList.toggle('is-on', i === k));
      sc.style.setProperty('--step', k);
    }
    if (lens && !lens.classList.contains('is-hover')) {
      const sc = lens.closest('.sc'), p = parseFloat(sc.style.getPropertyValue('--p')) || 0;
      lens.style.setProperty('--mx', (30 + p * 40).toFixed(2) + '%');
      lens.style.setProperty('--my', (40 + Math.sin(p * 6) * 12).toFixed(2) + '%');
    }
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
