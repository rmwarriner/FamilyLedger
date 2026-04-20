import { invoke } from '@tauri-apps/api/core';

export const unlockVault = async (passphrase: string): Promise<boolean> =>
  invoke<boolean>('unlock_vault', { passphrase });
