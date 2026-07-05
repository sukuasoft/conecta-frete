import { Alert, StyleSheet, Text, View } from 'react-native';
import { FreteCard } from '@/components/FreteCard';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/theme';
import { formatKz, haversineKm } from '@/lib/angola';
import type { Profile } from '@/lib/types';
import {
  useAceitarFrete,
  useFretesMotorista,
  useOfertas,
  useRejeitarFrete,
} from '@/hooks/useFretes';
import { useUpdateProfile } from '@/hooks/useProfiles';

export function MotoristaDashboard({ user }: { user: Profile }) {
  const { data: ofertas = [], isLoading: loadingOfertas } = useOfertas(user.id);
  const { data: meus = [], isLoading: loadingMeus } = useFretesMotorista(user.id);
  const aceitar = useAceitarFrete();
  const rejeitar = useRejeitarFrete();
  const updateProfile = useUpdateProfile();

  const ativo = meus.find((f) => f.status === 'aceito' || f.status === 'em_transito');
  const concluidos = meus.filter((f) => f.status === 'concluido');
  const ganho = concluidos.reduce((s, f) => s + Number(f.valor), 0);

  const toggleDisponivel = async () => {
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        patch: { disponivel: !user.disponivel },
      });
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  return (
    <Screen scroll loading={loadingOfertas || loadingMeus}>
      <View>
        <Text style={styles.hello}>Olá, {user.nome.split(' ')[0]}</Text>
        <Text style={styles.sub}>
          {user.veiculo ?? 'Motorista'} · {user.capacidade_kg ?? 0} kg
        </Text>
      </View>

      <View style={styles.stats}>
        <StatCard label="Ofertas" value={`${ofertas.length}`} />
        <StatCard label="Faturamento" value={formatKz(ganho)} highlight />
      </View>

      <Button
        title={user.disponivel ? 'Ficar offline' : 'Ficar online'}
        variant={user.disponivel ? 'outline' : 'primary'}
        loading={updateProfile.isPending}
        onPress={toggleDisponivel}
      />

      {ativo && (
        <View style={styles.block}>
          <Text style={styles.section}>Entrega em andamento</Text>
          <FreteCard frete={ativo} viewerId={user.id} />
        </View>
      )}

      <View style={styles.block}>
        <Text style={styles.section}>Ofertas próximas</Text>
        {ofertas.length === 0 && (
          <Text style={styles.empty}>Nenhuma oferta no momento. Fique online.</Text>
        )}
        {ofertas.map((f) => {
          const dist = haversineKm(
            { lat: user.lat, lng: user.lng },
            { lat: f.origem_lat, lng: f.origem_lng },
          );
          return (
            <Card key={f.id} style={styles.offer}>
              <Text style={styles.rota}>
                {f.origem_endereco} → {f.destino_endereco}
              </Text>
              <Text style={styles.meta}>
                {f.tipo_carga} · {f.peso_kg} kg · {dist.toFixed(1)} km de si
              </Text>
              <Text style={styles.valor}>{formatKz(Number(f.valor))}</Text>
              <View style={styles.actions}>
                <Button
                  title="Rejeitar"
                  variant="outline"
                  style={styles.actionBtn}
                  onPress={() =>
                    rejeitar.mutate({ freteId: f.id, motoristaId: user.id })
                  }
                />
                <Button
                  title="Aceitar"
                  style={styles.actionBtn}
                  loading={aceitar.isPending}
                  onPress={async () => {
                    try {
                      await aceitar.mutateAsync({ freteId: f.id, motoristaId: user.id });
                      Alert.alert('Aceite', 'Frete aceite com sucesso.');
                    } catch (e: any) {
                      Alert.alert('Erro', e.message);
                    }
                  }}
                />
              </View>
            </Card>
          );
        })}
      </View>

      <View style={styles.block}>
        <Text style={styles.section}>Histórico ({meus.length})</Text>
        {meus.map((f) => (
          <FreteCard key={f.id} frete={f} viewerId={user.id} />
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
  empty: { color: Colors.mutedForeground },
  offer: { gap: 8 },
  rota: { color: Colors.foreground, fontWeight: '700', fontSize: 15 },
  meta: { color: Colors.mutedForeground, fontSize: 13, lineHeight: 18 },
  valor: { color: Colors.primary, fontWeight: '800', fontSize: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1 },
});
