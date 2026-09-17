# Weft × Hugging Face --- Open Model Integration Plan

> **Status (2026-09-16).** Read this plan against the code, not the other way
> round — much of it shipped as the v0.10 weave assistant before the plan was
> written, and two of its terms don't exist in Weft:
>
> | Plan phase | Reality |
> |---|---|
> | 0 — document internals | done: `NODE-SPEC.md`, `NODE-CATALOG.md` (generated = the *capability manifest*), `LLM-AUTHORING.md` |
> | 1 — deterministic compiler | done: `js/ops.js` `WeftOps.apply` validates + instantiates; `test/validate-patch.js` headless |
> | 2 — Hugging Face | done: `tools/n8n-weave-assistant-hf.json` calls the router (model = one Set-node field); `test/bench-model.js` scores models headlessly |
> | 3 — ✦ UI, context, apply, errors, editing | done: `js/assistant.js` |
> | 4 — manifest, examples, benchmark, model comparison | half: `test/bench/prompts.json` (12 of 50), first scores below |
> | 5 / 6 — dataset, fine-tune, geometry model | not started |
>
> **Update 2026-09-17.** The HF workflow is the production one (baked-in
> URL, key-gated, Qwen3.8-27B, one day of real sessions turned into
> `layout` / `group` / `ungroup` / `collapsed` ops, the "decide once" rule
> and a re-tile guard). `test/apply-ops.js` + the `/weft-weave` skill run the
> loop with Claude as the model. The plan's "one model, one prompt" shape is
> now the ceiling: ROADMAP §2 lays out the next architecture — a tiny triage
> stage that classes the turn and names the node categories, the spec sliced
> per category so the weaving model reads only what the ask needs, a model
> matched to the class (Qwen for edits, a larger open model or the Claude
> API for builds), and the deterministic check that already exists.
>
> - There are no "Cloth targets" or "bindings": context is the *selected node
>   ids* on the loom, and that's what the panel already sends.
> - The AI contract is the **ops protocol** (`docs/ASSISTANT.md`), not a whole
>   returned graph — it preserves the user's layout and undo history. The
>   `ModelProvider` abstraction is the webhook: swap the workflow, not Weft.
> - Model output is prose + one ```` ```weft-ops ```` fence. Strict
>   `response_format` JSON schema isn't used yet: the fence keeps the reply
>   conversational and `WeftOps.parseReply` tolerates JS-isms (comments,
>   trailing commas, 4-tuple wires).
>
> **First bench, 2026-09-16** (12 prompts L1–L5, one repair turn allowed):
> **Qwen3.8-27B 12/12** at ~1.5 s (free-listed at the time); DeepSeek-V4-Flash
> 11/12 at ~6 s (one cycle without Delay); gpt-oss-120b 8/12 at ~0.9 s (three
> of four misses were format or the `disp/text`-is-not-a-sink trap, both since
> addressed in `ASSISTANT-CORE.md`). "Valid" = parses, applies, evaluates at
> t = 0/0.5/2 without errors, draws, exports — not yet "does the right thing",
> which needs the by-eye pass in Phase 4.

## Purpose

Integrate an open model hosted through Hugging Face into **Weft** so a
user can describe an interaction in natural language and have Weft
generate a real, editable node graph.

The first implementation should be deliberately simple. The goal is not
to add a chatbot or autonomous agent to Weft. It is to establish a
**model-agnostic intelligence layer** that translates human intent into
Weft's existing interaction language.

This should make it straightforward to replace the initial
general-purpose model later with a specialized model---including the
non-linear geometric-reasoning model currently being developed by a
collaborator.

## Core architecture

``` text
Natural-language intent
        ↓
Weft frontend
        ↓
/api/generate-weft
        ↓
Hugging Face Inference Providers
        ↓
Open model
        ↓
Structured Weft JSON
        ↓
Schema validation
        ↓
Native Weft graph
        ↓
