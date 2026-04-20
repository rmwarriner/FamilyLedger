pub fn migration_sql() -> &'static str {
    r#"
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      parent_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      full_path TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')),
      subtype TEXT NOT NULL,
      currency TEXT NOT NULL,
      is_placeholder TEXT NOT NULL CHECK (is_placeholder IN ('0', '1')),
      is_closed TEXT NOT NULL CHECK (is_closed IN ('0', '1')),
      opened_at TEXT NOT NULL,
      closed_at TEXT,
      notes TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_accounts_parent_id ON accounts(parent_id);

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      payee TEXT,
      is_scheduled TEXT NOT NULL CHECK (is_scheduled IN ('0', '1')),
      scheduled_id TEXT,
      imported_from TEXT,
      imported_id TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
    CREATE INDEX IF NOT EXISTS idx_journal_entries_imported_id ON journal_entries(imported_from, imported_id);

    CREATE TABLE IF NOT EXISTS postings (
      id TEXT PRIMARY KEY NOT NULL,
      journal_entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL REFERENCES accounts(id),
      amount TEXT NOT NULL,
      memo TEXT NOT NULL,
      reconciled TEXT NOT NULL CHECK (reconciled IN ('0', '1')),
      reconciled_at TEXT,
      cleared TEXT NOT NULL CHECK (cleared IN ('0', '1')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_postings_journal_entry_id ON postings(journal_entry_id);
    CREATE INDEX IF NOT EXISTS idx_postings_account_id ON postings(account_id);

    CREATE TABLE IF NOT EXISTS budget_periods (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_budget_periods_dates ON budget_periods(start_date, end_date);

    CREATE TABLE IF NOT EXISTS tracking_budgets (
      id TEXT PRIMARY KEY NOT NULL,
      budget_period_id TEXT NOT NULL REFERENCES budget_periods(id) ON DELETE CASCADE,
      category_account_id TEXT NOT NULL REFERENCES accounts(id),
      target TEXT NOT NULL,
      actual TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tracking_budgets_period ON tracking_budgets(budget_period_id);

    CREATE TABLE IF NOT EXISTS envelopes (
      id TEXT PRIMARY KEY NOT NULL,
      account_id TEXT NOT NULL REFERENCES accounts(id),
      allocated TEXT NOT NULL,
      spent TEXT NOT NULL,
      available TEXT NOT NULL,
      rollover_policy TEXT NOT NULL,
      overspend_policy TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_envelopes_account_id ON envelopes(account_id);

    CREATE TABLE IF NOT EXISTS scheduled_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      frequency TEXT NOT NULL,
      next_due TEXT NOT NULL,
      end_date TEXT,
      auto_post TEXT NOT NULL CHECK (auto_post IN ('0', '1')),
      advance_notice_days TEXT NOT NULL,
      cron_expr TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_next_due ON scheduled_transactions(next_due);

    CREATE TABLE IF NOT EXISTS sync_state (
      id TEXT PRIMARY KEY NOT NULL CHECK (id = 'singleton'),
      last_sync_at TEXT,
      conflict_status TEXT NOT NULL,
      device_identity TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY NOT NULL,
      occurred_at TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      operation TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      before_json TEXT,
      after_json TEXT,
      prev_hash TEXT,
      this_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_audit_log_occurred_at ON audit_log(occurred_at);
    CREATE INDEX IF NOT EXISTS idx_audit_log_hash_chain ON audit_log(prev_hash, this_hash);
    CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log(table_name, record_id);

    CREATE TRIGGER IF NOT EXISTS trg_audit_log_block_update
    BEFORE UPDATE ON audit_log
    BEGIN
      SELECT RAISE(ABORT, 'audit_log is append-only');
    END;

    CREATE TRIGGER IF NOT EXISTS trg_audit_log_block_delete
    BEFORE DELETE ON audit_log
    BEGIN
      SELECT RAISE(ABORT, 'audit_log is append-only');
    END;
    "#
}
