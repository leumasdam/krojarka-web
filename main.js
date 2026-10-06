/* Krojárka — prezentačný web (vanilla) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');

  /* ───────── veľké verzie fotiek pre zoom ─────────
     Hero fotky majú 2,5× variant (tools/upscale.py), detaily a galéria 2×.
     CSS transform: scale() nemení výber cez srcset, preto sa veľká verzia
     vymieňa ručne až vtedy, keď sa na ňu naozaj zoomuje. */
  const big = (src, suf = '@2-5x') => src.replace(/\.webp$/, suf + '.webp');
  /* Vymení fotku až keď je načítaná, aby zoom neprebliklo prázdnym miestom.
     Obrázok sa drží v pending, inak ho vie zberač pamäte zlikvidovať skôr,
     než sa načítanie dokončí. Zámerne bez img.decode(): pri týchto veľkých
     webp sa v Chrome nedokončí a výmena by sa nikdy nespustila. */
  const pending = new Set();
  const swapWhenReady = (url, apply) => {
    const im = new Image();
    pending.add(im);
    im.onload = () => { pending.delete(im); apply(url); };
    im.onerror = () => pending.delete(im);
    im.src = url;
  };

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
      macro: { o: '16% 26%', z: 5.4, detail: 'img/gen/rukav-makro.webp', pos: '50% 50%', full: true, label: 'Čierna výšivka na rukáve',
        steps: ['Celý kroj', 'Živôtik', 'Rukáv', 'Výšivka', 'Jeden steh'] },
    },
    {
      key: 'trukovanie', title: 'Trukovanie', sub: 'Autorský Bašovský kroj.',
      txt: 'Retiazkový steh vedený rukou na historickom stroji Lintz & Eckhardt. Čierna a zlatá trukovka inšpirovaná starodávnymi vzormi.',
      cta: 'Zistiť viac o trukovaní', href: '#remeslo', real: true,
      img: 'img/kroj-basovsky-v2.webp', ar: 1009 / 1380, amb: '#B07A12',
      hs: [
        { x: 50, y: 7, t: 'Golier', d: 'Zlatý nariasený golier s flitrami — to prvé, čo na Bašovskom kroji zaujme.', z: 520 },
        { x: 20, y: 30, t: 'Rukávce', d: 'Rukávce s trukovaným ornamentom v zlatej a zelenej. Každý oblúk je jedna súvislá retiazka.', z: 480 },
        { x: 50, y: 34, t: 'Pás', d: 'Žltý pás s tkaným kvetinovým vzorom stiahnutý nad riasenou sukňou.', z: 480 },
        { x: 62, y: 71, t: 'Trukovka', d: 'Zlatá trukovka na čiernom saténe — autorský vzor inšpirovaný starými predlohami.', z: 380 },
        { x: 28, y: 88, t: 'Čipka', d: 'Biela čipka na leme spodnej sukne.', z: 420 },
      ],
      macro: { o: '50% 9%', z: 5, detail: 'img/hody/stofky-makro.webp', pos: '50% 50%', label: 'Vzácne bašovské štófky' },
    },
    {
      key: 'cerveny', title: 'Zlatá retiazka', sub: 'Červený sviatočný kroj.',
      txt: 'Červený živôtik so striebornými sponami, rukávce s trukovanými kolesami, vysoký zlatý golier a na čiernej sukni veľké zlaté kvety — jedna súvislá retiazka za druhou.',
      cta: 'Pozrieť video', href: '#macro', real: true,
      img: 'img/kroj-cerveny.webp', ar: 900 / 1323, amb: '#C8102E',
      hs: [
        { x: 50, y: 5, t: 'Golier', d: 'Vysoký nariasený golier v zlatej a oranžovej.', z: 520 },
        { x: 50, y: 17, t: 'Živôtik', d: 'Červený živôtik so striebornými sponami a zlatou výšivkou po stranách.', z: 480 },
        { x: 12, y: 22, t: 'Rukávce', d: 'Trukované kolesá v zlatej a červenej, na konci vykrajovaný lem.', z: 440 },
        { x: 50, y: 29, t: 'Pás', d: 'Pestrá tkaná stuha s kvetmi, viazaná vzadu do veľkej mašle.', z: 460 },
        { x: 32, y: 70, t: 'Trukovka', d: 'Veľké zlaté kvety a špirály na čiernej sukni — retiazka vedená rukou.', z: 380 },
        { x: 60, y: 94, t: 'Čipka', d: 'Biela čipka s lomeným okrajom.', z: 420 },
      ],
      macro: { o: '40% 72%', z: 4.2, video: 'img/kroj-cerveny.mp4', poster: 'img/kroj-cerveny-poster.jpg', label: 'Kroj zblízka',
        steps: ['Celý kroj', 'Sukňa', 'Trukovka', 'Mašľa', 'Na hodoch'] },
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
      key: 'fialovy', title: 'Brokát a čipka', sub: 'Sviatočný kroj s fialovým živôtikom.',
      txt: 'Fialový brokát s ľaliami, zlaté a strieborné borty, nariasený čipkový golier. Rukávce s vyšívanými kolesami a madeirou, zástera s trukovanými kvetmi a modrá tylová čipka.',
      cta: 'Pozrieť detaily', href: '#macro', real: true,
      img: 'img/kroj-fialovy.webp', ar: 1036 / 1334, amb: '#5B2A86',
      hs: [
        { x: 50, y: 6, t: 'Golier', d: 'Nariasený čipkový golier s modrou a zelenou výšivkou na okraji.', z: 520 },
        { x: 50, y: 16, t: 'Živôtik', d: 'Fialový brokát s ľaliami, zlaté a strieborné borty a kovové gombíky.', z: 460 },
        { x: 12, y: 34, t: 'Rukávce', d: 'Vyšívané kolesá v žltej, fialovej a zelenej, pod nimi madeira s farebnými vlnovkami.', z: 440 },
        { x: 50, y: 29, t: 'Pás', d: 'Biely pás s tkanými kvetmi, lemovaný červenou bortou.', z: 460 },
        { x: 70, y: 76, t: 'Zástera', d: 'Trukované kvety a slučky v bielej, fialovej a modrej, uprostred tkaná stuha s ružami.', z: 380 },
        { x: 30, y: 93, t: 'Čipka', d: 'Modrá tylová čipka s kvetmi na leme.', z: 400 },
      ],
      macro: { o: '50% 22%', z: 4.2, rot: 3, label: 'Detaily kroja',
        steps: ['Celý kroj', 'Živôtik', 'Brokát', 'Rukávce', 'Zástera'],
        gallery: [
          { src: 'img/fialovy-zivotik.webp', label: 'Živôtik · borty a gombíky' },
          { src: 'img/fialovy-brokat.webp', label: 'Brokát s ľaliami · chrbát' },
          { src: 'img/fialovy-rukav.webp', label: 'Rukávce · kolesá a madeira' },
          { src: 'img/fialovy-zastera.webp', label: 'Zástera · trukované kvety' },
        ] },
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
      sc: .8, inset: 'img/foto-bucany-predloha.webp', insetCap: 'Predloha · Bučany',
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
  // obce z jej príspevkov; k: 'kroj' = šila kroj / kus, 'live' = trukovanie naživo, výstava
  const TOWNS = [
    { n: 'Čachtice', lat: 48.7138, lon: 17.7871, k: 'kroj', img: 'img/kriezlo-hotove.webp', photo: true, t: 'Rukávce s novým kriezlom', a: 'end', dy: 0 },
    { n: 'Podolie', lat: 48.6751, lon: 17.7739, k: 'kroj', img: 'img/rukavce-podolie.webp', t: 'Detské podolské rukávce · stará brána', a: 'end', dy: -2 },
    { n: 'Pobedim', lat: 48.6561, lon: 17.8072, k: 'kroj', img: 'img/zasterky-pobedim.webp', t: 'Hody v kroji 2025 a 2026 · trukovanie v škole', a: 'start', dy: -6 },
    { n: 'Očkov', lat: 48.6528, lon: 17.7647, k: 'kroj', img: 'img/kroj-ockovsky-detsky.webp', t: 'Detský kroj podľa rodinnej fotky', a: 'end', dy: 4 },
    { n: 'Bašovce', lat: 48.6330, lon: 17.7974, k: 'kroj', img: 'img/kroj-basovsky-v2.webp', t: 'Hody v kroji 2025 · nebíčkový kroj po babičke', a: 'start', dy: 2, main: true },
    { n: 'Ostrov', lat: 48.6287, lon: 17.7688, k: 'kroj', img: 'img/kroj-fialovy.webp', t: 'Hody v kroji 2025 · koniec krojovej sezóny', a: 'end', dy: 10 },
    { n: 'Rakovice', lat: 48.5634, lon: 17.7308, k: 'live', t: 'Trukovanie naživo', a: 'end', dy: 4 },
    { n: 'Bučany', lat: 48.4190, lon: 17.6992, k: 'kroj', img: 'img/prucel-bucany.webp', t: 'Mužský a ženský prucel · Trnavský kroj', a: 'end' },
    { n: 'Červeník', lat: 48.4601, lon: 17.7554, k: 'live', t: 'Trukovanie naživo · 8. 8. 2026', a: 'start' },
    { n: 'Nitrianska Blatnica', lat: 48.5537, lon: 17.9669, k: 'live', t: 'Šarfické folklórne slávnosti · trukovanie', a: 'end', dy: -12 },
    { n: 'Beckov', lat: 48.7892, lon: 17.8967, k: 'live', t: 'Výstava krojov z jej zbierky · jar 2025', a: 'start' },
    { n: 'Trnava', lat: 48.3767, lon: 17.5858, k: 'live', t: 'Západoslovenské múzeum · trukovanie v advente', a: 'start' },
  ];
  const CTX = [
    { n: 'Nové Mesto n. V.', lat: 48.757, lon: 17.831 },
    { n: 'Piešťany', lat: 48.591, lon: 17.827 },
    { n: 'Hlohovec', lat: 48.426, lon: 17.803 },
  ];
  const VAH = [[48.84, 17.93], [48.757, 17.845], [48.68, 17.84], [48.594, 17.845], [48.52, 17.82], [48.426, 17.81], [48.33, 17.75]];
  const proj = (lat, lon) => {
    const kmx = (lon - 17.55) * 73.7, kmy = (48.82 - lat) * 111.2;
    return [70 + kmx * 14.6, 30 + kmy * 14.4];
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
    el('circle', { cx: x, cy: y, r: t.main ? 5 : 3.5, class: t.k === 'live' ? 'live' : '' }, g);
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
    if (s.sc) { f.style.setProperty('--sc', s.sc); f.classList.add('small'); }
    f.innerHTML = `<img src="${s.img}" alt="${s.title} — ${s.sub}" ${i > 1 && i < N - 1 ? 'loading="lazy"' : ''} draggable="false">` +
      (s.inset ? `<figure class="fig-inset"><img src="${s.inset}" alt="Pôvodná fotografia — predloha kroja" loading="lazy"><figcaption>${s.insetCap || 'Predloha'}</figcaption></figure>` : '') +
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
  const macro = $('#macro');
  var macroReady = false;
  const mk = $('.macro-kroj'), mDetail = $('#macro-detail'), mLabel = $('#macro-label');
  function setMacro(s) {
    const m = s.macro;
    mk.src = s.img; mk.alt = '';
    mk.dataset.big = big(s.img);
    mk.style.setProperty('--ar', s.ar);
    mk.style.transformOrigin = m.o;
    mk.classList.toggle('photo', !!s.photo);
    mk.dataset.z = m.z;
    mDetail.classList.toggle('is-cutout', !!m.contain);
    mDetail.classList.toggle('is-full', !!m.full);
    macro.classList.toggle('is-fullmode', !!m.full);
    mDetail.dataset.rot = m.rot || 6;
    const labels = m.steps || ['Celý kroj', 'Detail', 'Ornament', 'Steh', 'Ruka'];
    $$('.macro-steps li').forEach((li, i) => (li.textContent = labels[i]));
    macro.classList.toggle('is-gallery', !!m.gallery);
    mDetail.innerHTML = m.gallery
      ? m.gallery.map((g, i) => `<img src="${g.src}" srcset="${g.src} 1x, ${big(g.src, '@2x')} 2x" alt="${g.label}" data-label="${g.label}" loading="lazy" class="${i ? '' : 'is-on'}">`).join('')
      : m.video
      ? `<video src="${m.video}" poster="${m.poster}" muted loop playsinline preload="none" aria-label="${m.label}"></video>`
      : m.full
      ? `<img src="${m.detail}" alt="${m.label}" style="object-position:${m.pos}">`
      : `<img src="${m.detail}" srcset="${m.detail} 1x, ${big(m.detail, '@2x')} 2x" alt="${m.label}" style="object-position:${m.pos}" loading="lazy">`;
    mLabel.textContent = m.label + (s.real ? ' · z ateliéru' : '');
    upgradeMacro();
    if (macroReady) applyMacro(mp);   // pri prvom volaní ešte makro premenné neexistujú
  }

  /* veľkú verziu kroja načítaj, až keď sa makro blíži do zorného poľa */
  let macroNear = false;
  function upgradeMacro() {
    const url = mk.dataset.big;
    if (!macroNear || !url || mk.dataset.loaded === url) return;
    swapWhenReady(url, u => {
      if (mk.dataset.big !== u) return;   // medzitým sa prepol kroj
      mk.src = u; mk.dataset.loaded = u;
    });
  }
  new IntersectionObserver(es => {
    macroNear = es[0].isIntersecting;
    upgradeMacro();
  }, { rootMargin: '60% 0px' }).observe(macro);

  /* ───────── hotspot drawer ───────── */
  const drawer = $('#drawer'), scrim = $('#scrim'), zoom = $('#dr-zoom'), thumbs = $('#dr-thumbs');
  const setZoom = (s, h) => {
    const want = big(s.img);
    zoom.dataset.want = want;
    zoom.style.backgroundImage = `url(${zoom.dataset.loaded === want ? want : s.img})`;
    zoom.style.setProperty('--z', h.z + '%');
    zoom.style.setProperty('--pos', `${h.x}% ${h.y}%`);
    /* zásuvka zväčšuje fotku na 380 až 520 %, malá verzia by tu bola mäkká */
    swapWhenReady(want, u => {
      if (zoom.dataset.want !== u || !drawer.classList.contains('is-open')) return;
      zoom.style.backgroundImage = `url(${u})`;
      zoom.dataset.loaded = u;
    });
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
    { reg: 'Bašovce', t: 'Autorský trukovaný kroj', m: '2026 · ženský', img: 'img/kroj-basovsky-v2.webp', f: 'zensky' },
    { reg: 'Sviatočný', t: 'Kroj s fialovým brokátom', m: 'ženský', img: 'img/kroj-fialovy.webp', f: 'zensky' },
    { reg: 'Sviatočný', t: 'Červený kroj so zlatou trukovkou', m: 'ženský', img: 'img/kroj-cerveny.webp', f: 'zensky' },
    { reg: 'Pobedim', t: 'Zásterky na hody', m: '2026 · ženské', img: 'img/zasterky-pobedim.webp', f: 'zensky', wide: true },
    { reg: 'Očkov', t: 'Detský kroj podľa fotky', m: 'na zákazku · detský', img: 'img/kroj-ockovsky-detsky.webp', f: 'detsky zakazka', wide: true },
    { reg: 'Bučany', t: 'Mužský prucel', m: 'Trnavský kroj · mužský', img: 'img/prucel-bucany.webp', f: 'muzsky zakazka', wide: true },
    { reg: 'Podolie', t: 'Detské rukávce', m: 'trukovanie · detské', img: 'img/rukavce-podolie.webp', f: 'detsky', wide: true },
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
    const media = t.img ? `<img src="${t.img}" alt="" class="${t.photo ? 'is-photo' : ''}">` : `<span class="reg-live" aria-hidden="true"><svg><use href="#orn"/></svg></span>`;
    regCard.innerHTML = `${media}<div><p class="cnt">${t.k === 'live' ? 'Trukovanie naživo' : 'Kroj z ateliéru'}</p><h3>${t.n}</h3><p>${t.t}</p><a class="link-arrow" href="${t.k === 'live' ? '#podujatia' : '#kroje'}">${t.k === 'live' ? 'Podujatia' : 'Pozrieť kroje'} <svg><use href="#arrow"/></svg></a></div>`;
  };
  CTX.forEach(t => {
    const [x, y] = proj(t.lat, t.lon);
    const g = el('g', { class: 'rpt ctx' }, regPts);
    el('circle', { class: 'dot', cx: x, cy: y, r: 3 }, g);
    el('text', { x: x + 10, y: y + 4 }, g).textContent = t.n;
  });
  TOWNS.forEach((t, i) => {
    const [x, y] = proj(t.lat, t.lon);
    const g = el('g', { class: 'rpt' + (t.k === 'live' ? ' live' : ''), tabindex: 0, role: 'button', 'aria-label': t.n }, regPts);
    el('circle', { class: 'halo', cx: x, cy: y, r: 22 }, g);
    el('circle', { class: 'dot', cx: x, cy: y, r: t.main ? 7 : 5.5 }, g);
    el('text', { x: x + (t.a === 'end' ? -14 : 14), y: y + 4 + (t.dy || 0), 'text-anchor': t.a }, g).textContent = t.n;
    g.addEventListener('mouseenter', () => showTown(i));
    g.addEventListener('click', () => showTown(i));
    g.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), showTown(i)));
  });
  showTown(4);

  /* ───────── príbehy: kedysi / dnes ───────── */
  const cmp = $('#compare');
  $('input', cmp).addEventListener('input', e => cmp.style.setProperty('--cx', e.target.value + '%'));

  /* ───────── reveal ───────── */
  const io = new IntersectionObserver(ens => ens.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .stitch, .reg-map').forEach(x => io.observe(x));

  /* ───────── scroll: macro zoom, parallax, progress ───────── */
  const mv = mDetail, mSticky = $('.macro-sticky');
  const steps = $$('.macro-steps li'), mThread = $('.macro-thread path');
  mThread.setAttribute('pathLength', 1);
  const qb = $('.qb-img img'), atd = $('.at-detail'), pt = $('#pt-fill');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const range = (p, a, b) => clamp((p - a) / (b - a));

  /* ───────── makro: postup so zotrvačnosťou ─────────
     Koliesko myši skáče po krokoch. Postup sa preto k cieľu dobieha plynulo,
     zoom je exponenciálny (rovnaká rýchlosť priblíženia po celý čas)
     a do detailu sa neprelína, ale preostruje: kroj sa rozostrí, makro zaostrí. */
  const sstep = t => t * t * t * (t * (6 * t - 15) + 10);
  const glide = t => .55 * t + .45 * t * t * (3 - 2 * t);      // takmer rovnomerne, len mäkký rozbeh a dobeh
  let mp = 0, mTarget = 0, mRun = false, mLast = 0;
  macroReady = true;
  function applyMacro(p) {
    const Z = +mk.dataset.z || 5, full = mDetail.classList.contains('is-full');
    mk.style.setProperty('--mz', Math.pow(Z, glide(range(p, .02, full ? .64 : .6))).toFixed(4));
    if (full) {
      mk.style.setProperty('--mb', (11 * sstep(range(p, .46, .62))).toFixed(2) + 'px');
      mk.style.opacity = (1 - sstep(range(p, .52, .64))).toFixed(3);
      mv.style.setProperty('--vo', sstep(range(p, .5, .62)).toFixed(3));
      mv.style.setProperty('--vb', (11 * (1 - sstep(range(p, .54, .7)))).toFixed(2) + 'px');
      mv.style.setProperty('--vz', (1.06 * Math.pow(1.55, glide(range(p, .5, 1)))).toFixed(4));
      mv.style.setProperty('--vr', '0deg');
      mSticky.classList.toggle('on-photo', p > .57);
    } else {
      mk.style.setProperty('--mb', (10 * range(p, .45, .62)).toFixed(2) + 'px');
      mk.style.opacity = (1 - range(p, .45, .62)).toFixed(3);
      const v = range(p, .42, .8);
      mv.style.setProperty('--vo', clamp(v * 1.6).toFixed(3));
      mv.style.setProperty('--vb', (10 * (1 - range(p, .44, .62))).toFixed(2) + 'px');
      mv.style.setProperty('--vz', (.7 + sstep(v) * .55).toFixed(4));
      const rot = +mv.dataset.rot || 6;
      mv.style.setProperty('--vr', (-rot + v * rot * 1.2).toFixed(2) + 'deg');
      mSticky.classList.remove('on-photo');
      const vid = $('video', mv);
      if (vid) { if (v > .2 && vid.paused) vid.play().catch(() => {}); else if (v <= .2 && !vid.paused) vid.pause(); }
    }
    const gal = $$('img[data-label]', mv);
    let galOn = -1;
    if (gal.length) {
      galOn = Math.min(gal.length - 1, Math.floor(range(p, .5, .96) * gal.length));
      gal.forEach((g, i) => g.classList.toggle('is-on', i === galOn));
      mLabel.textContent = gal[galOn].dataset.label;
    }
    mSticky.style.setProperty('--co', range(p, .7, .86));
    mThread.style.setProperty('--to', 1 - range(p, .78, 1));
    let si = Math.min(4, Math.floor(p * 5.2));
    if (galOn >= 0 && p >= .5) si = Math.min(4, galOn + 1);
    steps.forEach((s, i) => s.classList.toggle('is-on', i === si));
  }
  function tickMacro(now) {
    // čas berieme len z rAF: pri nahrávaní videa beží spomalene a zotrvačnosť sa spomalí s ním
    const dt = mLast ? Math.min(.05, Math.max(0, (now - mLast) / 1000)) : 1 / 60; mLast = now;
    mp += (mTarget - mp) * (1 - Math.exp(-dt * 6.5));
    if (Math.abs(mTarget - mp) < .0004) { mp = mTarget; mRun = false; } else requestAnimationFrame(tickMacro);
    applyMacro(mp);
  }

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    header.classList.toggle('is-scrolled', y > 40);
    pt.style.setProperty('--p', clamp(y / (document.documentElement.scrollHeight - vh)));

    const r = macro.getBoundingClientRect();
    mTarget = clamp(-r.top / (r.height - vh));
    if (reduce) { mp = mTarget; applyMacro(mp); } else if (!mRun) { mRun = true; mLast = 0; requestAnimationFrame(tickMacro); }

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
