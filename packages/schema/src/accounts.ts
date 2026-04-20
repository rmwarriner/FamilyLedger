import { text, sqliteTable, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { withTimestamps } from './common';

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').references((): AnySQLiteColumn => accounts.id),
  name: text('name').notNull(),
  fullPath: text('full_path').notNull(),
  type: text('type').notNull(),
  subtype: text('subtype').notNull(),
  currency: text('currency').notNull(),
  isPlaceholder: text('is_placeholder').notNull(),
  isClosed: text('is_closed').notNull(),
  openedAt: text('opened_at').notNull(),
  closedAt: text('closed_at'),
  notes: text('notes').notNull(),
  ...withTimestamps
});
