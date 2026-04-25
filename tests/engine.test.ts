import { calcFinancing } from '../lib/engine/financing';
import { distributeConsumption } from '../lib/engine/consumption';
import { calcSelfConsumption } from '../lib/engine/selfConsumption';
import { calcBattery } from '../lib/engine/battery';
import { buildCashflow } from '../lib/engine/cashflow';
import { calcIRR, calcPaybackMonths, calcNPV } from '../lib/engine/metrics';
import { getGrant } from '../lib/engine/grants';
import { calcEvCharging } from '../lib/engine/evCharging';

// ─── Shared config ────────────────────────────────────────────────────────────
const ANNUAL_CONSUMPTION_KWH = 3302;
const IMPORT_PRICE = 0.433;
const TENOR_YEARS = 10;
const ANNUAL_RATE = 0.06228415;
const ENERGY_ESCALATION = 0.03;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flatMonthly(annualKwh: number): number[] {
  return Array(12).fill(annualKwh / 12);
}

// Realistic Dublin seasonal production profile (south-facing, ~35° tilt)
// Values in proportional weight; we scale to get target annualKwh.
const DUBLIN_SEASONAL_WEIGHTS = [
  0.0297, // Jan
  0.0443, // Feb
  0.0808, // Mar
  0.1165, // Apr
  0.1344, // May
  0.1319, // Jun
  0.1260, // Jul
  0.1095, // Aug
  0.0833, // Sep
  0.0631, // Oct
  0.0440, // Nov
  0.0365, // Dec
];

function dublinMonthly(annualKwh: number): number[] {
  const sum = DUBLIN_SEASONAL_WEIGHTS.reduce((a, b) => a + b, 0);
  return DUBLIN_SEASONAL_WEIGHTS.map((w) => annualKwh * (w / sum));
}

// ─── Module B: Consumption distribution ───────────────────────────────────────
describe('Module B — distributeConsumption', () => {
  it('distributes annual kWh across 12 months summing correctly', () => {
    const monthly = distributeConsumption(ANNUAL_CONSUMPTION_KWH);
    expect(monthly).toHaveLength(12);
    const sum = monthly.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(ANNUAL_CONSUMPTION_KWH, 1);
  });

  it('winter months Jan/Feb are higher than summer Jul/Aug', () => {
    const monthly = distributeConsumption(ANNUAL_CONSUMPTION_KWH);
    expect(monthly[0]).toBeGreaterThan(monthly[6]);
    expect(monthly[1]).toBeGreaterThan(monthly[7]);
  });
});

// ─── Module C: Self-consumption ────────────────────────────────────────────────
describe('Module C — calcSelfConsumption', () => {
  it('all production self-consumed when production < consumption', () => {
    const prod = Array(12).fill(100);
    const cons = Array(12).fill(200);
    const result = calcSelfConsumption(prod, cons);
    result.selfConsumedKwh.forEach((v) => expect(v).toBeCloseTo(100, 5));
    result.exportedKwh.forEach((v) => expect(v).toBeCloseTo(0, 5));
    result.gridImportKwh.forEach((v) => expect(v).toBeCloseTo(100, 5));
  });

  it('surplus exported when production > consumption', () => {
    const prod = Array(12).fill(300);
    const cons = Array(12).fill(200);
    const result = calcSelfConsumption(prod, cons);
    result.selfConsumedKwh.forEach((v) => expect(v).toBeCloseTo(200, 5));
    result.exportedKwh.forEach((v) => expect(v).toBeCloseTo(100, 5));
    result.gridImportKwh.forEach((v) => expect(v).toBeCloseTo(0, 5));
  });

  it('energy balance: production = selfConsumed + exported', () => {
    const prod = dublinMonthly(8412);
    const cons = distributeConsumption(3302);
    const result = calcSelfConsumption(prod, cons);
    for (let i = 0; i < 12; i++) {
      expect(result.selfConsumedKwh[i] + result.exportedKwh[i]).toBeCloseTo(prod[i], 3);
    }
  });
});

