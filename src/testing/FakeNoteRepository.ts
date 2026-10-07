import type { Unsubscribe } from '@/core/types';
import type { Note, NoteDraft } from '@/features/notes/domain/Note';
import type { NoteRepository } from '@/features/notes/domain/NoteRepository';

/** Repositorio en memoria para tests de dominio y presentación. */
export class FakeNoteRepository implements NoteRepository {
  notes = new Map<string, Note>();
  syncCalls = 0;
  syncError: Error | null = null;
  private listeners = new Set<(notes: Note[]) => void>();
  private nextId = 1;

  observeNotes(listener: (notes: Note[]) => void): Unsubscribe {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  async getNote(id: string) {
    return this.notes.get(id) ?? null;
  }

  async saveNote(draft: NoteDraft) {
    const now = new Date();
    const existing = draft.id ? this.notes.get(draft.id) : undefined;
    const note: Note = {
      id: existing?.id ?? `note-${this.nextId++}`,
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

  async deleteNote(id: string) {
    this.notes.delete(id);
    this.emit();
  }

  async sync() {
    this.syncCalls++;
    if (this.syncError) throw this.syncError;
  }

  async clearLocal() {
    this.notes.clear();
    this.emit();
  }

  private snapshot() {
    return [...this.notes.values()];
  }

  private emit() {
    this.listeners.forEach((listener) => listener(this.snapshot()));
  }
}

/** Espera a que se resuelvan las promesas pendientes (≈ advanceUntilIdle). */
export const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
