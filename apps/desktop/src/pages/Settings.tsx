import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { syncNow } from '../ipc/sync';
import { beginPairing, completePairing } from '../ipc/pairing';
import { type SyncAdapter, useSyncStore } from '../store/syncStore';

const options: SyncAdapter[] = ['filesystem', 'dropbox', 'webdav'];

export const Settings = (): JSX.Element => {
  const [localKeyHex, setLocalKeyHex] = useState('');
  const [peerPublicKeyHex, setPeerPublicKeyHex] = useState('');
  const [sharedSecretPreview, setSharedSecretPreview] = useState<string | null>(null);
  const { selectedAdapter, setSelectedAdapter, setStatus, setAdapter, setLastSyncAt, setBytesTransferred } =
    useSyncStore();

  const syncMutation = useMutation({
    mutationFn: async () => syncNow({ adapter: selectedAdapter }),
    onSuccess: (result) => {
      setStatus(result.status);
      setAdapter(result.adapter);
      setBytesTransferred(result.bytesTransferred);
      setLastSyncAt(result.lastSyncAt ? new Date(result.lastSyncAt) : null);
    }
  });
  const beginPairingMutation = useMutation({
    mutationFn: async () => beginPairing(),
    onSuccess: (result) => {
      setLocalKeyHex(result.privateKeyHex);
      setSharedSecretPreview(null);
    }
  });
  const completePairingMutation = useMutation({
    mutationFn: async () =>
      completePairing({
        privateKeyHex: localKeyHex,
        peerPublicKeyHex
      }),
    onSuccess: (result) => {
      setSharedSecretPreview(result.sharedSecretHex.slice(0, 24));
    }
  });

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 540 }}>
      <h1>Settings</h1>
      <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <span>Sync adapter</span>
        <select
          value={selectedAdapter}
          onChange={(event) => setSelectedAdapter(event.target.value as SyncAdapter)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
        {syncMutation.isPending ? 'Syncing…' : 'Sync now'}
      </button>
      {syncMutation.error ? <p>Sync failed. Check adapter credentials/configuration.</p> : null}
      <p>
        Configure adapter credentials using environment variables:
        `FAMILYLEDGER_DROPBOX_ACCESS_TOKEN`, `FAMILYLEDGER_WEBDAV_BASE_URL`,
        `FAMILYLEDGER_WEBDAV_USERNAME`, `FAMILYLEDGER_WEBDAV_PASSWORD`.
      </p>

      <hr />
      <h2>Device Pairing (X25519)</h2>
      <button onClick={() => beginPairingMutation.mutate()} disabled={beginPairingMutation.isPending}>
        Generate local pairing key
      </button>
      <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <span>Local private key (hex)</span>
        <textarea
          value={localKeyHex}
          onChange={(event) => setLocalKeyHex(event.target.value)}
          rows={3}
          style={{ fontFamily: 'monospace' }}
        />
      </label>
      <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <span>Peer public key (hex)</span>
        <textarea
          value={peerPublicKeyHex}
          onChange={(event) => setPeerPublicKeyHex(event.target.value)}
          rows={3}
          style={{ fontFamily: 'monospace' }}
        />
      </label>
      <button onClick={() => completePairingMutation.mutate()} disabled={completePairingMutation.isPending}>
        Derive shared secret
      </button>
      {sharedSecretPreview ? <p>Shared secret preview: {sharedSecretPreview}...</p> : null}
    </section>
  );
};
