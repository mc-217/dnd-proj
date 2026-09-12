import type { CharacterClass } from '../entities/character.entity';

export class CreateCharacterDto {
  name!: string;
  race!: string;
  class!: CharacterClass;
  level?: number;
  background?: string;
}
