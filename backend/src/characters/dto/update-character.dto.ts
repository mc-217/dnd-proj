import type { CharacterClass } from '../entities/character.entity';

export class UpdateCharacterDto {
  name?: string;
  race?: string;
  class?: CharacterClass;
  level?: number;
  background?: string;
}
