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
import { LiveStressTester } from '@/components/results/LiveStressTester';
import { EquipmentShortlist } from '@/components/results/EquipmentShortlist';
import { DailyBatteryChart } from '@/components/results/DailyBatteryChart';
import { LeadModal } from '@/components/results/LeadModal';
import { ViewModeToggle } from '@/components/results/ViewModeToggle';
import type { AnnualCashflow } from '@/lib/engine/cashflow';
import { fmtInt } from '@/lib/format';
import { useT } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/types';

function getCurrencySymbol(countryCode: string) {
  return countryCode === 'ie' ? '€' : countryCode === 'gb' ? '£' : '';
}

function shortAddress(full: string | undefined): string {
  if (!full) return '';
  const parts = full.split(',').map((s) => s.trim()).filter(Boolean);
  const out = parts.slice(0, 2).join(', ');
  return out.length > 38 ? out.slice(0, 36) + '…' : out;
}

function PaybackCard({ months }: { months: number }) {
  const t = useT();
  const years = isNaN(months) ? null : months / 12;
  const color = !years ? 'text-red-600' : years < 8 ? 'text-green-600' : years < 12 ? 'text-yellow-600' : 'text-red-600';
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500 mb-1">{t.results.paybackPeriod}</p>
      <p className={`text-4xl font-extrabold ${color}`}>
        {years ? fmt(t.results.paybackYrs, { n: years.toFixed(1) }) : t.common.na}
      </p>
      {years && <p className="text-xs text-gray-400 mt-1">{years < 8 ? t.results.paybackExcellent : years < 12 ? t.results.paybackGood : t.results.paybackLong}</p>}
    </div>
  );
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const t = useT();
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
          <p className="text-gray-600">{t.results.loadingText}</p>
          <p className="text-xs text-gray-400 mt-2">
            {t.results.loadingNote} <Link href="/calculator" className="underline">{t.results.loadingLink}</Link>
          </p>
        </div>
      </div>
    );
  }

  const symbol = getCurrencySymbol(inputs.countryCode);
  const id = params.id;
  const cashflows: AnnualCashflow[] = data.cashflows ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <img src="/logo-192.png" alt="RoofSolar" width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0" />
            <span className="font-bold text-gray-900">RoofSolar</span>
          </Link>
          <span
            className="hidden sm:block text-sm text-gray-500 text-center truncate"
            title={inputs.displayName}
          >
            {shortAddress(inputs.displayName)}
          </span>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <ViewModeToggle calculationId={id} />
            <Link href="/calculator" className="text-sm text-gray-600 hover:text-gray-900">
              {t.nav.newAnalysis}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.results.pageTitle}</h1>
          <p className="text-gray-500 text-sm">
            {inputs.systemKwp.toFixed(1)} kWp system · {fmtInt(data.annualProductionKwh)} kWh/yr · Source: {data.dataSource}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PaybackCard months={data.paybackMonths} />

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">{t.results.year1Savings}</p>
            <p className="text-4xl font-extrabold text-gray-900">
              {symbol}{Math.round(data.solarSavingsYear1 + (data.exportIncomeYear1 ?? 0)).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">{t.results.solarPlusExport}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">{t.results.co2SavedYr}</p>
            <p className="text-4xl font-extrabold text-green-600">
              {fmtInt(data.annualCo2Saved)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{t.results.kgCo2Year}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">{t.results.exportEarnings}</p>
            <p className="text-4xl font-extrabold text-blue-600">
              {symbol}{Math.round(data.exportIncomeYear1 ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">{t.results.year1Label}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">{t.results.systemSummary}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: t.results.labelSystem, value: `${inputs.systemKwp.toFixed(1)} kWp` },
              { label: t.results.labelPanels, value: `${inputs.panelCount} × 400W` },
              { label: t.results.labelBattery, value: inputs.hasBattery ? `${inputs.batteryKwh} kWh` : t.results.noneLabel },
              { label: t.results.labelNetCost, value: `${symbol}${(data.netCapex ?? 0).toLocaleString()}` },
              { label: t.results.labelGrant, value: `${symbol}${(data.grant ?? 0).toLocaleString()}` },
              {
                label: t.results.labelIrr,
                value: data.irr != null ? `${(data.irr * 100).toFixed(1)}%` : t.common.na,
                note: data.irrUnavailableReason === 'no_equity'
                  ? t.results.noteNoEquity
                  : data.irrUnavailableReason === 'unstable'
                  ? t.results.noteCashflowUnstable
                  : null,
              },
              { label: t.results.labelNpv, value: `${symbol}${Math.round(data.npv ?? 0).toLocaleString()}` },
              { label: fmt(t.results.labelLifetimeSavings, { n: data.horizonYears ?? 25 }), value: `${symbol}${Math.round(data.lifetimeSavings ?? 0).toLocaleString()}` },
            ].map((item: any) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="font-bold text-gray-900 mt-0.5">{item.value}</p>
                {item.note && <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{item.note}</p>}
              </div>
            ))}
          </div>
        </div>

        <LifetimeImpact
          annualCo2Saved={data.annualCo2Saved ?? 0}
          horizonYears={data.horizonYears ?? 25}
          lifetimeSavings={data.lifetimeSavings ?? 0}
          symbol={symbol}
        />

        <CalculationBreakdown data={data} inputs={inputs} symbol={symbol} />

        <div className="bg-blue-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">{t.results.quotesTitle}</h3>
            <p className="text-blue-200 text-sm">{t.results.quotesDesc}</p>
          </div>
          <button
            onClick={() => setShowLeadModal(true)}
            className="bg-white text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            {t.results.quotesBtn}
          </button>
        </div>

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
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">{t.results.monthlyUsageTitle}</h2>
              <p className="text-sm text-gray-500 mb-4">{t.results.monthlyUsageDesc}</p>
              <MonthlyUsageVsGeneration
                monthlyProductionKwh={data.monthlyProductionKwh ?? []}
                monthlyConsumptionKwh={data.monthlyConsumptionKwh ?? []}
                monthlySelfConsumedKwh={data.monthlySelfConsumedKwh ?? []}
              />
            </div>

            {data.hourlySimulation && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-1">{t.results.hourlyFlowsTitle}</h2>
                <DailyBatteryChart
                  months={data.hourlySimulation.months}
                  batteryKwh={inputs.hasBattery ? (inputs.batteryKwh ?? 0) : 0}
                  symbol={symbol}
                  annualArbitrageSavings={data.hourlySimulation.annualArbitrageSavings ?? 0}
                  importPricePerKwh={inputs.importPricePerKwh}
                  performArbitrage={!!inputs.performArbitrage}
                />
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">{t.results.billCompTitle}</h2>
              <p className="text-sm text-gray-500 mb-4">{t.results.billCompDesc}</p>
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

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">
                {fmt(t.results.lifetimeCashflowTitle, { n: data.horizonYears ?? 25 })}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {t.results.lifetimeCashflowDesc}{' '}
                {data.inverterReplacementCost > 0 && (
                  fmt(t.results.inverterReplacement, {
                    symbol,
                    amount: Math.round(data.inverterReplacementCost).toLocaleString(),
                    year: data.inverterReplacementYear,
                  })
                )}
              </p>
              <CashflowChart cashflows={cashflows} symbol={symbol} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">{t.results.stressTesterTitle}</h2>
              <p className="text-sm text-gray-500 mb-4">{t.results.stressTesterDesc}</p>
              <LiveStressTester
                netCapex={data.netCapex ?? 0}
                currentEquityPct={1 - (inputs.loanCoveragePct ?? 0)}
                currentAnnualRate={inputs.annualRatePct ?? 0.07}
                tenorYears={inputs.tenorYears ?? 10}
                horizonYears={data.horizonYears ?? 25}
                year1SolarSavings={data.solarSavingsYear1 ?? 0}
                year1ExportIncome={data.exportIncomeYear1 ?? 0}
                year1BatteryValue={(data.batteryResult?.arbitrageProfit ?? []).reduce((a: number, b: number) => a + b, 0) / (data.horizonYears ?? 25)}
                year1EvSavings={data.evCharging?.annualSavingVsGrid ?? 0}
                inverterReplacementYear={data.inverterReplacementYear ?? 12}
                inverterReplacementCost={data.inverterReplacementCost ?? 1200}
                financingMode={inputs.financingMode ?? 'outright'}
                symbol={symbol}
              />
            </div>

            {data.extendedSensitivity && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-1">{t.results.sensitivitySweepsTitle}</h2>
                <p className="text-sm text-gray-500 mb-4">{t.results.sensitivitySweepsDesc}</p>
                <ExtendedSensitivityPanel
                  systemSize={data.extendedSensitivity.systemSize ?? []}
                  battery={data.extendedSensitivity.battery ?? []}
                  equity={data.extendedSensitivity.equity ?? []}
                  interestRate={data.extendedSensitivity.interestRate ?? []}
                  symbol={symbol}
                />
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">{t.results.sensitivityPricesTitle}</h2>
              <p className="text-sm text-gray-500 mb-4">{t.results.sensitivityPricesDesc}</p>
              <SensitivityMatrix grid={data.sensitivity?.grid ?? []} />
            </div>

            {inputs.hasBattery && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">{t.results.batteryEconomicsTitle}</h2>
                <BatteryPanel data={data} inputs={inputs} symbol={symbol} />
              </div>
            )}

            {inputs.hasEv && data.evCharging && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">{t.results.evAnalysisTitle}</h2>
                <EvPanel ev={data.evCharging} symbol={symbol} />
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">{t.results.equipmentTitle}</h2>
              <p className="text-sm text-gray-500 mb-4">{t.results.equipmentDesc}</p>
              <EquipmentShortlist inputs={inputs} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">{t.results.financingCompTitle}</h2>
              <FinancingTable data={data} inputs={inputs} symbol={symbol} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">{t.results.monthlyExportTitle}</h2>
              <MonthlyExportChart
                monthlyExportKwh={data.monthlyExportKwh ?? []}
                exportRate={inputs.exportPricePerKwh}
                symbol={symbol}
              />
            </div>

            <div className="bg-gray-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1">{t.results.pdfTitle}</h3>
                <p className="text-gray-400 text-sm">{t.results.pdfDesc}</p>
              </div>
              <a
                href={`/api/report?id=${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                {t.results.pdfBtn}
              </a>
            </div>
          </div>
        </ProGate>
      </main>

      {showLeadModal && (
        <LeadModal
          calculationId={id}
          countryCode={inputs.countryCode}
          onClose={() => setShowLeadModal(false)}
        />
      )}
    </div>
  );
}
