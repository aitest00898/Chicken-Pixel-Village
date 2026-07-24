import { DataBadge, PixelPanel } from '@chicken-village/ui';
import { marketChange, merchantLine, type MarketBundle, type MarketRecord } from '@chicken-village/market-data';

function changeLabel(current: MarketRecord, previous?: MarketRecord) {
  const change = marketChange(current, previous);
  if (!change) return null;
  if (change.direction === 'flat') return { tone: 'flat', text: `持平・較 ${previous!.sourceDate}` };
  const sign = change.direction === 'up' ? '+' : '−';
  const percent = change.percentage === null ? '' : `（${sign}${Math.abs(change.percentage).toFixed(1)}%）`;
  return { tone: change.direction, text: `${sign}${Math.abs(change.difference).toFixed(1)} ${percent}・較 ${previous!.sourceDate}` };
}

export function TodayPage({ bundle, previousRecords, syncing }: { bundle: MarketBundle; previousRecords: MarketRecord[]; syncing: boolean }) {
  const egg = bundle.records.find((record) => record.item === 'egg_producer') ?? bundle.records[0];
  const previousFor = (record: MarketRecord) => previousRecords.find((candidate) => candidate.item === record.item);
  const groups = [
    ['雞蛋與白肉雞', bundle.records.filter((record) => record.item.startsWith('egg_') || record.item.startsWith('broiler_'))],
    ['紅羽土雞', bundle.records.filter((record) => record.item.startsWith('red_'))],
    ['黑羽土雞', bundle.records.filter((record) => record.item.startsWith('black_'))],
  ] as const;
  return (
    <div className="page today-page">
      <section className="market-scene illustrated-plate"><div className="market-scene__edition"><span>DAILY BULLETIN</span><b>商會每日公報</b></div><div className="market-scene__dialog"><span className="merchant-name">行情商人・阿穀・口述紀錄</span><p>{egg ? merchantLine(egg, previousFor(egg)) : '目前沒有可用行情。'}</p></div></section>
      <div className="market-meta"><DataBadge tone={bundle.mode === 'live' ? 'live' : 'fixture'}>{bundle.mode === 'live' ? '已連正式 API' : '已驗證快照'}</DataBadge><span>{syncing ? '正在背景同步…' : bundle.message}</span></div>
      {groups.map(([title, records], chapter) => <PixelPanel title={`${String(chapter + 1).padStart(2, '0')}・${title}`} key={title}><div className="price-grid">{records.map((record) => {
        const change = changeLabel(record, previousFor(record));
        return <article className="price-card" key={record.id}><span>{record.label}</span><strong>{record.value?.toFixed(1) ?? '—'}</strong><small>元／台斤・資料日 {record.sourceDate}</small>{change ? <small className={`price-change ${change.tone}`}>{change.text}</small> : <small className="price-change unavailable">上一筆有效資料不足</small>}</article>;
      })}</div></PixelPanel>)}
      <p className="legal-note">行情是公開產地參考資料，不等於零售價格或個別成交價。缺值與休市不補值。</p>
    </div>
  );
}
