import { Injectable, InternalServerErrorException } from '@nestjs/common';

// A thin wrapper over the PostgREST endpoints Supabase exposes. Every method
// takes the table to act on so each feature module can bring its own, rather
// than this service knowing about any one of them.
//
// This started life inside characters/ with `table` hardcoded to 'characters'.
// Adding the personalities module left three options: duplicate the auth and
// error handling, reach across feature boundaries to import it, or generalise
// it. The first two are the kind of thing you undo later, so it moved here and
// the table became an argument. See NOTES.md.
@Injectable()
export class SupabaseService {
  private readonly url = process.env.SUPABASE_URL;
  private readonly serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  isConfigured(): boolean {
    return Boolean(this.url && this.serviceKey);
  }

  // Note the ordering: every table reached through here needs a created_at
  // column or the read fails.
  async selectAll<T>(table: string) {
    return this.request<T[]>(
      'GET',
      `/${table}?select=*&order=created_at.desc.nullslast`,
    );
  }

  async selectOneById<T>(table: string, id: string) {
    const encodedId = encodeURIComponent(id);
    const rows = await this.request<T[]>(
      'GET',
      `/${table}?id=eq.${encodedId}&select=*&limit=1`,
    );
    return rows[0] ?? null;
  }

  async insertOne<T>(table: string, payload: object) {
    const rows = await this.request<T[]>('POST', `/${table}`, payload, {
      Prefer: 'return=representation',
    });
    return rows[0] ?? null;
  }

  async updateOneById<T>(table: string, id: string, payload: object) {
    const encodedId = encodeURIComponent(id);
    const rows = await this.request<T[]>(
      'PATCH',
      `/${table}?id=eq.${encodedId}`,
      payload,
      { Prefer: 'return=representation' },
    );
    return rows[0] ?? null;
  }

  async deleteOneById(table: string, id: string) {
    const encodedId = encodeURIComponent(id);
    await this.request<unknown>('DELETE', `/${table}?id=eq.${encodedId}`);
  }

  private async request<T>(
    method: string,
    path: string,
    payload?: object,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    if (!this.url || !this.serviceKey) {
      throw new InternalServerErrorException(
        'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      );
    }

    const response = await fetch(`${this.url}/rest/v1${path}`, {
      method,
      headers: {
        apikey: this.serviceKey,
        Authorization: `Bearer ${this.serviceKey}`,
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    // The raw Supabase body is passed through on purpose. Postgres error codes
    // are specific enough to debug from directly: 22001 is a value too long for
    // its column, PGRST205 is a table that does not exist. Swallowing them
    // would turn both into an unhelpful "something went wrong".
    if (!response.ok) {
      const detail = await response.text();
      throw new InternalServerErrorException(
        `Supabase request failed (${response.status}): ${detail}`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}
