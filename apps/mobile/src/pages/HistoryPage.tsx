import { PixelPanel } from '@chicken-village/ui';
import {
  fetchMoaPoultryHistory,
  historyMarketOptions,
  type HistoricalMarketItem,
  type HistoryPoint,
  type MarketHistoryResult,
} from '@chicken-village/market-data';
import { useEffect, useMemo, useState } from 'react';
import { TrendChart } from '../components/TrendChart';

const rangeOptions = [
  { days: 30, label: '30 日' },
  { days: 90, label: '90 日' },
  { days: 365, label: '1 年' },
] as const;

type HistoryLoader = typeof fetchMoaPoultryHistory;
interface HistoryPageProps { loader?: HistoryLoader; now?: () => Date }

const currentTime = () => new Date();

function dateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shortDate(date: string | null): string {
  return date ? date.slice(5).replace('-', '/') : '—';
}

export function historyStatistics(points: HistoryPoint[]) {
  const values = points.flatMap((point) => point.value === null ? [] : [point.value]);
  let previous: number | null = null;
  let latestChange: string | null = null;
  for (const point of points) {
    if (point.value === null) {
      previous = null;
    } else {
      if (previous !== null && point.value !== previous) latestChange = point.date;
      previous = point.value;
    }
  }
  return {
    validCount: values.length,
    highest: values.length ? Math.max(...values) : null,
    lowest: values.length ? Math.min(...values) : null,
    average: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
    latestChange,
  };
}

export function HistoryPage({ loader = fetchMoaPoultryHistory, now = currentTime }: HistoryPageProps = {}) {
  const [item, setItem] = useState<HistoricalMarketItem>('red_south_male');
  const [days, setDays] = useState<(typeof rangeOptions)[number]['days']>(90);
  const [result, setResult] = useState<MarketHistoryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const endDate = now();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1));
    setLoading(true);
    setError(null);
    setResult(null);
    loader(item, startDate, endDate, controller.signal)
      .then((history) => {
        const start = dateInput(startDate);
        const end = dateInput(endDate);
        setResult({ ...history, points: history.points.filter((point) => point.date >= start && point.date <= end) });
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Unable to load MOA poultry history', reason);
        setError('正式行情來源目前無法連線，未以示範數字代替。');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [days, item, loader, now, requestVersion]);

  const groupedOptions = useMemo(() => {
    const groups = new Map<string, typeof historyMarketOptions>();
    for (const option of historyMarketOptions) {
      groups.set(option.group, [...(groups.get(option.group) ?? []), option]);
    }
    return [...groups.entries()];
  }, []);
  const points = result?.points ?? [];
  const statistics = historyStatistics(points);
  const firstDate = points[0]?.date ?? null;
  const lastDate = points.at(-1)?.date ?? null;

  return (
    <div className="page history-page">
      <header className="page-title"><p className="eyebrow">商會史料館</p><h1>行情沿革</h1><p>依官方日資料查閱各類家禽與地區；缺值保留，不補寫。</p></header>

      <section className="history-controls" aria-label="歷史行情篩選">
        <label htmlFor="history-item">行情項目</label>
        <select id="history-item" className="history-select" value={item} onChange={(event) => setItem(event.target.value as HistoricalMarketItem)}>
          {groupedOptions.map(([group, options]) => <optgroup key={group} label={group}>{options.map((option) => <option key={option.item} value={option.item}>{option.label}</option>)}</optgroup>)}
        </select>
        <fieldset className="history-range"><legend>查閱期間</legend>{rangeOptions.map((option) => <button key={option.days} type="button" className={`chip${days === option.days ? ' selected' : ''}`} aria-pressed={days === option.days} onClick={() => setDays(option.days)}>{option.label}</button>)}</fieldset>
        <div className="history-frequency"><span>資料頻率</span><strong>官方日資料</strong></div>
      </section>

      <PixelPanel>
        <div className="history-status" aria-live="polite">
          {loading ? <div className="history-empty"><span className="folio-kicker">OPENING THE LEDGER</span><strong>正在向農業部調閱行情卷宗……</strong></div> : null}
          {!loading && error ? <div className="history-empty"><strong>{error}</strong><button type="button" className="secondary-button compact" onClick={() => setRequestVersion((value) => value + 1)}>重新調閱</button></div> : null}
          {!loading && !error && points.length === 0 ? <div className="history-empty"><strong>此條件在所選期間沒有歷史資料</strong><small>請改選其他行情項目或期間。</small></div> : null}
          {!loading && !error && points.length > 0 && statistics.validCount === 0 ? <div className="history-empty"><strong>所選期間皆為缺值或休市</strong><small>原始缺值已保留，沒有插值。</small></div> : null}
        </div>
        {!loading && !error && statistics.validCount > 0 ? <>
          <div className="history-chart-heading"><div><span className="folio-kicker">DAILY MARKET RECORD</span><h2>{result?.label}</h2></div><small>{statistics.validCount}／{points.length} 筆有效</small></div>
          <TrendChart data={points} label={`${result?.label ?? '家禽'}價格折線圖`} />
          <div className="stat-grid">
            <div><small>最高</small><strong>{statistics.highest?.toFixed(1) ?? '—'}</strong></div>
            <div><small>最低</small><strong>{statistics.lowest?.toFixed(1) ?? '—'}</strong></div>
            <div><small>平均</small><strong>{statistics.average?.toFixed(1) ?? '—'}</strong></div>
            <div><small>最近調價</small><strong>{shortDate(statistics.latestChange)}</strong></div>
          </div>
        </> : null}
      </PixelPanel>

      <PixelPanel title="史料註記">
        <ul className="notes-list">
          <li>資料單位：元／台斤（600 公克）</li>
          <li>所選卷期：{firstDate && lastDate ? `${firstDate} 至 ${lastDate}` : `最近 ${days} 日`}</li>
          <li>來源頻率只有每日資料；週、月資料未經正式來源驗證，因此不提供假切換。</li>
          <li>缺值會中斷折線，統計只計有效資料，不會插值。</li>
          <li>{result ? <>資料來源：<a href={result.sourceUrl} target="_blank" rel="noreferrer">{result.sourceName}</a></> : '資料來源：農業部 Open Data'}</li>
        </ul>
      </PixelPanel>
    </div>
  );
}
