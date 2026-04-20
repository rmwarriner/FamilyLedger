use crate::crypto::vault_key::{derive_vault_key, load_or_create_vault_salt};
#[cfg(test)]
use std::cell::RefCell;
use sha2::{Digest, Sha256};
use sodiumoxide::crypto::pwhash::argon2id13;
use std::fs;
use std::path::PathBuf;
#[cfg(test)]
use std::time::{SystemTime, UNIX_EPOCH};
use tracing::{debug, error};

#[cfg(test)]
thread_local! {
    static TEST_MARKER_PATH: RefCell<Option<PathBuf>> = const { RefCell::new(None) };
}

#[cfg(test)]
fn marker_path() -> PathBuf {
    TEST_MARKER_PATH.with(|cell| {
        if let Some(path) = cell.borrow().as_ref() {
            return path.clone();
        }
        let mut path = std::env::temp_dir();
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or_default();
        path.push(format!("familyledger-vault-marker-{nanos}.bin"));
        *cell.borrow_mut() = Some(path.clone());
        path
    })
}

#[cfg(not(test))]
fn marker_path() -> PathBuf {
    std::env::var("FAMILYLEDGER_VAULT_MARKER_PATH")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from(".familyledger-data/vault.keycheck"))
}

fn key_marker(key: &[u8; 32]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(key);
    hasher.update(b"familyledger-vault-marker-v1");
    hex::encode(hasher.finalize())
}

#[tauri::command]
pub async fn unlock_vault(passphrase: String) -> Result<bool, String> {
    debug!(
        command = "unlock_vault",
        passphrase_len = passphrase.len(),
        "IPC command entry"
    );
    if passphrase.is_empty() {
        error!(
            code = "VAULT_UNLOCK_FAILURE",
            "Unlock failed due to empty passphrase"
        );
        return Ok(false);
    }
    let salt = load_or_create_vault_salt()
        .unwrap_or(argon2id13::Salt([0x11; argon2id13::SALTBYTES]));
    let key = match derive_vault_key(passphrase.as_bytes(), salt) {
        Some(key) => key,
        None => {
            error!(
                code = "VAULT_UNLOCK_FAILURE",
                "Unlock failed during key derivation"
            );
            return Ok(false);
        }
    };
    let marker = key_marker(&key);
    let marker_path = marker_path();
    if let Some(parent) = marker_path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    if let Ok(existing) = fs::read_to_string(&marker_path) {
        if existing.trim() != marker {
            error!(
                code = "VAULT_UNLOCK_FAILURE",
                "Unlock failed due to passphrase mismatch"
            );
            return Ok(false);
        }
    } else if fs::write(&marker_path, marker.as_bytes()).is_err() {
        error!(
            code = "VAULT_UNLOCK_FAILURE",
            "Unlock failed while persisting vault marker"
        );
        return Ok(false);
    }
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::unlock_vault;

    #[test]
    fn persists_marker_and_rejects_wrong_passphrase() {
        let first = tauri::async_runtime::block_on(unlock_vault("passphrase-1".to_string()))
            .expect("first unlock call");
        assert!(first);
        let second = tauri::async_runtime::block_on(unlock_vault("passphrase-1".to_string()))
            .expect("second unlock call");
        assert!(second);
        let wrong = tauri::async_runtime::block_on(unlock_vault("wrong-passphrase".to_string()))
            .expect("wrong unlock call");
        assert!(!wrong);
    }
}