Human edits normally
```

The model acts as an **intent → Weft graph compiler**. It should compose
within Weft's visual language rather than bypassing it with arbitrary
JavaScript.

## Design principles

-   **Weft remains the medium.** AI output resolves into native nodes,
    connections, parameters, and bindings.
-   **Intelligence is replaceable.** Core Weft functionality should not
    depend on one model or vendor.
-   **Use structured output, not free-form code.** Require
    schema-constrained JSON wherever possible.
-   **Human editing is part of the system.** Generated graphs remain
    inspectable and editable.
-   **Build a dataset through use.** Preserve prompt → generated graph →
    human-edited graph pairs, with appropriate consent, for future
    training.

## MVP

The first prototype only needs to:

1.  Open an AI prompt from the ✦ control.
2.  Accept a natural-language interaction request.
3.  Send the request, current selection/context, and available Weft
    primitives to a small backend.
4.  Ask a Hugging Face-hosted open model for schema-valid Weft JSON.
5.  Validate and instantiate the response as real nodes/connections.
6.  Let the user immediately edit the result normally.

### Out of scope for V0

Do not initially build conversation memory, autonomous agents, RAG,
fine-tuning, dedicated GPU infrastructure, multi-agent orchestration, or
arbitrary code generation.

## 1. Understand Weft's native graph representation

Before adding AI, inspect the existing codebase and document:

-   graph serialization format
-   node registry / primitive definitions
-   ports and connection rules
-   node instantiation process
-   selection and Cloth target representation
-   parameter constraints
-   whether the existing definitions can generate an AI-facing
    capability manifest

**Deliverable:** a documented native `WeftGraph` representation.

## 2. Define the Weft AI contract

The durable asset is the contract between a model and Weft---not the
initial model.

Conceptually:

``` js
generateWeftGraph(intent, context)
        ↓
ModelProvider
        ↓
generate(schema, prompt)
```

A graph might conceptually resemble:

``` json
{
  "nodes": [
    {"id": "pointer", "type": "pointer-position", "params": {}},
    {"id": "distance", "type": "distance", "params": {}}
  ],
  "connections": [
    {
      "source": "pointer.position",
      "target": "distance.target"
    }
  ],
  "bindings": []
}
```

The real schema should follow Weft's existing internal structures rather
than introduce an unnecessary parallel format.

It should cover node types, parameters and constraints, ports, valid
connection rules, bindings/targets, and references to selected Cloth
objects.

## 3. Build deterministic graph import first

Before involving a model:

-   define a formal JSON schema
-   implement `validateWeftGraph()`
-   implement or expose `instantiateWeftGraph()`
-   feed a hard-coded graph into Weft
-   confirm that it creates correct, editable nodes and connections

**Success criterion:** known JSON reliably becomes a native Weft graph.

This separates graph/compiler problems from AI problems.

## 4. Create a Weft capability manifest

Give the model a machine-readable description of the primitives it may
use.

For each node define:

``` text
Node
├── type
├── name
├── description
├── inputs
├── outputs
├── parameters
├── constraints
└── examples
```

Ideally this manifest should eventually be generated from Weft's own
node definitions so the application and AI documentation cannot drift
apart.

## 5. Add a minimal serverless API

Because Weft is publicly hosted, never expose the Hugging Face token in
browser JavaScript.

Create:

``` text
POST /api/generate-weft
```

This could run on Vercel, Cloudflare Workers, Netlify Functions, or
another lightweight serverless environment.

Responsibilities:

1.  receive intent and Weft context
2.  construct the model request
3.  include the capability manifest/schema
4.  call Hugging Face
5.  validate the response
6.  return a valid graph or useful error

Keep provider-specific logic outside the core Weft application.

## 6. Connect Hugging Face

For V0, use **Hugging Face Inference Providers** rather than deploying a
dedicated GPU.

Choose an instruction-following open model with strong structured-output
reliability, useful coding/symbolic reasoning, acceptable latency, and
reasonable inference cost.

Do not optimize prematurely for the perfect model. Test 2--3 candidates
against the same prompts and keep the best-performing one.

## 7. Prompting and structured output

The model's role should be narrow:

> Translate interaction intentions into valid Weft graphs. Use only
> primitives in the supplied capability manifest. Return a graph
> matching the required schema. Never invent node types, ports, or
> parameters.

Supply:

-   user intent
-   current selection/context
-   relevant capability manifest
-   required JSON schema
-   15--30 high-quality examples

Examples should progress from direct mappings through proximity,
oscillation, attraction/repulsion, orbiting, chained transforms,
responsive geometry, and expressive multi-node behaviors.

Use schema-constrained structured output when supported, then validate
the result again before instantiation.

Never execute arbitrary model-generated JavaScript.

## 8. Make models interchangeable

Create a provider abstraction such as:

``` js
class ModelProvider {
  async generateGraph({ intent, context, schema }) {
    // provider-specific implementation
  }
}
```

Possible implementations over time:

``` text
ModelProvider
├── HuggingFaceProvider
├── WeftFineTunedProvider
├── GeometryModelProvider
├── LocalModelProvider
├── OpenAIProvider
└── AnthropicProvider
```

Weft should only care about the normalized `WeftGraph` response.

This makes transitioning to the collaborator's geometric-reasoning model
straightforward when it is ready.

## 9. Build a 50-prompt benchmark

Create a small benchmark before fine-tuning.

Example difficulty levels:

**Level 1 --- direct mapping**

> Make opacity follow horizontal pointer position.

**Level 2 --- simple composition**

> Make the circle grow as the pointer approaches it.

**Level 3 --- temporal behavior**

> Make the selected objects gently breathe in and out at slightly
> different rates.

**Level 4 --- spatial composition**

> Have the elements orbit the pointer, moving faster as the pointer gets
> closer.

**Level 5 --- expressive intent**

> Make these objects behave like a loose flock that is curious about the
> cursor but slightly afraid of it.

For each test record the prompt, expected primitives, generated graph,
schema validity, execution success, semantic usefulness, latency, and
amount of human correction required.

This benchmark becomes the common test for general models, fine-tuned
models, the geometric model, and optionally frontier models.

## 10. Capture training data through use

A valuable later feature is recording:

``` text
Prompt
   ↓
