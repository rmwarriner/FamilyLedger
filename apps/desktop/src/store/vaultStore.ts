import { create } from 'zustand';

interface VaultState {
  isVaultOpen: boolean;
  activeUserId: string | null;
  lockVault: () => void;
  unlockVault: (userId: string) => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  isVaultOpen: false,
  activeUserId: null,
  lockVault: () => set({ isVaultOpen: false }),
  unlockVault: (userId) => set({ isVaultOpen: true, activeUserId: userId })
}));
