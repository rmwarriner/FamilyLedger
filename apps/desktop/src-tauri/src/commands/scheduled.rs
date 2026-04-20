use serde::{Deserialize, Serialize};
use tracing::debug;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScheduledTransactionDto {
    pub id: String,
    pub due_at: String,
    pub auto_post: bool,
    pub description: String,
    pub amount: String,
    pub debit_account_id: String,
    pub credit_account_id: String,
    pub is_overdue: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PostScheduledRequest {
    pub id: String,
}

#[tauri::command]
pub async fn list_scheduled_transactions() -> Result<Vec<ScheduledTransactionDto>, String> {
    debug!(command = "list_scheduled_transactions", "IPC command entry");

    let now = chrono::Utc::now().date_naive();
    let response = crate::commands::ledger_store::list_scheduled()
        .into_iter()
        .map(|item| {
            let due = chrono::NaiveDate::parse_from_str(item.due_at.as_str(), "%Y-%m-%d")
                .unwrap_or(now);
            ScheduledTransactionDto {
                id: item.id,
                due_at: item.due_at,
                auto_post: item.auto_post,
                description: item.description,
                amount: item.amount,
                debit_account_id: item.debit_account_id,
                credit_account_id: item.credit_account_id,
                is_overdue: due < now,
            }
        })
        .collect::<Vec<_>>();

    Ok(response)
}

#[tauri::command]
pub async fn post_scheduled_transaction(request: PostScheduledRequest) -> Result<String, String> {
    debug!(command = "post_scheduled_transaction", id = request.id.as_str(), "IPC command entry");
    crate::commands::ledger_store::post_scheduled(request.id.as_str())
}

#[cfg(test)]
mod tests {
    #[test]
    fn lists_and_posts_scheduled_transactions() {
        crate::commands::ledger_store::reset_for_tests();
        let listed = crate::commands::ledger_store::list_scheduled();
        assert!(!listed.is_empty());

        let id = listed[0].id.clone();
        let result = crate::commands::ledger_store::post_scheduled(id.as_str());
        assert!(result.is_ok());

        let txs = crate::commands::ledger_store::list_transactions();
        assert!(!txs.is_empty());
        assert!(txs.iter().any(|tx| tx.scheduled_id.as_deref() == Some(id.as_str())));
    }
}
