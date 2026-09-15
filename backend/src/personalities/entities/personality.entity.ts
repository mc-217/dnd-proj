// Mirrors a row of the `personalities` table: the pool of roleplay options a
// player picks from, as opposed to the personality/ideal/bond/flaw columns on
// `characters`, which hold the one they settled on.
//
// The table needs the two columns every table here carries:
//   id         uuid primary key default gen_random_uuid()
//   created_at timestamptz not null default now()
// SupabaseService.selectAll orders by created_at, so reads fail without it.
//
// The four fields below are all optional, so a row filled in with only a flaw
// still maps cleanly. Any extra column the table grows is simply ignored here
// until it is added to this interface and to PersonalityRow in the service.
export interface Personality {
  id: string;
  personality?: string;
  ideal?: string;
  bond?: string;
  flaw?: string;
}
