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

export interface AuditLogInsertInput {
  id: string;
  occurredAt: string;
  userId: string;
  operation: string;
  tableName: string;
  recordId: string;
  beforeJson?: string | null;
  afterJson?: string | null;
  prevHash?: string | null;
  thisHash: string;
  createdAt?: string;
}

export type AuditLogInsert = typeof auditLog.$inferInsert;

export const createAuditLogInsert = (input: AuditLogInsertInput): AuditLogInsert => {
  const createdAt = input.createdAt ?? new Date().toISOString();

  return {
    id: input.id,
    occurredAt: input.occurredAt,
    userId: input.userId,
    operation: input.operation,
    tableName: input.tableName,
    recordId: input.recordId,
    beforeJson: input.beforeJson ?? null,
    afterJson: input.afterJson ?? null,
    prevHash: input.prevHash ?? null,
    thisHash: input.thisHash,
    createdAt,
    updatedAt: createdAt
  };
};
