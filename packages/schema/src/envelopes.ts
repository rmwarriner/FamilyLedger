import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { withTimestamps } from './common';

export const envelopes = sqliteTable('envelopes', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  allocated: text('allocated').notNull(),
  spent: text('spent').notNull(),
  available: text('available').notNull(),
  rolloverPolicy: text('rollover_policy').notNull(),
  overspendPolicy: text('overspend_policy').notNull(),
  ...withTimestamps
});
