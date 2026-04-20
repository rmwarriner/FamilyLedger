# AI Harness

The AI harness provides a provider abstraction for local and hosted models.

- Contract: `AiProvider` with `chat`, `stream`, `listModels`, and `isAvailable`.
- Implementations: Ollama (working reference), OpenAI (working reference), Anthropic/Gemini (stubs).
- Prompt hygiene: ledger context is scrubbed to remove direct identifiers and round amounts.
- Key management: provider credentials are vault-managed and never stored in plaintext config.

TODO(impl): add provider capability negotiation and streaming token telemetry.
