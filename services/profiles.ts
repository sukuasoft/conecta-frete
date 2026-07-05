import { haversineKm } from '@/lib/angola';
import { supabase } from '@/lib/supabase';
import type { Profile, UserTipo } from '@/lib/types';

export interface RegisterInput {
  nome: string;
  email: string;
  password: string;
  tipo: Exclude<UserTipo, 'admin'>;
  telefone?: string;
  cidade?: string;
  provincia?: string;
  lat?: number;
  lng?: number;
  veiculo?: string;
  capacidade_kg?: number;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function register(input: RegisterInput) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Falha ao criar conta.');

  const profile: Omit<Profile, 'criado_em'> & { criado_em?: string } = {
    id: authData.user.id,
    nome: input.nome,
    email: input.email.toLowerCase(),
    tipo: input.tipo,
    telefone: input.telefone ?? null,
    cidade: input.cidade ?? null,
    provincia: input.provincia ?? null,
    lat: input.lat ?? -8.839,
    lng: input.lng ?? 13.2894,
    veiculo: input.veiculo ?? null,
    capacidade_kg: input.capacidade_kg ?? null,
    disponivel: input.tipo === 'motorista' ? true : null,
    avaliacao_media: input.tipo === 'motorista' ? 5 : null,
    bloqueado: false,
    onboarding_feito: false,
  };

  const { error: profileError } = await supabase.from('profiles').insert(profile);
  if (profileError) throw profileError;

  return authData;
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function fetchProfiles(opts?: { tipo?: UserTipo }) {
  let q = supabase.from('profiles').select('*').order('criado_em', { ascending: false });
  if (opts?.tipo) q = q.eq('tipo', opts.tipo);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function fetchMotoristasDisponiveis() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('tipo', 'motorista')
    .eq('disponivel', true)
    .eq('bloqueado', false);
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export function matchMotoristas(
  frete: { origem: { lat: number; lng: number }; peso_kg: number },
  motoristas: Profile[],
) {
  return motoristas
    .filter((u) => (u.capacidade_kg ?? 0) >= frete.peso_kg)
    .map((u) => ({ ...u, _dist: haversineKm(frete.origem, { lat: u.lat, lng: u.lng }) }))
    .sort((a, b) => a._dist - b._dist)
    .slice(0, 5);
}

export async function createAdminProfile(input: {
  nome: string;
  email: string;
  password: string;
  telefone?: string;
}) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Falha ao criar admin.');

  const { error } = await supabase.from('profiles').insert({
    id: authData.user.id,
    nome: input.nome,
    email: input.email.toLowerCase(),
    tipo: 'admin',
    telefone: input.telefone ?? null,
    lat: -8.839,
    lng: 13.2894,
    bloqueado: false,
    onboarding_feito: true,
  });
  if (error) throw error;
}

export async function toggleBloqueio(userId: string, bloqueado: boolean) {
  return updateProfile(userId, { bloqueado });
}
