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

  function weightedPick(pool, mi) {
    const total = pool.reduce((s, id) => s + ING[id].w[mi], 0);
    let r = Math.random() * total;
    for (const id of pool) { r -= ING[id].w[mi]; if (r <= 0) return id; }
    return pool[pool.length - 1];
  }

  function newCrate() {
    const mi = new Date().getMonth();
    const size = pick([3, 3, 4, 4, 5, 5, 6]);
    let pool = Object.keys(ING).filter((id) => ING[id].w[mi] > 0);
    const crate = {};
    for (let i = 0; i < size && pool.length; i++) {
      const id = weightedPick(pool, mi);
      pool = pool.filter((x) => x !== id);
      crate[id] = id === 'brot' ? Math.floor(rand(3, 6)) : Math.floor(rand(2, 5));
    }
    return crate;
  }

  // ---------------------------------------------------------------
  // Die Jury. Das Küchenwissen steckt in diesen Regeln.
  // ---------------------------------------------------------------
  const DISHES = [
    { name: 'Erdäpfelgulasch', need: ['kartoffeln', 'zwiebel', 'paprikapulver', 'wasser'] },
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
    if (dish) plus(3, null);

    let spoons = pts >= 9 ? 3 : pts >= 4 ? 2 : pts >= 0 ? 1 : 0;
    if (bad.some(([n]) => n >= 4)) spoons = Math.min(spoons, 1);
    const heads = ['Das geht zurück in die Küche.', 'Essbar, aber da geht mehr.', 'Gut gekocht!', 'Ein Gedicht!'];
    bad.sort((a, b) => b[0] - a[0]);
    good.sort((a, b) => b[0] - a[0]);
    const notes = [];
    if (spoons >= 2) { good.slice(0, 2).forEach((g) => notes.push(['good', g[1]])); bad.slice(0, 1).forEach((b) => notes.push(['bad', 'Tipp: ' + b[1]])); }
    else { bad.slice(0, 2).forEach((b) => notes.push(['bad', b[1]])); good.slice(0, 1).forEach((g) => notes.push(['good', 'Gut war: ' + g[1]])); }
    return { spoons, dish, head: heads[spoons], notes };
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
    return `<g class="bob">${legs}${body}${head}${hat}<g class="bowl" opacity="0"><path d="M-26 -46 L-10 -46 Q-12 -36 -18 -36 Q-24 -36 -26 -46 Z" fill="#C97B3D"></path><path d="M-22 -52 Q-24 -58 -20 -62 M-16 -52 Q-18 -58 -14 -62" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round"></path></g></g>`;
  }

  // ---------------------------------------------------------------
  // Spielzustand
  // ---------------------------------------------------------------
  const GOAL = 20;
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
      refilling: 0, paused: false, dishes: 0, nextId: 1, warm: 0
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
  function say(x, y, text, ms) {
    const b = document.createElement('div');
    b.className = 'bubble-say';
    b.textContent = text;
    const left = Math.max(12, Math.min(88, x / 1200 * 100));
    b.style.left = left + '%';
    b.style.top = (y / 560 * 100) + '%';
    bubbles.appendChild(b);
    requestAnimationFrame(() => b.classList.add('show'));
    setTimeout(() => { b.classList.remove('show'); setTimeout(() => b.remove(), 400); }, ms || 4200);
    return b;
  }
  let lastTalk = 0;
  function maybeSay(n, kind, force) {
    const now = performance.now();
    if (!force && now - lastTalk < 3500) return;
    if (!force && bubbles.children.length >= 2) return;
    lastTalk = now;
    n.bubble = say(n.x, QY - 108, pick(LINES[n.humor][kind]), 4600);
  }

  // ----- Nachbarn -----
  function spawnNeighbor() {
    const look = { skin: pick(SKIN), shirt: pick(SHIRT), hat: pick(HATS), hatColor: pick(SHIRT), hair: pick(['#3B2A1E', '#8A5A3C', '#C8A46B', '#D8D3C8', '#1E1A17']) };
    const g = mk('g', {});
    g.innerHTML = personMarkup(look);
    queueLayer.appendChild(g);
    const n = { id: S.nextId++, el: g, x: 1260, tx: 0, humor: pick(['grant', 'schmaeh', 'jiddisch']), waited: 0, talkedWait: false };
    S.queue.push(n);
    layoutQueue();
    if (Math.random() < 0.55 || S.queue.length <= 2) setTimeout(() => { if (S.queue.includes(n)) maybeSay(n, 'arrive'); }, 1600);
    if (S.queue.length >= QUEUE_MAX) lose();
  }
  function layoutQueue() {
    S.queue.forEach((n, i) => { n.tx = QX0 + i * QGAP; });
  }

  // ----- Rettungskiste, Basis, Gewürze -----
  function chip(id, def, extra) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (extra || '');
    b.dataset.id = id;
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = def.color;
    b.append(dot, document.createTextNode(def.name));
    return b;
  }
  function renderCrate() {
    const box = $('crate');
    box.innerHTML = '';
    const ids = Object.keys(S.crate);
    if (!ids.length) {
      const p = document.createElement('p'); p.className = 'note'; p.style.margin = '0';
      p.textContent = 'Die Kiste ist leer. Zeit für eine neue Rettungstour!';
      box.append(p);
    }
    ids.forEach((id) => {
      const b = chip(id, ING[id]);
      const c = document.createElement('span'); c.className = 'count'; c.textContent = '×' + S.crate[id];
      b.append(c);
      b.setAttribute('aria-label', ING[id].name + ', noch ' + S.crate[id]);
      b.addEventListener('click', () => addToPot(id));
      box.append(b);
    });
    syncButtons();
  }
  function renderStatic() {
    const base = $('base'); base.innerHTML = '';
    Object.keys(BASE).forEach((id) => { const b = chip(id, BASE[id]); b.addEventListener('click', () => addToPot(id)); base.append(b); });
    const sp = $('spices'); sp.innerHTML = '';
    Object.keys(SPICE).forEach((id) => { const b = chip(id, SPICE[id], ' spice'); b.addEventListener('click', () => addToPot(id)); sp.append(b); });
    const si = seasonInfo();
    $('season').textContent = 'Heute, ' + si.day + '. ' + MONTHS[si.month] + ': ' + si.word + '!';
  }
  function renderPot() {
    const list = $('potlist');
    list.innerHTML = '';
    if (!S.pot.length) {
      const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'Noch leer. Womit fängst du an?'; list.append(li);
    } else {
      S.pot.forEach((id) => { const li = document.createElement('li'); li.textContent = NAME(id); list.append(li); });
    }
    syncButtons();
  }
  function syncButtons() {
    const playing = S.phase === 'play' && !S.busy && !S.paused;
    document.querySelectorAll('.chip').forEach((b) => { b.disabled = !playing || S.pot.length >= 12; });
    $('cook').disabled = !playing || !S.pot.length;
    $('undo').disabled = !playing || !S.pot.length;
    $('clear').disabled = !playing || !S.pot.length;
    $('refill').disabled = !(S.phase === 'play') || S.refilling > 0 || S.paused;
    $('pause').disabled = S.phase !== 'play';
    $('pause').textContent = S.paused ? 'Weiter' : 'Pause';
  }
  function addToPot(id) {
    if (S.phase !== 'play' || S.busy || S.pot.length >= 12) return;
    if (ING[id]) {
      if (!S.crate[id]) return;
      S.crate[id] -= 1;
      if (S.crate[id] <= 0) delete S.crate[id];
      renderCrate();
    }
    S.pot.push(id);
    renderPot();
  }
  function undo() {
    const id = S.pot.pop();
    if (id && ING[id]) { S.crate[id] = (S.crate[id] || 0) + 1; renderCrate(); }
    renderPot();
  }
  function clearPot() {
    S.pot.forEach((id) => { if (ING[id]) S.crate[id] = (S.crate[id] || 0) + 1; });
    S.pot = [];
    renderCrate(); renderPot();
  }
  function refill() {
    if (S.refilling > 0) return;
    S.refilling = 6;
    $('refill-note').textContent = 'Die Crew radelt los ...';
    syncButtons();
  }

  // ----- Kochen und servieren -----
  function cook() {
    if (S.phase !== 'play' || S.busy || !S.pot.length) return;
    S.busy = true;
    syncButtons();
    const result = judge(S.pot.slice());
    const pot = $('pot');
    pot.classList.remove('bubble'); void pot.getBBox(); pot.classList.add('bubble');
    $('captain').classList.remove('stir'); void $('captain').getBBox(); $('captain').classList.add('stir');
      setTimeout(() => serve(result), reduceMotion ? 200 : 2000);
  }

  function spoonsSvg(n) {
    let s = '';
    for (let i = 0; i < 3; i++) {
      const on = i < n;
      s += `<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><ellipse cx="12" cy="11" rx="7" ry="9" fill="${on ? '#C97B3D' : '#E9DCC4'}" transform="rotate(-35 12 11)"></ellipse><line x1="16" y1="16" x2="29" y2="30" stroke="${on ? '#6B4A32' : '#E9DCC4'}" stroke-width="4" stroke-linecap="round"></line></svg>`;
    }
    return s;
  }

  function serve(r) {
    S.dishes += 1;
    const seeds = [0, 1, 3, 5][r.spoons];
    const portions = [0, 1, 2, 4][r.spoons];
    const feeds = Math.min(portions, S.queue.length);
    const kept = Math.min(6 - S.warm, portions - feeds);
    S.warm += Math.max(0, kept);
    const points = [0, 20, 50, 100][r.spoons] + (r.dish ? 30 : 0);
    S.seeds += seeds;
    addScore(points);

    // Jury-Panel
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
      ? `${portions} ${portions === 1 ? 'Portion' : 'Portionen'}` + (feeds ? `, ${feeds} sofort ausgegeben` : '') + (kept > 0 ? `, ${kept} bleiben warm` : '') + ` · +${seeds} Samen · +${points} Punkte`
      : 'Keine Samen diesmal. Probier eine andere Reihenfolge!';
    v.append(rw);

    toast(r.head + (r.dish ? ' ' + r.dish + '!' : ''), seeds ? `+${seeds} Samen. Klick auf die Wiese oder ein Haus, um zu pflanzen.` : 'Lies den Tipp der Jury und versuch es nochmal.');

    // Nachbarn bekommen ihr Essen
    if (feeds) feedFront(feeds, r.spoons);
    else if (S.queue.length && r.spoons === 0) maybeSay(S.queue[0], 'r0', true);
    S.pot = [];
    renderPot();
    S.busy = false;
    syncButtons();
    updateHud();
    if (!Object.keys(S.crate).length && S.refilling <= 0) setTimeout(() => toast('Die Rettungskiste ist leer.', 'Drück auf „Neue Rettungstour“, um Nachschub zu holen.'), 1800);
  }

  function feedFront(count, spoons) {
    const fed = S.queue.splice(0, count);
    fed.forEach((n, i) => {
      n.el.querySelector('.bowl').setAttribute('opacity', '1');
      if (i === 0 && Math.random() < 0.6) setTimeout(() => say(n.x, QY - 108, pick(LINES[n.humor]['r' + spoons]), 4000), 200);
      n.leaveT = 0.4 + i * 0.35;
      n.ty = rand(500, 540);
      n.tx = rand(QX0 + 40, 1180);
      S.leaving.push(n);
    });
    S.served += fed.length;
    layoutQueue();
    updateHud();
    if (S.served >= GOAL) setTimeout(win, 1600);
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
  function placeFlower(x, y, scale) {
    const kind = FLOWERS[flowerTurn++ % FLOWERS.length];
    const h = (kind === 'sonnenblume' ? rand(42, 56) : rand(20, 34)) * scale;
    const g = mk('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})` });
    g.innerHTML = flowerMarkup(kind, h / scale);
    plantLayer.appendChild(g);
    S.targets.push([x, y - h]);
    return kind;
  }
  function afterFlower() {
    S.flowers += 1;
    S.seeds -= 1;
    addScore(10);
    $('meadow').setAttribute('opacity', String(Math.min(1, S.flowers / 22)));
    if (S.flowers >= 8) $('tree1').classList.add('grown');
    if (S.flowers >= 18) $('tree2').classList.add('grown');
    if (S.flowers === 1) toast('Die erste Blume!', 'Blumen locken Hummeln an und machen die Wartenden geduldiger.');
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
      placeFlower(x, Math.min(552, Math.max(496, y)), 1);
      afterFlower();
      return;
    }
    const i = houseAt(x, y);
    if (i >= 0) {
      if (S.roofs[i] >= 10) { toast('Dieses Dach ist schon ein Garten!', 'Such dir ein anderes Haus.'); return; }
      const hs = HOUSES[i];
      const px = Math.max(hs.x0, Math.min(hs.x1, x + rand(-6, 6)));
      const ry = hs.roof(px);
      plantLayer.appendChild(mk('path', { d: `M${px - 9} ${ry + 1} Q${px - 4} ${ry - 7} ${px} ${ry + 1} Q${px + 4} ${ry - 8} ${px + 9} ${ry + 1} Z`, fill: '#7FA36F', class: 'grow' }));
      placeFlower(px, ry, 0.75);
      S.roofs[i] += 1;
      afterFlower();
      if (S.roofs[i] === 4 && !S.green[i]) {
        S.green[i] = true;
        greenHouse(i);
        addScore(50);
        toast('Ein Haus wird grün! +50', 'Efeu klettert hoch, und vor den Fenstern blüht es.');
      }
      return;
    }
    if (y >= 410) toast('Pflanz auf der Wiese vorne oder auf einem Haus.', 'Auf der Fahrbahn stehen die Nachbarn an.');
    else toast('Klick auf die Wiese vorne oder auf ein Haus.', 'Im Himmel wächst leider nichts.');
  }
  svg.addEventListener('click', (e) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
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
  function syncBees() {
    const want = Math.min(36, Math.floor(S.flowers / 2));
    while (S.bees.length < want) {
      const b = makeBee(); beeTarget(b); S.bees.push(b); addScore(5);
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
      // Neue Nachbarn: wird mit der Zeit schneller, Blumen machen geduldiger
      S.spawnIn -= dt;
      if (S.spawnIn <= 0) {
        spawnNeighbor();
        const base = Math.max(4.2, 8.5 - S.elapsed * 0.035);
        S.spawnIn = base + Math.min(2.5, S.flowers * 0.09) + rand(-0.8, 0.8);
      }
      // Rettungstour
      if (S.refilling > 0) {
        S.refilling -= dt;
        $('refill-note').textContent = 'Die Crew radelt los ... noch ' + Math.ceil(Math.max(0, S.refilling)) + ' Sekunden';
        if (S.refilling <= 0) {
          S.refilling = 0;
          const fresh = newCrate();
          for (const id in fresh) S.crate[id] = (S.crate[id] || 0) + fresh[id];
          $('refill-note').textContent = '';
          renderCrate();
          toast('Nachschub ist da!', 'Neue gerettete Zutaten liegen in der Kiste.');
        }
      }
      // Ungeduld
      S.queue.forEach((n, i) => {
        n.waited += dt;
        if (!n.talkedWait && n.waited > 16 + i * 2 && Math.random() < 0.004) { n.talkedWait = true; maybeSay(n, 'wait'); }
      });
    }

    // Warmgehaltene Portionen an die Ersten in der Schlange
    if (running && S.warm > 0 && S.queue.length && Math.abs(S.queue[0].tx - S.queue[0].x) < 2) {
      S.warmT = (S.warmT || 0) + dt;
      if (S.warmT > 0.8) { S.warmT = 0; S.warm -= 1; feedFront(1, 2); }
    }

    // Bewegung der Nachbarn
    S.queue.forEach((n) => {
      const d = n.tx - n.x;
      const moving = Math.abs(d) > 1;
      if (moving) n.x += Math.sign(d) * Math.min(Math.abs(d), 150 * dt);
      n.el.setAttribute('transform', `translate(${n.x.toFixed(1)} ${QY})`);
      n.el.firstChild.classList.toggle('walk-bob', moving && !reduceMotion);
      if (n.bubble && n.bubble.isConnected) n.bubble.style.left = Math.max(12, Math.min(88, n.x / 1200 * 100)) + '%';
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

    if (running) updateQueueBar();
    requestAnimationFrame(frame);
  }

  function updateQueueBar() {
    const q = S.queue.length;
    const pct = Math.min(100, q / QUEUE_MAX * 100);
    $('h-qfill').style.width = pct + '%';
    $('h-qfill').style.background = pct >= 75 ? '#B8432F' : pct >= 50 ? '#C97B3D' : '#2F5233';
    $('h-qbar').setAttribute('aria-valuenow', String(q));
  }
  function updateHud() {
    $('h-served').textContent = S.served;
    $('h-goal').textContent = GOAL;
    $('h-seeds').textContent = S.seeds;
    $('h-flowers').textContent = S.flowers;
    $('h-bees').textContent = S.bees.length;
    $('h-score').textContent = S.score;
    $('h-warm').textContent = S.warm;
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
    setTimeout(() => { $('flame').setAttribute('opacity', '1'); }, 4400 * T);
    setTimeout(() => { $('steam').setAttribute('opacity', '1'); say(342, 330, pick(CAPTAIN_LINES), 3200); }, 5000 * T);
    setTimeout(() => {
      S.phase = 'play';
      S.spawnIn = 0.2;
      syncButtons();
      toast('Die Radküche ist offen!', 'Leg Zutaten in den Topf und drück auf „Abschmecken und servieren“.');
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
    $('ov-start').textContent = 'Nochmal spielen';
    $('ov-crew').hidden = !crew;
    $('overlay').hidden = false;
  }
  function win() {
    if (S.phase !== 'play') return;
    addScore(300);
    celebrate();
    endScreen('Gewonnen!', 'Das ganze Grätzl ist satt und glücklich.',
      [`Du hast ${S.served} Nachbarinnen und Nachbarn mit ${S.dishes} Gerichten versorgt, ${S.flowers} Blumen gepflanzt, und ${S.bees.length} Hummeln summen jetzt durch die Straße.`,
       `Deine Punkte: ${S.score}. Dein Rekord: ${best}.`,
       'Und das Schönste: Das geht auch in echt. Komm in die Crew!'], true);
  }
  function lose() {
    if (S.phase !== 'play') return;
    const n = S.queue[S.queue.length - 1];
    if (n) say(n.x, QY - 108, pick(LINES.grant.r0), 3000);
    endScreen('Die Schlange reicht bis ans Ende der Straße.', 'Na servas, des war heut a harter Tag.',
      [`Du hast ${S.served} von ${GOAL} Nachbarn versorgt. Tipp: Je besser das Gericht, desto mehr Leute werden auf einmal satt. Und Blumen machen die Wartenden geduldiger.`,
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
    bubbles.innerHTML = '';
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
  }

  function startGame() {
    resetScene();
    S = freshState();
    renderCrate();
    renderPot();
    updateHud();
    intro();
  }

  // ----- Knöpfe -----
  $('ov-start').addEventListener('click', startGame);
  $('cook').addEventListener('click', cook);
  $('undo').addEventListener('click', undo);
  $('clear').addEventListener('click', clearPot);
  $('refill').addEventListener('click', refill);
  $('pause').addEventListener('click', () => {
    if (S.phase !== 'play') return;
    S.paused = !S.paused;
    syncButtons();
    toast(S.paused ? 'Pause. Die Schlange wartet.' : 'Weiter geht’s!');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && S && S.phase === 'play' && !S.paused) { S.paused = true; syncButtons(); }
  });

  // Start
  S = freshState();
  renderStatic();
  renderCrate();
  renderPot();
  updateHud();
  requestAnimationFrame(frame);

  // Für Tests
  window.__radkueche = { judge, newCrate, state: () => S };
})();
