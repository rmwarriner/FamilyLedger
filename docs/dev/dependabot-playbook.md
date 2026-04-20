# Dependabot Playbook

## Goals
- Keep dependencies current with low merge friction.
- Avoid manual lockfile conflict resolution.
- Keep required checks green with minimal intervention.

## Default Flow
1. Review the PR scope and changed files.
2. Prefer small, single-purpose dependency updates.
3. Run verification:
   - `pnpm typecheck`
   - `cd apps/desktop/src-tauri && cargo check`
   - Optional targeted package tests for touched packages
4. Merge when required checks are green.

## Conflict Policy
- Do not hand-merge `pnpm-lock.yaml` conflict blocks.
- If a Dependabot PR is stale/conflicted:
1. Close the stale PR.
2. Create a fresh branch from latest `main`.
3. Apply dependency intent in `package.json` files only.
4. Run `pnpm install` to regenerate lockfile.
5. Re-run verification and open a replacement PR.

## CI Failure Triage
1. Check failing job first (`typecheck-test`, `cargo-check`, etc.).
2. Identify exact first error line before making changes.
3. Apply smallest compatibility fix possible.
4. Push fix directly to the Dependabot branch when practical.
5. Re-check workflow status after rerun.

## Known Repository Behavior
- Some scaffold tests intentionally fail via `TODO(impl)` placeholders.
- For dependency-only PRs, prioritize `typecheck` and compile checks unless the change directly affects runtime behavior under test.

## Practical Guardrails
- Keep major updates as isolated PRs.
- Avoid mixing tooling and runtime dependency upgrades in one manual PR.
- Preserve branch protection and required checks (`build-test`, `Analyze (javascript-typescript)`).
