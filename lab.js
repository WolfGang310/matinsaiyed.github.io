/* matinsaiyed.com — flagship projects. Independent work on synthetic data; no client or employer data.
   1 Book Transfer Control Tower · 2 The Six-Day Close · 3 The Fifth Centre business case */
(function () {
  'use strict';
  var MONO = "var(--mono)", SANS = "var(--sans)";
  function h(tag, style, html) { var e = document.createElement(tag); if (style) e.setAttribute('style', style); if (html != null) e.innerHTML = html; return e; }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function fmtM(v) { return '$' + (v >= 100 ? v.toFixed(0) : v.toFixed(1)) + 'M'; }
  function fmtK(v) { var a = Math.abs(v); return (v < 0 ? '−' : '') + '$' + (a >= 1e6 ? (a / 1e6).toFixed(2) + 'M' : Math.round(a / 1e3) + 'K'); }
  function money(n) { return (n < 0 ? '−' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-CA'); }
  var LBL = 'font:600 12px ' + MONO + ';letter-spacing:.1em;color:var(--faint);text-transform:uppercase;';
  function slider(parent, label, min, max, step, val, fmt, cb) {
    var l = h('label', 'display:flex;flex-direction:column;gap:6px;min-width:170px;flex:1;' + LBL);
    var top = h('span', 'display:flex;justify-content:space-between;gap:10px;', '<span>' + label + '</span><b style="color:var(--ink)">' + fmt(val) + '</b>');
    var i = h('input', 'width:100%;accent-color:var(--accent);cursor:pointer;'); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = val; i.setAttribute('aria-label', label);
    i.addEventListener('input', function () { top.lastChild.textContent = fmt(+i.value); cb(+i.value); });
    l.appendChild(top); l.appendChild(i); parent.appendChild(l); return i;
  }
  function tile(v, l, color) { return '<div style="background:var(--paper);border:1px solid var(--rule);border-radius:14px;padding:14px 16px;"><b style="display:block;font:600 24px ' + MONO + ';color:' + (color || 'var(--ink)') + ';font-variant-numeric:tabular-nums;">' + v + '</b><span style="' + LBL + '">' + l + '</span></div>'; }
  var TILES = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr));gap:12px;margin:22px 0;';

  /* ═════════ 1 · BOOK TRANSFER CONTROL TOWER ═════════ */
  function tower(host) {
    var N = 420, TODAY = 24, DEADLINE = 45, HORIZON = 75, PER = 2, RUNS = 240, R = rng(20261107);
    var REASONS = [['Missing signature', 34], ['Account type mismatch', 22], ['KYC document expired', 17], ['Name / ID discrepancy', 12], ['Relinquishing-institution reject', 9], ['Other', 6]];
    function norm() { return Math.sqrt(-2 * Math.log(R() || 1e-9)) * Math.cos(6.2832 * R()); }
    function reason() { var x = R() * 100, a = 0; for (var i = 0; i < REASONS.length; i++) { a += REASONS[i][1]; if (x < a) return i; } return 5; }
    var hh = [], tot = 0;
    for (var i = 0; i < N; i++) { var v = Math.exp(norm() * 0.95); tot += v; hh.push({ id: 'HH-' + (1000 + i), v: v }); }
    var counts = [0, 0, 0, 0, 0, 0];
    hh.forEach(function (x) {
      x.v = x.v / tot * 560; x.start = Math.floor(R() * 40); x.rej = R() < 0.15; x.reason = x.rej ? reason() : -1;
      x.done = x.start + 3 + Math.floor(R() * 8) + (x.rej ? 4 + Math.floor(R() * 5) : 0);
      if (x.rej && x.start <= TODAY) counts[x.reason]++;
      x.state = x.done <= TODAY ? 'done' : (x.start > TODAY ? 'new' : (x.rej ? 'rej' : 'transit'));
      x.age = Math.max(0, TODAY - x.start);
    });
    var TOT = 560, actual = [], cum = 0;
    for (var d = 0; d <= TODAY; d++) { hh.forEach(function (x) { if (x.done === d) cum += x.v; }); actual.push(cum); }
    var landed = cum, open = hh.filter(function (x) { return x.state !== 'done'; }), doneN = N - open.length;

    var LIM = { analysts: [2, 9], rej: [5, 30] }, BASE = { analysts: 7, rej: 15, prio: true, seed: 1 };
    var PRESETS = [['Normal workload', { analysts: 7, rej: 15, prio: true }], ['Staffing shortage', { analysts: 5, rej: 15, prio: true }], ['Higher rejection rate', { analysts: 7, rej: 25, prio: true }]];
    function clampInt(v, lim) { v = Math.round(Number(v)); return isFinite(v) ? Math.min(lim[1], Math.max(lim[0], v)) : null; }
    var P = { analysts: BASE.analysts, rej: BASE.rej, prio: BASE.prio, seed: BASE.seed };
    var linkNote = [];
    try { // a shared link restores the scenario
      var q = new URLSearchParams(location.search);
      [['analysts', 'analysts', LIM.analysts], ['rej', 'rejection rate', LIM.rej], ['seed', 'seed', [1, 9999]]].forEach(function (f) {
        var raw = q.get(f[0]); if (raw === null) return;
        var v = clampInt(raw, f[2]);
        if (v === null || raw.trim() === '') linkNote.push(f[1] + ' “' + raw + '” was not a number, so ' + P[f[0]] + ' was used');
        else { if (Number(raw) !== v) linkNote.push(f[1] + ' ' + raw + ' was adjusted to ' + v); P[f[0]] = v; }
      });
      var qq = q.get('queue'); if (qq === 'fifo') P.prio = false; else if (qq !== null && qq !== 'largest') linkNote.push('queue order “' + qq + '” was not recognised, so largest-first was used');
    } catch (e) {}

    var cache = {};
    function simulate(p) {
      var key = [p.analysts, p.rej, p.prio ? 1 : 0, p.seed].join('-'); if (cache[key]) return cache[key];
      var rr = rng(p.seed * 1000003 + p.analysts * 131 + p.rej * 17 + (p.prio ? 1 : 0)), runs = [], fin = [], hd = [];
      for (var s = 0; s < RUNS; s++) {
        var q = open.map(function (x, i) { return { v: x.v, ready: TODAY + 1, i: i }; }), c = landed, path = [], done = HORIZON + 1, closed = 0, closedDl = 0;
        for (var day = TODAY + 1; day <= HORIZON; day++) {
          var ready = q.filter(function (x) { return x.ready <= day; });
          ready.sort(p.prio ? function (a, b) { return b.v - a.v; } : function (a, b) { return a.i - b.i; });
          ready.slice(0, p.analysts * PER).forEach(function (x) {
            if (rr() < p.rej / 100) x.ready = day + 3 + Math.floor(rr() * 5);
            else { c += x.v; closed++; q.splice(q.indexOf(x), 1); }
          });
          if (day === DEADLINE) closedDl = closed;
          path.push(c); if (c >= TOT * 0.99 && done > HORIZON) done = day;
        }
        runs.push(path); fin.push(done); hd.push(closedDl);
      }
      function pc(f) { return runs[0].map(function (_, k) { var col = runs.map(function (r) { return r[k]; }).sort(function (a, b) { return a - b; }); return col[Math.floor(f * (RUNS - 1))]; }); }
      fin.sort(function (a, b) { return a - b; }); hd.sort(function (a, b) { return a - b; });
      var at = DEADLINE - TODAY - 1, p50 = pc(0.5);
      return (cache[key] = { p10: pc(0.1), p50: p50, p90: pc(0.9), onTime: fin.filter(function (x) { return x <= DEADLINE; }).length / RUNS, med: fin[Math.floor(RUNS / 2)], atDl: p50[at], hhDl: doneN + hd[Math.floor(RUNS / 2)] });
    }

    var BTN = 'cursor:pointer;font:600 14.5px ' + SANS + ';padding:10px 16px;border-radius:999px;border:1px solid var(--ink);min-height:42px;';
    function btn(parent, text, fn) { var b = h('button', '', text); b.type = 'button'; b.addEventListener('click', fn); parent.appendChild(b); return b; }
    function paintBtn(b, on, quiet) { b.setAttribute('style', BTN + 'background:' + (on ? 'var(--ink)' : 'transparent') + ';color:' + (on ? 'var(--paper)' : 'var(--ink)') + ';' + (quiet ? 'border-color:var(--rule);color:var(--soft);' : '')); }

    host.appendChild(h('p', LBL + 'margin:0 0 10px;', 'Start with a scenario'));
    var pre = h('div', 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px;'); pre.setAttribute('role', 'group'); pre.setAttribute('aria-label', 'Preset scenarios'); host.appendChild(pre);
    var preBtns = PRESETS.map(function (x) { return btn(pre, x[0], function () { P.analysts = x[1].analysts; P.rej = x[1].rej; P.prio = x[1].prio; sync(); draw(); say('Loaded “' + x[0] + '”: ' + P.analysts + ' analysts, ' + P.rej + '% rejections.'); }); });

    var grid = h('div', 'display:grid;grid-template-columns:1.25fr 1fr;gap:30px;align-items:start;'); grid.className = 'wm-grid'; host.appendChild(grid);
    var ctl = h('div', 'display:flex;flex-direction:column;gap:18px;'); grid.appendChild(ctl);
    var msg = h('p', 'font:500 14px ' + SANS + ';color:var(--red);min-height:1.4em;margin:0;'); msg.setAttribute('role', 'status'); msg.setAttribute('aria-live', 'polite');
    function say(t, warn) { msg.textContent = t; msg.style.color = warn ? 'var(--red)' : 'var(--soft)'; }
    var fields = {};
    function field(key, label, help, unit) {
      var lim = LIM[key], id = 'tw-' + key, wrap = h('div', '');
      wrap.appendChild(h('label', 'display:block;font:600 15px ' + SANS + ';color:var(--ink);', label)).setAttribute('for', id);
      wrap.appendChild(h('p', 'font:400 14px/1.5 ' + SANS + ';color:var(--soft);margin:2px 0 8px;', help)).id = id + '-help';
      var row = h('div', 'display:flex;gap:12px;align-items:center;');
      var num = h('input', 'width:76px;font:600 16px ' + MONO + ';padding:9px 10px;border:1px solid var(--rule);border-radius:10px;background:var(--paper);color:var(--ink);'); num.type = 'number'; num.id = id; num.min = lim[0]; num.max = lim[1]; num.step = 1; num.inputMode = 'numeric'; num.setAttribute('aria-describedby', id + '-help');
      var rg = h('input', 'flex:1;min-width:120px;accent-color:var(--accent);cursor:pointer;'); rg.type = 'range'; rg.min = lim[0]; rg.max = lim[1]; rg.step = 1; rg.setAttribute('aria-label', label + ' (slider)');
      row.appendChild(num); if (unit) row.appendChild(h('span', 'font:500 14px ' + MONO + ';color:var(--faint);margin-left:-6px;', unit)); row.appendChild(rg);
      row.appendChild(h('span', 'font:500 12.5px ' + MONO + ';color:var(--faint);white-space:nowrap;', lim[0] + '–' + lim[1]));
      wrap.appendChild(row); ctl.appendChild(wrap);
      var NUMCSS = num.getAttribute('style');
      function flag(bad) { num.setAttribute('aria-invalid', String(bad)); num.setAttribute('style', NUMCSS + (bad ? 'border-color:var(--red);box-shadow:0 0 0 2px color-mix(in srgb,var(--red) 25%,transparent);' : '')); }
      rg.addEventListener('input', function () { P[key] = +rg.value; num.value = P[key]; flag(false); say(''); later(); });
      function check(final) {
        var raw = num.value.trim(), v = clampInt(raw, lim), n0 = Number(raw);
        if (raw === '' || v === null) {   // blank or not a number: the forecast keeps its last valid value and says so
          flag(true); say(label + ' is ' + (raw === '' ? 'blank' : 'not a number') + '. Enter a whole number from ' + lim[0] + ' to ' + lim[1] + '. The forecast below still uses ' + P[key] + (unit || '') + '.', true);
          if (final) { num.value = P[key]; flag(false); say(label + ' was left ' + (raw === '' ? 'blank' : 'invalid') + ', so it was set back to ' + P[key] + (unit || '') + '. The forecast is unchanged.', true); }
          return;
        }
        if (!final && (n0 !== v)) { flag(true); say(label + ': ' + raw + (n0 < lim[0] || n0 > lim[1] ? ' is outside ' + lim[0] + '–' + lim[1] : ' is not a whole number') + '. The forecast below still uses ' + P[key] + (unit || '') + ' until you leave the field.', true); return; }
        flag(false);
        say(n0 === v ? '' : (n0 < lim[0] || n0 > lim[1] ? label + ': ' + raw + ' is outside ' + lim[0] + '–' + lim[1] + ', so ' + v + ' was used.' : label + ': whole numbers only, so ' + raw + ' was rounded to ' + v + '.'), n0 !== v);
        P[key] = v; rg.value = v; if (final) num.value = v; draw();
      }
      num.addEventListener('input', function () { check(false); });
      num.addEventListener('change', function () { check(true); });
      num.addEventListener('blur', function () { var raw = num.value.trim(); if (raw === '' || clampInt(raw, lim) === null || Number(raw) !== P[key]) check(true); });
      num.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(true); });
      fields[key] = { num: num, rg: rg, css: NUMCSS };
    }
    field('analysts', 'Analysts working the queue', 'Each analyst processes ' + PER + ' households a day.', '');
    field('rej', 'Rejection rate', 'Chance that a processed transfer is rejected and comes back 3 to 7 days later.', '%');
    var qw = h('div', ''); qw.appendChild(h('p', 'font:600 15px ' + SANS + ';color:var(--ink);margin:0;', 'Queue order'));
    qw.appendChild(h('p', 'font:400 14px/1.5 ' + SANS + ';color:var(--soft);margin:2px 0 8px;', 'Which households the analysts pick up first each day.'));
    var qr = h('div', 'display:flex;gap:8px;flex-wrap:wrap;'); qr.setAttribute('role', 'group'); qr.setAttribute('aria-label', 'Queue order'); qw.appendChild(qr); ctl.appendChild(qw);
    var qBig = btn(qr, 'Largest assets first', function () { P.prio = true; draw(); say(''); }), qFifo = btn(qr, 'First in, first out', function () { P.prio = false; draw(); say(''); });
    ctl.appendChild(msg);
    var act = h('div', 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;'); ctl.appendChild(act);
    var bReset = btn(act, 'Reset', function () { P = { analysts: BASE.analysts, rej: BASE.rej, prio: BASE.prio, seed: BASE.seed }; sync(); draw(); say('Reset to the starting scenario: ' + BASE.analysts + ' analysts, ' + BASE.rej + '% rejections, largest first.'); });
    var bSeed = btn(act, 'Re-run with new random draws', function () { P.seed = P.seed % 9999 + 1; draw(); say('Re-run with random seed ' + P.seed + '. Inputs are unchanged.'); });
    var bCopy = btn(act, 'Copy link to this scenario', function () {
      var u = location.href; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(function () { say('Link to this scenario copied.'); }, function () { say('Copy this address from your browser bar: ' + u); }); else say('Copy this address from your browser bar: ' + u);
    });
    [bReset, bSeed, bCopy].forEach(function (b) { paintBtn(b, false, true); });

    var how = h('div', 'background:var(--paper);border:1px solid var(--rule);border-radius:14px;padding:18px 20px;', '<h3 style="font:500 20px var(--serif);margin:0 0 10px;">What the model assumes</h3><ul style="margin:0;padding-left:18px;font:400 14.5px/1.55 ' + SANS + ';color:var(--soft);display:flex;flex-direction:column;gap:6px;">' +
      '<li>One book of ' + N + ' households and $' + TOT + 'M, invented for this model. It is day ' + TODAY + ' of a ' + DEADLINE + '-day deadline; ' + doneN + ' households have landed and ' + open.length + ' are open.</li>' +
      '<li><b style="color:var(--ink)">Capacity:</b> analysts × ' + PER + ' households a day. Nothing else limits throughput.</li>' +
      '<li><b style="color:var(--ink)">Rejections:</b> each processed household is rejected with the chosen probability, then returns to the queue after 3 to 7 days. It can be rejected again.</li>' +
      '<li><b style="color:var(--ink)">Finished</b> means 99% of assets have landed. On time means finished by day ' + DEADLINE + '.</li>' +
      '<li><b style="color:var(--ink)">Uncertainty:</b> the remaining days are simulated ' + RUNS + ' times. The chance of finishing on time is the share of those runs that make it.</li></ul>');
    grid.appendChild(how);

    var tiles = h('div', TILES), chart = h('div', ''), verdict = h('div', 'margin:16px 0 0;max-width:86ch;'); verdict.setAttribute('role', 'status'); verdict.setAttribute('aria-live', 'polite');
    var repro = h('p', 'font:500 13px/1.55 ' + MONO + ';color:var(--faint);margin:14px 0 0;max-width:96ch;');
    var lower = h('div', 'display:grid;grid-template-columns:1fr 1.2fr;gap:36px;margin-top:34px;'); lower.className = 'wm-grid';
    host.appendChild(tiles); host.appendChild(chart); host.appendChild(verdict); host.appendChild(repro); host.appendChild(lower);

    var sorted = counts.map(function (c, i) { return [REASONS[i][0], c]; }).sort(function (a, b) { return b[1] - a[1]; });
    var mx = sorted[0][1], sum = counts.reduce(function (a, b) { return a + b; }, 0), run = 0, top2 = Math.round((sorted[0][1] + sorted[1][1]) / sum * 100);
    var par = '<h3 style="font:500 22px var(--serif);margin:0 0 14px;">Why transfers rejected so far</h3>';
    sorted.forEach(function (r) {
      run += r[1];
      par += '<div style="display:grid;grid-template-columns:1fr 46px 52px;gap:10px;align-items:center;padding:7px 0;"><div><div style="font:500 14.5px ' + SANS + ';color:var(--ink);">' + r[0] + '</div><div style="height:7px;background:var(--rule);border-radius:4px;margin-top:5px;"><i style="display:block;height:100%;border-radius:4px;width:' + (r[1] / mx * 100) + '%;background:var(--ink);"></i></div></div><b style="font:600 14px ' + MONO + ';text-align:right;">' + r[1] + '</b><span style="font:500 12.5px ' + MONO + ';color:var(--faint);text-align:right;">' + Math.round(run / sum * 100) + '%</span></div>';
    });
    par += '<p style="font:400 14.5px/1.55 ' + SANS + ';color:var(--soft);margin:12px 0 0;">' + sum + ' rejections to day ' + TODAY + '. The top two reasons are ' + top2 + '% of them. The right column is the running share. The mix of reasons is an input I chose, not a measured one.</p>';
    var risk = hh.filter(function (x) { return x.state === 'rej' || x.state === 'transit'; }).map(function (x) { x.score = x.v / 8 + x.age / 4 + (x.state === 'rej' ? 2 : 0); return x; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 7);
    var tb = '<h3 style="font:500 22px var(--serif);margin:0 0 14px;">Work these first</h3><div style="border-top:1px solid var(--ink);">';
    risk.forEach(function (x) {
      tb += '<div style="display:grid;grid-template-columns:78px 1fr 70px 50px;gap:10px;padding:10px 0;border-bottom:1px solid var(--rule);font:500 14px ' + MONO + ';align-items:center;"><span>' + x.id + '</span><span style="font:500 14px ' + SANS + ';color:' + (x.state === 'rej' ? 'var(--red)' : 'var(--soft)') + ';">' + (x.state === 'rej' ? REASONS[x.reason][0] : 'In transit') + '</span><span style="text-align:right;">' + fmtM(x.v) + '</span><span style="text-align:right;color:var(--faint);">' + x.age + ' d</span></div>';
    });
    lower.appendChild(h('div', '', par)); lower.appendChild(h('div', '', tb + '</div><p style="font:400 14.5px/1.55 ' + SANS + ';color:var(--soft);margin:12px 0 0;">Open households ranked by assets, days open and whether a rejection is outstanding. Columns: household, status, assets, days open.</p>'));

    var timer = null;
    function later() { clearTimeout(timer); timer = setTimeout(draw, 70); }
    function sync() { ['analysts', 'rej'].forEach(function (k) { fields[k].num.value = fields[k].rg.value = P[k]; fields[k].num.setAttribute('aria-invalid', 'false'); fields[k].num.setAttribute('style', fields[k].css); }); }
    function isBase() { return P.analysts === BASE.analysts && P.rej === BASE.rej && P.prio === BASE.prio; }
    function dayTxt(m) { return m > HORIZON ? 'after day ' + HORIZON : 'day ' + m; }
    function pctTxt(x) { return Math.round(x * 100) + '%'; }

    function draw() {
      paintBtn(qBig, P.prio); paintBtn(qFifo, !P.prio); qBig.setAttribute('aria-pressed', String(P.prio)); qFifo.setAttribute('aria-pressed', String(!P.prio));
      preBtns.forEach(function (b, k) { var x = PRESETS[k][1], on = x.analysts === P.analysts && x.rej === P.rej && x.prio === P.prio; paintBtn(b, on); b.setAttribute('aria-pressed', String(on)); });
      try { var qs = isBase() && P.seed === BASE.seed ? '' : '?analysts=' + P.analysts + '&rej=' + P.rej + '&queue=' + (P.prio ? 'largest' : 'fifo') + '&seed=' + P.seed; history.replaceState(history.state, '', location.pathname + qs + location.hash); } catch (e) {}
      var s = simulate(P), b0 = simulate({ analysts: BASE.analysts, rej: BASE.rej, prio: BASE.prio, seed: P.seed }), alt = simulate({ analysts: P.analysts, rej: P.rej, prio: !P.prio, seed: P.seed });
      var nRej = hh.filter(function (x) { return x.state === 'rej'; }).length, ok = s.onTime >= 0.8, mid = s.onTime >= 0.4;
      tiles.innerHTML = tile(pctTxt(landed / TOT), 'Assets landed by day ' + TODAY) + tile(open.length, 'Households open · ' + nRej + ' rejected') +
        tile(pctTxt(s.onTime), 'Chance of finishing on time', ok ? 'var(--green)' : (mid ? 'var(--accent)' : 'var(--red)')) + tile(s.med > HORIZON ? HORIZON + '+' : 'Day ' + s.med, 'Median finish · deadline ' + DEADLINE) +
        tile(pctTxt(s.atDl / TOT), 'Assets landed by deadline') + tile(s.hhDl + ' / ' + N, 'Households done by deadline');
      var W = 1000, H = 300, L = 46, B = 28, X = function (d) { return L + d / HORIZON * (W - L - 8); }, Y = function (v) { return 8 + (1 - v / TOT) * (H - B - 8); };
      var line = function (arr) { return X(TODAY) + ',' + Y(landed) + ' ' + arr.map(function (v, k) { return X(TODAY + 1 + k) + ',' + Y(v); }).join(' '); };
      var g = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Share of assets landed by day. Actual to day ' + TODAY + ', then the median forecast and its range. Median forecast at the day ' + DEADLINE + ' deadline: ' + pctTxt(s.atDl / TOT) + '." style="width:100%;height:auto;display:block;min-width:520px;">';
      [0, 0.25, 0.5, 0.75, 1].forEach(function (f) { g += '<line x1="' + L + '" x2="' + (W - 8) + '" y1="' + Y(TOT * f) + '" y2="' + Y(TOT * f) + '" stroke="var(--rule)"/><text x="' + (L - 8) + '" y="' + (Y(TOT * f) + 4) + '" text-anchor="end" fill="var(--faint)" style="font:500 12px ' + MONO + '">' + Math.round(f * 100) + '%</text>'; });
      for (var d = 0; d <= HORIZON; d += 15) g += '<text x="' + X(d) + '" y="' + (H - 6) + '" text-anchor="' + (d === HORIZON ? 'end' : 'middle') + '" fill="var(--faint)" style="font:500 12px ' + MONO + '">day ' + d + '</text>';
      var band = s.p90.map(function (v, k) { return X(TODAY + 1 + k) + ',' + Y(v); }).join(' ') + ' ' + s.p10.map(function (v, k) { return X(TODAY + 1 + k) + ',' + Y(v); }).reverse().join(' ');
      g += '<polygon points="' + band + '" fill="var(--accent)" opacity=".22"/>';
      if (!isBase()) g += '<polyline points="' + line(b0.p50) + '" fill="none" stroke="var(--faint)" stroke-width="2" stroke-dasharray="2 5"/>';
      g += '<polyline points="' + line(s.p50) + '" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="6 5"/>';
      g += '<polyline points="' + actual.map(function (v, k) { return X(k) + ',' + Y(v); }).join(' ') + '" fill="none" stroke="var(--ink)" stroke-width="3"/>';
      g += '<line x1="' + X(DEADLINE) + '" x2="' + X(DEADLINE) + '" y1="8" y2="' + (H - B) + '" stroke="var(--red)" stroke-width="2"/><text x="' + (X(DEADLINE) + 6) + '" y="20" fill="var(--red)" style="font:600 12px ' + MONO + '">DEADLINE · DAY ' + DEADLINE + '</text>';
      g += '<line x1="' + X(TODAY) + '" x2="' + X(TODAY) + '" y1="8" y2="' + (H - B) + '" stroke="var(--faint)" stroke-dasharray="3 4"/><text x="' + (X(TODAY) - 6) + '" y="20" text-anchor="end" fill="var(--faint)" style="font:600 12px ' + MONO + '">TODAY</text>';
      chart.innerHTML = '<div style="overflow-x:auto;">' + g + '</svg></div><p style="font:500 13px/1.5 ' + SANS + ';color:var(--faint);margin:8px 0 0;">Solid line: assets landed so far. Dashed gold: median forecast. Shaded: the middle 80% of ' + RUNS + ' simulated runs.' + (isBase() ? '' : ' Dotted grey: the starting scenario, for comparison.') + '</p>';
      var head = ok ? 'On track.' : (mid ? 'At risk.' : 'Likely to miss the deadline.');
      var v = '<p style="font:400 17px/1.6 ' + SANS + ';color:var(--soft);margin:0;"><b style="color:var(--ink);">' + head + '</b> With ' + P.analysts + ' analysts, a ' + P.rej + '% rejection rate and ' + (P.prio ? 'the largest households worked first' : 'households worked in arrival order') + ', ' + pctTxt(s.onTime) + ' of simulated runs finish by day ' + DEADLINE + '. The median run finishes on ' + dayTxt(s.med) + ' with ' + pctTxt(s.atDl / TOT) + ' of assets landed at the deadline.</p>';
      if (!isBase()) v += '<p style="font:400 16px/1.6 ' + SANS + ';color:var(--soft);margin:10px 0 0;"><b style="color:var(--ink);">Against the starting scenario</b> (' + BASE.analysts + ' analysts, ' + BASE.rej + '% rejections, largest first): the chance of finishing on time moves from ' + pctTxt(b0.onTime) + ' to ' + pctTxt(s.onTime) + ', and the median finish from ' + dayTxt(b0.med) + ' to ' + dayTxt(s.med) + '.</p>';
      var big = P.prio ? s : alt, fifo = P.prio ? alt : s;
      v += '<p style="font:400 16px/1.6 ' + SANS + ';color:var(--soft);margin:10px 0 0;"><b style="color:var(--ink);">The queue-order trade-off.</b> At these settings, largest-first has ' + pctTxt(big.atDl / TOT) + ' of assets landed by the deadline against ' + pctTxt(fifo.atDl / TOT) + ' for arrival order, with ' + big.hhDl + ' and ' + fifo.hhDl + ' households done. Capacity is the same either way, so largest-first moves assets sooner by making the smallest households wait longest. Whether that is acceptable depends on service commitments this model does not include.</p>';
      verdict.innerHTML = v;
      repro.textContent = 'To reproduce: analysts ' + P.analysts + ', rejection rate ' + P.rej + '%, queue ' + (P.prio ? 'largest first' : 'first in, first out') + ', random seed ' + P.seed + '. The same settings and seed always give the same result. A different seed changes the random draws, so percentages can move by a few points; ' + RUNS + ' runs keep that small.';
    }
    sync(); draw();
    if (typeof linkNote !== 'undefined' && linkNote.length) say('This link had values the model could not use: ' + linkNote.join('; ') + '.', true);
  }

  /* ═════════ 2 · THE SIX-DAY CLOSE ═════════ */
  function closeCal(host) {
    var T = [
      ['Cut-off & bank feeds', 0.5, []], ['Bank reconciliation', 1, [0]], ['AR subledger tie-out', 1, [0]], ['AP cut-off & accruals', 1.5, [0]],
      ['Payroll accrual', 0.5, [0]], ['Deferred revenue schedule', 1, [2]], ['Prepaids & amortization', 0.5, [3]], ['Withholding-tax reclass', 0.5, [1, 2]],
      ['Balance-sheet reconciliations', 1.5, [1, 4, 5, 6, 7]], ['Flux review vs prior month', 0.5, [8]], ['Accountant review & adjustments', 1, [9]], ['Reporting pack & lock', 0.5, [10]]
    ];
    var delay = T.map(function () { return 0; }), TARGET = 6;
    var head = h('div', 'display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:16px;'), body = h('div', 'overflow-x:auto;');
    host.appendChild(head); host.appendChild(body);
    function draw() {
      var n = T.length, es = [], ef = [], ls = [], lf = [];
      for (var i = 0; i < n; i++) { es[i] = Math.max.apply(null, [0].concat(T[i][2].map(function (d) { return ef[d]; }))); ef[i] = es[i] + T[i][1] + delay[i]; }
      var end = Math.max.apply(null, ef);
      for (var j = n - 1; j >= 0; j--) { var succ = []; for (var k = 0; k < n; k++) if (T[k][2].indexOf(j) > -1) succ.push(ls[k]); lf[j] = succ.length ? Math.min.apply(null, succ) : end; ls[j] = lf[j] - (T[j][1] + delay[j]); }
      var late = end > TARGET, span = Math.max(8, Math.ceil(end) + 1);
      head.innerHTML = '<div><span style="' + LBL + '">Books close on</span><div style="font:600 34px ' + MONO + ';color:' + (late ? 'var(--red)' : 'var(--green)') + ';">Business day ' + (end % 1 ? end.toFixed(1) : end) + '</div></div><p style="font:400 16px/1.55 ' + SANS + ';color:var(--soft);margin:0;max-width:52ch;">' + (late ? 'The close slips past the six-day calendar. Only delays on the dark critical-path tasks move the finish; delays elsewhere are absorbed by slack.' : 'On the six-day calendar. Dark bars are the critical path: no slack. Lighter bars can slip by the hatched amount without moving the close.') + '</p>';
      var g = '<div style="min-width:760px;"><div style="display:grid;grid-template-columns:250px 1fr 84px;gap:12px;' + LBL + 'padding-bottom:8px;border-bottom:1px solid var(--ink);"><span>Task</span><span style="display:flex;">' + Array.apply(null, Array(span)).map(function (_, d) { return '<i style="flex:1;font-style:normal;' + (d + 1 === TARGET ? 'color:var(--accent);' : '') + '">D' + (d + 1) + '</i>'; }).join('') + '</span><span style="text-align:right;">Slip</span></div>';
      T.forEach(function (t, i) {
        var slack = Math.round((ls[i] - es[i]) * 10) / 10, crit = slack < 0.01;
        g += '<div style="display:grid;grid-template-columns:250px 1fr 84px;gap:12px;align-items:center;padding:7px 0;border-bottom:1px solid var(--rule);"><span style="font:' + (crit ? 600 : 500) + ' 14.5px ' + SANS + ';color:var(--ink);">' + t[0] + '</span>' +
          '<span style="position:relative;height:22px;background:linear-gradient(90deg,transparent calc(' + (TARGET / span * 100) + '% - 1px),var(--accent) calc(' + (TARGET / span * 100) + '% - 1px),var(--accent) ' + (TARGET / span * 100) + '%,transparent ' + (TARGET / span * 100) + '%);">' +
          (slack > 0 ? '<i style="position:absolute;top:4px;height:14px;left:' + (ef[i] / span * 100) + '%;width:' + (slack / span * 100) + '%;background:repeating-linear-gradient(135deg,var(--rule) 0 4px,transparent 4px 8px);border-radius:0 4px 4px 0;"></i>' : '') +
          '<i style="position:absolute;top:2px;height:18px;border-radius:5px;left:' + (es[i] / span * 100) + '%;width:' + ((T[i][1] + delay[i]) / span * 100) + '%;background:' + (crit ? 'var(--ink)' : 'color-mix(in srgb,var(--ink) 38%,transparent)') + ';' + (delay[i] ? 'box-shadow:inset -' + Math.round(delay[i] / (T[i][1] + delay[i]) * 100) + 'px 0 0 var(--red);' : '') + '"></i></span>' +
          '<span style="display:flex;gap:6px;justify-content:flex-end;"><button type="button" data-i="' + i + '" data-d="-0.5" aria-label="Remove half a day of delay from ' + t[0] + '" style="all:unset;cursor:pointer;width:30px;height:28px;text-align:center;border:1px solid var(--rule);border-radius:8px;font:600 15px ' + MONO + ';color:' + (delay[i] ? 'var(--ink)' : 'var(--rule)') + ';">−</button><button type="button" data-i="' + i + '" data-d="0.5" aria-label="Delay ' + t[0] + ' by half a day" style="all:unset;cursor:pointer;width:30px;height:28px;text-align:center;border:1px solid var(--ink);border-radius:8px;font:600 15px ' + MONO + ';">+</button></span></div>';
      });
      body.innerHTML = g + '</div>';
      body.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { var i = +b.dataset.i; delay[i] = Math.max(0, Math.min(3, delay[i] + (+b.dataset.d))); draw(); }); });
    }
    draw();
  }

  function deferred(host) {
    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var C = [
      { n: 'Contract A', amt: 120000, start: 0, term: 12, bill: { 0: 120000 }, note: '12 months, billed upfront' },
      { n: 'Contract B', amt: 54000, start: 2, term: 6, bill: { 2: 54000 }, note: '6 months, billed upfront' },
      { n: 'Contract C', amt: 36000, start: 1, term: 12, bill: { 1: 9000, 4: 9000, 7: 9000, 10: 9000 }, note: '12 months, billed quarterly in advance' },
      { n: 'Contract D', amt: 24000, start: 4, term: 3, bill: { 4: 24000 }, note: '3 months, billed upfront' }
    ];
    function rec(c, m) { return m >= c.start && m < c.start + c.term ? c.amt / c.term : 0; }
    function bal(m) { var b = 0; C.forEach(function (c) { for (var k = 0; k <= m; k++) b += (c.bill[k] || 0) - rec(c, k); }); return b; }
    var m = 4, pick = h('div', 'display:flex;gap:4px;flex-wrap:wrap;margin-bottom:20px;'), out = h('div', '');
    host.appendChild(pick); host.appendChild(out);
    function draw() {
      pick.innerHTML = '';
      MON.forEach(function (x, i) { var b = h('button', 'all:unset;cursor:pointer;font:600 13px ' + MONO + ';padding:8px 12px;border-radius:999px;border:1px solid ' + (i === m ? 'var(--ink)' : 'var(--rule)') + ';background:' + (i === m ? 'var(--ink)' : 'transparent') + ';color:' + (i === m ? 'var(--paper)' : 'var(--soft)') + ';', x); b.type = 'button'; b.setAttribute('aria-pressed', String(i === m)); b.addEventListener('click', function () { m = i; draw(); }); pick.appendChild(b); });
      var billed = 0, recog = 0, rows = '';
      C.forEach(function (c) { var bl = c.bill[m] || 0, r = rec(c, m); billed += bl; recog += r; rows += '<tr><td style="padding:9px 10px;border-bottom:1px solid var(--rule);font:500 14.5px ' + SANS + ';">' + c.n + ' <span style="color:var(--faint);font-size:13px;">· ' + c.note + '</span></td><td style="padding:9px 10px;border-bottom:1px solid var(--rule);text-align:right;font:500 14px ' + MONO + ';">' + (bl ? money(bl) : '—') + '</td><td style="padding:9px 10px;border-bottom:1px solid var(--rule);text-align:right;font:500 14px ' + MONO + ';">' + (r ? money(r) : '—') + '</td></tr>'; });
      var open = m ? bal(m - 1) : 0, close = bal(m), mxB = Math.max.apply(null, MON.map(function (_, i) { return bal(i); }));
      var TH = 'padding:8px 10px;text-align:right;border-bottom:1px solid var(--ink);' + LBL;
      var je = function (dr, cr, a) { return a ? '<div style="display:grid;grid-template-columns:1fr 110px 110px;gap:8px;font:500 14px ' + MONO + ';padding:6px 0;"><span>Dr ' + dr + '</span><span style="text-align:right;">' + money(a) + '</span><span></span><span style="padding-left:22px;color:var(--soft);">Cr ' + cr + '</span><span></span><span style="text-align:right;color:var(--soft);">' + money(a) + '</span></div>' : ''; };
      out.innerHTML = '<div style="display:grid;grid-template-columns:1.3fr 1fr;gap:36px;" class="wm-grid"><div><div style="overflow-x:auto;"><table style="border-collapse:collapse;width:100%;min-width:440px;"><thead><tr><th style="' + TH + 'text-align:left;">' + MON[m] + '</th><th style="' + TH + '">Billed</th><th style="' + TH + '">Recognized</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<div style="display:flex;align-items:flex-end;gap:5px;height:90px;margin-top:22px;" role="img" aria-label="Deferred revenue balance by month">' + MON.map(function (x, i) { return '<i title="' + x + ' ' + money(bal(i)) + '" style="flex:1;border-radius:4px 4px 0 0;height:' + Math.max(2, bal(i) / mxB * 100) + '%;background:' + (i === m ? 'var(--accent)' : 'color-mix(in srgb,var(--ink) 22%,transparent)') + ';"></i>'; }).join('') + '</div><p style="' + LBL + 'margin:8px 0 0;">Deferred revenue balance by month</p></div>' +
        '<div><div style="background:var(--paper);border:1px solid var(--rule);border-radius:14px;padding:16px 18px;"><div style="' + LBL + 'margin-bottom:8px;">Roll-forward · ' + MON[m] + '</div>' +
        [['Opening balance', open], ['+ Billings', billed], ['− Revenue recognized', -recog]].map(function (r) { return '<div style="display:flex;justify-content:space-between;font:500 14.5px ' + MONO + ';padding:5px 0;"><span style="color:var(--soft);">' + r[0] + '</span><span>' + money(r[1]) + '</span></div>'; }).join('') +
        '<div style="display:flex;justify-content:space-between;font:600 16px ' + MONO + ';padding:9px 0 0;margin-top:6px;border-top:1px solid var(--ink);"><span>Closing balance</span><span>' + money(close) + '</span></div><div style="font:600 12.5px ' + MONO + ';color:var(--green);margin-top:8px;">' + (Math.abs(open + billed - recog - close) < 0.5 ? 'TIES TO SCHEDULE ✓' : '') + '</div></div>' +
        '<div style="margin-top:18px;"><div style="' + LBL + 'margin-bottom:4px;">Journal entries · ' + MON[m] + '</div>' + (je('Accounts receivable', 'Deferred revenue', billed) + je('Deferred revenue', 'Revenue', recog) || '<p style="color:var(--faint);font-size:14.5px;">No entries this month.</p>') + '</div></div></div>';
    }
    draw();
  }

  /* ═════════ 3 · THE FIFTH CENTRE — investment case ═════════ */
  function fifth(host) {
    var P = { capex: 680000, seats: 24, price: 78, util: 74, ramp: 2, fixed: 380000, rate: 10 }, VAR = 22, DAYS = 300, SESS = 2, START = 30, YEARS = 7;
    function flows(p) {
      var cf = [-p.capex], cap = p.seats * SESS * DAYS;
      for (var y = 1; y <= YEARS; y++) { var u = p.ramp <= 1 ? p.util : Math.min(p.util, START + (p.util - START) * (y - 1) / (p.ramp - 1)); cf.push(cap * u / 100 * (p.price - VAR) - p.fixed); }
      return cf;
    }
    function npv(cf, r) { return cf.reduce(function (a, c, i) { return a + c / Math.pow(1 + r, i); }, 0); }
    function irr(cf) { var lo = -0.95, hi = 2; if (npv(cf, lo) < 0) return null; for (var i = 0; i < 80; i++) { var mid = (lo + hi) / 2; if (npv(cf, mid) > 0) lo = mid; else hi = mid; } return lo; }
    function clone(o, k, v) { var c = {}; for (var x in P) c[x] = P[x]; if (k) c[k] = v; return c; }
    function breakeven() { var lo = 0, hi = 100; if (npv(flows(clone(P, 'util', 100)), P.rate / 100) < 0) return null; for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (npv(flows(clone(P, 'util', m)), P.rate / 100) > 0) hi = m; else lo = m; } return hi; }
    var ctl = h('div', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px 28px;');
    slider(ctl, 'Build-out cost', 300000, 1100000, 10000, P.capex, fmtK, function (v) { P.capex = v; draw(); });
    slider(ctl, 'Seats', 12, 40, 1, P.seats, function (v) { return v; }, function (v) { P.seats = v; draw(); });
    slider(ctl, 'Price per session', 50, 130, 1, P.price, function (v) { return '$' + v; }, function (v) { P.price = v; draw(); });
    slider(ctl, 'Steady utilization', 35, 95, 1, P.util, function (v) { return v + '%'; }, function (v) { P.util = v; draw(); });
    slider(ctl, 'Years to reach it', 1, 5, 1, P.ramp, function (v) { return v; }, function (v) { P.ramp = v; draw(); });
    slider(ctl, 'Fixed cost per year', 200000, 650000, 10000, P.fixed, fmtK, function (v) { P.fixed = v; draw(); });
    slider(ctl, 'Discount rate', 6, 18, 0.5, P.rate, function (v) { return v + '%'; }, function (v) { P.rate = v; draw(); });
    var tiles = h('div', TILES), verdict = h('div', 'border-radius:16px;padding:20px 22px;margin-bottom:26px;'), two = h('div', 'display:grid;grid-template-columns:1fr 1fr;gap:36px;'); two.className = 'wm-grid';
    var cfBox = h('div', ''), torBox = h('div', '');
    two.appendChild(cfBox); two.appendChild(torBox);
    host.appendChild(ctl); host.appendChild(tiles); host.appendChild(verdict); host.appendChild(two);
    function draw() {
      var cf = flows(P), r = P.rate / 100, v = npv(cf, r), ir = irr(cf), be = breakeven(), cum = 0, pay = null;
      for (var i = 0; i < cf.length; i++) { var prev = cum; cum += cf[i]; if (pay === null && cum >= 0 && i > 0) pay = i - 1 + (-prev) / cf[i]; }
      var margin = be === null ? -99 : P.util - be, go = v > 0 && margin >= 5, thin = v > 0 && !go;
      tiles.innerHTML = tile(fmtK(v), 'Net present value', v >= 0 ? 'var(--green)' : 'var(--red)') + tile(ir === null ? 'n/a' : (ir * 100).toFixed(1) + '%', 'Internal rate of return') + tile(pay === null ? 'Never' : pay.toFixed(1) + ' yrs', 'Payback') + tile(be === null ? 'Not reachable' : be.toFixed(0) + '%', 'Breakeven utilization') + tile((margin > -90 ? (margin >= 0 ? '+' : '') + margin.toFixed(0) + ' pts' : '—'), 'Margin of safety', margin >= 5 ? 'var(--green)' : (margin >= 0 ? 'var(--accent)' : 'var(--red)'));
      var col = go ? 'var(--green)' : (thin ? 'var(--accent)' : 'var(--red)');
      verdict.setAttribute('style', 'border-radius:16px;padding:20px 22px;margin-bottom:26px;border:1px solid ' + col + ';background:color-mix(in srgb,' + col + ' 8%,transparent);');
      verdict.innerHTML = '<div style="' + LBL + 'color:' + col + ';">Recommendation</div><p style="font:500 21px/1.45 var(--serif);color:var(--ink);margin:6px 0 0;">' +
        (go ? 'Proceed. The centre clears the ' + P.rate + '% hurdle and breaks even at ' + be.toFixed(0) + '% utilization, ' + margin.toFixed(0) + ' points below the plan.' :
          thin ? 'Proceed only with a utilization commitment. Value is positive, but breakeven is ' + be.toFixed(0) + '% against a planned ' + P.util + '%: a miss of ' + Math.max(1, Math.round(margin)) + ' point' + (Math.round(margin) > 1 ? 's' : '') + ' erases it.' :
            'Do not proceed on these assumptions. ' + (be === null ? 'No utilization level recovers the investment.' : 'The centre needs ' + be.toFixed(0) + '% utilization to break even, above the planned ' + P.util + '%.')) + '</p>';
      var mx = Math.max.apply(null, cf.map(Math.abs)), bars = '<h3 style="font:500 22px var(--serif);margin:0 0 14px;">Cash flow by year</h3><div style="display:flex;align-items:center;gap:8px;height:190px;border-bottom:1px solid var(--rule);">';
      cf.forEach(function (c, i) { var hgt = Math.abs(c) / mx * 86; bars += '<div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:center;" title="Year ' + i + ': ' + money(c) + '"><div style="height:50%;display:flex;align-items:flex-end;">' + (c >= 0 ? '<i style="display:block;width:100%;height:' + hgt * 2 + '%;background:var(--ink);border-radius:4px 4px 0 0;"></i>' : '') + '</div><div style="height:50%;">' + (c < 0 ? '<i style="display:block;width:100%;height:' + hgt * 2 + '%;background:var(--red);border-radius:0 0 4px 4px;"></i>' : '') + '</div></div>'; });
      cfBox.innerHTML = bars + '</div><div style="display:flex;gap:8px;' + LBL + 'margin-top:6px;">' + cf.map(function (_, i) { return '<span style="flex:1;text-align:center;">Y' + i + '</span>'; }).join('') + '</div><p style="font:400 14.5px/1.55 ' + SANS + ';color:var(--soft);margin:12px 0 0;">Pre-tax operating cash flows over seven years, no terminal value. Year 1 opens at ' + START + '% utilization.</p>';
      var S = [['Steady utilization', 'util', P.util * 0.85, Math.min(100, P.util * 1.15)], ['Price per session', 'price', P.price * 0.85, P.price * 1.15], ['Fixed cost', 'fixed', P.fixed * 1.15, P.fixed * 0.85], ['Build-out cost', 'capex', P.capex * 1.15, P.capex * 0.85], ['Years to ramp', 'ramp', Math.min(5, P.ramp + 1), Math.max(1, P.ramp - 1)], ['Discount rate', 'rate', P.rate + 2, Math.max(1, P.rate - 2)]]
        .map(function (s) { var a = npv(flows(clone(P, s[1], s[2])), (s[1] === 'rate' ? s[2] : P.rate) / 100), b = npv(flows(clone(P, s[1], s[3])), (s[1] === 'rate' ? s[3] : P.rate) / 100); return { n: s[0], lo: Math.min(a, b), hi: Math.max(a, b) }; }).sort(function (a, b) { return (b.hi - b.lo) - (a.hi - a.lo); });
      var mn = Math.min.apply(null, S.map(function (s) { return s.lo; }).concat([0, v])), mxx = Math.max.apply(null, S.map(function (s) { return s.hi; }).concat([0, v])), px = function (x) { return (x - mn) / (mxx - mn || 1) * 100; };
      var t = '<h3 style="font:500 22px var(--serif);margin:0 0 14px;">What moves the answer</h3>';
      S.forEach(function (s) { t += '<div style="display:grid;grid-template-columns:150px 1fr;gap:12px;align-items:center;padding:6px 0;"><span style="font:500 14.5px ' + SANS + ';">' + s.n + '</span><span style="position:relative;height:20px;background:var(--paper);border-radius:4px;"><i style="position:absolute;top:0;bottom:0;left:' + px(0) + '%;width:1px;background:var(--faint);"></i><i style="position:absolute;top:3px;bottom:3px;border-radius:4px;left:' + px(s.lo) + '%;width:' + Math.max(0.6, px(s.hi) - px(s.lo)) + '%;background:linear-gradient(90deg,var(--red) 0 ' + Math.max(0, Math.min(100, (0 - s.lo) / (s.hi - s.lo || 1) * 100)) + '%,var(--green) 0);opacity:.8;"></i><i style="position:absolute;top:-2px;bottom:-2px;left:' + px(v) + '%;width:2px;background:var(--ink);"></i></span></div>'; });
      torBox.innerHTML = t + '<p style="font:400 14.5px/1.55 ' + SANS + ';color:var(--soft);margin:12px 0 0;">NPV range when each input moves 15% either way (discount rate ±2 points, ramp ±1 year). The dark line is the base case; the thin line is zero. The longest bar is the assumption to pressure-test first.</p>';
    }
    draw();
  }

  function boot() {
    window.MSDemos = window.MSDemos || {};
    [['lab-tower', tower], ['lab-close', closeCal], ['lab-deferred', deferred], ['lab-fifth', fifth]].forEach(function (x) { window.MSDemos[x[0]] = x[1]; var e = document.getElementById(x[0]); if (e) x[1](e); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
