# Weft membership — accounts, saved looms, motifs, chat history

> **Status (2026-10-24): M1 shipped — motifs, local** (v0.23.0; §8 has what
> was built). M2 (accounts + my looms) and M3 (chat history) not started.
> Weft today is a static page on
> GitHub Pages: work lives in `localStorage` (`weft:autosave`, `weft:backup`),
> in `.json` files from Save/Open, and in `#w2=` share links. This plan adds
> an *optional* account layer on Supabase so a signed-in person can keep their
> looms, reusable motifs and assistant conversations in the app itself.
>
> **Decided (James, 2026-10-21):** sign-in is optional · free for now, maybe
> paid later · saved node sets are called **motifs** · a palette is just a
> motif, not a separate feature · **simple Supabase Auth for now** (email
> magic link, Google, GitHub) · a notice about the assistant log, no opt-in
> box · a login shared with Collab OS (Clerk) is a possible later step, not
> part of this build (§2.4).

## 0. Principles

1. **Anonymous Weft keeps working, completely.** No login wall. Open the page and
   weave. Files, share links and the local autosave stay exactly as they are.
   An account adds features and takes nothing away. It is also what keeps the
   open-source release (PLAN Phase 6) honest.
2. **The cloud stays in the shell.** All of it lives in one new file,
   `js/cloud.js` (plus UI in `app.js`). `engine.js`, `nodes*.js`, `ops.js` and
   `export.js` never learn that accounts exist. An exported page has no idea
   where its graph came from. Smoke pins this (§8).
3. **Graphs stay plain JSON.** A saved loom is the exact `App.serialize()`
   output in a `jsonb` column. A saved motif is the exact clipboard fragment.
   No new graph format, no `GRAPH_FORMAT` bump.
4. **Local first, cloud second.** The editor keeps writing `localStorage` on
   every change, and the cloud gets a debounced sync. When the network drops,
   nothing breaks and nothing is lost. Motifs work fully without an account,
   and an account only syncs them.
5. **No build step, no dependencies (invariant 7).** `cloud.js` talks to
   Supabase with plain `fetch` (§2.2), with no `supabase-js`.

## 1. What the member gets

| Feature | What it looks like |
|---|---|
| **Sign in** | Email magic link, Google or GitHub. An account chip in the toolbar (avatar / "sign in"). |
| **My looms** | A gallery modal (same card anatomy as the example gallery: thumbnail, title, edited time). Open, rename, duplicate, delete, "save as new". The loom you're on autosyncs. |
| **Motifs** | Save any selection of nodes as a named, reusable piece. That covers a palette too: a few Color Swatch nodes, or a Text List of hex values. Motifs show up as their own section at the top of the node library. Drag one onto the loom, or find it in quick-add. Example motifs ship with Weft. |
| **Chat history** | Each loom keeps its assistant thread. Reopen the loom and the conversation is there. There's a list of past threads, and you can start a new one. |
| **Assistant access by account** | Being signed in replaces the shared key. The n8n workflow checks the member's token instead. |

## 2. Auth and the Supabase client

### 2.1 Shape

```
index.html ── js/cloud.js ──fetch──▶ Weft's Supabase project
   │            (auth + REST)         ├─ Auth: magic link, Google, GitHub (PKCE)
   │                                  ├─ Postgres via PostgREST, RLS on every table
   │                                  └─ Storage: thumbnails
   └─ js/assistant.js ──Bearer JWT──▶ n8n weft-assistant-hf ──verifies JWT──▶ model
```

The **project** is a new Supabase project just for Weft. Collab OS's project
is that system's record of truth, and Holos has its own.

### 2.2 `js/cloud.js`: a thin client, no `supabase-js`

Weft needs only a small part of Supabase:

