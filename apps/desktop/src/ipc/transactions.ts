import { invoke } from '@tauri-apps/api/core';
import type { JournalEntry } from '@familyledger/accounting-engine';

export const listTransactions = async (): Promise<JournalEntry[]> =>
  invoke<JournalEntry[]>('list_transactions');
