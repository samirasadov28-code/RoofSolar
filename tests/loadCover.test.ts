import { BATTERY_EFFICIENCY, monthlyEnergyBalance, runHourlySimulator, loadShapeFor } from '@/lib/engine/hourlySimulator';
import { distributeConsumption } from '@/lib/engine/consumption';

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const cons = distributeConsumption(4200);

describe('single energy balance', () => {
  test('conserves energy: production = self-consumed + exported, use = self-consumed + import', () => {
    const prod = cons.map((c) => c * 1.5);
    const b = monthlyEnergyBalance(prod, cons, 0, 'mixed');
    expect(sum(b.selfConsumedKwh) + sum(b.exportedKwh)).toBeCloseTo(sum(prod), 3);
    expect(sum(b.selfConsumedKwh) + sum(b.gridImportKwh)).toBeCloseTo(sum(cons), 3);
  });

  test('matches the hourly simulator exactly', () => {
    const prod = cons.map((c) => c * 2.5);
    const b = monthlyEnergyBalance(prod, cons, 5, 'mixed');
    const sim = runHourlySimulator({
      monthlyProductionKwh: prod, monthlyConsumptionKwh: cons, batteryKwh: 5,
      importPricePerKwh: 0.3, exportPricePerKwh: 0.1, nightPricePerKwh: 0.3, performArbitrage: false,
    });
    const days = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    expect(sum(b.selfConsumedKwh)).toBeCloseTo(sum(sim.months.map((m, i) => m.dailySelfConsumedKwh * days[i])), 6);
  });

  test('oversizing cannot push self-consumption past household use', () => {
    const b = monthlyEnergyBalance(cons.map((c) => c * 6), cons, 0, 'mixed');
    expect(sum(b.selfConsumedKwh)).toBeLessThan(sum(cons) * 0.8);
  });

  test('battery raises self-consumption; daytime profile beats evening', () => {
    const prod = cons.map((c) => c * 1.5);
    expect(sum(monthlyEnergyBalance(prod, cons, 5, 'mixed').selfConsumedKwh))
      .toBeGreaterThan(sum(monthlyEnergyBalance(prod, cons, 0, 'mixed').selfConsumedKwh));
    expect(sum(monthlyEnergyBalance(prod, cons, 0, 'daytime').selfConsumedKwh))
      .toBeGreaterThan(sum(monthlyEnergyBalance(prod, cons, 0, 'evening').selfConsumedKwh));
  });

  test('load shapes sum to 1', () => {
    (['daytime', 'mixed', 'evening'] as const).forEach((p) => expect(sum(loadShapeFor(p))).toBeCloseTo(1, 9));
  });
});

describe('battery energy conservation', () => {
  test('only the battery conversion loss separates production from use plus export', () => {
    const prod = cons.map((c) => c * 1.5);
    const b = monthlyEnergyBalance(prod, cons, 5, 'mixed');
    const noBat = monthlyEnergyBalance(prod, cons, 0, 'mixed');
    const shifted = sum(b.selfConsumedKwh) - sum(noBat.selfConsumedKwh); // delivered from battery
    const loss = sum(prod) - sum(b.selfConsumedKwh) - sum(b.exportedKwh);
    expect(loss).toBeGreaterThan(0);
    expect(loss / (shifted / BATTERY_EFFICIENCY)).toBeCloseTo(1 - BATTERY_EFFICIENCY, 1);
    expect(sum(b.selfConsumedKwh) + sum(b.gridImportKwh)).toBeCloseTo(sum(cons), 0);
  });
});
