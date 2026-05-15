'use client';

import {
  recommendFor,
  symbolFor,
  type SolarPanel,
  type HybridInverter,
  type HomeBattery,
  type PriceRange,
} from '@/lib/equipmentCatalog';
import { useT } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/types';
import type { Translations } from '@/lib/i18n/types';

interface Props {
  inputs: any;
}

function formatPrice(p: PriceRange): string {
  const sym = symbolFor(p.currency);
  return `${sym}${p.min.toLocaleString()}–${sym}${p.max.toLocaleString()}${p.unit ? ` ${p.unit}` : ''}`;
}

function tierBadge(tier: SolarPanel['tier'], t: Translations) {
  const map: Record<SolarPanel['tier'], { label: string; cls: string }> = {
    'tier-1':  { label: t.equipment.tier1,  cls: 'bg-blue-100 border-blue-300 text-blue-700' },
    'tier-2':  { label: t.equipment.tier2,  cls: 'bg-gray-100 border-gray-300 text-gray-700' },
    premium:   { label: t.equipment.premium, cls: 'bg-amber-100 border-amber-300 text-amber-700' },
  };
  const entry = map[tier];
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 ${entry.cls}`}>
      {entry.label}
    </span>
  );
}

function PanelCard({ p, count, t }: { p: SolarPanel; count: number; t: Translations }) {
  const totalLow = p.retailPrice.min * count;
  const totalHigh = p.retailPrice.max * count;
  const sym = symbolFor(p.retailPrice.currency);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-semibold text-gray-900 text-sm">
          {p.manufacturer}<br />
          <span className="font-bold">{p.model}</span>
        </p>
        {tierBadge(p.tier, t)}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mt-2">
        <div><span className="text-gray-500">{t.equipment.powerLabel}</span> · <strong>{p.watts}W</strong></div>
        <div><span className="text-gray-500">{t.equipment.effLabel}</span> · <strong>{p.efficiencyPct}%</strong></div>
        <div className="col-span-2"><span className="text-gray-500">{t.equipment.techLabel}</span> · {p.cellTech}</div>
        <div className="col-span-2"><span className="text-gray-500">{t.equipment.warrantyLabel}</span> · {p.warrantyYears} yr</div>
      </div>
      <p className="text-xs text-gray-600 mt-2 leading-relaxed">{p.notes}</p>
      <div className="border-t border-gray-100 mt-3 pt-2 text-xs">
        <p className="text-gray-500">{formatPrice(p.retailPrice)}</p>
        <p className="font-bold text-gray-900 mt-0.5">
          {sym}{totalLow.toLocaleString()}–{sym}{totalHigh.toLocaleString()}
          <span className="font-normal text-gray-500"> {fmt(t.equipment.forPanels, { n: count })}</span>
        </p>
      </div>
    </div>
  );
}

function InverterCard({ inv, t }: { inv: HybridInverter; t: Translations }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col">
      <p className="font-semibold text-gray-900 text-sm">
        {inv.manufacturer}<br />
        <span className="font-bold">{inv.model}</span>
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mt-2">
        <div><span className="text-gray-500">{t.equipment.ratedLabel}</span> · <strong>{inv.ratedKw} kW</strong></div>
        <div><span className="text-gray-500">{t.equipment.effLabel}</span> · <strong>{inv.efficiencyPct}%</strong></div>
        <div className="col-span-2"><span className="text-gray-500">{t.equipment.phaseLabel}</span> · {inv.phase}</div>
        <div className="col-span-2"><span className="text-gray-500">{t.equipment.warrantyLabel}</span> · {inv.warrantyYears} yr</div>
        <div className="col-span-2">
          <span className="text-gray-500">{t.equipment.pairsWith}</span> ·{' '}
          <span className="text-gray-900">{inv.batteryBrands.join(', ')}</span>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2 leading-relaxed">{inv.notes}</p>
      <div className="border-t border-gray-100 mt-3 pt-2 text-xs">
        <p className="font-bold text-gray-900">{formatPrice(inv.retailPrice)}</p>
      </div>
    </div>
  );
}

function BatteryCard({ b, t }: { b: HomeBattery; t: Translations }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col">
      <p className="font-semibold text-gray-900 text-sm">
        {b.manufacturer}<br />
        <span className="font-bold">{b.model}</span>
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mt-2">
        <div><span className="text-gray-500">{t.equipment.capacityLabel}</span> · <strong>{b.kwh} kWh</strong></div>
        <div><span className="text-gray-500">{t.equipment.cyclesLabel}</span> · <strong>{b.cycles.toLocaleString()}</strong></div>
        <div className="col-span-2"><span className="text-gray-500">{t.equipment.chemistryLabel}</span> · {b.chemistry}</div>
        <div className="col-span-2">
          <span className="text-gray-500">{t.equipment.warrantyLabel}</span> · {b.warrantyYears} yr ·{' '}
          {b.modular ? t.equipment.modular : t.equipment.singleUnit}
        </div>
        <div className="col-span-2">
          <span className="text-gray-500">{t.equipment.pairsWith}</span> ·{' '}
          <span className="text-gray-900">{b.inverterBrands.join(', ')}</span>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2 leading-relaxed">{b.notes}</p>
      <div className="border-t border-gray-100 mt-3 pt-2 text-xs">
        <p className="font-bold text-gray-900">{formatPrice(b.installedPrice)}</p>
      </div>
    </div>
  );
}

export function EquipmentShortlist({ inputs }: Props) {
  const t = useT();
  const { panels, inverters, batteries, region } = recommendFor(
    inputs.countryCode || '',
    inputs.panelCount || 12,
    !!inputs.hasBattery,
    inputs.batteryKwh || 0,
    inputs.inverterType || 'standard'
  );

  const isHybrid = inputs.hasBattery || inputs.inverterType === 'hybrid';

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 leading-relaxed">
        {fmt(t.equipment.intro, { region })}
      </p>

      {/* Panels */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
          {fmt(t.equipment.panelsSection, { n: inputs.panelCount })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {panels.map((p) => (
            <PanelCard key={p.id} p={p} count={inputs.panelCount || 12} t={t} />
          ))}
        </div>
      </div>

      {/* Inverters */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
          {fmt(t.equipment.inverterSection, { kwp: (inputs.systemKwp || 4.8).toFixed(1) })}
          {isHybrid ? t.equipment.inverterHybrid : t.equipment.inverterStandard}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {inverters.map((i) => (
            <InverterCard key={i.id} inv={i} t={t} />
          ))}
        </div>
      </div>

      {/* Batteries — only when the user picked one */}
      {inputs.hasBattery && batteries.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
            {fmt(t.equipment.batterySection, { kwh: inputs.batteryKwh })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {batteries.map((b) => (
              <BatteryCard key={b.id} b={b} t={t} />
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-gray-500 leading-relaxed">
        {t.equipment.pricesNote}
      </p>
    </div>
  );
}
