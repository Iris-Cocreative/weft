'use strict';
/* Weft node editor — pan/zoom world, DOM nodes, SVG wires. */
const Editor = (() => {

  const S = {
    graph: { nodes: [], wires: [] },
    pan: { x: 60, y: 40 }, zoom: 1,
    sel: new Set(), selWire: null, selNote: null,
    wirePaths: new Map(),    // wireId -> svg path (live-color tint)
    wireTint: new Map(),     // wireId -> last seen hex — survives wire rebuilds (node drags)
    lastWireClick: null,     // {id,t,x,y} — manual dblclick detection across SVG rebuilds
    idc: 1, widc: 1, tidc: 1, gidc: 1,
    els: new Map(),          // nodeId -> element
    noteEls: new Map(),      // noteId -> element
    frameEls: new Map(),     // groupId -> element
    lastErr: new Map(),
    onChange: () => {},
    drag: null, hotPort: null,
    wireRaf: false,
    /* touch: live fingers on the loom, the pinch they make, the long-press
     * timer, the last tap (double-tap detection) and a count of the browser's
     * own dblclicks so a synthesized one never doubles a native one */
    touches: new Map(), pinch: null, lp: null, lastTap: null, nativeDbl: 0
  };

  let editorEl, worldEl, nodesEl, svgEl, framesEl, notesLayerEl, qaEl, qaInput, qaList, ctxEl, marqueeEl = null;

  /* ------------------------------ helpers ------------------------------ */

  const nodeById = id => S.graph.nodes.find(n => n.id === id);
  const defOf = n => NODE_DEFS[n.type];
  /* dynamic defs (clusters) keep their ports on the node, not the def */
  const insOf = n => { const d = defOf(n); return d ? ((d.dynamic && n.values && n.values.ins) || d.inputs || []) : []; };
  const outsOf = n => { const d = defOf(n); return d ? ((d.dynamic && n.values && n.values.outs) || d.outputs || []) : []; };
  const previewCapable = (def, n) => !!def && def.cat !== 'Display' && !def.relay &&
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
    // group membership follows the node out; a frame with no members goes too
    for (const f of (S.graph.groups || []).slice()) {
      const gi = f.nodes.indexOf(id);
      if (gi >= 0) f.nodes.splice(gi, 1);
      if (!f.nodes.length) {
        const fe = S.frameEls.get(f.id);
        if (fe) fe.remove();
        S.frameEls.delete(f.id);
        S.graph.groups.splice(S.graph.groups.indexOf(f), 1);
      }
    }
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

  function connect(fromId, fromPort, toId, toPort, replace) {
    if (wouldCycle(fromId, toId)) { App.flash('that connection would create a cycle'); return false; }
    // GH semantics: a dropped wire replaces whatever the input held; shift-drop
    // stacks instead (lists concatenate). Exact duplicates are refused when stacking.
    if (!replace && S.graph.wires.some(w => w.from[0] === fromId && w.from[1] === fromPort && w.to[0] === toId && w.to[1] === toPort)) return false;
    if (replace) S.graph.wires = S.graph.wires.filter(w => !(w.to[0] === toId && w.to[1] === toPort));
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
    if (def.relay) {
      el.classList.add('relay');
      // double-click a relay to dissolve it — the wire it carried heals
      el.addEventListener('dblclick', e => { e.stopPropagation(); dissolveRelay(n.id); });
      el.title = 'relay — double-click to dissolve (the wire heals)';
    }
    if (def.dynamic) el.classList.add('cluster');
    if (def.id === 'params/anchor') el.classList.add('is-anchor');
    if (n.collapsed) applyCollapsed(el, n, true);

    if (!def.bare && !def.relay) {
      const head = document.createElement('div');
      head.className = 'node-head';
      const icon = weftIconSVG(def.id, def.cat);
      // label precedence: user label > cluster title (values.title — a reserved
      // port name, so node-level label avoids the collision) > def title
      const title = n.label || (def.dynamic && n.values && n.values.title) || def.title;
      head.innerHTML = `<span class="icon">${icon || '<span class="dot"></span>'}</span><span class="title">${title}</span><span class="head-gap"></span>`;
      const hoverTitle = () => n.label ? def.title + (def.desc ? ' — ' + def.desc : '')
        : def.dynamic ? 'double-click the name to rename' : (def.desc || '');
      head.title = hoverTitle();
      {
        // every node renames the way clusters always have: double-click the
        // name, commit on blur/Enter, Escape restores. Clusters keep writing
        // values.title; everything else writes n.label (cleared when the name
        // is typed back to the def title).
        const tEl = head.querySelector('.title');
        const current = () => n.label || (def.dynamic && n.values && n.values.title) || def.title;
        tEl.addEventListener('dblclick', e => {
          e.stopPropagation();
          tEl.contentEditable = 'true';
          tEl.focus();
          document.getSelection().selectAllChildren(tEl);
          const commit = () => {
            tEl.contentEditable = 'false';
            const t = tEl.textContent.trim() || def.title;
            tEl.textContent = t;
            if (def.dynamic) {
              if (n.values.title !== t) { n.values.title = t; changed(); }
            } else {
              const label = t === def.title ? undefined : t;
              if (n.label !== label) {
                if (label) n.label = label; else delete n.label;
                head.title = hoverTitle();
                changed();
              }
            }
          };
          tEl.addEventListener('blur', commit, { once: true });
          tEl.addEventListener('keydown', ev => {
            if (ev.key === 'Enter') { ev.preventDefault(); tEl.blur(); }
            if (ev.key === 'Escape') { tEl.textContent = current(); tEl.blur(); }
          });
        });
      }
      // double-click the head folds the card to icon + gradient + ports (great
      // for Param nodes bundling wires); double-click again unfolds
      head.addEventListener('dblclick', e => {
        if (e.target.closest('.prev-toggle')) return;
        if (e.target.isContentEditable) return;
        e.stopPropagation();
        toggleCollapsed(n.id);
      });
      if (previewCapable(def, n)) {
        const pt = document.createElement('span');
        pt.className = 'prev-toggle';
        pt.title = def.id === 'params/anchor' ? 'toggle the anchor handle on the cloth' : 'toggle geometry preview';
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

  /* collapsed = icon + gradient + ports only (double-click the head) */
  function applyCollapsed(el, n, on) {
    el.classList.toggle('collapsed', on);
    const def = defOf(n);
    el.style.width = on ? '' : (def && def.width ? def.width + 'px' : '');
    el.style.minHeight = on ? Math.max(46, Math.max(insOf(n).length, outsOf(n).length) * 17 + 14) + 'px' : '';
  }

  function toggleCollapsed(id) {
    const n = nodeById(id);
    const def = n && defOf(n);
    if (!def || def.bare || def.relay) return;
    if (n.collapsed) delete n.collapsed; else n.collapsed = true;
    const el = S.els.get(id);
    if (el) applyCollapsed(el, n, !!n.collapsed);
    drawWires();
    changed();
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
      const chip = document.createElement('span');
      chip.className = 'lit-swatch';
      const paintChip = c => {
        chip.style.background = LM.colorToHex(c);
        chip.style.opacity = c.a === undefined ? 1 : Math.max(0.2, c.a);
        chip.title = LM.colorToHex(c) + ((c.a !== undefined && c.a !== 1) ? ' · ' + c.a : '');
      };
      paintChip(cur() || { r: 255, g: 255, b: 255, a: 1 });
      chip.addEventListener('pointerdown', e => {
        e.stopPropagation();
        pickColor(chip, cur() || { r: 255, g: 255, b: 255, a: 1 }, c => { paintChip(c); set(c); });
      });
      holder.appendChild(chip);
    } else if (inp.type === 'point' || inp.type === 'vector' || inp.type === 'point3') {
      /* one narrow field per component — point3 just has a third, so the branch
         is written per-component rather than per-type */
      const keys = inp.type === 'point3' ? ['x', 'y', 'z'] : ['x', 'y'];
      const p = cur() || { x: 0, y: 0, z: 0 };
      const fields = keys.map(k => {
        const i = document.createElement('input');
        i.type = 'number'; i.step = 'any';
        i.className = keys.length > 2 ? 'pt pt3' : 'pt';
        i.value = p[k] || 0; i.title = k;
        return i;
      });
      const upd = () => {
        const v = {};
        keys.forEach((k, n) => { v[k] = parseFloat(fields[n].value) || 0; });
        set(v);
      };
      for (const f of fields) { f.addEventListener('change', upd); holder.appendChild(f); }
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
    // Tangents stay horizontal: a port is a dot on a vertical edge, so the
    // boundary normal is horizontal and a wire leaving at an angle reads as
    // unplugged. With horizontal handles y(t) is monotone, so a wire can
    // never loop — the handle length is purely about shape:
    //  - forward wires keep the classic Δx/2, but never less than 0.3 of the
    //    chord, so two stacked nodes get a smooth bow instead of a 40px stub
    //    and a vertical drop;
    //  - backward wires (input left of output) cap the handles, so the loop
    //    they have to make stays one size instead of swelling with distance.
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const chord = Math.hypot(dx, dy);
    let L = Math.max(24, Math.abs(dx) * 0.5, chord * 0.3);
    if (dx < 0) L = Math.min(L, 200);
    return `M ${p1.x} ${p1.y} C ${p1.x + L} ${p1.y}, ${p2.x - L} ${p2.y}, ${p2.x} ${p2.y}`;
  }

  function outputTypeColor(from, depth) {
    const n = nodeById(from[0]);
    const d = n && defOf(n);
    // relays are transparent: their wires (and ports) take the color of
    // whatever feeds them; a disconnected relay speaks 'any'
    if (d && d.relay) return (depth || 0) > 32 ? TYPE_COLORS.any : relayColor(n.id, (depth || 0) + 1);
    const o = n && outsOf(n).find(o => o.name === from[1]);
    return o ? (TYPE_COLORS[o.type] || '#999') : '#999';
  }

  function relayColor(nodeId, depth) {
    const w = S.graph.wires.find(w => w.to[0] === nodeId);
    return w ? outputTypeColor(w.from, depth || 0) : TYPE_COLORS.any;
  }

  function paintRelayPorts() {
    for (const n of S.graph.nodes) {
      const d = defOf(n);
      if (!d || !d.relay) continue;
      const el = S.els.get(n.id);
      if (!el) continue;
      const c = relayColor(n.id, 0);
      el.querySelectorAll('.port').forEach(p => p.style.setProperty('--t', c));
    }
  }

  /* double-click a wire → splice a relay onto it (input wire + output wire) */
  function insertRelayOnWire(w, wp) {
    const from = w.from.slice(), to = w.to.slice();
    removeWire(w.id);
    const n = addNode('params/relay', Math.round(wp.x - 19), Math.round(wp.y - 11));
    if (!n) return;
    connect(from[0], from[1], n.id, 'V');
    connect(n.id, 'V', to[0], to[1]);
    selectOnly(n.id);
  }

  /* the inverse of insertRelayOnWire: dissolving a relay heals the connection
   * it carried — its source rewires to every destination it fed. Reached by
   * double-clicking the relay, or by deleting it. */
  function dissolveRelay(id) {
    const n = nodeById(id);
    const def = n && defOf(n);
    if (!def || !def.relay) return false;
    const inW = S.graph.wires.find(w => w.to[0] === id);
    const src = inW && inW.from.slice();
    const outs = S.graph.wires.filter(w => w.from[0] === id).map(w => w.to.slice());
    removeNode(id);
    let bridged = false;
    if (src) for (const t of outs) {
      if (nodeById(t[0]) && connect(src[0], src[1], t[0], t[1])) bridged = true;
    }
    if (!bridged) changed(); // connect() records history itself
    return true;
  }

  function drawWires() {
    if (S.wireRaf) return;
    S.wireRaf = true;
    requestAnimationFrame(() => { S.wireRaf = false; drawWiresNow(); });
  }

  function drawWiresNow() {
    const NS = 'http://www.w3.org/2000/svg';
    svgEl.innerHTML = '';
    S.wirePaths.clear();
    // dead-branch dimming: alive = reaches an export sink or an inspector
    // (def.inspect — Panel / Graph Data / Time Graph live through postEval).
    // Recomputed here because every topology mutation funnels through
    // drawWires(); the walk is O(nodes + wires), cheap even mid-drag.
    const alive = LM.sinkReachable(S.graph, NODE_DEFS, (n, d) => !!d.inspect);
    for (const [id, el] of S.els) el.classList.toggle('dead', !alive.has(id));
    paintArmed();
    const liveTint = typeof App !== 'undefined' && App.setting && App.setting('live-colour-wires', true);
    for (const w of S.graph.wires) {
      // folded groups: wires between two members vanish with them; wires
      // crossing the boundary terminate on the frame edge
      const hf = hiddenBy(w.from[0]), ht = hiddenBy(w.to[0]);
      if (hf && hf === ht) continue;
      const p1 = hf ? frameEdge(hf, 'out') : portPos(w.from[0], 'out', w.from[1]);
      const p2 = ht ? frameEdge(ht, 'in') : portPos(w.to[0], 'in', w.to[1]);
      const d = wirePath(p1, p2);

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'wire' + (S.selWire === w.id ? ' selected' : '') + (alive.has(w.to[0]) ? '' : ' dead'));
      path.setAttribute('stroke', (liveTint && S.wireTint.get(w.id)) || outputTypeColor(w.from));
      S.wirePaths.set(w.id, path); // addressable for the live-color tint
      svgEl.appendChild(path);

      const hit = document.createElementNS(NS, 'path');
      hit.setAttribute('d', d);
      hit.setAttribute('class', 'wire-hit');
      // seeing the wire respond is what makes "double-click for a relay"
      // discoverable — the 2px stroke alone reads as unclickable
      hit.addEventListener('pointerenter', () => path.classList.add('hover'));
      hit.addEventListener('pointerleave', () => path.classList.remove('hover'));
      hit.addEventListener('pointerdown', e => {
        e.stopPropagation();
        e.preventDefault(); // a double-click must not start a page text selection
        // double-click detection by wire id, not by element: selecting the wire
        // rebuilds the SVG between the two clicks, so the second click lands on
        // a replacement path and a native dblclick can never fire here
        const now = performance.now(), lc = S.lastWireClick;
        if (lc && lc.id === w.id && now - lc.t < 450 && Math.hypot(e.clientX - lc.x, e.clientY - lc.y) < 8) {
          S.lastWireClick = null;
          insertRelayOnWire(w, worldPos(e));
          return;
        }
        S.lastWireClick = { id: w.id, t: now, x: e.clientX, y: e.clientY };
        S.selWire = w.id; S.sel.clear(); S.selNote = null;
        updateSelection(); drawWires();
      });
      svgEl.appendChild(hit);
    }
    paintRelayPorts();
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

  /* ------------------------------ notes & group frames ------------------------------
   * Canvas annotations (graph format 2). Notes are text on the canvas itself —
   * never evaluated, never exported. Groups are a titled frame drawn around an
   * explicit list of nodes: dragging the bar moves the members, folding hides
   * them (wires crossing the boundary terminate on the frame edge). A cluster
   * changes evaluation; a group changes only reading.
   */

  const noteById = id => (S.graph.notes || []).find(t => t.id === id);
  const groupById = id => (S.graph.groups || []).find(f => f.id === id);
  /* the collapsed group hiding this node, if any */
  const hiddenBy = nodeId => (S.graph.groups || []).find(f => f.collapsed && f.nodes.indexOf(nodeId) >= 0) || null;

  function nextNoteId() {
    while (noteById('t' + S.tidc)) S.tidc++;
    return 't' + (S.tidc++);
  }
  function nextGroupId() {
    while (groupById('g' + S.gidc)) S.gidc++;
    return 'g' + (S.gidc++);
  }

  function positionNote(el, t) {
    el.style.transform = `translate(${t.x}px, ${t.y}px)`;
    el.style.width = t.w + 'px';
    el.style.height = t.h + 'px';
  }

  function buildNote(t) {
    const el = document.createElement('div');
    el.className = 'cnote';
    el.dataset.id = t.id;
    const ta = document.createElement('textarea');
    ta.value = t.text || '';
    ta.spellcheck = false;
    ta.placeholder = 'write something…';
    const grip = document.createElement('div');
    grip.className = 'cnote-grip';
    el.appendChild(ta);
    el.appendChild(grip);
    /* click selects, double-click edits, click away saves — notes behave
     * like nodes (Delete removes a selected one; empty notes survive) */
    ta.addEventListener('blur', () => {
      ta.style.pointerEvents = '';
      el.classList.remove('editing');
      if (t.text !== ta.value) { t.text = ta.value; changed(); }
    });
    el.addEventListener('dblclick', e => {
      e.stopPropagation();
      editNote(t.id);
    });
    positionNote(el, t);
    notesLayerEl.appendChild(el);
    S.noteEls.set(t.id, el);
    return el;
  }

  function editNote(id) {
    const el = S.noteEls.get(id);
    if (!el) return;
    const ta = el.querySelector('textarea');
    el.classList.add('editing');
    ta.style.pointerEvents = 'auto';
    ta.focus();
  }

  function removeNote(id) {
    const el = S.noteEls.get(id);
    if (el) el.remove();
    S.noteEls.delete(id);
    if (S.selNote === id) S.selNote = null;
    const a = S.graph.notes || [];
    const i = a.findIndex(t => t.id === id);
    if (i >= 0) a.splice(i, 1);
  }

  function addNoteAt(x, y) {
    if (!S.graph.notes) S.graph.notes = [];
    const t = { id: nextNoteId(), x: Math.round(x), y: Math.round(y), w: 190, h: 110, text: '' };
    S.graph.notes.push(t);
    buildNote(t);
    editNote(t.id);
    changed();
    return t;
  }

  function positionFrame(el, f) {
    el.style.transform = `translate(${f.x}px, ${f.y}px)`;
    el.style.width = f.w + 'px';
    el.style.height = f.collapsed ? '' : f.h + 'px';
  }

  function buildFrame(f) {
    const el = document.createElement('div');
    el.className = 'gframe' + (f.collapsed ? ' folded' : '');
    el.dataset.id = f.id;
    const bar = document.createElement('div');
    bar.className = 'gframe-bar';
    const fold = document.createElement('span');
    fold.className = 'gf-fold';
    fold.textContent = f.collapsed ? '▸' : '▾';
    fold.title = 'fold the group away';
    const tEl = document.createElement('span');
    tEl.className = 'gf-title';
    tEl.textContent = f.title || 'group';
    const x = document.createElement('span');
    x.className = 'gf-x';
    x.textContent = '×';
    x.title = 'ungroup (the nodes stay)';
    bar.appendChild(fold); bar.appendChild(tEl); bar.appendChild(x);
    el.appendChild(bar);
    /* rename — the same gesture as every node head */
    tEl.addEventListener('dblclick', e => {
      e.stopPropagation();
      tEl.contentEditable = 'true';
      tEl.focus();
      document.getSelection().selectAllChildren(tEl);
      const commit = () => {
        tEl.contentEditable = 'false';
        const t = tEl.textContent.trim() || 'group';
        tEl.textContent = t;
        if (f.title !== t) { f.title = t; changed(); }
      };
      tEl.addEventListener('blur', commit, { once: true });
      tEl.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') { ev.preventDefault(); tEl.blur(); }
        if (ev.key === 'Escape') { tEl.textContent = f.title || 'group'; tEl.blur(); }
      });
    });
    positionFrame(el, f);
    framesEl.appendChild(el);
    S.frameEls.set(f.id, el);
    return el;
  }

  /* hide/show a node per current group folding (a node may sit in two frames) */
  function applyHiding(nodeId) {
    const el = S.els.get(nodeId);
    if (el) el.style.display = hiddenBy(nodeId) ? 'none' : '';
  }

  function setFold(id, on) {
    const f = groupById(id);
    if (!f) return;
    if (on) f.collapsed = true; else delete f.collapsed;
    const el = S.frameEls.get(id);
    if (el) {
      el.classList.toggle('folded', !!on);
      el.querySelector('.gf-fold').textContent = on ? '▸' : '▾';
      positionFrame(el, f);
    }
    for (const nid of f.nodes) applyHiding(nid);
    drawWires();
    changed();
  }

  function ungroup(id) {
    const f = groupById(id);
    if (!f) return;
    const el = S.frameEls.get(id);
    if (el) el.remove();
    S.frameEls.delete(id);
    const a = S.graph.groups || [];
    a.splice(a.indexOf(f), 1);
    for (const nid of f.nodes) applyHiding(nid);
    drawWires();
    changed();
  }

  function groupSelection() {
    if (!S.sel.size) { App.flash('select some nodes to group'); return; }
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const ids = [];
    for (const id of S.sel) {
      const n = nodeById(id), el = S.els.get(id);
      if (!n || !el) continue;
      ids.push(id);
      x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y);
      x1 = Math.max(x1, n.x + el.offsetWidth); y1 = Math.max(y1, n.y + el.offsetHeight);
    }
    if (!ids.length) return;
    if (!S.graph.groups) S.graph.groups = [];
    const f = {
      id: nextGroupId(),
      x: Math.round(x0 - 16), y: Math.round(y0 - 44),
      w: Math.round(x1 - x0 + 32), h: Math.round(y1 - y0 + 60),
      title: 'group', nodes: ids
    };
    S.graph.groups.push(f);
    buildFrame(f);
    changed();
    return f;
  }

  /* size every frame round its members' real cards — the assistant's ops
   * estimate frames headlessly, so they get trued up once the graph lands */
  function refitGroups() {
    for (const f of S.graph.groups || []) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const id of f.nodes) {
        const n = nodeById(id), el = S.els.get(id);
        if (!n || !el) continue;
        const w = el.offsetWidth || 172, h = el.offsetHeight || 60;
        x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y);
        x1 = Math.max(x1, n.x + w); y1 = Math.max(y1, n.y + h);
      }
      if (x0 === Infinity) continue;
      f.x = Math.round(x0 - 16); f.y = Math.round(y0 - 44);
      f.w = Math.round(x1 - x0 + 32); f.h = Math.round(y1 - y0 + 60);
      const el = S.frameEls.get(f.id);
      if (el) positionFrame(el, f);
    }
  }

  /* where a wire meets a folded frame: its edge, at bar height */
  function frameEdge(f, dir) {
    return { x: dir === 'out' ? f.x + f.w : f.x, y: f.y + 14 };
  }

  /* ------------------------------ color picker ------------------------------
   * One hand-rolled popover for every color in the app (port literals, the
   * Color Swatch): SV square + hue strip + alpha strip + hex + recents.
   * Mounted on document.body with position:fixed — transformed ancestors in
   * the node canvas can't skew it. No dependencies (invariant #7).
   */

  const _rgb2hsv = c => {
    const r = c.r / 255, g = c.g / 255, b = c.b / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d) {
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h, s: mx ? d / mx : 0, v: mx };
  };
  const _hsv2rgb = (h, s, v) => {
    const f = n => {
      const k = (n + h / 60) % 6;
      return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
    };
    return { r: f(5), g: f(3), b: f(1) };
  };

  let _cpEl = null, _cpCloser = null;

  function closePicker() {
    if (_cpEl) { _cpEl.remove(); _cpEl = null; }
    if (_cpCloser) { window.removeEventListener('pointerdown', _cpCloser, true); _cpCloser = null; }
  }

  function _recentColours() {
    try { return JSON.parse(localStorage.getItem('weft:recent-colours') || '[]'); } catch (e) { return []; }
  }
  function _pushRecent(c) {
    const hex = LM.colorToHex(c), a = c.a === undefined ? 1 : c.a;
    let list = _recentColours().filter(x => !(x.hex === hex && x.a === a));
    list.unshift({ hex, a });
    list = list.slice(0, 8);
    try { localStorage.setItem('weft:recent-colours', JSON.stringify(list)); } catch (e) {}
  }

  function pickColor(anchorEl, color, onChange) {
    closePicker();
    const cur = Object.assign({ r: 255, g: 255, b: 255, a: 1 }, color || {});
    let { h, s, v } = _rgb2hsv(cur);
    let a = cur.a === undefined ? 1 : cur.a;

    const pop = document.createElement('div');
    pop.className = 'cp';
    pop.innerHTML = `
      <div class="cp-sv"><div class="cp-dot"></div></div>
      <div class="cp-hue"><div class="cp-pin"></div></div>
      <div class="cp-alpha"><div class="cp-pin"></div></div>
      <div class="cp-row"><input class="cp-hex" spellcheck="false"><input class="cp-a" type="number" min="0" max="1" step="any" title="alpha"></div>
      <div class="cp-recent"></div>`;
    const sv = pop.querySelector('.cp-sv'), dot = pop.querySelector('.cp-dot');
    const hue = pop.querySelector('.cp-hue'), huePin = hue.querySelector('.cp-pin');
    const al = pop.querySelector('.cp-alpha'), alPin = al.querySelector('.cp-pin');
    const hex = pop.querySelector('.cp-hex'), aNum = pop.querySelector('.cp-a');
    const recent = pop.querySelector('.cp-recent');

    const rgb = () => Object.assign(_hsv2rgb(h, s, v), { a });
    const emit = () => onChange(rgb());
    const paint = () => {
      const base = _hsv2rgb(h, 1, 1);
      sv.style.background =
        `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, rgb(${base.r},${base.g},${base.b}))`;
      dot.style.left = (s * 100) + '%';
      dot.style.top = ((1 - v) * 100) + '%';
      huePin.style.left = (h / 360 * 100) + '%';
      alPin.style.left = (a * 100) + '%';
      const c = rgb();
      al.style.setProperty('--cp', `rgb(${c.r},${c.g},${c.b})`);
      if (document.activeElement !== hex) hex.value = LM.colorToHex(c);
      if (document.activeElement !== aNum) aNum.value = Math.round(a * 100) / 100;
    };

    const strip = (el, apply) => {
      el.addEventListener('pointerdown', e => {
        e.stopPropagation();
        e.preventDefault();
        const move = ev => {
          const r = el.getBoundingClientRect();
          apply(LM.clamp((ev.clientX - r.left) / (r.width || 1), 0, 1),
                LM.clamp((ev.clientY - r.top) / (r.height || 1), 0, 1));
          paint(); emit();
        };
        move(e);
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });
    };
    strip(sv, (x, y) => { s = x; v = 1 - y; });
    strip(hue, x => { h = x * 360; });
    strip(al, x => { a = Math.round(x * 100) / 100; });

    hex.addEventListener('change', () => {
      const c = LM.hexToColor(hex.value, a);
      if (c) { ({ h, s, v } = _rgb2hsv(c)); paint(); emit(); }
    });
    aNum.addEventListener('change', () => {
      a = LM.clamp(parseFloat(aNum.value) || 0, 0, 1);
      paint(); emit();
    });

    for (const rc of _recentColours()) {
      const b = document.createElement('span');
      b.className = 'cp-chip';
      b.style.background = rc.hex;
      b.style.opacity = rc.a === undefined ? 1 : Math.max(0.15, rc.a);
      b.title = rc.hex + (rc.a !== undefined && rc.a !== 1 ? ' · ' + rc.a : '');
      b.addEventListener('pointerdown', e => {
        e.stopPropagation();
        const c = LM.hexToColor(rc.hex, rc.a === undefined ? 1 : rc.a);
        ({ h, s, v } = _rgb2hsv(c));
        a = c.a;
        paint(); emit();
      });
      recent.appendChild(b);
    }

    document.body.appendChild(pop);
    const ar = anchorEl.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    pop.style.left = Math.round(LM.clamp(ar.left, 8, window.innerWidth - pw - 8)) + 'px';
    pop.style.top = Math.round(ar.bottom + 8 + ph > window.innerHeight
      ? Math.max(8, ar.top - ph - 8) : ar.bottom + 8) + 'px';
    paint();

    pop.addEventListener('keydown', e => { if (e.key === 'Escape' || e.key === 'Enter') closeCommit(); });
    const closeCommit = () => { _pushRecent(rgb()); closePicker(); };
    _cpCloser = ev => {
      const t = ev.target instanceof Node ? ev.target : null;
      if (t && (pop.contains(t) || anchorEl === t || anchorEl.contains(t))) return;
      closeCommit();
    };
    window.addEventListener('pointerdown', _cpCloser, true);
    _cpEl = pop;
  }

  /* ------------------------------ selection ------------------------------ */

  function selectOnly(id) {
    S.sel.clear(); S.sel.add(id); S.selWire = null; S.selNote = null;
    updateSelection();
  }

  function clearSel() {
    S.sel.clear(); S.selWire = null; S.selNote = null;
    updateSelection(); drawWires();
  }

  function updateSelection() {
    for (const [id, el] of S.els) el.classList.toggle('selected', S.sel.has(id));
    for (const [id, el] of S.noteEls) el.classList.toggle('selected', S.selNote === id);
  }

  function deleteSelection() {
    if (S.selNote) { removeNote(S.selNote); S.selNote = null; changed(); return; }
    if (S.selWire) { removeWire(S.selWire); return; }
    if (!S.sel.size) return;
    for (const id of [...S.sel]) {
      const n = nodeById(id);
      const def = n && defOf(n);
      // deleting a relay dissolves it — the connection it carried survives
      if (def && def.relay) dissolveRelay(id); else removeNode(id);
    }
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
    S.drag = {
      kind: 'wire', fixed, mx: wp.x, my: wp.y, detached,
      startEl: portEl,                                     // the port the finger pressed (a tap asks about it)
      origIn: detached ? { node: nodeId, port } : null,   // where a detached wire came off (a tap puts it back)
      sx: e.clientX, sy: e.clientY, moved: false,
      rects: e.pointerType === 'touch' ? portRects(fixed) : null // a finger snaps to the nearest port
    };
    drawWires();
  }

  /* ---- touch wiring ----
   * A fingertip covers the port it is aiming at, so on touch a wire snaps to
   * the nearest compatible port within SNAP px of the finger, not only to
   * the one under it. Candidates are measured once when the drag starts (the
   * loom cannot pan mid-wire), so the per-move search is a cheap scan. */
  const SNAP = 44;
  function portRects(fixed) {
    const out = [];
    for (const el of nodesEl.querySelectorAll('.port')) {
      if (el.dataset.dir === fixed.dir || el.dataset.node === fixed.node) continue;
      const r = el.getBoundingClientRect();
      if (!r.width) continue; // folded away
      out.push({ el, x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
    return out;
  }
  function nearestPort(rects, x, y) {
    let best = null, bd = SNAP;
    for (const p of rects) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bd) { bd = d; best = p.el; }
    }
    return best;
  }
  function portUnder(e, d) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    let portEl = target && target.closest && target.closest('.port');
    if (!portEl && d && d.rects) portEl = nearestPort(d.rects, e.clientX, e.clientY);
    return portEl;
  }

  /* a tapped port (touch has no hover) shows what the title would: label · type */
  let portTipEl = null, portTipTimer = null;
  function hidePortTip() {
    clearTimeout(portTipTimer);
    if (portTipEl) { portTipEl.remove(); portTipEl = null; }
  }
  function showPortTip(portEl, text, ms) {
    hidePortTip();
    const r = portEl.getBoundingClientRect(), er = editorEl.getBoundingClientRect();
    portTipEl = document.createElement('div');
    portTipEl.id = 'portTip';
    portTipEl.textContent = text || portEl.title || portEl.dataset.port;
    editorEl.appendChild(portTipEl);
    const w = portTipEl.offsetWidth;
    portTipEl.style.left = LM.clamp(r.left + r.width / 2 - er.left - w / 2, 6, er.width - w - 6) + 'px';
    portTipEl.style.top = (r.top - er.top - 34) + 'px';
    portTipTimer = setTimeout(hidePortTip, ms || 2400);
  }

  /* ---- wire mode (touch) ----
   * Dragging a wire across a long loom with one finger means the loom cannot
   * pan under it, and the far port is off the screen. So a tap on a port arms
   * it: the port pulses, the loom pans and pinches freely, and the next tap on
   * a port of the other side makes the wire (replacing what the input held,
   * as a dropped wire does). Tapping the armed port again, tapping empty
   * loom, Escape, or loading a graph disarms; tapping a port of the same side
   * re-arms on that one instead. Rebuilt cards lose the class, so drawWires
   * paints it back — every render funnels through there. */
  function armPort(el) {
    disarm();
    S.armed = { node: el.dataset.node, dir: el.dataset.dir, port: el.dataset.port };
    el.classList.add('armed');
    showPortTip(el, (el.title || el.dataset.port) + ' · now tap an ' + (el.dataset.dir === 'out' ? 'input' : 'output'), 4000);
  }
  function disarm() {
    if (!S.armed) return;
    S.armed = null;
    for (const el of nodesEl.querySelectorAll('.port.armed')) el.classList.remove('armed');
  }
  function paintArmed() {
    const a = S.armed;
    if (!a) return;
    if (!nodeById(a.node)) { disarm(); return; } // the card went away
    const el = nodesEl.querySelector(`.port[data-node="${a.node}"][data-dir="${a.dir}"][data-port="${a.port}"]`);
    if (el) el.classList.add('armed');
  }
  function tapPort(el) {
    const tap = { node: el.dataset.node, dir: el.dataset.dir, port: el.dataset.port };
    const a = S.armed;
    if (!a || !nodeById(a.node)) { armPort(el); return; }
    if (a.node === tap.node && a.dir === tap.dir && a.port === tap.port) { disarm(); hidePortTip(); return; }
    if (a.dir === tap.dir || a.node === tap.node) {
      if (a.node === tap.node) App.flash('a card can’t wire to itself');
      armPort(el); // the finger changed its mind
      return;
    }
    const out = a.dir === 'out' ? a : tap, inn = a.dir === 'in' ? a : tap;
    disarm(); hidePortTip();
    if (connect(out.node, out.port, inn.node, inn.port, true)) App.flash('wired ' + out.port + ' → ' + inn.port);
  }

  function completeWire(e) {
    const d = S.drag;
    const portEl = portUnder(e, d);
    const wasDetached = d.detached;
    const fixed = d.fixed;
    S.drag = null;
    if (S.hotPort) { S.hotPort.classList.remove('hot'); S.hotPort = null; }
    if (e.pointerType === 'touch' && !d.moved) {
      // a still finger on a port asked what it is, not for a wire — put back
      // anything the press lifted off and say what the port carries
      if (wasDetached && d.origIn) connect(fixed.node, fixed.port, d.origIn.node, d.origIn.port, false);
      drawWires();
      if (d.startEl && d.startEl.isConnected) tapPort(d.startEl);
      return;
    }
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
    if (!connect(out.node, out.port, inn.node, inn.port, !e.shiftKey)) {
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

  /* ------------------------------ touch ------------------------------
   * The mouse grammar (right-drag pans, left-drag box-selects, wheel zooms,
   * dblclick and right-click open things) has no finger equivalent, so a
   * touch pointer gets its own: one finger on empty loom pans, two fingers
   * pinch-zoom (about the fingers, like a map), a still finger held half a
   * second opens the card's menu or quick-add, and a double-tap stands in for
   * dblclick (folding a head, a slider's options). Cards, ports, notes and
   * frames keep the mouse path — a finger drags them exactly as a button
   * would. All of it keys off e.pointerType, so a stylus or a mouse on a
   * touch laptop still gets the desktop grammar. */
  function clearLP() { if (S.lp) { clearTimeout(S.lp); S.lp = null; } }

  function touchDown(e) {
    S.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (S.touches.size === 2) {
      // a second finger turns whatever the first was doing into a pinch
      cancelDrag();
      const [a, b] = [...S.touches.values()];
      S.pinch = {
        d0: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        mx0: (a.x + b.x) / 2, my0: (a.y + b.y) / 2,
        z0: S.zoom, px0: S.pan.x, py0: S.pan.y
      };
      return true;
    }
    if (S.touches.size > 2 || S.pinch) return true; // a third finger, or a pinch winding down: ignored
    const nodeEl = e.target.closest && e.target.closest('.node');
    const onCtl = e.target.closest && e.target.closest('input, textarea, select, button, [contenteditable], .port, .sl-track, .sl-grip-l, .sl-grip-r, .dial, .cp, .tg, .pbtn, .sw');
    if (!onCtl) {
      // long-press: the finger's right-click
      const cx = e.clientX, cy = e.clientY, id = nodeEl && nodeEl.dataset.id;
      S.lpX = cx; S.lpY = cy;
      S.lp = setTimeout(() => {
        S.lp = null;
        cancelDrag();
        if (id) { if (!S.sel.has(id)) selectOnly(id); openCtx({ clientX: cx, clientY: cy }, id); }
        else openQA({ clientX: cx, clientY: cy });
      }, 520);
    }
    if (nodeEl || (e.target.closest && e.target.closest('.port, .cnote, .gframe-bar'))) return false; // the mouse path drags these
    // one finger on empty loom pans (box-select stays a mouse gesture)
    closeQA();
    S.drag = { kind: 'pan', touch: true, sx: e.clientX, sy: e.clientY, ox: S.pan.x, oy: S.pan.y, moved: false };
    editorEl.classList.add('panning');
    return true;
  }

  function touchEnd(e) {
    S.touches.delete(e.pointerId);
    clearLP();
    if (S.pinch) { if (!S.touches.size) S.pinch = null; return true; } // a pinch ends when the last finger lifts
    return false;
  }

  function touchMove(e) {
    if (S.pinch && S.touches.has(e.pointerId)) {
      S.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (S.touches.size < 2) return true;
      const [a, b] = [...S.touches.values()];
      const p = S.pinch, r = editorEl.getBoundingClientRect();
      const z2 = LM.clamp(p.z0 * (Math.hypot(a.x - b.x, a.y - b.y) || 1) / p.d0, 0.08, 2.5);
      // the loom point that sat under the fingers' first midpoint rides along under their current one
      const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      S.pan.x = mx - (p.mx0 - r.left - p.px0) * (z2 / p.z0);
      S.pan.y = my - (p.my0 - r.top - p.py0) * (z2 / p.z0);
      S.zoom = z2;
      applyTransform();
      return true;
    }
    if (S.lp && Math.hypot(e.clientX - S.lpX, e.clientY - S.lpY) > 8) clearLP(); // a moving finger is a drag, not a press
    return false;
  }

  /* a second tap within 350ms and 24px is a double-tap. Browsers disagree on
   * whether a double-tap also fires dblclick, so wait a beat and only
   * synthesize one when no native dblclick arrived in the meantime. */
  function tapped(e) {
    const now = performance.now(), last = S.lastTap;
    S.lastTap = { t: now, x: e.clientX, y: e.clientY };
    if (!last || now - last.t > 350 || Math.hypot(e.clientX - last.x, e.clientY - last.y) > 24) return;
    S.lastTap = null;
    const x = e.clientX, y = e.clientY, seen = S.nativeDbl;
    const target = e.target instanceof Element ? e.target : document.elementFromPoint(x, y);
    setTimeout(() => {
      if (S.nativeDbl !== seen || !target || !target.isConnected) return;
      target.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window }));
    }, 80);
  }

  function onPointerDown(e) {
    closeCtx();
    hidePortTip();
    if (e.target.closest && e.target.closest('#quickAdd, #ctxMenu, #typeKey, #loomTools, #params')) return;
    if (e.pointerType === 'touch' && touchDown(e)) return;
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

    // notes & group frames sit behind the nodes, so anything that reached
    // them missed every node. Typing targets (an open note, a title being
    // renamed) keep their native behavior.
    if (e.target.closest && e.target.closest('.cnote textarea, [contenteditable="true"]')) return;
    const gripEl = e.target.closest && e.target.closest('.cnote-grip');
    if (gripEl) {
      const t = noteById(gripEl.parentElement.dataset.id);
      if (t) { e.preventDefault(); S.drag = { kind: 'noteresize', id: t.id, sx: e.clientX, sy: e.clientY, ow: t.w, oh: t.h }; return; }
    }
    const noteEl = e.target.closest && e.target.closest('.cnote');
    if (noteEl) {
      const t = noteById(noteEl.dataset.id);
      if (t) { e.preventDefault(); S.drag = { kind: 'note', id: t.id, sx: e.clientX, sy: e.clientY, ox: t.x, oy: t.y, moved: false }; return; }
    }
    const barEl = e.target.closest && e.target.closest('.gframe-bar');
    if (barEl) {
      const f = groupById(barEl.parentElement.dataset.id);
      if (f) {
        e.preventDefault();
        if (e.target.classList.contains('gf-fold')) { setFold(f.id, !f.collapsed); return; }
        if (e.target.classList.contains('gf-x')) { ungroup(f.id); return; }
        const members = f.nodes.map(id => nodeById(id)).filter(Boolean).map(n => ({ n, ox: n.x, oy: n.y }));
        S.drag = { kind: 'frame', id: f.id, sx: e.clientX, sy: e.clientY, ox: f.x, oy: f.y, members, moved: false };
        return;
      }
    }

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
    // merged view: ctrl+drag on the background pans the cloth camera
    if (Viewport.merged && e.ctrlKey) {
      e.preventDefault();
      S.drag = { kind: 'clothpan', lx: e.clientX, ly: e.clientY };
      return;
    }
    // merged view: a background press also reaches the cloth — grabbing an
    // anchor handle wins over the marquee; otherwise the design sees the click
    if (Viewport.merged && Viewport.forward && Viewport.forward.down(e) === 'anchor') return;
    const wp = worldPos(e);
    S.drag = {
      kind: 'marquee', x0: wp.x, y0: wp.y,
      base: e.shiftKey ? new Set(S.sel) : new Set()
    };
    marqueeEl = document.createElement('div');
    marqueeEl.id = 'marquee';
    editorEl.appendChild(marqueeEl);
  }

  /* A native modal — the screen-share picker, a file dialog, a permission
   * prompt — takes the pointer mid-gesture and swallows the pointerup that
   * would have ended it, leaving S.drag live and the marquee box stranded on
   * the loom. Drop the gesture instead of committing it to wherever the
   * cursor has wandered since; a detached wire counts as dropped on empty
   * space, exactly as completeWire treats a release over nothing. */
  function cancelDrag() {
    clearLP();
    if (!S.drag) return;
    const d = S.drag;
    S.drag = null;
    if (marqueeEl) { marqueeEl.remove(); marqueeEl = null; }
    if (S.hotPort) { S.hotPort.classList.remove('hot'); S.hotPort = null; }
    editorEl.classList.remove('panning');
    if (d.kind === 'noteresize' || (d.moved && (d.kind === 'node' || d.kind === 'note' || d.kind === 'frame'))) changed();
    else if (d.kind === 'wire' && d.detached) changed();
    drawWires();
  }

  function onPointerMove(e) {
    if (e.pointerType === 'touch' && touchMove(e)) return;
    if (!S.drag) return;
    // no button still held: the release happened where we could not see it
    if (e.buttons === 0) { cancelDrag(); return; }
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
      if ((w + h) * S.zoom > 3) d.moved = true;
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
        if (hiddenBy(n.id)) continue; // folded away — not marquee-selectable
        const nw = el.offsetWidth, nh = el.offsetHeight;
        const hit = crossing
          ? (n.x < x + w && n.x + nw > x && n.y < y + h && n.y + nh > y)
          : (n.x >= x && n.x + nw <= x + w && n.y >= y && n.y + nh <= y + h);
        if (hit) sel.add(n.id);
      }
      S.sel = sel; S.selWire = null;
      updateSelection();
    } else if (d.kind === 'note') {
      const t = noteById(d.id);
      if (t) {
        t.x = Math.round(d.ox + (e.clientX - d.sx) / S.zoom);
        t.y = Math.round(d.oy + (e.clientY - d.sy) / S.zoom);
        if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 3) d.moved = true;
        const el = S.noteEls.get(d.id);
        if (el) positionNote(el, t);
      }
    } else if (d.kind === 'noteresize') {
      const t = noteById(d.id);
      if (t) {
        t.w = Math.round(Math.max(110, d.ow + (e.clientX - d.sx) / S.zoom));
        t.h = Math.round(Math.max(60, d.oh + (e.clientY - d.sy) / S.zoom));
        const el = S.noteEls.get(d.id);
        if (el) positionNote(el, t);
      }
    } else if (d.kind === 'frame') {
      const f = groupById(d.id);
      if (f) {
        const dx = (e.clientX - d.sx) / S.zoom, dy = (e.clientY - d.sy) / S.zoom;
        if (Math.abs(dx) + Math.abs(dy) > 1) d.moved = true;
        f.x = Math.round(d.ox + dx); f.y = Math.round(d.oy + dy);
        const el = S.frameEls.get(d.id);
        if (el) positionFrame(el, f);
        for (const m of d.members) {
          m.n.x = Math.round(m.ox + dx);
          m.n.y = Math.round(m.oy + dy);
          const ne = S.els.get(m.n.id);
          if (ne) position(ne, m.n);
        }
        drawWires();
      }
    } else if (d.kind === 'clothpan') {
      Viewport.camPan(e.clientX - d.lx, e.clientY - d.ly);
      d.lx = e.clientX; d.ly = e.clientY;
    } else if (d.kind === 'rnode') {
      if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true;
    } else if (d.kind === 'wire') {
      const wp = worldPos(e);
      d.mx = wp.x; d.my = wp.y;
      if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) d.moved = true;
      const portEl = portUnder(e, d);
      if (S.hotPort && S.hotPort !== portEl) { S.hotPort.classList.remove('hot'); S.hotPort = null; }
      if (portEl && portEl.dataset.dir !== d.fixed.dir && portEl.dataset.node !== d.fixed.node) {
        portEl.classList.add('hot');
        S.hotPort = portEl;
        if (d.rects) { // snapped from a distance: show the wire landing where it will
          const pp = portPos(portEl.dataset.node, portEl.dataset.dir, portEl.dataset.port);
          d.mx = pp.x; d.my = pp.y;
        }
      }
      drawWires();
    }
  }

  function onPointerUp(e) {
    if (e.pointerType === 'touch') {
      const pinching = !!S.pinch;
      touchEnd(e);
      if (pinching) { S.drag = null; return; }
      if (S.drag && !S.drag.moved && S.drag.kind !== 'wire' && S.drag.kind !== 'marquee') tapped(e);
    }
    if (!S.drag) return;
    const d = S.drag;
    if (d.kind === 'wire') { completeWire(e); return; }
    if (d.kind === 'marquee') {
      if (marqueeEl) { marqueeEl.remove(); marqueeEl = null; }
      // a still click on empty space is a deselect (shift keeps the base selection) —
      // without this, selection only cleared when the pointer happened to move
      if (!d.moved) {
        S.sel = new Set(d.base); S.selWire = null; S.selNote = null;
        updateSelection(); drawWires();
      }
      S.drag = null;
      return;
    }
    if (d.kind === 'rnode') {
      S.drag = null;
      if (!d.moved) openCtx(e, d.id);
      return;
    }
    if (d.kind === 'note') {
      S.drag = null;
      if (!d.moved) {
        S.sel.clear(); S.selWire = null; S.selNote = d.id;
        updateSelection();
      } else changed();
      return;
    }
    if (d.kind === 'noteresize') { S.drag = null; changed(); return; }
    if (d.kind === 'frame') {
      S.drag = null;
      if (d.moved) changed();
      return;
    }
    S.drag = null;
    editorEl.classList.remove('panning');
    if (d.kind === 'node' && d.moved) changed();
    if (d.kind === 'pan' && d.rmb && !d.moved) openQA(e);
    if (d.kind === 'pan' && d.touch && !d.moved) {
      // a still finger on empty loom deselects, as a still click does — and
      // puts down an armed port
      disarm(); hidePortTip();
      S.sel.clear(); S.selWire = null; S.selNote = null;
      updateSelection(); drawWires();
    }
  }

  function onWheel(e) {
    e.preventDefault();
    // merged view: ctrl+wheel zooms the cloth camera (same gesture as over the
    // cloth in split view); shift+wheel scrubs the scroll simulator instead of
    // zooming (browsers report a shifted wheel as deltaX)
    if (Viewport.merged && e.ctrlKey) {
      Viewport.camZoomAt(e.clientX, e.clientY, e.deltaY);
      return;
    }
    if (Viewport.merged && e.shiftKey && Viewport.forward) {
      Viewport.forward.wheel(e.deltaY || e.deltaX);
      return;
    }
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
    else if (e.key === 'Escape') { closeQA(); closeCtx(); clearSel(); disarm(); hidePortTip(); }
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      duplicateSelection();
    }
    else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'g' || e.key === 'G')) {
      e.preventDefault();
      groupSelection();
    }
    else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'g' || e.key === 'G')) {
      e.preventDefault();
      collapseSelection();
    }
    else if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'f' || e.key === 'F' || e.key === 'Home')) {
      e.preventDefault();
      zoomToFit(e.key !== 'Home' && S.sel.size > 0);
    }
  }

  /* ------------------------------ quick add ------------------------------ */

  let qaPos = { x: 0, y: 0 }, qaIndex = 0, qaItems = [], qaNum = null;

  /* typing a number instead of a node name offers a ready-made slider:
   * value = what you typed, max = the power of ten that holds it (66 → 0–100,
   * 6.6 → 0–10 with one decimal, 100 → 0–100 — an exact power of ten is its
   * own ceiling, not a step below the next), integers get integer rounding;
   * negative numbers get a symmetric ±range so there's room to swing */
  function sliderSpec(q) {
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(q)) return null;
    const num = parseFloat(q);
    if (!Number.isFinite(num)) return null;
    const decimals = (q.split('.')[1] || '').length;
    // angle numbers make a degree slider pre-wired into a Radians node
    if (!decimals && (num === 90 || num === 180 || num === 360) && App.setting('angle-sliders', true))
      return { min: 0, max: num, value: num, mode: 'int', label: 'degrees', rad: true };
    // small integers make a 0–12 integer slider (counts, symmetries, steps)
    if (!decimals && num >= 0 && num <= 12 && App.setting('smallint-sliders', true))
      return { min: 0, max: 12, value: num, mode: 'int' };
    const mag = Math.abs(num);
    const max = mag ? Math.pow(10, Math.ceil(Math.log10(mag))) : 10;
    const spec = { min: num < 0 ? -max : 0, max, value: num, mode: decimals ? 'float' : 'int' };
    if (decimals) spec.prec = decimals;
    return spec;
  }

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

  /* with nothing typed, the list opens on the nodes a patch reaches for
   * most — a control, a shape, a list, an operator, a transform, a draw —
   * so a phone (or a first visit) sees them without scrolling */
  const QA_COMMON = ['params/slider', 'params/anchor', 'params/angle', 'params/knob', 'params/toggle', 'params/swatch',
    'crv/circle', 'crv/polygon', 'crv/rect', 'crv/line', 'sets/series', 'sets/range',
    'math/add', 'math/sub', 'math/mul', 'math/div', 'xf/move', 'xf/rotate', 'xf/scale', 'disp/draw'];
  function renderQA(q) {
    qaNum = sliderSpec(q.trim());
    q = q.toLowerCase();
    const rank = d => { const i = QA_COMMON.indexOf(d.id); return i < 0 ? 999 : i; };
    qaItems = Object.values(NODE_DEFS)
      .filter(d => !d.hidden)
      .filter(d => !q || d.title.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q) || d.id.includes(q))
      .sort((a, b) => (q ? 0 : rank(a) - rank(b)) || a.cat.localeCompare(b.cat) || a.title.localeCompare(b.title))
      .slice(0, 60);
    if (qaNum) qaItems = [{ id: '__slider' }].concat(qaItems);
    // canvas annotation, not a node — pinned at the end unless searched for
    if (!q || 'sticky note annotation'.includes(q)) qaItems = qaItems.concat([{ id: '__note' }]);
    qaIndex = 0;
    qaList.innerHTML = qaItems.map((d, i) => {
      if (d.id === '__slider') {
        return `<div class="qa-item ${i === 0 ? 'active' : ''}" data-type="__slider" title="type a number, get a slider already set to it">
          <span class="pal-icon" style="color:${CATS.Params}">${weftIconSVG('params/slider', 'Params') || ''}</span>slider ${qaNum.value}<span class="qa-cat">${qaNum.min}–${qaNum.max}</span>
        </div>`;
      }
      if (d.id === '__note') {
        return `<div class="qa-item ${i === 0 ? 'active' : ''}" data-type="__note" title="a sticky note on the canvas — never evaluated, never exported">
          <span class="pal-icon" style="color:#c9a86a"><span class="dot" style="background:#c9a86a"></span></span>sticky note<span class="qa-cat">canvas</span>
        </div>`;
      }
      const icon = d.id === 'params/swatch' ? '<span class="icon-swatch"></span>'
        : (weftIconSVG(d.id, d.cat) || `<span class="dot" style="background:${CATS[d.cat]}"></span>`);
      return `<div class="qa-item ${i === 0 ? 'active' : ''}" data-type="${d.id}" title="${d.desc || ''}">
        <span class="pal-icon" style="color:${CATS[d.cat]}">${icon}</span>${d.title}<span class="qa-cat">${d.cat}</span>
      </div>`;
    }).join('');
  }

  function qaCommit(type) {
    if (!type) return;
    if (type === '__slider') {
      const spec = qaNum;
      closeQA();
      if (!spec) return;
      const wantRad = spec.rad;
      delete spec.rad;
      const n = addNode('params/slider', qaPos.x, qaPos.y);
      if (n) {
        Object.assign(n.values, spec);
        Editor.rebuildNode(n.id);
        if (wantRad) {
          // a degree slider is almost always feeding an angle — hand it over
          // in radians already converted
          const r = addNode('math/rad', qaPos.x + 240, qaPos.y + 4);
          if (r) connect(n.id, 'N', r.id, 'V');
        }
        selectOnly(n.id);
        changed();
      }
      return;
    }
    if (type === '__note') {
      closeQA();
      addNoteAt(qaPos.x, qaPos.y);
      return;
    }
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
      if (n.collapsed) o.collapsed = true;
      if (n.label) o.label = n.label;
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

  /* nodes without x/y (e.g. LLM-authored patches) get laid out in topological
   * columns — WeftOps.layout, the same code the assistant's layout op runs */
  function autoLayout(nodes, wires) {
    if (nodes.every(n => typeof n.x === 'number' && typeof n.y === 'number')) return false;
    WeftOps.layout({ nodes, wires }, nodes);
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
      if (src.collapsed) n.collapsed = true;
      if (src.label) n.label = src.label;
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
    if (n.collapsed) o.collapsed = true;
    if (n.label) o.label = n.label;
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

  /* minZoom: a phone fitting a big loom would land at an unreadable 8% —
   * with a floor it still centers on the graph, just at a legible size */
  function zoomToFit(onlySelection, minZoom) {
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
    S.zoom = LM.clamp(Math.min((r.width - m * 2) / Math.max(1, x1 - x0), (r.height - m * 2) / Math.max(1, y1 - y0), 1.1), minZoom || 0.08, 2.5);
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
      ${many ? `<div class="ctx-item" data-act="group">Group (${S.sel.size})</div>` : ''}
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
      if (act === 'group') groupSelection();
      if (act === 'expand') expandCluster(nodeId);
      if (act === 'able') {
        n.enabled = n.enabled === false ? true : false;
        const el = S.els.get(nodeId);
        if (el) el.classList.toggle('disabled', n.enabled === false);
        drawWires(); // a bypassed sink changes the dead-branch set
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
    refitGroups,
    init(onChange) {
      S.onChange = onChange;
      editorEl = document.getElementById('editor');
      worldEl = document.getElementById('world');
      nodesEl = document.getElementById('nodes');
      svgEl = document.getElementById('wires');
      framesEl = document.getElementById('frames');
      notesLayerEl = document.getElementById('canvasNotes');
      qaEl = document.getElementById('quickAdd');
      qaInput = qaEl.querySelector('input');
      qaList = qaEl.querySelector('.qa-list');
      ctxEl = document.getElementById('ctxMenu');

      editorEl.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', e => { touchEnd(e); cancelDrag(); });
      // focus lost mid-drag (native picker, alt-tab) ends the gesture too, so
      // the box never gets a chance to strand itself
      window.addEventListener('blur', () => { S.touches.clear(); S.pinch = null; cancelDrag(); });
      editorEl.addEventListener('wheel', onWheel, { passive: false });
      // focusing a field near the edge makes the browser scroll the loom's
      // overflow:hidden container to reveal it (phones do this for every
      // number field); fold that scroll into the pan so the world transform
      // stays the only way the loom moves and nothing ends up off-screen
      editorEl.addEventListener('scroll', () => {
        if (!editorEl.scrollLeft && !editorEl.scrollTop) return;
        S.pan.x -= editorEl.scrollLeft; S.pan.y -= editorEl.scrollTop;
        editorEl.scrollLeft = 0; editorEl.scrollTop = 0;
        applyTransform();
      });
      window.addEventListener('keydown', onKeyDown);

      // number fields in node cards: arrows step ±1, shift ±10, alt ±0.1
      editorEl.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        const t = e.target;
        if (!t || t.tagName !== 'INPUT' || t.type !== 'number' || !t.closest('.node')) return;
        e.preventDefault();
        const dir = e.key === 'ArrowUp' ? 1 : -1;
        let step = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
        // ports that default to 1 (scales, gains, rates) live in fractions —
        // the plain arrow walks them by 0.1 instead of doubling them
        if (!e.shiftKey && !e.altKey) {
          const row = t.closest('.row.in');
          const nodeEl = t.closest('.node');
          if (row && nodeEl) {
            const n = nodeById(nodeEl.dataset.id);
            const d = n && defOf(n);
            const inp = d && insOf(n).find(i => i.name === row.dataset.input);
            if (inp && inp.default === 1) step = 0.1;
          }
        }
        let v = (parseFloat(t.value) || 0) + dir * step;
        v = Math.round(v * 1e6) / 1e6; // shed float dust from ±0.1 walks
        if (t.min !== '' && v < +t.min) v = +t.min;
        if (t.max !== '' && v > +t.max) v = +t.max;
        t.value = v;
        t.dispatchEvent(new Event('input', { bubbles: true }));
        t.dispatchEvent(new Event('change', { bubbles: true }));
      });

      editorEl.addEventListener('dblclick', e => { if (e.isTrusted) S.nativeDbl++; }, true); // see tapped()
      editorEl.addEventListener('dblclick', e => {
        if (e.target.closest('.node, .cnote, .gframe-bar, #quickAdd, #ctxMenu, #typeKey, #loomTools, #params')) return;
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
      S.armed = null;
      S.sel.clear(); S.selWire = null; S.lastErr.clear(); S.wireTint.clear();
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
      // format-2 annotations — loading stays lax, malformed entries just drop
      S.tidc = 1; S.gidc = 1;
      g.notes = (Array.isArray(g.notes) ? g.notes : [])
        .filter(t => t && typeof t.x === 'number' && typeof t.y === 'number');
      g.groups = (Array.isArray(g.groups) ? g.groups : [])
        .filter(f => f && typeof f.x === 'number' && Array.isArray(f.nodes));
      for (const t of g.notes) {
        const m = /^t(\d+)$/.exec(t.id || '');
        if (m) S.tidc = Math.max(S.tidc, +m[1] + 1); else if (!t.id) t.id = nextNoteId();
        t.w = t.w || 190; t.h = t.h || 110;
      }
      for (const f of g.groups) {
        const m = /^g(\d+)$/.exec(f.id || '');
        if (m) S.gidc = Math.max(S.gidc, +m[1] + 1); else if (!f.id) f.id = nextGroupId();
      }
      nodesEl.innerHTML = '';
      S.els.clear();
      notesLayerEl.innerHTML = '';
      S.noteEls.clear();
      framesEl.innerHTML = '';
      S.frameEls.clear();
      for (const n of g.nodes) buildNode(n);
      for (const t of g.notes) buildNote(t);
      for (const f of g.groups) buildFrame(f);
      for (const n of g.nodes) applyHiding(n.id);
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
      // color wires take the color flowing through them (optional setting) —
      // same 150ms cadence as the readouts, only wires whose type is color
      if (readouts && typeof App !== 'undefined' && App.setting && App.setting('live-colour-wires', true)) {
        for (const w of S.graph.wires) {
          const path = S.wirePaths.get(w.id);
          if (!path) continue;
          if (outputTypeColor(w.from) !== TYPE_COLORS.color) continue;
          const L = (ctx.out[w.from[0]] || {})[w.from[1]];
          let c = L && L[0];
          if (c && c.paint) c = c.stops && c.stops[0] && c.stops[0].c; // a paint shows its first stop
          if (c && typeof c === 'object' && 'r' in c) {
            const hex = LM.colorToHex(c);
            S.wireTint.set(w.id, hex); // drawWiresNow reapplies this on rebuild
            path.setAttribute('stroke', hex);
          }
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
    zoom: () => S.zoom,
    /* quick-add without a pointer position — the node lands near the top
     * middle of the visible loom (the mobile + button; no palette there) */
    quickAdd() {
      const r = editorEl.getBoundingClientRect();
      openQA({ clientX: r.left + r.width / 2 - 60, clientY: r.top + Math.min(r.height / 2, 110) });
    },
    redrawWires: drawWires,
    pickColor,

    /* rebuild one node's card in place — dynamic-port nodes (Custom JS) edit
     * their own ports; wires to a port that no longer exists are pruned */
    rebuildNode(id) {
      const n = nodeById(id);
      if (!n) return;
      const inNames = new Set(insOf(n).map(p => p.name));
      const outNames = new Set(outsOf(n).map(p => p.name));
      S.graph.wires = S.graph.wires.filter(w =>
        (w.to[0] !== id || inNames.has(w.to[1])) && (w.from[0] !== id || outNames.has(w.from[1])));
      const el = S.els.get(id);
      if (el) el.remove();
      S.els.delete(id);
      buildNode(n);
      updateSelection();
      drawWiresNow();
    },

    get graph() { return S.graph; }
  };
})();
