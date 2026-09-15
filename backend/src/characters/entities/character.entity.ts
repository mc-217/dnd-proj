// see NOTES .. 
export type CharacterClass =
  | 'barbarian'
  | 'bard'
  | 'cleric'
  | 'druid'
  | 'fighter'
  | 'monk'
  | 'paladin'
  | 'ranger'
  | 'rogue'
  | 'sorcerer'
  | 'warlock'
  | 'wizard';

export interface Character {
  id: string;
  name: string;
  race: string;
  class: CharacterClass;
  level: number;
  subrace?: string;
  multiclass?: string;
  hitDice?: number;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  // Computed by Postgres from the ability scores above, so these are read-only:
  // they appear here but never in the create/update DTOs.
  strMod?: number;
  dexMod?: number;
  consMod?: number;
  intMod?: number;
  wisMod?: number;
  charMod?: number;
  hp?: number;
  s_throws?: string;
  wep_proficiency?: string;
  armor_proficiency?: string;
  s_proficiency?: string;
  t_proficiency?: string;
  background?: string;
  languages?: string;
  personality?: string;
  ideal?: string;
  bond?: string;
  flaw?: string;
  equipment?: string;
}
