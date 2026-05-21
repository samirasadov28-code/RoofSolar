import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get('lat');
  const lon = request.nextUrl.searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 });
  }

  const params = new URLSearchParams({ lat, lon, format: 'json', addressdetails: '1' });

  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: { 'User-Agent': 'RoofSolar/1.0 (contact@roofsolar.netlify.app)' },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Reverse geocoding failed' }, { status: 502 });
  }

  const r = await res.json();
  if (r.error) {
    return NextResponse.json({ error: r.error }, { status: 404 });
  }

  return NextResponse.json({
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    countryCode: r.address?.country_code ?? '',
    displayName: r.display_name ?? '',
  });
}
