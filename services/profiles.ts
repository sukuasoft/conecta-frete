import { haversineKm } from '@/lib/angola';
import { hashPassword, verifyPassword } from '@/lib/password';
import { supabase } from '@/lib/supabase';
import type { Profile, UserTipo } from '@/lib/types';

type ProfileRow = Profile & { senha_hash: string };

const PROFILE_FIELDS =
  'id, nome, email, tipo, telefone, cidade, provincia, bio, veiculo, capacidade_kg, disponivel, matricula, lat, lng, avaliacao_media, bloqueado, onboarding_feito, criado_em';

function stripHash(row: ProfileRow): Profile {
  const { senha_hash: _, ...profile } = row;
  return profile;
}

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
  const { data, error } = await supabase
    .from('profiles')
    .select(`${PROFILE_FIELDS}, senha_hash`)
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (error) throw error;
  if (!data || !verifyPassword(password, data.senha_hash)) {
    throw new Error('Credenciais inválidas');
  }
  if (data.bloqueado) {
    throw new Error('Conta bloqueada.');
  }

  return stripHash(data as ProfileRow);
}

export async function register(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) throw new Error('E-mail já registado.');

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      nome: input.nome,
      email,
      senha_hash: hashPassword(input.password),
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
    })
    .select(PROFILE_FIELDS)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select(PROFILE_FIELDS)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function fetchProfiles(opts?: { tipo?: UserTipo }) {
  let q = supabase.from('profiles').select(PROFILE_FIELDS).order('criado_em', { ascending: false });
  if (opts?.tipo) q = q.eq('tipo', opts.tipo);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function fetchMotoristasDisponiveis() {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
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
  const email = input.email.trim().toLowerCase();

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) throw new Error('E-mail já registado.');

  const { error } = await supabase.from('profiles').insert({
    nome: input.nome,
    email,
    senha_hash: hashPassword(input.password),
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
