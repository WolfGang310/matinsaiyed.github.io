/* matinsaiyed.com — theme toggle, scroll reveals, figure counters */
(function () {
  'use strict';

  /* ── Theme toggle (initial theme set inline in <head> pre-paint) ── */
  var root = document.documentElement;
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
    });
  }

  // Follow OS changes only while the user hasn't chosen explicitly.
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('ms-theme')) {
      root.dataset.theme = e.matches ? 'dark' : 'light';
      syncLabel();
    }
  });

  /* ── Scroll reveals ── */
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Ticker figure count-up ── */
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var start = null;
    var dur = 1100;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (!reduced && 'IntersectionObserver' in window) {
    var counters = document.querySelectorAll('[data-count]');
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          countUp(en.target);
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }
})();
