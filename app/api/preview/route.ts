import { NextRequest, NextResponse } from 'next/server';
import { getSolarYield } from '@/lib/engine/solarYield';
import { getCountryDefaults } from '@/lib/countryDefaults';
import { co2FactorFor } from '@/lib/co2';

/**
 * Lightweight location preview used by Step 1 of the wizard.
 *
 * Calls PVGIS (or NREL fallback) with a reference 4 kWp south-facing 35°
 * tilt system and returns headline insolation metrics + country-aware
 * tariff / CO₂ / grant context so the user gets meaningful feedback
 * immediately after picking an address.
 */
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lon = parseFloat(searchParams.get('lon') ?? '');
  const countryCode = (searchParams.get('cc') ?? '').toLowerCase();
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

  if (!yieldResult.annualKwh || !yieldResult.monthlyKwh) {
    return NextResponse.json({ error: 'no_yield_data' }, { status: 502 });
  }

  // ── Solar resource metrics ─────────────────────────────────────────
  // PVGIS already nets out typical system losses (~14%).
  const specificYield = yieldResult.annualKwh / sampleSystemKwp;
  const SYSTEM_LOSS_FACTOR = 0.14;
  const peakSunHoursPerYear = specificYield / (1 - SYSTEM_LOSS_FACTOR);
  const capacityFactorPct = (specificYield / 8760) * 100;
  const sunHoursPerDay = peakSunHoursPerYear / 365;
  const sunnyDaysEquivalent = peakSunHoursPerYear / 8;
  const { lo: typicalLo, hi: typicalHi } = typicalCapacityFactorRange(lat);

  // ── Seasonal swing — peak and trough months ────────────────────────
  const monthly = yieldResult.monthlyKwh;
  let bestIdx = 0, worstIdx = 0;
  for (let i = 1; i < 12; i++) {
    if (monthly[i] > monthly[bestIdx]) bestIdx = i;
    if (monthly[i] < monthly[worstIdx]) worstIdx = i;
  }
  const seasonalSwing = monthly[worstIdx] > 0 ? monthly[bestIdx] / monthly[worstIdx] : null;

  // ── Daylight hours — derived from latitude (Spencer formula) ───────
  const daylightSummer = daylightHoursFor(lat, 172);   // ≈ Jun 21
  const daylightWinter = daylightHoursFor(lat, 355);   // ≈ Dec 21

  // ── Country-aware money & climate context ──────────────────────────
  const cd = getCountryDefaults(countryCode);
  // Reference savings assumption: ~35% self-consumption (no battery),
  // 65% exported. Conservative-mixed for a 4 kWp system.
  const selfConsumedFraction = 0.35;
  const exportedFraction = 1 - selfConsumedFraction;
  const annualSavings =
    yieldResult.annualKwh * selfConsumedFraction * cd.importPricePerKwh
    + yieldResult.annualKwh * exportedFraction   * cd.exportPricePerKwh;

  const co2Factor = co2FactorFor(countryCode);
  const annualCo2Saved = yieldResult.annualKwh * co2Factor;

  return NextResponse.json({
    sampleSystemKwp,
    sampleAnnualKwh: Math.round(yieldResult.annualKwh),

    // Solar resource
    annualKwhPerKwp: Math.round(specificYield),
    peakSunHoursPerYear: Math.round(peakSunHoursPerYear),
    sunHoursPerDay: Math.round(sunHoursPerDay * 10) / 10,
    capacityFactorPct: Math.round(capacityFactorPct * 10) / 10,
    typicalCapacityFactorLo: typicalLo,
    typicalCapacityFactorHi: typicalHi,
    sunnyDaysEquivalent: Math.round(sunnyDaysEquivalent),

    // Seasonal
    bestMonth:  { name: MONTH_NAMES[bestIdx],  kwh: Math.round(monthly[bestIdx]) },
    worstMonth: { name: MONTH_NAMES[worstIdx], kwh: Math.round(monthly[worstIdx]) },
    seasonalSwing: seasonalSwing ? Math.round(seasonalSwing * 10) / 10 : null,

    // Daylight
    daylightSummer: Math.round(daylightSummer * 10) / 10,
    daylightWinter: Math.round(daylightWinter * 10) / 10,

    // Money & climate (country-aware — sensible fallback if cc absent)
    currencySymbol: cd.symbol,
    currencyCode: cd.currencyCode,
    estimatedAnnualSavings: Math.round(annualSavings),
    annualCo2SavedKg: Math.round(annualCo2Saved),
    co2FactorKgPerKwh: co2Factor,
    localImportPrice: cd.importPricePerKwh,
    localExportPrice: cd.exportPricePerKwh,
    localGrant: cd.grant,
    localGrantSchemeName: cd.grantSchemeName,
    countryName: cd.countryName,

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
  if (absLat > 60) return { lo: 7,  hi: 10 };
  if (absLat > 50) return { lo: 10, hi: 13 };
  if (absLat > 40) return { lo: 12, hi: 16 };
  if (absLat > 30) return { lo: 15, hi: 19 };
  if (absLat > 20) return { lo: 17, hi: 22 };
  if (absLat > 10) return { lo: 16, hi: 20 };
  return { lo: 15, hi: 18 };
}

/**
 * Daylight hours for a given latitude on a given day of year.
 * Standard sunrise-equation derivation; ignores atmospheric refraction.
 * Returns 0 / 24 for polar night / polar day respectively.
 */
function daylightHoursFor(lat: number, dayOfYear: number): number {
  const declDeg = -23.45 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);
  const latRad = (lat * Math.PI) / 180;
  const declRad = (declDeg * Math.PI) / 180;
  const cosH = -Math.tan(latRad) * Math.tan(declRad);
  if (cosH < -1) return 24;
  if (cosH > 1) return 0;
  const H = Math.acos(cosH);
  return (2 * H * 12) / Math.PI;
}
