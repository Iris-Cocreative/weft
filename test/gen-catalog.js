#!/usr/bin/env node
'use strict';
/*
 * Generates docs/NODE-CATALOG.md from NODE_DEFS so the catalog can never
 * drift from the code. Rerun after any change to js/nodes.js:
 *   & "C:\Users\james\Desktop\Claude Code\.tools\node\node.exe" test\gen-catalog.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = ['js/engine.js', 'js/nodes.js', 'js/icons.js']
  .map(f => fs.readFileSync(path.join(root, f), 'utf8'))
  .join('\n;\n');

const { defs, icons, catIcons } = new Function(src +
  '\nreturn { defs: NODE_DEFS, icons: WEFT_ICONS, catIcons: WEFT_CAT_ICONS };')();

const fmtDefault = v => {
  if (v === undefined) return '';
  if (typeof v === 'object') return '`' + JSON.stringify(v) + '`';
  return '`' + JSON.stringify(v) + '`';
};

const order = ['Input', 'Params', 'State', 'Maths', 'Sets', 'Vector', 'Curve', 'Transform', 'Display'];
let md = `# Weft node catalog

*Auto-generated from \`js/nodes.js\` by \`test/gen-catalog.js\` — do not edit by hand.*
*See \`NODE-SPEC.md\` for the semantics (types, list matching, graph JSON).*

`;

for (const cat of order) {
  const list = Object.values(defs).filter(d => d.cat === cat)
    .sort((a, b) => a.title.localeCompare(b.title));
  if (!list.length) continue;
  md += `## ${cat}\n\n`;
  for (const d of list) {
    md += `### \`${d.id}\` — ${d.title}\n\n${d.desc || ''}\n\n`;
    if ((d.inputs || []).length) {
      md += '| in | type | default | note |\n|---|---|---|---|\n';
      for (const p of d.inputs) {
        const listIn = (d.listInputs || []).includes(p.name) ? 'receives whole list' : '';
        md += `| ${p.name} | ${p.type} | ${fmtDefault(p.default)} | ${[p.label, listIn].filter(Boolean).join(' · ')} |\n`;
      }
      md += '\n';
    }
    if ((d.outputs || []).length) {
      md += '| out | type | note |\n|---|---|---|\n';
      for (const p of d.outputs) md += `| ${p.name} | ${p.type} | ${p.label || ''} |\n`;
      md += '\n';
    }
    if (d.defaults) md += `Node values (\`values\` keys, not ports): \`${JSON.stringify(d.defaults)}\`\n\n`;
  }
}

/* icon coverage — glyphs are drawn in Figma and land in js/icons.js;
 * partial coverage is expected, silent staleness is not */
const noIcon = Object.values(defs)
  .filter(d => !icons[d.id] && !catIcons[d.cat] && d.id !== 'params/swatch')
  .map(d => '`' + d.id + '`');
md += `## Icon coverage\n\n${Object.keys(icons).length + 1} node glyphs + ` +
  `${Object.keys(catIcons).length} category fallback(s) in \`js/icons.js\`. ` +
  (noIcon.length ? `Nodes still using the category-dot fallback (${noIcon.length}): ${noIcon.join(', ')}\n` : 'Full coverage.\n');

const out = path.join(root, 'docs', 'NODE-CATALOG.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md);
console.log('wrote docs/NODE-CATALOG.md — ' + Object.keys(defs).length + ' nodes, ' +
  noIcon.length + ' without a glyph');
