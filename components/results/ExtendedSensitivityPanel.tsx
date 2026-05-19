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
  ReferenceDot,
  ResponsiveContainer,
} from 'recharts';
import { useT } from '@/lib/i18n';

interface SweepPoint {
  variable: number;
  isBaseline: boolean;
  paybackYears: number | null;
  irr: number | null;
  npv: number;
  lifetimeSavings: number;
  netCapex: number;
}

interface Props {
  systemSize: SweepPoint[];
  battery: SweepPoint[];
  equity: SweepPoint[];
  interestRate: SweepPoint[];
  symbol: string;
}

function SweepChart({
  title,
  desc,
  points,
  xLabel,
  formatX,
  symbol,
  youLabel,
  npvLabel,
  lifetimeSavingsLabel,
  paybackLabel,
  irrLabel,
}: {
  title: string;
  desc: string;
  points: SweepPoint[];
  xLabel: string;
  formatX: (v: number) => string;
  symbol: string;
  youLabel: string;
  npvLabel: string;
  lifetimeSavingsLabel: string;
  paybackLabel: string;
  irrLabel: string;
}) {
  const data = points.map((p) => ({
    x: p.variable,
    xLabel: formatX(p.variable),
    payback: p.paybackYears != null ? Math.round(p.paybackYears * 10) / 10 : null,
    irrPct: p.irr != null ? Math.min(100, Math.round(p.irr * 1000) / 10) : null,
    npv: Math.round(p.npv),
    lifetime: Math.round(p.lifetimeSavings),
    capex: Math.round(p.netCapex),
    isBaseline: p.isBaseline,
  }));

  const baseline = data.find((d) => d.isBaseline);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="mb-2">
        <p className="font-bold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="xLabel" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} width={40} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}`} width={28} />
          <Tooltip
            formatter={(v: any, name: any) => {
              if (name === npvLabel || name === lifetimeSavingsLabel) return [`${symbol}${Number(v).toLocaleString()}`, name];
              if (name === paybackLabel) return [v == null ? '—' : `${v} yrs`, name];
              if (name === irrLabel) return [v == null ? '—' : `${v.toFixed(1)} %`, name];
              return [v, name];
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar yAxisId="left" dataKey="lifetime" name={lifetimeSavingsLabel} fill="#16a34a" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="left" dataKey="npv" name={npvLabel} fill="#3b82f6" radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="payback" name={paybackLabel} stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
          <Line yAxisId="right" type="monotone" dataKey="irrPct" name={irrLabel} stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="3 3" />
          {baseline && (
            <ReferenceDot
              yAxisId="left"
              x={baseline.xLabel}
              y={baseline.lifetime}
              r={6}
              fill="#fbbf24"
              stroke="#92400e"
              strokeWidth={1.5}
              label={{ value: youLabel, position: 'insideTopRight', fontSize: 10, fill: '#92400e' }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function SizingTable({ points, symbol, t }: { points: SweepPoint[]; symbol: string; t: ReturnType<typeof useT> }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="font-bold text-gray-900 text-sm mb-1">{t.sensitivityPanel.sizingOptimizerTitle}</p>
      <p className="text-xs text-gray-500 mb-3">{t.sensitivityPanel.sizingOptimizerDesc}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left py-2 px-2 font-medium">{t.sensitivityPanel.colPanels}</th>
              <th className="text-right py-2 px-2 font-medium">{t.sensitivityPanel.colKwp}</th>
              <th className="text-right py-2 px-2 font-medium">{t.sensitivityPanel.colNetCost}</th>
              <th className="text-right py-2 px-2 font-medium">{t.sensitivityPanel.colPayback}</th>
              <th className="text-right py-2 px-2 font-medium">{t.sensitivityPanel.colIrr}</th>
              <th className="text-right py-2 px-2 font-medium">{t.sensitivityPanel.colLifetime}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => {
              const kwp = p.variable * 0.4;
              return (
                <tr
                  key={p.variable}
                  className={`border-b border-gray-100 last:border-0 ${
                    p.isBaseline ? 'bg-yellow-50 font-semibold' : ''
                  }`}
                >
                  <td className="py-2 px-2 text-gray-900">{p.variable}</td>
                  <td className="py-2 px-2 text-right">{kwp.toFixed(1)}</td>
                  <td className="py-2 px-2 text-right">
                    {symbol}{p.netCapex.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {p.paybackYears == null ? '—' : `${p.paybackYears.toFixed(1)} yr`}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {p.irr == null
                      ? '—'
                      : p.irr > 1
                        ? '> 100 %'
                        : `${(p.irr * 100).toFixed(1)} %`}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {symbol}{Math.round(p.lifetimeSavings).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ExtendedSensitivityPanel({ systemSize, battery, equity, interestRate, symbol }: Props) {
  const t = useT();
  const sharedChartProps = {
    symbol,
    youLabel: t.sensitivityPanel.youLabel,
    npvLabel: t.sensitivityPanel.npvLabel,
    lifetimeSavingsLabel: t.sensitivityPanel.lifetimeSavings,
    paybackLabel: t.sensitivityPanel.colPayback,
    irrLabel: t.sensitivityPanel.colIrr,
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 leading-relaxed">
        {t.sensitivityPanel.intro}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SweepChart
          title={t.sensitivityPanel.bySystemSize}
          desc={t.sensitivityPanel.bySystemSizeDesc}
          points={systemSize}
          xLabel={t.sensitivityPanel.panelsUnit}
          formatX={(v) => String(v)}
          {...sharedChartProps}
        />
        <SweepChart
          title={t.sensitivityPanel.byBatterySize}
          desc={t.sensitivityPanel.byBatterySizeDesc}
          points={battery}
          xLabel={t.sensitivityPanel.kwhUnit}
          formatX={(v) => `${v}`}
          {...sharedChartProps}
        />
        <SweepChart
          title={t.sensitivityPanel.byEquity}
          desc={t.sensitivityPanel.byEquityDesc}
          points={equity}
          xLabel="% equity"
          formatX={(v) => `${v}%`}
          {...sharedChartProps}
        />
        <SweepChart
          title={t.sensitivityPanel.byInterestRate}
          desc={t.sensitivityPanel.byInterestRateDesc}
          points={interestRate}
          xLabel="annual %"
          formatX={(v) => `${(v * 100).toFixed(1)}%`}
          {...sharedChartProps}
        />
      </div>

      <SizingTable points={systemSize} symbol={symbol} t={t} />
    </div>
  );
}
