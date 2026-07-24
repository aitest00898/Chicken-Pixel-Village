import { equipmentItems, type CapacityTier, type EquipmentItem, type VisitProgress } from '@chicken-village/domain';
import type { CSSProperties } from 'react';

function equipmentStyle(item: EquipmentItem): CSSProperties {
  const x = item.assetColumns === 1 ? 0 : item.assetColumn / (item.assetColumns - 1) * 100;
  const y = item.assetRows === 1 ? 0 : item.assetRow / (item.assetRows - 1) * 100;
  return {
    backgroundImage: `url('/assets/art/vanadis/equipment/${item.assetAtlas === 'original' ? 'original-atlas.png' : 'atlas.png'}')`,
    backgroundSize: `${item.assetColumns * 100}% ${item.assetRows * 100}%`,
    backgroundPosition: `${x}% ${y}%`,
  };
}

export function EquipmentArt({ item, className = '' }: { item: EquipmentItem; className?: string }) {
  return <span className={`vanadis-equipment-art ${className}`} style={equipmentStyle(item)} aria-hidden="true" />;
}

export function ManagerSprite({ pose = 'front' }: { pose?: 'front' | 'back' }) {
  return <span className={`manager-sprite manager-sprite--${pose}`} role="img" aria-label={pose === 'front' ? '瓦納迪斯風格 Q 版管理者' : '瓦納迪斯風格 Q 版管理者背影'} />;
}

export function ManagerAvatar({ equipped }: { equipped: VisitProgress['equipped'] }) {
  const selected = equipmentItems.filter((item) => equipped[item.slot] === item.id);
  const back = selected.find((item) => item.slot === 'back');
  return <div className="manager-avatar" role="img" aria-label={`Q 版管理者，裝備 ${selected.map((item) => item.name).join('、') || '無'}`}>
    {back ? <EquipmentArt item={back} className={`manager-avatar__equipment slot-${back.slot}`} /> : null}
    <img src="/assets/art/vanadis/character/manager-base.png" alt="" />
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
