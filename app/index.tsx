import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function Index() {
  const { isAuthenticated, initialized, loading, profile } = useAuth();

  if (!initialized || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isSupabaseConfigured) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isAuthenticated) {
    if (profile && !profile.onboarding_feito) {
      return <Redirect href="/onboarding" />;
    }
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
