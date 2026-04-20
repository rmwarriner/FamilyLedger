# Audit Trail

Every data mutation appends an immutable event row to `audit_log`.

Each event includes:
- UTC timestamp
- user identity
- operation type (`INSERT`, `UPDATE`, `DELETE`)
- table and record identity
- before/after JSON snapshots
- `prev_hash` and `this_hash` SHA-256 values

Integrity checks traverse hash links and fail fast on mismatch.
- IPC commands:
  - `verify_audit_integrity`: verifies the persisted hash chain and returns first invalid event id when broken.
  - `query_audit_log`: supports paginated event queries with optional table/operation filters.
