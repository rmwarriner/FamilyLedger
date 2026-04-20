use serde::{Deserialize, Serialize};
use tracing::debug;

#[derive(Debug, Deserialize)]
pub struct ReportRequest {
    pub id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportResponse {
    pub title: String,
    pub subtitle: String,
}

#[tauri::command]
pub async fn run_report(id: String) -> Result<ReportResponse, String> {
    let request = ReportRequest { id };
    debug!(command = "run_report", report_id = request.id.as_str(), "IPC command entry");
    // TODO(impl): evaluate selected report definition against current ledger snapshot.
    let response = ReportResponse {
        title: "Stub Report".to_string(),
        subtitle: "TODO(impl): report engine".to_string(),
    };
    debug!(command = "run_report", "IPC command exit");
    Ok(response)
}
