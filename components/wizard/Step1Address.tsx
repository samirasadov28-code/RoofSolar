'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWizardStore } from '@/lib/store/wizardStore';
import { getCountryDefaults, listSupportedCountries } from '@/lib/countryDefaults';
import { useT } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/types';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

interface Suggestion {
  lat: number;
  lon: number;
  countryCode: string;
  displayName: string;
}

interface Preview {
  sampleSystemKwp: number;
  sampleAnnualKwh: number;
  annualKwhPerKwp: number;
  peakSunHoursPerYear: number;
  sunHoursPerDay: number;
  capacityFactorPct: number;
  typicalCapacityFactorLo: number;
  typicalCapacityFactorHi: number;
  sunnyDaysEquivalent: number;
  bestMonth: { name: string; kwh: number };
  worstMonth: { name: string; kwh: number };
  seasonalSwing: number | null;
  daylightSummer: number;
  daylightWinter: number;
  currencySymbol: string;
  currencyCode: string;
  estimatedAnnualSavings: number;
  annualCo2SavedKg: number;
  co2FactorKgPerKwh: number;
  localImportPrice: number;
  localExportPrice: number;
  localGrant: number;
  localGrantSchemeName: string;
  countryName: string;
  dataSource: 'pvgis' | 'nrel' | 'manual';
}

function flagEmoji(cc: string): string {
  const code = (cc || '').toUpperCase();
  if (code.length !== 2) return '';
  return String.fromCodePoint(
    0x1f1e6 - 65 + code.charCodeAt(0),
    0x1f1e6 - 65 + code.charCodeAt(1),
  );
}

