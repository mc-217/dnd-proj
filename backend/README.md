# Backend (NestJS)

NestJS backend skeleton for the DnD project.

## Included structure

- `src/main.ts`: app bootstrap, CORS enabled, global prefix `/api`
- `src/app.*`: root app metadata endpoint
- `src/health/*`: health endpoint (`GET /api/health`)
- `src/characters/*`: characters CRUD resource with Supabase support

## Run locally

```bash
pnpm install
# optional: copy environment variables
cp .env.example .env
pnpm run start:dev
```

Server runs on `http://localhost:3000` by default.

## Current starter routes

- `GET /api` - basic API metadata
- `GET /api/health` - health status with uptime and timestamp
- `GET /api/characters` - list all characters
- `POST /api/characters` - create character
- `GET /api/characters/:id` - get one character
- `PATCH /api/characters/:id` - update character
- `DELETE /api/characters/:id` - remove character

## Supabase setup

The backend automatically uses Supabase for `characters` when these variables exist:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_CHARACTERS_TABLE` (optional, defaults to `characters`)

If those variables are missing, it falls back to in-memory storage.

Create this table in Supabase SQL editor:

```sql
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  race text not null,
  class text not null,
  level int not null default 1,
  background text,
  created_at timestamptz not null default now()
);
```

## Notes

- Use the **service role key** only on backend/server side.
- Consider Row Level Security policies if you expose this table to clients.

## Session change notes

- Backend skeleton: created modular Nest setup with `app`, `health`, and `characters` modules plus global `/api` prefix and CORS defaults.
- Characters API: added starter CRUD routes and DTO/entity structure, then fixed strict typing so `CharacterClass` is enforced consistently.
- Reliability pass: resolved lint/build issues (floating promises, redundant types, async delete handling) and kept unit/e2e tests green.
- Supabase integration: added env-based Supabase wiring (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) with automatic in-memory fallback when not configured.
