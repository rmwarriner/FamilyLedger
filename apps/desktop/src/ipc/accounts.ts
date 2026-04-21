import { invoke } from '@tauri-apps/api/core';
import { isTauriRuntime, mockBackend } from './mockRuntime';
export interface AccountDto {
  id: string;
  name: string;
  fullPath: string;
  currency: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
}

export const listAccounts = async (): Promise<AccountDto[]> =>
  isTauriRuntime() ? invoke<AccountDto[]>('list_accounts') : mockBackend.listAccounts();
