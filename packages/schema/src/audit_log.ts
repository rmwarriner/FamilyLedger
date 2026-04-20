import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { withTimestamps } from './common';

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  occurredAt: text('occurred_at').notNull(),
  userId: text('user_id').notNull(),
  operation: text('operation').notNull(),
  tableName: text('table_name').notNull(),
  recordId: text('record_id').notNull(),
  beforeJson: text('before_json'),
  afterJson: text('after_json'),
  prevHash: text('prev_hash'),
  thisHash: text('this_hash').notNull(),
  ...withTimestamps
});

// TODO(impl): expose insert-only helpers; do not expose update/delete operations.
