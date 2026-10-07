import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

import type { Unsubscribe } from '@/core/types';

import type { AuthRepository, Credentials, SignUpResult, User } from '../domain/AuthRepository';

const toDomain = (user: SupabaseUser): User => ({ id: user.id, email: user.email ?? '' });

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getCurrentUser(): Promise<User | null> {
    // getSession lee la sesión persistida (funciona offline).
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
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
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return toDomain(data.user);
  }

  async signUp({ email, password }: Credentials): Promise<SignUpResult> {
    const { data, error } = await this.client.auth.signUp({ email, password });
    if (error) throw error;
    return data.session ? 'SIGNED_IN' : 'CONFIRMATION_REQUIRED';
  }

  async signOut(): Promise<void> {
    // scope 'local': cierra sesión en este dispositivo aunque no haya red.
    const { error } = await this.client.auth.signOut({ scope: 'local' });
    if (error) throw error;
  }
}
