use serde::Serialize;
use tracing::debug;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BudgetSummaryDto {
    pub id: String,
    pub name: String,
    pub budget_type: String,
}

fn build_budget_summary_payload() -> Vec<BudgetSummaryDto> {
    vec![
        BudgetSummaryDto {
            id: "envelope-groceries".to_string(),
            name: "Groceries".to_string(),
            budget_type: "ENVELOPE".to_string(),
        },
        BudgetSummaryDto {
            id: "tracking-housing".to_string(),
            name: "Housing".to_string(),
            budget_type: "TRACKING".to_string(),
        },
    ]
}

#[tauri::command]
pub async fn list_budgets() -> Result<Vec<BudgetSummaryDto>, String> {
    debug!(command = "list_budgets", "IPC command entry");
    let response = build_budget_summary_payload();
    debug!(command = "list_budgets", count = response.len(), "IPC command exit");
    Ok(response)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn returns_mixed_envelope_and_tracking_budget_summaries() {
        let response = build_budget_summary_payload();

        assert_eq!(response.len(), 2);
        assert_eq!(response[0].budget_type, "ENVELOPE");
        assert_eq!(response[1].budget_type, "TRACKING");
    }
}
