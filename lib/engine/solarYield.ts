export interface SolarYieldParams {
  lat: number;
  lon: number;
  systemKwp: number;
  tiltDeg: number;
  azimuthDeg: number;
  shadingLossPct: number;
}

export interface SolarYieldResult {
  monthlyKwh: number[] | null;
  annualKwh: number | null;
  dataSource: 'pvgis' | 'nrel' | 'manual';
}

// In-memory cache: key -> { result, expiresAt }
const cache = new Map<string, { result: SolarYieldResult; expiresAt: number }>();

function cacheKey(params: SolarYieldParams): string {
  return `${params.lat.toFixed(2)}_${params.lon.toFixed(2)}_${params.systemKwp}_${params.tiltDeg}_${params.azimuthDeg}`;
}

function applyShading(monthlyKwh: number[], shadingLossPct: number): number[] {
  const factor = 1 - shadingLossPct / 100;
  return monthlyKwh.map((v) => v * factor);
}

// PVGIS uses 0=south, -90=east, 90=west, -180/180=north
function compassToPvgisAzimuth(compassDeg: number): number {
  // compass: 0=N, 90=E, 180=S, 270=W
  // pvgis: 0=S, -90=E, 90=W, ±180=N
  const south = compassDeg - 180;
  return south > 180 ? south - 360 : south < -180 ? south + 360 : south;
}

async function fetchPVGIS(params: SolarYieldParams): Promise<number[] | null> {
  const pvgisAzimuth = compassToPvgisAzimuth(params.azimuthDeg);
  const url =
    `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc` +
    `?lat=${params.lat}&lon=${params.lon}` +
    `&peakpower=${params.systemKwp}&loss=14` +
    `&angle=${params.tiltDeg}&aspect=${pvgisAzimuth}` +
    `&outputformat=json`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;

  const data = await res.json();
  const monthly: { E_m: number }[] | undefined = data?.outputs?.monthly?.fixed;
  if (!monthly || monthly.length !== 12) return null;

  return monthly.map((m) => m.E_m);
}

async function fetchNREL(params: SolarYieldParams): Promise<number[] | null> {
  const apiKey = process.env.NREL_API_KEY;
  if (!apiKey) return null;

  const url =
    `https://developer.nrel.gov/api/pvwatts/v8.json` +
    `?api_key=${apiKey}&lat=${params.lat}&lon=${params.lon}` +
    `&system_capacity=${params.systemKwp}&tilt=${params.tiltDeg}` +
    `&azimuth=${params.azimuthDeg}&losses=14&array_type=1&module_type=0`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;

  const data = await res.json();
  const monthly: number[] | undefined = data?.outputs?.ac_monthly;
  if (!monthly || monthly.length !== 12) return null;

  return monthly;
}

export async function getSolarYield(params: SolarYieldParams): Promise<SolarYieldResult> {
  const key = cacheKey(params);
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.result;

  let monthlyRaw: number[] | null = null;
  let dataSource: SolarYieldResult['dataSource'] = 'manual';

  try {
    monthlyRaw = await fetchPVGIS(params);
    if (monthlyRaw) dataSource = 'pvgis';
  } catch {}

  if (!monthlyRaw) {
    try {
      monthlyRaw = await fetchNREL(params);
      if (monthlyRaw) dataSource = 'nrel';
    } catch {}
  }

  if (!monthlyRaw) {
    const result: SolarYieldResult = { monthlyKwh: null, annualKwh: null, dataSource: 'manual' };
    cache.set(key, { result, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    return result;
  }

  const monthlyKwh = applyShading(monthlyRaw, params.shadingLossPct);
  const annualKwh = monthlyKwh.reduce((a, b) => a + b, 0);
  const result: SolarYieldResult = { monthlyKwh, annualKwh, dataSource };

  cache.set(key, { result, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  return result;
}

export function applyDegradation(year1Monthly: number[], yearIndex: number): number[] {
  // yearIndex: 1-based (year 1 = no degradation, year 2 = 0.5% off, etc.)
  const factor = Math.pow(0.995, yearIndex - 1);
  return year1Monthly.map((v) => v * factor);
}
