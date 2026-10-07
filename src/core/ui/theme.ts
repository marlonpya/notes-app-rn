import { useColorScheme } from 'react-native';

const light = {
  background: '#F7F7F5',
  surface: '#FFFFFF',
  text: '#1C1C1E',
  textMuted: '#6B6B70',
  border: '#E2E2E0',
  primary: '#2563EB',
  onPrimary: '#FFFFFF',
  danger: '#DC2626',
  dangerSurface: '#FEE2E2',
};

const dark: typeof light = {
  background: '#111113',
  surface: '#1C1C1F',
  text: '#F2F2F3',
  textMuted: '#9A9AA0',
  border: '#2E2E33',
  primary: '#60A5FA',
  onPrimary: '#0B1220',
  danger: '#F87171',
  dangerSurface: '#3B1414',
};

export type Colors = typeof light;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
