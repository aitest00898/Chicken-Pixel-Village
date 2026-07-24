import { PixelPanel } from '@chicken-village/ui';
import { redSouthHistory } from '@chicken-village/market-data';
import { TrendChart } from '../components/TrendChart';

export function HistoryPage() {
  const values = redSouthHistory.flatMap((point) => point.value === null ? [] : [point.value]);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return (
    <div className="page history-page">
      <header className="page-title"><p className="eyebrow">商會史料館</p><h1>行情沿革</h1><p>日、週、月資料各自成冊；缺頁不補寫。</p></header>
      <div className="filter-row"><button className="chip selected">紅羽公・南區</button><button className="chip">90 日</button><button className="chip">日資料</button></div>
      <PixelPanel><TrendChart data={redSouthHistory} /><div className="stat-grid"><div><small>最高</small><strong>{Math.max(...values).toFixed(1)}</strong></div><div><small>最低</small><strong>{Math.min(...values).toFixed(1)}</strong></div><div><small>平均</small><strong>{average.toFixed(1)}</strong></div><div><small>最近調價</small><strong>07/03</strong></div></div></PixelPanel>
      <PixelPanel title="史料註記"><ul className="notes-list"><li>資料單位：元／台斤（600 公克）</li><li>目前畫面為已驗證快照的示範歷史序列。</li><li>正式 adapter 會保留原始 payload hash 與 parser 版本。</li><li>缺值會中斷折線，不會插值。</li></ul></PixelPanel>
    </div>
  );
}

