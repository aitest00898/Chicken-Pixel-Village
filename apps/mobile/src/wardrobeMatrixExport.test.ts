import exportedMatrix from '../../../docs/generated/wardrobe-matrix.json';
import { wardrobeMatrixEntries } from '@chicken-village/domain';
import { describe, expect, it } from 'vitest';

describe('exported wardrobe matrix', () => {
  it('matches the domain runtime matrix used by wardrobe rendering and validation', () => {
    expect(exportedMatrix).toEqual(wardrobeMatrixEntries());
    expect(exportedMatrix).toHaveLength(96);
    expect(exportedMatrix).toContainEqual(expect.objectContaining({
      characterId: 'manager-male',
      itemId: 'straw-hat',
      implementationStatus: 'art-ready',
      visualVerificationStatus: 'needs-review',
    }));
    expect(exportedMatrix).toContainEqual(expect.objectContaining({
      characterId: 'caretaker-male',
      itemId: 'straw-hat',
      compatible: false,
      assetStatus: 'missing',
      implementationStatus: 'manifest-only',
    }));
  });
});
