# Characters Module Notes

This module manages character CRUD endpoints and character domain types.
It uses Supabase when environment variables are set, otherwise falls back to in-memory storage.

Main files:
- `characters.controller.ts` API routes
- `characters.service.ts` business logic and persistence behavior
- `dto/` request data shapes
- `entities/` shared character types
