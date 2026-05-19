'use client';

import { useT } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/types';

interface Props {
  annualCo2Saved: number;
  horizonYears: number;
  lifetimeSavings: number;
  symbol: string;
}

const KG_CO2_PER_CAR_YEAR = 4_600;
const KG_CO2_PER_TREE_YEAR = 21;
const KG_CO2_PER_FLIGHT_LDN_NYC = 1_200;
const KG_CO2_PER_BEEF_KG = 27;

export function LifetimeImpact({ annualCo2Saved, horizonYears, lifetimeSavings, symbol }: Props) {
  const t = useT();
  const lifetimeKg = (annualCo2Saved || 0) * horizonYears;
  const lifetimeTonnes = lifetimeKg / 1000;

  const carYears = lifetimeKg / KG_CO2_PER_CAR_YEAR;
  const treeYears = lifetimeKg / KG_CO2_PER_TREE_YEAR;
  const flights = lifetimeKg / KG_CO2_PER_FLIGHT_LDN_NYC;
  const beefKg = lifetimeKg / KG_CO2_PER_BEEF_KG;

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 border border-green-200 rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900">{fmt(t.lifetimeImpact.title, { n: horizonYears })}</h2>
          <p className="text-sm text-gray-500">{t.lifetimeImpact.subtitle}</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-white border border-green-300 rounded-full px-2 py-0.5 shrink-0">
          {t.lifetimeImpact.freeBadge}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold mb-0.5">
            {t.lifetimeImpact.co2Avoided}
          </p>
          <p className="text-2xl font-extrabold text-gray-900">{lifetimeTonnes.toFixed(1)}</p>
          <p className="text-xs text-gray-500">{t.lifetimeImpact.tonnes}</p>
        </div>

        <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold mb-0.5">
            {t.lifetimeImpact.moneySaved}
          </p>
          <p className="text-2xl font-extrabold text-gray-900">
            {symbol}{Math.round(lifetimeSavings).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{t.lifetimeImpact.grossSavings}</p>
        </div>

        <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold mb-0.5">
            {t.lifetimeImpact.carsOffRoad}
          </p>
          <p className="text-2xl font-extrabold text-gray-900">{carYears.toFixed(1)}</p>
          <p className="text-xs text-gray-500">{t.lifetimeImpact.carYears}</p>
        </div>

        <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold mb-0.5">
            {t.lifetimeImpact.treesPlanted}
          </p>
          <p className="text-2xl font-extrabold text-gray-900">
            {Math.round(treeYears).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{t.lifetimeImpact.treeYears}</p>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-4 leading-relaxed">
        {fmt(t.lifetimeImpact.equivalentNote, {
          flights: Math.round(flights).toLocaleString(),
          beef: Math.round(beefKg).toLocaleString(),
          n: horizonYears,
        })}
      </p>
    </div>
  );
}
