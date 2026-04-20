import { invoke } from '@tauri-apps/api/core';
import type { ImportResult } from '@familyledger/importers';

export const importData = async (payload: string): Promise<ImportResult> =>
  invoke<ImportResult>('import_data', { payload });
