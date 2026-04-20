# Contributing

- Start with [AGENTS.md](../../AGENTS.md) for repository operating rules.
- See [github-workflows.md](./github-workflows.md) for CI/release workflow details and enforcement expectations.
- Follow TDD scaffold rules: add/adjust tests with every exported function.
- Keep `TODO(impl):` comments precise and actionable.
- Do not introduce `any` in TypeScript.
- Route user-facing failures through typed `AppError` entries.
- Keep logs scrubbed of PII and sensitive financial identifiers.
