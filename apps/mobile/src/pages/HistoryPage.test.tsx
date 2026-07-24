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

    expect(await screen.findByRole('img', { name: '中區多系列價格疊圖' })).toBeInTheDocument();
    expect(screen.getByText('14 條行情線')).toBeInTheDocument();
    expect(screen.getAllByText('皇金・公').length).toBeGreaterThan(0);
    expect(screen.getAllByText('烏骨雞').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: '北區' }));
    expect(await screen.findByRole('img', { name: '北區多系列價格疊圖' })).toBeInTheDocument();
    expect(screen.getByText('14 條行情線')).toBeInTheDocument();
    const northItems = vi.mocked(loader).mock.calls.at(-1)?.[0] ?? [];
    expect(northItems).toHaveLength(14);
    expect(northItems).toEqual(expect.arrayContaining([
      'red_north_male', 'black_north_free_male', 'golden_north_male',
      'heritage_north_male', 'fighting_north_free_female', 'guinea_north_female', 'wenchang_north',
    ]));

    fireEvent.click(screen.getByRole('button', { name: '全台土雞' }));
    expect(await screen.findByRole('img', { name: '全台土雞多系列價格疊圖' })).toBeInTheDocument();
    expect(screen.getByText('7 條行情線')).toBeInTheDocument();
    expect(screen.getByText('日／月正式資料')).toBeInTheDocument();
    const nationalItems = vi.mocked(loader).mock.calls.at(-1)?.[0] ?? [];
    expect(nationalItems).toEqual([
      'national_red_monthly', 'national_black_male_monthly', 'national_black_female_monthly',
      'zhubei_imitation_hen_all', 'zhubei_imitation_capon_all', 'fighting_capon_all', 'heritage_capon_all',
    ]);

    fireEvent.click(screen.getByRole('button', { name: '30 日' }));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(4));
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
  const statistics = historyStatistics([
    { date: '2026-07-01', value: 50 },
    { date: '2026-07-02', value: 48 },
    { date: '2026-07-03', value: null },
    { date: '2026-07-04', value: 46 },
  ]);
  expect(statistics.latestChange).toBe('2026-07-02');
  expect(statistics).toMatchObject({ previousDate: '2026-07-02', difference: -2, percentage: -4.2 });
});
