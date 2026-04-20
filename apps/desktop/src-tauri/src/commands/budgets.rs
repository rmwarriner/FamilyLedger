use serde::Serialize;
use tracing::debug;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BudgetSummaryDto {
    pub id: String,
    pub name: String,
    pub budget_type: String,
}

#[tauri::command]
pub async fn list_budgets() -> Result<Vec<BudgetSummaryDto>, String> {
    debug!(command = "list_budgets", "IPC command entry");
    // TODO(impl): aggregate envelope and tracking budgets into unified summary payload.
    let response = vec![];
    debug!(command = "list_budgets", count = response.len(), "IPC command exit");
    Ok(response)
}