Model-generated graph A
   ↓
Human edits
   ↓
Final graph B
```

With appropriate consent, store:

``` json
{
  "prompt": "...",
  "context": {},
  "model": "...",
  "generatedGraph": {},
  "finalGraph": {}
}
```

Useful signals include nodes added/removed, parameters changed,
connections rewired, acceptance without edits, and complete rejection.

This creates an organically produced dataset describing how designers
translate intention into interactive geometry.

## 11. Fine-tuning path

Fine-tuning is not required for the prototype.

Consider it once there are enough high-quality examples to investigate:

> Can a smaller specialized model become better at composing Weft graphs
> than a much larger general model?

Progression:

``` text
General open model
        ↓
Collect examples + human corrections
        ↓
Curate dataset
        ↓
Fine-tune smaller open model
        ↓
Run same benchmark
        ↓
Compare quality / latency / cost
```

A specialized model could become particularly fluent in geometry,
motion, rhythm, proximity, attraction/repulsion, transformation,
interaction, and composition.

## 12. Path to the geometric-reasoning model

Treat the future model as another implementation of the same provider
contract:

``` text
Weft
 ↓
Weft AI API
 ↓
Model adapter
 ↓
Specialized geometry model
 ↓
WeftGraph JSON
 ↓
Validator
 ↓
