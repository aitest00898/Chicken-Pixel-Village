# Sync Architecture

Native SQLite stores a rebuildable server snapshot, local drafts and an outbox. Each operation carries a stable UUID, organization ID, device ID, operation ID, idempotency key, base revision and sync state.

Transitions: `pending -> syncing -> synced`; retryable failures return to `pending`; revision mismatches become `conflict`; terminal validation failures become `failed`.

Public reference data may use last-write-wins after source validation. Private descriptive drafts may merge only when field-safe. Holdings, distributions, payments, reversals and confirmed batch settlement always stop for explicit conflict resolution.

