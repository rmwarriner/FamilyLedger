# Data Model

FamilyLedger stores accounting data in SQLite with UUIDv4 primary keys and UTC timestamps.

- `accounts`: chart of accounts hierarchy with self-referencing `parent_id`.
- `journal_entries`: transaction headers (date, description, metadata).
- `postings`: double-entry lines linked to `journal_entries`, minimum two postings enforced in domain logic.
- `scheduled_transactions`: recurring templates and due dates.
- `budget_periods`, `envelopes`, `tracking_budgets`: dual budget model.
- `audit_log`: append-only immutable change events with hash chain links.
- `sync_state`: single-row sync status, conflict state, and device identity.

All schema changes are forward-only migrations.
