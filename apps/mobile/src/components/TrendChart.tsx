import type { HistoryPoint } from '@chicken-village/market-data';

export interface TrendChartSeries {
  id: string;
  label: string;
  color: string;
  data: HistoryPoint[];
}

export function TrendChart({ series, label }: { series: TrendChartSeries[]; label: string }) {
  const values = series.flatMap((entry) => entry.data.flatMap((point) => point.value === null ? [] : [point.value]));
  const allDates = series.flatMap((entry) => entry.data.map((point) => point.date)).sort();
  if (values.length === 0 || allDates.length === 0) return null;
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max(1, (rawMax - rawMin) * 0.12);
  const min = rawMin - padding;
  const max = rawMax + padding;
  const width = 520;
  const height = 210;
  const firstDate = allDates[0]!;
  const lastDate = allDates.at(-1)!;
  const firstTime = new Date(`${firstDate}T00:00:00`).getTime();
  const timeSpan = Math.max(1, new Date(`${lastDate}T00:00:00`).getTime() - firstTime);
  const coordinate = (date: string, value: number): [number, number] => [
    ((new Date(`${date}T00:00:00`).getTime() - firstTime) / timeSpan) * width,
    height - ((value - min) / (max - min)) * (height - 30) - 15,
  ];
  const showPoints = Math.max(...series.map((entry) => entry.data.length)) <= 90;

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        {[0, 1, 2, 3].map((row) => <line key={row} x1="0" y1={20 + row * 52} x2={width} y2={20 + row * 52} className="chart-grid" />)}
        {series.map((entry) => {
          const segments: string[] = [];
          let current: string[] = [];
          entry.data.forEach((item) => {
            if (item.value === null) {
              if (current.length > 1) segments.push(current.join(' '));
              current = [];
              return;
            }
            current.push(coordinate(item.date, item.value).join(','));
          });
          if (current.length > 1) segments.push(current.join(' '));
          return <g key={entry.id} aria-label={entry.label}>
            {segments.map((segment, index) => <polyline key={`${entry.id}-${index}`} points={segment} className="chart-line" style={{ stroke: entry.color }} />)}
            {showPoints ? entry.data.map((item) => {
              if (item.value === null) return null;
              const [x, y] = coordinate(item.date, item.value);
              return <circle key={`${entry.id}-${item.date}`} cx={x} cy={y} r="3.5" style={{ fill: entry.color }} />;
            }) : null}
          </g>;
        })}
      </svg>
      <div className="chart-axis"><span>{firstDate.slice(5).replace('-', '/')}</span><span>{lastDate.slice(5).replace('-', '/')}</span></div>
    </div>
  );
}
