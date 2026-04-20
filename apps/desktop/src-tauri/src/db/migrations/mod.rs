#[path = "001_initial_schema.rs"]
pub mod initial_schema;
use rusqlite::{Connection, OptionalExtension};
use tracing::{debug, info};

pub fn run_migrations(connection: &mut Connection) -> rusqlite::Result<()> {
    connection.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version TEXT PRIMARY KEY NOT NULL,
          applied_at TEXT NOT NULL
        );
        ",
    )?;

    let migrations: [(&str, fn() -> &'static str); 1] = [("001_initial_schema", initial_schema::migration_sql)];

    for (version, migration_sql) in migrations {
        let already_applied: Option<String> = connection
            .query_row(
                "SELECT version FROM schema_migrations WHERE version = ?1",
                [version],
                |row| row.get(0),
            )
            .optional()?;

        if already_applied.is_some() {
            debug!(module = "db.migrations", version, "migration already applied");
            continue;
        }

        info!(module = "db.migrations", version, "starting migration");
        let tx = connection.transaction()?;
        tx.execute_batch(migration_sql())?;
        tx.execute(
            "INSERT INTO schema_migrations (version, applied_at) VALUES (?1, CURRENT_TIMESTAMP)",
            [version],
        )?;
        tx.commit()?;
        info!(module = "db.migrations", version, "completed migration");
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn applies_migrations_once_and_creates_core_tables() -> rusqlite::Result<()> {
        let mut connection = Connection::open_in_memory()?;
        run_migrations(&mut connection)?;
        run_migrations(&mut connection)?;

        let migration_count: i64 = connection.query_row(
            "SELECT COUNT(*) FROM schema_migrations",
            [],
            |row| row.get(0),
        )?;
        assert_eq!(migration_count, 1);

        let accounts_table: String = connection.query_row(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'accounts'",
            [],
            |row| row.get(0),
        )?;
        assert_eq!(accounts_table, "accounts");

        let audit_table: String = connection.query_row(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'audit_log'",
            [],
            |row| row.get(0),
        )?;
        assert_eq!(audit_table, "audit_log");

        Ok(())
    }

    #[test]
    fn prevents_audit_log_updates_and_deletes() -> rusqlite::Result<()> {
        let mut connection = Connection::open_in_memory()?;
        run_migrations(&mut connection)?;

        connection.execute(
            "INSERT INTO users (id, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
            ["user_1", "Test User", "2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z"],
        )?;
        connection.execute(
            "INSERT INTO audit_log (
                id, occurred_at, user_id, operation, table_name, record_id, before_json, after_json,
                prev_hash, this_hash, created_at, updated_at
             ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            [
                "evt_1",
                "2026-01-01T00:00:00Z",
                "user_1",
                "INSERT",
                "postings",
                "posting_1",
                "",
                "",
                "",
                "hash_1",
                "2026-01-01T00:00:00Z",
                "2026-01-01T00:00:00Z",
            ],
        )?;

        let update_result = connection.execute(
            "UPDATE audit_log SET operation = 'UPDATE' WHERE id = 'evt_1'",
            [],
        );
        assert!(update_result.is_err());

        let delete_result = connection.execute(
            "DELETE FROM audit_log WHERE id = 'evt_1'",
            [],
        );
        assert!(delete_result.is_err());

        Ok(())
    }
}
