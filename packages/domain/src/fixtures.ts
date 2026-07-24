import type { ChickenHouse, EquipmentItem, FlockBatch, Shareholding, Shareholder, VisitProgress } from './types';

const common = {
  organizationId: 'org-demo',
  revision: 1,
  createdAt: '2026-07-01T08:00:00.000Z',
  updatedAt: '2026-07-23T08:00:00.000Z',
  deletedAt: null,
  deviceId: 'fixture-device',
  operationId: 'fixture-operation',
  syncStatus: 'synced' as const,
};

export const demoHouses: ChickenHouse[] = [
  { ...common, id: 'house-river', name: '溪畔一號舍', species: 'red_feather', designCapacity: 9_600, currentBirdCount: 8_842, fosterFarmerId: 'farmer-lin', archivedAt: null },
  { ...common, id: 'house-sunrise', name: '朝日二號舍', species: 'broiler', designCapacity: 24_000, currentBirdCount: 22_410, fosterFarmerId: 'farmer-chen', archivedAt: null },
  { ...common, id: 'house-hill', name: '青嶺三號舍', species: 'black_feather', designCapacity: 36_000, currentBirdCount: 32_706, fosterFarmerId: 'farmer-wu', archivedAt: null },
];

export const demoBatch: FlockBatch = {
  ...common,
  id: 'batch-river-2026-04',
  chickenHouseId: 'house-river',
  batchCode: 'RV-2604',
  species: 'red_feather',
  placedCount: 9_400,
  currentCount: 8_842,
  placementDate: '2026-04-20',
  expectedSaleDate: '2026-08-06',
  status: 'active',
};

export const demoShareholders: Shareholder[] = [
  { ...common, id: 'holder-self', displayName: '我', referenceCode: 'SH-001', archivedAt: null },
  { ...common, id: 'holder-partner', displayName: '合作股東 A', referenceCode: 'SH-002', archivedAt: null },
];

export const demoShareholdings: Shareholding[] = [
  { ...common, id: 'holding-self', chickenHouseId: 'house-river', shareholderId: 'holder-self', ownershipBasisPoints: 4_000, profitShareBasisPoints: 4_500, lossShareBasisPoints: 4_000, effectiveFrom: '2026-01-01', effectiveTo: null },
  { ...common, id: 'holding-partner', chickenHouseId: 'house-river', shareholderId: 'holder-partner', ownershipBasisPoints: 6_000, profitShareBasisPoints: 5_500, lossShareBasisPoints: 6_000, effectiveFrom: '2026-01-01', effectiveTo: null },
];

export const equipmentItems: EquipmentItem[] = [
  { id: 'straw-hat', name: '晨巡草帽', slot: 'head', requiredVisitDays: 1, description: '第一趟巡村的紀念。' },
  { id: 'work-jacket', name: '青綠工作外套', slot: 'body', requiredVisitDays: 3, description: '耐用、醒目，不改變任何功能數值。' },
  { id: 'feed-scoop', name: '黃銅飼料勺', slot: 'hand', requiredVisitDays: 7, description: '只改變外觀的巡舍工具。' },
  { id: 'field-pack', name: '田野背包', slot: 'back', requiredVisitDays: 14, description: '收納巡查筆記的外觀裝備。' },
];

export const initialVisitProgress: VisitProgress = {
  accumulatedDays: 6,
  streakDays: 3,
  lastVisitDate: '2026-07-23',
  equipped: { head: 'straw-hat', body: 'work-jacket' },
};

