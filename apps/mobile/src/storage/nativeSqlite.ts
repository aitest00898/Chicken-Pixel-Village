import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SQLITE_MIGRATIONS, type ChickenHouse, type VisitProgress } from '@chicken-village/domain';

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
