import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, {
  Marker,
  Polyline,
  UrlTile,
  type Region,
} from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';
import type { Frete, Profile } from '@/lib/types';
import { fetchRoute, pointAlongRoute, type LatLng } from '@/lib/routing';

const TILE_URL =
  'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
const LUANDA: LatLng = { lat: -8.839, lng: 13.2894 };

type Props = {
  frete?: Frete | null;
  origem?: LatLng | null;
  destino?: LatLng | null;
  motoristas?: Profile[];
  userLocation?: LatLng | null;
  showUser?: boolean;
  height?: number | '100%';
  /** Animação suave do camião (demo) quando em_transito */
  simulate?: boolean;
  onOpenFullscreen?: () => void;
  showLegend?: boolean;
};

function isValid(p?: LatLng | null): p is LatLng {
  return !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat) <= 90;
}

function regionFor(points: LatLng[]): Region {
  if (points.length === 0) {
    return { latitude: LUANDA.lat, longitude: LUANDA.lng, latitudeDelta: 0.4, longitudeDelta: 0.4 };
  }
  if (points.length === 1) {
    return {
      latitude: points[0].lat,
      longitude: points[0].lng,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.05, (maxLat - minLat) * 1.45),
    longitudeDelta: Math.max(0.05, (maxLng - minLng) * 1.45),
  };
}

function MapPin({
  color,
  icon,
  label,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
}) {
  return (
    <View style={styles.pinWrap}>
      <View style={[styles.pin, { backgroundColor: color }]}>
        <Ionicons name={icon} size={16} color="#fff" />
      </View>
      {label ? <Text style={styles.pinLabel}>{label}</Text> : null}
    </View>
  );
}