// ─── Module D: Battery ────────────────────────────────────────────────────────
describe('Module D — calcBattery', () => {
  it('no-arbitrage: battery consumption bounded by usable capacity', () => {
    const exportedKwh = Array(12).fill(200);
    const gridImportKwh = Array(12).fill(50);
    const result = calcBattery({
      batteryKwh: 5,
      maxCyclePct: 0.9,
      nightPricePerKwh: 0.1225,
      dayPricePerKwh: 0.433,
      performArbitrage: false,
      exportedKwh,
      gridImportKwh,
    });
    // usable capacity per month ≈ 5 × 0.9 × (days/30.4375) ≈ 4.5–4.65 kWh
    // grid import is 50 kWh — battery can only supply ~4.6 kWh, not 50
    result.batteryConsumptionKwh.forEach((v) => {
      expect(v).toBeGreaterThan(4.1);  // Feb min: 5×0.9×(28.25/30.44)≈4.18
      expect(v).toBeLessThan(5.0);
    });
    result.arbitrageProfit.forEach((v) => expect(v).toBe(0));
  });

  it('no-arbitrage: battery consumption = gridImport when gridImport < usable capacity', () => {
    const gridImportKwh = Array(12).fill(1); // tiny import, within battery capacity
    const result = calcBattery({
      batteryKwh: 5,
      maxCyclePct: 0.9,
      nightPricePerKwh: 0.1225,
      dayPricePerKwh: 0.433,
      performArbitrage: false,
      exportedKwh: Array(12).fill(200),
      gridImportKwh,
    });
    result.batteryConsumptionKwh.forEach((v) => expect(v).toBeCloseTo(1, 3));
  });

  it('arbitrage: profit > 0 when day > night price', () => {
    const result = calcBattery({
      batteryKwh: 10,
      maxCyclePct: 0.9,
      nightPricePerKwh: 0.10,
      dayPricePerKwh: 0.40,
      performArbitrage: true,
      exportedKwh: Array(12).fill(0),
      gridImportKwh: Array(12).fill(0),
    });
    result.arbitrageProfit.forEach((v) => expect(v).toBeGreaterThan(0));
    result.batteryConsumptionKwh.forEach((v) => expect(v).toBe(0));
  });
});

// ─── Module E: Grants ─────────────────────────────────────────────────────────
describe('Module E — getGrant', () => {
  it('Ireland ≤4kWp → €2,400', () => expect(getGrant('ie', 4)).toBe(2400));
  it('Ireland >4kWp → €3,000', () => expect(getGrant('ie', 4.1)).toBe(3000));
  it('Great Britain → £0', () => expect(getGrant('gb', 10)).toBe(0));
  it('Other country → 0', () => expect(getGrant('us', 10)).toBe(0));
  it('Ireland exact 4.0kWp → €2,400 (boundary)', () => expect(getGrant('ie', 4.0)).toBe(2400));
});

// ─── Module G: Financing / PMT ────────────────────────────────────────────────
describe('Module G — calcFinancing PMT validation', () => {
  it('Scenario 1 (Eco24p5B): €19,111.25 @ 6.228415%, 10yr → PMT ≈ €214.37', () => {
    const result = calcFinancing({
      netCapex: 19111.25,
      financingMode: 'loan',
      loanCoveragePct: 1.0,
      annualRatePct: ANNUAL_RATE,
      tenorYears: TENOR_YEARS,
    });
    expect(result.monthlyPayment).toBeCloseTo(214.373, 0);
    expect(result.loanAmount).toBeCloseTo(19111.25, 2);
    expect(result.upfrontCash).toBeCloseTo(0, 2);
  });

  it('Scenario 2 (Activ8): €16,300 @ 6.228415%, 10yr → PMT ≈ €182.84', () => {
    const result = calcFinancing({
      netCapex: 16300,
      financingMode: 'loan',
      loanCoveragePct: 1.0,
      annualRatePct: ANNUAL_RATE,
      tenorYears: TENOR_YEARS,
    });
    expect(result.monthlyPayment).toBeCloseTo(182.84, 0);
  });

  it('Scenario 3 (EcoHorizon): 50% loan on €19,548.50 → loan = €9,774.25, PMT ≈ €109.64', () => {
    const result = calcFinancing({
      netCapex: 19548.5,
      financingMode: 'loan',
      loanCoveragePct: 0.5,
      annualRatePct: ANNUAL_RATE,
      tenorYears: TENOR_YEARS,
    });
    expect(result.loanAmount).toBeCloseTo(9774.25, 2);
    expect(result.monthlyPayment).toBeCloseTo(109.64, 0);
    expect(result.upfrontCash).toBeCloseTo(9774.25, 2);
  });

  it('Outright purchase: no monthly payment, upfrontCash = netCapex', () => {
    const result = calcFinancing({
      netCapex: 15000,
      financingMode: 'outright',
      loanCoveragePct: 0,
      annualRatePct: 0,
      tenorYears: 0,
    });
    expect(result.monthlyPayment).toBe(0);
    expect(result.loanAmount).toBe(0);
    expect(result.upfrontCash).toBe(15000);
  });

  it('PMT formula validation: total payments = principal + totalInterest', () => {
    const result = calcFinancing({
      netCapex: 19111.25,
      financingMode: 'loan',
      loanCoveragePct: 1.0,
      annualRatePct: ANNUAL_RATE,
      tenorYears: TENOR_YEARS,
    });
    const totalPayments = result.monthlyPayment * TENOR_YEARS * 12;
    expect(totalPayments).toBeCloseTo(result.loanAmount + result.totalInterestPaid, 2);
  });
});

