'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { AnnualCashflow } from '@/lib/engine/cashflow';

interface Props {
  cashflows: AnnualCashflow[];
  symbol: string;
}

export function CashflowChart({ cashflows, symbol }: Props) {
  const data = cashflows.map((row) => ({
    year: `Yr ${row.year}`,
    solarSavings: Math.round(row.solarSavings),
    exportIncome: Math.round(row.exportIncome),
    evSavings: Math.round(row.evSavings),
    batteryValue: Math.round(row.batteryValue),
    capex: row.capex < 0 ? Math.round(row.capex) : 0,
    cumulative: Math.round(row.cumulativeCashflow),
  }));

  // Find payback year
  const paybackYear = cashflows.findIndex((r, i) => i > 0 && r.cumulativeCashflow >= 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(v: any, name: any) => [`${symbol}${Number(v).toLocaleString()}`, name]}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend />
        <Bar dataKey="capex" name="Capex" fill="#ef4444" stackId="a" />
        <Bar dataKey="solarSavings" name="Solar savings" fill="#3b82f6" stackId="a" />
        <Bar dataKey="exportIncome" name="Export income" fill="#22c55e" stackId="a" />
        <Bar dataKey="evSavings" name="EV savings" fill="#14b8a6" stackId="a" />
        <Bar dataKey="batteryValue" name="Battery value" fill="#f97316" stackId="a" />
        <Line
          type="monotone"
          dataKey="cumulative"
          name="Cumulative"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
        />
        {paybackYear > 0 && (
          <ReferenceLine
            x={`Yr ${paybackYear}`}
            stroke="#22c55e"
            strokeDasharray="4 4"
            label={{ value: 'Payback', position: 'top', fontSize: 11, fill: '#16a34a' }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
