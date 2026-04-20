use sodiumoxide::crypto::pwhash::argon2id13;

pub fn derive_vault_key(_passphrase: &[u8], _salt: argon2id13::Salt) -> Option<[u8; 32]> {
    // TODO(impl): derive AES-256-GCM key with Argon2id m=64MB, t=3, p=4.
    None
}
