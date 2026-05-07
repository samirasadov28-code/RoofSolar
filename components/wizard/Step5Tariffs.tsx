'use client';

import { useState } from 'react';
import { useWizardStore } from '@/lib/store/wizardStore';
import { getGrant } from '@/lib/engine/grants';
import { NumericInput } from '@/components/ui/NumericInput';

function fmt(cc: string) {
  return cc === 'ie' ? '€' : cc === 'gb' ? '£' : '';
}

export function Step5Tariffs({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { inputs, setInputs } = useWizardStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const cc = inputs.countryCode;
  const symbol = fmt(cc);

  // Auto-update grant when system size changes
  const grantAmount = getGrant(cc, inputs.systemKwp);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Tariffs & grants</h2>
        <p className="text-gray-500">Pre-filled based on your location. Adjust as needed.</p>
      </div>

      {/* Tariff type */}
      <div>
        <p className="text-sm font-medium text-gray-900 mb-1">Tariff structure</p>
        <p className="text-xs text-gray-500 mb-2">
          Pick fixed if you pay one rate all day. Pick day/night if your contract has different
          peak and off-peak rates (e.g. Smart, EcoTracker, Economy 7).
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'fixed', title: 'Fixed rate', desc: 'one price all day' },
            { value: 'tou',   title: 'Day / Night',  desc: 'time-of-use bands' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setInputs({ tariffType: opt.value })}
              className={`text-left p-3 rounded-xl border transition-colors ${
                inputs.tariffType === opt.value
                  ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-semibold text-gray-900">{opt.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {inputs.tariffType === 'tou' ? 'Average / day rate (per kWh)' : 'Import price (per kWh)'}
          </label>
          <div className="relative">
            {symbol && <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{symbol}</span>}
            <NumericInput
              step={0.001}
              value={inputs.importPricePerKwh}
              onChange={(n) => setInputs({ importPricePerKwh: n })}
              className={`w-full border border-gray-300 rounded-lg ${symbol ? 'pl-6' : 'pl-3'} pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400`}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Export rate (per kWh)</label>
          <div className="relative">
            {symbol && <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{symbol}</span>}
            <NumericInput
              step={0.001}
              value={inputs.exportPricePerKwh}
              onChange={(n) => setInputs({ exportPricePerKwh: n })}
              className={`w-full border border-gray-300 rounded-lg ${symbol ? 'pl-6' : 'pl-3'} pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400`}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Government grant</label>
        <div className="relative">
          {symbol && <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{symbol}</span>}
          <NumericInput
            value={inputs.grant}
            onChange={(n) => setInputs({ grant: n })}
            className={`w-full border border-gray-300 rounded-lg ${symbol ? 'pl-6' : 'pl-3'} pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
        </div>
        {grantAmount > 0 && (
          <p className="text-xs text-green-700 mt-1">
            Auto-detected: {symbol}{grantAmount.toLocaleString()} based on your {inputs.systemKwp.toFixed(1)} kWp system
          </p>
        )}
      </div>

      {/* System cost */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          System cost (gross, before grant)
        </label>
        <div className="relative">
          {symbol && <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{symbol}</span>}
          <NumericInput
            step={100}
            value={
              inputs.systemCostGross > 0
                ? inputs.systemCostGross
                : inputs.panelCount * 900 + (inputs.hasBattery ? inputs.batteryKwh * 600 : 0) + (inputs.inverterType === 'hybrid' ? 500 : 0)
            }
            onChange={(n) => setInputs({ systemCostGross: n })}
            className={`w-full border border-gray-300 rounded-lg ${symbol ? 'pl-6' : 'pl-3'} pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Auto-estimate: {symbol}{(inputs.panelCount * 900 + (inputs.hasBattery ? inputs.batteryKwh * 600 : 0) + (inputs.inverterType === 'hybrid' ? 500 : 0)).toLocaleString()} — edit with your actual quote
        </p>
      </div>

      {/* Day/Night rates — visible whenever Time-of-Use tariff is picked */}
      {inputs.tariffType === 'tou' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day rate (per kWh)</label>
            <NumericInput
              step={0.001}
              value={inputs.dayPricePerKwh}
              onChange={(n) => setInputs({ dayPricePerKwh: n })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Night rate (per kWh)</label>
            <NumericInput
              step={0.001}
              value={inputs.nightPricePerKwh}
              onChange={(n) => setInputs({ nightPricePerKwh: n })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
      )}

      {/* Advanced */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced options
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 border-l-2 border-yellow-200 pl-4">
            {inputs.hasBattery && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Battery arbitrage</p>
                  <p className="text-xs text-gray-500">Buy cheap at night, offset peak rate</p>
                </div>
                <button
                  onClick={() => setInputs({ performArbitrage: !inputs.performArbitrage })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inputs.performArbitrage ? 'bg-yellow-400' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${inputs.performArbitrage ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-colors">Back</button>
        <button onClick={onNext} className="flex-[2] bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-xl transition-colors">Continue</button>
      </div>
    </div>
  );
}
