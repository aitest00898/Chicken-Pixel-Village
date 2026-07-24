import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SQLITE_MIGRATIONS, type ChickenHouse, type SyncEntity, type VisitProgress } from '@chicken-village/domain';
import type { OutboxOperation } from '@chicken-village/sync';
import type { VillageOperations } from './types';

const DATABASE_NAME = 'chicken_pixel_village';
const VISIT_OWNER_KEY = 'local-owner';

function randomPassphrase(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export class NativeVillageDatabase {
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private connection: SQLiteDBConnection | null = null;

  async initialize(): Promise<'native-sqlite' | 'web-cache'> {
    if (!Capacitor.isNativePlatform()) return 'web-cache';
    const stored = await this.sqlite.isSecretStored();
    if (!stored.result) await this.sqlite.setEncryptionSecret(randomPassphrase());
    const connection = await this.sqlite.createConnection(DATABASE_NAME, true, 'secret', SQLITE_MIGRATIONS.at(-1)?.version ?? 1, false);
    await connection.open();
    await connection.execute('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)', false);
    const versionResult = await connection.query('SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations');
    const currentVersion = Number(versionResult.values?.[0]?.version ?? 0);
    for (const migration of SQLITE_MIGRATIONS) {
      if (migration.version <= currentVersion) continue;
      for (const statement of migration.statements) await connection.execute(statement, false);
      await connection.run(
        'INSERT OR REPLACE INTO schema_migrations(version, applied_at) VALUES (?, ?)',
        [migration.version, new Date().toISOString()],
        false,
      );
    }
    this.connection = connection;
    return 'native-sqlite';
  }

  async loadHouses(): Promise<ChickenHouse[]> {
    const connection = this.requireConnection();
    const result = await connection.query('SELECT payload_json FROM chicken_houses WHERE deleted_at IS NULL ORDER BY updated_at DESC');
    return (result.values ?? []).map((row) => JSON.parse(String(row.payload_json)) as ChickenHouse);
  }

  async saveHouses(houses: ChickenHouse[]): Promise<void> {
    const connection = this.requireConnection();
    for (const house of houses) {
      await connection.run(
        `INSERT OR REPLACE INTO chicken_houses
         (id, organization_id, payload_json, revision, sync_status, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [house.id, house.organizationId, JSON.stringify(house), house.revision, house.syncStatus, house.updatedAt, house.deletedAt],
        false,
      );
    }
  }

  async loadVisitProgress(): Promise<VisitProgress | null> {
    const connection = this.requireConnection();
    const result = await connection.query('SELECT payload_json FROM visit_progress WHERE owner_key = ?', [VISIT_OWNER_KEY]);
    const value = result.values?.[0]?.payload_json;
    return value === undefined ? null : JSON.parse(String(value)) as VisitProgress;
  }

  async saveVisitProgress(progress: VisitProgress): Promise<void> {
    await this.requireConnection().run(
      `INSERT OR REPLACE INTO visit_progress (owner_key, payload_json, revision, updated_at)
       VALUES (?, ?, COALESCE((SELECT revision + 1 FROM visit_progress WHERE owner_key = ?), 1), ?)`,
      [VISIT_OWNER_KEY, JSON.stringify(progress), VISIT_OWNER_KEY, new Date().toISOString()],
      false,
    );
  }

  async loadOperations(): Promise<VillageOperations | null> {
    const connection = this.requireConnection();
    const load = async <T>(table: string, orderColumn = 'updated_at'): Promise<T[]> => {
      const result = await connection.query(`SELECT payload_json FROM ${table} ORDER BY ${orderColumn} DESC`);
      return (result.values ?? []).map((row) => JSON.parse(String(row.payload_json)) as T);
    };
    const [organizations, memberships, fosterFarmers, batches, shareholders, shareholdings, distributions, riskAssessments, mapPlacements, auditEvents, outbox] = await Promise.all([
      load<VillageOperations['organizations'][number]>('organizations'),
      load<VillageOperations['memberships'][number]>('organization_memberships'),
      load<VillageOperations['fosterFarmers'][number]>('foster_farmers'),
      load<VillageOperations['batches'][number]>('flock_batches'),
      load<VillageOperations['shareholders'][number]>('shareholders'),
      load<VillageOperations['shareholdings'][number]>('shareholdings'),
      load<VillageOperations['distributions'][number]>('distribution_records'),
      load<VillageOperations['riskAssessments'][number]>('risk_assessments'),
      load<VillageOperations['mapPlacements'][number]>('map_placements'),
      load<VillageOperations['auditEvents'][number]>('audit_events', 'occurred_at'),
      load<OutboxOperation>('outbox'),
    ]);
    if (![organizations, memberships, fosterFarmers, batches, shareholders, shareholdings, distributions, riskAssessments, mapPlacements, auditEvents, outbox].some((rows) => rows.length)) return null;
    return { organizations, memberships, fosterFarmers, batches, shareholders, shareholdings, distributions, riskAssessments, mapPlacements, auditEvents, outbox };
  }

  async saveOperations(operations: VillageOperations): Promise<void> {
    const connection = this.requireConnection();
    const saveEntity = async (table: string, entity: SyncEntity, extraColumns: string[] = [], extraValues: unknown[] = []) => {
      const columns = ['id', 'organization_id', ...extraColumns, 'payload_json', 'revision', 'sync_status', 'updated_at', 'deleted_at'];
      await connection.run(
        `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
        [entity.id, entity.organizationId, ...extraValues, JSON.stringify(entity), entity.revision, entity.syncStatus, entity.updatedAt, entity.deletedAt],
        false,
      );
    };
    for (const entity of operations.organizations) await saveEntity('organizations', entity);
    for (const entity of operations.memberships) await saveEntity('organization_memberships', entity, ['user_id', 'role', 'active'], [entity.userId, entity.role, entity.active ? 1 : 0]);
    for (const entity of operations.fosterFarmers) await saveEntity('foster_farmers', entity);
    for (const entity of operations.batches) await saveEntity('flock_batches', entity, ['chicken_house_id'], [entity.chickenHouseId]);
    for (const entity of operations.shareholders) await saveEntity('shareholders', entity);
    for (const entity of operations.shareholdings) await saveEntity('shareholdings', entity, ['chicken_house_id', 'shareholder_id'], [entity.chickenHouseId, entity.shareholderId]);
    for (const entity of operations.distributions) {
      await saveEntity('distribution_records', entity, ['chicken_house_id'], [entity.chickenHouseId]);
      for (const entry of entity.entries) await saveEntity('distribution_entries', entry, ['distribution_record_id', 'shareholder_id'], [entity.id, entry.shareholderId]);
    }
    for (const entity of operations.riskAssessments) {
      await saveEntity('risk_assessments', entity, ['chicken_house_id'], [entity.chickenHouseId]);
      for (const answer of entity.answers) {
        await connection.run(
          'INSERT OR REPLACE INTO risk_answers (id, organization_id, risk_assessment_id, payload_json, updated_at) VALUES (?, ?, ?, ?, ?)',
          [`${entity.id}:${answer.questionId}`, entity.organizationId, entity.id, JSON.stringify(answer), entity.updatedAt],
          false,
        );
      }
    }
    for (const entity of operations.mapPlacements) await saveEntity('map_placements', entity, ['chicken_house_id'], [entity.chickenHouseId]);
    for (const entity of operations.auditEvents) {
      await connection.run(
        'INSERT OR REPLACE INTO audit_events (id, organization_id, entity_type, entity_id, payload_json, occurred_at) VALUES (?, ?, ?, ?, ?, ?)',
        [entity.id, entity.organizationId, entity.entityType, entity.entityId, JSON.stringify(entity), entity.occurredAt],
        false,
      );
    }
    for (const operation of operations.outbox) {
      await connection.run(
        `INSERT OR REPLACE INTO outbox
         (operation_id, organization_id, entity_type, entity_id, base_revision, idempotency_key, payload_json, status, attempts, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [operation.operationId, operation.organizationId, operation.entityType, operation.entityId, operation.baseRevision, operation.idempotencyKey, JSON.stringify(operation), operation.status, operation.attempts, operation.createdAt, operation.updatedAt],
        false,
      );
    }
  }

  async close(): Promise<void> {
    if (!this.connection) return;
    await this.connection.close();
    this.connection = null;
  }

  private requireConnection(): SQLiteDBConnection {
    if (!this.connection) throw new Error('Native village database is not initialized');
    return this.connection;
  }
}
