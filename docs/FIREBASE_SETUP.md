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

### Manual market bulletin import

管理員提供的全區土雞日報不得由一般用戶端寫入，也不得覆寫既有 `market_history` 文件。請將核對後的資料整理成 `{"documents":[{"path":"market_history/YYYY-MM-DD__item","data":{...}}]}`，每筆資料必須保留 `id`、`sourceDate`、`sourceName`、`sourceUrl`、`fetchedAt`、`capturedAt`、`rawSnapshotHash` 與 `parserVersion`。使用以下指令先做乾跑，再以具備 Firebase Admin 憑證的受控環境套用：

```bash
node firebase/functions/scripts/import-firestore.mjs \
  --input path/to/association-bulletin.json \
  --project chicken-pixel-village

node firebase/functions/scripts/import-firestore.mjs \
  --input path/to/association-bulletin.json \
  --project chicken-pixel-village \
  --apply
```

匯入器只會建立不存在的文件；若同一個路徑已有不同內容會直接停止，避免把更正資料偽裝成更新。更正必須建立新的來源／調整紀錄，不可覆寫歷史價格。

The mobile app reads Firebase values from Vite environment files (template: `.env.example`). Local working copies use `.env.development.local` with emulators enabled and `.env.production.local` with emulators disabled; both files are ignored by Git. Do not start the development server with emulators enabled unless the emulator suite is running.

Validated locally on 2026-07-24:

```bash
firebase dataconnect:sdk:generate --project demo-chicken-pixel-village
firebase emulators:start --only dataconnect --project demo-chicken-pixel-village
```

The compiler generated both Web and Admin SDKs, and PGlite reported SQL Connect ready at `127.0.0.1:9399`.

## Deployment boundary

The Spark project and clients are registered, but SQL Connect/Cloud SQL, Functions deployment, authentication providers, App Check, backups and monitoring are not provisioned. Those remain separate gates. Do not run `firebase deploy --only dataconnect` without approval because it can create or modify billable Cloud SQL resources.
