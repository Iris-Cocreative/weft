'use strict';
/* Weft app shell — palette, toolbar, persistence, export modal, splitter. */
const App = {
  graph: { nodes: [], wires: [] },

  setGraph(g) {
    App.graph = g;
    Editor.setGraph(g);
    App.updateCounts();
    App.save();
  },

  /* ------------------------------ persistence ------------------------------ */

  _saveTimer: null,
  save() {
    clearTimeout(App._saveTimer);
    App._saveTimer = setTimeout(() => {
      try {
        localStorage.setItem('weft:autosave', JSON.stringify({
          nodes: App.graph.nodes.map(n => ({ id: n.id, type: n.type, x: n.x, y: n.y, values: n.values })),
          wires: App.graph.wires.map(w => ({ id: w.id, from: w.from, to: w.to }))
        }));
      } catch (e) { /* storage unavailable */ }
      App.updateCounts();
    }, 400);
  },

  restore() {
    try {
      const raw = localStorage.getItem('weft:autosave');
      if (raw) {
        const g = JSON.parse(raw);
        if (g && Array.isArray(g.nodes) && g.nodes.length) return g;
      }
    } catch (e) { /* fall through */ }
    return null;
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
    Editor.init(() => App.save());
    Viewport.init();
    App.buildPalette();
    App.bindToolbar();
    App.bindSplitter();
    App.bindExport();

    const g = App.restore() || JSON.parse(JSON.stringify(EXAMPLES['Phyllotaxis']));
    App.setGraph(g);
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
      try { localStorage.setItem('weft:backup', JSON.stringify(App.graph)); } catch (e) {}
      App.setGraph({ nodes: [], wires: [] });
      App.flash('canvas cleared — previous graph backed up');
    });

    document.getElementById('btnSave').addEventListener('click', () => {
      App.download('weft-graph.json', JSON.stringify(App.graph, null, 2), 'application/json');
    });

    const fileInput = document.getElementById('fileInput');
    document.getElementById('btnLoad').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const f = fileInput.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const g = JSON.parse(r.result);
          if (!g || !Array.isArray(g.nodes) || !Array.isArray(g.wires)) throw new Error('not a weft graph');
          App.setGraph(g);
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
