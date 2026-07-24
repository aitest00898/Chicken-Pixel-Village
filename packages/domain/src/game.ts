import type { EquipmentItem, VisitProgress } from './types';

export type CapacityTier = 'single' | 'double' | 'triple';

export function capacityTier(designCapacity: number): CapacityTier {
  if (!Number.isSafeInteger(designCapacity) || designCapacity < 1) throw new Error('Design capacity must be a positive integer');
  if (designCapacity <= 10_000) return 'single';
  if (designCapacity <= 29_999) return 'double';
  return 'triple';
}

function isoDateDaysApart(a: string, b: string): number {
  const aMs = Date.parse(`${a}T00:00:00Z`);
  const bMs = Date.parse(`${b}T00:00:00Z`);
  if (!Number.isFinite(aMs) || !Number.isFinite(bMs)) throw new Error('Visit date must use YYYY-MM-DD');
  return Math.round((bMs - aMs) / 86_400_000);
}

export function recordVisit(progress: VisitProgress, visitDate: string): VisitProgress {
  if (progress.lastVisitDate === visitDate) return progress;
  const consecutive = progress.lastVisitDate !== null && isoDateDaysApart(progress.lastVisitDate, visitDate) === 1;
  return {
    ...progress,
    accumulatedDays: progress.accumulatedDays + 1,
    streakDays: consecutive ? progress.streakDays + 1 : 1,
    lastVisitDate: visitDate,
  };
}

export function unlockedEquipment(items: EquipmentItem[], accumulatedDays: number): EquipmentItem[] {
  return items.filter((item) => accumulatedDays >= item.requiredVisitDays);
}

