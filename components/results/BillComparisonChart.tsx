'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useT } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  monthlyConsumptionKwh: number[];
  monthlyGridImportKwh: number[];
  monthlyExportKwh: number[];
  importPricePerKwh: number;
  exportPricePerKwh: number;
  symbol: string;
  /** Annual debt service for year 1, spread across 12 months. */
  monthlyDebtService?: number;
}

export function BillComparisonChart({
  monthlyConsumptionKwh,
  monthlyGridImportKwh,
  monthlyExportKwh,
  importPricePerKwh,
  exportPricePerKwh,
  symbol,
  monthlyDebtService = 0,
}: Props) {
  const t = useT();
  const data = MONTHS.map((m, i) => {
    const consumption = monthlyConsumptionKwh[i] ?? 0;
    const gridImport = monthlyGridImportKwh[i] ?? 0;
    const exported = monthlyExportKwh[i] ?? 0;

    const preBill = consumption * importPricePerKwh;
    const postEnergyBill = gridImport * importPricePerKwh - exported * exportPricePerKwh;
    const postBill = postEnergyBill + monthlyDebtService;

    return {
      month: m,
      pre: Math.round(preBill * 100) / 100,
      post: Math.round(postBill * 100) / 100,
      saving: Math.round((preBill - postBill) * 100) / 100,
    };
  });

  const totals = data.reduce(
    (acc, d) => {
      acc.pre += d.pre;
      acc.post += d.post;
      acc.saving += d.saving;
      return acc;
    },
    { pre: 0, post: 0, saving: 0 }
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-red-700 font-bold">
            {t.charts.annualBillBefore}
          </p>
          <p className="text-lg font-extrabold text-red-900 mt-0.5">
            {symbol}{Math.round(totals.pre).toLocaleString()}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">
            {t.charts.annualBillAfter}
          </p>
          <p className="text-lg font-extrabold text-blue-900 mt-0.5">
            {symbol}{Math.round(totals.post).toLocaleString()}
          </p>
          {monthlyDebtService > 0 && (
            <p className="text-[10px] text-blue-700 mt-0.5">{t.charts.inclLoanRepayment}</p>
          )}
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold">
            {t.charts.year1Saving}
          </p>
          <p className="text-lg font-extrabold text-green-900 mt-0.5">
            {symbol}{Math.round(totals.saving).toLocaleString()}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${symbol}${Number(v).toLocaleString()}`}
          />
          <Tooltip
            formatter={(v: any, name: any) => [`${symbol}${Number(v).toLocaleString()}`, name]}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="pre" name={t.charts.billBefore} fill="#ef4444" radius={[3, 3, 0, 0]} />
          <Bar dataKey="post" name={t.charts.billAfter} fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-600 leading-relaxed">
        {fmt(t.charts.billCompNote, { loanNote: monthlyDebtService > 0 ? t.charts.billCompNoteLoan : '' })}
      </p>
    </div>
  );
}
