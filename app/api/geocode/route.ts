import { NextRequest, NextResponse } from 'next/server';

const cache = new Map<string, { data: unknown; expiresAt: number }>();

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 3) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }

  const cacheKey = q.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.data);
  }

  const params = new URLSearchParams({
    q,
    format: 'json',
    limit: '5',
    addressdetails: '1',
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': 'RoofSolar/1.0 (contact@roofsolar.netlify.app)' },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
  }

  const results = await res.json();
  const data = (results || []).map((r: any) => ({
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    countryCode: r.address?.country_code ?? '',
    displayName: r.display_name ?? '',
  }));

  cache.set(cacheKey, { data, expiresAt: Date.now() + 60 * 60 * 1000 });

  return NextResponse.json(data);
}
