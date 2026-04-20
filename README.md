# FamilyLedger

FamilyLedger is a cross-platform household accounting desktop application scaffold built on Tauri v2 + React + TypeScript.

## Prerequisites
- Node.js 22+
- pnpm 9+
- Rust stable toolchain
- Tauri system dependencies for your OS

## Quick Start
1. Install dependencies:
   - `pnpm install`
2. Run desktop app frontend dev server:
   - `pnpm dev`

## Verification Commands
- `pnpm typecheck`
- `pnpm test`
- `cd apps/desktop/src-tauri && cargo check`

## Workspace Structure
- `apps/desktop`: Tauri desktop application (frontend + Rust backend)
- `packages/*`: Shared domain and feature packages
- `docs/architecture`: Architecture, security, sync, and audit documents
- `e2e`: Playwright E2E scaffold

## Governance and CI
- Agent and contributor operating rules: [AGENTS.md](AGENTS.md)
- Workflow documentation: [docs/dev/github-workflows.md](docs/dev/github-workflows.md)

## Notes
- Scaffold intentionally contains failing TDD test stubs for unimplemented behavior.
- Unimplemented paths are marked with `TODO(impl):` comments.
