import { equipmentItems, wearableAssetConfigs } from './fixtures';
import type { AvatarId, EquipmentItem, EquipmentSlot, VisitProgress, WearableAssetConfig, WearableRenderStage } from './types';

export const wardrobeRenderStages: WearableRenderStage[] = [
  'character-back-effect',
  'back-equipment',
  'cape-back',
  'backpack-back',
  'base-character',
  'body-variant',
  'inner-clothing',
  'torso-clothing',
  'waist-equipment',
  'front-straps',
  'handheld-back',
  'character-arm',
  'hand-mask',
  'handheld-main',
  'handheld-front',
  'neck-accessory',
  'chest-accessory',
  'head-equipment-back',
  'character-hair-or-face',
  'head-equipment-front',
  'foreground-effect',
];

export function wearableConfigFor(itemId: string): WearableAssetConfig | undefined {
  return wearableAssetConfigs.find((config) => config.itemId === itemId);
}

export function equipmentItemFor(itemId: string): EquipmentItem | undefined {
  return equipmentItems.find((item) => item.id === itemId);
}

export function isWearableReadyForAvatar(itemId: string, avatarId: AvatarId): boolean {
  const config = wearableConfigFor(itemId);
  return Boolean(config?.wearable && config.assetStatus === 'ready' && config.compatibleCharacterIds.includes(avatarId));
}

export function wardrobeUnavailableReason(itemId: string, avatarId: AvatarId): string | null {
  const item = equipmentItemFor(itemId);
  if (!item) return '未知行裝。';
  const config = wearableConfigFor(itemId);
  if (!config) return '尚未建立穿戴設定。';
  if (!config.compatibleCharacterIds.includes(avatarId)) return '此角色尚未支援此裝備。';
  if (!config.wearable) return config.unsupportedReason ?? '此物品目前只保留於圖鑑，不顯示在人物身上。';
  if (config.requiresPoseVariant && config.assetStatus !== 'ready') return config.unsupportedReason ?? '此裝備需要特殊姿勢，穿戴資產尚未完成。';
  if (config.assetStatus === 'missing') return '此角色專用穿戴圖層尚未完成。';
  if (config.assetStatus === 'unsupported') return config.unsupportedReason ?? '此角色尚未支援此裝備。';
  return null;
}

export function wardrobeEquipUnavailableReason(itemId: string, avatarId: AvatarId, equipped: VisitProgress['equipped'] = {}): string | null {
  const item = equipmentItemFor(itemId);
  if (!item) return '未知行裝。';
  const baseReason = wardrobeUnavailableReason(itemId, avatarId);
  if (baseReason) return baseReason;
  const config = wearableConfigFor(itemId);
  if (!config) return '尚未建立穿戴設定。';
  const conflictingItem = Object.values(equipped).find((equippedItemId) => equippedItemId && config.conflictsWithItems?.includes(equippedItemId));
  if (conflictingItem) {
    const itemName = equipmentItemFor(conflictingItem)?.name ?? conflictingItem;
    return `與目前穿戴的「${itemName}」衝突。`;
  }
  const conflictingSlot = config.conflictsWithSlots?.find((candidate) => candidate !== item.slot && Boolean(equipped[candidate]));
  if (conflictingSlot) return `與目前 ${conflictingSlot} 欄位裝備衝突。`;
  return null;
}

export function changeEquippedItem(equipped: VisitProgress['equipped'], avatarId: AvatarId, slot: EquipmentSlot, itemId: string | null): { equipped: VisitProgress['equipped']; error: string | null } {
  if (itemId === null) {
    const next = { ...equipped };
    delete next[slot];
    return { equipped: next, error: null };
  }
  const item = equipmentItemFor(itemId);
  if (!item) return { equipped, error: '未知行裝。' };
  if (item.slot !== slot) return { equipped, error: `行裝欄位不一致：${item.name} 屬於 ${item.slot}，不能寫入 ${slot}。` };
  const reason = wardrobeEquipUnavailableReason(itemId, avatarId, equipped);
  if (reason) return { equipped, error: reason };
  return { equipped: { ...equipped, [slot]: itemId }, error: null };
}

export function visibleEquippedItems(equipped: VisitProgress['equipped'], avatarId: AvatarId): EquipmentItem[] {
  return equipmentItems.filter((item) => equipped[item.slot] === item.id && isWearableReadyForAvatar(item.id, avatarId));
}

export function equippedItemsBySlot(equipped: VisitProgress['equipped']): Partial<Record<EquipmentSlot, EquipmentItem>> {
  return equipmentItems.reduce<Partial<Record<EquipmentSlot, EquipmentItem>>>((result, item) => {
    if (equipped[item.slot] === item.id) result[item.slot] = item;
    return result;
  }, {});
}
