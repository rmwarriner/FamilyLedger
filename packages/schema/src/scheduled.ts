import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { withTimestamps } from './common';

export const scheduledTransactions = sqliteTable('scheduled_transactions', {
  id: text('id').primaryKey(),
  frequency: text('frequency').notNull(),
  nextDue: text('next_due').notNull(),
  endDate: text('end_date'),
  autoPost: text('auto_post').notNull(),
  advanceNoticeDays: text('advance_notice_days').notNull(),
  cronExpr: text('cron_expr'),
  ...withTimestamps
});
