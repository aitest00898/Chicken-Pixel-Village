import type { CapacityTier } from '@chicken-village/domain';

export function ManagerSprite({ pose = 'front' }: { pose?: 'front' | 'back' }) {
  return <span className={`atlas-sprite manager-sprite manager-sprite--${pose}`} role="img" aria-label={pose === 'front' ? '像素管理者' : '像素管理者背影'} />;
}

export function HouseSprite({ tier, name }: { tier: CapacityTier; name: string }) {
  return <span className={`atlas-sprite house-sprite house-sprite--${tier}`} role="img" aria-label={`${name}・${tier === 'single' ? '單排' : tier === 'double' ? '雙排' : '三排'}雞舍`} />;
}

