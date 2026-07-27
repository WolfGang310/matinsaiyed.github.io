/* Matin Saiyed — <ms-cash-desk> · pet project working model, synthetic data.
   13-week cash forecast: drag any week's net flow, the curve recomputes live.
   Self-contained web component; colors ride the page's CSS vars so both themes work. */
(function () {
  if (customElements.get('ms-cash-desk')) return;
  var SVGNS = 'http://www.w3.org/2000/svg';
  var BASE = [42, -55, 30, -18, 46, -98, 34, -24, 52, -34, 28, -66, 58];
  var STRESS = [42, -55, 14, -18, 26, -150, 34, -24, 30, -34, 22, -66, 36];
  var START = 240, BUFFER = 150, FMAX = 180;
  var X0 = 50, X1 = 990;
  var CY0 = 26, CY1 = 238, CMAX = 400;   /* cash panel, $k domain 0..400 */
  var ZERO = 330, FH = 58;               /* net-flow panel: zero line y, half-height */
  var COLW = (X1 - X0) / 13;
  var MONO9 = "font:500 9px 'IBM Plex Mono',monospace;letter-spacing:0.1em;";
  function yCash(v) { var t = Math.max(0, Math.min(CMAX, v)) / CMAX; return CY1 - t * (CY1 - CY0); }
  function yFlow(v) { return ZERO - (v / FMAX) * FH; }
  function fmt(v) { return (v < 0 ? '−$' + Math.abs(v) : '$' + v) + 'k'; }
  function mk(tag, attrs) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  class CashDesk extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = 1;
      this._scen = BASE; this._vals = BASE.slice();
      this._build();
      this._syncBtns();
      this._update();
    }
    _btn(label) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.style.cssText = "font:600 10px 'IBM Plex Mono',monospace;letter-spacing:0.14em;background:none;border:1px solid var(--rule);color:var(--faint);padding:8px 13px;cursor:pointer;";
      return b;
    }
    _read(label, align) {
      var d = document.createElement('div');
      d.style.cssText = 'display:flex;flex-direction:column;gap:3px;align-items:' + (align || 'flex-end') + ';';
      var v = document.createElement('b');
      v.style.cssText = "font:600 20px 'IBM Plex Mono',monospace;color:var(--ink);font-variant-numeric:tabular-nums;line-height:1;";
      var l = document.createElement('span');
      l.style.cssText = "font:500 9px 'IBM Plex Mono',monospace;letter-spacing:0.12em;color:var(--faint);";
      l.textContent = label;
      d.appendChild(v); d.appendChild(l); d._v = v;
      return d;
    }
    _build() {
      this.style.cssText += ';display:block;';
      var wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;gap:18px;';
      this.appendChild(wrap);

      var bar = document.createElement('div');
      bar.style.cssText = 'display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;';
      var btns = document.createElement('div');
      btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
      var self = this;
      this._bBase = this._btn('BASE');
      this._bStress = this._btn('STRESS CASE');
      this._bReset = this._btn('RESET');
      this._bBase.addEventListener('click', function () { self._scen = BASE; self._vals = BASE.slice(); self._syncBtns(); self._update(); });
      this._bStress.addEventListener('click', function () { self._scen = STRESS; self._vals = STRESS.slice(); self._syncBtns(); self._update(); });
      this._bReset.addEventListener('click', function () { self._vals = self._scen.slice(); self._update(); });
      btns.appendChild(this._bBase); btns.appendChild(this._bStress); btns.appendChild(this._bReset);
      var reads = document.createElement('div');
      reads.style.cssText = 'display:flex;gap:34px;flex-wrap:wrap;';
      this._rMin = this._read('MIN CASH');
      this._rWk = this._read('IN WEEK');
      this._rBelow = this._read('WKS BELOW BUFFER');
      reads.appendChild(this._rMin); reads.appendChild(this._rWk); reads.appendChild(this._rBelow);
      bar.appendChild(btns); bar.appendChild(reads);
      wrap.appendChild(bar);

      var svg = this._svg = mk('svg', { viewBox: '0 0 1000 430', role: 'application', 'aria-label': 'Thirteen-week cash forecast working model with synthetic data. Each week is an adjustable net cash flow; the projected cash curve, minimum cash and buffer breaches recompute as you adjust.' });
      svg.style.cssText = 'width:100%;height:auto;display:block;';
      wrap.appendChild(svg);

      /* cash panel chrome */
      [[0, '0'], [200, '200'], [400, '400']].forEach(function (g) {
        var y = yCash(g[0]).toFixed(1);
        svg.appendChild(mk('line', { x1: X0, y1: y, x2: X1, y2: y, stroke: 'var(--rule)', 'stroke-width': 1, 'stroke-dasharray': g[0] === 0 ? 'none' : '2 4' }));
        var t = mk('text', { x: X0 - 8, y: +y + 3, 'text-anchor': 'end', fill: 'var(--faint)', style: MONO9 });
        t.textContent = g[1]; svg.appendChild(t);
      });
      var cap = mk('text', { x: X0, y: 14, fill: 'var(--faint)', style: MONO9 });
      cap.textContent = 'PROJECTED CASH POSITION · $K · START $240K';
      svg.appendChild(cap);
      var by = yCash(BUFFER).toFixed(1);
      svg.appendChild(mk('line', { x1: X0, y1: by, x2: X1, y2: by, stroke: 'var(--faint)', 'stroke-width': 1, 'stroke-dasharray': '5 4' }));
      var bl = mk('text', { x: X1, y: +by - 6, 'text-anchor': 'end', fill: 'var(--faint)', style: MONO9 });
      bl.textContent = 'BUFFER $150K'; svg.appendChild(bl);

      /* flow panel chrome */
      svg.appendChild(mk('line', { x1: X0, y1: ZERO, x2: X1, y2: ZERO, stroke: 'var(--faint)', 'stroke-width': 1 }));
      var fcap = mk('text', { x: X0, y: ZERO - FH - 12, fill: 'var(--faint)', style: MONO9 });
      fcap.textContent = 'NET FLOW BY WEEK · DRAG ANY BAR, OR TAB + ARROW KEYS';
      svg.appendChild(fcap);

      this._bars = []; this._vlbls = []; this._dots = []; this._wlbls = []; this._hits = [];
      for (var i = 0; i < 13; i++) (function (i) {
        var cx = X0 + COLW * i + COLW / 2;
        var b = mk('rect', { x: (cx - 13).toFixed(1), width: 26, y: ZERO, height: 1, fill: 'var(--ink)' });
        svg.appendChild(b); self._bars.push(b);
        var vl = mk('text', { x: cx.toFixed(1), y: ZERO, 'text-anchor': 'middle', fill: 'var(--soft)', style: "font:500 8.5px 'IBM Plex Mono',monospace;" });
        svg.appendChild(vl); self._vlbls.push(vl);
        var wl = mk('text', { x: cx.toFixed(1), y: 414, 'text-anchor': 'middle', fill: 'var(--faint)', style: MONO9 });
        wl.textContent = 'W' + (i + 1);
        svg.appendChild(wl); self._wlbls.push(wl);
      })(i);

      this._line = mk('path', { d: '', fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.8 });
      svg.appendChild(this._line);
      for (var j = 0; j < 13; j++) {
        var d = mk('circle', { r: 2.6, fill: 'var(--ink)' });
        svg.appendChild(d); this._dots.push(d);
      }
      this._minDot = mk('circle', { r: 5, fill: 'var(--red)' });
      svg.appendChild(this._minDot);
      this._minLbl = mk('text', { 'text-anchor': 'middle', fill: 'var(--red)', style: "font:600 10.5px 'IBM Plex Mono',monospace;letter-spacing:0.06em;" });
      svg.appendChild(this._minLbl);

      /* hit rects last (on top) */
      for (var h = 0; h < 13; h++) (function (i) {
        var hit = mk('rect', {
          x: (X0 + COLW * i + 2).toFixed(1), width: (COLW - 4).toFixed(1),
          y: ZERO - FH - 16, height: FH * 2 + 32, fill: 'transparent',
          tabindex: 0, role: 'slider', 'aria-orientation': 'vertical',
          'aria-valuemin': -FMAX, 'aria-valuemax': FMAX,
          'aria-label': 'Week ' + (i + 1) + ' net cash flow, thousands of dollars'
        });
        hit.style.cssText = 'cursor:ns-resize;touch-action:none;outline-offset:2px;';
        hit.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          self._drag = { i: i, y: e.clientY, v: self._vals[i], upp: 430 / self._svg.getBoundingClientRect().height };
          try { hit.setPointerCapture(e.pointerId); } catch (er) { }
        });
        hit.addEventListener('pointermove', function (e) {
          var d = self._drag; if (!d || d.i !== i) return;
          var dv = (d.y - e.clientY) * d.upp * (FMAX / FH);
          self._vals[i] = Math.max(-FMAX, Math.min(FMAX, Math.round(d.v + dv)));
          self._update();
        });
        hit.addEventListener('pointerup', function () { self._drag = null; });
        hit.addEventListener('lostpointercapture', function () { self._drag = null; });
        hit.addEventListener('keydown', function (e) {
          var step = e.key === 'ArrowUp' ? 5 : e.key === 'ArrowDown' ? -5 : e.key === 'PageUp' ? 25 : e.key === 'PageDown' ? -25 : 0;
          if (!step) return;
          e.preventDefault();
          self._vals[i] = Math.max(-FMAX, Math.min(FMAX, self._vals[i] + step));
          self._update();
        });
        hit.addEventListener('focus', function () { self._bars[i].setAttribute('stroke', 'var(--red)'); self._bars[i].setAttribute('stroke-width', '1.5'); });
        hit.addEventListener('blur', function () { self._bars[i].removeAttribute('stroke'); self._bars[i].removeAttribute('stroke-width'); });
        svg.appendChild(hit); self._hits.push(hit);
      })(h);
    }
    _syncBtns() {
      var self = this;
      [[this._bBase, BASE], [this._bStress, STRESS]].forEach(function (p) {
        var on = self._scen === p[1];
        p[0].style.borderColor = on ? 'var(--red)' : 'var(--rule)';
        p[0].style.color = on ? 'var(--red)' : 'var(--faint)';
      });
    }
    _update() {
      var v = this._vals, cum = [], c = START, minV = Infinity, minI = 0, below = 0;
      for (var i = 0; i < 13; i++) {
        c += v[i]; cum.push(c);
        if (c < minV) { minV = c; minI = i; }
        if (c < BUFFER) below++;
      }
      var d = 'M' + X0 + ',' + yCash(START).toFixed(1);
      for (i = 0; i < 13; i++) {
        var cx = X0 + COLW * i + COLW / 2;
        d += ' L' + cx.toFixed(1) + ',' + yCash(cum[i]).toFixed(1);
        var bv = v[i], bh = Math.max(Math.abs(bv) / FMAX * FH, 0.8);
        this._bars[i].setAttribute('y', (bv >= 0 ? yFlow(bv) : ZERO).toFixed(1));
        this._bars[i].setAttribute('height', bh.toFixed(1));
        this._bars[i].setAttribute('fill-opacity', bv >= 0 ? '1' : '0.45');
        this._vlbls[i].textContent = (bv > 0 ? '+' : bv < 0 ? '−' : '') + Math.abs(bv);
        this._vlbls[i].setAttribute('y', (bv >= 0 ? yFlow(bv) - 6 : yFlow(bv) + 14).toFixed(1));
        this._dots[i].setAttribute('cx', cx.toFixed(1));
        this._dots[i].setAttribute('cy', yCash(cum[i]).toFixed(1));
        this._wlbls[i].setAttribute('fill', cum[i] < BUFFER ? 'var(--red)' : 'var(--faint)');
        this._hits[i].setAttribute('aria-valuenow', bv);
        this._hits[i].setAttribute('aria-valuetext', 'Week ' + (i + 1) + ': net flow ' + bv + 'k, projected cash ' + cum[i] + 'k');
      }
      this._line.setAttribute('d', d);
      var mcx = X0 + COLW * minI + COLW / 2;
      this._minDot.setAttribute('cx', mcx.toFixed(1));
      this._minDot.setAttribute('cy', yCash(minV).toFixed(1));
      this._minLbl.setAttribute('x', Math.max(120, Math.min(mcx, 870)).toFixed(1));
      this._minLbl.setAttribute('y', Math.max(24, yCash(minV) - 14).toFixed(1));
      this._minLbl.textContent = 'MIN ' + fmt(minV) + ' · W' + (minI + 1);
      this._rMin._v.textContent = fmt(minV);
      this._rMin._v.style.color = minV < BUFFER ? 'var(--red)' : 'var(--ink)';
      this._rWk._v.textContent = 'W' + (minI + 1);
      this._rBelow._v.textContent = String(below);
      this._rBelow._v.style.color = below ? 'var(--red)' : 'var(--green)';
    }
  }
  customElements.define('ms-cash-desk', CashDesk);
})();
