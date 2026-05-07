'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { MonthlyHourlyProfile } from '@/lib/engine/hourlySimulator';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  months: MonthlyHourlyProfile[];
  batteryKwh: number;
  symbol: string;
  annualArbitrageSavings: number;
  importPricePerKwh: number;
  performArbitrage: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs min-w-[180px]">
      <p className="font-bold text-gray-800 mb-1">{label}:00</p>
      {payload.map((p: any) => (
        p.value !== 0 && (
          <div key={p.dataKey} className="flex justify-between gap-3">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="font-mono font-semibold">{Math.abs(p.value).toFixed(3)} kWh</span>
          </div>
        )
      ))}
    </div>
  );
};

export function DailyBatteryChart({ months, batteryKwh, symbol, annualArbitrageSavings, performArbitrage }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(6); // July default

  const profile = months[selectedMonth];
  if (!profile) return null;

  const chartData = profile.representativeDay.map((s) => ({
    hour: s.hour,
    'Solar': parseFloat(s.solarKwh.toFixed(3)),
    'Battery discharge': parseFloat(s.batteryDischargeKwh.toFixed(3)),
    'Grid import': parseFloat(s.gridImportKwh.toFixed(3)),
    'Battery charge': -parseFloat(s.batteryChargeKwh.toFixed(3)),
    'Grid export': -parseFloat(s.gridExportKwh.toFixed(3)),
    'State of charge': parseFloat(s.batterySocKwh.toFixed(3)),
    Load: parseFloat(s.loadKwh.toFixed(3)),
  }));

  const maxKwh = Math.max(
    ...profile.representativeDay.map((s) =>
      Math.max(s.solarKwh, s.loadKwh, s.gridImportKwh + s.batteryChargeKwh)
    )
  );

  const monthSummary = [
    { label: 'Daily solar', value: `${profile.dailySolarKwh.toFixed(2)} kWh` },
    { label: 'Self-consumed', value: `${profile.dailySelfConsumedKwh.toFixed(2)} kWh` },
    { label: 'Grid import', value: `${profile.dailyGridImportKwh.toFixed(2)} kWh` },
    { label: 'Grid export', value: `${profile.dailyGridExportKwh.toFixed(2)} kWh` },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 leading-relaxed">
        Hour-by-hour energy flows for a representative day in each month. The battery
        absorbs midday solar surplus and returns it during the evening peak
        {performArbitrage && ', also pre-charging from the grid at night-rate to shift cheap energy into peak hours'}.
      </p>

      {/* Month selector */}
      <div className="flex flex-wrap gap-1.5">
        {MONTH_NAMES.map((name, i) => (
          <button
            key={name}
            onClick={() => setSelectedMonth(i)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedMonth === i
                ? 'bg-amber-400 text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Day-summary chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {monthSummary.map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
            <p className="text-[10px] text-gray-500">{s.label}</p>
            <p className="font-bold text-gray-900 text-sm">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="hour"
              tickFormatter={(h) => `${h}:00`}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              interval={3}
            />
            <YAxis
              yAxisId="kwh"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickFormatter={(v) => `${Math.abs(v).toFixed(1)}`}
              domain={[-maxKwh * 1.1, maxKwh * 1.1]}
              label={{ value: 'kWh', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#9ca3af' } }}
            />
            {batteryKwh > 0 && (
              <YAxis
                yAxisId="soc"
                orientation="right"
                domain={[0, batteryKwh * 1.05]}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickFormatter={(v) => `${v.toFixed(1)}`}
                label={{ value: 'SoC kWh', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#9ca3af' } }}
              />
            )}
            <Tooltip content={<CustomTooltip symbol={symbol} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine yAxisId="kwh" y={0} stroke="#d1d5db" strokeWidth={1} />

            {/* Positive bars: sources of energy for the home */}
            <Bar yAxisId="kwh" dataKey="Solar" stackId="pos" fill="#facc15" name="Solar" />
            <Bar yAxisId="kwh" dataKey="Battery discharge" stackId="pos" fill="#f97316" name="Battery discharge" />
            <Bar yAxisId="kwh" dataKey="Grid import" stackId="pos" fill="#ef4444" name="Grid import" />

            {/* Negative bars: energy leaving the home / going into battery */}
            <Bar yAxisId="kwh" dataKey="Battery charge" stackId="neg" fill="#3b82f6" name="Battery charge" />
            <Bar yAxisId="kwh" dataKey="Grid export" stackId="neg" fill="#22c55e" name="Grid export" />

            {/* Load line */}
            <Line
              yAxisId="kwh"
              type="monotone"
              dataKey="Load"
              stroke="#1e293b"
              strokeWidth={2}
              dot={false}
              name="Load"
            />

            {/* Battery state of charge */}
            {batteryKwh > 0 && (
              <Area
                yAxisId="soc"
                type="monotone"
                dataKey="State of charge"
                stroke="#8b5cf6"
                fill="#ede9fe"
                fillOpacity={0.4}
                strokeWidth={1.5}
                dot={false}
                name="SoC"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend note */}
      <p className="text-[11px] text-gray-500">
        Bars above zero = energy sources feeding the home (solar direct, battery, grid).
        Bars below zero = energy being stored or exported. Black line = household load.
        {batteryKwh > 0 && ' Purple area = battery state of charge (right axis).'}
      </p>

      {/* Arbitrage callout */}
      {performArbitrage && annualArbitrageSavings > 5 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div className="text-blue-500 mt-0.5 text-lg leading-none">⚡</div>
          <div>
            <p className="font-semibold text-blue-900 text-sm">
              Arbitrage saves ~{symbol}{Math.round(annualArbitrageSavings).toLocaleString()} / year
            </p>
            <p className="text-blue-700 text-xs mt-0.5 leading-relaxed">
              By charging from the grid at the cheaper night rate and using that stored energy
              during peak hours, your battery earns {symbol}{(annualArbitrageSavings / 12).toFixed(0)}/month
              on top of solar self-consumption savings.
            </p>
          </div>
        </div>
      )}

      {/* Monthly summary table */}
      <details className="group">
        <summary className="cursor-pointer text-xs font-semibold text-amber-700 hover:text-amber-900 list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
          Monthly averages (representative day)
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-2 py-1.5 font-semibold text-gray-600">Month</th>
                <th className="text-right px-2 py-1.5 font-semibold text-gray-600">Solar</th>
                <th className="text-right px-2 py-1.5 font-semibold text-gray-600">Self-use</th>
                <th className="text-right px-2 py-1.5 font-semibold text-gray-600">Grid import</th>
                <th className="text-right px-2 py-1.5 font-semibold text-gray-600">Grid export</th>
              </tr>
            </thead>
            <tbody>
              {months.map((mp) => (
                <tr
                  key={mp.month}
                  onClick={() => setSelectedMonth(mp.month)}
                  className={`border-b border-gray-100 cursor-pointer hover:bg-amber-50 transition-colors ${
                    mp.month === selectedMonth ? 'bg-amber-50 font-semibold' : ''
                  }`}
                >
                  <td className="px-2 py-1.5 text-gray-700">{MONTH_NAMES[mp.month]}</td>
                  <td className="px-2 py-1.5 text-right text-gray-900">{mp.dailySolarKwh.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right text-green-700">{mp.dailySelfConsumedKwh.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right text-red-600">{mp.dailyGridImportKwh.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right text-blue-600">{mp.dailyGridExportKwh.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-gray-400 mt-1">All values kWh per representative day. Click a row to view that month&apos;s hourly chart.</p>
        </div>
      </details>
    </div>
  );
}
