import { create } from 'zustand';

export type SyncStatus = 'synced' | 'syncing' | 'conflict' | 'offline';
export type SyncAdapter = 'filesystem' | 'dropbox' | 'webdav';

interface SyncState {
  status: SyncStatus;
  adapter: SyncAdapter;
  lastSyncAt: Date | null;
  bytesTransferred: number;
  selectedAdapter: SyncAdapter;
  setStatus: (status: SyncStatus) => void;
  setAdapter: (adapter: SyncAdapter) => void;
  setLastSyncAt: (date: Date | null) => void;
  setBytesTransferred: (bytes: number) => void;
  setSelectedAdapter: (adapter: SyncAdapter) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'offline',
  adapter: 'filesystem',
  lastSyncAt: null,
  bytesTransferred: 0,
  selectedAdapter: 'filesystem',
  setStatus: (status) => set({ status }),
  setAdapter: (adapter) => set({ adapter }),
  setLastSyncAt: (date) => set({ lastSyncAt: date }),
  setBytesTransferred: (bytesTransferred) => set({ bytesTransferred }),
  setSelectedAdapter: (selectedAdapter) => set({ selectedAdapter })
}));
