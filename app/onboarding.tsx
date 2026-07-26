import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Colors, Radius } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useProfiles';
import { toast } from '@/stores/toastStore';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'cliente',
    icon: 'cube-outline' as const,
    title: 'Para clientes',
    body: 'Peça fretes entre cidades de Angola, acompanhe o percurso e avalie o motorista no fim.',
  },
  {
    key: 'motorista',
    icon: 'car-outline' as const,
    title: 'Para motoristas',
    body: 'Fique online, receba ofertas próximas, inicie a viagem e conclua entregas no mapa.',
  },
  {
    key: 'mapa',
    icon: 'map-outline' as const,
    title: 'Mapa e GPS',
    body: 'Veja origem, destino e rota por estrada. O progresso atualiza com GPS ou simulação na demo.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();
  const update = useUpdateProfile();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
    },
  ).current;

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (profile?.onboarding_feito) return <Redirect href="/(app)" />;

  const finish = async () => {
    if (!profile) return;
    try {
      await update.mutateAsync({
        userId: profile.id,
        patch: { onboarding_feito: true },
      });
      toast('Bem-vindo à ConectaFrete!', 'sucesso');
      router.replace('/(app)');
    } catch (e: any) {
      toast(e.message ?? 'Não foi possível concluir o onboarding', 'erro');
    }
  };

  const next = () => {
    if (index >= SLIDES.length - 1) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex((i) => i + 1);
  };

  return (
    <Screen avoidKeyboard={false} style={styles.screen}>
      <Text style={styles.brand}>ConectaFrete</Text>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: width - 32 }]}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={42} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <Button
        title={index === SLIDES.length - 1 ? 'Começar' : 'Seguinte'}
        loading={update.isPending}
        onPress={next}
      />
      {index < SLIDES.length - 1 && (
        <Button title="Saltar" variant="ghost" onPress={finish} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'space-between' },
  brand: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  slide: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 14,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: Colors.foreground,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    color: Colors.mutedForeground,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.muted,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 22,
  },
});
