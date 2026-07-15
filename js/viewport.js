'use strict';
/*
 * Weft viewport ("the cloth") — the live 2D render target.
 * Evaluates the graph every frame, renders three layers:
 *   1. ghost previews — every geometry-producing node draws faint scaffolding
 *      (toggleable per node, GH-style; selected nodes render green, on top)
 *   2. the drawList — explicit Draw/Display output
 *   3. anchors — canvas-input handles, draggable directly on the cloth
 */
const Viewport = {
  playing: true,
  ghosts: true, // global switch for the faint geometry previews on the cloth
  merged: false, // single-canvas view: the loom floats directly on the cloth

  init() {
    const canvas = document.getElementById('view');
    const g2 = canvas.getContext('2d');
    const fpsEl = document.getElementById('fps');
    const editorEl = document.getElementById('editor');

    const GHOST = { r: 139, g: 158, b: 191, a: 0.32 };
    const SEL = { r: 74, g: 222, b: 128, a: 0.95 };
    const SEL_FILL = { r: 74, g: 222, b: 128, a: 0.10 };

    const mouse = { x: 0, y: 0, nx: 0.5, ny: 0.5, down: false, pressed: false, released: false };
    let mx = null, my = null;
    let anchorDrag = null, anchorHot = null;
    let pressedBuf = false, releasedBuf = false;

    /* keyboard — continuous down map + frame-latched pressed/released buffers */
    const kDown = {};
    let kPressed = {}, kReleased = {};
    const keyName = e => e.key === ' ' ? 'space' : e.key.toLowerCase();
    window.addEventListener('keydown', e => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const k = keyName(e);
      if (!kDown[k]) kPressed[k] = true;
      kDown[k] = true;
    });
    window.addEventListener('keyup', e => {
      const k = keyName(e); // no typing guard: a key must never stay stuck down
      if (kDown[k]) kReleased[k] = true;
      delete kDown[k];
    });
    window.addEventListener('blur', () => { for (const k in kDown) delete kDown[k]; });

    /* scroll simulator — the cloth pretends to be a 3000px page (wheel to scrub) */
    const scroll = { y: 0, max: 3000, v: 0 };
    let scrollShow = 0, scrollLastY = 0;
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      scroll.y = LM.clamp(scroll.y + e.deltaY, 0, scroll.max);
      scrollShow = performance.now();
    }, { passive: false });

    /* text measurement — supplied to computes as ctx.measureText (invariant #8:
     * identical contract in the export mount; h is a deterministic line box) */
    const mCanvas = document.createElement('canvas');
    const mg = mCanvas.getContext('2d');
    const measureText = (text, size) => {
      mg.font = size + 'px Inter, system-ui, sans-serif';
      return { w: mg.measureText(String(text)).width, h: size * 1.2 };
    };

    /* DOM overlay — real elements (Button / Element nodes) reconciled from ctx.domList */
    const domState = {};
    const domLayer = document.createElement('div');
    domLayer.id = 'domLayer';
    canvas.parentElement.appendChild(domLayer);
    const domEls = {};
    const mkTracked = (tag, id) => {
      const el = document.createElement(tag);
      const st = domState[id] = domState[id] || { hover: false, focus: false, down: false, clicks: 0 };
      el.addEventListener('pointerenter', () => { st.hover = true; });
      el.addEventListener('pointerleave', () => { st.hover = false; st.down = false; });
      el.addEventListener('pointerdown', () => { st.down = true; });
      el.addEventListener('pointerup', () => { st.down = false; });
      el.addEventListener('focus', () => { st.focus = true; });
      el.addEventListener('blur', () => { st.focus = false; });
      el.addEventListener('click', e => {
        st.clicks++;
        const href = el.getAttribute && el.getAttribute('href');
        if (tag === 'a' && (!href || href === '#')) e.preventDefault();
      });
      domLayer.appendChild(el);
      domEls[id] = el;
      return el;
    };
    const safeTag = t => /^[a-z][a-z0-9]*$/.test(t) && t !== 'script' && t !== 'style' && t !== 'iframe' ? t : 'div';
    const syncDom = list => {
      const seen = {};
      for (const d of list) {
        if (!d) continue;
        if (d.kind === 'button') {
          seen[d.id] = true;
          let el = domEls[d.id];
          if (!el) { el = mkTracked('button', d.id); el.type = 'button'; el.className = 'weft-btn'; }
          const label = String(d.label === undefined ? '' : d.label);
          if (el.textContent !== label) el.textContent = label;
          el.style.left = 'calc(50% + ' + (d.x || 0) + 'px)';
          el.style.top = 'calc(50% + ' + (d.y || 0) + 'px)';
        } else if (d.kind === 'element') {
          seen[d.id] = true;
          const tag = safeTag(d.tag || 'div');
          let el = domEls[d.id];
          if (el && el._weftTag !== tag) { el.remove(); delete domEls[d.id]; el = null; }
          if (!el) { el = mkTracked(tag, d.id); el._weftTag = tag; el.className = 'weft-el'; }
          const text = d.text || '';
          if (el.textContent !== text) el.textContent = text;
          const want = d.attrs || {}, have = el._weftAttrs || {};
          for (const k in want) if (have[k] !== want[k]) { try { el.setAttribute(k, want[k]); } catch (e) { /* bad attr name */ } }
          for (const k in have) if (!(k in want)) el.removeAttribute(k);
          el._weftAttrs = Object.assign({}, want);
          const r = d.rect || { x: 0, y: 0, w: 10, h: 10 };
          el.style.left = 'calc(50% + ' + r.x + 'px)';
          el.style.top = 'calc(50% + ' + r.y + 'px)';
          el.style.width = Math.max(0, r.w) + 'px';
          el.style.height = Math.max(0, r.h) + 'px';
        }
      }
      for (const id in domEls) {
        if (!seen[id]) { domEls[id].remove(); delete domEls[id]; delete domState[id]; }
      }
    };

    const centered = (clientX, clientY, rect) => ({
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2
    });

    const anchors = () => App.graph.nodes.filter(n => n.type === 'params/anchor' && n.enabled !== false);

    window.addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      // merged view: the canvas never sees pointer events (the loom is on top),
      // so anchor dragging and hover detection run here instead
      if (!Viewport.merged) return;
      const p = centered(e.clientX, e.clientY, canvas.getBoundingClientRect());
      if (anchorDrag) {
        anchorDrag.values.x = Math.round(p.x);
        anchorDrag.values.y = Math.round(p.y);
        return;
      }
      anchorHot = null;
      if (!(e.target.closest && e.target.closest('.node, .port, #quickAdd, #ctxMenu, #typeKey, #loomTools, #palette, #toolbar'))) {
        for (const n of anchors()) {
          if (Math.hypot((n.values.x || 0) - p.x, (n.values.y || 0) - p.y) < 14) { anchorHot = n; break; }
        }
      }
    });
    canvas.addEventListener('pointerdown', e => {
      const p = centered(e.clientX, e.clientY, canvas.getBoundingClientRect());
      for (const n of anchors()) {
        if (Math.hypot((n.values.x || 0) - p.x, (n.values.y || 0) - p.y) < 14) {
          anchorDrag = n;
          canvas.setPointerCapture(e.pointerId);
          e.preventDefault();
          return; // grabbing an anchor is not a "mouse down" gesture for the graph
        }
      }
      mouse.down = true;
      pressedBuf = true;
    });
    canvas.addEventListener('pointermove', e => {
      const rect = canvas.getBoundingClientRect();
      const p = centered(e.clientX, e.clientY, rect);
      if (anchorDrag) {
        anchorDrag.values.x = Math.round(p.x);
        anchorDrag.values.y = Math.round(p.y);
        return;
      }
      anchorHot = null;
      for (const n of anchors()) {
        if (Math.hypot((n.values.x || 0) - p.x, (n.values.y || 0) - p.y) < 14) { anchorHot = n; break; }
      }
    });
    window.addEventListener('pointerup', () => {
      if (anchorDrag) { anchorDrag = null; App.onGraphChanged(); }
      if (mouse.down) releasedBuf = true;
      mouse.down = false;
    });

    /* merged view — the editor forwards background gestures here so the cloth
     * stays interactive (anchors, mouse/press nodes, the scroll simulator) */
    Viewport.forward = {
      down(e) {
        const p = centered(e.clientX, e.clientY, canvas.getBoundingClientRect());
        for (const n of anchors()) {
          if (Math.hypot((n.values.x || 0) - p.x, (n.values.y || 0) - p.y) < 14) {
            anchorDrag = n;
            return 'anchor';
          }
        }
        mouse.down = true;
        pressedBuf = true;
        return 'mouse';
      },
      wheel(dy) {
        scroll.y = LM.clamp(scroll.y + dy, 0, scroll.max);
        scrollShow = performance.now();
      }
    };

    let t = 0, frame = 0, last = performance.now(), fpsA = 60, lastFps = 0;

    const drawGhosts = (ctx, wantSelected) => {
      const selIds = Editor.selectedIds();
      for (const n of App.graph.nodes) {
        if (n.enabled === false || n.preview === false) continue;
        if (n.type === 'params/anchor') continue; // its handle is its preview
        const def = NODE_DEFS[n.type];
        if (!def || def.cat === 'Display') continue;
        const selected = selIds.has(n.id);
        if (selected !== wantSelected) continue;
        const outs = ctx.out[n.id];
        if (!outs) continue;
        for (const o of (def.dynamic ? (n.values && n.values.outs) : def.outputs) || []) {
          if (o.type !== 'geometry' && o.type !== 'point') continue;
          const L = outs[o.name] || [];
          for (const g of L) {
            if (!g || typeof g !== 'object') continue;
            try {
              LM.drawItem(g2, {
                geom: g,
                stroke: selected ? SEL : GHOST,
                fill: selected && LM.isClosedGeom(g) ? SEL_FILL : null,
                width: selected ? 1.6 : 1
              });
            } catch (e) { /* skip bad item */ }
          }
        }
      }
    };

    const drawAnchors = () => {
      for (const n of anchors()) {
        const x = n.values.x || 0, y = n.values.y || 0;
        const hot = n === anchorDrag || n === anchorHot;
        g2.beginPath();
        g2.arc(x, y, 6.5, 0, Math.PI * 2);
        g2.fillStyle = 'rgba(11,14,20,0.85)';
        g2.fill();
        g2.strokeStyle = hot ? '#5eead4' : 'rgba(94,234,212,0.75)';
        g2.lineWidth = hot ? 2 : 1.5;
        g2.stroke();
        g2.beginPath();
        g2.moveTo(x - 10, y); g2.lineTo(x - 4, y);
        g2.moveTo(x + 4, y); g2.lineTo(x + 10, y);
        g2.moveTo(x, y - 10); g2.lineTo(x, y - 4);
        g2.moveTo(x, y + 4); g2.lineTo(x, y + 10);
        g2.strokeStyle = hot ? '#5eead4' : 'rgba(94,234,212,0.45)';
        g2.lineWidth = 1;
        g2.stroke();
        if (hot) {
          g2.font = '10px ui-monospace, Consolas, monospace';
          g2.textAlign = 'left'; g2.textBaseline = 'bottom';
          g2.fillStyle = 'rgba(94,234,212,0.9)';
          g2.fillText(Math.round(x) + ', ' + Math.round(y), x + 12, y - 8);
        }
      }
    };

    const loop = now => {
      requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (Viewport.playing) t += dt;

      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      const pw = Math.round(rect.width * dpr), ph = Math.round(rect.height * dpr);
      if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }

      if (mx !== null && !anchorDrag) {
        mouse.x = mx - rect.left - rect.width / 2;
        mouse.y = my - rect.top - rect.height / 2;
        mouse.nx = (mx - rect.left) / rect.width;
        mouse.ny = (my - rect.top) / rect.height;
      }

      // latch buffered events into this frame, then reset the buffers
      mouse.pressed = pressedBuf; mouse.released = releasedBuf;
      pressedBuf = releasedBuf = false;
      const keys = { down: kDown, pressed: kPressed, released: kReleased };
      kPressed = {}; kReleased = {};
      scroll.v = scroll.v * 0.8 + ((scroll.y - scrollLastY) / Math.max(dt, 1e-3)) * 0.2;
      scrollLastY = scroll.y;

      const ctx = {
        t, dt: Viewport.playing ? dt : 0, frame: frame++, mouse, keys, scroll,
        W: rect.width, H: rect.height, measureText, defs: NODE_DEFS,
        drawList: [], domList: [], domState, bg: null, errors: {}, out: {}
      };
      try { LM.evaluateGraph(App.graph, NODE_DEFS, ctx); } catch (e) { /* keep rendering */ }
      syncDom(ctx.domList);

      let overHotspot = false;
      for (const n of App.graph.nodes) {
        if (n.type !== 'input/hotspot' || n.enabled === false) continue;
        const o = ctx.out[n.id];
        if (o && (o.H || []).some(Boolean)) { overHotspot = true; break; }
      }
      const cursor = (anchorDrag || anchorHot) ? 'grab' : overHotspot ? 'pointer' : '';
      if (Viewport.merged) {
        editorEl.style.cursor = cursor;
        canvas.style.cursor = '';
      } else {
        canvas.style.cursor = cursor;
        if (editorEl.style.cursor) editorEl.style.cursor = '';
      }

      g2.setTransform(dpr, 0, 0, dpr, 0, 0);
      g2.fillStyle = ctx.bg ? LM.colorCss(ctx.bg) : '#0b0e14';
      g2.fillRect(0, 0, rect.width, rect.height);
      g2.save();
      g2.translate(rect.width / 2, rect.height / 2);
      if (Viewport.ghosts) drawGhosts(ctx, false);
      for (const it of ctx.drawList) {
        try { LM.drawItem(g2, it); } catch (e) { /* skip bad item */ }
      }
      if (Viewport.ghosts) drawGhosts(ctx, true);
      drawAnchors();
      g2.restore();

      // scroll-simulator indicator: a slim thumb on the right edge while scrubbing
      const scrollAge = now - scrollShow;
      if (scrollShow && scrollAge < 900) {
        const alpha = scrollAge < 600 ? 0.55 : 0.55 * (1 - (scrollAge - 600) / 300);
        const trackH = rect.height - 24;
        const thumbH = Math.max(28, trackH * rect.height / (scroll.max + rect.height));
        const y = 12 + (trackH - thumbH) * (scroll.y / scroll.max);
        g2.fillStyle = 'rgba(94,234,212,' + alpha.toFixed(3) + ')';
        g2.fillRect(rect.width - 5, y, 3, thumbH);
      }

      Editor.postEval(ctx);

      fpsA = fpsA * 0.95 + (1 / Math.max(dt, 1e-3)) * 0.05;
      if (now - lastFps > 500) { fpsEl.textContent = Math.round(fpsA) + ' fps'; lastFps = now; }
    };
    requestAnimationFrame(loop);
  }
};
