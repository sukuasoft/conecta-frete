export interface CidadeAngola {
  nome: string;
  provincia: string;
  lat: number;
  lng: number;
}

export const CIDADES_ANGOLA: CidadeAngola[] = [
  { nome: 'Luanda', provincia: 'Luanda', lat: -8.839, lng: 13.2894 },
  { nome: 'Huambo', provincia: 'Huambo', lat: -12.7761, lng: 15.7392 },
  { nome: 'Lobito', provincia: 'Benguela', lat: -12.3481, lng: 13.5456 },
  { nome: 'Benguela', provincia: 'Benguela', lat: -12.5763, lng: 13.4055 },
  { nome: 'Lubango', provincia: 'Huíla', lat: -14.9177, lng: 13.4925 },
  { nome: 'Cabinda', provincia: 'Cabinda', lat: -5.55, lng: 12.2 },
  { nome: 'Malanje', provincia: 'Malanje', lat: -9.5402, lng: 16.3411 },
  { nome: 'Namibe (Moçâmedes)', provincia: 'Namibe', lat: -15.1961, lng: 12.1522 },
  { nome: 'Soyo', provincia: 'Zaire', lat: -6.1349, lng: 12.3689 },
  { nome: 'Mbanza Kongo', provincia: 'Zaire', lat: -6.27, lng: 14.2417 },
  { nome: 'Uíge', provincia: 'Uíge', lat: -7.6086, lng: 15.0614 },
  { nome: 'Caxito', provincia: 'Bengo', lat: -8.5783, lng: 13.6644 },
  { nome: 'Ndalatando', provincia: 'Cuanza Norte', lat: -9.2978, lng: 14.9106 },
  { nome: 'Sumbe', provincia: 'Cuanza Sul', lat: -11.2058, lng: 13.8425 },
  { nome: 'Saurimo', provincia: 'Lunda Sul', lat: -9.6606, lng: 20.3925 },
  { nome: 'Dundo', provincia: 'Lunda Norte', lat: -7.3781, lng: 20.835 },
  { nome: 'Luena', provincia: 'Moxico', lat: -11.7831, lng: 19.9136 },
  { nome: 'Cuito', provincia: 'Bié', lat: -12.3833, lng: 16.9333 },
  { nome: 'Menongue', provincia: 'Cuando Cubango', lat: -14.6586, lng: 17.6911 },
  { nome: 'Ondjiva', provincia: 'Cunene', lat: -17.0664, lng: 15.7333 },
];

export const PROVINCIAS = Array.from(new Set(CIDADES_ANGOLA.map((c) => c.provincia))).sort();

export function formatKz(valor: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(valor)
    .replace('AOA', 'Kz');
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
