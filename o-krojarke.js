/* ─────────────────────────────────────────────────────────────
   O Krojárke — správanie podstránky.
   Hlavička a menu sa správajú rovnako ako na homepage, zvyšok je
   parallax, odkrývanie a prepínanie fotiek v lepkavej sekcii.
   main.js sa sem zámerne nenačítava, hľadal by prvky, ktoré tu nie sú.
   ───────────────────────────────────────────────────────────── */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── hlavička a menu ───────── */
  const header = $('.site-header'), menuBtn = $('.menu-btn'), overlay = $('#overlay-nav');
  const toggleMenu = open => {
    overlay.classList.toggle('is-open', open);
    overlay.setAttribute('aria-hidden', !open);
    menuBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.onclick = () => toggleMenu(!overlay.classList.contains('is-open'));
  $$('a', overlay).forEach(a => (a.onclick = () => toggleMenu(false)));

  /* ───────── odkrývanie ───────── */
  const io = new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target)));
  }, { rootMargin: '0px 0px -12% 0px' });
  $$('.reveal').forEach(x => io.observe(x));

  /* ───────── lepkavá sekcia: fotka podľa kroku ─────────
     Krok, ktorý je najbližšie k stredu obrazovky, určuje fotku aj popis. */
  const steps = $$('.abs-step'), shots = $$('.abs-stack img'), cap = $('#abs-cap');
  let shown = -1;
  const syncSticky = () => {
    if (!steps.length) return;
    const mid = innerHeight / 2;
    let best = 0, bestD = Infinity;
    steps.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best === shown) return;
    shown = best;
    shots.forEach((img, i) => img.classList.toggle('is-on', i === best));
    if (cap && shots[best]) cap.textContent = shots[best].dataset.cap || '';
  };

  /* ───────── parallax ─────────
     Posun počítame z toho, ako ďaleko je stred prvku od stredu okna.
     Kladné data-par ide proti smeru rolovania, záporné s ním. */
  const layers = $$('[data-par]').map(el => ({ el, k: parseFloat(el.dataset.par) || 0 }));
  const syncPar = () => {
    const mid = innerHeight / 2;
    layers.forEach(({ el, k }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -400 || r.top > innerHeight + 400) return;   // mimo dohľadu
      const off = (r.top + r.height / 2) - mid;
      el.style.setProperty('--py', Math.round(-off * k * 100) / 100 + 'px');
    });
  };

  /* ───────── niť postupu v päte stránky ───────── */
  const pt = $('#pt-fill');
  const syncProgress = () => {
    if (!pt) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    pt.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max) : 0);
  };

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    header.classList.toggle('is-scrolled', scrollY > 40);
    syncSticky();
    syncProgress();
    if (!reduce) syncPar();
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
