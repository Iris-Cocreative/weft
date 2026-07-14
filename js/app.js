'use strict';
/* Weft app shell — palette, toolbar, persistence, history (undo/redo), export modal, splitter. */

const GRAPH_FORMAT = 1;

const App = {
  graph: { format: GRAPH_FORMAT, nodes: [], wires: [] },

  /* ------------------------------ graph format ------------------------------ */

  migrate(g) {
    if (!g || !Array.isArray(g.nodes) || !Array.isArray(g.wires)) throw new Error('not a weft graph');
    if (!g.format) g.format = 1; // pre-versioning graphs are structurally v1
    if (g.format > GRAPH_FORMAT) throw new Error('made in a newer Weft (format ' + g.format + ')');
    // future stepwise migrations go here: if (g.format === 1) { ...; g.format = 2; }
    return g;
  },

  serialize() {
    return {
      format: GRAPH_FORMAT,
      nodes: App.graph.nodes.map(n => {
        const o = { id: n.id, type: n.type, x: n.x, y: n.y, values: n.values };
        if (n.enabled === false) o.enabled = false;
        if (n.preview === false) o.preview = false;
        return o;
      }),
      wires: App.graph.wires.map(w => ({ id: w.id, from: w.from, to: w.to }))
    };
  },

  setGraph(g) {
    App.graph = App.migrate(g);
    Editor.setGraph(App.graph);
    App.updateCounts();
    App.resetHistory();
    App.writeStorage();
  },

  /* ------------------------------ change pipeline ------------------------------
   * Editor.onChange → debounce 400ms → storage + one history snapshot.
   * Continuous gestures (slider drags) coalesce into a single undo step. */

  _changeTimer: null,
  onGraphChanged() {
    clearTimeout(App._changeTimer);
    App._changeTimer = setTimeout(() => {
      App._changeTimer = null;
      App.writeStorage();
      App.pushHistory();
      App.updateCounts();
    }, 400);
  },

  writeStorage() {
    try { localStorage.setItem('weft:autosave', JSON.stringify(App.serialize())); } catch (e) { /* storage unavailable */ }
  },

  restore() {
    try {
      const raw = localStorage.getItem('weft:autosave');
      if (raw) {
        const g = App.migrate(JSON.parse(raw));
        if (g.nodes.length) return g;
      }
    } catch (e) { /* fall through */ }
    return null;
  },

  /* ------------------------------ undo / redo ------------------------------ */

  _hist: [], _histIdx: -1,

  resetHistory() {
    App._hist = [JSON.stringify(App.serialize())];
    App._histIdx = 0;
  },

  pushHistory() {
    const snap = JSON.stringify(App.serialize());
    if (snap === App._hist[App._histIdx]) return;
    App._hist.length = App._histIdx + 1; // drop redo tail
    App._hist.push(snap);
    if (App._hist.length > 100) App._hist.shift();
    App._histIdx = App._hist.length - 1;
  },

  _flushPending() {
    if (App._changeTimer) {
      clearTimeout(App._changeTimer);
      App._changeTimer = null;
      App.writeStorage();
      App.pushHistory();
    }
  },

  undo() {
    App._flushPending();
    if (App._histIdx <= 0) { App.flash('nothing to undo'); return; }
    App._histIdx--;
    App.applySnapshot();
  },

  redo() {
    App._flushPending();
    if (App._histIdx >= App._hist.length - 1) { App.flash('nothing to redo'); return; }
    App._histIdx++;
    App.applySnapshot();
  },

  applySnapshot() {
    App.graph = JSON.parse(App._hist[App._histIdx]);
    Editor.setGraph(App.graph);
    App.writeStorage();
    App.updateCounts();
  },

  /* ------------------------------ status bar ------------------------------ */

  _flashTimer: null,
  flash(msg) {
    const el = document.getElementById('statusHint');
    const original = el.dataset.original || el.textContent;
    el.dataset.original = original;
    el.textContent = msg;
    el.classList.add('flash');
    clearTimeout(App._flashTimer);
    App._flashTimer = setTimeout(() => {
      el.textContent = original;
      el.classList.remove('flash');
    }, 2600);
  },

  updateCounts() {
    document.getElementById('statusCounts').textContent =
      App.graph.nodes.length + ' nodes · ' + App.graph.wires.length + ' wires';
  },

  /* ------------------------------ init ------------------------------ */

  init() {
    Editor.init(() => App.onGraphChanged());
    Viewport.init();
    App.buildPalette();
    App.buildTypeKey();
    App.bindToolbar();
    App.bindKeys();
    App.bindSplitter();
    App.bindExport();

    const g = App.restore() || App.migrate(JSON.parse(JSON.stringify(EXAMPLES['Phyllotaxis'])));
    App.setGraph(g);
  },

  bindKeys() {
    window.addEventListener('keydown', e => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); App.undo(); }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); App.redo(); }
      else if (k === 'a') { e.preventDefault(); Editor.selectAll(); }
      else if (k === 'c' || k === 'x') {
        // async-clipboard fallback so copy works even if the native copy event
        // doesn't reach us; on file:// (no clipboard API) the copy event path runs
        const frag = Editor.copySelection();
        if (frag && navigator.clipboard && navigator.clipboard.writeText) {
          e.preventDefault();
          navigator.clipboard.writeText(JSON.stringify(frag, null, 1)).then(() => {
            App.flash(frag.nodes.length + ' node(s) ' + (k === 'x' ? 'cut' : 'copied') + ' — paste here or into any chat');
            if (k === 'x') Editor.deleteSelection();
          }).catch(() => {});
        }
      }
    });
  },

  /* ------------------------------ palette ------------------------------ */

  buildPalette() {
    const list = document.getElementById('paletteList');
    const search = document.getElementById('paletteSearch');
    const order = ['Params', 'Input', 'State', 'Maths', 'Sets', 'Vector', 'Curve', 'Transform', 'Display'];

    const render = q => {
      q = (q || '').toLowerCase();
      let html = '';
      for (const cat of order) {
        const defs = Object.values(NODE_DEFS)
          .filter(d => d.cat === cat && !d.hidden)
          .filter(d => !q || d.title.toLowerCase().includes(q) || d.id.includes(q))
          .sort((a, b) => ((a.grp || 9) - (b.grp || 9)) || a.title.localeCompare(b.title));
        if (!defs.length) continue;
        html += `<div class="pal-cat" style="--c:${CATS[cat]}">${cat}</div>`;
        let prevGrp = null;
        for (const d of defs) {
          if (prevGrp !== null && (d.grp || 9) !== prevGrp) html += '<div class="pal-gap"></div>';
          prevGrp = d.grp || 9;
          const icon = d.id === 'params/swatch' ? '<span class="icon-swatch"></span>'
            : (weftIconSVG(d.id, d.cat) || `<span class="dot" style="background:${CATS[cat]}"></span>`);
          html += `<div class="pal-item" data-type="${d.id}" title="${d.desc || ''}">
            <span class="pal-icon" style="color:${CATS[cat]}">${icon}</span>${d.title}
          </div>`;
        }
      }
      list.innerHTML = html;
    };
    render('');
    search.addEventListener('input', () => render(search.value));

    /* drag a node from the palette onto the loom (or an Anchor onto the cloth) */
    let pd = null;
    list.addEventListener('pointerdown', e => {
      const item = e.target.closest('.pal-item');
      if (!item) return;
      e.preventDefault();
      pd = { type: item.dataset.type, title: item.textContent.trim(), sx: e.clientX, sy: e.clientY, ghost: null };
    });
    window.addEventListener('pointermove', e => {
      if (!pd) return;
      if (!pd.ghost && Math.abs(e.clientX - pd.sx) + Math.abs(e.clientY - pd.sy) > 6) {
        pd.ghost = document.createElement('div');
        pd.ghost.className = 'drag-ghost';
        pd.ghost.textContent = pd.title;
        document.body.appendChild(pd.ghost);
      }
      if (pd.ghost) {
        pd.ghost.style.left = (e.clientX + 12) + 'px';
        pd.ghost.style.top = (e.clientY + 8) + 'px';
      }
    });
    window.addEventListener('pointerup', e => {
      if (!pd) return;
      const p = pd;
      pd = null;
      if (!p.ghost) {
        if (e.target.closest && e.target.closest('.pal-item')) Editor.addAtCenter(p.type);
        return;
      }
      p.ghost.remove();
      const ed = document.getElementById('editor').getBoundingClientRect();
      const pv = document.getElementById('preview').getBoundingClientRect();
      const within = r => e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (within(ed)) {
        Editor.addAt(p.type, e.clientX, e.clientY);
      } else if (within(pv) && p.type === 'params/anchor') {
        const n = Editor.addAtCenter('params/anchor');
        if (n) {
          n.values.x = Math.round(e.clientX - pv.left - pv.width / 2);
          n.values.y = Math.round(e.clientY - pv.top - pv.height / 2);
          App.onGraphChanged();
          App.flash('anchor pinned to the cloth — drag its handle any time');
        }
      }
    });
  },

  buildTypeKey() {
    const body = document.querySelector('#typeKey .tk-body');
    const order = ['number', 'point', 'vector', 'geometry', 'color', 'bool', 'string', 'any'];
    body.innerHTML = order.map(t =>
      `<div class="tk-row"><span class="tk-line" style="background:${TYPE_COLORS[t]}"></span>${t}</div>`).join('') +
      `<div class="tk-note">wires take the colour of their source output</div>`;
    document.querySelector('#typeKey .tk-head').addEventListener('click', () => {
      document.getElementById('typeKey').classList.toggle('closed');
    });
  },

  /* ------------------------------ toolbar ------------------------------ */

  bindToolbar() {
    const sel = document.getElementById('exampleSelect');
    for (const name of Object.keys(EXAMPLES)) {
      const o = document.createElement('option');
      o.value = name; o.textContent = name;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => {
      if (!sel.value) return;
      App.setGraph(JSON.parse(JSON.stringify(EXAMPLES[sel.value])));
      App.flash('loaded example: ' + sel.value);
      sel.value = '';
    });

    document.getElementById('btnFit').addEventListener('click', () => Editor.zoomToFit(false));

    document.getElementById('btnNew').addEventListener('click', () => {
      try { localStorage.setItem('weft:backup', JSON.stringify(App.serialize())); } catch (e) {}
      App.setGraph({ format: GRAPH_FORMAT, nodes: [], wires: [] });
      App.flash('canvas cleared — previous graph backed up');
    });

    document.getElementById('btnSave').addEventListener('click', () => {
      App.download('weft-graph.json', JSON.stringify(App.serialize(), null, 2), 'application/json');
    });

    const fileInput = document.getElementById('fileInput');
    document.getElementById('btnLoad').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const f = fileInput.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          App.setGraph(JSON.parse(r.result));
          App.flash('opened ' + f.name);
        } catch (e) {
          App.flash('could not open file: ' + e.message);
        }
      };
      r.readAsText(f);
      fileInput.value = '';
    });

    const btnPlay = document.getElementById('btnPlay');
    btnPlay.addEventListener('click', () => {
      Viewport.playing = !Viewport.playing;
      btnPlay.textContent = Viewport.playing ? '⏸' : '▶';
    });
  },

  download(name, content, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  },

  /* ------------------------------ export modal ------------------------------ */

  bindExport() {
    const modal = document.getElementById('exportModal');
    const code = document.getElementById('exportCode');

    document.getElementById('btnExport').addEventListener('click', () => {
      if (!App.graph.nodes.length) { App.flash('nothing to export — the canvas is empty'); return; }
      code.value = WeftExport.buildJS(App.graph);
      modal.classList.remove('hidden');
    });
    document.getElementById('exportClose').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('pointerdown', e => { if (e.target === modal) modal.classList.add('hidden'); });

    document.getElementById('exportCopy').addEventListener('click', () => {
      code.select();
      try { navigator.clipboard.writeText(code.value); App.flash('copied to clipboard'); }
      catch (e) { document.execCommand('copy'); App.flash('copied to clipboard'); }
    });
    document.getElementById('exportDl').addEventListener('click', () => {
      App.download('weft-experience.js', code.value, 'text/javascript');
    });
    document.getElementById('exportDlHtml').addEventListener('click', () => {
      App.download('weft-demo.html', WeftExport.buildDemoHTML(code.value, App.graph), 'text/html');
    });
  },

  /* ------------------------------ splitter ------------------------------ */

  bindSplitter() {
    const splitter = document.getElementById('splitter');
    const preview = document.getElementById('preview');
    let drag = null;
    splitter.addEventListener('pointerdown', e => {
      drag = { sx: e.clientX, w: preview.getBoundingClientRect().width };
      splitter.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    splitter.addEventListener('pointermove', e => {
      if (!drag) return;
      const w = LM.clamp(drag.w + (drag.sx - e.clientX), 240, window.innerWidth * 0.7);
      preview.style.flexBasis = w + 'px';
    });
    splitter.addEventListener('pointerup', () => { drag = null; });
  }
};

window.addEventListener('DOMContentLoaded', App.init);
