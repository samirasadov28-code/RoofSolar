'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProGate } from '@/components/ProGate';
import { CalculationBreakdown } from '@/components/results/CalculationBreakdown';
import { CashflowChart } from '@/components/results/CashflowChart';
import { SensitivityMatrix } from '@/components/results/SensitivityMatrix';
import { BatteryPanel } from '@/components/results/BatteryPanel';
import { EvPanel } from '@/components/results/EvPanel';
import { FinancingTable } from '@/components/results/FinancingTable';
import { MonthlyExportChart } from '@/components/results/MonthlyExportChart';
import { MonthlyUsageVsGeneration } from '@/components/results/MonthlyUsageVsGeneration';
import { BillComparisonChart } from '@/components/results/BillComparisonChart';
import { LifetimeImpact } from '@/components/results/LifetimeImpact';
import { ExtendedSensitivityPanel } from '@/components/results/ExtendedSensitivityPanel';
import { LeadModal } from '@/components/results/LeadModal';
import type { AnnualCashflow } from '@/lib/engine/cashflow';
import { fmtInt } from '@/lib/format';

function fmt(countryCode: string) {
  return countryCode === 'ie' ? '€' : countryCode === 'gb' ? '£' : '';
}

function PaybackCard({ months }: { months: number }) {
  const years = isNaN(months) ? null : months / 12;
  const color = !years ? 'text-red-600' : years < 8 ? 'text-green-600' : years < 12 ? 'text-yellow-600' : 'text-red-600';
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500 mb-1">Payback period</p>
      <p className={`text-4xl font-extrabold ${color}`}>
        {years ? `${years.toFixed(1)} yrs` : 'N/A'}
      </p>
      {years && <p className="text-xs text-gray-400 mt-1">{years < 8 ? 'Excellent' : years < 12 ? 'Good' : 'Long'}</p>}
    </div>
  );
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [inputs, setInputs] = useState<any>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('roofsolar_results');
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed.results);
      setInputs(parsed.inputs);
    }
  }, []);

  if (!data || !inputs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading results…</p>
          <p className="text-xs text-gray-400 mt-2">
            If this persists, <Link href="/calculator" className="underline">start a new analysis</Link>
          </p>
        </div>
      </div>
    );
  }

  const symbol = fmt(inputs.countryCode);
  const id = params.id;
  const cashflows: AnnualCashflow[] = data.cashflows ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-192.png" alt="RoofSolar" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
            <span className="font-bold text-gray-900">RoofSolar</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{inputs.displayName}</span>
            <Link href="/calculator" className="text-sm text-gray-600 hover:text-gray-900">New analysis</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Free tier metrics */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your solar analysis</h1>
          <p className="text-gray-500 text-sm">
            {inputs.systemKwp.toFixed(1)} kWp system · {fmtInt(data.annualProductionKwh)} kWh/yr · Source: {data.dataSource}
          </p>
        </div>

        {/* Key metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PaybackCard months={data.paybackMonths} />

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Year 1 savings</p>
            <p className="text-4xl font-extrabold text-gray-900">
              {symbol}{Math.round(data.solarSavingsYear1 + (data.exportIncomeYear1 ?? 0)).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">solar + export</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">CO₂ saved/yr</p>
            <p className="text-4xl font-extrabold text-green-600">
              {fmtInt(data.annualCo2Saved)}
            </p>
            <p className="text-xs text-gray-400 mt-1">kg CO₂/year</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Export earnings/yr</p>
            <p className="text-4xl font-extrabold text-blue-600">
              {symbol}{Math.round(data.exportIncomeYear1 ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">year 1</p>
          </div>
        </div>

        {/* System summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">System summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'System', value: `${inputs.systemKwp.toFixed(1)} kWp` },
              { label: 'Panels', value: `${inputs.panelCount} × 400W` },
              { label: 'Battery', value: inputs.hasBattery ? `${inputs.batteryKwh} kWh` : 'None' },
              { label: 'Net cost', value: `${symbol}${(data.netCapex ?? 0).toLocaleString()}` },
              { label: 'Grant', value: `${symbol}${(data.grant ?? 0).toLocaleString()}` },
              {
                label: 'IRR',
                value: data.irr != null ? `${(data.irr * 100).toFixed(1)}%` : 'N/A',
                note: data.irrUnavailableReason === 'no_equity'
                  ? 'no equity (100% financed)'
                  : data.irrUnavailableReason === 'unstable'
                  ? 'cashflow not solvable'
                  : null,
              },
              { label: 'NPV (8%)', value: `${symbol}${Math.round(data.npv ?? 0).toLocaleString()}` },
              { label: `${data.horizonYears ?? 25}yr savings`, value: `${symbol}${Math.round(data.lifetimeSavings ?? 0).toLocaleString()}` },
            ].map((item: any) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="font-bold text-gray-900 mt-0.5">{item.value}</p>
                {item.note && <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{item.note}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Lifetime CO₂ + savings impact — free for everyone */}
        <LifetimeImpact
          annualCo2Saved={data.annualCo2Saved ?? 0}
          horizonYears={data.horizonYears ?? 25}
          lifetimeSavings={data.lifetimeSavings ?? 0}
          symbol={symbol}
        />

        {/* Calculation breakdown — visible to free + Pro alike */}
        <CalculationBreakdown data={data} inputs={inputs} symbol={symbol} />

        {/* Get quotes CTA */}
        <div className="bg-blue-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">Get installer quotes</h3>
            <p className="text-blue-200 text-sm">Connect with certified installers in your area. Free, no obligation.</p>
          </div>
          <button
            onClick={() => setShowLeadModal(true)}
            className="bg-white text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            Get quotes
          </button>
        </div>

        {/* Pro content */}
        <ProGate
          calculationId={id}
          priceLabel={`${symbol || '£'}3.99`}
          preview={
            <div className="space-y-8 p-6">
              <div className="h-64 bg-gray-100 rounded-xl" />
              <div className="h-40 bg-gray-100 rounded-xl" />
            </div>
          }
        >
          <div className="space-y-8">
            {/* Monthly usage vs generation */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">Monthly usage vs generation</h2>
              <p className="text-sm text-gray-500 mb-4">
                Where does your solar surplus go each month, and where does your demand still
                outrun the panels?
              </p>
              <MonthlyUsageVsGeneration
                monthlyProductionKwh={data.monthlyProductionKwh ?? []}
                monthlyConsumptionKwh={data.monthlyConsumptionKwh ?? []}
                monthlySelfConsumedKwh={data.monthlySelfConsumedKwh ?? []}
              />
            </div>

            {/* Bill pre-vs-post */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">Your bill — before vs after solar</h2>
              <p className="text-sm text-gray-500 mb-4">
                What a typical month looks like on the bill, year 1.
              </p>
              <BillComparisonChart
                monthlyConsumptionKwh={data.monthlyConsumptionKwh ?? []}
                monthlyGridImportKwh={data.monthlyGridImportKwh ?? []}
                monthlyExportKwh={data.monthlyExportKwh ?? []}
                importPricePerKwh={inputs.importPricePerKwh}
                exportPricePerKwh={inputs.exportPricePerKwh}
                symbol={symbol}
                monthlyDebtService={data.financing?.monthlyPayment ?? 0}
              />
            </div>

            {/* Lifetime cashflow chart */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">
                Lifetime cashflow ({data.horizonYears ?? 25} years)
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Bars show year-by-year solar savings, export income, battery and EV value;
                the line is your cumulative position.{' '}
                {data.inverterReplacementCost > 0 && (
                  <>An inverter replacement of {symbol}{Math.round(data.inverterReplacementCost).toLocaleString()} is
                  modelled in year {data.inverterReplacementYear}.</>
                )}
              </p>
              <CashflowChart cashflows={cashflows} symbol={symbol} />
            </div>

            {/* Stress-test sensitivity sweeps */}
            {data.extendedSensitivity && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-1">Dynamic stress-tester</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Move one variable at a time — system size, battery, equity invested, loan
                  rate — and see how payback, IRR and lifetime savings respond.
                </p>
                <ExtendedSensitivityPanel
                  systemSize={data.extendedSensitivity.systemSize ?? []}
                  battery={data.extendedSensitivity.battery ?? []}
                  equity={data.extendedSensitivity.equity ?? []}
                  interestRate={data.extendedSensitivity.interestRate ?? []}
                  symbol={symbol}
                />
              </div>
            )}

            {/* Sensitivity matrix — payback by price scenario */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">Sensitivity to energy prices</h2>
              <p className="text-sm text-gray-500 mb-4">Payback period (years) under different import / export price scenarios</p>
              <SensitivityMatrix grid={data.sensitivity?.grid ?? []} />
            </div>

            {/* Battery panel */}
            {inputs.hasBattery && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Battery economics</h2>
                <BatteryPanel data={data} inputs={inputs} symbol={symbol} />
              </div>
            )}

            {/* EV panel */}
            {inputs.hasEv && data.evCharging && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">EV charging analysis</h2>
                <EvPanel ev={data.evCharging} symbol={symbol} />
              </div>
            )}

            {/* Financing comparison */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Financing comparison</h2>
              <FinancingTable data={data} inputs={inputs} symbol={symbol} />
            </div>

            {/* Monthly export chart */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Monthly export earnings</h2>
              <MonthlyExportChart
                monthlyExportKwh={data.monthlyExportKwh ?? []}
                exportRate={inputs.exportPricePerKwh}
                symbol={symbol}
              />
            </div>

            {/* PDF download */}
            <div className="bg-gray-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1">Download your PDF report</h3>
                <p className="text-gray-400 text-sm">Full 7-page analysis including all assumptions</p>
              </div>
              <a
                href={`/api/report?id=${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                Download PDF
              </a>
            </div>
          </div>
        </ProGate>
      </main>

      {showLeadModal && (
        <LeadModal
          calculationId={id}
          onClose={() => setShowLeadModal(false)}
        />
      )}
    </div>
  );
}