- **Auth.** `POST /auth/v1/otp` (magic link), and
  `GET /auth/v1/authorize?provider=google|github` with a PKCE challenge built
  with `crypto.subtle`. Then `POST /auth/v1/token?grant_type=pkce`, `?grant_type=refresh_token`,
  and `POST /auth/v1/logout`.
- **Data.** `GET/POST/PATCH/DELETE /rest/v1/<table>`, sending `apikey` (the
  publishable key, safe to commit because RLS does the guarding) and
  `Authorization: Bearer <access token>`.
- **Storage.** `POST /storage/v1/object/thumbs/<uid>/<id>.jpg`.

That's roughly 250 lines in the style of `assistant.js`'s wire code. It
exposes one small interface to the rest of the shell: `Cloud.user()`,
`Cloud.token()`, `Cloud.signIn(method)`, `Cloud.signOut()`, `Cloud.onChange(fn)`,
plus the table helpers. If Weft ever moves to a shared login (§2.4), only
the auth half of this file changes.

**The session.** The access token is kept in memory and refreshed a minute
before it expires. The refresh token sits in `localStorage` under
`weft:session`, because otherwise a reload would sign you out. See §7 for
what that means.

### 2.3 Sign-in details

- **PKCE, not the implicit flow.** In the implicit flow Supabase returns
  tokens in the URL hash (`#access_token=…`), and the hash already belongs to
  share links (`App` matches `#w2=`/`#j2=` at load). PKCE returns `?code=` in
  the query instead. `cloud.js` exchanges the code and strips it with
  `history.replaceState` before `App` reads the hash. That way a share link
  survives a sign-in round trip: the hash rides along on the redirect URL.
- **Providers.** The magic-link email gets a template in Weft's voice. Google
  needs an OAuth client in Google Cloud, and GitHub needs an OAuth app in the
  Iris-Cocreative org. Both point their callback at
  `https://<project>.supabase.co/auth/v1/callback`.
- **Redirect URLs to allow:** `https://iris-cocreative.github.io/weft/`
  and `http://127.0.0.1:8137/index.html`. The GitHub Pages address is fine as
  it is, with no custom domain needed.
- A **`profiles` row** is created by a trigger on `auth.users` insert, filled
  from the provider's name and avatar.

### 2.4 Later: one login with Collab OS (not in this build)

