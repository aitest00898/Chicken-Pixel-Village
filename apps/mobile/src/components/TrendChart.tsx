import type { HistoryPoint } from '@chicken-village/market-data';

export function TrendChart({ data }: { data: HistoryPoint[] }) {
  const values = data.flatMap((point) => point.value === null ? [] : [point.value]);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const width = 520;
  const height = 210;
  const point = (value: number, index: number) => `${(index / Math.max(1, data.length - 1)) * width},${height - ((value - min) / (max - min)) * (height - 30) - 15}`;
  const segments: string[] = [];
  let current: string[] = [];
  data.forEach((item, index) => {
    if (item.value === null) { if (current.length > 1) segments.push(current.join(' ')); current = []; return; }
    current.push(point(item.value, index));
  });
  if (current.length > 1) segments.push(current.join(' '));
  return (
    <div className="trend-chart" aria-label="紅羽土雞南區價格折線圖">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        {[0, 1, 2, 3].map((row) => <line key={row} x1="0" y1={20 + row * 52} x2={width} y2={20 + row * 52} className="chart-grid" />)}
        {segments.map((segment, index) => <polyline key={index} points={segment} className="chart-line" />)}
        {data.map((item, index) => item.value === null ? null : <circle key={item.date} cx={point(item.value, index).split(',')[0]} cy={point(item.value, index).split(',')[1]} r="4" />)}
      </svg>
      <div className="chart-axis"><span>{data[0]?.date.slice(5)}</span><span>{data.at(-1)?.date.slice(5)}</span></div>
    </div>
  );
}

