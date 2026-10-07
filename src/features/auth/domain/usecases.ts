import type { NoteRepository } from '@/features/notes/domain/NoteRepository';

import type { AuthRepository, Credentials, SignUpResult, User } from './AuthRepository';

export type AuthValidationReason = 'INVALID_EMAIL' | 'WEAK_PASSWORD';

export class AuthValidationError extends Error {
  constructor(readonly reason: AuthValidationReason) {
    super(reason);
    this.name = 'AuthValidationError';
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

function validate({ email, password }: Credentials): Credentials {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalized)) throw new AuthValidationError('INVALID_EMAIL');
  if (password.length < MIN_PASSWORD_LENGTH) throw new AuthValidationError('WEAK_PASSWORD');
  return { email: normalized, password };
}

export class SignInUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(credentials: Credentials): Promise<User> {
    return this.repository.signIn(validate(credentials));
  }
}

export class SignUpUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(credentials: Credentials): Promise<SignUpResult> {
    return this.repository.signUp(validate(credentials));
  }
}

/** Cierra sesión y elimina las notas locales para no dejarlas en el dispositivo. */
export class SignOutUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly noteRepository: NoteRepository,
  ) {}

  async execute(): Promise<void> {
    await this.noteRepository.clearLocal();
    await this.authRepository.signOut();
  }
}
