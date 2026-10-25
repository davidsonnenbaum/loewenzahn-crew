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
  const NAMES = ['Frau Novak', 'Herr Huber', 'Oma Gerti', 'Herr Yilmaz', 'Frau Horvath', 'Herr Pichler', 'Tante Mitzi', 'Herr Kovač', 'Frau Sommer', 'Opa Ferdl', 'Frau Steiner', 'Herr Adler', 'Frau Weiss', 'Herr Berger', 'Frau Popović', 'Herr Brunner', 'Frau Lehner', 'Herr Schwarz'];
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
      refilling: 0, paused: false, dishes: 0, nextId: 1, warm: 0, banterIn: 10, jakob: 'home', jokers: 1, streak: 0, masterNext: null
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
  function say(x, y, text, ms, who) {
    const b = document.createElement('div');
    b.className = 'bubble-say';
    b.textContent = text;
    logTalk(who || 'Nachbar:in', text);
    const left = Math.max(12, Math.min(88, x / 1200 * 100));
    b.style.left = left + '%';
    b.style.top = ((y - 100) / 460 * 100) + '%';
    bubbles.appendChild(b);
    requestAnimationFrame(() => b.classList.add('show'));
    setTimeout(() => { b.classList.remove('show'); setTimeout(() => b.remove(), 400); }, Math.max(ms || 4200, 5600));
    return b;
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
    if (!force && now - lastTalk < 3500) return;
    if (!force && bubbles.children.length >= 2) return;
    lastTalk = now;
    n.bubble = say(n.x, QY - 108, pick(LINES[n.humor][kind]), 4600, n.name);
  }

  // ----- Nachbarn -----
  function spawnNeighbor() {
    const look = { skin: pick(SKIN), shirt: pick(SHIRT), hat: pick(HATS), hatColor: pick(SHIRT), hair: pick(['#3B2A1E', '#8A5A3C', '#C8A46B', '#D8D3C8', '#1E1A17']) };
    const g = mk('g', {});
    g.innerHTML = personMarkup(look);
    queueLayer.appendChild(g);
    const n = { id: S.nextId++, el: g, x: 1260, tx: 0, humor: pick(['grant', 'schmaeh', 'jiddisch']), name: pick(NAMES), waited: 0, talkedWait: false };
    S.queue.push(n);
    layoutQueue();
    if (Math.random() < 0.55 || S.queue.length <= 2) setTimeout(() => { if (S.queue.includes(n)) maybeSay(n, 'arrive'); }, 1600);
    if (S.queue.length >= QUEUE_MAX) lose();
  }
  function layoutQueue() {
    S.queue.forEach((n, i) => { n.tx = QX0 + i * QGAP; });
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
    $('master').disabled = !playing || S.jokers <= 0;
    $('jokers').textContent = '(' + S.jokers + ')';
    $('pause').textContent = S.paused ? 'Weiter' : 'Pause';
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
    $('refill-note').textContent = 'Jakob radelt los ...';
    say(220, 420, pick(JAKOB_GO), 3200, 'Jakob');
    Music.sfx('bike');
    $('jakob').classList.add('rolling');
    $('jakob-load').setAttribute('opacity', '0');
    jakobAt(-360);
    syncButtons();
  }
  function jakobTick() {
    if (S.refilling <= 0) return;
    $('refill-note').textContent = 'Jakob ist auf Rettungstour ... noch ' + Math.ceil(Math.max(0, S.refilling)) + ' s';
    if (S.jakob === 'leaving' && S.refilling < 6.5) { S.jakob = 'shopping'; $('jakob-load').setAttribute('opacity', '1'); }
    if (S.jakob === 'shopping' && S.refilling < 3) { S.jakob = 'returning'; jakobAt(170); }
    if (S.refilling <= 0.05) {
      S.refilling = 0;
      S.jakob = 'home';
      $('jakob').classList.remove('rolling');
      const fresh = newCrate();
      for (const id in fresh) S.crate[id] = (S.crate[id] || 0) + fresh[id];
      $('refill-note').textContent = '';
      renderCrate();
      say(220, 420, pick(JAKOB_BACK), 3800, 'Jakob');
      setTimeout(() => $('jakob-load').setAttribute('opacity', '0'), 1600);
      syncButtons();
    }
  }

  // ----- Mira unterhält die Schlange -----
  const MIRA_SOLO = [
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
    ['I hab die Zwiebel g’schnitten und jetzt wein i.', 'Des is Teambuilding, Mira.'],
    ['Captain, die Schlange wird länger!', 'Dann kochen ma schneller. Und reden langsamer.'],
    ['Captain, is des Schiff eigentlich seetauglich?', 'Na. Aber grätzltauglich, und des is wichtiger.']
  ];
  function banter() {
    if (bubbles.children.length >= 2) return;
    const r = Math.random();
    if (r < 0.35) {
      $('juggle').setAttribute('opacity', '1');
      $('mira').classList.add('juggling');
      say(60, 340, pick(MIRA_SOLO), 4200, 'Mira');
      setTimeout(() => { $('juggle').setAttribute('opacity', '0'); $('mira').classList.remove('juggling'); }, 4200);
    } else if (r < 0.8) {
      const d = pick(DUETS);
      say(60, 340, d[0], 3400, 'Mira');
      setTimeout(() => { if (S.phase === 'play') say(342, 330, d[1], 3800, 'Captain Dave'); }, 2300);
    } else {
      say(60, 340, pick(MIRA_SOLO), 4200, 'Mira');
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
    'Captain, i hol schnell den Kompostkübel ...',
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
    serve(result, color);
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

  async function serve(r, color) {
    S.dishes += 1;
    const seeds = [0, 1, 3, 5][r.spoons];
    const portions = [0, 1, 2, 4][r.spoons];
    const feeds = Math.min(portions, S.queue.length);
    const kept = Math.max(0, Math.min(6 - S.warm, portions - feeds));
    let points = [0, 20, 50, 100][r.spoons] + (r.dish ? 30 : 0);
    const master = S.masterNext;
    S.masterNext = null;
    if (master) points = Math.round(points / 2);
    if (!master && r.spoons === 3) { S.streak += 1; if (S.streak % 3 === 0) setTimeout(() => earnJoker('Drei Gerichte mit 3 Kochlöffeln!'), 3000); }
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
      ? `${portions} ${portions === 1 ? 'Portion' : 'Portionen'}` + (feeds ? `, ${feeds} gleich ausgegeben` : '') + (kept > 0 ? `, ${kept} bleiben warm` : '') + ` · +${seeds} Samen · +${points} Punkte`
      : 'Keine Samen diesmal. Probier eine andere Reihenfolge!';
    v.append(rw);
    if (master) { const g = document.createElement('p'); g.className = 'v-master'; g.textContent = 'Gekocht von Oma Gerti. Ihr Rezept mit allen Erklärungen steht unten im Rezeptbuch.'; v.prepend(g); }
    showJuryPop(r);

    say(342, 330, master ? pick(['Danke, Oma Gerti! Des war a Lehrstunde.', 'Oma Gerti, du bist a Legende!', 'I glaub, i muss no viel lernen.']) : pick(CAPTAIN_JOKES[r.spoons]), 3800, 'Captain Dave');
    if (Math.random() < 0.5) setTimeout(() => say(60, 340, MIRA_REACT[r.spoons], 3200, 'Mira'), 1600);

    if (feeds) {
      const front = S.queue.slice(0, feeds);
      for (let i = 0; i < front.length; i++) {
        await handOver(front[i], color);
        if (i === 0) setTimeout(() => { if (front[0].el.isConnected) say(front[0].x, QY - 108, pick(LINES[front[0].humor]['r' + r.spoons]), 4000, front[0].name); }, 700);
      }
      feedFront(feeds, r.spoons, true);
    } else if (S.queue.length && r.spoons === 0) {
      setTimeout(() => maybeSay(S.queue[0], 'r0', true), 1200);
    }
    S.warm += kept;
    if (seeds) setTimeout(() => toast(`+${seeds} Samen!`, 'Klick auf die Wiese vorne oder auf ein Haus, um zu pflanzen.'), 600);
    S.busy = false;
    syncButtons();
    updateHud();
    if (!Object.keys(S.crate).length && S.refilling <= 0) setTimeout(() => toast('Die Rettungskiste ist leer.', 'Schick Jakob auf Rettungstour!'), 2600);
  }

  // ---------------------------------------------------------------
  // Bonus: Oma Gerti, die Meisterköchin aus dem Hof
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
        const score = r.spoons * 1000 + (r.dish ? 300 : 0) + r.pts * 10 - pot.length;
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
  const GERTI_HELLO = ['Lass mi amoi, Bub! Die Oma zeigt dir, wie’s geht.', 'Platz da, jetzt kocht die Gerti!', 'Na geh, Captain, gib her den Kochlöffel.'];
  const GERTI_BYE = ['So, jetzt du wieder. Du kannst des eh!', 'Merk dir’s gut, i bin ned ewig da!', 'Und immer mit Liebe kochen, gell?'];
  function gertiAt(x) { $('gerti').style.transform = `translateX(${x}px)`; }

  async function masterCook() {
    if (S.phase !== 'play' || S.busy || S.jokers <= 0) return;
    const avail = Object.keys(S.crate).filter((id) => S.crate[id] > 0);
    if (!avail.length) { toast('Die Kiste ist leer.', 'Ohne Zutaten kann auch Oma Gerti nix zaubern. Schick Jakob los!'); return; }
    S.jokers -= 1;
    S.busy = true;
    clearPot();
    syncButtons();
    const plan = planMaster();
    // Oma Gerti kommt aus dem Hof
    $('gerti').classList.add('walking');
    gertiAt(0);
    await wait(2000);
    $('gerti').classList.remove('walking');
    say(270, 350, pick(GERTI_HELLO), 3000, 'Oma Gerti');
    await wait(1400);
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
      say(270, 350, pick(GERTI_BYE), 3200, 'Oma Gerti');
      setTimeout(() => { $('gerti').classList.add('walking'); gertiAt(-420); setTimeout(() => $('gerti').classList.remove('walking'), 2000); }, 2600);
    }, 4200);
  }

  function addRecipe(name, steps) {
    const book = $('recipes');
    const empty = book.querySelector('.empty');
    if (empty) empty.remove();
    const d = document.createElement('details');
    d.open = true;
    book.querySelectorAll('details').forEach((x) => { x.open = false; });
    const s = document.createElement('summary');
    s.textContent = name + ' nach Oma Gerti';
    const ol = document.createElement('ol');
    steps.forEach(([id, why]) => {
      const li = document.createElement('li');
      const b = document.createElement('strong'); b.textContent = NAME(id) + ': ';
      li.append(b, document.createTextNode(why));
      ol.append(li);
    });
    d.append(s, ol);
    book.prepend(d);
    $('recipes-wrap').hidden = false;
  }

  function earnJoker(reason) {
    S.jokers += 1;
    syncButtons();
    toast('Oma Gerti hat wieder Zeit!', reason + ' Du kannst sie noch einmal rufen.');
  }

  function feedFront(count, spoons, handed) {
    const fed = S.queue.splice(0, count);
    fed.forEach((n, i) => {
      n.el.querySelector('.bowl').setAttribute('opacity', '1');
      if (!handed && i === 0 && Math.random() < 0.6) setTimeout(() => say(n.x, QY - 108, pick(LINES[n.humor]['r' + spoons]), 4000, n.name), 200);
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
    if (S.flowers % 12 === 0) earnJoker('12 neue Blumen im Grätzl!');
    $('meadow').setAttribute('opacity', String(Math.min(1, S.flowers / 22)));
    if (S.flowers >= 8) $('tree1').classList.add('grown');
    if (S.flowers >= 18) $('tree2').classList.add('grown');
    if (S.flowers === 1) toast('Die erste Blume!', 'Blumen locken Hummeln an, und ein blühendes Grätzl spricht sich herum.');
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
      // Neue Nachbarn: am Anfang gemütlich. Je mehr versorgt sind und je mehr blüht,
      // desto mehr spricht es sich im Grätzl herum, und desto schneller kommen Leute.
      S.spawnIn -= dt;
      if (S.spawnIn <= 0) {
        spawnNeighbor();
        const buzz = S.served * 0.4 + S.flowers * 0.12 + S.elapsed * 0.01;
        const gap = Math.max(4.2, 12.5 - buzz);
        S.spawnIn = gap + rand(-1, 1);
        if (gap < 10.5 && !S.buzz1) { S.buzz1 = true; toast('Es spricht sich herum im Grätzl!', 'Dein gutes Essen lockt immer mehr Leute an.'); say(60, 340, 'Captain, des spricht si herum! Es kommen immer mehr!', 3600, 'Mira'); }
        if (gap < 7 && !S.buzz2) { S.buzz2 = true; toast('Jetzt is richtig was los!', 'Das halbe Grätzl steht schon an.'); say(342, 330, 'Volle Kraft voraus, Crew!', 3200, 'Captain Dave'); }
      }
      // Rettungstour mit Jakob
      if (S.refilling > 0) { S.refilling -= dt; jakobTick(); }
      // Mira unterhält die Leute
      S.banterIn -= dt;
      if (S.banterIn <= 0) { banter(); S.banterIn = rand(13, 21); }
      // Ungeduld
      S.queue.forEach((n, i) => {
        n.waited += dt;
        if (!n.talkedWait && n.waited > 16 + i * 2 && Math.random() < 0.004) { n.talkedWait = true; maybeSay(n, 'wait'); }
      });
    }

    // Warmgehaltene Portionen an die Ersten in der Schlange
    if (running && S.warm > 0 && !S.handing && S.queue.length && Math.abs(S.queue[0].tx - S.queue[0].x) < 2) {
      S.warmT = (S.warmT || 0) + dt;
      if (S.warmT > 0.8) {
        S.warmT = 0; S.warm -= 1; S.handing = true;
        const n = S.queue[0];
        handOver(n, '#C9A26B').then(() => {
          if (S.queue[0] === n) feedFront(1, 2, false);
          S.handing = false;
          updateHud();
        });
      }
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
    $('m-qfill').style.width = pct + '%';
    $('m-qfill').style.background = pct >= 75 ? '#B8432F' : pct >= 50 ? '#C97B3D' : '#2F5233';
    $('m-qbar').setAttribute('aria-valuenow', String(q));
    Music.setTempo(120 + q * 3);
  }
  function updateHud() {
    $('m-served').textContent = S.served;
    $('m-seeds').textContent = S.seeds;
    $('m-warm').textContent = S.warm;
    $('m-flowers').textContent = S.flowers;
    $('m-bees').textContent = S.bees.length;
    $('m-score').textContent = S.score;
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
    setTimeout(() => { say(60, 340, 'Servus! I bin die Mira und schnippel heut für euch.', 3200, 'Mira'); }, 6200 * T);
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
    $('ov-start').textContent = 'Nochmal spielen';
    $('ov-crew').hidden = !crew;
    $('overlay').hidden = false;
  }
  function win() {
    if (S.phase !== 'play') return;
    Music.stop(); Music.sfx('win');
    addScore(300);
    celebrate();
    endScreen('Gewonnen!', 'Das ganze Grätzl ist satt und glücklich.',
      [`Du hast ${S.served} Nachbarinnen und Nachbarn mit ${S.dishes} Gerichten versorgt, ${S.flowers} Blumen gepflanzt, und ${S.bees.length} Hummeln summen jetzt durch die Straße.`,
       `Deine Punkte: ${S.score}. Dein Rekord: ${best}.`,
       'Und das Schönste: Das geht auch in echt. Komm in die Crew!'], true);
  }
  function lose() {
    if (S.phase !== 'play') return;
    Music.stop(); Music.sfx('lose');
    const n = S.queue[S.queue.length - 1];
    if (n) say(n.x, QY - 108, pick(LINES.grant.r0), 3000, n.name);
    endScreen('Die Schlange reicht bis ans Ende der Straße.', 'Na servas, des war heut a harter Tag.',
      [`Du hast ${S.served} von ${GOAL} Nachbarn versorgt. Tipp: Je besser das Gericht, desto mehr Leute werden auf einmal satt. Und was warm im Topf bleibt, geht an die Nächsten.`,
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
    $('handplate').setAttribute('opacity', '0');
    $('jurypop').hidden = true;
    const mira = $('mira'); mira.style.transition = 'none'; mira.style.transform = 'translateX(-260px)'; void mira.getBBox(); mira.style.transition = '';
    const jk = $('jakob'); jk.style.transition = 'none'; jakobAt(-420); void jk.getBBox(); jk.style.transition = '';
    $('jakob-load').setAttribute('opacity', '0');
    const ge = $('gerti'); ge.style.transition = 'none'; ge.style.transform = 'translateX(-420px)'; void ge.getBBox(); ge.style.transition = '';
    $('talklog').innerHTML = '<li class="empty">Noch ist es ruhig auf der Straße.</li>';
  }

  function startGame() {
    resetScene();
    S = freshState();
    renderCrate();
    renderPotList();
    renderPotVisual();
    updateHud();
    intro();
  }

  // ----- Knöpfe -----
  $('ov-start').addEventListener('click', () => {
    startGame();
    Music.start();
    syncSound();
    const play = document.querySelector('.play');
    if (play && play.getBoundingClientRect().top < 0 || (play && play.getBoundingClientRect().top > 120)) play.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
  function syncSound() {
    const b = $('sound');
    b.textContent = Music.isOn() ? 'Musik: an' : 'Musik: aus';
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
  $('master').addEventListener('click', masterCook);
  $('undo').addEventListener('click', undo);
  $('clear').addEventListener('click', clearPot);
  $('refill').addEventListener('click', refill);
  $('pause').addEventListener('click', () => {
    if (S.phase !== 'play') return;
    S.paused = !S.paused;
    if (S.paused) Music.stop(); else Music.start();
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
  renderPotList();
  updateHud();
  requestAnimationFrame(frame);

  // Für Tests
  window.__radkueche = { judge, newCrate, state: () => S, setCrate: (c) => { S.crate = c; renderCrate(); } };
})();
