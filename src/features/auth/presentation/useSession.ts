import { useEffect, useState } from 'react';

import { useDependencies } from '@/core/di/DependenciesProvider';

import type { User } from '../domain/AuthRepository';

export type SessionState =
  | { status: 'loading' }
  | { status: 'signedIn'; user: User }
  | { status: 'signedOut' };

/** Estado global de sesión; el layout raíz lo usa para proteger las rutas. */
export function useSession(): SessionState {
  const { authRepository } = useDependencies();
  const [session, setSession] = useState<SessionState>({ status: 'loading' });

  useEffect(
    () =>
      authRepository.observeUser((user) =>
        setSession(user ? { status: 'signedIn', user } : { status: 'signedOut' }),
      ),
    [authRepository],
  );

  return session;
}
