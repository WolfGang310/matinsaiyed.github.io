/* CFA Atelier — annotation overlay (Apple Pencil ink + per-LM notes)
 *
 * Loaded inside every Learning Module iframe and inside the master guide.
 *
 * In the master guide it provides:
 *   - owner_id management (random 32-char hex, in localStorage)
 *   - postMessage relay to the hub iframe so the LM injection knows the owner
 *
 * Inside a LM iframe (window.CFA_ANNOTATE is present) it provides:
 *   - Floating toolbar (top-right): pen / highlighter / eraser / color / undo / clear / notes / sync
 *   - Full-document canvas overlay anchored to absolute scroll position
 *   - Pointer-event filter: pointerType === 'pen' draws; touch always scrolls
 *   - Slide-out notes drawer (right side, half-width on iPad, full-width on phone)
 *   - Supabase upsert keyed by (owner_id, lm_key, kind) with 1.5s debounce
 *
 * Usage in master guide:
 *   <script src="/cfa/annotate.js" data-cfa-mode="host"></script>
 *
 * Usage in LM iframe (injected by hub openModule before srcdoc):
 *   <script>window.CFA_ANNOTATE = { url, anonKey, ownerId, lmKey, lmTitle };</script>
 *   <script src="/cfa/annotate.js"></script>
 */
