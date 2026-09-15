# Personalities Module Notes

Read-only endpoints over the `personalities` table: the pool of roleplay options
a player picks from. Not to be confused with the `personality`, `ideal`, `bond`
and `flaw` columns on `characters`, which hold the one option they settled on.

Rows are authored in Supabase rather than through the API, so there is no
create, update or delete here. There is also no in-memory fallback the way
`characters` has one — without Supabase configured there would be nothing to
fall back to, so the request layer raises a plain "not configured" error instead
of quietly returning an empty list.

Main files:
- `personalities.controller.ts` API routes (`GET /`, `GET /:id`)
- `personalities.service.ts` reads and row-to-entity mapping
- `entities/` shared personality type

## Required table shape

```sql
create table if not exists public.personalities (
  id          uuid primary key default gen_random_uuid(),
  personality text,
  ideal       text,
  bond        text,
  flaw        text,
  created_at  timestamptz not null default now()
);
```

`created_at` is not optional in practice: `SupabaseService.selectAll` orders by
`created_at.desc.nullslast`, so reads fail outright without it.

All four content columns are nullable, and the service maps a null to an absent
field rather than passing `null` through — a row with only a flaw comes back as
`{ id, flaw }`. Any extra column the table grows is ignored until it is added to
both `Personality` and `PersonalityRow`.

Until the table exists, `GET /api/personalities` returns a 500 wrapping
PostgREST's `PGRST205 — could not find the table`.
