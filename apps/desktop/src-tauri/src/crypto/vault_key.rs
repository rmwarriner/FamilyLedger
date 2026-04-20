use sodiumoxide::crypto::pwhash::argon2id13;
#[cfg(test)]
use std::cell::RefCell;
use std::fs;
use std::path::PathBuf;
#[cfg(test)]
use std::time::{SystemTime, UNIX_EPOCH};

pub fn derive_vault_key(passphrase: &[u8], salt: argon2id13::Salt) -> Option<[u8; 32]> {
    if sodiumoxide::init().is_err() {
        return None;
    }

    let mut key = [0_u8; 32];
    let ops = argon2id13::OpsLimit(3);
    let mem = argon2id13::MemLimit(64 * 1024 * 1024);
    match argon2id13::derive_key(&mut key, passphrase, &salt, ops, mem) {
        Ok(_) => Some(key),
        Err(_) => None,
    }
}

#[cfg(test)]
thread_local! {
    static TEST_SALT_PATH: RefCell<Option<PathBuf>> = const { RefCell::new(None) };
}

#[cfg(test)]
fn salt_path() -> PathBuf {
    TEST_SALT_PATH.with(|cell| {
        if let Some(path) = cell.borrow().as_ref() {
            return path.clone();
        }
        let mut path = std::env::temp_dir();
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or_default();
        path.push(format!("familyledger-vault-salt-{nanos}.bin"));
        *cell.borrow_mut() = Some(path.clone());
        path
    })
}

#[cfg(not(test))]
fn salt_path() -> PathBuf {
    std::env::var("FAMILYLEDGER_VAULT_SALT_PATH")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from(".familyledger-data/vault.salt"))
}

pub fn load_or_create_vault_salt() -> Option<argon2id13::Salt> {
    let path = salt_path();
    if let Ok(bytes) = fs::read(&path) {
        if bytes.len() == argon2id13::SALTBYTES {
            let mut salt = [0_u8; argon2id13::SALTBYTES];
            salt.copy_from_slice(&bytes);
            return Some(argon2id13::Salt(salt));
        }
    }

    let salt = argon2id13::gen_salt();
    if let Some(parent) = path.parent() {
        if fs::create_dir_all(parent).is_err() {
            return None;
        }
    }
    if fs::write(&path, salt.0).is_err() {
        return None;
    }
    Some(salt)
}

#[cfg(test)]
mod tests {
    use super::{derive_vault_key, load_or_create_vault_salt};
    use sodiumoxide::crypto::pwhash::argon2id13;

    #[test]
    fn derives_deterministic_key_for_same_input() {
        let salt = argon2id13::Salt([7; argon2id13::SALTBYTES]);
        let one = derive_vault_key(b"correct horse battery staple", salt)
            .expect("first derivation should succeed");
        let two = derive_vault_key(b"correct horse battery staple", salt)
            .expect("second derivation should succeed");
        assert_eq!(one, two);
    }

    #[test]
    fn derived_key_changes_when_salt_changes() {
        let salt_a = argon2id13::Salt([1; argon2id13::SALTBYTES]);
        let salt_b = argon2id13::Salt([2; argon2id13::SALTBYTES]);
        let key_a = derive_vault_key(b"family-ledger-passphrase", salt_a)
            .expect("derivation should succeed");
        let key_b = derive_vault_key(b"family-ledger-passphrase", salt_b)
            .expect("derivation should succeed");
        assert_ne!(key_a, key_b);
    }

    #[test]
    fn loads_or_creates_persisted_salt() {
        let first = load_or_create_vault_salt().expect("first salt");
        let second = load_or_create_vault_salt().expect("second salt");
        assert_eq!(first.0, second.0);
    }
}
