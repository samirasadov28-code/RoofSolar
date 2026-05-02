import { NextRequest, NextResponse } from 'next/server';
import { getSolarYield } from '@/lib/engine/solarYield';

/**
 * Lightweight location preview used by Step 1 of the wizard.
 *
 * Calls PVGIS (or NREL fallback) with a reference 4 kWp south-facing 35°
 * tilt system and returns headline insolation metrics so the user gets
 * immediate feedback after picking an address.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lon = parseFloat(searchParams.get('lon') ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 });
  }

  const sampleSystemKwp = 4;
  const yieldResult = await getSolarYield({
    lat,
    lon,
    systemKwp: sampleSystemKwp,
    tiltDeg: 35,
    azimuthDeg: 180,
    shadingLossPct: 0,
  });

  if (!yieldResult.annualKwh) {
    return NextResponse.json({ error: 'no_yield_data' }, { status: 502 });
  }

  // Specific yield (kWh per kWp per year). PVGIS already accounts for
  // typical system losses (~14%) and average weather.
  const specificYield = yieldResult.annualKwh / sampleSystemKwp;

  // 1 peak sun hour = 1 kWh produced per 1 kWp installed in ideal
  // conditions. So peak sun hours ≈ specific yield.
  const peakSunHoursPerYear = specificYield;

  // Capacity factor = actual output / theoretical 24/7 output
  // = annualKwh / (kWp × 8760).
  const capacityFactorPct = (specificYield / 8760) * 100;

  // "Sunny day equivalent" — how many full 8-hour blue-sky days the
  // peak-sun-hour budget represents. Rough public-friendly metric.
  const sunnyDaysEquivalent = peakSunHoursPerYear / 8;

  return NextResponse.json({
    sampleSystemKwp,
    sampleAnnualKwh: Math.round(yieldResult.annualKwh),
    annualKwhPerKwp: Math.round(specificYield),
    peakSunHoursPerYear: Math.round(peakSunHoursPerYear),
    capacityFactorPct: Math.round(capacityFactorPct * 10) / 10,
    sunnyDaysEquivalent: Math.round(sunnyDaysEquivalent),
    dataSource: yieldResult.dataSource,
  });
}
