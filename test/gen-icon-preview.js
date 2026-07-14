'use strict';
/* Regenerates docs/icons.html — a visual sheet of every node glyph — from the
 * real js/icons.js + js/nodes.js, so the sheet always shows what the app
 * ships. Run after changing icons.js:
 *   node test/gen-icon-preview.js [outfile]
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUT = process.argv[2] || path.join(ROOT, 'docs', 'icons.html');

// classic scripts, shared globals — eval them in one sandbox like the browser would
const sandbox = { console };
vm.createContext(sandbox);
for (const f of ['js/engine.js', 'js/nodes.js', 'js/icons.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
const { WEFT_ICONS, NODE_DEFS, CATS } = vm.runInContext('({ WEFT_ICONS, NODE_DEFS, CATS })', sandbox);

const order = ['Params', 'Input', 'State', 'Maths', 'Sets', 'Vector', 'Curve', 'Transform', 'Display', 'Meta'];
const items = [];
for (const def of Object.values(NODE_DEFS)) {
  const inner = WEFT_ICONS[def.id];
  if (inner) items.push({ id: def.id, title: def.title, cat: def.cat, inner });
}
items.sort((a, b) => (order.indexOf(a.cat) - order.indexOf(b.cat)) || a.title.localeCompare(b.title));

const html = `<!doctype html>
<meta charset="utf-8">
<title>weft node icons</title>
<style>
  :root { --bg:#0b0e14; --panel:#10141d; --line:#1e2635; --ink:#e6edfa; --muted:#8494ad; --faint:#5b6880; }
  html { background: var(--bg); }
  body { margin:0; background:var(--bg); color:var(--ink);
    font:15px/1.55 "Segoe UI", system-ui, sans-serif; font-weight:300; -webkit-font-smoothing:antialiased; }
  .wrap { max-width:1060px; margin:0 auto; padding:48px 28px 96px; }
  h1 { font-size:26px; font-weight:300; margin:0 0 8px; } h1 b { font-weight:600; }
  .sub { color:var(--muted); max-width:62ch; margin:0; }
  .sub code { font-family:ui-monospace,Consolas,monospace; font-size:13px; color:var(--ink);
    background:#151a26; padding:1px 6px; border-radius:4px; }
  section { margin-top:44px; }
  .cat-head { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .cat-dot { width:14px; height:14px; border-radius:50%; flex:none; }
  .cat-name { font-size:17px; font-weight:400; }
  .cat-count { color:var(--faint); font-size:13px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:12px; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:10px;
    padding:16px 14px 13px; display:flex; flex-direction:column; align-items:center; gap:10px; }
  .stage { display:flex; align-items:flex-end; gap:16px; }
  .stage svg { display:block; }
  .big svg { width:81px; height:81px; }
  .real { display:flex; flex-direction:column; align-items:center; gap:5px; }
  .real svg { width:27px; height:27px; }
  .real span { font-size:10px; color:var(--faint); letter-spacing:0.06em; }
  .meta { text-align:center; color:var(--ink); }
  .meta .id { font-family:ui-monospace,Consolas,monospace; font-size:12px; color:var(--muted); }
  .meta .title { font-size:14px; font-weight:400; }
</style>
<div class="wrap">
  <h1><b>weft</b> node icons</h1>
  <p class="sub">every node glyph in the app (generated from <code>js/icons.js</code> by
  <code>test/gen-icon-preview.js</code> — do not edit by hand): 27&times;27, 1px
  <code>currentColor</code> strokes, shown at 3&times; and true size on the editor dark.</p>
  <div id="app"></div>
</div>
<script>
const CATS = ${JSON.stringify(CATS)};
const ITEMS = ${JSON.stringify(items)};
const ORDER = ${JSON.stringify(order)};
const svg = inner => '<svg viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
let html = '';
for (const cat of ORDER) {
  const its = ITEMS.filter(d => d.cat === cat);
  if (!its.length) continue;
  html += '<section><div class="cat-head"><span class="cat-dot" style="background:' + CATS[cat] + '"></span>' +
    '<span class="cat-name">' + cat.toLowerCase() + '</span><span class="cat-count">' + its.length + ' icons</span></div><div class="grid">' +
    its.map(d => '<div class="card" style="color:' + CATS[d.cat] + '">' +
      '<div class="stage"><div class="big">' + svg(d.inner) + '</div>' +
      '<div class="real">' + svg(d.inner) + '<span>1:1</span></div></div>' +
      '<div class="meta"><div class="title">' + d.title + '</div><div class="id">' + d.id + '</div></div></div>').join('') +
    '</div></section>';
}
document.getElementById('app').innerHTML = html;
</script>
`;
fs.writeFileSync(OUT, html);
console.log('wrote ' + path.relative(ROOT, OUT) + ' - ' + items.length + ' icons');
