export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'conflict' | 'failed';

export interface SyncEntity {
  id: string;
  organizationId: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deviceId: string;
  operationId: string;
  syncStatus: SyncStatus;
}

export type MembershipRole = 'owner' | 'admin' | 'accountant' | 'viewer' | 'foster_farmer';

export interface Organization extends SyncEntity {
  name: string;
  archivedAt: string | null;
}

export interface OrganizationMembership extends SyncEntity {
  userId: string;
  role: MembershipRole;
  active: boolean;
}

export type HouseSpecies = 'red_feather' | 'black_feather' | 'broiler' | 'layer' | 'other';

export interface ChickenHouse extends SyncEntity {
  name: string;
  species: HouseSpecies;
  designCapacity: number;
  currentBirdCount: number;
  fosterFarmerId: string | null;
  archivedAt: string | null;
}

export interface FosterFarmer extends SyncEntity {
  displayName: string;
  phoneLastFour: string | null;
  notes: string;
}

export type BatchStatus = 'draft' | 'active' | 'ready_for_sale' | 'settled' | 'cancelled';

export interface FlockBatch extends SyncEntity {
  chickenHouseId: string;
  batchCode: string;
  species: HouseSpecies;
  placedCount: number;
  currentCount: number;
  placementDate: string;
  expectedSaleDate: string | null;
  status: BatchStatus;
}

export interface Shareholder extends SyncEntity {
  displayName: string;
  referenceCode: string;
  archivedAt: string | null;
}

export interface Shareholding extends SyncEntity {
  chickenHouseId: string;
  shareholderId: string;
  ownershipBasisPoints: number;
  profitShareBasisPoints: number;
  lossShareBasisPoints: number;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export type DistributionStatus = 'draft' | 'confirmed' | 'partially_paid' | 'paid' | 'reversed';

export interface DistributionEntry extends SyncEntity {
  distributionRecordId: string;
  shareholderId: string;
  allocatedAmountTwd: number;
  paidAmountTwd: number;
  adjustmentAmountTwd: number;
}

export interface DistributionRecord extends SyncEntity {
  chickenHouseId: string;
  batchId: string | null;
  periodLabel: string;
  totalAmountTwd: number;
  status: DistributionStatus;
  confirmedAt: string | null;
  paidAt: string | null;
  reversedAt: string | null;
  reversalOfId: string | null;
  entries: DistributionEntry[];
}

export type RiskDimension = 'man' | 'machine' | 'material' | 'method' | 'measurement' | 'environment';

export interface RiskAnswer {
  questionId: string;
  dimension: RiskDimension;
  score: number | null;
  note: string;
}

export interface RiskAssessment extends SyncEntity {
  chickenHouseId: string;
  modelVersion: string;
  dimensionScores: Record<RiskDimension, number | null>;
  dimensionWeights: Record<RiskDimension, number>;
  completenessBasisPoints: number;
  finalScore: number | null;
  assessedAt: string;
  notes: string;
  answers: RiskAnswer[];
}

export interface MapPlacement extends SyncEntity {
  chickenHouseId: string;
  plotId: string;
  xBasisPoints: number;
  yBasisPoints: number;
}

export interface AuditEvent extends SyncEntity {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeHash: string | null;
  afterHash: string | null;
  occurredAt: string;
}

export type EquipmentSlot = 'head' | 'body' | 'hand' | 'back';

export type ItemUsage = 'wearable' | 'handheld' | 'collectible' | 'appearance-only' | 'pose-variant' | 'unsupported';

export type WearableAssetStatus = 'ready' | 'missing' | 'unsupported';

export type WearableFallbackBehavior = 'hide' | 'show-unsupported';

export type WearableRenderStage =
  | 'character-back-effect'
  | 'back-equipment'
  | 'cape-back'
  | 'backpack-back'
  | 'base-character'
  | 'body-variant'
  | 'inner-clothing'
  | 'torso-clothing'
  | 'waist-equipment'
  | 'front-straps'
  | 'handheld-back'
  | 'character-arm'
  | 'hand-mask'
  | 'handheld-main'
  | 'handheld-front'
  | 'neck-accessory'
  | 'chest-accessory'
  | 'head-equipment-back'
  | 'character-hair-or-face'
  | 'head-equipment-front'
  | 'foreground-effect';

export interface WearableAssetConfig {
  itemId: string;
  usageType: ItemUsage;
  slot: EquipmentSlot | null;
  wearable: boolean;
  compatibleCharacterIds: AvatarId[];
  hand?: 'left' | 'right';
  layerFiles: Partial<Record<'back' | 'main' | 'front' | 'mask' | 'bodyVariant', string>>;
  renderStages: WearableRenderStage[];
  hidesBaseParts?: string[];
  replacesBaseParts?: string[];
  conflictsWithSlots?: EquipmentSlot[];
  conflictsWithItems?: string[];
  requiresPoseVariant?: boolean;
  poseVariantId?: string;
  assetStatus: WearableAssetStatus;
  fallbackBehavior: WearableFallbackBehavior;
  unsupportedReason?: string;
}

export interface WearableLayerFile {
  itemId: string;
  stage: WearableRenderStage;
  file: string;
}

export interface WardrobeMatrixEntry {
  characterId: AvatarId;
  characterName: string;
  itemId: string;
  itemName: string;
  usageType: ItemUsage;
  slot: EquipmentSlot | null;
  wearable: boolean;
  compatible: boolean;
  requiredLayers: string[];
  requiresMask: boolean;
  requiresBodyVariant: boolean;
  requiresPoseVariant: boolean;
  assetStatus: WearableAssetStatus;
  implementationStatus: 'program-wired' | 'manifest-only' | 'blocked-by-art' | 'art-ready';
  visualVerificationStatus: 'not-ready' | 'needs-review' | 'verified';
  notes: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  requiredVisitDays: number;
  description: string;
  assetAtlas: 'original' | 'chronicle';
  assetColumn: number;
  assetRow: number;
  assetColumns: number;
  assetRows: number;
}

export type AvatarId = 'caretaker-male' | 'caretaker-female' | 'manager-male' | 'manager-female';

export interface AvatarOption {
  id: AvatarId;
  name: string;
  title: string;
  description: string;
  atlasColumn: number;
}

export interface VisitProgress {
  accumulatedDays: number;
  streakDays: number;
  lastVisitDate: string | null;
  equipped: Partial<Record<EquipmentSlot, string>>;
  avatarId: AvatarId;
}
