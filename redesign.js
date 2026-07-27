/* ═══════════════════════════════════════════════════════════════
   redesign.js — matinsaiyed.com "Personal Annual Report"
   Vanilla port of the Claude Design inline Component logic.
   No modules, no build step, no external requests. ES5/ES2017 syntax.

   GSAP + ScrollTrigger are loaded globally by the page (/vendor/*.min.js);
   every use is guarded so the page still works if they are missing.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  var EMAIL = 'matinsaiyed310@gmail.com';

  /* ── tiny helpers ─────────────────────────────────────────── */
  function $(sel, ctx) { try { return (ctx || document).querySelector(sel); } catch (e) { return null; } }
  function $$(sel, ctx) {
    try { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
    catch (e) { return []; }
  }
  function mq(q) { return !!(window.matchMedia && matchMedia(q).matches); }
  function REDUCED() { return mq('(prefers-reduced-motion: reduce)'); }
  var FINE = window.matchMedia ? mq('(pointer: fine)') : true;
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function cssVar(name, fallback) {
    try {
      var v = getComputedStyle(root).getPropertyValue(name);
      return (v && v.trim()) || fallback;
    } catch (e) { return fallback; }
  }
  /* prop reads become data-attribute reads: attribute if present, else default */
  function dataStr(el, name, dflt) {
    if (!el) return dflt;
    var v = el.getAttribute(name);
    return (v === null || v === '') ? dflt : v;
  }
  function dataBool(el, name, dflt) {
    var v = dataStr(el, name, null);
    if (v === null) return dflt;
    v = String(v).toLowerCase();
    return !(v === 'false' || v === '0' || v === 'off' || v === 'no');
  }
  function dataNum(el, name, dflt) {
    var v = parseFloat(dataStr(el, name, ''));
    return isFinite(v) ? v : dflt;
  }

  /* every rAF / interval registers a stopper here; all are torn down on pagehide */
  var STOPPERS = [];
  function onTeardown(fn) { STOPPERS.push(fn); }
  window.addEventListener('pagehide', function () {
    for (var i = 0; i < STOPPERS.length; i++) { try { STOPPERS[i](); } catch (e) { /* noop */ } }
  });

  /* ═════════════════════════════════════════════════════════════
     1 · THEME  (was _toggleTheme / _syncToggle / componentDidMount)
     ═════════════════════════════════════════════════════════════ */
  function syncToggle() {
    var dark = root.dataset.theme === 'dark';
    var tc = document.querySelector('meta[name="theme-color"]');
    if (!tc && document.head) {
      tc = document.createElement('meta');
      tc.name = 'theme-color';
      document.head.appendChild(tc);
    }
    /* mobile browser chrome follows the theme */
    if (tc) tc.content = dark ? '#0a0a0a' : '#f4f3f0';
    var lb = document.getElementById('theme-label');
    if (lb) lb.textContent = dark ? 'INK' : 'PAPER';
    var th = document.getElementById('theme-thumb');
    if (th) th.style.transform = dark ? 'translateX(16px)' : 'translateX(0)';
  }

  function toggleTheme() {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('ms-theme', next); } catch (e) { /* private mode */ }
    syncToggle();
  }

  function bootTheme() {
    /* defaultTheme prop → optional data-default-theme on <html>; default 'auto' */
    var pref = dataStr(root, 'data-default-theme', 'auto');
    var t;
    if (pref === 'ink') t = 'dark';
    else if (pref === 'paper') t = 'light';
    else {
      var saved = null;
      try { saved = localStorage.getItem('ms-theme'); } catch (e) { /* noop */ }
      t = (saved === 'dark' || saved === 'light') ? saved : (mq('(prefers-color-scheme: dark)') ? 'dark' : 'light');
    }
    root.dataset.theme = t;
    syncToggle();

    var btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  }

  /* ═════════════════════════════════════════════════════════════
     2 · style-hover / style-focus  (was provided by the DC runtime)
     ═════════════════════════════════════════════════════════════ */
  function parseDecls(txt) {
    var out = [];
    String(txt || '').split(';').forEach(function (part) {
      var i = part.indexOf(':');
      if (i < 0) return;
      var prop = part.slice(0, i).trim();
      var val = part.slice(i + 1).trim();
      if (prop && val) out.push([prop, val]);
    });
    return out;
  }

  function bindStateStyle(el, attrName, onEvents, offEvents) {
    var decls = parseDecls(el.getAttribute(attrName));
    if (!decls.length) return;
    var saved = null;
    function on() {
      if (saved) return;
      saved = decls.map(function (d) {
        return [d[0], el.style.getPropertyValue(d[0]), el.style.getPropertyPriority(d[0])];
      });
      decls.forEach(function (d) {
        try { el.style.setProperty(d[0], d[1]); } catch (e) { /* bad decl */ }
      });
    }
    function off() {
      if (!saved) return;
      saved.forEach(function (s) {
        el.style.removeProperty(s[0]);
        if (s[1]) { try { el.style.setProperty(s[0], s[1], s[2]); } catch (e) { /* noop */ } }
      });
      saved = null;
    }
    onEvents.forEach(function (ev) { el.addEventListener(ev, on); });
    offEvents.forEach(function (ev) { el.addEventListener(ev, off); });
  }

  function initStateStyles() {
    $$('[style-hover]').forEach(function (el) {
      bindStateStyle(el, 'style-hover', ['mouseenter'], ['mouseleave']);
    });
    $$('[style-focus]').forEach(function (el) {
      bindStateStyle(el, 'style-focus', ['focus'], ['blur']);
    });
  }

  /* ═════════════════════════════════════════════════════════════
     3 · CONTACT  (was copyEmail / _submitForm)
     ═════════════════════════════════════════════════════════════ */
  function initContact() {
    var btn = document.getElementById('copy-email');
    if (btn) {
      btn.addEventListener('click', function () {
        if (!navigator.clipboard || !navigator.clipboard.writeText) return;
        navigator.clipboard.writeText(EMAIL).then(function () {
          btn.textContent = 'COPIED ✓';
          btn.style.color = '#e0564a';
          btn.style.borderColor = '#e0564a';
          setTimeout(function () {
            btn.textContent = 'COPY';
            btn.style.color = '';
            btn.style.borderColor = '';
          }, 1600);
        }).catch(function () { /* clipboard denied */ });
      });
    }

    var form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var els = form.elements || {};
        var n = (els.name && els.name.value) || '';
        var em = (els.email && els.email.value) || '';
        var msg = (els.message && els.message.value) || '';
        location.href = 'mailto:' + EMAIL +
          '?subject=' + encodeURIComponent('Portfolio message from ' + n) +
          '&body=' + encodeURIComponent(msg + '\n\n— ' + n + ' (' + em + ')');
      });
    }
  }

  /* ═════════════════════════════════════════════════════════════
     4 · RADAR + section-hash sync  (was _initRadar)
     Five axes only: CLIENT RELATIONS 91 · SALES 88 · OPERATIONS 86 ·
     NEEDS DISCOVERY 87 · TECHNICAL 83 — the markup carries the geometry.
     ═════════════════════════════════════════════════════════════ */
  var radarInit = false;

  function initRadar() {
    var radar = document.getElementById('radar');
    if (radar && !radarInit) {
      radarInit = true;
      var rdots = $$('.radar-dot', radar);
      var rlabels = $$('text', radar);
      rdots.forEach(function (d) { d.style.transition = 'r .35s, fill .35s'; });
      rlabels.forEach(function (l) { l.style.transition = 'fill .35s'; l.style.cursor = 'pointer'; });

      var rcur = 0, rhold = 0;
      /* axis order → article order (2.1–2.5) — FIVE axes */
      var toArticle = [1, 2, 0, 3, 4], toAxis = [2, 0, 1, 3, 4];
      var getArts = function () { return $$('#competencies article'); };

      var rsel = function (i) {
        rcur = i;
        rdots.forEach(function (d, j) {
          d.setAttribute('r', j === i ? '5' : '3.2');
          d.setAttribute('fill', j === i ? 'var(--red)' : 'var(--ink)');
        });
        rlabels.forEach(function (l, j) { l.setAttribute('fill', j === i ? 'var(--red)' : 'var(--faint)'); });
        var ai = toArticle[i];
        getArts().forEach(function (a, j) {
          a.style.transition = 'opacity .35s, border-color .35s';
          a.style.opacity = j === ai ? '1' : '0.45';
          a.style.borderTopColor = j === ai ? 'var(--red)' : 'var(--rule)';
        });
      };

      rlabels.forEach(function (l, i) {
        l.addEventListener('mouseenter', function () { rhold = Date.now() + 8000; rsel(i); });
        l.addEventListener('click', function () { rhold = Date.now() + 8000; rsel(i); });
      });

      var comp = document.getElementById('competencies');
      if (comp) comp.addEventListener('mouseover', function (e) {
        var a = e.target && e.target.closest && e.target.closest('article');
        if (!a) return;
        var j = getArts().indexOf(a);
        if (j >= 0 && toAxis[j] !== undefined) { rhold = Date.now() + 8000; rsel(toAxis[j]); }
      });

      rsel(0);

      if (!REDUCED() && rdots.length) {
        /* auto-cycle — parked while the radar is off-screen or the tab is hidden */
        var onScreen = true;
        if ('IntersectionObserver' in window) {
          var vio = new IntersectionObserver(function (es) {
            es.forEach(function (e) { onScreen = e.isIntersecting; });
          }, { rootMargin: '120px' });
          vio.observe(radar);
          onTeardown(function () { vio.disconnect(); });
        }
        var tid = setInterval(function () {
          if (document.hidden || !onScreen) return;
          if (Date.now() < rhold) return;
          rsel((rcur + 1) % rdots.length);
        }, 4000);
        onTeardown(function () { clearInterval(tid); });
      }
    }

    /* shareable sections: keep the URL hash in sync with the section in view */
    if (!('IntersectionObserver' in window)) return;
    if (window.__msHashIO) window.__msHashIO.disconnect();
    window.__msHashIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        try {
          if (e.target.id === 'hero') history.replaceState(null, '', location.pathname + location.search);
          else history.replaceState(null, '', '#' + e.target.id);
        } catch (er) { /* noop */ }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('main section[id]').forEach(function (s) { window.__msHashIO.observe(s); });
    onTeardown(function () { if (window.__msHashIO) window.__msHashIO.disconnect(); });
  }

  /* ═════════════════════════════════════════════════════════════
     5 · EXPERIENCE fallback layout  (was _flattenXp)
     ═════════════════════════════════════════════════════════════ */
  function flattenXp() {
    var tr = document.getElementById('xp-track');
    if (tr) {
      tr.style.transform = 'none';
      tr.style.flexDirection = 'column';
      tr.style.alignItems = 'stretch';
      tr.style.width = 'auto';
      tr.style.height = 'auto';
      tr.style.gap = '56px';
      tr.style.padding = '0 20px 20px';
    }
    $$('#xp-track article').forEach(function (a) { a.style.width = 'auto'; a.style.paddingRight = '0'; });
    var pin = document.getElementById('xp-pin');
    if (pin) {
      pin.style.height = 'auto';
      pin.style.minHeight = '0';
      pin.style.overflow = 'visible';
      pin.style.paddingTop = '36px';
    }
    var yr = document.getElementById('xp-years'); if (yr) yr.style.display = 'none';
    var er = document.getElementById('xp-era-row'); if (er) er.style.display = 'none';
    var lg = document.getElementById('xp-ledger'); if (lg) lg.style.display = 'none';
  }

  /* ═════════════════════════════════════════════════════════════
     6 · STATIC FALLBACK  (was _staticFallback) — no GSAP / reduced motion
     ═════════════════════════════════════════════════════════════ */
  function staticFallback() {
    initRadar();
    flattenXp();
    $$('#xp-ledger [data-row]').forEach(function (r) { r.style.opacity = 1; });
    var c = document.getElementById('xp-count'); if (c) c.textContent = '6/6';
    $$('svg[data-ring]').forEach(function (svg) {
      var pct = parseFloat(svg.getAttribute('data-ring')) || 0;
      var f = $('[data-fill]', svg);
      if (f) f.setAttribute('stroke-dashoffset', String(201.06 * (1 - pct / 100)));
    });
    var btt = document.getElementById('btt');
    if (btt) {
      btt.style.opacity = 1;
      btt.style.pointerEvents = 'auto';
      btt.addEventListener('click', function () { window.scrollTo({ top: 0 }); });
    }
  }

  /* ═════════════════════════════════════════════════════════════
     7 · SCROLL FX  (was _fx) — GSAP + ScrollTrigger
     ═════════════════════════════════════════════════════════════ */
  function buildFx(g) {
    var ST = window.ScrollTrigger;

    if (window.__msFxCtx) { try { window.__msFxCtx.revert(); } catch (e) { /* noop */ } }
    window.__msFxCtx = g.context(function () {

      /* reveals */
      $$('[data-rv]').forEach(function (el) {
        g.from(el, {
          y: 26, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });

      /* counters */
      $$('[data-cnt]').forEach(function (el) {
        var end = parseFloat(el.getAttribute('data-cnt'));
        var from = parseFloat(el.getAttribute('data-from') || '0');
        var tpl = el.getAttribute('data-tpl') || '{v}';
        var o = { v: from };
        g.to(o, {
          v: end, duration: 1.6, ease: 'power2.out', snap: { v: 1 },
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: function () { el.textContent = tpl.replace('{v}', String(Math.round(o.v))); }
        });
      });

      /* rings */
      $$('svg[data-ring]').forEach(function (svg) {
        var pct = parseFloat(svg.getAttribute('data-ring')) || 0;
        var fill = $('[data-fill]', svg);
        if (fill) g.to(fill, {
          attr: { 'stroke-dashoffset': 201.06 * (1 - pct / 100) },
          duration: 1.5, ease: 'power3.out',
          scrollTrigger: { trigger: svg, start: 'top 88%', once: true }
        });
      });

      /* quarterly + exhibit bars */
      $$('[data-bar]').forEach(function (b, i) {
        g.from(b, {
          scaleY: 0, transformOrigin: 'bottom', duration: 0.9, delay: i * 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: b, start: 'top 92%', once: true }
        });
      });

      /* radar */
      var shape = document.getElementById('radar-shape');
      if (shape) {
        g.from(shape, {
          scale: 0, transformOrigin: '260px 158px', duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: '#radar', start: 'top 82%', once: true }
        });
        if ($$('.radar-dot').length) {
          g.from('.radar-dot', {
            scale: 0, transformOrigin: 'center', opacity: 0, duration: 0.5, stagger: 0.07,
            delay: 0.5, ease: 'back.out(2)',
            scrollTrigger: { trigger: '#radar', start: 'top 82%', once: true }
          });
        }
      }

      /* exhibit line draws */
      $$('svg [data-draw]').forEach(function (p) {
        if (!p.getTotalLength) return;
        var L = p.getTotalLength();
        p.style.strokeDasharray = L;
        p.style.strokeDashoffset = L;
        g.to(p, {
          strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut',
          scrollTrigger: { trigger: p.closest('figure') || p, start: 'top 86%', once: true }
        });
      });

      /* waffle dots */
      var wfd = $$('#waffle-svg circle');
      if (wfd.length) g.from(wfd, {
        scale: 0, transformOrigin: 'center', stagger: 0.012, duration: 0.4, ease: 'back.out(2)',
        scrollTrigger: { trigger: '#waffle-svg', start: 'top 88%', once: true }
      });

      /* atelier tiles deal in */
      if ($$('#atelier-tiles > div').length) {
        g.from('#atelier-tiles > div', {
          y: 34, rotation: -2.5, autoAlpha: 0, transformOrigin: 'bottom left',
          stagger: 0.08, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '#atelier-tiles', start: 'top 85%', once: true }
        });
      }

      /* statement word scrub */
      var st = document.getElementById('statement-text');
      if (st) {
        var words = (st.textContent || '').trim().split(/\s+/).filter(Boolean);
        if (words.length) {
          while (st.firstChild) st.removeChild(st.firstChild);
          words.forEach(function (w, i) {
            if (i) st.appendChild(document.createTextNode(' '));
            var sp = document.createElement('span');
            sp.style.opacity = '0.13';
            sp.textContent = w;
            st.appendChild(sp);
          });
          g.to(st.children, {
            opacity: 1, stagger: 0.05, ease: 'none',
            scrollTrigger: { trigger: st, start: 'top 80%', end: 'top 32%', scrub: true }
          });
        }
      }

      /* pinned experience — only where the horizontal journey fits */
      var pin = document.getElementById('xp-pin'), track = document.getElementById('xp-track');
      if (window.innerWidth <= 900) { flattenXp(); pin = null; }
      if (pin && track) {
        var segs = $$('#xp-years i');
        var rows = $$('#xp-ledger [data-row]');
        var count = document.getElementById('xp-count');
        var era = document.getElementById('xp-era');
        var ERAS = ['ERA VI · THE CLOSE', 'ERA V · THE BOOK OF CLIENTS', 'ERA IV · THE TURNAROUND',
          'ERA III · THE FLOOR', 'ERA II · THE CROWD', 'ERA I · THE APPRENTICESHIP'];
        var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 140); };
        g.to(track, {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: {
            trigger: pin, pin: true, scrub: 0.65, start: 'top top',
            end: function () { return '+=' + dist(); }, invalidateOnRefresh: true,
            onUpdate: function (self) {
              var p = self.progress, n = segs.length;
              segs.forEach(function (s, i) { s.style.transform = 'scaleX(' + clamp(p * n - i, 0, 1) + ')'; });
              var booked = p <= 0 ? 1 : Math.min(n, Math.floor(p * n) + 1);
              rows.forEach(function (r, i) { r.style.opacity = i < booked ? 1 : 0.28; });
              if (count) count.textContent = booked + '/6';
              if (era) era.textContent = ERAS[booked - 1] || ERAS[0];
            }
          }
        });
      }

      /* rail + masthead nav active */
      [['top', 'hero'], ['about', 'about'], ['competencies', 'competencies'], ['projects', 'projects'],
       ['experience', 'experience'], ['education', 'education'], ['atelier', 'atelier'], ['contact', 'contact']
      ].forEach(function (pair) {
        var sec = document.getElementById(pair[1]);
        var link = $('#rail a[data-rail="' + pair[0] + '"]');
        var nav = $('header nav a[href="#' + pair[0] + '"]');
        if (!sec) return;
        ST.create({
          trigger: sec, start: 'top 55%', end: 'bottom 45%',
          onToggle: function (self) {
            if (link) {
              link.style.color = self.isActive ? 'var(--red)' : 'var(--faint)';
              link.style.borderRightColor = self.isActive ? 'var(--red)' : 'transparent';
              if (self.isActive) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
            }
            if (nav) {
              nav.style.color = self.isActive ? 'var(--red)' : 'var(--soft)';
              if (self.isActive) nav.setAttribute('aria-current', 'true'); else nav.removeAttribute('aria-current');
            }
          }
        });
      });

      /* scroll progress */
      var prog = document.getElementById('scroll-progress');
      if (prog) ST.create({
        start: 0, end: 'max',
        onUpdate: function (s) { prog.style.transform = 'scaleX(' + s.progress + ')'; }
      });

      /* hero plate drift + footer wordmark parallax */
      var hero = document.getElementById('hero');
      if (hero && document.getElementById('hero-plate')) {
        g.to('#hero-plate', {
          y: 38, autoAlpha: 0, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: '75% top', scrub: true }
        });
      }
      if (document.getElementById('footer-word') && document.querySelector('footer')) {
        g.fromTo('#footer-word', { yPercent: 22 }, {
          yPercent: 0, ease: 'none',
          scrollTrigger: { trigger: 'footer', start: 'top bottom', end: 'bottom bottom', scrub: true }
        });
      }

      /* magnetic */
      if (mq('(pointer: fine)')) {
        $$('[data-magnetic]').forEach(function (el) {
          /* quickTo fns are rebuilt each init; listeners attach once and call the latest */
          el.__msQx = g.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
          el.__msQy = g.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
          if (!el.__msMag) {
            el.__msMag = 1;
            el.addEventListener('mousemove', function (e) {
              var r = el.getBoundingClientRect();
              if (el.__msQx) el.__msQx((e.clientX - r.left - r.width / 2) * 0.28);
              if (el.__msQy) el.__msQy((e.clientY - r.top - r.height / 2) * 0.34);
            });
            el.addEventListener('mouseleave', function () {
              if (el.__msQx) el.__msQx(0);
              if (el.__msQy) el.__msQy(0);
            });
          }
        });
      }

      /* back to top */
      var btt = document.getElementById('btt');
      if (btt) {
        ST.create({
          start: 600, end: 999999,
          onToggle: function (s) {
            btt.style.opacity = s.isActive ? 1 : 0;
            btt.style.pointerEvents = s.isActive ? 'auto' : 'none';
          }
        });
        if (!btt.__msB) {
          btt.__msB = 1;
          btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
        }
      }
    });
  }

  /* ═════════════════════════════════════════════════════════════
     8 · WAFFLE + INTRO + BOOT  (was _boot)
     ═════════════════════════════════════════════════════════════ */
  function buildWaffle() {
    var wf = document.getElementById('waffle-svg');
    if (!wf || wf.childElementCount) return;
    var NS = 'http://www.w3.org/2000/svg';
    for (var wi = 0; wi < 100; wi++) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', String(64 + (wi % 10) * 19.2));
      c.setAttribute('cy', String(14 + Math.floor(wi / 10) * 13.6));
      c.setAttribute('r', '3');
      c.setAttribute('fill', wi === 99 ? 'var(--red)' : 'var(--ink)');
      c.setAttribute('style', 'transform-box:fill-box;');
      wf.appendChild(c);
    }
  }

  function boot() {
    buildWaffle();

    var reduced = REDUCED();
    var g = window.gsap;
    if (g && window.ScrollTrigger) {
      try { g.registerPlugin(window.ScrollTrigger); } catch (e) { /* noop */ }
    }

    /* introSequence had no data-attribute in the ported markup: keep the 2400ms removal */
    var intro = document.getElementById('ms-intro');
    if (intro) setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 2400);

    if (!g || !window.ScrollTrigger || reduced) { staticFallback(); return; }

    /* build once, against the settled DOM, after the webfonts land */
    var run = function () {
      requestAnimationFrame(function () {
        if (window.__msFxBuilt) return;
        window.__msFxBuilt = true;
        initRadar();
        buildFx(g);
        try { window.ScrollTrigger.refresh(); } catch (e) { /* noop */ }
      });
    };
    setTimeout(function () {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(run).catch(run);
      } else { run(); }
    }, 400);
  }

  /* ═════════════════════════════════════════════════════════════
     9 · <x-import> ms-page-cursor — the cursor treatment
        data-cursor-mode / data-mode: 'subtle' (default) | 'full' | 'off'
     ═════════════════════════════════════════════════════════════ */
  function initCursor() {
    var host = $('x-import[component-from-global-scope="ms-page-cursor"]');
    var mode = dataStr(host, 'data-cursor-mode', null);
    if (mode === null) mode = dataStr(host, 'data-mode', 'subtle');
    if (host) host.style.display = 'none';
    if (mode === 'off' || !FINE || REDUCED() || !document.body) return;

    var ring = document.createElement('div');
    ring.setAttribute('aria-hidden', 'true');
    ring.style.cssText = 'position:fixed;left:0;top:0;width:26px;height:26px;margin:-13px 0 0 -13px;' +
      'border:1px solid var(--red);border-radius:50%;opacity:0;z-index:300;pointer-events:none;' +
      'transition:opacity .25s ease,width .18s ease,height .18s ease,margin .18s ease,background-color .18s ease;' +
      'will-change:transform;';
    document.body.appendChild(ring);

    var dot = null;
    if (mode === 'full') {
      root.style.cursor = 'none';
      dot = document.createElement('div');
      dot.setAttribute('aria-hidden', 'true');
      dot.style.cssText = 'position:fixed;left:0;top:0;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;' +
        'border-radius:50%;background:var(--red);opacity:0;z-index:301;pointer-events:none;will-change:transform;';
      document.body.appendChild(dot);
    }

    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, live = false;

    function park() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    function loop() {
      if (!live || document.hidden) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      ring.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      if (dot) dot.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0)';
    }
    function wake() {
      if (!live || document.hidden || raf) return;
      raf = requestAnimationFrame(loop);
    }

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!live) {
        live = true;
        cx = tx; cy = ty;
        ring.style.opacity = '0.55';
        if (dot) dot.style.opacity = '1';
      }
      wake();
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      live = false; park();
      ring.style.opacity = '0';
      if (dot) dot.style.opacity = '0';
    });

    /* grow over anything interactive */
    var HOT = 'a,button,input,textarea,select,summary,[data-magnetic],[role="button"],#radar text';
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      var hot = !!(t && t.closest && t.closest(HOT));
      ring.style.width = hot ? '46px' : '26px';
      ring.style.height = hot ? '46px' : '26px';
      ring.style.margin = hot ? '-23px 0 0 -23px' : '-13px 0 0 -13px';
      ring.style.backgroundColor = hot ? 'color-mix(in srgb, var(--red) 12%, transparent)' : 'transparent';
    }, { passive: true });

    document.addEventListener('visibilitychange', function () { if (document.hidden) park(); else wake(); });
    onTeardown(function () { live = false; park(); });
  }

  /* ═════════════════════════════════════════════════════════════
     10 · <x-import> ms-ambient — the ambient dust field
         data-ambient: 'true' (default) · data-count: 220
     ═════════════════════════════════════════════════════════════ */
  function initAmbient() {
    var host = $('x-import[component-from-global-scope="ms-ambient"]');
    var on = dataBool(host, 'data-ambient', true);
    var COUNT = Math.max(0, Math.round(dataNum(host, 'data-count', 220)));
    if (host) host.style.display = 'none';
    if (!on || !COUNT || !document.body) return;

    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    document.body.insertBefore(cv, document.body.firstChild);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, raf = 0, lastY = window.pageYOffset || 0, vel = 0;
    var xs = new Float32Array(COUNT), ys = new Float32Array(COUNT),
      zs = new Float32Array(COUNT), ss = new Float32Array(COUNT);

    function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
    for (var i = 0; i < COUNT; i++) {
      xs[i] = hash(i * 3); ys[i] = hash(i * 7);
      zs[i] = 0.3 + hash(i * 11) * 0.7; ss[i] = 0.7 + hash(i * 13) * 1.5;
    }

    function draw() {
      var dark = root.dataset.theme === 'dark';
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = dark ? '#6e6c64' : '#8a887f';
      for (var i = 0; i < COUNT; i++) {
        ctx.globalAlpha = (dark ? 0.28 : 0.38) * zs[i];
        ctx.fillRect(xs[i] * W, ys[i] * H, ss[i] * zs[i], ss[i] * zs[i]);
      }
      ctx.globalAlpha = 1;
    }

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function loop(now) {
      if (document.hidden) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
      var y = window.pageYOffset || 0;
      vel += ((y - lastY) - vel) * 0.08;
      lastY = y;
      for (var i = 0; i < COUNT; i++) {
        ys[i] -= 0.00004 + vel * 0.00014 * zs[i];
        xs[i] += Math.sin(now * 0.0002 + i * 2.1) * 0.000025;
        if (ys[i] < 0) ys[i] += 1; else if (ys[i] > 1) ys[i] -= 1;
        if (xs[i] < 0) xs[i] += 1; else if (xs[i] > 1) xs[i] -= 1;
      }
      draw();
    }

    window.addEventListener('resize', resize, { passive: true });
    if (window.MutationObserver) {
      new MutationObserver(function () { draw(); })
        .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    }
    resize();
    if (!REDUCED()) raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', function () {
      if (REDUCED()) return;
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
      else if (!raf) { lastY = window.pageYOffset || 0; raf = requestAnimationFrame(loop); }
    });
    onTeardown(function () { if (raf) { cancelAnimationFrame(raf); raf = 0; } });
  }

  /* ═════════════════════════════════════════════════════════════
     11 · <x-import> ms-hero-cover-figures — the hero plate
         data-plate-restates: 'true' (default) · data-world-w: 6.2
     ═════════════════════════════════════════════════════════════ */
  function initHeroPlate() {
    var host = $('x-import[component-from-global-scope="ms-hero-cover-figures"]');
    if (!host) return;
    host.style.display = 'block';

    var restates = dataBool(host, 'data-plate-restates', true);
    window.__MS_PLATE_STATIC = !restates;
    var worldW = dataNum(host, 'data-world-w', 6.2);

    var ALL_SPECS = [
      { font: '800 230px Archivo, sans-serif', lines: ['MATIN', 'SAIYED'], gap: 262, label: 'FINANCE & OPERATIONS ANALYST', hold: 6.5 },
      { font: '600 225px "IBM Plex Mono", monospace', lines: ['+25%'], gap: 0, label: 'VS. SALES TARGET', hold: 3.2 },
      { font: '600 225px "IBM Plex Mono", monospace', lines: ['96%'], gap: 0, label: 'CLIENT SATISFACTION', hold: 3.2 },
      { font: '600 165px "IBM Plex Mono", monospace', lines: ['68→94%'], gap: 0, label: 'SATISFACTION LIFT', hold: 3.2 },
      { font: '600 225px "IBM Plex Mono", monospace', lines: ['2026'], gap: 0, label: 'CFA LEVEL I CANDIDATE', hold: 3.2 }
    ];
    var SPECS = restates ? ALL_SPECS : [ALL_SPECS[0]];

    /* --- scaffolding the DC runtime used to mount --- */
    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';

    var fallback = document.createElement('div');
    fallback.setAttribute('aria-hidden', 'true');
    fallback.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
      'text-align:center;transition:opacity .6s ease;';
    var fw = document.createElement('span');
    fw.style.cssText = 'font:800 clamp(52px,8.6vw,132px)/0.86 Archivo,sans-serif;letter-spacing:-0.02em;color:var(--ink);';
    fw.appendChild(document.createTextNode('MATIN'));
    fw.appendChild(document.createElement('br'));
    fw.appendChild(document.createTextNode('SAIYED'));
    fallback.appendChild(fw);

    var label = document.createElement('p');
    label.style.cssText = 'position:absolute;left:0;right:0;bottom:0;margin:0;text-align:center;' +
      "font:500 10px 'IBM Plex Mono',monospace;letter-spacing:0.2em;color:var(--faint);" +
      'transition:opacity .3s ease;opacity:0;';
    label.textContent = SPECS[0].label;

    var ticks = document.createElement('div');
    ticks.setAttribute('aria-hidden', 'true');
    ticks.style.cssText = 'position:absolute;left:0;right:0;bottom:18px;display:flex;justify-content:center;gap:6px;';
    var tickEls = [];
    if (SPECS.length > 1) {
      for (var ti = 0; ti < SPECS.length; ti++) {
        var tk = document.createElement('i');
        tk.style.cssText = 'display:block;width:14px;height:2px;background:var(--rule);transition:background-color .3s ease;';
        ticks.appendChild(tk);
        tickEls.push(tk);
      }
    }

    host.appendChild(cv);
    host.appendChild(fallback);
    host.appendChild(ticks);
    host.appendChild(label);

    if (REDUCED()) {                       /* final state: the static wordmark */
      cv.style.display = 'none';
      label.style.opacity = '1';
      if (tickEls.length) tickEls[0].style.background = 'var(--red)';
      return;
    }

    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;

    var SW = 1280, SH = 560;
    var STEP = window.innerWidth < 760 ? 6 : 4;
    var WORLD = worldW / SW;               /* world units per source px */
    var WOB = 0.014 / WORLD;               /* idle wobble, source px */
    var R2 = 0.7 / (WORLD * WORLD);        /* repulsion radius², source px² */
    var FORCE = 0.09 / WORLD;              /* repulsion strength, source px/frame */
    var KICK = 0.9 / WORLD;                /* restate kick, source px */

    function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

    var TX = [], TY = [], LEN = [], N = 0;
    var pX, pY, pZ, kA, red, sX, sY, sS;
    var scale = 0.4, cx = 0, cy = 0, dot = 3;
    var cssW = 0, cssH = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var inkCol = '#0c0c0b', redCol = '#c43222';
    var cur = 0, lastSwitch = 0, last = 0, raf = 0, visible = false, painted = false, ready = false;
    var mX = 0, mY = 0, pointerIn = false;

    function readColors() {
      inkCol = cssVar('--ink', '#0c0c0b');
      redCol = cssVar('--red', '#c43222');
    }

    function sample(spec) {
      var c = document.createElement('canvas');
      c.width = SW; c.height = SH;
      var gg = c.getContext('2d', { willReadFrequently: true });
      if (!gg) return { x: [], y: [] };
      gg.clearRect(0, 0, SW, SH);
      gg.fillStyle = '#000';
      gg.textAlign = 'center';
      gg.textBaseline = 'middle';
      gg.font = spec.font;
      /* shrink to fit if a glyph run is wider than the frame */
      var widest = 0;
      spec.lines.forEach(function (t) { widest = Math.max(widest, gg.measureText(t).width); });
      if (widest > SW * 0.94) {
        var m = spec.font.match(/(\d+(?:\.\d+)?)px/);
        if (m) {
          var size = parseFloat(m[1]) * (SW * 0.94 / widest);
          gg.font = spec.font.replace(/(\d+(?:\.\d+)?)px/, size.toFixed(0) + 'px');
        }
      }
      var nl = spec.lines.length;
      spec.lines.forEach(function (t, li) {
        gg.fillText(t, SW / 2, SH / 2 + (li - (nl - 1) / 2) * spec.gap);
      });
      var data;
      try { data = gg.getImageData(0, 0, SW, SH).data; } catch (e) { return { x: [], y: [] }; }
      var xs = [], ys = [];
      for (var y = 0; y < SH; y += STEP) {
        for (var x = 0; x < SW; x += STEP) {
          if (data[(y * SW + x) * 4 + 3] > 140) { xs.push(x - SW / 2); ys.push(y - SH / 2); }
        }
      }
      return { x: xs, y: ys };
    }

    function buildTargets() {
      for (var s = 0; s < SPECS.length; s++) {
        var r = sample(SPECS[s]);
        TX.push(Float32Array.from(r.x));
        TY.push(Float32Array.from(r.y));
        LEN.push(r.x.length);
        if (r.x.length > N) N = r.x.length;
      }
      if (!N) return false;
      pX = new Float32Array(N); pY = new Float32Array(N); pZ = new Float32Array(N);
      kA = new Float32Array(N); red = new Uint8Array(N);
      sX = new Float32Array(N); sY = new Float32Array(N); sS = new Float32Array(N);
      for (var i = 0; i < N; i++) {
        pX[i] = (hash(i * 7) - 0.5) * 15 / WORLD;
        pY[i] = (hash(i * 13) - 0.5) * 9 / WORLD;
        pZ[i] = (hash(i * 29) - 0.5) * 6;
        kA[i] = 0.03 + hash(i * 31) * 0.055;
        red[i] = hash(i * 17) < 0.025 ? 1 : 0;
      }
      return true;
    }

    function resize() {
      var r = host.getBoundingClientRect();
      cssW = Math.max(1, Math.round(r.width));
      cssH = Math.max(1, Math.round(r.height));
      cv.width = Math.round(cssW * dpr);
      cv.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(cssW * 0.86 / SW, cssH * 0.92 / SH);
      dot = Math.max(1, STEP * scale * 1.342);
      cx = cssW / 2; cy = cssH / 2;
    }

    function setCaption(i, instant) {
      if (instant) {
        label.textContent = SPECS[i].label;
        label.style.opacity = '1';
      } else {
        label.style.opacity = '0';
        setTimeout(function () {
          label.textContent = SPECS[i].label;
          label.style.opacity = '1';
        }, 300);
      }
      tickEls.forEach(function (t, idx) { t.style.background = idx === i ? 'var(--red)' : 'var(--rule)'; });
    }

    function advance() {
      cur = (cur + 1) % SPECS.length;
      setCaption(cur);
      for (var i = 0; i < N; i++) {
        pX[i] += (hash(i * 3 + cur) - 0.5) * KICK;
        pY[i] += (hash(i * 5 + cur) - 0.5) * KICK;
        pZ[i] += (hash(i * 11 + cur) - 0.5) * 0.7;
      }
    }

    function frame(now) {
      /* Stop outright when the plate is off-screen or the tab is backgrounded —
         an rAF that only early-returns still wakes the compositor every frame. */
      if (!visible || document.hidden) { raf = 0; return; }
      raf = requestAnimationFrame(frame);
      var dt = Math.min((now - last) / 1000, 1 / 20); last = now;
      var t = now / 1000;
      if (!lastSwitch) lastSwitch = t;
      if (SPECS.length > 1 && t - lastSwitch > SPECS[cur].hold) { lastSwitch = t; advance(); }

      var tx = TX[cur], ty = TY[cur], m = LEN[cur];
      if (!m) return;
      for (var i = 0; i < N; i++) {
        var kEff = 1 - Math.pow(1 - kA[i], dt * 60);
        var j = i % m;
        var ax = tx[j] + Math.sin(t * 1.1 + i * 0.37) * WOB;
        var ay = ty[j] + Math.cos(t * 0.9 + i * 0.53) * WOB;
        var x = pX[i] + (ax - pX[i]) * kEff;
        var y = pY[i] + (ay - pY[i]) * kEff;
        var z = pZ[i] + (0 - pZ[i]) * kEff;
        if (pointerIn) {
          var dx = x - mX, dy = y - mY, d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            var dd = Math.sqrt(d2) || 0.001;
            var f = ((R2 - d2) / R2) * FORCE * dt * 60;
            x += dx / dd * f; y += dy / dd * f;
            z += (hash(i) - 0.5) * f * WORLD;
          }
        }
        pX[i] = x; pY[i] = y; pZ[i] = z;
        sX[i] = cx + x * scale;
        sY[i] = cy + y * scale;
        sS[i] = dot * (6.4 / Math.max(2, 6.4 - z));
      }

      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = inkCol;
      ctx.beginPath();
      for (var a = 0; a < N; a++) {
        if (red[a]) continue;
        ctx.rect(sX[a] - sS[a] / 2, sY[a] - sS[a] / 2, sS[a], sS[a]);
      }
      ctx.fill();
      ctx.fillStyle = redCol;
      ctx.beginPath();
      for (var b = 0; b < N; b++) {
        if (!red[b]) continue;
        ctx.rect(sX[b] - sS[b] / 2, sY[b] - sS[b] / 2, sS[b], sS[b]);
      }
      ctx.fill();

      if (!painted) { painted = true; fallback.style.opacity = '0'; }
    }

    function bindPointer() {
      if (!FINE) return;
      var frameEl = document.getElementById('hero');
      if (!frameEl) return;
      frameEl.addEventListener('mousemove', function (e) {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        mX = (e.clientX - r.left - r.width / 2) / scale;
        mY = (e.clientY - r.top - r.height / 2) / scale;
        pointerIn = true;
      }, { passive: true });
      frameEl.addEventListener('mouseleave', function () { pointerIn = false; }, { passive: true });
    }

    function waitFonts(cb) {
      if (!document.fonts || !document.fonts.load) { cb(); return; }
      var want = ['800 230px Archivo', '600 225px "IBM Plex Mono"'];
      want.forEach(function (f) { try { document.fonts.load(f); } catch (e) { /* noop */ } });
      var tries = 0;
      (function poll() {
        var ok = true;
        want.forEach(function (f) { try { if (!document.fonts.check(f)) ok = false; } catch (e) { /* noop */ } });
        if (ok || tries++ > 20) { cb(); return; }
        setTimeout(poll, 200);
      })();
    }

    /* Restart the loop after it has parked itself (scrolled back into view,
       or the tab regained focus). No-op until start() has built the targets. */
    function resume() {
      if (!ready || raf || !visible || document.hidden) return;
      last = (window.performance && performance.now) ? performance.now() : Date.now();
      lastSwitch = last / 1000;
      raf = requestAnimationFrame(frame);
    }

    function start() {
      readColors();
      waitFonts(function () {
        if (!buildTargets()) return;
        resize();
        setCaption(0, true);
        bindPointer();
        if (window.ResizeObserver) new ResizeObserver(function () { resize(); }).observe(host);
        else window.addEventListener('resize', resize, { passive: true });
        if (window.MutationObserver) {
          new MutationObserver(readColors).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
        }
        ready = true;
        resume();
      });
    }

    if ('IntersectionObserver' in window) {
      var started = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          visible = e.isIntersecting;
          if (visible && !started) { started = true; start(); }
          else if (visible) resume();
        });
      }, { rootMargin: '300px' });
      io.observe(host);
      onTeardown(function () { io.disconnect(); });
    } else {
      visible = true; start();
    }

    document.addEventListener('visibilitychange', resume);
    onTeardown(function () { visible = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } });
  }

  /* ═════════════════════════════════════════════════════════════
     12 · <x-import> ms-cash-desk — Fig. 3.5, the 13-week working model
         cash-desk.js defines the <ms-cash-desk> custom element and is
         loaded (deferred) ahead of this file; here we only mount it.
     ═════════════════════════════════════════════════════════════ */
  function initCashDesk() {
    var host = $('x-import[component-from-global-scope="ms-cash-desk"]');
    if (!host || host.firstElementChild) return;
    var el = document.createElement('ms-cash-desk');
    el.style.cssText = 'display:block;width:100%;';
    host.appendChild(el);
  }

  /* ═════════════════════════════════════════════════════════════
     BOOT  (script is deferred; wire on DOMContentLoaded)
     ═════════════════════════════════════════════════════════════ */
  function main() {
    try { bootTheme(); } catch (e) { /* noop */ }
    try { initStateStyles(); } catch (e) { /* noop */ }
    try { initContact(); } catch (e) { /* noop */ }
    try { initCursor(); } catch (e) { /* noop */ }
    try { initAmbient(); } catch (e) { /* noop */ }
    try { initHeroPlate(); } catch (e) { /* noop */ }
    try { initCashDesk(); } catch (e) { /* noop */ }
    try { boot(); } catch (e) { /* noop */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main);
  else main();
})();
