import { avatarOptions, equipmentItems, type AvatarId, type CapacityTier, type EquipmentItem, type VisitProgress } from '@chicken-village/domain';
import type { CSSProperties } from 'react';
import { assetUrl } from '../utils/assets';

function equipmentStyle(item: EquipmentItem): CSSProperties {
  const x = item.assetColumns === 1 ? 0 : item.assetColumn / (item.assetColumns - 1) * 100;
  const y = item.assetRows === 1 ? 0 : item.assetRow / (item.assetRows - 1) * 100;
  return {
    backgroundImage: `url('${assetUrl(`assets/art/vanadis/equipment/${item.assetAtlas === 'original' ? 'original-atlas.png' : 'atlas.png'}`)}')`,
    backgroundSize: `${item.assetColumns * 100}% ${item.assetRows * 100}%`,
    backgroundPosition: `${x}% ${y}%`,
  };
}

export function EquipmentArt({ item, className = '' }: { item: EquipmentItem; className?: string }) {
  return <span className={`vanadis-equipment-art ${className}`} style={equipmentStyle(item)} aria-hidden="true" />;
}

export function AvatarArt({ avatarId, variant = 'full', className = '' }: { avatarId: AvatarId; variant?: 'full' | 'chibi'; className?: string }) {
  const option = avatarOptions.find((candidate) => candidate.id === avatarId) ?? avatarOptions[2]!;
  return <span
    className={`avatar-art avatar-art--${variant} ${className}`}
    style={{
      backgroundImage: `url('${assetUrl('assets/art/vanadis/character/avatar-options-atlas.png')}')`,
      backgroundSize: '400% 200%',
      backgroundPosition: `${option.atlasColumn / 3 * 100}% ${variant === 'full' ? 0 : 100}%`,
    }}
    role="img"
    aria-label={`${option.name}・${option.title}${variant === 'full' ? '等身' : 'Q版'}形象`}
  />;
}

export function ManagerSprite({ pose = 'front' }: { pose?: 'front' | 'back' }) {
  return <span className={`manager-sprite manager-sprite--${pose}`} role="img" aria-label={pose === 'front' ? '瓦納迪斯風格 Q 版管理者' : '瓦納迪斯風格 Q 版管理者背影'} />;
}

export function ManagerAvatar({ equipped, avatarId, role = 'resident' }: { equipped: VisitProgress['equipped']; avatarId: AvatarId; role?: 'resident' | 'admin' }) {
  const selected = equipmentItems.filter((item) => equipped[item.slot] === item.id);
  const back = selected.find((item) => item.slot === 'back');
  return <div className={`manager-avatar manager-avatar--${role}`} role="img" aria-label={`${role === 'admin' ? '管理者專用' : '村民'}等身紙娃娃，裝備 ${selected.map((item) => item.name).join('、') || '無'}`}>
    {back ? <EquipmentArt item={back} className={`manager-avatar__equipment slot-${back.slot}`} /> : null}
    <AvatarArt avatarId={avatarId} variant="full" className="manager-avatar__base" />
    {selected.filter((item) => item.slot !== 'back').map((item) => <EquipmentArt key={item.id} item={item} className={`manager-avatar__equipment slot-${item.slot}`} />)}
  </div>;
}

export function HouseSprite({ tier, name }: { tier: CapacityTier; name: string }) {
  const iconIndex = tier === 'single' ? 0 : tier === 'double' ? 1 : 2;
  return <InvestmentHouseArt iconIndex={iconIndex} name={name} className="house-sprite" />;
}

export function InvestmentHouseArt({ iconIndex, name, className = '' }: { iconIndex: number; name: string; className?: string }) {
  const index = Math.max(0, Math.min(7, Math.round(iconIndex)));
  const column = index % 4;
  const row = Math.floor(index / 4);
  return <span
    className={`vanadis-house-art ${className}`}
    style={{ backgroundPosition: `${column / 3 * 100}% ${row * 100}%` }}
    role="img"
    aria-label={`${name}雞舍檔案圖`}
  />;
}
