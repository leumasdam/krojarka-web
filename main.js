/* Krojárka — prezentačný web (vanilla) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');

  /* ───────── dáta: 7 príbehov hero ─────────
     real: true = skutočná práca Krojárky (FB), inak ilustračný AI vizuál z referencií
     macro: kam sa zoomuje v sekcii pod hero (o = transform-origin, detail = obrázok/video na konci) */
  const SLIDES = [
    {
      key: 'sviatocny', title: 'Sviatočný kroj', sub: 'Každý detail má svoj význam.',
      txt: 'Živôtik, rukávce, pás, stuha, sukňa — vrstvy, z ktorých sa v kraji čítal vek, príležitosť aj rodina.',
      cta: 'Pozrieť sa bližšie', href: '#macro',
      img: 'img/kroj-trukovanie.webp', ar: 1026 / 1400, amb: '#A70F19',
      hs: [
        { x: 50, y: 17, t: 'Živôtik', d: 'Zamatový živôtik s ručnou výšivkou a perličkami. Pevný strih drží siluetu celého kroja.', z: 520 },
        { x: 14, y: 25, t: 'Rukáv', d: 'Nariasený rukáv s čiernou geometrickou výšivkou.', z: 480 },
        { x: 56, y: 29, t: 'Pás a mašľa', d: 'Vyšívaný pás viazaný do veľkej mašle.', z: 460 },
        { x: 66, y: 50, t: 'Stuha', d: 'Dlhá stuha s kvetinovým ornamentom po celej dĺžke.', z: 480 },
        { x: 34, y: 76, t: 'Sukňa', d: 'Čierna sukňa s pásmi výšivky a čipkovým lemom.', z: 380 },
      ],
      macro: { o: '16% 26%', z: 7.5, detail: 'img/detail-vysivka.webp', pos: '50% 50%', contain: true, rot: 10, label: 'Od kroja k stehu',
        steps: ['Celý kroj', 'Živôtik', 'Rukáv', 'Výšivka', 'Jeden steh'] },
    },
    {
      key: 'trukovanie', title: 'Trukovanie', sub: 'Autorský Bašovský kroj.',
      txt: 'Retiazkový steh vedený rukou na historickom stroji Lintz & Eckhardt. Čierna a zlatá trukovka inšpirovaná starodávnymi vzormi.',
      cta: 'Zistiť viac o trukovaní', href: '#remeslo', real: true,
      img: 'img/kroj-basovsky.webp', ar: 717 / 1400, amb: '#B07A12',
      hs: [
        { x: 50, y: 11, t: 'Golier', d: 'Zlatý nariasený golier s flitrami — to prvé, čo na Bašovskom kroji zaujme.', z: 520 },
        { x: 12, y: 36, t: 'Rukávce', d: 'Rukávce s trukovaným ornamentom v zlatej a zelenej. Každý oblúk je jedna súvislá retiazka.', z: 480 },
        { x: 56, y: 41, t: 'Pás', d: 'Žltý pás s tkaným kvetinovým vzorom stiahnutý nad riasenou sukňou.', z: 480 },
        { x: 50, y: 74, t: 'Trukovka', d: 'Zlatá trukovka na čiernom saténe — autorský vzor inšpirovaný starými predlohami.', z: 380 },
        { x: 70, y: 95, t: 'Čipka', d: 'Ružová čipka na leme spodnej sukne.', z: 420 },
      ],
      macro: { o: '50% 74%', z: 5, detail: 'img/basovsky-zastera.webp', pos: '50% 76%', label: 'Trukovka na smaragdovej zástere' },
    },
    {
      key: 'modrotlac', title: 'Modrotlač', sub: 'Farba, ktorá má vlastnú pamäť.',
      txt: 'Modrotlač prepája tradičnú techniku, prírodu a ornament. Každý vzor mení obyčajnú látku na rozpoznateľný podpis kraja.',
      cta: 'Objaviť modrotlač', href: '#kroje',
      img: 'img/kroj-modrotlac.webp', ar: 1055 / 1400, amb: '#1E3F8E',
      hs: [
        { x: 50, y: 18, t: 'Živôtik', d: 'Indigový živôtik s bielym ornamentom — vzor vzniká rezervou, nie maľbou.', z: 520 },
        { x: 50, y: 58, t: 'Zástera', d: 'Biela zástera s modrým ornamentom.', z: 420 },
        { x: 50, y: 86, t: 'Lem', d: 'Tmavomodrý lem so vzorom, ktorý sa odtláčal drevenou formou.', z: 400 },
      ],
      macro: { o: '50% 60%', z: 5, detail: 'img/detail-modrotlac.webp', pos: '50% 50%', label: 'Vzor modrotlače' },
    },
    {
      key: 'zasterky', title: 'Výšivka', sub: 'Zásterky na hody v Pobedime.',
      txt: 'Posledná noc pred hodami — zásterky pre Elišku. Čipky došité, v noci vyškrobené, ráno pripravené.',
      cta: 'Objaviť detaily', href: '#proces', real: true,
      img: 'img/zasterky-pobedim.webp', ar: 1400 / 1394, amb: '#1D4F9E',
      hs: [
        { x: 50, y: 13, t: 'Riasenie', d: 'Hustá drobná riasenina pod pásom drží tvar celej zásterky.', z: 480 },
        { x: 24, y: 42, t: 'Výšivka', d: 'Pásy pestrej výšivky — kvety, špirály a vlnovky v červenej, žltej a ružovej na modrom saténe.', z: 440 },
        { x: 7, y: 36, t: 'Čipka', d: 'Biela čipka po okrajoch, na hody vždy čerstvo vyškrobená.', z: 440 },
        { x: 50, y: 90, t: 'Spodnička', d: 'Biela spodná sukňa s madeirovým lemom.', z: 400 },
      ],
      macro: { o: '30% 45%', z: 4.5, detail: 'img/zasterky-foto.webp', pos: '22% 42%', label: 'Výšivka na modrom saténe' },
    },
    {
      key: 'cepcenie', title: 'Čepčenie', sub: 'Keď sa odev stáva obradom.',
      txt: 'Čepiec nie je iba súčasť kroja. Je súčasťou životných udalostí, spoločenských vzťahov a miestnych tradícií.',
      cta: 'Spoznať čepčenie', href: '#pribehy',
      img: 'img/cepcenie.webp', ar: 1122 / 1399, amb: '#9A8663', person: true,
      hs: [
        { x: 50, y: 14, t: 'Čepiec', d: 'Vyšívaný čepiec s čipkou. Nevesta ho po prvý raz dostala na hlavu pri čepčení.', z: 380 },
        { x: 36, y: 42, t: 'Viazanie', d: 'Dlhé čipkové viazanie spadajúce na chrbát — vrstva nad vrstvou.', z: 380 },
      ],
      macro: { o: '55% 15%', z: 4.5, detail: 'img/detail-stuha.webp', pos: '50% 50%', label: 'Čipka a stuha' },
    },
    {
      key: 'prucel', title: 'Regióny', sub: 'Mužský prucel z Bučian.',
      txt: 'Trnavský kroj. Prucel ušitý podľa starej fotografie — brokát, vykrajované plstené lemy a rozety s gombíkmi.',
      cta: 'Objaviť regióny', href: '#regiony', real: true,
      img: 'img/prucel-bucany.webp', ar: 1145 / 1400, amb: '#16795A',
      hs: [
        { x: 50, y: 8, t: 'Mašľa', d: 'Biela saténová mašľa s vyšívanými stuhami a zlatými strapcami.', z: 440 },
        { x: 26, y: 40, t: 'Rozety', d: 'Plstené rozety v červenej a zelenej s maľovanými gombíkmi — každá vystrihnutá ručne.', z: 460 },
        { x: 84, y: 60, t: 'Brokát', d: 'Tyrkysový brokát s veľkými ružami, lemovaný retiazkovou výšivkou.', z: 400 },
        { x: 18, y: 95, t: 'Lem', d: 'Vykrajovaný plstený lem v zelenej, červenej a oranžovej.', z: 420 },
      ],
      macro: { o: '27% 42%', z: 5, detail: 'img/prucel-foto.webp', pos: '22% 50%', label: 'Rozety a gombíky' },
    },
    {
      key: 'ockov', title: 'Príbehy', sub: 'Podľa starej rodinnej fotky.',
      txt: 'Detský očkovský kroj na želanie. Predlohou bola jediná fotografia — dievčatko v kroji medzi starými rodičmi.',
      cta: 'Čítať príbeh', href: '#pribehy', real: true,
      img: 'img/kroj-ockovsky-detsky.webp', ar: 1400 / 1227, amb: '#C2185B',
      inset: 'img/foto-rodinna.webp',
      hs: [
        { x: 50, y: 5, t: 'Golier', d: 'Ružový nariasený golier, presne ako na fotografii.', z: 480 },
        { x: 21, y: 25, t: 'Rukávce', d: 'Rukávce s veľkými kolesovými ornamentmi v žltej, ružovej a zelenej.', z: 420 },
        { x: 50, y: 60, t: 'Zástera', d: 'Modrá zástera s pásmi pestrej výšivky a špirál.', z: 400 },
      ],
      macro: { o: '21% 25%', z: 4.5, video: 'img/rukavce.mp4', poster: 'img/rukavce-poster.jpg', label: 'Detské podolské rukávce' },
    },
    {
      key: 'krojarka', title: 'Krojárka', sub: 'Aby príbeh pokračoval.',
      txt: 'Remeslo žije, kým ho má kto odovzdávať. Trukovanie ukazuje aj deťom v školách — priamo pri stroji.',
      cta: 'Spoznať Krojárku', href: '#krojarka', real: true,
      img: 'img/krojarka-stroj.webp', ar: 1050 / 1400, amb: '#A0692A', photo: true,
      hs: [
        { x: 40, y: 50, t: 'Stroj', d: 'Historický trukovací stroj Lintz & Eckhardt, Berlín. Látku vedie ruka, stroj len ťahá retiazku.', z: 380 },
      ],
      macro: { o: '42% 52%', z: 3.5, detail: 'img/krojarka-stroj.webp', pos: '45% 58%', label: 'Pri trukovacom stroji' },
    },
  ];

  /* ───────── mapa (reálne súradnice z OpenStreetMap, obce z tvorby Krojárky) ───────── */
  const TOWNS = [
    { n: 'Podolie', lat: 48.6751, lon: 17.7739, img: 'img/rukavce-poster.jpg', photo: true, t: 'Detské podolské rukávce', a: 'end', dy: -4 },
    { n: 'Pobedim', lat: 48.6561, lon: 17.8072, img: 'img/zasterky-pobedim.webp', t: 'Zásterky na hody · workshop trukovania v škole', a: 'start', dy: -2 },
    { n: 'Očkov', lat: 48.6528, lon: 17.7647, img: 'img/kroj-ockovsky-detsky.webp', t: 'Detský kroj podľa rodinnej fotky', a: 'end', dy: 8 },
    { n: 'Bašovce', lat: 48.6330, lon: 17.7974, img: 'img/kroj-basovsky.webp', t: 'Autorský trukovaný Bašovský kroj', a: 'start', dy: 12, main: true },
    { n: 'Bučany', lat: 48.4190, lon: 17.6992, img: 'img/prucel-bucany.webp', t: 'Mužský prucel · Trnavský kroj', a: 'start' },
  ];
  const CTX = [
    { n: 'Nové Mesto n. V.', lat: 48.757, lon: 17.831 },
    { n: 'Piešťany', lat: 48.591, lon: 17.827 },
    { n: 'Hlohovec', lat: 48.426, lon: 17.803 },
    { n: 'Trnava', lat: 48.377, lon: 17.588 },
  ];
  const VAH = [[48.84, 17.93], [48.757, 17.845], [48.68, 17.84], [48.594, 17.845], [48.52, 17.82], [48.426, 17.81], [48.33, 17.75]];
  const proj = (lat, lon) => {
    const kmx = (lon - 17.55) * 73.7, kmy = (48.80 - lat) * 111.2;
    return [60 + kmx * 17, 30 + kmy * 14.5];
  };
  const smooth = pts => {
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 2] || pts[i - 1], p1 = pts[i - 1], p2 = pts[i], p3 = pts[i + 1] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1.map(v => v.toFixed(1))} ${c2.map(v => v.toFixed(1))} ${p2.map(v => v.toFixed(1))}`;
    }
    return d;
  };
  const vahD = smooth(VAH.map(([la, lo]) => proj(la, lo)));
  const SVGNS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent && parent.appendChild(e);
    return e;
  };

  /* hero mapa (slide Regióny) */
  const heroSvg = $('.hero-map svg');
  heroSvg.setAttribute('viewBox', '0 0 600 740');
  $('.map-river', heroSvg).setAttribute('d', vahD);
  const heroPts = $('.map-pts', heroSvg);
  TOWNS.forEach((t, i) => {
    const [x, y] = proj(t.lat, t.lon);
    const g = el('g', { style: `--d:${i * 0.12}s` }, heroPts);
    el('circle', { cx: x, cy: y, r: t.main ? 5 : 3.5 }, g);
    const tx = el('text', { x: x + (t.a === 'end' ? -12 : 12), y: y + 4 + (t.dy || 0), 'text-anchor': t.a }, g);
    tx.textContent = t.n;
  });

  /* ───────── HERO ───────── */
  const hero = $('#hero'), stage = $('#stage'), hrBody = $('#hr-body'), nums = $('#hb-nums');
  const N = SLIDES.length;
  $$('.of-n').forEach(e => (e.textContent = pad(N)));
  let cur = 0, busy = false;

  const figs = SLIDES.map((s, i) => {
    const f = document.createElement('div');
    f.className = 'fig' + (s.person ? ' person' : '') + (s.photo ? ' photo' : '');
    f.style.setProperty('--ar', s.ar);
    f.innerHTML = `<img src="${s.img}" alt="${s.title} — ${s.sub}" ${i > 1 && i < N - 1 ? 'loading="lazy"' : ''} draggable="false">` +
      (s.inset ? `<figure class="fig-inset"><img src="${s.inset}" alt="Pôvodná rodinná fotografia — predloha kroja" loading="lazy"><figcaption>Predloha</figcaption></figure>` : '') +
      s.hs.map((h, j) => `<button class="hs" style="--hx:${h.x}%;--hy:${h.y}%" data-s="${i}" data-h="${j}" aria-label="Detail: ${h.t}"><i class="ring"></i><span>${h.t}</span></button>`).join('');
    f.addEventListener('click', e => {
      if (e.target.closest('.hs') || moved) return;
      const p = +f.dataset.pos;
      if (p === 1) go(cur + 1); else if (p === -1) go(cur - 1);
    });
    stage.appendChild(f);
    return f;
  });

  SLIDES.forEach((s, i) => {
    const b = document.createElement('button');
    b.textContent = pad(i + 1);
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `${pad(i + 1)} — ${s.title}`);
    b.onclick = () => go(i);
    nums.appendChild(b);
  });

  const renderText = (i, first) => {
    const s = SLIDES[i];
    const old = $('.hr-item', hrBody);
    const item = document.createElement('div');
    item.className = 'hr-item';
    item.innerHTML = `${s.real ? '<p class="real-tag">Z ateliéru Krojárky</p>' : ''}<h2>${s.title}</h2><p class="sub">${s.sub}</p><p class="txt">${s.txt}</p><span class="short"></span><a class="link-arrow" href="${s.href}">${s.cta} <svg><use href="#arrow"/></svg></a>`;
    if (old) {
      old.classList.remove('is-in'); old.classList.add('is-out');
      setTimeout(() => old.remove(), 400);
    }
    hrBody.appendChild(item);
    setTimeout(() => item.classList.add('is-in'), first ? 200 : 380);
  };

  /* niť — nová vlna pri každom prechode */
  const thread = $('#thread-path');
  const wave = i => {
    const seed = [0.2, 0.7, 0.45, 0.9, 0.1, 0.6, 0.35, 0.8][i % 8];
    const a = 90 + seed * 90, b = 60 + (1 - seed) * 110;
    return `M-20 ${200 - a * .3} C 180 ${140 + a * .6}, 360 ${300}, 520 ${230} S 820 ${120 + b * .4}, 1000 ${190} S 1260 ${260 - b * .5}, 1460 ${120 + seed * 90}`;
  };
  const drawThread = i => {
    thread.setAttribute('d', wave(i));
    const L = thread.getTotalLength();
    thread.style.transition = 'none';
    thread.style.strokeDasharray = L;
    thread.style.strokeDashoffset = L;
    thread.getBoundingClientRect();
    thread.style.transition = reduce ? 'none' : 'stroke-dashoffset 2s cubic-bezier(.65,0,.2,1) .25s';
    thread.style.strokeDashoffset = 0;
  };

  const layout = () => {
    figs.forEach((f, i) => {
      let d = i - cur;
      if (d > N / 2) d -= N;
      if (d < -N / 2) d += N;
      const prev = f.dataset.pos;
      const pos = Math.abs(d) <= 2 ? String(d) : 'far';
      // figúra, ktorá preskakuje z jednej strany na druhú, nesmie preletieť cez stred
      if (prev && prev !== 'far' && pos !== 'far' && Math.sign(+prev) * Math.sign(+pos) === -1 && Math.abs(prev - pos) > 2) {
        f.style.transition = 'none';
      } else f.style.transition = '';
      f.dataset.pos = pos;
      f.classList.toggle('ready', false);
      f.setAttribute('aria-hidden', d !== 0);
    });
    requestAnimationFrame(() => figs.forEach(f => (f.style.transition = '')));
    setTimeout(() => figs[cur].classList.add('ready'), reduce ? 0 : 900);
  };

  const go = (i, first) => {
    if (busy && !first) return;
    busy = true; setTimeout(() => (busy = false), 750);
    cur = (i + N) % N;
    const s = SLIDES[cur];
    hero.dataset.slide = cur;
    hero.style.setProperty('--amb', s.amb);
    $('#h-num').textContent = pad(cur + 1);
    $('#hb-num').textContent = pad(cur + 1);
    $('#hb-fill').style.transform = `scaleX(${(cur + 1) / N})`;
    $$('button', nums).forEach((b, j) => b.setAttribute('aria-selected', j === cur));
    layout(); renderText(cur, first); drawThread(cur); setMacro(s);
    closeDrawer();
  };

  $('#prev').onclick = () => go(cur - 1);
  $('#next').onclick = () => go(cur + 1);

  /* swipe / drag */
  let sx = 0, sy = 0, down = false, moved = false;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('.hs')) return;
    down = true; moved = false; sx = e.clientX; sy = e.clientY;
    stage.classList.add('is-drag');
  });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 8) moved = true;
    figs[cur].style.transition = 'none';
    figs[cur].style.transform = `translateX(calc(-50% + ${dx * .35}px)) rotate(${dx * .006}deg)`;
  });
  addEventListener('pointerup', e => {
    if (!down) return;
    down = false; stage.classList.remove('is-drag');
    const dx = e.clientX - sx, dy = e.clientY - sy;
    figs[cur].style.transition = ''; figs[cur].style.transform = '';
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
    setTimeout(() => (moved = false), 0);
  });

  /* klávesnica, keď je hero vo viewporte */
  let heroVisible = true;
  new IntersectionObserver(([en]) => (heroVisible = en.isIntersecting), { threshold: .4 }).observe(hero);
  addEventListener('keydown', e => {
    if (e.key === 'Escape') return closeDrawer();
    if (!heroVisible || drawer.classList.contains('is-open')) return;
    if (e.key === 'ArrowRight') go(cur + 1);
    if (e.key === 'ArrowLeft') go(cur - 1);
  });

  /* ───────── makro: vždy aktuálny kroj z hero ───────── */
  const mk = $('.macro-kroj'), mDetail = $('#macro-detail'), mLabel = $('#macro-label');
  function setMacro(s) {
    const m = s.macro;
    mk.src = s.img; mk.alt = '';
    mk.style.setProperty('--ar', s.ar);
    mk.style.transformOrigin = m.o;
    mk.classList.toggle('photo', !!s.photo);
    mk.dataset.z = m.z;
    mDetail.classList.toggle('is-cutout', !!m.contain);
    mDetail.dataset.rot = m.rot || 6;
    const labels = m.steps || ['Celý kroj', 'Detail', 'Ornament', 'Steh', 'Ruka'];
    $$('.macro-steps li').forEach((li, i) => (li.textContent = labels[i]));
    mDetail.innerHTML = m.video
      ? `<video src="${m.video}" poster="${m.poster}" muted loop playsinline preload="none" aria-label="${m.label}"></video>`
      : `<img src="${m.detail}" alt="${m.label}" style="object-position:${m.pos}" loading="lazy">`;
    mLabel.textContent = m.label + (s.real ? ' · z ateliéru' : '');
  }

  /* ───────── hotspot drawer ───────── */
  const drawer = $('#drawer'), scrim = $('#scrim'), zoom = $('#dr-zoom'), thumbs = $('#dr-thumbs');
  const setZoom = (s, h) => {
    zoom.style.backgroundImage = `url(${s.img})`;
    zoom.style.setProperty('--z', h.z + '%');
    zoom.style.setProperty('--pos', `${h.x}% ${h.y}%`);
  };
  const openDrawer = (si, hi) => {
    const s = SLIDES[si], h = s.hs[hi];
    $('#dr-num').textContent = pad(si + 1);
    $('#dr-title').textContent = h.t;
    $('#dr-sub').textContent = `${s.title} · ${s.sub.replace(/\.$/, '')}`;
    $('#dr-text').textContent = h.d;
    const cta = $('#dr-cta');
    cta.href = s.href; cta.firstChild.textContent = s.cta + ' ';
    setZoom(s, h);
    thumbs.innerHTML = '';
    s.hs.slice(0, 4).forEach((t, j) => {
      const b = document.createElement('button');
      b.style.backgroundImage = `url(${s.img})`;
      b.style.backgroundSize = t.z * .9 + '%';
      b.style.backgroundPosition = `${t.x}% ${t.y}%`;
      b.setAttribute('aria-label', t.t);
      b.classList.toggle('is-on', j === hi);
      b.onclick = () => openDrawer(si, j);
      thumbs.appendChild(b);
    });
    $$('.hs').forEach(x => x.classList.toggle('is-active', +x.dataset.s === si && +x.dataset.h === hi));
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    scrim.classList.add('is-on');
  };
  function closeDrawer() {
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('is-on');
    $$('.hs.is-active').forEach(x => x.classList.remove('is-active'));
  }
  stage.addEventListener('click', e => {
    const h = e.target.closest('.hs');
    if (h) openDrawer(+h.dataset.s, +h.dataset.h);
  });
  $('#dr-close').onclick = closeDrawer;
  scrim.onclick = closeDrawer;
  $('#dr-cta').addEventListener('click', closeDrawer);

  go(0, true);

  /* ───────── header, menu ───────── */
  const header = $('.site-header'), menuBtn = $('.menu-btn'), overlay = $('#overlay-nav');
  const toggleMenu = open => {
    overlay.classList.toggle('is-open', open);
    overlay.setAttribute('aria-hidden', !open);
    menuBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.onclick = () => toggleMenu(!overlay.classList.contains('is-open'));
  $$('a', overlay).forEach(a => (a.onclick = () => toggleMenu(false)));

  /* ───────── kolekcia ───────── */
  const CARDS = [
    { reg: 'Bašovce', t: 'Autorský trukovaný kroj', m: '2026 · ženský', img: 'img/kroj-basovsky.webp', f: 'zensky' },
    { reg: 'Pobedim', t: 'Zásterky na hody', m: '2026 · ženské', img: 'img/zasterky-pobedim.webp', f: 'zensky', wide: true },
    { reg: 'Očkov', t: 'Detský kroj podľa fotky', m: 'na zákazku · detský', img: 'img/kroj-ockovsky-detsky.webp', f: 'detsky zakazka', wide: true },
    { reg: 'Bučany', t: 'Mužský prucel', m: 'Trnavský kroj · mužský', img: 'img/prucel-bucany.webp', f: 'muzsky zakazka', wide: true },
    { reg: 'Podolie', t: 'Detské rukávce', m: 'trukovanie · detské', img: 'img/rukavce-poster.jpg', f: 'detsky', photo: true },
  ];
  const cards = $('#cards');
  cards.innerHTML = CARDS.map(c => `
    <a class="card reveal${c.wide ? ' wide' : ''}${c.photo ? ' photo' : ''}" href="#kroje" data-f="${c.f}">
      <span class="reg">${c.reg}</span><h3>${c.t}</h3><span class="meta">${c.m}</span>
      <span class="go"><svg><use href="#arrow"/></svg></span>
      <img src="${c.img}" alt="${c.t}, ${c.reg}" loading="lazy">
    </a>`).join('');
  $$('.chip').forEach(ch => ch.onclick = () => {
    $$('.chip').forEach(c => c.classList.toggle('is-on', c === ch));
    const f = ch.dataset.f;
    $$('.card', cards).forEach(c => c.classList.toggle('is-hidden', f !== 'all' && !c.dataset.f.split(' ').includes(f)));
  });

  /* ───────── regióny ───────── */
  const regSvg = $('#reg-svg'), regPts = $('#reg-pts'), regCard = $('#reg-card');
  $('.rm-river', regSvg).setAttribute('d', vahD);
  const lbl = $('.rm-river-lbl', regSvg);
  const [lx, ly] = proj(48.72, 17.855); lbl.setAttribute('x', lx + 14); lbl.setAttribute('y', ly);
  const showTown = (i) => {
    const t = TOWNS[i];
    $$('.rpt:not(.ctx)', regPts).forEach((g, j) => g.classList.toggle('is-on', j === i));
    regCard.innerHTML = `<img src="${t.img}" alt="" class="${t.photo ? 'is-photo' : ''}"><div><p class="cnt">Z ateliéru</p><h3>${t.n}</h3><p>${t.t}</p><a class="link-arrow" href="#kroje">Pozrieť kroj <svg><use href="#arrow"/></svg></a></div>`;
  };
  CTX.forEach(t => {
    const [x, y] = proj(t.lat, t.lon);
    const g = el('g', { class: 'rpt ctx' }, regPts);
    el('circle', { class: 'dot', cx: x, cy: y, r: 3 }, g);
    el('text', { x: x + 10, y: y + 4 }, g).textContent = t.n;
  });
  TOWNS.forEach((t, i) => {
    const [x, y] = proj(t.lat, t.lon);
    const g = el('g', { class: 'rpt', tabindex: 0, role: 'button', 'aria-label': t.n }, regPts);
    el('circle', { class: 'halo', cx: x, cy: y, r: 22 }, g);
    el('circle', { class: 'dot', cx: x, cy: y, r: t.main ? 7 : 5.5 }, g);
    el('text', { x: x + (t.a === 'end' ? -14 : 14), y: y + 4 + (t.dy || 0), 'text-anchor': t.a }, g).textContent = t.n;
    g.addEventListener('mouseenter', () => showTown(i));
    g.addEventListener('click', () => showTown(i));
    g.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), showTown(i)));
  });
  showTown(3);

  /* ───────── príbehy: kedysi / dnes ───────── */
  const cmp = $('#compare');
  $('input', cmp).addEventListener('input', e => cmp.style.setProperty('--cx', e.target.value + '%'));

  /* ───────── reveal ───────── */
  const io = new IntersectionObserver(ens => ens.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .stitch, .reg-map').forEach(x => io.observe(x));

  /* ───────── scroll: macro zoom, parallax, progress ───────── */
  const macro = $('#macro'), mv = mDetail, mSticky = $('.macro-sticky');
  const steps = $$('.macro-steps li'), mThread = $('.macro-thread path');
  mThread.setAttribute('pathLength', 1);
  const qb = $('.qb-img img'), atd = $('.at-detail'), pt = $('#pt-fill');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const range = (p, a, b) => clamp((p - a) / (b - a));

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    header.classList.toggle('is-scrolled', y > 40);
    pt.style.setProperty('--p', clamp(y / (document.documentElement.scrollHeight - vh)));

    const r = macro.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh));
    const z = ease(range(p, 0, .6));
    mk.style.setProperty('--mz', 1 + z * ((+mk.dataset.z || 5) - 1));
    mk.style.opacity = 1 - range(p, .45, .62);
    const v = range(p, .42, .8);
    mv.style.setProperty('--vo', clamp(v * 1.6));
    mv.style.setProperty('--vz', .7 + ease(v) * .55);
    const rot = +mv.dataset.rot || 6;
    mv.style.setProperty('--vr', (-rot + v * rot * 1.2) + 'deg');
    const vid = $('video', mv);
    if (vid) { if (v > .2 && vid.paused) vid.play().catch(() => {}); else if (v <= .2 && !vid.paused) vid.pause(); }
    mSticky.style.setProperty('--co', range(p, .7, .86));
    mThread.style.setProperty('--to', 1 - range(p, .78, 1));
    const si = Math.min(4, Math.floor(p * 5.2));
    steps.forEach((s, i) => s.classList.toggle('is-on', i === si));

    if (qb) {
      const qr = qb.parentElement.getBoundingClientRect();
      qb.style.setProperty('--py', ((qr.top + qr.height / 2 - vh / 2) * -.12) + 'px');
    }
    if (atd) {
      const ar = atd.parentElement.getBoundingClientRect();
      atd.style.setProperty('--rot', (-18 + (ar.top / vh) * 14) + 'deg');
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
