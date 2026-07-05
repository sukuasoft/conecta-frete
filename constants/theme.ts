/**
 * ConectaFrete — cores principais: #141c17 (fundo) e #bcdbc5 (destaque)
 */

export const Colors = {
  background: '#141c17',
  foreground: '#bcdbc5',
  card: '#1a2420',
  cardElevated: '#1f2b25',
  muted: '#24302a',
  mutedForeground: '#8aa894',
  border: '#2a3a32',
  primary: '#bcdbc5',
  primaryForeground: '#141c17',
  secondary: '#1f2b25',
  secondaryForeground: '#bcdbc5',
  destructive: '#e07070',
  destructiveForeground: '#141c17',
  success: '#6bc48a',
  successForeground: '#141c17',
  warning: '#d4b86a',
  warningForeground: '#141c17',
  overlay: 'rgba(20, 28, 23, 0.85)',
  input: '#1a2420',
  ring: '#bcdbc5',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;
