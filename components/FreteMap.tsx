import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, {
  Marker,
  Polyline,
  UrlTile,
  type Region,
} from 'react-native-maps';
import { Colors, Radius } from '@/constants/theme';
import type { Frete, Profile } from '@/lib/types';
import { fetchRoute, pointAlongRoute, type LatLng } from '@/lib/routing';

// Não usar tile.openstreetmap.org em apps — bloqueia (osm.wiki/blocked).
// CARTO Voyager: dados OpenStreetMap, permitido para uso em aplicações.
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
  height?: number;
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
  const latDelta = Math.max(0.05, (maxLat - minLat) * 1.45);
  const lngDelta = Math.max(0.05, (maxLng - minLng) * 1.45);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

export function FreteMap({
  frete,
  origem,
  destino,
  motoristas = [],
  userLocation,
  showUser = false,
  height = 280,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

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
      return;
    }
    setLoadingRoute(true);
    fetchRoute(start, end)
      .then((pts) => {
        if (!cancelled) setRoute(pts);
      })
      .finally(() => {
        if (!cancelled) setLoadingRoute(false);
      });
    return () => {
      cancelled = true;
    };
  }, [start?.lat, start?.lng, end?.lat, end?.lng]);

  const progresso = frete?.progresso ?? 0;
  const vehicle =
    frete &&
    (frete.status === 'aceito' || frete.status === 'em_transito') &&
    route.length > 0
      ? pointAlongRoute(route, progresso)
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
        { edgePadding: { top: 48, right: 48, bottom: 48, left: 48 }, animated: true },
      );
    }, 350);
    return () => clearTimeout(timer);
  }, [fitPoints]);

  const initial = regionFor(fitPoints.length ? fitPoints : [LUANDA]);

  return (
    <View style={[styles.wrap, { height }]}>
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
            pinColor="#3b82f6"
          />
        )}
        {end && (
          <Marker
            coordinate={{ latitude: end.lat, longitude: end.lng }}
            title="Destino"
            description={frete?.destino_endereco}
            pinColor="#e8b84a"
          />
        )}
        {vehicle && (
          <Marker
            coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }}
            title="Carga"
            description={`${Math.round(progresso)}% do trajeto`}
            pinColor={Colors.primary}
          />
        )}
        {showUser && isValid(userLocation) && (
          <Marker
            coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
            title="A sua localização"
            pinColor="#ef6b6b"
          />
        )}
        {motoristas.map((m) =>
          isValid({ lat: m.lat, lng: m.lng }) ? (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.lat, longitude: m.lng }}
              title={m.nome}
              description={`${m.veiculo ?? 'Motorista'} · ${m.capacidade_kg ?? 0} kg`}
              pinColor={Colors.success}
            />
          ) : null,
        )}

        {route.length > 1 && (
          <Polyline
            coordinates={route.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor={Colors.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>© OpenStreetMap · CARTO</Text>
        {loadingRoute ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
      </View>
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
  map: { flex: 1 },
  badge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.overlay,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  badgeText: {
    color: Colors.mutedForeground,
    fontSize: 11,
    fontWeight: '600',
  },
});
