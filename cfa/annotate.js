/* CFA Atelier — annotation overlay (Notability-inspired)
 *
 * Loads in two modes:
 *   data-cfa-mode="host"   → master guide; manages owner_id + relays it to the hub.
 *   (no attribute)         → LM iframe; renders the toolbar and canvas.
 *
 * Designed for desktop (mouse), iPad (Apple Pencil + finger), and phone.
 * Drawing inputs:
 *   - On a touch device with a pen detected: only `pointerType === 'pen'`
 *     draws; touch passes through so the page scrolls normally.
 *   - On other devices: any active pointer (mouse, touch, pen) draws while
 *     a tool is selected.
 * Storage: Supabase upsert on (owner_id, lm_key, kind). Debounced 1.2s.
 */
(function () {
  'use strict';

  // ============================================================
  //  Config
  // ============================================================
  var SUPA_URL  = 'https://igfchvbzmvfveecivswb.supabase.co';
  var SUPA_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZmNodmJ6bXZmdmVlY2l2c3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Mjk2MjYsImV4cCI6MjA4ODAwNTYyNn0.-oU8CN309uuINCsgnrwPqNcfYNZ0s2-rOZcu3j-QRlw';
  var TABLE     = 'cfa_annotations';
  var DEBOUNCE  = 1200;
  var OWNER_KEY = 'cfa_owner_id_v1';

  // Notability-style palette
  var COLORS = [
    { name: 'Black',     value: '#1f2227' },
    { name: 'Red',       value: '#e23b3b' },
    { name: 'Orange',    value: '#f29423' },
    { name: 'Yellow',    value: '#f5c518' },
    { name: 'Green',     value: '#2da44e' },
    { name: 'Blue',      value: '#1f6feb' },
    { name: 'Indigo',    value: '#6e40c9' },
    { name: 'Pink',      value: '#db61a2' }
  ];

  var TOOLS = {
    pen:         { stroke: 1.6,  alpha: 1,    composite: 'source-over' },
    marker:      { stroke: 3.2,  alpha: 1,    composite: 'source-over' },
    highlighter: { stroke: 14,   alpha: 0.32, composite: 'source-over' },
    eraser:      { stroke: 22,   alpha: 1,    composite: 'destination-out' }
  };

  var THICKNESS_PRESETS = [
    { id: 'fine',   pen: 1.0,  marker: 2.0,  highlighter: 10 },
    { id: 'medium', pen: 1.6,  marker: 3.2,  highlighter: 14 },
    { id: 'thick',  pen: 2.6,  marker: 5.0,  highlighter: 22 }
  ];

  // ============================================================
  //  Mode dispatch (DOM-ready safe)
  // ============================================================
  var script = document.currentScript;
  var mode = (script && script.getAttribute('data-cfa-mode')) ||
             (window.CFA_ANNOTATE ? 'lm' : 'host');

  function whenReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else fn();
  }
  if (mode === 'host') return whenReady(bootHost);
  if (mode === 'lm')   return whenReady(bootLm);

  // ============================================================
  //  HOST (master guide)
  // ============================================================
  function bootHost() {
    var ownerId = ensureOwnerId();
    window.__cfaOwnerId = ownerId;

    var attach = function () {
      var hub = document.getElementById('hub-iframe');
      if (!hub) return setTimeout(attach, 200);
      hub.addEventListener('load', function () {
        try { hub.contentWindow.postMessage({ type: 'cfa_owner', ownerId: ownerId }, '*'); }
        catch (_) {}
      });
    };
    attach();

    window.__cfaSetOwner = function (newId) {
      if (!/^[a-f0-9]{32}$/.test(newId)) return false;
      try { localStorage.setItem(OWNER_KEY, newId); } catch (_) {}
      window.__cfaOwnerId = newId;
      var hub = document.getElementById('hub-iframe');
      if (hub) try { hub.contentWindow.postMessage({ type: 'cfa_owner', ownerId: newId }, '*'); }
      catch (_) {}
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
      for (var i = 0; i < bytes.length; i++)
        hex += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
      try { localStorage.setItem(OWNER_KEY, hex); } catch (_) {}
      return hex;
    }
  }

  // ============================================================
  //  LM IFRAME — full annotation toolkit
  // ============================================================
  function bootLm() {
    var cfg = window.CFA_ANNOTATE || {};
    if (!cfg.lmKey) return;
    cfg.url     = cfg.url     || SUPA_URL;
    cfg.anonKey = cfg.anonKey || SUPA_KEY;

    // Detect Apple Pencil-class devices (true iPad with stylus)
    // Heuristic: touch device AND pointer events fire with pen type.
    var hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
    var penOnlyMode = false; // becomes true once we see a pen pointer event

    var state = {
      tool: 'pen',            // start with pen so user can draw immediately
      color: COLORS[0].value,
      thicknessIdx: 1,        // 0=fine, 1=medium, 2=thick
      strokes: [],            // saved committed strokes
      redo: [],               // undo stack
      live: null,             // current in-progress stroke
      ownerId: cfg.ownerId || '',
      noteMd: '',
      saveTimer: null,
      noteTimer: null
    };

    injectStyles();
    var dom = buildUi();
    setupOwner();
    if (state.ownerId) loadFromCloud();
    // Reflect default-pen state in the UI
    dom.btnPen.classList.add('on');
    dom.canvas.classList.add('drawing');

    // ----------------------------------------------------------
    //  Owner sync
    // ----------------------------------------------------------
    function setupOwner() {
      window.addEventListener('message', function (e) {
        if (!e.data) return;
        if (e.data.type === 'cfa_owner' && /^[a-f0-9]{32}$/.test(e.data.ownerId)) {
          if (state.ownerId !== e.data.ownerId) {
            state.ownerId = e.data.ownerId;
            updateOwnerBadge();
            loadFromCloud();
          }
        }
      });
    }

    function updateOwnerBadge() {
      if (dom.syncBadge)
        dom.syncBadge.textContent = state.ownerId
          ? state.ownerId.slice(0, 4) + '…' + state.ownerId.slice(-4)
          : '—';
    }

    // ============================================================
    //  Styles
    // ============================================================
    function injectStyles() {
      var css = `
      .cfa-toolbar {
        position: fixed; top: 14px; right: 14px; z-index: 2147483646;
        display: flex; flex-direction: column; gap: 6px; padding: 8px;
        background: linear-gradient(180deg,#fafbfc 0%,#eef0f3 100%);
        border-radius: 14px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06),
                    inset 0 1px 0 rgba(255,255,255,0.7);
        border: 1px solid rgba(0,0,0,0.06);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        user-select: none; -webkit-user-select: none;
        touch-action: manipulation;
        transition: opacity .2s;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-toolbar {
          background: linear-gradient(180deg,#2c2e33 0%,#1f2125 100%);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
        }
      }
      .cfa-toolbar.collapsed > *:not(.cfa-tb-toggle) { display: none; }
      .cfa-tb-row { display: flex; gap: 4px; }
      .cfa-tb-divider {
        height: 1px; background: rgba(0,0,0,0.08); margin: 4px 2px;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-tb-divider { background: rgba(255,255,255,0.08); }
      }
      .cfa-tb-btn {
        width: 38px; height: 38px; padding: 0;
        border: none; border-radius: 9px;
        background: transparent;
        color: #2a2d33;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background .12s, transform .08s, box-shadow .12s;
        position: relative;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-tb-btn { color: #d8dadf; }
      }
      .cfa-tb-btn:hover { background: rgba(0,0,0,0.06); }
      .cfa-tb-btn:active { transform: scale(0.94); }
      @media (prefers-color-scheme: dark) {
        .cfa-tb-btn:hover { background: rgba(255,255,255,0.08); }
      }
      .cfa-tb-btn.on {
        background: linear-gradient(180deg,#e9eefb,#d6dffb);
        color: #1d4ed8;
        box-shadow: inset 0 0 0 1px #b8c5f5, 0 1px 2px rgba(29,78,216,0.18);
      }
      @media (prefers-color-scheme: dark) {
        .cfa-tb-btn.on {
          background: linear-gradient(180deg,#2a3550,#1f2942);
          color: #93b8ff;
          box-shadow: inset 0 0 0 1px #3d558f;
        }
      }
      .cfa-tb-btn svg { width: 22px; height: 22px; }
      .cfa-tb-btn .cfa-color-dot {
        position: absolute; bottom: 4px; right: 4px;
        width: 9px; height: 9px; border-radius: 50%;
        border: 1.5px solid #fff;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.15);
      }
      .cfa-tb-toggle {
        cursor: pointer;
        opacity: 0.6;
      }

      .cfa-popover {
        position: fixed; z-index: 2147483647;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08);
        padding: 12px;
        font-family: inherit;
        display: none;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-popover { background: #2a2d33; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      }
      .cfa-popover.open { display: block; }
      .cfa-popover h4 {
        margin: 0 0 8px; font-size: 11px; text-transform: uppercase;
        letter-spacing: 0.06em; color: #6c727a; font-weight: 600;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-popover h4 { color: #9099a3; }
      }
      .cfa-color-grid {
        display: grid; grid-template-columns: repeat(4, 32px); gap: 8px;
      }
      .cfa-color-swatch {
        width: 32px; height: 32px; border-radius: 50%;
        cursor: pointer; border: 2px solid transparent;
        transition: transform .12s, border-color .12s;
        position: relative;
      }
      .cfa-color-swatch:hover { transform: scale(1.08); }
      .cfa-color-swatch.on {
        border-color: #1d4ed8;
        box-shadow: 0 0 0 2px rgba(29,78,216,0.18);
      }
      .cfa-thickness-row {
        display: flex; align-items: center; gap: 12px;
        margin-top: 14px;
      }
      .cfa-thickness-btn {
        flex: 1; cursor: pointer;
        background: transparent; border: 1px solid rgba(0,0,0,0.08);
        border-radius: 8px; padding: 8px 0;
        display: flex; align-items: center; justify-content: center;
        transition: all .12s;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-thickness-btn { border-color: rgba(255,255,255,0.12); }
      }
      .cfa-thickness-btn:hover { background: rgba(0,0,0,0.04); }
      @media (prefers-color-scheme: dark) {
        .cfa-thickness-btn:hover { background: rgba(255,255,255,0.06); }
      }
      .cfa-thickness-btn.on {
        background: rgba(29,78,216,0.10); border-color: #1d4ed8;
      }
      .cfa-thickness-bar {
        background: currentColor; border-radius: 999px;
      }

      .cfa-canvas {
        position: absolute; top: 0; left: 0;
        pointer-events: none; z-index: 2147483640;
        -webkit-user-select: none; user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      .cfa-canvas.drawing { pointer-events: auto; touch-action: none; cursor: crosshair; }

      .cfa-notes-drawer {
        position: fixed; top: 0; right: -640px; width: min(620px, 96vw); height: 100vh;
        background: #ffffff; color: #14171c; z-index: 2147483645;
        box-shadow: -8px 0 36px rgba(0,0,0,0.18);
        display: flex; flex-direction: column;
        transition: right .32s cubic-bezier(.3,.05,.2,1);
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-notes-drawer { background: #1d1f24; color: #e8eaed; }
      }
      .cfa-notes-drawer.open { right: 0; }
      .cfa-notes-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 18px;
        border-bottom: 1px solid rgba(0,0,0,0.06);
        font-weight: 600; font-size: 14px;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-notes-header { border-bottom-color: rgba(255,255,255,0.08); }
      }
      .cfa-notes-area {
        flex: 1; padding: 16px 20px; border: none; outline: none; resize: none;
        font: 15px/1.6 -apple-system, BlinkMacSystemFont, sans-serif;
        background: transparent; color: inherit;
      }
      .cfa-notes-foot {
        padding: 8px 18px; font-size: 12px; opacity: 0.55;
        border-top: 1px solid rgba(0,0,0,0.06);
        display: flex; justify-content: space-between;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-notes-foot { border-top-color: rgba(255,255,255,0.08); }
      }
      .cfa-icon-btn {
        background: none; border: none; cursor: pointer;
        font-size: 20px; padding: 4px 10px; border-radius: 6px;
        color: inherit;
      }
      .cfa-icon-btn:hover { background: rgba(0,0,0,0.06); }
      @media (prefers-color-scheme: dark) {
        .cfa-icon-btn:hover { background: rgba(255,255,255,0.06); }
      }

      .cfa-modal {
        position: fixed; inset: 0; background: rgba(0,0,0,0.5);
        z-index: 2147483647; display: none; align-items: center; justify-content: center;
        padding: 20px;
      }
      .cfa-modal.open { display: flex; }
      .cfa-modal-card {
        background: #ffffff; color: #14171c;
        max-width: 460px; width: 100%;
        padding: 24px; border-radius: 16px;
        box-shadow: 0 24px 60px rgba(0,0,0,0.4);
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-modal-card { background: #1d1f24; color: #e8eaed; }
      }
      .cfa-modal-card h3 { margin: 0 0 4px; font-size: 17px; }
      .cfa-modal-card p { margin: 4px 0 14px; font-size: 13px; opacity: 0.7; line-height: 1.5; }
      .cfa-modal-card label { display: block; font-size: 11px; font-weight: 600; margin-top: 14px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em; }
      .cfa-id-display {
        font: 13px/1.4 ui-monospace, 'SF Mono', Menlo, monospace;
        word-break: break-all; padding: 10px 12px; border-radius: 8px;
        background: rgba(0,0,0,0.04); margin-top: 6px;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-id-display { background: rgba(255,255,255,0.06); }
      }
      .cfa-id-input {
        width: 100%; padding: 10px 12px; border-radius: 8px;
        border: 1px solid rgba(0,0,0,0.15); margin-top: 6px;
        font: 13px ui-monospace, 'SF Mono', Menlo, monospace;
        background: transparent; color: inherit; box-sizing: border-box;
      }
      @media (prefers-color-scheme: dark) {
        .cfa-id-input { border-color: rgba(255,255,255,0.16); }
      }
      .cfa-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 18px; }
      .cfa-btn {
        padding: 9px 16px; border-radius: 8px; border: none; cursor: pointer;
        font-size: 13px; font-weight: 600;
      }
      .cfa-btn-primary { background: #1d4ed8; color: #fff; }
      .cfa-btn-primary:hover { background: #1f56e8; }
      .cfa-btn-ghost { background: transparent; color: inherit; }

      .cfa-toast {
        position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
        background: rgba(15,15,20,0.9); color: #fff;
        padding: 8px 14px; border-radius: 999px; font-size: 12px;
        font-family: -apple-system, sans-serif;
        opacity: 0; transition: opacity .2s; pointer-events: none;
        z-index: 2147483647;
      }
      .cfa-toast.show { opacity: 1; }

      @media (max-width: 600px) {
        .cfa-toolbar { top: 8px; right: 8px; padding: 5px; gap: 4px; }
        .cfa-tb-btn { width: 34px; height: 34px; }
        .cfa-tb-btn svg { width: 18px; height: 18px; }
      }
      `;
      var s = document.createElement('style');
      s.id = 'cfa-annotate-styles';
      s.textContent = css;
      (document.head || document.documentElement).appendChild(s);
    }

    // ============================================================
    //  Icons (inline SVG, currentColor)
    // ============================================================
    function icon(name) {
      var paths = {
        // A real pen with a tilted nib
        pen: '<path d="M14.06 4.94 19.06 9.94 9 20H4v-5L14.06 4.94Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M13 6 18 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
        // Marker — chunky body with a tip
        marker: '<path d="M5.6 16.4 14 8 16 10l-8.4 8.4-3.4.6.4-3.6Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><rect x="13.2" y="6.2" width="5.6" height="3.6" rx="1" transform="rotate(45 16 8)" fill="currentColor"/>',
        // Highlighter — angled chisel
        highlighter: '<path d="M6 18 14 10l3 3-8 8H6v-3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><rect x="13" y="6" width="6" height="5" rx="1.2" transform="rotate(45 16 8.5)" fill="currentColor" opacity="0.45"/>',
        // Eraser
        eraser: '<path d="M16 5 5 16l3.5 3.5 5-5L20 8.5 16 5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M11 11l4.5 4.5" stroke="currentColor" stroke-width="1.5"/>',
        // Color circle (filled)
        color: '<circle cx="12" cy="12" r="7" fill="currentColor"/>',
        undo: '<path d="M9 7 4 12l5 5M4 12h10a5 5 0 0 1 0 10h-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
        redo: '<path d="M15 7 20 12l-5 5M20 12H10a5 5 0 0 0 0 10h2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
        clear: '<path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
        notes: '<rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
        sync: '<path d="M4 12a8 8 0 0 1 13.5-5.7L20 4v6h-6l2.4-2.4A6 6 0 0 0 6 12H4Zm16 0a8 8 0 0 1-13.5 5.7L4 20v-6h6l-2.4 2.4A6 6 0 0 0 18 12h2Z" fill="currentColor"/>',
        chevron: '<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      };
      return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        (paths[name] || '') + '</svg>';
    }

    // ============================================================
    //  Build UI
    // ============================================================
    function buildUi() {
      var d = {};

      // Toolbar
      d.toolbar = el('div', 'cfa-toolbar');

      d.btnPen   = tbBtn(icon('pen'),         'Pen');
      d.btnMrk   = tbBtn(icon('marker'),      'Marker');
      d.btnHi    = tbBtn(icon('highlighter'), 'Highlighter');
      d.btnEr    = tbBtn(icon('eraser'),      'Eraser');

      // Color/thickness combo
      d.btnColor = tbBtn(icon('color'),       'Color & thickness');
      d.btnColor.style.color = state.color;
      var colorDot = el('span', 'cfa-color-dot');
      colorDot.style.background = state.color;
      d.btnColor.appendChild(colorDot);
      d.colorDot = colorDot;

      d.divider1 = el('div', 'cfa-tb-divider');

      d.btnUndo  = tbBtn(icon('undo'),  'Undo');
      d.btnRedo  = tbBtn(icon('redo'),  'Redo');
      d.btnClear = tbBtn(icon('clear'), 'Clear all ink');

      d.divider2 = el('div', 'cfa-tb-divider');

      d.btnNotes = tbBtn(icon('notes'), 'Notes');
      d.btnSync  = tbBtn(icon('sync'),  'Sync ID');

      [d.btnPen, d.btnMrk, d.btnHi, d.btnEr, d.btnColor, d.divider1,
       d.btnUndo, d.btnRedo, d.btnClear, d.divider2,
       d.btnNotes, d.btnSync].forEach(function (n) { d.toolbar.appendChild(n); });
      document.body.appendChild(d.toolbar);

      // Color popover (positioned to the left of color button)
      d.colorPop = el('div', 'cfa-popover');
      var colorH = el('h4'); colorH.textContent = 'Color';
      d.colorPop.appendChild(colorH);
      var grid = el('div', 'cfa-color-grid');
      d.colorSwatches = COLORS.map(function (c) {
        var sw = el('div', 'cfa-color-swatch' + (c.value === state.color ? ' on' : ''));
        sw.style.background = c.value;
        sw.title = c.name;
        sw.addEventListener('click', function () {
          state.color = c.value;
          d.colorDot.style.background = c.value;
          d.btnColor.style.color = c.value;
          d.colorSwatches.forEach(function (s) { s.classList.remove('on'); });
          sw.classList.add('on');
        });
        grid.appendChild(sw);
        return sw;
      });
      d.colorPop.appendChild(grid);

      var thickH = el('h4'); thickH.textContent = 'Thickness';
      thickH.style.marginTop = '14px';
      d.colorPop.appendChild(thickH);
      var thickRow = el('div', 'cfa-thickness-row');
      d.thicknessBtns = THICKNESS_PRESETS.map(function (preset, idx) {
        var b = el('button', 'cfa-thickness-btn' + (idx === state.thicknessIdx ? ' on' : ''));
        var bar = el('div', 'cfa-thickness-bar');
        bar.style.height = (2 + idx * 2) + 'px';
        bar.style.width = (60 - idx * 10) + '%';
        b.appendChild(bar);
        b.addEventListener('click', function () {
          state.thicknessIdx = idx;
          d.thicknessBtns.forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
        });
        thickRow.appendChild(b);
        return b;
      });
      d.colorPop.appendChild(thickRow);
      document.body.appendChild(d.colorPop);

      // Canvas
      d.canvas = el('canvas', 'cfa-canvas');
      d.ctx = d.canvas.getContext('2d');
      document.body.appendChild(d.canvas);
      sizeCanvas();
      window.addEventListener('resize', sizeCanvas);
      try {
        new ResizeObserver(sizeCanvas).observe(document.documentElement);
      } catch (_) {}
      // Recalc periodically — content may load images / KaTeX after script runs
      setTimeout(sizeCanvas, 800);
      setTimeout(sizeCanvas, 2400);

      // Notes drawer
      d.notes = el('div', 'cfa-notes-drawer');
      var nh = el('div', 'cfa-notes-header');
      nh.innerHTML = '<span>Notes — ' + escapeHtml(cfg.lmTitle || cfg.lmKey) + '</span>';
      var nClose = el('button', 'cfa-icon-btn'); nClose.textContent = '×'; nClose.title = 'Close';
      nh.appendChild(nClose);
      d.notesArea = el('textarea', 'cfa-notes-area');
      d.notesArea.placeholder = 'Type notes for this learning module…';
      var nf = el('div', 'cfa-notes-foot');
      d.notesStatus = el('span'); d.notesStatus.textContent = 'Saved';
      var nfHelp = el('span'); nfHelp.textContent = 'Autosaves & syncs across devices';
      nf.appendChild(d.notesStatus); nf.appendChild(nfHelp);
      d.notes.appendChild(nh); d.notes.appendChild(d.notesArea); d.notes.appendChild(nf);
      document.body.appendChild(d.notes);

      // Sync modal
      d.modal = el('div', 'cfa-modal');
      var card = el('div', 'cfa-modal-card');
      card.innerHTML =
        '<h3>Sync across devices</h3>' +
        '<p>Your annotations are tied to a 32-character ID stored on this device. ' +
        'Copy it into your iPad / phone to keep ink and notes in sync.</p>' +
        '<label>This device</label>' +
        '<div class="cfa-id-display" id="cfa-id-show"></div>' +
        '<label>Use a different ID</label>' +
        '<input class="cfa-id-input" id="cfa-id-input" placeholder="paste 32-character ID" maxlength="32" />' +
        '<div class="cfa-modal-actions">' +
        '  <button class="cfa-btn cfa-btn-ghost" id="cfa-modal-cancel">Cancel</button>' +
        '  <button class="cfa-btn cfa-btn-primary" id="cfa-modal-copy">Copy</button>' +
        '  <button class="cfa-btn cfa-btn-primary" id="cfa-modal-save">Use this ID</button>' +
        '</div>';
      d.modal.appendChild(card);
      document.body.appendChild(d.modal);

      // Toast
      d.toast = el('div', 'cfa-toast');
      document.body.appendChild(d.toast);

      // Sync badge appended to sync button
      d.syncBadge = el('span');
      d.syncBadge.style.cssText = 'position:absolute;bottom:1px;right:3px;font-size:8px;font-family:ui-monospace,Menlo,monospace;opacity:0.55;letter-spacing:-0.5px;';
      d.btnSync.appendChild(d.syncBadge);
      updateOwnerBadge();

      // Wire behaviour
      d.btnPen.addEventListener('click', function () { selectTool('pen', d.btnPen); });
      d.btnMrk.addEventListener('click', function () { selectTool('marker', d.btnMrk); });
      d.btnHi.addEventListener('click',  function () { selectTool('highlighter', d.btnHi); });
      d.btnEr.addEventListener('click',  function () { selectTool('eraser', d.btnEr); });

      d.btnColor.addEventListener('click', function (e) {
        e.stopPropagation();
        var rect = d.btnColor.getBoundingClientRect();
        d.colorPop.style.top  = (rect.bottom + 8) + 'px';
        d.colorPop.style.right = (window.innerWidth - rect.right) + 'px';
        d.colorPop.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (!d.colorPop.contains(e.target) && e.target !== d.btnColor) {
          d.colorPop.classList.remove('open');
        }
      });

      d.btnUndo.addEventListener('click', undoStroke);
      d.btnRedo.addEventListener('click', redoStroke);
      d.btnClear.addEventListener('click', function () {
        if (!state.strokes.length) return toast('Nothing to clear');
        if (!confirm('Erase all ink on this learning module?')) return;
        state.redo = state.strokes.slice();
        state.strokes = [];
        redrawAll();
        scheduleSaveInk();
      });

      d.btnNotes.addEventListener('click', function () {
        d.notes.classList.toggle('open');
        if (d.notes.classList.contains('open')) setTimeout(function () { d.notesArea.focus(); }, 320);
      });
      nClose.addEventListener('click', function () { d.notes.classList.remove('open'); });
      d.notesArea.addEventListener('input', function () {
        state.noteMd = d.notesArea.value;
        d.notesStatus.textContent = 'Saving…';
        scheduleSaveNote();
      });

      d.btnSync.addEventListener('click', function () {
        document.getElementById('cfa-id-show').textContent = state.ownerId || '—';
        document.getElementById('cfa-id-input').value = '';
        d.modal.classList.add('open');
      });
      d.modal.addEventListener('click', function (e) {
        if (e.target === d.modal || e.target.id === 'cfa-modal-cancel') {
          d.modal.classList.remove('open');
        } else if (e.target.id === 'cfa-modal-copy') {
          copyToClipboard(state.ownerId, function (ok) { toast(ok ? 'ID copied' : 'Copy failed'); });
        } else if (e.target.id === 'cfa-modal-save') {
          var v = (document.getElementById('cfa-id-input').value || '').trim().toLowerCase();
          if (!/^[a-f0-9]{32}$/.test(v)) return toast('Need 32-char hex');
          try { window.parent.parent.postMessage({ type: 'cfa_owner_change_request', ownerId: v }, '*'); } catch (_) {}
          state.ownerId = v;
          updateOwnerBadge();
          state.strokes = []; state.redo = []; d.notesArea.value = '';
          redrawAll();
          loadFromCloud();
          d.modal.classList.remove('open');
          toast('Switched');
        }
      });

      // Pointer handling on canvas — Pointer Events first, Touch as fallback for old iOS
      d.canvas.addEventListener('pointerdown', onPointerDown);
      d.canvas.addEventListener('pointermove', onPointerMove);
      d.canvas.addEventListener('pointerup',   onPointerUp);
      d.canvas.addEventListener('pointercancel', onPointerUp);
      d.canvas.addEventListener('pointerleave',  onPointerUp);

      // Touch fallback (iOS Safari sometimes won't fire pointer events
      // for Apple Pencil if the page hasn't received user-agent stylesheets)
      d.canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      d.canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
      d.canvas.addEventListener('touchend',   onTouchEnd,   { passive: false });
      d.canvas.addEventListener('touchcancel',onTouchEnd,   { passive: false });

      return d;

      function tbBtn(svgHtml, title) {
        var b = document.createElement('button');
        b.className = 'cfa-tb-btn'; b.title = title;
        b.innerHTML = svgHtml; b.type = 'button';
        return b;
      }
      function el(tag, cls) {
        var n = document.createElement(tag);
        if (cls) n.className = cls; return n;
      }
    }

    function selectTool(name, btn) {
      var same = state.tool === name;
      state.tool = same ? null : name;
      [dom.btnPen, dom.btnMrk, dom.btnHi, dom.btnEr]
        .forEach(function (b) { b.classList.remove('on'); });
      if (state.tool) btn.classList.add('on');
      dom.canvas.classList.toggle('drawing', !!state.tool);
      if (state.tool) {
        toast(prettyTool(state.tool) + (penOnlyMode ? ' • Pencil only' : ''));
      } else {
        toast('Drawing off');
      }
    }
    function prettyTool(t) {
      return ({ pen: 'Pen', marker: 'Marker', highlighter: 'Highlighter', eraser: 'Eraser' })[t] || t;
    }

    // ============================================================
    //  Canvas + drawing
    // ============================================================
    function sizeCanvas() {
      if (!dom || !dom.canvas) return;
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

    function pageXY(e) {
      var rect = dom.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function shouldAccept(e) {
      // If we've ever seen a pen pointer event, lock to pen-only so finger can scroll.
      if (e.pointerType === 'pen') {
        penOnlyMode = true;
        return true;
      }
      if (penOnlyMode) return false;
      // Otherwise (desktop or pure-touch device with no pencil) accept any input.
      return true;
    }

    function onPointerDown(e) {
      if (!state.tool) return;
      if (!shouldAccept(e)) return;
      e.preventDefault();
      try { dom.canvas.setPointerCapture(e.pointerId); } catch (_) {}
      var p = pageXY(e);
      var preset = THICKNESS_PRESETS[state.thicknessIdx];
      var t = TOOLS[state.tool];
      var width = preset[state.tool] !== undefined ? preset[state.tool] : t.stroke;
      state.live = {
        tool: state.tool,
        color: state.color,
        width: width,
        alpha: t.alpha,
        composite: t.composite,
        points: [[p.x, p.y, e.pressure || 0.5]]
      };
    }

    function onPointerMove(e) {
      if (!state.live) return;
      if (!shouldAccept(e)) return;
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
      if (state.live.tool === 'eraser') {
        // Hit-test saved strokes against the eraser path
        var R = state.live.width / 2 + 6;
        var keep = [];
        for (var i = 0; i < state.strokes.length; i++) {
          if (strokeHitsPath(state.strokes[i], state.live.points, R))
            state.redo.push(state.strokes[i]);
          else
            keep.push(state.strokes[i]);
        }
        if (keep.length !== state.strokes.length) {
          state.strokes = keep;
          redrawAll();
          scheduleSaveInk();
        } else {
          redrawAll();
        }
      } else {
        state.strokes.push(state.live);
        state.redo = []; // any new stroke clears redo
        scheduleSaveInk();
      }
      state.live = null;
    }

    // Touch fallback: build a synthetic pointer-like event from a Touch
    function syntheticFromTouch(touch) {
      // Apple Pencil reports touchType === 'stylus' on iOS Safari. Treat as pen.
      var pt = touch.touchType === 'stylus' ? 'pen' : 'touch';
      return {
        clientX: touch.clientX,
        clientY: touch.clientY,
        pointerType: pt,
        pointerId: touch.identifier,
        pressure: touch.force || 0.5,
        preventDefault: function () {}
      };
    }
    function onTouchStart(e) {
      // Touch events fire alongside pointer events on modern iOS — but
      // ONLY pointer events have pointerType. If pointer fired first,
      // state.live is already set; ignore the touch dupe. If pointer
      // didn't fire (legacy iOS, certain WKWebView modes), use touch.
      if (state.live) return;
      if (!state.tool) return;
      e.preventDefault();
      var t = e.changedTouches[0]; if (!t) return;
      onPointerDown(syntheticFromTouch(t));
    }
    function onTouchMove(e) {
      if (!state.live) return;
      e.preventDefault();
      var t = e.changedTouches[0]; if (!t) return;
      onPointerMove(syntheticFromTouch(t));
    }
    function onTouchEnd(e) {
      if (!state.live) return;
      e.preventDefault();
      var t = e.changedTouches[0]; if (!t) return;
      onPointerUp(syntheticFromTouch(t));
    }

    function applyStyle(ctx, s) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalAlpha = s.alpha;
      ctx.globalCompositeOperation = s.composite;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
    }

    function drawStroke(s) {
      if (!s || !s.points || s.points.length < 1) return;
      var ctx = dom.ctx;
      ctx.save();
      applyStyle(ctx, s);
      ctx.beginPath();
      var pts = s.points;
      if (pts.length === 1) {
        // Dot
        ctx.arc(pts[0][0], pts[0][1], s.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
      } else {
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length - 1; i++) {
          var mx = (pts[i][0] + pts[i + 1][0]) / 2;
          var my = (pts[i][1] + pts[i + 1][1]) / 2;
          ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
        }
        ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawIncremental(s) {
      // Cheap render for the in-progress stroke: draw last 3 segments
      var pts = s.points; if (pts.length < 2) return;
      var ctx = dom.ctx;
      ctx.save();
      applyStyle(ctx, s);
      ctx.beginPath();
      var i = Math.max(0, pts.length - 3);
      ctx.moveTo(pts[i][0], pts[i][1]);
      for (var j = i + 1; j < pts.length; j++) ctx.lineTo(pts[j][0], pts[j][1]);
      ctx.stroke();
      ctx.restore();
    }

    function redrawAll() {
      if (!dom || !dom.ctx) return;
      var ctx = dom.ctx;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);
      ctx.restore();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (var i = 0; i < state.strokes.length; i++) drawStroke(state.strokes[i]);
      if (state.live && state.live.tool !== 'eraser') drawStroke(state.live);
    }

    function strokeHitsPath(stroke, eraserPts, R) {
      var R2 = R * R;
      for (var i = 0; i < stroke.points.length; i++) {
        var sp = stroke.points[i];
        for (var j = 0; j < eraserPts.length; j++) {
          var ep = eraserPts[j];
          var dx = sp[0] - ep[0], dy = sp[1] - ep[1];
          if (dx * dx + dy * dy < R2) return true;
        }
      }
      return false;
    }

    function undoStroke() {
      if (!state.strokes.length) return toast('Nothing to undo');
      var s = state.strokes.pop();
      state.redo.push(s);
      redrawAll();
      scheduleSaveInk();
    }
    function redoStroke() {
      if (!state.redo.length) return toast('Nothing to redo');
      var s = state.redo.pop();
      state.strokes.push(s);
      redrawAll();
      scheduleSaveInk();
    }

    // ============================================================
    //  Cloud sync
    // ============================================================
    function supaUrl(p) { return cfg.url + '/rest/v1/' + p; }
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
              state.redo = [];
            } else if (row.kind === 'note' && row.payload && typeof row.payload.md === 'string') {
              state.noteMd = row.payload.md;
              dom.notesArea.value = row.payload.md;
              dom.notesStatus.textContent = 'Saved';
            }
          });
          redrawAll();
        })
        .catch(function (e) { console.warn('[CFA] load', e); });
    }
    function scheduleSaveInk()  { clearTimeout(state.saveTimer); state.saveTimer = setTimeout(saveInk,  DEBOUNCE); }
    function scheduleSaveNote() { clearTimeout(state.noteTimer); state.noteTimer = setTimeout(saveNote, DEBOUNCE); }
    function saveInk()  { return upsert('ink',  { strokes: state.strokes }); }
    function saveNote() {
      return upsert('note', { md: state.noteMd }).then(function () {
        if (dom.notesStatus) dom.notesStatus.textContent = 'Saved · ' + new Date().toLocaleTimeString();
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
        headers: supaHeaders({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
        body: body
      }).then(function (r) {
        if (!r.ok) return r.text().then(function (t) {
          console.warn('[CFA] save', r.status, t); toast('Save failed');
        });
      }).catch(function (e) { console.warn('[CFA] save err', e); toast('Offline'); });
    }

    // Save on unload
    window.addEventListener('beforeunload', function () {
      try {
        if (state.ownerId && state.strokes.length) {
          fetch(supaUrl(TABLE), {
            method: 'POST',
            headers: supaHeaders({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
            body: JSON.stringify([{ owner_id: state.ownerId, lm_key: cfg.lmKey, kind: 'ink', payload: { strokes: state.strokes }, updated_at: new Date().toISOString() }]),
            keepalive: true
          });
        }
        if (state.ownerId && state.noteMd) {
          fetch(supaUrl(TABLE), {
            method: 'POST',
            headers: supaHeaders({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
            body: JSON.stringify([{ owner_id: state.ownerId, lm_key: cfg.lmKey, kind: 'note', payload: { md: state.noteMd }, updated_at: new Date().toISOString() }]),
            keepalive: true
          });
        }
      } catch (_) {}
    });

    // ============================================================
    //  Helpers
    // ============================================================
    function toast(msg) {
      if (!dom || !dom.toast) return;
      dom.toast.textContent = msg;
      dom.toast.classList.add('show');
      clearTimeout(dom.toast._t);
      dom.toast._t = setTimeout(function () { dom.toast.classList.remove('show'); }, 1400);
    }
    function copyToClipboard(text, cb) {
      if (!text) return cb && cb(false);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { cb && cb(true); }, function () { fallback(); });
      } else fallback();
      function fallback() {
        try {
          var ta = document.createElement('textarea');
          ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          var ok = document.execCommand('copy');
          document.body.removeChild(ta);
          cb && cb(ok);
        } catch (_) { cb && cb(false); }
      }
    }
    function escapeHtml(s) {
      return String(s || '').replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
  } // bootLm
})();
