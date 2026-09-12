# Supabase

This folder is the source of truth for the database. There is no ORM and no
migration tool — `schema.sql` is applied by hand in the dashboard's SQL Editor.

- `schema.sql` — the current schema, plus a recipe for adding new tables.
- `README.md` — this file: dashboard setup, adding APIs, practice exercises.

For a slow, click-by-click walkthrough of creating the `.env` file itself, see
[`../backend/ENV-SETUP.md`](../backend/ENV-SETUP.md). This file covers what to
do **inside Supabase** so that guide works.

---

## Step 1 — Create the project

1. Go to <https://supabase.com/dashboard> and click **New project**.
2. Pick any name, choose a region near you, and let it generate a database
   password. Save that password in a password manager — you won't need it for
   this app, but you can't view it again later.
3. Wait for provisioning to finish (a minute or two). The API won't answer
   until it does.

The free tier is enough for this project.

## Step 2 — Create the table

1. In the left sidebar open **SQL Editor**, then **New query**.
2. Paste the entire contents of `schema.sql` and click **Run**.
3. Open **Table Editor** and confirm a `characters` table exists with the
   columns `id`, `name`, `race`, `class`, `level`, `background`, `created_at`.

Run the whole file, not just the `create table` block. The three statements
after it add the class `CHECK` constraint, the sort index, and row-level
security. The table works without them, but not the way the code expects: it
would accept `class` values like `"wizrd"`, and the anon key could read it.

Also resist building this table by hand in the **Table Editor**. It's easy to
omit `created_at` that way, and `SupabaseService.selectAll()` requests
`order=created_at.desc.nullslast`, so every list request would fail against a
table that lacks the column.

The file is safe to re-run, so if you're unsure whether it applied, just run it
again.

## Step 3 — Get your project URL

Click **Connect** at the top of the dashboard and copy the **Project URL**:

```
https://abcdefghijkl.supabase.co
```

The Connect dialog also offers a ready-made frontend snippet:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

You don't need those two yet. `character-create` reaches Supabase only through
the Nest API (via `NEXT_PUBLIC_API_URL`), so nothing reads them today. Keep
placeholder values in this file — real keys belong in `.env`, which is
gitignored, not in documentation that gets committed.

No trailing slash. The code appends `/rest/v1` to this value, so a trailing
slash produces a double slash and the request fails.

## Step 4 — Get an API key, and pick the right kind

Open **Settings** (gear icon) → **API Keys**. Every key lives on this one page;
there is no longer a separate Settings → API page.

You'll see up to four keys, and **the choice matters** because of how
`src/characters/supabase.service.ts` sends it. That file sets both headers:

```
apikey:        <your key>
Authorization: Bearer <your key>
```

That's the classic pattern, and it only works with the legacy JWT keys.

| Key | Format | Works with the current code? |
| --- | --- | --- |
| `service_role` (legacy) | a long JWT, three dot-separated parts | Yes, as-is |
| `sb_secret_...` (new) | opaque string, not a JWT | No — needs a one-line change |
| `anon` / `sb_publishable_...` | low privilege | No, blocked by RLS |

Supabase's own migration guide is explicit about why: the new keys aren't JWTs,
so anything that tries to verify one as a JWT rejects the request. Send them on
the `apikey` header **only**.

Never use the `anon` or publishable key here. `schema.sql` enables row-level
security with no policies, so a low-privilege key correctly sees nothing at all.


### Option B — new `sb_secret_` key (future-proof, needs a one-line edit)

1. If you see a **Create new API keys** button, click it. This adds a
   publishable and a secret key *alongside* your legacy keys without breaking
   them.
2. Copy the key beginning `sb_secret_`.
3. In `backend/src/characters/supabase.service.ts`, delete the
   `Authorization` line from the `request()` headers, keeping `apikey`:

   ```ts
   headers: {
     apikey: this.serviceKey,
     'Content-Type': 'application/json',
     ...extraHeaders,
   },
   ```

Without that edit you'll get a 401 with an `Invalid JWT` style message, which
is exactly the failure described in `ENV-SETUP.md`'s troubleshooting section.

## Step 5 — Fill in `backend/.env`

```
PORT=3000
SUPABASE_URL=https://abcdefghijkl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<the key from Step 4>
SUPABASE_CHARACTERS_TABLE=characters
```



The variable is named `SUPABASE_SERVICE_ROLE_KEY` whichever key type you chose;
the code doesn't care what's in it. Leave `PORT` and the table name alone.

