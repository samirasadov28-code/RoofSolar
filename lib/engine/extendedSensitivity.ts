/**
 * Multi-dimensional sensitivity sweeps used by the Pro stress-test
 * dashboard.
 *
 * Every sweep takes a "baseline" run as input (the user's actual scenario)
 * and varies one input at a time, recomputing payback / IRR / NPV /
 * lifetime savings for each variant. We deliberately keep these cheap:
 *  • PVGIS yield is scaled linearly with kWp rather than re-fetched.
 *  • Engine reuses the baseline monthly consumption and battery params.
 */

import type { AnnualCashflow, CashflowParams } from './cashflow';
import { buildCashflow } from './cashflow';
import { calcFinancing } from './financing';
import { calcIRR, calcNPV, calcPaybackMonths, calcLifetimeSavings } from './metrics';

export interface SweepPoint {
  /** The variable parameter for this point (panels / kWh / % / etc). */
  variable: number;
  /** Whether this point is the user's actual scenario. */
  isBaseline: boolean;
  paybackYears: number | null;
  irr: number | null;
  npv: number;
  lifetimeSavings: number;
  netCapex: number;
}

export interface BaselineContext {
  monthlyProduction: number[];   // baseline yield
  baselineKwp: number;
  baselineNetCapex: number;
  panelUnitCost: number;         // cost per panel (auto-estimate)
  batteryUnitCost: number;       // cost per kWh of battery
  hybridInverterCost: number;    // delta vs standard
  inverterType: 'standard' | 'hybrid';
  hasBattery: boolean;
  batteryKwh: number;
  panelCount: number;
  grant: number;                 // applies the same across sweeps for fairness
  baseParams: Omit<CashflowParams, 'netCapex' | 'monthlyProduction' | 'financing'>;
  baseFinancing: {
    annualRatePct: number;
    tenorYears: number;
    loanCoveragePct: number;
    financingMode: 'outright' | 'loan' | 'mortgage';
  };
}

function evaluate(params: CashflowParams): { cashflows: AnnualCashflow[]; payback: number | null; irr: number | null; npv: number; lifetime: number; } {
  const cashflows = buildCashflow(params);
  const cf = cashflows.map((r) => r.netCashflow);
  const months = calcPaybackMonths(cashflows);
  const payback = isNaN(months) ? null : months / 12;

  // IRR is undefined when there's no upfront equity — return null in that
  // case so the chart can show a gap.
  const upfront = params.financing?.upfrontCash ?? 0;
  let irr: number | null = null;
  if (upfront > 1) {
    const raw = calcIRR(cf);
    irr = Number.isFinite(raw) ? raw : null;
  }

  return {
    cashflows,
    payback,
    irr,
    npv: calcNPV(cf, 0.08),
    lifetime: calcLifetimeSavings(cashflows),
  };
}

function scaleProduction(monthly: number[], baselineKwp: number, newKwp: number): number[] {
  if (baselineKwp <= 0) return monthly;
  const factor = newKwp / baselineKwp;
  return monthly.map((m) => m * factor);
}

function netCapexFor(panelCount: number, hasBattery: boolean, batteryKwh: number, ctx: BaselineContext): number {
  const gross =
    panelCount * ctx.panelUnitCost
    + (hasBattery ? batteryKwh * ctx.batteryUnitCost : 0)
    + (ctx.inverterType === 'hybrid' ? ctx.hybridInverterCost : 0);
  return Math.max(0, gross - ctx.grant);
}

/** Sweep across panel counts (scaled yield + cost). */
export function sweepSystemSize(ctx: BaselineContext): SweepPoint[] {
  const sizes = [4, 8, 12, 16, 20, 24, 30];
  return sizes.map((panels) => {
    const kwp = panels * 0.4;
    const netCapex = netCapexFor(panels, ctx.hasBattery, ctx.batteryKwh, ctx);
    const financing = calcFinancing({
      netCapex,
      financingMode: ctx.baseFinancing.financingMode,
      loanCoveragePct: ctx.baseFinancing.loanCoveragePct,
      annualRatePct: ctx.baseFinancing.annualRatePct,
      tenorYears: ctx.baseFinancing.tenorYears,
    });
    const monthly = scaleProduction(ctx.monthlyProduction, ctx.baselineKwp, kwp);
    const r = evaluate({ ...ctx.baseParams, netCapex, monthlyProduction: monthly, financing });
    return {
      variable: panels,
      isBaseline: panels === ctx.panelCount,
      paybackYears: r.payback,
      irr: r.irr,
      npv: r.npv,
      lifetimeSavings: r.lifetime,
      netCapex,
    };
  });
}

