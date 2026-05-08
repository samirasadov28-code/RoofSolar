/**
 * Approximate residential electricity tariffs and feed-in rates, plus
 * typical annual household consumption, by country.
 *
 * Sources are public summaries (Eurostat 2024 H1, Ofgem, EIA, ACER, AEMC,
 * EmberClimate). These are reasonable starting defaults — users can override
 * every value in the wizard.
 *
 * Currency notes:
 *  - "symbol" is what we render in inputs (€/£/$ etc).
 *  - "currencyCode" is ISO-4217 (used for downstream payments / accounting).
 *  - All prices are stored in the local currency per kWh to keep the rest of
 *    the app simple.
 */

export interface CountryDefaults {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  symbol: string;
  importPricePerKwh: number;
  exportPricePerKwh: number;
  dayPricePerKwh: number;
  nightPricePerKwh: number;
  annualKwh: number;
  /** Upfront grant amount in local currency. 0 = no scheme modelled. */
  grant: number;
  /** Display label for the grant scheme, e.g. "SEAI grant", "Federal ITC". */
  grantSchemeName: string;
  /** Average optimal panel tilt for residential roofs (degrees). */
  typicalTiltDeg: number;
  /** Examples of common time-of-use tariff names in this market. */
  touTariffExamples: string;
}

/**
 * Snapshot date for the tariff defaults below.
 * Bump this whenever you refresh the price data so the wizard can
 * show "data as of …" and let users decide whether to override.
 */
export const TARIFF_DATA_AS_OF = '2026-05';

