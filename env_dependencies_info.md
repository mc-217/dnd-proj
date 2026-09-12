# dnd-proj
dnd project to learn react 
<img width="1291" height="753" alt="image" src="https://github.com/user-attachments/assets/dc2d2d4e-d675-4e14-80c5-b9610b20792e" />

## Layout

| Folder | What it is |
| --- | --- |
| `backend/` | NestJS API, talks to Supabase. Runs on port 3000. |
| `character-create/` | Next.js frontend. Runs on port 3001. |
| `supabase/` | Database schema and setup guides. Start with `connectSupabase.md`. |

The two apps are independent pnpm projects with their own `node_modules` and
lockfiles. The `package.json` in this root folder does not merge them into a
workspace — it exists only to start both with one command.

## Local development

First time only, install dependencies in each app:

```bash
pnpm install                       # root, just for concurrently
pnpm --dir backend install
pnpm --dir character-create install
```

You also need `backend/.env` before the API will work. See
[`backend/ENV-SETUP.md`](backend/ENV-SETUP.md).

Then, from this folder:

```bash
pnpm dev
```

That starts both apps in one terminal with prefixed, colour-coded output:

- `[api]` → <http://localhost:3000> (routes are under `/api`)
- `[web]` → <http://localhost:3001>

`Ctrl+C` stops both. If either one crashes, the other is shut down too, so you
never end up with half the stack running.

### Available scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Runs `dev:api` and `dev:web` together via `concurrently` |
| `pnpm dev:api` | Backend only, in watch mode |
| `pnpm dev:web` | Frontend only, on port 3001 |
| `pnpm build` | Production build of both apps |
| `pnpm test` | Backend Jest tests |

### Why the scripts are written the way they are

**`pnpm --dir backend` instead of `cd backend &&`.** `--dir` sets the child
process's working directory, which matters because
`backend/src/config/load-env.ts` resolves `.env` against `process.cwd()`:

```ts
const envPath = resolve(process.cwd(), filename);
```

Launch the API from the wrong folder and `.env` is skipped silently — no error,
the app just behaves as though Supabase was never configured. `--dir` gives the
backend a working directory of `backend/`, so `.env` is found. Verified: it
resolves to `backend/.env`.

**`PORT=3001` on the frontend.** The backend owns 3000, and
`character-summary.tsx` defaults to `http://localhost:3000/api` to reach it, so
the frontend has to move. Next.js reads `PORT`, which avoids the argument
forwarding problems that `pnpm dev -- -p 3001` runs into.

**`concurrently -k`.** The `-k` means "kill others" — one `Ctrl+C` stops both,
and a crash in one doesn't leave the other orphaned on a port.

### If `pnpm dev` reports a server is already running

```
⨯ Another next dev server is already running.
- PID: 8663
```

You have a server left over from a previous session in another terminal. Stop it
first, either with `Ctrl+C` in that terminal or:

```bash
kill 8663      # use the PID from the message
```

The same applies to the backend: two `nest start` processes will fight over port
3000. This is the most common reason `pnpm dev` fails immediately.

### The servers have to be running

There is no persistent "connection" to set up. `backend/.env` is read once at
startup, and `SupabaseService` makes a fresh HTTPS request to Supabase's REST
endpoint per API call — no login step, no connection pool, nothing to keep
alive. But the backend is a process, so it only answers while it's running.
Closing the terminal or rebooting stops it, and `pnpm dev` starts it again.
