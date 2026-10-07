export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  /** true mientras la nota tiene cambios que aún no llegaron a Supabase. */
  isPendingSync: boolean;
}

export interface NoteDraft {
  /** Ausente = nota nueva. */
  id?: string;
  title: string;
  content: string;
}
