# The weave assistant

A chat panel on the loom (the ✦ button, top-right) that sends your message —
plus the graph, your selection, live errors, and a snapshot of the cloth — to
a model through an **n8n webhook**, and applies the model's edits back onto
the canvas as validated, undoable graph ops.

The public webhook URL is baked into the panel (`Assistant.DEFAULT_URL`), so
a tester only needs the **shared key** — it lives in that browser's
localStorage (`weft:assistant`) and never in the repo. The key is the cost
gate: without it the ✦ opens on the setup form and nothing is sent. An
optional *name* travels with each turn as `tester` so test logs can be told
apart, and "own webhook" under the form lets anyone point at their own
workflow instead.

**molt** (in the panel header) clears the chat — the model forgets the
conversation, the loom stays. It trims only the history (~12 turns of text;
ops fences are never stored), so the per-call cost stays dominated by the
spec + graph; use it for a clean start rather than to save tokens.

```
Weft panel ──POST {message, graph, selection, errors, history, snapshot}──▶ n8n webhook
                                                                              │ key check (x-weft-key)
                                                                              │ fetch docs/ASSISTANT-CORE.md + docs/LLM-AUTHORING.md (live prompt + spec)
                                                                              │ the model (Hugging Face router, or Claude)
Weft panel ◀────────────── {reply, ops[]} ◀───────────────────────────────── parse weft-ops fence
```

Two workflow files do the same job with different models; the panel can't
tell them apart, so switching is a matter of which URL you paste in:

| File | Model | Notes |
|---|---|---|
| `tools/n8n-weave-assistant-hf.json` | any open model on the **Hugging Face router** (default `Qwen/Qwen3.8-27B`) | the one to start with — see the bench scores in `HF-INTEGRATION-PLAN.md` |
| `tools/n8n-weave-assistant.json` | **Claude** (`claude-sonnet-5`) | the original; prompt-cached spec |

## Setup — Hugging Face (one time, ~10 minutes)

1. **A token.** huggingface.co → *Settings → Access Tokens → Create new
   token* → **Fine-grained**, tick only *Make calls to Inference Providers*.
   Add some pre-paid credits under *Settings → Billing* (the free monthly
   allowance is a few cents; $10 is thousands of prompts).
2. **Import the workflow.** In n8n: *Workflows → Import from file* →
   `tools/n8n-weave-assistant-hf.json`.
3. **Set the shared key.** Open **Key ok?** and replace `CHANGE-ME-SHARED-KEY`
   with a passphrase (the cost gate — anyone without it gets a 401).
4. **Attach the token.** Open **Hugging Face router** → credential → create a
   *Header Auth* credential: name `Authorization`, value `Bearer hf_…`.
