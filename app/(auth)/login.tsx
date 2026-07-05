import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/theme';
import { useLogin } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function LoginScreen() {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Supabase',
        'Configura EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no ficheiro .env',
      );
      return;
    }
    try {
      await login.mutateAsync({ email: email.trim(), password });
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Credenciais inválidas');
    }
  };

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={styles.brand}>ConectaFrete</Text>
        <Text style={styles.tag}>Angola · Logística de precisão</Text>
      </View>

      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.sub}>Acede à tua conta para gerir fretes.</Text>

      <Input
        label="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="email@exemplo.com"
      />
      <Input
        label="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
      />

      <Button title="Entrar" loading={login.isPending} onPress={onSubmit} />

      <Link href="/(auth)/register" asChild>
        <Pressable>
          <Text style={styles.link}>
            Não tens conta? <Text style={styles.linkBold}>Cadastrar</Text>
          </Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 24, marginBottom: 12 },
  brand: {
    color: Colors.primary,
    fontSize: 34,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  tag: {
    color: Colors.mutedForeground,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  title: { color: Colors.foreground, fontSize: 24, fontWeight: '800' },
  sub: { color: Colors.mutedForeground, marginBottom: 8 },
  link: {
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginTop: 8,
  },
  linkBold: { color: Colors.primary, fontWeight: '700' },
});
