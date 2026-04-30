/**
 * Early-access allowlist.
 *
 * Any email listed here (or in the comma-separated env var
 * NEXT_PUBLIC_EARLY_ACCESS_EMAILS) is treated as a Pro user app-wide
 * without needing a paid pro_purchases row. Used by ProGate and the
 * /api/report PDF endpoint.
 */

const BAKED_IN: string[] = [
  'samir.asadov.28@gmail.com',
];

function readEnvList(): string[] {
  const raw = process.env.NEXT_PUBLIC_EARLY_ACCESS_EMAILS ?? '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function earlyAccessEmails(): string[] {
  const env = readEnvList();
  const baked = BAKED_IN.map((e) => e.toLowerCase());
  return Array.from(new Set([...baked, ...env]));
}

export function isEarlyAccess(email: string | null | undefined): boolean {
  if (!email) return false;
  return earlyAccessEmails().includes(email.toLowerCase());
}
