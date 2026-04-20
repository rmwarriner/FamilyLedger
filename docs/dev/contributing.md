# Contributing

- Start with [AGENTS.md](../../AGENTS.md) for repository operating rules.
- Use [CONTRIBUTING.md](../../CONTRIBUTING.md) for branch naming, commit conventions, and Definition of Done.
- See [github-workflows.md](./github-workflows.md) for CI/release workflow details and enforcement expectations.
- Use [dependabot-playbook.md](./dependabot-playbook.md) when triaging dependency PR conflicts or CI regressions.
- Follow TDD scaffold rules: add/adjust tests with every exported function.
- Keep `TODO(impl):` comments precise and actionable.
- Do not introduce `any` in TypeScript.
- Route user-facing failures through typed `AppError` entries.
- Keep logs scrubbed of PII and sensitive financial identifiers.
