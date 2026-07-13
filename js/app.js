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
      nodes: App.graph.nodes.map(n => ({ id: n.id, type: n.type, x: n.x, y: n.y, values: n.values })),
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
    });
  },

  /* ------------------------------ palette ------------------------------ */

  buildPalette() {
    const list = document.getElementById('paletteList');
    const search = document.getElementById('paletteSearch');
    const order = ['Params', 'Input', 'Maths', 'Sets', 'Vector', 'Curve', 'Transform', 'Display'];

    const render = q => {
      q = (q || '').toLowerCase();
      let html = '';
      for (const cat of order) {
        const defs = Object.values(NODE_DEFS)
          .filter(d => d.cat === cat)
          .filter(d => !q || d.title.toLowerCase().includes(q) || d.id.includes(q))
          .sort((a, b) => a.title.localeCompare(b.title));
        if (!defs.length) continue;
        html += `<div class="pal-cat" style="--c:${CATS[cat]}">${cat}</div>`;
        html += defs.map(d =>
          `<div class="pal-item" data-type="${d.id}" title="${d.desc || ''}">
            <span class="dot" style="background:${CATS[cat]}"></span>${d.title}
          </div>`).join('');
      }
      list.innerHTML = html;
    };
    render('');
    search.addEventListener('input', () => render(search.value));
    list.addEventListener('click', e => {
      const item = e.target.closest('.pal-item');
      if (item) Editor.addAtCenter(item.dataset.type);
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
      App.download('weft-demo.html', WeftExport.buildDemoHTML(code.value), 'text/html');
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
