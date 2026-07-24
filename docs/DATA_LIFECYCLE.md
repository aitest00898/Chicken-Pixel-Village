# Data Lifecycle Plan

This plan must be implemented and exercised before production launch.

## Export

An authenticated owner requests a server-generated archive. The service revalidates active membership, snapshots organization rows at a consistent revision and emits machine-readable JSON plus human-readable CSV for houses, batches, holdings, distributions, risks and audit metadata. Secrets, tokens and other users' authentication records are excluded. The archive is short-lived and access is audit logged.

## Deletion

Deletion is a two-step, recently-authenticated owner action with an explicit organization name confirmation. The server first blocks new writes, marks the organization pending deletion, creates an audit event and offers an export. After the documented recovery window, a controlled job removes dependent private rows and stored files, then deletes or detaches the Firebase Auth account as applicable. Financial retention obligations must be resolved with counsel before the retention period is set.

## Lost device and logout

Logout clears authentication state and leaves the private routes unreadable. A lost-device response revokes refresh tokens and device sessions; encrypted native data is removed on the next authorized remote-wipe opportunity or by OS app removal. Backups and device transfer exclude app-private databases.

## Recovery evidence

Production approval requires a restore drill, point-in-time recovery timing, deletion job dry run, export checksum verification and a documented rollback owner. Each drill records commands, timestamps, row counts and approval identity without logging private payloads.