(function () {
  'use strict';

  // ============================================================
  //  Constants
  // ============================================================
  var SUPA_URL  = 'https://igfchvbzmvfveecivswb.supabase.co';
  var SUPA_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZmNodmJ6bXZmdmVlY2l2c3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Mjk2MjYsImV4cCI6MjA4ODAwNTYyNn0.-oU8CN309uuINCsgnrwPqNcfYNZ0s2-rOZcu3j-QRlw';
  var TABLE     = 'cfa_annotations';
  var DEBOUNCE  = 1500; // ms
  var OWNER_KEY = 'cfa_owner_id_v1';

  var INK_COLORS = [
    { name: 'Ink',       value: '#1a1a1a' },
    { name: 'Blue',      value: '#1d4ed8' },
    { name: 'Red',       value: '#dc2626' },
    { name: 'Green',     value: '#15803d' },
    { name: 'Yellow',    value: '#facc15' }
  ];

  // ============================================================
  //  Mode dispatch — wait for DOM ready so document.body exists
  // ============================================================
  var script = document.currentScript;
  var mode = (script && script.getAttribute('data-cfa-mode')) || (window.CFA_ANNOTATE ? 'lm' : 'host');

  function whenReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  if (mode === 'host') return whenReady(bootHost);
  if (mode === 'lm')   return whenReady(bootLm);

  // ============================================================
  //  HOST (master guide) — owner_id + postMessage relay
  // ============================================================
  function bootHost() {
    var ownerId = ensureOwnerId();
    window.__cfaOwnerId = ownerId;

    // Wait until a hub iframe exists, then push owner on every load.
    var attach = function () {
      var hub = document.getElementById('hub-iframe');
      if (!hub) return setTimeout(attach, 200);
      hub.addEventListener('load', function () {
        try { hub.contentWindow.postMessage({ type: 'cfa_owner', ownerId: ownerId }, '*'); }
        catch (e) {}
      });
    };
    attach();

    // Forward owner updates from settings panel back into hub.
    window.__cfaSetOwner = function (newId) {
      if (!/^[a-f0-9]{32}$/.test(newId)) return false;
      try { localStorage.setItem(OWNER_KEY, newId); } catch (_) {}
      window.__cfaOwnerId = newId;
      var hub = document.getElementById('hub-iframe');
      if (hub) {
        try { hub.contentWindow.postMessage({ type: 'cfa_owner', ownerId: newId }, '*'); }
        catch (_) {}
      }
      return true;
    };

    function ensureOwnerId() {
      try {
        var v = localStorage.getItem(OWNER_KEY);
        if (v && /^[a-f0-9]{32}$/.test(v)) return v;
      } catch (_) {}
      var bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      var hex = '';
      for (var i = 0; i < bytes.length; i++) hex += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
      try { localStorage.setItem(OWNER_KEY, hex); } catch (_) {}
      return hex;
    }
  }

  // ============================================================
  //  LM IFRAME — full annotation toolkit
  // ============================================================
  function bootLm() {
    var cfg = window.CFA_ANNOTATE || {};
    if (!cfg.lmKey) { console.warn('[CFA] missing lmKey'); return; }
    cfg.url     = cfg.url     || SUPA_URL;
    cfg.anonKey = cfg.anonKey || SUPA_KEY;
    cfg.ownerId = cfg.ownerId || '';

    // ----- State -----
    var state = {
      tool: 'pen',           // 'pen' | 'highlighter' | 'eraser'
      color: INK_COLORS[0].value,
      strokes: [],           // saved strokes (replayed on load)
      live: null,            // current in-progress stroke
      noteMd: '',
      ownerId: cfg.ownerId,
      drawingOn: false,      // whether canvas is capturing pointer events
      saveTimer: null,
      noteTimer: null,
      ready: false,
      pendingPushAfterReady: false
    };

    // Inject styles
    injectStyles();

    // Build UI
    var dom = buildUi();

    // Fetch existing data and replay
    if (state.ownerId) {
      loadFromCloud().catch(function (e) { console.warn('[CFA] load failed', e); });
    } else {
      // Wait for owner_id from parent
      window.addEventListener('message', function onMsg(e) {
        if (e.data && e.data.type === 'cfa_owner' && /^[a-f0-9]{32}$/.test(e.data.ownerId)) {
          state.ownerId = e.data.ownerId;
          dom.syncBadge.textContent = shortOwner(state.ownerId);
          loadFromCloud().catch(function (er) { console.warn('[CFA] load failed', er); });
          window.removeEventListener('message', onMsg);
        }
      });
    }

    // Listen for owner changes from parent (settings sync)
    window.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'cfa_owner_change' && /^[a-f0-9]{32}$/.test(e.data.ownerId)) {
        state.ownerId = e.data.ownerId;
        dom.syncBadge.textContent = shortOwner(e.data.ownerId);
        // Wipe local & reload
        state.strokes = [];
        state.noteMd = '';
        dom.notesArea.value = '';
        redrawAll();
        loadFromCloud().catch(function (er) { console.warn('[CFA] reload failed', er); });
      }
    });

    // ============================================================
    //  Styles
    // ============================================================
    function injectStyles() {
      var css = `
      .cfa-toolbar {
        position: fixed; top: 14px; right: 14px; z-index: 2147483646;
        display: flex; gap: 6px; padding: 6px;
        background: rgba(15,15,17,0.92); backdrop-filter: blur(12px);
        border-radius: 14px; box-shadow: 0 6px 24px rgba(0,0,0,0.35);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        user-select: none; -webkit-user-select: none;
        touch-action: none;
      }
      .cfa-tb-btn {
        width: 40px; height: 40px; border: none; border-radius: 9px;
        background: transparent; color: #e5e7eb; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; transition: background .15s, transform .1s;
        position: relative;
      }
      .cfa-tb-btn:hover { background: rgba(255,255,255,0.08); }
      .cfa-tb-btn:active { transform: scale(0.92); }
      .cfa-tb-btn.on {
        background: linear-gradient(135deg,#6366f1,#8b5cf6);
        color: #fff; box-shadow: 0 2px 8px rgba(99,102,241,0.5);
      }
      .cfa-tb-btn .cfa-color-dot {
        width: 18px; height: 18px; border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.7);
      }
      .cfa-tb-sep { width: 1px; background: rgba(255,255,255,0.12); margin: 4px 2px; }

      .cfa-color-pop {
        position: fixed; top: 64px; right: 14px; z-index: 2147483647;
        background: rgba(15,15,17,0.95); backdrop-filter: blur(12px);
        padding: 8px; border-radius: 12px; display: none; gap: 6px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.4);
      }
      .cfa-color-pop.open { display: flex; }
      .cfa-color-swatch {
        width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
        border: 3px solid transparent; transition: border-color .15s;
      }
      .cfa-color-swatch.on { border-color: #fff; }

      .cfa-canvas {
        position: absolute; top: 0; left: 0;
        pointer-events: none; z-index: 2147483640;
      }
      .cfa-canvas.drawing { pointer-events: auto; touch-action: none; }

      .cfa-notes-drawer {
        position: fixed; top: 0; right: -640px; width: min(640px, 95vw); height: 100vh;
        background: #fff; color: #111; z-index: 2147483645;
        box-shadow: -8px 0 32px rgba(0,0,0,0.25);
        display: flex; flex-direction: column;
        transition: right .35s cubic-bezier(.4,.1,.2,1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-notes-drawer { background: #1c1d20; color: #f3f4f6; }
      }
      .cfa-notes-drawer.open { right: 0; }
      .cfa-notes-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 18px; border-bottom: 1px solid rgba(0,0,0,0.08);
        font-weight: 600;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-notes-header { border-bottom-color: rgba(255,255,255,0.1); }
      }
      .cfa-notes-area {
        flex: 1; padding: 16px 18px; border: none; outline: none; resize: none;
        font: 16px/1.55 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: transparent; color: inherit;
      }
      .cfa-notes-status {
        padding: 8px 18px; font-size: 12px; opacity: 0.6;
        border-top: 1px solid rgba(0,0,0,0.06);
      }
      @media (prefers-color-scheme: dark) {
        .cfa-notes-status { border-top-color: rgba(255,255,255,0.08); }
      }
      .cfa-notes-close {
        background: none; border: none; font-size: 22px; cursor: pointer;
        padding: 4px 10px; border-radius: 6px; color: inherit;
      }
      .cfa-notes-close:hover { background: rgba(0,0,0,0.06); }

      .cfa-sync-modal {
        position: fixed; inset: 0; background: rgba(0,0,0,0.55);
        z-index: 2147483647; display: none; align-items: center; justify-content: center;
        padding: 20px;
      }
      .cfa-sync-modal.open { display: flex; }
      .cfa-sync-card {
        background: #fff; color: #111; padding: 24px; border-radius: 18px;
        max-width: 460px; width: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      }
      @media (prefers-color-scheme: dark) {
        .cfa-sync-card { background: #1c1d20; color: #f3f4f6; }
      }
      .cfa-sync-card h3 { margin: 0 0 6px; font-size: 18px; }
      .cfa-sync-card p { margin: 4px 0 14px; font-size: 13px; opacity: 0.75; }
      .cfa-sync-card label { display: block; font-size: 12px; font-weight: 600; margin-top: 14px; opacity: 0.7; }
      .cfa-sync-id {
        font: 13px/1.4 ui-monospace, 'SF Mono', Menlo, monospace;
        word-break: break-all; padding: 10px 12px; border-radius: 8px;
        background: rgba(0,0,0,0.05); margin-top: 6px;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-sync-id { background: rgba(255,255,255,0.08); }
      }
      .cfa-sync-input {
        width: 100%; padding: 10px 12px; border-radius: 8px;
        border: 1px solid rgba(0,0,0,0.15); margin-top: 6px;
        font: 13px ui-monospace, 'SF Mono', Menlo, monospace;
        background: transparent; color: inherit;
        box-sizing: border-box;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-sync-input { border-color: rgba(255,255,255,0.18); }
      }
      .cfa-sync-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 18px; }
      .cfa-sync-btn {
        padding: 10px 16px; border-radius: 9px; border: none; cursor: pointer;
        font-size: 14px; font-weight: 600;
      }
      .cfa-sync-btn.primary { background: #6366f1; color: #fff; }
      .cfa-sync-btn.ghost { background: transparent; color: inherit; }

      .cfa-status {
        position: fixed; bottom: 16px; right: 16px; z-index: 2147483640;
        background: rgba(15,15,17,0.92); color: #e5e7eb;
        padding: 6px 12px; border-radius: 999px; font-size: 11px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        opacity: 0; transition: opacity .25s; pointer-events: none;
      }
      .cfa-status.show { opacity: 1; }

      @media (max-width: 540px) {
        .cfa-toolbar { top: 8px; right: 8px; padding: 4px; gap: 4px; }
        .cfa-tb-btn { width: 36px; height: 36px; font-size: 16px; }
      }
      `;
      var s = document.createElement('style');
      s.id = 'cfa-annotate-styles';
      s.textContent = css;
      document.head.appendChild(s);
    }

    // ============================================================
    //  UI
    // ============================================================
    function buildUi() {
      var d = {};

      // --- Toolbar ---
      d.toolbar = el('div', 'cfa-toolbar');
      d.btnPen   = tbBtn('✏️',  'Pen (Apple Pencil only)');
      d.btnHi    = tbBtn('🖍️',  'Highlighter');
      d.btnEr    = tbBtn('🧽',  'Eraser');
      d.btnColor = tbBtn('',    'Color');
      var dot = el('span', 'cfa-color-dot'); dot.style.background = state.color;
      d.btnColor.appendChild(dot); d.colorDot = dot;
      d.btnUndo  = tbBtn('↶',  'Undo');
      d.btnClear = tbBtn('🗑',  'Clear all ink');
      d.sep1     = el('div', 'cfa-tb-sep');
      d.btnNotes = tbBtn('📝',  'Notes');
      d.btnSync  = tbBtn('☁︎',  'Sync settings');

      [d.btnPen, d.btnHi, d.btnEr, d.btnColor, d.btnUndo, d.btnClear,
       d.sep1, d.btnNotes, d.btnSync].forEach(function (n) { d.toolbar.appendChild(n); });
      document.body.appendChild(d.toolbar);

      // --- Color popover ---
      d.colorPop = el('div', 'cfa-color-pop');
      d.swatches = INK_COLORS.map(function (c, i) {
        var sw = el('div', 'cfa-color-swatch' + (c.value === state.color ? ' on' : ''));
        sw.style.background = c.value;
        sw.title = c.name;
        sw.addEventListener('click', function () {
          state.color = c.value;
          d.colorDot.style.background = c.value;
          d.swatches.forEach(function (s) { s.classList.remove('on'); });
          sw.classList.add('on');
          d.colorPop.classList.remove('open');
        });
        d.colorPop.appendChild(sw);
        return sw;
      });
      document.body.appendChild(d.colorPop);

      // --- Canvas ---
      d.canvas = el('canvas', 'cfa-canvas');
      d.ctx = d.canvas.getContext('2d');
      document.body.appendChild(d.canvas);
      sizeCanvas();
      window.addEventListener('resize', sizeCanvas);
      // Recompute on document size change (content reflow, image load, etc.)
      var ro = new ResizeObserver(sizeCanvas);
      try { ro.observe(document.documentElement); } catch (_) {}

      // --- Notes drawer ---
      d.notesDrawer = el('div', 'cfa-notes-drawer');
      var hdr = el('div', 'cfa-notes-header');
      hdr.innerHTML = '<span>Notes — ' + escapeHtml(cfg.lmTitle || cfg.lmKey) + '</span>';
      d.notesClose = el('button', 'cfa-notes-close'); d.notesClose.textContent = '×';
      hdr.appendChild(d.notesClose);
      d.notesArea = el('textarea', 'cfa-notes-area');
      d.notesArea.placeholder = 'Type notes for this learning module…';
      d.notesStatus = el('div', 'cfa-notes-status'); d.notesStatus.textContent = 'Saved';
      d.notesDrawer.appendChild(hdr);
      d.notesDrawer.appendChild(d.notesArea);
      d.notesDrawer.appendChild(d.notesStatus);
      document.body.appendChild(d.notesDrawer);

      // --- Sync modal ---
      d.syncModal = el('div', 'cfa-sync-modal');
      var syncCard = el('div', 'cfa-sync-card');
      syncCard.innerHTML =
        '<h3>Sync across devices</h3>' +
        '<p>Your notes and ink are tied to a 32-character ID stored on this device. ' +
        'Copy it to another device to sync your annotations there.</p>' +
        '<label>This device</label>' +
        '<div class="cfa-sync-id" id="cfa-sync-id-show"></div>' +
        '<label>Use a different ID</label>' +
        '<input class="cfa-sync-input" id="cfa-sync-id-input" placeholder="paste 32-character ID" maxlength="32" />' +
        '<div class="cfa-sync-actions">' +
        '  <button class="cfa-sync-btn ghost" id="cfa-sync-cancel">Close</button>' +
        '  <button class="cfa-sync-btn primary" id="cfa-sync-copy">Copy ID</button>' +
        '  <button class="cfa-sync-btn primary" id="cfa-sync-save">Use this ID</button>' +
        '</div>';
      d.syncModal.appendChild(syncCard);
      document.body.appendChild(d.syncModal);

      // --- Status toast ---
      d.status = el('div', 'cfa-status');
      document.body.appendChild(d.status);

      // --- Sync badge in toolbar (short owner id) ---
      d.syncBadge = el('span'); d.syncBadge.style.fontSize = '9px'; d.syncBadge.style.position = 'absolute';
      d.syncBadge.style.bottom = '2px'; d.syncBadge.style.right = '4px'; d.syncBadge.style.opacity = '0.55';
      d.syncBadge.textContent = state.ownerId ? shortOwner(state.ownerId) : '…';
      d.btnSync.appendChild(d.syncBadge);

      // --- Behavior wiring ---
      d.btnPen.addEventListener('click', function () { setTool('pen'); });
      d.btnHi.addEventListener('click',  function () { setTool('highlighter'); });
      d.btnEr.addEventListener('click',  function () { setTool('eraser'); });
      d.btnColor.addEventListener('click', function (e) {
        e.stopPropagation(); d.colorPop.classList.toggle('open');
      });
      document.addEventListener('click', function () { d.colorPop.classList.remove('open'); });
      d.btnUndo.addEventListener('click', undoStroke);
      d.btnClear.addEventListener('click', function () {
        if (!state.strokes.length && !state.live) return;
        if (!confirm('Erase all ink on this learning module?')) return;
        state.strokes = []; state.live = null;
        redrawAll(); scheduleSaveInk();
      });
      d.btnNotes.addEventListener('click', function () {
        d.notesDrawer.classList.toggle('open');
        if (d.notesDrawer.classList.contains('open')) d.notesArea.focus();
      });
      d.notesClose.addEventListener('click', function () { d.notesDrawer.classList.remove('open'); });
      d.notesArea.addEventListener('input', function () {
        state.noteMd = d.notesArea.value;
        d.notesStatus.textContent = 'Saving…';
        scheduleSaveNote();
      });
      d.btnSync.addEventListener('click', openSync);

      // Pointer handling on canvas
      d.canvas.addEventListener('pointerdown', onPointerDown);
      d.canvas.addEventListener('pointermove', onPointerMove);
      d.canvas.addEventListener('pointerup',   onPointerUp);
      d.canvas.addEventListener('pointercancel', onPointerUp);
      d.canvas.addEventListener('pointerleave',  onPointerUp);

      function tbBtn(label, title) {
        var b = el('button', 'cfa-tb-btn'); b.textContent = label; b.title = title;
        return b;
      }
      function el(tag, cls) {
        var n = document.createElement(tag); if (cls) n.className = cls; return n;
      }
      function setTool(t) {
        state.tool = t; state.drawingOn = true;
        [d.btnPen, d.btnHi, d.btnEr].forEach(function (b) { b.classList.remove('on'); });
        if (t === 'pen') d.btnPen.classList.add('on');
        if (t === 'highlighter') d.btnHi.classList.add('on');
        if (t === 'eraser') d.btnEr.classList.add('on');
        // Toggle off if clicking the same tool
        if (state.lastTool === t) {
          state.drawingOn = false; state.lastTool = null;
          [d.btnPen, d.btnHi, d.btnEr].forEach(function (b) { b.classList.remove('on'); });
        } else {
          state.lastTool = t;
        }
        d.canvas.classList.toggle('drawing', state.drawingOn);
        toast(state.drawingOn ? (t === 'eraser' ? 'Eraser ON' : 'Pencil drawing — ' + t.toUpperCase()) : 'Drawing OFF');
      }
      function openSync() {
        document.getElementById('cfa-sync-id-show').textContent = state.ownerId || '(none)';
        document.getElementById('cfa-sync-id-input').value = '';
        d.syncModal.classList.add('open');
      }
      d.syncModal.addEventListener('click', function (e) {
        if (e.target.id === 'cfa-sync-cancel' || e.target === d.syncModal) {
          d.syncModal.classList.remove('open');
        } else if (e.target.id === 'cfa-sync-copy') {
          var id = state.ownerId || '';
          if (!id) return toast('No ID yet');
          navigator.clipboard.writeText(id).then(function () { toast('Copied'); }).catch(function () {
            try {
              var ta = document.createElement('textarea'); ta.value = id;
              document.body.appendChild(ta); ta.select(); document.execCommand('copy');
              document.body.removeChild(ta); toast('Copied');
            } catch (_) { toast('Copy failed'); }
          });
        } else if (e.target.id === 'cfa-sync-save') {
          var v = document.getElementById('cfa-sync-id-input').value.trim().toLowerCase();
          if (!/^[a-f0-9]{32}$/.test(v)) return toast('Need 32-char hex');
          // Tell parent to update its ownerId; parent will broadcast back
          try { window.parent.parent.postMessage({ type: 'cfa_owner_change_request', ownerId: v }, '*'); } catch (_) {}
          // Also update locally
          state.ownerId = v;
          d.syncBadge.textContent = shortOwner(v);
          state.strokes = []; d.notesArea.value = ''; redrawAll();
          loadFromCloud().catch(function (e) { console.warn('reload', e); });
          d.syncModal.classList.remove('open');
          toast('Switched to ' + shortOwner(v));
        }
      });

      return d;
    }

    function toast(msg) {
      var s = dom && dom.status; if (!s) return;
      s.textContent = msg; s.classList.add('show');
      clearTimeout(s._t); s._t = setTimeout(function () { s.classList.remove('show'); }, 1400);
    }

    function shortOwner(id) { return id ? (id.slice(0, 4) + '…' + id.slice(-4)) : ''; }
    function escapeHtml(s) { return String(s||'').replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

    // ============================================================
    //  Canvas + drawing
    // ============================================================
    function sizeCanvas() {
      var w = Math.max(document.documentElement.scrollWidth, window.innerWidth);
      var h = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      dom.canvas.style.width  = w + 'px';
      dom.canvas.style.height = h + 'px';
      dom.canvas.width  = Math.round(w * dpr);
      dom.canvas.height = Math.round(h * dpr);
      dom.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawAll();
    }

    function onPointerDown(e) {
      if (!state.drawingOn) return;
      // Only Apple Pencil (or stylus) draws; finger / mouse pass through.
      if (e.pointerType !== 'pen') return;
      e.preventDefault();
      try { dom.canvas.setPointerCapture(e.pointerId); } catch (_) {}
      var pt = pageXY(e);
      state.live = {
        tool: state.tool,
        color: state.color,
        width: state.tool === 'highlighter' ? 14 : 2.4,
        opacity: state.tool === 'highlighter' ? 0.35 : 1,
        points: [[pt.x, pt.y, e.pressure || 0.5]]
      };
    }
    function onPointerMove(e) {
      if (!state.drawingOn || !state.live) return;
      if (e.pointerType !== 'pen') return;
      e.preventDefault();
      var pts = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (var i = 0; i < pts.length; i++) {
        var p = pageXY(pts[i]);
        state.live.points.push([p.x, p.y, pts[i].pressure || 0.5]);
      }
      drawIncremental(state.live);
    }
    function onPointerUp(e) {
      if (!state.live) return;
      if (e.pointerType !== 'pen') { state.live = null; return; }
      // Eraser: any saved stroke that has a point within radius is removed
      if (state.live.tool === 'eraser') {
        var toRemove = [];
        var R = 22;
        for (var i = 0; i < state.strokes.length; i++) {
          var s = state.strokes[i];
          if (strokeIntersectsPath(s, state.live.points, R)) toRemove.push(i);
        }
        if (toRemove.length) {
          state.strokes = state.strokes.filter(function (_, i) { return toRemove.indexOf(i) === -1; });
          redrawAll();
          scheduleSaveInk();
        } else {
          // Nothing removed; still need redraw to clear the eraser preview
          redrawAll();
        }
      } else {
        state.strokes.push(state.live);
        scheduleSaveInk();
      }
      state.live = null;
    }
    function pageXY(e) {
      // Translate from viewport to page coordinates (canvas is absolute at 0,0 in document)
      var rect = dom.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function drawIncremental(stroke) {
      // Just redraw the last 3 points for cheap incremental rendering
      var p = stroke.points;
      if (p.length < 2) return;
      var ctx = dom.ctx;
      applyStyle(ctx, stroke);
      ctx.beginPath();
      var i = Math.max(0, p.length - 3);
      ctx.moveTo(p[i][0], p[i][1]);
      for (var j = i + 1; j < p.length; j++) ctx.lineTo(p[j][0], p[j][1]);
      ctx.stroke();
    }
    function applyStyle(ctx, stroke) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (stroke.tool === 'eraser') {
        // Eraser doesn't draw — handled on pointerup
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(255,80,80,0.25)';
        ctx.lineWidth = 22;
        return;
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = stroke.opacity || 1;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width || 2.4;
    }
    function redrawAll() {
      var ctx = dom.ctx;
      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);
      ctx.restore();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      for (var i = 0; i < state.strokes.length; i++) drawStroke(state.strokes[i]);
      if (state.live && state.live.tool !== 'eraser') drawStroke(state.live);
    }
    function drawStroke(s) {
      if (!s.points || s.points.length < 2) return;
      var ctx = dom.ctx;
      ctx.save();
      applyStyle(ctx, s);
      if (s.tool === 'eraser') { ctx.restore(); return; }
      ctx.beginPath();
      ctx.moveTo(s.points[0][0], s.points[0][1]);
      for (var i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i][0], s.points[i][1]);
      }
      ctx.stroke();
      ctx.restore();
    }
    function strokeIntersectsPath(stroke, eraserPts, R) {
      // Simple distance check between any saved-stroke point and any eraser point
      for (var i = 0; i < stroke.points.length; i++) {
        var sp = stroke.points[i];
        for (var j = 0; j < eraserPts.length; j++) {
          var ep = eraserPts[j];
          var dx = sp[0] - ep[0], dy = sp[1] - ep[1];
          if (dx*dx + dy*dy < R*R) return true;
        }
      }
      return false;
    }
    function undoStroke() {
      if (!state.strokes.length) return;
      state.strokes.pop();
      redrawAll();
      scheduleSaveInk();
    }

    // ============================================================
    //  Cloud sync
    // ============================================================
    function supaUrl(path) { return cfg.url + '/rest/v1/' + path; }
    function supaHeaders(extra) {
      var h = {
        'apikey': cfg.anonKey,
        'Authorization': 'Bearer ' + cfg.anonKey,
        'Content-Type': 'application/json'
      };
      if (extra) for (var k in extra) h[k] = extra[k];
      return h;
    }

    function loadFromCloud() {
      if (!state.ownerId) return Promise.resolve();
      var qs = '?owner_id=eq.' + encodeURIComponent(state.ownerId) +
               '&lm_key=eq.'   + encodeURIComponent(cfg.lmKey) +
               '&select=kind,payload';
      return fetch(supaUrl(TABLE) + qs, { headers: supaHeaders() })
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (rows) {
          rows.forEach(function (row) {
            if (row.kind === 'ink' && row.payload && Array.isArray(row.payload.strokes)) {
              state.strokes = row.payload.strokes;
            } else if (row.kind === 'note' && row.payload && typeof row.payload.md === 'string') {
              state.noteMd = row.payload.md;
              dom.notesArea.value = row.payload.md;
              dom.notesStatus.textContent = 'Saved';
            }
          });
          redrawAll();
          state.ready = true;
        });
    }
    function scheduleSaveInk() {
      clearTimeout(state.saveTimer);
      state.saveTimer = setTimeout(saveInk, DEBOUNCE);
    }
    function scheduleSaveNote() {
      clearTimeout(state.noteTimer);
      state.noteTimer = setTimeout(saveNote, DEBOUNCE);
    }
    function saveInk()  { return upsert('ink',  { strokes: state.strokes }); }
    function saveNote() {
      return upsert('note', { md: state.noteMd }).then(function () {
        if (dom && dom.notesStatus) dom.notesStatus.textContent = 'Saved · ' + new Date().toLocaleTimeString();
      });
    }
    function upsert(kind, payload) {
      if (!state.ownerId) return Promise.resolve();
      var body = JSON.stringify([{
        owner_id: state.ownerId,
        lm_key: cfg.lmKey,
        kind: kind,
        payload: payload,
        updated_at: new Date().toISOString()
      }]);
      return fetch(supaUrl(TABLE), {
        method: 'POST',
        headers: supaHeaders({
          'Prefer': 'resolution=merge-duplicates,return=minimal',
          'Content-Profile': 'public'
        }),
        body: body
      }).then(function (r) {
        if (!r.ok) {
          return r.text().then(function (t) {
            console.warn('[CFA] upsert failed', r.status, t);
            toast('Save failed (' + r.status + ')');
          });
        }
      }).catch(function (e) {
        console.warn('[CFA] upsert error', e);
        toast('Offline — will retry');
      });
    }

    // Save on unload (navigating away)
    window.addEventListener('beforeunload', function () {
      try {
        if (state.ownerId && (state.strokes.length || state.noteMd)) {
          var payloadInk  = JSON.stringify([{ owner_id: state.ownerId, lm_key: cfg.lmKey, kind: 'ink',  payload: { strokes: state.strokes }, updated_at: new Date().toISOString() }]);
          var payloadNote = JSON.stringify([{ owner_id: state.ownerId, lm_key: cfg.lmKey, kind: 'note', payload: { md: state.noteMd }, updated_at: new Date().toISOString() }]);
          if (navigator.sendBeacon) {
            // sendBeacon doesn't allow custom headers — use fetch with keepalive
            fetch(supaUrl(TABLE), { method: 'POST', headers: supaHeaders({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }), body: payloadInk,  keepalive: true });
            fetch(supaUrl(TABLE), { method: 'POST', headers: supaHeaders({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }), body: payloadNote, keepalive: true });
          }
        }
      } catch (_) {}
    });
  } // bootLm
})();
