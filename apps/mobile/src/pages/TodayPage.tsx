import { DataBadge, PixelPanel } from '@chicken-village/ui';
import { merchantLine, type MarketBundle } from '@chicken-village/market-data';

export function TodayPage({ bundle, syncing }: { bundle: MarketBundle; syncing: boolean }) {
  const egg = bundle.records.find((record) => record.item === 'egg_producer') ?? bundle.records[0];
  const groups = [
    ['雞蛋與白肉雞', bundle.records.filter((record) => record.item.startsWith('egg_') || record.item.startsWith('broiler_'))],
    ['紅羽土雞', bundle.records.filter((record) => record.item.startsWith('red_'))],
    ['黑羽土雞', bundle.records.filter((record) => record.item.startsWith('black_'))],
  ] as const;
  return (
    <div className="page today-page">
      <section className="market-scene"><div className="market-scene__dialog"><span className="merchant-name">早市商人・阿穀</span><p>{egg ? merchantLine(egg) : '目前沒有可用行情。'}</p></div></section>
      <div className="market-meta"><DataBadge tone={bundle.mode === 'live' ? 'live' : 'fixture'}>{bundle.mode === 'live' ? '已連正式 API' : '已驗證快照'}</DataBadge><span>{syncing ? '正在背景同步…' : bundle.message}</span></div>
      {groups.map(([title, records]) => <PixelPanel title={title} key={title}><div className="price-grid">{records.map((record) => <article className="price-card" key={record.id}><span>{record.label}</span><strong>{record.value?.toFixed(1) ?? '—'}</strong><small>元／台斤・{record.sourceDate}</small></article>)}</div></PixelPanel>)}
      <p className="legal-note">行情是公開產地參考資料，不等於零售價格或個別成交價。缺值與休市不補值。</p>
    </div>
  );
}

