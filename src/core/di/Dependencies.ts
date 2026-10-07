import type { AuthRepository } from '@/features/auth/domain/AuthRepository';
import type { SignInUseCase, SignOutUseCase, SignUpUseCase } from '@/features/auth/domain/usecases';
import type {
  DeleteNoteUseCase,
  GetNoteUseCase,
  ObserveNotesUseCase,
  SaveNoteUseCase,
  SyncNotesUseCase,
} from '@/features/notes/domain/usecases';

/** Lo que la capa de presentación puede pedir. Solo dominio: nada de SQLite ni Supabase. */
export interface Dependencies {
  authRepository: AuthRepository;
  signIn: SignInUseCase;
  signUp: SignUpUseCase;
  signOut: SignOutUseCase;
  observeNotes: ObserveNotesUseCase;
  getNote: GetNoteUseCase;
  saveNote: SaveNoteUseCase;
  deleteNote: DeleteNoteUseCase;
  syncNotes: SyncNotesUseCase;
}
