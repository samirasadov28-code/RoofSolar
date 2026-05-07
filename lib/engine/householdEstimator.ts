/**
 * Rough kWh-per-year estimator for a household.
 *
 * Empirical formula: a base load + per-person load + per-square-metre load,
 * scaled by the country average so locations with electric heating
 * (e.g. Norway, Sweden) reflect realistic consumption.
 *
 *   baseline = 800 + 800 × people + 12 × sqm
 *   factor   = countryAverageKwh / 4200      (4200 ≈ Ireland reference)
 *   estimate = baseline × factor
 *
 * Works well within ±20% for typical 1–6 person homes between 40 and 250 m².
 */

export function estimateAnnualKwh(
  houseAreaSqM: number,
  householdSize: number,
  countryAverageKwh: number
): number {
  const sqm = Math.max(20, Math.min(500, houseAreaSqM || 0));
  const people = Math.max(1, Math.min(10, householdSize || 0));
  const baseline = 800 + 800 * people + 12 * sqm;
  const factor = countryAverageKwh > 0 ? countryAverageKwh / 4200 : 1;
  return Math.round(baseline * factor);
}
