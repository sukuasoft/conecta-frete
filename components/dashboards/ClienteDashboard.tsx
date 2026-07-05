import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CityPicker } from '@/components/CityPicker';
import { FreteCard } from '@/components/FreteCard';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/theme';
import { CIDADES_ANGOLA, formatKz, haversineKm } from '@/lib/angola';
import type { Profile } from '@/lib/types';
import { TIPOS_CARGA } from '@/lib/types';
import { useCriarFrete, useMeusFretes } from '@/hooks/useFretes';
import { useMotoristasOnline } from '@/hooks/useProfiles';
import { matchMotoristas } from '@/services/profiles';

export function ClienteDashboard({ user }: { user: Profile }) {
  const { data: fretes = [], isLoading } = useMeusFretes(user.id);
  const { data: motoristas = [] } = useMotoristasOnline();
  const criar = useCriarFrete();

  const [origem, setOrigem] = useState('Luanda');
  const [destino, setDestino] = useState('Benguela');
  const [tipoCarga, setTipoCarga] = useState('Geral');
  const [peso, setPeso] = useState('5000');
  const [valor, setValor] = useState('150000');

  const ativo = fretes.find((f) => f.status === 'aceito' || f.status === 'em_transito');
  const concluidos = fretes.filter((f) => f.status === 'concluido');

  const preview = useMemo(() => {
    const o = CIDADES_ANGOLA.find((c) => c.nome === origem);
    const d = CIDADES_ANGOLA.find((c) => c.nome === destino);
    if (!o || !d) return null;
    const dist = haversineKm(o, d);
    const candidatos = matchMotoristas(
      { origem: o, peso_kg: Number(peso) || 0 },
      motoristas,
    );
    return { dist, candidatos };
  }, [origem, destino, peso, motoristas]);

  const solicitar = async () => {
    const o = CIDADES_ANGOLA.find((c) => c.nome === origem);
    const d = CIDADES_ANGOLA.find((c) => c.nome === destino);
    if (!o || !d) return;
    if (Number(peso) <= 0) {
      Alert.alert('Erro', 'Peso inválido');
      return;
    }
    try {
      const frete = await criar.mutateAsync({
        cliente_id: user.id,
        origem_endereco: o.nome,
        origem_lat: o.lat,
        origem_lng: o.lng,
        origem_provincia: o.provincia,
        destino_endereco: d.nome,
        destino_lat: d.lat,
        destino_lng: d.lng,
        destino_provincia: d.provincia,
        tipo_carga: tipoCarga,
        peso_kg: Number(peso),
        valor: Number(valor),
        distancia_km: Number(haversineKm(o, d).toFixed(1)),
      });
      Alert.alert(
        'Frete criado',
        `${(frete.candidatos ?? []).length} motoristas notificados.`,
      );
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível criar o frete');
    }
  };

  return (
    <Screen scroll loading={isLoading}>
      <View>
        <Text style={styles.hello}>Olá, {user.nome.split(' ')[0]}</Text>
        <Text style={styles.sub}>Solicite fretes pelas 18 províncias de Angola.</Text>
      </View>

      <View style={styles.stats}>
        <StatCard label="Online" value={`${motoristas.length}`} sub="motoristas" />
        <StatCard label="Fretes" value={`${fretes.length}`} sub="no total" />
      </View>

      <Card style={styles.form}>
        <Text style={styles.section}>Novo pedido</Text>
        <CityPicker label="Origem" value={origem} onChange={setOrigem} />
        <CityPicker label="Destino" value={destino} onChange={setDestino} />
        <Text style={styles.label}>Tipo de carga</Text>
        <View style={styles.tipos}>
          {TIPOS_CARGA.map((t) => (
            <Button
              key={t}
              title={t}
              variant={tipoCarga === t ? 'primary' : 'secondary'}
              onPress={() => setTipoCarga(t)}
              style={styles.tipoBtn}
            />
          ))}
        </View>
        <View style={styles.row}>
          <View style={styles.half}>
            <Input label="Peso (kg)" keyboardType="numeric" value={peso} onChangeText={setPeso} />
          </View>
          <View style={styles.half}>
            <Input label="Valor (Kz)" keyboardType="numeric" value={valor} onChangeText={setValor} />
          </View>
        </View>

        {preview && (
          <Text style={styles.preview}>
            {preview.dist.toFixed(1)} km · {preview.candidatos.length} motoristas compatíveis
          </Text>
        )}

        <Button title="Solicitar frete" loading={criar.isPending} onPress={solicitar} />
      </Card>

      {ativo && (
        <View style={styles.block}>
          <Text style={styles.section}>Em andamento</Text>
          <FreteCard frete={ativo} viewerId={user.id} isCliente />
        </View>
      )}

      <View style={styles.block}>
        <Text style={styles.section}>Meus fretes ({fretes.length})</Text>
        {fretes.length === 0 && <Text style={styles.empty}>Ainda sem fretes.</Text>}
        {fretes.map((f) => (
          <FreteCard key={f.id} frete={f} viewerId={user.id} isCliente />
        ))}
      </View>

      {concluidos.length > 0 && (
        <Text style={styles.footer}>
          Concluiu {concluidos.length} frete(s). Total:{' '}
          {formatKz(concluidos.reduce((s, f) => s + Number(f.valor), 0))}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: { color: Colors.foreground, fontSize: 28, fontWeight: '800' },
  sub: { color: Colors.mutedForeground, marginTop: 4, fontSize: 15, lineHeight: 22 },
  stats: { flexDirection: 'row', gap: 12 },
  form: { gap: 14 },
  label: { color: Colors.foreground, fontSize: 13, fontWeight: '600' },
  section: { color: Colors.foreground, fontSize: 18, fontWeight: '800' },
  tipos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipoBtn: { minHeight: 36, paddingHorizontal: 12 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  preview: { color: Colors.mutedForeground, fontSize: 14, lineHeight: 20 },
  block: { gap: 10 },
  empty: { color: Colors.mutedForeground },
  footer: { color: Colors.mutedForeground, fontSize: 13 },
});
