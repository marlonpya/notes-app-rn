export interface NoteEditorState {
  id: string | null;
  title: string;
  content: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const initialNoteEditorState: NoteEditorState = {
  id: null,
  title: '',
  content: '',
  isLoading: false,
  isSaving: false,
  error: null,
};

export type NoteEditorIntent =
  | { type: 'Load'; id: string | null }
  | { type: 'ChangeTitle'; value: string }
  | { type: 'ChangeContent'; value: string }
  | { type: 'Save' }
  | { type: 'Delete' };

export type NoteEditorEffect =
  | { type: 'Close' }
  | { type: 'ShowMessage'; message: string };