export function FreteMap({
  frete,
  origem,
  destino,
  motoristas = [],
  userLocation,
  showUser = false,
  height = 280,
  simulate = false,
  onOpenFullscreen,
  showLegend = true,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [animProgress, setAnimProgress] = useState(0);

  const start = useMemo((): LatLng | null => {
    if (frete) return { lat: frete.origem_lat, lng: frete.origem_lng };
    return isValid(origem) ? origem : null;
  }, [frete, origem]);

  const end = useMemo((): LatLng | null => {
    if (frete) return { lat: frete.destino_lat, lng: frete.destino_lng };
    return isValid(destino) ? destino : null;
  }, [frete, destino]);

  useEffect(() => {
    let cancelled = false;
    if (!start || !end) {
      setRoute([]);
      setFallback(false);
      setDistanceKm(null);
      return;
    }
    setLoadingRoute(true);
    fetchRoute(start, end)
      .then((result) => {
        if (cancelled) return;
        setRoute(result.points);
        setFallback(result.fallback);
        setDistanceKm(result.distanceKm);
      })
      .finally(() => {
        if (!cancelled) setLoadingRoute(false);
      });
    return () => {
      cancelled = true;
    };
  }, [start?.lat, start?.lng, end?.lat, end?.lng]);

  const baseProgress = frete?.progresso ?? 0;
  const inTransit = frete?.status === 'em_transito';
  const shouldSimulate = simulate && inTransit && route.length > 1;

  useEffect(() => {
    setAnimProgress(baseProgress);
  }, [frete?.id, baseProgress]);

  useEffect(() => {
    if (!shouldSimulate) return;
    const id = setInterval(() => {
      setAnimProgress((p) => {
        const next = Math.min(97, p + 0.35);
        return next < p ? p : next;
      });
    }, 400);
    return () => clearInterval(id);
  }, [shouldSimulate, frete?.id]);

  const displayProgress =
    frete?.status === 'aceito' || frete?.status === 'em_transito'
      ? Math.max(baseProgress, shouldSimulate ? animProgress : baseProgress)
      : baseProgress;

  const vehicle =
    frete &&
    (frete.status === 'aceito' || frete.status === 'em_transito') &&
    route.length > 0
      ? pointAlongRoute(route, displayProgress)
      : null;

  const fitPoints = useMemo(() => {
    const pts: LatLng[] = [];
    if (start) pts.push(start);
    if (end) pts.push(end);
    if (vehicle) pts.push(vehicle);
    if (showUser && isValid(userLocation)) pts.push(userLocation);
    motoristas.forEach((m) => {
      if (isValid({ lat: m.lat, lng: m.lng })) pts.push({ lat: m.lat, lng: m.lng });
    });
    return pts;
  }, [start, end, vehicle, showUser, userLocation, motoristas]);

  useEffect(() => {
    if (!mapRef.current || fitPoints.length === 0) return;
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        fitPoints.map((p) => ({ latitude: p.lat, longitude: p.lng })),
        { edgePadding: { top: 56, right: 48, bottom: 72, left: 48 }, animated: true },
      );
    }, 350);
    return () => clearTimeout(timer);
  }, [fitPoints]);

  const initial = regionFor(fitPoints.length ? fitPoints : [LUANDA]);
  const heightStyle = height === '100%' ? [styles.flex, styles.flush] : { height };

  return (
    <View style={[styles.wrap, heightStyle]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initial}
        mapType={Platform.OS === 'android' ? 'none' : 'mutedStandard'}
        showsCompass
        showsScale={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <UrlTile
          urlTemplate={TILE_URL}
          maximumZ={19}
          flipY={false}
          zIndex={-1}
          shouldReplaceMapContent={Platform.OS === 'ios'}
        />

        {start && (
          <Marker
            coordinate={{ latitude: start.lat, longitude: start.lng }}
            title="Origem"
            description={frete?.origem_endereco}
            anchor={{ x: 0.5, y: 0.9 }}
          >
            <MapPin color="#3b82f6" icon="flag" label="A" />
          </Marker>
        )}
        {end && (
          <Marker
            coordinate={{ latitude: end.lat, longitude: end.lng }}
            title="Destino"
            description={frete?.destino_endereco}
            anchor={{ x: 0.5, y: 0.9 }}
          >
            <MapPin color="#e8b84a" icon="flag" label="B" />
          </Marker>
        )}
        {vehicle && (
          <Marker
            coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }}
            title="Camião"
            description={`${Math.round(displayProgress)}% do trajeto`}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.truck}>
              <Ionicons name="bus" size={18} color={Colors.primaryForeground} />
            </View>
          </Marker>
        )}
        {showUser && isValid(userLocation) && (
          <Marker
            coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
            title="A sua localização"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userDot}>
              <View style={styles.userDotInner} />
            </View>
          </Marker>
        )}
        {motoristas.map((m) =>
          isValid({ lat: m.lat, lng: m.lng }) ? (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.lat, longitude: m.lng }}
              title={m.nome}
              description={`${m.veiculo ?? 'Motorista'} · ${m.capacidade_kg ?? 0} kg`}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.driver}>
                <Ionicons name="car" size={14} color="#fff" />
              </View>
            </Marker>
          ) : null,
        )}

        {route.length > 1 && (
          <Polyline
            coordinates={route.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor={fallback ? Colors.warning : Colors.primary}
            strokeWidth={4}
            lineDashPattern={fallback ? [8, 6] : undefined}
          />
        )}
      </MapView>

      {fallback && !loadingRoute && start && end ? (
        <View style={styles.warn}>
          <Ionicons name="warning" size={14} color={Colors.warning} />
          <Text style={styles.warnText}>
            Rota OSRM indisponível — a mostrar linha reta
            {distanceKm != null ? ` (~${distanceKm} km)` : ''}
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            © OSM · CARTO
            {distanceKm != null && !fallback ? ` · ${distanceKm} km` : ''}
            {shouldSimulate ? ` · ${Math.round(displayProgress)}%` : ''}
          </Text>
          {loadingRoute ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
        </View>
        {onOpenFullscreen ? (
          <Pressable style={styles.expandBtn} onPress={onOpenFullscreen}>
            <Ionicons name="expand" size={18} color={Colors.foreground} />
          </Pressable>
        ) : null}
      </View>

      {showLegend ? (
        <View style={styles.legend}>
          <Text style={styles.legendItem}>🔵 Origem</Text>
          <Text style={styles.legendItem}>🟡 Destino</Text>
          <Text style={styles.legendItem}>🟢 Camião</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  flex: { flex: 1 },
  flush: { borderRadius: 0, borderWidth: 0 },
  map: { flex: 1 },
  pinWrap: { alignItems: 'center' },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pinLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.foreground,
    backgroundColor: Colors.overlay,
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  truck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  driver: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(239,107,107,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.destructive,
    borderWidth: 2,
    borderColor: '#fff',
  },
  warn: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(26, 20, 8, 0.92)',
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  warnText: { color: Colors.warning, fontSize: 12, fontWeight: '600', flex: 1 },
  footer: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.overlay,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    flexShrink: 1,
  },
  badgeText: {
    color: Colors.mutedForeground,
    fontSize: 11,
    fontWeight: '600',
  },
  expandBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.overlay,
    borderRadius: Radius.md,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
  },
  legendItem: { color: Colors.foreground, fontSize: 10, fontWeight: '600' },
});
