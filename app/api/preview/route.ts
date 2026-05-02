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

  // Specific yield (kWh AC delivered per kWp installed, per year). PVGIS
  // already nets out typical system losses (~14%: inverter, wiring,
  // soiling, temperature, mismatch).
  const specificYield = yieldResult.annualKwh / sampleSystemKwp;

  // Peak sun hours measure the plane-of-array solar resource BEFORE those
  // system losses (1 PSH = 1 kWh/m² of irradiation). To recover them from
  // the loss-netted specific yield we divide by the loss factor used in
  // getSolarYield (PVGIS loss=14 → 0.86 throughput).
  const SYSTEM_LOSS_FACTOR = 0.14;
  const peakSunHoursPerYear = specificYield / (1 - SYSTEM_LOSS_FACTOR);

  // Capacity factor = actual AC output / nameplate × 8,760.
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
