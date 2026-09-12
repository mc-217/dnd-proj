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
  background?: string;
}
