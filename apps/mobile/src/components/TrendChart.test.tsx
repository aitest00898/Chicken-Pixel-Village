import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TrendChart, type TrendChartSeries } from './TrendChart';

const series: TrendChartSeries[] = [
  {
    id: 'red-male',
    label: '紅羽・公',
    color: '#657873',
    data: [{ date: '2026-07-01', value: 40 }, { date: '2026-07-02', value: 50 }],
  },
  {
    id: 'black-female',
    label: '黑羽・母',
    color: '#75677b',
    data: [{ date: '2026-07-01', value: 60 }, { date: '2026-07-02', value: 55 }],
  },
];

function QueryHarness() {
  const [active, setActive] = useState(false);
  return <>
    <output>{active ? '查價中' : '待機'}</output>
    <TrendChart series={series} label="測試行情疊圖" queryActive={active} onQueryActiveChange={setActive} />
  </>;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('trend chart long-press query', () => {
  it('activates after one second, follows the pointer and exits after inactivity', async () => {
    vi.useFakeTimers();
    vi.spyOn(SVGSVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, right: 520, bottom: 210, width: 520, height: 210, x: 0, y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    render(<QueryHarness />);
    const surface = screen.getByTestId('trend-query-surface');

    fireEvent.pointerDown(surface, { pointerId: 7, pointerType: 'touch', clientX: 0, clientY: 175, button: 0 });
    await act(async () => vi.advanceTimersByTime(999));
    expect(screen.getByText('待機')).toBeInTheDocument();

    await act(async () => vi.advanceTimersByTime(1));
    expect(screen.getByText('查價中')).toBeInTheDocument();
    expect(screen.getByText('2026-07-01')).toBeInTheDocument();
    expect(screen.getByText('紅羽・公')).toBeInTheDocument();
    expect(screen.getByText('40.0')).toBeInTheDocument();

    await act(async () => vi.advanceTimersByTime(10_000));
    fireEvent.pointerMove(surface, { pointerId: 7, pointerType: 'touch', clientX: 520, clientY: 40 });
    expect(screen.getByText('2026-07-02')).toBeInTheDocument();
    expect(screen.getByText('黑羽・母')).toBeInTheDocument();
    expect(screen.getByText('55.0')).toBeInTheDocument();
    fireEvent.pointerUp(surface, { pointerId: 7, pointerType: 'touch', clientX: 520, clientY: 40 });

    await act(async () => vi.advanceTimersByTime(14_999));
    expect(screen.getByText('查價中')).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(1));
    expect(screen.getByText('待機')).toBeInTheDocument();
    expect(screen.queryByText('2026-07-02')).not.toBeInTheDocument();

    fireEvent.keyDown(surface, { key: 'Enter' });
    expect(screen.getByText('查價中')).toBeInTheDocument();
    fireEvent.keyDown(surface, { key: 'Escape' });
    expect(screen.getByText('待機')).toBeInTheDocument();
  });
});
