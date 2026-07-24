import { DataBadge, PixelPanel, ProgressBar } from '@chicken-village/ui';
import type { MarketBundle } from '@chicken-village/market-data';
import type { VisitProgress } from '@chicken-village/domain';
import { Link } from 'react-router-dom';
import { ManagerSprite } from '../components/Sprites';

const menu = [
  ['/today', '今日雞情', '最新行情與商人解讀'], ['/history', '歷史行情', '史料館趨勢與缺值'], ['/village', '我的村莊', '遊戲地圖與雞舍配置'],
  ['/houses', '我的雞舍', '批次、股東、分潤與風險'], ['/manager', '管理者', '巡村與外觀裝備'], ['/settings', '設定', '資料來源、離線與安全'],
] as const;

export function HomePage({ bundle, visits }: { bundle: MarketBundle; visits: VisitProgress }) {
  const featured = ['egg_producer', 'broiler_large', 'red_south_male'].map((item) => bundle.records.find((record) => record.item === item)).filter(Boolean);
  return (
    <div className="page home-page">
      <section className="home-hero illustrated-plate">
        <div className="home-hero__shade" />
        <div className="hero-catalogue" aria-hidden="true"><span>領地誌</span><b>01</b></div>
        <div className="home-hero__copy"><p className="eyebrow">管理者領地誌・清晨校錄</p><h1>雞情像素村<br /><span>村莊營運編年史</span></h1><p className="hero-deck">行情、雞舍、契約與巡查，被逐頁保存於今日的公會檔案。</p><DataBadge tone={bundle.mode === 'live' ? 'live' : 'fixture'}>{bundle.mode === 'live' ? '正式來源' : '已驗證快照'}</DataBadge></div>
      </section>
      <PixelPanel title="商會每日公報・行情摘要" action={<Link to="/today">閱覽全卷 →</Link>}>
        <div className="quick-prices">{featured.map((record) => record && <div key={record.item}><span>{record.label}</span><strong>{record.value?.toFixed(1) ?? '—'}</strong><small>元／台斤</small></div>)}</div>
        <p className="source-note">資料日 {featured[0]?.sourceDate ?? '—'}・{bundle.message}</p>
      </PixelPanel>
      <div className="rpg-menu chronicle-index">{menu.map(([to, label, description], index) => <Link to={to} key={to}><b>{String(index + 1).padStart(2, '0')}</b><span><strong>{label}</strong><small>{description}</small></span><i>›</i></Link>)}</div>
      <PixelPanel className="manager-strip">
        <ManagerSprite />
        <div><span className="eyebrow">管理者・巡村第 {visits.accumulatedDays} 天</span><strong>連續到訪 {visits.streakDays} 天</strong><ProgressBar value={(visits.accumulatedDays % 7) / 7 * 100} label="下一件裝備進度" /><small>再 {7 - visits.accumulatedDays % 7} 天取得下一件外觀</small></div>
      </PixelPanel>
    </div>
  );
}
