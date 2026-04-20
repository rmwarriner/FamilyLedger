use serde::Serialize;
use tracing::debug;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountDto {
    pub id: String,
    pub name: String,
    pub full_path: String,
    pub currency: String,
    pub account_type: String,
}

#[tauri::command]
pub async fn list_accounts() -> Result<Vec<AccountDto>, String> {
    debug!(command = "list_accounts", "IPC command entry");
    let response = crate::commands::ledger_store::list_accounts()
        .into_iter()
        .map(|account| AccountDto {
            id: account.id,
            name: account.name,
            full_path: account.full_path,
            currency: account.currency,
            account_type: account.account_type,
        })
        .collect::<Vec<_>>();
    debug!(
        command = "list_accounts",
        count = response.len(),
        "IPC command exit"
    );
    Ok(response)
}

#[cfg(test)]
mod tests {
    #[test]
    fn lists_seeded_accounts() {
        crate::commands::ledger_store::reset_for_tests();
        let accounts = crate::commands::ledger_store::list_accounts();
        assert!(accounts.len() >= 4);
        assert!(accounts.iter().any(|account| account.id == "acct-checking"));
    }
}
