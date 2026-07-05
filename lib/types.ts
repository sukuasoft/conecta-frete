export type UserTipo = 'cliente' | 'motorista' | 'admin';

export type FreteStatus =
  | 'pendente'
  | 'aceito'
  | 'em_transito'
  | 'concluido'
  | 'rejeitado'
  | 'cancelado';

export type NotificacaoTipo = 'info' | 'sucesso' | 'alerta' | 'status';

export interface Profile {
  id: string;
  nome: string;
  email: string;
  tipo: UserTipo;
  telefone?: string | null;
  cidade?: string | null;
  provincia?: string | null;
  bio?: string | null;
  veiculo?: string | null;
  capacidade_kg?: number | null;
  disponivel?: boolean | null;
  matricula?: string | null;
  lat: number;
  lng: number;
  avaliacao_media?: number | null;
  bloqueado?: boolean | null;
  onboarding_feito?: boolean | null;
  criado_em: string;
}

export interface Localizacao {
  endereco: string;
  lat: number;
  lng: number;
  provincia?: string | null;
}

export interface Frete {
  id: string;
  cliente_id: string;
  motorista_id?: string | null;
  origem_endereco: string;
  origem_lat: number;
  origem_lng: number;
  origem_provincia?: string | null;
  destino_endereco: string;
  destino_lat: number;
  destino_lng: number;
  destino_provincia?: string | null;
  tipo_carga: string;
  peso_kg: number;
  valor: number;
  distancia_km: number;
  status: FreteStatus;
  progresso: number;
  candidatos?: string[] | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Avaliacao {
  id: string;
  frete_id: string;
  motorista_id: string;
  cliente_id: string;
  nota: number;
  comentario?: string | null;
  criado_em: string;
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  frete_id?: string | null;
  titulo: string;
  mensagem: string;
  tipo: NotificacaoTipo;
  lida: boolean;
  criado_em: string;
}

export const STATUS_LABEL: Record<FreteStatus, string> = {
  pendente: 'Aguardando motorista',
  aceito: 'Aceite',
  em_transito: 'Em trânsito',
  concluido: 'Concluído',
  rejeitado: 'Rejeitado',
  cancelado: 'Cancelado',
};

export const TIPOS_CARGA = ['Geral', 'Frágil', 'Refrigerada', 'Granel', 'Perigosa', 'Container'] as const;
