import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

interface Props extends ScrollViewProps {
  scroll?: boolean;
  loading?: boolean;
  avoidKeyboard?: boolean;
  keyboardOffset?: number;
  style?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  scroll,
  loading,
  avoidKeyboard = true,
  keyboardOffset,
  style,
  contentContainerStyle,
  ...props
}: Props) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const verticalOffset =
    keyboardOffset ?? (Platform.OS === 'ios' ? headerHeight : 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Spacing.xl + insets.bottom + 24 },
        style,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, style]} {...props}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={verticalOffset}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
