import { PixelPanel } from '@chicken-village/ui';
import {
  type HistoricalMarketItem,
  type HistoryPoint,
  type MarketHistoryResult,
} from '@chicken-village/market-data';
import { useEffect, useState } from 'react';
import { TrendChart } from '../components/TrendChart';
import { loadFirebaseMarketHistories } from '../services/marketHistory';

const rangeOptions = [
  { days: 30, label: '30 日' },
  { days: 90, label: '90 日' },
  { days: 365, label: '1 年' },
  { days: 730, label: '2 年' },
] as const;

type HistoryRegionId = 'north' | 'central' | 'south' | 'east' | 'national' | 'reference';
interface HistoryRegion {
  id: HistoryRegionId;
  label: string;
  description: string;
  items: readonly HistoricalMarketItem[];
  frequencyLabel: string;
}

const historyRegions = [
  { id: 'north', label: '北區', description: '紅羽、黑羽、皇金、古早、鬥雞、珍珠與文昌雞行情', items: [
    'red_north_male', 'red_north_female',
    'black_north_free_male', 'black_north_free_female', 'black_north_caged_male', 'black_north_caged_female',
    'golden_north_male', 'golden_north_female', 'heritage_north_male', 'heritage_north_female',
    'fighting_north_free_female', 'fighting_north_caged_female', 'guinea_north_female', 'wenchang_north',
  ], frequencyLabel: '官方日資料' },
  { id: 'central', label: '中區', description: '紅羽、黑羽、皇金、古早、烏骨、鬥雞與珍珠雞行情', items: [
    'red_central_male', 'red_central_female',
    'black_central_free_male', 'black_central_free_female', 'black_central_caged_male', 'black_central_caged_female',
    'golden_central_male', 'golden_central_female', 'heritage_central_male', 'heritage_central_female',
    'silkie_central', 'fighting_central_free_female', 'fighting_central_caged_female', 'guinea_central_female',
  ], frequencyLabel: '官方日資料' },
  { id: 'south', label: '南區', description: '紅羽、黑羽、古早、烏骨與高屏白肉雞行情', items: [
    'red_south_male', 'red_south_female',
    'black_south_free_male', 'black_south_free_female', 'black_south_male', 'black_south_female',
    'heritage_south_male', 'heritage_south_female', 'silkie_south', 'broiler_store_kp',
  ], frequencyLabel: '官方日資料' },
  { id: 'east', label: '花東區', description: '黑羽放山雞與鬥雞母行情', items: ['black_east_free_male', 'black_east_free_female', 'fighting_east_free_female'], frequencyLabel: '官方日資料' },
  { id: 'national', label: '全台土雞', description: '全國月均紅羽、黑羽行情，以及全區竹北仿雞、鬥閹雞與古早閹雞日價', items: [
    'national_red_monthly', 'national_black_male_monthly', 'national_black_female_monthly',
    'zhubei_imitation_hen_all', 'zhubei_imitation_capon_all', 'fighting_capon_all', 'heritage_capon_all',
  ], frequencyLabel: '日／月正式資料' },
  { id: 'reference', label: '全台參考', description: '白肉雞與雞蛋產業參考行情', items: ['broiler_large', 'broiler_medium', 'egg_producer', 'egg_transport'], frequencyLabel: '官方日資料' },
] as const satisfies readonly HistoryRegion[];

