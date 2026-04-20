# Phase 4 Sync Audit Security Design

**Date:** 2026-04-20  
**Scope:** Begin Phase 4 implementation with an end-to-end vertical slice that is immediately testable and expandable.

## Context

Phase 4 in `ROADMAP.md` includes four independent subsystems:
- Rust sync adapters (filesystem production path, Dropbox/WebDAV progressive support)
- Audit append-only/hash-chain verification
- Vault/sync key flows (Argon2id + X25519 pairing)
- Logging scrubber and policy validation

To avoid broad risky edits, this design decomposes Phase 4 into tranches. This session implements **Tranche A**.

## Tranche A Goals

1. Make filesystem sync adapter functional for local encrypted payload read/write and status polling.
2. Implement audit hash-chain verification logic and expose an integrity-check IPC command.
3. Implement Argon2id vault key derivation with repository security parameters.
4. Add runtime log message scrubbing for sensitive patterns.
5. Surface sync lifecycle in UI via periodic polling and show audit integrity status in the Audit Log page.

## Architecture

### Sync
- `FilesystemAdapter` gains a configured root directory and document filename.
- Reads return payload bytes when file exists, empty bytes when file is absent.
- Writes are atomic via temporary-file write + rename.
- `poll_sync_status` uses adapter state to return `synced`/`offline` plus `lastSyncAt`.

### Audit Integrity
- `AuditEvent` verification checks:
- `prev_hash` of first event must be absent.
- each event hash must match recomputed hash.
- each event `prev_hash` must equal previous event computed hash.
- New IPC command `verify_audit_integrity` returns boolean to UI.

### Security
- `derive_vault_key` uses sodiumoxide Argon2id with:
- memory = 64 MiB
- opslimit = moderate profile (`OPSLIMIT_MODERATE`)
- parallelism is handled internally by sodiumoxide profile constants.
- Logging scrubber redacts account numbers, routing numbers, SSNs, and emails in formatted log events.

### Frontend
- Sync status polling runs on interval and updates Zustand store.
- `AuditLog` page calls integrity IPC and displays status result.

## Error Handling

- Sync adapter methods return contextual `String` errors with operation name.
- IPC commands map backend failures to user-safe error messages.
- Audit verification fails closed (`false`) on chain mismatch.

## Testing Strategy

- Rust unit tests for:
- filesystem adapter read/write semantics
- audit chain verification pass/fail scenarios
- vault key derivation deterministic properties (same input => same key, salt changes key)
- log scrubber redaction behavior
- command DTO mapping for sync/audit status
- Frontend tests for:
- sync polling updates store
- audit page renders integrity state

## Deferred to Later Tranches

- Dropbox/WebDAV network adapters and auth orchestration (`TODO(impl)` preserved).
- X25519 pairing UX and transport flows.
- Audit pagination/filtering API and server-side query path.
- Conflict resolution UX for sync.
