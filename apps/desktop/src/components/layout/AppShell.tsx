import { type PropsWithChildren } from 'react';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { StatusBar } from './StatusBar';
import { useSyncStatusPolling } from '../../hooks/useSyncStatusPolling';
import { useVaultStore } from '../../store/vaultStore';
import { VaultGate } from './VaultGate';

export const AppShell = ({ children }: PropsWithChildren): JSX.Element => {
  useSyncStatusPolling();
  const { isVaultOpen } = useVaultStore();

  if (!isVaultOpen) {
    return <VaultGate />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', height: '100%' }}>
      <Sidebar />
      <div style={{ display: 'grid', gridTemplateRows: '1fr 28px', minHeight: 0 }}>
        <main style={{ overflow: 'auto', padding: 'var(--space-5)' }}>
          <CommandPalette />
          {children}
        </main>
        <StatusBar />
      </div>
    </div>
  );
};
