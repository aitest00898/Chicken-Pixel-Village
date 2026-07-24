import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { verifiedMarketFixture, type MarketBundle } from '@chicken-village/market-data';
import { TodayPage } from './TodayPage';

describe('today market changes', () => {
  it('shows price and percentage change against the previous valid source date', () => {
    const current = verifiedMarketFixture.map((record) => ({ ...record }));
    const previous = current.map((record) => ({ ...record, sourceDate: '2026-07-22', value: record.value === null ? null : record.value - 1 }));
    const bundle: MarketBundle = { records: current, snapshots: [], mode: 'live', message: '已連線農業部 Open Data' };
    render(<TodayPage bundle={bundle} previousRecords={previous} syncing={false} />);
    expect(screen.getByText(/上升 1.0 元/)).toBeInTheDocument();
    expect(screen.getAllByText(/\+1.0.*較 2026-07-22/).length).toBeGreaterThan(0);
  });
});
