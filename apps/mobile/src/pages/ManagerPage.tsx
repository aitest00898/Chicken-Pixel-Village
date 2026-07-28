import { equipmentItems, unlockedEquipment, type VisitProgress } from '@chicken-village/domain';
import { PixelPanel, ProgressBar } from '@chicken-village/ui';
import { Link } from 'react-router-dom';
import { EquipmentArt, ManagerAvatar } from '../components/Sprites';
import { assetUrl } from '../utils/assets';

export function ManagerPage({ visits, signedIn, isAdmin, onEquip }: { visits: VisitProgress; signedIn: boolean; isAdmin: boolean; onEquip: (slot: 'head' | 'body' | 'hand' | 'back', id: string | null) => void }) {
  const unlocked = unlockedEquipment(equipmentItems, visits.accumulatedDays);
  return (
    <div className="page manager-page">
      <section className="manager-stage illustrated-plate"><img src={assetUrl('assets/art/vanadis/wardrobe/equipment-ledger-bg.jpg')} alt="瓦納迪斯風格行裝帳冊背景，中間留有等身紙娃娃展示區" /><div className="manager-stage__copy"><p className="eyebrow">{isAdmin ? '人物圖鑑・管理者卷' : '人物圖鑑・村民卷'}</p><h1>晨巡裝備室</h1><p>{isAdmin ? '管理者使用專用外觀，登入校錄與行裝穿搭會保存至 Firebase。' : '每位使用者皆可使用等身紙娃娃行裝；系統會依台北日期每日校錄一次。'}</p>{signedIn ? <span className="login-recorded-badge">{isAdmin ? '管理者外觀・今日已校錄' : '村民行裝・今日已校錄'}</span> : <Link className="primary-button" to="/admin">登入以記錄今日</Link>}</div><div className="manager-stage__avatar"><ManagerAvatar equipped={visits.equipped} role={isAdmin ? 'admin' : 'resident'} /><small>{isAdmin ? '管理者等身外觀・行裝即時預覽' : '村民等身紙娃娃・行裝即時預覽'}</small></div></section>
      <PixelPanel><div className="visit-stats"><div><strong>{visits.accumulatedDays}</strong><small>累積登入日</small></div><div><strong>{visits.streakDays}</strong><small>連續登入日</small></div><div><strong>{unlocked.length}/{equipmentItems.length}</strong><small>已解鎖</small></div></div><ProgressBar value={Math.min(100, visits.accumulatedDays / equipmentItems.length * 100)} label="全裝備解鎖進度" /></PixelPanel>
      <PixelPanel title="行裝圖鑑"><div className="equipment-grid">{equipmentItems.map((item) => { const available = visits.accumulatedDays >= item.requiredVisitDays; const equipped = visits.equipped[item.slot] === item.id; return <button key={item.id} disabled={!available || !signedIn} className={equipped ? 'equipped' : ''} aria-pressed={equipped} onClick={() => onEquip(item.slot, equipped ? null : item.id)}><EquipmentArt item={item} /><strong>{item.name}</strong><small>{available ? equipped ? '裝備中・點按脫下' : item.description : `累積登入 ${item.requiredVisitDays} 日解鎖`}</small></button>; })}</div></PixelPanel>
    </div>
  );
}
