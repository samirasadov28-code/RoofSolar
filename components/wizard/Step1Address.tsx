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

// ISO-3166-1 alpha-2 → flag emoji. Two regional-indicator code points
// per country, computed at runtime so we don't ship 200 hardcoded strings.
function flagEmoji(cc: string): string {
  const code = (cc || '').toUpperCase();
  if (code.length !== 2) return '';
  return String.fromCodePoint(
    0x1f1e6 - 65 + code.charCodeAt(0),
    0x1f1e6 - 65 + code.charCodeAt(1),
  );
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

  // Auto-fetch preview if we already have a saved location (returning user)
  useEffect(() => {
    if (inputs.lat && inputs.lon && !preview && !previewLoading) {
      fetchPreview(inputs.lat, inputs.lon, inputs.countryCode);
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
    fetchPreview(s.lat, s.lon, s.countryCode);
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
              // Re-fetch preview so the savings/CO₂/tariff snapshot reflects
              // the user's overridden country, not the geocoded one.
              if (inputs.lat && inputs.lon) fetchPreview(inputs.lat, inputs.lon, cc);
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
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <span>☀️ Solar potential</span>
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
              Fetching irradiance data…
            </div>
          )}

          {preview && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-0.5">
                    Sun hours
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {preview.sunHoursPerDay.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-gray-500">avg / day</p>
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
                    Capacity factor
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {preview.capacityFactorPct.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-gray-500">
                    typical {preview.typicalCapacityFactorLo}–{preview.typicalCapacityFactorHi}%
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-0.5">
                    Sunny days
                  </p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {preview.sunnyDaysEquivalent.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500">8-hr equivalents / yr</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
                A reference {preview.sampleSystemKwp} kWp south-facing system at this site
                would generate ~<strong>{preview.sampleAnnualKwh.toLocaleString()} kWh</strong> per year.
                <span className="text-gray-500"> Sun hours are the location&apos;s raw solar
                resource (peak-sun-hour equivalents); net capacity is what your panels
                actually deliver after typical system losses (~14% inverter, wiring,
                soiling, temperature). Capacity factor is the share of the year that equates
                to full-rated output — the &quot;typical&quot; band is a latitude-based reference, so
                you can see if your spot sits above or below the norm.</span>
              </p>

              {/* What this means for the home — money, climate, seasons */}
              <div className="mt-4 pt-4 border-t border-amber-200/60 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  What this means for your home
                </p>

                {/* Headline money + CO₂ */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      Year-1 savings (est.)
                    </p>
                    <p className="text-lg font-extrabold text-green-700 mt-0.5">
                      {preview.currencySymbol}{preview.estimatedAnnualSavings.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      for a {preview.sampleSystemKwp} kWp system, ~35% self-consumed
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      CO₂ avoided / yr
                    </p>
                    <p className="text-lg font-extrabold text-green-700 mt-0.5">
                      {preview.annualCo2SavedKg.toLocaleString()} kg
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      using local grid factor {preview.co2FactorKgPerKwh.toFixed(3)} kg/kWh
                    </p>
                  </div>
                </div>

                {/* Seasonal swing + daylight */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      Best / worst month
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      <span className="text-amber-600">{preview.bestMonth.name}</span>: {preview.bestMonth.kwh.toLocaleString()} kWh
                      <span className="text-gray-400"> · </span>
                      <span className="text-sky-600">{preview.worstMonth.name}</span>: {preview.worstMonth.kwh.toLocaleString()} kWh
                    </p>
                    {preview.seasonalSwing && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {preview.seasonalSwing.toFixed(1)}× swing across the year
                      </p>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      Daylight hours
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      Dec: {preview.daylightWinter.toFixed(1)} hr → Jun: {preview.daylightSummer.toFixed(1)} hr
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">at your latitude</p>
                  </div>
                </div>

                {/* Local tariff & grant snapshot */}
                {preview.currencyCode && (
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                      Pre-filled for {preview.countryName}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span><span className="text-gray-500">Import</span> <strong className="text-gray-900">{preview.currencySymbol}{preview.localImportPrice}/kWh</strong></span>
                      <span><span className="text-gray-500">Export</span> <strong className="text-gray-900">{preview.currencySymbol}{preview.localExportPrice}/kWh</strong></span>
                      {preview.localGrant > 0 && (
                        <span><span className="text-gray-500">{preview.localGrantSchemeName}</span> <strong className="text-gray-900">up to {preview.currencySymbol}{preview.localGrant.toLocaleString()}</strong></span>
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
        Continue
      </button>
    </div>
  );
}
