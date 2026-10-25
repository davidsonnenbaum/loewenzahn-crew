// Die Radküche – ein Spiel der Löwenzahn-Crew
(function () {
  'use strict';
  const SVGNS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------
  // Zutaten. Gewicht je Monat (Jan..Dez) = wie oft so etwas gerettet wird.
  // Grundlage: österreichischer Saisonkalender und was im Handel typisch übrig bleibt.
  // ---------------------------------------------------------------
  const ALL = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  const m = (list, w, rest = 0) => Array.from({ length: 12 }, (_, i) => (list.includes(i + 1) ? w : rest));
  const ING = {
    brot:       { name: 'Brot',        type: 'bread',  color: '#C8925A', w: ALL.map(() => 10) },
    kartoffeln: { name: 'Kartoffeln',  type: 'hard',   color: '#D9B26F', w: ALL.map(() => 5) },
    karotten:   { name: 'Karotten',    type: 'hard',   color: '#E8792F', w: ALL.map(() => 4) },
    bananen:    { name: 'Bananen',     type: 'fruit',  color: '#F5D547', w: ALL.map(() => 4) },
    pilze:      { name: 'Champignons', type: 'soft',   color: '#D9CBB5', w: ALL.map(() => 2) },
    linsen:     { name: 'Linsen',      type: 'legume', color: '#B5651D', w: ALL.map(() => 1.5) },
    aepfel:     { name: 'Äpfel',       type: 'fruit',  color: '#C9463D', w: m([8, 9, 10, 11, 12, 1, 2, 3, 4], 6, 2) },
    kuerbis:    { name: 'Kürbis',      type: 'hard',   color: '#E8792F', w: m([9, 10, 11], 7, 0).map((v, i) => (i === 11 ? 2 : v)) },
    kraut:      { name: 'Weißkraut',   type: 'medium', color: '#C9DDB0', w: m([9, 10, 11, 12, 1, 2, 3], 5, 1) },
    rueben:     { name: 'Rote Rüben',  type: 'hard',   color: '#8E2B4E', w: m([9, 10, 11, 12, 1, 2, 3], 4, 0) },
    lauch:      { name: 'Lauch',       type: 'medium', color: '#8DB36B', w: m([9, 10, 11, 12, 1, 2, 3, 4], 4, 1) },
    sellerie:   { name: 'Sellerie',    type: 'hard',   color: '#D8D3A8', w: m([9, 10, 11, 12, 1, 2, 3], 3, 0) },
    pastinaken: { name: 'Pastinaken',  type: 'hard',   color: '#EFE3C2', w: m([10, 11, 12, 1, 2, 3], 3, 0) },
    birnen:     { name: 'Birnen',      type: 'fruit',  color: '#C8C15A', w: m([8, 9, 10, 11], 4, 1) },
    zwetschken: { name: 'Zwetschken',  type: 'fruit',  color: '#5B3A7A', w: m([8, 9, 10], 4, 0) },
    spinat:     { name: 'Spinat',      type: 'leafy',  color: '#3F7A3A', w: m([3, 4, 5, 9, 10], 4, 1) },
    baerlauch:  { name: 'Bärlauch',    type: 'leafy',  color: '#4E9A45', w: m([3, 4], 5, 0) },
    radieschen: { name: 'Radieschen',  type: 'soft',   color: '#D8436A', w: m([4, 5, 6], 4, 0) },
    spargel:    { name: 'Spargel',     type: 'medium', color: '#B9C98A', w: m([4, 5, 6], 3, 0) },
    erdbeeren:  { name: 'Erdbeeren',   type: 'fruit',  color: '#D7322B', w: m([5, 6], 5, 0) },
    zucchini:   { name: 'Zucchini',    type: 'soft',   color: '#5E8C3A', w: m([6, 7, 8, 9], 6, 0) },
    tomaten:    { name: 'Tomaten',     type: 'soft',   color: '#D7322B', w: m([7, 8, 9], 7, 2) },
    paprika:    { name: 'Paprika',     type: 'soft',   color: '#E04E2B', w: m([7, 8, 9], 5, 1) },
    marillen:   { name: 'Marillen',    type: 'fruit',  color: '#F0A04B', w: m([7], 5, 0) },
    kohlrabi:   { name: 'Kohlrabi',    type: 'medium', color: '#C7E0A5', w: m([5, 6, 7, 8, 9, 10], 3, 0) }
  };
  const BASE = {
    oel:      { name: 'Öl',        color: '#E9C46A' },
    zwiebel:  { name: 'Zwiebel',   color: '#D9A86C' },
    knoblauch:{ name: 'Knoblauch', color: '#F1ECE0' },
    wasser:   { name: 'Wasser',    color: '#9CC7DF' }
  };
  const SPICE = {
    salz:          { name: 'Salz',          color: '#FFFFFF' },
    pfeffer:       { name: 'Pfeffer',       color: '#3B2A1E' },
    paprikapulver: { name: 'Paprikapulver', color: '#C0392B' },
    kuemmel:       { name: 'Kümmel',        color: '#8A6B3E' },
    majoran:       { name: 'Majoran',       color: '#7E9A5E' },
    curry:         { name: 'Curry',         color: '#E3B505' },
    zimt:          { name: 'Zimt',          color: '#A0522D' },
    muskat:        { name: 'Muskat',        color: '#9C7A54' },
    chili:         { name: 'Chili',         color: '#E0301E' },
    kraeuter:      { name: 'Frische Kräuter', color: '#4E9A45' },
    zitrone:       { name: 'Zitrone',       color: '#F7E04B' }
  };
  const NAME = (id) => (ING[id] || BASE[id] || SPICE[id]).name;

  const MONTHS = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const SEASON_WORD = {
    kuerbis: 'Kürbiszeit', aepfel: 'Apfelzeit', zwetschken: 'Zwetschkenzeit', kraut: 'Krautzeit', rueben: 'Wurzelzeit',
    pastinaken: 'Wurzelzeit', sellerie: 'Wurzelzeit', lauch: 'Lauchzeit', baerlauch: 'Bärlauchzeit', spargel: 'Spargelzeit',
    erdbeeren: 'Erdbeerzeit', zucchini: 'Zucchinizeit', tomaten: 'Paradeiserzeit', marillen: 'Marillenzeit', spinat: 'Spinatzeit',
    radieschen: 'Radieschenzeit', paprika: 'Paprikazeit', birnen: 'Birnenzeit', kohlrabi: 'Kohlrabizeit'
  };

  function seasonInfo() {
    const now = new Date();
    const mi = now.getMonth();
    let topId = null, top = 0;
    for (const id in ING) {
      if (['brot', 'kartoffeln', 'karotten', 'bananen', 'pilze', 'linsen'].includes(id)) continue;
      if (ING[id].w[mi] > top) { top = ING[id].w[mi]; topId = id; }
    }
    return { day: now.getDate(), month: mi, word: topId ? SEASON_WORD[topId] : 'Rettungszeit' };
  }

  // Zufall mit Startwert: gleiche Tageskiste für alle
  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const TODAY = new Date();
  const DAY_KEY = TODAY.getFullYear() * 10000 + (TODAY.getMonth() + 1) * 100 + TODAY.getDate();
  function dayRng(k) { return mulberry(DAY_KEY * 7919 + k * 104729); }
  function weightedPick(pool, mi, r0) {
    const R = r0 || Math.random;
    const total = pool.reduce((s, id) => s + ING[id].w[mi], 0);
    let r = R() * total;
    for (const id of pool) { r -= ING[id].w[mi]; if (r <= 0) return id; }
    return pool[pool.length - 1];
  }

  function newCrate(r0) {
    const R = r0 || Math.random;
    const mi = new Date().getMonth();
    const sizes = [3, 3, 4, 4, 5, 5, 6];
    const size = sizes[Math.floor(R() * sizes.length)];
    let pool = Object.keys(ING).filter((id) => ING[id].w[mi] > 0);
    const crate = {};
    for (let i = 0; i < size && pool.length; i++) {
      const id = weightedPick(pool, mi, R);
      pool = pool.filter((x) => x !== id);
      crate[id] = id === 'brot' ? Math.floor(3 + R() * 3) : Math.floor(2 + R() * 3);
    }
    return crate;
  }
  function nextCrate() {
    if (S && S.daily) { S.crateNo = (S.crateNo || 0) + 1; return newCrate(dayRng(5000 + S.crateNo)); }
    return newCrate();
  }

  // ---------------------------------------------------------------
  // Die Jury. Das Küchenwissen steckt in diesen Regeln.
  // ---------------------------------------------------------------
  const DISHES = [
    { name: 'Vegane Erdäpfelpuffer', need: ['kartoffeln', 'oel', 'zwiebel'], not: ['wasser'] },
    { name: 'Erdäpfelgulasch', need: ['kartoffeln', 'zwiebel', 'paprikapulver', 'wasser'] },
    { name: 'Marokkanischer Linseneintopf', need: ['linsen', 'wasser'], any: ['zimt', 'chili'] },
    { name: 'Französische Linsen', need: ['linsen', 'wasser', 'kraeuter'], any: ['karotten', 'lauch', 'sellerie'] },
    { name: 'Marokkanischer Kürbistopf', need: ['kuerbis', 'wasser', 'zimt'] },
    { name: 'Antipasti', need: ['oel', 'knoblauch', 'kraeuter'], any: ['zucchini', 'paprika', 'pilze', 'tomaten'], not: ['wasser'] },
    { name: 'Pilzgulasch', need: ['pilze', 'zwiebel', 'paprikapulver'] },
    { name: 'Kürbiscremesuppe', need: ['kuerbis', 'zwiebel', 'wasser'] },
    { name: 'Linseneintopf', need: ['linsen', 'wasser'], any: ['karotten', 'sellerie', 'lauch', 'kartoffeln'] },
    { name: 'Rote-Rüben-Suppe', need: ['rueben', 'zwiebel', 'wasser'] },
    { name: 'Bärlauchsuppe', need: ['baerlauch', 'kartoffeln', 'wasser'] },
    { name: 'Spinat-Erdäpfel', need: ['kartoffeln', 'spinat', 'knoblauch'] },
    { name: 'Wiener Krautgemüse', need: ['kraut', 'zwiebel', 'kuemmel'] },
    { name: 'Ratatouille', need: ['zucchini', 'tomaten', 'knoblauch'] },
    { name: 'Lauch-Erdäpfel-Suppe', need: ['lauch', 'kartoffeln', 'wasser'] },
    { name: 'Brotsuppe', need: ['brot', 'zwiebel', 'wasser'] },
    { name: 'Knoblauch-Croutons', need: ['brot', 'oel', 'knoblauch'], not: ['wasser'] },
    { name: 'Scheiterhaufen', need: ['brot', 'zimt'], any: ['aepfel', 'birnen'], sweet: true },
    { name: 'Bananen-Brot-Auflauf', need: ['brot', 'bananen', 'zimt'], sweet: true },
    { name: 'Zwetschkenröster', need: ['zwetschken', 'zimt'], sweet: true },
    { name: 'Apfelkompott', need: ['zimt', 'wasser'], any: ['aepfel', 'birnen'], sweet: true },
    { name: 'Marillenröster', need: ['marillen'], any: ['zimt', 'zitrone'], sweet: true },
    { name: 'Erdbeer-Brot-Dessert', need: ['erdbeeren', 'brot'], sweet: true }
  ];

  function judge(pot) {
    const idx = (id) => pot.indexOf(id);
    const has = (id) => pot.includes(id);
    const rescued = pot.filter((id) => ING[id]);
    const distinct = [...new Set(rescued)];
    const good = [], bad = [];
    let pts = 0;
    const plus = (n, t) => { pts += n; if (t) good.push([n, t]); };
    const minus = (n, t) => { pts -= n; if (t) bad.push([n, t]); };

    if (!rescued.length) {
      return { spoons: 0, dish: null, head: 'Das geht zurück in die Küche.', notes: [['bad', 'Wo ist das Gerettete? Nur Basis und Gewürze machen niemanden satt.']] };
    }

    const fruit = distinct.filter((id) => ING[id].type === 'fruit');
    const savoryVeg = distinct.filter((id) => ['hard', 'medium', 'soft', 'leafy', 'legume'].includes(ING[id].type));
    const sweet = fruit.length > 0 && savoryVeg.length === 0;
    const spices = pot.filter((id) => SPICE[id] && !['salz', 'pfeffer'].includes(id));
    const spiceSet = [...new Set(spices)];

    // doppelt hineingeworfen?
    const dupes = pot.filter((id, i) => (BASE[id] || SPICE[id]) && pot.indexOf(id) !== i);
    if (dupes.length) minus(1, NAME(dupes[0]) + ' gleich mehrmals? Einmal reicht, sonst kippt der Geschmack.');

    if (sweet) {
      if (has('zwiebel') || has('knoblauch')) minus(4, 'Zwiebel und Knoblauch in einer süßen Speise? Da kraust es sogar den Nachbarn.');
      if (has('zimt')) plus(2, 'Zimt und Obst, ein Klassiker, der immer passt.');
      if (has('zitrone')) plus(1, 'Ein Spritzer Zitrone macht das Obst frisch und lebendig.');
      const off = spiceSet.filter((s) => ['kuemmel', 'majoran', 'paprikapulver', 'curry', 'chili'].includes(s));
      if (off.length) minus(2, NAME(off[0]) + ' im Süßen? Eher nicht. Das passt besser zu Gemüse.');
      if (has('wasser') && fruit.length && !has('brot')) plus(1, 'Mit einem Schluck Wasser wird das Obst schön weich und saftig.');
      if (has('oel') && idx('oel') === 0 && has('brot')) plus(1, 'Das Brot in etwas Fett anrösten, das gibt eine knusprige Basis.');
      if (has('brot') && fruit.length) plus(2, 'Altes Brot mit Obst, so wird aus Resten ein Dessert.');
      if (has('salz')) plus(0, null);
    } else {
      // Fett zuerst
      const firstFood = pot.findIndex((id) => ING[id]);
      if (has('oel')) {
        if (idx('oel') === 0) plus(2, 'Mit Öl angefangen, so kann alles schön anschwitzen.');
        else if (idx('oel') > firstFood) minus(1, 'Das Öl kam zu spät, da klebt schon was am Topfboden.');
        else plus(1, null);
      } else if (has('zwiebel') || savoryVeg.length) {
        minus(2, 'Ohne Öl brennt dir die Zwiebel an, bevor sie Aroma gibt.');
      }
      // Zwiebel und Knoblauch
      if (has('zwiebel')) {
        plus(1, null);
        if (has('knoblauch')) {
          if (idx('knoblauch') < idx('zwiebel')) minus(2, 'Knoblauch vor der Zwiebel verbrennt schnell und wird bitter.');
          else plus(1, 'Erst die Zwiebel, dann der Knoblauch, genau richtig.');
        }
        if (firstFood >= 0 && firstFood < idx('zwiebel')) minus(1, 'Die Zwiebel kam erst nach dem Gemüse, da fehlt die geröstete Basis.');
        else plus(1, null);
      } else if (savoryVeg.length) {
        minus(1, 'Eine Zwiebel als Basis hätte dem Ganzen Tiefe gegeben.');
      }
      // hart vor weich
      const hardPos = pot.map((id, i) => (ING[id] && ['hard', 'legume'].includes(ING[id].type) ? i : -1)).filter((i) => i >= 0);
      const softPos = pot.map((id, i) => (ING[id] && ['soft', 'leafy'].includes(ING[id].type) ? i : -1)).filter((i) => i >= 0);
      if (hardPos.length && softPos.length) {
        const lateHard = Math.max(...hardPos);
        const early = softPos.filter((i) => i < lateHard);
        if (early.length) minus(2, NAME(pot[early[0]]) + ' war vor ' + NAME(pot[lateHard]) + ' drin. Das Weiche zerfällt zu Gatsch, während das Harte noch roh ist.');
        else plus(2, 'Erst das Harte, dann das Weiche, so wird alles gleichzeitig gar.');
      }
      // Wasser
      const hasLegume = distinct.some((id) => ING[id].type === 'legume');
      const hardCount = distinct.filter((id) => ING[id].type === 'hard').length;
      if (has('wasser')) {
        const roastIdx = Math.max(idx('oel'), idx('zwiebel'));
        if (roastIdx >= 0 && idx('wasser') < roastIdx) minus(1, 'Das Wasser kam zu früh, da konnte nichts anrösten.');
        else if (hardCount || hasLegume) plus(1, 'Mit Wasser ablöschen und köcheln lassen, so wird Hartes weich.');
        const anyVeg = distinct.some((id) => ['hard', 'medium', 'legume'].includes(ING[id].type));
        if (!anyVeg && !has('brot') && distinct.length < 2) minus(1, 'Viel Wasser für wenig Gemüse, das wird eher eine dünne Brühe.');
      } else if (hasLegume) {
        minus(3, 'Linsen ohne Wasser? Da beißt man auf Kieselsteine.');
      } else if (hardCount && distinct.includes('kartoffeln') && idx('oel') === 0 && hardCount === 1) {
        plus(1, 'Erdäpfel ohne Wasser direkt ins heiße Öl, so werden’s knusprige Puffer.');
      } else if (hardCount) {
        minus(2, NAME(distinct.find((id) => ING[id].type === 'hard')) + ' ohne Flüssigkeit brennen an, bevor sie weich sind.');
      }
      // Paprikapulver wie beim Gulasch
      if (has('paprikapulver')) {
        if (has('wasser') && idx('paprikapulver') < idx('wasser') && idx('paprikapulver') > idx('zwiebel') && has('zwiebel')) {
          plus(2, 'Paprikapulver kurz mitrösten und gleich ablöschen, wie beim echten Gulasch.');
        } else if (has('wasser') && idx('paprikapulver') > idx('wasser')) {
          plus(0, null);
        } else if (!has('wasser')) {
          minus(1, 'Paprikapulver ohne Flüssigkeit wird schnell bitter.');
        }
      }
      // Salz
      if (has('salz')) plus(1, null); else minus(1, 'Ein bisschen Salz hätte Wunder gewirkt.');
      // Frisches zum Schluss
      ['kraeuter', 'zitrone'].forEach((id) => {
        if (!has(id)) return;
        if (idx(id) >= pot.length - 3) plus(1, NAME(id) + ' ganz am Schluss, das bringt Frische.');
        else minus(1, NAME(id) + ' zu früh, da ist die Frische verkocht.');
      });
      // Blattgemüse spät
      distinct.filter((id) => ING[id].type === 'leafy').forEach((id) => {
        if (has('wasser') && idx(id) < idx('wasser')) minus(1, NAME(id) + ' kurz vor Schluss dazugeben, sonst wird es grau.');
      });
      // Zusammenpassen
      if (distinct.includes('bananen') && (has('knoblauch') || has('zwiebel'))) minus(3, 'Bananen mit Zwiebel und Knoblauch? Mutig. Zu mutig.');
      if (has('zimt') && !distinct.some((id) => ['kuerbis', 'aepfel', 'karotten', 'birnen', 'zwetschken'].includes(id))) minus(1, 'Zimt im Gemüsetopf passt höchstens zu Kürbis oder Karotten.');
      if (has('curry') && has('kuemmel') && has('majoran')) minus(1, 'Curry, Kümmel und Majoran ziehen in drei Richtungen.');
      if (has('kuemmel') && distinct.some((id) => ['kraut', 'kartoffeln'].includes(id))) plus(1, 'Kümmel zu Kraut und Erdäpfeln, so kocht man in Wien.');
      if (has('muskat') && distinct.some((id) => ['kuerbis', 'spinat', 'kartoffeln'].includes(id))) plus(1, 'Eine Prise Muskat, fein zu ' + NAME(distinct.find((id) => ['kuerbis', 'spinat', 'kartoffeln'].includes(id))) + '.');
      if (has('curry') && distinct.some((id) => ['kuerbis', 'linsen', 'karotten'].includes(id))) plus(1, 'Curry und ' + NAME(distinct.find((id) => ['kuerbis', 'linsen', 'karotten'].includes(id))) + ', das wärmt von innen.');
      if (fruit.length && savoryVeg.length) {
        if (distinct.includes('aepfel') && (distinct.includes('kraut') || distinct.includes('kuerbis'))) plus(1, 'Apfel im Kraut oder Kürbis bringt eine feine Süße.');
        else if (!distinct.includes('bananen')) minus(1, 'Obst und Gemüse zusammen, das funktioniert nur selten.');
      }
    }

    // Gewürzmenge
    if (spiceSet.length === 0 && !sweet) minus(1, 'Ein Gewürz mehr hätte dem Ganzen Charakter gegeben.');
    else if (spiceSet.length >= 1 && spiceSet.length <= 3) plus(1, null);
    else if (spiceSet.length >= 5) minus(2, 'So viele Gewürze, da schmeckt man die Zutaten nicht mehr.');

    // Vielfalt
    if (distinct.length >= 2) plus(1, 'Mehrere gerettete Zutaten, so wird es ein volles Gericht.');

    // Gericht erkannt?
    let dish = null;
    for (const d of DISHES) {
      if (!!d.sweet !== sweet && d.sweet) continue;
      if (!d.need.every(has)) continue;
      if (d.any && !d.any.some(has)) continue;
      if (d.not && d.not.some(has)) continue;
      dish = d.name; break;
    }
    if (!dish && !sweet && savoryVeg.length >= 2 && has('wasser') && has('zwiebel')) dish = 'Gemüsesuppe';
    if (dish) plus(sweet ? 4 : 3, null);

    let spoons = pts >= 9 ? 3 : pts >= 4 ? 2 : pts >= 0 ? 1 : 0;
    if (bad.some(([n]) => n >= 4)) spoons = Math.min(spoons, 1);
    const heads = ['Das geht zurück in die Küche.', 'Essbar, aber da geht mehr.', 'Gut gekocht!', 'Ein Gedicht!'];
    bad.sort((a, b) => b[0] - a[0]);
    good.sort((a, b) => b[0] - a[0]);
    const notes = [];
    if (spoons >= 2) { good.slice(0, 2).forEach((g) => notes.push(['good', g[1]])); bad.slice(0, 1).forEach((b) => notes.push(['bad', 'Tipp: ' + b[1]])); }
    else { bad.slice(0, 2).forEach((b) => notes.push(['bad', b[1]])); good.slice(0, 1).forEach((g) => notes.push(['good', 'Gut war: ' + g[1]])); }
    return { spoons, dish, head: heads[spoons], notes, pts };
  }

  // ---------------------------------------------------------------
  // Nachbarn und ihre Sprüche
  // ---------------------------------------------------------------
  const LINES = {
    grant: {
      arrive: [
        'Na servas. Gerettetes Essen. Hoffentlich rettet’s mi a.',
        'I steh do jetzt scho länger als am Magistrat. Und dort gibt’s wenigstens a Nummer.',
        'Wenn’s ned schmeckt, beschwer i mi. Wenn’s schmeckt, a. I bin a Weaner.',
        'Früher war des a Parkplatz. Do hab i mi beschwert. Jetzt is a Wiesn. Und i beschwer mi trotzdem.',
        'Gratis? Do is sicher a Haken. Aber i nimm’s.',
        'Na, wos kochst? Sag’s ned. I will mi überraschen lassen. Und dann granteln.'
      ],
      wait: ['Geht’s no a bissl langsamer?', 'I wachs do glei an wie a Löwenzahn.', 'Bis i dran bin, is Weihnachten.', 'Des is ka Schlange mehr, des is a Lebensabschnitt.'],
      r3: ['Na ja. Passt scho. ... Na guat, es is a Gedicht. Aber sag’s kam.', 'Bist deppat, is des guat!'],
      r2: ['Kann ma essen. I hab scho Schlechteres g’habt. Beim Heurigen.', 'Na geh, passt eh.'],
      r1: ['Hmm. Is halt a Essen.', 'Des is a Gatsch. Aber a ehrlicher.'],
      r0: ['Des is ka Essen, des is a Mutprobe.', 'Na servas. Do bleib i liaba hungrig.']
    },
    schmaeh: {
      arrive: [
        'Kennst den? Treffen sich zwei Semmeln. Sagt die eine: Du bist aber altbacken! Sagt die andere: Dafür bin i gerettet!',
        'Was sagt die Zwiebel zum Koch? Wegen dir wein i jeden Tag.',
        'Herr Kapitän, is des Schiff seetauglich? Na, nur grätzltauglich!',
        'Wie nennt ma an Erdapfel, der Witze erzählt? An Kabarett-Erdapfel. Lacht’s, sonst wein i!',
        'Warum is der Kürbis so entspannt? Weil er weiß, dass er im Herbst der Star is.',
        'I hab gestern mit meim Basilikum g’redt. Hat nix g’sagt. Typisch Kräuter, total verschlossen.'
      ],
      wait: ['I hab mi mit meim Vordermann scho verlobt, so lang stehn ma do.', 'Wenn i no länger wart, wachsen ma Wurzeln.', 'Is des a Schlange oder scho a Demo?'],
      r3: ['Ur leiwand! I kumm morgen wieder, mit da ganzn Verwandtschaft!', 'Des schmeckt wie Urlaub, nur ohne Stau!'],
      r2: ['Passt! Mit an bissl mehr Liebe wär’s a Hit.', 'Leiwand, Herr Kapitän!'],
      r1: ['Is a bissl a Gatsch, aber a herzlicher Gatsch.', 'Na, i sag amoi: kreativ.'],
      r0: ['Des hab i ned bestellt. I hab gar nix bestellt, aber des a ned.', 'Is des Kunst? Weil essen kann ma’s ned.']
    },
    jiddisch: {
      arrive: [
        'Nu, ich hab gehört, hier gibt’s Essen umsonst. Umsonst ist gut. Gratis wär mir lieber.',
        'Oy, so eine Schlange! Meine ganze Mischpoche ist kürzer, und die ist lang.',
        'Mazel tov, Kapitän! Endlich einer, der kein Brot wegwirft. Meine Großmutter hätt Sie adoptiert.',
        'Ich sag nix. Ich steh nur. Und ich riech. Und ich hab Hunger. Aber ich sag nix.',
        'Chuzpe hat er, der Kapitän! Kocht mitten auf der Straße. Ich bewunder das.',
        'Meschugge, wie das riecht. Ich bleib.'
      ],
      wait: ['Oy, ich werd hier noch alt. Älter. Noch älter.', 'Nu? Wird das heute noch was?', 'Ich hab in der Zeit schon zwei Kinder großgezogen. Na gut, eins.'],
      r3: ['Nu, gar nicht so schlecht. Also gut. Also sehr gut. Also: Mazel tov!', 'Wie bei meiner Mamme. Nur ohne die Schuldgefühle dazu.'],
      r2: ['Gut. Nicht großartig, aber gut. Großartig ist überbewertet.', 'Nu, da kann man nicht meckern. Ich meckere trotzdem ein bisschen.'],
      r1: ['Oy. Man isst es. Man beklagt sich. So ist das Leben.', 'Hat Charakter. Zu viel Charakter.'],
      r0: ['Oy gevalt. Das hätt nicht mal meine Tante so hingekriegt. Und die hat’s versucht.', 'Ich hab Hunger. Aber so viel Hunger hab ich nicht.']
    }
  };
  const CAPTAIN_LINES = ['Ahoi, Nachbarschaft! Heute gibt’s Gerettetes!', 'Gleich geht’s los, der Topf wird schon warm!'];
  const NAMES = ['Frau Novak', 'Herr Huber', 'Oma Resi', 'Herr Yilmaz', 'Frau Horvath', 'Herr Pichler', 'Tante Mitzi', 'Herr Kovač', 'Frau Sommer', 'Opa Ferdl', 'Frau Steiner', 'Herr Adler', 'Frau Weiss', 'Herr Berger', 'Frau Popović', 'Herr Brunner', 'Frau Lehner', 'Herr Schwarz'];
  const SKIN = ['#E8B98E', '#C69468', '#8A5A3C', '#F1C9A5', '#A86B45', '#5C3A24'];
  const SHIRT = ['#E7A6A1', '#5E7F5A', '#C97B3D', '#9CC7DF', '#7B5BB5', '#F2B530', '#2F5233', '#B8432F'];
  const HATS = ['none', 'beanie', 'cap', 'hut', 'scarf', 'bun', 'none'];

  function personMarkup(look) {
    const legs = `<path d="M-6 0 L-5 -26 M6 0 L5 -26" stroke="#3B2A1E" stroke-width="5" stroke-linecap="round"></path>`;
    const body = `<rect x="-13" y="-64" width="26" height="40" rx="10" fill="${look.shirt}"></rect>`;
    const head = `<circle cx="0" cy="-77" r="12" fill="${look.skin}"></circle><circle cx="-5" cy="-78" r="1.6" fill="#3B2A1E"></circle><circle cx="2" cy="-78" r="1.6" fill="#3B2A1E"></circle><path d="M-6 -71 Q-2 -68 2 -71" fill="none" stroke="#3B2A1E" stroke-width="1.4" stroke-linecap="round"></path>`;
    let hat = '';
    const c = look.hatColor;
    if (look.hat === 'beanie') hat = `<path d="M-12 -80 Q0 -98 12 -80 Z" fill="${c}"></path><rect x="-12.5" y="-83" width="25" height="5" rx="2" fill="${c}" opacity=".8"></rect><circle cx="0" cy="-95" r="3.4" fill="#FFFFFF"></circle>`;
    if (look.hat === 'cap') hat = `<path d="M-12 -80 Q0 -96 12 -80 Z" fill="${c}"></path><ellipse cx="-15" cy="-81" rx="8" ry="2.4" fill="${c}"></ellipse>`;
    if (look.hat === 'hut') hat = `<ellipse cx="0" cy="-86" rx="17" ry="3.4" fill="#3B2A1E"></ellipse><rect x="-9" y="-101" width="18" height="15" rx="4" fill="#3B2A1E"></rect><rect x="-9" y="-90" width="18" height="3" fill="${c}"></rect>`;
    if (look.hat === 'scarf') hat = `<path d="M-14 -70 Q-15 -93 0 -93 Q15 -93 14 -70 Q12 -84 0 -86 Q-12 -84 -14 -70 Z" fill="${c}"></path>`;
    if (look.hat === 'bun') hat = `<path d="M-12 -80 Q0 -94 12 -80 Q4 -86 -12 -80 Z" fill="#4A3426"></path><circle cx="0" cy="-92" r="6" fill="#4A3426"></circle>`;
    if (look.hat === 'none') hat = `<path d="M-12 -81 Q0 -93 12 -81 Q2 -87 -12 -81 Z" fill="${look.hair}"></path>`;
    return `<g class="bob">${legs}${body}${head}${hat}<g class="cup" opacity="0"><rect x="9" y="-50" width="9" height="10" rx="2" fill="#FFFFFF" stroke="#C9B48A" stroke-width="1"></rect><path d="M12 -53 Q10 -58 13 -62" stroke="#FFFFFF" stroke-width="1.5" fill="none" stroke-linecap="round"></path></g><ellipse class="zen" opacity="0" cx="0" cy="-97" rx="11" ry="3" fill="none" stroke="#F2B530" stroke-width="2"></ellipse><g class="wish" opacity="0"></g><g class="bowl" opacity="0"><path d="M-26 -46 L-10 -46 Q-12 -36 -18 -36 Q-24 -36 -26 -46 Z" fill="#C97B3D"></path><path d="M-22 -52 Q-24 -58 -20 -62 M-16 -52 Q-18 -58 -14 -62" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round"></path></g></g>`;
  }

  // ---------------------------------------------------------------
  // Spielzustand
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  // Musik: ein eigener kleiner Heurigen-Walzer, live im Browser erzeugt
  // ---------------------------------------------------------------
  const Music = (function () {
    const NOTE = (n) => {
      const m = /^([A-G])(#?)(\d)$/.exec(n);
      const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
      const midi = 12 * (Number(m[3]) + 1) + base;
      return 440 * Math.pow(2, (midi - 69) / 12);
    };
    // 16 Takte im Dreivierteltakt: [Ton, Schläge]
    const MELODY = [
      [['G4', 1], ['C5', 1], ['E5', 1]], [['G5', 2], ['E5', 1]], [['F5', 1], ['D5', 1], ['B4', 1]], [['G4', 2], [null, 1]],
      [['B4', 1], ['D5', 1], ['F5', 1]], [['A5', 1], ['G5', 1], ['F5', 1]], [['E5', 1], ['G5', 1], ['C6', 1]], [['G5', 2], [null, 1]],
      [['A5', 1], ['G5', 1], ['F5', 1]], [['C5', 1], ['F5', 1], ['A5', 1]], [['G5', 1.5], ['E5', 0.5], ['C5', 1]], [['E5', 2], ['G4', 1]],
      [['D5', 1], ['E5', 0.5], ['F5', 0.5], ['D5', 1]], [['B4', 1], ['D5', 1], ['G5', 1]], [['E5', 1], ['G5', 0.5], ['E5', 0.5], ['D5', 1]], [['C5', 2], [null, 1]]
    ];
    const CHORDS = ['C', 'C', 'G', 'G', 'G', 'G', 'C', 'C', 'F', 'F', 'C', 'C', 'G', 'G', 'C', 'C'];
    const BASS = { C: ['C3', 'G2'], G: ['G2', 'D3'], F: ['F2', 'C3'] };
    const TRIAD = { C: ['E4', 'G4', 'C5'], G: ['D4', 'G4', 'B4'], F: ['F4', 'A4', 'C5'] };

    let ctx = null, master = null, timer = null, nextTime = 0, bar = 0, on = false, tempo = 126;
    try { on = localStorage.getItem('rk-sound') !== 'off'; } catch (e) { on = true; }

    function ensure() {
      if (ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.11;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2600;
      master.connect(lp); lp.connect(ctx.destination);
      return true;
    }
    function tone(freq, t, dur, type, vol, detune) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      if (detune) o.detune.value = detune;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + 0.05);
    }
    function accordion(freq, t, dur) {
      tone(freq, t, dur, 'sawtooth', 0.22, -6);
      tone(freq, t, dur, 'square', 0.12, 6);
    }
    function scheduleBar(t) {
      const beat = 60 / tempo;
      const ch = CHORDS[bar % 16];
      // Bass auf eins, Nachschlag auf zwei und drei
      tone(NOTE(BASS[ch][bar % 2]), t, beat * 0.8, 'triangle', 0.5);
      [1, 2].forEach((b) => TRIAD[ch].forEach((n) => tone(NOTE(n), t + b * beat, beat * 0.35, 'square', 0.06)));
      let pos = 0;
      MELODY[bar % 16].forEach(([n, beats]) => {
        if (n) accordion(NOTE(n), t + pos * beat, beats * beat * 0.92);
        pos += beats;
      });
      bar += 1;
      return t + 3 * beat;
    }
    function loop() {
      while (nextTime < ctx.currentTime + 0.3) nextTime = scheduleBar(nextTime);
    }
    function start() {
      if (!on || !ensure()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (timer) return;
      bar = 0;
      nextTime = ctx.currentTime + 0.1;
      timer = setInterval(loop, 60);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function sfx(kind) {
      if (!on || !ensure()) return;
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime + 0.01;
      if (kind === 'plop') {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.14);
        g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2);
      }
      if (kind === 'ding') { tone(NOTE('E6'), t, 0.35, 'sine', 0.5); tone(NOTE('G6'), t + 0.1, 0.45, 'sine', 0.4); }
      if (kind === 'meh') { tone(NOTE('E4'), t, 0.3, 'triangle', 0.5); tone(NOTE('C4'), t + 0.22, 0.45, 'triangle', 0.5); }
      if (kind === 'win') ['C5', 'E5', 'G5', 'C6', 'E6'].forEach((n, i) => accordion(NOTE(n), t + i * 0.13, 0.5));
      if (kind === 'feast') { ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => accordion(NOTE(n), t + i * 0.12, 0.4)); ['G5', 'C6', 'E6', 'G6', 'C6'].forEach((n, i) => accordion(NOTE(n), t + 0.6 + i * 0.12, 0.45)); }
      if (kind === 'lose') ['G4', 'F#4', 'F4', 'E4'].forEach((n, i) => tone(NOTE(n), t + i * 0.32, 0.45, 'triangle', 0.5));
      if (kind === 'bike') { tone(NOTE('A5'), t, 0.12, 'square', 0.25); tone(NOTE('A5'), t + 0.16, 0.12, 'square', 0.25); }
    }
    return {
      start, stop, sfx,
      setTempo(v) { tempo = v; },
      isOn() { return on; },
      toggle(playing) {
        on = !on;
        try { localStorage.setItem('rk-sound', on ? 'on' : 'off'); } catch (e) { /* egal */ }
        if (on && playing) start(); else stop();
        return on;
      }
    };
  })();

  // ---------------------------------------------------------------
  // Wünsche der Nachbarn
  // ---------------------------------------------------------------
  const ROUND = 300; // Sekunden pro Runde
  const WISH = {
    brot:   { label: 'Brot', direct: true },
    wasser: { label: 'Wasser oder Tee', direct: true },
    obst:   { label: 'Obst', direct: true },
    suppe:  { label: 'eine Suppe' },
    deftig: { label: 'was Deftiges' },
    suess:  { label: 'was Süßes' },
    scharf: { label: 'was Scharfes' },
    egal:   { label: 'egal, Hauptsache warm' },
    fleisch: { label: 'Fleisch' }
  };
  const WISH_LINES = {
    brot: ['I brauch nur a Stückl Brot, mehr ned.', 'A Scheiberl Brot, bitte. Altes is ma eh lieber.', 'Brot! Nur Brot. I bin a einfacher Mensch.'],
    wasser: ['A Glasl Wasser tät ma schon reichen.', 'I hab an Durscht wie a Rennpferd.', 'Nur was zum Trinken, bitte.'],
    obst: ['Hast an Apfel? I bin auf Diät. Seit 1987.', 'A Stückl Obst, für die Vitamine.', 'Was Frisches, Obst wär fein.'],
    suppe: ['A warme Suppn, bitte, mir is so kalt.', 'A Supperl, wie bei der Oma.', 'Suppe! Des is mei Lebenselixier.'],
    deftig: ['Was Deftiges! Mit Erdäpfeln, wenn’s geht.', 'I brauch was G’scheites im Magen.', 'Was Kräftiges, i hab heut no viel vor.'],
    suess: ['Was Süßes, bitte, sonst werd i grantig.', 'A Nachspeis! Ohne Nachspeis is ka Tag.', 'Was Süßes für die Seele.'],
    scharf: ['Scharf muss es sein, dass ma die Augen rinnen!', 'Was Feuriges, bitte. I bin a Feuerwehrmann.', 'Je schärfer, desto besser!'],
    egal: ['Is ma wurscht, Hauptsach warm.', 'Ganz egal, i iss alles. Fast alles.', 'Überrasch mi!'],
    fleisch: ['Habt’s a Schnitzerl?', 'A Wurstsemmel wär ma recht.', 'Wo is’n do des Fleisch?', 'I hätt gern a Leberkäs.']
  };
  const GIVE_UP = ['Na guat, dann nimm i halt irgendwas.', 'Wurscht, i nimm, was kommt.', 'I bin ja ned anspruchsvoll. Gib, was d’ hast.'];
  const WISH_HAPPY = ['Genau des hab i ma g’wünscht!', 'Woher hast g’wusst, was i will?', 'Du hörst ja richtig zu, Captain!', 'Treffer! Mitten ins Herz.'];
  function pickWish(r0) {
    const R = r0 || Math.random;
    const mo = new Date().getMonth() + 1;
    const cold = [10, 11, 12, 1, 2, 3].includes(mo);
    const w = { brot: 2, wasser: 2, obst: 1.5, suppe: cold ? 4 : 2, deftig: cold ? 3 : 2, suess: 1.6, scharf: 1, egal: 1.4, fleisch: 1.1 };
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    let r = R() * total;
    for (const k in w) { r -= w[k]; if (r <= 0) return k; }
    return 'egal';
  }
  function wishIconInner(w) {
    if (w === 'brot') return ICONS.brot;
    if (w === 'wasser') return ICONS.wasser;
    if (w === 'obst') return ICONS.aepfel;
    if (w === 'deftig') return ICONS.kartoffeln;
    if (w === 'fleisch') return '<rect x="7" y="18" width="34" height="14" rx="7" fill="#B5651D" transform="rotate(-15 24 25)"></rect><path d="M10 30 Q16 24 22 28 M24 24 Q30 20 36 22" fill="none" stroke="#8A4524" stroke-width="2" stroke-linecap="round"></path><path d="M6 31 L2 33 M42 19 L46 17" stroke="#6B4A32" stroke-width="2.5" stroke-linecap="round"></path>';
    if (w === 'suppe') return '<path d="M6 24 L42 24 Q40 42 24 42 Q8 42 6 24 Z" fill="#C97B3D"></path><ellipse cx="24" cy="24" rx="18" ry="4" fill="#E8A35A"></ellipse><path d="M16 18 Q13 12 16 6 M24 18 Q21 12 24 6 M32 18 Q29 12 32 6" fill="none" stroke="#9CC7DF" stroke-width="3" stroke-linecap="round"></path>';
    if (w === 'suess') return '<path d="M10 26 L38 26 L34 42 L14 42 Z" fill="#E7A6A1"></path><path d="M8 26 Q10 12 24 12 Q38 12 40 26 Z" fill="#FBF6EA" stroke="#E7A6A1" stroke-width="2"></path><circle cx="24" cy="9" r="4.5" fill="#D7322B"></circle>';
    if (w === 'scharf') return '<path d="M14 14 Q8 30 22 40 Q34 46 40 38 Q28 38 22 28 Q18 20 20 14 Z" fill="#E0301E"></path><path d="M16 14 Q16 6 24 6" fill="none" stroke="#4E9A45" stroke-width="3.5" stroke-linecap="round"></path>';
    return '<text x="24" y="31" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="15" fill="#6B5A4A">egal</text>';
  }
  function renderWish(n) {
    const g = n.el.querySelector('.wish');
    if (!g) return;
    const direct = WISH[n.wish].direct;
    g.innerHTML = `<rect x="-22" y="-150" width="44" height="40" rx="12" fill="#FFFFFF" stroke="${direct ? '#2F5233' : n.wish === 'fleisch' ? '#B8432F' : '#C97B3D'}" stroke-width="${direct ? 3.5 : 2.5}"></rect><path d="M-5 -110 L0 -103 L5 -110 Z" fill="#FFFFFF"></path><g transform="translate(-16 -146) scale(.67)">${wishIconInner(n.wish)}</g>${direct ? '<circle cx="18" cy="-146" r="7" fill="#2F5233"></circle><path d="M15 -146 L17.5 -143.5 L21.5 -149" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>' : ''}`;
    g.setAttribute('opacity', '1');
  }
  function dishCats(pot) {
    const ing = [...new Set(pot.filter((id) => ING[id]))];
    const fruit = ing.filter((id) => ING[id].type === 'fruit');
    const savory = ing.filter((id) => !['fruit', 'bread'].includes(ING[id].type));
    const cats = new Set(['egal']);
    if (fruit.length && !savory.length) cats.add('suess');
    if (savory.length || (ing.includes('brot') && !fruit.length)) {
      if (pot.includes('wasser')) cats.add('suppe');
      if (ing.some((id) => ING[id].type === 'legume') || ing.includes('kartoffeln') || pot.includes('paprikapulver')) cats.add('deftig');
    }
    if (pot.includes('chili') || pot.includes('curry')) cats.add('scharf');
    return cats;
  }
  function catNames(cats) {
    const names = { suppe: 'Suppe', deftig: 'Deftiges', suess: 'Süßes', scharf: 'Scharfes' };
    const list = [...cats].filter((c) => names[c]).map((c) => names[c]);
    return list.length ? list.join(', ') : 'nix Besonderes';
  }
  function fmtTime(s) {
    s = Math.max(0, Math.ceil(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  const QUEUE_MAX = 12;
  const QX0 = 410, QGAP = 64, QY = 470;
  const HOUSES = [
    { x: 30, y: 180, w: 170, h: 230, roof: (x) => (x <= 115 ? 182 - (x - 18) * 62 / 97 : 120 + (x - 115) * 62 / 97), x0: 34, x1: 196, windows: [[60, 214, 34, 42], [136, 214, 34, 42], [60, 290, 34, 42], [136, 290, 34, 42]] },
    { x: 220, y: 140, w: 140, h: 270, roof: () => 140, x0: 226, x1: 354, windows: [[246, 170, 30, 40], [304, 170, 30, 40], [246, 240, 30, 40], [304, 240, 30, 40]] },
    { x: 820, y: 160, w: 160, h: 250, roof: () => 160, x0: 826, x1: 974, windows: [[846, 190, 34, 42], [920, 190, 34, 42], [846, 270, 34, 42], [920, 270, 34, 42]] },
    { x: 1000, y: 200, w: 180, h: 210, roof: (x) => (x <= 1090 ? 202 - (x - 990) * 56 / 100 : 146 + (x - 1090) * 56 / 100), x0: 1004, x1: 1176, windows: [[1030, 236, 34, 42], [1114, 236, 34, 42]] }
  ];

  const svg = $('scene');
  const queueLayer = $('queue');
  const plantLayer = $('plants');
  const ivyLayer = $('ivy');
  const beeLayer = $('bees');
  const bubbles = $('bubbles');

  let S;
  let best = 0;
  try { best = Number(localStorage.getItem('rk-best') || 0); } catch (e) { best = 0; }

  function freshState() {
    return {
      phase: 'ready', served: 0, seeds: 0, score: 0, flowers: 0, roofs: [0, 0, 0, 0], green: [false, false, false, false],
      crate: newCrate(), pot: [], queue: [], leaving: [], bees: [], targets: [], spawnIn: 1.5, elapsed: 0, busy: false,
      refilling: 0, paused: false, dishes: 0, nextId: 1, warm: [], banterIn: 10, jakob: 'home', jk: { leolita: 1, nif: 1 }, converted: 0, feastMark: 0, feasts: 0, rescueTried: false, rescueDone: false, feasting: false, leoBusy: false, debating: false, nextDebate: 0, wishHits: 0, givenDirect: 0, streak: 0, masterNext: null, calmUntil: 0, nifBusy: false
    };
  }

  // ----- Hilfen -----
  const mk = (tag, attrs) => { const el = document.createElementNS(SVGNS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };
  function toast(text, sub) {
    const t = $('toast');
    t.innerHTML = '';
    t.append(document.createTextNode(text));
    if (sub) { const s = document.createElement('small'); s.textContent = sub; t.append(s); }
    t.classList.add('show');
    clearTimeout(toast.h);
    toast.h = setTimeout(() => t.classList.remove('show'), sub ? 4000 : 2400);
  }
  function readMs(text) { return Math.max(3600, 1800 + String(text).length * 85); }
  // Immer nur eine Sprechblase: alle reden schön der Reihe nach
  const talkQ = [];
  let talkBusy = false, talkTimer = null;
  function say(x, y, text, ms, who, opt) {
    opt = opt || {};
    const b = document.createElement('div');
    b.className = 'bubble-say';
    b.textContent = text;
    let resolve;
    b.done = new Promise((r) => { resolve = r; });
    if (opt.low && (talkBusy || talkQ.length)) { resolve(); return b; }
    if (talkQ.length >= 4) {
      const i = talkQ.findIndex((t) => !t.keep);
      if (i >= 0) talkQ.splice(i, 1)[0].resolve();
      else if (!opt.keep) { resolve(); return b; }
    }
    talkQ.push({ b, x, y, text, who: who || 'Nachbar:in', dur: Math.max(ms || 0, readMs(text)), resolve, keep: !!opt.keep, xf: opt.xf });
    pumpTalk();
    return b;
  }
  function pumpTalk() {
    if (talkBusy) return;
    const it = talkQ.shift();
    if (!it) return;
    talkBusy = true;
    const b = it.b;
    const x = it.xf ? it.xf() : it.x;
    logTalk(it.who, it.text);
    const left = Math.max(12, Math.min(88, x / 1200 * 100));
    b.style.left = left + '%';
    b.style.top = ((it.y - 100) / 460 * 100) + '%';
    bubbles.appendChild(b);
    const boxW = bubbles.clientWidth;
    if (boxW) {
      const bw = b.offsetWidth;
      b.style.left = Math.max(bw / 2 + 4, Math.min(boxW - bw / 2 - 4, left / 100 * boxW)) + 'px';
    }
    requestAnimationFrame(() => b.classList.add('show'));
    talkTimer = setTimeout(() => {
      b.classList.remove('show');
      setTimeout(() => b.remove(), 300);
      it.resolve();
      talkBusy = false;
      talkTimer = setTimeout(pumpTalk, 350);
    }, it.dur);
  }
  function clearTalk() {
    talkQ.splice(0).forEach((t) => t.resolve());
    clearTimeout(talkTimer);
    talkBusy = false;
    bubbles.innerHTML = '';
  }
  function logTalk(who, text) {
    const list = $('talklog');
    if (!list) return;
    const empty = list.querySelector('.empty');
    if (empty) empty.remove();
    const li = document.createElement('li');
    li.className = who === 'Captain Dave' ? 'cap' : '';
    const s = document.createElement('strong'); s.textContent = who + ': ';
    li.append(s, document.createTextNode(text));
    list.prepend(li);
    while (list.children.length > 40) list.lastChild.remove();
  }
  let lastTalk = 0;
  function maybeSay(n, kind, force) {
    const now = performance.now();
    if (!force && now - lastTalk < 5000) return;
    lastTalk = now;
    n.bubble = say(n.x, QY - 162, pick(LINES[n.humor][kind]), 4600, n.name, { low: !force, xf: () => n.x });
  }

  // ----- Nachbarn -----
  function spawnNeighbor() {
    S.neighborNo = (S.neighborNo || 0) + 1;
    const R = S.daily ? dayRng(S.neighborNo) : Math.random;
    const pk = (arr) => arr[Math.floor(R() * arr.length)];
    const look = { skin: pk(SKIN), shirt: pk(SHIRT), hat: pk(HATS), hatColor: pk(SHIRT), hair: pk(['#3B2A1E', '#8A5A3C', '#C8A46B', '#D8D3C8', '#1E1A17']) };
    const humor = pk(['grant', 'schmaeh', 'jiddisch']);
    const nname = pk(NAMES);
    const nwish = pickWish(R);
    const g = mk('g', {});
    g.innerHTML = personMarkup(look);
    queueLayer.appendChild(g);
    const n = { id: S.nextId++, el: g, x: 1260, tx: 0, humor, name: nname, waited: 0, talkedWait: false, wish: nwish, gaveUp: false };
    S.queue.push(n);
    renderWish(n);
    if (S.calmUntil > S.elapsed) { g.querySelector('.cup').setAttribute('opacity', '1'); g.querySelector('.zen').setAttribute('opacity', '1'); }
    layoutQueue();
    setTimeout(() => {
      if (!S.queue.includes(n)) return;
      if (Math.random() < 0.7 || S.queue.length <= 2) {
        const now = performance.now();
        if (now - lastTalk > 3500) { lastTalk = now; n.bubble = say(n.x, QY - 162, pick(WISH_LINES[n.wish]), 4200, n.name, { low: true, xf: () => n.x }); }
      } else maybeSay(n, 'arrive');
    }, 1600);
    if (S.queue.length >= QUEUE_MAX) lose();
  }
  function layoutQueue() {
    S.queue.forEach((n, i) => { if (!n.feast) n.tx = QX0 + i * QGAP; });
  }

  // ----- Bilder der Zutaten -----
  const ICONS = {
    brot: '<ellipse cx="24" cy="31" rx="19" ry="11" fill="#B9844F"></ellipse><path d="M6 30 Q24 6 42 30 Z" fill="#D9A56B"></path><path d="M15 22 l4 7 M22 18 l4 8 M30 19 l4 7" stroke="#A9733F" stroke-width="2.4" stroke-linecap="round"></path>',
    kartoffeln: '<ellipse cx="18" cy="27" rx="12" ry="10" fill="#D9B26F"></ellipse><ellipse cx="31" cy="32" rx="11" ry="8" fill="#C9A15E"></ellipse><circle cx="14" cy="24" r="1.5" fill="#9C7A44"></circle><circle cx="21" cy="30" r="1.5" fill="#9C7A44"></circle><circle cx="33" cy="30" r="1.5" fill="#8E6E3C"></circle>',
    karotten: '<path d="M31 12 Q40 15 36 23 L14 41 Q9 43 11 38 Z" fill="#E8792F"></path><path d="M20 30 l4 2 M26 24 l4 2" stroke="#C25E1F" stroke-width="2" stroke-linecap="round"></path><path d="M32 13 L36 4 M34 15 L43 9 M36 18 L44 17" stroke="#4E9A45" stroke-width="3" stroke-linecap="round"></path>',
    bananen: '<path d="M7 16 Q12 40 41 34 Q43 30 39 29 Q17 31 13 14 Z" fill="#F5D547" stroke="#C9A72B" stroke-width="1.5"></path><circle cx="20" cy="29" r="1.6" fill="#6B4A32"></circle><circle cx="28" cy="31" r="1.3" fill="#6B4A32"></circle><path d="M7 16 L5 12" stroke="#6B4A32" stroke-width="3" stroke-linecap="round"></path>',
    pilze: '<rect x="19" y="24" width="10" height="17" rx="4" fill="#F1ECE0"></rect><path d="M6 27 Q24 2 42 27 Z" fill="#D9CBB5"></path><circle cx="18" cy="18" r="2" fill="#C2B49C"></circle><circle cx="29" cy="15" r="2.4" fill="#C2B49C"></circle>',
    linsen: '<circle cx="14" cy="32" r="4" fill="#B5651D"></circle><circle cx="22" cy="34" r="4" fill="#C47A2F"></circle><circle cx="30" cy="32" r="4" fill="#B5651D"></circle><circle cx="18" cy="26" r="4" fill="#C47A2F"></circle><circle cx="26" cy="26" r="4" fill="#B5651D"></circle><circle cx="34" cy="27" r="4" fill="#C47A2F"></circle><circle cx="22" cy="20" r="4" fill="#B5651D"></circle><circle cx="30" cy="20" r="4" fill="#C47A2F"></circle>',
    aepfel: '<circle cx="24" cy="28" r="14" fill="#C9463D"></circle><ellipse cx="18" cy="22" rx="4" ry="2.6" fill="#E57A6F"></ellipse><path d="M24 15 L25 8" stroke="#6B4A32" stroke-width="3" stroke-linecap="round"></path><ellipse cx="30" cy="10" rx="6" ry="3" fill="#4E9A45" transform="rotate(-20 30 10)"></ellipse>',
    kuerbis: '<ellipse cx="24" cy="29" rx="19" ry="13" fill="#E8792F"></ellipse><path d="M16 18 Q12 29 16 41 M24 16 L24 42 M32 18 Q36 29 32 41" fill="none" stroke="#C25E1F" stroke-width="2"></path><rect x="21" y="9" width="6" height="9" rx="2" fill="#4E7A45"></rect>',
    kraut: '<circle cx="24" cy="26" r="17" fill="#C9DDB0"></circle><path d="M10 22 Q24 32 38 22 M12 30 Q24 38 36 30 M24 10 Q18 24 24 42" fill="none" stroke="#9DBB7E" stroke-width="2"></path>',
    rueben: '<circle cx="24" cy="29" r="12" fill="#8E2B4E"></circle><path d="M24 41 L24 46" stroke="#8E2B4E" stroke-width="3" stroke-linecap="round"></path><path d="M24 17 Q18 6 12 6 M24 17 Q26 6 32 4" fill="none" stroke="#4E9A45" stroke-width="3" stroke-linecap="round"></path><ellipse cx="19" cy="25" rx="3" ry="2" fill="#B14A6E"></ellipse>',
    lauch: '<rect x="20" y="22" width="9" height="22" rx="4" fill="#F1ECE0"></rect><rect x="20" y="10" width="9" height="16" fill="#8DB36B"></rect><path d="M22 12 L12 2 M25 10 L25 1 M27 12 L37 3" stroke="#5E8C3A" stroke-width="4" stroke-linecap="round"></path>',
    sellerie: '<circle cx="24" cy="30" r="13" fill="#D8D3A8"></circle><circle cx="15" cy="34" r="4" fill="#CBC593"></circle><circle cx="33" cy="33" r="4" fill="#CBC593"></circle><path d="M20 18 L16 6 M24 17 L24 4 M28 18 L33 6" stroke="#5E8C3A" stroke-width="3" stroke-linecap="round"></path>',
    pastinaken: '<path d="M31 12 Q40 15 36 23 L14 41 Q9 43 11 38 Z" fill="#EFE3C2" stroke="#D3C397" stroke-width="1.5"></path><path d="M32 13 L36 5 M34 15 L42 11" stroke="#7E9A5E" stroke-width="3" stroke-linecap="round"></path>',
    birnen: '<path d="M24 11 Q31 11 30 21 Q38 26 36 35 Q34 43 24 43 Q14 43 12 35 Q10 26 18 21 Q17 11 24 11 Z" fill="#C8C15A"></path><path d="M24 11 L25 5" stroke="#6B4A32" stroke-width="3" stroke-linecap="round"></path>',
    zwetschken: '<ellipse cx="18" cy="28" rx="9" ry="12" fill="#5B3A7A"></ellipse><ellipse cx="31" cy="30" rx="9" ry="11" fill="#6E4A8E"></ellipse><ellipse cx="15" cy="23" rx="2" ry="4" fill="#8B6BA8"></ellipse>',
    spinat: '<ellipse cx="18" cy="26" rx="9" ry="15" fill="#3F7A3A" transform="rotate(-20 18 26)"></ellipse><ellipse cx="30" cy="26" rx="9" ry="15" fill="#4E8A45" transform="rotate(20 30 26)"></ellipse><path d="M18 26 L22 42 M30 26 L26 42" stroke="#2F5233" stroke-width="2"></path>',
    baerlauch: '<path d="M14 42 Q8 20 18 6 Q22 24 14 42 Z" fill="#4E9A45"></path><path d="M24 42 Q20 18 28 4 Q32 24 24 42 Z" fill="#5EAA52"></path><path d="M33 42 Q30 22 38 10 Q41 26 33 42 Z" fill="#4E9A45"></path>',
    radieschen: '<circle cx="24" cy="30" r="11" fill="#D8436A"></circle><path d="M24 41 L24 46" stroke="#F1ECE0" stroke-width="3" stroke-linecap="round"></path><path d="M24 19 Q18 8 12 8 M24 19 Q28 8 34 6" fill="none" stroke="#4E9A45" stroke-width="3" stroke-linecap="round"></path>',
    spargel: '<path d="M14 44 L16 10 M24 44 L24 6 M34 44 L32 10" stroke="#8FB45A" stroke-width="6" stroke-linecap="round"></path><path d="M16 10 l-2 4 M24 6 l-2 4 M32 10 l-2 4" stroke="#6E8F3E" stroke-width="3" stroke-linecap="round"></path>',
    erdbeeren: '<path d="M24 44 Q8 30 12 18 Q24 12 36 18 Q40 30 24 44 Z" fill="#D7322B"></path><path d="M14 16 L24 22 L34 16 L28 12 L24 8 L20 12 Z" fill="#4E9A45"></path><circle cx="20" cy="28" r="1.2" fill="#F5D547"></circle><circle cx="28" cy="27" r="1.2" fill="#F5D547"></circle><circle cx="24" cy="34" r="1.2" fill="#F5D547"></circle>',
    zucchini: '<rect x="8" y="18" width="34" height="13" rx="6.5" fill="#5E8C3A" transform="rotate(-25 24 24)"></rect><path d="M38 12 l4 -3" stroke="#3F6A2A" stroke-width="4" stroke-linecap="round"></path>',
    tomaten: '<circle cx="24" cy="28" r="14" fill="#D7322B"></circle><path d="M24 15 L20 11 M24 15 L28 11 M24 15 L18 17 M24 15 L30 17" stroke="#4E9A45" stroke-width="3" stroke-linecap="round"></path><ellipse cx="18" cy="23" rx="3.5" ry="2.4" fill="#E86A60"></ellipse>',
    paprika: '<path d="M12 20 Q12 42 24 42 Q36 42 36 20 Q30 16 24 20 Q18 16 12 20 Z" fill="#E04E2B"></path><path d="M24 20 L24 10" stroke="#4E9A45" stroke-width="4" stroke-linecap="round"></path>',
    marillen: '<circle cx="24" cy="27" r="14" fill="#F0A04B"></circle><path d="M24 14 Q28 27 24 41" fill="none" stroke="#D8822D" stroke-width="2"></path><ellipse cx="31" cy="12" rx="5" ry="2.6" fill="#4E9A45"></ellipse>',
    kohlrabi: '<circle cx="24" cy="30" r="13" fill="#C7E0A5"></circle><path d="M18 19 L12 6 M24 17 L24 4 M30 19 L36 6" stroke="#7E9A5E" stroke-width="3" stroke-linecap="round"></path>',
    oel: '<rect x="17" y="16" width="14" height="28" rx="5" fill="#E9C46A" stroke="#B8962E" stroke-width="1.5"></rect><rect x="21" y="6" width="6" height="11" rx="2" fill="#F1E3A6"></rect><rect x="20" y="3" width="8" height="4" rx="1.5" fill="#2F5233"></rect><rect x="19" y="26" width="10" height="8" rx="2" fill="#FFFFFF"></rect>',
    zwiebel: '<path d="M24 8 Q40 22 34 36 Q30 44 24 44 Q18 44 14 36 Q8 22 24 8 Z" fill="#D9A86C"></path><path d="M24 10 Q32 24 24 44 M24 10 Q16 24 24 44" fill="none" stroke="#B8844A" stroke-width="1.5"></path><path d="M24 8 L24 3" stroke="#8E6E3C" stroke-width="2" stroke-linecap="round"></path>',
    knoblauch: '<path d="M24 10 Q38 22 36 34 Q34 42 24 42 Q14 42 12 34 Q10 22 24 10 Z" fill="#F1ECE0" stroke="#CFC6B2" stroke-width="1.5"></path><path d="M24 12 L24 42 M18 18 Q16 30 19 41 M30 18 Q32 30 29 41" fill="none" stroke="#CFC6B2" stroke-width="1.5"></path>',
    wasser: '<path d="M24 6 Q36 22 36 30 Q36 42 24 42 Q12 42 12 30 Q12 22 24 6 Z" fill="#9CC7DF"></path><ellipse cx="19" cy="30" rx="3" ry="5" fill="#D6EAF2"></ellipse>',
    kraeuter: '<path d="M24 44 L24 8" stroke="#3F6A2A" stroke-width="2.5"></path><ellipse cx="18" cy="16" rx="6" ry="3.4" fill="#4E9A45" transform="rotate(-30 18 16)"></ellipse><ellipse cx="30" cy="22" rx="6" ry="3.4" fill="#5EAA52" transform="rotate(30 30 22)"></ellipse><ellipse cx="18" cy="28" rx="6" ry="3.4" fill="#4E9A45" transform="rotate(-30 18 28)"></ellipse><ellipse cx="30" cy="34" rx="6" ry="3.4" fill="#5EAA52" transform="rotate(30 30 34)"></ellipse>',
    zitrone: '<ellipse cx="24" cy="26" rx="17" ry="12" fill="#F7E04B"></ellipse><path d="M7 26 L4 26 M41 26 L44 26" stroke="#E0C42E" stroke-width="3" stroke-linecap="round"></path><ellipse cx="19" cy="22" rx="5" ry="2.5" fill="#FBF0A0"></ellipse>'
  };
  function jar(color) {
    return `<rect x="13" y="14" width="22" height="28" rx="6" fill="#FFFFFF" stroke="#3B2A1E" stroke-width="1.5"></rect><rect x="15" y="24" width="18" height="16" rx="4" fill="${color}" stroke="${color === '#FFFFFF' ? '#CFC6B2' : 'none'}"></rect><rect x="12" y="8" width="24" height="7" rx="2.5" fill="#5D5954"></rect>`;
  }
  function iconSvg(id, size) {
    const inner = ICONS[id] || jar((SPICE[id] || {}).color || '#CCCCCC');
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">${inner}</svg>`;
  }

  // ----- Zutaten in einer Reihe -----
  function tile(id, def, extra) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile' + (extra || '');
    b.dataset.id = id;
    b.innerHTML = iconSvg(id, 40);
    const name = document.createElement('span');
    name.className = 'tile-name';
    name.textContent = def.name;
    b.append(name);
    b.addEventListener('click', () => addToPot(id, b));
    return b;
  }
  function renderCrate() {
    const box = $('crate');
    box.innerHTML = '';
    const ids = Object.keys(S.crate);
    if (!ids.length) {
      const p = document.createElement('p'); p.className = 'crate-empty';
      p.textContent = 'Kiste leer! Schick Jakob auf Rettungstour.';
      box.append(p);
    }
    ids.forEach((id) => {
      const b = tile(id, ING[id]);
      const c = document.createElement('span'); c.className = 'count'; c.textContent = '×' + S.crate[id];
      b.append(c);
      b.setAttribute('aria-label', ING[id].name + ', noch ' + S.crate[id]);
      box.append(b);
    });
    syncButtons();
  }
  function renderStatic() {
    const base = $('base'); base.innerHTML = '';
    Object.keys(BASE).forEach((id) => base.append(tile(id, BASE[id])));
    const sp = $('spices'); sp.innerHTML = '';
    Object.keys(SPICE).forEach((id) => sp.append(tile(id, SPICE[id], ' spice')));
    const si = seasonInfo();
    $('season').textContent = 'Heute, ' + si.day + '. ' + MONTHS[si.month] + ': ' + si.word + '!';
  }
  function renderPotList() {
    $('potline').textContent = S.pot.length ? S.pot.map((id, i) => (i + 1) + '. ' + NAME(id)).join('  ·  ') : 'noch leer. Womit fängst du an?';
    syncButtons();
  }

  // ----- Was im Topf der Radküche zu sehen ist -----
  function colorOf(id) { return (ING[id] || BASE[id] || SPICE[id]).color; }
  function mix(colors) {
    if (!colors.length) return '#C9A26B';
    let r = 0, g = 0, b = 0;
    colors.forEach((c) => { r += parseInt(c.slice(1, 3), 16); g += parseInt(c.slice(3, 5), 16); b += parseInt(c.slice(5, 7), 16); });
    const n = colors.length;
    const h = (v) => Math.round(v / n).toString(16).padStart(2, '0');
    return '#' + h(r) + h(g) + h(b);
  }
  function soupColor(pot) {
    const cols = [];
    pot.forEach((id) => {
      if (ING[id]) cols.push(ING[id].color, ING[id].color);
      if (['paprikapulver', 'curry', 'zimt'].includes(id)) cols.push(SPICE[id].color, SPICE[id].color);
      if (id === 'zwiebel') cols.push('#C9A26B');
    });
    if (pot.includes('wasser')) cols.push('#C9B48A');
    return mix(cols.length ? cols : ['#C9A26B']);
  }
  function seeded(i) { const x = Math.sin(i * 9301 + 49297) * 233280; return x - Math.floor(x); }
  function renderPotVisual() {
    const pot = S.pot;
    const liquid = $('scene-liquid');
    liquid.setAttribute('fill', pot.includes('wasser') ? soupColor(pot) : '#5A4030');
    liquid.setAttribute('opacity', pot.length ? '1' : '0');
    let html = '';
    pot.forEach((id, i) => {
      if (id === 'wasser' || id === 'oel') return;
      const small = !!SPICE[id];
      const count = small ? 3 : 2;
      for (let k = 0; k < count; k++) {
        const x = 192 + seeded(i * 13 + k) * 34;
        const y = 335.5 + seeded(i * 29 + k * 7 + 3) * 3;
        html += `<circle class="float" style="animation-delay:${(-seeded(i * 7 + k) * 3).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${small ? 0.9 : 2.2}" fill="${colorOf(id)}"></circle>`;
      }
    });
    $('scene-pieces').innerHTML = html;
  }
  function splash(id) {
    const g = $('scene-splash');
    let html = '';
    for (let k = 0; k < 6; k++) {
      const ang = -Math.PI * (0.15 + 0.7 * (k / 5));
      const dx = Math.cos(ang) * rand(10, 22), dy = Math.sin(ang) * rand(10, 20);
      html += `<circle class="drop" cx="209" cy="334" r="${rand(1.4, 2.6).toFixed(1)}" fill="${id === 'wasser' ? '#9CC7DF' : colorOf(id)}" style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px"></circle>`;
    }
    g.innerHTML = html;
    setTimeout(() => { g.innerHTML = ''; }, 700);
  }

  // ----- Flug in den Topf -----
  function potMouthScreen() {
    const k = $('kitchen');
    const pt = svg.createSVGPoint(); pt.x = 209; pt.y = 332;
    return pt.matrixTransform(k.getScreenCTM());
  }
  function fly(fromEl, html, toX, toY, size, done, opts) {
    if (reduceMotion || !fromEl) { done(); return; }
    const r = fromEl.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'flying';
    el.style.left = (r.left + r.width / 2 - size / 2) + 'px';
    el.style.top = (r.top + r.height / 2 - size / 2) + 'px';
    el.style.width = el.style.height = size + 'px';
    el.innerHTML = html;
    $('flyer').appendChild(el);
    const dx = toX - (r.left + r.width / 2), dy = toY - (r.top + r.height / 2);
    const lift = (opts && opts.lift) || Math.min(140, 60 + Math.abs(dx) * 0.12);
    const anim = el.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)' },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - lift}px) scale(1.15) rotate(200deg)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.35) rotate(400deg)` }
    ], { duration: (opts && opts.ms) || 720, easing: 'cubic-bezier(.45,.05,.55,.95)' });
    anim.onfinish = () => { el.remove(); done(); };
  }

  function syncButtons() {
    const playing = S.phase === 'play' && !S.busy && !S.paused;
    document.querySelectorAll('.tile').forEach((b) => { b.disabled = !playing || S.pot.length >= 12; });
    $('cook').disabled = !playing || !S.pot.length;
    $('undo').disabled = !playing || !S.pot.length;
    $('clear').disabled = !playing || !S.pot.length;
    $('refill').disabled = S.phase !== 'play' || S.refilling > 0 || S.paused;
    $('pause').disabled = S.phase !== 'play';
    $('call-leolita').disabled = !playing || S.jk.leolita <= 0;
    $('call-nif').disabled = S.phase !== 'play' || S.paused || S.jk.nif <= 0 || S.nifBusy || S.calmUntil > S.elapsed;
    $('jk-leolita').textContent = S.jk.leolita;
    $('jk-nif').textContent = S.jk.nif;
    $('pause').innerHTML = S.paused ? '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5 L19 12 L8 19 Z" fill="currentColor"></path></svg>' : '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"></rect><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"></rect></svg>';
    $('pause').setAttribute('aria-label', S.paused ? 'Weiterspielen' : 'Pause');
    $('pause').title = S.paused ? 'Weiter' : 'Pause';
  }
  function addToPot(id, fromEl) {
    if (S.phase !== 'play' || S.busy || S.pot.length >= 12) return;
    if (ING[id]) {
      if (!S.crate[id]) return;
      S.crate[id] -= 1;
      if (S.crate[id] <= 0) delete S.crate[id];
    }
    S.pot.push(id);
    const target = potMouthScreen();
    const icon = fromEl ? fromEl.querySelector('svg') : null;
    if (ING[id]) renderCrate();
    renderPotList();
    fly(icon || fromEl, iconSvg(id, 40), target.x, target.y, 40, () => {
      splash(id);
      Music.sfx('plop');
      renderPotVisual();
      const p = $('pot'); p.classList.remove('plop'); void p.getBBox(); p.classList.add('plop');
    });
  }
  function undo() {
    const id = S.pot.pop();
    if (id && ING[id]) { S.crate[id] = (S.crate[id] || 0) + 1; renderCrate(); }
    renderPotList(); renderPotVisual();
  }
  function clearPot() {
    S.pot.forEach((id) => { if (ING[id]) S.crate[id] = (S.crate[id] || 0) + 1; });
    S.pot = [];
    renderCrate(); renderPotList(); renderPotVisual();
  }

  // ----- Jakob fährt auf Rettungstour -----
  const JAKOB_GO = ['Bin glei zruck! Wenn ned, hat mi a Kürbis überrollt.', 'Auf zur Rettung! Kein Erdapfel bleibt zurück!', 'I fahr zum Markt. Wer was will, ruft laut!'];
  const JAKOB_BACK = ['Ahoi! Der Supermarkt hätt des alles weggschmissen. Jetzt is’ unser Schatz!', 'Nachschub! Und a Paradeiser is dabei, der singt Opern.', 'Voll beladen! Des Rad hat mehr Muskeln als i.'];
  function jakobAt(x) { $('jakob').style.transform = `translate(${x}px, 552px)`; }
  function refill() {
    if (S.refilling > 0 || S.phase !== 'play') return;
    S.refilling = 9;
    S.jakob = 'leaving';
    $('refill-note').textContent = '…';
    say(220, 420, pick(JAKOB_GO), 3200, 'Jakob');
    Music.sfx('bike');
    $('jakob').classList.add('rolling');
    $('jakob-load').setAttribute('opacity', '0');
    jakobAt(-360);
    syncButtons();
  }
  function jakobTick() {
    if (S.refilling <= 0) return;
    $('refill-note').textContent = Math.ceil(Math.max(0, S.refilling)) + 's';
    if (S.jakob === 'leaving' && S.refilling < 6.5) { S.jakob = 'shopping'; $('jakob-load').setAttribute('opacity', '1'); }
    if (S.jakob === 'shopping' && S.refilling < 3) { S.jakob = 'returning'; jakobAt(170); }
    if (S.refilling <= 0.05) {
      S.refilling = 0;
      S.jakob = 'home';
      $('jakob').classList.remove('rolling');
      const fresh = nextCrate();
      for (const id in fresh) S.crate[id] = (S.crate[id] || 0) + fresh[id];
      $('refill-note').textContent = '';
      renderCrate();
      say(220, 420, pick(JAKOB_BACK), 3800, 'Jakob');
      setTimeout(() => $('jakob-load').setAttribute('opacity', '0'), 1600);
      syncButtons();
    }
  }

  // ----- Rolf, der Smutje, unterhält die Schlange -----
  const MIRA_SOLO = [
    'Arrr! Wer drängelt, muss über die Planke! ... Also übern Gehsteig.',
    'Mit oan Aug siag i trotzdem, wer si vordrängelt!',
    'A Pirat ohne Schiff is a Radfahrer mit Augenklappe. So schaut’s aus.',
    'Wer errät, wie viele Erdäpfel i jonglier, kriegt an Nachschlag! Tipp: Es san drei.',
    'Warten is wie Kochen: Je länger, desto besser. Meistens.',
    'Liebe Nachbarschaft, bitte ned drängeln, der Kürbis is scho nervös genug.',
    'I hab heut scho drei Zwiebeln g’schnitten. I wein ned, i bin nur gerührt.',
    'Wer am lautesten lacht, kriegt die größte Portion. Probiert’s aus!'
  ];
  const DUETS = [
    ['Captain, a Kunde fragt, ob des Essen bio is.', 'Bio-grafisch! Jedes Gemüse hat a Geschichte.'],
    ['Captain, wie viel Salz?', 'A Prise. A Weaner Prise. Also a Handvoll.'],
    ['Captain, wieso trägst du eigentlich a Kapitänsmütze?', 'Damit mi die Zwiebeln ernst nehmen.'],
    ['I hab die Zwiebel g’schnitten und jetzt wein i.', 'Des is Teambuilding, Rolf.'],
    ['Captain, die Schlange wird länger!', 'Dann kochen ma schneller. Und reden langsamer.'],
    ['Captain, wo is eigentlich mei zweites Aug?', 'Im Kompott, Rolf. Wie jeden Dienstag.'],
    ['Captain, a Pirat raubt doch, oder?', 'Mia retten, Rolf. Des is der Unterschied.'],
    ['Captain, is des Schiff eigentlich seetauglich?', 'Na. Aber grätzltauglich, und des is wichtiger.']
  ];
  function banter() {
    if (S.feasting) return;
    if (talkBusy || talkQ.length) return;
    const r = Math.random();
    if (r < 0.35) {
      $('juggle').setAttribute('opacity', '1');
      $('mira').classList.add('juggling');
      say(60, 340, pick(MIRA_SOLO), 4200, 'Rolf');
      setTimeout(() => { $('juggle').setAttribute('opacity', '0'); $('mira').classList.remove('juggling'); }, 4200);
    } else if (r < 0.8) {
      const d = pick(DUETS);
      say(60, 340, d[0], 3400, 'Rolf');
      say(342, 330, d[1], 3800, 'Captain Dave');
    } else {
      say(60, 340, pick(MIRA_SOLO), 4200, 'Rolf');
    }
  }

  // ----- Kochen und übergeben -----
  const CAPTAIN_JOKES = [
    ['Ups. Des war a Probelauf. Ehrlich.', 'I hab des nur kocht, damit ihr seht, wie’s ned geht.', 'Des kriegt der Kompost. Der freut si wenigstens.'],
    ['Na ja, des is ... experimentell.', 'Probier’s, is gesund. Glaub i.', 'Kunst kommt von Können. Des kommt vom Kochen.'],
    ['Passt scho! Nächstes Mal mit no mehr Gefühl.', 'Ned perfekt, aber mit Herz gekocht.', 'A guade Hausmannskost, ganz ohne Haus.'],
    ['Des is ka Essen, des is a Liebeserklärung!', 'Gerettet und veredelt. So schaut’s aus!', 'Wenn des ned schmeckt, ess i mei Kapitänsmütze.']
  ];
  const MIRA_REACT = [
    'Arrr, Captain, i hol schnell den Kompostkübel ...',
    'Mutig gekocht, Captain. Sehr mutig.',
    'Riecht guat! Also eh guat.',
    'Applaus für den Captain! Und für die Erdäpfel!'
  ];
  const wait = (ms) => new Promise((res) => setTimeout(res, reduceMotion ? Math.min(ms, 120) : ms));

  async function cook() {
    if (S.phase !== 'play' || S.busy || !S.pot.length) return;
    S.busy = true;
    syncButtons();
    const potCopy = S.pot.slice();
    const result = judge(potCopy);
    const color = potCopy.includes('wasser') ? soupColor(potCopy) : mix(potCopy.filter((id) => ING[id]).map((id) => ING[id].color).concat(['#C9A26B']));

    // Es brodelt, der Captain rührt
    const sPot = $('pot');
    $('kitchen').classList.add('cooking');
    $('captain').classList.remove('stir'); void $('captain').getBBox(); $('captain').classList.add('stir');
    sPot.classList.remove('bubble'); void sPot.getBBox(); sPot.classList.add('bubble');
    await wait(2000);
    $('kitchen').classList.remove('cooking');
    S.pot = [];
    renderPotList();
    renderPotVisual();
    serve(result, color, dishCats(potCopy));
  }

  function spoonsSvg(n, size) {
    let s = '';
    for (let i = 0; i < 3; i++) {
      const on = i < n;
      s += `<svg width="${size || 34}" height="${size || 34}" viewBox="0 0 34 34" aria-hidden="true"><ellipse cx="12" cy="11" rx="7" ry="9" fill="${on ? '#C97B3D' : '#E9DCC4'}" transform="rotate(-35 12 11)"></ellipse><line x1="16" y1="16" x2="29" y2="30" stroke="${on ? '#6B4A32' : '#E9DCC4'}" stroke-width="4" stroke-linecap="round"></line></svg>`;
    }
    return s;
  }

  async function handOver(n, color) {
    const hp = $('handplate');
    $('handfood').setAttribute('fill', color);
    hp.style.transition = 'none';
    hp.style.transform = 'translate(249px, 334px)';
    hp.setAttribute('opacity', '1');
    await wait(60);
    hp.style.transition = 'transform .45s ease-out';
    hp.style.transform = 'translate(362px, 398px)';
    await wait(480);
    hp.style.transition = 'transform .55s ease-in-out';
    hp.style.transform = `translate(${(n.x - 22).toFixed(0)}px, ${QY - 44}px)`;
    await wait(580);
    hp.setAttribute('opacity', '0');
    const bowl = n.el.querySelector('.bowl');
    bowl.querySelector('path').setAttribute('fill', color);
    bowl.setAttribute('opacity', '1');
  }

  function showJuryPop(r) {
    const pop = $('jurypop');
    pop.innerHTML = '';
    const sp = document.createElement('div'); sp.className = 'jp-spoons'; sp.innerHTML = spoonsSvg(r.spoons, 24); pop.append(sp);
    const h = document.createElement('p'); h.className = 'jp-head'; h.textContent = r.head + (r.dish ? ' ' + r.dish + '!' : ''); pop.append(h);
    if (r.notes[0]) { const t = document.createElement('p'); t.className = 'jp-note'; t.textContent = r.notes[0][1]; pop.append(t); }
    pop.hidden = false;
    pop.classList.remove('show'); void pop.offsetWidth; pop.classList.add('show');
    clearTimeout(showJuryPop.t);
    showJuryPop.t = setTimeout(() => pop.classList.remove('show'), 7000);
  }

  async function serve(r, color, cats) {
    S.dishes += 1;
    const seeds = [0, 1, 3, 5][r.spoons];
    const portions = [0, 2, 4, 6][r.spoons];
    let matched = [];
    if (portions) {
      const want = S.queue.filter((n) => n.wish !== 'egal' && cats.has(n.wish));
      const easy = S.queue.filter((n) => n.wish === 'egal');
      matched = want.concat(easy).slice(0, portions);
    }
    const feeds = matched.length;
    const exact = matched.filter((n) => n.wish !== 'egal').length;
    const kept = Math.max(0, Math.min(6 - S.warm.length, portions - feeds));
    let points = [0, 20, 50, 100][r.spoons] + (r.dish ? 30 : 0) + exact * 20;
    const master = S.masterNext;
    S.masterNext = null;
    if (master) points = Math.round(points / 2);
    if (!master && r.spoons === 3) { S.streak += 1; if (S.streak % 3 === 0) setTimeout(() => earnJoker('leolita', 'Drei Gerichte mit 3 Kochlöffeln!'), 3000); }
    S.seeds += seeds;
    addScore(points);
    Music.sfx(r.spoons >= 2 ? 'ding' : 'meh');

    // Jury ausführlich unten, kurz in der Szene
    const v = $('verdict');
    v.innerHTML = '';
    const sp = document.createElement('div'); sp.className = 'spoons'; sp.setAttribute('aria-label', r.spoons + ' von 3 Kochlöffeln'); sp.innerHTML = spoonsSvg(r.spoons); v.append(sp);
    const h = document.createElement('p'); h.className = 'v-head'; h.textContent = r.head; v.append(h);
    if (r.dish) { const d = document.createElement('p'); d.className = 'v-dish'; d.textContent = 'Erkannt: ' + r.dish + '!'; v.append(d); }
    const ul = document.createElement('ul'); ul.className = 'v-list';
    r.notes.forEach(([cls, t]) => { const li = document.createElement('li'); li.className = cls; li.textContent = t; ul.append(li); });
    v.append(ul);
    const rw = document.createElement('p'); rw.className = 'v-reward';
    rw.textContent = r.spoons
      ? `Passt zu: ${catNames(cats)} · ${portions} Portionen` + (feeds ? `, ${feeds} ${feeds === 1 ? 'Wunsch' : 'Wünsche'} erfüllt` : ', aber kein passender Wunsch in der Schlange') + (kept > 0 ? `, ${kept} bleiben warm` : '') + ` · +${seeds} Samen · +${points} Punkte`
      : 'Keine Samen diesmal. Probier eine andere Reihenfolge!';
    v.append(rw);
    if (master) { const g = document.createElement('p'); g.className = 'v-master'; g.textContent = 'Gekocht von Leolitta. Ihr Rezept mit allen Erklärungen steht unten im Rezeptbuch.'; v.prepend(g); }
    showJuryPop(r);

    say(342, 330, master ? pick(['Danke, Leolitta! Des war a Lehrstunde.', 'Leolitta, du bist a Legende!', 'I glaub, i muss no viel lernen.']) : pick(CAPTAIN_JOKES[r.spoons]), 3800, 'Captain Dave');
    if (Math.random() < 0.5) say(60, 340, MIRA_REACT[r.spoons], 3200, 'Rolf', { low: true });

    if (feeds) {
      S.handing = true;
      for (let i = 0; i < matched.length; i++) {
        const n = matched[i];
        if (!S.queue.includes(n)) continue;
        await handOver(n, color);
        if (i === 0) {
          const line = n.wish !== 'egal' && r.spoons >= 2 ? pick(WISH_HAPPY) : pick(LINES[n.humor]['r' + r.spoons]);
          setTimeout(() => { if (n.el.isConnected) say(n.x, QY - 162, line, 4000, n.name); }, 700);
        }
        feedList([n], r.spoons, true);
      }
      S.handing = false;
    } else if (S.queue.length && r.spoons > 0) {
      setTimeout(() => { const n = S.queue[0]; if (n) say(n.x, QY - 162, 'Des hab i aber ned bestellt!', 3200, n.name); }, 1200);
    } else if (S.queue.length && r.spoons === 0) {
      setTimeout(() => maybeSay(S.queue[0], 'r0', true), 1200);
    }
    for (let k = 0; k < kept; k++) S.warm.push({ cats, color });
    if (seeds) setTimeout(() => toast(`+${seeds} Samen!`, 'Klick auf die Wiese vorne oder auf ein Haus, um zu pflanzen.'), 600);
    S.busy = false;
    syncButtons();
    updateHud();
    if (!Object.keys(S.crate).length && S.refilling <= 0) setTimeout(() => toast('Die Rettungskiste ist leer.', 'Schick Jakob auf Rettungstour!'), 2600);
  }

  // ---------------------------------------------------------------
  // Bonus: Leolitta, die Meisterköchin aus dem Hof
  // ---------------------------------------------------------------
  const SPICE_SETS = [[], ['kuemmel'], ['majoran'], ['curry'], ['muskat'], ['kuemmel', 'majoran'], ['curry', 'muskat'], ['pfeffer']];
  function buildPot(items, o) {
    const types = (t) => items.filter((id) => ING[id].type === t);
    const fruit = types('fruit');
    const veg = items.filter((id) => ING[id].type !== 'fruit' && ING[id].type !== 'bread');
    const bread = types('bread');
    if (!veg.length && (fruit.length || bread.length)) {
      // süß
      const pot = [];
      if (bread.length) pot.push('oel', ...bread);
      pot.push(...fruit, 'zimt');
      if (fruit.length && !bread.length && o.water) pot.push('wasser');
      if (o.lemon) pot.push('zitrone');
      return pot;
    }
    const pot = ['oel', 'zwiebel'];
    if (o.garlic) pot.push('knoblauch');
    pot.push(...types('hard'), ...types('legume'));
    if (o.paprika) pot.push('paprikapulver');
    const needsWater = types('hard').length || types('legume').length || o.soup;
    if (needsWater || bread.length) pot.push('wasser');
    pot.push(...types('medium'), ...bread, ...types('soft'), ...types('leafy'));
    pot.push('salz', ...o.spices);
    if (o.herbs) pot.push('kraeuter');
    if (o.lemon) pot.push('zitrone');
    return pot;
  }
  function subsets(arr, max) {
    const out = [];
    const rec = (start, cur) => {
      if (cur.length) out.push(cur.slice());
      if (cur.length === max) return;
      for (let i = start; i < arr.length; i++) { cur.push(arr[i]); rec(i + 1, cur); cur.pop(); }
    };
    rec(0, []);
    return out;
  }
  function planMaster() {
    const avail = Object.keys(S.crate).filter((id) => S.crate[id] > 0);
    let best = null;
    subsets(avail, 3).forEach((items) => {
      [false, true].forEach((garlic) => [false, true].forEach((paprika) => SPICE_SETS.forEach((spices) => [false, true].forEach((herbs) => [false, true].forEach((lemon) => {
        const pot = buildPot(items, { garlic, paprika, spices, herbs, lemon, water: true, soup: items.length >= 2 });
        const r = judge(pot);
        const cats = dishCats(pot);
        const fans = S.queue.filter((n) => n.wish !== 'egal' && cats.has(n.wish)).length;
        const score = r.spoons * 1000 + fans * 400 + (r.dish ? 300 : 0) + r.pts * 10 - pot.length;
        if (!best || score > best.score) best = { pot, r, score };
      })))));
    });
    return best;
  }
  function explainStep(id, pot) {
    const sweet = !pot.some((x) => ING[x] && !['fruit', 'bread'].includes(ING[x].type));
    if (ING[id]) {
      const t = ING[id].type;
      const n = ING[id].name;
      const pl = ['kartoffeln', 'karotten', 'rueben', 'linsen', 'pastinaken', 'aepfel', 'bananen', 'birnen', 'zwetschken', 'tomaten', 'pilze', 'erdbeeren', 'marillen', 'radieschen'].includes(id);
      const v = (one, many) => (pl ? many : one);
      if (t === 'bread') return sweet ? 'Altes Brot, des is die beste Grundlage für a süße Speis.' : 'Des alte Brot kommt rein und macht die Suppe sämig.';
      if (t === 'fruit') return n + v(' bringt', ' bringen') + ' die Süße, da braucht’s fast keinen Zucker.';
      if (t === 'hard') return n + v(' kommt', ' kommen') + ' früh in den Topf, weil' + v(' sie', ' sie') + ' am längsten ' + v('braucht', 'brauchen') + '.';
      if (t === 'legume') return n + ' brauchen Zeit und Flüssigkeit, drum kommen’s bald hinein.';
      if (t === 'medium') return n + v(' braucht', ' brauchen') + ' mittellang, drum erst nach dem Harten.';
      if (t === 'soft') return n + ' erst später, sonst ' + v('zerfällt’s', 'zerfallen’s') + ' zu Gatsch.';
      if (t === 'leafy') return n + ' nur kurz vor Schluss, damit’s schön grün bleibt.';
    }
    const why = {
      oel: sweet ? 'A bissl Öl, damit das Brot knusprig anröstet.' : 'Zuerst a Schuss Öl, damit nix anbrennt und alles schön anröstet.',
      zwiebel: 'Dann d’Zwiebel. Die muss glasig werden, das ist die Grundlage für den Geschmack.',
      knoblauch: 'Knoblauch erst nach der Zwiebel, sonst verbrennt er und wird bitter.',
      wasser: sweet ? 'A Schluck Wasser, damit das Obst weich und saftig wird.' : 'Jetzt mit Wasser aufgießen und schön köcheln lassen.',
      paprikapulver: 'Paprikapulver nur ganz kurz mitrösten und gleich ablöschen, sonst wird’s bitter.',
      salz: 'A Prise Salz. Ohne Salz schmeckt alles nach nix.',
      pfeffer: 'A bissl Pfeffer für die Wärme.',
      kuemmel: 'Kümmel, wie bei meiner Mutter. Der macht’s bekömmlich.',
      majoran: 'Majoran, des is das Wiener Geheimnis.',
      curry: 'A bissl Curry, des wärmt von innen.',
      muskat: 'A Prise Muskat hebt den Geschmack, aber wirklich nur a Prise.',
      zimt: 'Zimt passt zu Obst wie der Deckel auf den Topf.',
      chili: 'A Hauch Chili, aber vorsichtig.',
      kraeuter: 'Frische Kräuter ganz am Schluss, damit sie frisch schmecken.',
      zitrone: 'Und a Spritzer Zitrone zum Schluss. Der weckt alles auf.'
    };
    return why[id] || NAME(id) + '.';
  }
  const GERTI_HELLO = ['Hiaz geh weg, Bua, jetzt koch i!', 'Kruzitürken, wer hat denn do so a Gwirx im Topf g’macht? Gib her!', 'Sakra, so wird des nix. Lass die Leolitta ran!'];
  const GERTI_SCOLD = ['Und es do hint: Hörts auf mit’m Raunzen, es kriagts eh glei wos!', 'Wer drängelt, kriagt nix. So schaut’s aus!', 'Hiaz is a Ruah do hint, sonst gibt’s nur Kompott!'];
  const GERTI_BYE = ['So. Und hiaz machst as selber, gö?', 'Merk da des, i sog’s ned zwamoi!', 'Pfiat eich, und ned raunzen!'];
  function gertiAt(x) { $('gerti').style.transform = `translateX(${x}px)`; }

  // ---------------------------------------------------------------
  // Leolitta, die Tierrechtlerin: diskutiert direkt, aber mit Herz
  // ---------------------------------------------------------------
  const LEO_OPEN = [
    'Wos? Fleisch? Bist du deppert? ... Na, du ned. Aber dei Bestellung scho!',
    'Do hint hat wer a Leich bestellt! Wer war des? Raus mit da Sprach!',
    'Grüß di! Du wüllst also a totes Viech? Na servas, a Romantiker!',
    'A Schnitzerl? Bei da Radküch? Do bist an da falschen Adress, Freind!'
  ];
  const DEBATE_PAIRS = [
    ['Aber a Viech is doch zum Essen da!', 'Ah so? Dann servier i morgen Dackelgulasch. Is eh a Viech! ... Na? Schaust jetzt bled, gö?'],
    ['Fleisch g’hört halt dazu!', 'Guat, dann gibt’s morgen Nachbarschnitzel, frisch aus’m Stiegenhaus! ... Schmäh. Aber merkst was?'],
    ['Mei Opa hat jeden Tag Fleisch g’essen und is 90 worden!', 'Und mei Opa hat 60 Joahr g’raucht. Is des jetzt a Gesundheitstipp?'],
    ['Die Viecher spürn doch eh nix.', 'Des sagt der Metzger a. Und der kriagt a ka Mitleid von mir.'],
    ['I brauch halt was zum Beißen.', 'Dann beiß in an Kohlrabi. Der schreit wenigstens ned.'],
    ['Aber Hendl is doch ka richtiges Fleisch.', 'Sag des amoi dem Hendl. Des sieht des ganz anders!'],
    ['Und wo krieg i dann mei Eiweiß her?', 'Linsen, Bohnen, Erbsen, Tofu. Do steckt gnua drin, und ka Viech muass dafür leidn.'],
    ['Aber i kauf eh nur Bio!', 'Bio hoaßt ned, dass des Schwein gern stirbt. Des wüll a ned sterbn, gnau wia du.'],
    ['Des hamma immer scho so g’macht.', 'Früher hamma a mit Kohle g’heizt und Bleifarben g’strichen. Ma derf a gscheiter werden, gö!']
  ];
  const CONVINCED = ['Na guat ... dann probier i halt was Deftiges von euch.', 'Hm. So hab i des no nie g’sehn. I probier’s.', 'Du bist streng, oba recht hast. Gib ma a Gemüse!', 'Guat, guat, i probier’s, bevor i selber im Eintopf land!', 'Na servas. Überredet. Aber nur heut! ... Vielleicht.'];
  const LEO_END = ['Siagst, Hirn einschalten tut ned weh. Meistens.', 'Brav! Und wer morgen wieder Fleisch bestellt, kommt selber in Eintopf. Schmäh! ... Großteils.', 'Na schau, geht eh! Und wennst as ned magst, kriagst as Geld z’ruck. Is eh gratis!', 'Siagst. Mit Herz und Hirn geht ois.'];
  function shuffled(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  async function debate(n) {
    S.debating = true;
    n.inDebate = true;
    S.leoBusy = true;
    const g = $('gerti');
    const standX = Math.max(60, n.x - 58);
    g.classList.add('walking');
    gertiAt(standX - 270);
    await wait(2000);
    g.classList.remove('walking');
    const talk = async (leo, text, ms) => {
      if (!S.queue.includes(n) || S.phase !== 'play') throw new Error('stop');
      while (S.paused) await wait(300);
      const b = leo ? say(standX, 350, text, ms, 'Leolitta', { keep: true }) : say(n.x, QY - 162, text, ms, n.name, { keep: true, xf: () => n.x });
      await b.done;
    };
    try {
      await talk(true, pick(LEO_OPEN), 3400);
      for (const [a, b] of shuffled(DEBATE_PAIRS).slice(0, 2)) {
        await talk(false, a, 2800);
        await talk(true, b, 3800);
      }
      await talk(false, pick(CONVINCED), 3000);
      n.wish = Math.random() < 0.65 ? 'deftig' : 'egal';
      n.waited = 0;
      renderWish(n);
      S.converted = (S.converted || 0) + 1;
      addScore(40);
      toast('Leolitta hat a Herz g’öffnet! +40', n.name + ' probiert jetzt was Pflanzliches.');
      await talk(true, pick(LEO_END), 3200);
    } catch (e) { /* Runde vorbei oder Nachbar weg */ }
    n.inDebate = false;
    g.classList.add('walking');
    gertiAt(-420);
    await wait(2000);
    g.classList.remove('walking');
    S.leoBusy = false;
    S.debating = false;
    S.nextDebate = S.elapsed + 8;
  }

  // ---------------------------------------------------------------
  // Überraschung: Leolittas veganer Festtruthahn
  // ---------------------------------------------------------------
  const FEAST_OPEN = {
    reward: ['Und hiaz zeig i euch, wos a echter Festbraten is! Hundert Prozent ohne Viech!', 'Weil’s so brav zuag’hört habt’s: Festtag! Greifts zua!'],
    rescue: ['Aus da Bahn, hier kommt da Retter in da Not! Ganz ohne Feder und ohne Leid!', 'Hiaz is gnua g’wartet! Leolitta bringt an Truthahn, der nie g’lebt hat!']
  };
  const FEAST_CHEER = ['Des is ja a Wahnsinn!', 'Und des is wirklich ohne Viech?', 'I werd vegan. Ab morgen. Fix!', 'So a Festessen hab i seit Weihnachten 1998 ned g’habt!', 'Leolitta, du bist a Heilige!', 'Oy, des schmeckt wie bei meiner Mamme. Nur besser!'];
  async function feast(kind) {
    if (S.leoBusy || S.phase !== 'play' || !S.queue.length) return;
    S.leoBusy = true;
    S.feasting = true;
    const g = $('gerti');
    $('turkey').setAttribute('opacity', '1');
    Music.sfx('feast');
    $('feastglow').classList.add('on');
    toast(kind === 'rescue' ? 'Rettung in letzter Sekunde!' : 'Überraschung!', 'Leolitta kommt mit einem riesigen veganen Festtruthahn!');
    g.classList.add('walking');
    gertiAt(560 - 270);
    await wait(2100);
    g.classList.remove('walking');
    const fo = pick(FEAST_OPEN[kind]);
    await say(560, 350, fo, 3600, 'Leolitta', { keep: true }).done;
    talkQ.splice(0).forEach((t) => t.resolve());
    const list = S.queue.slice();
    list.forEach((n, i) => { n.tx = 620 + (i % 6) * 38; n.feast = true; });
    await wait(1900);
    list.forEach((n) => { const b = n.el.querySelector('.bowl'); if (b) { b.querySelector('path').setAttribute('fill', '#B5651D'); b.setAttribute('opacity', '1'); } });
    const cheer = shuffled(FEAST_CHEER);
    for (let i = 0; i < Math.min(3, list.length); i++) {
      const n = list[i];
      if (n.el.isConnected) await say(n.x, QY - 162, cheer[i], 3000, n.name, { keep: true }).done;
    }
    const fed = list.filter((n) => S.queue.includes(n));
    feedList(fed, 3, true);
    addScore(fed.length * 30 + 100);
    celebrate();
    toast(`Festtag im Grätzl! ${fed.length} glückliche Nachbarn`, `+${fed.length * 30 + 100} Punkte. Und keinem einzigen Viech is was passiert.`);
    S.feasts = (S.feasts || 0) + 1;
    await wait(1800);
    await say(560, 350, pick(['So schaut’s aus, wenn ma Herz hat!', 'Und nächstes Mal bringt’s eure Schwiegermütter mit!', 'Pfiat eich, ihr Truthahn-Fans!']), 3000, 'Leolitta', { keep: true }).done;
    $('feastglow').classList.remove('on');
    g.classList.add('walking');
    gertiAt(-420);
    await wait(2000);
    g.classList.remove('walking');
    $('turkey').setAttribute('opacity', '0');
    S.feasting = false;
    S.leoBusy = false;
  }

  async function masterCook() {
    if (S.phase !== 'play' || S.busy || S.jk.leolita <= 0) return;
    if (S.leoBusy) { toast('Leolitta diskutiert grad.', 'Gleich hat sie wieder Zeit für dich.'); return; }
    const avail = Object.keys(S.crate).filter((id) => S.crate[id] > 0);
    if (!avail.length) { toast('Die Kiste ist leer.', 'Ohne Zutaten kann auch Leolitta nix zaubern. Schick Jakob los!'); return; }
    S.jk.leolita -= 1;
    S.leoBusy = true;
    S.busy = true;
    clearPot();
    syncButtons();
    const plan = planMaster();
    // Leolitta kommt aus dem Hof
    $('gerti').classList.add('walking');
    gertiAt(0);
    await wait(2000);
    $('gerti').classList.remove('walking');
    say(270, 350, pick(GERTI_HELLO), 3000, 'Leolitta');
    await wait(1400);
    if (S.queue.length) setTimeout(() => say(Math.min(900, S.queue[Math.min(2, S.queue.length - 1)].x), 360, pick(GERTI_SCOLD), 3200, 'Leolitta'), 1500);
    const steps = [];
    const target = potMouthScreen();
    for (const id of plan.pot) {
      const tileEl = document.querySelector(`.tile[data-id="${id}"]`);
      const from = tileEl ? (tileEl.querySelector('svg') || tileEl) : $('gerti');
      const flight = new Promise((res) => fly(from, iconSvg(id, 40), target.x, target.y, 40, res, { ms: 480 }));
      if (ING[id]) {
        S.crate[id] -= 1;
        if (S.crate[id] <= 0) delete S.crate[id];
        renderCrate();
      }
      S.pot.push(id);
      renderPotList();
      steps.push([id, explainStep(id, plan.pot)]);
      await flight;
      splash(id);
      Music.sfx('plop');
      renderPotVisual();
      await wait(140);
    }
    S.busy = false;
    S.masterNext = { dish: plan.r.dish, steps };
    addRecipe(plan.r.dish || 'Omas Resteküche', steps);
    cook();
    setTimeout(() => {
      say(270, 350, pick(GERTI_BYE), 3200, 'Leolitta');
      setTimeout(() => { $('gerti').classList.add('walking'); gertiAt(-420); setTimeout(() => { $('gerti').classList.remove('walking'); S.leoBusy = false; }, 2000); }, 2600);
    }, 4200);
  }

  // ---------------------------------------------------------------
  // Das Rezeptbuch der Radküche: echte Rezepte aus geretteten Zutaten
  // ---------------------------------------------------------------
  const RECIPES = [
    {
      name: 'Kürbiscremesuppe', tag: 'Cremig, wärmend, leuchtend orange', icons: ['kuerbis', 'karotten', 'zwiebel'],
      serves: 4, time: '35 Min', months: [9, 10, 11, 12],
      items: ['1 Hokkaido-Kürbis (ca. 800 g)', '2 Karotten', '1 Zwiebel', '1 EL Öl', '1 l Wasser', '1 TL Curry', 'Salz, eine Prise Muskat', 'Frische Kräuter oder Kürbiskerne'],
      steps: ['Zwiebel würfeln und im Öl 3 Minuten glasig anschwitzen.', 'Kürbis entkernen und würfeln. Beim Hokkaido kann die Schale dranbleiben. Karotten schneiden, beides 5 Minuten mitrösten.', 'Curry kurz mitrösten, dann mit Wasser aufgießen.', 'Zugedeckt 20 Minuten köcheln, bis alles weich ist.', 'Fein pürieren, mit Salz und Muskat abschmecken, mit Kräutern bestreuen.'],
      tip: 'Ein Schuss Hafersahne oder ein Spritzer Zitrone macht sie noch runder.',
      game: ['oel', 'zwiebel', 'kuerbis', 'curry', 'wasser', 'salz', 'muskat', 'kraeuter']
    },
    {
      name: 'Erdäpfelgulasch', tag: 'Der Wiener Klassiker, ganz pflanzlich', icons: ['kartoffeln', 'zwiebel'],
      serves: 4, time: '45 Min', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      items: ['1 kg Erdäpfel (mehlig)', '2 große Zwiebeln', '2 EL Öl', '1 EL Paprikapulver edelsüß', '1 TL Kümmel', '1 l Wasser', '1 TL Majoran', 'Salz, Pfeffer'],
      steps: ['Zwiebeln fein schneiden und im Öl 8 Minuten goldbraun rösten. Die Zeit lohnt sich, das ist der Geschmack.', 'Paprikapulver dazu, nur 20 Sekunden rühren und sofort mit Wasser ablöschen, sonst wird es bitter.', 'Erdäpfel schälen, würfeln, mit Kümmel dazugeben.', '25 Minuten köcheln, bis die Erdäpfel weich sind.', 'Ein paar Stücke am Topfrand zerdrücken, damit es sämig wird. Mit Majoran, Salz und Pfeffer abschmecken.'],
      tip: 'Am nächsten Tag schmeckt es noch besser.',
      game: ['oel', 'zwiebel', 'kartoffeln', 'paprikapulver', 'wasser', 'kuemmel', 'salz', 'majoran']
    },
    {
      name: 'Leolittas vegane Erdäpfelpuffer', tag: 'Außen knusprig, innen weich', icons: ['kartoffeln', 'zwiebel', 'oel'],
      serves: 4, time: '30 Min', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      items: ['800 g Erdäpfel (festkochend)', '1 Zwiebel', '3 EL Mehl', '1 TL Salz, Pfeffer, Muskat', 'Öl zum Herausbacken', 'Apfelmus zum Dazuessen'],
      steps: ['Erdäpfel und Zwiebel fein reiben.', 'In ein Tuch geben und kräftig ausdrücken. Die Flüssigkeit kurz stehen lassen, abgießen und die weiße Stärke am Boden zurück in den Teig geben. Die hält alles zusammen, ganz ohne Ei.', 'Mehl und Gewürze untermischen.', 'Reichlich Öl stark erhitzen, flache Puffer hineinsetzen und pro Seite 3 bis 4 Minuten goldbraun backen.', 'Kurz auf Küchenpapier abtropfen lassen und sofort essen.'],
      tip: 'Leolitta sagt: „Des Öl muss heiß sein, sonst saugen’s si voll wie a Schwamm!“',
      game: ['oel', 'zwiebel', 'kartoffeln', 'salz', 'muskat']
    },
    {
      name: 'Cremiger Linseneintopf', tag: 'Sättigt, wärmt, kostet fast nix', icons: ['linsen', 'karotten', 'lauch'],
      serves: 4, time: '50 Min', months: [1, 2, 3, 4, 9, 10, 11, 12],
      items: ['250 g braune Linsen', '1 Zwiebel', '2 Karotten', '1 Stange Lauch', '2 Erdäpfel', '2 EL Öl', '1,2 l Wasser', 'Majoran, Salz, ein Schuss Essig'],
      steps: ['Zwiebel würfeln und im Öl glasig anschwitzen.', 'Karotten und Erdäpfel klein würfeln, 3 Minuten mitrösten.', 'Linsen abspülen, dazugeben und mit Wasser aufgießen.', '35 Minuten köcheln. Den Lauch in Ringen erst nach 25 Minuten dazugeben.', 'Erst am Schluss salzen, dazu Majoran und ein Schuss Essig. Der Essig weckt die Linsen auf.'],
      tip: 'Mit roten Linsen geht’s schneller, nach 15 Minuten sind sie weich.',
      game: ['oel', 'zwiebel', 'karotten', 'linsen', 'wasser', 'lauch', 'salz', 'majoran']
    },
    {
      name: 'Wiener Krautgemüse', tag: 'Mit Kümmel und einem Hauch Apfel', icons: ['kraut', 'aepfel', 'zwiebel'],
      serves: 4, time: '35 Min', months: [9, 10, 11, 12, 1, 2, 3],
      items: ['½ Weißkraut (ca. 600 g)', '1 Zwiebel', '1 Apfel', '2 EL Öl', '1 TL Kümmel', '150 ml Wasser', 'Salz, Pfeffer, ein Schuss Essig'],
      steps: ['Zwiebel in Streifen schneiden und im Öl goldgelb anrösten.', 'Kraut fein schneiden, dazugeben und 5 Minuten mitrösten, bis es leicht Farbe nimmt.', 'Kümmel und den geriebenen Apfel dazu, mit Wasser aufgießen.', 'Zugedeckt 20 Minuten dünsten, ab und zu umrühren.', 'Mit Salz, Pfeffer und einem Schuss Essig abschmecken.'],
      tip: 'Passt wunderbar zu Erdäpfelpuffern oder Knödeln.',
      game: ['oel', 'zwiebel', 'kraut', 'wasser', 'kuemmel', 'salz']
    },
    {
      name: 'Rote-Rüben-Suppe', tag: 'Tiefrot, erdig, frisch mit Zitrone', icons: ['rueben', 'kartoffeln', 'zwiebel'],
      serves: 4, time: '40 Min', months: [9, 10, 11, 12, 1, 2, 3],
      items: ['500 g Rote Rüben', '1 Erdapfel', '1 Zwiebel', '1 EL Öl', '1 l Wasser', '½ TL Kümmel', 'Salz, Saft einer halben Zitrone', 'Frische Kräuter, nach Lust etwas Kren'],
      steps: ['Zwiebel würfeln und im Öl glasig anschwitzen.', 'Rote Rüben und Erdapfel schälen und würfeln. Tipp: Handschuhe anziehen, die Farbe hält.', 'Mitrösten, Kümmel dazu, mit Wasser aufgießen.', '25 Minuten köcheln, bis alles weich ist.', 'Pürieren, mit Salz und Zitrone abschmecken, Kräuter drüber.'],
      tip: 'Ein Löffel geriebener Kren obendrauf macht sie richtig wienerisch.',
      game: ['oel', 'zwiebel', 'rueben', 'kartoffeln', 'wasser', 'kuemmel', 'salz', 'zitrone']
    },
    {
      name: 'Brotsuppe', tag: 'Aus altem Brot wird ein Festessen', icons: ['brot', 'zwiebel', 'knoblauch'],
      serves: 4, time: '25 Min', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      items: ['200 g altes Brot', '1 Zwiebel', '2 Knoblauchzehen', '2 EL Öl', '1 l Wasser oder Gemüsebrühe', '½ TL Kümmel, 1 TL Majoran', 'Salz, Pfeffer', 'Schnittlauch'],
      steps: ['Brot in kleine Würfel schneiden. Die Hälfte davon im Öl knusprig anrösten und zur Seite stellen.', 'Im selben Topf Zwiebel glasig anschwitzen, dann kurz den Knoblauch mit.', 'Das restliche Brot, Kümmel und Wasser dazugeben, 10 Minuten köcheln.', 'Grob pürieren oder einfach verrühren, mit Majoran, Salz und Pfeffer abschmecken.', 'Mit den knusprigen Brotwürfeln und Schnittlauch servieren.'],
      tip: 'Je älter das Brot, desto besser saugt es die Suppe auf.',
      game: ['oel', 'zwiebel', 'knoblauch', 'brot', 'wasser', 'kuemmel', 'salz', 'majoran']
    },
    {
      name: 'Veganer Scheiterhaufen', tag: 'Die beste Nachspeis aus altem Brot', icons: ['brot', 'aepfel'],
      serves: 4, time: '55 Min', months: [8, 9, 10, 11, 12, 1, 2, 3, 4],
      items: ['300 g altes Brot oder Semmeln', '4 Äpfel', '400 ml Hafer- oder Sojamilch', '2 EL Zucker', '1 EL Speisestärke', '1 TL Zimt', 'Etwas Öl oder Margarine für die Form'],
      steps: ['Backrohr auf 180 °C vorheizen, eine Form einfetten.', 'Brot in dünne Scheiben schneiden, Äpfel entkernen und dünn schneiden.', 'Milch, Zucker, Stärke und Zimt verrühren.', 'Brot und Äpfel abwechselnd in die Form schichten und die Milch darübergießen. 10 Minuten ziehen lassen.', '35 bis 40 Minuten backen, bis es oben goldbraun ist.'],
      tip: 'Ein paar Rosinen oder Nüsse zwischen den Schichten machen ihn festlich.',
      game: ['oel', 'brot', 'aepfel', 'zimt', 'zitrone']
    },
    {
      name: 'Zwetschkenröster', tag: 'Fruchtig, schnell, zu allem gut', icons: ['zwetschken'],
      serves: 4, time: '20 Min', months: [8, 9, 10],
      items: ['500 g Zwetschken', '2 EL Zucker', '1 Zimtstange oder ½ TL Zimt', '100 ml Wasser', 'Ein Spritzer Zitrone'],
      steps: ['Zwetschken halbieren und entkernen.', 'Zucker in einem Topf leicht schmelzen lassen, mit Wasser ablöschen.', 'Zwetschken und Zimt dazugeben.', 'Bei kleiner Hitze 10 bis 15 Minuten köcheln, bis die Früchte weich sind, aber noch Form haben.', 'Mit Zitrone abschmecken, warm oder kalt servieren.'],
      tip: 'Hält im Glas gut eine Woche und passt zu Kaiserschmarrn, Porridge oder Scheiterhaufen.',
      game: ['zwetschken', 'zimt', 'wasser', 'zitrone']
    }
  ];

  function renderBook() {
    const box = $('recipebook');
    if (!box) return;
    const mo = new Date().getMonth() + 1;
    const list = RECIPES.slice().sort((a, b) => (b.months.includes(mo) && b.months.length < 12) - (a.months.includes(mo) && a.months.length < 12));
    box.innerHTML = '';
    list.forEach((r) => {
      const card = document.createElement('details');
      card.className = 'rcard';
      const sum = document.createElement('summary');
      const icons = document.createElement('span');
      icons.className = 'r-icons';
      icons.innerHTML = r.icons.map((id) => `<svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">${ICONS[id] || ''}</svg>`).join('');
      const txt = document.createElement('span');
      txt.className = 'r-txt';
      const t = document.createElement('strong'); t.textContent = r.name;
      const tg = document.createElement('span'); tg.className = 'r-tag'; tg.textContent = r.tag;
      txt.append(t, tg);
      const meta = document.createElement('span');
      meta.className = 'r-meta';
      meta.textContent = r.serves + ' Portionen · ' + r.time;
      if (r.months.includes(mo) && r.months.length < 12) {
        const s = document.createElement('span'); s.className = 'r-season'; s.textContent = 'Jetzt Saison';
        meta.append(s);
      }
      sum.append(icons, txt, meta);
      const body = document.createElement('div');
      body.className = 'r-body';
      const h1 = document.createElement('p'); h1.className = 'r-h'; h1.textContent = 'Du brauchst';
      const ul = document.createElement('ul'); ul.className = 'r-items';
      r.items.forEach((i) => { const li = document.createElement('li'); li.textContent = i; ul.append(li); });
      const h2 = document.createElement('p'); h2.className = 'r-h'; h2.textContent = 'So geht’s';
      const ol = document.createElement('ol'); ol.className = 'r-steps';
      r.steps.forEach((s) => { const li = document.createElement('li'); li.textContent = s; ol.append(li); });
      const tip = document.createElement('p'); tip.className = 'r-tip'; tip.textContent = 'Tipp: ' + r.tip;
      const g = document.createElement('p'); g.className = 'r-game';
      const gb = document.createElement('strong'); gb.textContent = 'Im Spiel: ';
      g.append(gb, document.createTextNode(r.game.map(NAME).join(' → ')));
      body.append(h1, ul, h2, ol, tip, g);
      card.append(sum, body);
      box.append(card);
    });
  }

  function addRecipe(name, steps) {
    const book = $('recipes');
    const empty = book.querySelector('.empty');
    if (empty) empty.remove();
    const d = document.createElement('details');
    d.open = true;
    book.querySelectorAll('details').forEach((x) => { x.open = false; });
    const s = document.createElement('summary');
    s.textContent = name + ' nach Leolitta';
    const ol = document.createElement('ol');
    steps.forEach(([id, why]) => {
      const li = document.createElement('li');
      const b = document.createElement('strong'); b.textContent = NAME(id) + ': ';
      li.append(b, document.createTextNode(why));
      ol.append(li);
    });
    d.append(s, ol);
    book.prepend(d);
  }

  function earnJoker(who, reason) {
    S.jk[who] += 1;
    syncButtons();
    const name = { leolita: 'Leolitta', nif: 'Nif' }[who];
    toast(name + ' hat wieder Zeit!', reason + ' Du kannst ' + (who === 'leolita' ? 'sie' : 'ihn') + ' noch einmal rufen.');
  }

  // ---------------------------------------------------------------
  // Die echte Crew als Joker: Nif (Kräutertee)
  // ---------------------------------------------------------------
  const NIF_HELLO = ['Atmet’s durch. Die Melisse macht des eh.', 'A Tasse Kräutertee für jeden. Ganz ohne Eile.', 'Kamille fürs Gemüt, Pfefferminz für den Kopf.'];
  const NIF_POUR = ['Für di. Riech amoi.', 'Langsam trinken, gell.', 'Spürst es? Die Ruhe kommt von selber.'];
  const NIF_BYE = ['Wer wartet, hat schon gewonnen. Servus.', 'Die Kräuter wachsen eh überall, man muss nur hinschauen.'];
  const CALM_LINES = ['Mmh, der Tee ... i hab gar keine Erwartungen mehr.', 'Alles is, wie’s is. Und des is guat.', 'Schlange? Welche Schlange? I bin a Blatt im Wind.', 'I spür mei Grätzl atmen.', 'Oy, so leicht war mir seit Jahren ned.'];

  function walkTo(el, x, ms) {
    el.style.transition = `transform ${ms || 1600}ms ease-in-out`;
    el.style.transform = `translate(${x}px, 476px)`;
    el.classList.add('walking');
    clearTimeout(el._w);
    el._w = setTimeout(() => el.classList.remove('walking'), ms || 1600);
    return wait(ms || 1600);
  }

  function bikeTo(x, ms) {
    const bk = $('nifbike');
    bk.style.transition = `transform ${ms}ms cubic-bezier(.3,.6,.4,1)`;
    bk.style.transform = `translate(${x}px, 414px)`;
    bk.classList.add('rolling');
    clearTimeout(bk._r);
    bk._r = setTimeout(() => bk.classList.remove('rolling'), ms);
    return wait(ms);
  }
  async function callNif() {
    if (S.phase !== 'play' || S.jk.nif <= 0 || S.calmUntil > S.elapsed || S.nifBusy) return;
    S.jk.nif -= 1;
    S.nifBusy = true;
    syncButtons();
    const nf = $('nif');
    // Nif radelt mit seiner Teeküche herein
    await bikeTo(700, 2800);
    $('nif-rider').setAttribute('opacity', '0');
    nf.style.transition = 'none';
    nf.style.transform = 'translate(705px, 476px)';
    void nf.getBBox();
    say(705, 360, pick(NIF_HELLO), 3400, 'Nif');
    await wait(900);
    S.calmUntil = S.elapsed + 60;
    $('queue').classList.add('calm');
    $('leaves').setAttribute('opacity', '1');
    updateHud();
    const list = S.queue.slice();
    const teaServed = [];
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      if (!n.el.isConnected || !S.queue.includes(n)) continue;
      await walkTo(nf, n.x + 34, 500);
      const cup = n.el.querySelector('.cup');
      if (cup) cup.setAttribute('opacity', '1');
      if (n.wish === 'wasser') teaServed.push(n);
      const zen = n.el.querySelector('.zen');
      if (zen) zen.setAttribute('opacity', '1');
      if (i === 1) say(n.x + 30, 360, pick(NIF_POUR), 2400, 'Nif', { low: true });
      if (i === 2) setTimeout(() => { if (n.el.isConnected) say(n.x, QY - 162, pick(CALM_LINES), 3200, n.name, { low: true }); }, 500);
    }
    if (teaServed.length) { feedList(teaServed, 3, true); addScore(teaServed.length * 25); }
    toast('Tee-Ruhe für eine Minute!', teaServed.length ? `${teaServed.length} Durstige sind versorgt, und alle anderen schweben ohne Erwartungen.` : 'Die Leute schweben ohne Erwartungen, und es kommen weniger nach.');
    await wait(800);
    say(Math.min(1100, (S.queue.length ? S.queue[S.queue.length - 1].x : 600) + 30), 360, pick(NIF_BYE), 3200, 'Nif');
    await wait(1200);
    await walkTo(nf, 705, 1600);
    nf.style.transition = 'none';
    nf.style.transform = 'translate(-300px, 476px)';
    $('nif-rider').setAttribute('opacity', '1');
    S.nifBusy = false;
    syncButtons();
  }
  function calmTick() {
    if (S.calmUntil && S.elapsed >= S.calmUntil) {
      S.calmUntil = 0;
      $('queue').classList.remove('calm');
      $('leaves').setAttribute('opacity', '0');
      document.querySelectorAll('#queue .zen').forEach((z) => z.setAttribute('opacity', '0'));
      toast('Der Tee ist ausgetrunken.', 'Die Leute landen wieder im Hier und Jetzt.');
      if (!S.nifBusy) bikeTo(1450, 3000);
    }
  }

  function feedList(list, spoons, handed) {
    const fed = list.filter((n) => S.queue.includes(n));
    fed.forEach((n) => S.queue.splice(S.queue.indexOf(n), 1));
    fed.forEach((n, i) => {
      if (n.wish !== 'egal') S.wishHits += 1;
      const wg = n.el.querySelector('.wish'); if (wg) wg.setAttribute('opacity', '0');
      n.el.querySelector('.bowl').setAttribute('opacity', '1');
      if (!handed && i === 0 && Math.random() < 0.6) setTimeout(() => say(n.x, QY - 162, pick(LINES[n.humor]['r' + spoons]), 4000, n.name, { low: true }), 200);
      n.leaveT = 0.4 + i * 0.35;
      n.ty = rand(500, 540);
      n.tx = rand(QX0 + 40, 1180);
      S.leaving.push(n);
    });
    S.served += fed.length;
    if (Math.floor(S.served / 7) > (S.nifMark || 0)) { S.nifMark = Math.floor(S.served / 7); earnJoker('nif', S.served + ' Nachbarn versorgt!'); }
    layoutQueue();
    updateHud();
  }

  function addScore(n) {
    S.score += n;
    if (S.score > best) { best = S.score; try { localStorage.setItem('rk-best', String(best)); } catch (e) { /* egal */ } }
    updateHud();
  }

  // ----- Pflanzen -----
  const FLOWERS = ['loewenzahn', 'sonnenblume', 'kornblume', 'mohn', 'margerite', 'salbei'];
  const FLOWER_NAME = { loewenzahn: 'Löwenzahn', sonnenblume: 'Sonnenblume', kornblume: 'Kornblume', mohn: 'Klatschmohn', margerite: 'Margerite', salbei: 'Wiesen-Salbei' };
  function flowerMarkup(kind, h) {
    const stem = `<path d="M0 0 Q-3 ${-h / 2} 0 ${-h}" stroke="#4E7A45" stroke-width="2.6" fill="none" stroke-linecap="round"></path><path d="M0 ${-h * 0.4} Q9 ${-h * 0.58} 11 ${-h * 0.36} Q4 ${-h * 0.3} 0 ${-h * 0.4} Z" fill="#6E9A5F"></path>`;
    const heads = {
      loewenzahn: `<circle cx="0" cy="${-h}" r="6.5" fill="#F5C518" stroke="#D9A400" stroke-width="3" stroke-dasharray="2 1.5"></circle>`,
      sonnenblume: `<circle cx="0" cy="${-h}" r="11" fill="#F2B530" stroke="#D9901A" stroke-width="4.5" stroke-dasharray="3.2 2"></circle><circle cx="0" cy="${-h}" r="5" fill="#6B4A32"></circle>`,
      kornblume: `<circle cx="0" cy="${-h}" r="6.5" fill="#3C6FD1" stroke="#2A4FA8" stroke-width="3" stroke-dasharray="2.4 1.4"></circle><circle cx="0" cy="${-h}" r="2" fill="#23285E"></circle>`,
      mohn: `<circle cx="0" cy="${-h}" r="8" fill="#D7322B"></circle><circle cx="0" cy="${-h}" r="2.3" fill="#2B1D17"></circle>`,
      margerite: `<circle cx="0" cy="${-h}" r="8" fill="#FFFFFF" stroke="#D8D1C4" stroke-width="3" stroke-dasharray="2 1.5"></circle><circle cx="0" cy="${-h}" r="3.2" fill="#F2B530"></circle>`,
      salbei: `<ellipse cx="0" cy="${-h - 6}" rx="3" ry="2.6" fill="#9A7BD0"></ellipse><ellipse cx="0" cy="${-h}" rx="3.8" ry="3.2" fill="#7B5BB5"></ellipse><ellipse cx="0" cy="${-h + 7}" rx="3.8" ry="3.2" fill="#7B5BB5"></ellipse>`
    };
    return `<g class="grow"><g class="sway" style="animation-delay:${rand(-3, 0).toFixed(2)}s">${stem}${heads[kind]}</g></g>`;
  }
  let flowerTurn = 0;
  // ---------------------------------------------------------------
  // Das Grätzl wächst bleibend: Blumen, Dächer und Schmuck bleiben
  // ---------------------------------------------------------------
  const MILESTONES = [
    { at: 15, id: 'deco-bunting', title: 'Wimpel über der Straße!', sub: 'Dein Grätzl feiert: 15 Blumen blühen schon.' },
    { at: 35, id: 'deco-bench', title: 'Ein Bankerl zum Plaudern!', sub: '35 Blumen. Jetzt bleiben die Leute auch sitzen.' },
    { at: 60, id: 'deco-market', title: 'Ein Marktstand!', sub: '60 Blumen. Nachbarn verkaufen jetzt Selbstgemachtes.' },
    { at: 100, id: 'deco-sign', title: 'Begegnungszone!', sub: '100 Blumen. Aus der Straße ist ein Dorfplatz geworden.' }
  ];
  let G = { meadow: [], roof: [], green: [false, false, false, false], seen: [] };
  try { const raw = localStorage.getItem('rk-graetzl'); if (raw) G = Object.assign(G, JSON.parse(raw)); } catch (e) { /* frisch */ }
  function saveG() { try { localStorage.setItem('rk-graetzl', JSON.stringify(G)); } catch (e) { /* egal */ } }
  function totalFlowers() { return G.meadow.length + G.roof.length; }
  function roofTuft(px, ry, animate) {
    plantLayer.appendChild(mk('path', { d: `M${px - 9} ${ry + 1} Q${px - 4} ${ry - 7} ${px} ${ry + 1} Q${px + 4} ${ry - 8} ${px + 9} ${ry + 1} Z`, fill: '#7FA36F', class: animate ? 'grow' : '' }));
  }
  function updateGrowth(announce) {
    const t = totalFlowers();
    $('meadow').setAttribute('opacity', String(Math.min(1, G.meadow.length / 22)));
    if (t >= 8) $('tree1').classList.add('grown');
    if (t >= 18) $('tree2').classList.add('grown');
    MILESTONES.forEach((m) => {
      const el = $(m.id);
      if (!el) return;
      const on = t >= m.at || (m.id === 'deco-sign' && G.green.every(Boolean) && t >= 60);
      el.setAttribute('opacity', on ? '1' : '0');
      if (on && !G.seen.includes(m.id)) {
        G.seen.push(m.id); saveG();
        if (announce) { toast(m.title, m.sub); Music.sfx('ding'); }
      }
    });
  }
  function restoreGraetzl() {
    G.meadow.forEach(([x, y, k]) => placeFlower(x, y, 1, k, true));
    G.roof.forEach(([i, px, k]) => { const ry = HOUSES[i].roof(px); roofTuft(px, ry, false); placeFlower(px, ry, 0.75, k, true); });
    G.green.forEach((g, i) => { if (g) greenHouse(i); });
    S.roofs = [0, 1, 2, 3].map((i) => G.roof.filter((r) => r[0] === i).length);
    S.green = G.green.slice();
    updateGrowth(false);
    syncBees(true);
  }
  function grStats() {
    const t = totalFlowers(), gh = G.green.filter(Boolean).length;
    return t ? `Dein Grätzl: ${t} Blumen, ${gh} ${gh === 1 ? 'grünes Haus' : 'grüne Häuser'}.` : 'Dein Grätzl ist noch grau. Mit jedem guten Gericht bekommst du Samen, und alles, was du pflanzt, bleibt stehen.';
  }

  function placeFlower(x, y, scale, kind0, still) {
    const kind = kind0 || FLOWERS[flowerTurn++ % FLOWERS.length];
    const h = (kind === 'sonnenblume' ? 49 : 27) * scale + (still ? 0 : rand(-5, 5));
    const g = mk('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})` });
    g.innerHTML = flowerMarkup(kind, h / scale);
    if (still) { const gg = g.querySelector('.grow'); if (gg) gg.classList.remove('grow'); }
    plantLayer.appendChild(g);
    S.targets.push([x, y - h]);
    return kind;
  }
  function afterFlower() {
    S.flowers += 1;
    S.seeds -= 1;
    addScore(10);
    if (S.flowers % 10 === 0) earnJoker('nif', '10 neue Blumen, Nif hat frische Kräuter!');
    updateGrowth(true);
    if (S.flowers === 1 && totalFlowers() < 3) toast('Die erste Blume!', 'Blumen locken Hummeln an, und ein blühendes Grätzl spricht sich herum.');
    syncBees();
    updateHud();
  }
  function houseAt(x, y) {
    for (let i = 0; i < HOUSES.length; i++) {
      const hs = HOUSES[i];
      if (x >= hs.x - 12 && x <= hs.x + hs.w + 12 && y <= hs.y + hs.h && y >= hs.roof(Math.max(hs.x0, Math.min(hs.x1, x))) - 30) return i;
    }
    return -1;
  }
  function greenHouse(i) {
    const hs = HOUSES[i];
    const g = mk('g', { class: 'fade-in' });
    let parts = '';
    [hs.x + 4, hs.x + hs.w - 4].forEach((vx, side) => {
      let d = `M${vx} ${hs.y + 6}`;
      for (let yy = hs.y + 6; yy < hs.y + hs.h; yy += 18) d += ` Q${vx + (side ? -8 : 8)} ${yy + 9} ${vx} ${yy + 18}`;
      parts += `<path d="${d}" fill="none" stroke="#4E7A45" stroke-width="3"></path>`;
      for (let yy = hs.y + 14; yy < hs.y + hs.h - 4; yy += 16) parts += `<ellipse cx="${vx + (side ? -5 : 5)}" cy="${yy}" rx="6" ry="4" fill="${yy % 32 < 16 ? '#7FA36F' : '#5E7F5A'}"></ellipse>`;
    });
    hs.windows.forEach(([wx, wy, ww, wh]) => {
      parts += `<rect x="${wx - 3}" y="${wy + wh - 2}" width="${ww + 6}" height="8" rx="2" fill="#A85E2B"></rect>`;
      for (let k = 0; k < 4; k++) parts += `<circle cx="${(wx + 4 + k * (ww - 8) / 3).toFixed(1)}" cy="${wy + wh - 5}" r="4" fill="${['#D7322B', '#F5C518', '#3C6FD1', '#FFFFFF'][(k + i) % 4]}"></circle>`;
    });
    g.innerHTML = parts;
    ivyLayer.appendChild(g);
  }
  function plantAt(x, y) {
    if (S.phase !== 'play' || S.paused) return;
    if (S.seeds <= 0) { toast('Keine Samen mehr.', 'Koch ein gutes Gericht, dann gibt es neue.'); return; }
    if (y >= 486) {
      if (G.meadow.length >= 140) { toast('Die Wiese ist voll. So viel Leben!', 'Pflanz auf den Dächern weiter.'); return; }
      const yy = Math.min(552, Math.max(496, y));
      const k = placeFlower(x, yy, 1);
      G.meadow.push([Math.round(x), Math.round(yy), k]); saveG();
      afterFlower();
      return;
    }
    const i = houseAt(x, y);
    if (i >= 0) {
      if (S.roofs[i] >= 10) { toast('Dieses Dach ist schon ein Garten!', 'Such dir ein anderes Haus.'); return; }
      const hs = HOUSES[i];
      const px = Math.max(hs.x0, Math.min(hs.x1, x + rand(-6, 6)));
      const ry = hs.roof(px);
      roofTuft(px, ry, true);
      const k = placeFlower(px, ry, 0.75);
      G.roof.push([i, Math.round(px), k]);
      S.roofs[i] += 1;
      afterFlower();
      if (S.roofs[i] >= 4 && !S.green[i]) {
        S.green[i] = true;
        G.green[i] = true;
        greenHouse(i);
        addScore(50);
        toast('Ein Haus wird grün! +50', 'Efeu klettert hoch, und vor den Fenstern blüht es. Und es bleibt grün!');
      }
      saveG();
      updateGrowth(true);
      return;
    }
    if (y >= 410) toast('Pflanz auf der Wiese vorne oder auf einem Haus.', 'Auf der Fahrbahn stehen die Nachbarn an.');
    else toast('Klick auf die Wiese vorne oder auf ein Haus.', 'Im Himmel wächst leider nichts.');
  }
  function neighborAt(x, y) {
    return S.queue.find((n) => Math.abs(n.x - x) < 28 && y > QY - 155 && y < QY + 8);
  }
  async function giveDirect(n) {
    if (S.handing || S.busy) { toast('Moment, der Captain hat grad die Hände voll.'); return; }
    const w = n.wish;
    if (w === 'fleisch') { toast('Fleisch gibt’s bei der Radküche ned.', 'Leolitta kommt gleich und redet mit ' + n.name + '.'); return; }
    if (!WISH[w].direct) {
      toast(n.name + ' möchte ' + WISH[w].label + '.', w === 'egal' ? 'Koch irgendwas Gutes, dann bekommt ' + n.name + ' davon.' : 'Das muss man kochen: Zutaten in den Topf und abschmecken.');
      return;
    }
    let color = '#9CC7DF';
    if (w === 'brot') {
      if (!S.crate.brot) { toast('Kein Brot in der Kiste.', 'Schick Jakob auf Rettungstour!'); return; }
      S.crate.brot -= 1; if (S.crate.brot <= 0) delete S.crate.brot; color = '#C8925A';
    }
    if (w === 'obst') {
      const f = Object.keys(S.crate).find((id) => ING[id].type === 'fruit');
      if (!f) { toast('Kein Obst in der Kiste.', 'Schick Jakob auf Rettungstour!'); return; }
      S.crate[f] -= 1; if (S.crate[f] <= 0) delete S.crate[f]; color = ING[f].color;
    }
    renderCrate();
    S.handing = true;
    Music.sfx('plop');
    await handOver(n, color);
    S.givenDirect += 1;
    feedList([n], 3, true);
    addScore(25);
    say(n.x, QY - 162, pick(WISH_HAPPY), 3200, n.name);
    S.handing = false;
    updateHud();
  }
  svg.addEventListener('click', (e) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (S.phase === 'play' && !S.paused) {
      const n = neighborAt(loc.x, loc.y);
      if (n) { giveDirect(n); return; }
    }
    plantAt(loc.x, loc.y);
  });

  // ----- Hummeln -----
  function makeBee() {
    const g = mk('g', {});
    g.innerHTML = '<ellipse class="wing" cx="-3" cy="-6" rx="5" ry="3.6" fill="#FFFFFF" opacity=".9"></ellipse><ellipse class="wing" cx="4" cy="-6" rx="5" ry="3.6" fill="#FFFFFF" opacity=".9"></ellipse><ellipse cx="0" cy="0" rx="8" ry="6" fill="#F2B530" stroke="#3B2A1E" stroke-width="1.6"></ellipse><path d="M-2 -5.5 L-2 5.5 M3 -5 L3 5" stroke="#3B2A1E" stroke-width="2.2"></path>';
    beeLayer.appendChild(g);
    return { el: g, x: Math.random() < 0.5 ? -20 : 1220, y: rand(180, 380), tx: 600, ty: 300, wait: 0, speed: rand(70, 120), phase: rand(0, 6), face: 1 };
  }
  function beeTarget(b) {
    const t = S.targets.length ? pick(S.targets) : [rand(60, 1140), rand(490, 540)];
    b.tx = t[0] + rand(-4, 4); b.ty = t[1] - 8;
  }
  function syncBees(silent) {
    const want = Math.min(36, Math.floor(totalFlowers() / 2));
    while (S.bees.length < want) {
      const b = makeBee(); beeTarget(b); S.bees.push(b);
      if (silent) continue;
      addScore(5);
      if (S.bees.length === 1) setTimeout(() => toast('Die erste Hummel ist da!', 'Je mehr Blumen, desto mehr Hummeln.'), 1200);
    }
  }

  // ----- Hauptschleife -----
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const running = S.phase === 'play' && !S.paused;

    if (running) {
      S.elapsed += dt;
      if (S.elapsed >= ROUND) { timeUp(); }
      if (!S.warned && ROUND - S.elapsed < 30) { S.warned = true; toast('Noch 30 Sekunden!', 'Schnell, wer noch was will?'); say(342, 330, 'Endspurt, Crew!', 2600, 'Captain Dave'); }
      // Neue Nachbarn: am Anfang gemütlich. Je mehr versorgt sind und je mehr blüht,
      // desto mehr spricht es sich im Grätzl herum, und desto schneller kommen Leute.
      S.spawnIn -= dt;
      if (S.spawnIn <= 0) {
        spawnNeighbor();
        const buzz = S.served * 0.4 + S.flowers * 0.12 + S.elapsed * 0.01;
        const gap = Math.max(4.2, 12.5 - buzz);
        S.spawnIn = (gap + rand(-1, 1)) * (S.calmUntil > S.elapsed ? 2 : 1);
        if (gap < 10.5 && !S.buzz1) { S.buzz1 = true; toast('Es spricht sich herum im Grätzl!', 'Dein gutes Essen lockt immer mehr Leute an.'); say(60, 340, 'Captain, des spricht si herum! Es kommen immer mehr!', 3600, 'Rolf'); }
        if (gap < 7 && !S.buzz2) { S.buzz2 = true; toast('Jetzt is richtig was los!', 'Das halbe Grätzl steht schon an.'); say(342, 330, 'Volle Kraft voraus, Crew!', 3200, 'Captain Dave'); }
      }
      // Rettungstour mit Jakob
      if (S.refilling > 0) { S.refilling -= dt; jakobTick(); }
      calmTick();
      // Rolf unterhält die Leute
      S.banterIn -= dt;
      if (S.banterIn <= 0) { banter(); S.banterIn = rand(18, 28); }
      // Ungeduld
      S.queue.forEach((n, i) => {
        n.waited += dt;
        if (!n.gaveUp && !n.inDebate && n.wish !== 'egal' && n.wish !== 'fleisch' && n.waited > 50) {
          n.gaveUp = true; n.wish = 'egal'; renderWish(n);
          n.bubble = say(n.x, QY - 162, pick(GIVE_UP), 3400, n.name, { low: true, xf: () => n.x });
        }
        if (!n.talkedWait && n.waited > 16 + i * 2 && Math.random() < 0.004) { n.talkedWait = true; if (S.calmUntil > S.elapsed) { if (performance.now() - lastTalk > 3500) { lastTalk = performance.now(); n.bubble = say(n.x, QY - 162, pick(CALM_LINES), 4200, n.name, { low: true, xf: () => n.x }); } } else maybeSay(n, 'wait'); }
      });
    }

    // Leolittas Festtruthahn: nach 3 überzeugten Fleischessern oder als Rettung in der Not
    if (running && !S.leoBusy && !S.busy && !S.handing) {
      if (S.converted - (S.feastMark || 0) >= 3) { S.feastMark = S.converted; feast('reward'); }
      else if (!S.rescueTried && !S.rescueDone && S.queue.length >= QUEUE_MAX - 2) { S.rescueTried = true; if (Math.random() < 0.5) { S.rescueDone = true; feast('rescue'); } }
    }
    if (running && S.rescueTried && S.queue.length <= QUEUE_MAX - 5) S.rescueTried = false;

    // Leolitta geht zu Fleisch-Wünschen
    if (running && !S.leoBusy && !S.busy && S.elapsed > (S.nextDebate || 0)) {
      const meat = S.queue.find((n) => n.wish === 'fleisch' && Math.abs(n.tx - n.x) < 2 && n.waited > 3);
      if (meat) debate(meat);
    }

    // Warmgehaltene Portionen an die Ersten in der Schlange
    if (running && S.warm.length && !S.handing && !S.busy) {
      S.warmT = (S.warmT || 0) + dt;
      if (S.warmT > 0.8) {
        S.warmT = 0;
        let hit = null, wi = -1;
        for (const n of S.queue) {
          if (Math.abs(n.tx - n.x) > 2) continue;
          wi = S.warm.findIndex((w) => w.cats.has(n.wish));
          if (wi >= 0) { hit = n; break; }
        }
        if (hit) {
          const portion = S.warm.splice(wi, 1)[0];
          S.handing = true;
          handOver(hit, portion.color).then(() => {
            feedList([hit], 2, false);
            addScore(hit.wish !== 'egal' ? 30 : 10);
            S.handing = false;
            updateHud();
          });
        }
      }
    }

    // Bewegung der Nachbarn
    S.queue.forEach((n) => {
      const d = n.tx - n.x;
      const moving = Math.abs(d) > 1;
      if (moving) n.x += Math.sign(d) * Math.min(Math.abs(d), 150 * dt);
      n.el.setAttribute('transform', `translate(${n.x.toFixed(1)} ${QY})`);
      n.el.firstChild.classList.toggle('walk-bob', moving && !reduceMotion);
      if (n.bubble && n.bubble.isConnected) {
        const boxW = bubbles.clientWidth, bw = n.bubble.offsetWidth;
        n.bubble.style.left = Math.max(bw / 2 + 4, Math.min(boxW - bw / 2 - 4, n.x / 1200 * boxW)) + 'px';
      }
    });
    S.leaving = S.leaving.filter((n) => {
      if (n.leaveT > 0) { n.leaveT -= dt; n.el.setAttribute('transform', `translate(${n.x.toFixed(1)} ${QY})`); return true; }
      n.y = n.y === undefined ? QY : n.y;
      n.x += (n.tx - n.x) * Math.min(1, dt * 1.4);
      n.y += (n.ty - n.y) * Math.min(1, dt * 1.4);
      n.fade = (n.fade === undefined ? 1 : n.fade) - dt * 0.35;
      n.el.setAttribute('transform', `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`);
      n.el.setAttribute('opacity', Math.max(0, n.fade).toFixed(2));
      n.el.firstChild.classList.toggle('walk-bob', !reduceMotion);
      if (n.fade <= 0) { n.el.remove(); return false; }
      return true;
    });

    // Hummeln
    for (const b of S.bees) {
      if (b.wait > 0) { b.wait -= dt; if (b.wait <= 0) beeTarget(b); }
      else {
        const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy);
        if (d < 4) b.wait = rand(0.8, 2.2);
        else { const s = Math.min(d, b.speed * dt); b.x += dx / d * s; b.y += dy / d * s; if (Math.abs(dx) > 1) b.face = dx > 0 ? 1 : -1; }
      }
      const wob = reduceMotion ? 0 : Math.sin(now / 130 + b.phase) * 2.5;
      b.el.setAttribute('transform', `translate(${b.x.toFixed(1)} ${(b.y + wob).toFixed(1)}) scale(${b.face} 1)`);
    }

    if (running) { $('m-time').textContent = fmtTime(ROUND - S.elapsed); updateQueueBar(); if (S.calmUntil) { const c = Math.max(0, Math.ceil(S.calmUntil - S.elapsed)); $('m-calm').hidden = !c; $('m-calm-s').textContent = c; } }
    requestAnimationFrame(frame);
  }

  function updateQueueBar() {
    const q = S.queue.length;
    const pct = Math.min(100, q / QUEUE_MAX * 100);
    $('m-qfill').style.width = pct + '%';
    $('m-qfill').style.background = pct >= 75 ? '#B8432F' : pct >= 50 ? '#C97B3D' : '#2F5233';
    $('m-qbar').setAttribute('aria-valuenow', String(q));
    Music.setTempo(120 + q * 3);
  }
  function updateHud() {
    $('m-served').textContent = S.served;
    $('m-time').textContent = fmtTime(ROUND - (S.elapsed || 0));
    $('m-seeds').textContent = S.seeds;
    $('m-warm').textContent = S.warm.length;
    $('m-flowers').textContent = S.flowers;
    $('m-bees').textContent = S.bees.length;
    $('m-score').textContent = S.score;
    const calmLeft = Math.max(0, Math.ceil((S.calmUntil || 0) - S.elapsed));
    $('m-calm').hidden = !calmLeft;
    $('m-calm-s').textContent = calmLeft;
    $('best').textContent = best;
    svg.classList.toggle('planting', S.seeds > 0 && S.phase === 'play');
    updateQueueBar();
  }

  // ----- Ablauf: Intro, Spiel, Ende -----
  function intro() {
    const k = $('kitchen');
    const cap = $('captain');
    const aw = $('awning');
    $('overlay').hidden = true;
    S.phase = 'intro';
    syncButtons();
    k.classList.add('rolling');
    requestAnimationFrame(() => { k.style.transform = 'translateX(40px)'; });
    const T = reduceMotion ? 0.15 : 1;
    setTimeout(() => {
      k.classList.remove('rolling');
      $('rider').style.opacity = '0';
      cap.classList.add('hop');
    }, 2700 * T);
    setTimeout(() => { aw.classList.add('open'); }, 3500 * T);
    setTimeout(() => {
      $('mira').style.transform = 'translateX(0px)';
      $('jakob').classList.add('rolling');
      jakobAt(170);
    }, 1200 * T);
    setTimeout(() => { $('jakob').classList.remove('rolling'); }, 3700 * T);
    setTimeout(() => { say(60, 340, 'Ahoi! I bin da Rolf, da Smutje auf dem Radschiff. I schnippel heut für euch!', 3200, 'Rolf'); }, 6200 * T);
    setTimeout(() => { $('flame').setAttribute('opacity', '1'); }, 4400 * T);
    setTimeout(() => { $('steam').setAttribute('opacity', '1'); say(342, 330, pick(CAPTAIN_LINES), 3200, 'Captain Dave'); }, 5000 * T);
    setTimeout(() => {
      S.phase = 'play';
      S.spawnIn = 2.5;
      syncButtons();
      toast('Die Radküche ist offen!', 'Tipp unten Zutaten an, sie fliegen direkt in den Topf. Dann „Abschmecken“.');
    }, 5600 * T);
  }

  function endScreen(kicker, title, body, crew) {
    S.phase = 'over';
    syncButtons();
    $('ov-kicker').textContent = kicker;
    $('ov-title').textContent = title;
    const b = $('ov-body');
    b.innerHTML = '';
    body.forEach((t) => { const p = document.createElement('p'); p.style.margin = '0 0 8px'; p.textContent = t; b.append(p); });
    $('ov-start').textContent = 'Tageskiste nochmal';
    $('ov-free').textContent = 'Freies Spiel';
    $('ov-crew').hidden = !crew;
    $('ov-share').hidden = !(S.daily && S.lastResult);
    $('ov-graetzl').hidden = true;
    $('overlay').hidden = false;
  }
  let bestServed = 0;
  try { bestServed = Number(localStorage.getItem('rk-best-served') || 0); } catch (e) { bestServed = 0; }
  const MONTHS_L = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const DAY_LABEL = TODAY.getDate() + '. ' + MONTHS_L[TODAY.getMonth()];
  function dayBest() { try { return Number(localStorage.getItem('rk-day-' + DAY_KEY) || 0); } catch (e) { return 0; } }
  function shareResult() {
    const r = S.lastResult || { served: 0, hits: 0 };
    const url = location.href.split('#')[0].split('?')[0];
    const text = `Radküche · Tageskiste ${DAY_LABEL}: ${r.served} Nachbarn versorgt, ${r.hits} Wünsche erfüllt 🍲🌻 Schaffst du mehr?`;
    (async () => {
      try {
        if (navigator.share) { await navigator.share({ title: 'Die Radküche', text, url }); return; }
        await navigator.clipboard.writeText(text + ' ' + url);
        toast('Kopiert!', 'Füg es in WhatsApp, Signal oder wo du magst ein.');
      } catch (e) { toast('Teilen hat gerade nicht geklappt.'); }
    })();
  }
  function timeUp() {
    if (S.phase !== 'play') return;
    Music.stop(); Music.sfx('win');
    S.lastResult = { served: S.served, hits: S.wishHits };
    let dayRec = false;
    if (S.daily && S.served > dayBest()) { dayRec = true; try { localStorage.setItem('rk-day-' + DAY_KEY, String(S.served)); } catch (e) { /* egal */ } }
    const record = S.served > bestServed;
    if (record) { bestServed = S.served; try { localStorage.setItem('rk-best-served', String(bestServed)); } catch (e) { /* egal */ } }
    celebrate();
    endScreen(record ? 'Neuer Rekord!' : 'Feierabend in der Radküche!',
      `${S.served} Nachbarinnen und Nachbarn versorgt.`,
      [`Davon hast du ${S.wishHits} Wünsche genau erfüllt, ${S.converted ? `Leolitta hat ${S.converted} Fleischesser zum Probieren überredet, ` : ''}${S.feasts ? `es gab ${S.feasts === 1 ? 'einen Festtruthahn' : S.feasts + ' Festtruthähne'}, ` : ''}${S.dishes} ${S.dishes === 1 ? 'Gericht' : 'Gerichte'} gekocht und ${S.flowers} Blumen gepflanzt. ${S.bees.length} Hummeln summen jetzt durch die Straße.`,
       S.daily ? `Tageskiste ${DAY_LABEL}: Dein bester Versuch heute: ${dayBest()} Versorgte.${dayRec ? ' Neuer Tagesrekord!' : ''} Morgen gibt’s eine neue Kiste.` : `Dein Rekord: ${bestServed} Versorgte in 5 Minuten. Punkte: ${S.score}.`,
       grStats(),
       record ? 'Des is ka Rekord, des is a Liebeserklärung ans Grätzl!' : 'Schaffst du nächstes Mal mehr? Tipp: Schau, was die meisten wollen, und koch genau das.',
       'Und das Schönste: Das geht auch in echt. Komm in die Crew!'], true);
  }
  function lose() {
    if (S.phase !== 'play') return;
    Music.stop(); Music.sfx('lose');
    const n = S.queue[S.queue.length - 1];
    if (n) say(n.x, QY - 108, pick(LINES.grant.r0), 3000, n.name);
    endScreen('Die Schlange reicht bis ans Ende der Straße.', 'Na servas, des war heut a harter Tag.',
      [`Du hast ${S.served} Nachbarn versorgt, nach ${fmtTime(S.elapsed)} Minuten. Tipp: Schau auf die Wünsche über den Köpfen. Brot, Wasser und Obst gibst du direkt, indem du auf die Person tippst. Und ein Topf Suppe macht alle Suppenfans auf einmal glücklich.`,
       `Deine Punkte: ${S.score}. Dein Rekord: ${best}.`,
       'Aber morgen is a neuer Tag. Und gerettet wird immer.'], false);
  }
  function celebrate() {
    if (reduceMotion) return;
    const box = $('petals');
    const cols = ['#F5C518', '#D7322B', '#3C6FD1', '#FFFFFF', '#7B5BB5', '#F2B530'];
    for (let k = 0; k < 70; k++) {
      const el = document.createElement('span');
      el.className = 'petal';
      el.style.left = rand(0, 100) + '%';
      el.style.background = cols[k % cols.length];
      el.style.animationDelay = rand(0, 1.4).toFixed(2) + 's';
      el.style.setProperty('--dx', rand(-80, 80).toFixed(0) + 'px');
      box.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
  }

  function resetScene() {
    queueLayer.innerHTML = '';
    plantLayer.innerHTML = '';
    ivyLayer.innerHTML = '';
    beeLayer.innerHTML = '';
    clearTalk();
    $('meadow').setAttribute('opacity', '0');
    $('tree1').classList.remove('grown');
    $('tree2').classList.remove('grown');
    const k = $('kitchen');
    k.style.transition = 'none';
    k.style.transform = 'translateX(-480px)';
    void k.getBBox();
    k.style.transition = '';
    $('rider').style.opacity = '1';
    $('captain').classList.remove('hop', 'stir');
    $('awning').classList.remove('open');
    $('flame').setAttribute('opacity', '0');
    $('steam').setAttribute('opacity', '0');
    $('verdict').innerHTML = '<p class="v-empty">Koch dein erstes Gericht, dann sag ich dir ehrlich, wie es geworden ist.</p>';
    $('refill-note').textContent = '';
    $('handplate').setAttribute('opacity', '0');
    $('jurypop').hidden = true;
    const mira = $('mira'); mira.style.transition = 'none'; mira.style.transform = 'translateX(-260px)'; void mira.getBBox(); mira.style.transition = '';
    const jk = $('jakob'); jk.style.transition = 'none'; jakobAt(-420); void jk.getBBox(); jk.style.transition = '';
    $('jakob-load').setAttribute('opacity', '0');
    ['nif'].forEach((id) => { const el = $(id); el.style.transition = 'none'; el.style.transform = 'translate(-300px, 476px)'; });
    const nb = $('nifbike'); nb.style.transition = 'none'; nb.style.transform = 'translate(1450px, 414px)';
    $('nif-rider').setAttribute('opacity', '1');
    $('queue').classList.remove('calm'); $('leaves').setAttribute('opacity', '0');
    $('turkey').setAttribute('opacity', '0');
    $('feastglow').classList.remove('on');
    const ge = $('gerti'); ge.style.transition = 'none'; ge.style.transform = 'translateX(-420px)'; void ge.getBBox(); ge.style.transition = '';
    $('talklog').innerHTML = '<li class="empty">Noch ist es ruhig auf der Straße.</li>';
  }

  function startGame(daily) {
    resetScene();
    S = freshState();
    S.daily = !!daily;
    if (S.daily) { S.crateNo = 0; S.crate = newCrate(dayRng(5000)); }
    restoreGraetzl();
    renderCrate();
    renderPotList();
    renderPotVisual();
    updateHud();
    intro();
  }

  // ----- Knöpfe -----
  function begin(daily) {
    $('overlay').hidden = true;
    enterGame();
    startGame(daily);
    Music.start();
    syncSound();
  }
  $('ov-free').addEventListener('click', () => begin(false));
  $('ov-share').addEventListener('click', shareResult);
  $('ov-reset').addEventListener('click', () => {
    const b = $('ov-reset');
    if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'Wirklich? Alles wird wieder grau. Nochmal tippen'; return; }
    G = { meadow: [], roof: [], green: [false, false, false, false], seen: [] }; saveG();
    plantLayer.innerHTML = ''; ivyLayer.innerHTML = ''; beeLayer.innerHTML = ''; S.bees = []; S.targets = [];
    restoreGraetzl();
    b.textContent = 'Grätzl ist wieder grau. Auf ein Neues!'; delete b.dataset.sure;
    $('ov-graetzl').textContent = grStats();
  });
  $('ov-start').addEventListener('click', () => {
    $('overlay').hidden = true;
    enterGame();
    startGame(true);
    Music.start();
    syncSound();
  });

  // ----- Vollbild-Spielmodus: kein Scrollen mehr -----
  function fitScene() {
    const box = $('scenebox');
    const st = $('stage');
    if (!document.body.classList.contains('game-on')) {
      box.style.width = ''; box.style.height = '';
      st.style.removeProperty('--g'); st.style.removeProperty('--g2');
      return;
    }
    const w = st.clientWidth, hgt = st.clientHeight;
    const bw = Math.min(w, hgt * 1200 / 460);
    const bh = bw * 460 / 1200;
    box.style.width = bw + 'px';
    box.style.height = bh + 'px';
    st.style.setProperty('--g', (bh * 150 / 460) + 'px');
    st.style.setProperty('--g2', (bh * 76 / 460) + 'px');
  }
  function enterGame() {
    document.body.classList.add('game-on');
    window.scrollTo(0, 0);
    fitScene();
  }
  function closeDrawers() {
    document.querySelectorAll('.drawer.open').forEach((d) => d.classList.remove('open'));
    if (S.autoPaused) {
      S.autoPaused = false;
      if (S.phase === 'play' && S.paused) { S.paused = false; Music.start(); syncButtons(); }
    }
  }
  function exitGame() {
    closeDrawers();
    if (S.phase === 'play' && !S.paused) { S.paused = true; Music.stop(); syncButtons(); }
    document.body.classList.remove('game-on');
    fitScene();
  }
  window.addEventListener('resize', fitScene);
  $('exit-game').addEventListener('click', exitGame);
  document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => {
    const d = $(b.dataset.open);
    const wasOpen = d.classList.contains('open');
    closeDrawers();
    d.hidden = false;
    if (!wasOpen) {
      if (S.phase === 'play' && !S.paused && document.body.classList.contains('game-on')) { S.paused = true; S.autoPaused = true; Music.stop(); syncButtons(); }
      requestAnimationFrame(() => d.classList.add('open'));
    }
  }));
  document.querySelectorAll('.drawer-close').forEach((b) => b.addEventListener('click', closeDrawers));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawers(); });
  function syncSound() {
    const b = $('sound');
    b.innerHTML = Music.isOn() ? '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"></path><path d="M16 9 Q18 12 16 15 M18.5 6.5 Q22.5 12 18.5 17.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>' : '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"></path><path d="M16.5 9.5 L21.5 14.5 M21.5 9.5 L16.5 14.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path></svg>';
    b.setAttribute('aria-pressed', Music.isOn() ? 'true' : 'false');
  }
  $('sound').addEventListener('click', () => { Music.toggle(S.phase === 'play' && !S.paused); syncSound(); });
  syncSound();
  const strip = $('strip');
  $('strip-left').addEventListener('click', () => strip.scrollBy({ left: -strip.clientWidth * 0.7, behavior: 'smooth' }));
  $('strip-right').addEventListener('click', () => strip.scrollBy({ left: strip.clientWidth * 0.7, behavior: 'smooth' }));
  strip.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && strip.scrollWidth > strip.clientWidth) { strip.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });
  $('cook').addEventListener('click', cook);
  $('call-leolita').addEventListener('click', masterCook);
  $('call-nif').addEventListener('click', callNif);
  $('undo').addEventListener('click', undo);
  $('clear').addEventListener('click', clearPot);
  $('refill').addEventListener('click', refill);
  $('pause').addEventListener('click', () => {
    if (S.phase !== 'play') return;
    S.paused = !S.paused;
    if (S.paused) Music.stop(); else { Music.start(); if (!document.body.classList.contains('game-on')) enterGame(); }
    syncButtons();
    toast(S.paused ? 'Pause. Die Schlange wartet.' : 'Weiter geht’s!');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && S && S.phase === 'play' && !S.paused) { S.paused = true; syncButtons(); }
  });

  // Start
  S = freshState();
  renderStatic();
  renderBook();
  restoreGraetzl();
  $('ov-graetzl').textContent = grStats();
  $('ov-day').textContent = 'Tageskiste vom ' + DAY_LABEL + ': heute für alle gleich, dieselben Zutaten und dieselben Nachbarn.' + (dayBest() ? ' Dein bester Versuch heute: ' + dayBest() + ' Versorgte.' : '');
  renderCrate();
  renderPotList();
  updateHud();
  requestAnimationFrame(frame);

  // Für Tests
  window.__radkueche = { judge, newCrate, G: () => G, dayRng, feast: (k) => feast(k || 'reward'), state: () => S, setCrate: (c) => { S.crate = c; renderCrate(); } };
})();
