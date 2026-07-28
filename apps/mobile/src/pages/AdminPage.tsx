import { PixelPanel } from '@chicken-village/ui';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { assetUrl } from '../utils/assets';

interface Props {
  configured: boolean;
  isAdmin: boolean;
  username: string | null;
  authError: string | null;
  houseCount: number;
  onSignIn: (username: string, password: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function AdminPage({ configured, isAdmin, username, authError, houseCount, onSignIn, onSignOut }: Props) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAdmin) return <div className="page admin-page">
    <header className="page-title"><p className="eyebrow">封存卷宗・受保護的營運入口</p><h1>管理員控制台</h1><p>只有通過 Firebase 身分與 Firestore 管理員名冊雙重驗證的帳號可以校訂雞舍資料。</p></header>
    <div className="admin-metrics"><PixelPanel><small>目前管理員</small><strong>{username}</strong><span>已驗證</span></PixelPanel><PixelPanel><small>公開雞舍</small><strong>{houseCount}</strong><span>舍</span></PixelPanel></div>
    <PixelPanel title="雞舍資料管理"><p>新增、編輯、封存與營運資料表單會在管理員模式下顯示。</p><div className="admin-actions"><Link className="primary-button" to="/houses">開啟雞舍管理</Link><button className="text-button" onClick={() => { void onSignOut(); }}>登出管理員</button></div></PixelPanel>
  </div>;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true); setError('');
    void onSignIn(account, password)
      .then(() => { setPassword(''); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : '管理員登入失敗。'))
      .finally(() => setSubmitting(false));
  };

  return <div className="page admin-page"><PixelPanel className="admin-login">
    <div className="lock-orb"><img src={assetUrl('assets/art/vanadis-guild-seal.png')} alt="雞情像素村管理公會徽章" /></div><p className="eyebrow">管理公會・封印卷宗</p><h1>進入管理介面</h1><p>一般使用者不需要登入即可瀏覽雞舍；此登入只開放資料維護權限。</p>
    <form className="auth-form" onSubmit={submit}><label>管理員帳號<input autoComplete="username" value={account} onChange={(event) => setAccount(event.target.value)} required /></label><label>密碼<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button className="primary-button" disabled={!configured || submitting}>{submitting ? '驗證中…' : '登入管理介面'}</button></form>
    {error || authError ? <p className="form-error" role="alert">{error || authError}</p> : null}<small>密碼由 Firebase Authentication 驗證，不會寫入前端程式或 GitHub。</small>
  </PixelPanel></div>;
}
