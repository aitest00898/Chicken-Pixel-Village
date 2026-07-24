import { createChickenHouse, createOrganization, myChickenHouses, myOrganizations, updateChickenHouse } from '@chicken-village/sql-connect';
import type { ChickenHouse } from '@chicken-village/domain';
import { firebaseDataConnect } from './firebase';

export interface PrivateSyncResult {
  houses: ChickenHouse[];
  acceptedIds: string[];
  conflictIds: string[];
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function syncPrivateHouses(localHouses: ChickenHouse[]): Promise<PrivateSyncResult | null> {
  const dataConnect = firebaseDataConnect;
  if (!dataConnect) return null;

  const organizations = (await myOrganizations(dataConnect)).data.organizations;
  const newOrganizationId = crypto.randomUUID();
  const organizationId = organizations[0]?.id ?? (await createOrganization(dataConnect, { id: newOrganizationId, name: '我的養雞組織' })).data.organization_insert.id;
  const acceptedIds: string[] = [];
  const conflictIds: string[] = [];

  for (const house of localHouses.filter((row) => row.syncStatus === 'pending' && uuidPattern.test(row.id))) {
    try {
      const values = { id: house.id, name: house.name, capacity: house.designCapacity, occupancy: house.currentBirdCount, houseType: house.species };
      if (house.revision === 0) await createChickenHouse(dataConnect, { ...values, organizationId });
      else await updateChickenHouse(dataConnect, { ...values, expectedRevision: house.revision });
      acceptedIds.push(house.id);
    } catch {
      // A create may have committed before a connection interruption. Pulling by
      // the stable UUID below distinguishes that idempotent replay from conflict.
      conflictIds.push(house.id);
    }
  }

  const remote = (await myChickenHouses(dataConnect)).data.chickenHouses;
  const remoteById = new Map(remote.map((row) => [row.id, row]));
  for (const id of [...conflictIds]) {
    if (remoteById.has(id)) {
      conflictIds.splice(conflictIds.indexOf(id), 1);
      acceptedIds.push(id);
    }
  }

  const now = new Date().toISOString();
  const localById = new Map(localHouses.map((house) => [house.id, house]));
  const houses: ChickenHouse[] = remote.map((row) => {
    const local = localById.get(row.id);
    return {
      ...(local ?? { id: row.id, createdAt: row.createdAt, deletedAt: null, deviceId: 'server', operationId: row.id, fosterFarmerId: null, archivedAt: null }),
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      species: row.houseType as ChickenHouse['species'],
      designCapacity: row.capacity,
      currentBirdCount: row.occupancy,
      revision: row.revision,
      updatedAt: row.updatedAt,
      syncStatus: 'synced' as const,
    } satisfies ChickenHouse;
  });
  for (const local of localHouses) {
    if (!remoteById.has(local.id) && !acceptedIds.includes(local.id)) houses.push(conflictIds.includes(local.id) ? { ...local, syncStatus: 'conflict', updatedAt: now } : local);
  }
  return { houses, acceptedIds, conflictIds };
}