This is researched and parked. Collab OS is moving to Clerk, and Clerk can
share one session across apps on different domains through *satellite
domains*. Collab OS would be the main domain and Weft a satellite. Each app
keeps its own Supabase project, set to accept Clerk's sign-in tokens (Supabase
calls this third-party auth). Requirements: a domain Weft controls (the
github.io address can't be a satellite), Clerk's paid plan plus about $10/mo
per satellite, and Ian's Clerk instance in production. Holos would join only
by moving off Supabase Auth itself.

**What this build does now so that move stays cheap:**

- Every `owner` column is `text default (auth.jwt()->>'sub')`, not a `uuid`
  foreign key. Today `sub` is the Supabase user id, and under Clerk it would
  be the Clerk id. The policies are the same either way.
- Auth sits behind the `Cloud` interface (§2.2).

Moving would still mean re-linking each existing Weft user to their Clerk
account (match by verified email and rewrite `owner`). While the user count
is small, that's one SQL migration.

## 3. Data model

All tables have RLS on. Every policy is `to authenticated` and checks
`(select auth.jwt()->>'sub') = owner`. Migrations live in
`weft/supabase/migrations/` so the schema is versioned with the code.

```sql
profiles      (id text pk,               -- auth user id (sub)
               display_name text, avatar_url text,
               tier text default 'free',  -- everything is free for now; the column waits for "later, paid"
               created_at)

looms         (id uuid pk, owner text default auth.jwt()->>'sub', title text,
               graph jsonb,              -- exact App.serialize()
               format int,               -- graph.format at save, for migrate()
               thumb_path text,          -- storage: thumbs/<owner>/<id>.jpg
               visibility text default 'private',  -- private | unlisted | public (later)
               forked_from uuid null,
               node_count int, bytes int,
               created_at, updated_at, deleted_at null)   -- soft delete = trash

loom_versions (id, loom_id, owner, graph jsonb, created_at, note text)
               -- explicit "save version" + one automatic snapshot per session; keep last 20

motifs        (id uuid pk, owner text, title text,
               body jsonb,               -- the clipboard fragment, groups included
               tags text[],              -- e.g. 'palette', 'motion', 'ui'
               node_count int, thumb_path text,
               uses int default 0, created_at, updated_at)

conversations (id uuid pk, owner text, loom_id uuid null → looms, title text,
               created_at, updated_at)

messages      (id bigserial pk, conversation_id, owner text,
               role text,                -- user | assistant | system
               text text,
               ops jsonb null,           -- what the model proposed
               outcome jsonb null,       -- {applied, errors, summary} from WeftOps
               model text null, created_at)

assistant_usage (id, owner text, model, tokens_in, tokens_out, ms, created_at)
               -- written by n8n with the service key; read-only to the member
```

Notes:

- **Size.** Image In can embed a picture as a data URI, so a graph can be
  megabytes. M2 caps a loom at 5 MB and says so in words. A later step moves
  embedded images into Storage on save and rewrites `src` to the URL (Image
  In already accepts URLs; `App._stripAssets` is the precedent for walking
  them).
- **Format.** `format` is stored so a loom saved by a newer Weft is refused on
  open with the same rule as files: newer formats are refused, never guessed.
- **Thumbnails.** `App.renderThumb(graph, 480, 300, frames)` already draws the
  gallery thumbnails offscreen. Run it on save and upload a JPEG.

## 4. Motifs

**Name: motif.** In weaving, a motif is the repeated figure in a cloth, a
pattern you keep reusing. The word stays clear of the two terms Weft already
uses: a **cluster** is a specific node (`meta/cluster`, invariant 9) and a
**group** is the frame around nodes. A motif can contain either one.

**One kind, any selection.** A motif is whatever you selected: loose nodes,
a cluster, a group frame with its contents, a few Color Swatch nodes, or a
Text List of hex values. A palette is not a separate feature, just a motif
you made from colors (and maybe tagged `palette`). There's no special
palette format and no swatch-picker integration, so palettes behave like
everything else on the loom.

**Saving.** Select nodes → right-click → *Save as motif…* (also on a group
frame's header menu). The body is `Editor.copySelection()` minus `ext`
(external wires never cross graphs anyway). If the selection fills exactly
one group frame, the frame comes along too (`groups` in the fragment), so the
motif drops as a titled group. Before saving, the body runs through the same
`WeftOps`/`NODE_DEFS` validation as an assistant reply, so a broken motif
can't get in. A thumbnail comes from evaluating the fragment on its own: if it
draws, use that, and if not (a slider set, a palette), use a small picture of
its nodes.

**Dropping.** Drag a motif from the library onto the loom, or pick it in
quick-add. Both go through `Editor.pasteFragment(body)` at the drop point,
which is the path Ctrl+V already takes: ids remapped, one undo step, unknown
types become `?` nodes rather than errors (invariant 5).

**Copies, not links (for now).** Dropping a motif makes an independent copy,
the way Grasshopper user objects work. "Update every place I used this motif"
would need an editor-only marker on the dropped nodes (a `motif: {id, v}`
field alongside `label`, never in `values`, because `values` names are port
names). That waits until there's a real need.

**Example motifs** ship read-only in a static `js/motifs.js` (the same pattern
as `EXAMPLES`) and need no account. First candidates:

- look point + three transforms (from *Rainbow eye*)
- the OKLCH palette walk
- spring-follow
- a slider bank
- two or three color palettes, both as Swatch columns and as a Text List

Smoke runs each one the way it runs examples.

## 5. Chat history

Today `Assistant.turns` is session memory. It's sent as `history` (the last 12
turns) and dropped by *clear* or a reload.

- When signed in, every turn is written to `messages`, along with the ops the
  model proposed and the `WeftOps` outcome. That matters: "what did it try,
  and was it applied" is the most useful part of the record.
- A conversation is tied to the loom it happened on. Opening a cloud loom
  loads its most recent thread into the panel. *New thread* starts a fresh one,
  and a small list shows the older ones.
- The client writes conversation rows (it knows what got applied). n8n writes
  only `assistant_usage` (it knows the model and the token counts).
- The cloth snapshot the panel sends isn't stored in v1, because the text and
  ops are the record.
- **A notice, not an opt-in:** one line on the sign-in screen and in the panel:
  "your assistant sessions are saved to your account and may be reviewed to
  improve weft." This is also the turn log ROADMAP §2 lists as a
  prerequisite for triage.

**Gating moves from the shared key to the account.** `assistant.js` sends
`Authorization: Bearer <access token>`. The n8n workflow verifies it against
the project's published signing keys
(`/auth/v1/.well-known/jwks.json`) or with one `GET /auth/v1/user` call. That
makes it per-member, gives room for quotas later, and gets rid of the
shared key that lives in every tester's browser. Keep the ⚙ "your own webhook"
option for self-hosters, and keep the shared key working through M3 so
current testers aren't cut off mid-session.

## 6. UI sketch

- **Toolbar:** an account chip at the right. Signed out it says "sign in".
  Signed in it shows the avatar, and its menu has *my looms · my motifs ·
  account · sign out*.
- **Sign-in modal:** an email field + *send me a link*, then *continue with
  Google* and *continue with GitHub*, plus the assistant-log notice in small
  type. The copy is lowercase-calm: "your looms follow you to any browser."
- **My looms:** reuses the example-gallery modal and its cards. Sort by edited
  time, plus a search box. The current loom's title sits in the toolbar where
  the file name is today (`App._fileName`), and a small dot shows sync state
  (saved · saving · offline).
- **Node library:** a **Motifs** section above the categories, with yours
  first and then the examples, plus its own search. On mobile it's the first
  section of the library drawer.
- **First sign-in:** "bring your current loom with you?" uploads the local
  autosave, and your local motifs sync up. Then *import files…* lets you
  multi-select `.json` patches (James's `patches/` folder is the first real
  customer).

## 7. Security: the one real change in the threat model

Weft's documented trust boundary is that **graphs run code**: Expression,
Custom JS, and the `meta/js` compute. That was fine when the origin held
nothing worth stealing. With accounts, `localStorage` holds a **refresh
token**. Code in a graph you didn't write could read it and keep acting as
you after the tab is closed.

1. **Trust prompt for foreign code (M2, required).** When signed in and
   opening a graph you don't own (a share link, a motif file someone sent)
   that contains `meta/js` or `math/expr`, show it read-only with a "this loom
   runs code — run it?" step. Your own looms and the built-in examples run as
   they do today. Saying no keeps the loom readable but doesn't run it.
2. **Sign out everywhere.** The account menu includes "sign out of all
   devices" (Supabase's `scope=global` logout). If a token ever leaks, that's
   the way to kill it.
3. **Isolation (before anything public).** Before public looms or shared
   motifs exist, graph code and the session have to live in different origins.
   There are two ways to get there:
   - Keep the session in a small `auth.html` iframe on a separate origin,
     doing the fetches and talking to the app over `postMessage`.
   - Evaluate foreign graphs in a sandboxed iframe.

   While everything is private and you run your own work, 1 and 2 are enough.

## 8. Milestones

Each milestone ends the way every Weft change does: smoke passes, the app is
verified in a browser, ROADMAP is updated. M1 and M2 don't depend on each
other, so either can go first.

**M1 — Motifs, local (1–2 sessions, no account).** Save from a selection or
group frame into `localStorage` (`weft:motifs`), the Motifs library section,
drag + quick-add drop, rename / delete / tag, example motifs in
`js/motifs.js`, and export / import of a motif file.

*Shipped 2026-10-24 (one session), as built:*
- *The store is `Motifs` in `js/motifs.js` (no DOM): `list / mine / get /
  search / save / update / remove / onChange / reload`, plus `clean`,
  `validate`, `toFile`, `fromFile`, `importMany`. A record is `{id, title,
  tags, body, node_count, created_at, updated_at}`, the `motifs` table's own
  columns, and ids are `crypto.randomUUID()` so they can become the uuid key.
  M2's sync goes behind these calls; nothing in the shell reads
  `localStorage` for motifs.*
- *Validation is `WeftOps.apply` with one `replace` op (every type known,
  every wire end a real port) plus unique ids and frames that only name the
  motif's nodes. A selection holding a `?` node can't be saved; an imported
  file from a newer Weft (unknown types, `format` > 1) is reported and
  skipped.*
- *Placement is one pure function, `WeftOps.paste` (js/ops.js), which
  `Editor.pasteFragment` now calls for Ctrl+V and Ctrl+D as well, so smoke
  29 runs the exact path a drop takes. `copySelection()` adds `groups` only
  when the selection is exactly one frame's nodes; a duplicated or pasted
  whole group now arrives framed.*
- *Files: `{weft: 'motifs', format: 1, motifs: [{title, tags, body}]}` for
  one motif or the whole library; import also reads a bare clipboard fragment
  or a whole loom, and never adds the same title + body twice.*
- *Smoke 29 covers both test ideas from the list below: every example motif,
  and the first group of each of the nine examples that have groups, cut out
  the way Save as motif cuts it, validate → paste → serialize → evaluate
  clean. Linked motifs stay undone (copies, by design).*

**M2 — Accounts + My looms (2 sessions).**
- **Setup (M0, half a session):** the Supabase project, the first migration
  (profiles + trigger, looms, motifs, RLS), the email template, the Google and
  GitHub OAuth apps, the redirect URLs, and Supabase's security advisors run
  clean.
- **Build:** `js/cloud.js` (PKCE, refresh, REST, storage), the account chip +
  sign-in modal, save / open / rename / duplicate / delete, and debounced
  autosync with a conflict check (`PATCH … where updated_at = <the one I
  loaded>`; 0 rows → "this loom changed in another tab: keep mine / load
  theirs"). Plus thumbnails, motifs syncing local ↔ cloud, first-sign-in
  upload + bulk import, the size cap, the trust prompt, and sign out
  everywhere.

**M3 — Chat history + account-gated assistant (1–2 sessions).** The
conversations / messages tables, persistence in `assistant.js`, a thread per
loom, a thread list, the token check in n8n (with the shared key kept as a
fallback), `assistant_usage`, and the notice.

**Later, as needed:** loom versions UI · embedded images to Storage ·
paid tiers (Stripe; the assistant is the natural thing to charge for) ·
a shared login with Collab OS (§2.4) · community (public / unlisted looms,
profiles, fork, shared motifs, linked motifs). Community waits for the
isolation in §7.3.

**Tests that come with it:**
- Smoke: `engine.js`, `nodes*.js`, `ops.js` and `export.js` never mention
  `Cloud`/`supabase`, and an export of a cloud-opened loom is byte-identical
  to the same graph opened from a file (the same idea as check 25 for
  annotations).
- Smoke: every example motif, and the first group of every example taken as a
  motif, round-trips through `pasteFragment` → `serialize` → evaluate without
  errors.
- An RLS check (SQL or a headless script with two test users): user A can't
  read, update or delete user B's looms, motifs or messages.
- Browser: two accounts, two tabs (the conflict path), offline (the sync dot
  goes to offline, local autosave continues), and a share link opened while
  signed out → sign in → the shared loom is still there.
