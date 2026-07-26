import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FreteCard } from '@/components/FreteCard';
import { FreteMap } from '@/components/FreteMap';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/theme';
import { formatKz, haversineKm } from '@/lib/angola';
import { fetchRoute } from '@/lib/routing';
import type { Profile } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import {
  useAceitarFrete,
  useConcluirFrete,
  useFretesMotorista,
  useIniciarViagem,
  useOfertas,
  useRejeitarFrete,
  useSyncProgressoGps,
} from '@/hooks/useFretes';
import { useLocation } from '@/hooks/useLocation';
import { useUpdateProfile } from '@/hooks/useProfiles';
import { toast } from '@/stores/toastStore';

export function MotoristaDashboard({ user }: { user: Profile }) {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const { data: ofertas = [], isLoading: loadingOfertas } = useOfertas(user.id);
  const { data: meus = [], isLoading: loadingMeus } = useFretesMotorista(user.id);
  const aceitar = useAceitarFrete();
  const rejeitar = useRejeitarFrete();
  const iniciarViagem = useIniciarViagem();
  const concluirFrete = useConcluirFrete();
  const syncGps = useSyncProgressoGps();
  const updateProfile = useUpdateProfile();
  const routeRef = useRef<{ lat: number; lng: number }[]>([]);
  const lastSync = useRef(0);

  const ativo = meus.find((f) => f.status === 'aceito' || f.status === 'em_transito');
  const concluidos = meus.filter((f) => f.status === 'concluido');
  const ganho = concluidos.reduce((s, f) => s + Number(f.valor), 0);

  const { location: userLocation, refresh: refreshLocation } = useLocation({
    enabled: true,
    watch: Boolean(user.disponivel) || Boolean(ativo),
  });

  useEffect(() => {
    if (!ativo) {
      routeRef.current = [];
      return;
    }
    fetchRoute(
      { lat: ativo.origem_lat, lng: ativo.origem_lng },
      { lat: ativo.destino_lat, lng: ativo.destino_lng },
    ).then((r) => {
      routeRef.current = r.points;
    });
  }, [ativo?.id]);

  useEffect(() => {
    if (!userLocation || !user.disponivel) return;
    const moved =
      Math.abs(userLocation.lat - user.lat) > 0.0008 ||
      Math.abs(userLocation.lng - user.lng) > 0.0008;
    if (!moved) return;
    updateProfile.mutate({
      userId: user.id,
      patch: { lat: userLocation.lat, lng: userLocation.lng },
    });
  }, [userLocation?.lat, userLocation?.lng, user.disponivel, user.id, user.lat, user.lng]);

  useEffect(() => {
    if (!ativo || ativo.status !== 'em_transito' || !userLocation) return;
    if (routeRef.current.length < 2) return;
    const now = Date.now();
    if (now - lastSync.current < 12_000) return;
    lastSync.current = now;
    syncGps.mutate({
      freteId: ativo.id,
      gps: userLocation,
      routePoints: routeRef.current,
    });
  }, [userLocation?.lat, userLocation?.lng, ativo?.id, ativo?.status]);

  const toggleDisponivel = async () => {
    try {
      const nextOnline = !user.disponivel;
      const loc = nextOnline ? (await refreshLocation()) ?? userLocation : null;
      await updateProfile.mutateAsync({
        userId: user.id,
        patch: {
          disponivel: nextOnline,
          ...(loc ? { lat: loc.lat, lng: loc.lng } : {}),
        },
      });
      await refreshProfile();
      toast(nextOnline ? 'Estás online' : 'Ficaste offline', 'info');
    } catch (e: any) {
      toast(e.message ?? 'Erro ao atualizar disponibilidade', 'erro');
    }
  };

  const openPercurso = (freteId: string) => {
    router.push({ pathname: '/(app)/percurso', params: { id: freteId } });
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
          <FreteMap
            frete={ativo}
            userLocation={userLocation}
            showUser
            height={260}
            simulate={ativo.status === 'em_transito'}
            onOpenFullscreen={() => openPercurso(ativo.id)}
          />
          <FreteCard frete={ativo} viewerId={user.id} />
          <Button title="Abrir mapa completo" variant="secondary" onPress={() => openPercurso(ativo.id)} />
          {ativo.status === 'aceito' && (
            <Button
              title="Iniciar viagem"
              loading={iniciarViagem.isPending}
              onPress={async () => {
                try {
                  await iniciarViagem.mutateAsync(ativo.id);
                  toast('Viagem iniciada · GPS atualiza o progresso', 'sucesso');
                } catch (e: any) {
                  toast(e.message ?? 'Erro ao iniciar viagem', 'erro');
                }
              }}
            />
          )}
          {ativo.status === 'em_transito' && (
            <Button
              title="Entrega concluída"
              loading={concluirFrete.isPending}
              onPress={async () => {
                try {
                  await concluirFrete.mutateAsync({ freteId: ativo.id, motoristaId: user.id });
                  await refreshProfile();
                  toast('Frete entregue com sucesso', 'sucesso');
                } catch (e: any) {
                  toast(e.message ?? 'Erro ao concluir frete', 'erro');
                }
              }}
            />
          )}
        </View>
      )}

      <View style={styles.block}>
        <Text style={styles.section}>Ofertas próximas</Text>
        {ofertas.length === 0 && (
          <Text style={styles.empty}>Nenhuma oferta no momento. Fique online.</Text>
        )}
        {ofertas.slice(0, 1).map((f) => (
          <FreteMap
            key={`map-${f.id}`}
            frete={f}
            userLocation={userLocation ?? { lat: user.lat, lng: user.lng }}
            showUser
            height={200}
            onOpenFullscreen={() => openPercurso(f.id)}
          />
        ))}
        {ofertas.map((f) => {
          const from = userLocation ?? { lat: user.lat, lng: user.lng };
          const dist = haversineKm(from, {
            lat: f.origem_lat,
            lng: f.origem_lng,
          });
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
                      toast('Frete aceite', 'sucesso');
                    } catch (e: any) {
                      toast(e.message ?? 'Erro ao aceitar frete', 'erro');
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
