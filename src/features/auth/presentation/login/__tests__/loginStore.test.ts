import type { AuthRepository } from '@/features/auth/domain/AuthRepository';
import { SignInUseCase, SignUpUseCase } from '@/features/auth/domain/usecases';
import { flushPromises } from '@/testing/FakeNoteRepository';

import type { LoginEffect } from '../loginContract';
import { createLoginStore } from '../loginStore';

function setup(overrides: Partial<AuthRepository> = {}) {
  const repository = {
    signIn: jest.fn().mockResolvedValue({ id: '1', email: 'a@b.co' }),
    signUp: jest.fn().mockResolvedValue('CONFIRMATION_REQUIRED'),
    ...overrides,
  } as unknown as AuthRepository;
  const store = createLoginStore({
    signIn: new SignInUseCase(repository),
    signUp: new SignUpUseCase(repository),
  });
  const effects: LoginEffect[] = [];
  store.onEffect((effect) => effects.push(effect));
  return { repository, store, effects };
}

describe('loginStore', () => {
  it('valida el correo antes de llamar al repositorio', async () => {
    const { repository, store } = setup();
    store.dispatch({ type: 'ChangeEmail', value: 'no-es-correo' });
    store.dispatch({ type: 'ChangePassword', value: 'secreto123' });

    store.dispatch({ type: 'Submit' });
    await flushPromises();

    expect(store.state.getState().error).toBe('Ingresa un correo válido.');
    expect(repository.signIn).not.toHaveBeenCalled();
  });

  it('inicia sesión con el correo normalizado', async () => {
    const { repository, store } = setup();
    store.dispatch({ type: 'ChangeEmail', value: '  Ana@Mail.COM ' });
    store.dispatch({ type: 'ChangePassword', value: 'secreto123' });

    store.dispatch({ type: 'Submit' });
    await flushPromises();

    expect(repository.signIn).toHaveBeenCalledWith({ email: 'ana@mail.com', password: 'secreto123' });
    expect(store.state.getState().isSubmitting).toBe(false);
  });

  it('tras registrarse pide confirmar el correo y vuelve a modo inicio de sesión', async () => {
    const { store, effects } = setup();
    store.dispatch({ type: 'ToggleMode' });
    store.dispatch({ type: 'ChangeEmail', value: 'ana@mail.com' });
    store.dispatch({ type: 'ChangePassword', value: 'secreto123' });

    store.dispatch({ type: 'Submit' });
    await flushPromises();

    expect(effects).toEqual([
      { type: 'ShowMessage', message: 'Revisa tu correo para confirmar la cuenta.' },
    ]);
    expect(store.state.getState()).toMatchObject({ mode: 'signIn', password: '' });
  });
});
