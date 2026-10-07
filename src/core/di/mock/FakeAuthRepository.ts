import type { Unsubscribe } from '@/core/types';
import { AuthError } from '@/features/auth/domain/AuthError';
import type {
  AuthRepository,
  Credentials,
  SignUpResult,
  User,
} from '@/features/auth/domain/AuthRepository';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Contraseña que fuerza un error, para probar ese estado de la UI. */
export const MOCK_FAILING_PASSWORD = 'fallar123';

/** Auth falsa: acepta cualquier credencial válida salvo MOCK_FAILING_PASSWORD. */
export class FakeAuthRepository implements AuthRepository {
  private user: User | null = null;
  private listeners = new Set<(user: User | null) => void>();

  constructor(private readonly latencyMs = 300) {}

  async getCurrentUser(): Promise<User | null> {
    return this.user;
  }

  observeUser(listener: (user: User | null) => void): Unsubscribe {
    this.listeners.add(listener);
    listener(this.user);
    return () => this.listeners.delete(listener);
  }

  async signIn({ email, password }: Credentials): Promise<User> {
    await delay(this.latencyMs);
    if (password === MOCK_FAILING_PASSWORD) throw new AuthError('INVALID_CREDENTIALS');
    this.setUser({ id: 'mock-user', email });
    return this.user!;
  }

  async signUp(credentials: Credentials): Promise<SignUpResult> {
    await this.signIn(credentials);
    return 'SIGNED_IN';
  }

  async signOut(): Promise<void> {
    this.setUser(null);
  }

  private setUser(user: User | null) {
    this.user = user;
    this.listeners.forEach((listener) => listener(user));
  }
}
