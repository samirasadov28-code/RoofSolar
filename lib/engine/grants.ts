export function getGrant(country: string, systemKwp: number): number {
  const code = country.toLowerCase();
  if (code === 'ie') {
    return systemKwp <= 4 ? 2400 : 3000;
  }
  if (code === 'gb') {
    return 0;
  }
  return 0;
}
