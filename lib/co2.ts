/**
 * Grid CO₂ intensity (kg CO₂ per kWh) by ISO-3166-1 alpha-2 country code.
 * Rough 2023-24 averages from EmberClimate / IEA / Our World in Data.
 * Used for the CO₂-saved metric only — large fluctuations year-to-year for
 * hydro/wind heavy grids (NO, IS, BR) are unavoidable.
 */
export const CO2_KG_PER_KWH: Record<string, number> = {
  // Europe — Western
  gb: 0.233, ie: 0.295, fr: 0.058, de: 0.380, es: 0.190, it: 0.290,
  nl: 0.330, be: 0.165, pt: 0.180, at: 0.140, ch: 0.040, lu: 0.090,
  gr: 0.460, mt: 0.420, cy: 0.620, is: 0.001,
  // Europe — Nordic
  dk: 0.140, no: 0.020, se: 0.040, fi: 0.090,
  // Europe — Central / Eastern / Balkans
  pl: 0.660, cz: 0.420, hu: 0.220, ro: 0.290, bg: 0.380, hr: 0.180,
  si: 0.220, sk: 0.140, ee: 0.450, lv: 0.110, lt: 0.130,
  ua: 0.350, tr: 0.440, rs: 0.640, ru: 0.380, md: 0.450, by: 0.450, ge: 0.130,
  am: 0.220, az: 0.480, al: 0.030, ba: 0.700, mk: 0.580, me: 0.260, xk: 0.880,
  li: 0.040, mc: 0.070, ad: 0.150, sm: 0.290,
  // North America
  us: 0.380, ca: 0.130, mx: 0.430,
  // Central America & Caribbean
  hn: 0.300, sv: 0.220, ni: 0.380, cr: 0.040, pa: 0.250, gt: 0.260,
  do: 0.530, jm: 0.620, cu: 0.730, bs: 0.660, bb: 0.640, tt: 0.650,
  // South America
  br: 0.090, cl: 0.310, ar: 0.330, co: 0.180, pe: 0.250, uy: 0.080,
  ec: 0.230, py: 0.020, bo: 0.350, ve: 0.180,
  // Asia — East & Southeast
  jp: 0.470, kr: 0.430, cn: 0.582, tw: 0.560, hk: 0.700, sg: 0.430, mo: 0.620,
  my: 0.700, th: 0.490, id: 0.760, vn: 0.470, ph: 0.620,
  mm: 0.430, kh: 0.470, la: 0.180, bn: 0.530,
  // Asia — South
  in: 0.713, pk: 0.460, bd: 0.620, lk: 0.570, np: 0.020, bt: 0.001,
  mv: 0.730, af: 0.150,
  // Asia — Central
  kz: 0.580, uz: 0.480, kg: 0.110, tj: 0.080, tm: 0.660, mn: 0.770,
  // Middle East
  ae: 0.470, sa: 0.685, qa: 0.485, kw: 0.610, bh: 0.620, om: 0.520,
  jo: 0.460, lb: 0.700, il: 0.560, ir: 0.510, iq: 0.620,
  ye: 0.530, ps: 0.560, sy: 0.580,
  // Africa
  za: 0.910, ng: 0.430, ke: 0.180, et: 0.020, gh: 0.430, ci: 0.430,
  sn: 0.510, tz: 0.300, ug: 0.060, zm: 0.040, zw: 0.530, na: 0.120,
  bw: 0.700, mu: 0.680, ao: 0.290, mz: 0.110, rw: 0.330, eg: 0.460,
  ma: 0.660, tn: 0.530, dz: 0.520, ly: 0.640, sd: 0.500,
  cm: 0.270, cd: 0.030, ml: 0.470, bf: 0.530, mg: 0.420, mw: 0.150,
  // Oceania
  au: 0.560, nz: 0.110, fj: 0.430, pg: 0.450,
};

/** 2024 IEA world-average grid intensity. */
export const GLOBAL_AVG_CO2 = 0.475;

export function co2FactorFor(countryCode: string | undefined): number {
  const cc = (countryCode || '').toLowerCase();
  return CO2_KG_PER_KWH[cc] ?? GLOBAL_AVG_CO2;
}
