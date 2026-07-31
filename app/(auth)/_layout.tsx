import { Redirect, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { isAuthenticated, initialized, profile } = useAuth();

  const redirectTo =
    initialized && isAuthenticated
      ? profile && !profile.onboarding_feito
        ? '/onboarding'
        : '/(app)'
      : null;

  return (
    <>
      {redirectTo ? <Redirect href={redirectTo} /> : null}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      />
    </>
  );
}
