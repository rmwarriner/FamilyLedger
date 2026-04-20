use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;
use tracing::debug;

#[cfg(test)]
use std::cell::RefCell;
#[cfg(test)]
use std::time::{SystemTime, UNIX_EPOCH};

#[cfg(test)]
thread_local! {
    static TEST_DB_PATH: RefCell<Option<PathBuf>> = const { RefCell::new(None) };
}

#[cfg(test)]
fn db_path() -> PathBuf {
    TEST_DB_PATH.with(|cell| {
        if let Some(path) = cell.borrow().as_ref() {
            return path.clone();
        }
        let mut path = std::env::temp_dir();
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or_default();
        path.push(format!("familyledger-test-{nanos}.sqlite3"));
        *cell.borrow_mut() = Some(path.clone());
        path
    })
}

#[cfg(not(test))]
fn db_path() -> PathBuf {
    std::env::var("FAMILYLEDGER_DB_PATH")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from(".familyledger-data/familyledger.sqlite3"))
}

pub fn open_sqlite() -> Result<Connection, Box<dyn std::error::Error>> {
    let path = db_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let mut connection = Connection::open(path)?;
    connection.execute_batch("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;")?;
    crate::db::migrations::run_migrations(&mut connection)?;
    connection.execute(
        "INSERT OR IGNORE INTO sync_state (id, last_sync_at, conflict_status, device_identity, created_at, updated_at)
         VALUES ('singleton', NULL, 'offline', 'device-local', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [],
    )?;
    Ok(connection)
}

pub fn initialize_sqlite(_app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let _connection = open_sqlite()?;
    debug!(
        module = "db.connection",
        operation = "initialize",
        "SQLite WAL and FK enforcement configured"
    );
    Ok(())
}
