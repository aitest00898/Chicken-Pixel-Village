# Technical Decisions

## 2026-07-24 baseline

1. Use React, TypeScript, Vite and Capacitor 8 for a shared DOM-first mobile UI.
2. Use CSS/DOM interaction over a raster village map. This keeps tap targets, forms, accessibility and navigation inspectable without a heavy game engine.
3. Use `@capacitor-community/sqlite` 8.1 on native platforms. It is actively maintained, aligns with Capacitor 8, uses SQLCipher-backed native builds, and supports migrations and transactions. Web uses IndexedDB only as a rebuildable cache.
4. Use Firebase SQL Connect as the current relational product name. Firebase CLI/config still uses `dataconnect`; local emulator uses PGlite. Production Cloud SQL is deferred to the paid Gate.
5. Use integer basis points and integer TWD throughout the domain.
6. Use deterministic market narration. No LLM is present in the runtime.
7. Keep the app useful with verified fixtures when official endpoints are unavailable. Fixtures are visibly labelled and never impersonate live data.
8. Use original generated pixel artwork checked into `apps/mobile/public/assets/art`; HTML renders all product text for accessibility and accuracy.

## Environment inventory

- Node.js 26.0.0 (project permits 22–26; CI should prefer 22 LTS).
- pnpm 11.9.0.
- Firebase CLI 15.19.0.
- Xcode 26.6 available; simulator service requires host-level access.
- Android SDK, Java runtime and CocoaPods were not available at baseline.

