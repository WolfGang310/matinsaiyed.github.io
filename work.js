/* Matin Saiyed — working models (synthetic data, real method) + career chart.
   Plain DOM, no dependencies. Every figure in these models is synthetic. */
(function () {
  'use strict';
  var MONO = "'IBM Plex Mono',monospace", SANS = 'Archivo,sans-serif';
  function el(tag, style, html) { var e = document.createElement(tag); if (style) e.setAttribute('style', style); if (html != null) e.innerHTML = html; return e; }
  function money(n) { return (n < 0 ? '−' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-CA'); }

  /* ═══ 1 · THREE-WAY MATCH with withholding-tax add-back ═══ */
  function threeWay(host) {
    var RATE = 0.10;
    // po, invoice, cash received (net of 10% foreign withholding unless noted)
    var rows = [
      { id: 'INV-1041', po: 34000, inv: 34000, cash: 30600 },
      { id: 'INV-1042', po: 34000, inv: 34000, cash: 30600 },
      { id: 'INV-1043', po: 36500, inv: 38200, cash: 34380, note: 'Invoice exceeds PO by $1,700 — an out-of-scope line billed without a change order. Cash ties to the invoice, so the break is upstream: dispute or amend the PO.' },
      { id: 'INV-1044', po: 34000, inv: 34000, cash: 30600 },
      { id: 'INV-1045', po: 34000, inv: 34000, cash: 28800, note: 'Deposit is $1,800 short even after the withholding add-back — a genuine short payment. Trace to the remittance advice and raise with the client.' },
      { id: 'INV-1046', po: 34000, inv: 34000, cash: 30600 }
    ];
    var addBack = false, open = -1;
    var TH = 'text-align:right;padding:10px 12px;font:600 12px ' + MONO + ';letter-spacing:0.1em;color:var(--faint);border-bottom:1px solid var(--ink);white-space:nowrap;';
    var TD = 'text-align:right;padding:11px 12px;font:500 14px ' + MONO + ';color:var(--ink);border-bottom:1px solid var(--rule);font-variant-numeric:tabular-nums;white-space:nowrap;';

    var bar = el('div', 'display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:18px;');
    var btn = el('button', '');
    btn.type = 'button';
    var sum = el('span', 'font:500 14px ' + MONO + ';color:var(--soft);');
    bar.appendChild(btn); bar.appendChild(sum);
    var wrap = el('div', 'overflow-x:auto;border:1px solid var(--rule);background:var(--raised);');
    var note = el('p', 'font:400 15px/1.6 ' + SANS + ';color:var(--soft);margin:14px 0 0;min-height:48px;max-width:78ch;'); note.setAttribute('role', 'status'); note.setAttribute('aria-live', 'polite');
    host.appendChild(bar); host.appendChild(wrap); host.appendChild(note);

    function render() {
      btn.setAttribute('aria-pressed', String(addBack));
      btn.setAttribute('style', 'cursor:pointer;font:600 13px ' + MONO + ';letter-spacing:0.08em;padding:12px 18px;border:1px solid ' + (addBack ? 'var(--green)' : 'var(--ink)') + ';background:' + (addBack ? 'var(--green)' : 'transparent') + ';color:' + (addBack ? 'var(--paper)' : 'var(--ink)') + ';');
      btn.textContent = addBack ? '✓ WITHHOLDING TAX ADDED BACK' : '+ ADD BACK WITHHOLDING TAX (10%)';
      var breaks = 0;
      var h = '<table style="border-collapse:collapse;width:100%;min-width:760px;"><caption style="caption-side:bottom;text-align:left;padding:10px 12px;font:400 13.5px ' + SANS + ';color:var(--faint);">Two separate tests. PO variance = invoiced − purchase order. Cash variance = invoiced − cash received − withholding added back. An invoice ties only when both are zero.</caption><thead><tr>' +
        '<th scope="col" style="' + TH + 'text-align:left;">INVOICE</th><th scope="col" style="' + TH + '">PO</th><th scope="col" style="' + TH + '">INVOICED</th><th scope="col" style="' + TH + '">PO VARIANCE</th><th scope="col" style="' + TH + '">CASH RECEIVED</th><th scope="col" style="' + TH + '">WHT ADD-BACK</th><th scope="col" style="' + TH + '">CASH VARIANCE</th><th scope="col" style="' + TH + '">STATUS</th></tr></thead><tbody>';
      rows.forEach(function (r, i) {
        var wht = addBack ? r.inv * RATE : 0;
        var gap = r.inv - (r.cash + wht);
        var poGap = r.inv - r.po;
        var poBad = Math.abs(poGap) >= 1, cashBad = Math.abs(gap) >= 1, ok = !poBad && !cashBad;
        if (!ok) breaks++;
        var why = poBad && cashBad ? 'PO AND CASH' : (poBad ? 'PO MISMATCH' : 'CASH SHORT');
        var status = ok ? '<span style="color:var(--green);">TIES ✓</span>' : (addBack && r.note ? '<button type="button" data-i="' + i + '" aria-expanded="' + (open === i) + '" style="all:unset;cursor:pointer;color:var(--red);font:600 14px ' + MONO + ';border-bottom:1.5px solid var(--red);">' + why + ' — WHY?</button>' : '<span style="color:var(--red);">' + why + '</span>');
        h += '<tr style="' + (open === i ? 'background:var(--paper);' : '') + '">' +
          '<th scope="row" style="' + TD + 'text-align:left;">' + r.id + '</th>' +
          '<td style="' + TD + '">' + money(r.po) + '</td>' +
          '<td style="' + TD + '">' + money(r.inv) + '</td>' +
          '<td style="' + TD + (poBad ? 'color:var(--red);font-weight:700;' : 'color:var(--green);') + '">' + money(poGap) + '</td>' +
          '<td style="' + TD + '">' + money(r.cash) + '</td>' +
          '<td style="' + TD + 'color:var(--soft);">' + (addBack ? money(wht) : '—') + '</td>' +
          '<td style="' + TD + (cashBad ? 'color:var(--red);font-weight:700;' : 'color:var(--green);') + '">' + money(gap) + '</td>' +
          '<td style="' + TD + 'font-weight:600;">' + status + '</td></tr>';
      });
      wrap.innerHTML = h + '</tbody></table>';
      sum.innerHTML = '<b style="color:' + (breaks > 2 ? 'var(--red)' : 'var(--ink)') + ';">' + breaks + ' of ' + rows.length + '</b> invoices show a break';
      if (!addBack) note.textContent = 'Before the add-back, every deposit looks short: the client’s country withholds 10% tax at source, so cash never equals the invoice. Six cash variances, none of them real. One invoice also differs from its purchase order.';
      else if (open >= 0 && rows[open].note) note.innerHTML = '<b style="color:var(--ink);">' + rows[open].id + ':</b> ' + rows[open].note;
      else note.textContent = 'With the withholding added back, four invoices tie on both tests. Two genuine breaks remain, and they are different kinds: one is a purchase-order mismatch with no cash variance, the other a short payment. Select “Why?” on either.';
      wrap.querySelectorAll('button[data-i]').forEach(function (b) {
        b.addEventListener('click', function () { var i = +b.getAttribute('data-i'); open = open === i ? -1 : i; render(); var nb = wrap.querySelector('button[data-i="' + i + '"]'); if (nb) nb.focus(); });
      });
    }
    btn.addEventListener('click', function () { addBack = !addBack; open = -1; render(); });
    render();
  }

  /* ═══ 2 · ONBOARDING QUEUE PRIORITIZER ═══ */
  function queue(host) {
    // synthetic households: assets in transit ($K), case age (days), days left on service level
    var cases = [
      { n: 'Household A', v: 4200, age: 3, sla: 9, t: 'RRSP + Non-reg' },
      { n: 'Household B', v: 650, age: 14, sla: 1, t: 'TFSA' },
      { n: 'Household C', v: 9800, age: 6, sla: 6, t: 'Corporate' },
      { n: 'Household D', v: 1250, age: 11, sla: 2, t: 'RRIF' },
      { n: 'Household E', v: 300, age: 2, sla: 10, t: 'TFSA' },
      { n: 'Household F', v: 2700, age: 9, sla: 3, t: 'Non-reg' },
      { n: 'Household G', v: 5600, age: 1, sla: 11, t: 'RRSP' },
      { n: 'Household H', v: 880, age: 13, sla: 0, t: 'RESP' }
    ];
    var w = { v: 40, age: 20, sla: 40 };
    var maxV = Math.max.apply(null, cases.map(function (c) { return c.v; }));
    var maxAge = Math.max.apply(null, cases.map(function (c) { return c.age; }));
    var maxSla = Math.max.apply(null, cases.map(function (c) { return c.sla; }));

    var grid = el('div', 'display:grid;grid-template-columns:minmax(220px,300px) 1fr;gap:40px;align-items:start;');
    grid.className = 'wm-grid';
    var ctl = el('div', 'display:flex;flex-direction:column;gap:20px;');
    var list = el('div', 'display:flex;flex-direction:column;gap:0;border-top:1px solid var(--ink);');
    grid.appendChild(ctl); grid.appendChild(list); host.appendChild(grid);

    [['v', 'ASSET VALUE'], ['age', 'CASE AGE'], ['sla', 'SERVICE-LEVEL RISK']].forEach(function (p) {
      var lab = el('label', 'display:flex;flex-direction:column;gap:8px;font:600 12px ' + MONO + ';letter-spacing:0.12em;color:var(--faint);');
      var top = el('span', 'display:flex;justify-content:space-between;', '<span>' + p[1] + '</span><b style="color:var(--ink);">' + w[p[0]] + '</b>');
      var inp = el('input', 'width:100%;accent-color:var(--red);cursor:pointer;');
      inp.type = 'range'; inp.min = 0; inp.max = 100; inp.step = 5; inp.value = w[p[0]];
      inp.setAttribute('aria-label', 'Weight for ' + p[1].toLowerCase());
      inp.addEventListener('input', function () { w[p[0]] = +inp.value; top.lastChild.textContent = inp.value; render(); });
      lab.appendChild(top); lab.appendChild(inp); ctl.appendChild(lab);
    });
    var why = el('p', 'font:400 15px/1.6 ' + SANS + ';color:var(--soft);margin:4px 0 0;');
    ctl.appendChild(why);

    function render() {
      var tot = (w.v + w.age + w.sla) || 1;
      var scored = cases.map(function (c) {
        var pv = c.v / maxV, pa = c.age / maxAge, ps = 1 - c.sla / maxSla;
        var parts = { v: w.v * pv / tot, age: w.age * pa / tot, sla: w.sla * ps / tot };
        return { c: c, parts: parts, s: parts.v + parts.age + parts.sla };
      }).sort(function (a, b) { return b.s - a.s; });
      var h = '';
      scored.forEach(function (x, i) {
        var c = x.c;
        h += '<div style="display:grid;grid-template-columns:28px 1fr 96px;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid var(--rule);">' +
          '<b style="font:600 14px ' + MONO + ';color:' + (i < 3 ? 'var(--red)' : 'var(--faint)') + ';">' + (i + 1) + '</b>' +
          '<div style="min-width:0;"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font:600 15px ' + SANS + ';color:var(--ink);"><span>' + c.n + ' <span style="font:500 12px ' + MONO + ';color:var(--faint);">' + c.t + '</span></span>' +
          '<span style="font:500 12px ' + MONO + ';color:var(--soft);">$' + (c.v / 1000).toFixed(c.v >= 1000 ? 1 : 2) + 'M · ' + c.age + 'd old · ' + (c.sla === 0 ? '<span style="color:var(--red);">due today</span>' : c.sla + 'd left') + '</span></div>' +
          '<div style="display:flex;height:8px;margin-top:7px;background:var(--rule);" role="img" aria-label="Score ' + Math.round(x.s * 100) + '">' +
          '<i style="width:' + (x.parts.v * 100) + '%;background:var(--ink);"></i><i style="width:' + (x.parts.age * 100) + '%;background:var(--faint);"></i><i style="width:' + (x.parts.sla * 100) + '%;background:var(--red);"></i></div></div>' +
          '<span style="text-align:right;font:600 16px ' + MONO + ';color:var(--ink);font-variant-numeric:tabular-nums;">' + Math.round(x.s * 100) + '</span></div>';
      });
      list.innerHTML = h + '<p style="font:500 12px ' + MONO + ';letter-spacing:0.08em;color:var(--faint);margin:12px 0 0;display:flex;gap:18px;flex-wrap:wrap;"><span><i style="display:inline-block;width:10px;height:10px;background:var(--ink);margin-right:6px;"></i>VALUE</span><span><i style="display:inline-block;width:10px;height:10px;background:var(--faint);margin-right:6px;"></i>AGE</span><span><i style="display:inline-block;width:10px;height:10px;background:var(--red);margin-right:6px;"></i>SERVICE-LEVEL RISK</span></p>';
      var t = scored[0], big = t.parts.v >= t.parts.sla && t.parts.v >= t.parts.age ? 'its asset value' : (t.parts.sla >= t.parts.age ? 'its service-level deadline' : 'how long it has been open');
      why.innerHTML = '<b style="color:var(--ink);">' + t.c.n + '</b> is worked first, driven mostly by ' + big + '. Move a weight and the queue re-ranks — the point is being able to defend the order, not just produce it.';
    }
    render();
  }


  /* ═══ 2b · AR AGING & DSO ═══ */
  function aging(host) {
    var REV = 620000, DAYS = 90; // synthetic quarterly credit sales
    var inv = [
      { c: 'Client 01', a: 38000, d: 8 }, { c: 'Client 02', a: 24500, d: 15 }, { c: 'Client 03', a: 31000, d: 22 },
      { c: 'Client 04', a: 12800, d: 34 }, { c: 'Client 05', a: 19700, d: 41 }, { c: 'Client 06', a: 9400, d: 67 },
      { c: 'Client 07', a: 8600, d: 12 }
    ];
    var paid = {};
    var B = [['CURRENT · 0–30', 0, 30, 'var(--ink)'], ['31–60 DAYS', 31, 60, 'var(--faint)'], ['60+ DAYS', 61, 9999, 'var(--red)']];
    var grid = el('div', 'display:grid;grid-template-columns:minmax(220px,300px) 1fr;gap:40px;align-items:start;'); grid.className = 'wm-grid';
    var left = el('div', ''), right = el('div', 'border-top:1px solid var(--ink);');
    grid.appendChild(left); grid.appendChild(right); host.appendChild(grid);
    function render() {
      var open = inv.filter(function (x, i) { return !paid[i]; });
      var ar = open.reduce(function (t, x) { return t + x.a; }, 0), dso = ar / REV * DAYS;
      var h = '<div style="font:600 12px ' + MONO + ';letter-spacing:0.12em;color:var(--faint);">DAYS SALES OUTSTANDING</div>' +
        '<div style="font:600 64px ' + MONO + ';line-height:1.05;color:' + (dso <= 30 ? 'var(--green)' : 'var(--red)') + ';font-variant-numeric:tabular-nums;">' + dso.toFixed(1) + '</div>' +
        '<div style="font:500 13px ' + MONO + ';color:var(--soft);margin-bottom:20px;">' + money(ar) + ' open ÷ ' + money(REV) + ' sales × ' + DAYS + ' days</div>';
      B.forEach(function (b) {
        var t = open.filter(function (x) { return x.d >= b[1] && x.d <= b[2]; }).reduce(function (s, x) { return s + x.a; }, 0);
        h += '<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;font:600 12px ' + MONO + ';letter-spacing:0.08em;color:var(--faint);"><span>' + b[0] + '</span><span style="color:var(--ink);">' + money(t) + '</span></div>' +
          '<div style="height:8px;background:var(--rule);margin-top:5px;"><i style="display:block;height:100%;width:' + (ar ? t / 144000 * 100 : 0) + '%;max-width:100%;background:' + b[3] + ';"></i></div></div>';
      });
      left.innerHTML = h + '<p style="font:400 15px/1.6 ' + SANS + ';color:var(--soft);margin:16px 0 0;">Collect the oldest invoices first: they move DSO least per dollar but carry the most risk. Select a row to mark it collected.</p>';
      var r = '';
      inv.forEach(function (x, i) {
        var p = paid[i];
        r += '<button type="button" data-i="' + i + '" aria-pressed="' + !!p + '" style="all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:1fr 90px 110px 96px;gap:10px;align-items:center;width:100%;padding:12px 4px;border-bottom:1px solid var(--rule);font:500 14px ' + MONO + ';color:var(--ink);opacity:' + (p ? 0.4 : 1) + ';">' +
          '<span style="font:600 15px ' + SANS + ';' + (p ? 'text-decoration:line-through;' : '') + '">' + x.c + '</span>' +
          '<span style="text-align:right;color:' + (x.d > 60 ? 'var(--red)' : 'var(--soft)') + ';">' + x.d + ' days</span>' +
          '<span style="text-align:right;font-variant-numeric:tabular-nums;">' + money(x.a) + '</span>' +
          '<span style="text-align:right;font:600 12px ' + MONO + ';letter-spacing:0.08em;color:' + (p ? 'var(--green)' : 'var(--faint)') + ';">' + (p ? 'COLLECTED ✓' : 'OPEN') + '</span></button>';
      });
      right.innerHTML = r;
      right.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { var i = +b.getAttribute('data-i'); paid[i] = !paid[i]; render(); }); });
    }
    render();
  }

  /* ═══ 3 · CAREER CHART (Gantt of roles) ═══ */
  function gantt(host) {
    var now = new Date(), end = now.getFullYear() + now.getMonth() / 12 + 0.08, start = 2021.42;
    var roles = [
      ['BMO Private Wealth', 'Client Onboarding & Business Support', 2026 + 8 / 12, end, true],
      ['Golden Quasar', 'Finance & Operations Analyst', 2025 + 4 / 12, 2026 + 8 / 12],
      ['Golden Quasar', 'Client Success Associate', 2024, 2025 + 4 / 12],
      ['Prometric · Yukon', 'Operations Consultant / Training Coordinator', 2023 + 4 / 12, 2024 + 5 / 12],
      ['Prometric · Yukon', 'Test Center Administrator', 2023, 2023 + 4 / 12],
      ['Web Summit · Collision', 'Volunteer Team Lead', 2022 + 5 / 12, 2023 + 6 / 12],
      ['Investor Quotient', 'Business Research & Client Support Intern', 2021 + 6 / 12, 2022]
    ];
    var W = 1112, L = 0, RH = 34, top = 26, H = top + roles.length * RH + 8;
    var x = function (y) { return L + (y - start) / (end - start) * (W - L); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Career timeline, 2021 to present: seven roles from intern to BMO Private Wealth" style="width:100%;height:auto;display:block;">';
    for (var y = 2022; y <= Math.floor(end); y++) {
      s += '<line x1="' + x(y) + '" y1="18" x2="' + x(y) + '" y2="' + H + '" stroke="var(--rule)" stroke-width="1"/>' +
        '<text x="' + (x(y) + 6) + '" y="13" fill="var(--faint)" style="font:500 13px ' + MONO + ';">' + y + '</text>';
    }
    roles.forEach(function (r, i) {
      var y0 = top + i * RH, x0 = x(r[2]), x1 = x(r[3]), cur = r[4];
      s += '<rect x="' + x0 + '" y="' + (y0 + 4) + '" width="' + Math.max(6, x1 - x0) + '" height="' + (RH - 12) + '" fill="' + (cur ? 'var(--red)' : 'var(--ink)') + '" opacity="' + (cur ? 1 : 0.88 - i * 0.09) + '"/>';
      var label = r[1] + ' · ' + r[0], right = x1 + 10, fitsRight = right + label.length * 7.4 < W;
      s += '<text x="' + (fitsRight ? right : x0 - 10) + '" y="' + (y0 + RH / 2 + 3) + '" text-anchor="' + (fitsRight ? 'start' : 'end') + '" fill="var(--soft)" style="font:500 13px ' + SANS + ';">' + label.replace(/&/g, '&amp;') + '</text>';
    });
    host.innerHTML = s + '</svg>';
  }

  function boot() {
    window.MSDemos = window.MSDemos || {}; window.MSDemos['wm-match'] = threeWay; window.MSDemos['wm-queue'] = queue; window.MSDemos['wm-aging'] = aging;
    var a = document.getElementById('wm-match'); if (a) threeWay(a);
    var b = document.getElementById('wm-queue'); if (b) queue(b);
    var d = document.getElementById('wm-aging'); if (d) aging(d);
    var c = document.getElementById('xp-gantt'); if (c) gantt(c);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
