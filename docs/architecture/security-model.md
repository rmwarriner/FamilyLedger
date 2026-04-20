# Security Model

**Threat model:** The sync medium (Dropbox, iCloud, etc.) is untrusted. A device that is lost or stolen may expose the local vault file. A network attacker can observe sync traffic.

**Defenses:**
1. **Vault encryption at rest (optional):** AES-256-GCM keyed by a key derived from the user's passphrase via Argon2id (m=64MB, t=3, p=4). Salt is persisted locally (`FAMILYLEDGER_VAULT_SALT_PATH`, default `.familyledger-data/vault.salt`). If the user opts out, the vault is stored as plaintext SQLite.
2. **Sync encryption (always on when sync is enabled):** The vault binary is encrypted before being written to the sync folder. The encryption key is the vault key. The sync medium sees only opaque ciphertext.
3. **Key exchange for multi-user households:** On first pairing, both devices perform an X25519 ECDH key exchange over a QR-code-based out-of-band channel (one device displays, the other scans). The resulting shared secret is used to encrypt key material for transmission. Backend pairing commands (`begin_pairing`, `complete_pairing`) now derive and validate shared secrets.
4. **No key escrow:** FamilyLedger never transmits keys or passphrases to any server. There is no account recovery if a passphrase is lost (with encryption enabled). This must be communicated clearly to the user during vault creation.
5. **PII in logs:** The logging layer applies a `scrub_pii` filter that redacts strings matching patterns for account numbers, routing numbers, SSNs, and email addresses before writing to log sinks.
