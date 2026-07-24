import { describe, expect, it } from 'vitest';
import { allocateIntegerTwd, capacityTier, calculateRisk, confirmDistribution, recordDistributionPayment, recordVisit, validateShareholdings } from './index';
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
    const start = { accumulatedDays: 5, streakDays: 3, lastVisitDate: '2026-07-20', equipped: {} };
    const afterBreak = recordVisit(start, '2026-07-23');
    expect(afterBreak).toMatchObject({ accumulatedDays: 6, streakDays: 1 });
    expect(recordVisit(afterBreak, '2026-07-23')).toEqual(afterBreak);
  });
});