5. **Activate**, copy the **production** webhook URL from the Webhook node.
6. In Weft, click **✦** → enter the passphrase (and, under *own webhook*,
   the URL if it isn't the baked-in one) → save. The ⚙ gear re-opens the
   form, *forget* wipes it.

**Switching models** is the **Model** node — one field. Any id from
`https://router.huggingface.co/v1/models` works; append `:provider` to pin a
provider (`Qwen/Qwen3.8-27B:novita`). Set `vision` to true only for models
whose `input_modalities` include `image` — otherwise the cloth snapshot is
dropped before the call. `reasoning_effort` is for models that take it
(`openai/gpt-oss-120b`: low/medium/high); leave it empty for the rest.

**Output budget and thinking.** `max_tokens` (default 32000) is the *output*
budget, and for a thinking model like Qwen3.8 it includes the hidden
reasoning — 3–17× the visible reply on the bench. Too small and a long chat
ends with "ran out of output tokens mid-answer". `reasoning_effort: none`
switches Qwen's thinking off: ~4× fewer output tokens and sub-second
replies, at the cost of more repair turns on L3+ prompts (12/12 either way
on the bench, but 4 repairs instead of 1). Context is not the constraint:
262k+ tokens on every provider serving it, against a ~7k-token prompt.

The system prompt is fetched live from the site on every call:
`docs/ASSISTANT-CORE.md` (role + ops protocol) and `docs/LLM-AUTHORING.md`
(the spec). Edit those files, push, and every workflow — and
`test/bench-model.js` — sees the change. Roughly 6k tokens a call.

## Setup — Claude

Same steps with `tools/n8n-weave-assistant.json`; the credential on the
**Claude** node is a *Header Auth* named `x-api-key` with your Anthropic key.
Model and budget live in its **Compose request** node
(`model: 'claude-sonnet-5'`, `max_tokens: 8000`). It marks the spec with
`cache_control`, so repeat calls inside the cache window don't re-pay for it.

## When it can't figure something out

Replay the exact loom headlessly and look at the ops it produces:

```
node test/bench-model.js --model Qwen/Qwen3.8-27B --graph my-loom.json --select n7,n8 "make the ring ripple from the click"
```

`--graph` takes a saved `.json` or a copied patch (select all → Ctrl+C →
paste into a file); `--history` a JSON `[{role,text}]` of prior turns. Then:
same prompt on `deepseek-ai/DeepSeek-V4-Flash-0731` — if that one gets it,
the gap is the model; if neither does, look at what they reached for: a
missing recipe or an unclear port in `LLM-AUTHORING.md` is usually the
cause, and one line there fixes it for every model at once.

**"(the model came back with no answer after N tokens of thinking)"** — a
reasoning model looped on itself (the same plan repeated until the provider
cut it). Two causes seen so far, both fixed in the workflow file: temperature
below Qwen's recommended 0.6, and an ask that needs dozens of near-identical
ops (the 78-node "tidy the loom" that produced the `layout` op). If it recurs,
ask for a smaller step, or molt and retry.

## Scoring a model before you switch

`test/bench-model.js` runs the panel's exact pipeline headlessly — prompt →
router → `WeftOps` → evaluate → export — over `test/bench/prompts.json`:

```
node test/bench-model.js --model Qwen/Qwen3.8-27B --prompts test/bench/prompts.json --repair
```

Results land in `test/bench/out/<model>/` as `results.jsonl` plus one graph
per prompt (paste into Weft to look). `--repair` gives the model one turn to
fix rejected ops or eval errors, as the panel does through the user.

## What the model receives

| Field | Contents |
|---|---|
| `message` | what you typed |
| `tester` | the optional name from the setup form |
| `graph` | the full serialized graph (format 1) |
| `selection` | ids of selected nodes — "make *this* spin" works |
| `errors` | current per-node eval errors from the cloth |
| `history` | the last ~12 chat turns (text only) |
| `snapshot` | a 640px JPEG of the cloth taken as you press send, so a vision model can judge what you're seeing — color, overlap, "why does it look like this" — not just the wiring (~400 tokens on Qwen; toggle in the panel; models without image input ignore it) |

## The ops protocol

The model replies with text plus at most one fenced ```` ```weft-ops ````
block holding a JSON array. `WeftOps` (`js/ops.js`) validates ops against
`NODE_DEFS` (types, port names, wire endpoints) — tolerating `//` comments,
trailing commas and `[id,port,id,port]` wires, never guessing at meaning —
and applies them **atomically**: one bad op rejects
the whole list and the errors are shown (and sent back with your next
message). Applied ops are a single history step — **Ctrl+Z reverts**.

| Op | Shape | Notes |
|---|---|---|
| `add` | `{op, nodes:[{id,type,x?,y?,values?}], wires:[{from:[id,port],to:[id,port]}]}` | new ids that collide are auto-renamed (wires in the same op follow); missing x/y auto-layouts below the patch |
| `set` | `{op, id, values?, x?, y?, enabled?, preview?, collapsed?}` | `values` merges shallowly; `collapsed` folds the card to its icon and ports |
| `delete` | `{op, ids:[…]}` and/or `{op, wires:[{from,to}]}` | wires touching deleted nodes go with them |
| `wire` | `{op, from, to, stack?}` | replaces that input's wire unless `stack:true` |
| `unwire` | `{op, from?, to?}` | either side filters |
| `replace` | `{op, graph:{format,nodes,wires}}` | whole-patch swap; last resort |
| `layout` | `{op, ids?:[…], spacing?:1}` | tidy the loom (or just `ids`) into topological columns — params left, displays right, each column ordered by where its inputs sit. With groups present, every group is laid out as its own block and the blocks tile with gaps; folded groups reserve only their bar |
| `group` | `{op, title, nodes:[…], collapsed?, id?}` | a titled frame round the nodes (format-2 annotation, nothing rewired); `id` edits an existing group; `collapsed` folds it to a bar |
| `ungroup` | `{op, ids:[…]}` | remove frames; nodes stay |

## Security notes

- The shared key is a cost gate, not real auth — the webhook URL + key pair
  is effectively a bearer token. Don't reuse a password; rotate by editing
  the IF node.
- The panel refuses non-`https` webhook URLs.
- Same trust boundary as everything else on the loom (invariant #9): graphs
  run code (Expression, Custom JS). The ops validator checks structure, not
  intent — the model can write `meta/js` code that runs in your browser.
  That's the point of the feature, but it's why the key stays private.

## Not yet

- The model can't define new node *types* — it composes the existing 125
  (plus Custom JS for anything code-shaped). Authoring new defs is a
  deliberate later step.
- No streaming; a big patch can take ~30–60s. The send button pulses while
  it works.
