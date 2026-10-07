/* eslint-disable @typescript-eslint/no-require-imports --
 * require condicional a propósito: un import estático cargaría Supabase y SQLite
 * también en el flavor mock. */
import type { ComponentType, PropsWithChildren } from 'react';

import type { Dependencies } from './Dependencies';

/**
 * "Flavor" de datos, elegido al compilar con EXPO_PUBLIC_DATA_SOURCE (≈ productFlavors).
 * Las EXPO_PUBLIC_* se incrustan en el bundle, así que el minificador elimina la rama
 * no usada y los `require` condicionales evitan cargar Supabase/SQLite en modo mock.
 */
export const isMockFlavor = process.env.EXPO_PUBLIC_DATA_SOURCE === 'mock';

// Usa ternarios, no `if` + `return`: Metro solo descarta un `require` cuando la condición
// constante está en un ternario o en un if/else; el código tras un `return` se empaqueta igual.
export function createAppContainer(): Dependencies {
  return process.env.EXPO_PUBLIC_DATA_SOURCE === 'mock'
    ? (require('./mock/mockContainer') as typeof import('./mock/mockContainer')).createMockContainer()
    : (require('./container') as typeof import('./container')).createContainer();
}

const Passthrough = ({ children }: PropsWithChildren) => children;

/** En el flavor real espera las migraciones de SQLite; en mock no hay base de datos. */
export const DataLayerGate: ComponentType<PropsWithChildren> =
  process.env.EXPO_PUBLIC_DATA_SOURCE === 'mock'
    ? Passthrough
    : (require('@/core/db/DatabaseGate') as typeof import('@/core/db/DatabaseGate')).DatabaseGate;
