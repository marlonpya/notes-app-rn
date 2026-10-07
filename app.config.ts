import type { ConfigContext, ExpoConfig } from 'expo/config';

// Extiende app.json según el flavor (≈ applicationIdSuffix / resValue por productFlavor).
// Así la app mock y la real pueden instalarse a la vez en el mismo dispositivo.
const isMock = process.env.EXPO_PUBLIC_DATA_SOURCE === 'mock';
const BASE_ID = 'com.marlonpya.notesapprn';
const appId = isMock ? `${BASE_ID}.mock` : BASE_ID;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: isMock ? 'Notas (Mock)' : 'Notas',
  slug: config.slug ?? 'notes-app-rn',
  scheme: isMock ? 'notesapprn-mock' : 'notesapprn',
  ios: { ...config.ios, bundleIdentifier: appId },
  android: { ...config.android, package: appId },
});
