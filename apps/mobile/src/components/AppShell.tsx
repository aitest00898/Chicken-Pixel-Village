import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const tabs = [
  { to: '/', label: '總覽', icon: 'book' },
  { to: '/today', label: '公報', icon: 'coin' },
  { to: '/history', label: '歷史', icon: 'history' },
  { to: '/village', label: '領地', icon: 'map' },
  { to: '/houses', label: '帳冊', icon: 'house' },
  { to: '/manager', label: '管理者', icon: 'person' },
] as const;

function ChronicleIcon({ name }: { name: (typeof tabs)[number]['icon'] | 'settings' }) {
  const paths = {
    book: <><path d="M4 5.5c2.2-.8 4.3-.4 6 1v11c-1.7-1.4-3.8-1.8-6-1V5.5Z" /><path d="M20 5.5c-2.2-.8-4.3-.4-6 1v11c1.7-1.4 3.8-1.8 6-1V5.5Z" /></>,
    coin: <><circle cx="12" cy="12" r="7" /><path d="M9 12h6M12 9v6" /></>,
    history: <><path d="M5 19V9M10 19V5M15 19v-7M20 19V8" /><path d="m4 14 6-5 5 1 5-5" /></>,
    map: <><path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z" /><path d="M9 4v14M15 6v14" /></>,
    house: <><path d="m4 11 8-7 8 7" /><path d="M6.5 9.5V20h11V9.5M10 20v-6h4v6" /></>,
    person: <><circle cx="12" cy="7" r="3" /><path d="M6 20c.5-5 2.5-7 6-7s5.5 2 6 7M5 20h14" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>,
  };
  return <svg className="chronicle-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export function AppShell({ children, offline, syncLabel }: PropsWithChildren<{ offline: boolean; syncLabel: string }>) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="app-shell">
      <header className="topbar">
        {location.pathname !== '/' ? <button className="icon-button back-button" onClick={() => { void navigate(-1); }} aria-label="返回">‹</button> : <span className="topbar__crest" aria-hidden="true" />}
        <div><span className="topbar__chapter">THE POULTRY CHRONICLE</span><strong>雞情像素村</strong><small className={offline ? 'offline' : ''}>{offline ? '離線・使用本機資料' : syncLabel}</small></div>
        <NavLink className="icon-button" to="/settings" aria-label="設定"><ChronicleIcon name="settings" /></NavLink>
      </header>
      <main className="app-main">{children}</main>
      <nav className="bottom-nav" aria-label="主要導覽">
        {tabs.map((tab) => <NavLink key={tab.to} to={tab.to} end={tab.to === '/'}><ChronicleIcon name={tab.icon} /><small>{tab.label}</small></NavLink>)}
      </nav>
    </div>
  );
}
