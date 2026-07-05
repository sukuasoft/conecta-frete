import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={Colors.mutedForeground}
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    color: Colors.foreground,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.input,
    color: Colors.foreground,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  inputError: {
    borderColor: Colors.destructive,
  },
  error: {
    color: Colors.destructive,
    fontSize: 12,
  },
});
