import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { useMarketData } from './hooks/useMarketData';
import { useVillageState } from './hooks/useVillageState';
import { useAuthentication } from './hooks/useAuthentication';
import { HomePage } from './pages/HomePage';
import { TodayPage } from './pages/TodayPage';
import { HistoryPage } from './pages/HistoryPage';
import { VillagePage } from './pages/VillagePage';
import { HousesPage } from './pages/HousesPage';
import { ManagerPage } from './pages/ManagerPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const location = useLocation();
  const { bundle, syncing } = useMarketData();
  const authentication = useAuthentication();
  const village = useVillageState();
  const [online, setOnline] = useState(navigator.onLine);
  const [dark, setDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => { const on = () => setOnline(true); const off = () => setOnline(false); addEventListener('online', on); addEventListener('offline', off); return () => { removeEventListener('online', on); removeEventListener('offline', off); }; }, []);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);
  useEffect(() => { document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'; }, [reduced]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);

  if (!village.ready || !authentication.ready) return <div className="splash-screen"><div className="splash-screen__art" /><div className="splash-screen__copy"><p>雞情像素村</p><h1>正在開啟村莊……</h1><small>讀取本機雞舍與巡村紀錄</small></div></div>;

  return (
    <AppShell offline={!online} syncLabel={syncing ? '正在確認最新行情…' : village.unsyncedCount ? `本機草稿 ${village.unsyncedCount} 筆待同步` : bundle.mode === 'live' ? '正式行情已同步' : '使用已驗證快照'}>
      <Routes>
        <Route path="/" element={<HomePage bundle={bundle} visits={village.visits} />} />
        <Route path="/today" element={<TodayPage bundle={bundle} syncing={syncing} />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/village" element={<VillagePage houses={village.houses} placements={village.mapPlacements} onMove={village.moveHouse} canEdit={authentication.isAdmin} />} />
        <Route path="/houses" element={<HousesPage village={village} online={online} isAdmin={authentication.isAdmin} />} />
        <Route path="/manager" element={<ManagerPage visits={village.visits} onVisit={village.visitToday} onEquip={village.equip} />} />
        <Route path="/admin" element={<AdminPage configured={authentication.configured} isAdmin={authentication.isAdmin} username={authentication.username} authError={authentication.error} houseCount={village.houses.filter((house) => !house.archivedAt).length} onSignIn={authentication.signIn} onSignOut={authentication.signOut} />} />
        <Route path="/settings" element={<SettingsPage dark={dark} reduced={reduced} onDark={setDark} onReduced={setReduced} mode={bundle.mode} storageMode={village.storageMode} isAdmin={authentication.isAdmin} adminUsername={authentication.username} onAdminSignOut={authentication.signOut} online={online} unsyncedCount={village.unsyncedCount} syncMode={village.syncMode} syncError={village.syncError} onSync={() => { void village.syncNow(online); }} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
