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
import { useT } from '@/lib/i18n';

interface Props {
  cashflows: AnnualCashflow[];
  symbol: string;
}

export function CashflowChart({ cashflows, symbol }: Props) {
  const t = useT();
  const data = cashflows.map((row) => ({
    year: `Yr ${row.year}`,
    solarSavings: Math.round(row.solarSavings),
    exportIncome: Math.round(row.exportIncome),
    evSavings: Math.round(row.evSavings),
    batteryValue: Math.round(row.batteryValue),
    capex: row.capex < 0 ? Math.round(row.capex) : 0,
    cumulative: Math.round(row.cumulativeCashflow),
  }));

  const paybackYear = cashflows.findIndex((r, i) => i > 0 && r.cumulativeCashflow >= 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={4} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} width={42} />
        <Tooltip
          formatter={(v: any, name: any) => [`${symbol}${Number(v).toLocaleString()}`, name]}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="capex" name={t.charts.capex} fill="#ef4444" stackId="a" />
        <Bar dataKey="solarSavings" name={t.charts.solarSavings} fill="#3b82f6" stackId="a" />
        <Bar dataKey="exportIncome" name={t.charts.exportIncome} fill="#22c55e" stackId="a" />
        <Bar dataKey="evSavings" name={t.charts.evSavings} fill="#14b8a6" stackId="a" />
        <Bar dataKey="batteryValue" name={t.charts.batteryValue} fill="#f97316" stackId="a" />
        <Line
          type="monotone"
          dataKey="cumulative"
          name={t.charts.cumulative}
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
        />
        {paybackYear > 0 && (
          <ReferenceLine
            x={`Yr ${paybackYear}`}
            stroke="#22c55e"
            strokeDasharray="4 4"
            label={{ value: t.charts.payback, position: 'insideTopLeft', fontSize: 10, fill: '#16a34a' }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
