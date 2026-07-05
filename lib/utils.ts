import { Colors } from '@/constants/theme';
import type { FreteStatus } from '@/lib/types';

export function statusColors(status: FreteStatus): { bg: string; text: string } {
  switch (status) {
    case 'pendente':
      return { bg: Colors.muted, text: Colors.mutedForeground };
    case 'aceito':
      return { bg: Colors.primary, text: Colors.primaryForeground };
    case 'em_transito':
      return { bg: Colors.warning, text: Colors.warningForeground };
    case 'concluido':
      return { bg: Colors.success, text: Colors.successForeground };
    case 'rejeitado':
    case 'cancelado':
      return { bg: Colors.destructive, text: Colors.destructiveForeground };
    default:
      return { bg: Colors.muted, text: Colors.mutedForeground };
  }
}
