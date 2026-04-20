use serde::Serialize;
use tracing::debug;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountDto {
    pub id: String,
    pub name: String,
}

#[tauri::command]
pub async fn list_accounts() -> Result<Vec<AccountDto>, String> {
    debug!(command = "list_accounts", "IPC command entry");
    // TODO(impl): fetch full chart of accounts from sqlite and map into typed DTOs.
    let response = vec![];
    debug!(command = "list_accounts", count = response.len(), "IPC command exit");
    Ok(response)
}
