import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useNotificacoes } from '@/hooks/useNotificacoes';

export default function AppLayout() {
  const { isAuthenticated, initialized, profile } = useAuth();
  const { data: notifs = [] } = useNotificacoes(profile?.id);
  const unread = notifs.filter((n) => !n.lida).length;

  if (initialized && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.foreground,
        headerTitleStyle: { fontWeight: '800' },
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedForeground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notificacoes"
        options={{
          title: 'Alertas',
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
