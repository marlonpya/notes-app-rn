import { useEffect, useEffectEvent, useState } from 'react';
import { useStore } from 'zustand';

import type { MviStore } from './createMviStore';

/** Crea un store por instancia de pantalla y lo libera al desmontar (≈ by viewModels()). */
export function useMviStore<S, I, E>(factory: () => MviStore<S, I, E>): MviStore<S, I, E> {
  const [store] = useState(factory);
  useEffect(() => () => store.dispose(), [store]);
  return store;
}

/** Lee una porción del estado; solo re-renderiza si esa porción cambia (≈ collectAsState). */
export function useMviState<S, I, E, T>(store: MviStore<S, I, E>, selector: (state: S) => T): T {
  return useStore(store.state, selector);
}

/** Consume efectos de una sola vez (≈ LaunchedEffect + flow.collect). */
export function useMviEffect<S, I, E>(store: MviStore<S, I, E>, listener: (effect: E) => void) {
  const onEffect = useEffectEvent(listener);
  useEffect(() => store.onEffect((effect) => onEffect(effect)), [store]);
}
