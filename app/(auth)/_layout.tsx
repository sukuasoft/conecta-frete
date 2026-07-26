import { Redirect, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { isAuthenticated, initialized, profile } = useAuth();

  if (initialized && isAuthenticated) {
    if (profile && !profile.onboarding_feito) {
      return <Redirect href="/onboarding" />;
    }
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
