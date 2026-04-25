'use client';

import { useState } from 'react';
import { useWizardStore } from '@/lib/store/wizardStore';
import { getGrant } from '@/lib/engine/grants';

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Import price (per kWh)</label>
          <div className="relative">
            {symbol && <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{symbol}</span>}
            <input
              type="number"
              step="0.001"
              value={inputs.importPricePerKwh}
              onChange={(e) => setInputs({ importPricePerKwh: Number(e.target.value) })}
              className={`w-full border border-gray-300 rounded-lg ${symbol ? 'pl-6' : 'pl-3'} pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400`}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Export rate (per kWh)</label>
          <div className="relative">
            {symbol && <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{symbol}</span>}
            <input
              type="number"
              step="0.001"
              value={inputs.exportPricePerKwh}
              onChange={(e) => setInputs({ exportPricePerKwh: Number(e.target.value) })}
              className={`w-full border border-gray-300 rounded-lg ${symbol ? 'pl-6' : 'pl-3'} pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400`}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Government grant</label>
        <div className="relative">
          {symbol && <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{symbol}</span>}
          <input
            type="number"
            value={inputs.grant}
            onChange={(e) => setInputs({ grant: Number(e.target.value) })}
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
        <label className="block text-sm font-medium text-gray-700 mb-1">System cost (gross, before grant)</label>
        <div className="relative">
          {symbol && <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{symbol}</span>}
          <input
            type="number"
            step="100"
            value={inputs.panelCount * 900 + (inputs.hasBattery ? inputs.batteryKwh * 600 : 0)}
            readOnly
            className={`w-full border border-gray-200 bg-gray-50 rounded-lg ${symbol ? 'pl-6' : 'pl-3'} pr-3 py-2.5 text-sm`}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Estimated at £900/panel + £600/kWh battery</p>
      </div>

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day rate (per kWh)</label>
                <input
                  type="number"
                  step="0.001"
                  value={inputs.dayPricePerKwh}
                  onChange={(e) => setInputs({ dayPricePerKwh: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Night rate (per kWh)</label>
                <input
                  type="number"
                  step="0.001"
                  value={inputs.nightPricePerKwh}
                  onChange={(e) => setInputs({ nightPricePerKwh: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
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
