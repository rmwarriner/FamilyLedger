# Getting Started

## Prerequisites
- Node.js 22+
- pnpm 9+
- Rust stable toolchain
- Tauri system prerequisites for your OS

## Setup
1. `pnpm install`
2. `pnpm dev`

## VS Code
- Open the repository root and install workspace-recommended extensions from `.vscode/extensions.json`.
- Keep workspace settings in `.vscode/settings.json` enabled for consistent lint/format behavior.

## MCP Baseline (Codex)
- Enable `docs` MCP (`@upstash/context7-mcp`) for docs lookup.
- Enable `sqlite` MCP (`mcp-server-sqlite`) for local database inspection.
- Enable Playwright MCP before starting roadmap Phase 2 work and keep it enabled through E2E delivery.

## Verification
- Typecheck: `pnpm typecheck`
- Tests: `pnpm test`
- Rust check: `cd apps/desktop/src-tauri && cargo check`
