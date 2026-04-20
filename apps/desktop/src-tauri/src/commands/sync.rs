use crate::sync::adapter::SyncAdapter;
use crate::sync::dropbox::DropboxAdapter;
use crate::sync::filesystem::FilesystemAdapter;
use crate::sync::webdav::WebdavAdapter;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tracing::{debug, info};
use crate::db::connection::open_sqlite;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncRequest {
    pub adapter: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncStatusDto {
    pub status: String,
    pub last_sync_at: Option<String>,
    pub bytes_transferred: usize,
    pub adapter: String,
}

fn selected_adapter(adapter_name: Option<String>) -> (String, Box<dyn SyncAdapter>) {
    match adapter_name.as_deref() {
        Some("dropbox") => ("dropbox".to_string(), Box::new(DropboxAdapter::default())),
        Some("webdav") => ("webdav".to_string(), Box::new(WebdavAdapter::default())),
        _ => (
            "filesystem".to_string(),
            Box::new(FilesystemAdapter::default()),
        ),
    }
}

fn persist_sync_state(state: &str, last_sync_at: Option<&str>) -> Result<(), String> {
    let connection = open_sqlite().map_err(|e| format!("open sqlite failed: {e}"))?;
    connection
        .execute(
            "UPDATE sync_state
             SET last_sync_at = ?1, conflict_status = ?2, updated_at = CURRENT_TIMESTAMP
             WHERE id = 'singleton'",
            params![last_sync_at, state],
        )
        .map_err(|e| format!("update sync_state failed: {e}"))?;
    Ok(())
}

#[tauri::command]
pub async fn poll_sync_status(request: Option<SyncRequest>) -> Result<SyncStatusDto, String> {
    debug!(command = "poll_sync_status", "IPC command entry");
    let (adapter_name, adapter) = selected_adapter(request.and_then(|r| r.adapter));
    let status = adapter.poll()?;
    persist_sync_state(status.state.as_str(), status.last_sync_at.as_deref())?;
    info!(
        adapter = adapter_name.as_str(),
        bytes_transferred = status.bytes_transferred,
        state = status.state.as_str(),
        "Sync poll complete"
    );
    Ok(SyncStatusDto {
        status: status.state,
        last_sync_at: status.last_sync_at,
        bytes_transferred: status.bytes_transferred,
        adapter: adapter_name,
    })
}

#[tauri::command]
pub async fn sync_now(request: Option<SyncRequest>) -> Result<SyncStatusDto, String> {
    debug!(command = "sync_now", "IPC command entry");
    let (adapter_name, adapter) = selected_adapter(request.and_then(|r| r.adapter));
    let payload = adapter.read()?;
    if !payload.is_empty() {
        adapter.write(payload)?;
    }
    let status = adapter.poll()?;
    persist_sync_state(status.state.as_str(), status.last_sync_at.as_deref())?;
    Ok(SyncStatusDto {
        status: status.state,
        last_sync_at: status.last_sync_at,
        bytes_transferred: status.bytes_transferred,
        adapter: adapter_name,
    })
}

#[cfg(test)]
mod tests {
    use super::{poll_sync_status, sync_now, SyncRequest};

    #[test]
    fn returns_valid_status_value() {
        let response = tauri::async_runtime::block_on(poll_sync_status(Some(SyncRequest {
            adapter: Some("filesystem".to_string()),
        })))
        .expect("sync status should return");
        assert!(
            matches!(
                response.status.as_str(),
                "synced" | "syncing" | "conflict" | "offline"
            ),
            "unexpected status: {}",
            response.status
        );
        assert_eq!(response.adapter, "filesystem");
    }

    #[test]
    fn sync_now_returns_status() {
        let response = tauri::async_runtime::block_on(sync_now(Some(SyncRequest {
            adapter: Some("filesystem".to_string()),
        })))
        .expect("sync now should return");
        assert_eq!(response.adapter, "filesystem");
    }
}
