const RAW_WEIGHTS = [
  0.10124, // Jan
  0.10800, // Feb
  0.09789, // Mar
  0.08437, // Apr
  0.07426, // May
  0.07426, // Jun
  0.06750, // Jul
  0.06750, // Aug
  0.07751, // Sep
  0.08092, // Oct
  0.09789, // Nov
  0.10124, // Dec
];

// Normalize so they sum exactly to 1.0
const WEIGHT_SUM = RAW_WEIGHTS.reduce((a, b) => a + b, 0);
const SEASONAL_WEIGHTS = RAW_WEIGHTS.map((w) => w / WEIGHT_SUM);

export function distributeConsumption(annualKwh: number): number[] {
  return SEASONAL_WEIGHTS.map((w) => annualKwh * w);
}
