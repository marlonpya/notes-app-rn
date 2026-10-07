import {
  isAuthError,
  type SupabaseClient,
  type User as SupabaseUser,
} from '@supabase/supabase-js';

import type { Unsubscribe } from '@/core/types';

import { AuthError, type AuthErrorReason } from '../domain/AuthError';
import type { AuthRepository, Credentials, SignUpResult, User } from '../domain/AuthRepository';

const toDomain = (user: SupabaseUser): User => ({ id: user.id, email: user.email ?? '' });

const REASON_BY_CODE: Record<string, AuthErrorReason> = {
  invalid_credentials: 'INVALID_CREDENTIALS',
  user_already_exists: 'USER_ALREADY_EXISTS',
  email_not_confirmed: 'EMAIL_NOT_CONFIRMED',
};

/** Traduce errores de Supabase al dominio: la presentación nunca ve el SDK. */
function toDomainError(error: unknown): AuthError {
  if (isAuthError(error)) {
    const reason = (error.code && REASON_BY_CODE[error.code]) || 'UNKNOWN';
    return new AuthError(reason, error.message);
  }
  if (error instanceof TypeError || (error instanceof Error && /network|fetch/i.test(error.message))) {
    return new AuthError('NETWORK', error.message);
  }
  return new AuthError('UNKNOWN', error instanceof Error ? error.message : String(error));
}

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getCurrentUser(): Promise<User | null> {
    // getSession lee la sesión persistida (funciona offline).
    const { data, error } = await this.client.auth.getSession();
    if (error) throw toDomainError(error);
    return data.session ? toDomain(data.session.user) : null;
  }

  observeUser(listener: (user: User | null) => void): Unsubscribe {
    // onAuthStateChange emite INITIAL_SESSION al suscribirse.
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      listener(session ? toDomain(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
  }

  async signIn({ email, password }: Credentials): Promise<User> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return toDomain(data.user);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async signUp({ email, password }: Credentials): Promise<SignUpResult> {
    try {
      const { data, error } = await this.client.auth.signUp({ email, password });
      if (error) throw error;
      return data.session ? 'SIGNED_IN' : 'CONFIRMATION_REQUIRED';
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async signOut(): Promise<void> {
    // scope 'local': cierra sesión en este dispositivo aunque no haya red.
    const { error } = await this.client.auth.signOut({ scope: 'local' });
    if (error) throw toDomainError(error);
  }
}
