# Sync Model

FamilyLedger sync uses Automerge CRDT state and pluggable Rust `SyncAdapter` implementations.

- Adapters: filesystem (implemented scaffold), Dropbox (stub), WebDAV (stub).
- Trigger points: app launch, periodic interval (default 5 minutes), post-commit after transaction save.
- Sync states surfaced to UI: `synced`, `syncing`, `conflict`, `offline`.
- Sync runs in background and must never block user interactions.

TODO(impl): add conflict resolution flows and adapter authentication orchestration.
