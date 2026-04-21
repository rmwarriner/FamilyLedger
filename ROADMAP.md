# FamilyLedger Roadmap

## Planning Model
- `ROADMAP.md` is the product and technical sequencing source of truth.
- GitHub Milestones track execution status of roadmap phases.
- Issues/PRs are mapped to milestones for day-to-day delivery.

## Roadmap Maintenance Cadence
- Weekly: review current milestone progress and update linked execution issues.
- Weekly: add at least one forward-looking issue that de-risks a future phase.
- Monthly: review milestone due dates and rebalance scope if needed.
- On phase completion: close the milestone and open/refine execution issues for the next phase.
- Keep this file stable; edit only for sequencing, scope, or acceptance-criteria changes.

## Current Status (April 21, 2026)
- Scaffold complete: monorepo, app/package structure, architecture docs, CI, branch protection, and PR workflow.
- CI optimization complete: parallel checks with required umbrella gate.
- Phase 4 complete: sync adapter lifecycle, audit integrity verification/query, vault and pairing security flows, and security-model documentation merged via PR #39.
- Phase 5 implementation complete in branch delivery: transaction split UX + keyboard workflow, recoverable import wizard, audit pagination/filter UX, and running critical Playwright scenarios.
- Remaining work: release-signing/publish hardening and backlog items outside the closed roadmap phases.

## Phase 1 — Core Domain Foundations
### Goals
- Make shared primitives and accounting domain logic production-ready.
- Replace failing TODO test stubs with real tests for foundation packages.
### Scope
- `packages/shared`: harden `Money`, currency, date utilities, and result typing.
- `packages/accounting-engine`: complete ledger validation/application/reversal and balance/trial-balance behavior.
- `packages/schema`: finalize Drizzle schema constraints and migration baseline.
### Exit Criteria
- Foundation package tests pass for implemented behavior.
- No TODO stubs remain in foundation-critical paths.
- `pnpm typecheck` and `cargo check` remain green.

## Phase 2 — Data Ingestion and Budget Engines
### Goals
- Deliver real import pipelines and budget calculations.
### Scope
- `packages/importers`: OFX/QIF/CSV/MT940/GnuCash parse paths with fixtures and dedup rules.
- `packages/budgets`: envelope/tracking engines, rollover/overspend policy behaviors.
- Desktop import and budget IPC wiring to backend stubs.
- Enable Playwright MCP at Phase 2 start to support implementation and validation loops for desktop import/budget flows.
### Exit Criteria
- Importers parse fixture sets with deterministic output.
- Budget engines produce validated summary outputs.
- Import wizard/budget screens move from placeholders to usable flows.

## Phase 3 — Reports and Scheduled Transactions
### Goals
- Provide reliable reporting output and scheduled posting workflows.
### Scope
- `packages/reports`: built-in report implementations and custom report engine MVP.
- Scheduled transaction processing: overdue detection, auto-post/manual-review paths.
- Forecast report wiring to scheduled and historical transaction data.
### Exit Criteria
- Core report set returns real row/total payloads.
- Scheduled transaction logic is executable and auditable.
- UI report/scheduled pages consume real data via typed IPC.

## Phase 4 — Sync, Audit, and Security Hardening
### Goals
- Implement trust model behaviors and integrity guarantees.
### Status
- Completed April 21, 2026 (merged PR #39).
### Scope
- Rust sync adapters: filesystem production implementation, Dropbox/WebDAV progressive support.
- Audit log append-only enforcement and hash-chain verification endpoint.
- Vault/sync key flows: Argon2id derivation, X25519 pairing workflow stubs to production.
- Logging scrubber implementation and policy validation.
### Exit Criteria
- Sync status and lifecycle visible and functional in UI.
- Audit integrity checks pass on real event streams.
- Security model controls documented and validated in code paths.

## Phase 5 — UX Completion and E2E Reliability
### Goals
- Complete primary user journeys and stabilize release quality.
### Status
- Completed April 21, 2026 (implementation branch: `feat/phase5-ux-e2e-complete`).
### Scope
- Transaction form and split editor full behavior (keyboard-first flow, live balancing, validation UX).
- Import wizard full-step recoverable flow.
- Audit log page filtering/pagination UX.
- Playwright scenarios converted from `test.skip()` to running tests for critical paths.
### Exit Criteria
- Critical-path E2E tests pass in CI.
- No placeholder UX on core flows (transactions/import/sync/audit).
- Release workflow ready for signing/publish hardening.

## Cross-Cutting Backlog
- Dependency upgrades from open Dependabot PRs (batched and validated).
- Observability improvements: structured metrics and runtime diagnostics.
- Performance pass on large ledgers/import volumes.
- Mobile compatibility guardrails in frontend layer.
