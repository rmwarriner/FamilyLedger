# Contributing

See [AGENTS.md](AGENTS.md) for operating rules and [docs/dev/github-workflows.md](docs/dev/github-workflows.md) for CI details.

## Branch and PR Workflow
- Create a branch from `main`.
- Use branch naming conventions:
  - `feat/<topic>`
  - `fix/<topic>`
  - `docs/<topic>`
  - `ci/<topic>`
  - `chore/<topic>`
- Open a pull request to `main`.
- Link the PR to an issue and milestone.

## Commit Message Convention
Use concise Conventional Commit style:
- `feat: ...`
- `fix: ...`
- `docs: ...`
- `ci: ...`
- `chore: ...`
- `refactor: ...`
- `test: ...`

## Definition of Done
Before merge:
- [ ] Acceptance criteria in linked issue are met
- [ ] Milestone is assigned and correct
- [ ] `pnpm typecheck` passes
- [ ] `cd apps/desktop/src-tauri && cargo check` passes
- [ ] Tests updated for changed behavior
- [ ] No secrets or PII introduced
- [ ] Relevant docs updated (`README`, `ROADMAP`, `docs/dev`, architecture docs)

## Security and Data
- Never commit credentials, tokens, or real personal/financial data.
- Use synthetic fixtures only.
- Route vulnerabilities through private reporting in [SECURITY](.github/SECURITY.md).
