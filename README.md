# ConectaFrete App

App mobile (Expo / React Native) da plataforma de fretes em Angola.

## Stack

- **Expo Router** — navegação
- **Supabase** — auth, profiles, fretes, notificações, avaliações
- **Zustand** — sessão / perfil em memória
- **TanStack Query** — queries e mutations

## Cores

- Fundo: `#141c17`
- Destaque / texto: `#bcdbc5`

## Setup

1. Cria um projeto em [supabase.com](https://supabase.com)
2. Em **Authentication → Providers → Email**, desativa **Confirm email**
3. No SQL Editor, corre `supabase/schema.sql` (tabelas + confirmação automática de email)
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
