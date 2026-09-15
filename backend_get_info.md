# adding GET functionality

How the read-only `personalities` feature was built, what each piece does, and
which part of it is actually "the API".

---

# Part 1 — Explain it like I'm 5

## The shop

Imagine the database is a **giant storeroom in another building**. Every row of
every table is in there.

Supabase puts a **hatch** on that storeroom so you can ask for things over the
internet. But opening the hatch needs a **master key**, and that key opens
*everything* — read, write, delete, any table.

Here's the problem: you cannot give that key to a web page. Anything the browser
knows, the person using the browser can read. Hand out the master key and anyone
could empty the storeroom.

So we build a **shop counter** in between:

- The **storeroom** is Postgres, inside Supabase.
- The **counter** is our NestJS backend. The master key lives behind it and
  never leaves.
- The **customer** is the React page in the browser. It has no key at all.
- The **API** is the short list of things a customer is allowed to ask for, and
  the exact words for asking.

That's all "API" means: **A**pplication **P**rogramming **I**nterface — an
agreed set of requests one program will answer for another. It is a menu, not a
machine.

## So which part is the API?

The API is the set of URLs our backend answers. Right now, for this feature:

```
GET /api/personalities        -> every row
GET /api/personalities/:id    -> one row
```

In code, the file that **defines** the API is the **controller**. Those
`@Get()` decorators in `personalities.controller.ts` literally *are* the API —
everything else is machinery behind it.

| File | Shop role | Is this "the API"? |
| --- | --- | --- |
| `character-create/…/personality-table.tsx` | the customer | **No** — it *calls* the API |
| `personalities.controller.ts` | the counter and its menu | **Yes** — this defines it |
| `personalities.service.ts` | the staff who go and fetch things | No — behind the counter |
| `supabase/supabase.service.ts` | the van that drives to the storeroom | No |
| `entities/personality.entity.ts` | a description of what the goods look like | No |
| the `personalities` table in Supabase | the storeroom | No |

A useful way to keep it straight: **the API is the boundary, not the building.**
It is the one line where someone else's code is allowed to touch yours.

## The twist: there are two APIs here

This is the part that trips people up.

1. **The API we built** — `http://localhost:3000/api/personalities`, NestJS.
   The browser is its customer.
2. **The API we use** — `https://<project>.supabase.co/rest/v1/personalities`,
   which Supabase generates automatically from your tables (a tool called
   PostgREST). Our backend is *its* customer.

So the backend is a **server** to the frontend and a **client** to Supabase at
the same time. It is the counter to one person and the customer to another.

## The journey of one request

When you open the Personality & Background page:

1. `PersonalityTable` runs `fetch("http://localhost:3000/api/personalities")`.
   The page itself is on port 3001, so it is genuinely talking to another
   program.
2. NestJS matches the URL: the `api` prefix from `main.ts`, plus
   `@Controller('personalities')`, plus `@Get()` → run `findAll()`.
3. The controller calls `PersonalitiesService.findAll()`. The controller does no
   thinking; it only routes.
4. The service calls `SupabaseService.selectAll('personalities')`.
5. `SupabaseService` builds the real request to Supabase and attaches the secret
   key as a header:
   `GET {SUPABASE_URL}/rest/v1/personalities?select=*&order=created_at.desc.nullslast`
6. Supabase reads Postgres and hands back JSON rows.
7. The service turns database rows into clean objects — a `null` column becomes
   a missing field, so a row with only a flaw comes back as `{ id, flaw }`.
8. NestJS sends that array to the browser as JSON.
9. The component drops it into state and TanStack renders the table.

Each hop only knows about its immediate neighbours. The React component has
never heard of Postgres; `SupabaseService` has never heard of personalities.

## Why so many files for "just a GET"?

Each file answers exactly one question, which is what makes it easy to change
one thing without breaking another:

| File | The one question it answers |
| --- | --- |
| `personalities.controller.ts` | Which URLs exist? |
| `personalities.service.ts` | What should happen when one is called? |
| `entities/personality.entity.ts` | What shape is this data? |
| `personalities.module.ts` | What does this feature need in order to run? |

Two small things you might notice by comparing with `characters/`:

- **There are no DTOs here.** A DTO describes data coming *in*. A GET sends
  nothing in, so there is nothing to describe. The characters module has DTOs
  because you can POST and PATCH to it.
- **`:id` is a placeholder.** `GET /api/personalities/:id` means "any value
  here", and Nest hands it to the method as a parameter.

---

# Part 2 — How it was built, step by step

The order matters, because most of these steps exist to *avoid* discovering a
problem later.

### 0. Check reality before writing anything

The very first action was asking Supabase directly whether a `personalities`
table existed. It answered `PGRST205 — could not find the table`. Knowing that
up front shaped everything after it: the code had to be written against a table
that does not exist yet, and the UI had to fail gracefully rather than assume
data.

### 1. Copy the pattern that already works

