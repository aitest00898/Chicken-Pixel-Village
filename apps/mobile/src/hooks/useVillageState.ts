import {
  allocateIntegerTwd,
  calculateRisk,
  confirmDistribution,
  demoBatch,
  demoDistributions,
  demoFosterFarmers,
  demoHouses,
  demoMapPlacements,
  demoMemberships,
  demoOrganizations,
  demoRiskAssessments,
  demoShareholders,
  demoShareholdings,
  initialVisitProgress,
  recordDistributionPayment,
  recordVisit,
  reverseDistribution,
  type AuditEvent,
  type ChickenHouse,
  type DistributionRecord,
  type FlockBatch,
  type MapPlacement,
  type RiskAnswer,
  type RiskAssessment,
  type RiskDimension,
  type Shareholder,
  type Shareholding,
  type SyncEntity,
  type VisitProgress,
} from '@chicken-village/domain';
import { applyPushResult, makeIdempotencyKey, startSync, type EntitySensitivity, type OutboxOperation } from '@chicken-village/sync';
import { Capacitor } from '@capacitor/core';
import { get, set } from 'idb-keyval';
import { useCallback, useEffect, useState } from 'react';
import type { VillageOperations } from '../storage/types';
import { syncPrivateHouses } from '../services/privateSync';

const HOUSES_KEY = 'cpv:cache:houses:v1';
const VISIT_KEY = 'cpv:draft:visit:v1';
const OPERATIONS_KEY = 'cpv:operations:v1';
const ORGANIZATION_ID = 'org-demo';
const DEVICE_ID = 'local-device';

const initialOperations: VillageOperations = {
  organizations: demoOrganizations, memberships: demoMemberships, fosterFarmers: demoFosterFarmers,
  batches: [demoBatch], shareholders: demoShareholders, shareholdings: demoShareholdings,
  distributions: demoDistributions, riskAssessments: demoRiskAssessments,
  mapPlacements: demoMapPlacements, auditEvents: [], outbox: [],
};

interface VillagePersistence {
  loadHouses(): Promise<ChickenHouse[]>;
  saveHouses(houses: ChickenHouse[]): Promise<void>;
  loadVisitProgress(): Promise<VisitProgress | null>;
  saveVisitProgress(progress: VisitProgress): Promise<void>;
  loadOperations(): Promise<VillageOperations | null>;
  saveOperations(operations: VillageOperations): Promise<void>;
  close(): Promise<void>;
}

const webPersistence: VillagePersistence = {
  async loadHouses() { return (await get<ChickenHouse[]>(HOUSES_KEY)) ?? []; },
  async saveHouses(houses) { await set(HOUSES_KEY, houses); },
  async loadVisitProgress() { return (await get<VisitProgress>(VISIT_KEY)) ?? null; },
  async saveVisitProgress(progress) { await set(VISIT_KEY, progress); },
  async loadOperations() { return (await get<VillageOperations>(OPERATIONS_KEY)) ?? null; },
  async saveOperations(operations) { await set(OPERATIONS_KEY, operations); },
  async close() { /* IndexedDB lifecycle is browser-managed. */ },
};

function baseEntity(now: string): SyncEntity {
  const operationId = crypto.randomUUID();
  return { id: crypto.randomUUID(), organizationId: ORGANIZATION_ID, revision: 0, createdAt: now, updatedAt: now, deletedAt: null, deviceId: DEVICE_ID, operationId, syncStatus: 'pending' };
}

function audit(entityType: string, entityId: string, action: string, now: string, beforeRevision: number | null, afterRevision: number | null): AuditEvent {
  return { ...baseEntity(now), actorUserId: 'local-owner', action, entityType, entityId, beforeHash: beforeRevision === null ? null : `revision:${beforeRevision}`, afterHash: afterRevision === null ? null : `revision:${afterRevision}`, occurredAt: now };
}

