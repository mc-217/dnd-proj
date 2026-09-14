import type { CharacterClass } from '../entities/character.entity';

// strMod, dexMod, consMod, intMod, wisMod, charMod and hp are generated columns.
// Postgres rejects any write to them, so they must stay out of this shape.
export class CreateCharacterDto {
  name!: string;
  race!: string;
  class!: CharacterClass;
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
