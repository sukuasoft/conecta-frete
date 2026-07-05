import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { FreteCard } from '@/components/FreteCard';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/theme';
import { formatKz } from '@/lib/angola';
import type { Profile } from '@/lib/types';
import { useAllFretes } from '@/hooks/useFretes';
import { useBroadcast } from '@/hooks/useNotificacoes';
import { useAllProfiles, useToggleBloqueio } from '@/hooks/useProfiles';

export function AdminDashboard({ user }: { user: Profile }) {
  const { data: profiles = [], isLoading: loadingProfiles } = useAllProfiles(true);
  const { data: fretes = [], isLoading: loadingFretes } = useAllFretes(true);
  const toggle = useToggleBloqueio();
  const broadcast = useBroadcast();

  const clientes = profiles.filter((p) => p.tipo === 'cliente');
  const motoristas = profiles.filter((p) => p.tipo === 'motorista');
  const online = motoristas.filter((m) => m.disponivel);
  const ativos = fretes.filter((f) => f.status === 'aceito' || f.status === 'em_transito');
  const receita = fretes
    .filter((f) => f.status === 'concluido')
    .reduce((s, f) => s + Number(f.valor), 0);

  const [broadcastForm, setBroadcastForm] = useState({
    titulo: '',
    mensagem: '',
    alvo: 'todos' as 'todos' | 'clientes' | 'motoristas',
  });


  return (
    <Screen scroll loading={loadingProfiles || loadingFretes}>
      <View>
        <Text style={styles.hello}>Painel Admin</Text>
        <Text style={styles.sub}>Olá, {user.nome.split(' ')[0]}</Text>
      </View>

      <View style={styles.stats}>
        <StatCard label="Utilizadores" value={`${profiles.length}`} sub={`${clientes.length} clientes`} />
        <StatCard label="Online" value={`${online.length}`} sub={`de ${motoristas.length}`} />
      </View>
      <View style={styles.stats}>
        <StatCard label="Fretes" value={`${fretes.length}`} sub={`${ativos.length} ativos`} />
        <StatCard label="Receita" value={formatKz(receita)} highlight />
      </View>

      <Card style={styles.block}>
        <Text style={styles.section}>Broadcast</Text>
        <Input
          label="Título"
          value={broadcastForm.titulo}
          onChangeText={(titulo) => setBroadcastForm((s) => ({ ...s, titulo }))}
        />
        <Input
          label="Mensagem"
          value={broadcastForm.mensagem}
          onChangeText={(mensagem) => setBroadcastForm((s) => ({ ...s, mensagem }))}
        />
        <View style={styles.row}>
          {(['todos', 'clientes', 'motoristas'] as const).map((alvo) => (
            <Button
              key={alvo}
              title={alvo}
              variant={broadcastForm.alvo === alvo ? 'primary' : 'secondary'}
              style={styles.chip}
              onPress={() => setBroadcastForm((s) => ({ ...s, alvo }))}
            />
          ))}
        </View>
        <Button
          title="Enviar"
          loading={broadcast.isPending}
          onPress={async () => {
            try {
              const n = await broadcast.mutateAsync(broadcastForm);
              Alert.alert('Enviado', `${n} utilizadores notificados.`);
              setBroadcastForm({ titulo: '', mensagem: '', alvo: 'todos' });
            } catch (e: any) {
              Alert.alert('Erro', e.message);
            }
          }}
        />
      </Card>

      <View style={styles.block}>
        <Text style={styles.section}>Utilizadores</Text>
        {profiles.map((p) => (
          <Card key={p.id} style={styles.userRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{p.nome}</Text>
              <Text style={styles.meta}>
                {p.tipo} · {p.email}
                {p.bloqueado ? ' · bloqueado' : ''}
              </Text>
            </View>
            {p.tipo !== 'admin' && (
              <Button
                title={p.bloqueado ? 'Desbloquear' : 'Bloquear'}
                variant={p.bloqueado ? 'primary' : 'destructive'}
                style={styles.smallBtn}
                onPress={() =>
                  toggle.mutate({ userId: p.id, bloqueado: !p.bloqueado })
                }
              />
            )}
          </Card>
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.section}>Fretes recentes</Text>
        {fretes.slice(0, 10).map((f) => (
          <FreteCard key={f.id} frete={f} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: { color: Colors.foreground, fontSize: 28, fontWeight: '800' },
  sub: { color: Colors.mutedForeground, marginTop: 4, fontSize: 15, lineHeight: 22 },
  stats: { flexDirection: 'row', gap: 12 },
  block: { gap: 10 },
  section: { color: Colors.foreground, fontSize: 18, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { minHeight: 36, paddingHorizontal: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userName: { color: Colors.foreground, fontWeight: '700' },
  meta: { color: Colors.mutedForeground, fontSize: 13, lineHeight: 18 },
  smallBtn: { minHeight: 36, paddingHorizontal: 10 },
});
