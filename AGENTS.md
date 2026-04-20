# AGENTS.md

## Purpose
This file defines repository-level operating rules for humans and AI agents contributing to FamilyLedger.

## Required Workflow
- All changes must be proposed through a pull request to `main`.
- Direct pushes to `main` are blocked by branch protection.
- Keep commits focused and auditable.
- Preserve `TODO(impl):` markers unless implementing the behavior.
- Never commit secrets, credentials, or real financial PII.

## CI Expectations
The following workflows must stay green on pull requests to `main`:
- `build-test`
- `Analyze (javascript-typescript)`

Notes:
- `CI` runs on Ubuntu and includes Node typechecking/tests plus Rust/Tauri compile checks.
- Current scaffold intentionally contains failing TODO test stubs; CI is configured to keep test failures non-gating until TODO implementation phase.
- `CodeQL` runs on PRs to `main`, pushes to `main`, and on weekly schedule.

## Workflow Files
- `/.github/workflows/ci.yml`
- `/.github/workflows/codeql.yml`
- `/.github/workflows/release.yml`

## Agent Change Checklist
- Update docs when workflow behavior changes.
- Keep branch protection required checks aligned with actual GitHub check run names.
- If a workflow/job name changes, update branch protection contexts immediately.
- Validate locally when possible:
  - `pnpm typecheck`
  - `pnpm test`
  - `cd apps/desktop/src-tauri && cargo check`
