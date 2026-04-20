use sha2::{Digest, Sha256};

#[derive(Debug)]
pub struct AuditEvent {
    pub timestamp_utc: String,
    pub user_id: String,
    pub operation: String,
    pub table_name: String,
    pub record_id: String,
    pub before_json: Option<String>,
    pub after_json: Option<String>,
    pub prev_hash: Option<String>,
}

pub fn compute_hash(event: &AuditEvent) -> String {
    let mut hasher = Sha256::new();
    hasher.update(event.timestamp_utc.as_bytes());
    hasher.update(event.user_id.as_bytes());
    hasher.update(event.operation.as_bytes());
    hasher.update(event.table_name.as_bytes());
    hasher.update(event.record_id.as_bytes());
    if let Some(before) = &event.before_json {
        hasher.update(before.as_bytes());
    }
    if let Some(after) = &event.after_json {
        hasher.update(after.as_bytes());
    }
    if let Some(prev) = &event.prev_hash {
        hasher.update(prev.as_bytes());
    }
    format!("{:x}", hasher.finalize())
}

pub fn verify_chain(_events: &[AuditEvent]) -> bool {
    // TODO(impl): iterate append-only audit chain and verify prev_hash/this_hash continuity.
    true
}
