import { z } from 'zod';

/** Fila de public.notes en Supabase. Zod valida en runtime (≈ kotlinx.serialization). */
export const noteDtoSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  title: z.string(),
  content: z.string(),
  created_at: z.string(),
  /** Hora del cliente: decide conflictos (last-write-wins). */
  updated_at: z.string(),
  deleted: z.boolean(),
  /** Hora del servidor, la pone un trigger: es el cursor del pull. Nunca se envía. */
  server_updated_at: z.string(),
});

export type NoteDto = z.infer<typeof noteDtoSchema>;
export type NoteUpsertDto = Omit<NoteDto, 'server_updated_at'>;
