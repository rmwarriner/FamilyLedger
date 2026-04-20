use serde::Serialize;
use tracing::debug;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionDto {
    pub id: String,
    pub description: String,
}

#[tauri::command]
pub async fn list_transactions() -> Result<Vec<TransactionDto>, String> {
    debug!(command = "list_transactions", "IPC command entry");
    // TODO(impl): query journal_entries and postings with pagination.
    let response = vec![];
    debug!(command = "list_transactions", count = response.len(), "IPC command exit");
    Ok(response)
}
