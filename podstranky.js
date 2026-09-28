/* ─────────────────────────────────────────────────────────────
   Spoločné správanie podstránok (O Krojárke, Kontakt, Priestor).
   Hlavička a menu sa správajú rovnako ako na homepage, zvyšok je
   parallax, odkrývanie a prepínanie fotiek v lepkavej sekcii.
   Každá časť si najprv overí, či na stránke vôbec je, takže sa dá
   načítať na ktorúkoľvek podstránku. main.js sa sem zámerne
   nenačítava, hľadal by prvky homepage a spadol by.
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

  /* ───────── výber sumy pri QR kóde ─────────
     Kódy sú vopred vygenerované obrázky, prepínač len mení, ktorý je vidieť. */
  const qrImg = $('#qrImg'), qrSum = $('#qrSum');
  $$('.qr-pick').forEach(b => b.addEventListener('click', () => {
    $$('.qr-pick').forEach(x => x.classList.toggle('is-on', x === b));
    if (qrImg) {
      qrImg.src = b.dataset.qr;
      qrImg.alt = 'Platobný QR kód — ' + b.dataset.sum;
    }
    if (qrSum) qrSum.textContent = b.dataset.sum;
  }));

  /* kopírovanie čísla účtu */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const zdroj = $('#' + b.dataset.copy);
    if (!zdroj) return;
    const povodny = b.textContent;
    try {
      await navigator.clipboard.writeText(zdroj.textContent.trim());
      b.textContent = 'Skopírované';
    } catch {
      b.textContent = 'Skopírujte ručne';
    }
    setTimeout(() => (b.textContent = povodny), 2000);
  }));

  /* ───────── formulár dopytu ─────────
     Stránka beží bez servera, preto sa správa poskladá a otvorí sa
     poštový klient. Nič sa neodosiela na pozadí a nič sa nikam neukladá. */
  $$('form[data-mailto]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      const telo = [
        'Meno: ' + (d.get('meno') || ''),
        'Kontakt: ' + (d.get('kontakt') || ''),
        'Typ: ' + (d.get('typ') || ''),
        '',
        d.get('sprava') || ''
      ].join('\n');
      const url = 'mailto:' + form.dataset.mailto +
        '?subject=' + encodeURIComponent(form.dataset.subject || 'Dopyt z webu') +
        '&body=' + encodeURIComponent(telo);
      location.href = url;
    });
  });

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
