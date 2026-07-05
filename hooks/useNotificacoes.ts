import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  broadcastNotificacao,
  fetchNotificacoes,
  marcarLida,
  marcarTodasLidas,
} from '@/services/notificacoes';

export function useNotificacoes(usuarioId?: string) {
  return useQuery({
    queryKey: ['notificacoes', usuarioId],
    queryFn: () => fetchNotificacoes(usuarioId!),
    enabled: Boolean(usuarioId),
    refetchInterval: 20_000,
  });
}

export function useMarcarLida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: marcarLida,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notificacoes'] }),
  });
}

export function useMarcarTodasLidas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (usuarioId: string) => marcarTodasLidas(usuarioId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notificacoes'] }),
  });
}

export function useBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: broadcastNotificacao,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notificacoes'] }),
  });
}
