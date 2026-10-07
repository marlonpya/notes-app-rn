import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Unsubscribe } from '@/core/types';

export interface MviContext<S, E> {
  getState: () => S;
  /** Reduce el estado. Acepta un parcial o una función (≈ _state.update { it.copy(...) }). */
  setState: (update: Partial<S> | ((state: S) => Partial<S>)) => void;
  /** Emite un evento de una sola vez: navegación, toast... (≈ Channel/SharedFlow). */
  emit: (effect: E) => void;
  /** Registra una suscripción para cancelarla en dispose() (≈ viewModelScope). */
  track: (unsubscribe: Unsubscribe) => void;
}

export type IntentHandler<S, I, E> = (
  context: MviContext<S, E>,
) => (intent: I) => void | Promise<void>;

export interface MviStore<S, I, E> {
  readonly state: StoreApi<S>;
  dispatch: (intent: I) => void;
  onEffect: (listener: (effect: E) => void) => Unsubscribe;
  /** Cancela las suscripciones activas. El store sigue siendo usable. */
  dispose: () => void;
}

/**
 * Store MVI: la vista solo lee `state` y envía intents con `dispatch`.
 * Toda la lógica de presentación vive en el handler (≈ ViewModel MVI en Android).
 */
export function createMviStore<S extends object, I, E = never>(
  initialState: S,
  handler: IntentHandler<S, I, E>,
): MviStore<S, I, E> {
  const state = createStore<S>()(() => initialState);
  const effectListeners = new Set<(effect: E) => void>();
  const subscriptions = new Set<Unsubscribe>();

  const handle = handler({
    getState: state.getState,
    setState: (update) =>
      state.setState((current) => (typeof update === 'function' ? update(current) : update)),
    emit: (effect) => effectListeners.forEach((listener) => listener(effect)),
    track: (unsubscribe) => subscriptions.add(unsubscribe),
  });

  return {
    state,
    dispatch: (intent) => {
      Promise.resolve(handle(intent)).catch((error) =>
        console.error('[MVI] intent no manejado', intent, error),
      );
    },
    onEffect: (listener) => {
      effectListeners.add(listener);
      return () => effectListeners.delete(listener);
    },
    dispose: () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
      subscriptions.clear();
    },
  };
}
