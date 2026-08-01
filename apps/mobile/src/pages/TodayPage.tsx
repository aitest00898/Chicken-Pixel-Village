import { DataBadge, PixelPanel } from '@chicken-village/ui';
import { marketChange, merchantLine, type MarketBundle, type MarketRecord } from '@chicken-village/market-data';
import { useEffect, useMemo, useState } from 'react';

const MERCHANT_ROTATION_MS = 6000;

function changeLabel(current: MarketRecord, previous?: MarketRecord) {
  const change = marketChange(current, previous);
  if (!change) return null;
  if (change.direction === 'flat') return { tone: 'flat', text: `持平・較 ${previous!.sourceDate}` };
  const sign = change.direction === 'up' ? '+' : '−';
  const percent = change.percentage === null ? '' : `（${sign}${Math.abs(change.percentage).toFixed(1)}%）`;
  return { tone: change.direction, text: `${sign}${Math.abs(change.difference).toFixed(1)} ${percent}・較 ${previous!.sourceDate}` };
}

function groupWeight(record: MarketRecord): number {
  if (record.item.startsWith('red_')) return 0;
  if (record.item.startsWith('black_')) return 1;
  if (record.item.startsWith('broiler_')) return 2;
  if (record.item.startsWith('egg_')) return 3;
  return 4;
}

export function merchantRotationRecords(records: readonly MarketRecord[]): MarketRecord[] {
  const validRecords = records
    .filter((record) => record.value !== null && record.frequency === 'daily')
    .sort((left, right) => {
      const weight = groupWeight(left) - groupWeight(right);
      if (weight !== 0) return weight;
      return left.label.localeCompare(right.label, 'zh-Hant');
    });
  const grouped = new Map<number, MarketRecord[]>();
  validRecords.forEach((record) => {
    const weight = groupWeight(record);
    grouped.set(weight, [...(grouped.get(weight) ?? []), record]);
  });
  const result: MarketRecord[] = [];
  const groups = [...grouped.keys()].sort((left, right) => left - right).map((key) => grouped.get(key) ?? []);
  const maxLength = Math.max(0, ...groups.map((group) => group.length));
  for (let index = 0; index < maxLength; index += 1) {
    groups.forEach((group) => {
      const record = group[index];
      if (record) result.push(record);
    });
  }
  return result;
}

export function TodayPage({ bundle, previousRecords, syncing }: { bundle: MarketBundle; previousRecords: MarketRecord[]; syncing: boolean }) {
  const [merchantIndex, setMerchantIndex] = useState(0);
  const merchantRecords = useMemo(() => merchantRotationRecords(bundle.records), [bundle.records]);
  const merchantRecord = merchantRecords[merchantRecords.length ? merchantIndex % merchantRecords.length : 0] ?? bundle.records[0];
  const previousFor = (record: MarketRecord) => previousRecords.find((candidate) => candidate.item === record.item);
  useEffect(() => {
    setMerchantIndex(0);
  }, [merchantRecords]);
  useEffect(() => {
    if (merchantRecords.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setMerchantIndex((current) => (current + 1) % merchantRecords.length);
    }, MERCHANT_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [merchantRecords]);
  const groups = [
    ['雞蛋與白肉雞', bundle.records.filter((record) => record.item.startsWith('egg_') || record.item.startsWith('broiler_'))],
    ['紅羽土雞', bundle.records.filter((record) => record.item.startsWith('red_'))],
    ['黑羽土雞', bundle.records.filter((record) => record.item.startsWith('black_'))],
  ] as const;
  return (
    <div className="page today-page">
      <section className="market-scene illustrated-plate"><div className="market-scene__edition"><span>DAILY BULLETIN</span><b>商會每日公報</b></div><div className="market-scene__dialog" aria-live="polite"><span className="merchant-name">行情商人・阿穀・輪動報價</span><p>{merchantRecord ? merchantLine(merchantRecord, previousFor(merchantRecord)) : '目前沒有可用行情。'}</p>{merchantRecords.length > 1 ? <small className="merchant-rotation">輪報 {merchantIndex % merchantRecords.length + 1} / {merchantRecords.length}・不同區域與雞種依序報價</small> : null}</div></section>
      <div className="market-meta"><DataBadge tone={bundle.mode === 'live' ? 'live' : 'fixture'}>{bundle.mode === 'live' ? '已連正式 API' : '已驗證快照'}</DataBadge><span>{syncing ? '正在背景同步…' : bundle.message}</span></div>
      {groups.map(([title, records], chapter) => <PixelPanel title={`${String(chapter + 1).padStart(2, '0')}・${title}`} key={title}><div className="price-grid">{records.map((record) => {
        const change = changeLabel(record, previousFor(record));
        return <article className="price-card" key={record.id}><span>{record.label}</span><strong>{record.value?.toFixed(1) ?? '—'}</strong><small>元／台斤・資料日 {record.sourceDate}</small>{change ? <small className={`price-change ${change.tone}`}>{change.text}</small> : <small className="price-change unavailable">上一筆有效資料不足</small>}</article>;
      })}</div></PixelPanel>)}
      <p className="legal-note">行情是公開產地參考資料，不等於零售價格或個別成交價。缺值與休市不補值。</p>
    </div>
  );
}
