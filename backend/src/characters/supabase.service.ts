import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class SupabaseService {
  private readonly url = process.env.SUPABASE_URL;
  private readonly serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  private readonly table =
    process.env.SUPABASE_CHARACTERS_TABLE ?? 'characters';

  isConfigured(): boolean {
    return Boolean(this.url && this.serviceKey);
  }

  async selectAll<T>() {
    return this.request<T[]>(
      'GET',
      `/${this.table}?select=*&order=created_at.desc.nullslast`,
    );
  }

  async selectOneById<T>(id: string) {
    const encodedId = encodeURIComponent(id);
    const rows = await this.request<T[]>(
      'GET',
      `/${this.table}?id=eq.${encodedId}&select=*&limit=1`,
    );
    return rows[0] ?? null;
  }

  async insertOne<T>(payload: object) {
    const rows = await this.request<T[]>('POST', `/${this.table}`, payload, {
      Prefer: 'return=representation',
    });
    return rows[0] ?? null;
  }

  async updateOneById<T>(id: string, payload: object) {
    const encodedId = encodeURIComponent(id);
    const rows = await this.request<T[]>(
      'PATCH',
      `/${this.table}?id=eq.${encodedId}`,
      payload,
      { Prefer: 'return=representation' },
    );
    return rows[0] ?? null;
  }

  async deleteOneById(id: string) {
    const encodedId = encodeURIComponent(id);
    await this.request<unknown>('DELETE', `/${this.table}?id=eq.${encodedId}`);
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