// Lookup keyed by ISO-3166-1 alpha-2 lowercase (matches Nominatim's
// `country_code` field).
const COUNTRY_DEFAULTS: Record<string, CountryDefaults> = {
  // Ireland & UK
  ie: { countryCode: 'ie', countryName: 'Ireland',        currencyCode: 'EUR', symbol: '€', importPricePerKwh: 0.433, exportPricePerKwh: 0.21,  dayPricePerKwh: 0.433, nightPricePerKwh: 0.15,  annualKwh: 4200,  grant: 3000, grantSchemeName: 'SEAI grant',                typicalTiltDeg: 35, touTariffExamples: 'Smart Meter, EcoTracker, Night Saver' },
  gb: { countryCode: 'gb', countryName: 'United Kingdom', currencyCode: 'GBP', symbol: '£', importPricePerKwh: 0.245, exportPricePerKwh: 0.15,  dayPricePerKwh: 0.245, nightPricePerKwh: 0.10,  annualKwh: 3100,  grant: 0,    grantSchemeName: 'Smart Export Guarantee',    typicalTiltDeg: 35, touTariffExamples: 'Octopus Agile, Economy 7, Cosy' },

  // Eurozone & rest of Europe
  fr: { countryCode: 'fr', countryName: 'France',         currencyCode: 'EUR', symbol: '€', importPricePerKwh: 0.252, exportPricePerKwh: 0.13,  dayPricePerKwh: 0.252, nightPricePerKwh: 0.18,  annualKwh: 4500,  grant: 0,    grantSchemeName: "MaPrimeRénov' / EDF OA",    typicalTiltDeg: 35, touTariffExamples: 'Heures Creuses, Tempo' },
  de: { countryCode: 'de', countryName: 'Germany',        currencyCode: 'EUR', symbol: '€', importPricePerKwh: 0.402, exportPricePerKwh: 0.082, dayPricePerKwh: 0.402, nightPricePerKwh: 0.25,  annualKwh: 3500,  grant: 0,    grantSchemeName: 'KfW 270 / EEG Einspeisevergütung', typicalTiltDeg: 32, touTariffExamples: 'HT/NT, Tibber dynamisch' },
  es: { countryCode: 'es', countryName: 'Spain',          currencyCode: 'EUR', symbol: '€', importPricePerKwh: 0.234, exportPricePerKwh: 0.09,  dayPricePerKwh: 0.234, nightPricePerKwh: 0.10,  annualKwh: 3300,  grant: 0,    grantSchemeName: 'PNIEC / IRPF deduction',    typicalTiltDeg: 30, touTariffExamples: 'Tarifa 2.0TD, PVPC' },
  it: { countryCode: 'it', countryName: 'Italy',          currencyCode: 'EUR', symbol: '€', importPricePerKwh: 0.378, exportPricePerKwh: 0.10,  dayPricePerKwh: 0.378, nightPricePerKwh: 0.22,  annualKwh: 2700,  grant: 0,    grantSchemeName: 'Detrazione 50% / Superbonus', typicalTiltDeg: 30, touTariffExamples: 'F1/F2/F3 fasce orarie' },
  nl: { countryCode: 'nl', countryName: 'Netherlands',    currencyCode: 'EUR', symbol: '€', importPricePerKwh: 0.40,  exportPricePerKwh: 0.08,  dayPricePerKwh: 0.40,  nightPricePerKwh: 0.30,  annualKwh: 2900,  grant: 0,    grantSchemeName: 'BTW-teruggave / SDE++',     typicalTiltDeg: 35, touTariffExamples: 'Dynamische tarieven, dag/nacht' },
  be: { countryCode: 'be', countryName: 'Belgium',        currencyCode: 'EUR', symbol: '€', importPricePerKwh: 0.418, exportPricePerKwh: 0.075, dayPricePerKwh: 0.418, nightPricePerKwh: 0.28,  annualKwh: 3500,  grant: 0,    grantSchemeName: 'Mijn VerbouwPremie / Prime',    typicalTiltDeg: 35, touTariffExamples: 'Tweevoudig dag/nacht' },
  pt: { countryCode: 'pt', countryName: 'Portugal',       currencyCode: 'EUR', symbol: '€', importPricePerKwh: 0.225, exportPricePerKwh: 0.08,  dayPricePerKwh: 0.225, nightPricePerKwh: 0.13,  annualKwh: 3200,  grant: 0,    grantSchemeName: 'Fundo Ambiental',           typicalTiltDeg: 30, touTariffExamples: 'Bi-horária, tri-horária' },
  at: { countryCode: 'at', countryName: 'Austria',        currencyCode: 'EUR', symbol: '€', importPricePerKwh: 0.345, exportPricePerKwh: 0.10,  dayPricePerKwh: 0.345, nightPricePerKwh: 0.20,  annualKwh: 3700,  grant: 0,    grantSchemeName: 'OeMAG / Klima- und Energiefonds', typicalTiltDeg: 35, touTariffExamples: 'Smart Meter dynamisch' },
  ch: { countryCode: 'ch', countryName: 'Switzerland',    currencyCode: 'CHF', symbol: 'CHF ', importPricePerKwh: 0.32, exportPricePerKwh: 0.10, dayPricePerKwh: 0.32, nightPricePerKwh: 0.20,  annualKwh: 4500,  grant: 0,    grantSchemeName: 'Pronovo Einmalvergütung',   typicalTiltDeg: 35, touTariffExamples: 'Hoch-/Niedertarif' },
  dk: { countryCode: 'dk', countryName: 'Denmark',        currencyCode: 'DKK', symbol: 'kr ', importPricePerKwh: 2.85, exportPricePerKwh: 0.50, dayPricePerKwh: 2.85,  nightPricePerKwh: 2.00,  annualKwh: 4000,  grant: 0,    grantSchemeName: 'Skattefradrag PSO',         typicalTiltDeg: 40, touTariffExamples: 'Spotpris, dag/nat' },
  no: { countryCode: 'no', countryName: 'Norway',         currencyCode: 'NOK', symbol: 'kr ', importPricePerKwh: 1.40, exportPricePerKwh: 0.80, dayPricePerKwh: 1.40,  nightPricePerKwh: 0.80,  annualKwh: 16000, grant: 0,    grantSchemeName: 'Enova-tilskudd',            typicalTiltDeg: 45, touTariffExamples: 'Spotpris, effekttariff' },
  se: { countryCode: 'se', countryName: 'Sweden',         currencyCode: 'SEK', symbol: 'kr ', importPricePerKwh: 1.60, exportPricePerKwh: 0.60, dayPricePerKwh: 1.60,  nightPricePerKwh: 0.80,  annualKwh: 6000,  grant: 0,    grantSchemeName: 'Grön teknik (skatteavdrag)', typicalTiltDeg: 45, touTariffExamples: 'Timpris, hög-/låglast' },
  fi: { countryCode: 'fi', countryName: 'Finland',        currencyCode: 'EUR', symbol: '€', importPricePerKwh: 0.21,  exportPricePerKwh: 0.06,  dayPricePerKwh: 0.21,  nightPricePerKwh: 0.10,  annualKwh: 7500,  grant: 0,    grantSchemeName: 'Energiavero-palautus',      typicalTiltDeg: 45, touTariffExamples: 'Pörssisähkö, yösähkö' },
  pl: { countryCode: 'pl', countryName: 'Poland',         currencyCode: 'PLN', symbol: 'zł ', importPricePerKwh: 0.85, exportPricePerKwh: 0.30, dayPricePerKwh: 0.85,  nightPricePerKwh: 0.45,  annualKwh: 2400,  grant: 0,    grantSchemeName: 'Mój Prąd',                  typicalTiltDeg: 35, touTariffExamples: 'G12, G12w' },
  cz: { countryCode: 'cz', countryName: 'Czech Republic', currencyCode: 'CZK', symbol: 'Kč ', importPricePerKwh: 6.50, exportPricePerKwh: 1.50, dayPricePerKwh: 6.50,  nightPricePerKwh: 3.50,  annualKwh: 2500,  grant: 0,    grantSchemeName: 'Nová zelená úsporám',       typicalTiltDeg: 35, touTariffExamples: 'D25d, D26d' },

  // North America
  us: { countryCode: 'us', countryName: 'United States',  currencyCode: 'USD', symbol: '$',   importPricePerKwh: 0.165, exportPricePerKwh: 0.08, dayPricePerKwh: 0.165, nightPricePerKwh: 0.10, annualKwh: 10800, grant: 0, grantSchemeName: 'Federal ITC (30%) + state credits', typicalTiltDeg: 30, touTariffExamples: 'TOU-D, NEM 3.0, EV-A' },
  ca: { countryCode: 'ca', countryName: 'Canada',         currencyCode: 'CAD', symbol: 'C$ ', importPricePerKwh: 0.18,  exportPricePerKwh: 0.085, dayPricePerKwh: 0.18, nightPricePerKwh: 0.10, annualKwh: 11000, grant: 0, grantSchemeName: 'Greener Homes / provincial', typicalTiltDeg: 40, touTariffExamples: 'Time-of-Use, Tier 1/2' },
  mx: { countryCode: 'mx', countryName: 'Mexico',         currencyCode: 'MXN', symbol: 'MX$ ', importPricePerKwh: 4.50, exportPricePerKwh: 1.20, dayPricePerKwh: 4.50, nightPricePerKwh: 2.20, annualKwh: 3000,  grant: 0, grantSchemeName: 'Net metering (CFE)',         typicalTiltDeg: 25, touTariffExamples: 'DAC, Tarifa 1F' },

  // Oceania
  au: { countryCode: 'au', countryName: 'Australia',      currencyCode: 'AUD', symbol: 'A$ ',  importPricePerKwh: 0.32, exportPricePerKwh: 0.05, dayPricePerKwh: 0.32, nightPricePerKwh: 0.20, annualKwh: 6000, grant: 0, grantSchemeName: 'STC rebate / state schemes',  typicalTiltDeg: 25, touTariffExamples: 'Time-of-Use, Demand tariff' },
  nz: { countryCode: 'nz', countryName: 'New Zealand',    currencyCode: 'NZD', symbol: 'NZ$ ', importPricePerKwh: 0.34, exportPricePerKwh: 0.10, dayPricePerKwh: 0.34, nightPricePerKwh: 0.18, annualKwh: 7000, grant: 0, grantSchemeName: 'Buy-back rate (varies)',      typicalTiltDeg: 35, touTariffExamples: 'Day/Night, peak/off-peak' },

  // Asia
  jp: { countryCode: 'jp', countryName: 'Japan',          currencyCode: 'JPY', symbol: '¥ ', importPricePerKwh: 28,    exportPricePerKwh: 16,   dayPricePerKwh: 28,    nightPricePerKwh: 18,   annualKwh: 4500,  grant: 0, grantSchemeName: 'FIT / FIP scheme',         typicalTiltDeg: 30, touTariffExamples: '時間帯別電灯' },
  kr: { countryCode: 'kr', countryName: 'South Korea',    currencyCode: 'KRW', symbol: '₩ ', importPricePerKwh: 165,   exportPricePerKwh: 80,   dayPricePerKwh: 165,   nightPricePerKwh: 95,   annualKwh: 4500,  grant: 0, grantSchemeName: 'KEPCO net metering',       typicalTiltDeg: 30, touTariffExamples: 'TOU residential' },
  in: { countryCode: 'in', countryName: 'India',          currencyCode: 'INR', symbol: '₹ ', importPricePerKwh: 7.5,   exportPricePerKwh: 3.0,  dayPricePerKwh: 7.5,   nightPricePerKwh: 4.0,  annualKwh: 1800,  grant: 0, grantSchemeName: 'PM Surya Ghar (subsidy)',  typicalTiltDeg: 25, touTariffExamples: 'TOD, slab tariff' },
  cn: { countryCode: 'cn', countryName: 'China',          currencyCode: 'CNY', symbol: '¥ ', importPricePerKwh: 0.55,  exportPricePerKwh: 0.20, dayPricePerKwh: 0.55,  nightPricePerKwh: 0.30, annualKwh: 1700,  grant: 0, grantSchemeName: 'Local DRE subsidy',         typicalTiltDeg: 30, touTariffExamples: 'TOU 阶梯电价' },

  // South America
  br: { countryCode: 'br', countryName: 'Brazil',         currencyCode: 'BRL', symbol: 'R$ ', importPricePerKwh: 0.85, exportPricePerKwh: 0.55, dayPricePerKwh: 0.85,  nightPricePerKwh: 0.55, annualKwh: 2200,  grant: 0, grantSchemeName: 'SCEE compensation',       typicalTiltDeg: 25, touTariffExamples: 'Branca, convencional' },
  cl: { countryCode: 'cl', countryName: 'Chile',          currencyCode: 'CLP', symbol: '$ ',  importPricePerKwh: 160,  exportPricePerKwh: 60,   dayPricePerKwh: 160,   nightPricePerKwh: 90,   annualKwh: 2800,  grant: 0, grantSchemeName: 'Net billing (Ley 20.571)', typicalTiltDeg: 30, touTariffExamples: 'BT-1, BT-3' },

  // Africa
  za: { countryCode: 'za', countryName: 'South Africa',   currencyCode: 'ZAR', symbol: 'R ',  importPricePerKwh: 3.20, exportPricePerKwh: 0.85, dayPricePerKwh: 3.20,  nightPricePerKwh: 1.80, annualKwh: 4000,  grant: 0, grantSchemeName: 'SARS Section 12B / IRR',  typicalTiltDeg: 30, touTariffExamples: 'Homeflex, Homepower' },
};

const FALLBACK: CountryDefaults = {
  countryCode: '',
  countryName: 'Your country',
  currencyCode: 'USD',
  symbol: '$',
  importPricePerKwh: 0.25,
  exportPricePerKwh: 0.08,
  dayPricePerKwh: 0.25,
  nightPricePerKwh: 0.12,
  annualKwh: 4000,
  grant: 0,
  grantSchemeName: 'Local incentives may apply',
  typicalTiltDeg: 30,
  touTariffExamples: 'time-of-use / off-peak rates',
};

export function getCountryDefaults(countryCode: string): CountryDefaults {
  const cc = (countryCode || '').toLowerCase();
  if (COUNTRY_DEFAULTS[cc]) return COUNTRY_DEFAULTS[cc];
  return { ...FALLBACK, countryCode: cc };
}

export function currencySymbol(countryCode: string): string {
  return getCountryDefaults(countryCode).symbol;
}

/** Sorted list of all supported countries — for the country-override dropdown. */
export function listSupportedCountries(): { code: string; name: string }[] {
  return Object.values(COUNTRY_DEFAULTS)
    .map((c) => ({ code: c.countryCode, name: c.countryName }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
