'use strict';
/* Regenerates nodes.html — the public, searchable index of every node — from
 * the real js/nodes.js + js/icons.js, so the page always matches the app.
 * Run after changing nodes.js or icons.js:
 *   node test/gen-node-index.js [outfile]
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUT = process.argv[2] || path.join(ROOT, 'nodes.html');

const sandbox = { console };
vm.createContext(sandbox);
for (const f of ['js/engine.js', 'js/nodes.js', 'js/icons.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
const { WEFT_ICONS, WEFT_CAT_ICONS, NODE_DEFS, CATS, TYPE_COLORS } =
  vm.runInContext('({ WEFT_ICONS, WEFT_CAT_ICONS, NODE_DEFS, CATS, TYPE_COLORS })', sandbox);
const logo = vm.runInContext('weftLogoSVG("nx")', sandbox);

const order = ['Params', 'Input', 'State', 'Maths', 'Sets', 'Vector', 'Curve', 'Transform', 'Display'];
const items = Object.values(NODE_DEFS)
  .filter(d => !d.hidden)
  .map(d => ({
    id: d.id, title: d.title, cat: d.cat, desc: d.desc || '',
    icon: WEFT_ICONS[d.id] || WEFT_CAT_ICONS[d.cat] || '',
    ins: (d.inputs || []).map(p => ({ n: p.name, t: p.type, l: p.label || '' })),
    outs: (d.outputs || []).map(p => ({ n: p.name, t: p.type, l: p.label || '' }))
  }))
  .sort((a, b) => (order.indexOf(a.cat) - order.indexOf(b.cat)) || a.title.localeCompare(b.title));

const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<title>weft — node index</title>
<style>
  :root { --bg:#0b0e14; --panel:#10141d; --line:#1e2635; --line2:#273143; --ink:#e6edfa;
    --muted:#8494ad; --faint:#5b6880; --accent:#5eead4; }
  * { box-sizing: border-box; }
  html { background: var(--bg); }
  body { margin:0; background:var(--bg); color:var(--ink);
    font:15px/1.55 "Segoe UI", system-ui, sans-serif; font-weight:300; -webkit-font-smoothing:antialiased; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .wrap { max-width:1100px; margin:0 auto; padding:36px 28px 96px; }
  nav { display:flex; align-items:center; gap:18px; margin-bottom:40px; font-size:13px; color:var(--muted); }
  nav .mark { width:26px; height:26px; flex:none; }
  nav .mark svg { width:100%; height:100%; display:block; }
  nav b { font-weight:600; letter-spacing:0.28em; color:var(--ink); margin-right:auto; }
  h1 { font-size:26px; font-weight:300; margin:0 0 8px; }
  .sub { color:var(--muted); max-width:64ch; margin:0 0 22px; }
  #q { width:min(420px,100%); padding:8px 13px; background:var(--panel); color:var(--ink);
    border:1px solid var(--line2); border-radius:8px; outline:none; font:inherit; font-size:14px; }
  #q:focus { border-color:#2dd4bf66; }
  section { margin-top:38px; }
  .cat-head { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .cat-dot { width:13px; height:13px; border-radius:50%; flex:none; }
  .cat-name { font-size:16px; font-weight:400; }
  .cat-count { color:var(--faint); font-size:13px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(330px, 1fr)); gap:10px; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:13px 14px 11px; }
  .card.hide { display:none; }
  .head { display:flex; align-items:center; gap:10px; }
  .head svg { width:30px; height:30px; flex:none; }
  .title { font-size:14.5px; font-weight:500; }
  .nid { font-family:ui-monospace,Consolas,monospace; font-size:11px; color:var(--faint); }
  .desc { margin:8px 0 9px; font-size:12.5px; color:var(--muted); min-height:2.6em; }
  .ports { display:flex; gap:14px; font-size:11px; color:var(--faint); }
  .ports .lbl { letter-spacing:0.08em; text-transform:uppercase; font-size:9px; margin-right:2px; }
  .chip { display:inline-flex; align-items:center; gap:4px; margin-right:7px;
    font-family:ui-monospace,Consolas,monospace; font-size:11px; color:var(--muted); }
  .chip i { width:7px; height:7px; border-radius:50%; flex:none; }
  .none { color:var(--faint); font-style:italic; }
  .empty { display:none; color:var(--faint); margin-top:40px; }
  footer { margin-top:60px; font-size:12px; color:var(--faint); }
</style>
<div class="wrap">
  <nav>
    <span class="mark">${logo}</span><b>WEFT</b>
    <a href="index.html">open the loom</a>
    <a href="about.html">about</a>
    <a href="https://github.com/Iris-Cocreative/weft">github</a>
  </nav>
  <h1>node index</h1>
  <p class="sub">every node in the library — what it does and the ports it speaks through.
  wires carry <em>lists</em>; every node maps over what it's given. port colours are the wire
  colours in the editor. this page is generated from the app itself, so it never drifts.</p>
  <input id="q" placeholder="search ${items.length} nodes…" spellcheck="false">
  <div id="app"></div>
  <p class="empty" id="empty">nothing matches — try a looser word.</p>
  <footer>generated from <code>js/nodes.js</code> by <code>test/gen-node-index.js</code> · woven by
  <a href="https://www.iriscocreative.com">IRIS Cocreative</a></footer>
</div>
<script>
const CATS = ${JSON.stringify(CATS)};
const TYPES = ${JSON.stringify(TYPE_COLORS)};
const ITEMS = ${JSON.stringify(items)};
const ORDER = ${JSON.stringify(order)};
const svg = inner => '<svg viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
// the swatch has no SVG on purpose — in the app its glyph is a conic-gradient circle
const glyph = d => d.id === 'params/swatch'
  ? '<span style="width:22px;height:22px;margin:4px;border-radius:50%;flex:none;background:conic-gradient(#f66,#fc6,#6f6,#6cf,#66f,#f6f,#f66)"></span>'
  : svg(d.icon);
const chips = L => L.length ? L.map(p =>
  '<span class="chip" title="' + (p.l || p.n) + ' · ' + p.t + '"><i style="background:' + (TYPES[p.t] || '#888') + '"></i>' + p.n + '</span>'
).join('') : '<span class="none">none</span>';
let html = '';
for (const cat of ORDER) {
  const its = ITEMS.filter(d => d.cat === cat);
  if (!its.length) continue;
  html += '<section data-cat="' + cat + '"><div class="cat-head"><span class="cat-dot" style="background:' + CATS[cat] + '"></span>' +
    '<span class="cat-name">' + cat.toLowerCase() + '</span><span class="cat-count">' + its.length + ' nodes</span></div><div class="grid">' +
    its.map(d => '<div class="card" data-s="' + (d.title + ' ' + d.id + ' ' + d.desc).toLowerCase().replace(/"/g, '') + '">' +
      '<div class="head" style="color:' + CATS[d.cat] + '">' + glyph(d) +
      '<div><div class="title" style="color:var(--ink)">' + d.title + '</div><div class="nid">' + d.id + '</div></div></div>' +
      '<div class="desc">' + d.desc + '</div>' +
      '<div class="ports"><span><span class="lbl">in</span> ' + chips(d.ins) + '</span>' +
      '<span><span class="lbl">out</span> ' + chips(d.outs) + '</span></div></div>').join('') +
    '</div></section>';
}
document.getElementById('app').innerHTML = html;
document.getElementById('q').addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  let any = false;
  for (const c of document.querySelectorAll('.card')) {
    const hit = !q || c.dataset.s.includes(q);
    c.classList.toggle('hide', !hit);
    if (hit) any = true;
  }
  for (const s of document.querySelectorAll('section'))
    s.style.display = [...s.querySelectorAll('.card')].some(c => !c.classList.contains('hide')) ? '' : 'none';
  document.getElementById('empty').style.display = any ? 'none' : 'block';
});
</script>
</html>
`;
fs.writeFileSync(OUT, html);
console.log('wrote ' + path.relative(ROOT, OUT) + ' - ' + items.length + ' nodes');
