# The weave assistant

A chat panel on the loom (the ✦ button, top-right) that sends your message —
plus the graph, your selection, live errors, and a snapshot of the cloth — to
a model through an **n8n webhook**, and applies the model's edits back onto
the canvas as validated, undoable graph ops.

The panel ships **dormant**: it does nothing until a webhook URL and shared
key are saved into the browser (localStorage `weft:assistant`). Neither ever
touches the repo or the public deploy, so API costs stay private to whoever
holds the webhook + key.

```
Weft panel ──POST {message, graph, selection, errors, history, snapshot}──▶ n8n webhook
                                                                              │ key check (x-weft-key)
                                                                              │ fetch docs/LLM-AUTHORING.md (live spec)
                                                                              │ Claude (Messages API, spec cached)
Weft panel ◀────────────── {reply, ops[]} ◀───────────────────────────────── parse weft-ops fence
```

## Setup (one time, ~10 minutes)

1. **Import the workflow.** In n8n: *Workflows → Import from file* →
   `tools/n8n-weave-assistant.json`.
2. **Set the shared key.** Open the **Key ok?** node and replace
   `CHANGE-ME-SHARED-KEY` with a passphrase of your choosing (this is the
   cost gate — anyone without it gets a 401).
3. **Attach the Anthropic credential.** Open the **Claude** node → credential
   → create a *Header Auth* credential: name `x-api-key`, value = your
   Anthropic API key.
4. **Activate** the workflow and copy the **production** webhook URL from the
   Webhook node.
5. In Weft, click **✦** → paste the webhook URL and your passphrase → save.
   Both live only in that browser; the ⚙ gear re-opens the form, *forget*
   wipes them.

Model and token budget live in the **Compose request** node
(`model: 'claude-sonnet-5'`, `max_tokens: 8000`) — edit there. The system
prompt fetches `docs/LLM-AUTHORING.md` from the live site on every call and
marks it with `cache_control`, so repeat calls inside the cache window don't
re-pay for the spec.

## What the model receives

| Field | Contents |
|---|---|
| `message` | what you typed |
| `graph` | the full serialized graph (format 1) |
| `selection` | ids of selected nodes — "make *this* spin" works |
| `errors` | current per-node eval errors from the cloth |
| `history` | the last ~12 chat turns (text only) |
| `snapshot` | small JPEG of the cloth (toggleable in the panel) |

## The ops protocol

The model replies with text plus at most one fenced ```` ```weft-ops ````
block holding a JSON array. Ops are validated against `NODE_DEFS` (types,
port names, wire endpoints) and applied **atomically**: one bad op rejects
the whole list and the errors are shown (and sent back with your next
message). Applied ops are a single history step — **Ctrl+Z reverts**.

| Op | Shape | Notes |
|---|---|---|
| `add` | `{op, nodes:[{id,type,x?,y?,values?}], wires:[{from:[id,port],to:[id,port]}]}` | new ids that collide are auto-renamed (wires in the same op follow); missing x/y auto-layouts below the patch |
| `set` | `{op, id, values?, x?, y?, enabled?, preview?}` | `values` merges shallowly |
| `delete` | `{op, ids:[…]}` and/or `{op, wires:[{from,to}]}` | wires touching deleted nodes go with them |
| `wire` | `{op, from, to, stack?}` | replaces that input's wire unless `stack:true` |
| `unwire` | `{op, from?, to?}` | either side filters |
| `replace` | `{op, graph:{format,nodes,wires}}` | whole-patch swap; last resort |

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
