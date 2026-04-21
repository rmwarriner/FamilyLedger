import { useState } from 'react';
import { unlockVault } from '../../ipc/vault';
import { useVaultStore } from '../../store/vaultStore';

export const VaultGate = (): JSX.Element => {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { unlockVault: markVaultOpen } = useVaultStore();

  const submit = async (): Promise<void> => {
    setIsPending(true);
    setError(null);
    try {
      const ok = await unlockVault(passphrase);
      if (!ok) {
        setError('Could not unlock vault. Check passphrase and try again.');
        return;
      }
      markVaultOpen('local-user');
      setPassphrase('');
    } catch (unknownError) {
      setError(String(unknownError));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section data-testid="vault-gate" style={{ maxWidth: 420, margin: '10vh auto', display: 'grid', gap: 'var(--space-3)' }}>
      <h1>Unlock Vault</h1>
      <p>Enter your passphrase to continue.</p>
      <label>
        Passphrase
        <input
          data-testid="vault-passphrase"
          type="password"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void submit();
            }
          }}
        />
      </label>
      <button data-testid="vault-unlock-button" onClick={() => void submit()} disabled={isPending}>
        {isPending ? 'Unlocking...' : 'Unlock'}
      </button>
      {error ? (
        <p role="alert" data-testid="vault-error" style={{ color: 'var(--color-danger, #b00020)' }}>
          {error}
        </p>
      ) : null}
      <p>Browser test passphrase: <code>familyledger</code></p>
    </section>
  );
};
