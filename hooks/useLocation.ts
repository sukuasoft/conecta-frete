import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type UserLocation = {
  lat: number;
  lng: number;
  accuracy?: number | null;
};

export function useLocation(opts?: { watch?: boolean; enabled?: boolean }) {
  const watch = opts?.watch ?? false;
  const enabled = opts?.enabled ?? true;
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);

  const requestAndGet = useCallback(async () => {
    if (!enabled) return null;
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status);
      if (status !== Location.PermissionStatus.GRANTED) {
        setError('Permissão de localização negada.');
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
      setLocation(next);
      return next;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao obter localização');
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let sub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status);
      if (status !== Location.PermissionStatus.GRANTED) {
        setError('Permissão de localização negada.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });

      if (watch) {
        sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 50,
            timeInterval: 10_000,
          },
          (p) => {
            setLocation({
              lat: p.coords.latitude,
              lng: p.coords.longitude,
              accuracy: p.coords.accuracy,
            });
          },
        );
      }
    })().catch((e) => {
      setError(e instanceof Error ? e.message : 'Falha ao obter localização');
    });

    return () => {
      sub?.remove();
    };
  }, [enabled, watch]);

  return {
    location,
    error,
    loading,
    permission,
    refresh: requestAndGet,
    granted: permission === Location.PermissionStatus.GRANTED,
  };
}
