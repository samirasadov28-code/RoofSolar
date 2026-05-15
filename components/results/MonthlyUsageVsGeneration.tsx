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
  ResponsiveContainer,
} from 'recharts';
import { useT } from '@/lib/i18n';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  monthlyProductionKwh: number[];
  monthlyConsumptionKwh: number[];
  monthlySelfConsumedKwh?: number[];
}

export function MonthlyUsageVsGeneration({
  monthlyProductionKwh,
  monthlyConsumptionKwh,
  monthlySelfConsumedKwh,
}: Props) {
  const t = useT();
  const data = MONTHS.map((m, i) => {
    const gen = Math.round(monthlyProductionKwh[i] ?? 0);
    const use = Math.round(monthlyConsumptionKwh[i] ?? 0);
    const self = Math.round(monthlySelfConsumedKwh?.[i] ?? Math.min(gen, use));
    const surplus = Math.max(0, gen - self);
    const shortfall = Math.max(0, use - self);
    return { month: m, gen, use, self, surplus, shortfall };
  });

  const totals = data.reduce(
    (acc, d) => {
      acc.gen += d.gen;
      acc.use += d.use;
      acc.self += d.self;
      return acc;
    },
    { gen: 0, use: 0, self: 0 }
  );
  const coverage = totals.use > 0 ? (totals.self / totals.use) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">
            {t.charts.annualGeneration}
          </p>
          <p className="text-lg font-extrabold text-blue-900 mt-0.5">
            {totals.gen.toLocaleString()} kWh
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">
            {t.charts.annualUsage}
          </p>
          <p className="text-lg font-extrabold text-amber-900 mt-0.5">
            {totals.use.toLocaleString()} kWh
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold">
            {t.charts.solarCoverage}
          </p>
          <p className="text-lg font-extrabold text-green-900 mt-0.5">
            {coverage.toFixed(1)}%
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Number(v).toLocaleString()}`} />
          <Tooltip
            formatter={(v: any, name: any) => [`${Number(v).toLocaleString()} kWh`, name]}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="use" name={t.charts.usage} fill="#fbbf24" radius={[3, 3, 0, 0]} />
          <Bar dataKey="gen" name={t.charts.generation} fill="#3b82f6" radius={[3, 3, 0, 0]} />
          <Line
            type="monotone"
            dataKey="self"
            name={t.charts.selfConsumed}
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 3, fill: '#16a34a' }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-600 leading-relaxed">
        {t.charts.monthlyNote}
      </p>
    </div>
  );
}
