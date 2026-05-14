'use client';

import { useWizardStore } from '@/lib/store/wizardStore';
import { calcFinancing } from '@/lib/engine/financing';
import { useT } from '@/lib/i18n';

const TENORS = [5, 7, 10, 15];

function getCurrencySymbol(cc: string) {
  return cc === 'ie' ? '€' : cc === 'gb' ? '£' : '';
}

export function Step6Financing({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const t = useT();
  const { inputs, setInputs } = useWizardStore();
  const symbol = getCurrencySymbol(inputs.countryCode);

  const systemCostGross =
    inputs.systemCostGross > 0
      ? inputs.systemCostGross
      : inputs.panelCount * 900 + (inputs.hasBattery ? inputs.batteryKwh * 600 : 0);
  const netCapex = Math.max(0, systemCostGross - inputs.grant);

  const { monthlyPayment, loanAmount, upfrontCash } = calcFinancing({
    netCapex,
    financingMode: inputs.financingMode,
    loanCoveragePct: inputs.loanCoveragePct,
    annualRatePct: inputs.annualRatePct,
    tenorYears: inputs.tenorYears,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.step6.title}</h2>
        <p className="text-gray-500">{t.step6.subtitle}</p>
      </div>

      <div className="space-y-2">
        {[
          { id: 'outright' as const, label: t.step6.outright, desc: t.step6.outrightDesc },
          { id: 'loan' as const, label: t.step6.loan, desc: t.step6.loanDesc },
          { id: 'mortgage' as const, label: t.step6.mortgage, desc: t.step6.mortgageDesc },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              setInputs({
                financingMode: opt.id,
                annualRatePct: opt.id === 'mortgage' ? 0.035 : opt.id === 'loan' ? 0.065 : 0,
              });
            }}
            className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${inputs.financingMode === opt.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${inputs.financingMode === opt.id ? 'border-yellow-500 bg-yellow-400' : 'border-gray-300'}`}>
                {inputs.financingMode === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {inputs.financingMode !== 'outright' && (
        <div className="space-y-4 bg-gray-50 rounded-xl p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.step6.pctFinanced} <span className="text-yellow-600">{Math.round(inputs.loanCoveragePct * 100)}%</span>
            </label>
            <input
              type="range"
              min={25}
              max={100}
              step={5}
              value={inputs.loanCoveragePct * 100}
              onChange={(e) => setInputs({ loanCoveragePct: Number(e.target.value) / 100 })}
              className="w-full accent-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.step6.annualRate} <span className="text-yellow-600">{(inputs.annualRatePct * 100).toFixed(2)}%</span>
            </label>
            <input
              type="range"
              min={1}
              max={15}
              step={0.25}
              value={inputs.annualRatePct * 100}
              onChange={(e) => setInputs({ annualRatePct: Number(e.target.value) / 100 })}
              className="w-full accent-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.step6.loanTerm}</label>
            <div className="flex gap-2">
              {TENORS.map((tenor) => (
                <button
                  key={tenor}
                  onClick={() => setInputs({ tenorYears: tenor })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${inputs.tenorYears === tenor ? 'bg-yellow-400 text-gray-900' : 'bg-white border border-gray-300 text-gray-600'}`}
                >
                  {tenor}yr
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-yellow-200 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t.step6.loanAmount}</span>
              <span className="font-semibold">{symbol}{loanAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t.step6.upfrontCash}</span>
              <span className="font-semibold">{symbol}{upfrontCash.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
              <span className="text-gray-900 font-medium">{t.step6.monthlyPayment}</span>
              <span className="text-yellow-700 font-bold">{symbol}{monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-colors">{t.common.back}</button>
        <button onClick={onNext} className="flex-[2] bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-xl transition-colors">{t.common.continue}</button>
      </div>
    </div>
  );
}
