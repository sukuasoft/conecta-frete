import { Colors } from '@/constants/theme';
import type { FreteStatus } from '@/lib/types';

export function statusColors(status: FreteStatus): { bg: string; text: string } {
  switch (status) {
    case 'pendente':
      return { bg: Colors.muted, text: Colors.foreground };
    case 'aceito':
      return { bg: Colors.accentMuted, text: Colors.primary };
    case 'em_transito':
      return { bg: 'rgba(232, 184, 74, 0.18)', text: Colors.warning };
    case 'concluido':
      return { bg: 'rgba(61, 214, 140, 0.18)', text: Colors.success };
    case 'rejeitado':
    case 'cancelado':
      return { bg: 'rgba(239, 107, 107, 0.18)', text: Colors.destructive };
    default:
      return { bg: Colors.muted, text: Colors.foreground };
  }
}
