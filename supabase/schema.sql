-- ConectaFrete — schema para Supabase (apenas DB, sem Supabase Auth)
-- Cola no SQL Editor do projeto e executa tudo de uma vez.

-- ---------------------------------------------------------------------------
-- Extensões e tipos
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

create type public.user_tipo as enum ('cliente', 'motorista', 'admin');

create type public.frete_status as enum (
  'pendente',
  'aceito',
  'em_transito',
  'concluido',
  'rejeitado',
  'cancelado'
);

create type public.notificacao_tipo as enum ('info', 'sucesso', 'alerta', 'status');

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  senha_hash text not null,
  tipo public.user_tipo not null default 'cliente',
  telefone text,
  cidade text,
  provincia text,
  bio text,
  veiculo text,
  capacidade_kg numeric,
  disponivel boolean,
  matricula text,
  lat double precision not null default -8.839,
  lng double precision not null default 13.2894,
  avaliacao_media numeric,
  bloqueado boolean not null default false,
  onboarding_feito boolean not null default false,
  criado_em timestamptz not null default now()
);

create table public.fretes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.profiles (id) on delete restrict,
  motorista_id uuid references public.profiles (id) on delete set null,
  origem_endereco text not null,
  origem_lat double precision not null,
  origem_lng double precision not null,
  origem_provincia text,
  destino_endereco text not null,
  destino_lat double precision not null,
  destino_lng double precision not null,
  destino_provincia text,
  tipo_carga text not null,
  peso_kg numeric not null check (peso_kg > 0),
  valor numeric not null check (valor >= 0),
  distancia_km numeric not null check (distancia_km >= 0),
  status public.frete_status not null default 'pendente',
  progresso numeric not null default 0 check (progresso >= 0 and progresso <= 100),
  candidatos uuid[] not null default '{}',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  frete_id uuid not null unique references public.fretes (id) on delete cascade,
  motorista_id uuid not null references public.profiles (id) on delete cascade,
  cliente_id uuid not null references public.profiles (id) on delete cascade,
  nota numeric not null check (nota >= 1 and nota <= 5),
  comentario text,
  criado_em timestamptz not null default now()
);

create table public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles (id) on delete cascade,
  frete_id uuid references public.fretes (id) on delete set null,
  titulo text not null,
  mensagem text not null,
  tipo public.notificacao_tipo not null default 'info',
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

create index idx_profiles_tipo on public.profiles (tipo);
create index idx_profiles_motoristas_disponiveis
  on public.profiles (disponivel, bloqueado)
  where tipo = 'motorista';

create index idx_fretes_cliente on public.fretes (cliente_id);
create index idx_fretes_motorista on public.fretes (motorista_id);
create index idx_fretes_status on public.fretes (status);
create index idx_fretes_criado_em on public.fretes (criado_em desc);

create index idx_avaliacoes_motorista on public.avaliacoes (motorista_id);

create index idx_notificacoes_usuario on public.notificacoes (usuario_id, criado_em desc);
create index idx_notificacoes_nao_lidas on public.notificacoes (usuario_id) where lida = false;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger fretes_set_atualizado_em
  before update on public.fretes
  for each row
  execute function public.set_atualizado_em();

-- ---------------------------------------------------------------------------
-- Permissões
-- ---------------------------------------------------------------------------

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
