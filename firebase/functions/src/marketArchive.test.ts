import { describe, expect, it, vi } from 'vitest';
import { fetchScheduledMarketRecords } from './marketArchive.js';

describe('scheduled market archive', () => {
  it('selects each endpoint latest official date and creates 13 idempotent records', async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const data = url.includes('RedFeather')
        ? [
            { TransDate: '2026/07/23', RedFeather_N_M: '46', RedFeather_N_F: '46', RedFeather_C_M: '47', RedFeather_C_F: '47', RedFeather_S_M: '50', RedFeather_S_F: '48' },
            { TransDate: '2026/07/22', RedFeather_N_M: '45' },
          ]
        : url.includes('BlackFeather')
          ? [{ TransDate: '2026/07/22', BlackFeather_S_M: '48', BlackFeather_S_F: '休市' }]
          : [{ TransDate: '2026/07/23', 'TaijinPrice_2.0kgup': '33.8', 'TaijinPrice_1.75kg_1.95kg': '33.8', Store_KP_TaijinPrice: '35.3', egg_Price: '37.5', egg_Producer_Price: '34.5' }];
      return new Response(JSON.stringify({ RS: 'OK', Data: data }), { status: 200 });
    });
    const records = await fetchScheduledMarketRecords(new Date('2026-07-24T10:30:00.000Z'), fetcher as typeof fetch);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(records).toHaveLength(13);
    expect(records.find((record) => record.item === 'red_north_male')).toMatchObject({ sourceDate: '2026-07-23', value: 46 });
    expect(records.find((record) => record.item === 'black_south_male')).toMatchObject({ sourceDate: '2026-07-22', value: 48 });
    expect(records.find((record) => record.item === 'black_south_female')).toMatchObject({ status: 'missing', value: null });
    expect(records.every((record) => record.capturedBy === 'scheduled-function')).toBe(true);
  });
});