/** Sweep across battery sizes (0 = no battery). */
export function sweepBattery(ctx: BaselineContext): SweepPoint[] {
  const sizes = [0, 5, 10, 15, 20];
  return sizes.map((kwh) => {
    const has = kwh > 0;
    const netCapex = netCapexFor(ctx.panelCount, has, kwh, ctx);
    const financing = calcFinancing({
      netCapex,
      financingMode: ctx.baseFinancing.financingMode,
      loanCoveragePct: ctx.baseFinancing.loanCoveragePct,
      annualRatePct: ctx.baseFinancing.annualRatePct,
      tenorYears: ctx.baseFinancing.tenorYears,
    });
    const r = evaluate({ ...ctx.baseParams, netCapex, monthlyProduction: ctx.monthlyProduction, financing });
    return {
      variable: kwh,
      isBaseline: kwh === (ctx.hasBattery ? ctx.batteryKwh : 0),
      paybackYears: r.payback,
      irr: r.irr,
      npv: r.npv,
      lifetimeSavings: r.lifetime,
      netCapex,
    };
  });
}

/** Sweep across equity %, where equity = 1 − loanCoveragePct. */
export function sweepEquity(ctx: BaselineContext): SweepPoint[] {
  const equityPcts = [0, 25, 50, 75, 100];
  const baselineEquity = Math.round((1 - ctx.baseFinancing.loanCoveragePct) * 100);
  return equityPcts.map((eqPct) => {
    const loanPct = 1 - eqPct / 100;
    const financingMode: 'outright' | 'loan' | 'mortgage' =
      eqPct === 100 ? 'outright' : ctx.baseFinancing.financingMode === 'outright' ? 'loan' : ctx.baseFinancing.financingMode;
    const financing = calcFinancing({
      netCapex: ctx.baselineNetCapex,
      financingMode,
      loanCoveragePct: loanPct,
      annualRatePct: ctx.baseFinancing.annualRatePct,
      tenorYears: ctx.baseFinancing.tenorYears,
    });
    const r = evaluate({ ...ctx.baseParams, netCapex: ctx.baselineNetCapex, monthlyProduction: ctx.monthlyProduction, financing });
    return {
      variable: eqPct,
      isBaseline: eqPct === baselineEquity,
      paybackYears: r.payback,
      irr: r.irr,
      npv: r.npv,
      lifetimeSavings: r.lifetime,
      netCapex: ctx.baselineNetCapex,
    };
  });
}

/** Sweep across loan interest rates. */
export function sweepInterestRate(ctx: BaselineContext): SweepPoint[] {
  const rates = [0.03, 0.045, 0.06, 0.075, 0.09, 0.105];
  const baseline = Math.round(ctx.baseFinancing.annualRatePct * 1000) / 1000;
  return rates.map((rate) => {
    const financing = calcFinancing({
      netCapex: ctx.baselineNetCapex,
      financingMode: ctx.baseFinancing.financingMode === 'outright' ? 'loan' : ctx.baseFinancing.financingMode,
      loanCoveragePct: ctx.baseFinancing.loanCoveragePct === 0 ? 1.0 : ctx.baseFinancing.loanCoveragePct,
      annualRatePct: rate,
      tenorYears: ctx.baseFinancing.tenorYears,
    });
    const r = evaluate({ ...ctx.baseParams, netCapex: ctx.baselineNetCapex, monthlyProduction: ctx.monthlyProduction, financing });
    return {
      variable: rate,
      isBaseline: Math.abs(rate - baseline) < 0.0011,
      paybackYears: r.payback,
      irr: r.irr,
      npv: r.npv,
      lifetimeSavings: r.lifetime,
      netCapex: ctx.baselineNetCapex,
    };
  });
}

export interface ExtendedSensitivity {
  systemSize: SweepPoint[];
  battery: SweepPoint[];
  equity: SweepPoint[];
  interestRate: SweepPoint[];
}

export function runExtendedSensitivity(ctx: BaselineContext): ExtendedSensitivity {
  return {
    systemSize: sweepSystemSize(ctx),
    battery: sweepBattery(ctx),
    equity: sweepEquity(ctx),
    interestRate: sweepInterestRate(ctx),
  };
}
