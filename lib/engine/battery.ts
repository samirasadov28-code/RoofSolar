export interface BatteryParams {
  batteryKwh: number;
  maxCyclePct: number;
  nightPricePerKwh: number;
  dayPricePerKwh: number;
  performArbitrage: boolean;
  exportedKwh: number[];
  gridImportKwh: number[];
}

export interface BatteryResult {
  batteryConsumptionKwh: number[];
  batteryPayment: number[];
  arbitrageProfit: number[];
}

const DAYS_IN_MONTH = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function calcBattery(params: BatteryParams): BatteryResult {
  const { batteryKwh, maxCyclePct, nightPricePerKwh, dayPricePerKwh, performArbitrage, gridImportKwh } = params;

  const batteryConsumptionKwh: number[] = [];
  const batteryPayment: number[] = [];
  const arbitrageProfit: number[] = [];

  for (let i = 0; i < 12; i++) {
    const days = DAYS_IN_MONTH[i];
    const usableCapacity = batteryKwh * maxCyclePct * (days / 30.4375);

    if (performArbitrage) {
      batteryConsumptionKwh.push(0);
      batteryPayment.push(0);
      arbitrageProfit.push(usableCapacity * (dayPricePerKwh - nightPricePerKwh) * days);
    } else {
      const consumed = Math.min(gridImportKwh[i], usableCapacity);
      batteryConsumptionKwh.push(consumed);
      batteryPayment.push(-consumed * nightPricePerKwh);
      arbitrageProfit.push(0);
    }
  }

  return { batteryConsumptionKwh, batteryPayment, arbitrageProfit };
}
