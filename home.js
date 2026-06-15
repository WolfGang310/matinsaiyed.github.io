/* matinsaiyed.com — armory-skin behaviors
   Statement word reveal + seamless figures marquee.
   GSAP optional — everything degrades static. */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Seamless marquee: duplicate the track once ───────────── */
  var track = document.querySelector('.marquee-track');
  if (track) {
    track.innerHTML += track.innerHTML;
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
    gsap.from('.hero-services a', { y: 12, opacity: 0, duration: 0.6, stagger: 0.06, delay: 0.45, ease: 'power2.out' });
    gsap.from('.hero-portrait', { opacity: 0, x: 24, duration: 1.0, ease: 'power2.out' });

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

  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
  else addEventListener('DOMContentLoaded', boot);
})();
