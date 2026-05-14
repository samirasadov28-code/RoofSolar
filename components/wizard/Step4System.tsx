'use client';

import { useEffect } from 'react';
import { useWizardStore } from '@/lib/store/wizardStore';
import { NumericInput } from '@/components/ui/NumericInput';
import { useT } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/types';

const EV_VEHICLES = [
  { label: 'Tesla Model 3', efficiency: 15 },
  { label: 'Nissan Leaf', efficiency: 17 },
  { label: 'BMW i3', efficiency: 17 },
  { label: 'Average EV', efficiency: 18 },
  { label: 'Plug-in hybrid', efficiency: 12 },
  { label: 'Other (manual)', efficiency: 0 },
];

export function Step4System({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const t = useT();
  const { inputs, setInputs } = useWizardStore();

  useEffect(() => {
    if (inputs.systemCostGross > 0) return;
    const recommended = Math.max(4, Math.floor(inputs.roofAreaM2 / 1.7));
    setInputs({ panelCount: recommended, systemKwp: +(recommended * 0.4).toFixed(2) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs.roofAreaM2]);

  function adjustPanels(delta: number) {
    const newCount = Math.max(4, inputs.panelCount + delta);
    setInputs({ panelCount: newCount, systemKwp: newCount * 0.4 });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.step4.title}</h2>
        <p className="text-gray-500">{t.step4.subtitle}</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800 font-medium mb-3">
          {fmt(t.step4.recommended, { panels: Math.floor(inputs.roofAreaM2 / 1.7), kwp: (Math.floor(inputs.roofAreaM2 / 1.7) * 0.4).toFixed(1) })}
        </p>
        <div className="flex items-center gap-4">
          <button onClick={() => adjustPanels(-1)} className="w-10 h-10 bg-white border border-gray-300 rounded-lg font-bold text-lg hover:bg-gray-50">−</button>
          <div className="flex-1 text-center">
            <p className="text-3xl font-bold text-gray-900">{inputs.panelCount}</p>
            <p className="text-sm text-gray-500">{t.step4.panelsSuffix} <strong>{inputs.systemKwp.toFixed(1)} kWp</strong></p>
          </div>
          <button onClick={() => adjustPanels(1)} className="w-10 h-10 bg-white border border-gray-300 rounded-lg font-bold text-lg hover:bg-gray-50">+</button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-900 mb-1">{t.step4.inverterTypeTitle}</p>
        <p className="text-xs text-gray-500 mb-3">{t.step4.inverterHint}</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'standard', title: t.step4.inverterStandard, desc: t.step4.inverterStandardDesc },
            { value: 'hybrid',   title: t.step4.inverterHybrid,   desc: t.step4.inverterHybridDesc },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setInputs({ inverterType: opt.value })}
              className={`text-left p-3 rounded-xl border transition-colors ${
                inputs.inverterType === opt.value
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

      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-900">{t.step4.batteryTitle}</p>
            <p className="text-xs text-gray-500">
              {t.step4.batteryDesc}{inputs.inverterType !== 'hybrid' && t.step4.batteryAutoSwitch}
            </p>
          </div>
          <button
            onClick={() => setInputs({
              hasBattery: !inputs.hasBattery,
              ...(!inputs.hasBattery && inputs.inverterType !== 'hybrid' ? { inverterType: 'hybrid' as const } : {}),
            })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inputs.hasBattery ? 'bg-yellow-400' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${inputs.hasBattery ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {inputs.hasBattery && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.step4.batterySize} <span className="text-yellow-600">{inputs.batteryKwh} kWh</span>
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

      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-900">{t.step4.evTitle}</p>
            <p className="text-xs text-gray-500">{t.step4.evDesc}</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.step4.annualMileage}</label>
              <NumericInput
                value={inputs.annualMileageKm}
                onChange={(n) => setInputs({ annualMileageKm: n })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.step4.vehicleLabel}</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.step4.chargingPref}</label>
              <div className="flex gap-2">
                {([
                  { value: 'daytime', label: t.step4.dayCharging },
                  { value: 'evening', label: t.step4.eveningCharging },
                  { value: 'mixed',   label: t.step4.mixedCharging },
                ] as const).map((pref) => (
                  <button
                    key={pref.value}
                    onClick={() => setInputs({ chargingPreference: pref.value })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${inputs.chargingPreference === pref.value ? 'bg-yellow-400 text-gray-900' : 'bg-white text-gray-600 border border-gray-300'}`}
                  >
                    {pref.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.step4.publicCharging} <span className="text-yellow-600">{Math.round(inputs.publicChargingPct * 100)}%</span>
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
        <button onClick={onBack} className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-colors">{t.common.back}</button>
        <button onClick={onNext} className="flex-[2] bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-xl transition-colors">{t.common.continue}</button>
      </div>
    </div>
  );
}