export function Step1Address({ onNext }: { onNext: () => void }) {
  const t = useT();
  const { inputs, setInputs } = useWizardStore();
  const [query, setQuery] = useState(inputs.address);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      if (res.ok) setSuggestions(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  const fetchPreview = useCallback(async (lat: number, lon: number, cc?: string) => {
    setPreviewLoading(true);
    setPreview(null);
    try {
      const qs = `lat=${lat}&lon=${lon}${cc ? `&cc=${cc}` : ''}`;
      const res = await fetch(`/api/preview?${qs}`);
      if (res.ok) setPreview(await res.json());
    } catch {}
    setPreviewLoading(false);
  }, []);

  useEffect(() => {
    if (inputs.lat && inputs.lon && !preview && !previewLoading) {
      fetchPreview(inputs.lat, inputs.lon, inputs.countryCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}`);
          if (!res.ok) throw new Error('reverse geocode failed');
          const s: Suggestion = await res.json();
          selectSuggestion(s);
        } catch {
          setLocateError('Could not find an address for your location. Try typing it instead.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocateError('Location access was denied. Please type your address instead.');
        } else {
          setLocateError('Could not detect your location. Please type your address.');
        }
      },
      { timeout: 10000 }
    );
  }

  function selectSuggestion(s: Suggestion) {
    const defaults = getCountryDefaults(s.countryCode);
    setInputs({
      address: s.displayName,
      lat: s.lat,
      lon: s.lon,
      countryCode: s.countryCode,
      displayName: s.displayName,
      grant: defaults.grant,
      annualKwh: defaults.annualKwh,
      importPricePerKwh: defaults.importPricePerKwh,
      exportPricePerKwh: defaults.exportPricePerKwh,
      dayPricePerKwh: defaults.dayPricePerKwh,
      nightPricePerKwh: defaults.nightPricePerKwh,
    });
    setQuery(s.displayName);
    setSuggestions([]);
    fetchPreview(s.lat, s.lon, s.countryCode);
  }

  const canProceed = inputs.lat !== null && inputs.lon !== null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.step1.title}</h2>
        <p className="text-gray-500">{t.step1.subtitle}</p>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.step1.addressLabel}</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.step1.addressPlaceholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        {loading && (
          <div className="absolute right-3 top-9">
            <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {suggestions.length > 0 && (
          <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => selectSuggestion(s)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-yellow-50 border-b border-gray-100 last:border-0"
              >
                {s.displayName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Use my location */}
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="inline-flex items-center gap-2 self-start bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-300 text-gray-700 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {locating ? (
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7z" />
              <circle cx="12" cy="9" r="2.5" fill="currentColor" className="text-amber-500" />
            </svg>
          )}
          {locating ? 'Detecting location…' : 'Use my location'}
        </button>
        {locateError && (
          <p className="text-xs text-red-600">{locateError}</p>
        )}
      </div>

      {inputs.lat && inputs.lon && (
        <div className="rounded-xl overflow-hidden border border-gray-200 h-48">
          <MapView lat={inputs.lat} lon={inputs.lon} />
        </div>
      )}

      {inputs.lat && inputs.lon && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.step1.countryLabel}
            <span className="text-xs font-normal text-gray-400 ml-1">
              {t.step1.countryOverrideHint}
            </span>
          </label>
          <select
            value={inputs.countryCode || ''}
            onChange={(e) => {
              const cc = e.target.value;
              const defaults = getCountryDefaults(cc);
              setInputs({
                countryCode: cc,
                grant: defaults.grant,
                annualKwh: defaults.annualKwh,
                importPricePerKwh: defaults.importPricePerKwh,
                exportPricePerKwh: defaults.exportPricePerKwh,
                dayPricePerKwh: defaults.dayPricePerKwh,
                nightPricePerKwh: defaults.nightPricePerKwh,
              });
              if (inputs.lat && inputs.lon) fetchPreview(inputs.lat, inputs.lon, cc);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
          >
            <option value="">{t.step1.countrySelectDefault}</option>
            {listSupportedCountries().map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          {!inputs.countryCode && (
            <p className="text-xs text-amber-600 mt-1">{t.step1.countryNotDetected}</p>
          )}
        </div>
      )}

      {(previewLoading || preview) && (
        <div className="bg-gradient-to-br from-amber-50 to-sky-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <span>{t.step1.solarPotential}</span>
              {inputs.countryCode && (
                <span className="text-base leading-none" aria-hidden>
                  {flagEmoji(inputs.countryCode)}
                </span>
              )}
              {preview?.countryName && (
                <span className="text-xs font-normal text-gray-500">
                  {preview.countryName}
                </span>
              )}
            </h3>
            {preview?.dataSource && (
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                {preview.dataSource}
              </span>
            )}
          </div>

          {previewLoading && !preview && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              {t.step1.fetchingData}
            </div>
          )}

          {preview && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-0.5">
                    {t.step1.sunHours}
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {preview.sunHoursPerDay.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-gray-500">{t.step1.sunHoursUnit}</p>
                </div>

                <div className="bg-white rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-0.5">
                    {t.step1.netCapacity}
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {preview.annualKwhPerKwp.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500">{t.step1.netCapacityUnit}</p>
                </div>

                <div className="bg-white rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-0.5">
                    {t.step1.capacityFactor}
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {preview.capacityFactorPct.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {t.step1.capacityFactorTypical} {preview.typicalCapacityFactorLo}–{preview.typicalCapacityFactorHi}%
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-0.5">
                    {t.step1.sunnyDays}
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {preview.sunnyDaysEquivalent.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500">{t.step1.sunnyDaysUnit}</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
                {fmt(t.step1.referenceSystem, { kwp: preview.sampleSystemKwp, kwh: preview.sampleAnnualKwh.toLocaleString() })}
                <span className="text-gray-500"> {t.step1.technicalNote}</span>
              </p>

              <div className="mt-4 pt-4 border-t border-amber-200/60 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  {t.step1.homeImpact}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      {t.step1.year1Savings}
                    </p>
                    <p className="text-lg font-extrabold text-green-700 mt-0.5">
                      {preview.currencySymbol}{preview.estimatedAnnualSavings.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {fmt(t.step1.year1SavingsNote, { kwp: preview.sampleSystemKwp })}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      {t.step1.co2Avoided}
                    </p>
                    <p className="text-lg font-extrabold text-green-700 mt-0.5">
                      {preview.annualCo2SavedKg.toLocaleString()} kg
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {fmt(t.step1.co2Note, { factor: preview.co2FactorKgPerKwh.toFixed(3) })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      {t.step1.bestWorstMonth}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      <span className="text-amber-600">{preview.bestMonth.name}</span>: {preview.bestMonth.kwh.toLocaleString()} kWh
                      <span className="text-gray-400"> · </span>
                      <span className="text-sky-600">{preview.worstMonth.name}</span>: {preview.worstMonth.kwh.toLocaleString()} kWh
                    </p>
                    {preview.seasonalSwing && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {fmt(t.step1.seasonalSwing, { x: preview.seasonalSwing.toFixed(1) })}
                      </p>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      {t.step1.daylightHours}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {fmt(t.step1.daylightNote, { winter: preview.daylightWinter.toFixed(1), summer: preview.daylightSummer.toFixed(1) })}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{t.step1.daylightLatitude}</p>
                  </div>
                </div>

                {preview.currencyCode && (
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                      {fmt(t.step1.preFilledFor, { country: preview.countryName })}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span><span className="text-gray-500">{t.step1.importLabel}</span> <strong className="text-gray-900">{preview.currencySymbol}{preview.localImportPrice}/kWh</strong></span>
                      <span><span className="text-gray-500">{t.step1.exportLabel}</span> <strong className="text-gray-900">{preview.currencySymbol}{preview.localExportPrice}/kWh</strong></span>
                      {preview.localGrant > 0 && (
                        <span><span className="text-gray-500">{preview.localGrantSchemeName}</span> <strong className="text-gray-900">{t.step1.upTo} {preview.currencySymbol}{preview.localGrant.toLocaleString()}</strong></span>
                      )}
                      {preview.localGrant === 0 && preview.localGrantSchemeName !== 'Local incentives may apply' && (
                        <span className="text-gray-500">{preview.localGrantSchemeName}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 rounded-xl transition-colors"
      >
        {t.common.continue}
      </button>
    </div>
  );
}
