import { haversineKm } from '@/lib/angola';

export type LatLng = { lat: number; lng: number };

export type RouteResult = {
  points: LatLng[];
  distanceKm: number;
  durationMin: number | null;
  fallback: boolean;
};

export function interpolatePoint(a: LatLng, b: LatLng, t: number): LatLng {
  const p = Math.min(1, Math.max(0, t));
  return {
    lat: a.lat + (b.lat - a.lat) * p,
    lng: a.lng + (b.lng - a.lng) * p,
  };
}

function straightRoute(origem: LatLng, destino: LatLng): RouteResult {
  return {
    points: [origem, destino],
    distanceKm: Number(haversineKm(origem, destino).toFixed(1)),
    durationMin: null,
    fallback: true,
  };
}

/** Rota por estrada via OSRM (OpenStreetMap). Fallback: linha reta. */
export async function fetchRoute(origem: LatLng, destino: LatLng): Promise<RouteResult> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origem.lng},${origem.lat};${destino.lng},${destino.lat}` +
    `?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const json = await res.json();
    const route = json?.routes?.[0];
    const coords: [number, number][] | undefined = route?.geometry?.coordinates;
    if (!coords?.length) throw new Error('Sem geometria');

    return {
      points: coords.map(([lng, lat]) => ({ lat, lng })),
      distanceKm: Number(((route.distance ?? 0) / 1000).toFixed(1)),
      durationMin: route.duration ? Math.round(route.duration / 60) : null,
      fallback: false,
    };
  } catch {
    return straightRoute(origem, destino);
  }
}

export function pointAlongRoute(route: LatLng[], progresso: number): LatLng {
  if (route.length === 0) return { lat: 0, lng: 0 };
  if (route.length === 1) return route[0];
  const t = Math.min(1, Math.max(0, progresso / 100));
  if (t === 0) return route[0];
  if (t === 1) return route[route.length - 1];

  let total = 0;
  const segs: number[] = [];
  for (let i = 1; i < route.length; i++) {
    const d = Math.hypot(route[i].lat - route[i - 1].lat, route[i].lng - route[i - 1].lng);
    segs.push(d);
    total += d;
  }
  if (total === 0) return route[0];

  let target = total * t;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i]) {
      const local = segs[i] === 0 ? 0 : target / segs[i];
      return interpolatePoint(route[i], route[i + 1], local);
    }
    target -= segs[i];
  }
  return route[route.length - 1];
}

/** Progresso 0–100 da posição GPS projetada na rota. */
export function progressFromGps(route: LatLng[], gps: LatLng): number {
  if (route.length < 2) return 0;

  let bestDist = Infinity;
  let bestProgress = 0;
  let total = 0;
  const segs: { a: LatLng; b: LatLng; len: number }[] = [];

  for (let i = 1; i < route.length; i++) {
    const len = Math.hypot(route[i].lat - route[i - 1].lat, route[i].lng - route[i - 1].lng);
    segs.push({ a: route[i - 1], b: route[i], len });
    total += len;
  }
  if (total === 0) return 0;

  let walked = 0;
  for (const seg of segs) {
    const dx = seg.b.lat - seg.a.lat;
    const dy = seg.b.lng - seg.a.lng;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.min(1, Math.max(0, ((gps.lat - seg.a.lat) * dx + (gps.lng - seg.a.lng) * dy) / len2));
    const proj = { lat: seg.a.lat + dx * t, lng: seg.a.lng + dy * t };
    const dist = Math.hypot(gps.lat - proj.lat, gps.lng - proj.lng);
    const prog = ((walked + seg.len * t) / total) * 100;
    if (dist < bestDist) {
      bestDist = dist;
      bestProgress = prog;
    }
    walked += seg.len;
  }

  return Number(Math.min(99, Math.max(0, bestProgress)).toFixed(1));
}
