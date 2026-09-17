'use strict';
/*
 * WeftOps — the graph-ops applier, pure. Takes a serialized graph and a list
 * of ops (add / set / delete / wire / unwire / replace / layout / group /
 * ungroup — docs/ASSISTANT.md),
 * validates every op against the node defs, and returns a NEW graph plus any
 * errors. One bad op rejects the whole list: the returned graph is null and
 * the input is never touched.
 *
 * No DOM, no App/Editor: the assistant panel (js/assistant.js) and the
 * headless model bench (test/bench-model.js) share this one validator, so
 * what a model gets away with in the browser is exactly what the bench scores.
 */
const WeftOps = {
  apply(graph, ops, defs) {
    if (!Array.isArray(ops) || !ops.length) return { graph: null, errors: [], summary: 'no changes', counts: {} };
    // deep copy: the caller's graph may share values/wire references with a
    // live editor, and a rejected op list must leave it untouched
    // format-2 annotations ride along untouched unless an op names them
    const g = JSON.parse(JSON.stringify({ nodes: graph.nodes || [], wires: graph.wires || [], groups: graph.groups || [], notes: graph.notes || [] }));
    const errors = [];
    let grouped = 0;
    const groupById = id => g.groups.find(f => f.id === id);
    const freshGroup = () => { let i = 1; while (g.groups.some(f => f.id === 'g' + i)) i++; return 'g' + i; };
    const usedIds = new Set(g.nodes.map(n => n.id));
    const fresh = () => { let i = 1; while (usedIds.has('n' + i)) i++; usedIds.add('n' + i); return 'n' + i; };
    const byId = id => g.nodes.find(n => n.id === id);
    const portSet = (node, dir) => {
      const def = defs[node.type] || {};
      const list = def.dynamic ? ((node.values || {})[dir === 'in' ? 'ins' : 'outs'] || [])
        : (dir === 'in' ? def.inputs : def.outputs) || [];
      return new Set(list.map(p => p.name));
    };
    const checkEnd = (end, dir, label) => {
      if (!Array.isArray(end) || end.length !== 2) { errors.push(label + ': endpoint must be [nodeId, port]'); return false; }
      const n = byId(end[0]);
      if (!n) { errors.push(label + ': no node "' + end[0] + '"'); return false; }
      if (!portSet(n, dir).has(end[1])) { errors.push(label + ': node "' + end[0] + '" (' + n.type + ') has no ' + (dir === 'in' ? 'input' : 'output') + ' "' + end[1] + '"'); return false; }
      return true;
    };
    const needLayout = [];
    let added = 0, changed = 0, removed = 0, wired = 0;

    for (const op of ops) {
      if (!op || typeof op !== 'object') { errors.push('op is not an object'); continue; }

      if (op.op === 'add') {
        const idMap = {};
        for (const src of op.nodes || []) {
          if (!src || !defs[src.type]) { errors.push('add: unknown node type "' + (src && src.type) + '"'); continue; }
          const def = defs[src.type];
          let id = src.id;
          if (!id || usedIds.has(id)) { const nid = fresh(); if (id) idMap[id] = nid; id = nid; }
          else usedIds.add(id);
          const n = {
            id, type: src.type,
            x: Math.round(+src.x || 0), y: Math.round(+src.y || 0),
            values: src.values !== undefined ? JSON.parse(JSON.stringify(src.values))
              : (def.defaults ? JSON.parse(JSON.stringify(def.defaults)) : {})
          };
          if (typeof src.x !== 'number' || typeof src.y !== 'number') needLayout.push(n);
          g.nodes.push(n);
          added++;
        }
        for (const raw of op.wires || []) {
          const w = WeftOps.wireOf(raw);
          if (!w || !Array.isArray(w.from) || !Array.isArray(w.to)) { errors.push('add: wire needs from + to, each [nodeId, port]'); continue; }
          const from = [idMap[w.from[0]] || w.from[0], w.from[1]];
          const to = [idMap[w.to[0]] || w.to[0], w.to[1]];
          if (!checkEnd(from, 'out', 'add wire') || !checkEnd(to, 'in', 'add wire')) continue;
          g.wires.push({ from, to });
          wired++;
        }

      } else if (op.op === 'set') {
        const n = byId(op.id);
        if (!n) { errors.push('set: no node "' + op.id + '"'); continue; }
        if (op.values && typeof op.values === 'object') Object.assign(n.values = n.values || {}, JSON.parse(JSON.stringify(op.values)));
        if (typeof op.x === 'number') n.x = Math.round(op.x);
        if (typeof op.y === 'number') n.y = Math.round(op.y);
        if (typeof op.enabled === 'boolean') n.enabled = op.enabled;
        if (typeof op.preview === 'boolean') n.preview = op.preview;
        // collapsed = the card folds to its icon and ports (editor-only, format 2)
        if (typeof op.collapsed === 'boolean') { if (op.collapsed) n.collapsed = true; else delete n.collapsed; }
        changed++;

      } else if (op.op === 'delete') {
        for (const id of op.ids || (op.id ? [op.id] : [])) {
          const i = g.nodes.findIndex(n => n.id === id);
          if (i < 0) { errors.push('delete: no node "' + id + '"'); continue; }
          g.nodes.splice(i, 1);
          g.wires = g.wires.filter(w => w.from[0] !== id && w.to[0] !== id);
          for (const f of g.groups) f.nodes = f.nodes.filter(x => x !== id);
          removed++;
        }
        g.groups = g.groups.filter(f => f.nodes.length);
        for (const w of op.wires || []) {
          const before = g.wires.length;
          g.wires = g.wires.filter(x => !(x.from[0] === w.from[0] && x.from[1] === w.from[1] && x.to[0] === w.to[0] && x.to[1] === w.to[1]));
          if (g.wires.length === before) errors.push('delete: no wire ' + JSON.stringify(w.from) + ' → ' + JSON.stringify(w.to));
          else removed++;
        }

      } else if (op.op === 'wire') {
        if (!checkEnd(op.from, 'out', 'wire') || !checkEnd(op.to, 'in', 'wire')) continue;
        // dropped wires replace, like the editor — op.stack true to merge instead
        if (!op.stack) g.wires = g.wires.filter(w => !(w.to[0] === op.to[0] && w.to[1] === op.to[1]));
        g.wires.push({ from: op.from.slice(), to: op.to.slice() });
        wired++;

      } else if (op.op === 'unwire') {
        const before = g.wires.length;
        g.wires = g.wires.filter(w => {
          const mf = !op.from || (w.from[0] === op.from[0] && w.from[1] === op.from[1]);
          const mt = !op.to || (w.to[0] === op.to[0] && w.to[1] === op.to[1]);
          return !(mf && mt && (op.from || op.to));
        });
        if (g.wires.length === before) errors.push('unwire: nothing matched');
        else wired++;

      } else if (op.op === 'replace') {
        const ng = op.graph;
        if (!ng || !Array.isArray(ng.nodes) || !Array.isArray(ng.wires)) { errors.push('replace: graph needs nodes[] + wires[]'); continue; }
        const bad = ng.nodes.filter(n => !n || !defs[n.type]);
        if (bad.length) { errors.push('replace: unknown node type(s): ' + bad.map(n => n && n.type).join(', ')); continue; }
        g.nodes = JSON.parse(JSON.stringify(ng.nodes));
        g.wires = JSON.parse(JSON.stringify(ng.wires)).map(WeftOps.wireOf);
        g.groups = JSON.parse(JSON.stringify(Array.isArray(ng.groups) ? ng.groups : []));
        g.notes = JSON.parse(JSON.stringify(Array.isArray(ng.notes) ? ng.notes : []));
        usedIds.clear();
        for (const n of g.nodes) { usedIds.add(n.id); n.values = n.values || {}; if (typeof n.x !== 'number' || typeof n.y !== 'number') needLayout.push(n); }
        // a replaced graph's wires still have to name real nodes and ports
        if (g.wires.some(w => !w)) errors.push('replace: every wire needs from + to, each [nodeId, port]');
        else for (const w of g.wires) { checkEnd(w.from, 'out', 'replace wire'); checkEnd(w.to, 'in', 'replace wire'); }
        added = g.nodes.length; wired = g.wires.length;

      } else if (op.op === 'group') {
        // a titled frame round some nodes (format-2 annotation, nothing is
        // rewired). No id = a new group; an id edits that group's title,
        // members or fold. A node belongs to one group: it leaves any other.
        const ids = Array.isArray(op.nodes) ? op.nodes : null;
        if (ids) for (const id of ids) if (!byId(id)) errors.push('group: no node "' + id + '"');
        let f = op.id ? groupById(op.id) : null;
        if (op.id && !f) errors.push('group: no group "' + op.id + '"');
        if (!op.id && (!ids || !ids.length)) errors.push('group: needs nodes:[…]');
        if (!errors.length) {
          if (!f) { f = { id: freshGroup(), x: 0, y: 0, w: 0, h: 0, title: 'group', nodes: [] }; g.groups.push(f); }
          if (typeof op.title === 'string' && op.title.trim()) f.title = op.title.trim();
          if (ids) {
            for (const other of g.groups) if (other !== f) other.nodes = other.nodes.filter(id => !ids.includes(id));
            f.nodes = Array.from(new Set(ids));
          }
          if (typeof op.collapsed === 'boolean') { if (op.collapsed) f.collapsed = true; else delete f.collapsed; }
          g.groups = g.groups.filter(x => x.nodes.length);
          WeftOps.fitGroup(g, f, defs);
          grouped++;
        }

      } else if (op.op === 'ungroup') {
        const ids = op.ids || (op.id ? [op.id] : []);
        for (const id of ids) {
          const f = groupById(id);
          if (!f) { errors.push('ungroup: no group "' + id + '"'); continue; }
          g.groups.splice(g.groups.indexOf(f), 1);
          grouped++;
        }

      } else if (op.op === 'layout') {
        // tidy the loom into topological columns. With groups present (and no
        // ids) every group becomes its own block and the blocks tile with
        // gaps; with ids, just those nodes settle below what stays put.
        // spacing scales the pitch (1.5 = "more room between cards").
        const ids = Array.isArray(op.ids) && op.ids.length ? op.ids : null;
        if (ids) for (const id of ids) if (!byId(id)) errors.push('layout: no node "' + id + '"');
        const spacing = Math.min(3, Math.max(0.5, +op.spacing || 1));
        if (!errors.length) {
          if (!ids && g.groups.length) WeftOps.layoutBlocks(g, defs, spacing);
          else {
            const set = ids ? new Set(ids) : null;
            WeftOps.layout(g, set ? g.nodes.filter(n => set.has(n.id)) : g.nodes.slice(), spacing);
            for (const f of g.groups) WeftOps.fitGroup(g, f, defs);
          }
          changed += ids ? ids.length : g.nodes.length;
        }

      } else {
        errors.push('unknown op "' + op.op + '"');
      }
    }

    if (errors.length) return { graph: null, errors, summary: '', counts: {} };

    // nodes that arrived without coordinates settle in topological columns
    // to the right of (or below) what's already on the loom
    if (needLayout.length) { WeftOps.layout(g, needLayout); for (const f of g.groups) WeftOps.fitGroup(g, f, defs); }

    const bits = [];
    if (added) bits.push('+' + added + ' node' + (added > 1 ? 's' : ''));
    if (changed) bits.push(changed + ' edited');
    if (removed) bits.push('−' + removed);
    if (wired) bits.push(wired + ' wire' + (wired > 1 ? 's' : ''));
    if (grouped) bits.push(grouped + ' group' + (grouped > 1 ? 's' : ''));
    return { graph: g, errors: [], summary: bits.join(' · ') || 'no changes', counts: { added, changed, removed, wired, grouped } };
  },

  /* a card's footprint, estimated without the DOM (the editor refits frames
   * to real sizes once the graph lands; this keeps headless layouts sane) */
  nodeSize(n, defs) {
    const def = (defs && defs[n.type]) || {};
    const ins = def.dynamic ? ((n.values || {}).ins || []) : (def.inputs || []);
    const outs = def.dynamic ? ((n.values || {}).outs || []) : (def.outputs || []);
    const rows = Math.max(ins.length, outs.length);
    if (n.collapsed) return { w: 60, h: Math.max(46, rows * 17 + 14) };
    return { w: def.width || 172, h: 40 + rows * 18 + (def.buildBody ? 56 : 0) };
  },

  /* size a group's frame round its members, the editor's own margins */
  fitGroup(g, f, defs) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const id of f.nodes) {
      const n = g.nodes.find(x => x.id === id);
      if (!n) continue;
      const s = WeftOps.nodeSize(n, defs);
      x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y);
      x1 = Math.max(x1, n.x + s.w); y1 = Math.max(y1, n.y + s.h);
    }
    if (x0 === Infinity) return;
    f.x = Math.round(x0 - 16); f.y = Math.round(y0 - 44);
    f.w = Math.round(x1 - x0 + 32); f.h = Math.round(y1 - y0 + 60);
  },

  /* the grouped loom: each group is laid out as its own block of columns,
   * the blocks (plus one for the loose nodes) tile left → right in the order
   * the data flows, wrapping into rows, with clear gaps between them */
  layoutBlocks(g, defs, spacing) {
    const colPitch = 250 * spacing, rowPitch = 140 * spacing, gap = 90 * spacing, wrapAt = 2600 * spacing;
    const here = new Set(g.nodes.map(n => n.id));
    const incoming = {};
    for (const w of g.wires) if (here.has(w.from[0]) && here.has(w.to[0])) (incoming[w.to[0]] = incoming[w.to[0]] || []).push(w.from[0]);
    const depth = {};
    const calc = (id, seen) => {
      if (depth[id] !== undefined) return depth[id];
      if (seen.has(id)) return 0;
      seen.add(id);
      let d = 0;
      for (const p of incoming[id] || []) d = Math.max(d, calc(p, seen) + 1);
      return depth[id] = d;
    };
    for (const n of g.nodes) calc(n.id, new Set());
    const inGroup = new Set();
    for (const f of g.groups) for (const id of f.nodes) inGroup.add(id);
    const blocks = g.groups.map(f => ({ f, nodes: f.nodes.map(id => g.nodes.find(n => n.id === id)).filter(Boolean) }));
    const loose = g.nodes.filter(n => !inGroup.has(n.id));
    if (loose.length) blocks.push({ f: null, nodes: loose });
    const mean = b => b.nodes.reduce((s, n) => s + depth[n.id], 0) / Math.max(1, b.nodes.length);
    // open groups first in flow order; folded ones (a bar on screen) last
    blocks.sort((a, b) => ((a.f && a.f.collapsed) ? 1 : 0) - ((b.f && b.f.collapsed) ? 1 : 0) || mean(a) - mean(b));
    // lay each block out on its own, from (0,0), using only the wires inside it
    for (const b of blocks) {
      const ids = new Set(b.nodes.map(n => n.id));
      const sub = { nodes: b.nodes, wires: g.wires.filter(w => ids.has(w.from[0]) && ids.has(w.to[0])) };
      for (const n of b.nodes) { n.x = undefined; n.y = undefined; }
      WeftOps.layout(sub, b.nodes, spacing);
      let w = 0, h = 0;
      for (const n of b.nodes) { const s = WeftOps.nodeSize(n, defs); w = Math.max(w, n.x - 60 + s.w); h = Math.max(h, n.y - 60 + s.h); }
      b.w = w; b.h = h;
      // a folded group is a bar on screen: it reserves the bar, not the
      // members it hides (they sit beneath it; another layout after an
      // unfold spreads them again)
      if (b.f && b.f.collapsed) { b.w = Math.min(w, 320); b.h = 0; }
    }
    // tile the blocks
    let x = 60, y = 60, rowH = 0;
    for (const b of blocks) {
      if (x > 60 && x + b.w > wrapAt) { x = 60; y += rowH + gap + 44; rowH = 0; }
      for (const n of b.nodes) { n.x = Math.round(n.x - 60 + x); n.y = Math.round(n.y - 60 + y); }
      if (b.f) WeftOps.fitGroup(g, b.f, defs);
      x += b.w + gap;
      rowH = Math.max(rowH, b.h);
    }
  },

  /* place the given nodes of g in ~250px columns by wire depth (a node sits
   * one column right of its furthest upstream input), starting below whatever
   * keeps its position. Within a column, nodes are ordered by where their
   * inputs sit in the column before (barycenter), so wires mostly run
   * straight; the first column keeps its previous top-to-bottom order. */
  layout(g, nodes, spacing) {
    const colPitch = 250 * (spacing || 1), rowPitch = 140 * (spacing || 1);
    let baseX = 60, baseY = 60;
    const moving = new Set(nodes.map(n => n.id));
    const placed = g.nodes.filter(n => !moving.has(n.id));
    if (placed.length) {
      baseX = Math.min.apply(null, placed.map(n => n.x));
      baseY = Math.max.apply(null, placed.map(n => n.y)) + 220;
    }
    const here = new Set(g.nodes.map(n => n.id));
    const incoming = {};
    for (const w of g.wires) if (here.has(w.from[0]) && here.has(w.to[0])) (incoming[w.to[0]] = incoming[w.to[0]] || []).push(w.from[0]);
    const depth = {};
    const calc = (id, seen) => {
      if (depth[id] !== undefined) return depth[id];
      if (seen.has(id)) return 0;
      seen.add(id);
      let d = 0;
      for (const p of incoming[id] || []) d = Math.max(d, calc(p, seen) + 1);
      return depth[id] = d;
    };
    for (const n of g.nodes) calc(n.id, new Set());
    const cols = {};
    for (const n of nodes) (cols[depth[n.id]] = cols[depth[n.id]] || []).push(n);
    const row = {};
    for (const n of placed) row[n.id] = n.y / rowPitch;
    // a depth column taller than MAX_ROWS continues in the next column, so a
    // block of twenty sliders is a grid rather than a tower
    const MAX_ROWS = 7;
    let colIndex = 0;
    for (const d of Object.keys(cols).map(Number).sort((a, b) => a - b)) {
      const col = cols[d];
      const key = n => {
        const ups = (incoming[n.id] || []).filter(p => row[p] !== undefined);
        return ups.length ? ups.reduce((s, p) => s + row[p], 0) / ups.length : (typeof n.y === 'number' ? n.y / rowPitch : 0);
      };
      const keyed = col.map((n, i) => ({ n, k: key(n), i }));
      keyed.sort((a, b) => a.k - b.k || a.i - b.i);
      keyed.forEach((e, i) => {
        e.n.x = Math.round(baseX + (colIndex + Math.floor(i / MAX_ROWS)) * colPitch);
        e.n.y = Math.round(baseY + (i % MAX_ROWS) * rowPitch);
        row[e.n.id] = i % MAX_ROWS;
      });
      colIndex += Math.max(1, Math.ceil(keyed.length / MAX_ROWS));
    }
  },

  /* pull the ops out of a model reply: a fenced ```weft-ops / ```json block
   * inside prose, or a bare top-level array / {ops:[…]} object.
   * Returns { reply (text minus the fence), ops (array|null) }. */
  parseReply(text) {
    let reply = String(text || '').trim();
    let ops = null;
    const pick = p => Array.isArray(p) ? p : (p && Array.isArray(p.ops) ? p.ops : null);
    const tryParse = s => {
      try { return pick(JSON.parse(s)); }
      catch (e) { try { return pick(JSON.parse(WeftOps.tidyJSON(s))); } catch (e2) { return null; } }
    };
    const m = reply.match(/```(?:weft-ops|json)?[ \t]*\n([\s\S]*?)```/);
    if (m) { ops = tryParse(m[1]); if (ops) reply = reply.replace(m[0], '').trim(); }
    if (!ops && /^[\[{]/.test(reply)) { ops = tryParse(reply); if (ops) reply = ''; }
    return { reply, ops };
  },

  /* models slip into JS habits — // comments and trailing commas — inside
   * what should be strict JSON. Strip both, outside string literals only. */
  tidyJSON(s) {
    let out = '', inStr = false, i = 0;
    while (i < s.length) {
      const c = s[i];
      if (inStr) {
        out += c;
        if (c === '\\') { out += s[i + 1] || ''; i += 2; continue; }
        if (c === '"') inStr = false;
        i++;
      } else if (c === '"') { inStr = true; out += c; i++; }
      else if (c === '/' && s[i + 1] === '/') { while (i < s.length && s[i] !== '\n') i++; }
      else if (c === '/' && s[i + 1] === '*') { const j = s.indexOf('*/', i + 2); i = j < 0 ? s.length : j + 2; }
      else { out += c; i++; }
    }
    return out.replace(/,(\s*[\]}])/g, '$1');
  },

  /* a wire in any of the shapes models produce → {from:[id,port], to:[id,port]}
   * (or null): the documented object, a 4-tuple [id,port,id,port], or
   * {source:'id.port', target:'id.port'} */
  wireOf(w) {
    if (!w) return null;
    if (Array.isArray(w) && w.length === 4) return { from: [w[0], w[1]], to: [w[2], w[3]] };
    if (Array.isArray(w) && w.length === 2 && Array.isArray(w[0]) && Array.isArray(w[1])) return { from: w[0], to: w[1] };
    if (typeof w !== 'object') return null;
    const end = v => Array.isArray(v) ? v : (typeof v === 'string' && v.includes('.') ? [v.slice(0, v.lastIndexOf('.')), v.slice(v.lastIndexOf('.') + 1)] : null);
    const from = end(w.from !== undefined ? w.from : w.source), to = end(w.to !== undefined ? w.to : w.target);
    return from && to ? { from, to } : null;
  }
};
