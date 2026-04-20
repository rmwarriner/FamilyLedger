use rusqlite::params;
use serde::{Deserialize, Serialize};
use tracing::debug;

use crate::audit::event_log::{verify_chain, AuditEvent};
use crate::db::connection::open_sqlite;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditIntegrityDto {
    pub valid: bool,
    pub checked_events: usize,
    pub first_invalid_event_id: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogEventDto {
    pub id: String,
    pub occurred_at: String,
    pub user_id: String,
    pub operation: String,
    pub table_name: String,
    pub record_id: String,
    pub before_json: Option<String>,
    pub after_json: Option<String>,
    pub prev_hash: Option<String>,
    pub this_hash: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogPageDto {
    pub items: Vec<AuditLogEventDto>,
    pub total: usize,
    pub page: usize,
    pub page_size: usize,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryAuditLogRequest {
    pub page: Option<usize>,
    pub page_size: Option<usize>,
    pub table_name: Option<String>,
    pub operation: Option<String>,
}

fn normalize_opt(input: Option<String>) -> Option<String> {
    match input {
        Some(value) if value.trim().is_empty() => None,
        other => other,
    }
}

fn load_chain_events() -> Result<Vec<(String, AuditEvent)>, String> {
    let connection = open_sqlite().map_err(|e| format!("open sqlite failed: {e}"))?;
    let mut statement = connection
        .prepare(
            "SELECT id, occurred_at, user_id, operation, table_name, record_id, before_json, after_json, prev_hash, this_hash
             FROM audit_log
             ORDER BY occurred_at ASC, created_at ASC, id ASC",
        )
        .map_err(|e| format!("prepare audit query failed: {e}"))?;

    let mut rows = statement
        .query([])
        .map_err(|e| format!("query audit rows failed: {e}"))?;
    let mut events: Vec<(String, AuditEvent)> = Vec::new();
    while let Some(row) = rows
        .next()
        .map_err(|e| format!("read audit row failed: {e}"))?
    {
        let id: String = row.get(0).map_err(|e| format!("read id failed: {e}"))?;
        let prev_hash_raw: Option<String> = row
            .get(8)
            .map_err(|e| format!("read prev_hash failed: {e}"))?;
        let event = AuditEvent {
            timestamp_utc: row
                .get(1)
                .map_err(|e| format!("read occurred_at failed: {e}"))?,
            user_id: row
                .get(2)
                .map_err(|e| format!("read user_id failed: {e}"))?,
            operation: row
                .get(3)
                .map_err(|e| format!("read operation failed: {e}"))?,
            table_name: row
                .get(4)
                .map_err(|e| format!("read table_name failed: {e}"))?,
            record_id: row
                .get(5)
                .map_err(|e| format!("read record_id failed: {e}"))?,
            before_json: row
                .get(6)
                .map_err(|e| format!("read before_json failed: {e}"))?,
            after_json: row
                .get(7)
                .map_err(|e| format!("read after_json failed: {e}"))?,
            prev_hash: normalize_opt(prev_hash_raw),
            this_hash: row
                .get(9)
                .map_err(|e| format!("read this_hash failed: {e}"))?,
        };
        events.push((id, event));
    }
    Ok(events)
}

#[tauri::command]
pub async fn verify_audit_integrity() -> Result<AuditIntegrityDto, String> {
    debug!(command = "verify_audit_integrity", "IPC command entry");
    let events = load_chain_events()?;
    let chain_only = events
        .iter()
        .map(|(_, event)| event.clone())
        .collect::<Vec<AuditEvent>>();
    let checked_events = chain_only.len();
    let valid = verify_chain(&chain_only);

    let first_invalid_event_id = if valid {
        None
    } else {
        let mut first_bad: Option<String> = None;
        for index in 0..chain_only.len() {
            let prefix = chain_only[..=index].to_vec();
            if !verify_chain(&prefix) {
                first_bad = Some(events[index].0.clone());
                break;
            }
        }
        first_bad
    };

    Ok(AuditIntegrityDto {
        valid,
        checked_events,
        first_invalid_event_id,
    })
}

#[tauri::command]
pub async fn query_audit_log(request: QueryAuditLogRequest) -> Result<AuditLogPageDto, String> {
    debug!(command = "query_audit_log", "IPC command entry");
    let page_size = request.page_size.unwrap_or(100).clamp(1, 500);
    let page = request.page.unwrap_or(1).max(1);
    let offset = (page - 1) * page_size;

    let connection = open_sqlite().map_err(|e| format!("open sqlite failed: {e}"))?;
    let table_name = request.table_name.unwrap_or_default();
    let operation = request.operation.unwrap_or_default();

    let total: usize = connection
        .query_row(
            "SELECT COUNT(*) FROM audit_log
             WHERE (?1 = '' OR table_name = ?1) AND (?2 = '' OR operation = ?2)",
            params![table_name, operation],
            |row| row.get(0),
        )
        .map_err(|e| format!("count audit rows failed: {e}"))?;

    let mut statement = connection
        .prepare(
            "SELECT id, occurred_at, user_id, operation, table_name, record_id, before_json, after_json, prev_hash, this_hash
             FROM audit_log
             WHERE (?1 = '' OR table_name = ?1) AND (?2 = '' OR operation = ?2)
             ORDER BY occurred_at DESC, created_at DESC, id DESC
             LIMIT ?3 OFFSET ?4",
        )
        .map_err(|e| format!("prepare audit list query failed: {e}"))?;
    let mapped = statement
        .query_map(
            params![table_name, operation, page_size as i64, offset as i64],
            |row| {
                let prev_hash_raw: Option<String> = row.get(8)?;
                Ok(AuditLogEventDto {
                    id: row.get(0)?,
                    occurred_at: row.get(1)?,
                    user_id: row.get(2)?,
                    operation: row.get(3)?,
                    table_name: row.get(4)?,
                    record_id: row.get(5)?,
                    before_json: row.get(6)?,
                    after_json: row.get(7)?,
                    prev_hash: normalize_opt(prev_hash_raw),
                    this_hash: row.get(9)?,
                })
            },
        )
        .map_err(|e| format!("query audit list failed: {e}"))?;

    let mut items = Vec::new();
    for row in mapped {
        items.push(row.map_err(|e| format!("map audit row failed: {e}"))?);
    }

    Ok(AuditLogPageDto {
        items,
        total,
        page,
        page_size,
    })
}

#[cfg(test)]
mod tests {
    use super::{query_audit_log, verify_audit_integrity, QueryAuditLogRequest};
    use crate::audit::event_log::{compute_hash, AuditEvent};
    use crate::db::connection::open_sqlite;
    use rusqlite::params;

    fn seed_valid_chain() {
        let connection = open_sqlite().expect("open sqlite");
        connection
            .execute(
                "INSERT OR IGNORE INTO users (id, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
                params!["audit_user", "Audit User", "2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z"],
            )
            .expect("insert user");

        let _ = connection.execute("DELETE FROM audit_log", []);

        let first = AuditEvent {
            timestamp_utc: "2026-01-01T00:00:00Z".to_string(),
            user_id: "audit_user".to_string(),
            operation: "INSERT".to_string(),
            table_name: "postings".to_string(),
            record_id: "row-1".to_string(),
            before_json: None,
            after_json: Some("{\"amount\":\"10.00\"}".to_string()),
            prev_hash: None,
            this_hash: None,
        };
        let first_hash = compute_hash(&first);
        connection
            .execute(
                "INSERT INTO audit_log (id, occurred_at, user_id, operation, table_name, record_id, before_json, after_json, prev_hash, this_hash, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                params![
                    "evt-1",
                    first.timestamp_utc,
                    first.user_id,
                    first.operation,
                    first.table_name,
                    first.record_id,
                    first.before_json,
                    first.after_json,
                    first.prev_hash,
                    first_hash,
                    "2026-01-01T00:00:00Z",
                    "2026-01-01T00:00:00Z"
                ],
            )
            .expect("insert first");

        let second = AuditEvent {
            timestamp_utc: "2026-01-01T00:01:00Z".to_string(),
            user_id: "audit_user".to_string(),
            operation: "UPDATE".to_string(),
            table_name: "postings".to_string(),
            record_id: "row-1".to_string(),
            before_json: Some("{\"amount\":\"10.00\"}".to_string()),
            after_json: Some("{\"amount\":\"20.00\"}".to_string()),
            prev_hash: Some(first_hash.clone()),
            this_hash: None,
        };
        let second_hash = compute_hash(&second);
        connection
            .execute(
                "INSERT INTO audit_log (id, occurred_at, user_id, operation, table_name, record_id, before_json, after_json, prev_hash, this_hash, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                params![
                    "evt-2",
                    second.timestamp_utc,
                    second.user_id,
                    second.operation,
                    second.table_name,
                    second.record_id,
                    second.before_json,
                    second.after_json,
                    second.prev_hash,
                    second_hash,
                    "2026-01-01T00:01:00Z",
                    "2026-01-01T00:01:00Z"
                ],
            )
            .expect("insert second");
    }

    #[test]
    fn returns_integrity_details_for_real_db_events() {
        seed_valid_chain();
        let result = tauri::async_runtime::block_on(verify_audit_integrity())
            .expect("integrity command should return");
        assert!(result.valid);
        assert_eq!(result.checked_events, 2);
        assert_eq!(result.first_invalid_event_id, None);
    }

    #[test]
    fn queries_audit_log_with_pagination() {
        seed_valid_chain();
        let result = tauri::async_runtime::block_on(query_audit_log(QueryAuditLogRequest {
            page: Some(1),
            page_size: Some(1),
            table_name: Some("postings".to_string()),
            operation: None,
        }))
        .expect("audit page should return");
        assert_eq!(result.total, 2);
        assert_eq!(result.page, 1);
        assert_eq!(result.page_size, 1);
        assert_eq!(result.items.len(), 1);
        assert_eq!(result.items[0].table_name, "postings");
    }
}
