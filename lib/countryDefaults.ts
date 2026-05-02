/**
 * Approximate residential electricity tariffs and feed-in rates, plus
 * typical annual household consumption, by country.
 *
 * Sources are public summaries (Eurostat 2024 H1, Ofgem, EIA, ACER).
 * These are reasonable starting defaults — users can override every value
 * in Step 3 / Step 5 of the wizard.
 *
 * Currency notes:
 *  - "symbol" is what we render in inputs (€/£/$ etc).
 *  - All prices are stored in the **local currency per kWh** to keep the
 *    rest of the app simple. The numbers are chosen so the symbol applies.
 */

export interface CountryDefaults {
  countryCode: string;
  symbol: string;
  importPricePerKwh: number;
  exportPricePerKwh: number;
  dayPricePerKwh: number;
  nightPricePerKwh: number;
  annualKwh: number;
  /** SEAI-style upfront grant. 0 = no grant. */
  grant: number;
}

// Lookup keyed by ISO-3166-1 alpha-2 lowercase (matches Nominatim's
// `country_code` field).
const COUNTRY_DEFAULTS: Record<string, CountryDefaults> = {
  // United Kingdom & Ireland — original supported markets
  ie: { countryCode: 'ie', symbol: '€', importPricePerKwh: 0.433, exportPricePerKwh: 0.21,  dayPricePerKwh: 0.433, nightPricePerKwh: 0.15,  annualKwh: 4200, grant: 3000 },
  gb: { countryCode: 'gb', symbol: '£', importPricePerKwh: 0.245, exportPricePerKwh: 0.15,  dayPricePerKwh: 0.245, nightPricePerKwh: 0.10,  annualKwh: 3100, grant: 0 },

  // Eurozone & rest of Europe
  fr: { countryCode: 'fr', symbol: '€', importPricePerKwh: 0.252, exportPricePerKwh: 0.13,  dayPricePerKwh: 0.252, nightPricePerKwh: 0.18,  annualKwh: 4500, grant: 0 },
  de: { countryCode: 'de', symbol: '€', importPricePerKwh: 0.402, exportPricePerKwh: 0.082, dayPricePerKwh: 0.402, nightPricePerKwh: 0.25,  annualKwh: 3500, grant: 0 },
  es: { countryCode: 'es', symbol: '€', importPricePerKwh: 0.234, exportPricePerKwh: 0.09,  dayPricePerKwh: 0.234, nightPricePerKwh: 0.10,  annualKwh: 3300, grant: 0 },
  it: { countryCode: 'it', symbol: '€', importPricePerKwh: 0.378, exportPricePerKwh: 0.10,  dayPricePerKwh: 0.378, nightPricePerKwh: 0.22,  annualKwh: 2700, grant: 0 },
  nl: { countryCode: 'nl', symbol: '€', importPricePerKwh: 0.40,  exportPricePerKwh: 0.08,  dayPricePerKwh: 0.40,  nightPricePerKwh: 0.30,  annualKwh: 2900, grant: 0 },
  be: { countryCode: 'be', symbol: '€', importPricePerKwh: 0.418, exportPricePerKwh: 0.075, dayPricePerKwh: 0.418, nightPricePerKwh: 0.28,  annualKwh: 3500, grant: 0 },
  pt: { countryCode: 'pt', symbol: '€', importPricePerKwh: 0.225, exportPricePerKwh: 0.08,  dayPricePerKwh: 0.225, nightPricePerKwh: 0.13,  annualKwh: 3200, grant: 0 },
  at: { countryCode: 'at', symbol: '€', importPricePerKwh: 0.345, exportPricePerKwh: 0.10,  dayPricePerKwh: 0.345, nightPricePerKwh: 0.20,  annualKwh: 3700, grant: 0 },
  ch: { countryCode: 'ch', symbol: 'CHF', importPricePerKwh: 0.32, exportPricePerKwh: 0.10, dayPricePerKwh: 0.32,  nightPricePerKwh: 0.20,  annualKwh: 4500, grant: 0 },
  dk: { countryCode: 'dk', symbol: 'kr', importPricePerKwh: 2.85, exportPricePerKwh: 0.50,  dayPricePerKwh: 2.85,  nightPricePerKwh: 2.00,  annualKwh: 4000, grant: 0 },
  no: { countryCode: 'no', symbol: 'kr', importPricePerKwh: 1.40, exportPricePerKwh: 0.80,  dayPricePerKwh: 1.40,  nightPricePerKwh: 0.80,  annualKwh: 16000, grant: 0 },
  se: { countryCode: 'se', symbol: 'kr', importPricePerKwh: 1.60, exportPricePerKwh: 0.60,  dayPricePerKwh: 1.60,  nightPricePerKwh: 0.80,  annualKwh: 6000, grant: 0 },
  fi: { countryCode: 'fi', symbol: '€', importPricePerKwh: 0.21,  exportPricePerKwh: 0.06,  dayPricePerKwh: 0.21,  nightPricePerKwh: 0.10,  annualKwh: 7500, grant: 0 },
  pl: { countryCode: 'pl', symbol: 'zł', importPricePerKwh: 0.85, exportPricePerKwh: 0.30,  dayPricePerKwh: 0.85,  nightPricePerKwh: 0.45,  annualKwh: 2400, grant: 0 },
  cz: { countryCode: 'cz', symbol: 'Kč', importPricePerKwh: 6.50, exportPricePerKwh: 1.50,  dayPricePerKwh: 6.50,  nightPricePerKwh: 3.50,  annualKwh: 2500, grant: 0 },

  // North America
  us: { countryCode: 'us', symbol: '$', importPricePerKwh: 0.165, exportPricePerKwh: 0.08,  dayPricePerKwh: 0.165, nightPricePerKwh: 0.10,  annualKwh: 10800, grant: 0 },
  ca: { countryCode: 'ca', symbol: 'C$', importPricePerKwh: 0.18, exportPricePerKwh: 0.085, dayPricePerKwh: 0.18,  nightPricePerKwh: 0.10,  annualKwh: 11000, grant: 0 },

  // Oceania
  au: { countryCode: 'au', symbol: 'A$', importPricePerKwh: 0.32, exportPricePerKwh: 0.05,  dayPricePerKwh: 0.32,  nightPricePerKwh: 0.20,  annualKwh: 6000, grant: 0 },
  nz: { countryCode: 'nz', symbol: 'NZ$', importPricePerKwh: 0.34, exportPricePerKwh: 0.10, dayPricePerKwh: 0.34,  nightPricePerKwh: 0.18,  annualKwh: 7000, grant: 0 },
};

export function getCountryDefaults(countryCode: string): CountryDefaults {
  const cc = (countryCode || '').toLowerCase();
  if (COUNTRY_DEFAULTS[cc]) return COUNTRY_DEFAULTS[cc];
  // Unknown country — fall back to a reasonable global average. User must
  // override in the wizard.
  return {
    countryCode: cc,
    symbol: '',
    importPricePerKwh: 0.25,
    exportPricePerKwh: 0.08,
    dayPricePerKwh: 0.25,
    nightPricePerKwh: 0.12,
    annualKwh: 4000,
    grant: 0,
  };
}

export function currencySymbol(countryCode: string): string {
  return getCountryDefaults(countryCode).symbol;
}
