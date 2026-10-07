import type { Unsubscribe } from '@/core/types';

export interface User {
  id: string;
  email: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export type SignUpResult = 'SIGNED_IN' | 'CONFIRMATION_REQUIRED';

export interface AuthRepository {
  getCurrentUser(): Promise<User | null>;
  /** Emite el usuario actual (o null) y cada cambio de sesión. */
  observeUser(listener: (user: User | null) => void): Unsubscribe;
  signIn(credentials: Credentials): Promise<User>;
  signUp(credentials: Credentials): Promise<SignUpResult>;
  signOut(): Promise<void>;
}
