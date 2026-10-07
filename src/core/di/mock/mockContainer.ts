import { SignInUseCase, SignOutUseCase, SignUpUseCase } from '@/features/auth/domain/usecases';
import {
  DeleteNoteUseCase,
  GetNoteUseCase,
  ObserveNotesUseCase,
  SaveNoteUseCase,
  SyncNotesUseCase,
} from '@/features/notes/domain/usecases';

import type { Dependencies } from '../Dependencies';
import { FakeAuthRepository } from './FakeAuthRepository';
import { InMemoryNoteRepository } from './InMemoryNoteRepository';

/**
 * Composition root del flavor "mock". Mismos casos de uso, otras implementaciones.
 * No importa Supabase ni SQLite: no necesita credenciales ni red.
 */
export function createMockContainer(): Dependencies {
  const authRepository = new FakeAuthRepository();
  const noteRepository = new InMemoryNoteRepository();

  return {
    authRepository,
    signIn: new SignInUseCase(authRepository),
    signUp: new SignUpUseCase(authRepository),
    signOut: new SignOutUseCase(authRepository, noteRepository),
    observeNotes: new ObserveNotesUseCase(noteRepository),
    getNote: new GetNoteUseCase(noteRepository),
    saveNote: new SaveNoteUseCase(noteRepository),
    deleteNote: new DeleteNoteUseCase(noteRepository),
    syncNotes: new SyncNotesUseCase(noteRepository),
  };
}
