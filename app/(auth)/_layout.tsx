import { Redirect, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { isAuthenticated, initialized } = useAuth();

  if (initialized && isAuthenticated) {
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
