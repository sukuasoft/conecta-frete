export type LatLng = { lat: number; lng: number };

export function interpolatePoint(a: LatLng, b: LatLng, t: number): LatLng {
  const p = Math.min(1, Math.max(0, t));
  return {
    lat: a.lat + (b.lat - a.lat) * p,
    lng: a.lng + (b.lng - a.lng) * p,
  };
}

/** Rota por estrada via OSRM (OpenStreetMap). Fallback: linha reta. */
export async function fetchRoute(origem: LatLng, destino: LatLng): Promise<LatLng[]> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origem.lng},${origem.lat};${destino.lng},${destino.lat}` +
    `?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const json = await res.json();
    const coords: [number, number][] | undefined = json?.routes?.[0]?.geometry?.coordinates;
    if (!coords?.length) throw new Error('Sem geometria');
    return coords.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return [origem, destino];
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
