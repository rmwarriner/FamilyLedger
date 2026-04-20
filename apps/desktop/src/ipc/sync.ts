import { invoke } from '@tauri-apps/api/core';

export interface SyncStatusPayload {
  status: 'synced' | 'syncing' | 'conflict' | 'offline';
  lastSyncAt: string | null;
}

export const pollSyncStatus = async (): Promise<SyncStatusPayload> =>
  invoke<SyncStatusPayload>('poll_sync_status');
