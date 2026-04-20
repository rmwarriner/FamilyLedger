import { invoke } from '@tauri-apps/api/core';
import type { Account } from '@familyledger/accounting-engine';

export const listAccounts = async (): Promise<Account[]> => invoke<Account[]>('list_accounts');
