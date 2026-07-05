import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

interface Props extends ViewProps {
  scroll?: boolean;
  loading?: boolean;
}

export function Screen({ children, scroll, loading, style, ...props }: Props) {
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, style]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...props}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, style]} {...props}>
          {children}
        </View>
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
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
