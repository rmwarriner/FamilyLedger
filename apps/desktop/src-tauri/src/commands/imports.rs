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

fn detect_format(payload: &str) -> &'static str {
    if payload.contains("<OFX>") || payload.contains("OFXHEADER:") {
        return "OFX";
    }

    if payload.contains("!Type:") {
        return "QIF";
    }

    if payload
        .lines()
        .next()
        .map(|line| line.to_ascii_lowercase().contains("date") && line.contains(','))
        .unwrap_or(false)
    {
        return "CSV";
    }

    "UNKNOWN"
}

fn estimate_counts(format: &str, payload: &str) -> (usize, usize, Vec<String>) {
    match format {
        "CSV" => {
            let row_count = payload
                .lines()
                .skip(1)
                .filter(|line| !line.trim().is_empty())
                .count();
            (usize::from(row_count > 0), row_count, vec![])
        }
        "QIF" => {
            let tx_count = payload.lines().filter(|line| line.trim() == "^").count();
            (usize::from(tx_count > 0), tx_count, vec![])
        }
        "OFX" => {
            let tx_count = payload.matches("<STMTTRN>").count();
            (usize::from(tx_count > 0), tx_count, vec![])
        }
        _ => (0, 0, vec!["Unsupported import format".to_string()]),
    }
}

#[tauri::command]
pub async fn import_data(payload: String) -> Result<ImportResponse, String> {
    let request = ImportRequest { payload };
    debug!(
        command = "import_data",
        payload_size = request.payload.len(),
        "IPC command entry"
    );

    let format = detect_format(&request.payload);
    let (accounts_imported, transactions_imported, errors) =
        estimate_counts(format, &request.payload);

    info!(
        operation = "import",
        format,
        accounts_imported,
        transactions_imported,
        errors = errors.len(),
        "Import operation completed"
    );

    Ok(ImportResponse {
        accounts_imported,
        transactions_imported,
        errors,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn csv_payload_reports_transaction_count() {
        let payload = "date,payee,amount\n2026-01-01,Coffee,-4.50\n2026-01-02,Groceries,-22.10";
        let format = detect_format(payload);
        let (accounts_imported, transactions_imported, errors) = estimate_counts(format, payload);

        assert_eq!(accounts_imported, 1);
        assert_eq!(transactions_imported, 2);
        assert!(errors.is_empty());
    }

    #[test]
    fn unknown_format_returns_error() {
        let format = detect_format("not-a-supported-format");
        let (accounts_imported, transactions_imported, errors) =
            estimate_counts(format, "not-a-supported-format");

        assert_eq!(accounts_imported, 0);
        assert_eq!(transactions_imported, 0);
        assert_eq!(errors, vec!["Unsupported import format"]);
    }
}
