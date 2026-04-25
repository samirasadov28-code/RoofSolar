'use client';

import { useEffect } from 'react';
import { useWizardStore } from '@/lib/store/wizardStore';

const EV_VEHICLES = [
  { label: 'Tesla Model 3', efficiency: 15 },
  { label: 'Nissan Leaf', efficiency: 17 },
  { label: 'BMW i3', efficiency: 17 },
  { label: 'Average EV', efficiency: 18 },
  { label: 'Plug-in hybrid', efficiency: 12 },
  { label: 'Other (manual)', efficiency: 0 },
];

export function Step4System({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { inputs, setInputs } = useWizardStore();

  useEffect(() => {
    const recommended = Math.floor(inputs.roofAreaM2 / 1.7);
    const kwp = recommended * 0.4;
    setInputs({ panelCount: recommended, systemKwp: kwp });
  }, [inputs.roofAreaM2]);

  function adjustPanels(delta: number) {
    const newCount = Math.max(4, inputs.panelCount + delta);
    setInputs({ panelCount: newCount, systemKwp: newCount * 0.4 });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">System size</h2>
        <p className="text-gray-500">We recommend a size based on your roof area.</p>
      </div>

      {/* Panel count */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800 font-medium mb-3">
          Recommended: {Math.floor(inputs.roofAreaM2 / 1.7)} panels ({(Math.floor(inputs.roofAreaM2 / 1.7) * 0.4).toFixed(1)} kWp) for your roof size
        </p>
        <div className="flex items-center gap-4">
          <button onClick={() => adjustPanels(-1)} className="w-10 h-10 bg-white border border-gray-300 rounded-lg font-bold text-lg hover:bg-gray-50">−</button>
          <div className="flex-1 text-center">
            <p className="text-3xl font-bold text-gray-900">{inputs.panelCount}</p>
            <p className="text-sm text-gray-500">panels × 400W = <strong>{inputs.systemKwp.toFixed(1)} kWp</strong></p>
          </div>
          <button onClick={() => adjustPanels(1)} className="w-10 h-10 bg-white border border-gray-300 rounded-lg font-bold text-lg hover:bg-gray-50">+</button>
        </div>
      </div>

      {/* Battery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Battery storage</p>
            <p className="text-xs text-gray-500">Store surplus solar for evening use</p>
          </div>
          <button
            onClick={() => setInputs({ hasBattery: !inputs.hasBattery })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inputs.hasBattery ? 'bg-yellow-400' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${inputs.hasBattery ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {inputs.hasBattery && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Battery size — <span className="text-yellow-600">{inputs.batteryKwh} kWh</span>
            </label>
            <input
              type="range"
              min={5}
              max={15}
              step={2.5}
              value={inputs.batteryKwh}
              onChange={(e) => setInputs({ batteryKwh: Number(e.target.value) })}
              className="w-full accent-yellow-400"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 kWh</span><span>10 kWh</span><span>15 kWh</span>
            </div>
          </div>
        )}
      </div>

      {/* EV */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Electric vehicle</p>
            <p className="text-xs text-gray-500">Include EV charging savings analysis</p>
          </div>
          <button
            onClick={() => setInputs({ hasEv: !inputs.hasEv })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inputs.hasEv ? 'bg-yellow-400' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${inputs.hasEv ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {inputs.hasEv && (
          <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual mileage (km)</label>
              <input
                type="number"
                value={inputs.annualMileageKm}
                onChange={(e) => setInputs({ annualMileageKm: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <select
                value={inputs.vehicleEfficiencyKwhPer100km}
                onChange={(e) => {
                  const eff = Number(e.target.value);
                  if (eff > 0) setInputs({ vehicleEfficiencyKwhPer100km: eff });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
              >
                {EV_VEHICLES.map((v) => (
                  <option key={v.label} value={v.efficiency}>{v.label}{v.efficiency > 0 ? ` (${v.efficiency} kWh/100km)` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Charging preference</label>
              <div className="flex gap-2">
                {(['daytime', 'evening', 'mixed'] as const).map((pref) => (
                  <button
                    key={pref}
                    onClick={() => setInputs({ chargingPreference: pref })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${inputs.chargingPreference === pref ? 'bg-yellow-400 text-gray-900' : 'bg-white text-gray-600 border border-gray-300'}`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Public charging — <span className="text-yellow-600">{Math.round(inputs.publicChargingPct * 100)}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={inputs.publicChargingPct * 100}
                onChange={(e) => setInputs({ publicChargingPct: Number(e.target.value) / 100 })}
                className="w-full accent-yellow-400"
              />
            </div>
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
