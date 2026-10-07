import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  type TextInputProps,
} from 'react-native';

import { spacing, useColors } from './theme';

export function showMessage(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'text';
}

export function Button({ label, onPress, loading = false, variant = 'primary' }: ButtonProps) {
  const colors = useColors();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        isPrimary && { backgroundColor: colors.primary },
        { opacity: pressed || loading ? 0.7 : 1 },
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.primary} />
      ) : (
        <Text style={[styles.buttonLabel, { color: isPrimary ? colors.onPrimary : colors.primary }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function TextField(props: TextInputProps) {
  const colors = useColors();
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      {...props}
      style={[
        styles.input,
        { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
        props.style,
      ]}
    />
  );
}

export function ErrorBanner({ message, onDismiss }: { message: string | null; onDismiss?: () => void }) {
  const colors = useColors();
  if (!message) return null;
  return (
    <Pressable
      onPress={onDismiss}
      style={[styles.banner, { backgroundColor: colors.dangerSurface }]}
      accessibilityRole="alert">
      <Text style={{ color: colors.danger }}>{message}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { fontSize: 16, fontWeight: '600' },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  banner: { borderRadius: 12, padding: spacing.md },
});
