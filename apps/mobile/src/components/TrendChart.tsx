import type { HistoryPoint } from '@chicken-village/market-data';

export function TrendChart({ data, label }: { data: HistoryPoint[]; label: string }) {
  const values = data.flatMap((point) => point.value === null ? [] : [point.value]);
  if (values.length === 0) return null;
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max(1, (rawMax - rawMin) * 0.12);
  const min = rawMin - padding;
  const max = rawMax + padding;
  const width = 520;
  const height = 210;
  const dates = data.map((item) => new Date(`${item.date}T00:00:00`).getTime());
  const firstTime = dates[0] ?? 0;
  const timeSpan = Math.max(1, (dates.at(-1) ?? firstTime) - firstTime);
  const point = (value: number, index: number): [number, number] => [
    (((dates[index] ?? firstTime) - firstTime) / timeSpan) * width,
    height - ((value - min) / (max - min)) * (height - 30) - 15,
  ];
  const segments: string[] = [];
  let current: string[] = [];
  data.forEach((item, index) => {
    if (item.value === null) { if (current.length > 1) segments.push(current.join(' ')); current = []; return; }
    current.push(point(item.value, index).join(','));
  });
  if (current.length > 1) segments.push(current.join(' '));
  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        {[0, 1, 2, 3].map((row) => <line key={row} x1="0" y1={20 + row * 52} x2={width} y2={20 + row * 52} className="chart-grid" />)}
        {segments.map((segment, index) => <polyline key={index} points={segment} className="chart-line" />)}
        {data.length <= 120 ? data.map((item, index) => {
          if (item.value === null) return null;
          const [x, y] = point(item.value, index);
          return <circle key={item.date} cx={x} cy={y} r="4" />;
        }) : null}
      </svg>
      <div className="chart-axis"><span>{data[0]?.date.slice(5).replace('-', '/')}</span><span>{data.at(-1)?.date.slice(5).replace('-', '/')}</span></div>
    </div>
  );
}
