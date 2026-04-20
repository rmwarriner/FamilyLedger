use super::adapter::{SyncAdapter, SyncStatus};
use reqwest::blocking::Client;
use reqwest::StatusCode;
use std::time::Duration;

pub struct WebdavAdapter {
    base_url: Option<String>,
    username: Option<String>,
    password: Option<String>,
    path: String,
    client: Client,
}

impl Default for WebdavAdapter {
    fn default() -> Self {
        let base_url = std::env::var("FAMILYLEDGER_WEBDAV_BASE_URL").ok();
        let username = std::env::var("FAMILYLEDGER_WEBDAV_USERNAME").ok();
        let password = std::env::var("FAMILYLEDGER_WEBDAV_PASSWORD").ok();
        let path = std::env::var("FAMILYLEDGER_WEBDAV_SYNC_PATH")
            .unwrap_or_else(|_| "ledger.sync.enc".to_string());
        let client = Client::builder()
            .timeout(Duration::from_secs(20))
            .build()
            .unwrap_or_else(|_| Client::new());
        Self {
            base_url,
            username,
            password,
            path,
            client,
        }
    }
}

impl WebdavAdapter {
    fn remote_url(&self) -> Result<String, String> {
        let base = self
            .base_url
            .as_ref()
            .ok_or_else(|| "webdav adapter missing FAMILYLEDGER_WEBDAV_BASE_URL".to_string())?;
        let normalized = base.trim_end_matches('/');
        Ok(format!("{normalized}/{}", self.path.trim_start_matches('/')))
    }
}

impl SyncAdapter for WebdavAdapter {
    fn read(&self) -> Result<Vec<u8>, String> {
        let url = self.remote_url()?;
        let mut request = self.client.get(url);
        if let Some(username) = &self.username {
            request = request.basic_auth(username, self.password.clone());
        }
        let response = request
            .send()
            .map_err(|error| format!("webdav read request failed: {error}"))?;
        if response.status() == StatusCode::NOT_FOUND {
            return Ok(vec![]);
        }
        if !response.status().is_success() {
            return Err(format!("webdav read failed with status {}", response.status()));
        }
        response
            .bytes()
            .map(|bytes| bytes.to_vec())
            .map_err(|error| format!("webdav read bytes failed: {error}"))
    }

    fn write(&self, payload: Vec<u8>) -> Result<(), String> {
        let url = self.remote_url()?;
        let mut request = self.client.put(url).body(payload);
        if let Some(username) = &self.username {
            request = request.basic_auth(username, self.password.clone());
        }
        let response = request
            .send()
            .map_err(|error| format!("webdav write request failed: {error}"))?;
        if !response.status().is_success() {
            return Err(format!("webdav write failed with status {}", response.status()));
        }
        Ok(())
    }

    fn poll(&self) -> Result<SyncStatus, String> {
        let url = match self.remote_url() {
            Ok(value) => value,
            Err(_) => {
                return Ok(SyncStatus {
                    state: "offline".to_string(),
                    bytes_transferred: 0,
                    last_sync_at: None,
                })
            }
        };
        let mut request = self.client.head(url);
        if let Some(username) = &self.username {
            request = request.basic_auth(username, self.password.clone());
        }
        let response = request
            .send()
            .map_err(|error| format!("webdav poll request failed: {error}"))?;
        if response.status() == StatusCode::NOT_FOUND {
            return Ok(SyncStatus {
                state: "offline".to_string(),
                bytes_transferred: 0,
                last_sync_at: None,
            });
        }
        if !response.status().is_success() {
            return Err(format!("webdav poll failed with status {}", response.status()));
        }
        let bytes_transferred = response
            .headers()
            .get("content-length")
            .and_then(|v| v.to_str().ok())
            .and_then(|s| s.parse::<usize>().ok())
            .unwrap_or_default();
        let last_sync_at = response
            .headers()
            .get("last-modified")
            .and_then(|v| v.to_str().ok())
            .map(|s| s.to_string());
        Ok(SyncStatus {
            state: "synced".to_string(),
            bytes_transferred,
            last_sync_at,
        })
    }
}