const seriesPresentation: Record<HistoricalMarketItem, { shortLabel: string; color: string }> = {
  red_north_male: { shortLabel: '紅羽・公', color: '#657873' },
  red_north_female: { shortLabel: '紅羽・母', color: '#9a7550' },
  red_central_male: { shortLabel: '紅羽・公', color: '#657873' },
  red_central_female: { shortLabel: '紅羽・母', color: '#9a7550' },
  red_south_male: { shortLabel: '紅羽・公', color: '#657873' },
  red_south_female: { shortLabel: '紅羽・母', color: '#9a7550' },
  black_south_male: { shortLabel: '黑羽・舍飼公', color: '#594f49' },
  black_south_female: { shortLabel: '黑羽・舍飼母', color: '#75677b' },
  black_north_free_male: { shortLabel: '黑羽・放山公', color: '#4f5b52' },
  black_north_free_female: { shortLabel: '黑羽・放山母', color: '#6d655b' },
  black_north_caged_male: { shortLabel: '黑羽・舍飼公', color: '#594f49' },
  black_north_caged_female: { shortLabel: '黑羽・舍飼母', color: '#75677b' },
  black_central_free_male: { shortLabel: '黑羽・放山公', color: '#4f5b52' },
  black_central_free_female: { shortLabel: '黑羽・放山母', color: '#6d655b' },
  black_central_caged_male: { shortLabel: '黑羽・舍飼公', color: '#594f49' },
  black_central_caged_female: { shortLabel: '黑羽・舍飼母', color: '#75677b' },
  black_south_free_male: { shortLabel: '黑羽・放山公', color: '#4f5b52' },
  black_south_free_female: { shortLabel: '黑羽・放山母', color: '#6d655b' },
  black_east_free_male: { shortLabel: '黑羽・放山公', color: '#4f5b52' },
  black_east_free_female: { shortLabel: '黑羽・放山母', color: '#6d655b' },
  golden_north_male: { shortLabel: '皇金・公', color: '#9a7d48' },
  golden_north_female: { shortLabel: '皇金・母', color: '#b08d5d' },
  golden_central_male: { shortLabel: '皇金・公', color: '#9a7d48' },
  golden_central_female: { shortLabel: '皇金・母', color: '#b08d5d' },
  heritage_north_male: { shortLabel: '古早・公', color: '#795e45' },
  heritage_north_female: { shortLabel: '古早・母', color: '#9a7550' },
  heritage_central_male: { shortLabel: '古早・公', color: '#795e45' },
  heritage_central_female: { shortLabel: '古早・母', color: '#9a7550' },
  heritage_south_male: { shortLabel: '古早・公', color: '#795e45' },
  heritage_south_female: { shortLabel: '古早・母', color: '#9a7550' },
  silkie_central: { shortLabel: '烏骨雞', color: '#56535f' },
  silkie_south: { shortLabel: '烏骨雞', color: '#56535f' },
  fighting_north_free_female: { shortLabel: '鬥雞母・放山', color: '#7d4f42' },
  fighting_north_caged_female: { shortLabel: '鬥雞母・舍飼', color: '#5c4c45' },
  fighting_central_free_female: { shortLabel: '鬥雞母・放山', color: '#7d4f42' },
  fighting_central_caged_female: { shortLabel: '鬥雞母・舍飼', color: '#5c4c45' },
  fighting_east_free_female: { shortLabel: '鬥雞母・放山', color: '#7d4f42' },
  guinea_north_female: { shortLabel: '珍珠雞母', color: '#6e7c91' },
  guinea_central_female: { shortLabel: '珍珠雞母', color: '#6e7c91' },
  wenchang_north: { shortLabel: '文昌雞', color: '#7c8056' },
  zhubei_imitation_hen_all: { shortLabel: '竹北仿雞母', color: '#846f4f' },
  zhubei_imitation_capon_all: { shortLabel: '竹北仿閹雞', color: '#7f5544' },
  fighting_capon_all: { shortLabel: '鬥閹雞', color: '#684a42' },
  heritage_capon_all: { shortLabel: '古早閹雞', color: '#8c6847' },
  national_red_monthly: { shortLabel: '紅羽・全國月均', color: '#657873' },
  national_black_male_monthly: { shortLabel: '黑羽公・全國月均', color: '#4f5b52' },
  national_black_female_monthly: { shortLabel: '黑羽母・全國月均', color: '#75677b' },
  broiler_large: { shortLabel: '白肉雞・2kg+', color: '#7c8056' },
  broiler_medium: { shortLabel: '白肉雞・1.75–1.95kg', color: '#6e7c91' },
  broiler_store_kp: { shortLabel: '白肉雞・高屏', color: '#a06a54' },
  egg_producer: { shortLabel: '雞蛋・產地', color: '#aa8a45' },
  egg_transport: { shortLabel: '雞蛋・大運輸', color: '#886244' },
};

type HistoryLoader = typeof loadFirebaseMarketHistories;
interface HistoryPageProps { loader?: HistoryLoader; now?: () => Date }

