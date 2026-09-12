import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Character } from './entities/character.entity';
import { SupabaseService } from './supabase.service';

interface CharacterRow {
  id: string;
  name: string;
  race: string;
  class: Character['class'];
  level: number | null;
  background: string | null;
}

@Injectable()
export class CharactersService {
  private readonly characters: Character[] = [];
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(dto: CreateCharacterDto): Promise<Character> {
    if (this.supabaseService.isConfigured()) {
      const inserted = await this.supabaseService.insertOne<CharacterRow>({
        name: dto.name,
        race: dto.race,
        class: dto.class,
        level: dto.level ?? 1,
        background: dto.background ?? null,
      });

      if (!inserted) {
        throw new NotFoundException('Failed to insert character');
      }

      return this.mapRow(inserted);
    }

    const character: Character = {
      id: randomUUID(),
      name: dto.name,
      race: dto.race,
      class: dto.class,
      level: dto.level ?? 1,
      background: dto.background,
    };

    this.characters.push(character);
    return character;
  }

  async findAll(): Promise<Character[]> {
    if (this.supabaseService.isConfigured()) {
      const rows = await this.supabaseService.selectAll<CharacterRow>();
      return rows.map((row) => this.mapRow(row));
    }

    return this.characters;
  }

  async findOne(id: string): Promise<Character> {
    if (this.supabaseService.isConfigured()) {
      const row = await this.supabaseService.selectOneById<CharacterRow>(id);
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
        id,
        {
          ...dto,
          background: dto.background ?? undefined,
        },
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
      const existing =
        await this.supabaseService.selectOneById<CharacterRow>(id);
      if (!existing) {
        throw new NotFoundException(`Character ${id} not found`);
      }
      await this.supabaseService.deleteOneById(id);
      return;
    }

    const index = this.characters.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new NotFoundException(`Character ${id} not found`);
    }
    this.characters.splice(index, 1);
  }

  private mapRow(row: CharacterRow): Character {
    return {
      id: row.id,
      name: row.name,
      race: row.race,
      class: row.class,
      level: row.level ?? 1,
      background: row.background ?? undefined,
    };
  }
}
