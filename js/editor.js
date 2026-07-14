'use strict';
/* Weft node editor — pan/zoom world, DOM nodes, SVG wires. */
const Editor = (() => {

  const S = {
    graph: { nodes: [], wires: [] },
    pan: { x: 60, y: 40 }, zoom: 1,
    sel: new Set(), selWire: null,
    idc: 1, widc: 1,
    els: new Map(),          // nodeId -> element
    lastErr: new Map(),
    onChange: () => {},
    drag: null, hotPort: null,
    wireRaf: false
  };

  let editorEl, worldEl, nodesEl, svgEl, qaEl, qaInput, qaList, ctxEl, marqueeEl = null;

  /* ------------------------------ helpers ------------------------------ */

  const nodeById = id => S.graph.nodes.find(n => n.id === id);
  const defOf = n => NODE_DEFS[n.type];
  /* dynamic defs (clusters) keep their ports on the node, not the def */
  const insOf = n => { const d = defOf(n); return d ? ((d.dynamic && n.values && n.values.ins) || d.inputs || []) : []; };
  const outsOf = n => { const d = defOf(n); return d ? ((d.dynamic && n.values && n.values.outs) || d.outputs || []) : []; };
  const previewCapable = (def, n) => !!def && def.cat !== 'Display' && def.id !== 'params/anchor' &&
    ((def.dynamic && n ? (n.values.outs || []) : def.outputs) || []).some(o => o.type === 'geometry' || o.type === 'point');

  function worldPos(e) {
    const r = editorEl.getBoundingClientRect();
    return { x: (e.clientX - r.left - S.pan.x) / S.zoom, y: (e.clientY - r.top - S.pan.y) / S.zoom };
  }

  function worldCenter() {
    const r = editorEl.getBoundingClientRect();
    return { x: (r.width / 2 - S.pan.x) / S.zoom, y: (r.height / 2 - S.pan.y) / S.zoom };
  }

  function applyTransform() {
    worldEl.style.transform = `translate(${S.pan.x}px, ${S.pan.y}px) scale(${S.zoom})`;
    editorEl.style.backgroundPosition = `${S.pan.x}px ${S.pan.y}px`;
    editorEl.style.backgroundSize = `${26 * S.zoom}px ${26 * S.zoom}px`;
  }

  function changed() { S.onChange(); }

  /* ------------------------------ graph ops ------------------------------ */

  function nextId() {
    while (nodeById('n' + S.idc)) S.idc++;
    return 'n' + (S.idc++);
  }

  function addNode(type, x, y) {
    const def = NODE_DEFS[type];
    if (!def) return null;
    const n = { id: nextId(), type, x: Math.round(x), y: Math.round(y), values: def.defaults ? JSON.parse(JSON.stringify(def.defaults)) : {} };
    S.graph.nodes.push(n);
    buildNode(n);
    drawWires();
    changed();
    return n;
  }

  function removeNode(id) {
    S.graph.wires = S.graph.wires.filter(w => w.from[0] !== id && w.to[0] !== id);
    const i = S.graph.nodes.findIndex(n => n.id === id);
    if (i >= 0) S.graph.nodes.splice(i, 1);
    const el = S.els.get(id);
    if (el) el.remove();
    S.els.delete(id);
    S.sel.delete(id);
    S.lastErr.delete(id);
    refreshAllLiterals();
    drawWires();
  }

  /* duplicate = copy + paste in place; the fragment's ext list preserves
   * incoming wires from outside the selection (GH behavior) */
  function duplicateSelection() {
    const frag = copySelection();
    if (frag) pasteFragment(frag);
  }

  function wiresToInput(nodeId, port) {
    return S.graph.wires.filter(w => w.to[0] === nodeId && w.to[1] === port);
  }

  function wouldCycle(srcId, dstId) {
    // wires into a feedback node (Delay) are cut from the evaluation order —
    // they can never close a cycle, so routing through one legalises a loop
    const cutsEdge = id => { const n = nodeById(id); const d = n && defOf(n); return !!(d && d.feedback); };
    if (cutsEdge(dstId)) return false;
    if (srcId === dstId) return true;
    const stack = [dstId], seen = new Set();
    while (stack.length) {
      const x = stack.pop();
      if (x === srcId) return true;
      if (seen.has(x)) continue;
      seen.add(x);
      for (const w of S.graph.wires) if (w.from[0] === x && !cutsEdge(w.to[0])) stack.push(w.to[0]);
    }
    return false;
  }

  function connect(fromId, fromPort, toId, toPort) {
    if (wouldCycle(fromId, toId)) { App.flash('that connection would create a cycle'); return false; }
    // multiple wires per input are allowed (lists concatenate); only exact duplicates are refused
    if (S.graph.wires.some(w => w.from[0] === fromId && w.from[1] === fromPort && w.to[0] === toId && w.to[1] === toPort)) return false;
    S.graph.wires.push({ id: 'w' + (S.widc++), from: [fromId, fromPort], to: [toId, toPort] });
    refreshLiterals(toId);
    drawWires();
    changed();
    return true;
  }

  function removeWire(id) {
    const i = S.graph.wires.findIndex(w => w.id === id);
    if (i < 0) return;
    const toId = S.graph.wires[i].to[0];
    S.graph.wires.splice(i, 1);
    if (S.selWire === id) S.selWire = null;
    refreshLiterals(toId);
    drawWires();
    changed();
  }

  /* ------------------------------ node DOM ------------------------------ */

  function buildNode(n) {
    const def = defOf(n);
    const el = document.createElement('div');
    el.className = 'node';
    el.dataset.id = n.id;
    if (def && def.width) el.style.width = def.width + 'px';
    if (def && def.compact) el.classList.add('compact');
    if (n.enabled === false) el.classList.add('disabled');
    if (n.preview === false) el.classList.add('no-prev');

    if (!def) {
      el.innerHTML = `<div class="node-head"><span class="dot" style="background:#f87171"></span><span class="title">? ${n.type}</span></div>`;
      nodesEl.appendChild(el);
      S.els.set(n.id, el);
      position(el, n);
      return el;
    }

    el.style.setProperty('--cat', CATS[def.cat] || '#888');
    if (def.bare) el.classList.add('bare');
    if (def.dynamic) el.classList.add('cluster');

    if (!def.bare) {
      const head = document.createElement('div');
      head.className = 'node-head';
      const icon = weftIconSVG(def.id, def.cat);
      const title = (def.dynamic && n.values && n.values.title) || def.title;
      head.innerHTML = `<span class="icon">${icon || '<span class="dot"></span>'}</span><span class="title">${title}</span><span class="head-gap"></span>`;
      head.title = def.dynamic ? 'double-click the name to rename' : (def.desc || '');
      if (def.dynamic) {
        const tEl = head.querySelector('.title');
        tEl.addEventListener('dblclick', e => {
          e.stopPropagation();
          tEl.contentEditable = 'true';
          tEl.focus();
          document.getSelection().selectAllChildren(tEl);
          const commit = () => {
            tEl.contentEditable = 'false';
            const t = tEl.textContent.trim() || def.title;
            tEl.textContent = t;
            if (n.values.title !== t) { n.values.title = t; changed(); }
          };
          tEl.addEventListener('blur', commit, { once: true });
          tEl.addEventListener('keydown', ev => {
            if (ev.key === 'Enter') { ev.preventDefault(); tEl.blur(); }
            if (ev.key === 'Escape') { tEl.textContent = n.values.title || def.title; tEl.blur(); }
          });
        });
      }
      if (previewCapable(def, n)) {
        const pt = document.createElement('span');
        pt.className = 'prev-toggle';
        pt.title = 'toggle geometry preview';
        pt.innerHTML = weftEyeSVG(n.preview === false ? 'hidden' : 'shown');
        pt.addEventListener('pointerdown', e => e.stopPropagation());
        pt.addEventListener('click', e => {
          e.stopPropagation();
          n.preview = n.preview === false ? true : false;
          el.classList.toggle('no-prev', n.preview === false);
          pt.innerHTML = weftEyeSVG(n.preview === false ? 'hidden' : 'shown');
          changed();
        });
        head.appendChild(pt);
      }
      el.appendChild(head);
    }

    const rows = document.createElement('div');
    rows.className = 'node-rows';
    el.appendChild(rows);

    if (def.buildBody) {
      const body = document.createElement('div');
      body.className = 'node-body';
      rows.appendChild(body);
      def.buildBody(n, body, changed);
    }

    /* inputs stack left, outputs stack right and settle to the bottom —
     * the Figma card's two-column band */
    const cols = document.createElement('div');
    cols.className = 'node-cols';
    rows.appendChild(cols);

    const insCol = document.createElement('div');
    insCol.className = 'col-ins';
    for (const inp of insOf(n)) {
      const row = document.createElement('div');
      row.className = 'row in';
      row.dataset.input = inp.name;
      row.innerHTML = `<span class="port" data-node="${n.id}" data-dir="in" data-port="${inp.name}" style="--t:${TYPE_COLORS[inp.type] || '#999'}" title="${(inp.label || inp.name)} · ${inp.type}"></span><span class="label">${inp.name}</span>`;
      const lit = document.createElement('span');
      lit.className = 'lit';
      row.appendChild(lit);
      buildLiteral(n, inp, lit);
      insCol.appendChild(row);
    }
    cols.appendChild(insCol);

    const outsCol = document.createElement('div');
    outsCol.className = 'col-outs';
    for (const o of outsOf(n)) {
      const row = document.createElement('div');
      row.className = 'row out';
      row.innerHTML = `<span class="rd" data-port="${o.name}"></span><span class="label">${o.name}</span><span class="port" data-node="${n.id}" data-dir="out" data-port="${o.name}" style="--t:${TYPE_COLORS[o.type] || '#999'}" title="${(o.label || o.name)} · ${o.type}"></span>`;
      outsCol.appendChild(row);
    }
    cols.appendChild(outsCol);

    nodesEl.appendChild(el);
    S.els.set(n.id, el);
    position(el, n);
    refreshLiterals(n.id);
    return el;
  }

  function position(el, n) {
    el.style.transform = `translate(${n.x}px, ${n.y}px)`;
  }

  function buildLiteral(n, inp, holder) {
    const cur = () => n.values[inp.name] !== undefined ? n.values[inp.name] : inp.default;
    const set = v => { n.values[inp.name] = v; changed(); };

    if (inp.type === 'number') {
      const i = document.createElement('input');
      i.type = 'number'; i.step = 'any'; i.value = cur() === undefined ? '' : cur();
      i.addEventListener('change', () => set(parseFloat(i.value) || 0));
      holder.appendChild(i);
    } else if (inp.type === 'bool') {
      const i = document.createElement('input');
      i.type = 'checkbox'; i.checked = !!cur();
      i.addEventListener('change', () => set(i.checked));
      holder.appendChild(i);
    } else if (inp.type === 'string') {
      const i = document.createElement('input');
      i.type = 'text'; i.value = cur() === undefined ? '' : cur(); i.spellcheck = false;
      i.addEventListener('change', () => set(i.value));
      holder.appendChild(i);
    } else if (inp.type === 'color') {
      const c = cur() || { r: 255, g: 255, b: 255, a: 1 };
      const i = document.createElement('input');
      i.type = 'color'; i.value = LM.colorToHex(c);
      const al = document.createElement('input');
      al.type = 'number'; al.step = 'any'; al.min = 0; al.max = 1; al.className = 'alpha';
      al.value = c.a === undefined ? 1 : c.a; al.title = 'alpha';
      const upd = () => {
        const col = LM.hexToColor(i.value, LM.clamp(parseFloat(al.value) || 0, 0, 1));
        set(col);
      };
      i.addEventListener('input', upd);
      al.addEventListener('change', upd);
      holder.appendChild(i); holder.appendChild(al);
    } else if (inp.type === 'point' || inp.type === 'vector') {
      const p = cur() || { x: 0, y: 0 };
      const ix = document.createElement('input');
      const iy = document.createElement('input');
      ix.type = iy.type = 'number'; ix.step = iy.step = 'any';
      ix.className = iy.className = 'pt';
      ix.value = p.x; iy.value = p.y; ix.title = 'x'; iy.title = 'y';
      const upd = () => set({ x: parseFloat(ix.value) || 0, y: parseFloat(iy.value) || 0 });
      ix.addEventListener('change', upd); iy.addEventListener('change', upd);
      holder.appendChild(ix); holder.appendChild(iy);
    }
  }

  function refreshLiterals(nodeId) {
    const el = S.els.get(nodeId);
    if (!el) return;
    el.querySelectorAll('.row.in').forEach(row => {
      const connected = wiresToInput(nodeId, row.dataset.input).length > 0;
      row.classList.toggle('connected', connected);
    });
  }

  function refreshAllLiterals() {
    for (const n of S.graph.nodes) refreshLiterals(n.id);
  }

  /* ------------------------------ wires ------------------------------ */

  function portPos(nodeId, dir, name) {
    const n = nodeById(nodeId);
    const nodeEl = S.els.get(nodeId);
    if (!n || !nodeEl) return { x: 0, y: 0 };
    const el = nodeEl.querySelector(`.port[data-dir="${dir}"][data-port="${name}"]`);
    if (!el) return { x: n.x, y: n.y };
    // measure through real geometry so CSS transforms can't skew wire endpoints
    const pr = el.getBoundingClientRect();
    const er = editorEl.getBoundingClientRect();
    return {
      x: (pr.left + pr.width / 2 - er.left - S.pan.x) / S.zoom,
      y: (pr.top + pr.height / 2 - er.top - S.pan.y) / S.zoom
    };
  }

  function wirePath(p1, p2) {
    const dx = Math.max(40, Math.abs(p2.x - p1.x) * 0.5);
    return `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;
  }

  function outputTypeColor(from) {
    const n = nodeById(from[0]);
    const o = n && outsOf(n).find(o => o.name === from[1]);
    return o ? (TYPE_COLORS[o.type] || '#999') : '#999';
  }

  function drawWires() {
    if (S.wireRaf) return;
    S.wireRaf = true;
    requestAnimationFrame(() => { S.wireRaf = false; drawWiresNow(); });
  }

  function drawWiresNow() {
    const NS = 'http://www.w3.org/2000/svg';
    svgEl.innerHTML = '';
    for (const w of S.graph.wires) {
      const p1 = portPos(w.from[0], 'out', w.from[1]);
      const p2 = portPos(w.to[0], 'in', w.to[1]);
      const d = wirePath(p1, p2);

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'wire' + (S.selWire === w.id ? ' selected' : ''));
      path.setAttribute('stroke', outputTypeColor(w.from));
      svgEl.appendChild(path);

      const hit = document.createElementNS(NS, 'path');
      hit.setAttribute('d', d);
      hit.setAttribute('class', 'wire-hit');
      hit.addEventListener('pointerdown', e => {
        e.stopPropagation();
        S.selWire = w.id; S.sel.clear();
        updateSelection(); drawWires();
      });
      hit.addEventListener('dblclick', e => { e.stopPropagation(); removeWire(w.id); });
      svgEl.appendChild(hit);
    }
    if (S.drag && S.drag.kind === 'wire') {
      const fixed = portPos(S.drag.fixed.node, S.drag.fixed.dir, S.drag.fixed.port);
      const m = { x: S.drag.mx, y: S.drag.my };
      const d = S.drag.fixed.dir === 'out' ? wirePath(fixed, m) : wirePath(m, fixed);
      const t = document.createElementNS(NS, 'path');
      t.setAttribute('d', d);
      t.setAttribute('class', 'wire temp');
      t.setAttribute('stroke', '#5eead4');
      svgEl.appendChild(t);
    }
  }

  /* ------------------------------ selection ------------------------------ */

  function selectOnly(id) {
    S.sel.clear(); S.sel.add(id); S.selWire = null;
    updateSelection();
  }

  function clearSel() {
    S.sel.clear(); S.selWire = null;
    updateSelection(); drawWires();
  }

  function updateSelection() {
    for (const [id, el] of S.els) el.classList.toggle('selected', S.sel.has(id));
  }

  function deleteSelection() {
    if (S.selWire) { removeWire(S.selWire); return; }
    if (!S.sel.size) return;
    for (const id of [...S.sel]) removeNode(id);
    changed();
  }

  /* ------------------------------ interactions ------------------------------ */

  function startWire(e, portEl) {
    e.stopPropagation();
    const nodeId = portEl.dataset.node, dir = portEl.dataset.dir, port = portEl.dataset.port;
    let fixed = { node: nodeId, dir, port };
    let detached = false;
    if (dir === 'in') {
      const ws = wiresToInput(nodeId, port);
      if (ws.length) {
        const w = ws[ws.length - 1]; // grab the newest wire
        S.graph.wires.splice(S.graph.wires.indexOf(w), 1);
        refreshLiterals(nodeId);
        fixed = { node: w.from[0], dir: 'out', port: w.from[1] };
        detached = true;
      }
    }
    const wp = worldPos(e);
    S.drag = { kind: 'wire', fixed, mx: wp.x, my: wp.y, detached };
    drawWires();
  }

  function completeWire(e) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const portEl = target && target.closest && target.closest('.port');
    const wasDetached = S.drag.detached;
    const fixed = S.drag.fixed;
    S.drag = null;
    if (S.hotPort) { S.hotPort.classList.remove('hot'); S.hotPort = null; }
    if (!portEl) {
      drawWires();
      if (wasDetached) changed();
      return;
    }
    const other = { node: portEl.dataset.node, dir: portEl.dataset.dir, port: portEl.dataset.port };
    if (other.dir === fixed.dir || other.node === fixed.node) {
      drawWires();
      if (wasDetached) changed();
      if (other.dir === fixed.dir) App.flash('connect an output to an input');
      return;
    }
    const out = fixed.dir === 'out' ? fixed : other;
    const inn = fixed.dir === 'in' ? fixed : other;
    if (!connect(out.node, out.port, inn.node, inn.port)) {
      drawWires();
      if (wasDetached) changed();
    }
  }

  function startNodeDrag(e, id) {
    if (!S.sel.has(id)) selectOnly(id);
    const moving = [...S.sel].map(nid => {
      const n = nodeById(nid);
      return { n, ox: n.x, oy: n.y };
    }).filter(m => m.n);
    S.drag = { kind: 'node', sx: e.clientX, sy: e.clientY, moving, moved: false };
  }

  function onPointerDown(e) {
    closeCtx();
    if (e.target.closest && e.target.closest('#quickAdd, #ctxMenu, #typeKey')) return;
    const portEl = e.target.closest && e.target.closest('.port');
    const nodeEl = e.target.closest && e.target.closest('.node');

    if (e.button === 2) {
      // right button: pan on background; clean right-click opens menu on release
      e.preventDefault();
      if (nodeEl) { S.drag = { kind: 'rnode', id: nodeEl.dataset.id, sx: e.clientX, sy: e.clientY, moved: false }; return; }
      closeQA();
      S.drag = { kind: 'pan', rmb: true, sx: e.clientX, sy: e.clientY, ox: S.pan.x, oy: S.pan.y, moved: false };
      editorEl.classList.add('panning');
      return;
    }
    if (e.button === 1) {
      e.preventDefault();
      S.drag = { kind: 'pan', sx: e.clientX, sy: e.clientY, ox: S.pan.x, oy: S.pan.y, moved: false };
      editorEl.classList.add('panning');
      return;
    }
    if (e.button !== 0) return;

    if (portEl) { startWire(e, portEl); return; }
    if (nodeEl) {
      if (e.target.closest('input, textarea, select, button, [contenteditable]')) return;
      e.preventDefault();
      if (e.shiftKey) { S.sel.add(nodeEl.dataset.id); S.selWire = null; updateSelection(); }
      else if (!S.sel.has(nodeEl.dataset.id)) selectOnly(nodeEl.dataset.id);
      startNodeDrag(e, nodeEl.dataset.id);
      return;
    }
    // background left-drag: marquee (shift = add to selection)
    closeQA();
    const wp = worldPos(e);
    S.drag = {
      kind: 'marquee', x0: wp.x, y0: wp.y,
      base: e.shiftKey ? new Set(S.sel) : new Set()
    };
    marqueeEl = document.createElement('div');
    marqueeEl.id = 'marquee';
    editorEl.appendChild(marqueeEl);
  }

  function onPointerMove(e) {
    if (!S.drag) return;
    const d = S.drag;
    if (d.kind === 'pan') {
      S.pan.x = d.ox + (e.clientX - d.sx);
      S.pan.y = d.oy + (e.clientY - d.sy);
      if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 3) d.moved = true;
      applyTransform();
    } else if (d.kind === 'node') {
      const dx = (e.clientX - d.sx) / S.zoom, dy = (e.clientY - d.sy) / S.zoom;
      if (Math.abs(dx) + Math.abs(dy) > 1) d.moved = true;
      for (const m of d.moving) {
        m.n.x = Math.round(m.ox + dx);
        m.n.y = Math.round(m.oy + dy);
        const el = S.els.get(m.n.id);
        if (el) position(el, m.n);
      }
      drawWires();
    } else if (d.kind === 'marquee') {
      const wp = worldPos(e);
      const x = Math.min(d.x0, wp.x), y = Math.min(d.y0, wp.y);
      const w = Math.abs(wp.x - d.x0), h = Math.abs(wp.y - d.y0);
      // CAD semantics: drag left = crossing (touch selects), drag right = window (contain selects)
      const crossing = wp.x < d.x0;
      marqueeEl.classList.toggle('crossing', crossing);
      marqueeEl.style.left = (x * S.zoom + S.pan.x) + 'px';
      marqueeEl.style.top = (y * S.zoom + S.pan.y) + 'px';
      marqueeEl.style.width = (w * S.zoom) + 'px';
      marqueeEl.style.height = (h * S.zoom) + 'px';
      const sel = new Set(d.base);
      for (const n of S.graph.nodes) {
        const el = S.els.get(n.id);
        if (!el) continue;
        const nw = el.offsetWidth, nh = el.offsetHeight;
        const hit = crossing
          ? (n.x < x + w && n.x + nw > x && n.y < y + h && n.y + nh > y)
          : (n.x >= x && n.x + nw <= x + w && n.y >= y && n.y + nh <= y + h);
        if (hit) sel.add(n.id);
      }
      S.sel = sel; S.selWire = null;
      updateSelection();
    } else if (d.kind === 'rnode') {
      if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true;
    } else if (d.kind === 'wire') {
      const wp = worldPos(e);
      d.mx = wp.x; d.my = wp.y;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const portEl = target && target.closest && target.closest('.port');
      if (S.hotPort && S.hotPort !== portEl) { S.hotPort.classList.remove('hot'); S.hotPort = null; }
      if (portEl && portEl.dataset.dir !== d.fixed.dir && portEl.dataset.node !== d.fixed.node) {
        portEl.classList.add('hot');
        S.hotPort = portEl;
      }
      drawWires();
    }
  }

  function onPointerUp(e) {
    if (!S.drag) return;
    const d = S.drag;
    if (d.kind === 'wire') { completeWire(e); return; }
    if (d.kind === 'marquee') {
      if (marqueeEl) { marqueeEl.remove(); marqueeEl = null; }
      S.drag = null;
      return;
    }
    if (d.kind === 'rnode') {
      S.drag = null;
      if (!d.moved) openCtx(e, d.id);
      return;
    }
    S.drag = null;
    editorEl.classList.remove('panning');
    if (d.kind === 'node' && d.moved) changed();
    if (d.kind === 'pan' && d.rmb && !d.moved) openQA(e);
  }

  function onWheel(e) {
    e.preventDefault();
    const r = editorEl.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const z2 = LM.clamp(S.zoom * Math.exp(-e.deltaY * 0.0012), 0.08, 2.5);
    S.pan.x = mx - (mx - S.pan.x) * (z2 / S.zoom);
    S.pan.y = my - (my - S.pan.y) * (z2 / S.zoom);
    S.zoom = z2;
    applyTransform();
  }

  function onKeyDown(e) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { deleteSelection(); e.preventDefault(); }
    else if (e.key === 'Escape') { closeQA(); closeCtx(); clearSel(); }
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      duplicateSelection();
    }
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
      e.preventDefault();
      collapseSelection();
    }
    else if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'f' || e.key === 'F' || e.key === 'Home')) {
      e.preventDefault();
      zoomToFit(e.key !== 'Home' && S.sel.size > 0);
    }
  }

  /* ------------------------------ quick add ------------------------------ */

  let qaPos = { x: 0, y: 0 }, qaIndex = 0, qaItems = [];

  function openQA(e) {
    qaPos = worldPos(e);
    const r = editorEl.getBoundingClientRect();
    qaEl.classList.remove('hidden');
    qaEl.style.left = Math.min(e.clientX - r.left, r.width - 240) + 'px';
    qaEl.style.top = Math.min(e.clientY - r.top, r.height - 300) + 'px';
    qaInput.value = '';
    renderQA('');
    qaInput.focus();
  }

  function closeQA() { qaEl.classList.add('hidden'); }

  function renderQA(q) {
    q = q.toLowerCase();
    qaItems = Object.values(NODE_DEFS)
      .filter(d => !d.hidden)
      .filter(d => !q || d.title.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q) || d.id.includes(q))
      .sort((a, b) => a.cat.localeCompare(b.cat) || a.title.localeCompare(b.title))
      .slice(0, 60);
    qaIndex = 0;
    qaList.innerHTML = qaItems.map((d, i) => {
      const icon = d.id === 'params/swatch' ? '<span class="icon-swatch"></span>'
        : (weftIconSVG(d.id, d.cat) || `<span class="dot" style="background:${CATS[d.cat]}"></span>`);
      return `<div class="qa-item ${i === 0 ? 'active' : ''}" data-type="${d.id}" title="${d.desc || ''}">
        <span class="pal-icon" style="color:${CATS[d.cat]}">${icon}</span>${d.title}<span class="qa-cat">${d.cat}</span>
      </div>`;
    }).join('');
  }

  function qaCommit(type) {
    if (!type) return;
    closeQA();
    const n = addNode(type, qaPos.x, qaPos.y);
    if (n) selectOnly(n.id);
  }

  function bindQA() {
    qaInput.addEventListener('input', () => renderQA(qaInput.value));
    qaInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { qaCommit(qaItems[qaIndex] && qaItems[qaIndex].id); e.preventDefault(); }
      else if (e.key === 'Escape') { closeQA(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        qaIndex = LM.clamp(qaIndex + (e.key === 'ArrowDown' ? 1 : -1), 0, qaItems.length - 1);
        qaList.querySelectorAll('.qa-item').forEach((el, i) => el.classList.toggle('active', i === qaIndex));
        const act = qaList.querySelector('.qa-item.active');
        if (act) act.scrollIntoView({ block: 'nearest' });
      }
    });
    qaList.addEventListener('pointerdown', e => {
      const item = e.target.closest('.qa-item');
      if (item) { e.preventDefault(); qaCommit(item.dataset.type); }
    });
  }

  /* ------------------------------ clipboard: patch fragments ------------------------------ */

  function copySelection() {
    if (!S.sel.size) return null;
    const nodes = S.graph.nodes.filter(n => S.sel.has(n.id)).map(n => {
      const o = { id: n.id, type: n.type, x: n.x, y: n.y, values: JSON.parse(JSON.stringify(n.values || {})) };
      if (n.enabled === false) o.enabled = false;
      if (n.preview === false) o.preview = false;
      return o;
    });
    const wires = S.graph.wires
      .filter(w => S.sel.has(w.from[0]) && S.sel.has(w.to[0]))
      .map(w => ({ from: w.from.slice(), to: w.to.slice() }));
    // external incoming wires: reattached on paste when the source still exists
    // (same-graph paste behaves like duplicate; cross-graph they drop silently)
    const ext = S.graph.wires
      .filter(w => S.sel.has(w.to[0]) && !S.sel.has(w.from[0]))
      .map(w => ({ from: w.from.slice(), to: w.to.slice() }));
    return { weft: 'patch', format: 1, nodes, wires, ext };
  }

  /* nodes without x/y (e.g. LLM-authored patches) get laid out in topological columns */
  function autoLayout(nodes, wires) {
    if (nodes.every(n => typeof n.x === 'number' && typeof n.y === 'number')) return false;
    const incoming = {};
    for (const n of nodes) incoming[n.id] = [];
    for (const w of wires) {
      if (w && Array.isArray(w.from) && Array.isArray(w.to) && incoming[w.to[0]] && incoming[w.from[0]] !== undefined)
        incoming[w.to[0]].push(w.from[0]);
    }
    const depth = {};
    const calc = (id, seen) => {
      if (depth[id] !== undefined) return depth[id];
      if (seen.has(id)) return 0;
      seen.add(id);
      let d = 0;
      for (const p of incoming[id]) d = Math.max(d, calc(p, seen) + 1);
      depth[id] = d;
      return d;
    };
    for (const n of nodes) calc(n.id, new Set());
    const colY = {};
    for (const n of nodes) {
      const d = depth[n.id] || 0;
      n.x = 60 + d * 250;
      n.y = 60 + (colY[d] || 0);
      colY[d] = (colY[d] || 0) + 140;
    }
    return true;
  }

  function pasteFragment(data) {
    if (!data || !Array.isArray(data.nodes) || !data.nodes.length) return false;
    const wires = Array.isArray(data.wires) ? data.wires : [];
    const nodes = data.nodes.map(n => ({ ...n, values: n.values ? JSON.parse(JSON.stringify(n.values)) : undefined }));
    const laidOut = autoLayout(nodes, wires);
    // auto-laid patches land below existing content instead of overlapping it
    let yShift = 0;
    if (laidOut && S.graph.nodes.length) {
      let maxY = -Infinity;
      for (const n of S.graph.nodes) {
        const el = S.els.get(n.id);
        maxY = Math.max(maxY, n.y + (el ? el.offsetHeight : 100));
      }
      yShift = maxY + 80 - 60;
    }

    const idMap = {}, newIds = [];
    for (const src of nodes) {
      if (!src || !src.type) continue;
      const def = NODE_DEFS[src.type];
      const values = src.values !== undefined ? src.values
        : (def && def.defaults ? JSON.parse(JSON.stringify(def.defaults)) : {});
      const n = {
        id: nextId(), type: src.type,
        x: Math.round((+src.x || 0) + 26), y: Math.round((+src.y || 0) + 26 + yShift),
        values
      };
      if (src.enabled === false) n.enabled = false;
      if (src.preview === false) n.preview = false;
      idMap[src.id] = n.id;
      S.graph.nodes.push(n);
      buildNode(n);
      newIds.push(n.id);
    }
    let dropped = 0;
    const seenWires = new Set();
    for (const w of wires) {
      if (!w || !Array.isArray(w.from) || !Array.isArray(w.to)) { dropped++; continue; }
      const f = idMap[w.from[0]], t = idMap[w.to[0]];
      const key = f + ':' + w.from[1] + '>' + t + ':' + w.to[1];
      if (!f || !t || seenWires.has(key)) { dropped++; continue; }
      seenWires.add(key);
      S.graph.wires.push({ id: 'w' + (S.widc++), from: [f, w.from[1]], to: [t, w.to[1]] });
    }
    // reattach external incoming wires whose source node exists in this graph
    for (const w of (Array.isArray(data.ext) ? data.ext : [])) {
      if (!w || !Array.isArray(w.from) || !Array.isArray(w.to)) continue;
      const t = idMap[w.to[0]];
      if (!t || !nodeById(w.from[0])) continue;
      S.graph.wires.push({ id: 'w' + (S.widc++), from: [w.from[0], w.from[1]], to: [t, w.to[1]] });
    }
    S.sel = new Set(newIds); S.selWire = null;
    updateSelection();
    refreshAllLiterals();
    drawWires();
    changed();
    const unknown = nodes.filter(n => n && n.type && !NODE_DEFS[n.type]).length;
    App.flash('added ' + newIds.length + ' node(s)' +
      (dropped ? ' · ' + dropped + ' wire(s) dropped' : '') +
      (unknown ? ' · ' + unknown + ' unknown type(s)' : ''));
    return idMap;
  }

  function isTypingTarget(t) {
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  }

  function bindClipboard() {
    document.addEventListener('copy', e => {
      if (isTypingTarget(e.target) || String(window.getSelection())) return;
      const frag = copySelection();
      if (!frag) return;
      e.clipboardData.setData('text/plain', JSON.stringify(frag, null, 1));
      e.preventDefault();
      App.flash(frag.nodes.length + ' node(s) copied — paste here or into any chat');
    });
    document.addEventListener('cut', e => {
      if (isTypingTarget(e.target) || String(window.getSelection())) return;
      const frag = copySelection();
      if (!frag) return;
      e.clipboardData.setData('text/plain', JSON.stringify(frag, null, 1));
      e.preventDefault();
      deleteSelection();
    });
    document.addEventListener('paste', e => {
      if (isTypingTarget(e.target)) return;
      const text = e.clipboardData.getData('text/plain');
      let data = null;
      try { data = JSON.parse(text); } catch (err) { return; }
      if (pasteFragment(data)) e.preventDefault();
    });
  }

  /* ------------------------------ clusters ------------------------------
   * Collapse: the selected subgraph moves into one cluster node's values.graph;
   * every wire that crossed the selection edge becomes a promoted port, marked
   * inside by a Port In / Port Out node. Expand reverses it. The engine knows
   * nothing about any of this — a cluster is just a node whose compute runs its
   * inner graph (see meta/cluster in nodes.js). Nesting falls out for free.
   */

  function cleanNodeCopy(n) {
    const o = { id: n.id, type: n.type, x: n.x, y: n.y, values: JSON.parse(JSON.stringify(n.values || {})) };
    if (n.enabled === false) o.enabled = false;
    if (n.preview === false) o.preview = false;
    return o;
  }

  function collapseSelection() {
    if (S.sel.size < 2) { App.flash('select at least two nodes to collapse'); return; }
    const ids = new Set(S.sel);
    const inner = S.graph.nodes.filter(n => ids.has(n.id)).map(cleanNodeCopy);
    const innerWires = S.graph.wires.filter(w => ids.has(w.from[0]) && ids.has(w.to[0]))
      .map(w => ({ from: w.from.slice(), to: w.to.slice() }));
    const inWs = S.graph.wires.filter(w => !ids.has(w.from[0]) && ids.has(w.to[0]));
    const outWs = S.graph.wires.filter(w => ids.has(w.from[0]) && !ids.has(w.to[0]));

    const portTypeIn = (nid, port) => { const n = nodeById(nid); const p = n && insOf(n).find(i => i.name === port); return p ? p.type : 'any'; };
    const portTypeOut = (nid, port) => { const n = nodeById(nid); const p = n && outsOf(n).find(o => o.name === port); return p ? p.type : 'any'; };
    const mkNamer = () => { const used = new Set(); return base => { let nm = base, k = 2; while (used.has(nm)) nm = base + (k++); used.add(nm); return nm; }; };

    // promoted inputs: one port per inner (node, input) that an outside wire reaches
    const nameIn = mkNamer(), nameOut = mkNamer();
    const insMap = new Map(), clusterIns = [], portNodes = [];
    for (const w of inWs) {
      const key = w.to[0] + ':' + w.to[1];
      if (insMap.has(key)) continue;
      const tn = nodeById(w.to[0]);
      const name = nameIn(w.to[1]);
      insMap.set(key, name);
      clusterIns.push({ name, type: portTypeIn(w.to[0], w.to[1]) });
      const pn = { id: 'pin_' + name, type: 'meta/portin', x: tn.x - 170, y: tn.y, values: { port: name } };
      portNodes.push(pn);
      innerWires.push({ from: [pn.id, 'V'], to: [w.to[0], w.to[1]] });
    }
    // promoted outputs: one port per inner (node, output) that feeds outside
    const outsMap = new Map(), clusterOuts = [];
    for (const w of outWs) {
      const key = w.from[0] + ':' + w.from[1];
      if (outsMap.has(key)) continue;
      const fn = nodeById(w.from[0]);
      const name = nameOut(w.from[1]);
      outsMap.set(key, name);
      clusterOuts.push({ name, type: portTypeOut(w.from[0], w.from[1]) });
      const el = S.els.get(w.from[0]);
      const pn = { id: 'pout_' + name, type: 'meta/portout', x: fn.x + (el ? el.offsetWidth : 140) + 60, y: fn.y, values: { port: name } };
      portNodes.push(pn);
      innerWires.push({ from: [w.from[0], w.from[1]], to: [pn.id, 'V'] });
    }

    // normalize inner coordinates
    const allInner = inner.concat(portNodes);
    let mx = Infinity, my = Infinity;
    for (const n of allInner) { mx = Math.min(mx, n.x); my = Math.min(my, n.y); }
    for (const n of allInner) { n.x = Math.round(n.x - mx + 60); n.y = Math.round(n.y - my + 60); }

    // the cluster node sits where the selection's top-left was
    const cn = {
      id: nextId(), type: 'meta/cluster', x: Math.round(mx), y: Math.round(my),
      values: {
        title: 'cluster', ins: clusterIns, outs: clusterOuts,
        graph: { nodes: allInner, wires: innerWires }
      }
    };

    // swap: selection out, cluster in, crossing wires rerouted to its ports
    S.graph.wires = S.graph.wires.filter(w => !ids.has(w.from[0]) && !ids.has(w.to[0]));
    S.graph.nodes = S.graph.nodes.filter(n => !ids.has(n.id));
    for (const id of ids) {
      const el = S.els.get(id);
      if (el) el.remove();
      S.els.delete(id); S.lastErr.delete(id);
    }
    S.graph.nodes.push(cn);
    buildNode(cn);
    for (const w of inWs) S.graph.wires.push({ id: 'w' + (S.widc++), from: w.from.slice(), to: [cn.id, insMap.get(w.to[0] + ':' + w.to[1])] });
    for (const w of outWs) S.graph.wires.push({ id: 'w' + (S.widc++), from: [cn.id, outsMap.get(w.from[0] + ':' + w.from[1])], to: w.to.slice() });

    selectOnly(cn.id);
    refreshAllLiterals();
    drawWires();
    changed();
    App.flash('collapsed ' + inner.length + ' nodes into a cluster — double-click the name to rename');
  }

  function expandCluster(id) {
    const cn = nodeById(id);
    if (!cn || cn.type !== 'meta/cluster') return;
    const v = cn.values || {};
    const g = v.graph || { nodes: [], wires: [] };
    const innerNodes = (g.nodes || []).filter(n => n.type !== 'meta/portin' && n.type !== 'meta/portout');
    const portIn = {}, portOut = {};
    for (const n of g.nodes || []) {
      if (n.type === 'meta/portin') portIn[n.id] = n.values && n.values.port;
      if (n.type === 'meta/portout') portOut[n.id] = n.values && n.values.port;
    }

    // re-base inner coords at the cluster's position
    let mx = Infinity, my = Infinity;
    for (const n of innerNodes) { mx = Math.min(mx, n.x || 0); my = Math.min(my, n.y || 0); }
    if (!isFinite(mx)) { mx = 0; my = 0; }

    const idMap = {}, newIds = [];
    for (const src of innerNodes) {
      const n = cleanNodeCopy(src);
      n.id = nextId();
      n.x = Math.round(cn.x + (src.x || 0) - mx);
      n.y = Math.round(cn.y + (src.y || 0) - my);
      idMap[src.id] = n.id;
      S.graph.nodes.push(n);
      buildNode(n);
      newIds.push(n.id);
    }
    const insFan = {}, outSrc = {};
    for (const w of g.wires || []) {
      if (!w || !Array.isArray(w.from) || !Array.isArray(w.to)) continue;
      if (portIn[w.from[0]] !== undefined) {
        const p = portIn[w.from[0]];
        (insFan[p] = insFan[p] || []).push([idMap[w.to[0]], w.to[1]]);
      } else if (portOut[w.to[0]] !== undefined) {
        const p = portOut[w.to[0]];
        (outSrc[p] = outSrc[p] || []).push([idMap[w.from[0]], w.from[1]]);
      } else if (idMap[w.from[0]] && idMap[w.to[0]]) {
        S.graph.wires.push({ id: 'w' + (S.widc++), from: [idMap[w.from[0]], w.from[1]], to: [idMap[w.to[0]], w.to[1]] });
      }
    }
    // reroute the outside wires the cluster's ports carried
    const outerIn = S.graph.wires.filter(w => w.to[0] === cn.id);
    const outerOut = S.graph.wires.filter(w => w.from[0] === cn.id);
    S.graph.wires = S.graph.wires.filter(w => w.from[0] !== cn.id && w.to[0] !== cn.id);
    for (const w of outerIn) for (const t of insFan[w.to[1]] || []) {
      if (t[0]) S.graph.wires.push({ id: 'w' + (S.widc++), from: w.from.slice(), to: t.slice() });
    }
    for (const w of outerOut) for (const s of outSrc[w.from[1]] || []) {
      if (s[0]) S.graph.wires.push({ id: 'w' + (S.widc++), from: s.slice(), to: w.to.slice() });
    }
    const i = S.graph.nodes.findIndex(n => n.id === cn.id);
    if (i >= 0) S.graph.nodes.splice(i, 1);
    const el = S.els.get(cn.id);
    if (el) el.remove();
    S.els.delete(cn.id); S.lastErr.delete(cn.id);

    S.sel = new Set(newIds); S.selWire = null;
    updateSelection();
    refreshAllLiterals();
    drawWires();
    changed();
    App.flash('cluster expanded — ' + newIds.length + ' node(s)');
  }

  /* ------------------------------ zoom to fit ------------------------------ */

  function zoomToFit(onlySelection) {
    const nodes = S.graph.nodes.filter(n => !onlySelection || S.sel.has(n.id));
    if (!nodes.length) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of nodes) {
      const el = S.els.get(n.id);
      x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y);
      x1 = Math.max(x1, n.x + (el ? el.offsetWidth : 140));
      y1 = Math.max(y1, n.y + (el ? el.offsetHeight : 90));
    }
    const r = editorEl.getBoundingClientRect();
    const m = 70;
    S.zoom = LM.clamp(Math.min((r.width - m * 2) / Math.max(1, x1 - x0), (r.height - m * 2) / Math.max(1, y1 - y0), 1.1), 0.08, 2.5);
    S.pan.x = r.width / 2 - (x0 + x1) / 2 * S.zoom;
    S.pan.y = r.height / 2 - (y0 + y1) / 2 * S.zoom;
    applyTransform();
    drawWires();
  }

  /* ------------------------------ context menu ------------------------------ */

  function openCtx(e, nodeId) {
    const n = nodeById(nodeId);
    if (!n) return;
    const def = defOf(n);
    const r = editorEl.getBoundingClientRect();
    ctxEl.classList.remove('hidden');
    ctxEl.style.left = (e.clientX - r.left) + 'px';
    ctxEl.style.top = (e.clientY - r.top) + 'px';
    const many = S.sel.has(nodeId) && S.sel.size > 1;
    ctxEl.innerHTML = `
      <div class="ctx-item" data-act="dup">Duplicate${many ? ' (' + S.sel.size + ')' : ''}</div>
      ${many ? `<div class="ctx-item" data-act="collapse">Collapse to cluster (${S.sel.size})</div>` : ''}
      ${n.type === 'meta/cluster' ? `<div class="ctx-item" data-act="expand">Expand cluster</div>` : ''}
      <div class="ctx-item" data-act="able">${n.enabled === false ? 'Enable' : 'Disable (pass through)'}</div>
      ${previewCapable(def, n) ? `<div class="ctx-item" data-act="prev">${n.preview === false ? 'Preview on' : 'Preview off'}</div>` : ''}
      <div class="ctx-item danger" data-act="del">Delete${many ? ' (' + S.sel.size + ')' : ''}</div>`;
    ctxEl.onpointerdown = ev => {
      ev.stopPropagation();
      const act = ev.target.dataset && ev.target.dataset.act;
      if (act === 'dup') {
        if (!S.sel.has(nodeId)) selectOnly(nodeId);
        duplicateSelection();
      }
      if (act === 'collapse') collapseSelection();
      if (act === 'expand') expandCluster(nodeId);
      if (act === 'able') {
        n.enabled = n.enabled === false ? true : false;
        const el = S.els.get(nodeId);
        if (el) el.classList.toggle('disabled', n.enabled === false);
        changed();
      }
      if (act === 'prev') {
        n.preview = n.preview === false ? true : false;
        const el = S.els.get(nodeId);
        if (el) el.classList.toggle('no-prev', n.preview === false);
        changed();
      }
      if (act === 'del') {
        if (S.sel.has(nodeId)) deleteSelection();
        else { removeNode(nodeId); changed(); }
      }
      closeCtx();
    };
  }

  function closeCtx() { ctxEl.classList.add('hidden'); ctxEl.onpointerdown = null; }

  /* ------------------------------ public ------------------------------ */

  return {
    init(onChange) {
      S.onChange = onChange;
      editorEl = document.getElementById('editor');
      worldEl = document.getElementById('world');
      nodesEl = document.getElementById('nodes');
      svgEl = document.getElementById('wires');
      qaEl = document.getElementById('quickAdd');
      qaInput = qaEl.querySelector('input');
      qaList = qaEl.querySelector('.qa-list');
      ctxEl = document.getElementById('ctxMenu');

      editorEl.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      editorEl.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('keydown', onKeyDown);

      editorEl.addEventListener('dblclick', e => {
        if (e.target.closest('.node, #quickAdd, #ctxMenu, #typeKey')) return;
        openQA(e);
      });
      // right-click behavior lives in pointerdown/up (clean click = menu, drag = pan)
      editorEl.addEventListener('contextmenu', e => e.preventDefault());
      bindQA();
      bindClipboard();
      applyTransform();
    },

    setGraph(g) {
      S.graph = g;
      S.sel.clear(); S.selWire = null; S.lastErr.clear();
      S.idc = 1; S.widc = 1;
      for (const n of g.nodes) {
        const m = /^n(\d+)$/.exec(n.id);
        if (m) S.idc = Math.max(S.idc, +m[1] + 1);
        n.values = n.values || {};
      }
      for (const w of g.wires) {
        if (!w.id) w.id = 'w' + (S.widc++);
        else { const m = /^w(\d+)$/.exec(w.id); if (m) S.widc = Math.max(S.widc, +m[1] + 1); }
      }
      nodesEl.innerHTML = '';
      S.els.clear();
      for (const n of g.nodes) buildNode(n);
      refreshAllLiterals();
      drawWiresNow();
    },

    addAtCenter(type) {
      const c = worldCenter();
      const n = addNode(type, c.x - 80 + Math.random() * 40, c.y - 40 + Math.random() * 40);
      if (n) selectOnly(n.id);
      return n;
    },

    selectAll() {
      S.sel = new Set(S.graph.nodes.map(n => n.id));
      S.selWire = null;
      updateSelection();
    },

    pasteFragment,
    copySelection,

    postEval(ctx) {
      const now = performance.now();
      const readouts = now - (S._lastRead || 0) > 150;
      if (readouts) S._lastRead = now;
      for (const n of S.graph.nodes) {
        const el = S.els.get(n.id);
        if (!el) continue;
        const err = ctx.errors[n.id] || '';
        if (S.lastErr.get(n.id) !== err) {
          S.lastErr.set(n.id, err);
          el.classList.toggle('error', !!err);
          if (err) el.title = err; else el.removeAttribute('title');
        }
        const def = defOf(n);
        if (def && def.postEval) def.postEval(n, el, ctx);
        if (readouts && def) {
          const outs = ctx.out[n.id] || {};
          el.querySelectorAll('.row.out .rd').forEach(rd => {
            const L = outs[rd.dataset.port] || [];
            const s = L.length ? LM.fmt(L[0]) + (L.length > 1 ? ' ×' + L.length : '') : '';
            if (rd._s !== s) { rd._s = s; rd.textContent = s; rd.title = s; }
          });
        }
      }
    },

    selectedIds() { return S.sel; },

    addAt(type, clientX, clientY) {
      const wp = worldPos({ clientX, clientY });
      const n = addNode(type, wp.x - 20, wp.y - 14);
      if (n) selectOnly(n.id);
      return n;
    },

    deleteSelection,
    duplicateSelection,
    collapseSelection,
    zoomToFit,

    get graph() { return S.graph; }
  };
})();
