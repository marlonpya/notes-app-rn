import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { db } from '@/core/db/client';
import migrations from '@/core/db/migrations/migrations';
import { createContainer } from '@/core/di/container';
import { DependenciesProvider } from '@/core/di/DependenciesProvider';
import { useSession } from '@/features/auth/presentation/useSession';

const container = createContainer();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Aplica las migraciones SQL generadas por drizzle-kit (≈ Room.migrations).
  const { success, error } = useMigrations(db, migrations);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <DependenciesProvider value={container}>
        {error ? (
          <Centered>
            <Text>Error al preparar la base de datos: {error.message}</Text>
          </Centered>
        ) : success ? (
          <RootNavigator />
        ) : (
          <Centered>
            <ActivityIndicator />
          </Centered>
        )}
      </DependenciesProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const session = useSession();

  if (session.status === 'loading') {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  const isSignedIn = session.status === 'signedIn';

  return (
    <Stack>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="note/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