const currentTime = () => new Date();
const initialVisibleCount = 4;

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
  const validPoints = points.filter((point): point is HistoryPoint & { value: number } => point.value !== null);
  const values = validPoints.map((point) => point.value);
  const latestPoint = validPoints.at(-1);
  const previousPoint = validPoints.at(-2);
  const difference = latestPoint && previousPoint ? Number((latestPoint.value - previousPoint.value).toFixed(3)) : null;
  const percentage = difference !== null && previousPoint?.value ? Number((difference / previousPoint.value * 100).toFixed(1)) : null;
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
    latest: values.at(-1) ?? null,
    highest: values.length ? Math.max(...values) : null,
    lowest: values.length ? Math.min(...values) : null,
    average: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
    latestChange,
    previousDate: previousPoint?.date ?? null,
    difference,
    percentage,
  };
}

export function HistoryPage({ loader = loadFirebaseMarketHistories, now = currentTime }: HistoryPageProps = {}) {
  const [regionId, setRegionId] = useState<HistoryRegionId>('central');
  const [days, setDays] = useState<(typeof rangeOptions)[number]['days']>(90);
  const [results, setResults] = useState<MarketHistoryResult[]>([]);
  const [selectedItems, setSelectedItems] = useState<HistoricalMarketItem[]>(() => historyRegions.find((candidate) => candidate.id === 'central')!.items.slice(0, initialVisibleCount));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [queryActive, setQueryActive] = useState(false);
  const region = historyRegions.find((candidate) => candidate.id === regionId)!;

  useEffect(() => {
    setSelectedItems(region.items.slice(0, initialVisibleCount));
  }, [region.items]);

  useEffect(() => {
    const controller = new AbortController();
    const endDate = now();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1));
    setQueryActive(false);
    setLoading(true);
    setError(null);
    setResults([]);
    loader(region.items, startDate, endDate, controller.signal)
      .then((histories) => {
        const start = dateInput(startDate);
        const end = dateInput(endDate);
        setResults(histories.map((history) => ({ ...history, points: history.points.filter((point) => point.date >= start && point.date <= end) })));
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Unable to load MOA poultry histories', reason);
        setError('正式行情來源目前無法連線，未以示範數字代替。');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [days, loader, now, region.items, requestVersion]);

  const selectedSet = new Set(selectedItems);
  const summaries = results.map((result) => ({ result, statistics: historyStatistics(result.points), presentation: seriesPresentation[result.item] }));
  const visibleSummaries = summaries.filter((summary) => selectedSet.has(summary.result.item));
  const validCount = summaries.reduce((total, summary) => total + summary.statistics.validCount, 0);
  const allDates = results.flatMap((result) => result.points.map((point) => point.date)).sort();
  const firstDate = allDates[0] ?? null;
  const lastDate = allDates.at(-1) ?? null;
  const sourceLinks = [...new Map(results.map((result) => [result.sourceUrl, result])).values()];

  return (
    <div className="page history-page">
      <header className="page-title"><p className="eyebrow">商會史料館</p><h1>行情沿革</h1><p>先選地區，再比較農業部 API、養雞協會日報與中央畜產會月報收錄的各類家禽行情；缺值保留，不補寫。</p></header>

      <section className="history-controls" aria-label="歷史行情篩選">
        <fieldset className="history-region"><legend>行情地區</legend>{historyRegions.map((option) => <button key={option.id} type="button" className={`chip${regionId === option.id ? ' selected' : ''}`} aria-pressed={regionId === option.id} onClick={() => { setQueryActive(false); setRegionId(option.id); }}>{option.label}</button>)}</fieldset>
        <p className="history-region-note">{region.description}</p>
        <fieldset className="history-range"><legend>查閱期間</legend>{rangeOptions.map((option) => <button key={option.days} type="button" className={`chip${days === option.days ? ' selected' : ''}`} aria-pressed={days === option.days} onClick={() => { setQueryActive(false); setDays(option.days); }}>{option.label}</button>)}</fieldset>
        <div className="history-frequency"><span>資料頻率</span><strong>{region.frequencyLabel}</strong></div>
      </section>

      <PixelPanel>
        <div className="history-status" aria-live="polite">
          {loading ? <div className="history-empty"><span className="folio-kicker">OPENING THE LEDGER</span><strong>正在向官方來源調閱{region.label}行情卷宗……</strong></div> : null}
          {!loading && error ? <div className="history-empty"><strong>{error}</strong><button type="button" className="secondary-button compact" onClick={() => setRequestVersion((value) => value + 1)}>重新調閱</button></div> : null}
          {!loading && !error && validCount === 0 ? <div className="history-empty"><strong>此地區在所選期間沒有有效行情資料</strong><small>原始缺值已保留，沒有插值。</small></div> : null}
        </div>
        {!loading && !error && validCount > 0 ? <>
          <div className="history-chart-heading"><div><span className="folio-kicker">REGIONAL MARKET OVERLAY</span><h2>{region.label}・多品項行情疊圖</h2></div>{queryActive ? <button type="button" className="secondary-button compact history-query-exit" onClick={() => setQueryActive(false)}>退出查價</button> : <small>{visibleSummaries.length} / {summaries.length} 條行情線</small>}</div>
          <div className="history-legend" aria-label="已選取行情線圖例">{visibleSummaries.map(({ result, statistics, presentation }) => <div key={result.item}><i style={{ background: presentation.color }} /><span>{presentation.shortLabel}</span><strong>{statistics.latest?.toFixed(1) ?? '—'}</strong></div>)}</div>
          {visibleSummaries.length > 0 ? <TrendChart series={visibleSummaries.map(({ result, presentation }) => ({ id: result.item, label: presentation.shortLabel, color: presentation.color, data: result.points }))} label={`${region.label}多系列價格疊圖`} queryActive={queryActive} onQueryActiveChange={setQueryActive} /> : <div className="history-empty compact"><strong>尚未選取行情線</strong><small>請在下方品項卷宗點選要顯示於線圖的品相。</small></div>}
          <div className="history-series-ledger" aria-label="行情品項顯示開關">{summaries.map(({ result, statistics, presentation }) => {
            const selected = selectedSet.has(result.item);
            return <button
              key={result.item}
              type="button"
              className={`history-series-toggle${selected ? ' selected' : ''}`}
              aria-pressed={selected}
              onClick={() => {
                setQueryActive(false);
                setSelectedItems((items) => items.includes(result.item) ? items.filter((item) => item !== result.item) : [...items, result.item]);
              }}
              style={selected ? { borderColor: presentation.color, boxShadow: `inset 0 0 0 1px ${presentation.color}, 0 0 0 1px ${presentation.color}` } : undefined}
            >
              <header><i style={{ background: presentation.color }} /><strong>{presentation.shortLabel}</strong><b>{statistics.latest?.toFixed(1) ?? '—'}</b></header>
            <div><span>平均 {statistics.average?.toFixed(1) ?? '—'}</span><span>高／低 {statistics.highest?.toFixed(1) ?? '—'}／{statistics.lowest?.toFixed(1) ?? '—'}</span><span>調價 {shortDate(statistics.latestChange)}</span><span>漲跌 {statistics.difference === null ? '—' : statistics.difference === 0 ? '持平' : `${statistics.difference > 0 ? '+' : '−'}${Math.abs(statistics.difference).toFixed(1)}${statistics.percentage === null ? '' : `（${statistics.percentage > 0 ? '+' : '−'}${Math.abs(statistics.percentage).toFixed(1)}%）`}・較 ${shortDate(statistics.previousDate)}`}</span></div>
            </button>;
          })}</div>
        </> : null}
      </PixelPanel>

      <PixelPanel title="史料註記">
        <ul className="notes-list">
          <li>資料單位：元／台斤（600 公克）；各線保留官方欄位原意。</li>
          <li>所選卷期：{firstDate && lastDate ? `${firstDate} 至 ${lastDate}` : `最近 ${days} 日`}</li>
          <li>分區紅羽、南區黑羽舍飼、白肉雞及雞蛋採農業部 API；其他分區雞種採養雞協會日報表補充。</li>
          <li>日報表補充品項收錄 2025-06-19 至 2026-07-17 共 18 個報表日期；未取得日報的日期保留缺值，不回填或推估。</li>
          <li>全國月均土雞價採中央畜產會月報，收錄 2025 年 12 月至 2026 年 6 月；原始單位為元／公斤，圖表依 1 台斤＝0.6 公斤換算。</li>
          <li>南區疊圖含高屏門市白肉雞參考價；全台參考則收錄非區域性的白肉雞與雞蛋欄位。</li>
          <li>分區行情維持日資料；全台土雞另提供經來源文件驗證的月均資料，沒有把月均值冒充單日行情。</li>
          <li>缺值會中斷各自折線，統計只計有效資料，不會插值。</li>
          {sourceLinks.map((result, index) => <li key={result.sourceUrl}>資料來源 {index + 1}：<a href={result.sourceUrl} target="_blank" rel="noreferrer">{result.sourceName}</a></li>)}
        </ul>
      </PixelPanel>
    </div>
  );
}
