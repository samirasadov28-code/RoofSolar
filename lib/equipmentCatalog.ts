/**
 * Curated residential solar equipment shortlist.
 *
 * Hand-picked from manufacturer datasheets & installer guides (May 2026).
 * Most brands here (Jinko, JA, Trina, LONGi, Sungrow, Solis, Huawei,
 * Fronius, BYD, Tesla, Pylontech) are sold globally; a few items are
 * tagged as UK-only (region: 'UK') and only surface for UK users.
 * Prices are indicative; local installer quotes are the source of truth.
 *
 * Source notes:
 *   - Panels: solarinfo.ie, balconysolar.uk, photovoltaics.co.uk
 *   - Inverters: cleanenergyreviews.info, deenergyhub.ie, sunbrightenergy.co.uk
 *   - Batteries: lookinto.co.uk, getsolarpanels.ie, solaradvice.co.uk
 */

export type Currency = 'EUR' | 'GBP';

export interface PriceRange {
  /** Currency the range is denominated in. */
  currency: Currency;
  /** Lower bound, lowest installer-quoted retail price (incl. VAT). */
  min: number;
  /** Upper bound. */
  max: number;
  /** "per unit", "per kWh", "installed", etc. */
  unit?: string;
}

export interface SolarPanel {
  id: string;
  manufacturer: string;
  model: string;
  watts: number;
  cellTech: 'TOPCon (N-type)' | 'PERC (P-type)' | 'HJT' | 'IBC';
  efficiencyPct: number;
  warrantyYears: number;
  /** Tier-1 bankable, Tier-2 reliable budget, Premium = top end. */
  tier: 'tier-1' | 'tier-2' | 'premium';
  notes: string;
  retailPrice: PriceRange;
}

export interface HybridInverter {
  id: string;
  manufacturer: string;
  model: string;
  ratedKw: number;
  phase: 'single' | 'three';
  efficiencyPct: number;
  warrantyYears: number;
  /** Battery brands explicitly compatible. */
  batteryBrands: string[];
  region: 'IE' | 'UK' | 'IE+UK';
  notes: string;
  retailPrice: PriceRange;
}

export interface HomeBattery {
  id: string;
  manufacturer: string;
  model: string;
  kwh: number;
  chemistry: 'LFP (LiFePO₄)' | 'NMC' | 'Sodium-ion';
  cycles: number;            // rated full cycles
  warrantyYears: number;
  modular: boolean;
  /** Inverter brands explicitly compatible. */
  inverterBrands: string[];
  region: 'IE' | 'UK' | 'IE+UK';
  notes: string;
  /** Installed price range. */
  installedPrice: PriceRange;
}

export const PANELS: SolarPanel[] = [
  {
    id: 'jinko-tiger-neo-440',
    manufacturer: 'Jinko Solar',
    model: 'Tiger Neo 440W',
    watts: 440,
    cellTech: 'TOPCon (N-type)',
    efficiencyPct: 22.3,
    warrantyYears: 25,
    tier: 'tier-1',
    notes: 'Most-installed panel in Ireland 2025-26. Excellent low-light performance, ideal for the IE/UK climate.',
    retailPrice: { currency: 'EUR', min: 280, max: 320, unit: 'per panel' },
  },
  {
    id: 'ja-solar-jam54s30-415',
    manufacturer: 'JA Solar',
    model: 'JAM54S30 415W',
    watts: 415,
    cellTech: 'PERC (P-type)',
    efficiencyPct: 21.3,
    warrantyYears: 25,
    tier: 'tier-1',
    notes: 'Reliable Tier-1 workhorse — widely stocked by global installer kits.',
    retailPrice: { currency: 'EUR', min: 260, max: 290, unit: 'per panel' },
  },
  {
    id: 'trina-vertex-s-plus-430',
    manufacturer: 'Trina Solar',
    model: 'Vertex S+ 430W',
    watts: 430,
    cellTech: 'TOPCon (N-type)',
    efficiencyPct: 22.0,
    warrantyYears: 25,
    tier: 'tier-1',
    notes: 'Compact form factor (1.76 m × 1.13 m) — fits more panels on small roofs.',
    retailPrice: { currency: 'EUR', min: 270, max: 300, unit: 'per panel' },
  },
  {
    id: 'longi-himo6-425',
    manufacturer: 'LONGi',
    model: 'Hi-MO 6 425W',
    watts: 425,
    cellTech: 'HJT',
    efficiencyPct: 22.4,
    warrantyYears: 25,
    tier: 'tier-1',
    notes: 'Hyper-efficient HPBC cell, low temperature coefficient — strong on warm sunny days.',
    retailPrice: { currency: 'EUR', min: 290, max: 330, unit: 'per panel' },
  },
  {
    id: 'aiko-neostar-450',
    manufacturer: 'Aiko Solar',
    model: 'Neostar 2S 450W',
    watts: 450,
    cellTech: 'IBC',
    efficiencyPct: 23.2,
    warrantyYears: 30,
    tier: 'premium',
    notes: 'All-back-contact, no busbar shading. Industry-leading efficiency. 30-yr product warranty.',
    retailPrice: { currency: 'EUR', min: 340, max: 380, unit: 'per panel' },
  },
  {
    id: 'rec-alpha-pure-r-430',
    manufacturer: 'REC',
    model: 'Alpha Pure-R 430W',
    watts: 430,
    cellTech: 'HJT',
    efficiencyPct: 22.3,
    warrantyYears: 25,
    tier: 'premium',
    notes: 'Norwegian-engineered, lead-free. Excellent in cold climates. Premium price.',
    retailPrice: { currency: 'EUR', min: 360, max: 410, unit: 'per panel' },
  },
];

