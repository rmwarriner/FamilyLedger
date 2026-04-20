# GitHub Workflows

## Overview
FamilyLedger uses three GitHub Actions workflows:

1. **CI** (`.github/workflows/ci.yml`)
2. **CodeQL** (`.github/workflows/codeql.yml`)
3. **Release** (`.github/workflows/release.yml`)

## CI Workflow
- **Name:** `CI`
- **Triggers:** `push` to `main`, `pull_request`
- **Runner:** `ubuntu-latest`
- **Job name:** `build-test`
- **Concurrency:** one active run per ref/workflow (`cancel-in-progress: true`)
- **Checks produced:**
  - `build-test`

### Steps
- Checkout
- Setup pnpm and Node.js
- Setup Rust toolchain and Rust cache
- Install Linux system dependencies required for Tauri/WebKitGTK build scripts
- `pnpm install`
- `pnpm typecheck`
- `pnpm test || true` (non-gating while TODO test stubs remain)
- Create `apps/desktop/dist` placeholder for `tauri::generate_context!()`
- Rust compile check: `cargo check`

## CodeQL Workflow
- **Name:** `CodeQL`
- **Triggers:**
  - `push` to `main`
  - `pull_request` targeting `main`
  - weekly schedule (Monday 05:00 UTC)
- **Job name:** `Analyze`
- **Check produced:** `Analyze (javascript-typescript)`

## Release Workflow
- **Name:** `Release`
- **Trigger:** `workflow_dispatch`
- **Purpose:** manual build/sign/publish pipeline for Tauri artifacts.

## Enforcement on `main`
Branch protection enforces:
- Pull requests required
- Linear history
- Conversation resolution
- Admin enforcement
- No force pushes/deletions
- Required status checks:
  - `build-test`
  - `Analyze (javascript-typescript)`

If a job/check name changes, update branch protection required status checks in GitHub settings (or API) immediately.
