import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CIDADES_ANGOLA } from '@/lib/angola';
import { Colors, Radius } from '@/constants/theme';

interface Props {
  label: string;
  value: string;
  onChange: (cidade: string) => void;
}

export function CityPicker({ label, value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {CIDADES_ANGOLA.map((c) => {
          const active = c.nome === value;
          return (
            <Pressable
              key={c.nome}
              onPress={() => onChange(c.nome)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.nome}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    color: Colors.foreground,
    fontSize: 13,
    fontWeight: '600',
  },
  row: { gap: 8, paddingRight: 8 },
  chip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.input,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.foreground,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primaryForeground,
  },
});
