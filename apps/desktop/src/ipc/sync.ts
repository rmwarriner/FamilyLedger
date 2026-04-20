import { invoke } from '@tauri-apps/api/core';
import { type SyncAdapter } from '../store/syncStore';

export interface SyncStatusPayload {
  status: 'synced' | 'syncing' | 'conflict' | 'offline';
  lastSyncAt: string | null;
  bytesTransferred: number;
  adapter: SyncAdapter;
}

export interface SyncRequestPayload {
  adapter?: SyncAdapter;
}

export const pollSyncStatus = async (request?: SyncRequestPayload): Promise<SyncStatusPayload> =>
  invoke<SyncStatusPayload>('poll_sync_status', { request });

export const syncNow = async (request?: SyncRequestPayload): Promise<SyncStatusPayload> =>
  invoke<SyncStatusPayload>('sync_now', { request });
