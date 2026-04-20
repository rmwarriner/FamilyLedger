# Dependency Update Policy

## Goals
- Keep dependencies current without destabilizing delivery.

## Policy
- Dependabot PRs are reviewed weekly.
- Batch low-risk dev-tooling updates when possible.
- Security updates are prioritized and merged quickly after checks pass.
- Runtime dependency major bumps require explicit compatibility validation.

## Merge Criteria
- CI green (`build-test`, `Analyze`)
- No breaking compile/test regressions
- Changelog update if user-facing behavior changes

## Cadence
- Weekly review for open dependency PRs.
- Monthly cleanup for stale or superseded upgrade branches.
