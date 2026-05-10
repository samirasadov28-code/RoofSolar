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

  // Average peak-sun hours per day — a more intuitive feel for the
  // resource than the annual total.
  const sunHoursPerDay = peakSunHoursPerYear / 365;

  // Typical capacity-factor range for the latitude, so users have a
  // sanity-check benchmark. Rough heuristic — clear-sky deserts will
  // exceed the upper bound, persistent overcast regions will sit below.
  const { lo: typicalLo, hi: typicalHi } = typicalCapacityFactorRange(lat);

  // "Sunny day equivalent" — how many full 8-hour blue-sky days the
  // peak-sun-hour budget represents. Rough public-friendly metric.
  const sunnyDaysEquivalent = peakSunHoursPerYear / 8;

  return NextResponse.json({
    sampleSystemKwp,
    sampleAnnualKwh: Math.round(yieldResult.annualKwh),
    annualKwhPerKwp: Math.round(specificYield),
    peakSunHoursPerYear: Math.round(peakSunHoursPerYear),
    sunHoursPerDay: Math.round(sunHoursPerDay * 10) / 10,
    capacityFactorPct: Math.round(capacityFactorPct * 10) / 10,
    typicalCapacityFactorLo: typicalLo,
    typicalCapacityFactorHi: typicalHi,
    sunnyDaysEquivalent: Math.round(sunnyDaysEquivalent),
    dataSource: yieldResult.dataSource,
  });
}

/**
 * Typical residential PV capacity-factor band by latitude. Numbers reflect
 * a south-facing array with no major shading, representative of widely
 * published 2020-24 utility-scale and rooftop reports (NREL, IEA PVPS,
 * Fraunhofer ISE). Clear-sky deserts and persistent overcast will fall
 * outside the band.
 */
function typicalCapacityFactorRange(lat: number): { lo: number; hi: number } {
  const absLat = Math.abs(lat);
  if (absLat > 60) return { lo: 7,  hi: 10 };   // Iceland, far Scandinavia
  if (absLat > 50) return { lo: 10, hi: 13 };   // UK, IE, N. Germany, S. Canada
  if (absLat > 40) return { lo: 12, hi: 16 };   // Central Europe, N. US
  if (absLat > 30) return { lo: 15, hi: 19 };   // Mediterranean, S. US, N. China
  if (absLat > 20) return { lo: 17, hi: 22 };   // Subtropics: Mexico, N. India, N. Africa, AU
  if (absLat > 10) return { lo: 16, hi: 20 };   // Tropics with seasonal cloud
  return { lo: 15, hi: 18 };                    // Equatorial
}
