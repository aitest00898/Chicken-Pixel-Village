import type { PropsWithChildren, ReactNode } from 'react';

export function PixelPanel({ children, className = '', title, action }: PropsWithChildren<{ className?: string; title?: string; action?: ReactNode }>) {
  return (
    <section className={`pixel-panel ${className}`.trim()}>
      {(title !== undefined || action !== undefined) && <header className="pixel-panel__header">{title !== undefined && <h2>{title}</h2>}{action}</header>}
      {children}
    </section>
  );
}

export function DataBadge({ tone, children }: PropsWithChildren<{ tone: 'live' | 'cache' | 'fixture' | 'warning' | 'offline' }>) {
  return <span className={`data-badge data-badge--${tone}`}>{children}</span>;
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const normalized = Math.max(0, Math.min(100, value));
  return <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalized}><span style={{ width: `${normalized}%` }} /></div>;
}

