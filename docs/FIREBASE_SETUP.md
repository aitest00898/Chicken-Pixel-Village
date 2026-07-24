# Firebase Setup

## Registered development project

The repository is now connected to the no-cost Spark project `chicken-pixel-village` (project number `740619725797`). Firebase has three registered clients:

- Web: `Chicken Pixel Village Web`
- iOS: `Chicken Pixel Village iOS`, bundle ID `tw.joe.chickenpixelvillage`
- Android: `Chicken Pixel Village Android`, package `tw.joe.chickenpixelvillage`

The Web client values are in `apps/mobile/.env.example`; the native Firebase configuration files are installed in the iOS application target and Android app module. Firebase client API keys identify the project and are not server credentials. Server credentials and service-account keys must still never be committed.

The tracked `.firebaserc` defines only the `dev` alias and intentionally does not select a default project. Use `firebase use dev` explicitly before any approved real-project command. No production service has been deployed.

Public chicken-house records use Cloud Firestore collection `public_houses`. Reads are public; creates and updates require Firebase Authentication plus a matching `admins/{uid}` document. The administrator password is never stored in source code or Netlify variables. Firestore rules are tracked in `firebase/firestore.rules`.

## Local, no-cost workflow

1. Install dependencies with `pnpm install`.
2. Run `firebase emulators:start --project demo-chicken-pixel-village`.
3. SQL Connect uses local PGlite on port 9399; Auth, Functions and Storage use the ports in `firebase.json`.
4. Seed only synthetic organizations, houses and financial records.

When Firebase variables are present, Settings → Sync uses the generated SQL Connect SDK: it creates an owner membership, pushes UUID-stable house drafts with revision checks, then pulls the server snapshot. Without Firebase variables, the same button explicitly reports a local demonstration sync and never implies a cloud write.

The mobile app reads Firebase values from Vite environment files (template: `.env.example`). Local working copies use `.env.development.local` with emulators enabled and `.env.production.local` with emulators disabled; both files are ignored by Git. Do not start the development server with emulators enabled unless the emulator suite is running.

Validated locally on 2026-07-24:

```bash
firebase dataconnect:sdk:generate --project demo-chicken-pixel-village
firebase emulators:start --only dataconnect --project demo-chicken-pixel-village
```

The compiler generated both Web and Admin SDKs, and PGlite reported SQL Connect ready at `127.0.0.1:9399`.

## Deployment boundary

The Spark project and clients are registered, but SQL Connect/Cloud SQL, Functions deployment, authentication providers, App Check, backups and monitoring are not provisioned. Those remain separate gates. Do not run `firebase deploy --only dataconnect` without approval because it can create or modify billable Cloud SQL resources.