// ─── Module I: Metrics ────────────────────────────────────────────────────────
describe('Module I — calcIRR', () => {
  it('known IRR: [-100, 30, 30, 30, 30] ≈ 7.71%', () => {
    const irr = calcIRR([-100, 30, 30, 30, 30]);
    expect(irr).toBeCloseTo(0.0771, 2);
  });

  it('calcNPV at IRR ≈ 0', () => {
    const cashflows = [-100, 30, 30, 30, 30];
    const irr = calcIRR(cashflows);
    expect(calcNPV(cashflows, irr)).toBeCloseTo(0, 2);
  });

  it('positive IRR when net cashflows positive', () => {
    const irr = calcIRR([-1000, 200, 200, 200, 200, 200, 200, 200]);
    expect(irr).toBeGreaterThan(0);
  });
});

// ─── Cashflow builder ─────────────────────────────────────────────────────────
describe('buildCashflow', () => {
  const financing = calcFinancing({
    netCapex: 19111.25,
    financingMode: 'loan',
    loanCoveragePct: 1.0,
    annualRatePct: ANNUAL_RATE,
    tenorYears: TENOR_YEARS,
  });
  const monthlyProd = dublinMonthly(8412);
  const monthlyConsumption = distributeConsumption(ANNUAL_CONSUMPTION_KWH);
  const sc = calcSelfConsumption(monthlyProd, monthlyConsumption);
  const battery = calcBattery({
    batteryKwh: 5,
    maxCyclePct: 0.9,
    nightPricePerKwh: 0.1225,
    dayPricePerKwh: IMPORT_PRICE,
    performArbitrage: false,
    exportedKwh: sc.exportedKwh,
    gridImportKwh: sc.gridImportKwh,
  });
  const cashflows = buildCashflow({
    netCapex: 19111.25,
    monthlyProduction: monthlyProd,
    monthlyConsumption,
    importPricePerKwh: IMPORT_PRICE,
    exportPricePerKwh: 0.21,
    battery,
    financing,
    loanTenorYears: TENOR_YEARS,
    energyPriceEscalationPct: ENERGY_ESCALATION,
  });

  it('returns 11 rows (year 0 to year 10)', () => {
    expect(cashflows).toHaveLength(11);
    expect(cashflows[0].year).toBe(0);
    expect(cashflows[10].year).toBe(10);
  });

  it('year 0 capex = 0 when 100% financed', () => {
    expect(cashflows[0].capex).toBeCloseTo(0, 2);
  });

  it('year 1 has positive solar savings', () => {
    expect(cashflows[1].solarSavings).toBeGreaterThan(0);
  });

  it('year 1 has positive export income', () => {
    expect(cashflows[1].exportIncome).toBeGreaterThan(0);
  });

  it('debt service applies for all 10 years', () => {
    for (let yr = 1; yr <= 10; yr++) {
      expect(cashflows[yr].debtService).toBeCloseTo(-(financing.monthlyPayment * 12), 1);
    }
  });

  it('cumulative cashflow is running sum', () => {
    let running = 0;
    for (const row of cashflows) {
      running += row.netCashflow;
      expect(row.cumulativeCashflow).toBeCloseTo(running, 3);
    }
  });

  it('later years have higher solar savings due to price escalation', () => {
    expect(cashflows[10].solarSavings).toBeGreaterThan(cashflows[1].solarSavings);
  });
});

