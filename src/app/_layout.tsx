import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';

import { DependenciesProvider } from '@/core/di/DependenciesProvider';
import { createAppContainer, DataLayerGate } from '@/core/di/flavor';
import { useSession } from '@/features/auth/presentation/useSession';

const container = createAppContainer();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <DependenciesProvider value={container}>
        <DataLayerGate>
          <RootNavigator />
        </DataLayerGate>
      </DependenciesProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const session = useSession();

  if (session.status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
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

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
