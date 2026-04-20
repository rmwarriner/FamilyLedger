use rusqlite::Connection;
use tauri::AppHandle;
use tracing::debug;

pub fn initialize_sqlite(_app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let connection = Connection::open_in_memory()?;
    connection.execute_batch("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;")?;
    debug!(module = "db.connection", operation = "initialize", "SQLite WAL and FK enforcement configured");
    Ok(())
}
