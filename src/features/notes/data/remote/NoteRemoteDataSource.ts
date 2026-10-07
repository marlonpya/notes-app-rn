import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { noteDtoSchema, type NoteDto, type NoteUpsertDto } from './NoteDto';

const TABLE = 'notes';

/** ≈ servicio Retrofit. Solo habla con Supabase; RLS limita las filas al usuario autenticado. */
export class NoteRemoteDataSource {
  constructor(private readonly client: SupabaseClient) {}

  async fetchChangedSince(serverCursor: string | null): Promise<NoteDto[]> {
    let query = this.client
      .from(TABLE)
      .select('*')
      .order('server_updated_at', { ascending: true });
    if (serverCursor) query = query.gt('server_updated_at', serverCursor);

    const { data, error } = await query;
    if (error) throw error;
    return z.array(noteDtoSchema).parse(data);
  }

  async upsert(notes: NoteUpsertDto[]): Promise<void> {
    if (notes.length === 0) return;
    const { error } = await this.client.from(TABLE).upsert(notes, { onConflict: 'id' });
    if (error) throw error;
  }
}
