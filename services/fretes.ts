import { supabase } from '@/lib/supabase';
import type { Frete, FreteStatus, Profile } from '@/lib/types';
import { fetchMotoristasDisponiveis, matchMotoristas } from '@/services/profiles';
import { createNotificacao } from '@/services/notificacoes';

export interface CriarFreteInput {
  cliente_id: string;
  origem_endereco: string;
  origem_lat: number;
  origem_lng: number;
  origem_provincia?: string;
  destino_endereco: string;
  destino_lat: number;
  destino_lng: number;
  destino_provincia?: string;
  tipo_carga: string;
  peso_kg: number;
  valor: number;
  distancia_km: number;
}

export async function fetchFretes(opts?: {
  clienteId?: string;
  motoristaId?: string;
  status?: FreteStatus | FreteStatus[];
  candidatoId?: string;
}) {
  let q = supabase.from('fretes').select('*').order('criado_em', { ascending: false });

  if (opts?.clienteId) q = q.eq('cliente_id', opts.clienteId);
  if (opts?.motoristaId) q = q.eq('motorista_id', opts.motoristaId);
  if (opts?.status) {
    if (Array.isArray(opts.status)) q = q.in('status', opts.status);
    else q = q.eq('status', opts.status);
  }

  const { data, error } = await q;
  if (error) throw error;

  let fretes = (data ?? []) as Frete[];
  if (opts?.candidatoId) {
    fretes = fretes.filter(
      (f) =>
        f.status === 'pendente' &&
        (f.candidatos ?? []).includes(opts.candidatoId!),
    );
  }
  return fretes;
}

export async function fetchAllFretes() {
  const { data, error } = await supabase
    .from('fretes')
    .select('*')
    .order('criado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Frete[];
}

export async function criarFrete(input: CriarFreteInput) {
  const motoristas = await fetchMotoristasDisponiveis();
  const candidatos = matchMotoristas(
    { origem: { lat: input.origem_lat, lng: input.origem_lng }, peso_kg: input.peso_kg },
    motoristas,
  ).map((m) => m.id);

  const { data, error } = await supabase
    .from('fretes')
    .insert({
      ...input,
      status: 'pendente',
      progresso: 0,
      candidatos,
    })
    .select()
    .single();

  if (error) throw error;
  const frete = data as Frete;

  await Promise.all(
    candidatos.map((mid) =>
      createNotificacao({
        usuario_id: mid,
        frete_id: frete.id,
        titulo: 'Nova oferta de frete',
        mensagem: `${input.tipo_carga} · ${input.origem_endereco} → ${input.destino_endereco}`,
        tipo: 'info',
      }),
    ),
  );

  return frete;
}

export async function atualizarFrete(id: string, patch: Partial<Frete>) {
  const { data: anterior } = await supabase.from('fretes').select('*').eq('id', id).single();

  const { data, error } = await supabase
    .from('fretes')
    .update({ ...patch, atualizado_em: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  const frete = data as Frete;

  if (anterior && patch.status && patch.status !== (anterior as Frete).status) {
    const labels: Record<FreteStatus, string> = {
      pendente: 'Aguardando motorista',
      aceito: 'Frete aceite por motorista',
      em_transito: 'Carga em trânsito',
      concluido: 'Frete concluído',
      rejeitado: 'Frete rejeitado',
      cancelado: 'Frete cancelado',
    };
    const prev = anterior as Frete;
    const targets = [prev.cliente_id, prev.motorista_id].filter(Boolean) as string[];
    await Promise.all(
      targets.map((uid) =>
        createNotificacao({
          usuario_id: uid,
          frete_id: id,
          titulo: labels[patch.status!],
          mensagem: `${prev.origem_endereco} → ${prev.destino_endereco}`,
          tipo:
            patch.status === 'concluido'
              ? 'sucesso'
              : patch.status === 'cancelado' || patch.status === 'rejeitado'
                ? 'alerta'
                : 'status',
        }),
      ),
    );
  }

  return frete;
}

export async function aceitarFrete(freteId: string, motoristaId: string) {
  const frete = await atualizarFrete(freteId, {
    motorista_id: motoristaId,
    status: 'aceito',
    progresso: 5,
  });
  await supabase.from('profiles').update({ disponivel: false }).eq('id', motoristaId);
  return frete;
}

export async function rejeitarFrete(freteId: string, motoristaId: string) {
  const { data: frete, error: fetchError } = await supabase
    .from('fretes')
    .select('*')
    .eq('id', freteId)
    .single();
  if (fetchError) throw fetchError;

  const candidatos = ((frete as Frete).candidatos ?? []).filter((c) => c !== motoristaId);
  return atualizarFrete(freteId, { candidatos });
}

export async function avaliarMotorista(input: {
  frete_id: string;
  motorista_id: string;
  cliente_id: string;
  nota: number;
  comentario?: string;
}) {
  const { error } = await supabase.from('avaliacoes').insert({
    frete_id: input.frete_id,
    motorista_id: input.motorista_id,
    cliente_id: input.cliente_id,
    nota: input.nota,
    comentario: input.comentario ?? null,
  });
  if (error) throw error;

  const { data: notas } = await supabase
    .from('avaliacoes')
    .select('nota')
    .eq('motorista_id', input.motorista_id);

  if (notas?.length) {
    const media = notas.reduce((s, n) => s + n.nota, 0) / notas.length;
    await supabase
      .from('profiles')
      .update({ avaliacao_media: Number(media.toFixed(2)) })
      .eq('id', input.motorista_id);
  }
}

export async function jaAvaliado(freteId: string) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('id')
    .eq('frete_id', freteId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export type ProfileWithDist = Profile & { _dist: number };
