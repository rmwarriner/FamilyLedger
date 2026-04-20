use super::adapter::{SyncAdapter, SyncStatus};
use reqwest::blocking::Client;
use reqwest::StatusCode;
use serde::Serialize;
use std::time::Duration;

pub struct DropboxAdapter {
    token: Option<String>,
    remote_path: String,
    client: Client,
}

#[derive(Serialize)]
struct DropboxPathBody<'a> {
    path: &'a str,
}

impl Default for DropboxAdapter {
    fn default() -> Self {
        let token = std::env::var("FAMILYLEDGER_DROPBOX_ACCESS_TOKEN").ok();
        let remote_path = std::env::var("FAMILYLEDGER_DROPBOX_SYNC_PATH")
            .unwrap_or_else(|_| "/familyledger/ledger.sync.enc".to_string());
        let client = Client::builder()
            .timeout(Duration::from_secs(20))
            .build()
            .unwrap_or_else(|_| Client::new());
        Self {
            token,
            remote_path,
            client,
        }
    }
}

impl DropboxAdapter {
    fn auth_header(&self) -> Result<String, String> {
        self.token
            .as_ref()
            .map(|token| format!("Bearer {token}"))
            .ok_or_else(|| "dropbox adapter missing FAMILYLEDGER_DROPBOX_ACCESS_TOKEN".to_string())
    }
}

impl SyncAdapter for DropboxAdapter {
    fn read(&self) -> Result<Vec<u8>, String> {
        let auth = self.auth_header()?;
        let api_arg = serde_json::json!({ "path": self.remote_path }).to_string();
        let response = self
            .client
            .post("https://content.dropboxapi.com/2/files/download")
            .header("Authorization", auth)
            .header("Dropbox-API-Arg", api_arg)
            .send()
            .map_err(|error| format!("dropbox download request failed: {error}"))?;

        if response.status() == StatusCode::CONFLICT || response.status() == StatusCode::NOT_FOUND {
            return Ok(vec![]);
        }
        if !response.status().is_success() {
            return Err(format!(
                "dropbox download failed with status {}",
                response.status()
            ));
        }
        response
            .bytes()
            .map(|bytes| bytes.to_vec())
            .map_err(|error| format!("dropbox download read failed: {error}"))
    }

    fn write(&self, payload: Vec<u8>) -> Result<(), String> {
        let auth = self.auth_header()?;
        let api_arg = serde_json::json!({
            "path": self.remote_path,
            "mode": "overwrite",
            "autorename": false,
            "mute": true
        })
        .to_string();
        let response = self
            .client
            .post("https://content.dropboxapi.com/2/files/upload")
            .header("Authorization", auth)
            .header("Content-Type", "application/octet-stream")
            .header("Dropbox-API-Arg", api_arg)
            .body(payload)
            .send()
            .map_err(|error| format!("dropbox upload request failed: {error}"))?;
        if !response.status().is_success() {
            return Err(format!(
                "dropbox upload failed with status {}",
                response.status()
            ));
        }
        Ok(())
    }

    fn poll(&self) -> Result<SyncStatus, String> {
        let auth = match self.auth_header() {
            Ok(value) => value,
            Err(_) => {
                return Ok(SyncStatus {
                    state: "offline".to_string(),
                    bytes_transferred: 0,
                    last_sync_at: None,
                })
            }
        };
        let response = self
            .client
            .post("https://api.dropboxapi.com/2/files/get_metadata")
            .header("Authorization", auth)
            .json(&DropboxPathBody {
                path: self.remote_path.as_str(),
            })
            .send()
            .map_err(|error| format!("dropbox metadata request failed: {error}"))?;
        if response.status() == StatusCode::CONFLICT || response.status() == StatusCode::NOT_FOUND {
            return Ok(SyncStatus {
                state: "offline".to_string(),
                bytes_transferred: 0,
                last_sync_at: None,
            });
        }
        if !response.status().is_success() {
            return Err(format!(
                "dropbox metadata failed with status {}",
                response.status()
            ));
        }
        let json: serde_json::Value = response
            .json()
            .map_err(|error| format!("dropbox metadata parse failed: {error}"))?;
        let bytes_transferred = json["size"].as_u64().unwrap_or_default() as usize;
        let last_sync_at = json["server_modified"].as_str().map(|s| s.to_string());
        Ok(SyncStatus {
            state: "synced".to_string(),
            bytes_transferred,
            last_sync_at,
        })
    }
}
