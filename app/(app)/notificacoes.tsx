import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import {
  useMarcarLida,
  useMarcarTodasLidas,
  useNotificacoes,
} from '@/hooks/useNotificacoes';

export default function NotificacoesScreen() {
  const { profile } = useAuth();
  const { data: lista = [], isLoading } = useNotificacoes(profile?.id);
  const marcar = useMarcarLida();
  const marcarTodas = useMarcarTodasLidas();
  const unread = lista.filter((n) => !n.lida).length;

  return (
    <Screen scroll loading={isLoading}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificações</Text>
        {unread > 0 && profile && (
          <Button
            title="Marcar todas"
            variant="ghost"
            style={styles.small}
            onPress={() => marcarTodas.mutate(profile.id)}
          />
        )}
      </View>

      {lista.length === 0 && (
        <Text style={styles.empty}>Sem notificações.</Text>
      )}

      {lista.map((n) => (
        <Pressable key={n.id} onPress={() => !n.lida && marcar.mutate(n.id)}>
          <Card style={[styles.item, !n.lida && styles.unread]}>
            <Text style={styles.itemTitle}>{n.titulo}</Text>
            <Text style={styles.msg}>{n.mensagem}</Text>
            <Text style={styles.meta}>
              {new Date(n.criado_em).toLocaleString('pt-AO')} · {n.tipo}
            </Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: Colors.foreground, fontSize: 22, fontWeight: '800' },
  small: { minHeight: 36 },
  empty: { color: Colors.mutedForeground },
  item: { gap: 4, marginBottom: 4 },
  unread: { borderColor: Colors.primary },
  itemTitle: { color: Colors.foreground, fontWeight: '700' },
  msg: { color: Colors.mutedForeground, fontSize: 13 },
  meta: { color: Colors.mutedForeground, fontSize: 11 },
});
