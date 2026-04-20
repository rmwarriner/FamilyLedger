use serde::Serialize;
use tracing::{debug, info};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncStatusDto {
    pub status: String,
    pub last_sync_at: Option<String>,
}

#[tauri::command]
pub async fn poll_sync_status() -> Result<SyncStatusDto, String> {
    debug!(command = "poll_sync_status", "IPC command entry");
    info!(adapter = "filesystem", bytes_transferred = 0, conflict = false, "Sync poll complete");
    // TODO(impl): read sync adapter state and return CRDT status.
    Ok(SyncStatusDto {
        status: "offline".to_string(),
        last_sync_at: None,
    })
}
