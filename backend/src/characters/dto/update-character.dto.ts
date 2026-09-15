import type { CharacterClass } from '../entities/character.entity';

// Same fields as CreateCharacterDto, all optional for PATCH. Generated columns
// (the six ability modifiers and hp) are omitted; Postgres rejects writes to them.
export class UpdateCharacterDto {
  name?: string;
  race?: string;
  class?: CharacterClass;
  subrace?: string;
  multiclass?: string;
  hitDice?: number;
  level?: number;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
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
