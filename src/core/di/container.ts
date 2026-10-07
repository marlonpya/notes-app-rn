import { db } from '@/core/db/client';
import { supabase } from '@/core/supabase/client';
import { SupabaseAuthRepository } from '@/features/auth/data/SupabaseAuthRepository';
import { SignInUseCase, SignOutUseCase, SignUpUseCase } from '@/features/auth/domain/usecases';
import { NoteDao } from '@/features/notes/data/local/NoteDao';
import { SyncCursorStore } from '@/features/notes/data/local/SyncCursorStore';
import { NoteRepositoryImpl } from '@/features/notes/data/NoteRepositoryImpl';
import { NoteRemoteDataSource } from '@/features/notes/data/remote/NoteRemoteDataSource';
import {
  DeleteNoteUseCase,
  GetNoteUseCase,
  ObserveNotesUseCase,
  SaveNoteUseCase,
  SyncNotesUseCase,
} from '@/features/notes/domain/usecases';

import type { Dependencies } from './Dependencies';

/** Composition root (≈ @Module de Hilt). Único lugar que conoce las implementaciones. */
export function createContainer(): Dependencies {
  const authRepository = new SupabaseAuthRepository(supabase);

  const getUserId = async () => {
    const user = await authRepository.getCurrentUser();
    if (!user) throw new Error('NOT_AUTHENTICATED');
    return user.id;
  };

  const noteRepository = new NoteRepositoryImpl(
    new NoteDao(db),
    new NoteRemoteDataSource(supabase),
    new SyncCursorStore(),
    getUserId,
  );

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
