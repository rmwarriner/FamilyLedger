# AGENTS.md

## Purpose
This file defines repository-level operating rules for humans and AI agents contributing to FamilyLedger.

## New Chat Bootstrap
- For any new independent chat/session, load context in this order:
- `README.md` for project overview and command entrypoints.
- `ROADMAP.md` for active phase and near-term priorities.
- `docs/dev/github-workflows.md` for CI gates and required checks.
- `docs/architecture/security-model.md` and `docs/architecture/data-model.md` before touching security/data paths.
- Confirm milestone/issue alignment before implementation work starts.

## Required Workflow
- All changes must be proposed through a pull request to `main`.
- Direct pushes to `main` are blocked by branch protection.
- Keep commits focused and auditable.
- Preserve `TODO(impl):` markers unless implementing the behavior.
- Never commit secrets, credentials, or real financial PII.
- Every implementation issue should be assigned to a roadmap phase milestone.
- Add or refine forward-looking issues during weekly roadmap review.

## CI Expectations
The following workflows must stay green on pull requests to `main`:
- `build-test`
- `Analyze (javascript-typescript)`

Notes:
- `CI` runs on Ubuntu with parallel jobs (`typecheck-test`, `cargo-check`) and an umbrella required check (`build-test`).
- Current scaffold intentionally contains failing TODO test stubs; CI is configured to keep test failures non-gating until TODO implementation phase.
- `CodeQL` runs on PRs to `main`, pushes to `main`, and on weekly schedule.

## Workflow Files
- `/.github/workflows/ci.yml`
- `/.github/workflows/codeql.yml`
- `/.github/workflows/release.yml`

## MCP Baseline
- Keep the following Codex MCP servers enabled for this repo:
- `docs` (`@upstash/context7-mcp`) for up-to-date docs retrieval.
- `sqlite` (`mcp-server-sqlite`) for local SQLite inspection and query workflows.
- Enable Playwright MCP before starting Phase 2 implementation work and keep it enabled through UI/E2E delivery phases.

## Agent Change Checklist
- Update docs when workflow behavior changes.
- Keep branch protection required checks aligned with actual GitHub check run names.
- If a workflow/job name changes, update branch protection contexts immediately.
- Validate locally when possible:
  - `pnpm typecheck`
  - `pnpm test`
  - `cd apps/desktop/src-tauri && cargo check`
