// Captain Dave & die Löwenzahn-Crew
// Hier deine echte E-Mail-Adresse eintragen, an die Anheuer-Anfragen gehen sollen:
const CONTACT_EMAIL = 'DEINE-EMAIL@beispiel.at';

(function () {
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
      'Hummeln summen, Menschen reden und ruhen sich aus. Das Leben ist wieder lebenswert.'
    ];
    const marks = [0, 24, 46, 64, 80, 100];
    const steps = Array.from(document.querySelectorAll('.step'));

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
        houseA: arrived ? '#E9DCC4' : '#B8B4AD',
        houseB: arrived ? '#D9C6A5' : '#A6A19A',
        roof: arrived ? '#C97B3D' : '#8C8781',
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
        if (p >= 100) { p = 100; playing = false; halt(); }
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
    const scene = document.querySelector('.scene');
    let started = false;
    if (scene && 'IntersectionObserver' in window) {
      new IntersectionObserver((entries, obs) => {
        if (!started && entries.some((en) => en.isIntersecting)) {
          started = true;
          obs.disconnect();
          setTimeout(start, 600);
        }
      }, { threshold: 0.35 }).observe(scene);
    } else {
      setTimeout(start, 900);
    }
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
