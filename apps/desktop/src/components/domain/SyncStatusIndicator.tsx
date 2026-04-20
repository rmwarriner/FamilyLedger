import { useSyncStore } from '../../store/syncStore';

const labels: Record<string, string> = {
  synced: 'Synced ✓',
  syncing: 'Syncing…',
  conflict: 'Conflict — tap to resolve',
  offline: 'Offline'
};

export const SyncStatusIndicator = (): JSX.Element => {
  const { status, adapter, bytesTransferred, lastSyncAt } = useSyncStore();
  return (
    <span>
      {labels[status]} [{adapter}] {bytesTransferred > 0 ? `${bytesTransferred} bytes ` : ''}
      {lastSyncAt ? `(${lastSyncAt.toLocaleString()})` : ''}
    </span>
  );
};
