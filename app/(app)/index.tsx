import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { ClienteDashboard } from '@/components/dashboards/ClienteDashboard';
import { MotoristaDashboard } from '@/components/dashboards/MotoristaDashboard';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function HomeScreen() {
  const { profile, loading } = useAuth();

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (profile.bloqueado) {
    return (
      <View style={styles.center}>
        <Text style={styles.blockedTitle}>Conta bloqueada</Text>
        <Text style={styles.blockedSub}>Contacta o administrador.</Text>
      </View>
    );
  }

  if (profile.tipo === 'admin') return <AdminDashboard user={profile} />;
  if (profile.tipo === 'motorista') return <MotoristaDashboard user={profile} />;
  return <ClienteDashboard user={profile} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  blockedTitle: {
    color: Colors.destructive,
    fontSize: 20,
    fontWeight: '800',
  },
  blockedSub: {
    color: Colors.mutedForeground,
    marginTop: 8,
    textAlign: 'center',
  },
});

