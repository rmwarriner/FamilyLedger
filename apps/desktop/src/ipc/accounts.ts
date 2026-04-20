import { invoke } from '@tauri-apps/api/core';
export interface AccountDto {
  id: string;
  name: string;
  fullPath: string;
  currency: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
}

export const listAccounts = async (): Promise<AccountDto[]> =>
  invoke<AccountDto[]>('list_accounts');
