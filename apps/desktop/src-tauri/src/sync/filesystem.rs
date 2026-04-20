use super::adapter::{SyncAdapter, SyncStatus};

pub struct FilesystemAdapter;

impl SyncAdapter for FilesystemAdapter {
    fn read(&self) -> Result<Vec<u8>, String> {
        // TODO(impl): read encrypted Automerge document from configured sync folder.
        Ok(vec![])
    }

    fn write(&self, _payload: Vec<u8>) -> Result<(), String> {
        // TODO(impl): write encrypted Automerge document atomically.
        Ok(())
    }

    fn poll(&self) -> Result<SyncStatus, String> {
        Ok(SyncStatus {
            state: "offline".to_string(),
            bytes_transferred: 0,
        })
    }
}
