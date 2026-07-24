# Development Status

Updated: 2026-07-24

| Gate | Status | Evidence / note |
|---|---|---|
| 0 Inventory and specification | complete | Product, UX, data, security, test and acceptance documents committed locally |
| 1 Mobile UI skeleton | complete | Seven routes, fixed mobile navigation, responsive 320 px layout, dark/reduced-motion controls |
| 2 Domain and local database | complete | Integer finance, versioned 5M1E, additive migrations v1-v4, separated operational tables, encrypted native SQLite and Web cache split |
| 3 Firebase emulator backend | complete-local | SQL Connect compiler and PGlite emulator startup passed; Web/Admin SDKs generated; no production resources |
| 4 Sync | complete-local | Revision/outbox state machine, manual financial conflicts, offline UI and persisted queue; configured clients use real SQL Connect house pull/push, while unconfigured demo mode is labelled local-only |
| 5 Public market adapters | complete | MOA adapter, raw SHA-256 provenance, verified fallback fixture and deterministic merchant formatter |
| 6 Village and equipment | complete | Original loading art, movable/synced house map placement, sprite atlas, manager equipment and app icon |
| 7 Security and mobile platforms | in progress | Auth/App Check boundaries, Keychain/Keystore secret and native projects done; native compile blocked by local toolchains |
| 8 End-to-end QA | in progress | Operational UI tests plus 320/390 px browser QA passed; native simulator/device tests remain |
| 9 Firebase dev project | registered | Spark project `chicken-pixel-village`; Web/iOS/Android clients configured; no paid services deployed |
| 10 Production readiness | in progress | Release checklist and verified local build exist; signing, DR and production validation remain |

The locally executable scope is complete except for full Auth/Functions/Storage cross-emulator E2E and native device builds. Paid and production-only gates remain intentionally held.

External constraints: Android Gradle cannot start because this Mac has no Java runtime/Android SDK. Xcode resolves Capacitor, SQLCipher and ZIPFoundation packages, but cannot build because the iOS 26.5 platform is not installed. A free Firebase project and platform clients are registered, but no production backend service has been deployed.