Read how `characters` is wired — controller, service, entity, module — so the
new feature looks like the old one. A codebase where every feature is built
differently is a codebase you have to relearn each time.

### 2. Hit the blocker

`SupabaseService` had the table name baked in as `this.table = 'characters'`.
Every method used it. There was no way for a second table to get through.

### 3. Fix the blocker properly

Three options, only one of them good:

| Option | Why not |
| --- | --- |
| Copy the file and change the name | Two copies of the auth and error code to keep in sync |
| Import `../characters/supabase.service` | Personalities would depend on characters for no reason |
| **Move it somewhere shared** | ✅ What we did |

It moved to `src/supabase/`, every method gained a `table` argument, and it is
handed out by an exported `SupabaseModule`. Each feature service now owns its
own table name.

### 4. Repoint the old code and delete the original

`characters.module.ts` imports `SupabaseModule` instead of providing the
service, `characters.service.ts` passes `this.table` into each call, and the old
file was deleted so there is exactly one copy.

### 5. Regression-test the thing you just disturbed

This is the step people skip. Refactoring touched **working** code, so the whole
characters cycle was re-run against the real database — POST, GET, PATCH, LIST,
DELETE — confirming `hp` still computed. Nothing about the new feature would
have caught a break here.

### 6. Write the four new files

Entity, service, controller, module — in that order, because each one depends on
the one before it.

### 7. Register the module

`PersonalitiesModule` had to be added to `app.module.ts`. Miss this and nothing
happens at all: Nest never learns the controller exists, so the routes are never
created and the URL just 404s. Confirmed by watching the startup log print
`Mapped {/api/personalities, GET}`.

### 8. Prove the endpoint behaves

Calling it returned a 500 wrapping `PGRST205`. That is the **correct** result
with no table: the error is specific enough to act on, rather than a blank
"something went wrong".

### 9. Build the frontend, then mount it

`PersonalityTable` handles four states — loading, error, empty, populated —
because unlike the other tables on the site, its data comes from somewhere that
can be slow, can fail, or can legitimately have nothing in it.

---

## Personalities: new API and UI

A read-only `personalities` module — entity, service, controller, module —
exposing `GET /api/personalities` and `GET /api/personalities/:id`, plus a
`PersonalityTable` component on the Personality & Background page.

**The table does not exist yet.** The endpoint currently returns a 500 wrapping
PostgREST's `PGRST205 — could not find the table`, and the UI shows that as a
load error. See `backend/src/personalities/NOTES.md` for the required shape; the
short version is four nullable text columns plus `id` and `created_at`, the
latter being mandatory because `selectAll` orders by it.

### The refactor this forced

`SupabaseService` lived inside the characters module and was hardcoded to
`this.table = 'characters'`. A second table had no way in.

The options were to duplicate the PostgREST plumbing, import
`../characters/supabase.service` from the personalities module, or do it
properly. The first two bake in something you would have to undo later, so the
service moved to `src/supabase/` behind an exported `SupabaseModule`, with every
method now taking a table name and each feature service owning its own.

**Because this touched working code, the whole characters CRUD cycle was re-run
afterward** — POST, GET, PATCH, LIST, DELETE all passing, `hp` still computing.
That regression check is the price of refactoring something that already works.

The UI is display-only, as requested. It is the first table here fed by the API
rather than a hardcoded array, so it handles four states: loading, error, empty,
and populated.

---

## How things were verified

No browser automation was available, so verification leaned on three techniques
worth reusing:

1. **Live round-trips against the real database.** Every schema change was
   confirmed by POST/GET/PATCH through the running API, with test rows deleted
   afterward. This is what caught the `varchar(50)` rejection.
2. **Data validation scripts.** Parsing the source arrays and asserting the
   invariants — string lengths, no blanks, every skill name resolving, every
   class's pick-count matching the book. Catches the silent typos.
3. **Stubbed-module tests.** Transpiling a real module with `typescript`, stubbing
   its imports, and calling it directly. Used to prove the draft-restore fix
   across five scenarios, and the personalities mapping without a table existing.

The gap: **clicking was never exercised.** Server rendering only ever sees an
empty draft, so the interactive paths were confirmed by type checking and by
testing the logic underneath them, not by driving the UI.

## Still open

- **`personalities` table** needs creating, with `id` and `created_at`.
- **Languages** — noted on the Personality & Background page; how they get
  picked is undecided, so nothing writes `draft.languages` and the sheet shows a
  dash.
- **Bonus column** on the chosen-skills table is empty by design.
- **Character name** is still generated as `"{Race} {Class} Adventurer"`; there
  is no name input.
- **Unwired draft fields**: `multiclass`, `equipment`, and the roleplay fields
  exist in the draft and the save payload but nothing sets them.
- **`level` on the class rows** is data-only; `choose` does not pass it to the
  draft. Saved characters are level 1 regardless, via the backend's
  `dto.level ?? 1` and the column default.
