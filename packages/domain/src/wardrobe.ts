import { avatarOptions, equipmentItems, wearableAssetConfigs } from './fixtures';
import type { AvatarId, EquipmentItem, EquipmentSlot, VisitProgress, WardrobeMatrixEntry, WearableAssetConfig, WearableLayerFile, WearableRenderStage } from './types';

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

export function wearableLayerFileForStage(config: WearableAssetConfig, stage: WearableRenderStage): string | undefined {
  const files = config.layerFiles;
  if (stage === 'body-variant') return files.bodyVariant;
  if (stage === 'backpack-back' || stage === 'back-equipment' || stage === 'cape-back' || stage === 'handheld-back' || stage === 'head-equipment-back') return files.back;
  if (stage === 'front-straps' || stage === 'handheld-front' || stage === 'head-equipment-front' || stage === 'chest-accessory') return files.front ?? files.main;
  if (stage === 'hand-mask') return files.mask;
  return files.main;
}

export function wearableLayerFilesFor(itemId: string): WearableLayerFile[] {
  const config = wearableConfigFor(itemId);
  if (!config || config.assetStatus !== 'ready') return [];
  return config.renderStages.flatMap((stage) => {
    const file = wearableLayerFileForStage(config, stage);
    return file ? [{ itemId, stage, file }] : [];
  }).sort((a, b) => wardrobeRenderStages.indexOf(a.stage) - wardrobeRenderStages.indexOf(b.stage));
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

export function wardrobeMatrixEntries(): WardrobeMatrixEntry[] {
  return avatarOptions.flatMap((avatar) => equipmentItems.map((item) => {
    const config = wearableConfigFor(item.id);
    const compatible = Boolean(config?.compatibleCharacterIds.includes(avatar.id));
    const requiredLayers = config ? Object.entries(config.layerFiles).filter(([, file]) => Boolean(file)).map(([layer]) => layer) : [];
    const assetStatus = config?.assetStatus ?? 'unsupported';
    const implementationStatus: WardrobeMatrixEntry['implementationStatus'] =
      assetStatus === 'ready' ? 'art-ready' :
        !config?.wearable ? 'blocked-by-art' :
          compatible && requiredLayers.length > 0 ? 'program-wired' :
            'manifest-only';
    return {
      characterId: avatar.id,
      characterName: avatar.name,
      itemId: item.id,
      itemName: item.name,
      usageType: config?.usageType ?? 'unsupported',
      slot: config?.slot ?? item.slot,
      wearable: Boolean(config?.wearable),
      compatible,
      requiredLayers,
      requiresMask: requiredLayers.includes('mask'),
      requiresBodyVariant: requiredLayers.includes('bodyVariant') || config?.renderStages.includes('body-variant') === true,
      requiresPoseVariant: config?.requiresPoseVariant === true,
      assetStatus,
      implementationStatus,
      visualVerificationStatus: assetStatus === 'ready' ? 'needs-review' : 'not-ready',
      notes: config?.unsupportedReason ?? (compatible ? '需角色專用透明穿戴資產。' : '此角色尚未建立相容穿戴資產。'),
    };
  }));
}
