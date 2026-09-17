'use strict';
/*
 * WeftOps — the graph-ops applier, pure. Takes a serialized graph and a list
 * of ops (add / set / delete / wire / unwire / replace — docs/ASSISTANT.md),
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
    const g = JSON.parse(JSON.stringify({ nodes: graph.nodes || [], wires: graph.wires || [] }));
    const errors = [];
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
        changed++;

      } else if (op.op === 'delete') {
        for (const id of op.ids || (op.id ? [op.id] : [])) {
          const i = g.nodes.findIndex(n => n.id === id);
          if (i < 0) { errors.push('delete: no node "' + id + '"'); continue; }
          g.nodes.splice(i, 1);
          g.wires = g.wires.filter(w => w.from[0] !== id && w.to[0] !== id);
          removed++;
        }
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
        usedIds.clear();
        for (const n of g.nodes) { usedIds.add(n.id); n.values = n.values || {}; if (typeof n.x !== 'number' || typeof n.y !== 'number') needLayout.push(n); }
        // a replaced graph's wires still have to name real nodes and ports
        if (g.wires.some(w => !w)) errors.push('replace: every wire needs from + to, each [nodeId, port]');
        else for (const w of g.wires) { checkEnd(w.from, 'out', 'replace wire'); checkEnd(w.to, 'in', 'replace wire'); }
        added = g.nodes.length; wired = g.wires.length;

      } else {
        errors.push('unknown op "' + op.op + '"');
      }
    }

    if (errors.length) return { graph: null, errors, summary: '', counts: {} };

    // nodes that arrived without coordinates settle in topological columns
    // to the right of (or below) what's already on the loom
    if (needLayout.length) WeftOps.layout(g, needLayout);

    const bits = [];
    if (added) bits.push('+' + added + ' node' + (added > 1 ? 's' : ''));
    if (changed) bits.push(changed + ' edited');
    if (removed) bits.push('−' + removed);
    if (wired) bits.push(wired + ' wire' + (wired > 1 ? 's' : ''));
    return { graph: g, errors: [], summary: bits.join(' · ') || 'no changes', counts: { added, changed, removed, wired } };
  },

  /* place the given (coordinate-less) nodes of g in ~250px columns by wire
   * depth, starting below whatever already has a position */
  layout(g, nodes) {
    let baseX = 60, baseY = 60;
    const placed = g.nodes.filter(n => !nodes.includes(n));
    if (placed.length) {
      baseX = Math.min.apply(null, placed.map(n => n.x));
      baseY = Math.max.apply(null, placed.map(n => n.y)) + 220;
    }
    const depth = {};
    const calc = (id, seen) => {
      if (depth[id] !== undefined) return depth[id];
      if (seen.has(id)) return 0;
      seen.add(id);
      let d = 0;
      for (const w of g.wires) if (w.to[0] === id && g.nodes.some(n => n.id === w.from[0])) d = Math.max(d, calc(w.from[0], seen) + 1);
      return depth[id] = d;
    };
    const colY = {};
    for (const n of nodes) {
      const d = calc(n.id, new Set());
      n.x = baseX + d * 250;
      n.y = baseY + (colY[d] || 0);
      colY[d] = (colY[d] || 0) + 140;
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
