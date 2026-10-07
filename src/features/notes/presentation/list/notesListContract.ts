import type { Note } from '../../domain/Note';

export interface NotesListState {
  notes: Note[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

export const initialNotesListState: NotesListState = {
  notes: [],
  isLoading: true,
  isSyncing: false,
  error: null,
};

export type NotesListIntent =
  | { type: 'Start' }
  | { type: 'Refresh' }
  | { type: 'CreateNote' }
  | { type: 'OpenNote'; id: string }
  | { type: 'DeleteNote'; id: string }
  | { type: 'SignOut' }
  | { type: 'DismissError' };

export type NotesListEffect =
  | { type: 'NavigateToEditor'; id: string | null }
  | { type: 'ShowMessage'; message: string };
