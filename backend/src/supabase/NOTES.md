# Supabase Module Notes

One thin wrapper over the PostgREST endpoints Supabase exposes: auth headers,
error translation, and the five operations every feature needs. Import
`SupabaseModule` to get it; do not provide `SupabaseService` directly, or each
module ends up with its own copy.

## Why it lives here

It used to sit inside `characters/` with the table name baked in as
`this.table = 'characters'`, which meant a second table had no way to use it.
When the personalities module arrived, the choice was to duplicate the plumbing,
import it across feature boundaries, or move it. It moved: every method now
takes the table to act on, and each feature service owns its own table name
(usually from an env var with a sensible default).

Keeping the credentials and the error handling in one place is the point. The
service key never leaves the backend.

## Things to know

- **Every table reached through `selectAll` needs a `created_at` column.** The
  query orders by `created_at.desc.nullslast` and fails without it.
- **Column names are matched exactly.** Postgres folds unquoted identifiers to
  lower case, so a schema written as `hitDice` is really the column `hitdice`.
  Feature services translate API field names before writing — see
  `COLUMN_BY_FIELD` in `characters.service.ts`.
- **Any non-2xx becomes a 500** carrying the raw Supabase message. That is
  deliberately loud: a `22001` length violation or a `PGRST205` missing table
  reads clearly in the response instead of being swallowed.
- **Generated columns must never be written.** Postgres rejects writes to them,
  which is why they appear on entities but not on DTOs.
