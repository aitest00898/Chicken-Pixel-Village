import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { historyMarketOptions, type fetchMoaPoultryHistories, type HistoricalMarketItem, type MarketHistoryResult } from '@chicken-village/market-data';
import { HistoryPage, historyStatistics } from './HistoryPage';

const fixedNow = () => new Date('2026-07-24T12:00:00+08:00');
type HistoryLoader = typeof fetchMoaPoultryHistories;

function resultFor(item: HistoricalMarketItem): MarketHistoryResult {
  const option = historyMarketOptions.find((candidate) => candidate.item === item)!;
  const values = item === 'black_south_female' ? [45, 47] : [50, 48];
  return {
    item,
    label: option.label,
    points: [
      { date: '2026-07-01', value: values[0]! },
      { date: '2026-07-02', value: null },
      { date: '2026-07-03', value: values[1]! },
    ],
    unit: 'TWD_PER_600G',
    frequency: 'daily',
    sourceName: '農業部 Open Data',
    sourceUrl: 'https://data.moa.gov.tw/example',
    fetchedAt: '2026-07-24T04:00:00.000Z',
    snapshot: { sourceUrl: 'https://data.moa.gov.tw/example', fetchedAt: '2026-07-24T04:00:00.000Z', payload: {}, sha256: 'test', parserVersion: 'test' },
  };
}

describe('history page', () => {
  it('switches regions, overlays their official series and changes the requested range', async () => {
    const loader: HistoryLoader = vi.fn(async (items: readonly HistoricalMarketItem[]) => items.map(resultFor));
    render(<MemoryRouter><HistoryPage loader={loader} now={fixedNow} /></MemoryRouter>);

    expect(await screen.findByRole('img', { name: '南區多系列價格疊圖' })).toBeInTheDocument();
    expect(screen.getByText('5 條行情線')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '北區' }));
    expect(await screen.findByRole('img', { name: '北區多系列價格疊圖' })).toBeInTheDocument();
    expect(screen.getByText('2 條行情線')).toBeInTheDocument();
    expect(vi.mocked(loader).mock.calls.at(-1)?.[0]).toEqual(['red_north_male', 'red_north_female']);

    fireEvent.click(screen.getByRole('button', { name: '30 日' }));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(3));
    expect(screen.getByRole('button', { name: '30 日' })).toHaveAttribute('aria-pressed', 'true');
    const lastCall = vi.mocked(loader).mock.calls.at(-1)!;
    expect(Math.round((lastCall[2].getTime() - lastCall[1].getTime()) / 86_400_000)).toBe(29);
  });

  it('does not render invented statistics when the source has no rows', async () => {
    const loader: HistoryLoader = vi.fn(async (items: readonly HistoricalMarketItem[]) => items.map((item) => ({ ...resultFor(item), points: [] })));
    render(<MemoryRouter><HistoryPage loader={loader} now={fixedNow} /></MemoryRouter>);
    expect(await screen.findByText('此地區在所選期間沒有有效行情資料')).toBeInTheDocument();
    expect(screen.queryByText('NaN')).not.toBeInTheDocument();
    expect(screen.queryByText('Infinity')).not.toBeInTheDocument();
  });
});

it('computes a change only across adjacent valid records', () => {
  expect(historyStatistics([
    { date: '2026-07-01', value: 50 },
    { date: '2026-07-02', value: 48 },
    { date: '2026-07-03', value: null },
    { date: '2026-07-04', value: 46 },
  ]).latestChange).toBe('2026-07-02');
});
