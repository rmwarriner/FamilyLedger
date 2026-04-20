import { text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const withTimestamps = {
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
};

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ...withTimestamps
});
