use super::adapter::{SyncAdapter, SyncStatus};

pub struct DropboxAdapter;

impl SyncAdapter for DropboxAdapter {
    fn read(&self) -> Result<Vec<u8>, String> {
        // TODO(impl): implement Dropbox adapter read operation.
        Ok(vec![])
    }

    fn write(&self, _payload: Vec<u8>) -> Result<(), String> {
        // TODO(impl): implement Dropbox adapter write operation.
        Ok(())
    }

    fn poll(&self) -> Result<SyncStatus, String> {
        Ok(SyncStatus {
            state: "offline".to_string(),
            bytes_transferred: 0,
        })
    }
}
