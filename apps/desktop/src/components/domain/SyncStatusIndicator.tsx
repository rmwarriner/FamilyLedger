import { useSyncStore } from '../../store/syncStore';

const labels: Record<string, string> = {
  synced: 'Synced ✓',
  syncing: 'Syncing…',
  conflict: 'Conflict — tap to resolve',
  offline: 'Offline'
};

export const SyncStatusIndicator = (): JSX.Element => {
  const { status, lastSyncAt } = useSyncStore();
  return (
    <span>
      {labels[status]} {lastSyncAt ? `(${lastSyncAt.toLocaleString()})` : ''}
    </span>
  );
};
