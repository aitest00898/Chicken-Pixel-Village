import type { MarketFrequency, MarketRecord } from './types';

const frequencyLabel: Record<MarketFrequency, string> = { daily: '日資料', weekly: '週參考價', monthly: '月參考價' };

function price(record: MarketRecord): string {
  return record.value === null ? '目前無有效價格' : `${record.value.toFixed(1)} 元／台斤`;
}

export interface MarketChange {
  difference: number;
  percentage: number | null;
  direction: 'up' | 'down' | 'flat';
}

export function marketChange(current: MarketRecord, previous?: MarketRecord): MarketChange | null {
  if (
    current.frequency !== 'daily'
    || current.value === null
    || previous?.value === null
    || previous?.value === undefined
    || previous.item !== current.item
    || previous.sourceDate >= current.sourceDate
  ) return null;
  const difference = Number((current.value - previous.value).toFixed(3));
  const percentage = previous.value === 0 ? null : Number((difference / previous.value * 100).toFixed(1));
  return { difference, percentage, direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'flat' };
}

export function merchantLine(current: MarketRecord, previous?: MarketRecord): string {
  if (current.status === 'missing' || current.value === null) {
    return `${current.label}在 ${current.sourceDate} 沒有有效行情，我先保留缺值，不會替市場猜價格。`;
  }
  const prefix = `${current.sourceDate} 的${frequencyLabel[current.frequency]}送到了！${current.label}為 ${price(current)}`;
  if (current.frequency !== 'daily') return `${prefix}。這是產業參考價，不代表個別交易價格。`;
  const change = marketChange(current, previous);
  if (!change) return `${prefix}。上一筆有效資料不足，暫不計算漲跌。`;
  if (change.direction === 'flat') return `${prefix}，與上一筆有效資料持平。`;
  return `${prefix}，較上一筆有效資料${change.direction === 'up' ? '上升' : '下降'} ${Math.abs(change.difference).toFixed(1)} 元${change.percentage === null ? '' : `（${Math.abs(change.percentage).toFixed(1)}%）`}。`;
}

export function marketFreshness(record: MarketRecord, todayIso: string): { daysOld: number; stale: boolean } {
  const daysOld = Math.floor((Date.parse(`${todayIso}T00:00:00Z`) - Date.parse(`${record.sourceDate}T00:00:00Z`)) / 86_400_000);
  const limit = record.frequency === 'daily' ? 3 : record.frequency === 'weekly' ? 10 : 40;
  return { daysOld, stale: daysOld > limit };
}
