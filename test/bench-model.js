#!/usr/bin/env node
'use strict';
/*
 * Model bench — does an open model speak weft-ops? Headless, no browser.
 *
 *   node test/bench-model.js --model openai/gpt-oss-120b "a breathing circle"
 *   node test/bench-model.js --model openai/gpt-oss-120b --prompts test/bench/prompts.json
 *
 * Options:
 *   --model <id>[:provider]  Hugging Face router model id (required)
 *   --graph <file>           replay a real loom: start from this graph (a saved .json or a copied patch)
 *   --select <id,id>         …with these nodes selected (single prompt only)
 *   --history <file>         …after these prior turns (JSON [{role,text}], as the panel sends)
 *   --prompts <file>         JSON array of {id, level, prompt, example?, select?}
 *   --only <id,id>           run just these prompt ids
 *   --repair                 on rejected ops, send the validator's errors back once
 *   --effort low|medium|high reasoning_effort for models that take it (default low)
 *   --temp <n>               temperature (default 0.6)
 *   --out <dir>              where results land (default test/bench/out/<model>)
 *
 * Token: HF_TOKEN env var, else ~/.hf-token. Never in the repo.
 *
 * Each prompt runs the same pipeline the panel does — system prompt
 * (docs/ASSISTANT-CORE.md + docs/LLM-AUTHORING.md), graph + selection +
 * message, reply → WeftOps.parseReply → WeftOps.apply → evaluate at
 * t = 0 / 0.5 / 2 → export compiles — and records validity, latency, tokens
 * and the resulting graph (paste it into Weft to look at it).
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : dflt; };
const flag = name => args.includes('--' + name);
const model = opt('model');
if (!model) { console.error('usage: node test/bench-model.js --model <id> ("prompt" | --prompts file.json)'); process.exit(1); }
const VALUED = ['--model', '--prompts', '--only', '--effort', '--temp', '--out', '--graph', '--select', '--history'];
const positional = args.filter((a, i) => !a.startsWith('--') && !VALUED.includes(args[i - 1]));

let token = process.env.HF_TOKEN;
if (!token) { try { token = fs.readFileSync(path.join(os.homedir(), '.hf-token'), 'utf8').trim(); } catch (e) {} }
if (!token) { console.error('no token: set HF_TOKEN or write it to ~/.hf-token'); process.exit(1); }

/* ---- Weft runtime, same load as validate-patch.js plus examples + ops ---- */
const src = 'const window = { addEventListener: () => {} };\n'
  + ['js/engine.js', 'js/nodes.js', 'js/nodes-3d.js', 'js/audio.js', 'js/examples.js', 'js/export.js', 'js/ops.js']
    .map(f => fs.readFileSync(path.join(root, f), 'utf8'))
    .join('\n;\n');
const { LM, NODE_DEFS, WeftExport, WeftOps, EXAMPLES } = new Function(src + '\nreturn { LM, NODE_DEFS, WeftExport, WeftOps, EXAMPLES };')();

const CORE = fs.readFileSync(path.join(root, 'docs/ASSISTANT-CORE.md'), 'utf8');
const SPEC = fs.readFileSync(path.join(root, 'docs/LLM-AUTHORING.md'), 'utf8');
const SYSTEM = CORE + '\n\nAUTHORITATIVE WEFT AUTHORING SPEC (node types, ports, list semantics):\n\n' + SPEC;

/* ---- the prompts ---- */
let prompts;
if (opt('prompts')) prompts = JSON.parse(fs.readFileSync(opt('prompts'), 'utf8'));
else if (positional.length) prompts = [{ id: 'adhoc', level: 0, prompt: positional.join(' '), graph: opt('graph'), select: opt('select') ? opt('select').split(',') : undefined, history: opt('history') }];
else { console.error('give a prompt or --prompts file'); process.exit(1); }
if (opt('only')) { const keep = new Set(opt('only').split(',')); prompts = prompts.filter(p => keep.has(p.id)); }

const outDir = opt('out', path.join(root, 'test/bench/out', model.replace(/[^\w.-]+/g, '_')));
fs.mkdirSync(outDir, { recursive: true });

