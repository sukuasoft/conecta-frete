# ConectaFrete App

App mobile (Expo / React Native) da plataforma de fretes em Angola.

## Stack

- **Expo Router** — navegação
- **Supabase** — base de dados (profiles, fretes, notificações, avaliações)
- **Zustand + AsyncStorage** — sessão local
- **TanStack Query** — queries e mutations

## Cores

- Fundo: `#0e1010` (neutro escuro)
- Texto: `#f2f4f3` (alto contraste)
- Destaque: `#4caf73` (verde — botões e links)

## Setup

1. Cria um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, corre `supabase/schema.sql`
3. Se já tinhas o schema antigo com Supabase Auth, corre também `supabase/migrate-no-auth.sql`
4. Copia `.env.example` para `.env` e preenche:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

5. Instala e arranca:

```bash
npm install
npx expo start
```

## Autenticação

Login e registo usam **apenas a tabela `profiles`**. A senha é guardada com **hash bcrypt** (`senha_hash`) — nunca em texto plano.

## Primeiro admin

1. Regista uma conta na app (cliente ou motorista)
2. No SQL Editor do Supabase:

```sql
update public.profiles set tipo = 'admin' where email = 'teu@email.com';
```

3. Faz logout/login na app

## Estrutura

```
app/                 # rotas (auth + tabs)
components/          # UI e dashboards
hooks/               # React Query hooks
services/            # chamadas Supabase
stores/              # Zustand
lib/                 # supabase client, types, angola
supabase/schema.sql  # schema das tabelas
```

## Papéis

| Tipo       | Funções                                      |
| ---------- | -------------------------------------------- |
| Cliente    | Pedir frete, histórico, avaliar motorista    |
| Motorista  | Online/offline, ofertas, aceitar/rejeitar    |
| Admin      | Stats, broadcast, bloquear utilizadores      |