export const INVERTERS: HybridInverter[] = [
  {
    id: 'sungrow-sh5rs',
    manufacturer: 'Sungrow',
    model: 'SH5.0RS',
    ratedKw: 5.0,
    phase: 'single',
    efficiencyPct: 97.7,
    warrantyYears: 10,
    batteryBrands: ['Sungrow SBR', 'BYD', 'Pylontech'],
    region: 'IE+UK',
    notes: 'Most-recommended 5 kW hybrid in Ireland. IP65, backup-capable, exports to grid + battery.',
    retailPrice: { currency: 'EUR', min: 1300, max: 1600, unit: 'unit only' },
  },
  {
    id: 'solis-s6-eh1p5k',
    manufacturer: 'Solis',
    model: 'S6-EH1P5K-L',
    ratedKw: 5.0,
    phase: 'single',
    efficiencyPct: 97.6,
    warrantyYears: 10,
    batteryBrands: ['BYD', 'Pylontech', 'LG Chem', 'Solis'],
    region: 'IE+UK',
    notes: 'Best-value 5 kW hybrid. Wide battery compatibility, easy commissioning.',
    retailPrice: { currency: 'EUR', min: 1100, max: 1350, unit: 'unit only' },
  },
  {
    id: 'huawei-sun2000-5ktl',
    manufacturer: 'Huawei',
    model: 'SUN2000-5KTL-L1',
    ratedKw: 5.0,
    phase: 'single',
    efficiencyPct: 98.4,
    warrantyYears: 10,
    batteryBrands: ['Huawei LUNA2000', 'LG Chem RESU'],
    region: 'IE+UK',
    notes: 'Highest-efficiency 5 kW unit on the market. Excellent monitoring app.',
    retailPrice: { currency: 'EUR', min: 1450, max: 1700, unit: 'unit only' },
  },
  {
    id: 'givenergy-gen3-5kw',
    manufacturer: 'GivEnergy',
    model: 'Gen3 Hybrid 5.0',
    ratedKw: 5.0,
    phase: 'single',
    efficiencyPct: 97.6,
    warrantyYears: 12,
    batteryBrands: ['GivEnergy AIO', 'GivEnergy Battery'],
    region: 'UK',
    notes: 'UK-built. Most-installed hybrid by UK MCS installers. 12-yr warranty.',
    retailPrice: { currency: 'GBP', min: 1500, max: 1900, unit: 'unit only' },
  },
  {
    id: 'fox-ess-h1-5kw',
    manufacturer: 'Fox ESS',
    model: 'H1-5.0-E',
    ratedKw: 5.0,
    phase: 'single',
    efficiencyPct: 97.6,
    warrantyYears: 10,
    batteryBrands: ['Fox ESS EP/EQ', 'Pylontech'],
    region: 'UK',
    notes: 'Strong UK installer-base. Modular ECS battery line pairs cleanly.',
    retailPrice: { currency: 'GBP', min: 1300, max: 1600, unit: 'unit only' },
  },
  {
    id: 'fronius-gen24-6',
    manufacturer: 'Fronius',
    model: 'Primo GEN24 Plus 6.0',
    ratedKw: 6.0,
    phase: 'single',
    efficiencyPct: 98.2,
    warrantyYears: 10,
    batteryBrands: ['BYD HVS/HVM'],
    region: 'IE+UK',
    notes: 'Austrian engineering, reference monitoring. Premium price, premium build.',
    retailPrice: { currency: 'EUR', min: 2400, max: 2800, unit: 'unit only' },
  },
];

