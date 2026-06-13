/* matinsaiyed.com — armory-skin behaviors
   Dithered portrait (ordered Bayer), hero intro, statement word reveal,
   seamless figures marquee. GSAP optional — everything degrades static. */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Seamless marquee: duplicate the track once ───────────── */
  var track = document.querySelector('.marquee-track');
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  /* ── Dithered portrait — armory's pixel imagery, personal ──── */
  var dCanvas = document.getElementById('dither-portrait');
  var dImg = document.getElementById('dither-src');

  function renderDither() {
    if (!dCanvas || !dImg || !dImg.naturalWidth) return;
    var dark = document.documentElement.dataset.theme === 'dark';
    var W = 150; // chunky pixel grid
    var H = Math.round(W * dImg.naturalHeight / dImg.naturalWidth);
    var off = document.createElement('canvas');
    off.width = W; off.height = H;
    var ox = off.getContext('2d', { willReadFrequently: true });
    ox.drawImage(dImg, 0, 0, W, H);
    var data = ox.getImageData(0, 0, W, H);
    var px = data.data;

    var B = [ // Bayer 4×4 threshold map, normalized
      0, 8, 2, 10,
      12, 4, 14, 6,
      3, 11, 1, 9,
      15, 7, 13, 5
    ];

    dCanvas.width = W; dCanvas.height = H;
    var cx = dCanvas.getContext('2d');
    cx.clearRect(0, 0, W, H);
    // ink pixels on transparent — paper shows through
    cx.fillStyle = dark ? '#f1efea' : '#0c0c0b';
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var i = (y * W + x) * 4;
        var lum = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
        var t = (B[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
        // dark theme: light pixels where the subject is bright;
        // light theme: ink pixels where the subject is dark
        var on = dark ? (lum > t) : (lum < t);
        if (on) cx.fillRect(x, y, 1, 1);
      }
    }
  }

  if (dImg) {
    if (dImg.complete && dImg.naturalWidth) renderDither();
    else dImg.addEventListener('load', renderDither);
    new MutationObserver(renderDither)
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ── Statement: word-by-word scroll reveal ────────────────── */
  var stmt = document.getElementById('statement-text');
  if (stmt) {
    var words = stmt.textContent.trim().split(/\s+/);
    stmt.textContent = '';
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      stmt.appendChild(span);
      if (i < words.length - 1) stmt.appendChild(document.createTextNode(' '));
    });
  }

  /* ── GSAP moments (optional enhancement) ──────────────────── */
  function boot() {
    var hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    if (!hasGSAP || reduced) {
      // static fallback: everything visible
      document.querySelectorAll('.statement .word').forEach(function (w) { w.style.opacity = 1; });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // hero intro — lines rise, supporting items fade up
    gsap.from('.hero h1 .hl', { yPercent: 110, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
    gsap.from(['.hero-sub', '.hero-meta', '.hero-ctas'], { y: 18, opacity: 0, duration: 0.7, stagger: 0.09, delay: 0.35, ease: 'power2.out' });
    gsap.from('.hero-services a', { x: 26, opacity: 0, duration: 0.6, stagger: 0.07, delay: 0.2, ease: 'power2.out' });
    gsap.from('.hero-visual', { opacity: 0, scale: 1.04, duration: 1.1, ease: 'power2.out' });

    // statement scrub — words ink in as you read
    var wordEls = document.querySelectorAll('.statement .word');
    if (wordEls.length) {
      gsap.set(wordEls, { opacity: 0.16 });
      gsap.to(wordEls, {
        opacity: 1,
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: '.statement',
          start: 'top 78%',
          end: 'top 22%',
          scrub: 0.6
        }
      });
    }

    // gentle parallax on the dithered portrait
    gsap.to('.hero-visual', {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
  else addEventListener('DOMContentLoaded', boot);
})();
