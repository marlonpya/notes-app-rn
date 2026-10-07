import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDependencies } from '@/core/di/DependenciesProvider';
import { useMviEffect, useMviState, useMviStore } from '@/core/mvi/hooks';
import { Button, ErrorBanner, showMessage, TextField } from '@/core/ui/components';
import { spacing, useColors } from '@/core/ui/theme';

import { createLoginStore } from './loginStore';

export function LoginScreen() {
  const { signIn, signUp } = useDependencies();
  const store = useMviStore(() => createLoginStore({ signIn, signUp }));
  const state = useMviState(store, (s) => s);
  const colors = useColors();

  useMviEffect(store, (effect) => {
    if (effect.type === 'ShowMessage') showMessage(effect.message);
  });

  const isSignIn = state.mode === 'signIn';

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={[styles.flex, styles.container]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Notas</Text>
          <Text style={{ color: colors.textMuted }}>
            {isSignIn ? 'Inicia sesión para sincronizar tus notas' : 'Crea tu cuenta'}
          </Text>
        </View>

        <TextField
          placeholder="Correo"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={state.email}
          onChangeText={(value) => store.dispatch({ type: 'ChangeEmail', value })}
        />
        <TextField
          placeholder="Contraseña"
          secureTextEntry
          autoComplete={isSignIn ? 'current-password' : 'new-password'}
          value={state.password}
          onChangeText={(value) => store.dispatch({ type: 'ChangePassword', value })}
          onSubmitEditing={() => store.dispatch({ type: 'Submit' })}
        />

        <ErrorBanner message={state.error} />

        <Button
          label={isSignIn ? 'Iniciar sesión' : 'Crear cuenta'}
          loading={state.isSubmitting}
          onPress={() => store.dispatch({ type: 'Submit' })}
        />
        <Button
          variant="text"
          label={isSignIn ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          onPress={() => store.dispatch({ type: 'ToggleMode' })}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.md, justifyContent: 'center' },
  header: { gap: spacing.xs, marginBottom: spacing.md },
  title: { fontSize: 34, fontWeight: '700' },
});
