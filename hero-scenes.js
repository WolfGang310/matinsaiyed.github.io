/* Matin Saiyed — hero WebGL scenes. <ms-hero-ledger>, <ms-hero-type>, <ms-cursor> */
(function () {
  // Self-hosted: the site makes no external requests. three r161 ESM lives in /vendor.
  var THREE_URLS = [
    '/vendor/three.module.js'
  ];
  var threeP = null;
  function loadThree() {
    if (!threeP) threeP = import(THREE_URLS[0]).catch(function () { return import(THREE_URLS[1]); });
    return threeP;
  }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  class HeroBase extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.style.cssText += ';display:block;position:absolute;inset:0;overflow:hidden;';
      var c = document.createElement('canvas');
      c.style.cssText = 'width:100%;height:100%;display:block;';
      this.appendChild(c); this._canvas = c;
      this._mouse = { x: 0, y: 0, tx: 0, ty: 0, inside: false };
      var self = this;
      var frame = this.closest('[data-hero-frame]') || this.parentElement || this;
      frame.addEventListener('mousemove', function (e) {
        var r = self.getBoundingClientRect();
        self._mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        self._mouse.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
        self._mouse.inside = true;
      });
      frame.addEventListener('mouseleave', function () { self._mouse.inside = false; });
      this._reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._visible = true;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          self._visible = e.isIntersecting;
          if (e.isIntersecting && !self._booted) {
            self._booted = 1;
            loadThree().then(function (T) { self._setup(T); }).catch(function (err) { console.warn('[hero] three.js failed to load', err); });
          }
        });
      }, { rootMargin: '300px' });
      io.observe(this);
    }
    _mkRenderer(T) {
      var self = this;
      var r = new T.WebGLRenderer({ canvas: this._canvas, antialias: true, alpha: true });
      r.setPixelRatio(Math.min(devicePixelRatio, 2));
      var size = function () {
        var w = self.clientWidth || 8, h = self.clientHeight || 8;
        r.setSize(w, h, false);
        if (self._camera) { self._camera.aspect = w / h; self._camera.updateProjectionMatrix(); }
      };
      new ResizeObserver(size).observe(this); size();
      return r;
    }
    _loop(fn) {
      var self = this;
      var tick = function (t) { self._raf = requestAnimationFrame(tick); if (!self._visible) return; fn(t); };
      this._raf = requestAnimationFrame(tick);
    }
  }

  /* ── 1A · the ledger object: 48-period radial bar ring, one flagged red ── */
  class HeroLedger extends HeroBase {
    _setup(T) {
      var self = this;
      var scene = new T.Scene();
      var cam = this._camera = new T.PerspectiveCamera(34, 1, 0.1, 100);
      cam.position.set(0, 2.0, 9.2);
      var renderer = this._mkRenderer(T);

      scene.add(new T.AmbientLight(0xf1efea, 0.5));
      var key = new T.DirectionalLight(0xfff6e8, 1.2); key.position.set(4, 7, 4); scene.add(key);
      var rim = new T.PointLight(0xe0564a, 18, 0, 2); rim.position.set(-5, -1, -3); scene.add(rim);

      var BASE_X = 2.0;
      var group = new T.Group(); group.position.x = BASE_X; group.rotation.y = 0.6; scene.add(group);

      var N = 48, R = 2.55;
      var boneM = new T.MeshStandardMaterial({ color: 0xe8e5dd, roughness: 0.6, metalness: 0.05 });
      var redM = new T.MeshStandardMaterial({ color: 0xc43222, roughness: 0.4, metalness: 0.1, emissive: 0x64150c, emissiveIntensity: 0.6 });
      var geo = new T.BoxGeometry(0.085, 1, 0.3); geo.translate(0, 0.5, 0);
      var bars = [];
      for (var i = 0; i < N; i++) {
        var h = 0.35 + hash(i) * 1.9;
        var m = new T.Mesh(geo, i === 9 ? redM : boneM);
        var a = (i / N) * Math.PI * 2;
        m.position.set(Math.cos(a) * R, 0, Math.sin(a) * R);
        m.rotation.y = -a;
        m.scale.y = 0.001;
        m.userData = { h: h, i: i };
        group.add(m); bars.push(m);
      }
      var ring = new T.Mesh(new T.TorusGeometry(R, 0.008, 8, 140), new T.MeshBasicMaterial({ color: 0x3c3b37 }));
      ring.rotation.x = Math.PI / 2; group.add(ring);
      var ring2 = new T.Mesh(new T.TorusGeometry(R * 0.55, 0.005, 8, 90), new T.MeshBasicMaterial({ color: 0x2a2926 }));
      ring2.rotation.x = Math.PI / 2; group.add(ring2);
      var tickG = new T.BoxGeometry(0.02, 0.02, 0.34);
      for (var k = 0; k < 4; k++) {
        var tk = new T.Mesh(tickG, new T.MeshBasicMaterial({ color: 0x6e6c64 }));
        var ta = k * Math.PI / 2 + Math.PI / 4;
        tk.position.set(Math.cos(ta) * (R + 0.45), 0, Math.sin(ta) * (R + 0.45));
        tk.rotation.y = -ta; group.add(tk);
      }
      /* drifting dust */
      var P = 420, pos = new Float32Array(P * 3), spd = new Float32Array(P);
      for (var d = 0; d < P; d++) {
        pos[d * 3] = (hash(d * 3) - 0.5) * 14;
        pos[d * 3 + 1] = (hash(d * 3 + 1) - 0.5) * 7;
        pos[d * 3 + 2] = (hash(d * 3 + 2) - 0.5) * 8 - 1;
        spd[d] = 0.0016 + hash(d + 99) * 0.004;
      }
      var pgeo = new T.BufferGeometry();
      pgeo.setAttribute('position', new T.BufferAttribute(pos, 3));
      scene.add(new T.Points(pgeo, new T.PointsMaterial({ color: 0x8a887f, size: 0.02, transparent: true, opacity: 0.55 })));

      /* intro — bars rise staggered */
      var introDone = false;
      var useG = window.gsap && !this._reduced;
      bars.forEach(function (b, j) {
        if (useG) gsap.to(b.scale, { y: b.userData.h, duration: 1.4, delay: 0.15 + j * 0.016, ease: 'expo.out' });
        else b.scale.y = b.userData.h;
      });
      if (useG) gsap.from(group.rotation, { y: group.rotation.y - 0.9, duration: 2.2, ease: 'expo.out' });
      setTimeout(function () { introDone = true; }, 2600);

      this._loop(function (tms) {
        var t = tms / 1000, m = self._mouse;
        if (!self._reduced) group.rotation.y += 0.0014;
        m.x += (m.tx - m.x) * 0.045; m.y += (m.ty - m.y) * 0.045;
        group.rotation.x = m.y * -0.1;
        group.position.x = BASE_X + m.x * 0.25;
        cam.position.x += (m.x * 0.55 - cam.position.x) * 0.03;
        cam.lookAt(1.1, 0.75, 0);
        if (!self._reduced && introDone) {
          for (var bi = 0; bi < N; bi++) {
            var b = bars[bi], u = b.userData;
            b.scale.y = u.h * (1 + Math.sin(t * 0.9 + u.i * 1.7) * 0.025);
          }
        }
        if (!self._reduced) {
          var pa = pgeo.attributes.position;
          for (var pi = 0; pi < P; pi++) {
            var y = pa.array[pi * 3 + 1] + spd[pi];
            if (y > 3.6) y = -3.6;
            pa.array[pi * 3 + 1] = y;
          }
          pa.needsUpdate = true;
        }
        renderer.render(scene, cam);
      });
    }
  }

  /* ── 1B · the re-balance: wordmark of ~5k ink particles, cursor scatters ── */
  class HeroType extends HeroBase {
    async _waitFont(spec) {
      for (var i = 0; i < 20; i++) {
        try { await document.fonts.load(spec); } catch (e) { }
        if (document.fonts.check(spec)) return true;
        await new Promise(function (r) { setTimeout(r, 200); });
      }
      return document.fonts.check(spec);
    }
    async _setup(T) {
      var self = this;
      await this._waitFont('800 190px Archivo');
      var scene = new T.Scene();
      var cam = this._camera = new T.PerspectiveCamera(35, 1, 0.1, 50);
      cam.position.set(0, 0, 6.6);
      var renderer = this._mkRenderer(T);

      var lines = (this.getAttribute('data-lines') || 'MATIN|SAIYED').split('|');
      var fpx = parseFloat(this.getAttribute('data-font-px') || '190');
      var yOff = parseFloat(this.getAttribute('data-y') || '0');
      var W = 1280, H = 560;
      var oc = document.createElement('canvas'); oc.width = W; oc.height = H;
      var ctx = oc.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = '#000'; ctx.font = '800 ' + fpx + 'px Archivo, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var lgap = fpx * 1.137;
      for (var li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li], W / 2, H / 2 + (li - (lines.length - 1) / 2) * lgap);
      }
      var img = ctx.getImageData(0, 0, W, H).data;
      var step = 4, targets = [];
      for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) {
        if (img[(y * W + x) * 4 + 3] > 140) targets.push(x, y);
      }
      var n = targets.length / 2;
      var s = parseFloat(this.getAttribute('data-world-w') || '6.2') / W;
      var posA = new Float32Array(n * 3), tgtA = new Float32Array(n * 3), colA = new Float32Array(n * 3), rndA = new Float32Array(n);
      var ink = [0.05, 0.05, 0.043], red = [0.77, 0.2, 0.13];
      for (var i = 0; i < n; i++) {
        tgtA[i * 3] = (targets[i * 2] - W / 2) * s;
        tgtA[i * 3 + 1] = -(targets[i * 2 + 1] - H / 2) * s + yOff;
        tgtA[i * 3 + 2] = 0;
        posA[i * 3] = (hash(i * 7) - 0.5) * 16;
        posA[i * 3 + 1] = (hash(i * 13) - 0.5) * 10;
        posA[i * 3 + 2] = (hash(i * 29) - 0.5) * 6;
        var c = hash(i * 17) < 0.025 ? red : ink;
        colA[i * 3] = c[0]; colA[i * 3 + 1] = c[1]; colA[i * 3 + 2] = c[2];
        rndA[i] = 0.028 + hash(i * 31) * 0.05;
      }
      if (this._reduced) posA.set(tgtA);
      var g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(posA, 3));
      g.setAttribute('color', new T.BufferAttribute(colA, 3));
      scene.add(new T.Points(g, new T.PointsMaterial({ size: 0.026, vertexColors: true })));
      var pos = g.attributes.position;
      var mouse3 = new T.Vector3(1e3, 1e3, 0), v = new T.Vector3();

      this._loop(function (tms) {
        var t = tms / 1000, m = self._mouse;
        if (m.inside) {
          v.set(m.tx, m.ty, 0.5).unproject(cam);
          var dir = v.sub(cam.position).normalize();
          var dist = -cam.position.z / dir.z;
          mouse3.copy(cam.position).addScaledVector(dir, dist);
        } else mouse3.set(1e3, 1e3, 0);
        var arr = pos.array, wob = self._reduced ? 0 : 0.015;
        for (var i = 0; i < n; i++) {
          var ix = i * 3, k = rndA[i];
          var px = arr[ix], py = arr[ix + 1], pz = arr[ix + 2];
          var tx = tgtA[ix] + Math.sin(t * 1.1 + i * 0.37) * wob;
          var ty = tgtA[ix + 1] + Math.cos(t * 0.9 + i * 0.53) * wob;
          px += (tx - px) * k; py += (ty - py) * k; pz += (0 - pz) * k;
          var dx = px - mouse3.x, dy = py - mouse3.y, d2 = dx * dx + dy * dy;
          if (d2 < 0.8) {
            var dd = Math.sqrt(d2) || 0.001, f = ((0.8 - d2) / 0.8) * 0.1;
            px += (dx / dd) * f; py += (dy / dd) * f; pz += (hash(i) - 0.5) * f;
          }
          arr[ix] = px; arr[ix + 1] = py; arr[ix + 2] = pz;
        }
        pos.needsUpdate = true;
        cam.position.x += (m.tx * (m.inside ? 0.22 : 0) - cam.position.x) * 0.03;
        cam.lookAt(0, 0, 0);
        renderer.render(scene, cam);
      });
    }
  }

  /* ── custom cursor: red dot + trailing ring, grows on links ── */
  class MSCursor extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      var frame = this.closest('[data-hero-frame]') || this.parentElement;
      this.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:60;display:block;overflow:hidden;';
      var red = (getComputedStyle(frame).getPropertyValue('--hero-red') || '#c43222').trim() || '#c43222';
      var dot = document.createElement('div');
      dot.style.cssText = 'position:absolute;left:0;top:0;width:6px;height:6px;margin:-3px;border-radius:50%;background:' + red + ';opacity:0;';
      var ring = document.createElement('div');
      ring.style.cssText = 'position:absolute;left:0;top:0;width:34px;height:34px;margin:-17px;border-radius:50%;border:1px solid ' + red + ';opacity:0;transition:width .25s,height .25s,margin .25s,background-color .25s;';
      this.appendChild(ring); this.appendChild(dot);
      frame.style.cursor = 'none';
      frame.querySelectorAll('a,button').forEach(function (el) { el.style.cursor = 'none'; });
      var x = 0, y = 0, rx = 0, ry = 0, vis = false, self = this;
      frame.addEventListener('mousemove', function (e) {
        var r = self.getBoundingClientRect();
        x = e.clientX - r.left; y = e.clientY - r.top; vis = true;
      });
      frame.addEventListener('mouseleave', function () { vis = false; });
      frame.addEventListener('mouseover', function (e) {
        var on = !!(e.target.closest && e.target.closest('a,button'));
        ring.style.width = ring.style.height = on ? '58px' : '34px';
        ring.style.margin = on ? '-29px' : '-17px';
        ring.style.backgroundColor = on ? 'rgba(196,50,34,0.12)' : 'transparent';
      });
      (function tick() {
        requestAnimationFrame(tick);
        rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
        dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        dot.style.opacity = vis ? 1 : 0;
        ring.style.opacity = vis ? 0.9 : 0;
      })();
    }
  }

  /* ── 2C · morphing career figures: particles cycle +25% → 96% → 68→94% → 2026 ── */
  class HeroFigures extends HeroBase {
    async _waitFont(spec) {
      for (var i = 0; i < 20; i++) {
        try { await document.fonts.load(spec); } catch (e) { }
        if (document.fonts.check(spec)) return true;
        await new Promise(function (r) { setTimeout(r, 200); });
      }
      return document.fonts.check(spec);
    }
    async _setup(T) {
      var self = this;
      await this._waitFont('600 230px "IBM Plex Mono"');
      var scene = new T.Scene();
      var cam = this._camera = new T.PerspectiveCamera(35, 1, 0.1, 50);
      cam.position.set(0, 0, 6.4);
      var renderer = this._mkRenderer(T);
      var FIGS = [['+25%', 'VS. SALES TARGET'], ['96%', 'CLIENT SATISFACTION'], ['68→94%', 'SATISFACTION LIFT'], ['2026', 'CFA LEVEL I CANDIDATE']];
      var W = 1240, H = 420, step = 4;
      var oc = document.createElement('canvas'); oc.width = W; oc.height = H;
      var ctx = oc.getContext('2d', { willReadFrequently: true });
      var sets = FIGS.map(function (f) {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '600 ' + (f[0].length > 4 ? 175 : 235) + 'px "IBM Plex Mono", monospace';
        ctx.fillText(f[0], W / 2, H / 2);
        var d = ctx.getImageData(0, 0, W, H).data, t = [];
        for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) {
          if (d[(y * W + x) * 4 + 3] > 140) t.push(x, y);
        }
        return t;
      });
      var N = 0; sets.forEach(function (t) { N = Math.max(N, t.length / 2); });
      var s = 5.4 / W;
      var tgts = sets.map(function (t) {
        var m = t.length / 2, a = new Float32Array(N * 3);
        for (var i = 0; i < N; i++) {
          var j = i % m;
          a[i * 3] = (t[j * 2] - W / 2) * s;
          a[i * 3 + 1] = -(t[j * 2 + 1] - H / 2) * s;
          a[i * 3 + 2] = 0;
        }
        return a;
      });
      var posA = new Float32Array(N * 3), colA = new Float32Array(N * 3), rndA = new Float32Array(N);
      var ink = [0.05, 0.05, 0.043], red = [0.77, 0.2, 0.13];
      for (var i = 0; i < N; i++) {
        posA[i * 3] = (hash(i * 7) - 0.5) * 15;
        posA[i * 3 + 1] = (hash(i * 13) - 0.5) * 9;
        posA[i * 3 + 2] = (hash(i * 29) - 0.5) * 6;
        var c = hash(i * 17) < 0.03 ? red : ink;
        colA[i * 3] = c[0]; colA[i * 3 + 1] = c[1]; colA[i * 3 + 2] = c[2];
        rndA[i] = 0.03 + hash(i * 31) * 0.055;
      }
      if (this._reduced) posA.set(tgts[0]);
      var g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(posA, 3));
      g.setAttribute('color', new T.BufferAttribute(colA, 3));
      scene.add(new T.Points(g, new T.PointsMaterial({ size: 0.03, vertexColors: true })));
      var pos = g.attributes.position;
      /* caption the component owns */
      var cap = document.createElement('div');
      cap.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);bottom:10px;display:flex;flex-direction:column;align-items:center;gap:12px;pointer-events:none;';
      var lab = document.createElement('div');
      lab.style.cssText = "font:600 12px 'IBM Plex Mono',monospace;letter-spacing:0.3em;color:#46453f;transition:opacity .3s;";
      lab.textContent = FIGS[0][1];
      var ticks = document.createElement('div');
      ticks.style.cssText = 'display:flex;gap:8px;';
      var tickEls = FIGS.map(function (_, ti) {
        var tk = document.createElement('i');
        tk.style.cssText = 'width:18px;height:2px;background:' + (ti === 0 ? '#c43222' : '#d5d3cc') + ';transition:background .3s;';
        ticks.appendChild(tk); return tk;
      });
      cap.appendChild(lab); cap.appendChild(ticks); this.appendChild(cap);
      var cur = 0, lastSwitch = 0;
      var mouse3 = new T.Vector3(1e3, 1e3, 0), v = new T.Vector3();
      this._loop(function (tms) {
        var t = tms / 1000, m = self._mouse;
        if (!self._reduced && t - lastSwitch > 3.6) {
          lastSwitch = t; cur = (cur + 1) % tgts.length;
          lab.style.opacity = 0;
          setTimeout(function () { lab.textContent = FIGS[cur][1]; lab.style.opacity = 1; }, 300);
          tickEls.forEach(function (tk, ti) { tk.style.background = ti === cur ? '#c43222' : '#d5d3cc'; });
          var ar = pos.array;
          for (var ki = 0; ki < N; ki++) {
            ar[ki * 3] += (hash(ki * 3 + cur) - 0.5) * 0.9;
            ar[ki * 3 + 1] += (hash(ki * 5 + cur) - 0.5) * 0.9;
            ar[ki * 3 + 2] += (hash(ki * 11 + cur) - 0.5) * 0.7;
          }
        }
        if (m.inside) {
          v.set(m.tx, m.ty, 0.5).unproject(cam);
          var dir = v.sub(cam.position).normalize();
          mouse3.copy(cam.position).addScaledVector(dir, -cam.position.z / dir.z);
        } else mouse3.set(1e3, 1e3, 0);
        var tgt = tgts[cur], arr = pos.array, wob = self._reduced ? 0 : 0.014;
        for (var i = 0; i < N; i++) {
          var ix = i * 3, k = rndA[i];
          var px = arr[ix], py = arr[ix + 1], pz = arr[ix + 2];
          var tx = tgt[ix] + Math.sin(t * 1.1 + i * 0.37) * wob;
          var ty = tgt[ix + 1] + Math.cos(t * 0.9 + i * 0.53) * wob;
          px += (tx - px) * k; py += (ty - py) * k; pz += (0 - pz) * k;
          var dx = px - mouse3.x, dy = py - mouse3.y, d2 = dx * dx + dy * dy;
          if (d2 < 0.7) {
            var dd = Math.sqrt(d2) || 0.001, f = ((0.7 - d2) / 0.7) * 0.09;
            px += (dx / dd) * f; py += (dy / dd) * f; pz += (hash(i) - 0.5) * f;
          }
          arr[ix] = px; arr[ix + 1] = py; arr[ix + 2] = pz;
        }
        pos.needsUpdate = true;
        renderer.render(scene, cam);
      });
    }
  }

  /* ── 3A · cover plate that restates itself: wordmark ⇄ career figures ── */
  class HeroCoverFigures extends HeroBase {
    async _waitFont(spec) {
      for (var i = 0; i < 20; i++) {
        try { await document.fonts.load(spec); } catch (e) { }
        if (document.fonts.check(spec)) return true;
        await new Promise(function (r) { setTimeout(r, 200); });
      }
      return document.fonts.check(spec);
    }
    async _setup(T) {
      var self = this;
      await this._waitFont('800 175px Archivo');
      await this._waitFont('600 225px "IBM Plex Mono"');
      var scene = new T.Scene();
      var cam = this._camera = new T.PerspectiveCamera(35, 1, 0.1, 50);
      cam.position.set(0, 0, 6.4);
      var renderer = this._mkRenderer(T);
      var SPECS = [
        { font: '800 230px Archivo, sans-serif', lines: ['MATIN', 'SAIYED'], gap: 262, label: 'FINANCE & OPERATIONS ANALYST', hold: 6.5 },
        { font: '600 225px "IBM Plex Mono", monospace', lines: ['+25%'], gap: 0, label: 'VS. SALES TARGET', hold: 3.2 },
        { font: '600 225px "IBM Plex Mono", monospace', lines: ['96%'], gap: 0, label: 'CLIENT SATISFACTION', hold: 3.2 },
        { font: '600 165px "IBM Plex Mono", monospace', lines: ['68→94%'], gap: 0, label: 'SATISFACTION LIFT', hold: 3.2 },
        { font: '600 225px "IBM Plex Mono", monospace', lines: ['2026'], gap: 0, label: 'CFA LEVEL I CANDIDATE', hold: 3.2 }
      ];
      var W = 1280, H = 560, step = (innerWidth < 760) ? 6 : 4;
      var oc = document.createElement('canvas'); oc.width = W; oc.height = H;
      var ctx = oc.getContext('2d', { willReadFrequently: true });
      var sets = SPECS.map(function (sp) {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = sp.font;
        for (var li = 0; li < sp.lines.length; li++) {
          ctx.fillText(sp.lines[li], W / 2, H / 2 + (li - (sp.lines.length - 1) / 2) * (sp.gap || 0));
        }
        var d = ctx.getImageData(0, 0, W, H).data, t = [];
        for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) {
          if (d[(y * W + x) * 4 + 3] > 140) t.push(x, y);
        }
        return t;
      });
      var N = 0; sets.forEach(function (t) { N = Math.max(N, t.length / 2); });
      var s = parseFloat(this.getAttribute('data-world-w') || '5.2') / W;
      var tgts = sets.map(function (t) {
        var m = t.length / 2, a = new Float32Array(N * 3);
        for (var i = 0; i < N; i++) {
          var j = i % m;
          a[i * 3] = (t[j * 2] - W / 2) * s;
          a[i * 3 + 1] = -(t[j * 2 + 1] - H / 2) * s;
          a[i * 3 + 2] = 0;
        }
        return a;
      });
      var posA = new Float32Array(N * 3), colA = new Float32Array(N * 3), rndA = new Float32Array(N);
      var redFlag = new Uint8Array(N);
      var ink = [0.05, 0.05, 0.043], red = [0.77, 0.2, 0.13];
      for (var i = 0; i < N; i++) {
        posA[i * 3] = (hash(i * 7) - 0.5) * 15;
        posA[i * 3 + 1] = (hash(i * 13) - 0.5) * 9;
        posA[i * 3 + 2] = (hash(i * 29) - 0.5) * 6;
        var isr = hash(i * 17) < 0.025; redFlag[i] = isr ? 1 : 0;
        var c = isr ? red : ink;
        colA[i * 3] = c[0]; colA[i * 3 + 1] = c[1]; colA[i * 3 + 2] = c[2];
        rndA[i] = 0.03 + hash(i * 31) * 0.055;
      }
      if (this._reduced) posA.set(tgts[0]);
      var g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(posA, 3));
      g.setAttribute('color', new T.BufferAttribute(colA, 3));
      scene.add(new T.Points(g, new T.PointsMaterial({ size: 0.026, vertexColors: true })));
      var pos = g.attributes.position;
      var cap = document.createElement('div');
      cap.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);bottom:8px;display:flex;flex-direction:column;align-items:center;gap:12px;pointer-events:none;';
      var lab = document.createElement('div');
      lab.style.cssText = "font:600 12px 'IBM Plex Mono',monospace;letter-spacing:0.3em;color:#46453f;transition:opacity .3s;white-space:nowrap;";
      lab.textContent = SPECS[0].label;
      var ticks = document.createElement('div');
      ticks.style.cssText = 'display:flex;gap:8px;';
      var tickEls = SPECS.map(function (_, ti) {
        var tk = document.createElement('i');
        tk.style.cssText = 'width:18px;height:2px;background:' + (ti === 0 ? '#c43222' : '#d5d3cc') + ';transition:background .3s;';
        ticks.appendChild(tk); return tk;
      });
      cap.appendChild(lab); cap.appendChild(ticks); this.appendChild(cap);
      var cur = 0, lastSwitch = 0;
      var noCycle = this.hasAttribute('data-static');
      var colAttr = g.attributes.color;
      var applyTheme = function () {
        var dark = document.documentElement.dataset.theme === 'dark';
        var base = dark ? [0.945, 0.937, 0.918] : ink;
        var rd = dark ? [0.88, 0.34, 0.29] : red;
        for (var ci = 0; ci < N; ci++) {
          var cc = redFlag[ci] ? rd : base;
          colAttr.array[ci * 3] = cc[0]; colAttr.array[ci * 3 + 1] = cc[1]; colAttr.array[ci * 3 + 2] = cc[2];
        }
        colAttr.needsUpdate = true;
        lab.style.color = dark ? '#b9b6ad' : '#46453f';
        tickEls.forEach(function (tk, ti) { tk.style.background = ti === cur ? (dark ? '#e0564a' : '#c43222') : (dark ? '#3a3936' : '#d5d3cc'); });
      };
      new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      applyTheme();
      var mouse3 = new T.Vector3(1e3, 1e3, 0), v = new T.Vector3();
      this._loop(function (tms) {
        var t = tms / 1000, m = self._mouse;
        if (!self._reduced && !noCycle && !window.__MS_PLATE_STATIC && t - lastSwitch > SPECS[cur].hold) {
          lastSwitch = t; cur = (cur + 1) % tgts.length;
          lab.style.opacity = 0;
          setTimeout(function () { lab.textContent = SPECS[cur].label; lab.style.opacity = 1; }, 300);
          applyTheme();
          var ar = pos.array;
          for (var ki = 0; ki < N; ki++) {
            ar[ki * 3] += (hash(ki * 3 + cur) - 0.5) * 0.9;
            ar[ki * 3 + 1] += (hash(ki * 5 + cur) - 0.5) * 0.9;
            ar[ki * 3 + 2] += (hash(ki * 11 + cur) - 0.5) * 0.7;
          }
        }
        if (m.inside) {
          v.set(m.tx, m.ty, 0.5).unproject(cam);
          var dir = v.sub(cam.position).normalize();
          mouse3.copy(cam.position).addScaledVector(dir, -cam.position.z / dir.z);
        } else mouse3.set(1e3, 1e3, 0);
        var tgt = tgts[cur], arr = pos.array, wob = self._reduced ? 0 : 0.014;
        for (var i = 0; i < N; i++) {
          var ix = i * 3, k = rndA[i];
          var px = arr[ix], py = arr[ix + 1], pz = arr[ix + 2];
          var tx = tgt[ix] + Math.sin(t * 1.1 + i * 0.37) * wob;
          var ty = tgt[ix + 1] + Math.cos(t * 0.9 + i * 0.53) * wob;
          px += (tx - px) * k; py += (ty - py) * k; pz += (0 - pz) * k;
          var dx = px - mouse3.x, dy = py - mouse3.y, d2 = dx * dx + dy * dy;
          if (d2 < 0.7) {
            var dd = Math.sqrt(d2) || 0.001, f = ((0.7 - d2) / 0.7) * 0.09;
            px += (dx / dd) * f; py += (dy / dd) * f; pz += (hash(i) - 0.5) * f;
          }
          arr[ix] = px; arr[ix + 1] = py; arr[ix + 2] = pz;
        }
        pos.needsUpdate = true;
        renderer.render(scene, cam);
      });
    }
  }

  /* ── 2A · halftone portrait: 2D canvas print, solid ink dots sized by tone ── */
  class HeroHalftone extends HTMLElement {
    connectedCallback() {
      if (this._i) return; this._i = 1;
      this.style.cssText += ';display:block;position:absolute;inset:0;overflow:hidden;';
      var c = document.createElement('canvas');
      c.style.cssText = 'width:100%;height:100%;display:block;opacity:0;transition:opacity .9s ease;';
      this.appendChild(c);
      this._c = c; this._x = c.getContext('2d');
      this._reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._dpr = Math.min(devicePixelRatio, 2);
      this._mx = -1e4; this._my = -1e4; this._bx = 0; this._by = 0; this._ba = 0;
      var self = this;
      this.addEventListener('mousemove', function (e) {
        var r = self.getBoundingClientRect();
        self._mx = (e.clientX - r.left) * self._dpr; self._my = (e.clientY - r.top) * self._dpr;
      });
      this.addEventListener('mouseleave', function () { self._mx = self._my = -1e4; });
      this._visible = false;
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          self._visible = e.isIntersecting;
          if (e.isIntersecting && !self._booted) {
            self._booted = 1;
            var img = new Image();
            img.onload = function () { self._sample(img); self._run(); };
            img.onerror = function () { console.warn('[hero] portrait image failed to load'); };
            img.src = self.getAttribute('data-src') || 'images/portrait-1074w.webp';
          }
        });
      }, { rootMargin: '300px' }).observe(this);
      new ResizeObserver(function () { self._fit(); }).observe(this);
      this._dark = false;
      var upd = function () {
        var d = document.documentElement.dataset.theme === 'dark';
        if (d !== self._dark) { self._dark = d; self._staticDirty = 1; }
      };
      upd();
      new MutationObserver(upd).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
    _fit() {
      var w = Math.max(this.clientWidth, 4), h = Math.max(this.clientHeight, 4);
      this._c.width = w * this._dpr; this._c.height = h * this._dpr;
      this._layout = null; this._staticDirty = 1;
    }
    _sample(img) {
      /* hi-res plate: sample the 1074w source on a fine grid */
      var W = 780, H = 930;
      var oc = document.createElement('canvas'); oc.width = W; oc.height = H;
      var ctx = oc.getContext('2d', { willReadFrequently: true });
      var sc = Math.max(W / img.width, H / img.height);
      ctx.drawImage(img, (W - img.width * sc) / 2, (H - img.height * sc) / 2 - 30, img.width * sc, img.height * sc);
      var d = ctx.getImageData(0, 0, W, H).data;
      var step = (innerWidth < 760) ? 3 : 2;
      var cols = Math.floor(W / step), rows = Math.floor(H / step);
      var lg = new Float32Array(cols * rows);
      for (var gy = 0; gy < rows; gy++) for (var gx = 0; gx < cols; gx++) {
        var di = ((gy * step) * W + (gx * step)) * 4;
        lg[gy * cols + gx] = (d[di] * 0.299 + d[di + 1] * 0.587 + d[di + 2] * 0.114) / 255;
      }
      var n = this._n = cols * rows;
      this._cols = cols; this._rows = rows; this._step = step;
      var lum = this._lum = new Float32Array(n);
      /* unsharp mask + contrast S-curve */
      for (var gy2 = 0; gy2 < rows; gy2++) for (var gx2 = 0; gx2 < cols; gx2++) {
        var sum = 0, cnt = 0;
        for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) {
          var yy = gy2 + oy, xx = gx2 + ox;
          if (yy >= 0 && yy < rows && xx >= 0 && xx < cols) { sum += lg[yy * cols + xx]; cnt++; }
        }
        var idx = gy2 * cols + gx2, l0 = lg[idx];
        var sharp = l0 + (l0 - sum / cnt) * 1.5;
        var l1 = (sharp - 0.5) * 1.18 + 0.5;
        lum[idx] = l1 < 0 ? 0 : (l1 > 1 ? 1 : l1);
      }
      this._staticDirty = 1;
    }
    _dotSize(i, pitch) {
      var l = this._lum[i];
      if (this._dark) { return l <= 0.13 ? 0 : pitch * (0.3 + Math.min(1, (l - 0.13) / 0.78) * 0.9); }
      if (l < 0.3) return pitch * 1.06; /* true darks: overlapping solid ink — flat field, no moiré */
      if (l < 0.42) { var m2 = (l - 0.3) / 0.12; return pitch * (1.06 + (0.71 - 1.06) * m2); }
      return pitch * (0.06 + (1 - l) * 1.12);
    }
    _renderStatic() {
      var c = this._c, cw = c.width, ch = c.height;
      if (!this._layout) {
        var m = 0.04;
        var fit = Math.min(cw * (1 - m * 2) / 780, ch * (1 - m * 2) / 930);
        this._dw = 780 * fit; this._dh = 930 * fit;
        this._ox = (cw - this._dw) / 2; this._oy = (ch - this._dh) / 2 + ch * 0.015;
        this._pitch = this._dw / this._cols;
        this._layout = 1;
      }
      if (!this._sc || this._sc.width !== cw || this._sc.height !== ch) {
        this._sc = document.createElement('canvas'); this._sc.width = cw; this._sc.height = ch;
      }
      var sx2 = this._sc.getContext('2d');
      sx2.clearRect(0, 0, cw, ch);
      sx2.fillStyle = this._dark ? '#ece9e2' : '#14130f';
      var cols = this._cols, n = this._n, pitch = this._pitch;
      var ox = this._ox, oy = this._oy, dw = this._dw, dh = this._dh;
      var cu = cols, rw = this._rows;
      for (var i = 0; i < n; i++) {
        var s = this._dotSize(i, pitch);
        if (s <= 0.01) continue;
        var px = ox + ((i % cu) / cu) * dw, py = oy + (Math.floor(i / cu) / rw) * dh;
        sx2.fillRect(px - s / 2, py - s / 2, s, s);
      }
      this._staticDirty = 0;
      this._c.style.opacity = 1;
    }
    _run() {
      var self = this;
      this._fit();
      var tick = function () {
        requestAnimationFrame(tick);
        if (!self._visible || !self._n) return;
        self._draw();
      };
      requestAnimationFrame(tick);
    }
    _activate(i) {
      if (this._isActive[i] || this._activeN >= this._active.length) return;
      this._isActive[i] = 1; this._active[this._activeN++] = i;
    }
    _draw() {
      var c = this._c, x = this._x;
      if (this._staticDirty) this._renderStatic();
      x.clearRect(0, 0, c.width, c.height);
      x.drawImage(this._sc, 0, 0);
      if (this._reduced) return;
      /* ink-pressure bloom: a soft sheen that follows the cursor across the print —
         rides only on printed pixels (source-atop), so the plate can never tear */
      if (this._mx > -1e3) {
        this._bx += (this._mx - this._bx) * 0.18;
        this._by += (this._my - this._by) * 0.18;
        this._ba += (1 - this._ba) * 0.12;
      } else { this._ba *= 0.9; }
      if (this._ba > 0.01) {
        var R = 95 * this._dpr;
        var grad = x.createRadialGradient(this._bx, this._by, 0, this._bx, this._by, R);
        var col = this._dark ? '236,233,226' : '244,243,240';
        grad.addColorStop(0, 'rgba(' + col + ',' + (0.14 * this._ba).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(' + col + ',0)');
        x.save();
        x.globalCompositeOperation = 'source-atop';
        x.fillStyle = grad;
        x.fillRect(this._bx - R, this._by - R, R * 2, R * 2);
        x.restore();
      }
    }
  }

  if (!customElements.get('ms-hero-cover-figures')) customElements.define('ms-hero-cover-figures', HeroCoverFigures);
  if (!customElements.get('ms-hero-figures')) customElements.define('ms-hero-figures', HeroFigures);
  if (!customElements.get('ms-hero-halftone')) customElements.define('ms-hero-halftone', HeroHalftone);
  if (!customElements.get('ms-hero-ledger')) customElements.define('ms-hero-ledger', HeroLedger);
  if (!customElements.get('ms-hero-type')) customElements.define('ms-hero-type', HeroType);
  if (!customElements.get('ms-cursor')) customElements.define('ms-cursor', MSCursor);
})();
