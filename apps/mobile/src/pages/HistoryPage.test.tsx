import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { historyMarketOptions, type fetchMoaPoultryHistory, type MarketHistoryResult } from '@chicken-village/market-data';
import { HistoryPage, historyStatistics } from './HistoryPage';

const fixedNow = () => new Date('2026-07-24T12:00:00+08:00');
type HistoryLoader = typeof fetchMoaPoultryHistory;

function resultFor(item: Parameters<HistoryLoader>[0]): MarketHistoryResult {
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
  it('switches the official series and requested time range', async () => {
    const loader: HistoryLoader = vi.fn(async (item) => resultFor(item));
    render(<MemoryRouter><HistoryPage loader={loader} now={fixedNow} /></MemoryRouter>);

    expect(await screen.findByRole('img', { name: '紅羽土雞・公・南區價格折線圖' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('行情項目'), { target: { value: 'black_south_female' } });
    expect(await screen.findByRole('img', { name: '黑羽土雞・母・南區舍飼價格折線圖' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '30 日' }));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(3));
    expect(screen.getByRole('button', { name: '30 日' })).toHaveAttribute('aria-pressed', 'true');
    const lastCall = vi.mocked(loader).mock.calls.at(-1)!;
    expect(Math.round((lastCall[2].getTime() - lastCall[1].getTime()) / 86_400_000)).toBe(29);
  });

  it('does not render invented statistics when the source has no rows', async () => {
    const loader: HistoryLoader = vi.fn(async (item) => ({ ...resultFor(item), points: [] }));
    render(<MemoryRouter><HistoryPage loader={loader} now={fixedNow} /></MemoryRouter>);
    expect(await screen.findByText('此條件在所選期間沒有歷史資料')).toBeInTheDocument();
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
