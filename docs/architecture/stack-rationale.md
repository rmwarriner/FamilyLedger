# Stack Rationale

**Runtime: Tauri v2 (Rust backend) + TypeScript frontend**
- Tauri produces native binaries (~8MB vs Electron's ~120MB), uses the OS webview (no bundled Chromium), and exposes a Rust core that is ideal for cryptography, file I/O, and SQLite access at native speed.
- Tradeoff accepted: smaller plugin ecosystem than Electron; mitigated by the fact that all heavy logic (accounting engine, crypto, sync, import/export) lives in Rust, not in Node.
- Mobile support (iOS/Android) is a first-class Tauri v2 target — the scaffold must not make decisions that foreclose this path.

**Frontend: React 18 + TypeScript + Vite**
- React chosen over Svelte for ecosystem depth, hiring pool, and component library availability.
- Vite for fast HMR during development.
- TanStack Router for type-safe client-side routing.
- TanStack Query for async state and cache management.
- Zustand for lightweight global UI state.
- Radix UI primitives for accessible, unstyled component foundations.
- CSS Modules + CSS custom properties for theming; no Tailwind (too utility-class heavy for a design-system-first app).

**Database: SQLite via `better-sqlite3` (frontend process) + Drizzle ORM**
- SQLite lives in the Tauri app data directory.
- Drizzle ORM for type-safe schema definitions, migrations, and query building.
- Write-ahead logging (WAL mode) enabled by default.
- All schema migrations are versioned and forward-only.

**Encryption: libsodium (via `@serenity-kit/opaque` + Rust `sodiumoxide` crate)**
- Security model: The vault file on disk is encrypted at rest using a key derived from a user passphrase via Argon2id. The sync medium (Dropbox, iCloud, etc.) sees only ciphertext — it is treated as an untrusted file host.
- E2E between two users is achieved via a shared vault key that is never transmitted in plaintext — key exchange uses X25519 ECDH on first pairing.
- Encryption at rest is optional (user may choose an unencrypted local vault) but E2E sync encryption is always on when sync is enabled.
- Document this model fully in `docs/architecture/security-model.md`.

**Sync: CRDT-based conflict resolution via `automerge-repo`**
- The vault is an Automerge document. Sync adapters are pluggable: local filesystem, Dropbox, iCloud Drive, generic WebDAV.
- Two users (e.g. a household) can each modify the vault and sync via a shared cloud folder. Automerge handles concurrent edits without a central server.
- Sync state is surfaced in the UI with a clear indicator (synced / syncing / conflict / offline).

**Audit Trail: Append-only event log**
- All mutations are recorded as immutable event records in a separate `audit_log` table (write-ahead, never updated or deleted).
- Each event stores: timestamp (UTC), user identity, operation type, before/after snapshot (JSON), and a SHA-256 hash of the prior event (forming a hash chain for tamper detection).

**Testing: Vitest (frontend) + Rust `#[cfg(test)]` (backend) + Playwright (E2E)**
- All business logic (accounting engine, import parsers, report generators) must have unit test stubs.
- TDD: tests are written before or alongside stubs; all stub tests must fail with a clear `unimplemented!()` or `todo!()` marker.

**Logging: `pino` (frontend/Node bridge) + `tracing` crate (Rust)**
- Structured JSON logs in development; pretty-printed in dev mode.
- Log levels: ERROR, WARN, INFO, DEBUG, TRACE.
- All IPC calls between frontend and Rust backend are logged at DEBUG.
- No PII or account numbers in logs by default; a `scrub_pii` filter is applied at the log sink.
