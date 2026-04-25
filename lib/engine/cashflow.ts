import type { BatteryResult } from './battery';
import { calcBattery } from './battery';
import type { FinancingResult } from './financing';
import type { EvChargingResult } from './evCharging';
import { calcSelfConsumption } from './selfConsumption';
import { applyDegradation } from './solarYield';

export interface BatteryRuntimeParams {
  nightPricePerKwh: number;
  dayPricePerKwh: number;
  batteryKwh: number;
  maxCyclePct: number;
  performArbitrage: boolean;
}

export interface CashflowParams {
  netCapex: number;
  monthlyProduction: number[];
  monthlyConsumption: number[];
  importPricePerKwh: number;
  exportPricePerKwh: number;
  battery: BatteryResult;
  financing: FinancingResult;
  loanTenorYears: number;
  evCharging?: EvChargingResult;
  energyPriceEscalationPct: number;
  batteryRuntimeParams?: BatteryRuntimeParams;
}

export interface AnnualCashflow {
  year: number;
  capex: number;
  solarSavings: number;
  exportIncome: number;
  batteryValue: number;
  evSavings: number;
  debtService: number;
  netCashflow: number;
  cumulativeCashflow: number;
}

export function buildCashflow(params: CashflowParams): AnnualCashflow[] {
  const {
    netCapex,
    monthlyProduction,
    monthlyConsumption,
    importPricePerKwh,
    exportPricePerKwh,
    battery,
    financing,
    loanTenorYears,
    evCharging,
    energyPriceEscalationPct,
    batteryRuntimeParams,
  } = params;

  const rows: AnnualCashflow[] = [];
  let cumulative = 0;

  // Year 0: upfront equity only
  const year0Capex = -(netCapex - financing.loanAmount);
  cumulative += year0Capex;
  rows.push({
    year: 0,
    capex: year0Capex,
    solarSavings: 0,
    exportIncome: 0,
    batteryValue: 0,
    evSavings: 0,
    debtService: 0,
    netCashflow: year0Capex,
    cumulativeCashflow: cumulative,
  });

  for (let yr = 1; yr <= 10; yr++) {
    const priceScale = Math.pow(1 + energyPriceEscalationPct, yr - 1);
    const importPrice = importPricePerKwh * priceScale;
    const exportPrice = exportPricePerKwh * priceScale;

    const degradedProduction = applyDegradation(monthlyProduction, yr);
    const sc = calcSelfConsumption(degradedProduction, monthlyConsumption);

    const solarSavings = sc.selfConsumedKwh.reduce((a, b) => a + b, 0) * importPrice;
    const exportIncome = sc.exportedKwh.reduce((a, b) => a + b, 0) * exportPrice;

    let batteryValue = 0;
    if (batteryRuntimeParams && batteryRuntimeParams.batteryKwh > 0) {
      const nightPrice = batteryRuntimeParams.nightPricePerKwh * priceScale;
      const bResult = calcBattery({
        ...batteryRuntimeParams,
        nightPricePerKwh: nightPrice,
        dayPricePerKwh: batteryRuntimeParams.dayPricePerKwh * priceScale,
        exportedKwh: sc.exportedKwh,
        gridImportKwh: sc.gridImportKwh,
      });
      batteryValue =
        bResult.batteryConsumptionKwh.reduce((a, b) => a + b, 0) * (importPrice - nightPrice) +
        bResult.arbitrageProfit.reduce((a, b) => a + b, 0);
    } else {
      // Use pre-computed year-1 battery result scaled by price
      batteryValue =
        battery.batteryConsumptionKwh.reduce((a, b) => a + b, 0) * importPrice +
        battery.arbitrageProfit.reduce((a, b) => a + b, 0) * priceScale;
    }

    const evSavings = evCharging ? evCharging.annualSavingVsGrid * priceScale : 0;

    // Debt service applies for the loan tenor years only
    const debtService = yr <= loanTenorYears && financing.loanAmount > 0
      ? -(financing.monthlyPayment * 12)
      : 0;

    const netCashflow = solarSavings + exportIncome + batteryValue + evSavings + debtService;
    cumulative += netCashflow;

    rows.push({
      year: yr,
      capex: 0,
      solarSavings,
      exportIncome,
      batteryValue,
      evSavings,
      debtService,
      netCashflow,
      cumulativeCashflow: cumulative,
    });
  }

  return rows;
}
