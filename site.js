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

    [{ color: ink, alpha: 0.16, seed: 1.3, dy: 0 },
     { color: red, alpha: 0.22, seed: 4.1, dy: h * 0.06 }].forEach(function (s) {
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

  /* ── Ticker-board scramble (hero role) ────────────────────── */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—';
  document.querySelectorAll('[data-scramble]').forEach(function (el) {
    if (reduced) return;
    var final = el.textContent;
    var frame = 0, settle = 0;
    var total = Math.max(26, final.length + 14);
    function step() {
      settle = Math.floor((frame / total) * final.length);
      var out = '';
      for (var i = 0; i < final.length; i++) {
        var ch = final[i];
        out += (i < settle || ch === ' ' || ch === ',' || ch === '.')
          ? ch
          : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (++frame <= total) requestAnimationFrame(step);
      else el.textContent = final;
    }
    // start once the load-reveal delay has played
    setTimeout(function () { requestAnimationFrame(step); }, 320);
  });

  /* ── Competency radar (inline SVG) ────────────────────────── */
  var radar = document.getElementById('radar');
  if (radar) {
    var AXES = [
      { label: 'CLIENT RELATIONS', v: 91 },
      { label: 'SALES', v: 88 },
      { label: 'OPERATIONS', v: 86 },
      { label: 'FIN. PRODUCTS', v: 90 },
      { label: 'DISCOVERY', v: 87 },
      { label: 'TECHNICAL', v: 83 }
    ];
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
    var labels = radar.querySelector('.radar-labels');
    AXES.forEach(function (a, i) {
      var p = pt(i, R * a.v / 100);
      el('circle', { cx: p[0], cy: p[1], r: 3, 'class': 'radar-dot' }, dots);
      var lp = pt(i, R + 24);
      var anchor = Math.abs(lp[0] - CX) < 8 ? 'middle' : (lp[0] > CX ? 'start' : 'end');
      var t = el('text', { x: lp[0], y: lp[1] + 3, 'text-anchor': anchor, 'class': 'radar-label' }, labels);
      t.textContent = a.label + ' ';
      var v = document.createElementNS(NS, 'tspan');
      v.setAttribute('class', 'radar-val');
      v.textContent = a.v;
      t.appendChild(v);
    });
  }

  /* ── Scroll reveals (+ arm rings when visible) ────────────── */
  function armRings(scope) {
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
