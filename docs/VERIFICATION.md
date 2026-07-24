# Verification Evidence

Executed on 2026-07-24 in the local staging repository.

## Passed

| Check | Result |
|---|---|
| `pnpm peers check` | no peer dependency issues |
| `pnpm typecheck` | 7 workspace projects passed |
| `pnpm lint` | mobile and Functions passed with zero warnings |
| `pnpm test:run` | 6 files, 24 tests passed |
| `pnpm build` | Functions TypeScript and Vite production bundle passed |
| SQL Connect SDK generation | schema plus public/private/admin operations compiled; Web/Admin SDKs emitted, including owner membership and revision-checked house mutations |
| SQL Connect PGlite emulator | ready on `127.0.0.1:9399` using demo project |
| Capacitor sync | iOS and Android projects generated; SQLite 8.1.0 linked on both |
| Browser QA | 390x844 and 320x844; operational tabs and movable map checked, clipped triple-house marker corrected, no final console warnings/errors |
| Offline/financial UI | tests prove required summary metrics and disable payment/reversal while offline |
| SQLite migration safety | v1-v4 checked for normalized entity tables and absence of destructive `DROP TABLE`/`DELETE FROM` migrations |
| Login transition regression | forced `scrollY=64`, after demo login `scrollY=0`, title below fixed header |

## Environment-blocked, not passed

| Check | Evidence | Needed |
|---|---|---|
| iOS compile | Swift packages resolved, then Xcode reported iOS 26.5 platform not installed | Install Xcode iOS 26.5 component and a Simulator runtime |
| Android compile | Gradle reported `Unable to locate a Java Runtime` | Install supported JDK and Android SDK |
| Production Firebase | intentionally not attempted | Explicit project, billing and deployment approval |

The Cloud Functions package targets the supported Node 22 runtime. This workstation currently runs Node 24, so pnpm prints an engine warning while TypeScript and build checks still pass.
