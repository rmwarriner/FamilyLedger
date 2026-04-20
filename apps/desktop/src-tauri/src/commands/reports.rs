use serde::{Deserialize, Serialize};
use tracing::debug;

#[derive(Debug, Deserialize)]
pub struct ReportRequest {
    pub id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportColumnDto {
    pub id: String,
    pub label: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportRowDto {
    pub id: String,
    pub values: serde_json::Value,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportResponse {
    pub title: String,
    pub subtitle: String,
    pub columns: Vec<ReportColumnDto>,
    pub rows: Vec<ReportRowDto>,
    pub totals: Option<ReportRowDto>,
    pub generated_at: String,
    pub parameters: serde_json::Value,
}

fn report_for_id(id: &str) -> ReportResponse {
    let transactions = crate::commands::ledger_store::list_transactions();
    match id {
        "account-register" => {
            let rows = transactions
                .iter()
                .map(|tx| ReportRowDto {
                    id: tx.id.clone(),
                    values: serde_json::json!({
                        "date": tx.date,
                        "description": tx.description,
                        "payee": tx.payee,
                        "debitAccount": tx.debit_account_name,
                        "creditAccount": tx.credit_account_name,
                        "amount": tx.amount
                    }),
                })
                .collect::<Vec<_>>();

            ReportResponse {
                title: "Account Register".to_string(),
                subtitle: "Transaction postings by date".to_string(),
                columns: vec![
                    ReportColumnDto { id: "date".to_string(), label: "Date".to_string() },
                    ReportColumnDto { id: "description".to_string(), label: "Description".to_string() },
                    ReportColumnDto { id: "payee".to_string(), label: "Payee".to_string() },
                    ReportColumnDto { id: "debitAccount".to_string(), label: "Debit".to_string() },
                    ReportColumnDto { id: "creditAccount".to_string(), label: "Credit".to_string() },
                    ReportColumnDto { id: "amount".to_string(), label: "Amount".to_string() },
                ],
                rows,
                totals: None,
                generated_at: chrono::Utc::now().to_rfc3339(),
                parameters: serde_json::json!({}),
            }
        }
        "spending-by-category" => {
            let mut by_category = std::collections::BTreeMap::<String, f64>::new();
            for tx in &transactions {
                let category = tx.debit_account_name.clone();
                let amount = tx.amount.parse::<f64>().unwrap_or(0.0);
                *by_category.entry(category).or_default() += amount;
            }

            let rows = by_category
                .iter()
                .map(|(category, amount)| ReportRowDto {
                    id: format!("cat:{category}"),
                    values: serde_json::json!({
                        "category": category,
                        "amount": format!("{amount:.2}")
                    }),
                })
                .collect::<Vec<_>>();

            let total = by_category.values().sum::<f64>();
            ReportResponse {
                title: "Spending by Category".to_string(),
                subtitle: "Totals by debit category".to_string(),
                columns: vec![
                    ReportColumnDto { id: "category".to_string(), label: "Category".to_string() },
                    ReportColumnDto { id: "amount".to_string(), label: "Amount".to_string() },
                ],
                rows,
                totals: Some(ReportRowDto {
                    id: "totals".to_string(),
                    values: serde_json::json!({"category":"Total","amount": format!("{total:.2}")}),
                }),
                generated_at: chrono::Utc::now().to_rfc3339(),
                parameters: serde_json::json!({}),
            }
        }
        _ => ReportResponse {
            title: "Report".to_string(),
            subtitle: format!("No definition for '{id}'"),
            columns: vec![],
            rows: vec![],
            totals: None,
            generated_at: chrono::Utc::now().to_rfc3339(),
            parameters: serde_json::json!({"id": id}),
        },
    }
}

#[tauri::command]
pub async fn run_report(id: String) -> Result<ReportResponse, String> {
    let request = ReportRequest { id };
    debug!(command = "run_report", report_id = request.id.as_str(), "IPC command entry");
    let response = report_for_id(request.id.as_str());
    debug!(command = "run_report", "IPC command exit");
    Ok(response)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn returns_rows_for_account_register() {
      crate::commands::ledger_store::reset_for_tests();
      crate::commands::ledger_store::create_transaction(crate::commands::ledger_store::CreateTransactionInput {
        date: "2026-04-20".to_string(),
        description: "Lunch".to_string(),
        payee: Some("Cafe".to_string()),
        amount: "18.75".to_string(),
        debit_account_id: "acct-groceries".to_string(),
        credit_account_id: "acct-checking".to_string(),
        memo: None,
        scheduled_id: None,
      }).expect("seed tx");

      let report = report_for_id("account-register");
      assert_eq!(report.title, "Account Register");
      assert!(!report.rows.is_empty());
    }
}
