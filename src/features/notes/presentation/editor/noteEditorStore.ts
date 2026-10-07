import { createMviStore } from '@/core/mvi/createMviStore';

import type {
  DeleteNoteUseCase,
  GetNoteUseCase,
  SaveNoteUseCase,
  SyncNotesUseCase,
} from '../../domain/usecases';
import { toNoteErrorMessage } from '../noteErrorMessages';
import {
  initialNoteEditorState,
  type NoteEditorEffect,
  type NoteEditorIntent,
  type NoteEditorState,
} from './noteEditorContract';

export interface NoteEditorDeps {
  getNote: GetNoteUseCase;
  saveNote: SaveNoteUseCase;
  deleteNote: DeleteNoteUseCase;
  syncNotes: SyncNotesUseCase;
}

export const createNoteEditorStore = (deps: NoteEditorDeps) =>
  createMviStore<NoteEditorState, NoteEditorIntent, NoteEditorEffect>(
    initialNoteEditorState,
    ({ getState, setState, emit }) => {
      // La sincronización es best-effort: si falla, la nota queda pendiente en SQLite.
      const syncInBackground = () => void deps.syncNotes.execute().catch(() => undefined);

      return async (intent) => {
        switch (intent.type) {
          case 'Load': {
            if (!intent.id) {
              setState({ ...initialNoteEditorState });
              return;
            }
            setState({ isLoading: true, error: null });
            const note = await deps.getNote.execute(intent.id);
            if (!note) {
              emit({ type: 'ShowMessage', message: 'La nota ya no existe.' });
              emit({ type: 'Close' });
              return;
            }
            setState({ id: note.id, title: note.title, content: note.content, isLoading: false });
            break;
          }
          case 'ChangeTitle':
            setState({ title: intent.value, error: null });
            break;
          case 'ChangeContent':
            setState({ content: intent.value, error: null });
            break;
          case 'Save': {
            const { id, title, content, isSaving } = getState();
            if (isSaving) return;
            setState({ isSaving: true, error: null });
            try {
              const saved = await deps.saveNote.execute({ id: id ?? undefined, title, content });
              setState({ id: saved.id, isSaving: false });
              syncInBackground();
              emit({ type: 'Close' });
            } catch (error) {
              setState({ isSaving: false, error: toNoteErrorMessage(error) });
            }
            break;
          }
          case 'Delete': {
            const { id } = getState();
            if (id) {
              await deps.deleteNote.execute(id);
              syncInBackground();
            }
            emit({ type: 'Close' });
            break;
          }
        }
      };
    },
  );

export type NoteEditorStore = ReturnType<typeof createNoteEditorStore>;
