import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FreteMap } from '@/components/FreteMap';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/theme';
import { STATUS_LABEL } from '@/lib/types';
import { fetchRoute } from '@/lib/routing';
import { useAuth } from '@/hooks/useAuth';
import {
  useConcluirFrete,
  useFrete,
  useIniciarViagem,
  useSyncProgressoGps,
} from '@/hooks/useFretes';
import { useLocation } from '@/hooks/useLocation';

export default function PercursoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const { data: frete, isLoading } = useFrete(id);
  const iniciarViagem = useIniciarViagem();
  const concluirFrete = useConcluirFrete();
  const syncGps = useSyncProgressoGps();
  const routeRef = useRef<{ lat: number; lng: number }[]>([]);
  const lastSync = useRef(0);

  const isMotorista = profile?.id && frete?.motorista_id === profile.id;
  const { location } = useLocation({
    enabled: Boolean(isMotorista && frete?.status === 'em_transito'),
    watch: true,
  });

  useEffect(() => {
    if (!frete) return;
    fetchRoute(
      { lat: frete.origem_lat, lng: frete.origem_lng },
      { lat: frete.destino_lat, lng: frete.destino_lng },
    ).then((r) => {
      routeRef.current = r.points;
    });
  }, [frete?.id, frete?.origem_lat, frete?.destino_lat]);

  useEffect(() => {
    if (!isMotorista || !frete || frete.status !== 'em_transito' || !location) return;
    if (routeRef.current.length < 2) return;
    const now = Date.now();
    if (now - lastSync.current < 12_000) return;
    lastSync.current = now;
    syncGps.mutate({
      freteId: frete.id,
      gps: location,
      routePoints: routeRef.current,
    });
  }, [location?.lat, location?.lng, frete?.status, frete?.id, isMotorista]);

  if (!id) return <Redirect href="/(app)" />;

  if (isLoading || !frete) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          title: `${frete.origem_endereco} → ${frete.destino_endereco}`,
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.foreground,
          headerTitleStyle: { fontWeight: '700', fontSize: 14 },
        }}
      />

      <View style={styles.meta}>
        <Text style={styles.status}>{STATUS_LABEL[frete.status]}</Text>
        <Text style={styles.sub}>
          {frete.distancia_km} km · {frete.progresso}% · {frete.tipo_carga}
        </Text>
      </View>

      <View style={styles.mapArea}>
        <FreteMap
          frete={frete}
          userLocation={location}
          showUser={Boolean(isMotorista)}
          height="100%"
          simulate={frete.status === 'em_transito'}
          showLegend
        />
      </View>

      {isMotorista && (
        <View style={styles.actions}>
          {frete.status === 'aceito' && (
            <Button
              title="Iniciar viagem"
              loading={iniciarViagem.isPending}
              onPress={() => iniciarViagem.mutate(frete.id)}
            />
          )}
          {frete.status === 'em_transito' && (
            <Button
              title="Entrega concluída"
              loading={concluirFrete.isPending}
              onPress={async () => {
                await concluirFrete.mutateAsync({
                  freteId: frete.id,
                  motoristaId: profile!.id,
                });
                await refreshProfile();
                router.back();
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  meta: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  status: { color: Colors.foreground, fontWeight: '800', fontSize: 16 },
  sub: { color: Colors.mutedForeground, fontSize: 13 },
  mapArea: { flex: 1 },
  actions: {
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
});
