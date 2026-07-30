import { describe, expect, it } from 'vitest';
import { allocateIntegerTwd, capacityTier, calculateRisk, confirmDistribution, equipmentItems, recordDistributionPayment, recordVisit, SQLITE_MIGRATIONS, validateShareholdings, visibleEquippedItems, wardrobeRenderStages, wardrobeUnavailableReason, wearableAssetConfigs } from './index';
import { demoShareholdings } from './fixtures';
import type { DistributionRecord, RiskAnswer, RiskDimension } from './types';

describe('capacity tier', () => {
  it.each([[1, 'single'], [10_000, 'single'], [10_001, 'double'], [29_999, 'double'], [30_000, 'triple']])('%i -> %s', (capacity, expected) => {
    expect(capacityTier(capacity)).toBe(expected);
  });
});

describe('integer finance', () => {
  it('allocates every dollar deterministically', () => {
    expect(allocateIntegerTwd(101, [{ id: 'b', basisPoints: 5_000 }, { id: 'a', basisPoints: 5_000 }])).toEqual({ a: 51, b: 50 });
  });

  it('keeps ownership, profit and loss totals independently valid', () => {
    expect(() => validateShareholdings(demoShareholdings)).not.toThrow();
  });

  it('locks a confirmed distribution and records partial then full payment', () => {
    const base = {
      id: 'distribution-1', organizationId: 'org', revision: 1, createdAt: '2026-07-01', updatedAt: '2026-07-01', deletedAt: null,
      deviceId: 'device', operationId: 'operation', syncStatus: 'pending' as const, chickenHouseId: 'house', batchId: null,
      periodLabel: '2026 Q2', totalAmountTwd: 100, status: 'draft' as const, confirmedAt: null, paidAt: null, reversedAt: null, reversalOfId: null,
      entries: [{ id: 'entry-1', organizationId: 'org', revision: 1, createdAt: '2026-07-01', updatedAt: '2026-07-01', deletedAt: null, deviceId: 'device', operationId: 'operation-entry', syncStatus: 'pending' as const, distributionRecordId: 'distribution-1', shareholderId: 'holder', allocatedAmountTwd: 100, paidAmountTwd: 0, adjustmentAmountTwd: 0 }],
    } satisfies DistributionRecord;
    const confirmed = confirmDistribution(base, '2026-07-02');
    expect(() => confirmDistribution(confirmed, '2026-07-03')).toThrow();
    expect(recordDistributionPayment(confirmed, 'entry-1', 60, '2026-07-03').status).toBe('partially_paid');
    const partial = recordDistributionPayment(confirmed, 'entry-1', 60, '2026-07-03');
    expect(recordDistributionPayment(partial, 'entry-1', 40, '2026-07-04').status).toBe('paid');
  });
});

describe('5M1E risk', () => {
  it('preserves raw completeness and renormalizes available weights', () => {
    const dimensions: RiskDimension[] = ['man', 'machine', 'material', 'method', 'measurement', 'environment'];
    const answers: RiskAnswer[] = dimensions.map((dimension, index) => ({ questionId: `${index}`, dimension, score: index === 5 ? null : 20 + index * 10, note: '' }));
    const result = calculateRisk(answers, { man: 1_700, machine: 1_700, material: 1_700, method: 1_700, measurement: 1_600, environment: 1_600 });
    expect(result.completenessBasisPoints).toBe(8_333);
    expect(result.finalScore).toBe(40);
    expect(result.level).toBe('moderate');
  });
});

describe('daily visit', () => {
  it('does not duplicate same-day visits and preserves accumulated days after a break', () => {
    const start = { accumulatedDays: 5, streakDays: 3, lastVisitDate: '2026-07-20', equipped: {}, avatarId: 'manager-male' as const };
    const afterBreak = recordVisit(start, '2026-07-23');
    expect(afterBreak).toMatchObject({ accumulatedDays: 6, streakDays: 1 });
    expect(recordVisit(afterBreak, '2026-07-23')).toEqual(afterBreak);
  });

  it('counts three distinct dates exactly once and exposes twenty-four cosmetic rewards', () => {
    const first = recordVisit({ accumulatedDays: 0, streakDays: 0, lastVisitDate: null, equipped: {}, avatarId: 'manager-male' }, '2026-07-22');
    const duplicate = recordVisit(first, '2026-07-22');
    const second = recordVisit(duplicate, '2026-07-23');
    const third = recordVisit(second, '2026-07-24');
    expect(duplicate).toEqual(first);
    expect(third).toMatchObject({ accumulatedDays: 3, streakDays: 3, lastVisitDate: '2026-07-24' });
    expect(equipmentItems).toHaveLength(24);
    expect(new Set(equipmentItems.map((item) => item.id)).size).toBe(24);
    expect(equipmentItems.filter((item) => item.requiredVisitDays >= 5)).toHaveLength(20);
    expect(equipmentItems.every((item) => ['head', 'body', 'hand', 'back'].includes(item.slot))).toBe(true);
  });

  it('keeps catalogue art separate from missing character-specific wearable assets', () => {
    expect(wearableAssetConfigs).toHaveLength(equipmentItems.length);
    expect(new Set(wearableAssetConfigs.map((config) => config.itemId))).toEqual(new Set(equipmentItems.map((item) => item.id)));
    const layerFiles = wearableAssetConfigs.flatMap((config) => Object.values(config.layerFiles));
    expect(layerFiles.every((file) => !file.includes('/equipment/atlas.png') && !file.includes('/equipment/original-atlas.png'))).toBe(true);
    expect(wardrobeRenderStages.indexOf('backpack-back')).toBeLessThan(wardrobeRenderStages.indexOf('base-character'));
    expect(wardrobeRenderStages.indexOf('base-character')).toBeLessThan(wardrobeRenderStages.indexOf('front-straps'));
    expect(wardrobeUnavailableReason('feed-scoop', 'manager-male')).toMatch(/握持/);
    expect(visibleEquippedItems({ head: 'straw-hat', body: 'work-jacket', hand: 'feed-scoop', back: 'field-pack' }, 'manager-male')).toEqual([]);
  });
});

describe('local database migrations', () => {
  it('adds normalized operation tables without destructive statements', () => {
    expect(SQLITE_MIGRATIONS.at(-1)?.version).toBe(4);
    const sql = SQLITE_MIGRATIONS.flatMap((migration) => migration.statements).join('\n').toLowerCase();
    for (const table of ['organizations', 'organization_memberships', 'distribution_entries', 'risk_answers', 'foster_farmers']) expect(sql).toContain(`create table if not exists ${table}`);
    expect(sql).not.toMatch(/\bdrop\s+table\b|\bdelete\s+from\b/);
  });
});
