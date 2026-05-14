'use client';

import { useWizardStore } from '@/lib/store/wizardStore';
import { NumericInput } from '@/components/ui/NumericInput';
import { useT } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/types';

const COMPASS_DIRECTIONS = [
  { label: 'N', deg: 0 },
  { label: 'NE', deg: 45 },
  { label: 'E', deg: 90 },
  { label: 'SE', deg: 135 },
  { label: 'S', deg: 180 },
  { label: 'SW', deg: 225 },
  { label: 'W', deg: 270 },
  { label: 'NW', deg: 315 },
];

function getCompassLabel(deg: number) {
  const dir = COMPASS_DIRECTIONS.find((d) => d.deg === deg);
  return dir?.label ?? `${deg}°`;
}

export function Step2Roof({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const t = useT();
  const { inputs, setInputs } = useWizardStore();

  function getShadingLabel(pct: number) {
    if (pct <= 0) return t.step2.shadingNone;
    if (pct <= 10) return t.step2.shadingLight;
    if (pct <= 25) return t.step2.shadingModerate;
    return t.step2.shadingHeavy;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.step2.title}</h2>
        <p className="text-gray-500">{t.step2.subtitle}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.step2.roofAreaLabel}
        </label>
        <NumericInput
          min={10}
          max={300}
          value={inputs.roofAreaM2}
          onChange={(n) => setInputs({ roofAreaM2: n })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <p className="text-xs text-gray-400 mt-1">{t.step2.roofAreaHint}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.step2.orientationLabel} <span className="text-yellow-600">{getCompassLabel(inputs.azimuthDeg)}</span>
        </label>
        <div className="grid grid-cols-8 gap-1.5">
          {COMPASS_DIRECTIONS.map((d) => (
            <button
              key={d.label}
              onClick={() => setInputs({ azimuthDeg: d.deg })}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                inputs.azimuthDeg === d.deg
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.step2.pitchLabel} <span className="text-yellow-600">{inputs.tiltDeg}°</span>
        </label>
        <input
          type="range"
          min={0}
          max={60}
          step={1}
          value={inputs.tiltDeg}
          onChange={(e) => setInputs({ tiltDeg: Number(e.target.value) })}
          className="w-full accent-yellow-400"
        />
        <p className="text-xs text-gray-400 mt-1">
          {(() => {
            const lat = Math.abs(inputs.lat ?? 50);
            const lo = Math.max(15, Math.round(lat * 0.85 - 5));
            const hi = Math.min(55, Math.round(lat * 0.85 + 5));
            return fmt(t.step2.pitchHint, { lo, hi });
          })()}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.step2.shadingLabel} <span className="text-yellow-600">{inputs.shadingLossPct}% ({getShadingLabel(inputs.shadingLossPct)})</span>
        </label>
        <input
          type="range"
          min={0}
          max={40}
          step={1}
          value={inputs.shadingLossPct}
          onChange={(e) => setInputs({ shadingLossPct: Number(e.target.value) })}
          className="w-full accent-yellow-400"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{t.step2.shadingNone}</span>
          <span>{t.step2.shadingLight}</span>
          <span>{t.step2.shadingModerate}</span>
          <span>{t.step2.shadingHeavy}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-colors">
          {t.common.back}
        </button>
        <button onClick={onNext} className="flex-[2] bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
          {t.common.continue}
        </button>
      </div>
    </div>
  );
}