function operation(entityType: string, entity: SyncEntity, sensitivity: EntitySensitivity, now: string): OutboxOperation {
  const operationId = entity.operationId || crypto.randomUUID();
  return { operationId, organizationId: entity.organizationId, entityType, entityId: entity.id, sensitivity, baseRevision: Math.max(0, entity.revision - 1), idempotencyKey: makeIdempotencyKey(DEVICE_ID, operationId), payload: entity, status: 'pending', attempts: 0, lastError: null, createdAt: now, updatedAt: now };
}

export function useVillageState() {
  const [houses, setHouses] = useState<ChickenHouse[]>(demoHouses);
  const [operations, setOperations] = useState<VillageOperations>(initialOperations);
  const [visits, setVisits] = useState<VisitProgress>(initialVisitProgress);
  const [ready, setReady] = useState(false);
  const [storageMode, setStorageMode] = useState<'native-sqlite' | 'web-cache'>('web-cache');
  const [persistence, setPersistence] = useState<VillagePersistence>(webPersistence);
  const [syncMode, setSyncMode] = useState<'idle' | 'syncing' | 'local-demo' | 'cloud' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let selected: VillagePersistence = webPersistence;
    void (async () => {
      if (Capacitor.isNativePlatform()) {
        const { NativeVillageDatabase } = await import('../storage/nativeSqlite');
        const native = new NativeVillageDatabase();
        await native.initialize();
        selected = native;
      }
      const [storedHouses, storedVisits, storedOperations] = await Promise.all([selected.loadHouses(), selected.loadVisitProgress(), selected.loadOperations()]);
      if (!active) return;
      setPersistence(selected);
      setStorageMode(Capacitor.isNativePlatform() ? 'native-sqlite' : 'web-cache');
      if (storedHouses.length) setHouses(storedHouses); else await selected.saveHouses(demoHouses);
      if (storedVisits) setVisits(storedVisits); else await selected.saveVisitProgress(initialVisitProgress);
      if (storedOperations) setOperations(storedOperations); else await selected.saveOperations(initialOperations);
    })().catch(() => { /* Defaults remain usable if local storage is temporarily unavailable. */ })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; void selected.close(); };
  }, []);

  const updateOperations = useCallback((change: (current: VillageOperations) => VillageOperations) => {
    setOperations((current) => { const next = change(current); void persistence.saveOperations(next); return next; });
  }, [persistence]);

  const addHouse = useCallback((house: ChickenHouse) => {
    const now = new Date().toISOString();
    setHouses((current) => { const next = [...current, house]; void persistence.saveHouses(next); return next; });
    const placement: MapPlacement = { ...baseEntity(now), chickenHouseId: house.id, plotId: `plot-${houses.length + 1}`, xBasisPoints: 1_500 + (houses.length % 3) * 2_700, yBasisPoints: 6_900 };
    updateOperations((current) => ({ ...current, mapPlacements: [...current.mapPlacements, placement], auditEvents: [...current.auditEvents, audit('chicken_house', house.id, 'house.create_draft', now, null, 0)], outbox: [...current.outbox, operation('chicken_house', house, 'descriptive_private', now), operation('map_placement', placement, 'descriptive_private', now)] }));
  }, [houses.length, persistence, updateOperations]);

  const updateHouse = useCallback((houseId: string, patch: Partial<Pick<ChickenHouse, 'name' | 'species' | 'designCapacity' | 'currentBirdCount'>>) => {
    const now = new Date().toISOString();
    setHouses((current) => {
      const before = current.find((row) => row.id === houseId); if (!before) return current;
      const changed: ChickenHouse = { ...before, ...patch, revision: before.revision + 1, updatedAt: now, operationId: crypto.randomUUID(), syncStatus: 'pending' };
      const next = current.map((row) => row.id === houseId ? changed : row); void persistence.saveHouses(next);
      updateOperations((ops) => ({ ...ops, auditEvents: [...ops.auditEvents, audit('chicken_house', houseId, 'house.update', now, before.revision, changed.revision)], outbox: [...ops.outbox, operation('chicken_house', changed, 'descriptive_private', now)] }));
      return next;
    });
  }, [persistence, updateOperations]);

  const archiveHouse = useCallback((houseId: string) => {
    const now = new Date().toISOString();
    setHouses((current) => {
      const before = current.find((row) => row.id === houseId); if (!before) return current;
      const changed = { ...before, archivedAt: now, revision: before.revision + 1, updatedAt: now, operationId: crypto.randomUUID(), syncStatus: 'pending' as const };
      const next = current.map((row) => row.id === houseId ? changed : row); void persistence.saveHouses(next);
      updateOperations((ops) => ({ ...ops, auditEvents: [...ops.auditEvents, audit('chicken_house', houseId, 'house.archive', now, before.revision, changed.revision)], outbox: [...ops.outbox, operation('chicken_house', changed, 'descriptive_private', now)] }));
      return next;
    });
  }, [persistence, updateOperations]);

  const addBatch = useCallback((houseId: string, values: Pick<FlockBatch, 'batchCode' | 'species' | 'placedCount' | 'placementDate' | 'expectedSaleDate'>) => {
    const now = new Date().toISOString(); const entity: FlockBatch = { ...baseEntity(now), ...values, chickenHouseId: houseId, currentCount: values.placedCount, status: 'draft' };
    updateOperations((current) => ({ ...current, batches: [...current.batches, entity], auditEvents: [...current.auditEvents, audit('flock_batch', entity.id, 'batch.create_draft', now, null, 0)], outbox: [...current.outbox, operation('flock_batch', entity, 'descriptive_private', now)] }));
  }, [updateOperations]);

  const addShareholder = useCallback((houseId: string, displayName: string, basisPoints: number) => {
    const now = new Date().toISOString();
    const shareholder: Shareholder = { ...baseEntity(now), displayName, referenceCode: `SH-${String(operations.shareholders.length + 1).padStart(3, '0')}`, archivedAt: null };
    const holding: Shareholding = { ...baseEntity(now), chickenHouseId: houseId, shareholderId: shareholder.id, ownershipBasisPoints: basisPoints, profitShareBasisPoints: basisPoints, lossShareBasisPoints: basisPoints, effectiveFrom: now.slice(0, 10), effectiveTo: null };
    updateOperations((current) => ({ ...current, shareholders: [...current.shareholders, shareholder], shareholdings: [...current.shareholdings, holding], auditEvents: [...current.auditEvents, audit('shareholder', shareholder.id, 'shareholder.create', now, null, 0), audit('shareholding', holding.id, 'shareholding.create_draft', now, null, 0)], outbox: [...current.outbox, operation('shareholder', shareholder, 'financial', now), operation('shareholding', holding, 'financial', now)] }));
  }, [operations.shareholders.length, updateOperations]);

  const createDistribution = useCallback((houseId: string, periodLabel: string, totalAmountTwd: number) => {
    const holdings = operations.shareholdings.filter((row) => row.chickenHouseId === houseId && row.effectiveTo === null);
    const amounts = allocateIntegerTwd(totalAmountTwd, holdings.map((row) => ({ id: row.shareholderId, basisPoints: row.profitShareBasisPoints })));
    const now = new Date().toISOString(); const base = baseEntity(now);
    const entity: DistributionRecord = { ...base, chickenHouseId: houseId, batchId: null, periodLabel, totalAmountTwd, status: 'draft', confirmedAt: null, paidAt: null, reversedAt: null, reversalOfId: null, entries: holdings.map((holding) => ({ ...baseEntity(now), distributionRecordId: base.id, shareholderId: holding.shareholderId, allocatedAmountTwd: amounts[holding.shareholderId] ?? 0, paidAmountTwd: 0, adjustmentAmountTwd: 0 })) };
    updateOperations((current) => ({ ...current, distributions: [...current.distributions, entity], auditEvents: [...current.auditEvents, audit('distribution_record', entity.id, 'distribution.create_draft', now, null, 0)], outbox: [...current.outbox, operation('distribution_record', entity, 'financial', now)] }));
  }, [operations.shareholdings, updateOperations]);

  const confirmDistributionRecord = useCallback((recordId: string, online: boolean) => {
    if (!online) throw new Error('離線時只能保存草稿，連線後才能確認分潤。');
    const now = new Date().toISOString();
    updateOperations((current) => {
      const before = current.distributions.find((row) => row.id === recordId); if (!before) return current;
      const changed = { ...confirmDistribution(before, now), operationId: crypto.randomUUID(), syncStatus: 'pending' as const };
      return { ...current, distributions: current.distributions.map((row) => row.id === recordId ? changed : row), auditEvents: [...current.auditEvents, audit('distribution_record', recordId, 'distribution.confirm', now, before.revision, changed.revision)], outbox: [...current.outbox, operation('distribution_record', changed, 'financial', now)] };
    });
  }, [updateOperations]);

  const payDistribution = useCallback((recordId: string, entryId: string, amount: number, online: boolean) => {
    if (!online) throw new Error('離線時不能登記付款，請恢復連線後再操作。');
    const now = new Date().toISOString();
    updateOperations((current) => {
      const before = current.distributions.find((row) => row.id === recordId); if (!before) return current;
      const changed = { ...recordDistributionPayment(before, entryId, amount, now), operationId: crypto.randomUUID(), syncStatus: 'pending' as const };
      return { ...current, distributions: current.distributions.map((row) => row.id === recordId ? changed : row), auditEvents: [...current.auditEvents, audit('distribution_record', recordId, 'distribution.payment', now, before.revision, changed.revision)], outbox: [...current.outbox, operation('distribution_record', changed, 'financial', now)] };
    });
  }, [updateOperations]);

  const reverseDistributionRecord = useCallback((recordId: string, online: boolean) => {
    if (!online) throw new Error('離線時不能沖銷分潤，請恢復連線後再操作。');
    const now = new Date().toISOString();
    updateOperations((current) => {
      const before = current.distributions.find((row) => row.id === recordId); if (!before) return current;
      const reversal: DistributionRecord = { ...baseEntity(now), chickenHouseId: before.chickenHouseId, batchId: before.batchId, periodLabel: `${before.periodLabel} 沖銷`, totalAmountTwd: -before.totalAmountTwd, status: 'confirmed', confirmedAt: now, paidAt: null, reversedAt: null, reversalOfId: before.id, entries: before.entries.map((entry) => ({ ...baseEntity(now), distributionRecordId: '', shareholderId: entry.shareholderId, allocatedAmountTwd: -entry.allocatedAmountTwd, paidAmountTwd: 0, adjustmentAmountTwd: -entry.adjustmentAmountTwd })) };
      reversal.entries = reversal.entries.map((entry) => ({ ...entry, distributionRecordId: reversal.id }));
      const changed = { ...reverseDistribution(before, reversal, now), operationId: crypto.randomUUID(), syncStatus: 'pending' as const };
      return { ...current, distributions: [...current.distributions.map((row) => row.id === recordId ? changed : row), reversal], auditEvents: [...current.auditEvents, audit('distribution_record', recordId, 'distribution.reverse', now, before.revision, changed.revision)], outbox: [...current.outbox, operation('distribution_record', changed, 'financial', now), operation('distribution_record', reversal, 'financial', now)] };
    });
  }, [updateOperations]);

  const saveRisk = useCallback((houseId: string, answers: RiskAnswer[], notes: string) => {
    const now = new Date().toISOString(); const weights: Record<RiskDimension, number> = { man: 1700, machine: 1600, material: 1700, method: 1700, measurement: 1600, environment: 1700 };
    const result = calculateRisk(answers, weights);
    const entity: RiskAssessment = { ...baseEntity(now), chickenHouseId: houseId, modelVersion: '5m1e-v1', dimensionScores: result.dimensionScores, dimensionWeights: weights, completenessBasisPoints: result.completenessBasisPoints, finalScore: result.finalScore, assessedAt: now, notes, answers };
    updateOperations((current) => ({ ...current, riskAssessments: [...current.riskAssessments, entity], auditEvents: [...current.auditEvents, audit('risk_assessment', entity.id, 'risk.save_draft', now, null, 0)], outbox: [...current.outbox, operation('risk_assessment', entity, 'descriptive_private', now)] }));
  }, [updateOperations]);

  const moveHouse = useCallback((houseId: string, xDelta: number, yDelta: number) => {
    const now = new Date().toISOString();
    updateOperations((current) => {
      const before = current.mapPlacements.find((row) => row.chickenHouseId === houseId); if (!before) return current;
      const changed = { ...before, xBasisPoints: Math.max(700, Math.min(9000, before.xBasisPoints + xDelta)), yBasisPoints: Math.max(1500, Math.min(8200, before.yBasisPoints + yDelta)), revision: before.revision + 1, updatedAt: now, operationId: crypto.randomUUID(), syncStatus: 'pending' as const };
      return { ...current, mapPlacements: current.mapPlacements.map((row) => row.id === before.id ? changed : row), auditEvents: [...current.auditEvents, audit('map_placement', changed.id, 'map.move', now, before.revision, changed.revision)], outbox: [...current.outbox, operation('map_placement', changed, 'descriptive_private', now)] };
    });
  }, [updateOperations]);

  const syncNow = useCallback(async (online: boolean) => {
    if (!online) return;
    setSyncMode('syncing'); setSyncError(null);
    const now = new Date().toISOString();
    try {
      const result = await syncPrivateHouses(houses);
      if (!result) {
        updateOperations((current) => ({ ...current, outbox: current.outbox.map((item) => item.status === 'pending' ? applyPushResult(startSync(item, now), { kind: 'accepted', serverRevision: item.baseRevision + 1 }, now) : item) }));
        setHouses((current) => { const next = current.map((row) => row.syncStatus === 'pending' ? { ...row, syncStatus: 'synced' as const, revision: row.revision + 1, updatedAt: now } : row); void persistence.saveHouses(next); return next; });
        setSyncMode('local-demo');
        return;
      }
      setHouses(result.houses); await persistence.saveHouses(result.houses);
      updateOperations((current) => ({ ...current, outbox: current.outbox.map((item) => {
        if (item.entityType !== 'chicken_house' || item.status !== 'pending') return item;
        const syncing = startSync(item, now);
        return result.acceptedIds.includes(item.entityId) ? applyPushResult(syncing, { kind: 'accepted' }, now) : result.conflictIds.includes(item.entityId) ? applyPushResult(syncing, { kind: 'revision_conflict' }, now) : item;
      }) }));
      setSyncMode('cloud');
    } catch (error) {
      setSyncMode('error'); setSyncError(error instanceof Error ? error.message : '同步失敗');
    }
  }, [houses, persistence, updateOperations]);

  const visitToday = useCallback(() => { const today = new Date().toISOString().slice(0, 10); setVisits((current) => { const next = recordVisit(current, today); void persistence.saveVisitProgress(next); return next; }); }, [persistence]);
  const equip = useCallback((slot: 'head' | 'body' | 'hand' | 'back', itemId: string) => { setVisits((current) => { const next = { ...current, equipped: { ...current.equipped, [slot]: itemId } }; void persistence.saveVisitProgress(next); return next; }); }, [persistence]);

  const unsyncedCount = operations.outbox.filter((item) => item.status !== 'synced').length + houses.filter((house) => house.syncStatus !== 'synced').length;
  return { houses, ...operations, visits, ready, storageMode, unsyncedCount, syncMode, syncError, addHouse, updateHouse, archiveHouse, addBatch, addShareholder, createDistribution, confirmDistributionRecord, payDistribution, reverseDistributionRecord, saveRisk, moveHouse, syncNow, visitToday, equip };
}

export type VillageState = ReturnType<typeof useVillageState>;
