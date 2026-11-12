/* matinsaiyed.com — theme, reveal, project-collection role filter, demo reset. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* theme */
  var tb = $('#theme');
  function paintTheme() { if (tb) { var dark = root.dataset.theme === 'dark'; tb.textContent = dark ? '☀' : '☾'; tb.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme'); tb.setAttribute('aria-pressed', String(dark)); } }
  if (tb) tb.addEventListener('click', function () { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; store('ms-theme3', root.dataset.theme); paintTheme(); });
  paintTheme();

  /* reveal */
  var rv = $$('[data-rv]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -4% 0px' });
    rv.forEach(function (n) { io.observe(n); });
    setTimeout(function () { rv.forEach(function (n) { if (n.getBoundingClientRect().top < innerHeight) n.classList.add('in'); }); }, 600);
  } else rv.forEach(function (n) { n.classList.add('in'); });

  /* project collection: role filter kept in the URL (?role=onb) so a copied link, a refresh and Back all restore it */
  var coll = $('#coll');
  if (coll) {
    var NAMES = { all: 'all roles', onb: 'client onboarding roles', ops: 'operations roles', fin: 'finance roles' };
    var rows = $$('.crow', coll), btns = $$('.filter button[data-role]'), count = $('#count'), empty = $('#empty'), base = d.title;
    var current = function () { var m = /[?&]role=([a-z]+)/.exec(location.search); return m && NAMES[m[1]] ? m[1] : 'all'; };
    var apply = function (role) {
      var shown = 0;
      rows.forEach(function (r) {
        var o = r.getAttribute('data-o-' + role), on = o !== null;
        r.hidden = !on; if (on) { shown++; r.style.order = o; }
      });
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.role === role)); });
      if (count) count.textContent = role === 'all' ? 'Showing all ' + rows.length + ' projects, completed work first.' : 'Showing ' + shown + ' of ' + rows.length + ' projects for ' + NAMES[role] + ', most relevant first.';
      if (empty) empty.hidden = shown > 0;
      d.title = role === 'all' ? base : base.replace('All work', 'Work for ' + NAMES[role]);
    };
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var role = b.dataset.role; if (role === current()) return;
        history.pushState({ role: role }, '', role === 'all' ? location.pathname : location.pathname + '?role=' + role);
        apply(role);
      });
    });
    window.addEventListener('popstate', function () { apply(current()); });
    apply(current());
  }

  /* copy-to-clipboard for the email address; the mailto link stays */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.copy, out = b.parentNode.parentNode.querySelector('.copied');
      var done = function (ok) { if (out) out.textContent = ok ? 'Email address copied.' : 'Could not copy. The address is ' + t; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { done(true); }, function () { done(false); }); else done(false);
    });
  });

  /* generic demo reset: rebuilds the demo from its initial state */
  $$('[data-reset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var host = d.getElementById(b.dataset.reset); if (!host) return;
      if (host.tagName.indexOf('-') > -1) { var c = d.createElement(host.tagName); c.id = host.id; c.setAttribute('style', host.getAttribute('style') || ''); host.parentNode.replaceChild(c, host); }
      else if (window.MSDemos && window.MSDemos[host.id]) { host.innerHTML = ''; window.MSDemos[host.id](host); }
      var s = d.getElementById(b.dataset.reset + '-status'); if (s) s.textContent = 'Model reset to its starting state.';
    });
  });
})();
