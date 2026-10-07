import type { Unsubscribe } from '@/core/types';

import type { Note, NoteDraft } from './Note';
import type { NoteRepository } from './NoteRepository';
import { NoteValidationError } from './NoteValidationError';

export const MAX_TITLE_LENGTH = 120;

export class ObserveNotesUseCase {
  constructor(private readonly repository: NoteRepository) {}

  execute(listener: (notes: Note[]) => void): Unsubscribe {
    return this.repository.observeNotes(listener);
  }
}

export class GetNoteUseCase {
  constructor(private readonly repository: NoteRepository) {}

  execute(id: string): Promise<Note | null> {
    return this.repository.getNote(id);
  }
}

/** Reglas de negocio de una nota: no puede estar vacía y el título tiene un largo máximo. */
export class SaveNoteUseCase {
  constructor(private readonly repository: NoteRepository) {}

  async execute(draft: NoteDraft): Promise<Note> {
    const title = draft.title.trim();
    const content = draft.content.trim();

    if (!title && !content) throw new NoteValidationError('EMPTY_NOTE');
    if (title.length > MAX_TITLE_LENGTH) throw new NoteValidationError('TITLE_TOO_LONG');

    return this.repository.saveNote({
      id: draft.id,
      title: title || content.split('\n')[0].slice(0, MAX_TITLE_LENGTH),
      content,
    });
  }
}

export class DeleteNoteUseCase {
  constructor(private readonly repository: NoteRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.deleteNote(id);
  }
}

export class SyncNotesUseCase {
  constructor(private readonly repository: NoteRepository) {}

  execute(): Promise<void> {
    return this.repository.sync();
  }
}
