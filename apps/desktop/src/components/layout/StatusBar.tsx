import { SyncStatusIndicator } from '../domain/SyncStatusIndicator';
import { useVaultStore } from '../../store/vaultStore';

export const StatusBar = (): JSX.Element => {
  const { activeUserId, lockVault } = useVaultStore();

  return (
    <footer
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        borderTop: '1px solid var(--color-surface-sunken)'
      }}
    >
      <SyncStatusIndicator />
      <span>Active User: {activeUserId ?? 'Unknown'}</span>
      <button onClick={lockVault}>Lock Vault</button>
    </footer>
  );
};
