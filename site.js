/* matinsaiyed.com — theme, reveals, and the two genuine instruments
   (competency radar drill-down, reference selector). Restrained by design. */
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
    });
  }

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('ms-theme')) {
      root.dataset.theme = e.matches ? 'dark' : 'light';
      syncLabel();
    }
  });

  /* ── Count-up (ticker + rings) ────────────────────────────── */
  function countUp(node, target, prefix, suffix) {
    if (reduced) { node.textContent = prefix + target + suffix; return; }
    var start = null, dur = 1000;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      node.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── Competency radar (inline SVG, drill-down) ────────────── */
  var radar = document.getElementById('radar');
  var AXES = [
    { label: 'CLIENT RELATIONS', v: 91, skills: [
      ['Client Retention', 95], ['Active Listening', 92], ['Communication', 90], ['Empathy', 88]] },
    { label: 'SALES', v: 88, skills: [
      ['Target Achievement', 97], ['Negotiation', 88], ['Upselling', 85], ['Cross-selling', 82]] },
    { label: 'OPERATIONS', v: 86, skills: [
      ['Service Quality', 98], ['Knowledge Base', 97], ['Follow-up', 95], ['Response Time', 94], ['Process Automation', 85]] },
    { label: 'DISCOVERY', v: 87, skills: [
      ['Needs Assessment', 93], ['Solution Design', 88], ['Strategic Planning', 85], ['Consulting', 80]] },
    { label: 'TECHNICAL', v: 83, skills: [
      ['Excel', 95], ['Salesforce CRM', 88], ['Power BI', 85], ['SQL', 82], ['Python', 78]] }
  ];
  var TOP_SKILLS = [
    ['Service Quality', 98], ['Target Achievement', 97], ['Knowledge Base', 97], ['Client Retention', 95],
    ['Follow-up', 95], ['Excel', 95], ['Response Time', 94], ['Needs Assessment', 93],
    ['Active Listening', 92], ['Communication', 90]
  ];

  var skillsRows = document.getElementById('skills-rows');
  var skillsTitle = document.getElementById('skills-title');
  var skillsReset = document.getElementById('skills-reset');
  var skillsIndexEl = document.getElementById('skills-index');
  var selectedAxis = -1;

  function renderSkills(list, title) {
    if (!skillsRows) return;
    skillsTitle.textContent = title;
    skillsRows.textContent = '';
    list.forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'skillbar';
      var name = document.createElement('span');
      name.textContent = s[0];
      var bar = document.createElement('span');
      bar.className = 'bar';
      var fill = document.createElement('i');
      fill.style.setProperty('--w', s[1] + '%');
      bar.appendChild(fill);
      var val = document.createElement('b');
      val.className = 'mono';
      val.textContent = s[1];
      row.appendChild(name);
      row.appendChild(bar);
      row.appendChild(val);
      skillsRows.appendChild(row);
    });
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
        'aria-label': a.label + ' — ' + a.v + ' out of 100. Activate to see these skills.' }, dots);
      var p = pt(i, R * a.v / 100);
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

  /* ── Scroll reveals (+ arm rings / skill bars when visible) ── */
  function armRings(scope) {
    if (scope.querySelector && scope.querySelector('#skills-index')) {
      scope.querySelector('#skills-index').classList.add('armed');
    }
    scope.querySelectorAll('.ring').forEach(function (svg) {
      var pct = parseFloat(svg.dataset.pct) || 0;
      var C = 2 * Math.PI * 32;
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

  /* ── Reference selector (manual; no auto-advance) ─────────── */
  var QUOTES = [
    { text: '“Matin has a rare combination of analytical thinking and genuine empathy for clients. He doesn’t just meet targets — he builds relationships that make those targets sustainable. His capacity growth work was nothing short of transformative.”',
      who: 'Regional Operations Director', what: 'Direct Supervisor · Prometric Center' },
    { text: '“What sets Matin apart is his ability to truly listen. He took the time to understand my financial goals before recommending any products. I felt like a person, not a transaction. That level of care is rare in financial services.”',
      who: 'Investment Client', what: 'Client · Golden Quasar Inc' },
    { text: '“During our collaboration at Collision Conference, Matin led a team of 20 volunteers with remarkable composure. He balanced operational demands with team morale in a way that felt effortless, though I know it wasn’t.”',
      who: 'Event Coordinator', what: 'Program Manager · Web Summit / Collision' },
    { text: '“Matin brought a fresh perspective to our research division. His financial models were thorough, his client presentations were polished, and he consistently went beyond what was asked. A natural self-starter with a strong work ethic.”',
      who: 'Research Team Lead', what: 'Senior Analyst · Investor Quotient IQ' }
  ];

  var exQuote = document.getElementById('exhibit-quote');
  if (exQuote) {
    var exText = document.getElementById('exhibit-text');
    var exCite = document.getElementById('exhibit-cite');
    var exRole = document.getElementById('exhibit-role');
    var exList = document.getElementById('exhibit-list');
    var exCounter = document.getElementById('exhibit-counter');
    var exIdx = 0;

    QUOTES.forEach(function (q, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'exhibit-item';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      var who = document.createElement('span');
      who.className = 'who';
      who.textContent = q.who;
      var what = document.createElement('span');
      what.className = 'what';
      what.textContent = q.what;
      b.appendChild(who);
      b.appendChild(what);
      b.addEventListener('click', function () { showQuote(i); });
      exList.appendChild(b);
    });
    var exItems = exList.querySelectorAll('.exhibit-item');

    function setQuote(i) {
      exText.textContent = QUOTES[i].text;
      exCite.textContent = QUOTES[i].who;
      exRole.textContent = QUOTES[i].what;
      exCounter.textContent = (i + 1) + ' / ' + QUOTES.length;
      exItems.forEach(function (b, bi) { b.setAttribute('aria-selected', bi === i ? 'true' : 'false'); });
    }

    function showQuote(i) {
      exIdx = (i + QUOTES.length) % QUOTES.length;
      if (reduced) { setQuote(exIdx); return; }
      exQuote.classList.add('fading');
      setTimeout(function () {
        setQuote(exIdx);
        exQuote.classList.remove('fading');
      }, 220);
    }

    document.getElementById('exhibit-prev').addEventListener('click', function () { showQuote(exIdx - 1); });
    document.getElementById('exhibit-next').addEventListener('click', function () { showQuote(exIdx + 1); });
    setQuote(0);
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
