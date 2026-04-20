import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { withTimestamps } from './common';

export const syncState = sqliteTable('sync_state', {
  id: text('id').primaryKey(),
  lastSyncAt: text('last_sync_at'),
  conflictStatus: text('conflict_status').notNull(),
  deviceIdentity: text('device_identity').notNull(),
  ...withTimestamps
});
