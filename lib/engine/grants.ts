import { getCountryDefaults } from '@/lib/countryDefaults';

/**
 * Returns the upfront grant in local currency for a given country and system size.
 *
 * Most countries don't have a clean "upfront cash grant" model — they use
 * tax credits, feed-in premia, or accelerated VAT relief instead. We model
 * those separately (or leave them to the user). This function returns 0
 * for countries we don't have an upfront-grant model for.
 */
export function getGrant(country: string, systemKwp: number): number {
  const code = (country || '').toLowerCase();

  // Ireland — SEAI residential grant (size-banded, May 2026 rates)
  if (code === 'ie') {
    return systemKwp <= 4 ? 2400 : 3000;
  }

  // United States — Federal ITC at 30% of net system cost. We can't model
  // it here without the gross cost, so the % credit is applied at calc time.
  // Default upfront grant is 0; the country-defaults flag exposes the scheme name.
  if (code === 'us') return 0;

  // Default — country defaults table is the source of truth for any flat
  // upfront grant amount.
  return getCountryDefaults(code).grant;
}

/** Display name of the grant / incentive scheme for the user's country. */
export function getGrantSchemeName(country: string): string {
  return getCountryDefaults(country).grantSchemeName;
}
