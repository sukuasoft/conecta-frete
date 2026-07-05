import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Radius } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

interface Props extends PressableProps {
  title: string;
  variant?: Variant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...props
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'destructive' ? Colors.primaryForeground : Colors.primary}
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text` as const]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: Colors.destructive,
  },
  pressed: {
    opacity: 0.88,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryText: { color: Colors.primaryForeground },
  secondaryText: { color: Colors.secondaryForeground },
  outlineText: { color: Colors.primary },
  ghostText: { color: Colors.foreground },
  destructiveText: { color: Colors.destructiveForeground },
});
