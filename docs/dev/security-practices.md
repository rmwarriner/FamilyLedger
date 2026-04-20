# Security Practices

## Secrets Handling
- Never commit API keys, tokens, passphrases, or secrets.
- Store local secrets in `.env` files excluded by `.gitignore`.
- Use least-privilege tokens for automation.

## Data Classification
- `Public`: source code, synthetic test fixtures, docs.
- `Internal`: planning artifacts, non-sensitive logs.
- `Sensitive`: account identifiers, personal details, financial records, auth material.

## Logging Rules
- Do not log raw account numbers, routing numbers, SSNs, or email addresses.
- Use scrubbers/redaction before persisting logs.
- Prefer structured logs with sanitized fields.

## Vulnerability Process
- Use GitHub private advisories for reporting.
- Triage severity and impact first.
- Patch and ship with changelog entry under `Security`.
