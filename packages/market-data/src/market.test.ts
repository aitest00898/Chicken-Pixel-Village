import { describe, expect, it } from 'vitest';
import { marketFreshness, merchantLine, parseMoaHistoryRows, verifiedMarketFixture } from './index';

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

describe('MOA history parser', () => {
  it('maps the selected series, preserves missing values and sorts oldest first', () => {
    const points = parseMoaHistoryRows('red_north_female', [
      { TransDate: '2026/07/03', RedFeather_N_F: '休市' },
      { TransDate: '2026/07/01', RedFeather_N_F: '46.0' },
      { TransDate: '2026/07/02', RedFeather_N_F: '47.5' },
    ]);
    expect(points).toEqual([
      { date: '2026-07-01', value: 46 },
      { date: '2026-07-02', value: 47.5 },
      { date: '2026-07-03', value: null },
    ]);
  });

  it('reads black-feather, broiler and egg fields independently', () => {
    const row = [{ TransDate: '2026/07/01', BlackFeather_S_M: '48', 'TaijinPrice_2.0kgup': '33.8', egg_Producer_Price: '34.5' }];
    expect(parseMoaHistoryRows('black_south_male', row)[0]?.value).toBe(48);
    expect(parseMoaHistoryRows('broiler_large', row)[0]?.value).toBe(33.8);
    expect(parseMoaHistoryRows('egg_producer', row)[0]?.value).toBe(34.5);
  });
});
