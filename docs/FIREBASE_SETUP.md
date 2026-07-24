# Firebase Setup

## Local, no-cost workflow

1. Install dependencies with `pnpm install`.
2. Run `firebase emulators:start --project demo-chicken-pixel-village`.
3. SQL Connect uses local PGlite on port 9399; Auth, Functions and Storage use the ports in `firebase.json`.
4. Seed only synthetic organizations, houses and financial records.

When Firebase variables are present, Settings → Sync uses the generated SQL Connect SDK: it creates an owner membership, pushes UUID-stable house drafts with revision checks, then pulls the server snapshot. Without Firebase variables, the same button explicitly reports a local demonstration sync and never implies a cloud write.

The mobile app reads Firebase values from `apps/mobile/.env` (template: `.env.example`). Set `VITE_USE_FIREBASE_EMULATORS=true` during local work. No default production project ID exists in this repository.

Validated locally on 2026-07-24:

```bash
firebase dataconnect:sdk:generate --project demo-chicken-pixel-village
firebase emulators:start --only dataconnect --project demo-chicken-pixel-village
```

The compiler generated both Web and Admin SDKs, and PGlite reported SQL Connect ready at `127.0.0.1:9399`.

## Deployment boundary

Production requires an explicitly approved Firebase project, billing review, Cloud SQL instance in `asia-east1`, registered clients, authentication providers, App Check, backups and monitoring. Do not run `firebase deploy --only dataconnect` without approval because it can create or modify billable Cloud SQL resources.
