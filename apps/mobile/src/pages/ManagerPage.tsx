import { equipmentItems, unlockedEquipment, type VisitProgress } from '@chicken-village/domain';
import { PixelPanel, ProgressBar } from '@chicken-village/ui';
import { ManagerSprite } from '../components/Sprites';

export function ManagerPage({ visits, onVisit, onEquip }: { visits: VisitProgress; onVisit: () => void; onEquip: (slot: 'head' | 'body' | 'hand' | 'back', id: string) => void }) {
  const unlocked = unlockedEquipment(equipmentItems, visits.accumulatedDays);
  return (
    <div className="page manager-page">
      <section className="manager-stage"><div className="manager-stage__sun" /><ManagerSprite /><div><p className="eyebrow">雞舍管理者</p><h1>晨巡裝備室</h1><p>裝備只改變外觀，不提供任何功能加成。</p><button className="primary-button" onClick={onVisit}>完成今日巡村</button></div></section>
      <PixelPanel><div className="visit-stats"><div><strong>{visits.accumulatedDays}</strong><small>累積到訪</small></div><div><strong>{visits.streakDays}</strong><small>連續到訪</small></div><div><strong>{unlocked.length}/4</strong><small>已解鎖</small></div></div><ProgressBar value={Math.min(100, visits.accumulatedDays / 14 * 100)} label="全裝備解鎖進度" /></PixelPanel>
      <PixelPanel title="外觀裝備"><div className="equipment-grid">{equipmentItems.map((item) => { const available = visits.accumulatedDays >= item.requiredVisitDays; const equipped = visits.equipped[item.slot] === item.id; return <button key={item.id} disabled={!available} className={equipped ? 'equipped' : ''} onClick={() => onEquip(item.slot, item.id)}><span className={`equipment-icon equipment-icon--${item.id}`} /><strong>{item.name}</strong><small>{available ? equipped ? '裝備中' : item.description : `累積 ${item.requiredVisitDays} 天解鎖`}</small></button>; })}</div></PixelPanel>
    </div>
  );
}

