# Production Readiness Checklist

- [x] Reproducible Web/Functions build, locked dependencies and local verification command.
- [x] SQL Connect schema compiled and applied in local PGlite emulator.
- [x] Web and Admin generated SDKs; financial confirmation is `NO_ACCESS`, transactional and revision-checked.
- [x] Native secret is randomly generated and stored through the SQLite plugin secure store; no embedded passphrase.
- [x] Public market data keeps source URL, fetched timestamp, parser version, validation state and payload SHA-256.
- [ ] Explicit billing approval and Cloud SQL cost estimate.
- [ ] `asia-east1` SQL Connect service, backup schedule and PITR validation.
- [ ] Apple and Google signing, store accounts, privacy disclosures and native device matrix.
- [ ] Auth recovery, multi-member organization roles and App Check monitoring before enforcement.
- [ ] Biometric fallback, Keychain/Keystore migration and lost-device drill.
- [ ] Export, account deletion, audit retention and disaster recovery drills.
- [ ] Monitoring for data staleness, parser changes, sync failures and security denials.
- [ ] Rollback package and database migration rollback tested before release.
