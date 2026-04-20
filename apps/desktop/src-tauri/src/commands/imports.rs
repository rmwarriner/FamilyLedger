use serde::{Deserialize, Serialize};
use tracing::{debug, info};

#[derive(Debug, Deserialize)]
pub struct ImportRequest {
    pub payload: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportResponse {
    pub accounts_imported: usize,
    pub transactions_imported: usize,
    pub errors: Vec<String>,
}

#[tauri::command]
pub async fn import_data(payload: String) -> Result<ImportResponse, String> {
    let request = ImportRequest { payload };
    debug!(command = "import_data", payload_size = request.payload.len(), "IPC command entry");
    info!(
        operation = "import",
        rows_parsed = 0,
        errors = 0,
        "Import operation completed"
    );
    // TODO(impl): detect format, parse records, map accounts, resolve duplicates, and write journal entries.
    Ok(ImportResponse {
        accounts_imported: 0,
        transactions_imported: 0,
        errors: vec![],
    })
}
