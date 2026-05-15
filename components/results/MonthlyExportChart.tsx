'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useT } from '@/lib/i18n';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  monthlyExportKwh: number[];
  exportRate: number;
  symbol: string;
}

export function MonthlyExportChart({ monthlyExportKwh, exportRate, symbol }: Props) {
  const t = useT();
  const data = MONTHS.map((month, i) => ({
    month,
    exportKwh: Math.round(monthlyExportKwh[i] ?? 0),
    exportIncome: Math.round((monthlyExportKwh[i] ?? 0) * exportRate * 100) / 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${symbol}${Number(v).toLocaleString()}`} />
        <Tooltip
          formatter={(v: any, name: any) => [
            name === 'exportIncome' ? `${symbol}${Number(v).toLocaleString()}` : `${Number(v).toLocaleString()} kWh`,
            name === 'exportIncome' ? t.charts.exportIncomeName : t.charts.exportKwhName,
          ]}
        />
        <Bar dataKey="exportIncome" name="exportIncome" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
