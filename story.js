/* story.js — scroll-driven feature layer for matinsaiyed.com
   GSAP: era year-bar fill, ledger figure booking, hero + statement
   kinetics, chapter reveals. Three.js (desktop, non-reduced-motion,
   loaded on demand): a particle field that draws a rising performance
   curve behind the hero. Everything fails soft — with no JS the page
   is a complete static document. */
(function () {
  'use strict';
  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS_GSAP = typeof gsap !== 'undefined';
  if (HAS_GSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  var MOTION = HAS_GSAP && !REDUCED;

  /* ── Hero entrance — headline rises line by line ── */
  if (MOTION) {
    var heroBits = ['.chip-red', '.hero h1 .hl', '.hero-sub', '.hero-meta', '.hero-ctas', '.hero-services', '.hero-portrait'];
    gsap.set(heroBits.join(','), { autoAlpha: 0, y: 26 });
    var heroTween = gsap.to(heroBits.join(','), {
      autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out', delay: 0.15,
      clearProps: 'transform,opacity,visibility'
    });
    /* failsafe: if the ticker stalls (throttled/background tab), never leave
       the hero hidden — real setTimeout, not rAF, so it always fires. */
    setTimeout(function () {
      if (heroTween.progress() < 1) { heroTween.kill(); gsap.set(heroBits.join(','), { clearProps: 'all' }); }
    }, 3500);
  }

  /* ── Statement — word-by-word ink reveal ── */
  var st = document.getElementById('statement-text');
  if (st && MOTION) {
    var words = st.textContent.trim().split(/\s+/);
    st.innerHTML = words.map(function (w) { return '<span class="word">' + w + '</span>'; }).join(' ');
    st.classList.add('will-split');
    gsap.fromTo(st.querySelectorAll('.word'),
      { opacity: 0.14 },
      { opacity: 1, stagger: 0.02, ease: 'none',
        scrollTrigger: { trigger: st, start: 'top 78%', end: 'bottom 45%', scrub: true } });
  }

  /* ── Era chapters — segmented year bar + ledger booking ── */
  var exp = document.getElementById('experience');
  var entries = exp ? Array.prototype.slice.call(exp.querySelectorAll('.entry')) : [];
  var segs = Array.prototype.slice.call(document.querySelectorAll('.era-years .seg'));
  var ledger = document.getElementById('ledger-card');
  var rows = ledger ? Array.prototype.slice.call(ledger.querySelectorAll('.lc-row')) : [];
  var lcCount = document.getElementById('lc-count');

  function bookThrough(n) { /* book rows 0..n-1, un-book the rest */
    rows.forEach(function (r, i) { r.classList.toggle('booked', i < n); });
    if (lcCount) lcCount.textContent = String(Math.min(n, rows.length)) + '/' + rows.length;
  }

  function lightSegs(idx, animate) {
    segs.forEach(function (s, i) {
      s.classList.toggle('lit', i <= idx);
      var fill = s.querySelector('i');
      if (animate && MOTION) gsap.to(fill, { scaleX: i <= idx ? 1 : 0, duration: 0.5, ease: 'power2.out' });
      else fill.style.transform = 'scaleX(' + (i <= idx ? 1 : 0) + ')';
    });
  }

  var stage = exp ? exp.querySelector('.era-stage') : null;
  var track = exp ? exp.querySelector('.ledger') : null;

  /* Desktop + motion: pin the stage and drive the chapters HORIZONTALLY —
     vertical scroll becomes sideways travel through the eras, with the year
     bar and ledger booked against the same scrubbed progress. Elsewhere
     (mobile, reduced-motion, no GSAP): classic vertical chapters via IO. */
  var horizontalMode = false;
  if (MOTION && stage && track && entries.length && typeof gsap.matchMedia === 'function') {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', function () {
      horizontalMode = true;
      exp.classList.add('era-h');

      /* dock the ledger inside the pinned stage as a bottom band —
         remember its home so teardown can put it back */
      var ledgerHome = null;
      if (ledger) {
        ledgerHome = { parent: ledger.parentNode, next: ledger.nextSibling };
        stage.appendChild(ledger);
        ledger.classList.add('on');
      }

      var dist = function () { return Math.max(0, track.offsetWidth - stage.clientWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          pin: true,
          scrub: 1.2,               /* a touch more glide so the track eases rather than tracks 1:1 */
          anticipatePin: 1,
          start: 'top 84px',
          end: function () { return '+=' + dist(); },
          invalidateOnRefresh: true,
          /* chapters ease toward each era stop — long, gentle settle with a
             brief delay so a mid-scroll pause doesn't yank you to the nearest one */
          snap: {
            snapTo: 1 / (entries.length - 1),
            duration: { min: 0.4, max: 1.1 },
            delay: 0.18,
            ease: 'power3.out',
            directional: false
          },
          onUpdate: function (self) {
            var idx = Math.min(entries.length - 1, Math.floor(self.progress * entries.length + 1e-4));
            lightSegs(idx, false);
            bookThrough(idx + 1);
          }
        }
      });

      /* each chapter's body rides in from the right as the track carries it
         into frame — the entrance is driven by the horizontal travel itself */
      var chapterTweens = entries.map(function (entry) {
        var body = entry.querySelector('.entry-grid');
        if (!body) return null;
        return gsap.from(body, {
          x: 90, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: {
            trigger: entry,
            containerAnimation: tween,
            start: 'left 78%',
            once: true
          }
        });
      }).filter(Boolean);

      return function () {           /* teardown when leaving the breakpoint */
        horizontalMode = false;
        exp.classList.remove('era-h');
        chapterTweens.forEach(function (t) { t.scrollTrigger && t.scrollTrigger.kill(true); t.kill(); });
        tween.scrollTrigger && tween.scrollTrigger.kill(true);
        tween.kill();
        gsap.set(track, { clearProps: 'transform' });
        entries.forEach(function (e) { var b = e.querySelector('.entry-grid'); if (b) gsap.set(b, { clearProps: 'all' }); });
        if (ledger && ledgerHome) {
          ledger.classList.remove('on');
          ledgerHome.parent.insertBefore(ledger, ledgerHome.next);
        }
      };
    });
  }

  if (entries.length && 'IntersectionObserver' in window) {
    /* vertical fallback — inert while the horizontal journey is active */
    var io = new IntersectionObserver(function (ents) {
      if (horizontalMode) return;
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        lightSegs(entries.indexOf(e.target), true);
        bookThrough(entries.indexOf(e.target) + 1);
      });
    }, { rootMargin: '-25% 0px -55% 0px' });
    entries.forEach(function (el) { io.observe(el); });

    /* ledger card visibility outside horizontal mode */
    if (ledger && matchMedia('(min-width: 861px)').matches) {
      var io2 = new IntersectionObserver(function (ents) {
        if (horizontalMode) return;
        ents.forEach(function (e) { ledger.classList.toggle('on', e.isIntersecting); });
      }, { rootMargin: '-10% 0px -10% 0px' });
      io2.observe(exp);
    } else if (ledger) {
      ledger.classList.add('on');
      bookThrough(rows.length);
    }
  }

  /* ── Chapter headlines slide up as they enter ──
     (in horizontal mode the chapters get track-driven entrances instead) */
  if (MOTION) {
    var vertTargets = horizontalMode ? '.compare-panel, .band' : '.entry h3, .compare-panel, .band';
    document.querySelectorAll(vertTargets).forEach(function (el) {
      gsap.fromTo(el, { autoAlpha: 0, y: 30 }, {
        autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        clearProps: 'transform,opacity,visibility'
      });
    });
    /* compare columns rise in sequence */
    document.querySelectorAll('.compare-col').forEach(function (el, i) {
      gsap.fromTo(el, { autoAlpha: 0, y: 24 }, {
        autoAlpha: 1, y: 0, duration: 0.7, delay: i * 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: el.closest('.compare-panel'), start: 'top 80%', once: true },
        clearProps: 'transform,opacity,visibility'
      });
    });
  }

  /* ── Three.js hero — a particle field drawing a rising curve.
        Desktop + motion only; the 670 KB lib loads on demand. ── */
  var canvasWrap = document.getElementById('hero-canvas');
  function bootThree() {
    if (!canvasWrap || typeof THREE === 'undefined') return;
    var W = canvasWrap.clientWidth, H = canvasWrap.clientHeight;
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(50, W / H, 1, 400);
    cam.position.set(0, 4, 46);
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch (_) { return; }
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    canvasWrap.appendChild(renderer.domElement);

    var dark = document.documentElement.dataset.theme === 'dark';
    var inkCol = dark ? 0xece6d9 : 0x211d17;
    var redCol = dark ? 0xef6a5e : 0xb42222;

    /* grid of ledger dots */
    var COLS = 44, ROWS = 16, GX = 2.1, GY = 1.7;
    var pts = [];
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++)
      pts.push((c - COLS / 2) * GX, (r - ROWS / 2) * GY - 2, -8 - (r * 0.4));
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    var dots = new THREE.Points(geo, new THREE.PointsMaterial({ color: inkCol, size: 0.34, transparent: true, opacity: dark ? 0.22 : 0.14 }));
    scene.add(dots);

    /* the rising performance curve — red points along y = f(x) */
    var CN = 90, cpts = [], targets = [];
    for (var i = 0; i < CN; i++) {
      var x = (i / (CN - 1)) * (COLS * GX) - (COLS * GX) / 2;
      var t = i / (CN - 1);
      var y = -8 + t * 13 + Math.sin(t * 6.2) * 1.15;  /* up and to the right, with quarters */
      targets.push(y);
      cpts.push(x, -10, -6);
    }
    var cgeo = new THREE.BufferGeometry();
    cgeo.setAttribute('position', new THREE.Float32BufferAttribute(cpts, 3));
    var curve = new THREE.Points(cgeo, new THREE.PointsMaterial({ color: redCol, size: 0.62, transparent: true, opacity: 0.85 }));
    scene.add(curve);

    var mx = 0, raf = 0, t0 = performance.now();
    var onMove = function (e) { mx = (e.clientX / innerWidth - 0.5) * 2; };
    addEventListener('mousemove', onMove, { passive: true });
    var pos = cgeo.getAttribute('position');

    function tick(now) {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      var el = (now - t0) / 1000;
      for (var i = 0; i < CN; i++) {
        var delay = i * 0.028;
        var p = Math.max(0, Math.min(1, (el - delay) / 1.1));
        var eased = 1 - Math.pow(1 - p, 3);
        var wobble = Math.sin(el * 1.4 + i * 0.35) * 0.14;
        pos.array[i * 3 + 1] = -10 + (targets[i] + 10) * eased + wobble;
      }
      pos.needsUpdate = true;
      dots.rotation.y += (mx * 0.05 - dots.rotation.y) * 0.03;
      curve.rotation.y = dots.rotation.y;
      renderer.render(scene, cam);
    }
    raf = requestAnimationFrame(tick);

    var onResize = function () {
      var w = canvasWrap.clientWidth, h = canvasWrap.clientHeight;
      cam.aspect = w / h; cam.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    addEventListener('resize', onResize, { passive: true });

    /* re-tint on theme change */
    new MutationObserver(function () {
      var d = document.documentElement.dataset.theme === 'dark';
      dots.material.color.setHex(d ? 0xece6d9 : 0x211d17);
      dots.material.opacity = d ? 0.22 : 0.14;
      curve.material.color.setHex(d ? 0xef6a5e : 0xb42222);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  if (canvasWrap && !REDUCED && innerWidth >= 900) {
    if (typeof THREE !== 'undefined') bootThree();
    else {
      var s = document.createElement('script');
      s.src = '/vendor/three.min.js';
      s.onload = bootThree;
      document.head.appendChild(s);
    }
  }
})();