This key can read and delete everything in your database and it bypasses RLS.
It must never reach the browser — never copy it into `character-create`, and
never give it a `NEXT_PUBLIC_` prefix.

## Step 6 — Verify

```bash
cd backend
pnpm start:dev
```

In a second terminal:

```bash
curl http://localhost:3000/api/characters
```

`[]` is success: connected, table found, no rows yet.

Start the backend **from the `backend` folder**. `load-env.ts` resolves `.env`
against `process.cwd()`, so launching from anywhere else silently skips the
file and the app behaves as though you never created it.

## Troubleshooting the Supabase side

| Symptom | Cause |
| --- | --- |
| `Supabase is not configured...` | `.env` wasn't read — usually the wrong folder |
| 401 / `Invalid JWT` | New `sb_secret_` key with the `Authorization` header still present (Step 4) |
| `relation "characters" does not exist` | `schema.sql` hasn't been run |
| Error mentioning `created_at` | Only part of `schema.sql` was run |
| Empty results with a valid key | Using the `anon`/publishable key; RLS is blocking it |
| Double-slash in a failing URL | Trailing slash on `SUPABASE_URL` |

A useful trick: bypass the backend entirely to isolate whether the problem is
Supabase or Nest.

```bash
curl "$SUPABASE_URL/rest/v1/characters?select=*" -H "apikey: $KEY"
```

If that returns data but your API doesn't, the problem is in the backend.

---

# Adding a new API to the project

Every feature follows the same shape as `backend/src/characters/`. Copy that
folder and rename. Using a `spells` feature as the example:

```
backend/src/spells/
  spells.controller.ts     routes and HTTP concerns only
  spells.service.ts        business logic, talks to Supabase
  spells.module.ts         wires the above together
  entities/spell.entity.ts the shape the API returns
  dto/create-spell.dto.ts  the shape accepted on POST
  dto/update-spell.dto.ts  the shape accepted on PATCH
```

**1. Create the table.** Follow the template at the top of `schema.sql`. Keep
the `id` and `created_at` columns, and enable RLS.

**2. Write the entity and DTOs.** The entity is what clients receive; the
create DTO is what they may send. Keep them separate — clients must not be able
to set `id` or `created_at`.

**3. Write the service.** Inject `SupabaseService` and use its five methods:
`selectAll`, `selectOneById`, `insertOne`, `updateOneById`, `deleteOneById`.
Note the `mapRow` helper in `characters.service.ts`: Postgres returns `null`
for empty columns while the TypeScript entity uses optional fields, so the
service translates `null` to `undefined` at the boundary. Do the same.

**4. Write the controller.** Use `@Controller('spells')`. Because `main.ts`
calls `app.setGlobalPrefix('api')`, that becomes `/api/spells` — don't put
`api` in the decorator or you'll get `/api/api/spells`.

**5. Register the module.** Add it to `imports` in `src/app.module.ts`. This is
the step that's easiest to forget; without it the routes simply don't exist and
you get a 404 with no error at startup.

**6. Add the table name to `.env`** and `.env.example`, following the existing
optional-with-default pattern:

```ts
private readonly table = process.env.SUPABASE_SPELLS_TABLE ?? 'spells';
```

**7. Verify** by watching the startup log. Nest prints every route it mapped:

```
[RouterExplorer] Mapped {/api/spells, GET} route
```

If your route isn't listed, revisit step 5.

### Reusing `SupabaseService`

`SupabaseService` currently lives in `characters/` and hardcodes one table per
instance, so a second feature can't simply inject it. Two ways forward:

- **Quick:** copy it into the new folder and change the table variable.
- **Better:** move it to a shared `src/supabase/` module, make the table name a
  method parameter instead of a field, and export it so any feature can inject
  it. Worth doing the first time you add a second table.

### PostgREST query cheat sheet

The service builds raw PostgREST URLs. The patterns you'll reach for:

| Goal | Query string |
| --- | --- |
| All columns | `?select=*` |
| Specific columns | `?select=id,name` |
| Filter by equality | `?id=eq.<value>` |
| Sort, nulls last | `?order=created_at.desc.nullslast` |
| One row | `?limit=1` |
| Return the written row | `Prefer: return=representation` header |
| Join a related table | `?select=*,races(*)` |

Without the `Prefer` header, writes return `204 No Content` and
`insertOne`/`updateOneById` would have nothing to hand back.

