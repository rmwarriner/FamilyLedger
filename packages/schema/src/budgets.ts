import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { withTimestamps } from './common';

export const budgetPeriods = sqliteTable('budget_periods', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  ...withTimestamps
});

export const trackingBudgets = sqliteTable('tracking_budgets', {
  id: text('id').primaryKey(),
  budgetPeriodId: text('budget_period_id').notNull().references(() => budgetPeriods.id),
  categoryAccountId: text('category_account_id').notNull(),
  target: text('target').notNull(),
  actual: text('actual').notNull(),
  ...withTimestamps
});
