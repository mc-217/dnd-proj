# Characters Module Notes

This module manages character CRUD endpoints and character domain types.
It uses Supabase when environment variables are set, otherwise falls back to in-memory storage.

Database access goes through the shared `SupabaseService` in `../supabase/`,
which this module imports rather than provides. It used to live here with the
table name hardcoded; it moved out when a second table needed it.

Main files:
- `characters.controller.ts` API routes
- `characters.service.ts` business logic and persistence behavior
- `dto/` request data shapes
- `entities/` shared character types
