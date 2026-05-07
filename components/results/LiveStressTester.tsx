'use client';

import { useState, useMemo } from 'react';

// ── Pure-JS computation helpers ──────────────────────────────────────────────

function pmt(annualRate: number, months: number, principal: number): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal / Math.max(1, months);
  const r = annualRate / 12;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

function buildCashflows({
  upfront,
  year1Savings,
  annualDebtService,
  tenorYears,
  horizonYears,
  escalation,
  degradation,
  inverterYear,
  inverterCost,
}: {
  upfront: number;
  year1Savings: number;
  annualDebtService: number;
  tenorYears: number;
  horizonYears: number;
  escalation: number;
  degradation: number;
  inverterYear: number;
  inverterCost: number;
}): number[] {
  const cfs = [-upfront];
  for (let y = 1; y <= horizonYears; y++) {
    const savings = year1Savings * Math.pow(1 + escalation, y - 1) * Math.pow(1 - degradation, y - 1);
    const debt = y <= tenorYears ? annualDebtService : 0;
    const replacement = y === inverterYear ? -inverterCost : 0;
    cfs.push(savings - debt + replacement);
  }
  return cfs;
}

function npv(cfs: number[], rate: number): number {
  return cfs.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
}

function irr(cfs: number[]): number | null {
  if (cfs[0] >= 0) return null; // no investment — IRR undefined
  let r = 0.1;
  for (let i = 0; i < 120; i++) {
    let f = 0;
    let df = 0;
    for (let t = 0; t < cfs.length; t++) {
      const denom = Math.pow(1 + r, t);
      f += cfs[t] / denom;
      df -= (t * cfs[t]) / ((1 + r) * denom);
    }
    if (Math.abs(df) < 1e-14) break;
    const step = f / df;
    r -= step;
    if (Math.abs(step) < 1e-8) break;
  }
  return Number.isFinite(r) && r > -0.999 && r < 10 ? r : null;
}

function payback(cfs: number[]): number | null {
  let cum = 0;
  for (let y = 0; y < cfs.length; y++) {
    const prev = cum;
    cum += cfs[y];
    if (y > 0 && prev < 0 && cum >= 0) {
      return (y - 1) + (-prev) / (cfs[y] || 1);
    }
  }
  return null;
}

