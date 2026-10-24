// Captain Dave & die Löwenzahn-Crew
// Hier deine echte E-Mail-Adresse eintragen, an die Anheuer-Anfragen gehen sollen:
const CONTACT_EMAIL = 'DEINE-EMAIL@beispiel.at';

(function () {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const bound = [];

  function collect() {
    document.querySelectorAll('*').forEach((el) => {
      const binds = [];
      for (const a of Array.from(el.attributes)) {
        if (a.name.startsWith('data-bind-')) binds.push([a.name.slice(10), a.value]);
      }
      if (binds.length || el.dataset.text !== undefined || el.dataset.if !== undefined) {
        bound.push({ el, binds });
      }
    });
  }

  function render(vals) {
    const fill = (tpl) => tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k) => (k in vals ? vals[k] : ''));
    for (const { el, binds } of bound) {
      for (const [attr, tpl] of binds) {
        const v = fill(tpl);
        if (attr === 'value') {
          if (el.value !== v) el.value = v;
        } else if (el.getAttribute(attr) !== v) {
          el.setAttribute(attr, v);
        }
      }
      if (el.dataset.text !== undefined) {
        const t = String(vals[el.dataset.text] ?? '');
        if (el.textContent !== t) el.textContent = t;
      }
      if (el.dataset.if !== undefined) el.hidden = !vals[el.dataset.if];
    }
  }

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  // ---------- Startseite: die Traum-Szene ----------
  function homePage() {
    let p = 0;
    let playing = false;
    let iv = null;
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const captions = [
      'Eine Straße wie viele: Autos, Lärm, und niemand bleibt stehen.',
      'Da kommt die Kolonne: Captain Dave und die Löwenzahn-Crew rollen mit der Radküche herein.',
      'Das Radschiff legt an. Die Autos fahren davon, der Topf dampft, es riecht nach Essen.',
      'Die Nachbarn kommen neugierig dazu. Aus Fremden wird eine Crew.',
      'Aus dem Asphalt wachsen Bäume, überall blühen Wiesen.',
      'Hummeln summen, Menschen reden und ruhen sich aus. Jetzt bist du dran: Klick auf die Wiese und pflanze!'
    ];
    const marks = [0, 24, 46, 64, 80, 100];
    const steps = Array.from(document.querySelectorAll('.step'));
    const svg = document.querySelector('.scene');
    let onArrive = null;

    function stageOf(v) {
      return v < 8 ? 0 : v < 40 ? 1 : v < 56 ? 2 : v < 72 ? 3 : v < 88 ? 4 : 5;
    }

    function update() {
      const stage = stageOf(p);
      const tRide = clamp((p - 8) / 32);
      const tWalk = clamp((p - 50) / 22);
      const arrived = p >= 40;
      render({
        p: String(p),
        sky: arrived ? '#D6EAF2' : '#CFCDC8',
        sunOpacity: arrived ? 1 : 0.15,
        // Die Häuser bleiben grau, bis sie im Spiel begrünt werden
        houseA: '#B8B4AD',
        houseB: '#A6A19A',
        roof: '#8C8781',
        convoyX: Math.round(-900 + tRide * 1500),
        spin: p > 8 && p < 40 ? 'running' : 'paused',
        steamOpacity: arrived ? 1 : 0,
        carsX: p >= 30 ? 1500 : 0,
        carsOpacity: p >= 30 ? 0 : 1,
        nLeft: Math.round((1 - tWalk) * -420),
        nRight1: Math.round((1 - tWalk) * 520),
        nRight2: Math.round((1 - clamp((p - 54) / 20)) * 560),
        nRight3: Math.round((1 - clamp((p - 58) / 18)) * 420),
        meadowOpacity: p >= 72 ? 1 : 0,
        flowerY: p >= 72 ? 0 : 24,
        treeScale: p >= 72 ? 1 : 0.001,
        lifeOpacity: p >= 88 ? 1 : 0,
        caption: captions[stage],
        buttonLabel: playing ? 'Anhalten' : p >= 100 ? 'Noch einmal träumen' : p > 0 ? 'Weiterfahren' : 'Losfahren'
      });
      steps.forEach((b, i) => {
        const on = i === stage;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.style.background = on ? '#2F5233' : 'transparent';
        b.style.color = on ? '#FFFFFF' : '#2F5233';
      });
      if (svg) svg.classList.toggle('can-plant', p >= 72);
    }

    function halt() {
      if (iv) { clearInterval(iv); iv = null; }
    }
    function start() {
      halt();
      if (p >= 100) p = 0;
      playing = true;
      iv = setInterval(() => {
        p += 1;
        if (p >= 100) {
          p = 100; playing = false; halt();
          if (onArrive) onArrive();
        }
        update();
      }, 120);
      update();
    }
    function stop() {
      halt();
      playing = false;
      update();
    }

    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-click]');
      if (!t) return;
      const a = t.dataset.click;
      if (a === 'toggle') playing ? stop() : start();
      if (a === 'pick') { stop(); p = marks[Number(t.dataset.index)]; update(); }
    });
    const slider = document.getElementById('traumregler');
    if (slider) slider.addEventListener('input', () => { const v = Number(slider.value); halt(); playing = false; p = v; update(); });

    update();
    let started = false;
    if (svg && 'IntersectionObserver' in window) {
      new IntersectionObserver((entries, obs) => {
        if (!started && entries.some((en) => en.isIntersecting)) {
          started = true;
          obs.disconnect();
          setTimeout(start, 600);
        }
      }, { threshold: 0.35 }).observe(svg);
    } else {
      setTimeout(start, 900);
    }

    if (svg) {
      gardenGame(svg, {
        meadowReady: () => p >= 72,
        bloomNow: () => { halt(); playing = false; p = 100; update(); },
        setOnArrive: (fn) => { onArrive = fn; }
      });
    }
  }

  // ---------- Das Pflanzspiel ----------
  function gardenGame(svg, scene) {
    const SPECIES = {
      loewenzahn: { name: 'Löwenzahn', fact: 'Er blüht früh im Jahr und ist eine der ersten Futterquellen für Hummeln.' },
      sonnenblume: { name: 'Sonnenblume', fact: 'Sie stammt eigentlich aus Amerika, wächst aber längst in Österreichs Gärten, und Hummeln lieben sie.' },
      kornblume: { name: 'Kornblume', fact: 'Früher wuchs sie in fast jedem Getreidefeld, heute ist sie selten geworden.' },
      mohn: { name: 'Klatschmohn', fact: 'Seine Samen können viele Jahre im Boden schlummern, bis sie wieder Licht bekommen.' },
      margerite: { name: 'Margerite', fact: 'Jede Blüte ist eigentlich ein Körbchen aus vielen winzigen Einzelblüten.' },
      salbei: { name: 'Wiesen-Salbei', fact: 'Ein kleiner Hebel in der Blüte drückt Hummeln beim Besuch Pollen auf den Rücken.' }
    };
    const KINDS = Object.keys(SPECIES);
    const TITLES = [[0, 'Samenkorn'], [150, 'Keimling'], [450, 'Gärtner:in'], [900, 'Blühkapitän:in'], [1500, 'Löwenzahn-Legende']];
    const HOUSES = [
      { x: 30, y: 180, w: 170, h: 230, roof: (x) => (x <= 115 ? 182 - (x - 18) * 62 / 97 : 120 + (x - 115) * 62 / 97), x0: 34, x1: 196,
        windows: [[60, 214, 34, 42], [136, 214, 34, 42], [60, 290, 34, 42], [136, 290, 34, 42]] },
      { x: 220, y: 140, w: 140, h: 270, roof: () => 140, x0: 226, x1: 354,
        windows: [[246, 170, 30, 40], [304, 170, 30, 40], [246, 240, 30, 40], [304, 240, 30, 40]] },
      { x: 820, y: 160, w: 160, h: 250, roof: () => 160, x0: 826, x1: 974,
        windows: [[846, 190, 34, 42], [920, 190, 34, 42], [846, 270, 34, 42], [920, 270, 34, 42]] },
      { x: 1000, y: 200, w: 180, h: 210, roof: (x) => (x <= 1090 ? 202 - (x - 990) * 56 / 100 : 146 + (x - 1090) * 56 / 100), x0: 1004, x1: 1176,
        windows: [[1030, 236, 34, 42], [1114, 236, 34, 42]] }
    ];
    const GREEN_AT = 4;
    const MAX_MEADOW = 160;
    const MAX_ROOF = 12;

    // Ebenen in der Szene anlegen
    const trees = svg.querySelectorAll('[data-bind-style*="treeScale"]');
    const anchor = trees[trees.length - 1];
    const mk = (tag, attrs) => {
      const el = document.createElementNS(SVGNS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      return el;
    };
    const ivyLayer = mk('g', { class: 'garden-ivy' });
    const plantLayer = mk('g', { class: 'garden-plants' });
    const beeLayer = mk('g', { class: 'garden-bees', 'pointer-events': 'none' });
    anchor.after(ivyLayer, plantLayer);
    svg.appendChild(beeLayer);

    const wrap = svg.parentElement;
    wrap.style.position = 'relative';
    const toastEl = document.createElement('div');
    toastEl.className = 'scene-toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    wrap.appendChild(toastEl);
    const petals = document.createElement('div');
    petals.className = 'petals';
    wrap.appendChild(petals);

    const $ = (id) => document.getElementById(id);
    let seed = 'mix';
    let mixIndex = 0;
    let state;
    let best = 0;
    try { best = Number(localStorage.getItem('lz-best') || 0); } catch (e) { best = 0; }

    function fresh() {
      return { score: 0, meadow: 0, roofs: [0, 0, 0, 0], green: [false, false, false, false], kinds: new Set(), badges: [], level: 0, bloomed: false, targets: [] };
    }

    // ----- Blumen zeichnen -----
    function flowerMarkup(kind, h) {
      const stem = `<path d="M0 0 Q-3 ${-h / 2} 0 ${-h}" stroke="#4E7A45" stroke-width="2.6" fill="none" stroke-linecap="round"></path>` +
        `<path d="M0 ${-h * 0.4} Q9 ${-h * 0.58} 11 ${-h * 0.36} Q4 ${-h * 0.3} 0 ${-h * 0.4} Z" fill="#6E9A5F"></path>`;
      let head = '';
      if (kind === 'loewenzahn') head = `<circle cx="0" cy="${-h}" r="6.5" fill="#F5C518" stroke="#D9A400" stroke-width="3" stroke-dasharray="2 1.5"></circle>`;
      if (kind === 'sonnenblume') head = `<circle cx="0" cy="${-h}" r="11" fill="#F2B530" stroke="#D9901A" stroke-width="4.5" stroke-dasharray="3.2 2"></circle><circle cx="0" cy="${-h}" r="5" fill="#6B4A32"></circle>`;
      if (kind === 'kornblume') head = `<circle cx="0" cy="${-h}" r="6.5" fill="#3C6FD1" stroke="#2A4FA8" stroke-width="3" stroke-dasharray="2.4 1.4"></circle><circle cx="0" cy="${-h}" r="2" fill="#23285E"></circle>`;
      if (kind === 'mohn') head = `<circle cx="0" cy="${-h}" r="8" fill="#D7322B"></circle><circle cx="-3" cy="${-h - 2}" r="3" fill="#E85A4F" opacity=".7"></circle><circle cx="0" cy="${-h}" r="2.3" fill="#2B1D17"></circle>`;
      if (kind === 'margerite') head = `<circle cx="0" cy="${-h}" r="8" fill="#FFFFFF" stroke="#D8D1C4" stroke-width="3" stroke-dasharray="2 1.5"></circle><circle cx="0" cy="${-h}" r="3.2" fill="#F2B530"></circle>`;
      if (kind === 'salbei') head = `<ellipse cx="0" cy="${-h - 6}" rx="3" ry="2.6" fill="#9A7BD0"></ellipse><ellipse cx="0" cy="${-h}" rx="3.8" ry="3.2" fill="#7B5BB5"></ellipse><ellipse cx="0" cy="${-h + 7}" rx="3.8" ry="3.2" fill="#7B5BB5"></ellipse><ellipse cx="0" cy="${-h + 14}" rx="3.4" ry="3" fill="#6A4BA5"></ellipse>`;
      return `<g class="grow"><g class="sway" style="animation-delay:${rand(-3, 0).toFixed(2)}s">${stem}${head}</g></g>`;
    }

    function nextKind() {
      if (seed !== 'mix') return seed;
      const k = KINDS[mixIndex % KINDS.length];
      mixIndex += 1 + Math.floor(Math.random() * 2);
      return k;
    }

    function placeFlower(kind, x, y, scale) {
      const h = (kind === 'sonnenblume' ? rand(42, 58) : kind === 'salbei' ? rand(30, 40) : rand(20, 34)) * scale;
      const g = mk('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})` });
      g.innerHTML = flowerMarkup(kind, h / scale);
      plantLayer.appendChild(g);
      state.targets.push([x, y - h]);
    }

    // ----- Punkte, Titel, Abzeichen -----
    function toast(text, sub) {
      toastEl.innerHTML = '';
      toastEl.append(document.createTextNode(text));
      if (sub) { const s = document.createElement('small'); s.textContent = sub; toastEl.append(s); }
      toastEl.classList.add('show');
      clearTimeout(toast.t);
      toast.t = setTimeout(() => toastEl.classList.remove('show'), sub ? 4200 : 2600);
    }
    function badge(name) {
      if (state.badges.includes(name)) return false;
      state.badges.push(name);
      return true;
    }
    function add(points) {
      state.score += points;
      let lvl = 0;
      TITLES.forEach(([min], i) => { if (state.score >= min) lvl = i; });
      if (lvl > state.level) {
        state.level = lvl;
        setTimeout(() => toast('Neuer Titel: ' + TITLES[lvl][1] + '!', 'Weiter so, das Grätzl wird immer bunter.'), 900);
      }
      if (state.score > best) {
        best = state.score;
        try { localStorage.setItem('lz-best', String(best)); } catch (e) { /* ohne Speicher geht's auch */ }
      }
    }
    function totalFlowers() {
      return state.meadow + state.roofs.reduce((a, b) => a + b, 0);
    }
    function meterValue() {
      const greenCount = state.green.filter(Boolean).length;
      return Math.min(100, Math.round(Math.min(totalFlowers(), 50) / 50 * 50 + greenCount * 10 + state.kinds.size / 6 * 10));
    }

    function refresh() {
      $('g-score').textContent = state.score;
      $('g-title').textContent = TITLES[state.level][1];
      $('g-flowers').textContent = totalFlowers();
      $('g-bees').textContent = bees.length;
      $('g-houses').textContent = state.green.filter(Boolean).length;
      $('g-species').textContent = state.kinds.size;
      $('g-best').textContent = best;
      const m = meterValue();
      $('g-meter-fill').style.width = m + '%';
      $('g-meter').setAttribute('aria-valuenow', String(m));
      $('g-meter-label').textContent = 'Dein Grätzl blüht zu ' + m + ' %';
      const row = $('g-badges');
      row.innerHTML = '';
      if (!state.badges.length) {
        const s = document.createElement('span'); s.className = 'badge-empty'; s.textContent = 'Noch keine. Pflanz los!'; row.append(s);
      } else {
        state.badges.forEach((b) => { const s = document.createElement('span'); s.className = 'badge'; s.textContent = b; row.append(s); });
      }
    }

    function afterPlant(kind) {
      let msg = null;
      if (totalFlowers() === 1 && badge('Erste Blume')) msg = ['Die erste Blume wächst!', 'Klick weiter, und bald kommen die Hummeln.'];
      if (!state.kinds.has(kind)) {
        state.kinds.add(kind);
        add(30);
        msg = [SPECIES[kind].name + ': +30 für eine neue Art', SPECIES[kind].fact];
        if (state.kinds.size === KINDS.length && badge('Artenvielfalt')) {
          add(100);
          msg = ['Artenvielfalt! +100', 'Alle sechs Blumen blühen in deinem Grätzl.'];
        }
      }
      if (msg) toast(msg[0], msg[1]);
      syncBees();
      const m = meterValue();
      if (m >= 100 && !state.bloomed) {
        state.bloomed = true;
        badge('Das Grätzl blüht');
        add(200);
        celebrate();
        setTimeout(() => toast('Dein ganzes Grätzl blüht! +200', 'So schön kann es vor deiner Haustür sein. Komm in die Crew und lass es uns in echt machen.'), 400);
      }
      refresh();
    }

    // ----- Pflanzen -----
    function plantMeadow(x, y) {
      if (state.meadow >= MAX_MEADOW) { toast('Die Wiese ist voll. So viel Leben!', 'Probier es auf den Dächern.'); return; }
      const kind = nextKind();
      placeFlower(kind, x, Math.max(424, Math.min(512, y)), 1);
      state.meadow += 1;
      add(10);
      afterPlant(kind);
    }

    function plantRoof(i, x) {
      const hs = HOUSES[i];
      if (state.roofs[i] >= MAX_ROOF) { toast('Dieses Dach ist schon ein Garten!', 'Such dir ein anderes Haus.'); return; }
      const px = Math.max(hs.x0, Math.min(hs.x1, x + rand(-6, 6)));
      const ry = hs.roof(px);
      const tuft = mk('path', { d: `M${px - 9} ${ry + 1} Q${px - 4} ${ry - 7} ${px} ${ry + 1} Q${px + 4} ${ry - 8} ${px + 9} ${ry + 1} Z`, fill: '#7FA36F', class: 'grow' });
      plantLayer.appendChild(tuft);
      const kind = nextKind();
      placeFlower(kind, px, ry, 0.75);
      state.roofs[i] += 1;
      add(20);
      if (state.roofs[i] === GREEN_AT && !state.green[i]) {
        state.green[i] = true;
        greenHouse(i);
        add(50);
        const first = badge('Grünes Dach');
        toast('Ein Haus wird grün! +50', first ? 'Efeu klettert die Fassade hoch, und vor den Fenstern blüht es.' : 'Noch ein Haus atmet auf.');
        if (state.green.every(Boolean) && badge('Grüne Straße')) {
          add(150);
          setTimeout(() => toast('Alle Häuser sind grün! +150', 'Die ganze Straße ist ein Garten.'), 2600);
        }
      }
      afterPlant(kind);
    }

    function greenHouse(i) {
      const hs = HOUSES[i];
      const g = mk('g', { class: 'fade-in' });
      let parts = '';
      // Efeu an den Kanten
      [hs.x + 4, hs.x + hs.w - 4].forEach((vx, side) => {
        let d = `M${vx} ${hs.y + 6}`;
        for (let yy = hs.y + 6; yy < hs.y + hs.h; yy += 18) d += ` Q${vx + (side ? -8 : 8)} ${yy + 9} ${vx} ${yy + 18}`;
        parts += `<path d="${d}" fill="none" stroke="#4E7A45" stroke-width="3"></path>`;
        for (let yy = hs.y + 14; yy < hs.y + hs.h - 4; yy += 16) {
          parts += `<ellipse cx="${vx + (side ? -5 : 5)}" cy="${yy}" rx="6" ry="4" fill="${yy % 32 < 16 ? '#7FA36F' : '#5E7F5A'}"></ellipse>`;
        }
      });
      // Blumenkästen vor den Fenstern
      hs.windows.forEach(([wx, wy, ww, wh]) => {
        parts += `<rect x="${wx - 3}" y="${wy + wh - 2}" width="${ww + 6}" height="8" rx="2" fill="#A85E2B"></rect>`;
        for (let k = 0; k < 4; k++) {
          const cx = wx + 4 + k * (ww - 8) / 3;
          const col = ['#D7322B', '#F5C518', '#3C6FD1', '#FFFFFF'][(k + i) % 4];
          parts += `<circle cx="${cx.toFixed(1)}" cy="${wy + wh - 5}" r="4" fill="${col}"></circle>`;
        }
      });
      g.innerHTML = parts;
      ivyLayer.appendChild(g);
    }

    function houseAt(x, y) {
      for (let i = 0; i < HOUSES.length; i++) {
        const hs = HOUSES[i];
        if (x >= hs.x - 12 && x <= hs.x + hs.w + 12 && y <= hs.y + hs.h && y >= hs.roof(Math.max(hs.x0, Math.min(hs.x1, x))) - 30) return i;
      }
      return -1;
    }

    function handle(x, y) {
      if (!scene.meadowReady()) {
        scene.bloomNow();
        toast('Die Wiese ist bereit!', 'Jetzt kannst du pflanzen.');
        return;
      }
      if (y >= 414) { plantMeadow(x, y); return; }
      const i = houseAt(x, y);
      if (i >= 0) { plantRoof(i, x); return; }
      toast('Klick auf die Wiese oder auf ein Haus.', 'Im Himmel wächst leider nichts.');
    }

    svg.addEventListener('click', (e) => {
      if (e.target.closest('[data-click]')) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
      handle(loc.x, loc.y);
    });

    // ----- Hummeln -----
    const bees = [];
    function makeBee() {
      const g = mk('g', {});
      g.innerHTML = '<ellipse class="wing" cx="-3" cy="-6" rx="5" ry="3.6" fill="#FFFFFF" opacity=".9"></ellipse><ellipse class="wing" cx="4" cy="-6" rx="5" ry="3.6" fill="#FFFFFF" opacity=".9"></ellipse>' +
        '<ellipse cx="0" cy="0" rx="8" ry="6" fill="#F2B530" stroke="#3B2A1E" stroke-width="1.6"></ellipse><path d="M-2 -5.5 L-2 5.5 M3 -5 L3 5" stroke="#3B2A1E" stroke-width="2.2"></path>';
      beeLayer.appendChild(g);
      const fromLeft = Math.random() < 0.5;
      return { el: g, x: fromLeft ? -20 : 1220, y: rand(180, 380), tx: 600, ty: 300, wait: 0, speed: rand(70, 120), phase: rand(0, 6), face: 1 };
    }
    function pickTarget(b) {
      const t = state.targets.length ? state.targets[Math.floor(Math.random() * state.targets.length)] : [rand(60, 1140), rand(420, 480)];
      b.tx = t[0] + rand(-4, 4); b.ty = t[1] - 8;
    }
    function syncBees() {
      const want = Math.min(40, Math.floor(totalFlowers() / 2));
      while (bees.length < want) {
        const b = makeBee();
        pickTarget(b);
        bees.push(b);
        add(5);
        if (bees.length === 1 && badge('Erste Hummel')) setTimeout(() => toast('Die erste Hummel ist da! +5', 'Je mehr du pflanzt, desto mehr kommen.'), 1400);
        if (bees.length === 20 && badge('Hummelparadies')) setTimeout(() => toast('Hummelparadies! 20 Hummeln summen in deinem Grätzl.'), 1600);
      }
    }
    let last = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const b of bees) {
        if (b.wait > 0) {
          b.wait -= dt;
          if (b.wait <= 0) pickTarget(b);
        } else {
          const dx = b.tx - b.x, dy = b.ty - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 4) { b.wait = rand(0.8, 2.2); }
          else {
            const s = Math.min(d, b.speed * dt);
            b.x += dx / d * s; b.y += dy / d * s;
            if (Math.abs(dx) > 1) b.face = dx > 0 ? 1 : -1;
          }
        }
        const wob = reduceMotion ? 0 : Math.sin(now / 130 + b.phase) * 2.5;
        b.el.setAttribute('transform', `translate(${b.x.toFixed(1)} ${(b.y + wob).toFixed(1)}) scale(${b.face} 1)`);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // ----- Feier -----
    function celebrate() {
      if (reduceMotion) return;
      const cols = ['#F5C518', '#D7322B', '#3C6FD1', '#FFFFFF', '#7B5BB5', '#F2B530'];
      for (let k = 0; k < 60; k++) {
        const el = document.createElement('span');
        el.className = 'petal';
        el.style.left = rand(0, 100) + '%';
        el.style.background = cols[k % cols.length];
        el.style.animationDelay = rand(0, 1.2).toFixed(2) + 's';
        el.style.setProperty('--dx', rand(-80, 80).toFixed(0) + 'px');
        petals.appendChild(el);
        setTimeout(() => el.remove(), 4800);
      }
    }

    // ----- Knöpfe -----
    document.querySelectorAll('.seed').forEach((btn) => {
      btn.addEventListener('click', () => {
        seed = btn.dataset.seed;
        document.querySelectorAll('.seed').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      });
    });
    $('plant-one').addEventListener('click', () => {
      if (!scene.meadowReady()) { handle(600, 460); return; }
      plantMeadow(rand(30, 1170), rand(430, 508));
    });
    $('reset-garden').addEventListener('click', () => {
      plantLayer.innerHTML = '';
      ivyLayer.innerHTML = '';
      bees.splice(0).forEach((b) => b.el.remove());
      state = fresh();
      refresh();
      toast('Frischer Boden. Viel Freude beim Pflanzen!');
    });
    $('share-garden').addEventListener('click', async () => {
      const text = `Ich habe mit der Löwenzahn-Crew ${state.score} Blühpunkte gesammelt und mein Grätzl zum Blühen gebracht. Probier's aus:`;
      const url = location.href.split('#')[0];
      try {
        if (navigator.share) { await navigator.share({ title: 'Captain Dave & die Löwenzahn-Crew', text, url }); return; }
        await navigator.clipboard.writeText(text + ' ' + url);
        toast('Text kopiert!', 'Füg ihn ein, wo du magst, und lade Freunde ein.');
      } catch (e) {
        toast('Teilen hat gerade nicht geklappt.', 'Du kannst einfach die Adresse dieser Seite weitergeben.');
      }
    });

    scene.setOnArrive(() => toast('Jetzt bist du dran!', 'Klick auf die Wiese oder auf ein Haus und lass dein Grätzl blühen.'));

    state = fresh();
    refresh();
  }

  // ---------- Anheuern-Seite ----------
  function hirePage() {
    let offer = 'buffet';
    let sent = false;
    const select = document.getElementById('f-offer');

    function update() {
      render({ offer, isBuffet: offer === 'buffet', sent, notSent: !sent });
    }

    const picks = { pickBuffet: 'buffet', pickFerment: 'ferment', pickModeration: 'moderation', pickNonviolence: 'nonviolence' };
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-click]');
      if (!t) return;
      const a = t.dataset.click;
      if (picks[a]) { offer = picks[a]; update(); }
      if (a === 'send') send();
    });
    if (select) select.addEventListener('change', () => { offer = select.value; update(); });

    function val(id) {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }

    function send() {
      const offerText = select ? select.options[select.selectedIndex].text : offer;
      const lines = [
        'Hallo Captain Dave,',
        '',
        'ich möchte euch anheuern für: ' + offerText,
        '',
        'Name: ' + val('f-name'),
        'E-Mail: ' + val('f-mail'),
        'Wann: ' + val('f-date'),
        'Wie viele Menschen: ' + val('f-people'),
        'Wo: ' + val('f-place')
      ];
      if (offer === 'buffet') {
        document.querySelectorAll('[data-if="isBuffet"] label').forEach((l) => {
          const box = l.querySelector('input[type=checkbox]');
          if (box) lines.push((box.checked ? 'Ja: ' : 'Nein: ') + l.textContent.trim());
        });
      }
      lines.push('', val('f-msg'));
      const href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent('Anheuern: ' + offerText) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = href;
      sent = true;
      update();
    }

    update();
  }

  document.addEventListener('DOMContentLoaded', () => {
    collect();
    if (document.body.dataset.page === 'home') homePage();
    if (document.body.dataset.page === 'anheuern') hirePage();
  });
})();
