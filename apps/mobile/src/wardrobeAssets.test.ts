import { wearableAssetConfigs } from '@chicken-village/domain';
import { describe, expect, it } from 'vitest';

const wearableFiles = import.meta.glob('../../public/assets/art/vanadis/equipment/wearable/**/*', {
  query: '?url',
  import: 'default',
});

function publicAssetToGlobKey(file: string): string {
  return `../../public/${file}`;
}

describe('wardrobe wearable assets', () => {
  it('requires ready wearable layers to be real character-specific public assets', () => {
    const availableFiles = new Set(Object.keys(wearableFiles));
    const readyConfigs = wearableAssetConfigs.filter((config) => config.assetStatus === 'ready');
    for (const config of readyConfigs) {
      expect(config.layerFiles, `${config.itemId} should not be marked ready without layer files`).not.toEqual({});
      for (const [layerType, file] of Object.entries(config.layerFiles)) {
        expect(file, `${config.itemId}:${layerType} should use a character-specific wearable path`).toContain('/equipment/wearable/');
        expect(availableFiles.has(publicAssetToGlobKey(file)), `${config.itemId}:${layerType} missing ${file}`).toBe(true);
      }
    }
  });
});
