import { describe, expect, it } from 'vitest';
import { taipeiDate } from './visitProgress';

describe('Firebase daily login date', () => {
  it('uses the Asia/Taipei calendar date across UTC midnight', () => {
    expect(taipeiDate(new Date('2026-07-23T16:30:00.000Z'))).toBe('2026-07-24');
    expect(taipeiDate(new Date('2026-07-24T15:59:59.000Z'))).toBe('2026-07-24');
  });
});
