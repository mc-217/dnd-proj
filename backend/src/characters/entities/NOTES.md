# Entities Notes

Shared character types returned by the API. `character.entity.ts` is the shape
clients receive; the request shapes live in `../dto/`.

## TODO — allow custom classes (not started)

Reminder to myself: drop the fixed class list and let players write their own.

Three places currently hardcode the same twelve classes, and they have to change
together:

1. `character.entity.ts` — the `CharacterClass` union.
2. `supabase/schema.sql` — the `characters_class_check` constraint.
3. `character-create/src/components/class-table.tsx` — the picker in the UI,
   which needs the new "write your own" option.

Things to decide before starting:

- Is it fully freeform `string`, or the twelve known classes plus a custom
  escape hatch? The second keeps autocomplete working in the editor.
- If the constraint goes away entirely, nothing stops empty strings or
  1000-character names. Some validation has to replace it — see the runtime
  validation exercise in `supabase/send2db.md`.
- `character-summary.tsx` lowercases the class before POSTing. Decide whether a
  custom class keeps the player's capitalization, and whether the display value
  and the stored value should differ.
- Existing rows already hold lowercase values from the old list, so consider
  what happens to them.

Not doing any of this yet — reminder only.
