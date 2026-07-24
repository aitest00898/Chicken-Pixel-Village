import { useState, type FormEvent, type PropsWithChildren } from 'react';
import { PixelPanel } from '@chicken-village/ui';

export function PrivateGate({ authenticated, configured, onSignIn, children }: PropsWithChildren<{ authenticated: boolean; configured: boolean; onSignIn: (email: string, password: string) => Promise<void> }>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  if (authenticated) return children;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    void onSignIn(email, password)
      .then(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      .catch(() => setError('登入失敗，請確認帳號、密碼與 emulator 狀態。'));
  };
  return (
    <PixelPanel className="private-gate">
      <div className="lock-orb">🔒</div>
      <p className="eyebrow">私人營運區</p>
      <h1>登入後進入我的雞舍</h1>
      <p>公開行情仍可直接使用。雞舍、股東、分潤與風險資料需要組織成員身分。</p>
      <form className="auth-form" onSubmit={submit}>
        {configured ? <><label>電子郵件<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>密碼<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label></> : null}
        <button className="primary-button" type="submit">{configured ? '登入私人營運區' : '使用本機示範 Owner'}</button>
      </form>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <small>{configured ? '認證交由 Firebase Auth；密碼不寫入本機資料庫。' : '目前尚未配置 Firebase，不會建立真實帳號。'}</small>
    </PixelPanel>
  );
}
