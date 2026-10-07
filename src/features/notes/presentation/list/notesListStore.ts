import { createMviStore } from '@/core/mvi/createMviStore';
import type { SignOutUseCase } from '@/features/auth/domain/usecases';

import type { DeleteNoteUseCase, ObserveNotesUseCase, SyncNotesUseCase } from '../../domain/usecases';
import { toNoteErrorMessage } from '../noteErrorMessages';
import {
  initialNotesListState,
  type NotesListEffect,
  type NotesListIntent,
  type NotesListState,
} from './notesListContract';

export interface NotesListDeps {
  observeNotes: ObserveNotesUseCase;
  deleteNote: DeleteNoteUseCase;
  syncNotes: SyncNotesUseCase;
  signOut: SignOutUseCase;
}

export const createNotesListStore = (deps: NotesListDeps) =>
  createMviStore<NotesListState, NotesListIntent, NotesListEffect>(
    initialNotesListState,
    ({ setState, emit, track }) => {
      const sync = async () => {
        setState({ isSyncing: true });
        try {
          await deps.syncNotes.execute();
        } catch (error) {
          // Sin red no es un error bloqueante: las notas siguen guardadas localmente.
          setState({ error: toNoteErrorMessage(error) });
        } finally {
          setState({ isSyncing: false });
        }
      };

      return async (intent) => {
        switch (intent.type) {
          case 'Start':
            track(deps.observeNotes.execute((notes) => setState({ notes, isLoading: false })));
            await sync();
            break;
          case 'Refresh':
            await sync();
            break;
          case 'CreateNote':
            emit({ type: 'NavigateToEditor', id: null });
            break;
          case 'OpenNote':
            emit({ type: 'NavigateToEditor', id: intent.id });
            break;
          case 'DeleteNote':
            await deps.deleteNote.execute(intent.id);
            emit({ type: 'ShowMessage', message: 'Nota eliminada' });
            void sync();
            break;
          case 'SignOut':
            try {
              await deps.signOut.execute();
            } catch (error) {
              setState({ error: toNoteErrorMessage(error) });
            }
            break;
          case 'DismissError':
            setState({ error: null });
            break;
        }
      };
    },
  );

export type NotesListStore = ReturnType<typeof createNotesListStore>;
