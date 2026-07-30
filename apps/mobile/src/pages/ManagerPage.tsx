import { avatarOptions, equipmentItems, isWearableReadyForAvatar, unlockedEquipment, wardrobeEquipUnavailableReason, wearableConfigFor, type AvatarId, type EquipmentSlot, type VisitProgress } from '@chicken-village/domain';
import { PixelPanel, ProgressBar } from '@chicken-village/ui';
import { Link } from 'react-router-dom';
import { AvatarArt, EquipmentArt, ManagerAvatar } from '../components/Sprites';
import { assetUrl } from '../utils/assets';

export function ManagerPage({ visits, signedIn, isAdmin, onEquip, onAvatar }: { visits: VisitProgress; signedIn: boolean; isAdmin: boolean; onEquip: (slot: EquipmentSlot, id: string | null) => void; onAvatar: (avatarId: AvatarId) => void }) {
  const unlocked = unlockedEquipment(equipmentItems, visits.accumulatedDays);
  const selectedAvatar = avatarOptions.find((option) => option.id === visits.avatarId) ?? avatarOptions[2]!;
  return (
    <div className="page manager-page">
      <section className="manager-stage illustrated-plate">
        <img src={assetUrl('assets/art/vanadis/wardrobe/equipment-ledger-bg.jpg')} alt="瓦納迪斯風格行裝帳冊背景，中間留有等身紙娃娃展示區" />
        <div className="manager-stage__copy">
          <p className="eyebrow">{isAdmin ? '人物圖鑑・管理者卷' : '人物圖鑑・村民卷'}</p>
          <h1>晨巡裝備室</h1>
          <p>{selectedAvatar.name}・{selectedAvatar.title}。{isAdmin ? '管理者權限與形象選擇分開保存，行裝穿搭會同步至 Firebase。' : '每位使用者皆可切換等身與 Q 版形象；系統會依台北日期每日校錄一次。'}</p>
          {signedIn ? <span className="login-recorded-badge">{isAdmin ? '管理者身分・今日已校錄' : '村民形象・今日已校錄'}</span> : <Link className="primary-button" to="/admin">登入以記錄今日</Link>}
        </div>
        <div className="manager-stage__avatar">
          <ManagerAvatar equipped={visits.equipped} avatarId={selectedAvatar.id} role={isAdmin ? 'admin' : 'resident'} />
          <small>{selectedAvatar.name}・等身紙娃娃即時預覽</small>
        </div>
      </section>
      <PixelPanel><div className="visit-stats"><div><strong>{visits.accumulatedDays}</strong><small>累積登入日</small></div><div><strong>{visits.streakDays}</strong><small>連續登入日</small></div><div><strong>{unlocked.length}/{equipmentItems.length}</strong><small>已解鎖</small></div></div><ProgressBar value={Math.min(100, visits.accumulatedDays / equipmentItems.length * 100)} label="全裝備解鎖進度" /></PixelPanel>
      <PixelPanel title="人物形象">
        <div className="avatar-choice-grid">{avatarOptions.map((option) => {
          const selected = option.id === selectedAvatar.id;
          return <button key={option.id} type="button" disabled={!signedIn} className={selected ? 'selected' : ''} aria-pressed={selected} onClick={() => onAvatar(option.id)}>
            <span className="avatar-choice-grid__art"><AvatarArt avatarId={option.id} variant="full" /><AvatarArt avatarId={option.id} variant="chibi" /></span>
            <strong>{option.name}</strong>
            <small>{option.title}・{selected ? '目前形象' : signedIn ? '點按切換並保存' : '登入後可保存形象'}</small>
            <em>{option.description}</em>
          </button>;
        })}</div>
      </PixelPanel>
      <PixelPanel title="行裝圖鑑"><div className="equipment-grid">{equipmentItems.map((item) => {
        const available = visits.accumulatedDays >= item.requiredVisitDays;
        const equipped = visits.equipped[item.slot] === item.id;
        const ready = isWearableReadyForAvatar(item.id, selectedAvatar.id);
        const config = wearableConfigFor(item.id);
        const reason = available ? wardrobeEquipUnavailableReason(item.id, selectedAvatar.id, visits.equipped) : `累積登入 ${item.requiredVisitDays} 日解鎖`;
        const canEquip = available && signedIn && ready;
        const canUnequip = available && signedIn && equipped;
        const disabled = !canEquip && !canUnequip;
        const className = [equipped ? 'equipped' : '', ready ? '' : 'asset-missing'].filter(Boolean).join(' ');
        const statusText = !signedIn ? '登入後可保存行裝' : equipped && !ready ? `已保存但暫無外觀・點按移除。${reason ?? ''}` : equipped ? '裝備中・點按脫下' : reason ?? item.description;
        return <button key={item.id} disabled={disabled} className={className} aria-pressed={equipped} onClick={() => onEquip(item.slot, equipped ? null : item.id)}><EquipmentArt item={item} /><strong>{item.name}</strong><small>{config ? `${config.usageType}・${statusText}` : statusText}</small></button>;
      })}</div></PixelPanel>
    </div>
  );
}
