import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Character } from './entities/character.entity';
import { SupabaseService } from '../supabase/supabase.service';

interface CharacterRow {
  id: string;
  name: string;
  race: string;
  class: Character['class'];
  level: number | null;
  subrace: string | null;
  multiclass: string | null;
  hitdice: number | null;
  strength: number | null;
  strmod: number | null;
  dexterity: number | null;
  dexmod: number | null;
  constitution: number | null;
  consmod: number | null;
  intelligence: number | null;
  intmod: number | null;
  wisdom: number | null;
  wismod: number | null;
  charisma: number | null;
  charmod: number | null;
  hp: number | null;
  s_throws: string | null;
  wep_proficiency: string | null;
  armor_proficiency: string | null;
  s_proficiency: string | null;
  t_proficiency: string | null;
  background: string | null;
  languages: string | null;
  personality: string | null;
  ideal: string | null;
  bond: string | null;
  flaw: string | null;
  equipment: string | null;
}

// Postgres folds unquoted identifiers to lower case, so `hitDice` in schema.sql
// is really the column `hitdice`. PostgREST matches payload keys to column names
// exactly, so the API-facing names have to be translated before any write.
const COLUMN_BY_FIELD: Record<string, string> = {
  name: 'name',
  race: 'race',
  class: 'class',
  subrace: 'subrace',
  multiclass: 'multiclass',
  hitDice: 'hitdice',
  level: 'level',
  strength: 'strength',
  dexterity: 'dexterity',
  constitution: 'constitution',
  intelligence: 'intelligence',
  wisdom: 'wisdom',
  charisma: 'charisma',
  s_throws: 's_throws',
  wep_proficiency: 'wep_proficiency',
  armor_proficiency: 'armor_proficiency',
  s_proficiency: 's_proficiency',
  t_proficiency: 't_proficiency',
  background: 'background',
  languages: 'languages',
  personality: 'personality',
  ideal: 'ideal',
  bond: 'bond',
  flaw: 'flaw',
  equipment: 'equipment',
};

@Injectable()
export class CharactersService {
  private readonly characters: Character[] = [];
  private readonly table =
    process.env.SUPABASE_CHARACTERS_TABLE ?? 'characters';

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(dto: CreateCharacterDto): Promise<Character> {
    if (this.supabaseService.isConfigured()) {
      const inserted = await this.supabaseService.insertOne<CharacterRow>(
        this.table,
        { ...this.toRow(dto), level: dto.level ?? 1 },
      );

      if (!inserted) {
        throw new NotFoundException('Failed to insert character');
      }

      return this.mapRow(inserted);
    }

    const character: Character = {
      ...dto,
      id: randomUUID(),
      level: dto.level ?? 1,
    };

    this.characters.push(character);
    return character;
  }

  async findAll(): Promise<Character[]> {
    if (this.supabaseService.isConfigured()) {
      const rows = await this.supabaseService.selectAll<CharacterRow>(
        this.table,
      );
      return rows.map((row) => this.mapRow(row));
    }

    return this.characters;
  }

  async findOne(id: string): Promise<Character> {
    if (this.supabaseService.isConfigured()) {
      const row = await this.supabaseService.selectOneById<CharacterRow>(
        this.table,
        id,
      );
      if (!row) {
        throw new NotFoundException(`Character ${id} not found`);
      }
      return this.mapRow(row);
    }

    const character = this.characters.find((entry) => entry.id === id);
    if (!character) {
      throw new NotFoundException(`Character ${id} not found`);
    }
    return character;
  }

  async update(id: string, dto: UpdateCharacterDto): Promise<Character> {
    if (this.supabaseService.isConfigured()) {
      const updated = await this.supabaseService.updateOneById<CharacterRow>(
        this.table,
        id,
        this.toRow(dto),
      );

      if (!updated) {
        throw new NotFoundException(`Character ${id} not found`);
      }

      return this.mapRow(updated);
    }

    const existing = await this.findOne(id);
    const updated: Character = {
      ...existing,
      ...dto,
      level: dto.level ?? existing.level,
    };

    const index = this.characters.findIndex((entry) => entry.id === id);
    this.characters[index] = updated;
    return updated;
  }

  async remove(id: string): Promise<void> {
    if (this.supabaseService.isConfigured()) {
      const existing = await this.supabaseService.selectOneById<CharacterRow>(
        this.table,
        id,
      );
      if (!existing) {
        throw new NotFoundException(`Character ${id} not found`);
      }
      await this.supabaseService.deleteOneById(this.table, id);
      return;
    }

    const index = this.characters.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new NotFoundException(`Character ${id} not found`);
    }
    this.characters.splice(index, 1);
  }

  // Only fields the caller actually supplied are included, so a PATCH never
  // blanks a column the client left out.
  private toRow(dto: CreateCharacterDto | UpdateCharacterDto): object {
    const row: Record<string, unknown> = {};
    const values = dto as Record<string, unknown>;

    for (const [field, column] of Object.entries(COLUMN_BY_FIELD)) {
      if (values[field] !== undefined) {
        row[column] = values[field];
      }
    }

    return row;
  }

  private mapRow(row: CharacterRow): Character {
    return {
      id: row.id,
      name: row.name,
      race: row.race,
      class: row.class,
      level: row.level ?? 1,
      subrace: row.subrace ?? undefined,
      multiclass: row.multiclass ?? undefined,
      hitDice: row.hitdice ?? undefined,
      strength: row.strength ?? undefined,
      strMod: row.strmod ?? undefined,
      dexterity: row.dexterity ?? undefined,
      dexMod: row.dexmod ?? undefined,
      constitution: row.constitution ?? undefined,
      consMod: row.consmod ?? undefined,
      intelligence: row.intelligence ?? undefined,
      intMod: row.intmod ?? undefined,
      wisdom: row.wisdom ?? undefined,
      wisMod: row.wismod ?? undefined,
      charisma: row.charisma ?? undefined,
      charMod: row.charmod ?? undefined,
      hp: row.hp ?? undefined,
      s_throws: row.s_throws ?? undefined,
      wep_proficiency: row.wep_proficiency ?? undefined,
      armor_proficiency: row.armor_proficiency ?? undefined,
      s_proficiency: row.s_proficiency ?? undefined,
      t_proficiency: row.t_proficiency ?? undefined,
      background: row.background ?? undefined,
      languages: row.languages ?? undefined,
      personality: row.personality ?? undefined,
      ideal: row.ideal ?? undefined,
      bond: row.bond ?? undefined,
      flaw: row.flaw ?? undefined,
      equipment: row.equipment ?? undefined,
    };
  }
}
