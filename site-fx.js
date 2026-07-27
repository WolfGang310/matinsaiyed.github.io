/* Matin Saiyed — page-level FX: <ms-ambient> (scroll-reactive dust) + <ms-page-cursor> */
(function () {
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  class MSAmbient extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      this.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;display:block;';
      var c = document.createElement('canvas');
      c.style.cssText = 'width:100%;height:100%;display:block;';
      this.appendChild(c);
      var ctx = c.getContext('2d');
      var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      var N = parseInt(this.getAttribute('data-count') || '220', 10);
      var pts = [];
      for (var i = 0; i < N; i++) pts.push({ x: hash(i * 3), y: hash(i * 7), z: 0.3 + hash(i * 11) * 0.7, s: 0.7 + hash(i * 13) * 1.5 });
      var dark = false;
      var upd = function () { dark = document.documentElement.dataset.theme === 'dark'; };
      upd();
      new MutationObserver(upd).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      var W = 0, H = 0, dpr = Math.min(devicePixelRatio, 2);
      var size = function () { W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
      size(); addEventListener('resize', size);
      var lastY = scrollY, vel = 0, self = this;
      var tick = function (t) {
        requestAnimationFrame(tick);
        if (!self.isConnected) return;
        var dy = scrollY - lastY; lastY = scrollY;
        vel += (dy - vel) * 0.08;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = dark ? '#6e6c64' : '#8a887f';
        for (var i = 0; i < N; i++) {
          var p = pts[i];
          if (!reduced) {
            p.y -= 0.00004 + vel * 0.00014 * p.z;
            p.x += Math.sin(t * 0.0002 + i * 2.1) * 0.000025;
          }
          if (p.y < 0) p.y += 1; if (p.y > 1) p.y -= 1;
          if (p.x < 0) p.x += 1; if (p.x > 1) p.x -= 1;
          ctx.globalAlpha = (dark ? 0.28 : 0.38) * p.z;
          var r = p.s * p.z;
          ctx.fillRect(p.x * W, p.y * H, r, r);
        }
        ctx.globalAlpha = 1;
      };
      requestAnimationFrame(tick);
    }
  }

  class MSPageCursor extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      var mode = this.getAttribute('data-mode') || 'subtle';
      if (mode === 'off' || !matchMedia('(pointer: fine)').matches) { this.style.display = 'none'; return; }
      var full = mode === 'full';
      this.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:300;pointer-events:none;display:block;';
      var st = document.createElement('style');
      st.textContent = '*{cursor:none !important}';
      document.head.appendChild(st);
      var getRed = function () { return (getComputedStyle(document.documentElement).getPropertyValue('--red') || '#c43222').trim() || '#c43222'; };
      var red = getRed();
      var dot = document.createElement('div');
      dot.style.cssText = 'position:fixed;left:0;top:0;width:5px;height:5px;margin:-2.5px;border-radius:50%;background:' + red + ';opacity:0;transition:width .18s,height .18s,margin .18s;';
      var ring = document.createElement('div');
      ring.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px;border-radius:50%;border:1px solid ' + red + ';opacity:0;transition:width .25s,height .25s,margin .25s,background-color .25s;';
      var lab = document.createElement('div');
      lab.style.cssText = "position:fixed;left:0;top:0;font:600 9px 'IBM Plex Mono',monospace;letter-spacing:0.2em;color:" + red + ';opacity:0;transition:opacity .2s;white-space:nowrap;';
      this.appendChild(ring); this.appendChild(dot);
      if (full) this.appendChild(lab);
      new MutationObserver(function () {
        red = getRed(); dot.style.background = red; ring.style.borderColor = red; lab.style.color = red;
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      var x = -100, y = -100, rx = -100, ry = -100, vis = false, onLink = false;
      document.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; vis = true; }, { passive: true });
      document.addEventListener('mouseleave', function () { vis = false; });
      document.addEventListener('mousedown', function () { dot.style.width = dot.style.height = '10px'; dot.style.margin = '-5px'; });
      document.addEventListener('mouseup', function () { dot.style.width = dot.style.height = '5px'; dot.style.margin = '-2.5px'; });
      document.addEventListener('mouseover', function (e) {
        var link = e.target.closest && e.target.closest('a,button,input,textarea,label');
        onLink = !!link;
        var grow = full ? '52px' : '34px', growM = full ? '-26px' : '-17px';
        ring.style.width = ring.style.height = link ? grow : '22px';
        ring.style.margin = link ? growM : '-11px';
        ring.style.backgroundColor = (link && full) ? 'rgba(196,50,34,0.1)' : 'transparent';
        if (full) {
          var zone = e.target.closest && e.target.closest('[data-cursor-label]');
          if (zone && !link) { lab.textContent = zone.getAttribute('data-cursor-label'); lab.style.opacity = 0.9; }
          else lab.style.opacity = 0;
        }
      });
      (function tick() {
        requestAnimationFrame(tick);
        var k = full ? 0.16 : 0.38;
        rx += (x - rx) * k; ry += (y - ry) * k;
        dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        if (full) lab.style.transform = 'translate(' + (rx + 22) + 'px,' + (ry - 8) + 'px)';
        dot.style.opacity = vis ? 1 : 0;
        ring.style.opacity = vis ? (full ? 0.9 : (onLink ? 0.75 : 0.4)) : 0;
      })();
    }
  }

  if (!customElements.get('ms-ambient')) customElements.define('ms-ambient', MSAmbient);
  if (!customElements.get('ms-page-cursor')) customElements.define('ms-page-cursor', MSPageCursor);
})();
