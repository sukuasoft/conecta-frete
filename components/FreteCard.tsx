import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatKz } from '@/lib/angola';
import type { Frete } from '@/lib/types';
import { STATUS_LABEL } from '@/lib/types';
import { statusColors } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/theme';
import { useAvaliar, useJaAvaliado } from '@/hooks/useFretes';

interface Props {
  frete: Frete;
  viewerId?: string;
  isCliente?: boolean;
}

export function FreteCard({ frete, viewerId, isCliente }: Props) {
  const colors = statusColors(frete.status);
  const { data: avaliado } = useJaAvaliado(
    frete.status === 'concluido' && isCliente ? frete.id : undefined,
  );
  const avaliar = useAvaliar();
  const [nota, setNota] = useState('5');
  const [comentario, setComentario] = useState('');

  const showAvaliacao =
    isCliente &&
    frete.status === 'concluido' &&
    frete.motorista_id &&
    viewerId &&
    avaliado === false;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Badge label={STATUS_LABEL[frete.status]} bg={colors.bg} color={colors.text} />
        <Text style={styles.valor}>{formatKz(Number(frete.valor))}</Text>
      </View>

      <Text style={styles.rota}>
        {frete.origem_endereco} → {frete.destino_endereco}
      </Text>
      <Text style={styles.meta}>
        {frete.distancia_km} km · {frete.peso_kg} kg · {frete.tipo_carga}
      </Text>

      {(frete.status === 'aceito' || frete.status === 'em_transito') && (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${frete.progresso}%` }]} />
          </View>
          <Text style={styles.meta}>{frete.progresso}% do trajeto</Text>
        </View>
      )}

      {showAvaliacao && (
        <View style={styles.avaliacao}>
          <Input
            label="Nota (1-5)"
            keyboardType="number-pad"
            value={nota}
            onChangeText={setNota}
          />
          <Input
            label="Comentário"
            value={comentario}
            onChangeText={setComentario}
            placeholder="Opcional"
          />
          <Button
            title="Enviar avaliação"
            loading={avaliar.isPending}
            onPress={() =>
              avaliar.mutate({
                frete_id: frete.id,
                motorista_id: frete.motorista_id!,
                cliente_id: viewerId!,
                nota: Math.min(5, Math.max(1, Number(nota) || 5)),
                comentario,
              })
            }
          />
        </View>
      )}

      {avaliado && <Text style={styles.ok}>Avaliação enviada</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valor: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  rota: {
    color: Colors.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    color: Colors.mutedForeground,
    fontSize: 12,
  },
  progressWrap: { gap: 6 },
  progressTrack: {
    height: 6,
    borderRadius: 99,
    backgroundColor: Colors.muted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  avaliacao: { gap: 10, marginTop: 4 },
  ok: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
});
