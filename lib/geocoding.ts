export interface GeocodeResult {
  lat: number;
  lon: number;
  countryCode: string;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({ q: address, format: 'json', limit: '1' });
  const url = `https://nominatim.openstreetmap.org/search?${params}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'RoofSolar/1.0 (contact@roofsolar.io)' },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data || data.length === 0) return null;

  const first = data[0];
  return {
    lat: parseFloat(first.lat),
    lon: parseFloat(first.lon),
    countryCode: first.address?.country_code ?? '',
    displayName: first.display_name ?? '',
  };
}
