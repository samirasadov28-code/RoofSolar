import { NextRequest, NextResponse } from 'next/server';
import { getSolarYield } from '@/lib/engine/solarYield';
import { distributeConsumption } from '@/lib/engine/consumption';
import { calcSelfConsumption, profileCapFor } from '@/lib/engine/selfConsumption';
import { calcBattery } from '@/lib/engine/battery';
import { getGrant } from '@/lib/engine/grants';
import { calcEvCharging } from '@/lib/engine/evCharging';
import { calcFinancing } from '@/lib/engine/financing';
import { buildCashflow } from '@/lib/engine/cashflow';
import { calcIRR, calcNPV, calcPaybackMonths, calcLifetimeSavings } from '@/lib/engine/metrics';
import { runSensitivity } from '@/lib/engine/sensitivity';
import { runExtendedSensitivity } from '@/lib/engine/extendedSensitivity';
import { runHourlySimulator } from '@/lib/engine/hourlySimulator';

// Grid CO2 intensity (kg CO2 per kWh) by ISO country code. Rough 2023-24
// averages from EEA / IEA / Our World in Data. Used for CO2-saved metric only.
const CO2_KG_PER_KWH: Record<string, number> = {
  gb: 0.233, ie: 0.295,
  fr: 0.058, de: 0.380, es: 0.190, it: 0.290, nl: 0.330,
  be: 0.165, pt: 0.180, at: 0.140, ch: 0.040, dk: 0.140,
  no: 0.020, se: 0.040, fi: 0.090, pl: 0.660, cz: 0.420,
  us: 0.380, ca: 0.130, au: 0.560, nz: 0.110,
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
      consumptionProfile,
      inverterType = 'standard',
    } = body;

    // Lifetime horizon used by the cashflow model (panel warranty period).
    // The inverter is typically replaced once around year 12.
    const HORIZON_YEARS = 25;
    const INVERTER_REPLACEMENT_YEAR = 12;
    const INVERTER_REPLACEMENT_COST = inverterType === 'hybrid' ? 1800 : 1200;

    // 1. Solar yield
    const yieldResult = await getSolarYield({ lat, lon, systemKwp, tiltDeg, azimuthDeg, shadingLossPct });
    if (!yieldResult.monthlyKwh) {
      return NextResponse.json({ needsManualProduction: true, dataSource: 'manual' });
    }

    // 2. Consumption
    const monthlyConsumption = distributeConsumption(annualKwh);

    // 3. Self-consumption — capped by the appliance time-of-day profile.
    // A battery effectively time-shifts midday surplus into the evening, so
    // when one is present we relax the cap toward the naive 1.0 ceiling.
    const baseProfileCap = profileCapFor(consumptionProfile);
    const profileCap = hasBattery && batteryKwh > 0
      ? Math.min(1.0, baseProfileCap + 0.25)
      : baseProfileCap;
    const sc = calcSelfConsumption(yieldResult.monthlyKwh, monthlyConsumption, profileCap);

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
      batteryRuntimeParams, profileCap,
      horizonYears: HORIZON_YEARS,
      inverterReplacementYear: INVERTER_REPLACEMENT_YEAR,
      inverterReplacementCost: INVERTER_REPLACEMENT_COST,
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

    // 10. Hourly battery simulator (representative day per month)
    const hourlySimResult = runHourlySimulator({
      monthlyProductionKwh: yieldResult.monthlyKwh!,
      monthlyConsumptionKwh: monthlyConsumption,
      batteryKwh: hasBattery && batteryKwh > 0 ? batteryKwh : 0,
      importPricePerKwh,
      exportPricePerKwh,
      nightPricePerKwh: nightPricePerKwh ?? importPricePerKwh,
      performArbitrage: !!(hasBattery && batteryKwh > 0 && performArbitrage),
    });

    // 10a. Sensitivity
    const sensitivity = runSensitivity(cashflowParams);

    // 10b. Extended sensitivity sweeps — vary one input at a time
    const PANEL_UNIT_COST = 900;
    const BATTERY_UNIT_COST = 600;
    const HYBRID_INVERTER_COST = 500;
    const baselineGross = (systemCostGross || 0);
    const extendedSensitivity = runExtendedSensitivity({
      monthlyProduction: yieldResult.monthlyKwh,
      baselineKwp: systemKwp,
      baselineNetCapex: netCapex,
      panelUnitCost: PANEL_UNIT_COST,
      batteryUnitCost: BATTERY_UNIT_COST,
      hybridInverterCost: HYBRID_INVERTER_COST,
      inverterType,
      hasBattery: !!hasBattery,
      batteryKwh,
      panelCount,
      grant,
      baseParams: {
        monthlyConsumption,
        importPricePerKwh,
        exportPricePerKwh,
        battery: batteryResult,
        loanTenorYears: tenorYears,
        evCharging: evResult,
        energyPriceEscalationPct,
        batteryRuntimeParams,
        profileCap,
        horizonYears: HORIZON_YEARS,
        inverterReplacementYear: INVERTER_REPLACEMENT_YEAR,
        inverterReplacementCost: INVERTER_REPLACEMENT_COST,
      },
      baseFinancing: {
        annualRatePct,
        tenorYears,
        loanCoveragePct,
        financingMode,
      },
    });
    void baselineGross;

    // 11. Year 1 totals
    const yr1 = cashflows[1];

    const results = {
      dataSource: yieldResult.dataSource,
      annualProductionKwh: yieldResult.annualKwh,
      monthlyProductionKwh: yieldResult.monthlyKwh,
      monthlyConsumptionKwh: monthlyConsumption,
      monthlySelfConsumedKwh: sc.selfConsumedKwh,
      monthlyGridImportKwh: sc.gridImportKwh,
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
      extendedSensitivity,
      monthlyExportKwh: sc.exportedKwh,
      horizonYears: HORIZON_YEARS,
      inverterReplacementYear: INVERTER_REPLACEMENT_YEAR,
      inverterReplacementCost: INVERTER_REPLACEMENT_COST,
      hourlySimulation: hourlySimResult,
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
