import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { useDependencies } from '@/core/di/DependenciesProvider';
import { useMviEffect, useMviState, useMviStore } from '@/core/mvi/hooks';
import { Button, ErrorBanner, showMessage } from '@/core/ui/components';
import { spacing, useColors } from '@/core/ui/theme';

import { MAX_TITLE_LENGTH } from '../../domain/usecases';
import { createNoteEditorStore } from './noteEditorStore';

export function NoteEditorScreen({ noteId }: { noteId: string | null }) {
  const { getNote, saveNote, deleteNote, syncNotes } = useDependencies();
  const store = useMviStore(() => createNoteEditorStore({ getNote, saveNote, deleteNote, syncNotes }));
  const state = useMviState(store, (s) => s);
  const colors = useColors();

  useEffect(() => {
    store.dispatch({ type: 'Load', id: noteId });
  }, [store, noteId]);

  useMviEffect(store, (effect) => {
    switch (effect.type) {
      case 'Close':
        if (router.canGoBack()) router.back();
        break;
      case 'ShowMessage':
        showMessage(effect.message);
        break;
    }
  });

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          title: noteId ? 'Editar nota' : 'Nueva nota',
          headerRight: () => (
            <View style={styles.actions}>
              {noteId && (
                <Button variant="text" label="Eliminar" onPress={() => store.dispatch({ type: 'Delete' })} />
              )}
              <Button
                variant="text"
                label="Guardar"
                loading={state.isSaving}
                onPress={() => store.dispatch({ type: 'Save' })}
              />
            </View>
          ),
        }}
      />

      {state.isLoading ? (
        <ActivityIndicator style={styles.flex} color={colors.primary} />
      ) : (
        <View style={[styles.flex, styles.container]}>
          <ErrorBanner message={state.error} />
          <TextInput
            placeholder="Título"
            placeholderTextColor={colors.textMuted}
            maxLength={MAX_TITLE_LENGTH}
            value={state.title}
            onChangeText={(value) => store.dispatch({ type: 'ChangeTitle', value })}
            style={[styles.title, { color: colors.text }]}
          />
          <TextInput
            placeholder="Escribe tu nota…"
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            value={state.content}
            onChangeText={(value) => store.dispatch({ type: 'ChangeContent', value })}
            style={[styles.flex, styles.content, { color: colors.text }]}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: spacing.md, gap: spacing.sm },
  actions: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', paddingVertical: spacing.sm },
  content: { fontSize: 17, lineHeight: 24 },
});
