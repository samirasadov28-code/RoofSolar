'use client';

import { useWizardStore } from '@/lib/store/wizardStore';
import { NumericInput } from '@/components/ui/NumericInput';

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

const SHADING_LABELS = ['None', 'Light', 'Moderate', 'Heavy'];

function getCompassLabel(deg: number) {
  const dir = COMPASS_DIRECTIONS.find((d) => d.deg === deg);
  return dir?.label ?? `${deg}°`;
}

export function Step2Roof({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { inputs, setInputs } = useWizardStore();

  function getShadingLabel(pct: number) {
    if (pct <= 0) return SHADING_LABELS[0];
    if (pct <= 10) return SHADING_LABELS[1];
    if (pct <= 25) return SHADING_LABELS[2];
    return SHADING_LABELS[3];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Roof details</h2>
        <p className="text-gray-500">Help us size your solar system accurately.</p>
      </div>

      {/* Roof area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Usable roof area (m²)
        </label>
        <NumericInput
          min={10}
          max={300}
          value={inputs.roofAreaM2}
          onChange={(n) => setInputs({ roofAreaM2: n })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <p className="text-xs text-gray-400 mt-1">Typical 3-bed semi = 40–60 m²</p>
      </div>

      {/* Orientation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Roof orientation — <span className="text-yellow-600">{getCompassLabel(inputs.azimuthDeg)}</span>
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

      {/* Pitch */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Roof pitch — <span className="text-yellow-600">{inputs.tiltDeg}°</span>
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
        <p className="text-xs text-gray-400 mt-1">Most UK/IE roofs are 30–40°</p>
      </div>

      {/* Shading */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Shading — <span className="text-yellow-600">{inputs.shadingLossPct}% ({getShadingLabel(inputs.shadingLossPct)})</span>
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
          <span>None</span>
          <span>Light</span>
          <span>Moderate</span>
          <span>Heavy</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-colors">
          Back
        </button>
        <button onClick={onNext} className="flex-[2] bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
          Continue
        </button>
      </div>
    </div>
  );
}
