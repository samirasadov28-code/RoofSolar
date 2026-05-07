'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWizardStore } from '@/lib/store/wizardStore';
import { getCountryDefaults, listSupportedCountries } from '@/lib/countryDefaults';
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
  capacityFactorPct: number;
  sunnyDaysEquivalent: number;
  dataSource: 'pvgis' | 'nrel' | 'manual';
}

export function Step1Address({ onNext }: { onNext: () => void }) {
  const { inputs, setInputs } = useWizardStore();
  const [query, setQuery] = useState(inputs.address);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
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

  const fetchPreview = useCallback(async (lat: number, lon: number) => {
    setPreviewLoading(true);
    setPreview(null);
    try {
      const res = await fetch(`/api/preview?lat=${lat}&lon=${lon}`);
      if (res.ok) setPreview(await res.json());
    } catch {}
    setPreviewLoading(false);
  }, []);

  // Auto-fetch preview if we already have a saved location (returning user)
  useEffect(() => {
    if (inputs.lat && inputs.lon && !preview && !previewLoading) {
      fetchPreview(inputs.lat, inputs.lon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    fetchPreview(s.lat, s.lon);
  }

  const canProceed = inputs.lat !== null && inputs.lon !== null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Your address</h2>
        <p className="text-gray-500">We use this to fetch live solar irradiance data.</p>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Start typing your address…"
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

      {inputs.lat && inputs.lon && (
        <div className="rounded-xl overflow-hidden border border-gray-200 h-48">
          <MapView lat={inputs.lat} lon={inputs.lon} />
        </div>
      )}

      {/* Country override — surfaces if geocode missed, or for unsupported regions */}
      {inputs.lat && inputs.lon && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
            <span className="text-xs font-normal text-gray-400 ml-1">
              — override if the auto-detected country is wrong
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
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
          >
            <option value="">— Select country —</option>
            {listSupportedCountries().map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          {!inputs.countryCode && (
            <p className="text-xs text-amber-600 mt-1">
              We couldn&apos;t auto-detect your country — please pick one so tariffs and grants are sensible.
            </p>
          )}
        </div>
      )}

      {/* Live solar preview based on the picked location */}
      {(previewLoading || preview) && (
        <div className="bg-gradient-to-br from-amber-50 to-sky-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">
              ☀️ Solar potential at this location
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
              Fetching irradiance data…
            </div>
          )}

          {preview && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-0.5">
                    Sunny days
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {preview.sunnyDaysEquivalent.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500">equivalent / yr</p>
                </div>

                <div className="bg-white rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-0.5">
                    Net capacity
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {preview.annualKwhPerKwp.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500">kWh / kWp / yr</p>
                </div>

                <div className="bg-white rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-0.5">
                    Availability
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {preview.capacityFactorPct.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-gray-500">capacity factor</p>
                </div>

                <div className="bg-white rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-0.5">
                    Peak sun
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {preview.peakSunHoursPerYear.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500">hours / yr</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
                A reference {preview.sampleSystemKwp} kWp south-facing system at this site
                would generate ~<strong>{preview.sampleAnnualKwh.toLocaleString()} kWh</strong> per year.
                <span className="text-gray-500"> Peak sun is the location&apos;s raw solar
                resource; net capacity is what your panels actually deliver after typical
                system losses (~14% inverter, wiring, soiling, temperature). Availability is
                the share of the 8,760-hour year that equates to full-rated output.</span>
              </p>
            </>
          )}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 rounded-xl transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
