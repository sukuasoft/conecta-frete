import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

interface Props {
  label: string;
  bg?: string;
  color?: string;
}

export function Badge({ label, bg = Colors.muted, color = Colors.foreground }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
