import type { HistoryPoint } from '@chicken-village/market-data';
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';

export interface TrendChartSeries {
  id: string;
  label: string;
  color: string;
  data: HistoryPoint[];
}

interface QuerySelection {
  date: string;
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
}

interface TrendChartProps {
  series: TrendChartSeries[];
  label: string;
  queryActive: boolean;
  onQueryActiveChange: (active: boolean) => void;
}

const width = 520;
const height = 210;
const holdDuration = 1_000;
const inactivityDuration = 15_000;
const movementTolerance = 10;

export function TrendChart({ series, label, queryActive, onQueryActiveChange }: TrendChartProps) {
  const geometry = useMemo(() => {
    const values = series.flatMap((entry) => entry.data.flatMap((point) => point.value === null ? [] : [point.value]));
    const allDates = series.flatMap((entry) => entry.data.map((point) => point.date)).sort();
    const queryDates = [...new Set(series.flatMap((entry) => entry.data.filter((point) => point.value !== null).map((point) => point.date)))].sort();
    if (values.length === 0 || allDates.length === 0 || queryDates.length === 0) return null;
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const padding = Math.max(1, (rawMax - rawMin) * 0.12);
    const min = rawMin - padding;
    const max = rawMax + padding;
    const firstDate = allDates[0]!;
    const lastDate = allDates.at(-1)!;
    const firstTime = new Date(`${firstDate}T00:00:00`).getTime();
    const timeSpan = Math.max(1, new Date(`${lastDate}T00:00:00`).getTime() - firstTime);
    const coordinate = (date: string, value: number): [number, number] => [
      ((new Date(`${date}T00:00:00`).getTime() - firstTime) / timeSpan) * width,
      height - ((value - min) / (max - min)) * (height - 30) - 15,
    ];
    return { firstDate, lastDate, firstTime, timeSpan, queryDates, coordinate };
  }, [series]);

  const plotRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const holdTimerRef = useRef<number | null>(null);
  const inactivityTimerRef = useRef<number | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const latestPointerRef = useRef<{ x: number; y: number } | null>(null);
  const queryActiveRef = useRef(queryActive);
  const [selection, setSelection] = useState<QuerySelection | null>(null);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
  }, []);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = null;
  }, []);

  const exitQuery = useCallback(() => {
    queryActiveRef.current = false;
    clearHoldTimer();
    clearInactivityTimer();
    setSelection(null);
    onQueryActiveChange(false);
  }, [clearHoldTimer, clearInactivityTimer, onQueryActiveChange]);

  const scheduleInactivityExit = useCallback(() => {
    clearInactivityTimer();
    inactivityTimerRef.current = window.setTimeout(exitQuery, inactivityDuration);
  }, [clearInactivityTimer, exitQuery]);

  const updateSelection = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!geometry || !svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const viewX = Math.min(width, Math.max(0, ((clientX - rect.left) / rect.width) * width));
    const viewY = Math.min(height, Math.max(0, ((clientY - rect.top) / rect.height) * height));
    const targetTime = geometry.firstTime + (viewX / width) * geometry.timeSpan;
    const date = geometry.queryDates.reduce((nearest, candidate) => {
      const nearestDistance = Math.abs(new Date(`${nearest}T00:00:00`).getTime() - targetTime);
      const candidateDistance = Math.abs(new Date(`${candidate}T00:00:00`).getTime() - targetTime);
      return candidateDistance < nearestDistance ? candidate : nearest;
    });
    const candidates = series.flatMap((entry) => {
      const point = entry.data.find((candidate) => candidate.date === date && candidate.value !== null);
      if (point?.value === null || point?.value === undefined) return [];
      const [x, y] = geometry.coordinate(date, point.value);
      return [{ date, label: entry.label, value: point.value, color: entry.color, x, y }];
    });
    const nearest = candidates.reduce<QuerySelection | null>((current, candidate) => {
      if (!current) return candidate;
      return Math.abs(candidate.y - viewY) < Math.abs(current.y - viewY) ? candidate : current;
    }, null);
    if (nearest) setSelection(nearest);
  }, [geometry, series]);

  const armHoldTimer = useCallback((pointerId: number) => {
    clearHoldTimer();
    holdTimerRef.current = window.setTimeout(() => {
      if (activePointerRef.current !== pointerId) return;
      queryActiveRef.current = true;
      onQueryActiveChange(true);
      const latest = latestPointerRef.current;
      if (latest) updateSelection(latest.x, latest.y);
      const plot = plotRef.current;
      if (plot?.setPointerCapture) plot.setPointerCapture(pointerId);
      scheduleInactivityExit();
    }, holdDuration);
  }, [clearHoldTimer, onQueryActiveChange, scheduleInactivityExit, updateSelection]);

  const activateFromKeyboard = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    queryActiveRef.current = true;
    onQueryActiveChange(true);
    updateSelection(rect.left + rect.width / 2, rect.top + rect.height / 2);
    scheduleInactivityExit();
  }, [onQueryActiveChange, scheduleInactivityExit, updateSelection]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    activePointerRef.current = event.pointerId;
    const position = { x: event.clientX, y: event.clientY };
    pointerStartRef.current = position;
    latestPointerRef.current = position;
    if (queryActiveRef.current) {
      event.currentTarget.setPointerCapture?.(event.pointerId);
      updateSelection(position.x, position.y);
      scheduleInactivityExit();
    } else {
      armHoldTimer(event.pointerId);
    }
  }, [armHoldTimer, scheduleInactivityExit, updateSelection]);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== event.pointerId) return;
    const position = { x: event.clientX, y: event.clientY };
    latestPointerRef.current = position;
    if (queryActiveRef.current) {
      event.preventDefault();
      updateSelection(position.x, position.y);
      scheduleInactivityExit();
      return;
    }
    const start = pointerStartRef.current;
    if (start && Math.hypot(position.x - start.x, position.y - start.y) > movementTolerance) {
      pointerStartRef.current = position;
      armHoldTimer(event.pointerId);
    }
  }, [armHoldTimer, scheduleInactivityExit, updateSelection]);

  const finishPointer = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== event.pointerId) return;
    clearHoldTimer();
    activePointerRef.current = null;
    pointerStartRef.current = null;
    latestPointerRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (queryActiveRef.current) scheduleInactivityExit();
  }, [clearHoldTimer, scheduleInactivityExit]);

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && queryActiveRef.current) {
      event.preventDefault();
      exitQuery();
    } else if ((event.key === 'Enter' || event.key === ' ') && !queryActiveRef.current) {
      event.preventDefault();
      activateFromKeyboard();
    }
  }, [activateFromKeyboard, exitQuery]);

  useEffect(() => {
    queryActiveRef.current = queryActive;
    if (!queryActive) {
      clearHoldTimer();
      clearInactivityTimer();
      setSelection(null);
    }
  }, [clearHoldTimer, clearInactivityTimer, queryActive]);

  useEffect(() => {
    const handleVisibility = () => { if (document.hidden) exitQuery(); };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', exitQuery);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', exitQuery);
      clearHoldTimer();
      clearInactivityTimer();
    };
  }, [clearHoldTimer, clearInactivityTimer, exitQuery]);

  if (!geometry) return null;
  const showPoints = Math.max(...series.map((entry) => entry.data.length)) <= 45;

  return (
    <div className={`trend-chart${queryActive ? ' is-querying' : ''}`}>
      <div
        ref={plotRef}
        className="trend-chart__plot"
        data-testid="trend-query-surface"
        tabIndex={0}
        aria-label={queryActive ? '十字查價中，按 Escape 可退出' : '折線圖查價區，長按 1 秒或按 Enter 啟動'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onLostPointerCapture={finishPointer}
        onKeyDown={handleKeyDown}
        onContextMenu={(event) => event.preventDefault()}
      >
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={label}>
          {[0, 1, 2, 3].map((row) => <line key={row} x1="0" y1={20 + row * 52} x2={width} y2={20 + row * 52} className="chart-grid" />)}
          {series.map((entry) => {
            const segments: string[] = [];
            let current: string[] = [];
            const showEntryPoints = showPoints || entry.data.filter((item) => item.value !== null).length === 1;
            entry.data.forEach((item) => {
              if (item.value === null) {
                if (current.length > 1) segments.push(current.join(' '));
                current = [];
                return;
              }
              current.push(geometry.coordinate(item.date, item.value).join(','));
            });
            if (current.length > 1) segments.push(current.join(' '));
            return <g key={entry.id} aria-label={entry.label}>
              {segments.map((segment, index) => <polyline key={`${entry.id}-${index}`} points={segment} className="chart-line" style={{ stroke: entry.color }} />)}
              {showEntryPoints ? entry.data.map((item) => {
                if (item.value === null) return null;
                const [x, y] = geometry.coordinate(item.date, item.value);
                return <circle key={`${entry.id}-${item.date}`} cx={x} cy={y} r="3.5" style={{ fill: entry.color }} />;
              }) : null}
            </g>;
          })}
          {queryActive && selection ? <g className="chart-query-crosshair" aria-hidden="true">
            <line x1={selection.x} y1="0" x2={selection.x} y2={height} />
            <line x1="0" y1={selection.y} x2={width} y2={selection.y} />
            <circle cx={selection.x} cy={selection.y} r="7" style={{ fill: selection.color }} />
          </g> : null}
        </svg>
        {queryActive && selection ? <div
          className={`chart-query-card${selection.x > width * .62 ? ' align-left' : ''}`}
          style={{ left: `${(selection.x / width) * 100}%`, top: `${(Math.min(height - 24, Math.max(24, selection.y)) / height) * 100}%` }}
          role="status"
          aria-live="polite"
        >
          <time dateTime={selection.date}>{selection.date}</time>
          <strong>{selection.label}</strong>
          <b>{selection.value.toFixed(1)} <small>元／台斤</small></b>
        </div> : null}
      </div>
      <div className="chart-axis"><span>{geometry.firstDate.slice(5).replace('-', '/')}</span><span>{geometry.lastDate.slice(5).replace('-', '/')}</span></div>
      <p className="chart-query-hint">{queryActive ? '查價中・移動手指更新日期與行情線' : '在折線圖上停留 1 秒，即可啟動十字查價'}</p>
    </div>
  );
}
