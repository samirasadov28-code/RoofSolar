'use client';

import type { EvChargingResult } from '@/lib/engine/evCharging';
import { useT } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/types';

interface Props {
  ev: EvChargingResult;
  symbol: string;
}

export function EvPanel({ ev, symbol }: Props) {
  const t = useT();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-teal-50 rounded-xl p-4 text-center">
          <p className="text-xs text-teal-700 font-medium mb-1">{t.evPanel.annualCharging}</p>
          <p className="text-2xl font-bold text-teal-800">{Math.round(ev.annualHomeKwh).toLocaleString()} kWh</p>
        </div>
        <div className="bg-teal-50 rounded-xl p-4 text-center">
          <p className="text-xs text-teal-700 font-medium mb-1">{t.evPanel.solarCoverage}</p>
          <p className="text-2xl font-bold text-teal-800">{Math.round(ev.solarCoveragePct * 100)}%</p>
        </div>
        <div className="bg-teal-50 rounded-xl p-4 text-center">
          <p className="text-xs text-teal-700 font-medium mb-1">{t.evPanel.annualSaving}</p>
          <p className="text-2xl font-bold text-teal-800">{symbol}{Math.round(ev.annualSavingVsGrid).toLocaleString()}</p>
        </div>
      </div>

      {ev.batterEveningShiftValue > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
          <p className="text-sm font-medium text-teal-800">{t.evPanel.batteryShiftTitle}</p>
          <p className="text-2xl font-bold text-teal-900 mt-1">{symbol}{Math.round(ev.batterEveningShiftValue).toLocaleString()}/yr</p>
          <p className="text-xs text-teal-600 mt-1">{t.evPanel.batteryShiftDesc}</p>
        </div>
      )}

      {ev.recommendedExtraPanels > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-yellow-800">
            {ev.recommendedExtraPanels === 1
              ? t.evPanel.extraPanel
              : fmt(t.evPanel.extraPanels, { n: ev.recommendedExtraPanels })}
          </p>
        </div>
      )}
    </div>
  );
}
