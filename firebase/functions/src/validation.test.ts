import { describe, expect, it } from 'vitest';
import { isUuid, validExpectedRevision, validOfficialMarketRange } from './validation.js';

describe('callable input validation', () => {
  it('accepts only UUIDs and positive revisions for financial operations', () => {
    expect(isUuid('25c3fb70-4b28-4cec-8d76-0cecf221a4f4')).toBe(true);
    expect(isUuid('house-demo')).toBe(false);
    expect(validExpectedRevision(1)).toBe(true);
    expect(validExpectedRevision(0)).toBe(false);
  });

  it('allowlists official endpoints and caps a query to 366 days', () => {
    expect(validOfficialMarketRange('PoultryTransType_RedFeather', '2025/07/01', '2026/07/01')).toBe(true);
    expect(validOfficialMarketRange('PoultryTransType_RedFeather', '2024/01/01', '2026/07/01')).toBe(false);
    expect(validOfficialMarketRange('https://example.com', '2026/07/01', '2026/07/02')).toBe(false);
  });
});
