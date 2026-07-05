/**
 * ConectaFrete — tema escuro com verde como acento (não como cor de texto global)
 */

export const Colors = {
  background: '#0e1010',
  foreground: '#f2f4f3',
  card: '#181b1a',
  cardElevated: '#222625',
  muted: '#2a2f2d',
  mutedForeground: '#9aa3a0',
  border: '#343a38',
  primary: '#4caf73',
  primaryForeground: '#0a120e',
  secondary: '#222625',
  secondaryForeground: '#e8ecea',
  destructive: '#ef6b6b',
  destructiveForeground: '#fff5f5',
  success: '#3dd68c',
  successForeground: '#0a120e',
  warning: '#e8b84a',
  warningForeground: '#1a1408',
  overlay: 'rgba(14, 16, 16, 0.9)',
  input: '#222625',
  ring: '#4caf73',
  accentMuted: 'rgba(76, 175, 115, 0.14)',
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

export const Typography = {
  title: { fontSize: 28, fontWeight: '800' as const, color: Colors.foreground },
  section: { fontSize: 18, fontWeight: '800' as const, color: Colors.foreground },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.foreground },
  label: { fontSize: 13, fontWeight: '600' as const, color: Colors.foreground },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.mutedForeground },
  meta: { fontSize: 11, fontWeight: '500' as const, color: Colors.mutedForeground },
};
