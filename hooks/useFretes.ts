import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  aceitarFrete,
  atualizarFrete,
  avaliarMotorista,
  criarFrete,
  fetchAllFretes,
  fetchFretes,
  jaAvaliado,
  rejeitarFrete,
  type CriarFreteInput,
} from '@/services/fretes';
import type { FreteStatus } from '@/lib/types';

export function useMeusFretes(clienteId?: string) {
  return useQuery({
    queryKey: ['fretes', 'cliente', clienteId],
    queryFn: () => fetchFretes({ clienteId }),
    enabled: Boolean(clienteId),
  });
}

export function useFretesMotorista(motoristaId?: string) {
  return useQuery({
    queryKey: ['fretes', 'motorista', motoristaId],
    queryFn: () => fetchFretes({ motoristaId }),
    enabled: Boolean(motoristaId),
  });
}

export function useOfertas(motoristaId?: string) {
  return useQuery({
    queryKey: ['fretes', 'ofertas', motoristaId],
    queryFn: () => fetchFretes({ status: 'pendente', candidatoId: motoristaId }),
    enabled: Boolean(motoristaId),
    refetchInterval: 15_000,
  });
}

export function useAllFretes(enabled = false) {
  return useQuery({
    queryKey: ['fretes', 'all'],
    queryFn: fetchAllFretes,
    enabled,
  });
}

export function useCriarFrete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarFreteInput) => criarFrete(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fretes'] });
      qc.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });
}

export function useAceitarFrete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ freteId, motoristaId }: { freteId: string; motoristaId: string }) =>
      aceitarFrete(freteId, motoristaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fretes'] });
      qc.invalidateQueries({ queryKey: ['profiles'] });
      qc.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });
}

export function useRejeitarFrete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ freteId, motoristaId }: { freteId: string; motoristaId: string }) =>
      rejeitarFrete(freteId, motoristaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fretes'] });
    },
  });
}

export function useAtualizarFrete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { status?: FreteStatus; progresso?: number } }) =>
      atualizarFrete(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fretes'] });
      qc.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });
}

export function useAvaliar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: avaliarMotorista,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['avaliacoes'] });
      qc.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useJaAvaliado(freteId?: string) {
  return useQuery({
    queryKey: ['avaliacoes', freteId],
    queryFn: () => jaAvaliado(freteId!),
    enabled: Boolean(freteId),
  });
}
