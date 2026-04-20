use sha2::{Digest, Sha256};

#[derive(Clone, Debug)]
pub struct AuditEvent {
    pub timestamp_utc: String,
    pub user_id: String,
    pub operation: String,
    pub table_name: String,
    pub record_id: String,
    pub before_json: Option<String>,
    pub after_json: Option<String>,
    pub prev_hash: Option<String>,
    pub this_hash: Option<String>,
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

pub fn verify_chain(events: &[AuditEvent]) -> bool {
    let mut expected_prev: Option<String> = None;

    for event in events {
        if event.prev_hash != expected_prev {
            return false;
        }

        let computed_hash = compute_hash(event);
        match event.this_hash.as_ref() {
            Some(existing_hash) if existing_hash == &computed_hash => {
                expected_prev = Some(computed_hash);
            }
            _ => return false,
        }
    }

    true
}

#[cfg(test)]
mod tests {
    use super::{compute_hash, verify_chain, AuditEvent};

    fn mk_event(prev_hash: Option<String>, operation: &str) -> AuditEvent {
        AuditEvent {
            timestamp_utc: "2026-04-20T00:00:00Z".to_string(),
            user_id: "user-1".to_string(),
            operation: operation.to_string(),
            table_name: "journal_entries".to_string(),
            record_id: format!("rec-{operation}"),
            before_json: None,
            after_json: Some("{\"k\":1}".to_string()),
            prev_hash,
            this_hash: None,
        }
    }

    #[test]
    fn verifies_valid_hash_chain() {
        let mut first = mk_event(None, "INSERT");
        first.this_hash = Some(compute_hash(&first));

        let mut second = mk_event(first.this_hash.clone(), "UPDATE");
        second.this_hash = Some(compute_hash(&second));

        assert!(verify_chain(&[first, second]));
    }

    #[test]
    fn rejects_mismatched_previous_hash() {
        let mut first = mk_event(None, "INSERT");
        first.this_hash = Some(compute_hash(&first));

        let mut second = mk_event(Some("wrong".to_string()), "UPDATE");
        second.this_hash = Some(compute_hash(&second));

        assert!(!verify_chain(&[first, second]));
    }

    #[test]
    fn rejects_tampered_event_hash() {
        let mut first = mk_event(None, "INSERT");
        first.this_hash = Some(compute_hash(&first));

        let mut second = mk_event(first.this_hash.clone(), "UPDATE");
        second.this_hash = Some("not-a-real-hash".to_string());

        assert!(!verify_chain(&[first, second]));
    }
}
