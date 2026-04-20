use super::adapter::{SyncAdapter, SyncStatus};
use chrono::{DateTime, Utc};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct FilesystemAdapter {
    root_dir: PathBuf,
    filename: String,
}

impl FilesystemAdapter {
    pub fn new(root_dir: PathBuf) -> Self {
        Self {
            root_dir,
            filename: "ledger.sync.enc".to_string(),
        }
    }

    fn payload_path(&self) -> PathBuf {
        self.root_dir.join(self.filename.as_str())
    }
}

impl Default for FilesystemAdapter {
    fn default() -> Self {
        let root_dir = std::env::var("FAMILYLEDGER_SYNC_DIR")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from(".familyledger-sync"));
        Self::new(root_dir)
    }
}

impl SyncAdapter for FilesystemAdapter {
    fn read(&self) -> Result<Vec<u8>, String> {
        let payload_path = self.payload_path();
        if !payload_path.exists() {
            return Ok(vec![]);
        }
        fs::read(&payload_path).map_err(|error| {
            format!(
                "filesystem adapter read failed ({}): {error}",
                payload_path.display()
            )
        })
    }

    fn write(&self, payload: Vec<u8>) -> Result<(), String> {
        fs::create_dir_all(&self.root_dir).map_err(|error| {
            format!(
                "filesystem adapter create_dir failed ({}): {error}",
                self.root_dir.display()
            )
        })?;

        let payload_path = self.payload_path();
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or_default();
        let temp_path = payload_path.with_extension(format!("tmp-{nanos}"));

        fs::write(&temp_path, payload).map_err(|error| {
            format!(
                "filesystem adapter temp write failed ({}): {error}",
                temp_path.display()
            )
        })?;
        fs::rename(&temp_path, &payload_path).map_err(|error| {
            format!(
                "filesystem adapter atomic rename failed ({} -> {}): {error}",
                temp_path.display(),
                payload_path.display()
            )
        })
    }

    fn poll(&self) -> Result<SyncStatus, String> {
        let payload_path = self.payload_path();
        if !payload_path.exists() {
            return Ok(SyncStatus {
                state: "offline".to_string(),
                bytes_transferred: 0,
                last_sync_at: None,
            });
        }

        let metadata = fs::metadata(&payload_path).map_err(|error| {
            format!(
                "filesystem adapter metadata failed ({}): {error}",
                payload_path.display()
            )
        })?;
        let modified_at = metadata
            .modified()
            .ok()
            .map(DateTime::<Utc>::from)
            .map(|timestamp| timestamp.to_rfc3339());
        Ok(SyncStatus {
            state: "synced".to_string(),
            bytes_transferred: metadata.len() as usize,
            last_sync_at: modified_at,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::sync::adapter::SyncAdapter;

    fn temp_dir() -> PathBuf {
        let mut path = std::env::temp_dir();
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or_default();
        path.push(format!("familyledger-sync-test-{nanos}"));
        path
    }

    #[test]
    fn returns_empty_payload_when_no_sync_file_exists() {
        let root = temp_dir();
        let adapter = FilesystemAdapter::new(root.clone());
        let result = adapter.read().expect("read should succeed");
        assert!(result.is_empty());
        let status = adapter.poll().expect("poll should succeed");
        assert_eq!(status.state, "offline");
        assert_eq!(status.bytes_transferred, 0);
        assert!(status.last_sync_at.is_none());
    }

    #[test]
    fn writes_reads_and_reports_synced_payload() {
        let root = temp_dir();
        let adapter = FilesystemAdapter::new(root.clone());
        let payload = b"encrypted-ledger-data".to_vec();
        adapter
            .write(payload.clone())
            .expect("write should succeed");

        let read_back = adapter.read().expect("read should succeed");
        assert_eq!(read_back, payload);

        let status = adapter.poll().expect("poll should succeed");
        assert_eq!(status.state, "synced");
        assert_eq!(status.bytes_transferred, payload.len());
        assert!(status.last_sync_at.is_some());
    }
}
