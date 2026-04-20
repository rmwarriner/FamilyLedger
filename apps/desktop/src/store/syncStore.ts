import { create } from 'zustand';

export type SyncStatus = 'synced' | 'syncing' | 'conflict' | 'offline';

interface SyncState {
  status: SyncStatus;
  lastSyncAt: Date | null;
  setStatus: (status: SyncStatus) => void;
  setLastSyncAt: (date: Date | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'offline',
  lastSyncAt: null,
  setStatus: (status) => set({ status }),
  setLastSyncAt: (date) => set({ lastSyncAt: date })
}));
