import type { AuthRepository } from '@/features/auth/domain/AuthRepository';
import { SignOutUseCase } from '@/features/auth/domain/usecases';
import {
  DeleteNoteUseCase,
  ObserveNotesUseCase,
  SyncNotesUseCase,
} from '@/features/notes/domain/usecases';
import { FakeNoteRepository, flushPromises } from '@/testing/FakeNoteRepository';

import type { NotesListEffect } from '../notesListContract';
import { createNotesListStore } from '../notesListStore';

function setup() {
  const repository = new FakeNoteRepository();
  const authRepository = { signOut: jest.fn().mockResolvedValue(undefined) } as unknown as AuthRepository;
  const store = createNotesListStore({
    observeNotes: new ObserveNotesUseCase(repository),
    deleteNote: new DeleteNoteUseCase(repository),
    syncNotes: new SyncNotesUseCase(repository),
    signOut: new SignOutUseCase(authRepository, repository),
  });
  const effects: NotesListEffect[] = [];
  store.onEffect((effect) => effects.push(effect));
  return { repository, authRepository, store, effects };
}

describe('notesListStore', () => {
  it('Start observa las notas y sincroniza', async () => {
    const { repository, store } = setup();
    await repository.saveNote({ title: 'Primera', content: '' });

    store.dispatch({ type: 'Start' });
    await flushPromises();

    const state = store.state.getState();
    expect(state.isLoading).toBe(false);
    expect(state.notes.map((n) => n.title)).toEqual(['Primera']);
    expect(repository.syncCalls).toBe(1);
  });

  it('refleja los cambios del repositorio mientras observa', async () => {
    const { repository, store } = setup();
    store.dispatch({ type: 'Start' });
    await flushPromises();

    await repository.saveNote({ title: 'Nueva', content: '' });

    expect(store.state.getState().notes).toHaveLength(1);
  });

  it('deja de observar tras dispose', async () => {
    const { repository, store } = setup();
    store.dispatch({ type: 'Start' });
    await flushPromises();

    store.dispose();
    await repository.saveNote({ title: 'Ignorada', content: '' });

    expect(store.state.getState().notes).toHaveLength(0);
  });

  it('muestra un error si la sincronización falla sin perder las notas', async () => {
    const { repository, store } = setup();
    repository.syncError = new Error('Network request failed');
    await repository.saveNote({ title: 'Offline', content: '' });

    store.dispatch({ type: 'Start' });
    await flushPromises();

    const state = store.state.getState();
    expect(state.error).toMatch(/Sin conexión/);
    expect(state.notes).toHaveLength(1);
    expect(state.isSyncing).toBe(false);
  });

  it('OpenNote y CreateNote emiten navegación', () => {
    const { store, effects } = setup();

    store.dispatch({ type: 'OpenNote', id: 'abc' });
    store.dispatch({ type: 'CreateNote' });

    expect(effects).toEqual([
      { type: 'NavigateToEditor', id: 'abc' },
      { type: 'NavigateToEditor', id: null },
    ]);
  });

  it('SignOut limpia los datos locales y cierra sesión', async () => {
    const { repository, authRepository, store } = setup();
    await repository.saveNote({ title: 'Privada', content: '' });

    store.dispatch({ type: 'SignOut' });
    await flushPromises();

    expect(repository.notes.size).toBe(0);
    expect(authRepository.signOut).toHaveBeenCalled();
  });
});
