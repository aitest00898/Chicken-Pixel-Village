import type { AvatarOption, ChickenHouse, DistributionRecord, EquipmentItem, FlockBatch, FosterFarmer, MapPlacement, Organization, OrganizationMembership, RiskAssessment, Shareholding, Shareholder, VisitProgress } from './types';

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

export const demoOrganizations: Organization[] = [{ ...common, id: 'org-demo', name: '像素村示範組織', archivedAt: null }];
export const demoMemberships: OrganizationMembership[] = [{ ...common, id: 'membership-owner', userId: 'local-owner', role: 'owner', active: true }];
export const demoFosterFarmers: FosterFarmer[] = [
  { ...common, id: 'farmer-lin', displayName: '林場主', phoneLastFour: null, notes: '溪畔一號舍合作飼養戶' },
  { ...common, id: 'farmer-chen', displayName: '陳場主', phoneLastFour: null, notes: '朝日二號舍合作飼養戶' },
  { ...common, id: 'farmer-wu', displayName: '吳場主', phoneLastFour: null, notes: '青嶺三號舍合作飼養戶' },
];

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

export const demoDistributions: DistributionRecord[] = [{
  ...common,
  id: 'distribution-river-2026-q2',
  chickenHouseId: 'house-river',
  batchId: 'batch-river-2026-04',
  periodLabel: '2026 Q2 預分配',
  totalAmountTwd: 120_000,
  status: 'confirmed',
  confirmedAt: '2026-07-20T08:00:00.000Z',
  paidAt: null,
  reversedAt: null,
  reversalOfId: null,
  entries: [
    { ...common, id: 'distribution-entry-self', distributionRecordId: 'distribution-river-2026-q2', shareholderId: 'holder-self', allocatedAmountTwd: 54_000, paidAmountTwd: 54_000, adjustmentAmountTwd: 0 },
    { ...common, id: 'distribution-entry-partner', distributionRecordId: 'distribution-river-2026-q2', shareholderId: 'holder-partner', allocatedAmountTwd: 66_000, paidAmountTwd: 0, adjustmentAmountTwd: 0 },
  ],
}];

const riskWeights = { man: 1_700, machine: 1_600, material: 1_700, method: 1_700, measurement: 1_600, environment: 1_700 } as const;

export const demoRiskAssessments: RiskAssessment[] = [{
  ...common,
  id: 'risk-river-2026-07',
  chickenHouseId: 'house-river',
  modelVersion: '5m1e-v1',
  dimensionScores: { man: 25, machine: 30, material: 35, method: 30, measurement: 35, environment: 32 },
  dimensionWeights: riskWeights,
  completenessBasisPoints: 10_000,
  finalScore: 31,
  assessedAt: '2026-07-23T08:00:00.000Z',
  notes: '雨季通風與墊料需持續觀察。',
  answers: [
    { questionId: 'man', dimension: 'man', score: 25, note: '' },
    { questionId: 'machine', dimension: 'machine', score: 30, note: '' },
    { questionId: 'material', dimension: 'material', score: 35, note: '' },
    { questionId: 'method', dimension: 'method', score: 30, note: '' },
    { questionId: 'measurement', dimension: 'measurement', score: 35, note: '' },
    { questionId: 'environment', dimension: 'environment', score: 32, note: '' },
  ],
}];

export const demoMapPlacements: MapPlacement[] = demoHouses.map((house, index) => ({
  ...common,
  id: `placement-${house.id}`,
  chickenHouseId: house.id,
  plotId: `plot-${index + 1}`,
  xBasisPoints: [1_500, 4_200, 7_000][index] ?? 5_000,
  yBasisPoints: 6_900,
}));

