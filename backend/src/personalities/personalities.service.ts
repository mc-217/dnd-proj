import { Injectable, NotFoundException } from '@nestjs/common';
import { Personality } from './entities/personality.entity';
import { SupabaseService } from '../supabase/supabase.service';

// The column names need no translation the way the character ones do: these are
// already lower case, so Postgres folding them changes nothing.
interface PersonalityRow {
  id: string;
  personality: string | null;
  ideal: string | null;
  bond: string | null;
  flaw: string | null;
}

// Read-only for now. Rows are authored in Supabase rather than through the API,
// so there is no create/update/delete here and no in-memory fallback: without
// Supabase configured there is nothing to fall back to, and the request layer
// says so plainly.
@Injectable()
export class PersonalitiesService {
  private readonly table =
    process.env.SUPABASE_PERSONALITIES_TABLE ?? 'personalities';

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Personality[]> {
    const rows = await this.supabaseService.selectAll<PersonalityRow>(
      this.table,
    );
    return rows.map((row) => this.mapRow(row));
  }

  async findOne(id: string): Promise<Personality> {
    const row = await this.supabaseService.selectOneById<PersonalityRow>(
      this.table,
      id,
    );

    if (!row) {
      throw new NotFoundException(`Personality ${id} not found`);
    }

    return this.mapRow(row);
  }

  private mapRow(row: PersonalityRow): Personality {
    return {
      id: row.id,
      personality: row.personality ?? undefined,
      ideal: row.ideal ?? undefined,
      bond: row.bond ?? undefined,
      flaw: row.flaw ?? undefined,
    };
  }
}
