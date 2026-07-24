export interface Migration {
  version: number;
  statements: string[];
}

export const SQLITE_MIGRATIONS: Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS chicken_houses (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, sync_status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS flock_batches (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, chicken_house_id TEXT NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, sync_status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS shareholders (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, sync_status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS shareholdings (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, chicken_house_id TEXT NOT NULL, shareholder_id TEXT NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, sync_status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS distribution_records (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, chicken_house_id TEXT NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, sync_status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS risk_assessments (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, chicken_house_id TEXT NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, sync_status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS map_placements (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, chicken_house_id TEXT NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, sync_status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS audit_events (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, payload_json TEXT NOT NULL, occurred_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS outbox (operation_id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, base_revision INTEGER NOT NULL, idempotency_key TEXT NOT NULL UNIQUE, payload_json TEXT NOT NULL, status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE INDEX IF NOT EXISTS idx_outbox_status_created ON outbox(status, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_houses_org ON chicken_houses(organization_id, deleted_at)`,
    ],
  },
  {
    version: 2,
    statements: [
      `CREATE TABLE IF NOT EXISTS visit_progress (owner_key TEXT PRIMARY KEY, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, updated_at TEXT NOT NULL)`,
    ],
  },
  {
    version: 3,
    statements: [
      `CREATE TABLE IF NOT EXISTS foster_farmers (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, sync_status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS distribution_entries (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, distribution_record_id TEXT NOT NULL, shareholder_id TEXT NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, sync_status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS risk_answers (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, risk_assessment_id TEXT NOT NULL, payload_json TEXT NOT NULL, updated_at TEXT NOT NULL)`,
      `CREATE INDEX IF NOT EXISTS idx_batches_house ON flock_batches(chicken_house_id, deleted_at)`,
      `CREATE INDEX IF NOT EXISTS idx_holdings_house ON shareholdings(chicken_house_id, deleted_at)`,
      `CREATE INDEX IF NOT EXISTS idx_distributions_house ON distribution_records(chicken_house_id, deleted_at)`,
      `CREATE INDEX IF NOT EXISTS idx_risk_house ON risk_assessments(chicken_house_id, deleted_at)`,
    ],
  },
  {
    version: 4,
    statements: [
      `CREATE TABLE IF NOT EXISTS organizations (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, sync_status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS organization_memberships (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, user_id TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL, payload_json TEXT NOT NULL, revision INTEGER NOT NULL, sync_status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_org_user ON organization_memberships(organization_id, user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_audit_entity_time ON audit_events(entity_type, entity_id, occurred_at)`,
    ],
  },
];

export interface LocalDatabase {
  execute(statements: string[]): Promise<void>;
  getMigrationVersion(): Promise<number>;
  setMigrationVersion(version: number, appliedAt: string): Promise<void>;
}

export async function migrateDatabase(database: LocalDatabase, now: string): Promise<number> {
  let current = await database.getMigrationVersion();
  for (const migration of SQLITE_MIGRATIONS) {
    if (migration.version <= current) continue;
    await database.execute(migration.statements);
    await database.setMigrationVersion(migration.version, now);
    current = migration.version;
  }
  return current;
}
