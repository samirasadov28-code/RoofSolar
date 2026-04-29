import { NextRequest, NextResponse } from 'next/server';
import { getSolarYield } from '@/lib/engine/solarYield';
import { distributeConsumption } from '@/lib/engine/consumption';
import { calcSelfConsumption } from '@/lib/engine/selfConsumption';
import { calcBattery } from '@/lib/engine/battery';
import { getGrant } from '@/lib/engine/grants';
import { calcEvCharging } from '@/lib/engine/evCharging';
import { calcFinancing } from '@/lib/engine/financing';
import { buildCashflow } from '@/lib/engine/cashflow';
import { calcIRR, calcNPV, calcPaybackMonths, calcLifetimeSavings } from '@/lib/engine/metrics';
import { runSensitivity } from '@/lib/engine/sensitivity';

const CO2_KG_PER_KWH: Record<string, number> = {
  gb: 0.233,
  ie: 0.295,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lat, lon, countryCode,
      systemKwp, tiltDeg, azimuthDeg, shadingLossPct,
      annualKwh,
      hasBattery, batteryKwh = 0, maxCyclePct = 0.9, performArbitrage = false,
      hasEv, annualMileageKm, vehicleEfficiencyKwhPer100km, chargingPreference, publicChargingPct,
      importPricePerKwh, exportPricePerKwh,
      dayPricePerKwh, nightPricePerKwh,
      systemCostGross, // gross cost before grant
      financingMode, loanCoveragePct, annualRatePct, tenorYears,
      energyPriceEscalationPct = 0.03,
      panelCount,
    } = body;

    // 1. Solar yield
    const yieldResult = await getSolarYield({ lat, lon, systemKwp, tiltDeg, azimuthDeg, shadingLossPct });
    if (!yieldResult.monthlyKwh) {
      return NextResponse.json({ needsManualProduction: true, dataSource: 'manual' });
    }

    // 2. Consumption
    const monthlyConsumption = distributeConsumption(annualKwh);

    // 3. Self-consumption
    const sc = calcSelfConsumption(yieldResult.monthlyKwh, monthlyConsumption);

    // 4. Grant and net capex
    const grant = getGrant(countryCode, systemKwp);
    const netCapex = Math.max(0, (systemCostGross || 0) - grant);

    // 5. Battery
    const batteryResult = hasBattery && batteryKwh > 0
      ? calcBattery({
          batteryKwh, maxCyclePct, nightPricePerKwh, dayPricePerKwh,
          performArbitrage, exportedKwh: sc.exportedKwh, gridImportKwh: sc.gridImportKwh,
        })
      : { batteryConsumptionKwh: Array(12).fill(0), batteryPayment: Array(12).fill(0), arbitrageProfit: Array(12).fill(0) };

    // 6. EV charging
    const evResult = hasEv
      ? calcEvCharging({
          annualMileageKm, vehicleEfficiencyKwhPer100km, publicChargingPct, chargingPreference,
          monthlyProduction: yieldResult.monthlyKwh, dayPricePerKwh, nightPricePerKwh,
          batteryKwh: hasBattery ? batteryKwh : 0,
          annualProduction: yieldResult.annualKwh!, panelCount,
        })
      : undefined;

    // 7. Financing
    const financing = calcFinancing({ netCapex, financingMode, loanCoveragePct, annualRatePct, tenorYears });

    // 8. Cashflow
    const batteryRuntimeParams = hasBattery && batteryKwh > 0
      ? { batteryKwh, maxCyclePct, nightPricePerKwh, dayPricePerKwh, performArbitrage }
      : undefined;

    const cashflowParams = {
      netCapex, monthlyProduction: yieldResult.monthlyKwh, monthlyConsumption,
      importPricePerKwh, exportPricePerKwh, battery: batteryResult, financing,
      loanTenorYears: tenorYears, evCharging: evResult, energyPriceEscalationPct,
      batteryRuntimeParams,
    };
    const cashflows = buildCashflow(cashflowParams);

    // 9. Metrics
    const cfValues = cashflows.map((r) => r.netCashflow);
    // IRR requires upfront equity to be meaningful. With 100% debt the year-0
    // outflow is ~0 and IRR is mathematically undefined.
    const hasEquity = financing.upfrontCash > 1;
    const rawIrr = hasEquity ? calcIRR(cfValues) : NaN;
    const irr = Number.isFinite(rawIrr) ? rawIrr : null;
    const irrUnavailableReason = irr === null
      ? (hasEquity ? 'unstable' : 'no_equity')
      : null;
    const npv = calcNPV(cfValues, 0.08);
    const paybackMonths = calcPaybackMonths(cashflows);
    const lifetimeSavings = calcLifetimeSavings(cashflows);
    const annualCo2Saved = (yieldResult.annualKwh! * (CO2_KG_PER_KWH[countryCode] ?? 0.4));

    // 10. Sensitivity
    const sensitivity = runSensitivity(cashflowParams);

    // 11. Year 1 totals
    const yr1 = cashflows[1];

    const results = {
      dataSource: yieldResult.dataSource,
      annualProductionKwh: yieldResult.annualKwh,
      monthlyProductionKwh: yieldResult.monthlyKwh,
      selfConsumedKwh: sc.selfConsumedKwh.reduce((a, b) => a + b, 0),
      exportedKwh: sc.exportedKwh.reduce((a, b) => a + b, 0),
      gridImportKwh: sc.gridImportKwh.reduce((a, b) => a + b, 0),
      exportIncomeYear1: yr1.exportIncome,
      solarSavingsYear1: yr1.solarSavings,
      netSavingsYear1: yr1.netCashflow,
      grant, netCapex,
      financing,
      cashflows,
      irr, irrUnavailableReason, npv, paybackMonths, lifetimeSavings,
      annualCo2Saved,
      evCharging: evResult,
      batteryResult,
      sensitivity,
      monthlyExportKwh: sc.exportedKwh,
    };

    // Save to Supabase (non-blocking; skip if DB not configured)
    try {
      const { createServiceClient } = await import('@/lib/supabase');
      const supabase = createServiceClient();
      const { data } = await supabase
        .from('calculations')
        .insert({ inputs: body, results, address: body.displayName, system_kwp: systemKwp })
        .select('id')
        .single();
      if (data?.id) {
        return NextResponse.json({ ...results, calculationId: data.id });
      }
    } catch {}

    return NextResponse.json(results);
  } catch (err: any) {
    console.error('Calculate error:', err);
    return NextResponse.json({ error: 'Calculation failed', details: err.message }, { status: 500 });
  }
}
