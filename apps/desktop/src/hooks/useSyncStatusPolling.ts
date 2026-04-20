import { useEffect } from 'react';
import { pollSyncStatus } from '../ipc/sync';
import { useSyncStore } from '../store/syncStore';

const POLL_INTERVAL_MS = 30_000;

export const useSyncStatusPolling = (): void => {
  const { selectedAdapter, setStatus, setAdapter, setLastSyncAt, setBytesTransferred } = useSyncStore();

  useEffect(() => {
    let cancelled = false;

    const run = async (): Promise<void> => {
      try {
        const status = await pollSyncStatus({ adapter: selectedAdapter });
        if (cancelled) return;
        setStatus(status.status);
        setAdapter(status.adapter);
        setBytesTransferred(status.bytesTransferred);
        setLastSyncAt(status.lastSyncAt ? new Date(status.lastSyncAt) : null);
      } catch {
        if (cancelled) return;
        setStatus('offline');
        setAdapter(selectedAdapter);
        setBytesTransferred(0);
        setLastSyncAt(null);
      }
    };

    void run();
    const interval = window.setInterval(() => {
      void run();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [selectedAdapter, setAdapter, setBytesTransferred, setLastSyncAt, setStatus]);
};
