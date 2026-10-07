import type { Unsubscribe } from '@/core/types';
import type { Note, NoteDraft } from '@/features/notes/domain/Note';
import type { NoteRepository } from '@/features/notes/domain/NoteRepository';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DAY = 24 * 60 * 60 * 1000;

function seed(): Note[] {
  const now = Date.now();
  const note = (id: string, title: string, content: string, daysAgo: number): Note => ({
    id,
    title,
    content,
    createdAt: new Date(now - daysAgo * DAY),
    updatedAt: new Date(now - daysAgo * DAY),
    isPendingSync: false,
  });
  return [
    note('mock-1', 'Bienvenido al modo mock', 'Estas notas viven en memoria. No se usa Supabase ni SQLite.', 0),
    note('mock-2', 'Lista de compras', 'Leche\nPan\nCafé', 1),
    note('mock-3', 'Ideas', 'Probar la app sin red con datos predecibles.', 3),
  ];
}

/**
 * Repositorio en memoria para el flavor "mock" (≈ módulo Hilt del flavor mock).
 * Simula latencia y el ciclo pendiente → sincronizado, pero se reinicia al recargar la app.
 */
export class InMemoryNoteRepository implements NoteRepository {
  private notes = new Map(seed().map((note) => [note.id, note]));
  private listeners = new Set<(notes: Note[]) => void>();
  private nextId = 1;

  constructor(private readonly latencyMs = 300) {}

  observeNotes(listener: (notes: Note[]) => void): Unsubscribe {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  async getNote(id: string): Promise<Note | null> {
    return this.notes.get(id) ?? null;
  }

  async saveNote(draft: NoteDraft): Promise<Note> {
    const now = new Date();
    const existing = draft.id ? this.notes.get(draft.id) : undefined;
    const note: Note = {
      id: existing?.id ?? `mock-new-${this.nextId++}`,
      title: draft.title,
      content: draft.content,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      isPendingSync: true,
    };
    this.notes.set(note.id, note);
    this.emit();
    return note;
  }

  async deleteNote(id: string): Promise<void> {
    this.notes.delete(id);
    this.emit();
  }

  async sync(): Promise<void> {
    await delay(this.latencyMs);
    let changed = false;
    for (const [id, note] of this.notes) {
      if (note.isPendingSync) {
        this.notes.set(id, { ...note, isPendingSync: false });
        changed = true;
      }
    }
    if (changed) this.emit();
  }

  async clearLocal(): Promise<void> {
    this.notes = new Map(seed().map((note) => [note.id, note]));
    this.emit();
  }

  private snapshot(): Note[] {
    return [...this.notes.values()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  private emit() {
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
