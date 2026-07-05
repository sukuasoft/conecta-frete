import { supabase } from '@/lib/supabase';
import type { Notificacao, NotificacaoTipo } from '@/lib/types';

export async function fetchNotificacoes(usuarioId: string) {
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('criado_em', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as Notificacao[];
}

export async function createNotificacao(input: {
  usuario_id: string;
  frete_id?: string;
  titulo: string;
  mensagem: string;
  tipo: NotificacaoTipo;
}) {
  const { error } = await supabase.from('notificacoes').insert({
    ...input,
    lida: false,
  });
  if (error) console.warn('createNotificacao', error.message);
}

export async function marcarLida(id: string) {
  const { error } = await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
  if (error) throw error;
}

export async function marcarTodasLidas(usuarioId: string) {
  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('usuario_id', usuarioId)
    .eq('lida', false);
  if (error) throw error;
}

export async function broadcastNotificacao(opts: {
  titulo: string;
  mensagem: string;
  alvo: 'todos' | 'clientes' | 'motoristas';
}) {
  let q = supabase.from('profiles').select('id, tipo').neq('tipo', 'admin');
  if (opts.alvo === 'clientes') q = q.eq('tipo', 'cliente');
  if (opts.alvo === 'motoristas') q = q.eq('tipo', 'motorista');

  const { data: users, error } = await q;
  if (error) throw error;

  if (!users?.length) return 0;

  const rows = users.map((u) => ({
    usuario_id: u.id,
    titulo: opts.titulo,
    mensagem: opts.mensagem,
    tipo: 'info' as const,
    lida: false,
  }));

  const { error: insertError } = await supabase.from('notificacoes').insert(rows);
  if (insertError) throw insertError;
  return rows.length;
}
