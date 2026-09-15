# dnd-proj

dnd project to learn react

<img width="1291" height="753" alt="image" src="https://github.com/user-attachments/assets/dc2d2d4e-d675-4e14-80c5-b9610b20792e" />

A D&D character creator built to learn React, Next.js, and NestJS. Step through
race, class, background, and ability scores, then save the character to a
Supabase database through the backend API.

## Stack

| Part | Tech | Port |
| --- | --- | --- |
| `character-create/` | Next.js 16, React 19, TypeScript | 3001 |
| `backend/` | NestJS 11, TypeScript | 3000 |
| `supabase/` | Postgres via Supabase, accessed over PostgREST | — |

Supabase credentials stay server-side: the frontend talks only to the backend,
and the backend holds the secret key.

## Quick start

```bash
pnpm install
pnpm --dir backend install
pnpm --dir character-create install
pnpm dev
```

`pnpm dev` runs the API and the frontend together. You'll also need
`backend/.env` before the API can reach the database.

## Docs

| File | What it covers |
| --- | --- |
| [`env_dependencies_info.md`](env_dependencies_info.md) | Dev scripts, ports, and why each one is set up that way |
| [`backend/ENV-SETUP.md`](backend/ENV-SETUP.md) | Creating `backend/.env`, one step at a time |
| [`supabase/connectSupabase.md`](supabase/connectSupabase.md) | Creating the Supabase project and connecting the backend |
| [`supabase/send2db.md`](supabase/send2db.md) | Writing and reading data through the API |
| [`supabase/practice.md`](supabase/practice.md) | Exercises to extend the schema |
| [`supabase/schema.sql`](supabase/schema.sql) | The database schema, applied by hand in the SQL Editor |
| [`backend_get_info.md`](backend_get_info.md) | Adding read-only GET endpoints: the personalities module, the Supabase refactor it forced, and how it was verified |

New here? Read them in that order.
