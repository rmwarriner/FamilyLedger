import { invoke } from '@tauri-apps/api/core';
import { isTauriRuntime, mockBackend } from './mockRuntime';

export interface ImportResult {
  accountsImported: number;
  transactionsImported: number;
  errors: string[];
}

export const importData = async (payload: string): Promise<ImportResult> =>
  isTauriRuntime()
    ? invoke<ImportResult>('import_data', { payload })
    : Promise.resolve(mockBackend.importData(payload));
