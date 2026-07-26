import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { useToastStore } from '@/stores/toastStore';

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const visible = useToastStore((s) => s.visible);
  const message = useToastStore((s) => s.message);
  const type = useToastStore((s) => s.type);
  const hide = useToastStore((s) => s.hide);

  if (!visible) return null;

  return (
    <Pressable
      onPress={hide}
      style={[
        styles.toast,
        type === 'sucesso' && styles.sucesso,
        type === 'erro' && styles.erro,
        { top: insets.top + 12 },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  sucesso: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(30, 55, 42, 0.96)',
  },
  erro: {
    borderColor: Colors.destructive,
    backgroundColor: 'rgba(55, 28, 28, 0.96)',
  },
  text: {
    color: Colors.foreground,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
