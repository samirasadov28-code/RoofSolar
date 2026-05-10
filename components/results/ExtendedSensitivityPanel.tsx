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
}: {
  title: string;
  desc: string;
  points: SweepPoint[];
  xLabel: string;
  formatX: (v: number) => string;
  symbol: string;
}) {
  const data = points.map((p) => ({
    x: p.variable,
    xLabel: formatX(p.variable),
    payback: p.paybackYears != null ? Math.round(p.paybackYears * 10) / 10 : null,
    // Cap plotted IRR at 100% so an unusually small / heavily-subsidised
    // configuration doesn't blow out the right-axis scale.
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
        <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="xLabel" tick={{ fontSize: 11 }} label={{ value: xLabel, position: 'insideBottom', offset: -2, fontSize: 10, fill: '#6b7280' }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} />
          <Tooltip
            formatter={(v: any, name: any) => {
              if (name === 'NPV (8%)' || name === 'Lifetime savings') return [`${symbol}${Number(v).toLocaleString()}`, name];
              if (name === 'Payback') return [v == null ? '—' : `${v} yrs`, name];
              if (name === 'IRR') return [v == null ? '—' : `${v.toFixed(1)} %`, name];
              return [v, name];
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar yAxisId="left" dataKey="lifetime" name="Lifetime savings" fill="#16a34a" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="left" dataKey="npv" name="NPV (8%)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="payback" name="Payback" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
          <Line yAxisId="right" type="monotone" dataKey="irrPct" name="IRR" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="3 3" />
          {baseline && (
            <ReferenceDot
              yAxisId="left"
              x={baseline.xLabel}
              y={baseline.lifetime}
              r={6}
              fill="#fbbf24"
              stroke="#92400e"
              strokeWidth={1.5}
              label={{ value: 'You', position: 'top', fontSize: 10, fill: '#92400e' }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function SizingTable({ points, symbol }: { points: SweepPoint[]; symbol: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="font-bold text-gray-900 text-sm mb-1">System sizing optimizer</p>
      <p className="text-xs text-gray-500 mb-3">
        How payback / IRR / lifetime savings scale with the number of panels you install.
        The yellow row is your current selection.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left py-2 px-2 font-medium">Panels</th>
              <th className="text-right py-2 px-2 font-medium">kWp</th>
              <th className="text-right py-2 px-2 font-medium">Net cost</th>
              <th className="text-right py-2 px-2 font-medium">Payback</th>
              <th className="text-right py-2 px-2 font-medium">IRR</th>
              <th className="text-right py-2 px-2 font-medium">Lifetime savings</th>
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
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 leading-relaxed">
        Each chart below stress-tests one variable while holding everything else constant.
        Bars show absolute money figures (left axis); lines show payback years and IRR
        (right axis). The yellow dot marks your current scenario.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SweepChart
          title="By system size"
          desc="More panels = more capex, more savings — but diminishing self-consumption."
          points={systemSize}
          xLabel="panels"
          formatX={(v) => String(v)}
          symbol={symbol}
        />
        <SweepChart
          title="By battery size"
          desc="Larger battery shifts more midday solar into evening loads (and arbitrage)."
          points={battery}
          xLabel="kWh"
          formatX={(v) => `${v}`}
          symbol={symbol}
        />
        <SweepChart
          title="By equity invested"
          desc="0% = fully financed (no IRR baseline). 100% = paid in cash."
          points={equity}
          xLabel="% equity"
          formatX={(v) => `${v}%`}
          symbol={symbol}
        />
        <SweepChart
          title="By loan interest rate"
          desc="Higher rates eat into the saving from financed scenarios."
          points={interestRate}
          xLabel="annual %"
          formatX={(v) => `${(v * 100).toFixed(1)}%`}
          symbol={symbol}
        />
      </div>

      <SizingTable points={systemSize} symbol={symbol} />
    </div>
  );
}
