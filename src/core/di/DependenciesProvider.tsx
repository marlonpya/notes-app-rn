import { createContext, use, type PropsWithChildren } from 'react';

import type { Dependencies } from './Dependencies';

const DependenciesContext = createContext<Dependencies | null>(null);

/** En tests se pasa un `value` con fakes (≈ @TestInstallIn de Hilt). */
export function DependenciesProvider({ value, children }: PropsWithChildren<{ value: Dependencies }>) {
  return <DependenciesContext value={value}>{children}</DependenciesContext>;
}

export function useDependencies(): Dependencies {
  const dependencies = use(DependenciesContext);
  if (!dependencies) throw new Error('useDependencies debe usarse dentro de <DependenciesProvider>');
  return dependencies;
}
