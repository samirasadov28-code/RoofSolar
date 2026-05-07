'use client';

interface Props {
  annualCo2Saved: number;       // kg CO₂ per year
  horizonYears: number;
  lifetimeSavings: number;
  symbol: string;
}

// Equivalence rates — public-domain rules of thumb.
const KG_CO2_PER_CAR_YEAR = 4_600;       // average passenger car
const KG_CO2_PER_TREE_YEAR = 21;         // mature broadleaf tree
const KG_CO2_PER_FLIGHT_LDN_NYC = 1_200; // economy seat, one-way
const KG_CO2_PER_BEEF_KG = 27;           // beef, average

export function LifetimeImpact({ annualCo2Saved, horizonYears, lifetimeSavings, symbol }: Props) {
  const lifetimeKg = (annualCo2Saved || 0) * horizonYears;
  const lifetimeTonnes = lifetimeKg / 1000;

  const carYears = lifetimeKg / KG_CO2_PER_CAR_YEAR;
  const treeYears = lifetimeKg / KG_CO2_PER_TREE_YEAR;
  const flights = lifetimeKg / KG_CO2_PER_FLIGHT_LDN_NYC;
  const beefKg = lifetimeKg / KG_CO2_PER_BEEF_KG;

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 border border-green-200 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-gray-900">Lifetime impact ({horizonYears} years)</h2>
          <p className="text-sm text-gray-500">
            What your panels will displace and earn over the panel warranty period.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-white border border-green-300 rounded-full px-2 py-0.5 whitespace-nowrap">
          Free · everyone
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold mb-0.5">
            CO₂ avoided
          </p>
          <p className="text-2xl font-extrabold text-gray-900">
            {lifetimeTonnes.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">tonnes</p>
        </div>

        <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold mb-0.5">
            Money saved
          </p>
          <p className="text-2xl font-extrabold text-gray-900">
            {symbol}{Math.round(lifetimeSavings).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">gross savings</p>
        </div>

        <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold mb-0.5">
            Cars off road
          </p>
          <p className="text-2xl font-extrabold text-gray-900">
            {carYears.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">car-years</p>
        </div>

        <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold mb-0.5">
            Trees planted
          </p>
          <p className="text-2xl font-extrabold text-gray-900">
            {Math.round(treeYears).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">tree-years</p>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-4 leading-relaxed">
        Equivalent to about <strong>{Math.round(flights).toLocaleString()}</strong> economy
        flights London → New York avoided, or <strong>{Math.round(beefKg).toLocaleString()} kg</strong> of
        beef not produced. Based on average grid carbon intensity for your country and the
        panel warranty horizon ({horizonYears} years).
      </p>
    </div>
  );
}
