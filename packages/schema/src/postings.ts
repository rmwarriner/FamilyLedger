import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { journalEntries } from './transactions';
import { accounts } from './accounts';
import { withTimestamps } from './common';

export const postings = sqliteTable('postings', {
  id: text('id').primaryKey(),
  journalEntryId: text('journal_entry_id').notNull().references(() => journalEntries.id),
  accountId: text('account_id').notNull().references(() => accounts.id),
  amount: text('amount').notNull(),
  memo: text('memo').notNull(),
  reconciled: text('reconciled').notNull(),
  reconciledAt: text('reconciled_at'),
  cleared: text('cleared').notNull(),
  ...withTimestamps
});
