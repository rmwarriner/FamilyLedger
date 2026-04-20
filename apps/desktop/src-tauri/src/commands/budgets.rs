use serde::Serialize;
use tracing::debug;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BudgetSummaryDto {
    pub id: String,
    pub name: String,
    pub budget_type: String,
    pub target: String,
    pub actual: String,
    pub variance: String,
    pub currency: String,
    pub overspend_policy: Option<String>,
    pub rollover_enabled: Option<bool>,
    pub borrow_carryover: Option<String>,
}

#[derive(Debug)]
struct EnvelopeAggregateInput {
    id: &'static str,
    name: &'static str,
    allocated: f64,
    spent: f64,
    rollover_enabled: bool,
    overspend_policy: &'static str,
    currency: &'static str,
}

#[derive(Debug)]
struct TrackingAggregateInput {
    id: &'static str,
    name: &'static str,
    target: f64,
    actual: f64,
    currency: &'static str,
}

fn format_amount(value: f64) -> String {
    format!("{value:.2}")
}

fn build_budget_summary_payload() -> Vec<BudgetSummaryDto> {
    let envelopes = vec![
        EnvelopeAggregateInput {
            id: "envelope-groceries",
            name: "Groceries",
            allocated: 600.0,
            spent: 642.5,
            rollover_enabled: true,
            overspend_policy: "BORROW_NEXT_MONTH",
            currency: "USD",
        },
        EnvelopeAggregateInput {
            id: "envelope-transport",
            name: "Transport",
            allocated: 220.0,
            spent: 184.4,
            rollover_enabled: true,
            overspend_policy: "WARN_ONLY",
            currency: "USD",
        },
    ];

    let tracking = vec![
        TrackingAggregateInput {
            id: "tracking-housing",
            name: "Housing",
            target: 1200.0,
            actual: 1148.2,
            currency: "USD",
        },
        TrackingAggregateInput {
            id: "tracking-utilities",
            name: "Utilities",
            target: 320.0,
            actual: 348.25,
            currency: "USD",
        },
    ];

    let mut summaries = Vec::with_capacity(envelopes.len() + tracking.len());

    for envelope in envelopes {
        let variance = envelope.allocated - envelope.spent;
        let borrow_carryover = if envelope.overspend_policy == "BORROW_NEXT_MONTH" && variance < 0.0 {
            Some(format_amount(variance.abs()))
        } else {
            None
        };

        summaries.push(BudgetSummaryDto {
            id: envelope.id.to_string(),
            name: envelope.name.to_string(),
            budget_type: "ENVELOPE".to_string(),
            target: format_amount(envelope.allocated),
            actual: format_amount(envelope.spent),
            variance: format_amount(variance),
            currency: envelope.currency.to_string(),
            overspend_policy: Some(envelope.overspend_policy.to_string()),
            rollover_enabled: Some(envelope.rollover_enabled),
            borrow_carryover,
        });
    }

    for line in tracking {
        let variance = line.target - line.actual;
        summaries.push(BudgetSummaryDto {
            id: line.id.to_string(),
            name: line.name.to_string(),
            budget_type: "TRACKING".to_string(),
            target: format_amount(line.target),
            actual: format_amount(line.actual),
            variance: format_amount(variance),
            currency: line.currency.to_string(),
            overspend_policy: None,
            rollover_enabled: None,
            borrow_carryover: None,
        });
    }

    summaries
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

        assert_eq!(response.len(), 4);
        assert_eq!(response[0].budget_type, "ENVELOPE");
        assert_eq!(response[2].budget_type, "TRACKING");
    }

    #[test]
    fn computes_borrow_next_month_carryover_for_overspent_envelope() {
        let response = build_budget_summary_payload();
        let groceries = response
            .iter()
            .find(|summary| summary.id == "envelope-groceries")
            .expect("groceries summary");

        assert_eq!(groceries.variance, "-42.50");
        assert_eq!(groceries.borrow_carryover.as_deref(), Some("42.50"));
        assert_eq!(groceries.overspend_policy.as_deref(), Some("BORROW_NEXT_MONTH"));
        assert_eq!(groceries.rollover_enabled, Some(true));
    }
}
