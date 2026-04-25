export interface SelfConsumptionResult {
  selfConsumedKwh: number[];
  exportedKwh: number[];
  gridImportKwh: number[];
}

export function calcSelfConsumption(
  monthlyProduction: number[],
  monthlyConsumption: number[]
): SelfConsumptionResult {
  const selfConsumedKwh: number[] = [];
  const exportedKwh: number[] = [];
  const gridImportKwh: number[] = [];

  for (let i = 0; i < 12; i++) {
    const prod = monthlyProduction[i];
    const cons = monthlyConsumption[i];
    const net = prod - cons;
    if (net >= 0) {
      selfConsumedKwh.push(cons);
      exportedKwh.push(net);
      gridImportKwh.push(0);
    } else {
      selfConsumedKwh.push(prod);
      exportedKwh.push(0);
      gridImportKwh.push(Math.abs(net));
    }
  }

  return { selfConsumedKwh, exportedKwh, gridImportKwh };
}