/* ---- validate a graph the way validate-patch.js does ---- */
const mkCtx = t => ({
  t, dt: 0.016, frame: Math.round(t * 60),
  mouse: { x: 12, y: -8, nx: 0.55, ny: 0.45, down: false, pressed: false, released: false },
  keys: { down: {}, pressed: {}, released: {} },
  scroll: { y: 0, max: 0, v: 0 },
  W: 800, H: 600, defs: NODE_DEFS,
  measureText: (s, sz) => ({ w: String(s).length * sz * 0.6, h: sz * 1.2 }),
  drawList: [], domList: [], audioList: [], audioState: {}, domState: {}, bg: null, errors: {}, out: {},
  tuneA4: 432
});
const check = g => {
  const evalErrors = [];
  let drew = false, sink = false;
  for (const t of [0, 0.5, 2]) {
    const c = mkCtx(t);
    LM.evaluateGraph(g, NODE_DEFS, c);
    for (const nid of Object.keys(c.errors)) evalErrors.push('t=' + t + ' ' + nid + ': ' + c.errors[nid]);
    drew = drew || c.drawList.length > 0;
    sink = sink || c.domList.length > 0 || c.audioList.length > 0;
  }
  let exportOk = true, exportErr = '';
  try { new Function(WeftExport.buildJS(g)); } catch (e) { exportOk = false; exportErr = e.message; }
  return { evalOk: !evalErrors.length, evalErrors, drew: drew || sink, exportOk, exportErr };
};

/* ---- the model ---- */
const chat = async messages => {
  const body = {
    model,
    messages,
    max_tokens: 32000, // output budget incl. hidden reasoning — matches the workflow
    temperature: +opt('temp', 0.6), // Qwen's thinking-mode recommendation; 0.2 loops
    reasoning_effort: opt('effort', 'low')
  };
  const t0 = Date.now();
  const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(body)
  });
  const ms = Date.now() - t0;
  const text = await res.text();
  if (!res.ok) throw new Error('router ' + res.status + ': ' + text.slice(0, 300));
  const data = JSON.parse(text);
  const choice = (data.choices && data.choices[0]) || {};
  const msg = choice.message || {};
  return { text: String(msg.content || ''), ms, usage: data.usage || {}, provider: data.provider || (data.model || ''), finish: choice.finish_reason || '' };
};

const userTurn = (graph, select, message) =>
  'CURRENT GRAPH (weft format 2):\n' + JSON.stringify(graph)
  + '\n\nSELECTED NODE IDS: ' + JSON.stringify(select || [])
  + '\n\nLIVE EVAL ERRORS: {}'
  + '\n\nUSER MESSAGE:\n' + message;