export const BATTERIES: HomeBattery[] = [
  {
    id: 'pylontech-force-h2-7-1',
    manufacturer: 'Pylontech',
    model: 'Force-H2 7.1 kWh',
    kwh: 7.1,
    chemistry: 'LFP (LiFePO₄)',
    cycles: 6000,
    warrantyYears: 10,
    modular: true,
    inverterBrands: ['Sungrow', 'Solis', 'Fox ESS', 'GoodWe'],
    region: 'IE+UK',
    notes: 'Best value-per-kWh. Stack up to 28.4 kWh. Industry-standard fit.',
    installedPrice: { currency: 'EUR', min: 4500, max: 5500, unit: 'installed' },
  },
  {
    id: 'huawei-luna2000-10',
    manufacturer: 'Huawei',
    model: 'LUNA2000 10 kWh',
    kwh: 10.0,
    chemistry: 'LFP (LiFePO₄)',
    cycles: 6000,
    warrantyYears: 10,
    modular: true,
    inverterBrands: ['Huawei SUN2000'],
    region: 'IE+UK',
    notes: 'Modular in 5 kWh blocks (5/10/15). Tightly integrated with Huawei inverters.',
    installedPrice: { currency: 'EUR', min: 6500, max: 8000, unit: 'installed' },
  },
  {
    id: 'byd-hvs-10-2',
    manufacturer: 'BYD',
    model: 'Battery-Box Premium HVS 10.2',
    kwh: 10.24,
    chemistry: 'LFP (LiFePO₄)',
    cycles: 10000,
    warrantyYears: 10,
    modular: true,
    inverterBrands: ['Fronius', 'SMA', 'Sungrow', 'Solis', 'GoodWe'],
    region: 'IE+UK',
    notes: 'High-voltage LFP, 10,000-cycle life. Pairs with most premium inverters.',
    installedPrice: { currency: 'EUR', min: 6000, max: 7500, unit: 'installed' },
  },
  {
    id: 'givenergy-aio-9-5',
    manufacturer: 'GivEnergy',
    model: 'All-in-One 9.5 kWh',
    kwh: 9.5,
    chemistry: 'LFP (LiFePO₄)',
    cycles: 6000,
    warrantyYears: 12,
    modular: false,
    inverterBrands: ['GivEnergy Gen3'],
    region: 'UK',
    notes: 'Inverter + battery in one floor-standing unit. Plug-and-play install.',
    installedPrice: { currency: 'GBP', min: 5500, max: 7000, unit: 'installed' },
  },
  {
    id: 'tesla-powerwall-3',
    manufacturer: 'Tesla',
    model: 'Powerwall 3',
    kwh: 13.5,
    chemistry: 'LFP (LiFePO₄)',
    cycles: 8000,
    warrantyYears: 10,
    modular: false,
    inverterBrands: ['Built-in 11.5 kW PV inverter'],
    region: 'IE+UK',
    notes: 'All-in-one — has its own PV inverter, no separate hybrid needed. Premium price, marquee brand.',
    installedPrice: { currency: 'EUR', min: 12000, max: 15000, unit: 'installed' },
  },
  {
    id: 'sungrow-sbr-9-6',
    manufacturer: 'Sungrow',
    model: 'SBR 096 (9.6 kWh)',
    kwh: 9.6,
    chemistry: 'LFP (LiFePO₄)',
    cycles: 6000,
    warrantyYears: 10,
    modular: true,
    inverterBrands: ['Sungrow SH-RS / SH-RT'],
    region: 'IE+UK',
    notes: 'Modular 3.2 kWh stack. Tightly bundled with Sungrow hybrid inverters.',
    installedPrice: { currency: 'EUR', min: 5800, max: 7000, unit: 'installed' },
  },
];

export function symbolFor(currency: Currency): string {
  return currency === 'EUR' ? '€' : '£';
}

/** Recommend equipment based on the user's wizard inputs. */
export function recommendFor(
  countryCode: string,
  panelCount: number,
  hasBattery: boolean,
  batteryKwh: number,
  inverterType: 'standard' | 'hybrid'
) {
  const cc = (countryCode || '').toLowerCase();
  // Treat IE / GB as their explicit regions; everything else gets the
  // globally-available 'IE+UK' brands (Sungrow, Solis, Huawei, Fronius,
  // Pylontech, BYD, Tesla — all sold worldwide). UK-only brands like
  // GivEnergy and Fox ESS are filtered out for non-UK users.
  const isUk = cc === 'gb';
  const isIe = cc === 'ie';

  // Match inverter rated kW to system size (4 panels × 0.4 kW = 1.6 kWp etc.)
  const systemKwp = panelCount * 0.4;
  const wantHybrid = hasBattery || inverterType === 'hybrid';

  const matchesRegion = (r: 'IE' | 'UK' | 'IE+UK') => {
    if (r === 'IE+UK') return true;          // global brands always pass
    if (r === 'UK')    return isUk;           // UK-only items only for UK
    if (r === 'IE')    return isIe;           // IE-only items only for IE
    return false;
  };

  const inverterPicks = INVERTERS
    .filter((i) => matchesRegion(i.region))
    .map((i) => ({ i, sizeFit: Math.abs(i.ratedKw - Math.max(3, Math.min(10, systemKwp))) }))
    .sort((a, b) => a.sizeFit - b.sizeFit)
    .slice(0, 3)
    .map((x) => x.i);
  void wantHybrid;

  const batteryPicks = hasBattery
    ? BATTERIES
        .filter((b) => matchesRegion(b.region))
        .map((b) => ({ b, fit: Math.abs(b.kwh - batteryKwh) }))
        .sort((a, b) => a.fit - b.fit)
        .slice(0, 3)
        .map((x) => x.b)
    : [];

  const region = isUk ? 'UK' : isIe ? 'IE' : 'Global';

  return {
    panels: PANELS.slice(0, 4),
    inverters: inverterPicks,
    batteries: batteryPicks,
    region,
  };
}