function lifetime(cfs: number[]): number {
  return cfs.slice(1).reduce((a, b) => a + b, 0);
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  netCapex: number;
  currentEquityPct: number;       // 0–1 (from wizard input)
  currentAnnualRate: number;      // 0–0.2
  tenorYears: number;
  horizonYears: number;
  year1SolarSavings: number;
  year1ExportIncome: number;
  year1BatteryValue: number;
  year1EvSavings: number;
  inverterReplacementYear: number;
  inverterReplacementCost: number;
  financingMode: string;
  symbol: string;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  color = 'amber',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  color?: 'amber' | 'blue' | 'green' | 'purple';
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const trackColor: Record<string, string> = {
    amber: '#f59e0b',
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#8b5cf6',
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: trackColor[color] }}
        >
          {format(value)}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="w-full h-1.5 rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full"
            style={{ width: `${pct}%`, backgroundColor: trackColor[color] }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '20px' }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function MetricPill({
  label,
  value,
  sub,
  color = 'gray',
}: {
  label: string;
  value: string;
  sub?: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
}) {
  const cls: Record<string, string> = {
    green:  'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-amber-50 border-amber-200 text-amber-800',
    red:    'bg-red-50 border-red-200 text-red-700',
    blue:   'bg-blue-50 border-blue-200 text-blue-800',
    gray:   'bg-gray-50 border-gray-200 text-gray-800',
  };
  return (
    <div className={`rounded-xl border px-3 py-2 text-center ${cls[color]}`}>
      <p className="text-[10px] font-medium text-current opacity-70">{label}</p>
      <p className="font-extrabold text-lg leading-tight">{value}</p>
      {sub && <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

export function LiveStressTester({
  netCapex,
  currentEquityPct,
  currentAnnualRate,
  tenorYears,
  horizonYears,
  year1SolarSavings,
  year1ExportIncome,
  year1BatteryValue,
  year1EvSavings,
  inverterReplacementYear,
  inverterReplacementCost,
  financingMode,
  symbol,
}: Props) {
  const initialEquity = financingMode === 'outright' ? 1.0 : Math.max(0.05, currentEquityPct ?? 0.5);

  const [equityPct, setEquityPct] = useState(initialEquity);
  const [annualRate, setAnnualRate] = useState(currentAnnualRate ?? 0.07);
  const [energyMult, setEnergyMult] = useState(1.0);
  const [panelMult, setPanelMult] = useState(1.0);

  const metrics = useMemo(() => {
    const scaledSavings = (year1SolarSavings + year1ExportIncome + year1BatteryValue + year1EvSavings)
      * energyMult
      * panelMult;
    const scaledCapex = netCapex * panelMult;
    const upfront = scaledCapex * equityPct;
    const loanAmt = scaledCapex * (1 - equityPct);
    const monthlyPmt = pmt(annualRate, tenorYears * 12, loanAmt);
    const annualDebtService = monthlyPmt * 12;

    const cfs = buildCashflows({
      upfront,
      year1Savings: scaledSavings,
      annualDebtService,
      tenorYears,
      horizonYears,
      escalation: 0.03,
      degradation: 0.005,
      inverterYear: inverterReplacementYear,
      inverterCost: inverterReplacementCost * panelMult,
    });

    const irrVal = upfront > 0 ? irr(cfs) : null;
    const npvVal = npv(cfs, 0.08);
    const paybackVal = payback(cfs);
    const lifetimeVal = lifetime(cfs);
    const year1Net = cfs[1] ?? 0;

    return { irrVal, npvVal, paybackVal, lifetimeVal, year1Net, upfront, annualDebtService };
  }, [equityPct, annualRate, energyMult, panelMult, netCapex, tenorYears, horizonYears, year1SolarSavings, year1ExportIncome, year1BatteryValue, year1EvSavings, inverterReplacementYear, inverterReplacementCost]);

  const { irrVal, npvVal, paybackVal, lifetimeVal, year1Net } = metrics;

  function paybackColor() {
    if (paybackVal == null) return 'red';
    if (paybackVal < 8) return 'green';
    if (paybackVal < 12) return 'yellow';
    return 'red';
  }

  function reset() {
    setEquityPct(initialEquity);
    setAnnualRate(currentAnnualRate ?? 0.07);
    setEnergyMult(1.0);
    setPanelMult(1.0);
  }

  const isModified =
    Math.abs(equityPct - initialEquity) > 0.01 ||
    Math.abs(annualRate - (currentAnnualRate ?? 0.07)) > 0.001 ||
    Math.abs(energyMult - 1) > 0.01 ||
    Math.abs(panelMult - 1) > 0.01;

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600 leading-relaxed">
        Drag the sliders below — key metrics update instantly in your browser with no server call.
        All four variables are independent; hold three constant while you stress-test the fourth.
      </p>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-gray-50 rounded-2xl p-5">
        <Slider
          label="Equity invested"
          value={equityPct}
          min={0}
          max={1}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={setEquityPct}
          color="amber"
        />
        <Slider
          label="Loan interest rate"
          value={annualRate}
          min={0.02}
          max={0.18}
          step={0.005}
          format={(v) => `${(v * 100).toFixed(1)}%`}
          onChange={setAnnualRate}
          color="blue"
        />
        <Slider
          label="Energy price scenario"
          value={energyMult}
          min={0.5}
          max={2.0}
          step={0.05}
          format={(v) => v === 1 ? 'Base' : v < 1 ? `−${Math.round((1 - v) * 100)}%` : `+${Math.round((v - 1) * 100)}%`}
          onChange={setEnergyMult}
          color="green"
        />
        <Slider
          label="System size (relative)"
          value={panelMult}
          min={0.5}
          max={2.0}
          step={0.05}
          format={(v) => v === 1 ? 'As designed' : v < 1 ? `−${Math.round((1 - v) * 100)}%` : `+${Math.round((v - 1) * 100)}%`}
          onChange={setPanelMult}
          color="purple"
        />
      </div>

      {/* Live metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricPill
          label="Payback"
          value={paybackVal != null ? `${paybackVal.toFixed(1)} yr` : 'N/A'}
          sub={paybackVal != null ? (paybackVal < 8 ? 'Excellent' : paybackVal < 12 ? 'Good' : 'Long') : undefined}
          color={paybackColor()}
        />
        <MetricPill
          label="IRR"
          value={irrVal != null ? `${(irrVal * 100).toFixed(1)}%` : equityPct < 0.01 ? 'no equity' : 'N/A'}
          color={irrVal != null ? (irrVal > 0.12 ? 'green' : irrVal > 0.07 ? 'yellow' : 'red') : 'gray'}
        />
        <MetricPill
          label="NPV (8%)"
          value={`${symbol}${Math.round(npvVal).toLocaleString()}`}
          color={npvVal >= 0 ? 'green' : 'red'}
        />
        <MetricPill
          label={`${horizonYears}-yr savings`}
          value={`${symbol}${Math.round(lifetimeVal).toLocaleString()}`}
          color={lifetimeVal > 0 ? 'green' : 'red'}
        />
        <MetricPill
          label="Year-1 net"
          value={`${symbol}${Math.round(year1Net).toLocaleString()}`}
          color={year1Net >= 0 ? 'green' : year1Net > -500 ? 'yellow' : 'red'}
        />
      </div>

      {/* Reset button */}
      {isModified && (
        <div className="flex justify-end">
          <button
            onClick={reset}
            className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2"
          >
            Reset to your scenario
          </button>
        </div>
      )}

      <p className="text-[11px] text-gray-400 leading-relaxed">
        Live calculation uses a simplified model: energy savings scale linearly with price and system size;
        panel degradation 0.5%/yr; energy escalation 3%/yr; NPV discounted at 8%; inverter replacement in
        year {inverterReplacementYear}. IRR is undefined when equity = 0.
      </p>
    </div>
  );
}