const run = async p => {
  if (p.example && !EXAMPLES[p.example]) throw new Error('no example "' + p.example + '"');
  const base = p.graph ? (g => ({ nodes: g.nodes || [], wires: g.wires || [] }))(JSON.parse(fs.readFileSync(p.graph, 'utf8')))
    : p.example ? JSON.parse(JSON.stringify(EXAMPLES[p.example])) : { nodes: [], wires: [] };
  const messages = [{ role: 'system', content: SYSTEM }];
  if (p.history) for (const t of JSON.parse(fs.readFileSync(p.history, 'utf8'))) if (t && t.text) messages.push({ role: t.role === 'assistant' ? 'assistant' : 'user', content: String(t.text) });
  messages.push({ role: 'user', content: userTurn(base, p.select, p.prompt) });
  const rec = { id: p.id, level: p.level, prompt: p.prompt, example: p.example || null, model, turns: 0, ms: 0, tokens: {} };
  let result = null, reply = null;

  // one shot, or two with --repair: a rejected op list or an eval error goes
  // back as a [system] turn, the way the panel feeds errors into the next
  // message. Eval-error repair continues from the applied graph.
  let graph = base;
  for (let attempt = 0; attempt < (flag('repair') ? 2 : 1); attempt++) {
    const r = await chat(messages);
    rec.turns++; rec.ms += r.ms;
    rec.tokens = { in: (rec.tokens.in || 0) + (r.usage.prompt_tokens || 0), out: (rec.tokens.out || 0) + (r.usage.completion_tokens || 0) };
    rec.provider = r.provider;
    reply = WeftOps.parseReply(r.text);
    rec.raw = r.text; rec.finish = r.finish;
    let feedback;
    if (!reply.ops) {
      const cut = r.finish === 'length' || /```(weft-ops|json)?[^`]*$/.test(r.text);
      rec.stage = cut ? 'truncated' : (/```/.test(r.text) ? 'bad-json' : 'no-ops');
      rec.errors = [cut ? 'the reply was cut off mid-fence (finish_reason ' + r.finish + ')' : rec.stage === 'bad-json' ? 'the weft-ops block is not valid JSON' : 'no weft-ops block in the reply'];
      result = null;
      if (rec.stage === 'no-ops') break;
      feedback = '[system] ' + rec.errors[0] + ' — nothing was applied. Resend the complete weft-ops block as strict JSON (numbers only, no expressions or comments).';
    } else if ((result = WeftOps.apply(graph, reply.ops, NODE_DEFS)).errors.length || !result.graph) {
      rec.stage = 'rejected'; rec.errors = result.errors; result = null;
      feedback = '[system] your ops were rejected: ' + rec.errors.join('; ') + ' — nothing was applied, please correct and resend the full weft-ops block.';
    } else {
      graph = result.graph;
      const c = check(graph);
      rec.stage = !c.evalOk ? 'eval-error' : !c.exportOk ? 'export-error' : !c.drew ? 'silent' : 'ok';
      rec.errors = c.evalErrors.concat(c.exportOk ? [] : [c.exportErr]);
      if (rec.stage === 'ok' || rec.stage === 'silent') break;
      const errs = {};
      for (const e of c.evalErrors) { const m = e.match(/^t=\S+ (\S+): (.*)$/); if (m) errs[m[1]] = m[2]; }
      messages.push({ role: 'assistant', content: r.text });
      messages.push({ role: 'user', content: userTurn(graph, [], '[system] applied, but the loom now shows eval errors — fix them with further ops. Remember cycles are only legal through state/delay.').replace('LIVE EVAL ERRORS: {}', 'LIVE EVAL ERRORS: ' + JSON.stringify(errs)) });
      continue;
    }
    messages.push({ role: 'assistant', content: r.text });
    messages.push({ role: 'user', content: feedback });
  }

  if (graph !== base || (result && result.graph)) {
    rec.summary = result ? result.summary : '(repaired)';
    rec.types = Array.from(new Set(graph.nodes.map(n => n.type)));
    rec.nodes = graph.nodes.length;
    rec.reply = reply.reply;
    fs.writeFileSync(path.join(outDir, p.id + '.json'), JSON.stringify(Object.assign({ format: 2 }, graph), null, 1));
  }
  return rec;
};

(async () => {
  console.log('model ' + model + ' · ' + prompts.length + ' prompt(s) · system prompt ~' + Math.round(SYSTEM.length / 4) + ' tokens' + (flag('repair') ? ' · repair on' : ''));
  const log = fs.createWriteStream(path.join(outDir, 'results.jsonl'), { flags: 'a' });
  const tally = {};
  for (const p of prompts) {
    let rec;
    try { rec = await run(p); }
    catch (e) {
      rec = { id: p.id, level: p.level, prompt: p.prompt, model, stage: 'request-failed', errors: [String(e.message || e)] };
      if (/router 402/.test(rec.errors[0])) { console.log('STOP the router says the HF account is out of credits (402) — top up at huggingface.co/settings/billing'); break; }
    }
    rec.at = new Date().toISOString();
    log.write(JSON.stringify(rec) + '\n');
    tally[rec.stage] = (tally[rec.stage] || 0) + 1;
    const mark = rec.stage === 'ok' ? 'OK  ' : rec.stage === 'silent' ? 'SIL ' : 'FAIL';
    console.log(mark + ' L' + rec.level + ' ' + rec.id.padEnd(14) + (rec.ms ? (rec.ms / 1000).toFixed(1) + 's ' : '') + (rec.tokens && rec.tokens.out ? rec.tokens.out + 'tok ' : '') + (rec.nodes ? rec.nodes + ' nodes ' : '') + '— ' + rec.stage + (rec.turns > 1 ? ' (after repair)' : ''));
    if (rec.stage !== 'ok') for (const e of (rec.errors || []).slice(0, 4)) console.log('       ' + e.slice(0, 200));
    if (rec.stage === 'ok' && prompts.length === 1) { console.log('\n' + (rec.reply || '')); console.log('\n' + rec.summary + ' → ' + path.join(outDir, p.id + '.json')); }
  }
  log.end();
  console.log('\n' + Object.entries(tally).map(([k, v]) => k + ' ' + v).join(' · ') + ' · results → ' + path.join(outDir, 'results.jsonl'));
})();
