import { invoke } from '@tauri-apps/api/core';
import { isTauriRuntime, mockBackend } from './mockRuntime';

export const unlockVault = async (passphrase: string): Promise<boolean> =>
  isTauriRuntime()
    ? invoke<boolean>('unlock_vault', { passphrase })
    : Promise.resolve(mockBackend.unlockVault(passphrase));
