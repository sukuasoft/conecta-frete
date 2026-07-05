import { StyleSheet, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';

interface Props {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

export function StatCard({ label, value, sub, highlight }: Props) {
  return (
    <Card style={[styles.card, highlight && styles.highlight]}>
      <Text style={[styles.label, highlight && styles.labelHi]}>{label}</Text>
      <Text style={[styles.value, highlight && styles.valueHi]}>{value}</Text>
      {sub ? <Text style={[styles.sub, highlight && styles.subHi]}>{sub}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: '45%', gap: 4 },
  highlight: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    color: Colors.mutedForeground,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  labelHi: { color: Colors.primaryForeground, opacity: 0.75 },
  value: {
    color: Colors.foreground,
    fontSize: 22,
    fontWeight: '800',
  },
  valueHi: { color: Colors.primaryForeground },
  sub: { color: Colors.mutedForeground, fontSize: 11 },
  subHi: { color: Colors.primaryForeground, opacity: 0.7 },
});
