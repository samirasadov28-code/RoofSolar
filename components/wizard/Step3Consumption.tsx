'use client';

import { useMemo, useState } from 'react';
import { useWizardStore } from '@/lib/store/wizardStore';
import { NumericInput } from '@/components/ui/NumericInput';
import { estimateAnnualKwh } from '@/lib/engine/householdEstimator';
import { getCountryDefaults } from '@/lib/countryDefaults';
import { useT } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/types';

export function Step3Consumption({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const t = useT();
  const { inputs, setInputs } = useWizardStore();
  const [useBill, setUseBill] = useState(false);
  const [monthlyBill, setMonthlyBill] = useState(0);
  const [unitPrice, setUnitPrice] = useState(inputs.importPricePerKwh);

  function calcFromBill() {
    if (monthlyBill > 0 && unitPrice > 0) {
      const annual = (monthlyBill / unitPrice) * 12;
      setInputs({ annualKwh: Math.round(annual) });
    }
  }

  const cc = inputs.countryCode;
  const countryAvg = useMemo(() => getCountryDefaults(cc).annualKwh, [cc]);
  const householdEstimate = useMemo(
    () => estimateAnnualKwh(inputs.houseAreaSqM, inputs.householdSize, countryAvg),
    [inputs.houseAreaSqM, inputs.householdSize, countryAvg]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.step3.title}</h2>
        <p className="text-gray-500">{t.step3.subtitle}</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{t.step3.estimatorTitle}</p>
            <p className="text-xs text-gray-600">{t.step3.estimatorSubtitle}</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-white border border-amber-300 rounded-full px-2 py-0.5 whitespace-nowrap">
            {t.common.optional}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t.step3.floorArea}</label>
            <NumericInput
              min={20}
              max={500}
              value={inputs.houseAreaSqM}
              onChange={(n) => setInputs({ houseAreaSqM: n })}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t.step3.householdPeople}</label>
            <NumericInput
              min={1}
              max={10}
              value={inputs.householdSize}
              onChange={(n) => setInputs({ householdSize: n })}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-700">
            <strong>{fmt(t.step3.estimateLabel, { kwh: householdEstimate.toLocaleString() })}</strong>
            <span className="text-gray-500"> ({inputs.householdSize} ppl, {inputs.houseAreaSqM} m²)</span>
          </p>
          <button
            onClick={() => setInputs({ annualKwh: householdEstimate })}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            {t.step3.useEstimate}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setUseBill(false)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${!useBill ? 'bg-yellow-400 text-gray-900' : 'bg-gray-100 text-gray-600'}`}
        >
          {t.step3.tabAnnualKwh}
        </button>
        <button
          onClick={() => setUseBill(true)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${useBill ? 'bg-yellow-400 text-gray-900' : 'bg-gray-100 text-gray-600'}`}
        >
          {t.step3.tabMonthlyBill}
        </button>
      </div>

      {!useBill ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.step3.annualUseLabel}</label>
          <NumericInput
            min={500}
            max={50000}
            value={inputs.annualKwh}
            onChange={(n) => setInputs({ annualKwh: n })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <p className="text-xs text-gray-400 mt-1">{fmt(t.step3.countryAvg, { kwh: countryAvg.toLocaleString() })}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.step3.avgBillLabel}</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm">
                {cc === 'ie' ? '€' : '£'}
              </span>
              <NumericInput
                value={monthlyBill}
                onChange={(n) => setMonthlyBill(n)}
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="120"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.step3.unitPriceLabel}</label>
            <NumericInput
              step={0.001}
              value={unitPrice}
              onChange={(n) => setUnitPrice(n)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <button
            onClick={calcFromBill}
            className="w-full border border-yellow-400 text-yellow-700 font-medium py-2 rounded-lg text-sm hover:bg-yellow-50 transition-colors"
          >
            {t.step3.calcFromBillBtn}
          </button>
          {inputs.annualKwh > 0 && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
              {fmt(t.step3.estimatedKwh, { kwh: inputs.annualKwh.toLocaleString() })}
            </p>
          )}
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-gray-900 mb-1">{t.step3.applianceTimingTitle}</p>
        <p className="text-xs text-gray-500 mb-2">{t.step3.applianceTimingHint}</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'daytime', title: t.step3.profileDaytime,  desc: t.step3.profileDaytimeDesc, pct: '~55%' },
            { value: 'mixed',   title: t.step3.profileMixed,    desc: t.step3.profileMixedDesc,   pct: '~40%' },
            { value: 'evening', title: t.step3.profileEvening,  desc: t.step3.profileEveningDesc, pct: '~25%' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setInputs({ consumptionProfile: opt.value })}
              className={`text-left p-3 rounded-xl border transition-colors ${
                inputs.consumptionProfile === opt.value
                  ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-semibold text-gray-900">{opt.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              <p className="text-[10px] text-amber-700 mt-1 font-bold uppercase tracking-wider">
                {fmt(t.step3.selfUse, { pct: opt.pct })}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-colors">
          {t.common.back}
        </button>
        <button onClick={onNext} disabled={!inputs.annualKwh} className="flex-[2] bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
          {t.common.continue}
        </button>
      </div>
    </div>
  );
}
