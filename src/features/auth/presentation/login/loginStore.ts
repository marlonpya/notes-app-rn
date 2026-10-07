import { createMviStore } from '@/core/mvi/createMviStore';

import type { SignInUseCase, SignUpUseCase } from '../../domain/usecases';
import { toAuthErrorMessage } from '../authErrorMessages';
import { initialLoginState, type LoginEffect, type LoginIntent, type LoginState } from './loginContract';

export interface LoginDeps {
  signIn: SignInUseCase;
  signUp: SignUpUseCase;
}

/** Al iniciar sesión no navegamos: el layout raíz reacciona al cambio de sesión. */
export const createLoginStore = (deps: LoginDeps) =>
  createMviStore<LoginState, LoginIntent, LoginEffect>(
    initialLoginState,
    ({ getState, setState, emit }) =>
      async (intent) => {
        switch (intent.type) {
          case 'ChangeEmail':
            setState({ email: intent.value, error: null });
            break;
          case 'ChangePassword':
            setState({ password: intent.value, error: null });
            break;
          case 'ToggleMode':
            setState((s) => ({ mode: s.mode === 'signIn' ? 'signUp' : 'signIn', error: null }));
            break;
          case 'Submit': {
            const { mode, email, password, isSubmitting } = getState();
            if (isSubmitting) return;
            setState({ isSubmitting: true, error: null });
            try {
              if (mode === 'signIn') {
                await deps.signIn.execute({ email, password });
              } else {
                const result = await deps.signUp.execute({ email, password });
                if (result === 'CONFIRMATION_REQUIRED') {
                  emit({ type: 'ShowMessage', message: 'Revisa tu correo para confirmar la cuenta.' });
                  setState({ mode: 'signIn', password: '' });
                }
              }
            } catch (error) {
              setState({ error: toAuthErrorMessage(error) });
            } finally {
              setState({ isSubmitting: false });
            }
            break;
          }
        }
      },
  );

export type LoginStore = ReturnType<typeof createLoginStore>;
