import { avatarOptions, visibleEquippedItems, wardrobeRenderStages, wearableConfigFor, type AvatarId, type CapacityTier, type EquipmentItem, type VisitProgress } from '@chicken-village/domain';
import type { CSSProperties } from 'react';
import { useState } from 'react';
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
  return <img
    className={`avatar-art avatar-art--${variant} ${className}`}
    src={assetUrl(`assets/art/vanadis/character/avatars/${option.id}-${variant}.png`)}
    alt={`${option.name}・${option.title}${variant === 'full' ? '等身' : 'Q版'}形象`}
  />;
}

export function ManagerSprite({ pose = 'front' }: { pose?: 'front' | 'back' }) {
  return <span className={`manager-sprite manager-sprite--${pose}`} role="img" aria-label={pose === 'front' ? '瓦納迪斯風格 Q 版管理者' : '瓦納迪斯風格 Q 版管理者背影'} />;
}

function WearableLayer({ item, stage, file }: { item: EquipmentItem; stage: string; file: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={`manager-avatar__layer manager-avatar__wearable manager-avatar__wearable--failed manager-avatar__wearable--${stage}`} data-missing-wearable={`${item.id}:${stage}`} aria-hidden="true" />;
  return <img
    className={`manager-avatar__layer manager-avatar__wearable manager-avatar__wearable--${stage}`}
    src={assetUrl(file)}
    alt=""
    aria-hidden="true"
    onError={() => setFailed(true)}
  />;
}

export function ManagerAvatar({ equipped, avatarId, role = 'resident' }: { equipped: VisitProgress['equipped']; avatarId: AvatarId; role?: 'resident' | 'admin' }) {
  const selected = visibleEquippedItems(equipped, avatarId);
  const layers = selected.flatMap((item) => {
    const config = wearableConfigFor(item.id);
    if (!config || config.assetStatus !== 'ready') return [];
    return config.renderStages.flatMap((stage) => {
      const files = config.layerFiles;
      const file =
        stage === 'body-variant' ? files.bodyVariant :
          stage === 'backpack-back' || stage === 'back-equipment' || stage === 'cape-back' || stage === 'handheld-back' || stage === 'head-equipment-back' ? files.back :
            stage === 'front-straps' || stage === 'handheld-front' || stage === 'head-equipment-front' || stage === 'chest-accessory' ? files.front ?? files.main :
              stage === 'hand-mask' ? files.mask :
                files.main;
      return file ? [{ item, stage, file }] : [];
    });
  }).sort((a, b) => wardrobeRenderStages.indexOf(a.stage) - wardrobeRenderStages.indexOf(b.stage));
  const usesBodyVariant = layers.some((layer) => layer.stage === 'body-variant');
  return <div className={`manager-avatar manager-avatar--${role}`} role="img" aria-label={`${role === 'admin' ? '管理者專用' : '村民'}等身紙娃娃，裝備 ${selected.map((item) => item.name).join('、') || '無'}`}>
    {wardrobeRenderStages.map((stage) => {
      if (stage === 'base-character' && !usesBodyVariant) return <AvatarArt key={stage} avatarId={avatarId} variant="full" className="manager-avatar__base manager-avatar__layer" />;
      return layers.filter((layer) => layer.stage === stage).map((layer) => <WearableLayer
        key={`${layer.item.id}-${layer.stage}-${layer.file}`}
        item={layer.item}
        stage={layer.stage}
        file={layer.file}
      />);
    })}
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
