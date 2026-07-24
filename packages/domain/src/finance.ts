import type { DistributionEntry, DistributionRecord, Shareholding } from './types';

export const FULL_OWNERSHIP_BASIS_POINTS = 10_000;

export function assertIntegerMoney(amountTwd: number): void {
  if (!Number.isSafeInteger(amountTwd)) {
    throw new Error('TWD amount must be a safe integer');
  }
}

export function assertBasisPoints(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > FULL_OWNERSHIP_BASIS_POINTS) {
    throw new Error('Basis points must be an integer between 0 and 10000');
  }
}

export function validateShareholdings(holdings: Shareholding[]): void {
  const fields: Array<keyof Pick<Shareholding, 'ownershipBasisPoints' | 'profitShareBasisPoints' | 'lossShareBasisPoints'>> = [
    'ownershipBasisPoints',
    'profitShareBasisPoints',
    'lossShareBasisPoints',
  ];

  for (const field of fields) {
    const total = holdings.reduce((sum, holding) => {
      assertBasisPoints(holding[field]);
      return sum + holding[field];
    }, 0);
    if (total !== FULL_OWNERSHIP_BASIS_POINTS) {
      throw new Error(`${field} must sum to 10000 basis points`);
    }
  }
}

export interface AllocationInput {
  id: string;
  basisPoints: number;
}

export function allocateIntegerTwd(totalAmountTwd: number, allocations: AllocationInput[]): Record<string, number> {
  assertIntegerMoney(totalAmountTwd);
  const basisPointTotal = allocations.reduce((sum, allocation) => {
    assertBasisPoints(allocation.basisPoints);
    return sum + allocation.basisPoints;
  }, 0);
  if (basisPointTotal !== FULL_OWNERSHIP_BASIS_POINTS) {
    throw new Error('Allocations must sum to 10000 basis points');
  }

  const sign = totalAmountTwd < 0 ? -1 : 1;
  const absoluteTotal = Math.abs(totalAmountTwd);
  const rows = allocations.map((allocation) => {
    const numerator = absoluteTotal * allocation.basisPoints;
    return {
      id: allocation.id,
      amount: Math.floor(numerator / FULL_OWNERSHIP_BASIS_POINTS),
      remainder: numerator % FULL_OWNERSHIP_BASIS_POINTS,
    };
  });
  let unallocated = absoluteTotal - rows.reduce((sum, row) => sum + row.amount, 0);
  rows.sort((a, b) => b.remainder - a.remainder || a.id.localeCompare(b.id));
  for (const row of rows) {
    if (unallocated <= 0) break;
    row.amount += 1;
    unallocated -= 1;
  }
  return Object.fromEntries(rows.map((row) => [row.id, row.amount * sign]));
}

export function confirmDistribution(record: DistributionRecord, confirmedAt: string): DistributionRecord {
  if (record.status !== 'draft') throw new Error('Only draft distributions can be confirmed');
  assertIntegerMoney(record.totalAmountTwd);
  if (record.entries.reduce((sum, entry) => sum + entry.allocatedAmountTwd, 0) !== record.totalAmountTwd) {
    throw new Error('Distribution entries must equal the total amount');
  }
  return { ...record, status: 'confirmed', confirmedAt, revision: record.revision + 1, updatedAt: confirmedAt };
}

export function recordDistributionPayment(
  record: DistributionRecord,
  entryId: string,
  paymentTwd: number,
  paidAt: string,
): DistributionRecord {
  if (!['confirmed', 'partially_paid'].includes(record.status)) {
    throw new Error('Payments require a confirmed distribution');
  }
  if (!Number.isSafeInteger(paymentTwd) || paymentTwd <= 0) throw new Error('Payment must be a positive integer');
  let found = false;
  const entries: DistributionEntry[] = record.entries.map((entry) => {
    if (entry.id !== entryId) return entry;
    found = true;
    const paidAmountTwd = entry.paidAmountTwd + paymentTwd;
    const due = entry.allocatedAmountTwd + entry.adjustmentAmountTwd;
    if (paidAmountTwd > due) throw new Error('Payment exceeds entry amount');
    return { ...entry, paidAmountTwd, revision: entry.revision + 1, updatedAt: paidAt };
  });
  if (!found) throw new Error('Distribution entry not found');
  const fullyPaid = entries.every((entry) => entry.paidAmountTwd === entry.allocatedAmountTwd + entry.adjustmentAmountTwd);
  return {
    ...record,
    entries,
    status: fullyPaid ? 'paid' : 'partially_paid',
    paidAt: fullyPaid ? paidAt : null,
    revision: record.revision + 1,
    updatedAt: paidAt,
  };
}

export function reverseDistribution(record: DistributionRecord, reversal: DistributionRecord, reversedAt: string): DistributionRecord {
  if (!['confirmed', 'partially_paid', 'paid'].includes(record.status)) {
    throw new Error('Only confirmed or paid distributions can be reversed');
  }
  if (reversal.reversalOfId !== record.id || reversal.totalAmountTwd !== -record.totalAmountTwd) {
    throw new Error('Reversal must reference and negate the original distribution');
  }
  return { ...record, status: 'reversed', reversedAt, revision: record.revision + 1, updatedAt: reversedAt };
}

