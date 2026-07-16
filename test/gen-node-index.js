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
const catDesc = {
  Params: 'hand-set values and inspectors — sliders, toggles, swatches, points, and the pads and graphs that watch what flows through the wires.',
  Input: 'the outside world flowing in — mouse, time, keyboard, scroll, viewport, and hotspots that turn any geometry into interface.',
  State: 'nodes that remember across frames — eased followers, latches, counters, timers, and the Delay that makes feedback loops legal.',
  Maths: 'number bending — arithmetic, trig, rounding, remapping, free-typed expressions and logic.',
  Sets: 'list machinery — generate series, pick and merge items, cull by pattern, dispatch; list matching is the soul of the tool.',
  Vector: 'points and vectors — construct them, split them, measure distance and angle, swing them polar.',
  Curve: 'drawable geometry — lines, circles, polygons, rects and arcs, plus the tools that divide and evaluate along them.',
  Transform: 'reshape geometry — move, rotate, scale; transforms stack, and lists of transforms fan one shape into many.',
  Display: 'where the graph touches the cloth — strokes and fills, colour tools, text, backgrounds, streaming traces, real DOM elements.'
};
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
  nav b { font-weight:600; letter-spacing:0.28em; color:var(--ink); }
  nav .tagline { color:var(--faint); font-size:12px; margin-right:6px; }
  nav a.here { color:var(--ink); }
  nav a:last-child { margin-left:auto; }
  @media (max-width:640px) { nav .tagline { display:none; } }
  h1 { font-size:26px; font-weight:300; margin:0 0 8px; }
  .sub { color:var(--muted); max-width:64ch; margin:0 0 22px; }
  #q { width:min(420px,100%); padding:8px 13px; background:var(--panel); color:var(--ink);
    border:1px solid var(--line2); border-radius:8px; outline:none; font:inherit; font-size:14px; }
  #q:focus { border-color:#2dd4bf66; }
  section { margin-top:44px; }
  .cat-head { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
  .cat-dot { width:13px; height:13px; border-radius:50%; flex:none; }
  .cat-name { font-size:16px; font-weight:400; }
  .cat-count { color:var(--faint); font-size:13px; }
  .cat-sub { color:var(--muted); font-size:12.5px; max-width:72ch; margin:0 0 14px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:10px; }
  /* card livery mirrors the loom: category gradient washing in from the left */
  .card { display:flex; flex-direction:column;
    background:
      linear-gradient(90deg, color-mix(in srgb, var(--cat, #6b7891) 40%, transparent) 0%, rgba(20,26,40,0) 50%),
      #151b29;
    border:1px solid #1e2533; border-radius:13px; padding:13px 14px 12px;
    box-shadow:0 6px 18px rgba(0,0,0,0.3); }
  .card.hide { display:none; }
  .head { display:flex; align-items:center; gap:10px; }
  .head svg { width:30px; height:30px; flex:none; }
  .title { font-size:14.5px; font-weight:500; }
  .nid { font-family:ui-monospace,Consolas,monospace; font-size:11px; color:var(--faint); }
  .desc { margin:8px 0 10px; font-size:12.5px; color:var(--muted); flex:1; }
  .ports { display:grid; grid-template-columns:1fr 1fr; gap:16px;
    border-top:1px solid rgba(255,255,255,0.06); padding-top:9px; }
  .ports .lbl { display:block; letter-spacing:0.08em; text-transform:uppercase;
    font-size:9px; color:var(--faint); margin-bottom:4px; }
  .prow { display:flex; align-items:flex-start; gap:6px; font-size:11px; margin-bottom:3px; }
  .prow i { width:7px; height:7px; border-radius:50%; flex:none; margin-top:3.5px; }
  .prow b { font-family:ui-monospace,Consolas,monospace; font-weight:600; color:var(--ink); flex:none; }
  .prow span { color:var(--faint); }
  .none { color:var(--faint); font-style:italic; font-size:11px; }
  .empty { display:none; color:var(--faint); margin-top:40px; }
  footer { margin-top:60px; font-size:12px; color:var(--faint); }
</style>
<div class="wrap">
  <nav>
    <span class="mark">${logo}</span><b>WEFT</b>
    <span class="tagline">weave parameters into web experiences</span>
    <a href="about.html">about</a>
    <a class="here" href="nodes.html">nodes</a>
    <a href="index.html">loom</a>
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
const CATDESC = ${JSON.stringify(catDesc)};
const TYPES = ${JSON.stringify(TYPE_COLORS)};
const ITEMS = ${JSON.stringify(items)};
const ORDER = ${JSON.stringify(order)};
const svg = inner => '<svg viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
// the swatch has no SVG on purpose — in the app its glyph is a conic-gradient circle
const glyph = d => d.id === 'params/swatch'
  ? '<span style="width:22px;height:22px;margin:4px;border-radius:50%;flex:none;background:conic-gradient(#f66,#fc6,#6f6,#6cf,#66f,#f6f,#f66)"></span>'
  : svg(d.icon);
/* port rows mirror the loom's hover text: label (or name) · type */
const rows = L => L.length ? L.map(p =>
  '<div class="prow"><i style="background:' + (TYPES[p.t] || '#888') + '"></i><b>' + p.n + '</b>' +
  '<span>' + (p.l ? p.l + ' · ' : '') + p.t + '</span></div>'
).join('') : '<div class="none">none</div>';
let html = '';
for (const cat of ORDER) {
  const its = ITEMS.filter(d => d.cat === cat);
  if (!its.length) continue;
  html += '<section data-cat="' + cat + '"><div class="cat-head"><span class="cat-dot" style="background:' + CATS[cat] + '"></span>' +
    '<span class="cat-name">' + cat.toLowerCase() + '</span><span class="cat-count">' + its.length + ' nodes</span></div>' +
    '<p class="cat-sub">' + (CATDESC[cat] || '') + '</p><div class="grid">' +
    its.map(d => '<div class="card" style="--cat:' + CATS[d.cat] + '" data-s="' +
      (d.title + ' ' + d.id + ' ' + d.desc + ' ' + d.ins.concat(d.outs).map(p => p.l).join(' ')).toLowerCase().replace(/"/g, '') + '">' +
      '<div class="head" style="color:' + CATS[d.cat] + '">' + glyph(d) +
      '<div><div class="title" style="color:var(--ink)">' + d.title + '</div><div class="nid">' + d.id + '</div></div></div>' +
      '<div class="desc">' + d.desc + '</div>' +
      '<div class="ports"><div><span class="lbl">in</span>' + rows(d.ins) + '</div>' +
      '<div><span class="lbl">out</span>' + rows(d.outs) + '</div></div></div>').join('') +
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
