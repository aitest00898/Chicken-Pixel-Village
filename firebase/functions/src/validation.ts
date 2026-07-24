export const OFFICIAL_ENDPOINTS = new Set([
  'PoultryTransType_RedFeather',
  'PoultryTransType_BlackFeather',
  'PoultryTransType_BoiledChicken_Eggs',
]);

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function validExpectedRevision(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 1;
}

export function validOfficialMarketRange(endpoint: unknown, start: unknown, end: unknown): boolean {
  if (typeof endpoint !== 'string' || !OFFICIAL_ENDPOINTS.has(endpoint) || typeof start !== 'string' || typeof end !== 'string' || !/^\d{4}\/\d{2}\/\d{2}$/.test(start) || !/^\d{4}\/\d{2}\/\d{2}$/.test(end)) return false;
  const startTime = Date.parse(`${start.replaceAll('/', '-')}T00:00:00Z`);
  const endTime = Date.parse(`${end.replaceAll('/', '-')}T00:00:00Z`);
  return Number.isFinite(startTime) && Number.isFinite(endTime) && startTime <= endTime && endTime - startTime <= 366 * 86_400_000;
}

