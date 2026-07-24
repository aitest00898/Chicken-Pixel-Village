import { PixelPanel } from '@chicken-village/ui';

export function SettingsPage({ dark, reduced, onDark, onReduced, mode, storageMode, authLabel, onSignOut }: { dark: boolean; reduced: boolean; onDark: (value: boolean) => void; onReduced: (value: boolean) => void; mode: string; storageMode: 'native-sqlite' | 'web-cache'; authLabel: string | null; onSignOut: () => Promise<void> }) {
  return (
    <div className="page settings-page"><header className="page-title"><p className="eyebrow">偏好與資料狀態</p><h1>設定</h1></header>
      <PixelPanel title="顯示"><Toggle label="深色模式" checked={dark} onChange={onDark} /><Toggle label="減少動畫" checked={reduced} onChange={onReduced} /></PixelPanel>
      <PixelPanel title="資料與離線"><div className="setting-row"><span><strong>公開行情</strong><small>農業部 Open Data；失敗時使用已驗證快照</small></span><b>{mode === 'live' ? '正式來源' : '快照'}</b></div><div className="setting-row"><span><strong>私人本機資料</strong><small>iOS／Android：加密 SQLite；Web：可重建 IndexedDB 快取</small></span><b>{storageMode === 'native-sqlite' ? '加密 SQLite' : 'Web 快取'}</b></div><div className="setting-row"><span><strong>Firebase SQL Connect</strong><small>本機 schema／emulator 已準備；production 尚未部署</small></span><b>未部署</b></div>{authLabel ? <div className="setting-row"><span><strong>{authLabel}</strong><small>目前私人區身分</small></span><button type="button" className="text-button" onClick={() => { void onSignOut(); }}>登出</button></div> : null}</PixelPanel>
      <PixelPanel title="安全"><ul className="notes-list"><li>正式 token 與加密金鑰只進 Keychain／Keystore。</li><li>財務衝突不會自動覆蓋。</li><li>App Check 正式強制前會先監控驗證。</li><li>目前沒有啟用付費服務或 production 資源。</li></ul></PixelPanel>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="toggle-row"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i /></label>; }
