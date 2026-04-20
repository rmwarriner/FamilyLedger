import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { withTimestamps } from './common';

export const journalEntries = sqliteTable('journal_entries', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  description: text('description').notNull(),
  payee: text('payee'),
  isScheduled: text('is_scheduled').notNull(),
  scheduledId: text('scheduled_id'),
  importedFrom: text('imported_from'),
  importedId: text('imported_id'),
  createdBy: text('created_by').notNull(),
  ...withTimestamps
});