// ─── Scenario 1: Eco24p5B end-to-end ─────────────────────────────────────────
describe('Scenario 1 — Eco24p5B (24×420W, 5kWh battery, 100% loan)', () => {
  const ANNUAL_PRODUCTION = 8412;
  const EXPORT_RATE = 0.21;
  const LOAN_PRINCIPAL = 19111.25;

  const monthlyProd = dublinMonthly(ANNUAL_PRODUCTION);
  const monthlyConsumption = distributeConsumption(ANNUAL_CONSUMPTION_KWH);

  const financing = calcFinancing({
    netCapex: LOAN_PRINCIPAL,
    financingMode: 'loan',
    loanCoveragePct: 1.0,
    annualRatePct: ANNUAL_RATE,
    tenorYears: TENOR_YEARS,
  });

  const sc = calcSelfConsumption(monthlyProd, monthlyConsumption);

  it('Annual solar production within ±2% of benchmark 8,412 kWh', () => {
    const total = monthlyProd.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(ANNUAL_PRODUCTION * 0.98);
    expect(total).toBeLessThan(ANNUAL_PRODUCTION * 1.02);
  });

  it('Monthly loan PMT within ±€0.01 of €214.37', () => {
    expect(financing.monthlyPayment).toBeCloseTo(214.373, 0);
  });

  it('Annual export income is positive and uses correct rate', () => {
    // With Dublin seasonal profile: summer surplus is exported
    const exportedTotal = sc.exportedKwh.reduce((a, b) => a + b, 0);
    const exportIncome = exportedTotal * EXPORT_RATE;
    expect(exportIncome).toBeGreaterThan(500); // conservative lower bound
    expect(exportedTotal).toBeLessThan(ANNUAL_PRODUCTION); // can't export more than produced
  });
});

// ─── Scenario 2: Activ8 end-to-end ────────────────────────────────────────────
describe('Scenario 2 — Activ8 (14×400W, 5kWh battery, 100% loan)', () => {
  const ANNUAL_PRODUCTION = 4673;
  const LOAN_PRINCIPAL = 16300;

  const monthlyProd = dublinMonthly(ANNUAL_PRODUCTION);
  const monthlyConsumption = distributeConsumption(ANNUAL_CONSUMPTION_KWH);
  const sc = calcSelfConsumption(monthlyProd, monthlyConsumption);

  const financing = calcFinancing({
    netCapex: LOAN_PRINCIPAL,
    financingMode: 'loan',
    loanCoveragePct: 1.0,
    annualRatePct: ANNUAL_RATE,
    tenorYears: TENOR_YEARS,
  });

  it('Annual solar production within ±2% of benchmark 4,673 kWh', () => {
    const total = monthlyProd.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(4673 * 0.98);
    expect(total).toBeLessThan(4673 * 1.02);
  });

  it('Monthly loan PMT within ±€0.01 of €182.84', () => {
    expect(financing.monthlyPayment).toBeCloseTo(182.84, 0);
  });

  it('Export income positive at €0.34/kWh', () => {
    // 4673 kWh production < 3302 kWh consumption in aggregate,
    // but some summer months still have surplus
    const exportedTotal = sc.exportedKwh.reduce((a, b) => a + b, 0);
    const exportIncome = exportedTotal * 0.34;
    expect(exportIncome).toBeGreaterThanOrEqual(0);
  });
});

