export interface SelfConsumptionResult {
  selfConsumedKwh: number[];
  exportedKwh: number[];
  gridImportKwh: number[];
}

/**
 * `profileCap` represents the share of monthly solar production that can
 * realistically be soaked up by household demand given when appliances run:
 *
 *   - daytime-heavy load:       ~0.65
 *   - mixed (typical):          ~0.45
 *   - evening-heavy load:       ~0.25
 *   - 1.0 (default):            naive monthly balance (ignores time-of-day)
 *
 * Default of 1.0 keeps the engine backward-compatible with existing tests.
 */
export function calcSelfConsumption(
  monthlyProduction: number[],
  monthlyConsumption: number[],
  profileCap: number = 1.0
): SelfConsumptionResult {
  const selfConsumedKwh: number[] = [];
  const exportedKwh: number[] = [];
  const gridImportKwh: number[] = [];

  for (let i = 0; i < 12; i++) {
    const prod = monthlyProduction[i];
    const cons = monthlyConsumption[i];
    // Three independent ceilings on monthly self-consumption:
    //   • can't self-consume more than was produced
    //   • can't self-consume more than was used
    //   • can't self-consume more than the time-of-day overlap allows
    const self = Math.min(prod, cons, prod * profileCap);
    selfConsumedKwh.push(self);
    exportedKwh.push(prod - self);
    gridImportKwh.push(Math.max(0, cons - self));
  }

  return { selfConsumedKwh, exportedKwh, gridImportKwh };
}

export function profileCapFor(profile: 'daytime' | 'mixed' | 'evening' | undefined): number {
  switch (profile) {
    case 'daytime': return 0.65;
    case 'evening': return 0.25;
    case 'mixed':   return 0.45;
    default:        return 1.0;
  }
}
