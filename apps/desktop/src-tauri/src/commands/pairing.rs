use serde::{Deserialize, Serialize};
use tracing::debug;

use crate::crypto::sync_key::{derive_sync_shared_secret, generate_sync_key_pair};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PairingBundleDto {
    pub private_key_hex: String,
    pub public_key_hex: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompletePairingRequest {
    pub private_key_hex: String,
    pub peer_public_key_hex: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CompletePairingDto {
    pub shared_secret_hex: String,
}

#[tauri::command]
pub async fn begin_pairing() -> Result<PairingBundleDto, String> {
    debug!(command = "begin_pairing", "IPC command entry");
    let key_pair = generate_sync_key_pair().ok_or_else(|| "failed to generate keypair".to_string())?;
    Ok(PairingBundleDto {
        private_key_hex: hex::encode(key_pair.private),
        public_key_hex: hex::encode(key_pair.public),
    })
}

#[tauri::command]
pub async fn complete_pairing(request: CompletePairingRequest) -> Result<CompletePairingDto, String> {
    debug!(command = "complete_pairing", "IPC command entry");
    let private_vec = hex::decode(request.private_key_hex)
        .map_err(|e| format!("invalid private key hex: {e}"))?;
    let public_vec = hex::decode(request.peer_public_key_hex)
        .map_err(|e| format!("invalid peer public key hex: {e}"))?;
    if private_vec.len() != 32 || public_vec.len() != 32 {
        return Err("pairing keys must be 32 bytes each".to_string());
    }
    let mut private_key = [0_u8; 32];
    private_key.copy_from_slice(&private_vec);
    let mut peer_public_key = [0_u8; 32];
    peer_public_key.copy_from_slice(&public_vec);
    let shared_secret = derive_sync_shared_secret(private_key, peer_public_key)
        .ok_or_else(|| "failed to derive shared secret".to_string())?;
    Ok(CompletePairingDto {
        shared_secret_hex: hex::encode(shared_secret),
    })
}

#[cfg(test)]
mod tests {
    use super::{begin_pairing, complete_pairing, CompletePairingRequest};

    #[test]
    fn completes_pairing_with_valid_keys() {
        let a = tauri::async_runtime::block_on(begin_pairing()).expect("pairing a");
        let b = tauri::async_runtime::block_on(begin_pairing()).expect("pairing b");

        let a_shared = tauri::async_runtime::block_on(complete_pairing(CompletePairingRequest {
            private_key_hex: a.private_key_hex.clone(),
            peer_public_key_hex: b.public_key_hex.clone(),
        }))
        .expect("a shared");

        let b_shared = tauri::async_runtime::block_on(complete_pairing(CompletePairingRequest {
            private_key_hex: b.private_key_hex,
            peer_public_key_hex: a.public_key_hex,
        }))
        .expect("b shared");

        assert_eq!(a_shared.shared_secret_hex, b_shared.shared_secret_hex);
    }
}
