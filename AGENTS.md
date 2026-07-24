# Chicken Pixel Village Agent Rules

## Immutable product constraints

- The product name shown to users is 《雞情像素村》.
- Art must be original chibi 16-bit top-down pixel RPG art. Never copy Final Fantasy, Square Enix, or other protected assets, names, layouts, music, characters, typography, or signature combinations.
- Equipment is cosmetic only. It must never change prices, finance, risk, permissions, sync, or notifications.
- Public prices remain usable without login. Private chicken-house, shareholder, distribution, and risk data require membership authorization.
- Daily, weekly, and monthly market records must remain separate. Never invent daily values from weekly or monthly data.
- Missing market values are gaps, never interpolated facts.

## Financial and data safety

- Store ratios as integer basis points where 10,000 equals 100%.
- Store New Taiwan dollar values as integers.
- Keep ownership, profit-share, and loss-share basis points separate.
- Confirmed distributions are immutable. Correct them through adjustment or reversal records.
- Paid records cannot be deleted. Chicken houses are archived, not cascade-deleted.
- Every holding, distribution, payment, reversal, and sensitive state transition creates an audit event.
- Financial conflicts never use automatic last-write-wins.
- Never trust a client-supplied user ID; enforce Firebase Auth identity, organization membership, authorization, revision, and App Check on private operations.

## Firebase boundaries

- Prefer reproducible config, Firebase CLI, and emulators before console operations.
- Do not deploy production, enable Blaze, create billable Cloud SQL, raise quotas, accept paid terms, or delete cloud resources without explicit user approval.
- Never commit Firebase secrets, App Check debug tokens, service accounts, private keys, or real personal/financial fixtures.
- SQL Connect is the current product name; local config and CLI resource names may still use `dataconnect`.

## Verification commands

Run from the repository root:

```bash
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
```

Each Gate requires relevant focused tests followed by `pnpm verify`. Do not weaken TypeScript strictness, delete tests, or hardcode fake success states.

## Repository boundaries

- Do not add a remote or push.
- Do not commit generated secrets, local database files, build products, Pods, Gradle caches, or signing materials.
- Keep raw public-data snapshots, payload hashes, parser versions, normalized records, validation state, source publication time, and fetch time auditable.

