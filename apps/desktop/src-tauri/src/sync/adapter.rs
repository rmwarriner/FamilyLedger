pub trait SyncAdapter {
    fn read(&self) -> Result<Vec<u8>, String>;
    fn write(&self, payload: Vec<u8>) -> Result<(), String>;
    fn poll(&self) -> Result<SyncStatus, String>;
}

#[derive(Clone, Debug)]
pub struct SyncStatus {
    pub state: String,
    pub bytes_transferred: usize,
    pub last_sync_at: Option<String>,
}