Loom
```

If published through Hugging Face, it could later be served using a
supported inference provider, a dedicated Inference Endpoint, or custom
inference infrastructure if required.

The existing benchmark can then test whether its specialized non-linear
geometric reasoning actually improves interaction generation.

## 13. Dedicated hosting later

Do not start with a dedicated endpoint.

Consider one when predictable latency matters, a custom/fine-tuned model
is ready, specialized infrastructure is required, usage becomes
substantial, or dedicated compute becomes more economical.

The provider abstraction should make this an infrastructure change
rather than a Weft redesign.

## 14. Cost strategy

For an early prototype, usage-based inference is preferable to keeping a
GPU online.

Initially optimize for:

1.  low infrastructure complexity
2.  reliable structured output
3.  fast iteration
4.  enough quality to test the interaction concept

Optimize cost per generation only after real usage patterns exist.

A smaller specialized model may eventually improve latency, cost, and
task-specific quality simultaneously.

## 15. Security

-   Never expose Hugging Face credentials in the browser.
-   Store secrets in server-side environment variables.
-   Treat all model output as untrusted input.
-   Validate every generated graph.
-   Do not execute arbitrary generated JavaScript.
-   Add rate limiting before making a public demo broadly accessible.
-   Use least-privileged inference credentials.

## Implementation sequence

### Phase 0 --- Weft internals

-   [ ] Document graph serialization
-   [ ] Identify node registry
-   [ ] Document ports/connections
-   [ ] Document graph instantiation
-   [ ] Document selection/target context

### Phase 1 --- deterministic compiler

-   [ ] Define `WeftGraph` JSON schema
-   [ ] Implement validation
-   [ ] Implement graph instantiation
-   [ ] Successfully import a hard-coded graph

### Phase 2 --- Hugging Face

-   [ ] Configure HF credentials
-   [ ] Create `/api/generate-weft`
-   [ ] Connect HF inference
-   [ ] Select initial open model
-   [ ] Request structured JSON
-   [ ] Validate returned graph

### Phase 3 --- close the loop

-   [ ] Add ✦ prompt UI
-   [ ] Send selection/context
-   [ ] Generate graph
-   [ ] Instantiate it on Loom
-   [ ] Handle failures gracefully
-   [ ] Allow immediate manual editing

**At this point the MVP is complete.**

### Phase 4 --- improve reliability

-   [ ] Generate capability manifest
-   [ ] Add 15--30 curated examples
-   [ ] Create 50-prompt benchmark
-   [ ] Compare 2--3 open models
-   [ ] Measure validity, usefulness, latency, and correction burden

### Phase 5 --- dataset

-   [ ] Assign generation IDs
-   [ ] Store prompts/generated graphs
-   [ ] Capture final edited state
-   [ ] Establish consent/privacy behavior
-   [ ] Export curated training examples

### Phase 6 --- specialized intelligence

-   [ ] Establish baseline benchmark
-   [ ] Fine-tune/adapt a smaller open model
-   [ ] Test collaborator's geometric-reasoning model
-   [ ] Compare models on the same benchmark
-   [ ] Compare quality, correction burden, latency, and cost

## MVP success criteria

The prototype succeeds when:

-   a user can describe an interaction naturally
-   an open model accessed through Hugging Face interprets it
-   output conforms to Weft's allowed grammar
-   Weft creates real nodes/connections from the response
-   the resulting interaction works
-   the graph remains understandable and editable
-   changing the underlying model does not require redesigning Weft

A polished V0 does not need to understand every creative request. The
central proof is that **natural-language intention can become an
editable program inside Weft's visual interaction language**.

## Longer-term research questions

-   How small can a model become while remaining highly capable inside
    Weft?
-   Does task-specific training outperform scale for this interaction
    language?
-   Does specialized geometric reasoning materially improve graph
    composition?
-   Can human corrections become an effective continual training signal?
-   Can a sufficiently small Weft-specialized model eventually run
    locally or in-browser?
-   What should remain explicitly human-authored even when the model can
    generate it?
-   How should Weft expose uncertainty or alternative interpretations?
-   Can multiple specialized models compose different aspects of one
    interaction?

## The larger opportunity

The prototype is useful beyond adding AI to Weft.

It establishes a framework for exploring **where intelligence should
live inside a creative tool**.

Weft can become a testbed for comparing:

-   general open models
-   specialized fine-tuned models
-   local models
-   geometric-reasoning models
-   frontier models

The enduring system is therefore not "Weft connected to Model X." It is
a designed interface between **human intention, machine reasoning, and
an inspectable creative language**.
