import type { Note } from '@/features/notes/domain/Note';

import { MOCK_FAILING_PASSWORD } from '../FakeAuthRepository';
import { createMockContainer } from '../mockContainer';

describe('createMockContainer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('inicia sesión con cualquier credencial válida', async () => {
    const deps = createMockContainer();

    const signIn = deps.signIn.execute({ email: 'demo@mail.com', password: 'secreto' });
    await jest.runAllTimersAsync();

    await expect(signIn).resolves.toEqual({ id: 'mock-user', email: 'demo@mail.com' });
    await expect(deps.authRepository.getCurrentUser()).resolves.not.toBeNull();
  });

  it('permite simular un error de login', async () => {
    const deps = createMockContainer();

    const signIn = deps.signIn.execute({ email: 'demo@mail.com', password: MOCK_FAILING_PASSWORD });
    const assertion = expect(signIn).rejects.toMatchObject({ reason: 'INVALID_CREDENTIALS' });
    await jest.runAllTimersAsync();

    await assertion;
  });

  it('expone notas de ejemplo y sincroniza las pendientes', async () => {
    const deps = createMockContainer();
    let notes: Note[] = [];
    deps.observeNotes.execute((value) => (notes = value));

    expect(notes.length).toBeGreaterThan(0);

    const saved = await deps.saveNote.execute({ title: 'Nueva', content: '' });
    expect(notes.find((note) => note.id === saved.id)?.isPendingSync).toBe(true);

    const sync = deps.syncNotes.execute();
    await jest.runAllTimersAsync();
    await sync;

    expect(notes.every((note) => !note.isPendingSync)).toBe(true);
  });
});
