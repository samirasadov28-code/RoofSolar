'use client';

import { useState } from 'react';
import { useWizardStore } from '@/lib/store/wizardStore';

export function Step3Consumption({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { inputs, setInputs } = useWizardStore();
  const [useBill, setUseBill] = useState(false);
  const [monthlyBill, setMonthlyBill] = useState('');
  const [unitPrice, setUnitPrice] = useState(String(inputs.importPricePerKwh));

  function calcFromBill() {
    const bill = parseFloat(monthlyBill);
    const price = parseFloat(unitPrice);
    if (bill > 0 && price > 0) {
      const annual = (bill / price) * 12;
      setInputs({ annualKwh: Math.round(annual) });
    }
  }

  const cc = inputs.countryCode;
  const avgLabel = cc === 'ie' ? 'Ireland average: ~4,200 kWh/yr' : 'UK average 3-bed: ~3,100 kWh/yr';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Electricity consumption</h2>
        <p className="text-gray-500">We use this to calculate your self-consumption rate.</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setUseBill(false)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${!useBill ? 'bg-yellow-400 text-gray-900' : 'bg-gray-100 text-gray-600'}`}
        >
          Annual kWh
        </button>
        <button
          onClick={() => setUseBill(true)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${useBill ? 'bg-yellow-400 text-gray-900' : 'bg-gray-100 text-gray-600'}`}
        >
          Monthly bill
        </button>
      </div>

      {!useBill ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Annual electricity use (kWh)</label>
          <input
            type="number"
            min={500}
            max={50000}
            value={inputs.annualKwh}
            onChange={(e) => setInputs({ annualKwh: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <p className="text-xs text-gray-400 mt-1">{avgLabel}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Average monthly bill</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-sm">
                {cc === 'ie' ? '€' : '£'}
              </span>
              <input
                type="number"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="120"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit price (per kWh)</label>
            <input
              type="number"
              step="0.001"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <button
            onClick={calcFromBill}
            className="w-full border border-yellow-400 text-yellow-700 font-medium py-2 rounded-lg text-sm hover:bg-yellow-50 transition-colors"
          >
            Calculate annual kWh
          </button>
          {inputs.annualKwh > 0 && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
              Estimated: {inputs.annualKwh.toLocaleString()} kWh/yr
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-colors">
          Back
        </button>
        <button onClick={onNext} disabled={!inputs.annualKwh} className="flex-[2] bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
          Continue
        </button>
      </div>
    </div>
  );
}
