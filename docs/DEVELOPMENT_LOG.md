# Development Log

This log connects product requests, implementation evidence and Git commits so the project remains traceable even when a long Codex thread is compacted in the UI.

## 2026-07-24 — Public houses and administrator console

- Removed general-user login gating; house data is publicly readable.
- Added `/admin`, Firebase Email/Password authentication and Firestore `admins/{uid}` authorization.
- Added public Firestore house service and rules: public reads, administrator-only creates/updates, no client deletion or admin-list writes.
- Verified anonymous read, rejected anonymous write, administrator workflow and deployment.
- Commit: `500539a feat: add public houses and admin console`.

## 2026-07-24 — Vanadis Chronicle visual system

- Adopted the user-defined「瓦納迪斯風格（Vanadis Chronicle Style）」as the immutable project art direction.
- Generated and integrated original village hero, territory map, market bulletin, six-role character folio and guild seal from the supplied visual references.
- Reworked shell navigation, splash, home, market, village, manager and administrator surfaces into an aged parchment / watercolor / ink chronicle system.
- Kept all dates, prices, units, source state, authentication, permissions, forms, focus states and 44px mobile targets as live accessible UI.
- Pixel sprites remain a supporting layer only.
- Verification: `pnpm verify` passed (lint, TypeScript, 6 test files / 25 tests, production build); 320px and 390px browser QA passed all seven primary routes with no horizontal overflow, broken images or console errors.
- Commit message: `feat: adopt Vanadis Chronicle visual system` (use `git log -1` for the immutable final object ID).
