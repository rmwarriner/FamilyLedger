# Sync Model

FamilyLedger sync uses Automerge CRDT state and pluggable Rust `SyncAdapter` implementations.

- Adapters: filesystem, Dropbox, and WebDAV.
- Trigger points: app launch, periodic interval (default 5 minutes), post-commit after transaction save.
- Sync states surfaced to UI: `synced`, `syncing`, `conflict`, `offline`.
- Sync runs in background and must never block user interactions.
- Adapter authentication is environment-backed in this phase:
  - Dropbox: `FAMILYLEDGER_DROPBOX_ACCESS_TOKEN`, `FAMILYLEDGER_DROPBOX_SYNC_PATH`
  - WebDAV: `FAMILYLEDGER_WEBDAV_BASE_URL`, `FAMILYLEDGER_WEBDAV_USERNAME`, `FAMILYLEDGER_WEBDAV_PASSWORD`, `FAMILYLEDGER_WEBDAV_SYNC_PATH`
- The backend exposes `poll_sync_status` and `sync_now` IPC commands with adapter selection for lifecycle-aware UI controls.
