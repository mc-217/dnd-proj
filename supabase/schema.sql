-- Database schema for dnd-proj. Safe to re-run.
-- Run it in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- See README.md in this folder for setup and practice exercises.
--
-- ---------------------------------------------------------------------------
-- HOW TO ADD A NEW TABLE
--
-- 1. Copy the block below and rename it. Keep these two columns every time:
--      id         uuid primary key default gen_random_uuid()
--      created_at timestamptz not null default now()
--    The service layer orders by created_at, so leaving it out breaks reads.
--
-- 2. Use `create table if not exists` so the whole file stays re-runnable.
--
-- 3. Add `alter table <name> enable row level security;` at the end.
--    Without it the table is readable by anyone holding the anon key.
--
-- 4. Add an index for whatever column you sort or filter on.
--
-- 5. In the backend, create a matching interface in <feature>/entities/ and
--    point the service at the new table name. PostgREST picks up the table
--    immediately - no restart needed.
--
-- Template:
--
--   create table if not exists public.my_table (
--     id         uuid primary key default gen_random_uuid(),
--     label      text not null,
--     created_at timestamptz not null default now()
--   );
--
--   create index if not exists my_table_created_at_idx
--     on public.my_table (created_at desc);
--
--   alter table public.my_table enable row level security;
-- ---------------------------------------------------------------------------


-- characters: backs the API in backend/src/characters.

create table if not exists public.characters (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  race         text not null,
  subrace      text,
  class        text not null,
  multiclass   text,
  hitDice      int,
  s_throws     text, 
  wep_proficiency text,
  level        integer not null default 1,
  strength     integer,
  strMod       integer generated always as (floor((strength - 10) / 2.0)::integer) stored,
  dexterity    integer,
  dexMod       integer generated always as (floor((dexterity - 10) / 2.0)::integer) stored,
  constitution integer,
  consMod      integer generated always as (floor((constitution - 10) / 2.0)::integer) stored,
  intelligence integer,
  intMod       integer generated always as (floor((intelligence - 10) / 2.0)::integer) stored,
  wisdom       integer,
  wisMod       integer generated always as (floor((wisdom - 10) / 2.0)::integer) stored,
  charisma     integer,
  charMod      integer generated always as (floor((charisma - 10) / 2.0)::integer) stored,
  background   text, 
  languages    text,
  personality  text, 
  ideal        text, 
  bond         text, 
  flaw         text, 
  s_proficiency text, 
  t_proficiency text,
  equipment    text, 
  hp           integer generated always as ((hitDice + floor((constitution - 10) / 2.0))::integer) stored,

  -- SupabaseService.selectAll() orders by this column; queries fail without it.
  created_at   timestamptz not null default now()
);

-- Adding a column later: `create table if not exists` is skipped on a database
-- that already has the table, so a new column needs its own
-- `alter table public.characters add column if not exists ...` here as well as
-- in the block above. Dropping and recreating the table works too, and loses
-- every row.

-- Mirrors the CharacterClass union in entities/character.entity.ts.
alter table public.characters
  drop constraint if exists characters_class_check;

alter table public.characters
  add constraint characters_class_check check (class in (
    'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk',
    'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'
  ));

create index if not exists characters_created_at_idx
  on public.characters (created_at desc);

-- No policies are defined: the backend connects with the service_role key,
-- which bypasses RLS, so anonymous clients get no access.
alter table public.characters enable row level security;
