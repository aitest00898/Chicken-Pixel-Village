import { describe, expect, it } from 'vitest';
import { marketFreshness, merchantLine, verifiedMarketFixture } from './index';

describe('merchant formatter', () => {
  const current = verifiedMarketFixture.find((record) => record.item === 'egg_producer')!;

  it('describes rise, fall and flat deterministically', () => {
    expect(merchantLine(current, { ...current, value: 33.5 })).toContain('上升 1.0 元');
    expect(merchantLine(current, { ...current, value: 35.5 })).toContain('下降 1.0 元');
    expect(merchantLine(current, { ...current, value: 34.5 })).toContain('持平');
  });

  it('does not invent missing values', () => {
    expect(merchantLine({ ...current, value: null, status: 'missing' })).toContain('不會替市場猜價格');
  });

  it('warns for weekly references', () => {
    expect(merchantLine({ ...current, frequency: 'weekly' })).toContain('不代表個別交易價格');
  });
});

describe('freshness', () => {
  it('uses frequency-specific stale windows', () => {
    const record = verifiedMarketFixture[0]!;
    expect(marketFreshness(record, '2026-07-24').stale).toBe(false);
    expect(marketFreshness(record, '2026-07-30').stale).toBe(true);
    expect(marketFreshness({ ...record, frequency: 'weekly' }, '2026-07-30').stale).toBe(false);
  });
});

