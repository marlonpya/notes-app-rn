import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDependencies } from '@/core/di/DependenciesProvider';
import { useMviEffect, useMviState, useMviStore } from '@/core/mvi/hooks';
import { Button, ErrorBanner, showMessage } from '@/core/ui/components';
import { spacing, useColors } from '@/core/ui/theme';

import type { Note } from '../../domain/Note';
import { createNotesListStore } from './notesListStore';

export function NotesListScreen() {
  const { observeNotes, deleteNote, syncNotes, signOut } = useDependencies();
  const store = useMviStore(() =>
    createNotesListStore({ observeNotes, deleteNote, syncNotes, signOut }),
  );
  const state = useMviState(store, (s) => s);
  const colors = useColors();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    store.dispatch({ type: 'Start' });
  }, [store]);

  useMviEffect(store, (effect) => {
    switch (effect.type) {
      case 'NavigateToEditor':
        router.push({ pathname: '/note/[id]', params: { id: effect.id ?? 'new' } });
        break;
      case 'ShowMessage':
        showMessage(effect.message);
        break;
    }
  });

  const confirmDelete = (note: Note) =>
    Alert.alert('Eliminar nota', `¿Eliminar "${note.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => store.dispatch({ type: 'DeleteNote', id: note.id }),
      },
    ]);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Mis notas',
          headerRight: () => (
            <Button variant="text" label="Salir" onPress={() => store.dispatch({ type: 'SignOut' })} />
          ),
        }}
      />

      {state.isLoading ? (
        <ActivityIndicator style={styles.flex} color={colors.primary} />
      ) : (
        <FlatList
          data={state.notes}
          keyExtractor={(note) => note.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 96 }]}
          ListHeaderComponent={
            <ErrorBanner message={state.error} onDismiss={() => store.dispatch({ type: 'DismissError' })} />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.textMuted }]}>
              Aún no tienes notas. Crea la primera con el botón +.
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={state.isSyncing}
              onRefresh={() => store.dispatch({ type: 'Refresh' })}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <NoteRow
              note={item}
              onPress={() => store.dispatch({ type: 'OpenNote', id: item.id })}
              onLongPress={() => confirmDelete(item)}
            />
          )}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nueva nota"
        onPress={() => store.dispatch({ type: 'CreateNote' })}
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + spacing.lg }]}>
        <Text style={[styles.fabIcon, { color: colors.onPrimary }]}>+</Text>
      </Pressable>
    </View>
  );
}

function NoteRow({ note, onPress, onLongPress }: { note: Note; onPress: () => void; onLongPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}>
      <View style={styles.rowHeader}>
        <Text numberOfLines={1} style={[styles.rowTitle, { color: colors.text }]}>
          {note.title}
        </Text>
        {note.isPendingSync && <Text style={{ color: colors.textMuted }}>● sin sincronizar</Text>}
      </View>
      {!!note.content && (
        <Text numberOfLines={2} style={{ color: colors.textMuted }}>
          {note.content}
        </Text>
      )}
      <Text style={[styles.rowDate, { color: colors.textMuted }]}>
        {note.updatedAt.toLocaleString()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.md, gap: spacing.sm },
  empty: { textAlign: 'center', marginTop: spacing.xl },
  row: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.xs,
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  rowTitle: { flex: 1, fontSize: 17, fontWeight: '600' },
  rowDate: { fontSize: 12 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabIcon: { fontSize: 28, lineHeight: 30 },
});
