import type { AnnualCashflow } from './cashflow';

export function calcIRR(cashflows: number[]): number {
  if (cashflows.length < 2) return NaN;

  let rate = 0.1; // 10% initial guess

  for (let iter = 0; iter < 100; iter++) {
    let npv = 0;
    let dnpv = 0;

    for (let t = 0; t < cashflows.length; t++) {
      const disc = Math.pow(1 + rate, t);
      npv += cashflows[t] / disc;
      dnpv -= (t * cashflows[t]) / (disc * (1 + rate));
    }

    if (Math.abs(dnpv) < 1e-12) break;

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < 1e-10) return newRate;
    rate = newRate;
  }

  return isFinite(rate) ? rate : NaN;
}

export function calcNPV(cashflows: number[], discountRate: number): number {
  return cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + discountRate, t), 0);
}

export function calcPaybackMonths(annualCashflows: AnnualCashflow[]): number {
  for (let i = 1; i < annualCashflows.length; i++) {
    const curr = annualCashflows[i];
    const prev = annualCashflows[i - 1];
    if (curr.cumulativeCashflow >= 0) {
      // Interpolate
      const fraction = -prev.cumulativeCashflow / curr.netCashflow;
      const paybackYears = (i - 1) + fraction;
      return paybackYears * 12;
    }
  }
  return NaN;
}

export function calcLifetimeSavings(annualCashflows: AnnualCashflow[]): number {
  return annualCashflows
    .filter((r) => r.year > 0)
    .reduce(
      (acc, r) => acc + r.solarSavings + r.exportIncome + r.batteryValue + r.evSavings,
      0
    );
}
