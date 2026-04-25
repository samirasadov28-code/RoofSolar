'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/lib/store/wizardStore';

function fmt(cc: string) {
  return cc === 'ie' ? '€' : cc === 'gb' ? '£' : '';
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

export function Step7Review({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { inputs } = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const symbol = fmt(inputs.countryCode);

  const systemCostGross =
    inputs.systemCostGross > 0
      ? inputs.systemCostGross
      : inputs.panelCount * 900 + (inputs.hasBattery ? inputs.batteryKwh * 600 : 0);
  const netCapex = Math.max(0, systemCostGross - inputs.grant);

  async function calculate() {
    setLoading(true);
    setError('');

    try {
      const payload = {
        lat: inputs.lat,
        lon: inputs.lon,
        countryCode: inputs.countryCode,
        displayName: inputs.displayName,
        systemKwp: inputs.systemKwp,
        tiltDeg: inputs.tiltDeg,
        azimuthDeg: inputs.azimuthDeg,
        shadingLossPct: inputs.shadingLossPct,
        annualKwh: inputs.annualKwh,
        hasBattery: inputs.hasBattery,
        batteryKwh: inputs.batteryKwh,
        maxCyclePct: 0.9,
        performArbitrage: inputs.performArbitrage,
        hasEv: inputs.hasEv,
        annualMileageKm: inputs.annualMileageKm,
        vehicleEfficiencyKwhPer100km: inputs.vehicleEfficiencyKwhPer100km,
        chargingPreference: inputs.chargingPreference,
        publicChargingPct: inputs.publicChargingPct,
        importPricePerKwh: inputs.importPricePerKwh,
        exportPricePerKwh: inputs.exportPricePerKwh,
        dayPricePerKwh: inputs.dayPricePerKwh,
        nightPricePerKwh: inputs.nightPricePerKwh,
        systemCostGross,
        financingMode: inputs.financingMode,
        loanCoveragePct: inputs.loanCoveragePct,
        annualRatePct: inputs.annualRatePct,
        tenorYears: inputs.tenorYears,
        panelCount: inputs.panelCount,
      };

      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Calculation failed');

      const data = await res.json();

      if (data.needsManualProduction) {
        setError('Could not fetch solar data for this location. Please try a different address or contact support.');
        setLoading(false);
        return;
      }

      // Store in sessionStorage for results page
      sessionStorage.setItem('roofsolar_results', JSON.stringify({ inputs, results: data }));

      const id = data.calculationId ?? 'local';
      router.push(`/results/${id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Review your inputs</h2>
        <p className="text-gray-500">Check everything looks right before we run your analysis.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-0">
        <Row label="Address" value={inputs.displayName || '—'} />
        <Row label="Roof area" value={`${inputs.roofAreaM2} m²`} />
        <Row label="Orientation" value={`${inputs.azimuthDeg}°`} />
        <Row label="Pitch" value={`${inputs.tiltDeg}°`} />
        <Row label="Shading" value={`${inputs.shadingLossPct}%`} />
        <Row label="Annual consumption" value={`${inputs.annualKwh.toLocaleString()} kWh`} />
        <Row label="System size" value={`${inputs.panelCount} panels (${inputs.systemKwp.toFixed(1)} kWp)`} />
        {inputs.hasBattery && <Row label="Battery" value={`${inputs.batteryKwh} kWh`} />}
        {inputs.hasEv && <Row label="EV annual mileage" value={`${inputs.annualMileageKm.toLocaleString()} km`} />}
        <Row label="Import price" value={`${symbol}${inputs.importPricePerKwh}/kWh`} />
        <Row label="Export rate" value={`${symbol}${inputs.exportPricePerKwh}/kWh`} />
        <Row label="Grant" value={`${symbol}${inputs.grant.toLocaleString()}`} />
        <Row label="Net system cost" value={`${symbol}${netCapex.toLocaleString()}`} />
        <Row label="Financing" value={inputs.financingMode === 'outright' ? 'Outright' : `${Math.round(inputs.loanCoveragePct * 100)}% ${inputs.financingMode}`} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading} className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-colors disabled:opacity-50">
          Back
        </button>
        <button
          onClick={calculate}
          disabled={loading}
          className="flex-[2] bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
              Calculating…
            </>
          ) : (
            'Calculate my analysis'
          )}
        </button>
      </div>
    </div>
  );
}
