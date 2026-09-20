export function measurementId(production: boolean, value: unknown): string | undefined {
  return production && typeof value === 'string' && /^G-[A-Z0-9]{10}$/.test(value) && value !== 'G-XXXXXXXXXX' ? value : undefined;
}

export function buildMeasurementId(production: boolean, value: unknown): string | undefined {
  if (!production || value === undefined || value === '') return undefined;
  const id = measurementId(true, value);
  if (!id) throw new Error('Invalid PUBLIC_GA_MEASUREMENT_ID: use a valid G- identifier or leave it unset.');
  return id;
}

export function productionLocation(current: string, canonical: string): boolean {
  try {
    const expected = new URL(canonical);
    return expected.protocol === 'https:' && new URL(current).origin === expected.origin;
  } catch { return false; }
}
