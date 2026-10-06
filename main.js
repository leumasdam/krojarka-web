/* Krojárka — prezentačný web (vanilla) */
(() => {
  /* po obnovení stránky vždy začať hore, nie uprostred makra */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); addEventListener('load', () => { window.scrollTo(0, 0); setTimeout(() => { window.scrollTo(0, 0); document.documentElement.style.scrollBehavior = ''; }, 50); }); }
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
      macro: { o: '16% 26%', z: 5, detail: 'img/detail-vysivka.webp', pos: '50% 50%', contain: true, rot: 10, label: 'Od kroja k stehu',
        story: [
          { t: 'Kroj sa čítal ako list.', d: 'Podľa živôtika, stuhy a sukne v kraji vedeli, odkiaľ žena je, koľko má rokov a či ide na hody, alebo do smútku.' },
          { t: 'Živôtik drží siluetu.', d: 'Zamat, perličky a pevný strih. Práve na ňom sa ukáže, či šila majsterka.' },
          { t: 'Výšivka sa ráta na stehy.', d: 'Jeden pás na rukáve sú stovky drobných stehov vedených rovno, ako podľa pravítka.' },
        ] },
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
      macro: { o: '50% 9%', z: 5, label: 'Vzácne bašovské štófky',
        story: [
          { k: 'Bašovce', t: 'Kroj z domova.', d: 'Lenka nosí nebíčkový kroj po bašovskej babičke Márii Melicherovej. Z tohto kraja vychádza aj jej autorský kroj.' },
          { k: 'Autorský kroj', t: 'Podľa starých vzorov, nie ich kópia.', d: 'Čierna a zlatá trukovka. Dnes je vystavený v ateliéri šperkárky Kataríny Žiak v Banskej Bystrici.' },
          { k: 'Detail', t: 'Štófky na pleciach.', d: 'Vzácna bašovská biela čipka. Na hodoch v Bašovciach ju ešte uvidíte.' },
        ],
        gallery: [
          { src: 'img/vyklad-bb.webp', label: 'Výklad · Katarína Žiak, Banská Bystrica' },
          { src: 'img/hody/stofky-makro.webp', label: 'Vzácne bašovské štófky' },
        ] },
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
        story: [
          { t: 'Červená na hody.', d: 'Červený živôtik, vysoký zlatý golier a čierna sukňa so zlatou trukovkou. Kroj, ktorý vidno z konca dediny.' },
          { k: 'Sukňa', t: 'Kvety na čiernej sukni.', d: 'Každý zlatý kvet je jedna súvislá retiazka. Stroj ťahá niť, smer kreslí ruka.', v: [2.8, 5.4] },
          { k: 'Živôtik', t: 'Strieborné spony.', d: 'Červený živôtik so striebornými sponami a zlatou výšivkou po stranách. Nad ním nariasený golier.', v: [5.6, 8.1] },
          { k: 'Zozadu', t: 'Mašľa vzadu.', d: 'Pestrá tkaná stuha s kvetmi sa viaže do veľkej mašle. Najlepšie ju vidno pri tanci.', v: [8.3, 10.7] },
        ] },
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
      macro: { o: '50% 60%', z: 5, detail: 'img/detail-modrotlac.webp', pos: '50% 50%', label: 'Vzor modrotlače',
        story: [
          { t: 'Vzor, ktorý nie je namaľovaný.', d: 'Drevenou formou sa na látku natlačí rezerva. Kde je, tam indigo nechytí a ostane biely ornament.' },
          { t: 'Do kade a znova.', d: 'Látka sa ponára do indiga viackrát, kým nemá tú hlbokú modrú.' },
          { t: 'Forma ako rukopis.', d: 'Každá dielňa mala svoje formy. Podľa vzoru sa dalo spoznať, odkiaľ látka je.' },
        ] },
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
        story: [
          { t: 'Nič sa tu nešetrilo.', d: 'Fialový brokát, zlaté borty, čipkový golier. Poďme po vrstvách.' },
          { k: 'Živôtik', t: 'Borty a gombíky.', d: 'Zlaté a strieborné borty prišité ručne jedna vedľa druhej, kovové gombíky.' },
          { k: 'Chrbát', t: 'Ľalie v brokáte.', d: 'Starý fialový brokát s ľaliami. Taký sa dnes zháňa veľmi ťažko.' },
          { k: 'Rukávce', t: 'Kolesá a madeira.', d: 'Vyšívané kolesá v žltej, fialovej a zelenej, pod nimi madeira s farebnými vlnovkami.' },
          { k: 'Zástera', t: 'Trukované kvety.', d: 'Kvety a slučky v bielej, fialovej a modrej. Všetko jedna retiazka vedená rukou.' },
        ],
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
      macro: { o: '30% 45%', z: 4.5, label: 'Výšivka na modrom saténe',
        story: [
          { k: 'Pobedim', t: 'Posledná noc pred hodami.', d: 'Zásterky pre Elišku. Čipky došité, v noci vyškrobené, ráno pripravené.' },
          { t: 'Každý pás iný.', d: 'Kvety, špirály a vlnovky v červenej, žltej a ružovej na modrom saténe.' },
          { k: 'Pobedim', t: 'Dedina, ktorá nosí kroj.', d: 'Na hodoch sa stretnú tri generácie. A deti v miestnej škole si trukovanie vyskúšali priamo pri stroji.' },
        ],
        gallery: [
          { src: 'img/zasterky-foto.webp', label: 'Výšivka na modrom saténe' },
          { src: 'img/krojarka-skola.webp', label: 'Trukovanie v škole · Pobedim' },
        ] },
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
      macro: { o: '55% 15%', z: 4.5, detail: 'img/detail-stuha.webp', pos: '50% 50%', label: 'Čipka a stuha',
        story: [
          { t: 'Z dievčaťa nevesta.', d: 'Pri čepčení dostala nevesta prvý raz na hlavu čepiec. Od toho dňa ho nosila ako vydatá žena.' },
          { t: 'Čipka nad čipkou.', d: 'Dlhé viazanie spadá na chrbát vrstva za vrstvou. Škrobí sa a skladá ručne.' },
          { t: 'Odev ako obrad.', d: 'Čepiec nebol do skrine. Patril k svadbe, ku krstinám aj k hodom.' },
        ] },
    },
    {
      key: 'prucel', title: 'Regióny', sub: 'Mužský prucel z Bučian.',
      txt: 'Trnavský kroj. Prucel ušitý podľa starej fotografie — brokát, vykrajované plstené lemy a rozety s gombíkmi.',
      cta: 'Objaviť regióny', href: '#regiony', real: true,
      img: 'img/prucel-bucany-v2.webp', ar: 1086 / 1351, amb: '#16795A',
      sc: .8, inset: 'img/foto-bucany-predloha.webp', insetCap: 'Predloha · Bučany',
      hs: [
        { x: 50, y: 12, t: 'Mašľa', d: 'Biela saténová mašľa s vyšívanými stuhami a zlatými strapcami.', z: 440 },
        { x: 20, y: 46, t: 'Rozety', d: 'Plstené rozety v červenej a zelenej s maľovanými gombíkmi — každá vystrihnutá ručne.', z: 460 },
        { x: 84, y: 62, t: 'Brokát', d: 'Tyrkysový brokát s veľkými ružami, lemovaný retiazkovou výšivkou.', z: 400 },
        { x: 30, y: 94, t: 'Lem', d: 'Vykrajovaný plstený lem v zelenej, červenej a oranžovej.', z: 420 },
      ],
      macro: { o: '22% 50%', z: 2.5, fadeEarly: true, contain: true, rot: 0, label: 'Rozety a gombíky',
        story: [
          { k: 'Bučany · Trnavský kroj', img: 'img/foto-bucany-predloha.webp', cap: 'Predloha · stará fotografia', t: 'Jediná stará fotka.', d: 'Mužský prucel z Bučian. Strih, rozety aj lemy sa čítali z čiernobielej fotografie.' },
          { k: 'Brokát', t: 'Prišité na brokát.', d: 'Rozety sa kladú pozdĺž stredu na tyrkysový brokát, pomedzi ne ide retiazková výšivka.' },
          { k: 'Rozety', t: 'Strihané ručne.', d: 'Plstené rozety v červenej a zelenej. Každá vystrihnutá z plsti ručne, žiadna nie je presne ako druhá.' },
          { k: 'Detaily', t: 'Lem, stred, gombíky.', d: 'Vykrajovaný červený lem s krížikovým stehom, stredový pás so slučkami z krémovej retiazky a maľované gombíky v strede každej rozety.' },
        ],
        /* prilietanie (všetko v %): fx/fy = odkiaľ letí, out = kedy odletí (null = ostane),
           k = kľúčové polohy podľa scrollu detailu 0–100: at = kedy, x/y = kde (0 0 stred), w = šírka,
           r = náklon, z = hĺbka (0 vpredu, 1 vzadu: menší, rozmazanejší, pomalší) */
        fly: [
          { src: 'img/prucel/brokat-foto.webp?v=2', label: 'Rozety prišité na brokát', fx: 70, fy: 60, out: null,
            k: [{ at: 2, x: 0, y: 0, w: 46, r: 1, z: 0 }, { at: 22, x: 4, y: 2, w: 44, r: -1, z: .15 }] },
          { src: 'img/prucel/rozety-zhluk.webp?v=2', label: 'Plstené rozety', fx: -70, fy: 50, out: null,
            k: [{ at: 22, x: -44, y: 20, w: 32, r: -6, z: 0 }] },
          { src: 'img/prucel/lem.webp', label: 'Vykrajovaný lem', fx: 80, fy: -60, out: null,
            k: [{ at: 40, x: 52, y: -26, w: 34, r: 0, z: 0 }] },
          { src: 'img/prucel/stred.webp', label: 'Krížiky a slučky', fx: 85, fy: 30, out: null,
            k: [{ at: 42, x: 60, y: 6, w: 24, r: 0, z: 0 }] },
          { src: 'img/prucel/gombiky.webp', label: 'Maľované gombíky', fx: -60, fy: -70, out: null,
            k: [{ at: 44, x: -46, y: -28, w: 28, r: 0, z: 0 }] },
        ] },
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
      macro: { o: '21% 25%', z: 4.5, video: 'img/rukavce.mp4', poster: 'img/rukavce-poster.jpg', label: 'Detské podolské rukávce',
        story: [
          { k: 'Na želanie', img: 'img/foto-rodinna.webp', cap: 'Predloha · rodinná fotografia', t: 'Dievčatko medzi starými rodičmi.', d: 'Jediná rodinná fotka. Podľa nej vznikol detský očkovský kroj.' },
          { k: 'Golier', t: 'Golier ako na fotke.', d: 'Ružový nariasený golier, presne taký, aký mala dievčina na fotografii.', v: [2.6, 5.2] },
          { k: 'Rukávce', t: 'Rukávce zblízka.', d: 'Kolesá v žltej, ružovej a zelenej. Retiazka za retiazkou.', v: [5.6, 7.6] },
        ] },
    },
    {
      key: 'krojarka', title: 'Krojárka', sub: 'Aby príbeh pokračoval.',
      txt: 'Remeslo žije, kým ho má kto odovzdávať. Trukovanie ukazuje aj deťom v školách — priamo pri stroji.',
      cta: 'Spoznať Krojárku', href: '#krojarka', real: true,
      img: 'img/krojarka-stroj.webp', ar: 1050 / 1400, amb: '#A0692A', photo: true,
      hs: [
        { x: 40, y: 50, t: 'Stroj', d: 'Historický trukovací stroj Lintz & Eckhardt, Berlín. Látku vedie ruka, stroj len ťahá retiazku.', z: 380 },
      ],
      macro: { o: '50% 50%', z: 1, video: 'img/krojarka-stroj.mp4', poster: 'img/krojarka-stroj-first.jpg', live: true, label: 'Pri trukovacom stroji', facts: ['Lintz & Eckhardt, Berlín.<br>Stroj starší ako republika.', 'Stroj ťahá niť.<br>Smer a tvar vedie ruka.', 'Jedna ihla, jedna niť,<br>tisíce slučiek.'] },
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
    { n: 'Bučany', lat: 48.4190, lon: 17.6992, k: 'kroj', img: 'img/prucel-bucany-v2.webp', t: 'Mužský a ženský prucel · Trnavský kroj', a: 'end' },
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
  const mk = $('.macro-kroj'), mDetail = $('#macro-detail'), mLabel = $('#macro-label'), mSticky = $('.macro-sticky');
  let mSegs = [], mSeq = false, mChapter = -1, mFly = null;
  let mFlyBase = [], mMouse = { x: 0, y: 0 }, mFlyRun = false;
  function setMacro(s) {
    const m = s.macro;
    mk.src = s.img; mk.alt = '';
    mk.dataset.big = big(s.img);
    mk.style.setProperty('--ar', s.ar);
    mk.style.transformOrigin = m.o;
    mk.classList.toggle('photo', !!s.photo);
    mk.dataset.z = m.z;
    mDetail.classList.toggle('is-cutout', !!m.contain);
    mDetail.dataset.rot = m.rot ?? 6;
    mDetail.classList.toggle('is-fly', !!m.fly);
    mk.dataset.fade = m.fadeEarly ? 1 : 0;
    /* zábery videa ku kapitolám: [od, do] v sekundách; sekcia s kapitolami po obrázkoch/záberoch je dlhšia */
    mSegs = (m.story || []).map(c => c.v || null);
    mFly = m.fly || null;
    if (mFly && macroNear && !mFlyRun) { mFlyRun = true; requestAnimationFrame(flyLoop); }
    const seq = !!m.gallery || !!m.fly || mSegs.some(Boolean);
    macro.classList.toggle('is-fly', !!m.fly);
    if (!$('.macro-orn')) mSticky.insertAdjacentHTML('afterbegin', '<img class="macro-orn l" src="img/prucel/orn-l.webp?v=2" alt="" aria-hidden="true"><img class="macro-orn r" src="img/prucel/orn-r.webp?v=2" alt="" aria-hidden="true">');
    macro.classList.toggle('is-gallery', seq);
    mSeq = seq; mChapter = -1;
    macro.classList.toggle('is-live', !!m.live);
    let facts = $('.macro-facts');
    if (!facts) { facts = document.createElement('ol'); facts.className = 'macro-facts'; mSticky.appendChild(facts); }
    /* príbeh kroja: kapitoly sa striedajú počas priblíženia */
    facts.classList.toggle('is-story', !!m.story);
    facts.innerHTML = m.story
      ? m.story.map(c => `<li>${c.img ? `<figure class="mf-img"><img src="${c.img}" alt="${c.cap}" loading="lazy"><figcaption>${c.cap}</figcaption></figure>` : ''}` +
          `${c.k ? `<span class="mf-k">${c.k}</span>` : ''}<b>${c.t}</b><span class="mf-d">${c.d}</span></li>`).join('')
      : (m.facts || []).map(f => `<li>${f}</li>`).join('');
    mDetail.innerHTML = m.fly
      ? m.fly.map(f => `<img src="${f.src}" alt="${f.label}" data-label="${f.label}" loading="lazy" class="fly-img">`).join('')
      : m.gallery
      ? m.gallery.map((g, i) => `<img src="${g.src}" srcset="${g.src} 1x, ${big(g.src, '@2x')} 2x" alt="${g.label}" data-label="${g.label}" loading="lazy" onerror="this.removeAttribute('srcset')" class="${i ? '' : 'is-on'}">`).join('')
      : m.video
      ? `<video src="${m.video}" poster="${m.poster}" muted loop playsinline preload="${m.live ? 'auto' : 'none'}" aria-label="${m.label}"></video>`
      : `<img src="${m.detail}" srcset="${m.detail} 1x, ${big(m.detail, '@2x')} 2x" alt="${m.label}" style="object-position:${m.pos}" loading="lazy" onerror="this.removeAttribute('srcset')">`;
    mLabel.textContent = m.label + (s.real ? ' · z ateliéru' : '');
    document.dispatchEvent(new Event('macrochange'));
    const vid = $('video', mDetail);
    if (vid) {
      /* záber kapitoly sa opakuje dokola, kým sa kapitola nezmení */
      vid.addEventListener('timeupdate', () => {
        const t = mSegs[mChapter];
        if (t && (vid.currentTime >= t[1] || vid.currentTime < t[0] - .3)) vid.currentTime = t[0];
      });
      vid.addEventListener('seeked', () => vid.classList.remove('is-cut'));
    }
    upgradeMacro();
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
    if (macroNear && mFly && !mFlyRun) { mFlyRun = true; requestAnimationFrame(flyLoop); }
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

  /* logo na homepage: plynulo hore, bez reloadu */
  $('.logo').addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); history.replaceState(null, '', location.pathname); }); // logo-top

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
    { reg: 'Bučany', t: 'Mužský prucel', m: 'Trnavský kroj · mužský', img: 'img/prucel-bucany-v2.webp', f: 'muzsky zakazka', wide: true },
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
  const mv = mDetail;
  const mThread = $('.macro-thread path');
  mThread.setAttribute('pathLength', 1);
  const qb = $('.qb-img img'), atd = $('.at-detail'), pt = $('#pt-fill');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const range = (p, a, b) => clamp((p - a) / (b - a));

  /* ?tune — editor prilietania: vyber kus a jeho polohu, ťahaj myšou, kolieskom otáčaj, slidery doladia zvyšok */
  let tune = null;
  if (/[?&]tune/.test(location.search)) {
    document.body.classList.add('is-tune');
    const el = document.createElement('aside'); el.id = 'tune';
    const KF = { at: [0, 100, 'kedy (% scrollu)'], x: [-70, 70, 'kde ←→'], y: [-70, 70, 'kde ↑↓'], w: [8, 90, 'šírka'], r: [-60, 60, 'náklon (°)'], z: [0, 1, 'hĺbka (0 vpredu, 1 vzadu)'] };
    const PF = { fx: [-160, 160, 'odkiaľ letí ←→'], fy: [-160, 160, 'odkiaľ letí ↑↓'], out: [0, 100, 'kedy odletí'] };
    const fmt = v => v === null ? 'null' : Math.round(v * 100) / 100;
    const name = f => f.src.split('/').pop().replace(/\.webp.*$/, '');
    const dump = () => { if (!tune || !tune.out) return;
      tune.out.value = 'fly: [\n' + mFly.map(f => `  { src: '${f.src}', label: '${f.label}', fx: ${f.fx}, fy: ${f.fy}, out: ${fmt(f.out)},\n    k: [` +
        f.k.map(k => `{ at: ${k.at}, x: ${fmt(k.x)}, y: ${fmt(k.y)}, w: ${fmt(k.w)}, r: ${fmt(k.r)}, z: ${fmt(k.z)} }`).join(', ') + '] },').join('\n') + '\n]'; };
    const flyImgs = () => $$('.fly-img', mDetail);
    const curD = () => parseFloat(tune.d.textContent) || 0;
    const showAt = at => { const r = macro.getBoundingClientRect(); window.scrollTo(0, scrollY + r.top + (r.height - innerHeight) * (.3 + Math.min(99, at + 9) * .007)); };
    const select = (i, kf) => {
      const f = mFly[i]; if (!f) return;
      if (kf == null) { kf = 0; f.k.forEach((k, j) => { if (curD() >= k.at) kf = j; }); }   // poloha platná pri aktuálnom scrolle
      tune.sel = i; tune.kf = kf;
      flyImgs().forEach((g, j) => g.classList.toggle('is-sel', j === i));
      $$('.t-item', el).forEach((b, j) => b.classList.toggle('is-on', j === i));
      $('.t-name', el).textContent = (i + 1) + '. ' + name(f);
      $('.t-kfs', el).innerHTML = f.k.map((k, j) => `<button class="t-kf ${j === kf ? 'is-on' : ''}" data-j="${j}">poloha ${j + 1} <i>@${k.at}</i></button>`).join('') +
        `<button class="t-kf t-add" title="pridať polohu (kam kus ustúpi neskôr)">+</button>${f.k.length > 1 ? '<button class="t-kf t-del" title="odobrať túto polohu">−</button>' : ''}`;
      $$('.t-kf[data-j]', el).forEach(b => b.addEventListener('click', () => { select(i, +b.dataset.j); showAt(f.k[+b.dataset.j].at); }));
      const add = $('.t-add', el); add.addEventListener('click', () => { const k = f.k[kf]; f.k.splice(kf + 1, 0, Object.assign({}, k, { at: Math.min(99, k.at + 20), z: Math.min(1, k.z + .5), w: k.w * .65 })); f.k.sort((p, q) => p.at - q.at); select(i, kf + 1); dump(); onScroll(); });
      const del = $('.t-del', el); if (del) del.addEventListener('click', () => { f.k.splice(kf, 1); select(i, Math.max(0, kf - 1)); dump(); onScroll(); });
      const k = f.k[kf];
      $$('.t-sl', el).forEach(inp => { const key = inp.dataset.k, v = key in KF ? k[key] : f[key]; inp.value = v === null ? inp.max : v; inp.nextElementSibling.textContent = v === null ? '∞' : fmt(v); });
      $('.t-stay', el).checked = f.out === null;
    };
    const slider = (key, [lo, hi, t]) => `<label><span>${key} <i>${t}</i></span><input class="t-sl" type="range" min="${lo}" max="${hi}" step="${key === 'z' ? .05 : key === 'w' || key === 'r' ? .5 : 1}" data-k="${key}"><output></output></label>`;
    const build = () => {
      if (!mFly) { el.innerHTML = '<p>Tento kroj nemá prilietanie. Vyber na úvode prucel (08).</p>'; tune = { d: { textContent: '' } }; return; }
      el.innerHTML = '<p class="t-h">Pozícia v detaile: <b class="t-d">0 %</b> · klikni na kus a ťahaj ho, kolieskom otáčaš. Každý kus má polohy: prvá = príchod, ďalšie = kam ustúpi, keď príde ďalší kus.</p>' +
        '<div class="t-row"><div class="t-list">' + mFly.map((f, i) => `<button class="t-item" data-i="${i}">${i + 1}. ${name(f)}<span>ukáž</span></button>`).join('') + '</div>' +
        '<div class="t-sliders"><b class="t-name"></b><div class="t-kfs"></div>' + Object.entries(KF).map(([k, v]) => slider(k, v)).join('') +
        '<hr>' + Object.entries(PF).map(([k, v]) => slider(k, v)).join('') +
        '<label class="t-stayl"><input type="checkbox" class="t-stay"> ostane do konca (out = null)</label></div></div>' +
        '<textarea class="t-out" readonly></textarea><p class="t-n">Skopíruj obsah políčka a pošli ho.</p>';
      tune = { d: $('.t-d', el), out: $('.t-out', el), sel: 0, kf: 0 };
      $$('.t-item', el).forEach(btn => btn.addEventListener('click', e => { const i = +btn.dataset.i; select(i, 0); if (e.target.tagName === 'SPAN') showAt(mFly[i].k[0].at); }));
      $$('.t-sl', el).forEach(inp => inp.addEventListener('input', () => {
        const f = mFly[tune.sel], key = inp.dataset.k, v = +inp.value;
        if (key in KF) { f.k[tune.kf][key] = v; if (key === 'at') { f.k.sort((p, q) => p.at - q.at); tune.kf = f.k.findIndex(k => k[key] === v); } }
        else { f[key] = v; if (key === 'out') $('.t-stay', el).checked = false; }
        inp.nextElementSibling.textContent = fmt(v); if (key === 'at') select(tune.sel, tune.kf);
        dump(); onScroll();
      }));
      $('.t-stay', el).addEventListener('change', e => { const f = mFly[tune.sel]; f.out = e.target.checked ? null : 90; select(tune.sel, tune.kf); dump(); onScroll(); });
      dump(); select(0, 0);
    };
    let drag = null;
    mDetail.addEventListener('pointerdown', e => {
      const g = e.target.closest('.fly-img'); if (!g || !mFly) return;
      const i = flyImgs().indexOf(g); select(i, null);
      const k = mFly[i].k[tune.kf]; drag = { i, kf: tune.kf, x0: e.clientX, y0: e.clientY, kx: k.x, ky: k.y };
      g.setPointerCapture(e.pointerId); e.preventDefault();
    });
    mDetail.addEventListener('pointermove', e => {
      if (!drag) return;
      const k = mFly[drag.i].k[drag.kf];
      k.x = Math.round((drag.kx + (e.clientX - drag.x0) / mDetail.clientWidth * 100) * 10) / 10;
      k.y = Math.round((drag.ky + (e.clientY - drag.y0) / mDetail.clientHeight * 100) * 10) / 10;
      select(drag.i, drag.kf); dump(); onScroll();
    });
    addEventListener('pointerup', () => { drag = null; });
    mDetail.addEventListener('wheel', e => {
      const g = e.target.closest('.fly-img'); if (!g || !mFly) return;
      e.preventDefault();
      const i = flyImgs().indexOf(g); select(i, null);
      const k = mFly[i].k[tune.kf]; k.r = Math.round((k.r + (e.deltaY > 0 ? 2 : -2)) * 10) / 10;
      select(i, tune.kf); dump(); onScroll();
    }, { passive: false });
    document.body.appendChild(el); build();
    document.addEventListener('macrochange', build);
  }

  /* ───────── prilietanie ─────────
     Kľúčové polohy sa interpolujú podľa scrollu; príchod má mierne prestrelenie (ako keď kus dosadne),
     odchod ide pomimo kamery. Hĺbka z robí kus menším, rozmazanejším a pomalším v paralaxe.
     Dýchanie a paralaxa myšou bežia v rAF slučke, len kým je makro na obrazovke. */
  const sstep = t => t * t * (3 - 2 * t);
  const back = t => { const c = .9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const lerp = (a, b, t) => a + (b - a) * t;
  function flyState(f, d) {
    const K = f.k, a = range(d, K[0].at, K[0].at + 8);
    if (a <= 0) return { on: false, op: 0 };
    const cur = Object.assign({}, K[0]);
    for (let j = 1; j < K.length; j++) {
      const t = sstep(range(d, K[j].at, K[j].at + 8)); if (t <= 0) break;
      for (const key of ['x', 'y', 'w', 'r', 'z']) cur[key] = lerp(cur[key], K[j][key], t);
    }
    const ab = back(a), as = sstep(a);
    const out = f.out == null ? 0 : sstep(range(d, f.out, f.out + 7));
    const depth = 1 - cur.z * .45;
    return {
      on: out < 1, w: cur.w, z: cur.z,
      x: lerp(f.fx, cur.x, ab) - (f.fx * .5 + cur.x * .3) * out,
      y: lerp(f.fy, cur.y, ab) - (f.fy * .5 + cur.y * .3) * out,
      s: (.3 + .7 * ab) * depth + .5 * out,
      r: cur.r * (2.2 - 1.2 * ab) * (1 - .6 * out),
      blur: 8 * (1 - as) + 5 * cur.z + 10 * out,
      op: clamp(a * 1.6) * (1 - cur.z * .3) * clamp(1 - out * 1.4),
      sh: .22 * as * (1 - out) * (1 - cur.z * .6),
    };
  }
  function applyFly(t = performance.now() / 1000) {
    const gal = $$('.fly-img', mv), cw = mv.clientWidth, chh = mv.clientHeight;
    gal.forEach((g, i) => {
      const st = mFlyBase[i]; if (!st) return;
      if (!st.on && !st.op) { g.style.opacity = 0; return; }
      const k = 1 - st.z * .7, calm = reduce ? 0 : 1;
      const fx = Math.sin(t * .6 + i * 1.7) * .7 * k * calm, fy = Math.cos(t * .45 + i * 2.1) * .9 * k * calm, fr = Math.sin(t * .35 + i) * 1.2 * k * calm;
      const px = mMouse.x * (5 - st.z * 4) * calm, py = mMouse.y * (3.5 - st.z * 2.8) * calm;
      g.style.maxWidth = st.w + '%';
      g.style.transform = `translate(calc(-50% + ${((st.x + fx + px) / 100 * cw).toFixed(1)}px), calc(-50% + ${((st.y + fy + py) / 100 * chh).toFixed(1)}px)) scale(${st.s.toFixed(3)}) rotate(${(st.r + fr).toFixed(2)}deg)`;
      g.style.opacity = st.op.toFixed(3);
      g.style.filter = `blur(${st.blur.toFixed(1)}px) drop-shadow(0 ${(24 * (1 - st.z * .5)).toFixed(0)}px ${(36 * (1 - st.z * .5)).toFixed(0)}px rgba(24,22,20,${st.sh.toFixed(2)}))`;
      g.style.zIndex = Math.round(10 - st.z * 9);
    });
  }
  function flyLoop() {
    if (!mFly || !macroNear) { mFlyRun = false; return; }
    applyFly(); requestAnimationFrame(flyLoop);
  }
  addEventListener('pointermove', e => { mMouse.x = e.clientX / innerWidth - .5; mMouse.y = e.clientY / innerHeight - .5; }, { passive: true });

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    header.classList.toggle('is-scrolled', y > 40);
    pt.style.setProperty('--p', clamp(y / (document.documentElement.scrollHeight - vh)));

    const r = macro.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh));
    if (macro.classList.contains('is-live')) {
      /* video ostáva v oblúku; počas scrollu sa oblúk zväčší o 18 % a obsah o 8 %, rovnomerne cez všetkých päť krokov */
      const N = (m => m ? m.children.length : 1)($('.macro-facts')) || 1, si = Math.min(N - 1, Math.floor(p * N));
      mk.style.setProperty('--mz', 1); mk.style.opacity = 0;
      mv.style.setProperty('--vo', 1);
      mv.style.setProperty('--grow', (p * 0.28).toFixed(4));
      mv.style.setProperty('--vz', (1 + p * 0.18).toFixed(4));
      mv.style.setProperty('--vr', '0deg');
      const vid = $('video', mv);
      if (vid && vid.paused) vid.play().catch(() => {});
      mSticky.style.setProperty('--co', range(p, .4, .52));
      mThread.style.setProperty('--to', 1 - range(p, .5, .85));
      $$('.macro-facts li').forEach((f, i) => f.classList.toggle('is-on', i === si));
      if (qb) { const qr = qb.parentElement.getBoundingClientRect(); qb.style.setProperty('--py', ((qr.top + qr.height / 2 - vh / 2) * -.12) + 'px'); }
      return;
    }
    const z = ease(range(p, 0, .6));
    mk.style.setProperty('--mz', 1 + z * ((+mk.dataset.z || 5) - 1));
    /* kroj s prilietaním bledne už od tretiny priblíženia */
    mk.style.opacity = 1 - (mk.dataset.fade === '1' ? range(p, .2, .4) : range(p, .45, .62));
    const v = mFly ? range(p, .26, .5) : range(p, .42, .8);
    mv.style.setProperty('--vo', clamp(v * 1.6));
    mv.style.setProperty('--vz', .7 + ease(v) * .55);
    const rot = +mv.dataset.rot;
    mv.style.setProperty('--vr', (-rot + v * rot * 1.2) + 'deg');
    const vid = $('video', mv);
    if (vid) { if (v > .2 && vid.paused) vid.play().catch(() => {}); else if (v <= .2 && !vid.paused) vid.pause(); }
    const gal = $$('img[data-label]', mv);
    mSticky.style.setProperty('--co', range(p, .7, .86));
    mThread.style.setProperty('--to', 1 - range(p, .78, 1));
    const ch = $$('.macro-facts li'), N = ch.length || 1;
    $('.macro-facts').style.setProperty('--lc', range(p, .12, .35).toFixed(3));
    /* prvá kapitola počas priblíženia; ostatné sa striedajú, keď je detail celý viditeľný,
       a každá má vlastný obrázok galérie alebo záber videa */
    let si = mSeq
      ? (p < (mFly ? .3 : .5) ? 0 : Math.min(N - 1, 1 + Math.floor(range(p, .5, .95) * (N - 1))))
      : Math.min(N - 1, Math.floor(range(p, 0, .9) * N));
    if (mFly) {
      const d = range(p, .3, 1) * 100;
      mv.style.setProperty('--vz', 1); mv.style.setProperty('--vr', '0deg');
      let last = -1;
      /* na mobile vždy len jeden kus: každý má rovnaký diel scrollu, v strede, a odletí, keď príde ďalší */
      const narrow = innerWidth <= 960, n = mFly.length;
      mFlyBase = mFly.map((f, i) => {
        const g = narrow ? Object.assign({}, f, { out: i < n - 1 ? (i + 1) * (92 / n) : null, k: [{ at: i * (92 / n) + 2, x: 0, y: 0, w: 92, r: f.k[0].r * .5, z: 0 }] }) : f;
        const st = flyState(g, d); if (st.on) last = i; return st;
      });
      gal.forEach((g, i) => g.classList.toggle('is-on', i === last));
      applyFly();
      si = Math.min(N - 1, last + 1);
      if (last >= 0) mLabel.textContent = mFly[last].label;
      mSticky.style.setProperty('--orn', range(d, 0, 12).toFixed(3));
      if (tune) tune.d.textContent = d.toFixed(0) + ' %';
    }
    ch.forEach((c, i) => c.classList.toggle('is-on', i === si));
    if (gal.length && !mFly) {
      /* pri prilietaní počas priblíženia ešte nič neletí, prvý kus priletí až s druhou kapitolou */
      const gi = mv.classList.contains('is-fly') ? Math.min(gal.length - 1, si - 1) : Math.max(0, Math.min(gal.length - 1, si - 1));
      gal.forEach((g, i) => { g.classList.toggle('is-on', i === gi); g.classList.toggle('is-past', i < gi); });
      if (gi >= 0) mLabel.textContent = gal[gi].dataset.label;
    }
    if (si !== mChapter) {
      mChapter = si;
      const t = vid && mSegs[si];
      if (t) { vid.classList.add('is-cut'); vid.currentTime = t[0]; }
    }

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
