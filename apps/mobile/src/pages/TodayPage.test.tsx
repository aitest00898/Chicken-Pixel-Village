import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { verifiedMarketFixture, type MarketBundle } from '@chicken-village/market-data';
import { merchantRotationRecords, TodayPage } from './TodayPage';

describe('today market changes', () => {
  it('shows price and percentage change against the previous valid source date', () => {
    const current = verifiedMarketFixture.map((record) => ({ ...record }));
    const previous = current.map((record) => ({ ...record, sourceDate: '2026-07-22', value: record.value === null ? null : record.value - 1 }));
    const bundle: MarketBundle = { records: current, snapshots: [], mode: 'live', message: '已連線農業部 Open Data' };
    render(<TodayPage bundle={bundle} previousRecords={previous} syncing={false} />);
    expect(screen.getByText(/上升 1.0 元/)).toBeInTheDocument();
    expect(screen.getAllByText(/\+1.0.*較 2026-07-22/).length).toBeGreaterThan(0);
  });

  it('rotates merchant quotes across poultry types and regions', () => {
    vi.useFakeTimers();
    try {
      const current = verifiedMarketFixture.map((record) => ({ ...record }));
      const previous = current.map((record) => ({ ...record, sourceDate: '2026-07-22', value: record.value === null ? null : record.value - 1 }));
      const bundle: MarketBundle = { records: current, snapshots: [], mode: 'live', message: '已連線農業部 Open Data' };
      render(<TodayPage bundle={bundle} previousRecords={previous} syncing={false} />);

      expect(screen.getByText(/行情商人・阿穀・輪動報價/)).toBeInTheDocument();
      expect(screen.getByText(/紅羽土雞/, { selector: '.market-scene__dialog p' })).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      expect(screen.getByText(/黑羽土雞/, { selector: '.market-scene__dialog p' })).toBeInTheDocument();
      expect(screen.getByText(/輪報 2 \/ 13/)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('builds a merchant quote queue by interleaving available categories', () => {
    const rotation = merchantRotationRecords(verifiedMarketFixture);
    expect(rotation).toHaveLength(verifiedMarketFixture.length);
    expect(rotation.slice(0, 4).map((record) => record.item)).toEqual([
      'red_central_male',
      'black_south_male',
      'broiler_medium',
      'egg_transport',
    ]);
  });
});
