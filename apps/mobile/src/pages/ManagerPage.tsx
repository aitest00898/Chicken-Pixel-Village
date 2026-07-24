import { equipmentItems, unlockedEquipment, type VisitProgress } from '@chicken-village/domain';
import { PixelPanel, ProgressBar } from '@chicken-village/ui';
import { Link } from 'react-router-dom';
import { EquipmentArt, ManagerAvatar } from '../components/Sprites';

export function ManagerPage({ visits, signedIn, onEquip }: { visits: VisitProgress; signedIn: boolean; onEquip: (slot: 'head' | 'body' | 'hand' | 'back', id: string | null) => void }) {
  const unlocked = unlockedEquipment(equipmentItems, visits.accumulatedDays);
  return (
    <div className="page manager-page">
      <section className="manager-stage illustrated-plate"><img src="/assets/art/vanadis-role-chronicle.webp" alt="管理者、代養戶、行情商人、孵化師、巡查員與帳房員的人物設定圖鑑" /><div className="manager-stage__copy"><p className="eyebrow">人物圖鑑・管理者卷</p><h1>晨巡裝備室</h1><p>登入成功時由 Firebase 依台北日期登記一次；同日重複開啟不會重複計數。裝備只改變外觀。</p>{signedIn ? <span className="login-recorded-badge">今日登入已校錄</span> : <Link className="primary-button" to="/admin">登入以記錄今日</Link>}</div><div className="manager-stage__avatar"><ManagerAvatar equipped={visits.equipped} /><small>水彩 Q 版・行裝即時預覽</small></div></section>
      <PixelPanel><div className="visit-stats"><div><strong>{visits.accumulatedDays}</strong><small>累積登入日</small></div><div><strong>{visits.streakDays}</strong><small>連續登入日</small></div><div><strong>{unlocked.length}/{equipmentItems.length}</strong><small>已解鎖</small></div></div><ProgressBar value={Math.min(100, visits.accumulatedDays / equipmentItems.length * 100)} label="全裝備解鎖進度" /></PixelPanel>
      <PixelPanel title="管理者行裝圖鑑"><div className="equipment-grid">{equipmentItems.map((item) => { const available = visits.accumulatedDays >= item.requiredVisitDays; const equipped = visits.equipped[item.slot] === item.id; return <button key={item.id} disabled={!available || !signedIn} className={equipped ? 'equipped' : ''} aria-pressed={equipped} onClick={() => onEquip(item.slot, equipped ? null : item.id)}><EquipmentArt item={item} /><strong>{item.name}</strong><small>{available ? equipped ? '裝備中・點按脫下' : item.description : `累積登入 ${item.requiredVisitDays} 日解鎖`}</small></button>; })}</div></PixelPanel>
    </div>
  );
}
