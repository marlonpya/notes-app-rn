import type { Unsubscribe } from '@/core/types';

import type { Note, NoteDraft } from './Note';

/** Contrato del dominio. La capa data lo implementa; el dominio no conoce SQLite ni Supabase. */
export interface NoteRepository {
  /** Emite la lista actual y luego cada cambio (≈ Flow<List<Note>>). */
  observeNotes(listener: (notes: Note[]) => void): Unsubscribe;
  getNote(id: string): Promise<Note | null>;
  saveNote(draft: NoteDraft): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  /** Sube cambios pendientes y baja cambios remotos. */
  sync(): Promise<void>;
  /** Borra los datos locales (al cerrar sesión). */
  clearLocal(): Promise<void>;
}
