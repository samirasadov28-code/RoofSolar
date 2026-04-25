'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWizardStore } from '@/lib/store/wizardStore';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

interface Suggestion {
  lat: number;
  lon: number;
  countryCode: string;
  displayName: string;
}

function getDefaults(countryCode: string) {
  if (countryCode === 'ie') {
    return { importPricePerKwh: 0.433, exportPricePerKwh: 0.21, annualKwh: 4200 };
  }
  if (countryCode === 'gb') {
    return { importPricePerKwh: 0.245, exportPricePerKwh: 0.15, annualKwh: 3100 };
  }
  return {};
}

export function Step1Address({ onNext }: { onNext: () => void }) {
  const { inputs, setInputs } = useWizardStore();
  const [query, setQuery] = useState(inputs.address);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
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

  function selectSuggestion(s: Suggestion) {
    const defaults = getDefaults(s.countryCode);
    const grantDefault = s.countryCode === 'ie' ? 3000 : 0;
    setInputs({
      address: s.displayName,
      lat: s.lat,
      lon: s.lon,
      countryCode: s.countryCode,
      displayName: s.displayName,
      grant: grantDefault,
      ...defaults,
    });
    setQuery(s.displayName);
    setSuggestions([]);
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
          placeholder="14 Griffith Ave, Dublin 9"
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
