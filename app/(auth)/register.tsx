import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { CityPicker } from '@/components/CityPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/theme';
import { CIDADES_ANGOLA } from '@/lib/angola';
import { useRegister } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function RegisterScreen() {
  const register = useRegister();
  const [tipo, setTipo] = useState<'cliente' | 'motorista'>('cliente');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('Luanda');
  const [veiculo, setVeiculo] = useState('Camião Truck');
  const [capacidade, setCapacidade] = useState('10000');

  const onSubmit = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert('Supabase', 'Configura as variáveis no ficheiro .env');
      return;
    }
    if (!nome || !email || password.length < 6) {
      Alert.alert('Erro', 'Preenche nome, e-mail e senha (mín. 6).');
      return;
    }
    const c = CIDADES_ANGOLA.find((x) => x.nome === cidade) ?? CIDADES_ANGOLA[0];
    try {
      await register.mutateAsync({
        nome,
        email: email.trim(),
        password,
        tipo,
        telefone,
        cidade: c.nome,
        provincia: c.provincia,
        lat: c.lat + (Math.random() - 0.5) * 0.05,
        lng: c.lng + (Math.random() - 0.5) * 0.05,
        ...(tipo === 'motorista'
          ? { veiculo, capacidade_kg: Number(capacidade) }
          : {}),
      });
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível criar a conta');
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.sub}>Cliente ou motorista — em segundos.</Text>

      <View style={styles.tipos}>
        <Button
          title="Cliente"
          variant={tipo === 'cliente' ? 'primary' : 'secondary'}
          style={styles.tipoBtn}
          onPress={() => setTipo('cliente')}
        />
        <Button
          title="Motorista"
          variant={tipo === 'motorista' ? 'primary' : 'secondary'}
          style={styles.tipoBtn}
          onPress={() => setTipo('motorista')}
        />
      </View>

      <Input label="Nome" value={nome} onChangeText={setNome} />
      <Input
        label="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Input label="Senha" secureTextEntry value={password} onChangeText={setPassword} />
      <Input label="Telefone" value={telefone} onChangeText={setTelefone} placeholder="+244 9XX XXX XXX" />
      <CityPicker label="Cidade base" value={cidade} onChange={setCidade} />

      {tipo === 'motorista' && (
        <>
          <Input label="Veículo" value={veiculo} onChangeText={setVeiculo} />
          <Input
            label="Capacidade (kg)"
            keyboardType="numeric"
            value={capacidade}
            onChangeText={setCapacidade}
          />
        </>
      )}

      <Button title="Criar conta" loading={register.isPending} onPress={onSubmit} />

      <Link href="/(auth)/login" asChild>
        <Pressable>
          <Text style={styles.link}>
            Já tens conta? <Text style={styles.linkBold}>Entrar</Text>
          </Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.foreground, fontSize: 24, fontWeight: '800', marginTop: 12 },
  sub: { color: Colors.mutedForeground, marginBottom: 4 },
  tipos: { flexDirection: 'row', gap: 10 },
  tipoBtn: { flex: 1 },
  link: { color: Colors.mutedForeground, textAlign: 'center', marginTop: 8 },
  linkBold: { color: Colors.primary, fontWeight: '700' },
});
