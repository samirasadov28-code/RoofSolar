'use client';

import { calcFinancing } from '@/lib/engine/financing';

interface Props {
  data: any;
  inputs: any;
  symbol: string;
}

export function FinancingTable({ data, inputs, symbol }: Props) {
  const netCapex = data.netCapex ?? 0;
  const rate = inputs.annualRatePct;
  const tenor = inputs.tenorYears;

  const scenarios = [
    { label: 'Outright', mode: 'outright' as const, loanPct: 0, rate: 0, tenor: 0 },
    { label: 'Personal Loan', mode: 'loan' as const, loanPct: 1.0, rate: rate || 0.065, tenor },
    { label: 'Green Mortgage', mode: 'mortgage' as const, loanPct: 1.0, rate: 0.035, tenor },
  ];

  const rows = scenarios.map((s) => {
    const fin = calcFinancing({
      netCapex,
      financingMode: s.mode,
      loanCoveragePct: s.loanPct,
      annualRatePct: s.rate,
      tenorYears: s.tenor,
    });
    const tenYrDebtService = fin.monthlyPayment * 12 * Math.min(s.tenor || 0, 10);
    const tenYrTotalOut = fin.upfrontCash + tenYrDebtService;
    const tenYrGrossIn = (data.lifetimeSavings ?? 0);
    return { ...s, fin, tenYrTotalOut, tenYrNet: tenYrGrossIn - tenYrTotalOut };
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2 px-3 text-left text-gray-500 font-medium" />
            {rows.map((r) => <th key={r.label} className="py-2 px-3 text-center text-gray-700 font-semibold">{r.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {[
            {
              label: 'Upfront cost',
              values: rows.map((r) => `${symbol}${r.fin.upfrontCash.toLocaleString(undefined, { maximumFractionDigits: 0 })}`),
            },
            {
              label: 'Monthly payment',
              values: rows.map((r) => r.fin.monthlyPayment > 0 ? `${symbol}${r.fin.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'),
            },
            {
              label: '10-yr total cost',
              values: rows.map((r) => `${symbol}${r.tenYrTotalOut.toLocaleString(undefined, { maximumFractionDigits: 0 })}`),
            },
            {
              label: '10-yr net saving',
              values: rows.map((r) => (
                <span key={r.label} className={r.tenYrNet >= 0 ? 'text-green-700 font-bold' : 'text-red-600 font-bold'}>
                  {symbol}{r.tenYrNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              )),
            },
          ].map((row) => (
            <tr key={row.label} className="border-b border-gray-100">
              <td className="py-2.5 px-3 text-gray-600">{row.label}</td>
              {row.values.map((v, i) => (
                <td key={i} className="py-2.5 px-3 text-center">{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
