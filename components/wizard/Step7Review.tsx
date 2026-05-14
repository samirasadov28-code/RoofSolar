'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/lib/store/wizardStore';
import { useT } from '@/lib/i18n';

function getCurrencySymbol(cc: string) {
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
  const t = useT();
  const router = useRouter();
  const { inputs } = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const symbol = getCurrencySymbol(inputs.countryCode);

  const systemCostGross =
    inputs.systemCostGross > 0
      ? inputs.systemCostGross
      : inputs.panelCount * 900
          + (inputs.hasBattery ? inputs.batteryKwh * 600 : 0)
          + (inputs.inverterType === 'hybrid' ? 500 : 0);
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
        consumptionProfile: inputs.consumptionProfile,
        tariffType: inputs.tariffType,
        inverterType: inputs.inverterType,
        importPricePerKwh: inputs.importPricePerKwh,
        exportPricePerKwh: inputs.exportPricePerKwh,
        dayPricePerKwh: inputs.tariffType === 'tou' ? inputs.dayPricePerKwh : inputs.importPricePerKwh,
        nightPricePerKwh: inputs.tariffType === 'tou' ? inputs.nightPricePerKwh : inputs.importPricePerKwh,
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
        setError(t.step7.errorNoData);
        setLoading(false);
        return;
      }

      sessionStorage.setItem('roofsolar_results', JSON.stringify({ inputs, results: data }));

      const id = data.calculationId ?? 'local';
      router.push(`/results/${id}`);
    } catch (err: any) {
      setError(err.message || t.common.errorGeneric);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.step7.title}</h2>
        <p className="text-gray-500">{t.step7.subtitle}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-0">
        <Row label={t.step7.rowAddress} value={inputs.displayName || '—'} />
        <Row label={t.step7.rowRoofArea} value={`${inputs.roofAreaM2} m²`} />
        <Row label={t.step7.rowOrientation} value={`${inputs.azimuthDeg}°`} />
        <Row label={t.step7.rowPitch} value={`${inputs.tiltDeg}°`} />
        <Row label={t.step7.rowShading} value={`${inputs.shadingLossPct}%`} />
        <Row label={t.step7.rowAnnualConsumption} value={`${inputs.annualKwh.toLocaleString()} kWh`} />
        <Row label={t.step7.rowSystemSize} value={`${inputs.panelCount} panels (${inputs.systemKwp.toFixed(1)} kWp)`} />
        {inputs.hasBattery && <Row label={t.step7.rowBattery} value={`${inputs.batteryKwh} kWh`} />}
        {inputs.hasEv && <Row label={t.step7.rowEvMileage} value={`${inputs.annualMileageKm.toLocaleString()} km`} />}
        <Row label={t.step7.rowImportPrice} value={`${symbol}${inputs.importPricePerKwh}/kWh`} />
        <Row label={t.step7.rowExportRate} value={`${symbol}${inputs.exportPricePerKwh}/kWh`} />
        <Row label={t.step7.rowGrant} value={`${symbol}${inputs.grant.toLocaleString()}`} />
        <Row label={t.step7.rowNetCost} value={`${symbol}${netCapex.toLocaleString()}`} />
        <Row label={t.step7.rowFinancing} value={inputs.financingMode === 'outright' ? t.step7.financingOutright : `${Math.round(inputs.loanCoveragePct * 100)}% ${inputs.financingMode}`} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading} className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-colors disabled:opacity-50">
          {t.common.back}
        </button>
        <button
          onClick={calculate}
          disabled={loading}
          className="flex-[2] bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
              {t.common.calculating}
            </>
          ) : (
            t.step7.calculateBtn
          )}
        </button>
      </div>
    </div>
  );
}
