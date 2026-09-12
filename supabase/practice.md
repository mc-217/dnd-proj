---

# Practice exercises

Work through these in the SQL Editor in order; each builds on the last.
PostgREST reloads its schema cache automatically, so new columns appear in
`select=*` without restarting the backend.

Any column you add also needs a matching field in
`backend/src/characters/entities/character.entity.ts` and the two DTOs in
`backend/src/characters/dto/`, otherwise the API will store data the
TypeScript types don't know about.

### 1. Constrain level to the legal D&D range (1–20)

Feature: `CHECK` constraint. Follow the existing `characters_class_check`
pattern in `schema.sql`.

Verify: an `INSERT` with `level` 21 should be rejected.

### 2. Track modification time with an `updated_at` column

Features: `CREATE FUNCTION` (plpgsql), `CREATE TRIGGER ... BEFORE UPDATE`.

A column default alone won't work — defaults only apply on `INSERT`, which is
the whole point of the exercise.

Verify: `PATCH` a character through the API and watch `updated_at` change.

### 3. Seed a few rows so the UI has something to render

Feature: `INSERT ... VALUES`. Let `id` and `created_at` use their defaults.

Verify: `curl http://localhost:3000/api/characters`

### 4. Replace the class `CHECK` constraint with a real enum type

Features: `CREATE TYPE ... AS ENUM`, then
`ALTER TABLE ... ALTER COLUMN class TYPE character_class USING class::text::character_class`.

Consider the tradeoff: enums are self-documenting and cheap to validate, but
adding a value later needs `ALTER TYPE ... ADD VALUE`, and you can't remove one
without recreating the type.

### 5. Add the six ability scores

Strength, dexterity, constitution, intelligence, wisdom, charisma.

A real decision to make: six `smallint` columns, or one `jsonb` column? Six
columns give you per-field constraints and indexes; `jsonb` is flexible but you
lose both. Pick one and write down why.

### 6. Give characters an owner

Feature: `user_id uuid references auth.users (id) on delete cascade`.

`auth.users` is Supabase's built-in table — you don't create it. This is the
prerequisite for exercises 7 and 8.

### 7. Enforce per-user ownership with RLS policies

Features: `CREATE POLICY ... USING (auth.uid() = user_id)` for `select`, plus
`WITH CHECK` for `insert` and `update`, and a separate `delete` policy.

Verify: the anon key should now see only its own rows, while the backend's
secret key still sees everything because it bypasses RLS.

This is the most important Supabase concept on the list.

### 8. Stop one user from reusing a character name

Feature: `UNIQUE` constraint on `(user_id, name)`.

Deliberately scoped per user rather than globally — two different players
should both be allowed a character named "Gandalf".

### 9. Derive the proficiency bonus from level instead of storing it

Feature: `GENERATED ALWAYS AS (2 + (level - 1) / 4) STORED`. Integer division
handles the flooring.

Ask yourself when a generated column beats computing this in the service layer.

### 10. Normalize race into a lookup table

Features: a `races` table, a foreign key from `characters`, and a join via
PostgREST embedding: `select=*,races(*)`.

This changes the API response shape, so it will ripple into the frontend
components. Save it for last.

### 11. Add a second feature end to end

Build a `spells` table plus the matching Nest module, following the "Adding a
new API" section above. This is the exercise that ties the database work to the
backend work, and it will push you to refactor `SupabaseService` into something
shareable.
