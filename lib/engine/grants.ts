import { getCountryDefaults } from '../countryDefaults';

/**
 * Returns the upfront-equivalent grant or incentive in local currency for a
 * given country, system size, and gross system cost.
 *
 * Different markets use very different incentive mechanisms (cash grants,
 * tax credits, VAT refunds, per-kWp rebates, certificate trading). We
 * collapse them all into a single "upfront-equivalent reduction" that
 * net capex calculations can apply uniformly. This is the same simplification
 * every reputable solar calculator uses — accurate enough for ROI modelling,
 * with the caveat noted below.
 *
 * Where the actual benefit is realised over time (e.g. US ITC tax credit
 * claimed the following April, IT Detrazione spread over 10 years) we treat
 * it as if applied upfront. The user's IRR/payback will be slightly
 * optimistic vs reality (no time-value-of-money on deferred credits),
 * but typical errors are < 1 year on payback.
 *
 * `systemCostGross` is required for any tax-credit / VAT-refund mechanism;
 * if you call without it those countries return 0.
 */
export function getGrant(country: string, systemKwp: number, systemCostGross: number = 0): number {
  const code = (country || '').toLowerCase();

  // ── Cash-grant countries ──────────────────────────────────────────
  // Ireland — SEAI residential grant (size-banded, May 2026 rates)
  if (code === 'ie') {
    return systemKwp <= 4 ? 2400 : 3000;
  }

  // ── Tax-credit / refund countries (need systemCostGross) ──────────
  if (systemCostGross > 0) {
    // United States — Federal Investment Tax Credit (Inflation Reduction Act):
    // 30% of qualified expenditure, locked in through 2032. Applies to gross
    // residential PV cost incl. battery if charged ≥75% from solar.
    if (code === 'us') {
      return systemCostGross * 0.30;
    }

    // Italy — Detrazione fiscale 50% (residential bonus).
    // 50% deduction on system cost, claimable over 10 years.
    // Cap: €96,000 per property; well above any realistic residential install.
    if (code === 'it') {
      return Math.min(systemCostGross * 0.50, 96000);
    }

    // Netherlands — BTW-teruggave: 21% VAT on residential PV is fully
    // refundable to the homeowner via the BTW-aangifte. Modelled as a
    // 21% effective discount on gross cost.
    if (code === 'nl') {
      return systemCostGross * 0.21;
    }

    // Spain — IRPF deduction (autonomía-dependent, typically 15–40%).
    // We use a conservative 25% mid-point, capped at €15,000.
    if (code === 'es') {
      return Math.min(systemCostGross * 0.25, 15000);
    }

    // Portugal — Fundo Ambiental: 30% reimbursement up to €1,200 historically.
    if (code === 'pt') {
      return Math.min(systemCostGross * 0.30, 1200);
    }
  }

  // ── Per-kWp rebate countries ──────────────────────────────────────
  // France — MaPrimeRénov' integrated PV: ~€300/kWp for typical band-3 incomes,
  // higher for lower-income households; we use a representative middle estimate.
  if (code === 'fr') {
    return Math.min(systemKwp * 300, 4000);
  }

  // Australia — STC rebate (Small-scale Technology Certificates).
  // Zone-3 (most populated regions) ≈ 12 STCs/kWp × ~A$36/STC ≈ A$432/kWp.
  if (code === 'au') {
    return systemKwp * 430;
  }

  // India — PM Surya Ghar (Muft Bijli Yojana) subsidy:
  // ₹30,000 for first 1 kW, ₹18,000/kW for next 2 kW, capped at ₹78,000.
  if (code === 'in') {
    if (systemKwp <= 1) return systemKwp * 30000;
    if (systemKwp <= 3) return 30000 + (systemKwp - 1) * 18000;
    return 78000;
  }

  // Poland — Mój Prąd v6: PLN 6,000 for PV-only, PLN 16,000 with battery.
  if (code === 'pl') {
    return 6000;
  }

  // ── No upfront grant modelled (uses feed-in / loan instead) ───────
  // Germany (KfW 270 = low-rate loan, not a grant; 0% VAT since 2023 already
  //   typically reflected in net-of-VAT installer quotes)
  // United Kingdom (SEG = feed-in scheme, already in export price; 0% VAT
  //   on residential PV since April 2022, usually quoted net)
  // Belgium, Austria, CH, Nordic countries — varied/regional schemes; user
  //   can override the "grant" field manually in Step 5.

  // Default — fall back to the flat amount in country defaults (mostly 0).
  return getCountryDefaults(code).grant;
}

/** Display name of the grant / incentive scheme for the user's country. */
export function getGrantSchemeName(country: string): string {
  return getCountryDefaults(country).grantSchemeName;
}

/**
 * Short user-friendly explanation of how the incentive is realised
 * (cash, tax credit, refund, etc.). Used in the calculation breakdown
 * row so users understand the timing caveat for tax credits.
 */
export function getGrantMechanism(country: string): string {
  const code = (country || '').toLowerCase();
  switch (code) {
    case 'ie': return 'cash grant paid post-installation';
    case 'us': return 'federal tax credit (claim with annual return)';
    case 'it': return 'income-tax deduction over 10 years';
    case 'nl': return 'BTW (VAT) refund';
    case 'es': return 'IRPF tax deduction (varies by region)';
    case 'pt': return 'Fundo Ambiental reimbursement';
    case 'fr': return "MaPrimeRénov' bonus";
    case 'au': return 'STC certificate rebate (point-of-sale)';
    case 'in': return 'CFA subsidy paid post-commissioning';
    case 'pl': return 'Mój Prąd grant';
    default:   return 'local incentive (varies)';
  }
}
