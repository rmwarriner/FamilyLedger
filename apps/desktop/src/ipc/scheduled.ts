import { invoke } from '@tauri-apps/api/core';

export interface ScheduledTransactionDto {
  id: string;
  dueAt: string;
  autoPost: boolean;
  description: string;
  amount: string;
  debitAccountId: string;
  creditAccountId: string;
  isOverdue: boolean;
}

export const listScheduledTransactions = async (): Promise<ScheduledTransactionDto[]> =>
  invoke<ScheduledTransactionDto[]>('list_scheduled_transactions');

export const postScheduledTransaction = async (id: string): Promise<string> =>
  invoke<string>('post_scheduled_transaction', { request: { id } });
