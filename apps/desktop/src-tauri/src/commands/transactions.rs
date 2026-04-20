use serde::{Deserialize, Serialize};
use tracing::debug;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionDto {
    pub id: String,
    pub date: String,
    pub description: String,
    pub payee: Option<String>,
    pub amount: String,
    pub currency: String,
    pub debit_account_id: String,
    pub debit_account_name: String,
    pub credit_account_id: String,
    pub credit_account_name: String,
    pub memo: Option<String>,
    pub is_scheduled: bool,
    pub scheduled_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTransactionRequest {
    pub date: String,
    pub description: String,
    pub payee: Option<String>,
    pub amount: String,
    pub debit_account_id: String,
    pub credit_account_id: String,
    pub memo: Option<String>,
}

#[tauri::command]
pub async fn list_transactions() -> Result<Vec<TransactionDto>, String> {
    debug!(command = "list_transactions", "IPC command entry");
    let response = crate::commands::ledger_store::list_transactions()
        .into_iter()
        .map(|transaction| TransactionDto {
            id: transaction.id,
            date: transaction.date,
            description: transaction.description,
            payee: transaction.payee,
            amount: transaction.amount,
            currency: transaction.currency,
            debit_account_id: transaction.debit_account_id,
            debit_account_name: transaction.debit_account_name,
            credit_account_id: transaction.credit_account_id,
            credit_account_name: transaction.credit_account_name,
            memo: transaction.memo,
            is_scheduled: transaction.is_scheduled,
            scheduled_id: transaction.scheduled_id,
        })
        .collect::<Vec<_>>();
    debug!(
        command = "list_transactions",
        count = response.len(),
        "IPC command exit"
    );
    Ok(response)
}

#[tauri::command]
pub async fn create_transaction(
    request: CreateTransactionRequest,
) -> Result<TransactionDto, String> {
    debug!(command = "create_transaction", "IPC command entry");
    let record = crate::commands::ledger_store::create_transaction(
        crate::commands::ledger_store::CreateTransactionInput {
            date: request.date,
            description: request.description,
            payee: request.payee,
            amount: request.amount,
            debit_account_id: request.debit_account_id,
            credit_account_id: request.credit_account_id,
            memo: request.memo,
            scheduled_id: None,
        },
    )?;

    Ok(TransactionDto {
        id: record.id,
        date: record.date,
        description: record.description,
        payee: record.payee,
        amount: record.amount,
        currency: record.currency,
        debit_account_id: record.debit_account_id,
        debit_account_name: record.debit_account_name,
        credit_account_id: record.credit_account_id,
        credit_account_name: record.credit_account_name,
        memo: record.memo,
        is_scheduled: record.is_scheduled,
        scheduled_id: record.scheduled_id,
    })
}

#[cfg(test)]
mod tests {
    #[test]
    fn creates_and_lists_transactions() {
        crate::commands::ledger_store::reset_for_tests();

        let created = crate::commands::ledger_store::create_transaction(
            crate::commands::ledger_store::CreateTransactionInput {
                date: "2026-04-20".to_string(),
                description: "Coffee".to_string(),
                payee: Some("Cafe".to_string()),
                amount: "12.40".to_string(),
                debit_account_id: "acct-groceries".to_string(),
                credit_account_id: "acct-checking".to_string(),
                memo: Some("Morning".to_string()),
                scheduled_id: None,
            },
        )
        .expect("create transaction");

        assert_eq!(created.description, "Coffee");
        assert_eq!(created.amount, "12.40");

        let listed = crate::commands::ledger_store::list_transactions();
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].id, created.id);
    }

    #[test]
    fn rejects_invalid_amount() {
        crate::commands::ledger_store::reset_for_tests();

        let result = crate::commands::ledger_store::create_transaction(
            crate::commands::ledger_store::CreateTransactionInput {
                date: "2026-04-20".to_string(),
                description: "Invalid".to_string(),
                payee: None,
                amount: "-1".to_string(),
                debit_account_id: "acct-groceries".to_string(),
                credit_account_id: "acct-checking".to_string(),
                memo: None,
                scheduled_id: None,
            },
        );

        assert_eq!(
            result.expect_err("expected error"),
            "TRANSACTION_INVALID_AMOUNT"
        );
    }
}
