/**
 * Centralized number formatters so every visible number across the app
 * uses thousand separators consistently.
 */

export function fmtInt(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return Math.round(n).toLocaleString();
}

export function fmtMoney(n: number | null | undefined, symbol = ''): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${symbol}${Math.round(n).toLocaleString()}`;
}

export function fmtMoney2(n: number | null | undefined, symbol = ''): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtPct(frac: number | null | undefined, digits = 1): string {
  if (frac == null || !Number.isFinite(frac)) return '—';
  return `${(frac * 100).toFixed(digits)}%`;
}

export function fmtKwh(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${Math.round(n).toLocaleString()} kWh`;
}
