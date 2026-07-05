import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useProfiles';

export default function PerfilScreen() {
  const { profile, signOut } = useAuth();
  const update = useUpdateProfile();

  const [nome, setNome] = useState(profile?.nome ?? '');
  const [telefone, setTelefone] = useState(profile?.telefone ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [veiculo, setVeiculo] = useState(profile?.veiculo ?? '');
  const [capacidade, setCapacidade] = useState(
    String(profile?.capacidade_kg ?? ''),
  );

  if (!profile) return <Screen loading />;

  const salvar = async () => {
    try {
      await update.mutateAsync({
        userId: profile.id,
        patch: {
          nome,
          telefone,
          bio,
          ...(profile.tipo === 'motorista'
            ? {
                veiculo,
                capacidade_kg: Number(capacidade) || 0,
              }
            : {}),
        },
      });
      Alert.alert('Guardado', 'Perfil atualizado.');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  return (
    <Screen scroll>
      <Card style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>
            {profile.nome
              .split(' ')
              .slice(0, 2)
              .map((p) => p[0])
              .join('')
              .toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile.nome}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <Badge
          label={profile.tipo}
          bg={Colors.primary}
          color={Colors.primaryForeground}
        />
        {profile.bloqueado && (
          <Text style={styles.blocked}>Conta bloqueada</Text>
        )}
      </Card>

      <Card style={styles.form}>
        <Input label="Nome" value={nome} onChangeText={setNome} />
        <Input label="Telefone" value={telefone} onChangeText={setTelefone} />
        <Input label="Bio" value={bio} onChangeText={setBio} />
        {profile.tipo === 'motorista' && (
          <>
            <Input label="Veículo" value={veiculo} onChangeText={setVeiculo} />
            <Input
              label="Capacidade (kg)"
              keyboardType="numeric"
              value={capacidade}
              onChangeText={setCapacidade}
            />
            {profile.avaliacao_media != null && (
              <Text style={styles.meta}>
                Avaliação média: {profile.avaliacao_media}
              </Text>
            )}
          </>
        )}
        <Button title="Guardar" loading={update.isPending} onPress={salvar} />
      </Card>

      <Button
        title="Sair"
        variant="destructive"
        onPress={async () => {
          await signOut();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.primaryForeground,
    fontSize: 24,
    fontWeight: '800',
  },
  name: { color: Colors.foreground, fontSize: 20, fontWeight: '800' },
  email: { color: Colors.mutedForeground },
  blocked: { color: Colors.destructive, fontWeight: '700' },
  form: { gap: 12 },
  meta: { color: Colors.mutedForeground, fontSize: 13 },
});
