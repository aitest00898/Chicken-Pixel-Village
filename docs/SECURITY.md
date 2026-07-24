# Security

- Firebase Auth identifies the caller; client-provided user IDs are never authoritative.
- Every private operation checks organization membership, role, revision and App Check state.
- Native SQLite is encrypted through the selected SQLCipher-backed plugin. Keys belong in iOS Keychain or Android Keystore.
- Web IndexedDB is a rebuildable cache, not the only copy of private data.
- Logs redact names, financial details, tokens, App Check values and request payloads.
- Android backup/transfer excludes databases, shared preferences and app-private files.
- App Check begins in debug/monitoring mode; debug tokens are never committed.
- Production enforcement requires signed release validation so legitimate clients are not locked out.
- Account export/deletion, retention, backup, PITR and incident rollback must be complete before launch.

