import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.foreground,
    border: Colors.border,
    notification: Colors.primary,
  },
};

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const setSession = useAuthStore((s) => s.setSession);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  useEffect(() => {
    initialize();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) await refreshProfile();
      else useAuthStore.setState({ profile: null });
    });

    return () => sub.subscription.unsubscribe();
  }, [initialize, setSession, refreshProfile]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navTheme}>
        <AuthBootstrap>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
          <StatusBar style="light" />
        </AuthBootstrap>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