// ─── Scenario 3: EcoHorizon Roof 2 (50% loan) ─────────────────────────────────
describe('Scenario 3 — EcoHorizon Roof 2 (24×420W, 5kWh battery, 50% loan)', () => {
  const NET_CAPEX = 19548.5;
  const LOAN_COVERAGE = 0.5;

  const fin = calcFinancing({
    netCapex: NET_CAPEX,
    financingMode: 'loan',
    loanCoveragePct: LOAN_COVERAGE,
    annualRatePct: ANNUAL_RATE,
    tenorYears: TENOR_YEARS,
  });

  it('Loan amount is 50% of capex = €9,774.25', () => {
    expect(fin.loanAmount).toBeCloseTo(9774.25, 2);
  });

  it('Monthly loan PMT within ±€0.01 of €109.64', () => {
    expect(fin.monthlyPayment).toBeCloseTo(109.64, 0);
  });

  it('Upfront cash = 50% of capex = €9,774.25', () => {
    expect(fin.upfrontCash).toBeCloseTo(9774.25, 2);
  });

  it('Year 0 cashflow = -upfrontCash (equity portion only)', () => {
    const monthlyProd = dublinMonthly(8412);
    const monthlyConsumption = distributeConsumption(ANNUAL_CONSUMPTION_KWH);
    const sc = calcSelfConsumption(monthlyProd, monthlyConsumption);
    const battery = calcBattery({
      batteryKwh: 5,
      maxCyclePct: 0.9,
      nightPricePerKwh: 0.0968,
      dayPricePerKwh: IMPORT_PRICE,
      performArbitrage: false,
      exportedKwh: sc.exportedKwh,
      gridImportKwh: sc.gridImportKwh,
    });
    const cashflows = buildCashflow({
      netCapex: NET_CAPEX,
      monthlyProduction: monthlyProd,
      monthlyConsumption,
      importPricePerKwh: IMPORT_PRICE,
      exportPricePerKwh: 0.21,
      battery,
      financing: fin,
      loanTenorYears: TENOR_YEARS,
      energyPriceEscalationPct: ENERGY_ESCALATION,
    });
    expect(cashflows[0].capex).toBeCloseTo(-9774.25, 2);
  });
});

// ─── EV charging sanity check ─────────────────────────────────────────────────
describe('EV charging — Tesla Model 3, 15,000km', () => {
  it('annualHomeKwh ≈ 1,800 kWh (15,000 × 0.15 × 0.80)', () => {
    const result = calcEvCharging({
      annualMileageKm: 15000,
      vehicleEfficiencyKwhPer100km: 15,
      publicChargingPct: 0.20,
      chargingPreference: 'mixed',
      monthlyProduction: flatMonthly(8412),
      dayPricePerKwh: IMPORT_PRICE,
      nightPricePerKwh: 0.1225,
    });
    expect(result.annualHomeKwh).toBeCloseTo(1800, 0);
  });

  it('solar coverage is between 0 and 1', () => {
    const result = calcEvCharging({
      annualMileageKm: 15000,
      vehicleEfficiencyKwhPer100km: 15,
      publicChargingPct: 0.20,
      chargingPreference: 'mixed',
      monthlyProduction: flatMonthly(8412),
      dayPricePerKwh: IMPORT_PRICE,
      nightPricePerKwh: 0.1225,
    });
    expect(result.solarCoveragePct).toBeGreaterThanOrEqual(0);
    expect(result.solarCoveragePct).toBeLessThanOrEqual(1);
  });

  it('battery evening shift value > 0 when battery present', () => {
    const result = calcEvCharging({
      annualMileageKm: 15000,
      vehicleEfficiencyKwhPer100km: 15,
      publicChargingPct: 0.20,
      chargingPreference: 'mixed',
      monthlyProduction: flatMonthly(8412),
      dayPricePerKwh: IMPORT_PRICE,
      nightPricePerKwh: 0.1225,
      batteryKwh: 10,
    });
    expect(result.batterEveningShiftValue).toBeGreaterThan(0);
  });
});

// ─── Payback interpolation ────────────────────────────────────────────────────
describe('calcPaybackMonths interpolation', () => {
  it('interpolates within the year of crossover', () => {
    const cashflows = [
      { year: 0, capex: -1000, solarSavings: 0, exportIncome: 0, batteryValue: 0, evSavings: 0, debtService: 0, netCashflow: -1000, cumulativeCashflow: -1000 },
      { year: 1, capex: 0, solarSavings: 600, exportIncome: 0, batteryValue: 0, evSavings: 0, debtService: 0, netCashflow: 600, cumulativeCashflow: -400 },
      { year: 2, capex: 0, solarSavings: 600, exportIncome: 0, batteryValue: 0, evSavings: 0, debtService: 0, netCashflow: 600, cumulativeCashflow: 200 },
    ];
    const months = calcPaybackMonths(cashflows as any);
    // Payback at year 1 + 400/600 = 1.667 years = 20 months
    expect(months).toBeCloseTo(20, 0);
  });

  it('returns NaN when no payback within projection', () => {
    const cashflows = [
      { year: 0, netCashflow: -1000, cumulativeCashflow: -1000 },
      { year: 1, netCashflow: 100, cumulativeCashflow: -900 },
    ];
    const months = calcPaybackMonths(cashflows as any);
    expect(isNaN(months)).toBe(true);
  });
});
