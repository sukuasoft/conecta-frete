import { Alert, Linking } from 'react-native';
import { Button } from '@/components/ui/Button';
import { toast } from '@/stores/toastStore';

function normalizePhone(telefone: string) {
  return telefone.replace(/[^\d+]/g, '');
}

export async function callPhone(telefone?: string | null) {
  if (!telefone?.trim()) {
    toast('Telefone não disponível neste perfil.', 'info');
    return;
  }
  const url = `tel:${normalizePhone(telefone)}`;
  const can = await Linking.canOpenURL(url);
  if (!can) {
    Alert.alert('Ligar', `Não foi possível iniciar a chamada.\n${telefone}`);
    return;
  }
  await Linking.openURL(url);
}

export function CallButton({
  telefone,
  nome,
  style,
}: {
  telefone?: string | null;
  nome?: string;
  style?: object;
}) {
  const disabled = !telefone?.trim();
  return (
    <Button
      title={nome ? `Ligar · ${nome.split(' ')[0]}` : 'Ligar'}
      variant={disabled ? 'secondary' : 'outline'}
      disabled={disabled}
      style={style}
      onPress={() => callPhone(telefone)}
    />
  );
}