export const equipmentItems: EquipmentItem[] = [
  { id: 'straw-hat', name: '晨巡草帽', slot: 'head', requiredVisitDays: 1, description: '第一趟巡村的紀念。', assetAtlas: 'original', assetColumn: 0, assetRow: 0, assetColumns: 2, assetRows: 2 },
  { id: 'work-jacket', name: '霧綠工作外套', slot: 'body', requiredVisitDays: 2, description: '耐用的日常巡舍外套。', assetAtlas: 'original', assetColumn: 1, assetRow: 0, assetColumns: 2, assetRows: 2 },
  { id: 'feed-scoop', name: '舊銅飼料勺', slot: 'hand', requiredVisitDays: 3, description: '留下長年使用痕跡的飼料勺。', assetAtlas: 'original', assetColumn: 0, assetRow: 1, assetColumns: 2, assetRows: 2 },
  { id: 'field-pack', name: '田野背包', slot: 'back', requiredVisitDays: 4, description: '收納巡查筆記的外觀裝備。', assetAtlas: 'original', assetColumn: 1, assetRow: 1, assetColumns: 2, assetRows: 2 },
  { id: 'granary-hat', name: '穀倉織帽', slot: 'head', requiredVisitDays: 5, description: '穀倉值勤者常戴的寬沿帽。', assetAtlas: 'chronicle', assetColumn: 0, assetRow: 0, assetColumns: 5, assetRows: 4 },
  { id: 'patrol-cap', name: '墨藍巡查帽', slot: 'head', requiredVisitDays: 6, description: '巡查員的低調識別帽。', assetAtlas: 'chronicle', assetColumn: 1, assetRow: 0, assetColumns: 5, assetRows: 4 },
  { id: 'scholar-beret', name: '羽筆學士帽', slot: 'head', requiredVisitDays: 7, description: '記錄公會文獻時佩戴。', assetAtlas: 'chronicle', assetColumn: 2, assetRow: 0, assetColumns: 5, assetRows: 4 },
  { id: 'weather-hood', name: '風雨皮革兜帽', slot: 'head', requiredVisitDays: 8, description: '陰雨巡舍用的舊皮兜帽。', assetAtlas: 'chronicle', assetColumn: 3, assetRow: 0, assetColumns: 5, assetRows: 4 },
  { id: 'guild-circlet', name: '舊金公會額環', slot: 'head', requiredVisitDays: 9, description: '只代表資歷，不提供加成。', assetAtlas: 'chronicle', assetColumn: 4, assetRow: 0, assetColumns: 5, assetRows: 4 },
  { id: 'fog-work-coat', name: '霧綠巡舍長衣', slot: 'body', requiredVisitDays: 10, description: '低彩度耐磨長衣。', assetAtlas: 'chronicle', assetColumn: 0, assetRow: 1, assetColumns: 5, assetRows: 4 },
  { id: 'ledger-vest', name: '棕褐帳房背心', slot: 'body', requiredVisitDays: 11, description: '附有小型帳冊袋的背心。', assetAtlas: 'chronicle', assetColumn: 1, assetRow: 1, assetColumns: 5, assetRows: 4 },
  { id: 'rain-mantle', name: '灰藍雨巡披肩', slot: 'body', requiredVisitDays: 12, description: '薄霧與細雨中的巡查披肩。', assetAtlas: 'chronicle', assetColumn: 2, assetRow: 1, assetColumns: 5, assetRows: 4 },
  { id: 'hatchery-apron', name: '孵化師亞麻圍裙', slot: 'body', requiredVisitDays: 13, description: '照護蛋盤時使用的工作圍裙。', assetAtlas: 'chronicle', assetColumn: 3, assetRow: 1, assetColumns: 5, assetRows: 4 },
  { id: 'guild-coat', name: '酒紅公會長衣', slot: 'body', requiredVisitDays: 14, description: '重要公報日使用的正式長衣。', assetAtlas: 'chronicle', assetColumn: 4, assetRow: 1, assetColumns: 5, assetRows: 4 },
  { id: 'brass-scoop', name: '黃銅量穀勺', slot: 'hand', requiredVisitDays: 15, description: '量取飼料穀粒的舊銅工具。', assetAtlas: 'chronicle', assetColumn: 0, assetRow: 2, assetColumns: 5, assetRows: 4 },
  { id: 'quill-ledger', name: '羽筆巡查帳冊', slot: 'hand', requiredVisitDays: 16, description: '記下雞舍巡查結果。', assetAtlas: 'chronicle', assetColumn: 1, assetRow: 2, assetColumns: 5, assetRows: 4 },
  { id: 'inspection-lantern', name: '夜巡提燈', slot: 'hand', requiredVisitDays: 17, description: '夜間巡視舍況的提燈。', assetAtlas: 'chronicle', assetColumn: 2, assetRow: 2, assetColumns: 5, assetRows: 4 },
  { id: 'measuring-rod', name: '木製丈量尺', slot: 'hand', requiredVisitDays: 18, description: '檢查設施間距的丈量尺。', assetAtlas: 'chronicle', assetColumn: 3, assetRow: 2, assetColumns: 5, assetRows: 4 },
  { id: 'market-scroll', name: '商會行情卷', slot: 'hand', requiredVisitDays: 19, description: '保存當日土雞行情的卷宗。', assetAtlas: 'chronicle', assetColumn: 4, assetRow: 2, assetColumns: 5, assetRows: 4 },
  { id: 'ledger-satchel', name: '皮革帳冊袋', slot: 'back', requiredVisitDays: 20, description: '攜帶契約與帳冊的肩袋。', assetAtlas: 'chronicle', assetColumn: 0, assetRow: 3, assetColumns: 5, assetRows: 4 },
  { id: 'wheat-pack', name: '麥穗補給架', slot: 'back', requiredVisitDays: 21, description: '代表飼糧與收成的補給架。', assetAtlas: 'chronicle', assetColumn: 1, assetRow: 3, assetColumns: 5, assetRows: 4 },
  { id: 'guild-banner', name: '折疊公會旗', slot: 'back', requiredVisitDays: 22, description: '巡村典禮使用的舊旗。', assetAtlas: 'chronicle', assetColumn: 2, assetRow: 3, assetColumns: 5, assetRows: 4 },
  { id: 'tool-frame', name: '繩索工具架', slot: 'back', requiredVisitDays: 23, description: '收納修繕器具的木架。', assetAtlas: 'chronicle', assetColumn: 3, assetRow: 3, assetColumns: 5, assetRows: 4 },
  { id: 'travel-cloak', name: '灰藍旅行披風', slot: 'back', requiredVisitDays: 24, description: '前往遠場巡查時攜帶。', assetAtlas: 'chronicle', assetColumn: 4, assetRow: 3, assetColumns: 5, assetRows: 4 },
];

export const avatarOptions: AvatarOption[] = [
  { id: 'caretaker-male', name: '托爾・麥斯頓', title: '契約農戶', description: '負責飼料調配與雞舍日常管理的中堅力量。', atlasColumn: 0 },
  { id: 'caretaker-female', name: '艾瑪・布魯克', title: '契約農戶', description: '溫柔細心，守護雞群與契約收成。', atlasColumn: 1 },
  { id: 'manager-male', name: '海登', title: '村務經理', description: '以帳冊、羽筆與巡查紀錄管理村莊營運。', atlasColumn: 2 },
  { id: 'manager-female', name: '艾琳', title: '經營經理', description: '統整營運紀錄，確保每顆蛋都有價值。', atlasColumn: 3 },
];

export const initialVisitProgress: VisitProgress = {
  accumulatedDays: 0,
  streakDays: 0,
  lastVisitDate: null,
  equipped: {},
  avatarId: 'manager-male',
};
