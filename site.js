/* matinsaiyed.com — theme, motion, and restored instruments
   (hero market-line, ticker-board scramble, competency radar,
    performance rings, section rail, back-to-top, contact form) */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Theme toggle ─────────────────────────────────────────── */
  var btn = document.getElementById('theme-toggle');
  var label = btn && btn.querySelector('.toggle-label');

  function syncLabel() {
    if (!label) return;
    var dark = root.dataset.theme === 'dark';
    label.textContent = dark ? label.dataset.dark : label.dataset.light;
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  syncLabel();

  if (btn) {
    btn.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      localStorage.setItem('ms-theme', next);
      syncLabel();
      drawChartSoon(); // re-ink the hero chart in the new palette
    });
  }

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('ms-theme')) {
      root.dataset.theme = e.matches ? 'dark' : 'light';
      syncLabel();
      drawChartSoon();
    }
  });

  /* ── Hero market-line canvas ──────────────────────────────────
     A slow-drifting index chart behind the hero — the after-hours
     tape. Two series: ink (faint) and red (accent). Static when
     prefers-reduced-motion. */
  var canvas = document.getElementById('hero-chart');
  var ctx = canvas && canvas.getContext('2d');
  var chartT = 0;
  var rafId = null;
  var heroVisible = true;

  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  // Deterministic smooth pseudo-noise (sum of sines) — seedless and seamless.
  function series(t, x, seed) {
    return (
      Math.sin(x * 0.013 + t + seed) * 0.45 +
      Math.sin(x * 0.031 + t * 1.7 + seed * 2.1) * 0.3 +
      Math.sin(x * 0.007 - t * 0.6 + seed * 3.7) * 0.25
    );
  }

  var pointer = { x: -1, y: -1 }; // hero-local pointer for the crosshair

  function drawChart() {
    if (!ctx) return;
    var dpr = Math.min(devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var ink = cssVar('--ink-faint') || '#8d8474';
    var red = cssVar('--red') || '#9e1b1b';
    var base = h * 0.62, amp = h * 0.2;
    var accent = { seed: 4.1, dy: h * 0.06 };

    [{ color: ink, alpha: 0.16, seed: 1.3, dy: 0 },
     { color: red, alpha: 0.22, seed: accent.seed, dy: accent.dy }].forEach(function (s) {
      ctx.beginPath();
      for (var x = 0; x <= w; x += 4) {
        var y = base + s.dy + series(chartT, x, s.seed) * amp;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.lineWidth = 1.25;
      ctx.stroke();
      // soft area under the accent line
      if (s.color === red) {
        ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
        ctx.globalAlpha = s.alpha * 0.25;
        ctx.fillStyle = s.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });

    /* trading-terminal crosshair: hairline + node + index readout */
    if (pointer.x >= 0 && pointer.x <= w && pointer.y >= 0 && pointer.y <= h) {
      var px = pointer.x;
      var py = base + accent.dy + series(chartT, px, accent.seed) * amp;
      ctx.strokeStyle = ink;
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = red;
      ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
      var idx = (1180 + series(chartT, px, accent.seed) * 240);
      var lblText = 'MS-IDX ' + idx.toFixed(2);
      ctx.font = '11px "IBM Plex Mono", monospace';
      var tw = ctx.measureText(lblText).width + 12;
      var lx = Math.min(px + 10, w - tw - 4);
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = cssVar('--ink') || '#211d17';
      ctx.fillRect(lx, py - 22, tw, 17);
      ctx.fillStyle = cssVar('--paper') || '#f5f1e8';
      ctx.fillText(lblText, lx + 6, py - 10);
      ctx.globalAlpha = 1;
    }
  }

  function tickChart() {
    chartT += 0.0035;
    drawChart();
    rafId = heroVisible ? requestAnimationFrame(tickChart) : null;
  }

  var drawTimer = null;
  function drawChartSoon() {
    clearTimeout(drawTimer);
    drawTimer = setTimeout(drawChart, 340); // after the theme transition settles
  }

  if (canvas) {
    drawChart();
    if (!reduced) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          heroVisible = en[0].isIntersecting;
          if (heroVisible && rafId === null) rafId = requestAnimationFrame(tickChart);
        }).observe(canvas);
      }
      rafId = requestAnimationFrame(tickChart);
    }
    addEventListener('resize', drawChart, { passive: true });
  }

  /* pointer tracking for the hero crosshair (hover devices) */
  var hoverable = matchMedia('(hover: hover)').matches;
  var hero = document.querySelector('.hero');
  if (hero && canvas && hoverable) {
    hero.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      if (reduced) drawChart(); // static chart still gets a live crosshair
    });
    hero.addEventListener('pointerleave', function () {
      pointer.x = -1; pointer.y = -1;
      if (reduced) drawChart();
    });
  }

  /* cursor spotlight — eased follow */
  var glow = document.getElementById('cursor-glow');
  if (glow && hoverable) {
    var gx = innerWidth / 2, gy = innerHeight / 3, tx2 = gx, ty2 = gy, glowRaf = null;
    function glowTick() {
      gx += (tx2 - gx) * 0.16;
      gy += (ty2 - gy) * 0.16;
      glow.style.setProperty('--mx', gx + 'px');
      glow.style.setProperty('--my', gy + 'px');
      if (Math.abs(tx2 - gx) + Math.abs(ty2 - gy) > 0.4) glowRaf = requestAnimationFrame(glowTick);
      else glowRaf = null;
    }
    addEventListener('pointermove', function (e) {
      tx2 = e.clientX; ty2 = e.clientY;
      glow.classList.add('on');
      if (reduced) {
        glow.style.setProperty('--mx', tx2 + 'px');
        glow.style.setProperty('--my', ty2 + 'px');
      } else if (glowRaf === null) glowRaf = requestAnimationFrame(glowTick);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { glow.classList.remove('on'); });
  }

  /* portrait tilt — a nod to the old 3D scene */
  var portrait = document.querySelector('.hero-portrait');
  if (portrait && hoverable && !reduced) {
    var pic = portrait.querySelector('picture');
    portrait.addEventListener('pointermove', function (e) {
      var r = portrait.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      pic.style.setProperty('--ty', (dx * 7) + 'deg');
      pic.style.setProperty('--tx', (-dy * 7) + 'deg');
    });
    portrait.addEventListener('pointerleave', function () {
      pic.style.setProperty('--tx', '0deg');
      pic.style.setProperty('--ty', '0deg');
    });
  }

  /* ── Ticker-board scramble (hero role) ────────────────────── */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—';

  function scramble(el) {
    if (reduced || el.dataset.scrambling) return;
    el.dataset.scrambling = '1';
    var final = el.dataset.final || el.textContent;
    el.dataset.final = final;
    var frame = 0;
    var total = Math.max(22, final.length + 12);
    function step() {
      var settle = Math.floor((frame / total) * final.length);
      var out = '';
      for (var i = 0; i < final.length; i++) {
        var ch = final[i];
        out += (i < settle || ch === ' ' || ch === ',' || ch === '.')
          ? ch
          : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (++frame <= total) requestAnimationFrame(step);
      else { el.textContent = final; delete el.dataset.scrambling; }
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('[data-scramble]').forEach(function (el) {
    setTimeout(function () { scramble(el); }, 320);        // settle on load…
    el.addEventListener('pointerenter', function () { scramble(el); }); // …re-flip on hover
  });

  // section ITEM labels flicker like a departures board on hover
  document.querySelectorAll('[data-scramble-hover]').forEach(function (el) {
    var head = el.closest('.item-head') || el;
    head.addEventListener('pointerenter', function () { scramble(el); });
  });

  /* ── Competency radar (inline SVG, interactive) ───────────── */
  var radar = document.getElementById('radar');
  var AXES = [
    { label: 'CLIENT RELATIONS', v: 91, skills: [
      ['Client Retention', 95], ['Active Listening', 92], ['Communication', 90], ['Empathy', 88]] },
    { label: 'SALES', v: 88, skills: [
      ['Target Achievement', 97], ['Negotiation', 88], ['Upselling', 85], ['Cross-selling', 82]] },
    { label: 'OPERATIONS', v: 86, skills: [
      ['Service Quality', 98], ['Knowledge Base', 97], ['Follow-up', 95], ['Response Time', 94], ['Process Automation', 85]] },
    { label: 'FIN. PRODUCTS', v: 90, skills: [
      ['Mutual Funds', 95], ['RRSP / TFSA', 90], ['Regulatory Compliance', 88], ['GICs', 85]] },
    { label: 'DISCOVERY', v: 87, skills: [
      ['Needs Assessment', 93], ['Solution Design', 88], ['Strategic Planning', 85], ['Consulting', 80]] },
    { label: 'TECHNICAL', v: 83, skills: [
      ['Excel', 95], ['Salesforce CRM', 88], ['Power BI', 85], ['SQL', 82], ['Python', 78]] }
  ];
  var TOP_SKILLS = [
    ['Target Achievement', 97], ['Client Retention', 95], ['Mutual Funds', 95], ['Excel', 95],
    ['Needs Assessment', 93], ['Active Listening', 92], ['RRSP / TFSA', 90], ['Salesforce CRM', 88],
    ['Regulatory Compliance', 88], ['Power BI', 85]
  ];

  /* skills panel renderer — rows rebuilt per selection, bars re-animate */
  var skillsRows = document.getElementById('skills-rows');
  var skillsTitle = document.getElementById('skills-title');
  var skillsReset = document.getElementById('skills-reset');
  var skillsIndexEl = document.getElementById('skills-index');
  var selectedAxis = -1;

  function renderSkills(list, title) {
    if (!skillsRows) return;
    skillsTitle.textContent = title;
    skillsRows.innerHTML = list.map(function (s) {
      return '<div class="skillbar"><span>' + s[0] + '</span><span class="bar"><i style="--w:' + s[1] +
        '%"></i></span><b class="mono">' + s[1] + '</b></div>';
    }).join('');
    if (skillsIndexEl) {
      skillsIndexEl.classList.remove('armed');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { skillsIndexEl.classList.add('armed'); });
      });
    }
  }

  function selectAxis(i) {
    selectedAxis = i;
    if (radar) radar.querySelectorAll('.radar-hit').forEach(function (g, gi) {
      g.classList.toggle('sel', gi === i);
      g.setAttribute('aria-pressed', gi === i ? 'true' : 'false');
    });
    if (i < 0) {
      renderSkills(TOP_SKILLS, 'SKILLS INDEX — ALL COMPETENCIES');
      if (skillsReset) skillsReset.hidden = true;
    } else {
      renderSkills(AXES[i].skills, 'SKILLS INDEX — ' + AXES[i].label + ' · ' + AXES[i].v + '/100');
      if (skillsReset) skillsReset.hidden = false;
    }
  }

  if (skillsReset) skillsReset.addEventListener('click', function () { selectAxis(-1); });
  renderSkills(TOP_SKILLS, 'SKILLS INDEX — ALL COMPETENCIES');

  if (radar) {
    var CX = 180, CY = 162, R = 112;
    var NS = 'http://www.w3.org/2000/svg';

    function pt(i, r) {
      var a = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
      return [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
    }
    function el(tag, attrs, parent) {
      var e = document.createElementNS(NS, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      parent.appendChild(e);
      return e;
    }

    var grid = radar.querySelector('.radar-grid');
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var pts = AXES.map(function (_, i) { return pt(i, R * f).join(','); }).join(' ');
      el('polygon', { points: pts, 'class': 'grid-line' }, grid);
    });
    AXES.forEach(function (_, i) {
      var p = pt(i, R);
      el('line', { x1: CX, y1: CY, x2: p[0], y2: p[1], 'class': 'grid-axis' }, grid);
    });

    var shapePts = AXES.map(function (a, i) { return pt(i, R * a.v / 100).join(','); }).join(' ');
    radar.querySelector('.radar-shape').setAttribute('points', shapePts);

    var dots = radar.querySelector('.radar-dots');
    AXES.forEach(function (a, i) {
      var g = el('g', { 'class': 'radar-hit', role: 'button', tabindex: 0,
        'aria-pressed': 'false',
        'aria-label': a.label + ' — ' + a.v + ' out of 100. Activate to drill into these skills.' }, dots);
      var p = pt(i, R * a.v / 100);
      // generous invisible hit area around the node
      el('circle', { cx: p[0], cy: p[1], r: 16, fill: 'transparent' }, g);
      el('circle', { cx: p[0], cy: p[1], r: 3, 'class': 'radar-dot' }, g);
      var lp = pt(i, R + 24);
      var anchor = Math.abs(lp[0] - CX) < 8 ? 'middle' : (lp[0] > CX ? 'start' : 'end');
      var t = el('text', { x: lp[0], y: lp[1] + 3, 'text-anchor': anchor, 'class': 'radar-label' }, g);
      t.textContent = a.label + ' ';
      var v = document.createElementNS(NS, 'tspan');
      v.setAttribute('class', 'radar-val');
      v.textContent = a.v;
      t.appendChild(v);

      function activate() { selectAxis(selectedAxis === i ? -1 : i); }
      g.addEventListener('click', activate);
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
  }

  /* ── Scroll reveals (+ arm rings when visible) ────────────── */
  function armRings(scope) {
    if (scope.querySelector && scope.querySelector('#skills-index')) {
      scope.querySelector('#skills-index').classList.add('armed');
    }
    scope.querySelectorAll('.ring').forEach(function (svg) {
      var pct = parseFloat(svg.dataset.pct) || 0;
      var C = 2 * Math.PI * 32; // r=32 → ≈201
      svg.querySelector('.ring-fill').style.setProperty('--off', String(C * (1 - pct / 100)));
    });
    scope.querySelectorAll('[data-ring-count]').forEach(function (n) {
      countUp(n, parseInt(n.dataset.ringCount, 10), n.dataset.prefix || '', n.dataset.suffix || '');
    });
  }

  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          armRings(en.target);
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
      armRings(el);
      el.querySelectorAll('[data-ring-count]').forEach(function (n) {
        n.textContent = (n.dataset.prefix || '') + n.dataset.ringCount + (n.dataset.suffix || '');
      });
    });
  }

  /* ── Count-up (ticker + rings) ────────────────────────────── */
  function countUp(node, target, prefix, suffix) {
    if (reduced) { node.textContent = prefix + target + suffix; return; }
    var start = null, dur = 1100;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      node.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (!reduced && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          countUp(en.target, parseInt(en.target.dataset.count, 10), en.target.dataset.prefix || '', en.target.dataset.suffix || '');
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* ── Section rail — active tracking ───────────────────────── */
  var railLinks = document.querySelectorAll('.rail a');
  if (railLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    railLinks.forEach(function (a) { byId[a.dataset.rail] = a; });
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          railLinks.forEach(function (a) { a.classList.remove('active'); });
          var link = byId[en.target.id];
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -52% 0px' });
    document.querySelectorAll('main section[id], main#top').forEach(function (s) { sio.observe(s); });
  }

  /* ── Back to top ──────────────────────────────────────────── */
  var topBtn = document.getElementById('back-to-top');
  if (topBtn) {
    var ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        topBtn.classList.toggle('show', scrollY > innerHeight);
        ticking = false;
      });
    }, { passive: true });
    topBtn.addEventListener('click', function () {
      scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ── Reference exhibit (testimonial carousel) ─────────────── */
  var QUOTES = [
    { text: '\u201cMatin has a rare combination of analytical thinking and genuine empathy for clients. He doesn\u2019t just meet targets \u2014 he builds relationships that make those targets sustainable. His capacity growth work was nothing short of transformative.\u201d',
      who: 'Regional Operations Director', what: 'DIRECT SUPERVISOR · PROMETRIC CENTER' },
    { text: '\u201cWhat sets Matin apart is his ability to truly listen. He took the time to understand my financial goals before recommending any products. I felt like a person, not a transaction. That level of care is rare in financial services.\u201d',
      who: 'Investment Client', what: 'CLIENT · GOLDEN QUASAR INC' },
    { text: '\u201cDuring our collaboration at Collision Conference, Matin led a team of 20 volunteers with remarkable composure. He balanced operational demands with team morale in a way that felt effortless, though I know it wasn\u2019t.\u201d',
      who: 'Event Coordinator', what: 'PROGRAM MANAGER · WEB SUMMIT / COLLISION' },
    { text: '\u201cMatin brought a fresh perspective to our research division. His financial models were thorough, his client presentations were polished, and he consistently went beyond what was asked. A natural self-starter with a strong work ethic.\u201d',
      who: 'Research Team Lead', what: 'SENIOR ANALYST · INVESTOR QUOTIENT IQ' }
  ];

  var exQuote = document.getElementById('exhibit-quote');
  if (exQuote) {
    var exText = document.getElementById('exhibit-text');
    var exCite = document.getElementById('exhibit-cite');
    var exRole = document.getElementById('exhibit-role');
    var exList = document.getElementById('exhibit-list');
    var exCounter = document.getElementById('exhibit-counter');
    var exIdx = 0;
    var exTimer = null;

    QUOTES.forEach(function (q, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'exhibit-item';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.innerHTML = '<span class="who">' + q.who + '</span><span class="what">' + q.what + '</span>';
      b.addEventListener('click', function () { showQuote(i, true); });
      exList.appendChild(b);
    });
    var exItems = exList.querySelectorAll('.exhibit-item');

    function setQuote(i) {
      exText.textContent = QUOTES[i].text;
      exCite.textContent = QUOTES[i].who;
      exRole.textContent = QUOTES[i].what.toLowerCase();
      exCounter.textContent = (i + 1) + ' / ' + QUOTES.length;
      exItems.forEach(function (b, bi) { b.setAttribute('aria-selected', bi === i ? 'true' : 'false'); });
    }

    function showQuote(i, manual) {
      exIdx = (i + QUOTES.length) % QUOTES.length;
      if (manual) stopAuto();
      if (reduced) { setQuote(exIdx); return; }
      exQuote.classList.add('fading');
      setTimeout(function () {
        setQuote(exIdx);
        exQuote.classList.remove('fading');
      }, 270);
    }

    function stopAuto() {
      if (exTimer) { clearInterval(exTimer); exTimer = null; }
    }

    document.getElementById('exhibit-prev').addEventListener('click', function () { showQuote(exIdx - 1, true); });
    document.getElementById('exhibit-next').addEventListener('click', function () { showQuote(exIdx + 1, true); });
    exQuote.addEventListener('mouseenter', stopAuto);

    setQuote(0);
    // auto-advance until the reader interacts
    if (!reduced) exTimer = setInterval(function () { showQuote(exIdx + 1, false); }, 8000);
  }

  /* ── Contact form → composes an email locally ─────────────── */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(form);
      var subject = 'Website inquiry from ' + (f.get('name') || '');
      var body = (f.get('message') || '') + '\n\n— ' + (f.get('name') || '') + ' <' + (f.get('email') || '') + '>';
      location.href = 'mailto:matinsaiyed310@gmail.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
