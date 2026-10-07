import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import type { PropsWithChildren } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { db } from './client';
import migrations from './migrations/migrations';

/** Aplica las migraciones SQL de drizzle-kit antes de mostrar la app (≈ Room.migrations). */
export function DatabaseGate({ children }: PropsWithChildren) {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error al preparar la base de datos: {error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }
  return children;
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
