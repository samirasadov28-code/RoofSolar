import type { CashflowParams } from './cashflow';
import { buildCashflow } from './cashflow';
import { calcIRR, calcPaybackMonths } from './metrics';

export interface SensitivityCell {
  energyPriceScenario: 'bear' | 'base' | 'bull';
  exportTariffScenario: 'low' | 'base' | 'high';
  paybackYears: number;
  irr: number;
}

export interface SensitivityResult {
  grid: SensitivityCell[];
}

const ENERGY_PRICE_MULTIPLIERS: Record<string, number> = {
  bear: 0.80,
  base: 1.00,
  bull: 1.30,
};

const EXPORT_TARIFF_MULTIPLIERS: Record<string, number> = {
  low: 0.70,
  base: 1.00,
  high: 1.50,
};

export function runSensitivity(baseParams: CashflowParams): SensitivityResult {
  const grid: SensitivityCell[] = [];

  const energyScenarios = ['bear', 'base', 'bull'] as const;
  const exportScenarios = ['low', 'base', 'high'] as const;

  for (const energyScenario of energyScenarios) {
    for (const exportScenario of exportScenarios) {
      const scenarioParams: CashflowParams = {
        ...baseParams,
        importPricePerKwh: baseParams.importPricePerKwh * ENERGY_PRICE_MULTIPLIERS[energyScenario],
        exportPricePerKwh: baseParams.exportPricePerKwh * EXPORT_TARIFF_MULTIPLIERS[exportScenario],
      };

      const cashflows = buildCashflow(scenarioParams);
      const cfValues = cashflows.map((r) => r.netCashflow);
      cfValues[0] = cashflows[0].capex;

      const paybackMonths = calcPaybackMonths(cashflows);
      const irr = calcIRR(cfValues);

      grid.push({
        energyPriceScenario: energyScenario,
        exportTariffScenario: exportScenario,
        paybackYears: isNaN(paybackMonths) ? NaN : paybackMonths / 12,
        irr,
      });
    }
  }

  return { grid };
}
