import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const tabs = [
  { to: '/', label: '主選單', icon: '⌂' },
  { to: '/today', label: '雞情', icon: '◉' },
  { to: '/village', label: '村莊', icon: '♟' },
  { to: '/houses', label: '雞舍', icon: '▰' },
  { to: '/manager', label: '管理者', icon: '♙' },
];

export function AppShell({ children, offline, syncLabel }: PropsWithChildren<{ offline: boolean; syncLabel: string }>) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="app-shell">
      <header className="topbar">
        {location.pathname !== '/' ? <button className="icon-button" onClick={() => { void navigate(-1); }} aria-label="返回">‹</button> : <span className="topbar__crest">🐔</span>}
        <div><strong>雞情像素村</strong><small className={offline ? 'offline' : ''}>{offline ? '離線・使用本機資料' : syncLabel}</small></div>
        <NavLink className="icon-button" to="/settings" aria-label="設定">⚙</NavLink>
      </header>
      <main className="app-main">{children}</main>
      <nav className="bottom-nav" aria-label="主要導覽">
        {tabs.map((tab) => <NavLink key={tab.to} to={tab.to} end={tab.to === '/'}><span aria-hidden="true">{tab.icon}</span><small>{tab.label}</small></NavLink>)}
      </nav>
    </div>
  );
}
