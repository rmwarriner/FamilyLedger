# Phase 4 Tranche A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the first production-ready Phase 4 slice for filesystem sync, audit integrity verification, vault-key derivation, and sync/audit UI status wiring.

**Architecture:** Keep changes incremental and auditable by implementing backend core primitives first, exposing typed IPC commands second, and wiring lightweight frontend consumers last. Preserve `TODO(impl):` markers for deferred Dropbox/WebDAV, X25519 workflow, and full audit pagination/filtering.

**Tech Stack:** Rust (`tauri`, `sodiumoxide`, `sha2`), React + TypeScript (`@tanstack/react-query`, Zustand), Vitest, Cargo tests/check.

---

### Task 1: Implement and test filesystem sync adapter

**Files:**
- Modify: `apps/desktop/src-tauri/src/sync/filesystem.rs`

- [ ] **Step 1: Write failing tests for read/write/poll semantics**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement atomic write/read and status logic**
- [ ] **Step 4: Verify tests pass**

### Task 2: Implement audit hash-chain verification

**Files:**
- Modify: `apps/desktop/src-tauri/src/audit/event_log.rs`

- [ ] **Step 1: Write failing tests for valid and invalid chains**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement hash-chain traversal and verification**
- [ ] **Step 4: Verify tests pass**

### Task 3: Implement Argon2id vault key derivation

**Files:**
- Modify: `apps/desktop/src-tauri/src/crypto/vault_key.rs`

- [ ] **Step 1: Write failing tests for deterministic derivation and salt variance**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement Argon2id key derivation with security-model parameters**
- [ ] **Step 4: Verify tests pass**

### Task 4: Expose sync and audit IPC for UI lifecycle/integrity

**Files:**
- Modify: `apps/desktop/src-tauri/src/commands/sync.rs`
- Modify: `apps/desktop/src-tauri/src/commands/mod.rs`
- Modify: `apps/desktop/src-tauri/src/lib.rs`
- Create: `apps/desktop/src-tauri/src/commands/audit.rs`

- [ ] **Step 1: Add failing command-level tests for payloads**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement command handlers and invoke wiring**
- [ ] **Step 4: Verify tests pass**

### Task 5: Implement logging scrubber

**Files:**
- Create: `apps/desktop/src-tauri/src/logging/mod.rs`
- Modify: `apps/desktop/src-tauri/src/lib.rs`

- [ ] **Step 1: Write failing redaction tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement scrubber and tracing integration**
- [ ] **Step 4: Verify tests pass**

### Task 6: Wire frontend sync polling and audit integrity display

**Files:**
- Modify: `apps/desktop/src/components/domain/SyncStatusIndicator.tsx`
- Modify: `apps/desktop/src/pages/AuditLog.tsx`
- Create: `apps/desktop/src/ipc/audit.ts`
- Create: `apps/desktop/src/hooks/useSyncStatusPolling.ts`
- Modify: `apps/desktop/src/components/layout/AppShell.tsx`

- [ ] **Step 1: Add failing frontend tests for sync polling and audit status render**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement polling hook and audit integrity UI**
- [ ] **Step 4: Verify tests pass**

### Task 7: Verification run

**Files:**
- Modify: `docs/architecture/security-model.md` (if parameter clarifications are needed)

- [ ] **Step 1: Run `pnpm typecheck`**
- [ ] **Step 2: Run `pnpm test`**
- [ ] **Step 3: Run `cd apps/desktop/src-tauri && cargo check`**
- [ ] **Step 4: Record any remaining Phase 4 TODO coverage gaps**
